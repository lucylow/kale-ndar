#![no_std]

use soroban_sdk::{
    contract, contractimpl, contracttype, Address, Env, String, Vec, Map,
    panic_with_error, log,
};
use shared_types::{
    PriceFeed, EventData, MarketOutcome, ContractError, 
    ContractCallResult, InteropError, OracleSubscription
};

const DAY_IN_LEDGERS: u32 = 17280;
const INSTANCE_BUMP_AMOUNT: u32 = 7 * DAY_IN_LEDGERS;
const INSTANCE_LIFETIME_THRESHOLD: u32 = INSTANCE_BUMP_AMOUNT - DAY_IN_LEDGERS;

#[contracttype]
pub enum DataKey {
    Admin,
    OracleNodes,
    PriceFeed(String),
    EventData(String),
    Subscriptions(String),
    MinConfidence,
    MaxPriceAge,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct OracleNode {
    pub address: Address,
    pub is_active: bool,
    pub reputation_score: u32,
    pub last_update: u64,
}

#[contract]
pub struct ReflectorOracleContract;

#[contractimpl]
impl ReflectorOracleContract {
    /// Initialize the oracle contract
    pub fn initialize(
        env: Env,
        admin: Address,
        min_confidence: u32,
        max_price_age: u64,
    ) {
        if env.storage().instance().has(&DataKey::Admin) {
            panic_with_error!(&env, ContractError::NotAuthorized);
        }

        env.storage().instance().set(&DataKey::Admin, &admin);
        env.storage().instance().set(&DataKey::OracleNodes, &Vec::<OracleNode>::new(&env));
        env.storage().instance().set(&DataKey::MinConfidence, &min_confidence);
        env.storage().instance().set(&DataKey::MaxPriceAge, &max_price_age);

        env.storage()
            .instance()
            .extend_ttl(INSTANCE_LIFETIME_THRESHOLD, INSTANCE_BUMP_AMOUNT);

        log!(&env, "ReflectorOracle initialized by admin: {}", admin);
    }

    /// Add a new oracle node (admin only)
    pub fn add_oracle_node(env: Env, admin: Address, node_address: Address) {
        admin.require_auth();

        let stored_admin: Address = env.storage().instance()
            .get(&DataKey::Admin)
            .unwrap_or_else(|| panic_with_error!(&env, ContractError::NotAuthorized));

        if admin != stored_admin {
            panic_with_error!(&env, ContractError::NotAuthorized);
        }

        let mut oracle_nodes: Vec<OracleNode> = env.storage().instance()
            .get(&DataKey::OracleNodes)
            .unwrap_or_else(|| Vec::new(&env));

        // Check if node already exists
        for i in 0..oracle_nodes.len() {
            let node = oracle_nodes.get(i).unwrap();
            if node.address == node_address {
                panic_with_error!(&env, ContractError::NotAuthorized); // Node already exists
            }
        }

        let new_node = OracleNode {
            address: node_address.clone(),
            is_active: true,
            reputation_score: 100, // Starting reputation
            last_update: env.ledger().timestamp(),
        };

        oracle_nodes.push_back(new_node);
        env.storage().instance().set(&DataKey::OracleNodes, &oracle_nodes);

        log!(&env, "Oracle node added: {}", node_address);
    }

    /// Remove an oracle node (admin only)
    pub fn remove_oracle_node(env: Env, admin: Address, node_address: Address) {
        admin.require_auth();

        let stored_admin: Address = env.storage().instance()
            .get(&DataKey::Admin)
            .unwrap_or_else(|| panic_with_error!(&env, ContractError::NotAuthorized));

        if admin != stored_admin {
            panic_with_error!(&env, ContractError::NotAuthorized);
        }

        let mut oracle_nodes: Vec<OracleNode> = env.storage().instance()
            .get(&DataKey::OracleNodes)
            .unwrap_or_else(|| Vec::new(&env));

        let mut new_nodes = Vec::new(&env);
        let mut found = false;

        for i in 0..oracle_nodes.len() {
            let node = oracle_nodes.get(i).unwrap();
            if node.address != node_address {
                new_nodes.push_back(node);
            } else {
                found = true;
            }
        }

        if !found {
            panic_with_error!(&env, ContractError::NotAuthorized);
        }

        env.storage().instance().set(&DataKey::OracleNodes, &new_nodes);

        log!(&env, "Oracle node removed: {}", node_address);
    }

    /// Update price feed (oracle nodes only)
    pub fn update_price(
        env: Env,
        oracle_node: Address,
        asset_name: String,
        price: i128,
        confidence: u32,
        source: String,
    ) {
        oracle_node.require_auth();

        // Verify oracle node is authorized
        if !Self::is_authorized_oracle(&env, &oracle_node) {
            panic_with_error!(&env, ContractError::NotAuthorized);
        }

        let min_confidence: u32 = env.storage().instance()
            .get(&DataKey::MinConfidence)
            .unwrap_or(80);

        if confidence < min_confidence {
            panic_with_error!(&env, ContractError::OracleError);
        }

        let current_time = env.ledger().timestamp();

        let price_feed = PriceFeed {
            asset_name: asset_name.clone(),
            price,
            timestamp: current_time,
            confidence,
            source,
        };

        env.storage().persistent().set(&DataKey::PriceFeed(asset_name.clone()), &price_feed);

        // Update oracle node's last update time
        Self::update_oracle_node_activity(&env, &oracle_node);

        log!(&env, "Price updated for {}: {} by {}", asset_name, price, oracle_node);
    }

    /// Submit event data (oracle nodes only)
    pub fn submit_event_data(
        env: Env,
        oracle_node: Address,
        event_id: String,
        outcome: MarketOutcome,
        confidence: u32,
        data_source: String,
    ) {
        oracle_node.require_auth();

        // Verify oracle node is authorized
        if !Self::is_authorized_oracle(&env, &oracle_node) {
            panic_with_error!(&env, ContractError::NotAuthorized);
        }

        let min_confidence: u32 = env.storage().instance()
            .get(&DataKey::MinConfidence)
            .unwrap_or(80);

        if confidence < min_confidence {
            panic_with_error!(&env, ContractError::OracleError);
        }

        let current_time = env.ledger().timestamp();

        let event_data = EventData {
            event_id: event_id.clone(),
            outcome,
            timestamp: current_time,
            confidence,
            data_source,
        };

        env.storage().persistent().set(&DataKey::EventData(event_id.clone()), &event_data);

        // Update oracle node's last update time
        Self::update_oracle_node_activity(&env, &oracle_node);

        log!(&env, "Event data submitted for {}: {:?} by {}", event_id, outcome, oracle_node);
    }

    /// Get latest price for an asset
    pub fn get_price(env: Env, asset_name: String) -> PriceFeed {
        let price_feed: PriceFeed = env.storage().persistent()
            .get(&DataKey::PriceFeed(asset_name.clone()))
            .unwrap_or_else(|| panic_with_error!(&env, ContractError::OracleError));

        let max_age: u64 = env.storage().instance()
            .get(&DataKey::MaxPriceAge)
            .unwrap_or(3600); // 1 hour default

        let current_time = env.ledger().timestamp();

        if current_time - price_feed.timestamp > max_age {
            panic_with_error!(&env, ContractError::OracleError); // Price too old
        }

        price_feed
    }

    /// Get event data
    pub fn get_event_data(env: Env, event_id: String) -> EventData {
        env.storage().persistent()
            .get(&DataKey::EventData(event_id))
            .unwrap_or_else(|| panic_with_error!(&env, ContractError::OracleError))
    }

    /// Subscribe to price updates for an asset
    pub fn subscribe(env: Env, subscriber: Address, asset_name: String) {
        subscriber.require_auth();

        let mut subscriptions: Vec<Address> = env.storage().persistent()
            .get(&DataKey::Subscriptions(asset_name.clone()))
            .unwrap_or_else(|| Vec::new(&env));

        // Check if already subscribed
        for i in 0..subscriptions.len() {
            if subscriptions.get(i).unwrap() == subscriber {
                return; // Already subscribed
            }
        }

        subscriptions.push_back(subscriber.clone());
        env.storage().persistent().set(&DataKey::Subscriptions(asset_name.clone()), &subscriptions);

        log!(&env, "Subscribed {} to {}", subscriber, asset_name);
    }

    /// Unsubscribe from price updates
    pub fn unsubscribe(env: Env, subscriber: Address, asset_name: String) {
        subscriber.require_auth();

        let mut subscriptions: Vec<Address> = env.storage().persistent()
            .get(&DataKey::Subscriptions(asset_name.clone()))
            .unwrap_or_else(|| Vec::new(&env));

        let mut new_subscriptions = Vec::new(&env);
        let mut found = false;

        for i in 0..subscriptions.len() {
            let sub = subscriptions.get(i).unwrap();
            if sub != subscriber {
                new_subscriptions.push_back(sub);
            } else {
                found = true;
            }
        }

        if found {
            env.storage().persistent().set(&DataKey::Subscriptions(asset_name.clone()), &new_subscriptions);
            log!(&env, "Unsubscribed {} from {}", subscriber, asset_name);
        }
    }

    /// Get list of oracle nodes
    pub fn get_oracle_nodes(env: Env) -> Vec<OracleNode> {
        env.storage().instance()
            .get(&DataKey::OracleNodes)
            .unwrap_or_else(|| Vec::new(&env))
    }

    /// Get subscribers for an asset
    pub fn get_subscribers(env: Env, asset_name: String) -> Vec<Address> {
        env.storage().persistent()
            .get(&DataKey::Subscriptions(asset_name))
            .unwrap_or_else(|| Vec::new(&env))
    }

    /// Check if price data is available and fresh
    pub fn is_price_available(env: Env, asset_name: String) -> bool {
        if let Ok(price_feed) = env.storage().persistent().try_get(&DataKey::PriceFeed(asset_name)) {
            if let Some(feed) = price_feed {
                let max_age: u64 = env.storage().instance()
                    .get(&DataKey::MaxPriceAge)
                    .unwrap_or(3600);
                
                let current_time = env.ledger().timestamp();
                return current_time - feed.timestamp <= max_age;
            }
        }
        false
    }

    /// Update oracle configuration (admin only)
    pub fn update_config(
        env: Env,
        admin: Address,
        min_confidence: u32,
        max_price_age: u64,
    ) {
        admin.require_auth();

        let stored_admin: Address = env.storage().instance()
            .get(&DataKey::Admin)
            .unwrap_or_else(|| panic_with_error!(&env, ContractError::NotAuthorized));

        if admin != stored_admin {
            panic_with_error!(&env, ContractError::NotAuthorized);
        }

        env.storage().instance().set(&DataKey::MinConfidence, &min_confidence);
        env.storage().instance().set(&DataKey::MaxPriceAge, &max_price_age);

        log!(&env, "Oracle config updated: min_confidence={}, max_price_age={}", min_confidence, max_price_age);
    }

    /// Enhanced price subscription with threshold notifications
    pub fn subscribe_with_threshold(
        env: Env,
        subscriber: Address,
        asset_name: String,
        threshold: i128,
        condition: u32, // 0: Above, 1: Below
    ) -> ContractCallResult<OracleSubscription> {
        subscriber.require_auth();

        // Check if price is available for the asset
        if !Self::is_price_available(env.clone(), asset_name.clone()) {
            return ContractCallResult {
                success: false,
                data: None,
                error: Some("Price not available for asset".to_string()),
            };
        }

        // Create subscription
        let subscription = OracleSubscription {
            subscriber: subscriber.clone(),
            asset_name: asset_name.clone(),
            threshold,
            condition,
            created_at: env.ledger().timestamp(),
            is_active: true,
        };

        // Store subscription
        Self::subscribe(env.clone(), subscriber.clone(), asset_name.clone());

        ContractCallResult {
            success: true,
            data: Some(subscription),
            error: None,
        }
    }

    /// Batch price update for multiple assets
    pub fn batch_update_prices(
        env: Env,
        oracle_node: Address,
        assets: Vec<String>,
        prices: Vec<i128>,
        confidences: Vec<u32>,
        source: String,
    ) -> ContractCallResult<Vec<String>> {
        oracle_node.require_auth();

        if !Self::is_authorized_oracle(&env, &oracle_node) {
            return ContractCallResult {
                success: false,
                data: None,
                error: Some("Unauthorized oracle node".to_string()),
            };
        }

        if assets.len() != prices.len() || assets.len() != confidences.len() {
            return ContractCallResult {
                success: false,
                data: None,
                error: Some("Mismatched array lengths".to_string()),
            };
        }

        let mut updated_assets = Vec::new(&env);
        let min_confidence: u32 = env.storage().instance()
            .get(&DataKey::MinConfidence)
            .unwrap_or(80);

        for i in 0..assets.len() {
            let asset = assets.get(i).unwrap();
            let price = prices.get(i).unwrap();
            let confidence = confidences.get(i).unwrap();

            if *confidence >= min_confidence {
                Self::update_price(
                    env.clone(),
                    oracle_node.clone(),
                    asset.clone(),
                    *price,
                    *confidence,
                    source.clone(),
                );
                updated_assets.push_back(asset.clone());
            }
        }

        ContractCallResult {
            success: true,
            data: Some(updated_assets),
            error: None,
        }
    }

    /// Get price with fallback mechanism
    pub fn get_price_with_fallback(
        env: Env,
        asset_name: String,
        fallback_price: i128,
    ) -> ContractCallResult<i128> {
        match env.storage().persistent().try_get(&DataKey::PriceFeed(asset_name.clone())) {
            Ok(Some(price_feed)) => {
                let max_age: u64 = env.storage().instance()
                    .get(&DataKey::MaxPriceAge)
                    .unwrap_or(3600);
                
                let current_time = env.ledger().timestamp();
                
                if current_time - price_feed.timestamp <= max_age {
                    ContractCallResult {
                        success: true,
                        data: Some(price_feed.price),
                        error: None,
                    }
                } else {
                    ContractCallResult {
                        success: true,
                        data: Some(fallback_price),
                        error: Some("Price too old, using fallback".to_string()),
                    }
                }
            },
            _ => ContractCallResult {
                success: true,
                data: Some(fallback_price),
                error: Some("No price data, using fallback".to_string()),
            },
        }
    }

    /// Cross-contract validation for market resolution
    pub fn validate_market_resolution(
        env: Env,
        asset_name: String,
        target_price: i128,
        condition: u32,
        required_confidence: u32,
    ) -> ContractCallResult<bool> {
        let price_feed = Self::get_price(env.clone(), asset_name.clone());
        
        if price_feed.confidence < required_confidence {
            return ContractCallResult {
                success: false,
                data: None,
                error: Some("Insufficient confidence for resolution".to_string()),
            };
        }

        let outcome = match condition {
            0 => price_feed.price > target_price, // Above condition
            1 => price_feed.price < target_price, // Below condition
            _ => false,
        };

        ContractCallResult {
            success: true,
            data: Some(outcome),
            error: None,
        }
    }

    // Private helper functions
    fn is_authorized_oracle(env: &Env, oracle_address: &Address) -> bool {
        let oracle_nodes: Vec<OracleNode> = env.storage().instance()
            .get(&DataKey::OracleNodes)
            .unwrap_or_else(|| Vec::new(env));

        for i in 0..oracle_nodes.len() {
            let node = oracle_nodes.get(i).unwrap();
            if node.address == *oracle_address && node.is_active {
                return true;
            }
        }
        false
    }

    fn update_oracle_node_activity(env: &Env, oracle_address: &Address) {
        let mut oracle_nodes: Vec<OracleNode> = env.storage().instance()
            .get(&DataKey::OracleNodes)
            .unwrap_or_else(|| Vec::new(env));

        let mut updated_nodes = Vec::new(env);
        let current_time = env.ledger().timestamp();

        for i in 0..oracle_nodes.len() {
            let mut node = oracle_nodes.get(i).unwrap();
            if node.address == *oracle_address {
                node.last_update = current_time;
                // Could also update reputation score here based on activity
            }
            updated_nodes.push_back(node);
        }

        env.storage().instance().set(&DataKey::OracleNodes, &updated_nodes);
    }
}


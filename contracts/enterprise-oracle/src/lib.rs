#![no_std]

use soroban_sdk::{
    contract, contractimpl, contracttype, Address, Env, String, Vec, Map, i128, u64,
    panic_with_error, log, BytesN,
};
use shared_types::{PriceFeed, EventData, MarketOutcome, ContractError};

const DAY_IN_LEDGERS: u32 = 17280;
const INSTANCE_BUMP_AMOUNT: u32 = 7 * DAY_IN_LEDGERS;
const INSTANCE_LIFETIME_THRESHOLD: u32 = INSTANCE_BUMP_AMOUNT - DAY_IN_LEDGERS;

#[contracttype]
pub enum DataKey {
    Admin,
    EnterpriseClients,
    OracleNodes,
    PriceFeed(String),
    EventData(String),
    Subscriptions(String),
    MinConfidence,
    MaxPriceAge,
    EnterpriseConfig,
    Metrics,
    RateLimits,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct EnterpriseClient {
    pub address: Address,
    pub institution_id: String,
    pub tier: u32, // 1: Professional, 2: Enterprise, 3: Institutional
    pub is_active: bool,
    pub rate_limit: u32, // requests per hour
    pub created_at: u64,
    pub last_activity: u64,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct OracleNode {
    pub address: Address,
    pub is_active: bool,
    pub reputation_score: u32,
    pub last_update: u64,
    pub tier: u32, // 1: Community, 2: Professional, 3: Enterprise
    pub uptime: u32, // percentage
    pub latency_avg: u32, // milliseconds
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct EnterprisePriceFeed {
    pub asset_name: String,
    pub price: i128,
    pub timestamp: u64,
    pub confidence: u32,
    pub sources: Vec<PriceSource>,
    pub metadata: PriceMetadata,
    pub latency: u32,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct PriceSource {
    pub name: String,
    pub price: i128,
    pub weight: u32,
    pub latency: u32,
    pub volume: Option<i128>,
    pub spread: Option<i128>,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct PriceMetadata {
    pub volume_24h: i128,
    pub spread: i128,
    pub volatility: u32,
    pub market_cap: Option<i128>,
    pub last_update: u64,
    pub update_count: u32,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct EnterpriseMetrics {
    pub total_requests: u64,
    pub successful_requests: u64,
    pub failed_requests: u64,
    pub average_latency: u32,
    pub uptime_percentage: u32,
    pub data_quality_score: u32,
    pub last_updated: u64,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct RateLimit {
    pub client_address: Address,
    pub requests_this_hour: u32,
    pub hour_start: u64,
    pub limit: u32,
}

#[contract]
pub struct EnterpriseOracleContract;

#[contractimpl]
impl EnterpriseOracleContract {
    /// Initialize the enterprise oracle contract
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
        env.storage().instance().set(&DataKey::EnterpriseClients, &Vec::<EnterpriseClient>::new(&env));
        env.storage().instance().set(&DataKey::MinConfidence, &min_confidence);
        env.storage().instance().set(&DataKey::MaxPriceAge, &max_price_age);
        
        // Initialize metrics
        let initial_metrics = EnterpriseMetrics {
            total_requests: 0,
            successful_requests: 0,
            failed_requests: 0,
            average_latency: 0,
            uptime_percentage: 100,
            data_quality_score: 100,
            last_updated: env.ledger().timestamp(),
        };
        env.storage().instance().set(&DataKey::Metrics, &initial_metrics);

        env.storage()
            .instance()
            .extend_ttl(INSTANCE_LIFETIME_THRESHOLD, INSTANCE_BUMP_AMOUNT);

        log!(&env, "Enterprise Oracle initialized by admin: {}", admin);
    }

    /// Register an enterprise client (admin only)
    pub fn register_enterprise_client(
        env: Env,
        admin: Address,
        client_address: Address,
        institution_id: String,
        tier: u32,
        rate_limit: u32,
    ) {
        admin.require_auth();
        Self::require_admin(&env, &admin);

        let mut clients: Vec<EnterpriseClient> = env.storage().instance()
            .get(&DataKey::EnterpriseClients)
            .unwrap_or_else(|| Vec::new(&env));

        // Check if client already exists
        for i in 0..clients.len() {
            let client = clients.get(i).unwrap();
            if client.address == client_address {
                panic_with_error!(&env, ContractError::NotAuthorized); // Client already exists
            }
        }

        let new_client = EnterpriseClient {
            address: client_address.clone(),
            institution_id,
            tier,
            is_active: true,
            rate_limit,
            created_at: env.ledger().timestamp(),
            last_activity: env.ledger().timestamp(),
        };

        clients.push_back(new_client);
        env.storage().instance().set(&DataKey::EnterpriseClients, &clients);

        log!(&env, "Enterprise client registered: {}", client_address);
    }

    /// Get enterprise-grade price feed with enhanced validation
    pub fn get_enterprise_price(
        env: Env,
        client_address: Address,
        asset_name: String,
        min_confidence: u32,
        max_age: u64,
    ) -> EnterprisePriceFeed {
        client_address.require_auth();
        
        // Verify enterprise client
        if !Self::is_enterprise_client(&env, &client_address) {
            panic_with_error!(&env, ContractError::NotAuthorized);
        }

        // Check rate limits
        Self::check_rate_limit(&env, &client_address);

        // Get base price feed
        let base_feed = Self::get_price(env.clone(), asset_name.clone());
        
        // Enhanced validation for enterprise clients
        if base_feed.confidence < min_confidence {
            Self::update_metrics(&env, false);
            panic_with_error!(&env, ContractError::OracleError); // Low confidence
        }
        
        let current_time = env.ledger().timestamp();
        if current_time - base_feed.timestamp > max_age {
            Self::update_metrics(&env, false);
            panic_with_error!(&env, ContractError::OracleError); // Stale data
        }

        // Create enterprise price feed with enhanced metadata
        let enterprise_feed = EnterprisePriceFeed {
            asset_name: asset_name.clone(),
            price: base_feed.price,
            timestamp: base_feed.timestamp,
            confidence: base_feed.confidence,
            sources: Self::get_price_sources(&env, asset_name.clone()),
            metadata: Self::get_price_metadata(&env, asset_name.clone()),
            latency: Self::calculate_average_latency(&env),
        };

        // Update client activity
        Self::update_client_activity(&env, &client_address);
        
        // Update metrics
        Self::update_metrics(&env, true);

        log!(&env, "Enterprise price requested for {} by {}", asset_name, client_address);
        enterprise_feed
    }

    /// Batch price request for multiple assets
    pub fn get_batch_prices(
        env: Env,
        client_address: Address,
        assets: Vec<String>,
        min_confidence: u32,
    ) -> Vec<EnterprisePriceFeed> {
        client_address.require_auth();
        
        if !Self::is_enterprise_client(&env, &client_address) {
            panic_with_error!(&env, ContractError::NotAuthorized);
        }

        // Check rate limits (counts as multiple requests)
        Self::check_rate_limit(&env, &client_address);

        let mut feeds = Vec::new(&env);
        
        for asset in assets.iter() {
            let feed = Self::get_enterprise_price(
                env.clone(),
                client_address.clone(),
                asset.clone(),
                min_confidence,
                300, // 5 minutes max age
            );
            feeds.push_back(feed);
        }
        
        Self::update_client_activity(&env, &client_address);
        Self::update_metrics(&env, true);
        
        feeds
    }

    /// Update price feed with enhanced validation (oracle nodes only)
    pub fn update_price_enterprise(
        env: Env,
        oracle_node: Address,
        asset_name: String,
        price: i128,
        confidence: u32,
        source: String,
        metadata: PriceMetadata,
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

        // Create enhanced price feed
        let price_feed = PriceFeed {
            asset_name: asset_name.clone(),
            price,
            timestamp: current_time,
            confidence,
            source,
        };

        env.storage().persistent().set(&DataKey::PriceFeed(asset_name.clone()), &price_feed);
        
        // Store enhanced metadata separately
        env.storage().persistent().set(&DataKey::PriceFeed(format!("{}_metadata", asset_name)), &metadata);

        // Update oracle node's activity and reputation
        Self::update_oracle_node_activity(&env, &oracle_node);
        Self::update_oracle_reputation(&env, &oracle_node, confidence);

        log!(&env, "Enterprise price updated for {}: {} by {}", asset_name, price, oracle_node);
    }

    /// Get enterprise metrics
    pub fn get_enterprise_metrics(env: Env) -> EnterpriseMetrics {
        env.storage().instance()
            .get(&DataKey::Metrics)
            .unwrap_or_else(|| panic_with_error!(&env, ContractError::OracleError))
    }

    /// Get oracle network health
    pub fn get_oracle_health(env: Env) -> (u32, u32, u32, u32) {
        let oracle_nodes: Vec<OracleNode> = env.storage().instance()
            .get(&DataKey::OracleNodes)
            .unwrap_or_else(|| Vec::new(&env));

        let total_nodes = oracle_nodes.len() as u32;
        let mut active_nodes = 0u32;
        let mut total_reputation = 0u32;
        let mut total_latency = 0u32;

        for i in 0..oracle_nodes.len() {
            let node = oracle_nodes.get(i).unwrap();
            if node.is_active {
                active_nodes += 1;
                total_reputation += node.reputation_score;
                total_latency += node.latency_avg;
            }
        }

        let average_reputation = if active_nodes > 0 { total_reputation / active_nodes } else { 0 };
        let average_latency = if active_nodes > 0 { total_latency / active_nodes } else { 0 };

        (total_nodes, active_nodes, average_reputation, average_latency)
    }

    /// Subscribe to price updates (enterprise clients only)
    pub fn subscribe_enterprise(
        env: Env,
        client_address: Address,
        asset_name: String,
    ) {
        client_address.require_auth();
        
        if !Self::is_enterprise_client(&env, &client_address) {
            panic_with_error!(&env, ContractError::NotAuthorized);
        }

        let mut subscriptions: Vec<Address> = env.storage().persistent()
            .get(&DataKey::Subscriptions(asset_name.clone()))
            .unwrap_or_else(|| Vec::new(&env));

        // Check if already subscribed
        for i in 0..subscriptions.len() {
            if subscriptions.get(i).unwrap() == client_address {
                return; // Already subscribed
            }
        }

        subscriptions.push_back(client_address.clone());
        env.storage().persistent().set(&DataKey::Subscriptions(asset_name.clone()), &subscriptions);

        log!(&env, "Enterprise subscription: {} to {}", client_address, asset_name);
    }

    /// Get enterprise client information
    pub fn get_enterprise_client(env: Env, client_address: Address) -> EnterpriseClient {
        let clients: Vec<EnterpriseClient> = env.storage().instance()
            .get(&DataKey::EnterpriseClients)
            .unwrap_or_else(|| Vec::new(&env));

        for i in 0..clients.len() {
            let client = clients.get(i).unwrap();
            if client.address == client_address {
                return client;
            }
        }

        panic_with_error!(&env, ContractError::NotAuthorized); // Client not found
    }

    /// Update enterprise configuration (admin only)
    pub fn update_enterprise_config(
        env: Env,
        admin: Address,
        min_confidence: u32,
        max_price_age: u64,
    ) {
        admin.require_auth();
        Self::require_admin(&env, &admin);

        env.storage().instance().set(&DataKey::MinConfidence, &min_confidence);
        env.storage().instance().set(&DataKey::MaxPriceAge, &max_price_age);

        log!(&env, "Enterprise config updated: min_confidence={}, max_price_age={}", min_confidence, max_price_age);
    }

    // Private helper functions

    fn require_admin(env: &Env, admin: &Address) {
        let stored_admin: Address = env.storage().instance()
            .get(&DataKey::Admin)
            .unwrap_or_else(|| panic_with_error!(env, ContractError::NotAuthorized));

        if admin != &stored_admin {
            panic_with_error!(env, ContractError::NotAuthorized);
        }
    }

    fn is_enterprise_client(env: &Env, client_address: &Address) -> bool {
        let clients: Vec<EnterpriseClient> = env.storage().instance()
            .get(&DataKey::EnterpriseClients)
            .unwrap_or_else(|| Vec::new(env));

        for i in 0..clients.len() {
            let client = clients.get(i).unwrap();
            if client.address == *client_address && client.is_active {
                return true;
            }
        }
        false
    }

    fn check_rate_limit(env: &Env, client_address: &Address) {
        let current_time = env.ledger().timestamp();
        let hour_start = current_time - (current_time % 3600); // Round down to hour

        let mut rate_limit: RateLimit = env.storage().persistent()
            .get(&DataKey::RateLimits)
            .unwrap_or_else(|| RateLimit {
                client_address: client_address.clone(),
                requests_this_hour: 0,
                hour_start,
                limit: 1000, // Default limit
            });

        // Reset counter if new hour
        if rate_limit.hour_start != hour_start {
            rate_limit.requests_this_hour = 0;
            rate_limit.hour_start = hour_start;
        }

        // Get client's rate limit
        let clients: Vec<EnterpriseClient> = env.storage().instance()
            .get(&DataKey::EnterpriseClients)
            .unwrap_or_else(|| Vec::new(env));

        for i in 0..clients.len() {
            let client = clients.get(i).unwrap();
            if client.address == *client_address {
                rate_limit.limit = client.rate_limit;
                break;
            }
        }

        // Check if limit exceeded
        if rate_limit.requests_this_hour >= rate_limit.limit {
            panic_with_error!(env, ContractError::OracleError); // Rate limit exceeded
        }

        // Increment counter
        rate_limit.requests_this_hour += 1;
        env.storage().persistent().set(&DataKey::RateLimits, &rate_limit);
    }

    fn update_client_activity(env: &Env, client_address: &Address) {
        let mut clients: Vec<EnterpriseClient> = env.storage().instance()
            .get(&DataKey::EnterpriseClients)
            .unwrap_or_else(|| Vec::new(env));

        let mut updated_clients = Vec::new(env);
        let current_time = env.ledger().timestamp();

        for i in 0..clients.len() {
            let mut client = clients.get(i).unwrap();
            if client.address == *client_address {
                client.last_activity = current_time;
            }
            updated_clients.push_back(client);
        }

        env.storage().instance().set(&DataKey::EnterpriseClients, &updated_clients);
    }

    fn update_metrics(env: &Env, success: bool) {
        let mut metrics: EnterpriseMetrics = env.storage().instance()
            .get(&DataKey::Metrics)
            .unwrap_or_else(|| panic_with_error!(env, ContractError::OracleError));

        metrics.total_requests += 1;
        if success {
            metrics.successful_requests += 1;
        } else {
            metrics.failed_requests += 1;
        }

        // Calculate uptime percentage
        metrics.uptime_percentage = (metrics.successful_requests * 100) / metrics.total_requests;
        
        metrics.last_updated = env.ledger().timestamp();
        env.storage().instance().set(&DataKey::Metrics, &metrics);
    }

    fn get_price_sources(env: &Env, asset_name: String) -> Vec<PriceSource> {
        // Mock implementation - in real implementation, this would aggregate from multiple sources
        let mut sources = Vec::new(env);
        
        sources.push_back(PriceSource {
            name: String::from_str(env, "coinbase"),
            price: 65000,
            weight: 30,
            latency: 45,
            volume: Some(1000000),
            spread: Some(5),
        });

        sources.push_back(PriceSource {
            name: String::from_str(env, "binance"),
            price: 65001,
            weight: 40,
            latency: 52,
            volume: Some(2000000),
            spread: Some(3),
        });

        sources
    }

    fn get_price_metadata(env: &Env, asset_name: String) -> PriceMetadata {
        // Mock implementation
        PriceMetadata {
            volume_24h: 2500000000,
            spread: 5,
            volatility: 15,
            market_cap: Some(1200000000000),
            last_update: env.ledger().timestamp(),
            update_count: 1000,
        }
    }

    fn calculate_average_latency(env: &Env) -> u32 {
        let oracle_nodes: Vec<OracleNode> = env.storage().instance()
            .get(&DataKey::OracleNodes)
            .unwrap_or_else(|| Vec::new(env));

        let mut total_latency = 0u32;
        let mut active_count = 0u32;

        for i in 0..oracle_nodes.len() {
            let node = oracle_nodes.get(i).unwrap();
            if node.is_active {
                total_latency += node.latency_avg;
                active_count += 1;
            }
        }

        if active_count > 0 { total_latency / active_count } else { 0 }
    }

    fn update_oracle_reputation(env: &Env, oracle_address: &Address, confidence: u32) {
        let mut oracle_nodes: Vec<OracleNode> = env.storage().instance()
            .get(&DataKey::OracleNodes)
            .unwrap_or_else(|| Vec::new(env));

        let mut updated_nodes = Vec::new(env);

        for i in 0..oracle_nodes.len() {
            let mut node = oracle_nodes.get(i).unwrap();
            if node.address == *oracle_address {
                // Update reputation based on confidence
                if confidence >= 95 {
                    node.reputation_score = (node.reputation_score + 1).min(100);
                } else if confidence < 80 {
                    node.reputation_score = (node.reputation_score - 1).max(0);
                }
            }
            updated_nodes.push_back(node);
        }

        env.storage().instance().set(&DataKey::OracleNodes, &updated_nodes);
    }

    // Include the base oracle functions from the original contract
    fn get_price(env: Env, asset_name: String) -> PriceFeed {
        let price_feed: PriceFeed = env.storage().persistent()
            .get(&DataKey::PriceFeed(asset_name.clone()))
            .unwrap_or_else(|| panic_with_error!(&env, ContractError::OracleError));

        let max_age: u64 = env.storage().instance()
            .get(&DataKey::MaxPriceAge)
            .unwrap_or(3600);

        let current_time = env.ledger().timestamp();

        if current_time - price_feed.timestamp > max_age {
            panic_with_error!(&env, ContractError::OracleError);
        }

        price_feed
    }

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
            }
            updated_nodes.push_back(node);
        }

        env.storage().instance().set(&DataKey::OracleNodes, &updated_nodes);
    }
}

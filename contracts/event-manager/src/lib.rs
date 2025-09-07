#![no_std]

use soroban_sdk::{
    contract, contractimpl, contracttype, Address, Env, String, Vec, Map,
    panic_with_error, log, symbol_short, BytesN,
};
use shared_types::{
    ContractEvent, EventSubscription, EventFilter, ContractError,
    ContractCallResult, InteropError
};

const DAY_IN_LEDGERS: u32 = 17280;
const INSTANCE_BUMP_AMOUNT: u32 = 7 * DAY_IN_LEDGERS;
const INSTANCE_LIFETIME_THRESHOLD: u32 = INSTANCE_BUMP_AMOUNT - DAY_IN_LEDGERS;

#[contracttype]
pub enum DataKey {
    Admin,
    EventSubscriptions(Address),
    EventHistory(Vec<ContractEvent>),
    MaxEventHistory,
    ContractRegistry,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct ContractRegistry {
    pub kale_integration: Address,
    pub reflector_oracle: Address,
    pub market_factory: Address,
    pub prediction_market: Address,
}

#[contract]
pub struct EventManagerContract;

#[contractimpl]
impl EventManagerContract {
    /// Initialize the event manager contract
    pub fn initialize(
        env: Env,
        admin: Address,
        kale_integration: Address,
        reflector_oracle: Address,
        market_factory: Address,
        prediction_market: Address,
    ) {
        if env.storage().instance().has(&DataKey::Admin) {
            panic_with_error!(&env, ContractError::NotAuthorized);
        }

        let registry = ContractRegistry {
            kale_integration,
            reflector_oracle,
            market_factory,
            prediction_market,
        };

        env.storage().instance().set(&DataKey::Admin, &admin);
        env.storage().instance().set(&DataKey::ContractRegistry, &registry);
        env.storage().instance().set(&DataKey::MaxEventHistory, &1000u32);

        env.storage()
            .instance()
            .extend_ttl(INSTANCE_LIFETIME_THRESHOLD, INSTANCE_BUMP_AMOUNT);

        log!(&env, "EventManager initialized by admin: {}", admin);
    }

    /// Emit a contract event
    pub fn emit_event(env: Env, emitter: Address, event: ContractEvent) {
        emitter.require_auth();

        // Validate emitter is a registered contract
        if !Self::is_registered_contract(&env, &emitter) {
            panic_with_error!(&env, ContractError::NotAuthorized);
        }

        // Store event in history
        Self::store_event(&env, event.clone());

        // Emit Soroban event
        env.events().publish((symbol_short!("contract_event"), event.clone()));

        // Notify subscribers
        Self::notify_subscribers(&env, &event);

        log!(&env, "Event emitted by contract: {}", emitter);
    }

    /// Subscribe to contract events
    pub fn subscribe_to_events(
        env: Env,
        subscriber: Address,
        event_types: Vec<String>,
        contract_addresses: Vec<Address>,
    ) -> ContractCallResult<EventSubscription> {
        subscriber.require_auth();

        // Validate contract addresses
        for contract_addr in &contract_addresses {
            if !Self::is_registered_contract(&env, contract_addr) {
                return ContractCallResult {
                    success: false,
                    data: None,
                    error: Some("Invalid contract address".to_string()),
                };
            }
        }

        let subscription = EventSubscription {
            subscriber: subscriber.clone(),
            event_types: event_types.clone(),
            contract_addresses: contract_addresses.clone(),
            created_at: env.ledger().timestamp(),
            is_active: true,
        };

        env.storage().persistent().set(&DataKey::EventSubscriptions(subscriber.clone()), &subscription);

        ContractCallResult {
            success: true,
            data: Some(subscription),
            error: None,
        }
    }

    /// Unsubscribe from events
    pub fn unsubscribe_from_events(env: Env, subscriber: Address) {
        subscriber.require_auth();

        if let Some(mut subscription) = env.storage().persistent().get(&DataKey::EventSubscriptions(subscriber.clone())) {
            subscription.is_active = false;
            env.storage().persistent().set(&DataKey::EventSubscriptions(subscriber), &subscription);
        }
    }

    /// Query events with filter
    pub fn query_events(env: Env, filter: EventFilter) -> ContractCallResult<Vec<ContractEvent>> {
        let mut events: Vec<ContractEvent> = env.storage().instance()
            .get(&DataKey::EventHistory(Vec::new(&env)))
            .unwrap_or_else(|| Vec::new(&env));

        let mut filtered_events = Vec::new(&env);

        for i in 0..events.len() {
            let event = events.get(i).unwrap();
            
            if Self::matches_filter(&env, &event, &filter) {
                filtered_events.push_back(event);
            }
        }

        ContractCallResult {
            success: true,
            data: Some(filtered_events),
            error: None,
        }
    }

    /// Get contract registry
    pub fn get_contract_registry(env: Env) -> ContractRegistry {
        env.storage().instance()
            .get(&DataKey::ContractRegistry)
            .unwrap_or_else(|| panic_with_error!(&env, ContractError::NotAuthorized))
    }

    /// Register a new contract (admin only)
    pub fn register_contract(env: Env, admin: Address, contract_address: Address, contract_type: String) {
        admin.require_auth();

        let stored_admin: Address = env.storage().instance()
            .get(&DataKey::Admin)
            .unwrap_or_else(|| panic_with_error!(&env, ContractError::NotAuthorized));

        if admin != stored_admin {
            panic_with_error!(&env, ContractError::NotAuthorized);
        }

        let mut registry: ContractRegistry = env.storage().instance()
            .get(&DataKey::ContractRegistry)
            .unwrap_or_else(|| panic_with_error!(&env, ContractError::NotAuthorized));

        // Update registry based on contract type
        match contract_type.as_str() {
            "kale_integration" => registry.kale_integration = contract_address.clone(),
            "reflector_oracle" => registry.reflector_oracle = contract_address.clone(),
            "market_factory" => registry.market_factory = contract_address.clone(),
            "prediction_market" => registry.prediction_market = contract_address.clone(),
            _ => panic_with_error!(&env, ContractError::NotAuthorized),
        }

        env.storage().instance().set(&DataKey::ContractRegistry, &registry);

        log!(&env, "Contract registered: {} as {}", contract_address, contract_type);
    }

    /// Cross-contract event emission
    pub fn emit_cross_contract_event(
        env: Env,
        from_contract: Address,
        to_contract: Address,
        function_name: String,
        success: bool,
        error_message: Option<String>,
    ) {
        from_contract.require_auth();

        let event = ContractEvent::CrossContractCall {
            from_contract: from_contract.clone(),
            to_contract,
            function_name,
            success,
            error_message,
        };

        Self::emit_event(env, from_contract, event);
    }

    /// Get event statistics
    pub fn get_event_stats(env: Env) -> ContractCallResult<Map<String, u32>> {
        let events: Vec<ContractEvent> = env.storage().instance()
            .get(&DataKey::EventHistory(Vec::new(&env)))
            .unwrap_or_else(|| Vec::new(&env));

        let mut stats = Map::new(&env);

        for i in 0..events.len() {
            let event = events.get(i).unwrap();
            let event_type = Self::get_event_type_name(&env, &event);
            
            let current_count = stats.get(event_type.clone()).unwrap_or(0);
            stats.set(event_type, current_count + 1);
        }

        ContractCallResult {
            success: true,
            data: Some(stats),
            error: None,
        }
    }

    // Private helper functions
    fn is_registered_contract(env: &Env, contract_address: &Address) -> bool {
        let registry: ContractRegistry = env.storage().instance()
            .get(&DataKey::ContractRegistry)
            .unwrap_or_else(|| panic_with_error!(env, ContractError::NotAuthorized));

        *contract_address == registry.kale_integration ||
        *contract_address == registry.reflector_oracle ||
        *contract_address == registry.market_factory ||
        *contract_address == registry.prediction_market
    }

    fn store_event(env: &Env, event: ContractEvent) {
        let mut events: Vec<ContractEvent> = env.storage().instance()
            .get(&DataKey::EventHistory(Vec::new(env)))
            .unwrap_or_else(|| Vec::new(env));

        let max_history: u32 = env.storage().instance()
            .get(&DataKey::MaxEventHistory)
            .unwrap_or(1000);

        // Maintain event history limit
        if events.len() >= max_history as usize {
            events.remove(0); // Remove oldest event
        }

        events.push_back(event);
        env.storage().instance().set(&DataKey::EventHistory(Vec::new(env)), &events);
    }

    fn notify_subscribers(env: &Env, event: &ContractEvent) {
        // In a real implementation, this would iterate through all subscribers
        // and notify them based on their subscription criteria
        // For now, we'll just log the notification
        log!(env, "Notifying subscribers for event");
    }

    fn matches_filter(env: &Env, event: &ContractEvent, filter: &EventFilter) -> bool {
        // Check event type filter
        if let Some(ref event_types) = filter.event_types {
            let event_type_name = Self::get_event_type_name(env, event);
            let mut matches_type = false;
            
            for i in 0..event_types.len() {
                if event_types.get(i).unwrap() == event_type_name {
                    matches_type = true;
                    break;
                }
            }
            
            if !matches_type {
                return false;
            }
        }

        // Check contract address filter
        if let Some(ref contract_addresses) = filter.contract_addresses {
            let event_contract = Self::get_event_contract_address(env, event);
            let mut matches_contract = false;
            
            for i in 0..contract_addresses.len() {
                if contract_addresses.get(i).unwrap() == event_contract {
                    matches_contract = true;
                    break;
                }
            }
            
            if !matches_contract {
                return false;
            }
        }

        // Check timestamp filter
        if let Some(from_timestamp) = filter.from_timestamp {
            let event_timestamp = Self::get_event_timestamp(env, event);
            if event_timestamp < from_timestamp {
                return false;
            }
        }

        if let Some(to_timestamp) = filter.to_timestamp {
            let event_timestamp = Self::get_event_timestamp(env, event);
            if event_timestamp > to_timestamp {
                return false;
            }
        }

        true
    }

    fn get_event_type_name(env: &Env, event: &ContractEvent) -> String {
        match event {
            ContractEvent::MarketCreated { .. } => String::from_str(env, "MarketCreated"),
            ContractEvent::MarketResolved { .. } => String::from_str(env, "MarketResolved"),
            ContractEvent::BetPlaced { .. } => String::from_str(env, "BetPlaced"),
            ContractEvent::WinningsClaimed { .. } => String::from_str(env, "WinningsClaimed"),
            ContractEvent::TokensStaked { .. } => String::from_str(env, "TokensStaked"),
            ContractEvent::TokensUnstaked { .. } => String::from_str(env, "TokensUnstaked"),
            ContractEvent::RewardsClaimed { .. } => String::from_str(env, "RewardsClaimed"),
            ContractEvent::PriceUpdated { .. } => String::from_str(env, "PriceUpdated"),
            ContractEvent::OracleNodeAdded { .. } => String::from_str(env, "OracleNodeAdded"),
            ContractEvent::OracleNodeRemoved { .. } => String::from_str(env, "OracleNodeRemoved"),
            ContractEvent::CrossContractCall { .. } => String::from_str(env, "CrossContractCall"),
            ContractEvent::ContractValidationFailed { .. } => String::from_str(env, "ContractValidationFailed"),
            ContractEvent::FeeCollected { .. } => String::from_str(env, "FeeCollected"),
            ContractEvent::ConfigurationUpdated { .. } => String::from_str(env, "ConfigurationUpdated"),
        }
    }

    fn get_event_contract_address(env: &Env, event: &ContractEvent) -> Address {
        // This would need to be implemented based on the specific event type
        // For now, return a default address
        Address::from_string(env, &env.string().from_str(""))
    }

    fn get_event_timestamp(env: &Env, event: &ContractEvent) -> u64 {
        match event {
            ContractEvent::MarketCreated { .. } => env.ledger().timestamp(),
            ContractEvent::MarketResolved { .. } => env.ledger().timestamp(),
            ContractEvent::BetPlaced { .. } => env.ledger().timestamp(),
            ContractEvent::WinningsClaimed { .. } => env.ledger().timestamp(),
            ContractEvent::TokensStaked { .. } => env.ledger().timestamp(),
            ContractEvent::TokensUnstaked { .. } => env.ledger().timestamp(),
            ContractEvent::RewardsClaimed { .. } => env.ledger().timestamp(),
            ContractEvent::PriceUpdated { timestamp, .. } => *timestamp,
            ContractEvent::OracleNodeAdded { .. } => env.ledger().timestamp(),
            ContractEvent::OracleNodeRemoved { .. } => env.ledger().timestamp(),
            ContractEvent::CrossContractCall { .. } => env.ledger().timestamp(),
            ContractEvent::ContractValidationFailed { .. } => env.ledger().timestamp(),
            ContractEvent::FeeCollected { .. } => env.ledger().timestamp(),
            ContractEvent::ConfigurationUpdated { .. } => env.ledger().timestamp(),
        }
    }
}

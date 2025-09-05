#![no_std]

use soroban_sdk::{
    contract, contractimpl, contracttype, token, Address, Env, String, Vec, Map,
    panic_with_error, log, symbol_short,
};
use shared_types::{Market, ContractError, Config};

const DAY_IN_LEDGERS: u32 = 17280;
const INSTANCE_BUMP_AMOUNT: u32 = 7 * DAY_IN_LEDGERS;
const INSTANCE_LIFETIME_THRESHOLD: u32 = INSTANCE_BUMP_AMOUNT - DAY_IN_LEDGERS;

#[contracttype]
pub enum DataKey {
    Config,
    MarketCount,
    Markets(Vec<Address>),
    CreatorFee,
    MinMarketFee,
}

#[contracttype]
pub enum EventType {
    MarketCreated {
        market_id: u32,
        creator: Address,
        contract_id: Address,
        event_description: String,
        oracle_asset: String,
        target_price: i128,
        condition: u32,
        resolve_time: u64,
    },
}

#[contract]
pub struct MarketFactoryContract;

#[contractimpl]
impl MarketFactoryContract {
    /// Initialize the factory contract
    pub fn initialize(
        env: Env,
        admin: Address,
        kale_token: Address,
        reflector_oracle: Address,
        creator_fee_rate: u32,
        min_market_fee: i128,
    ) {
        if env.storage().instance().has(&DataKey::Config) {
            panic_with_error!(&env, ContractError::NotAuthorized);
        }

        let config = Config {
            admin: admin.clone(),
            kale_token,
            oracle_address: reflector_oracle,
            platform_fee_rate: creator_fee_rate,
            min_stake_amount: min_market_fee,
            reward_rate_per_second: 0, // Not used in factory
            max_market_duration: 30 * 24 * 60 * 60, // 30 days
            min_market_duration: 60 * 60, // 1 hour
        };

        env.storage().instance().set(&DataKey::Config, &config);
        env.storage().instance().set(&DataKey::MarketCount, &0u32);
        env.storage().instance().set(&DataKey::Markets(Vec::new(&env)), &Vec::<Address>::new(&env));
        env.storage().instance().set(&DataKey::CreatorFee, &creator_fee_rate);
        env.storage().instance().set(&DataKey::MinMarketFee, &min_market_fee);

        env.storage()
            .instance()
            .extend_ttl(INSTANCE_LIFETIME_THRESHOLD, INSTANCE_BUMP_AMOUNT);

        log!(&env, "MarketFactory initialized by admin: {}", admin);
    }

    /// Create a new prediction market
    pub fn create_market(
        env: Env,
        creator: Address,
        event_description: String,
        oracle_asset: String,
        target_price: i128,
        condition: u32,
        resolve_time: u64,
        min_bet_amount: i128,
        max_bet_amount: i128,
        creator_fee_rate: u32,
    ) -> Address {
        creator.require_auth();

        let config: Config = env.storage().instance().get(&DataKey::Config).unwrap();
        let current_time = env.ledger().timestamp();
        let min_market_fee: i128 = env.storage().instance().get(&DataKey::MinMarketFee).unwrap();

        // Validate market parameters
        if resolve_time <= current_time {
            panic_with_error!(&env, ContractError::InvalidTimestamp);
        }

        let duration = resolve_time - current_time;
        if duration < config.min_market_duration || duration > config.max_market_duration {
            panic_with_error!(&env, ContractError::InvalidTimestamp);
        }

        if condition > 1 {
            panic_with_error!(&env, ContractError::InvalidOutcome);
        }

        if creator_fee_rate > 1000 { // Max 10%
            panic_with_error!(&env, ContractError::InvalidAmount);
        }

        if min_bet_amount <= 0 || max_bet_amount <= min_bet_amount {
            panic_with_error!(&env, ContractError::InvalidAmount);
        }

        // Transfer KALE fee from creator to prevent spam
        let token_client = token::Client::new(&env, &config.kale_token);
        token_client.transfer(&creator, &env.current_contract_address(), &min_market_fee);

        // Deploy new prediction market contract
        let market_contract_id = Self::deploy_market_contract(&env);

        // Initialize the new market contract
        Self::initialize_market_contract(
            &env,
            &market_contract_id,
            &creator,
            &event_description,
            &oracle_asset,
            target_price,
            condition,
            resolve_time,
            min_bet_amount,
            max_bet_amount,
            creator_fee_rate,
            &config,
        );

        // Update factory state
        let mut market_count: u32 = env.storage().instance().get(&DataKey::MarketCount).unwrap_or(0);
        market_count += 1;

        let mut markets: Vec<Address> = env.storage().instance()
            .get(&DataKey::Markets(Vec::new(&env)))
            .unwrap_or_else(|| Vec::new(&env));
        markets.push_back(market_contract_id.clone());

        env.storage().instance().set(&DataKey::MarketCount, &market_count);
        env.storage().instance().set(&DataKey::Markets(Vec::new(&env)), &markets);

        // Emit market created event
        let event = EventType::MarketCreated {
            market_id: market_count,
            creator: creator.clone(),
            contract_id: market_contract_id.clone(),
            event_description: event_description.clone(),
            oracle_asset: oracle_asset.clone(),
            target_price,
            condition,
            resolve_time,
        };

        env.events().publish((symbol_short!("market_created"), event));

        log!(&env, "Market created: {} by {}", event_description, creator);

        market_contract_id
    }

    /// Get all markets created by this factory
    pub fn get_markets(env: Env) -> Vec<Address> {
        env.storage().instance()
            .get(&DataKey::Markets(Vec::new(&env)))
            .unwrap_or_else(|| Vec::new(&env))
    }

    /// Get total number of markets created
    pub fn get_market_count(env: Env) -> u32 {
        env.storage().instance().get(&DataKey::MarketCount).unwrap_or(0)
    }

    /// Get factory configuration
    pub fn get_config(env: Env) -> Config {
        env.storage().instance().get(&DataKey::Config).unwrap()
    }

    /// Update factory configuration (admin only)
    pub fn update_config(
        env: Env,
        admin: Address,
        creator_fee_rate: u32,
        min_market_fee: i128,
    ) {
        admin.require_auth();

        let config: Config = env.storage().instance().get(&DataKey::Config).unwrap();

        if admin != config.admin {
            panic_with_error!(&env, ContractError::NotAuthorized);
        }

        if creator_fee_rate > 1000 {
            panic_with_error!(&env, ContractError::InvalidAmount);
        }

        env.storage().instance().set(&DataKey::CreatorFee, &creator_fee_rate);
        env.storage().instance().set(&DataKey::MinMarketFee, &min_market_fee);

        log!(&env, "Factory config updated: creator_fee={}, min_fee={}", creator_fee_rate, min_market_fee);
    }

    /// Withdraw accumulated fees (admin only)
    pub fn withdraw_fees(env: Env, admin: Address, recipient: Address) {
        admin.require_auth();

        let config: Config = env.storage().instance().get(&DataKey::Config).unwrap();

        if admin != config.admin {
            panic_with_error!(&env, ContractError::NotAuthorized);
        }

        let token_client = token::Client::new(&env, &config.kale_token);
        let balance = token_client.balance(&env.current_contract_address());

        if balance > 0 {
            token_client.transfer(&env.current_contract_address(), &recipient, &balance);
        }

        log!(&env, "Fees withdrawn: {} KALE to {}", balance, recipient);
    }

    // Private helper functions
    fn deploy_market_contract(env: &Env) -> Address {
        // In a real implementation, this would deploy the prediction market contract
        // For now, we'll use a mock contract ID
        Address::from_string(&env.string().from_str("CDBG4XY2T5RRPH7HKGZIWMR2MFPLC6RJ453ITXQGNQXG6LNVL4375MRJ"))
    }

    fn initialize_market_contract(
        env: &Env,
        contract_id: &Address,
        creator: &Address,
        event_description: &String,
        oracle_asset: &String,
        target_price: i128,
        condition: u32,
        resolve_time: u64,
        min_bet_amount: i128,
        max_bet_amount: i128,
        creator_fee_rate: u32,
        config: &Config,
    ) {
        // In a real implementation, this would call the initialize function on the deployed contract
        // For now, we'll just log the initialization
        log!(env, "Initializing market contract: {} with oracle asset: {}", contract_id, oracle_asset);
    }
}

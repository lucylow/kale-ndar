#![no_std]

use soroban_sdk::{
    contract, contractimpl, contracttype, token, Address, Env, Vec, Map,
    panic_with_error, log,
};
use shared_types::{StakeInfo, ContractError, Config};

const DAY_IN_LEDGERS: u32 = 17280;
const INSTANCE_BUMP_AMOUNT: u32 = 7 * DAY_IN_LEDGERS;
const INSTANCE_LIFETIME_THRESHOLD: u32 = INSTANCE_BUMP_AMOUNT - DAY_IN_LEDGERS;

#[contracttype]
pub enum DataKey {
    Config,
    StakeInfo(Address),
    TotalStaked,
    RewardPool,
    LastRewardUpdate,
    StakerList,
}

#[contract]
pub struct KaleIntegrationContract;

#[contractimpl]
impl KaleIntegrationContract {
    /// Initialize the KALE integration contract
    pub fn initialize(
        env: Env,
        admin: Address,
        kale_token: Address,
        reward_rate_per_second: i128,
        min_stake_amount: i128,
    ) {
        if env.storage().instance().has(&DataKey::Config) {
            panic_with_error!(&env, ContractError::NotAuthorized);
        }

        let config = Config {
            admin: admin.clone(),
            kale_token,
            oracle_address: Address::from_string(&env.string().from_str("")), // Not used in this contract
            platform_fee_rate: 0, // Not used in this contract
            min_stake_amount,
            reward_rate_per_second,
            max_market_duration: 0, // Not used in this contract
            min_market_duration: 0, // Not used in this contract
        };

        env.storage().instance().set(&DataKey::Config, &config);
        env.storage().instance().set(&DataKey::TotalStaked, &0i128);
        env.storage().instance().set(&DataKey::RewardPool, &0i128);
        env.storage().instance().set(&DataKey::LastRewardUpdate, &env.ledger().timestamp());
        env.storage().instance().set(&DataKey::StakerList, &Vec::<Address>::new(&env));

        env.storage()
            .instance()
            .extend_ttl(INSTANCE_LIFETIME_THRESHOLD, INSTANCE_BUMP_AMOUNT);

        log!(&env, "KaleIntegration initialized by admin: {}", admin);
    }

    /// Stake KALE tokens
    pub fn stake(env: Env, staker: Address, amount: i128) {
        staker.require_auth();

        let config: Config = env.storage().instance().get(&DataKey::Config).unwrap();

        if amount < config.min_stake_amount {
            panic_with_error!(&env, ContractError::InvalidAmount);
        }

        let token_client = token::Client::new(&env, &config.kale_token);
        
        // Transfer tokens from staker to contract
        token_client.transfer(&staker, &env.current_contract_address(), &amount);

        let current_time = env.ledger().timestamp();

        // Update global rewards before modifying stakes
        Self::update_global_rewards(&env);

        // Get or create stake info
        let mut stake_info = env.storage().persistent()
            .get(&DataKey::StakeInfo(staker.clone()))
            .unwrap_or_else(|| {
                // Add to staker list if new staker
                let mut staker_list: Vec<Address> = env.storage().instance()
                    .get(&DataKey::StakerList)
                    .unwrap_or_else(|| Vec::new(&env));
                staker_list.push_back(staker.clone());
                env.storage().instance().set(&DataKey::StakerList, &staker_list);

                StakeInfo {
                    staker: staker.clone(),
                    amount: 0,
                    stake_time: current_time,
                    last_reward_time: current_time,
                    accumulated_rewards: 0,
                }
            });

        // Calculate pending rewards before updating stake
        let pending_rewards = Self::calculate_pending_rewards(&env, &stake_info);
        stake_info.accumulated_rewards += pending_rewards;

        // Update stake info
        stake_info.amount += amount;
        stake_info.last_reward_time = current_time;

        // Update total staked
        let mut total_staked: i128 = env.storage().instance().get(&DataKey::TotalStaked).unwrap_or(0);
        total_staked += amount;

        // Store updated data
        env.storage().persistent().set(&DataKey::StakeInfo(staker.clone()), &stake_info);
        env.storage().instance().set(&DataKey::TotalStaked, &total_staked);

        env.storage()
            .instance()
            .extend_ttl(INSTANCE_LIFETIME_THRESHOLD, INSTANCE_BUMP_AMOUNT);

        log!(&env, "Staked {} KALE by {}", amount, staker);
    }

    /// Unstake KALE tokens
    pub fn unstake(env: Env, staker: Address, amount: i128) {
        staker.require_auth();

        let mut stake_info: StakeInfo = env.storage().persistent()
            .get(&DataKey::StakeInfo(staker.clone()))
            .unwrap_or_else(|| panic_with_error!(&env, ContractError::StakeNotFound));

        if amount > stake_info.amount {
            panic_with_error!(&env, ContractError::InsufficientStake);
        }

        let config: Config = env.storage().instance().get(&DataKey::Config).unwrap();
        let token_client = token::Client::new(&env, &config.kale_token);

        let current_time = env.ledger().timestamp();

        // Update global rewards before modifying stakes
        Self::update_global_rewards(&env);

        // Calculate pending rewards before updating stake
        let pending_rewards = Self::calculate_pending_rewards(&env, &stake_info);
        stake_info.accumulated_rewards += pending_rewards;

        // Update stake info
        stake_info.amount -= amount;
        stake_info.last_reward_time = current_time;

        // Update total staked
        let mut total_staked: i128 = env.storage().instance().get(&DataKey::TotalStaked).unwrap_or(0);
        total_staked -= amount;

        // Transfer tokens back to staker
        token_client.transfer(&env.current_contract_address(), &staker, &amount);

        // Store updated data
        if stake_info.amount == 0 && stake_info.accumulated_rewards == 0 {
            // Remove from storage if no stake and no rewards
            env.storage().persistent().remove(&DataKey::StakeInfo(staker.clone()));
            
            // Remove from staker list
            let mut staker_list: Vec<Address> = env.storage().instance()
                .get(&DataKey::StakerList)
                .unwrap_or_else(|| Vec::new(&env));
            
            let mut new_list = Vec::new(&env);
            for i in 0..staker_list.len() {
                if staker_list.get(i).unwrap() != staker {
                    new_list.push_back(staker_list.get(i).unwrap());
                }
            }
            env.storage().instance().set(&DataKey::StakerList, &new_list);
        } else {
            env.storage().persistent().set(&DataKey::StakeInfo(staker.clone()), &stake_info);
        }

        env.storage().instance().set(&DataKey::TotalStaked, &total_staked);

        log!(&env, "Unstaked {} KALE by {}", amount, staker);
    }

    /// Claim accumulated rewards
    pub fn claim_rewards(env: Env, staker: Address) -> i128 {
        staker.require_auth();

        let mut stake_info: StakeInfo = env.storage().persistent()
            .get(&DataKey::StakeInfo(staker.clone()))
            .unwrap_or_else(|| panic_with_error!(&env, ContractError::StakeNotFound));

        let current_time = env.ledger().timestamp();

        // Update global rewards
        Self::update_global_rewards(&env);

        // Calculate total rewards to claim
        let pending_rewards = Self::calculate_pending_rewards(&env, &stake_info);
        let total_rewards = stake_info.accumulated_rewards + pending_rewards;

        if total_rewards == 0 {
            return 0;
        }

        let config: Config = env.storage().instance().get(&DataKey::Config).unwrap();
        let token_client = token::Client::new(&env, &config.kale_token);

        // Check if contract has enough balance for rewards
        let contract_balance = token_client.balance(&env.current_contract_address());
        let total_staked: i128 = env.storage().instance().get(&DataKey::TotalStaked).unwrap_or(0);
        let available_for_rewards = contract_balance - total_staked;

        let rewards_to_pay = if total_rewards > available_for_rewards {
            available_for_rewards
        } else {
            total_rewards
        };

        if rewards_to_pay > 0 {
            // Transfer rewards to staker
            token_client.transfer(&env.current_contract_address(), &staker, &rewards_to_pay);
        }

        // Update stake info
        stake_info.accumulated_rewards = total_rewards - rewards_to_pay;
        stake_info.last_reward_time = current_time;

        env.storage().persistent().set(&DataKey::StakeInfo(staker.clone()), &stake_info);

        log!(&env, "Claimed {} KALE rewards by {}", rewards_to_pay, staker);

        rewards_to_pay
    }

    /// Add rewards to the pool (only admin)
    pub fn add_rewards(env: Env, admin: Address, amount: i128) {
        admin.require_auth();

        let config: Config = env.storage().instance().get(&DataKey::Config).unwrap();

        if admin != config.admin {
            panic_with_error!(&env, ContractError::NotAuthorized);
        }

        let token_client = token::Client::new(&env, &config.kale_token);

        // Transfer tokens from admin to contract
        token_client.transfer(&admin, &env.current_contract_address(), &amount);

        let mut reward_pool: i128 = env.storage().instance().get(&DataKey::RewardPool).unwrap_or(0);
        reward_pool += amount;

        env.storage().instance().set(&DataKey::RewardPool, &reward_pool);

        log!(&env, "Added {} KALE to reward pool by admin", amount);
    }

    /// Get stake information for a user
    pub fn get_stake_info(env: Env, staker: Address) -> StakeInfo {
        let mut stake_info: StakeInfo = env.storage().persistent()
            .get(&DataKey::StakeInfo(staker))
            .unwrap_or_else(|| panic_with_error!(&env, ContractError::StakeNotFound));

        // Include pending rewards in the returned info
        let pending_rewards = Self::calculate_pending_rewards(&env, &stake_info);
        stake_info.accumulated_rewards += pending_rewards;

        stake_info
    }

    /// Get total staked amount
    pub fn get_total_staked(env: Env) -> i128 {
        env.storage().instance().get(&DataKey::TotalStaked).unwrap_or(0)
    }

    /// Get reward pool balance
    pub fn get_reward_pool(env: Env) -> i128 {
        env.storage().instance().get(&DataKey::RewardPool).unwrap_or(0)
    }

    /// Get list of all stakers
    pub fn get_stakers(env: Env) -> Vec<Address> {
        env.storage().instance()
            .get(&DataKey::StakerList)
            .unwrap_or_else(|| Vec::new(&env))
    }

    /// Calculate APY based on current staking parameters
    pub fn get_current_apy(env: Env) -> u32 {
        let config: Config = env.storage().instance().get(&DataKey::Config).unwrap();
        let total_staked: i128 = env.storage().instance().get(&DataKey::TotalStaked).unwrap_or(0);

        if total_staked == 0 {
            return 0;
        }

        // APY = (reward_rate_per_second * seconds_per_year * 100) / total_staked
        let seconds_per_year = 365 * 24 * 60 * 60;
        let annual_rewards = config.reward_rate_per_second * seconds_per_year;
        ((annual_rewards * 10000) / total_staked) as u32 // Return as basis points
    }

    // Private helper functions
    fn update_global_rewards(env: &Env) {
        let current_time = env.ledger().timestamp();
        let last_update: u64 = env.storage().instance()
            .get(&DataKey::LastRewardUpdate)
            .unwrap_or(current_time);

        env.storage().instance().set(&DataKey::LastRewardUpdate, &current_time);
    }

    fn calculate_pending_rewards(env: &Env, stake_info: &StakeInfo) -> i128 {
        let config: Config = env.storage().instance().get(&DataKey::Config).unwrap();
        let current_time = env.ledger().timestamp();
        
        if current_time <= stake_info.last_reward_time {
            return 0;
        }

        let time_diff = current_time - stake_info.last_reward_time;
        let total_staked: i128 = env.storage().instance().get(&DataKey::TotalStaked).unwrap_or(0);

        if total_staked == 0 {
            return 0;
        }

        // Calculate proportional rewards
        let total_rewards_for_period = config.reward_rate_per_second * (time_diff as i128);
        (total_rewards_for_period * stake_info.amount) / total_staked
    }
}


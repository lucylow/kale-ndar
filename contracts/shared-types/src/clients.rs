#![no_std]

use soroban_sdk::{contract, contractimpl, Address, Env, String, BytesN};
use crate::{PriceFeed, EventData, StakeInfo, MarketInfo, ContractError};

/// Client for Reflector Oracle contract
#[contract]
pub struct ReflectorOracleClient;

#[contractimpl]
impl ReflectorOracleClient {
    /// Get latest price for an asset
    pub fn get_price(env: &Env, oracle_address: &Address, asset_name: String) -> PriceFeed {
        let client = ReflectorOracleClient::new(env, oracle_address);
        client.get_price(&asset_name)
    }

    /// Try to get price with error handling
    pub fn try_get_price(env: &Env, oracle_address: &Address, asset_name: String) -> Result<PriceFeed, ContractError> {
        let client = ReflectorOracleClient::new(env, oracle_address);
        match client.try_get_price(&asset_name) {
            Ok(price_feed) => Ok(price_feed),
            Err(_) => Err(ContractError::OracleError),
        }
    }

    /// Get event data
    pub fn get_event_data(env: &Env, oracle_address: &Address, event_id: String) -> EventData {
        let client = ReflectorOracleClient::new(env, oracle_address);
        client.get_event_data(&event_id)
    }

    /// Check if price is available
    pub fn is_price_available(env: &Env, oracle_address: &Address, asset_name: String) -> bool {
        let client = ReflectorOracleClient::new(env, oracle_address);
        client.is_price_available(&asset_name)
    }
}

/// Client for KALE Integration contract
#[contract]
pub struct KaleIntegrationClient;

#[contractimpl]
impl KaleIntegrationClient {
    /// Get stake information for a user
    pub fn get_stake_info(env: &Env, kale_address: &Address, staker: Address) -> StakeInfo {
        let client = KaleIntegrationClient::new(env, kale_address);
        client.get_stake_info(&staker)
    }

    /// Try to get stake info with error handling
    pub fn try_get_stake_info(env: &Env, kale_address: &Address, staker: Address) -> Result<StakeInfo, ContractError> {
        let client = KaleIntegrationClient::new(env, kale_address);
        match client.try_get_stake_info(&staker) {
            Ok(stake_info) => Ok(stake_info),
            Err(_) => Err(ContractError::StakeNotFound),
        }
    }

    /// Get total staked amount
    pub fn get_total_staked(env: &Env, kale_address: &Address) -> i128 {
        let client = KaleIntegrationClient::new(env, kale_address);
        client.get_total_staked()
    }

    /// Get current APY
    pub fn get_current_apy(env: &Env, kale_address: &Address) -> u32 {
        let client = KaleIntegrationClient::new(env, kale_address);
        client.get_current_apy()
    }

    /// Get market information
    pub fn get_market_info(env: &Env, kale_address: &Address, market_id: BytesN<32>) -> MarketInfo {
        let client = KaleIntegrationClient::new(env, kale_address);
        client.get_market_info(&market_id)
    }

    /// Stake KALE tokens
    pub fn stake(env: &Env, kale_address: &Address, staker: Address, amount: i128) {
        let client = KaleIntegrationClient::new(env, kale_address);
        client.stake(&staker, &amount);
    }

    /// Unstake KALE tokens
    pub fn unstake(env: &Env, kale_address: &Address, staker: Address, amount: i128) {
        let client = KaleIntegrationClient::new(env, kale_address);
        client.unstake(&staker, &amount);
    }

    /// Claim rewards
    pub fn claim_rewards(env: &Env, kale_address: &Address, staker: Address) -> i128 {
        let client = KaleIntegrationClient::new(env, kale_address);
        client.claim_rewards(&staker)
    }
}

/// Client for Market Factory contract
#[contract]
pub struct MarketFactoryClient;

#[contractimpl]
impl MarketFactoryClient {
    /// Create a new prediction market
    pub fn create_market(
        env: &Env,
        factory_address: &Address,
        creator: Address,
        event_description: String,
        oracle_asset: String,
        target_price: i128,
        condition: u32,
        resolve_time: u64,
        min_bet_amount: i128,
        max_bet_amount: i128,
        creator_fee_rate: u32,
        kale_token: Address,
        reflector_oracle: Address,
    ) -> Address {
        let client = MarketFactoryClient::new(env, factory_address);
        client.create_market(
            &creator,
            &event_description,
            &oracle_asset,
            &target_price,
            &condition,
            &resolve_time,
            &min_bet_amount,
            &max_bet_amount,
            &creator_fee_rate,
            &kale_token,
            &reflector_oracle,
        )
    }
}

#![no_std]

use soroban_sdk::{contracttype, Address, String, Vec, BytesN, Option};

pub mod clients;

/// Market status enumeration
#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub enum MarketStatus {
    Active,
    Closed,
    Resolved,
    Cancelled,
}

/// Market outcome enumeration
#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub enum MarketOutcome {
    OutcomeA,
    OutcomeB,
    Draw,
    Invalid,
}

/// Market information structure
#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct Market {
    pub id: u32,
    pub creator: Address,
    pub event_name: String,
    pub outcome_a_name: String,
    pub outcome_b_name: String,
    pub end_time: u64,
    pub resolution_time: u64,
    pub status: MarketStatus,
    pub total_pool_a: i128,
    pub total_pool_b: i128,
    pub oracle_address: Address,
    pub min_bet_amount: i128,
    pub max_bet_amount: i128,
    pub creator_fee_rate: u32, // basis points (e.g., 100 = 1%)
    pub platform_fee_rate: u32, // basis points
}

/// Bet information structure
#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct Bet {
    pub id: u32,
    pub market_id: u32,
    pub bettor: Address,
    pub outcome: MarketOutcome,
    pub amount: i128,
    pub timestamp: u64,
    pub odds_at_bet: u32, // odds * 10000 for precision
    pub claimed: bool,
}

/// Staking information structure
#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct StakeInfo {
    pub staker: Address,
    pub amount: i128,
    pub stake_time: u64,
    pub last_reward_time: u64,
    pub accumulated_rewards: i128,
}

/// Oracle price feed structure
#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct PriceFeed {
    pub asset_name: String,
    pub price: i128,
    pub timestamp: u64,
    pub confidence: u32,
    pub source: String,
}

/// Event data structure for oracle
#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct EventData {
    pub event_id: String,
    pub outcome: MarketOutcome,
    pub timestamp: u64,
    pub confidence: u32,
    pub data_source: String,
}

/// Error types for contracts
#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub enum ContractError {
    NotAuthorized,
    MarketNotFound,
    MarketClosed,
    MarketAlreadyResolved,
    InsufficientBalance,
    InvalidAmount,
    InvalidOutcome,
    BetNotFound,
    AlreadyClaimed,
    OracleError,
    InvalidTimestamp,
    StakeNotFound,
    InsufficientStake,
}

/// Market information structure for KALE integration
#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct MarketInfo {
    pub id: BytesN<32>,
    pub creator: Address,
    pub description: String,
    pub asset_symbol: String,
    pub target_price: i128,
    pub condition: u32, // 0: Above, 1: Below
    pub resolve_time: u64,
    pub created_at: u64,
    pub resolved: bool,
    pub outcome: Option<bool>,
    pub total_for: i128,
    pub total_against: i128,
    pub market_fee: i128,
}

/// Fee information structure
#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct FeeInfo {
    pub platform_fees: i128,
    pub collected_fees: i128,
    pub fee_rate: u32,
    pub fee_collector: Address,
}

/// Configuration structure for contracts
#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct Config {
    pub admin: Address,
    pub kale_token: Address,
    pub oracle_address: Address,
    pub platform_fee_rate: u32,
    pub min_stake_amount: i128,
    pub reward_rate_per_second: i128,
    pub max_market_duration: u64,
    pub min_market_duration: u64,
}

/// Contract interface definitions for interoperability
#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct ContractAddresses {
    pub kale_integration: Address,
    pub reflector_oracle: Address,
    pub market_factory: Address,
}

/// Cross-contract call result
#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct ContractCallResult<T> {
    pub success: bool,
    pub data: Option<T>,
    pub error: Option<String>,
}

/// Market resolution data from oracle
#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct MarketResolutionData {
    pub market_id: BytesN<32>,
    pub final_price: i128,
    pub target_price: i128,
    pub condition: u32, // 0: Above, 1: Below
    pub outcome: bool,
    pub confidence: u32,
    pub timestamp: u64,
}

/// Staking position for cross-contract queries
#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct StakingPosition {
    pub staker: Address,
    pub amount: i128,
    pub apy: u32,
    pub pending_rewards: i128,
    pub last_update: u64,
}

/// Oracle subscription for market events
#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct OracleSubscription {
    pub subscriber: Address,
    pub asset_name: String,
    pub threshold: i128, // Price threshold for notifications
    pub condition: u32, // Above/below threshold
    pub created_at: u64,
    pub is_active: bool,
}

/// Enhanced error types for better interoperability
#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub enum InteropError {
    ContractNotFound,
    InvalidContractCall,
    InsufficientPermissions,
    DataMismatch,
    OracleUnavailable,
    MarketNotReady,
    StakingInactive,
    InvalidCrossCall,
    Timeout,
    NetworkError,
}

/// Comprehensive event system for contract communication
#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub enum ContractEvent {
    // Market Events
    MarketCreated {
        market_id: BytesN<32>,
        creator: Address,
        asset_symbol: String,
        target_price: i128,
        resolve_time: u64,
    },
    MarketResolved {
        market_id: BytesN<32>,
        outcome: bool,
        final_price: i128,
        confidence: u32,
    },
    BetPlaced {
        market_id: BytesN<32>,
        bettor: Address,
        side: bool,
        amount: i128,
        odds: u32,
    },
    WinningsClaimed {
        market_id: BytesN<32>,
        winner: Address,
        amount: i128,
    },
    
    // Staking Events
    TokensStaked {
        staker: Address,
        amount: i128,
        total_staked: i128,
        apy: u32,
    },
    TokensUnstaked {
        staker: Address,
        amount: i128,
        remaining_staked: i128,
    },
    RewardsClaimed {
        staker: Address,
        amount: i128,
        new_balance: i128,
    },
    
    // Oracle Events
    PriceUpdated {
        asset_name: String,
        price: i128,
        confidence: u32,
        source: String,
        timestamp: u64,
    },
    OracleNodeAdded {
        node_address: Address,
        reputation_score: u32,
    },
    OracleNodeRemoved {
        node_address: Address,
        reason: String,
    },
    
    // Cross-Contract Events
    CrossContractCall {
        from_contract: Address,
        to_contract: Address,
        function_name: String,
        success: bool,
        error_message: Option<String>,
    },
    ContractValidationFailed {
        contract_address: Address,
        validation_type: String,
        reason: String,
    },
    
    // System Events
    FeeCollected {
        collector: Address,
        amount: i128,
        fee_type: String,
    },
    ConfigurationUpdated {
        contract_address: Address,
        parameter: String,
        old_value: String,
        new_value: String,
    },
}

/// Event subscription for cross-contract notifications
#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct EventSubscription {
    pub subscriber: Address,
    pub event_types: Vec<String>,
    pub contract_addresses: Vec<Address>,
    pub created_at: u64,
    pub is_active: bool,
}

/// Event filter for querying specific events
#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct EventFilter {
    pub event_types: Option<Vec<String>>,
    pub contract_addresses: Option<Vec<Address>>,
    pub from_timestamp: Option<u64>,
    pub to_timestamp: Option<u64>,
    pub user_addresses: Option<Vec<Address>>,
}

/// Utility functions
impl Market {
    pub fn is_active(&self) -> bool {
        matches!(self.status, MarketStatus::Active)
    }
    
    pub fn is_resolved(&self) -> bool {
        matches!(self.status, MarketStatus::Resolved)
    }
    
    pub fn total_pool(&self) -> i128 {
        self.total_pool_a + self.total_pool_b
    }
    
    pub fn can_resolve(&self, current_time: u64) -> bool {
        current_time >= self.resolution_time && self.is_active()
    }
}

impl Bet {
    pub fn calculate_payout(&self, winning_pool: i128, losing_pool: i128) -> i128 {
        if losing_pool == 0 {
            return self.amount; // Return original bet if no opposing bets
        }
        
        // Payout = bet_amount + (bet_amount * losing_pool / winning_pool)
        self.amount + (self.amount * losing_pool / winning_pool)
    }
}

impl MarketInfo {
    pub fn is_ready_for_resolution(&self, current_time: u64) -> bool {
        current_time >= self.resolve_time && !self.resolved
    }
    
    pub fn calculate_outcome(&self, final_price: i128) -> bool {
        match self.condition {
            0 => final_price > self.target_price, // Above condition
            1 => final_price < self.target_price, // Below condition
            _ => false,
        }
    }
}

impl StakeInfo {
    pub fn is_active(&self, current_time: u64) -> bool {
        self.amount > 0 && current_time > self.stake_time
    }
    
    pub fn calculate_apy(&self, reward_rate_per_second: i128, total_staked: i128) -> u32 {
        if total_staked == 0 || self.amount == 0 {
            return 0;
        }
        
        let seconds_per_year = 365 * 24 * 60 * 60;
        let annual_rewards = reward_rate_per_second * seconds_per_year;
        ((annual_rewards * 10000) / total_staked) as u32
    }
}

/// Enhanced validation utilities
pub mod validation {
    use super::*;
    
    /// Validate address is not zero
    pub fn validate_address(env: &Env, address: &Address) -> Result<(), ContractError> {
        if address.to_string().is_empty() {
            Err(ContractError::NotAuthorized)
        } else {
            Ok(())
        }
    }
    
    /// Validate amount is positive and within bounds
    pub fn validate_amount(amount: i128, min_amount: i128, max_amount: Option<i128>) -> Result<(), ContractError> {
        if amount <= 0 {
            return Err(ContractError::InvalidAmount);
        }
        
        if amount < min_amount {
            return Err(ContractError::InvalidAmount);
        }
        
        if let Some(max) = max_amount {
            if amount > max {
                return Err(ContractError::InvalidAmount);
            }
        }
        
        Ok(())
    }
    
    /// Validate timestamp is in the future
    pub fn validate_future_timestamp(env: &Env, timestamp: u64) -> Result<(), ContractError> {
        let current_time = env.ledger().timestamp();
        if timestamp <= current_time {
            Err(ContractError::InvalidTimestamp)
        } else {
            Ok(())
        }
    }
    
    /// Validate string is not empty and within length limits
    pub fn validate_string(env: &Env, string: &String, max_length: u32) -> Result<(), ContractError> {
        if string.is_empty() {
            return Err(ContractError::NotAuthorized);
        }
        
        if string.len() > max_length {
            return Err(ContractError::NotAuthorized);
        }
        
        Ok(())
    }
    
    /// Validate confidence level is within acceptable range
    pub fn validate_confidence(confidence: u32, min_confidence: u32, max_confidence: u32) -> Result<(), ContractError> {
        if confidence < min_confidence || confidence > max_confidence {
            Err(ContractError::OracleError)
        } else {
            Ok(())
        }
    }
    
    /// Validate market condition
    pub fn validate_market_condition(condition: u32) -> Result<(), ContractError> {
        match condition {
            0 | 1 => Ok(()), // 0: Above, 1: Below
            _ => Err(ContractError::InvalidOutcome),
        }
    }
    
    /// Validate price is positive and reasonable
    pub fn validate_price(price: i128, min_price: i128, max_price: i128) -> Result<(), ContractError> {
        if price <= 0 {
            return Err(ContractError::InvalidAmount);
        }
        
        if price < min_price || price > max_price {
            return Err(ContractError::InvalidAmount);
        }
        
        Ok(())
    }
    
    /// Validate fee rate is within acceptable bounds
    pub fn validate_fee_rate(fee_rate: u32, max_fee_rate: u32) -> Result<(), ContractError> {
        if fee_rate > max_fee_rate {
            Err(ContractError::InvalidAmount)
        } else {
            Ok(())
        }
    }
    
    /// Comprehensive market validation
    pub fn validate_market_creation(
        env: &Env,
        creator: &Address,
        description: &String,
        asset_symbol: &String,
        target_price: i128,
        condition: u32,
        resolve_time: u64,
        min_bet_amount: i128,
        max_bet_amount: i128,
    ) -> Result<(), ContractError> {
        // Validate creator address
        validate_address(env, creator)?;
        
        // Validate strings
        validate_string(env, description, 500)?;
        validate_string(env, asset_symbol, 20)?;
        
        // Validate prices
        validate_price(target_price, 1, 1_000_000_000_000_000_000)?; // Max $1M
        validate_price(min_bet_amount, 1, max_bet_amount)?;
        validate_price(max_bet_amount, min_bet_amount, 100_000_000_000_000_000)?; // Max 100K tokens
        
        // Validate condition
        validate_market_condition(condition)?;
        
        // Validate resolve time
        validate_future_timestamp(env, resolve_time)?;
        
        Ok(())
    }
    
    /// Comprehensive staking validation
    pub fn validate_staking(
        env: &Env,
        staker: &Address,
        amount: i128,
        min_stake_amount: i128,
        max_stake_amount: Option<i128>,
    ) -> Result<(), ContractError> {
        // Validate staker address
        validate_address(env, staker)?;
        
        // Validate amount
        validate_amount(amount, min_stake_amount, max_stake_amount)?;
        
        Ok(())
    }
    
    /// Comprehensive oracle validation
    pub fn validate_oracle_update(
        env: &Env,
        oracle_node: &Address,
        asset_name: &String,
        price: i128,
        confidence: u32,
        source: &String,
    ) -> Result<(), ContractError> {
        // Validate oracle node address
        validate_address(env, oracle_node)?;
        
        // Validate strings
        validate_string(env, asset_name, 20)?;
        validate_string(env, source, 100)?;
        
        // Validate price
        validate_price(price, 1, 1_000_000_000_000_000_000)?;
        
        // Validate confidence
        validate_confidence(confidence, 50, 100)?;
        
        Ok(())
    }
}


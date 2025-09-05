#![no_std]

use soroban_sdk::{contracttype, Address, String, Vec};

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


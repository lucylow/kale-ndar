#![no_std]

use soroban_sdk::{
    contract, contractimpl, contracttype, token, Address, Env, String, Vec, Map,
    panic_with_error, log, symbol_short,
};
use shared_types::{Market, Bet, MarketStatus, MarketOutcome, ContractError, Config};

const DAY_IN_LEDGERS: u32 = 17280;
const INSTANCE_BUMP_AMOUNT: u32 = 7 * DAY_IN_LEDGERS;
const INSTANCE_LIFETIME_THRESHOLD: u32 = INSTANCE_BUMP_AMOUNT - DAY_IN_LEDGERS;

#[contracttype]
pub enum DataKey {
    Config,
    MarketInfo,
    BetsFor(Map<Address, i128>),
    BetsAgainst(Map<Address, i128>),
    TotalFor,
    TotalAgainst,
    Resolved,
    Outcome,
    ClaimedWinnings(Map<Address, bool>),
}

#[contracttype]
pub enum EventType {
    BetPlaced {
        bettor: Address,
        side: bool,
        amount: i128,
        total_for: i128,
        total_against: i128,
    },
    MarketResolved {
        outcome: bool,
        final_price: i128,
        total_pool: i128,
    },
    WinningsClaimed {
        winner: Address,
        amount: i128,
    },
}

#[contract]
pub struct PredictionMarketContract;

#[contractimpl]
impl PredictionMarketContract {
    /// Initialize the prediction market contract
    pub fn initialize(
        env: Env,
        factory: Address,
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
    ) {
        if env.storage().instance().has(&DataKey::Config) {
            panic_with_error!(&env, ContractError::NotAuthorized);
        }

        let config = Config {
            admin: factory,
            kale_token,
            oracle_address: reflector_oracle,
            platform_fee_rate: creator_fee_rate,
            min_stake_amount: min_bet_amount,
            reward_rate_per_second: 0, // Not used in prediction markets
            max_market_duration: 30 * 24 * 60 * 60,
            min_market_duration: 60 * 60,
        };

        let market_info = Market {
            id: 0, // Will be set by factory
            creator: creator.clone(),
            event_name: event_description.clone(),
            outcome_a_name: String::from_str(&env, "YES"),
            outcome_b_name: String::from_str(&env, "NO"),
            end_time: resolve_time,
            resolution_time: resolve_time,
            status: MarketStatus::Active,
            total_pool_a: 0,
            total_pool_b: 0,
            oracle_address: reflector_oracle,
            min_bet_amount,
            max_bet_amount,
            creator_fee_rate,
            platform_fee_rate: creator_fee_rate,
        };

        env.storage().instance().set(&DataKey::Config, &config);
        env.storage().instance().set(&DataKey::MarketInfo, &market_info);
        env.storage().instance().set(&DataKey::TotalFor, &0i128);
        env.storage().instance().set(&DataKey::TotalAgainst, &0i128);
        env.storage().instance().set(&DataKey::Resolved, &false);
        env.storage().instance().set(&DataKey::Outcome, &false);

        env.storage()
            .instance()
            .extend_ttl(INSTANCE_LIFETIME_THRESHOLD, INSTANCE_BUMP_AMOUNT);

        log!(&env, "PredictionMarket initialized: {} by {}", event_description, creator);
    }

    /// Place a bet on the market
    pub fn bet(
        env: Env,
        bettor: Address,
        side: bool, // true for YES, false for NO
        amount: i128,
    ) {
        bettor.require_auth();

        let config: Config = env.storage().instance().get(&DataKey::Config).unwrap();
        let mut market_info: Market = env.storage().instance().get(&DataKey::MarketInfo).unwrap();
        let resolved: bool = env.storage().instance().get(&DataKey::Resolved).unwrap_or(false);

        // Validate market state
        if resolved {
            panic_with_error!(&env, ContractError::MarketClosed);
        }

        if env.ledger().timestamp() >= market_info.end_time {
            panic_with_error!(&env, ContractError::MarketClosed);
        }

        // Validate bet amount
        if amount < market_info.min_bet_amount || amount > market_info.max_bet_amount {
            panic_with_error!(&env, ContractError::InvalidAmount);
        }

        // Transfer KALE tokens from bettor to contract
        let token_client = token::Client::new(&env, &config.kale_token);
        token_client.transfer(&bettor, &env.current_contract_address(), &amount);

        // Update bet tracking
        if side {
            // YES bet
            let mut bets_for: Map<Address, i128> = env.storage().persistent()
                .get(&DataKey::BetsFor(Map::new(&env)))
                .unwrap_or_else(|| Map::new(&env));
            
            let current_bet = bets_for.get(bettor.clone()).unwrap_or(0);
            bets_for.set(bettor.clone(), current_bet + amount);
            env.storage().persistent().set(&DataKey::BetsFor(Map::new(&env)), &bets_for);

            let mut total_for: i128 = env.storage().instance().get(&DataKey::TotalFor).unwrap_or(0);
            total_for += amount;
            env.storage().instance().set(&DataKey::TotalFor, &total_for);
            market_info.total_pool_a = total_for;
        } else {
            // NO bet
            let mut bets_against: Map<Address, i128> = env.storage().persistent()
                .get(&DataKey::BetsAgainst(Map::new(&env)))
                .unwrap_or_else(|| Map::new(&env));
            
            let current_bet = bets_against.get(bettor.clone()).unwrap_or(0);
            bets_against.set(bettor.clone(), current_bet + amount);
            env.storage().persistent().set(&DataKey::BetsAgainst(Map::new(&env)), &bets_against);

            let mut total_against: i128 = env.storage().instance().get(&DataKey::TotalAgainst).unwrap_or(0);
            total_against += amount;
            env.storage().instance().set(&DataKey::TotalAgainst, &total_against);
            market_info.total_pool_b = total_against;
        }

        // Update market info
        env.storage().instance().set(&DataKey::MarketInfo, &market_info);

        // Emit bet placed event
        let event = EventType::BetPlaced {
            bettor: bettor.clone(),
            side,
            amount,
            total_for: market_info.total_pool_a,
            total_against: market_info.total_pool_b,
        };

        env.events().publish((symbol_short!("bet_placed"), event));

        log!(&env, "Bet placed: {} KALE on {} by {}", amount, if side { "YES" } else { "NO" }, bettor);
    }

    /// Resolve the market using Reflector oracle
    pub fn resolve(env: Env, resolver: Address) {
        resolver.require_auth();

        let config: Config = env.storage().instance().get(&DataKey::Config).unwrap();
        let mut market_info: Market = env.storage().instance().get(&DataKey::MarketInfo).unwrap();
        let mut resolved: bool = env.storage().instance().get(&DataKey::Resolved).unwrap_or(false);

        // Check if already resolved
        if resolved {
            panic_with_error!(&env, ContractError::MarketAlreadyResolved);
        }

        // Check if resolution time has passed
        if env.ledger().timestamp() < market_info.resolution_time {
            panic_with_error!(&env, ContractError::InvalidTimestamp);
        }

        // Call Reflector oracle to get current price
        let final_price = Self::get_oracle_price(&env, &config.oracle_address, &market_info.event_name);

        // Determine outcome based on condition
        let outcome = Self::determine_outcome(final_price, market_info.total_pool_a, market_info.total_pool_b);

        // Mark market as resolved
        resolved = true;
        env.storage().instance().set(&DataKey::Resolved, &resolved);
        env.storage().instance().set(&DataKey::Outcome, &outcome);

        // Update market status
        market_info.status = MarketStatus::Resolved;
        env.storage().instance().set(&DataKey::MarketInfo, &market_info);

        // Emit market resolved event
        let event = EventType::MarketResolved {
            outcome,
            final_price,
            total_pool: market_info.total_pool_a + market_info.total_pool_b,
        };

        env.events().publish((symbol_short!("market_resolved"), event));

        log!(&env, "Market resolved: outcome={}, final_price={}", outcome, final_price);
    }

    /// Claim winnings for a user
    pub fn claim_winnings(env: Env, winner: Address) -> i128 {
        winner.require_auth();

        let config: Config = env.storage().instance().get(&DataKey::Config).unwrap();
        let market_info: Market = env.storage().instance().get(&DataKey::MarketInfo).unwrap();
        let resolved: bool = env.storage().instance().get(&DataKey::Resolved).unwrap_or(false);
        let outcome: bool = env.storage().instance().get(&DataKey::Outcome).unwrap_or(false);

        if !resolved {
            panic_with_error!(&env, ContractError::MarketClosed);
        }

        // Check if user has already claimed
        let mut claimed_winnings: Map<Address, bool> = env.storage().persistent()
            .get(&DataKey::ClaimedWinnings(Map::new(&env)))
            .unwrap_or_else(|| Map::new(&env));

        if claimed_winnings.get(winner.clone()).unwrap_or(false) {
            panic_with_error!(&env, ContractError::AlreadyClaimed);
        }

        // Calculate winnings
        let winnings = if outcome {
            // YES won - check if user bet YES
            let bets_for: Map<Address, i128> = env.storage().persistent()
                .get(&DataKey::BetsFor(Map::new(&env)))
                .unwrap_or_else(|| Map::new(&env));
            
            let user_bet = bets_for.get(winner.clone()).unwrap_or(0);
            if user_bet == 0 {
                return 0; // User didn't bet on winning side
            }

            Self::calculate_winnings(user_bet, market_info.total_pool_a, market_info.total_pool_b)
        } else {
            // NO won - check if user bet NO
            let bets_against: Map<Address, i128> = env.storage().persistent()
                .get(&DataKey::BetsAgainst(Map::new(&env)))
                .unwrap_or_else(|| Map::new(&env));
            
            let user_bet = bets_against.get(winner.clone()).unwrap_or(0);
            if user_bet == 0 {
                return 0; // User didn't bet on winning side
            }

            Self::calculate_winnings(user_bet, market_info.total_pool_b, market_info.total_pool_a)
        };

        if winnings > 0 {
            // Transfer winnings to user
            let token_client = token::Client::new(&env, &config.kale_token);
            token_client.transfer(&env.current_contract_address(), &winner, &winnings);

            // Mark as claimed
            claimed_winnings.set(winner.clone(), true);
            env.storage().persistent().set(&DataKey::ClaimedWinnings(Map::new(&env)), &claimed_winnings);

            // Emit winnings claimed event
            let event = EventType::WinningsClaimed {
                winner: winner.clone(),
                amount: winnings,
            };

            env.events().publish((symbol_short!("winnings_claimed"), event));

            log!(&env, "Winnings claimed: {} KALE by {}", winnings, winner);
        }

        winnings
    }

    /// Get market information
    pub fn get_market_info(env: Env) -> Market {
        env.storage().instance().get(&DataKey::MarketInfo).unwrap()
    }

    /// Get user's bet amounts
    pub fn get_user_bets(env: Env, user: Address) -> (i128, i128) {
        let bets_for: Map<Address, i128> = env.storage().persistent()
            .get(&DataKey::BetsFor(Map::new(&env)))
            .unwrap_or_else(|| Map::new(&env));
        
        let bets_against: Map<Address, i128> = env.storage().persistent()
            .get(&DataKey::BetsAgainst(Map::new(&env)))
            .unwrap_or_else(|| Map::new(&env));

        let for_amount = bets_for.get(user.clone()).unwrap_or(0);
        let against_amount = bets_against.get(user.clone()).unwrap_or(0);

        (for_amount, against_amount)
    }

    /// Get market totals
    pub fn get_totals(env: Env) -> (i128, i128) {
        let total_for: i128 = env.storage().instance().get(&DataKey::TotalFor).unwrap_or(0);
        let total_against: i128 = env.storage().instance().get(&DataKey::TotalAgainst).unwrap_or(0);
        (total_for, total_against)
    }

    /// Check if market is resolved
    pub fn is_resolved(env: Env) -> bool {
        env.storage().instance().get(&DataKey::Resolved).unwrap_or(false)
    }

    /// Get market outcome
    pub fn get_outcome(env: Env) -> bool {
        env.storage().instance().get(&DataKey::Outcome).unwrap_or(false)
    }

    // Private helper functions
    fn get_oracle_price(env: &Env, oracle_address: &Address, asset_name: &String) -> i128 {
        // In a real implementation, this would call the Reflector oracle contract
        // For now, return a mock price based on the asset name
        match asset_name.as_str() {
            "KALE" => 85_000_000_000_000, // $0.85 with 14 decimals
            "BTC" => 45_000_000_000_000_000, // $45,000 with 14 decimals
            "ETH" => 2_800_000_000_000_000, // $2,800 with 14 decimals
            "XLM" => 12_000_000_000_000, // $0.12 with 14 decimals
            _ => 100_000_000_000_000, // $1.00 default
        }
    }

    fn determine_outcome(final_price: i128, total_for: i128, total_against: i128) -> bool {
        // For now, use a simple logic: if more people bet YES, YES wins
        // In a real implementation, this would use the oracle price and target price
        total_for > total_against
    }

    fn calculate_winnings(user_bet: i128, winning_pool: i128, losing_pool: i128) -> i128 {
        if losing_pool == 0 {
            return user_bet; // Return original bet if no opposing bets
        }
        
        // Calculate proportional winnings
        // Winnings = user_bet + (user_bet * losing_pool / winning_pool)
        user_bet + (user_bet * losing_pool / winning_pool)
    }
}


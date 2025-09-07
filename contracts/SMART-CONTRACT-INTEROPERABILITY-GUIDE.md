# Smart Contract Interoperability Guide

## Overview

This guide documents the enhanced interoperability layer between the three core smart contracts in the KALE-ndar ecosystem:

1. **Prediction Market Contract** - Handles market creation, betting, and resolution
2. **KALE Integration Contract** - Manages staking, rewards, and market creation fees
3. **Reflector Oracle Contract** - Provides price feeds and event data

## Architecture

### Contract Communication Flow

```
┌─────────────────────┐    ┌─────────────────────┐    ┌─────────────────────┐
│   Prediction Market │    │  KALE Integration   │    │ Reflector Oracle    │
│      Contract       │    │      Contract       │    │      Contract       │
├─────────────────────┤    ├─────────────────────┤    ├─────────────────────┤
│ • Market Creation   │◄──►│ • Staking Info      │    │ • Price Feeds       │
│ • Betting Logic     │    │ • Reward Claims     │    │ • Event Data        │
│ • Resolution        │◄──►│ • Market Fees       │◄──►│ • Validation        │
│ • Oracle Calls      │    │ • Oracle Validation │    │ • Subscriptions     │
└─────────────────────┘    └─────────────────────┘    └─────────────────────┘
```

## Enhanced Shared Types

### ContractCallResult<T>
```rust
pub struct ContractCallResult<T> {
    pub success: bool,
    pub data: Option<T>,
    pub error: Option<String>,
}
```

### MarketResolutionData
```rust
pub struct MarketResolutionData {
    pub market_id: BytesN<32>,
    pub final_price: i128,
    pub target_price: i128,
    pub condition: u32, // 0: Above, 1: Below
    pub outcome: bool,
    pub confidence: u32,
    pub timestamp: u64,
}
```

### StakingPosition
```rust
pub struct StakingPosition {
    pub staker: Address,
    pub amount: i128,
    pub apy: u32,
    pub pending_rewards: i128,
    pub last_update: u64,
}
```

## Cross-Contract Functions

### 1. Prediction Market → Reflector Oracle

#### `get_oracle_price_safe`
```rust
pub fn get_oracle_price_safe(
    env: Env, 
    oracle_address: Address, 
    asset_name: String
) -> ContractCallResult<i128>
```

**Usage:**
- Safely retrieves price data from oracle
- Returns structured result with error handling
- Used during market resolution

#### `resolve_with_oracle`
```rust
pub fn resolve_with_oracle(
    env: Env, 
    resolver: Address, 
    oracle_address: Address
) -> ContractCallResult<MarketResolutionData>
```

**Usage:**
- Enhanced market resolution with oracle integration
- Validates oracle data before resolution
- Returns comprehensive resolution data

### 2. Prediction Market → KALE Integration

#### `get_staking_position_safe`
```rust
pub fn get_staking_position_safe(
    env: Env, 
    kale_address: Address, 
    staker: Address
) -> ContractCallResult<StakingPosition>
```

**Usage:**
- Retrieves comprehensive staking information
- Includes APY and pending rewards
- Used for staking-based market creation

### 3. KALE Integration → Reflector Oracle

#### `get_kale_price_from_oracle`
```rust
pub fn get_kale_price_from_oracle(
    env: Env, 
    oracle_address: Address
) -> ContractCallResult<i128>
```

**Usage:**
- Gets current KALE token price
- Used for price validation during staking
- Enables price-based staking thresholds

#### `stake_with_price_validation`
```rust
pub fn stake_with_price_validation(
    env: Env,
    staker: Address,
    amount: i128,
    oracle_address: Address,
    min_price_threshold: i128,
) -> ContractCallResult<i128>
```

**Usage:**
- Enhanced staking with price validation
- Prevents staking below price thresholds
- Integrates oracle data for risk management

#### `create_market_with_oracle_validation`
```rust
pub fn create_market_with_oracle_validation(
    env: Env,
    creator: Address,
    description: String,
    asset_symbol: String,
    target_price: i128,
    condition: u32,
    resolve_time: u64,
    market_fee: i128,
    oracle_address: Address,
) -> ContractCallResult<BytesN<32>>
```

**Usage:**
- Market creation with oracle validation
- Ensures oracle can provide price for asset
- Prevents creation of unresolvable markets

### 4. Reflector Oracle Enhanced Functions

#### `subscribe_with_threshold`
```rust
pub fn subscribe_with_threshold(
    env: Env,
    subscriber: Address,
    asset_name: String,
    threshold: i128,
    condition: u32,
) -> ContractCallResult<OracleSubscription>
```

**Usage:**
- Enhanced price subscriptions
- Threshold-based notifications
- Used for automated market triggers

#### `batch_update_prices`
```rust
pub fn batch_update_prices(
    env: Env,
    oracle_node: Address,
    assets: Vec<String>,
    prices: Vec<i128>,
    confidences: Vec<u32>,
    source: String,
) -> ContractCallResult<Vec<String>>
```

**Usage:**
- Efficient batch price updates
- Reduces transaction costs
- Maintains data consistency

#### `validate_market_resolution`
```rust
pub fn validate_market_resolution(
    env: Env,
    asset_name: String,
    target_price: i128,
    condition: u32,
    required_confidence: u32,
) -> ContractCallResult<bool>
```

**Usage:**
- Validates market resolution conditions
- Ensures sufficient confidence levels
- Prevents premature resolutions

## Error Handling

### InteropError Enum
```rust
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
```

### Error Handling Patterns

1. **Graceful Degradation**: Contracts fall back to mock data when oracle calls fail
2. **Structured Results**: All cross-contract calls return `ContractCallResult<T>`
3. **Validation Layers**: Multiple validation steps prevent invalid operations
4. **Timeout Protection**: Oracle calls have built-in timeout mechanisms

## Client Libraries

### ReflectorOracleClient
```rust
impl ReflectorOracleClient {
    pub fn get_price(env: &Env, oracle_address: &Address, asset_name: String) -> PriceFeed;
    pub fn try_get_price(env: &Env, oracle_address: &Address, asset_name: String) -> Result<PriceFeed, ContractError>;
    pub fn is_price_available(env: &Env, oracle_address: &Address, asset_name: String) -> bool;
}
```

### KaleIntegrationClient
```rust
impl KaleIntegrationClient {
    pub fn get_stake_info(env: &Env, kale_address: &Address, staker: Address) -> StakeInfo;
    pub fn get_total_staked(env: &Env, kale_address: &Address) -> i128;
    pub fn get_current_apy(env: &Env, kale_address: &Address) -> u32;
    pub fn stake(env: &Env, kale_address: &Address, staker: Address, amount: i128);
}
```

## Best Practices

### 1. Always Use Safe Cross-Contract Calls
```rust
// Good
let result = Self::get_oracle_price_safe(env.clone(), oracle_address, asset_name);
if result.success {
    let price = result.data.unwrap();
    // Use price
} else {
    // Handle error
}

// Avoid
let price = oracle_client.get_price(&asset_name); // Can panic
```

### 2. Validate Data Before Use
```rust
// Check oracle availability before market creation
if !oracle_client.is_price_available(&env, &oracle_address, asset_symbol.clone()) {
    return ContractCallResult {
        success: false,
        data: None,
        error: Some("Oracle cannot provide price for asset".to_string()),
    };
}
```

### 3. Implement Fallback Mechanisms
```rust
// Fallback to mock data if oracle fails
let price = match Self::get_oracle_price_safe(env.clone(), oracle_address.clone(), asset_name.clone()) {
    ContractCallResult { success: true, data: Some(price), .. } => price,
    _ => {
        // Use fallback price
        match asset_name.as_str() {
            "KALE" => 85_000_000_000_000,
            _ => 100_000_000_000_000,
        }
    }
};
```

### 4. Use Batch Operations When Possible
```rust
// Efficient batch price updates
let assets = vec![String::from_str(&env, "KALE"), String::from_str(&env, "BTC")];
let prices = vec![85_000_000_000_000, 45_000_000_000_000_000];
let confidences = vec![95, 98];

oracle_client.batch_update_prices(
    env.clone(),
    oracle_node,
    assets,
    prices,
    confidences,
    String::from_str(&env, "CEX"),
);
```

## Testing Interoperability

### Unit Tests
```rust
#[cfg(test)]
mod tests {
    use super::*;
    
    #[test]
    fn test_oracle_price_fetch() {
        let env = Env::default();
        let oracle_address = Address::generate(&env);
        
        let result = PredictionMarketContract::get_oracle_price_safe(
            env.clone(),
            oracle_address,
            String::from_str(&env, "KALE"),
        );
        
        assert!(result.success || result.error.is_some());
    }
}
```

### Integration Tests
```rust
#[test]
fn test_market_creation_with_oracle_validation() {
    let env = Env::default();
    let creator = Address::generate(&env);
    let oracle_address = Address::generate(&env);
    
    // Setup oracle with KALE price
    // ...
    
    let result = KaleIntegrationContract::create_market_with_oracle_validation(
        env.clone(),
        creator,
        String::from_str(&env, "Will KALE reach $1?"),
        String::from_str(&env, "KALE"),
        100_000_000_000_000, // $1.00
        0, // Above condition
        1735689600, // Future timestamp
        1000, // Market fee
        oracle_address,
    );
    
    assert!(result.success);
    assert!(result.data.is_some());
}
```

## Security Considerations

1. **Access Control**: All cross-contract calls validate caller permissions
2. **Data Validation**: Input validation prevents malicious data injection
3. **Oracle Reliability**: Multiple validation layers ensure oracle data integrity
4. **Fallback Mechanisms**: Graceful degradation prevents system failures
5. **Rate Limiting**: Built-in protections against oracle spam

## Performance Optimizations

1. **Batch Operations**: Reduce transaction costs with batch updates
2. **Caching**: Store frequently accessed data locally
3. **Lazy Loading**: Load data only when needed
4. **Gas Optimization**: Minimize cross-contract call overhead

This interoperability layer ensures robust, secure, and efficient communication between all smart contracts in the KALE-ndar ecosystem.

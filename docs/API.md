# Kale-ndar API Documentation

## Base URL
```
http://localhost:5000/api
```

## Authentication
Currently, the API does not require authentication. In production, implement proper authentication mechanisms.

## Response Format
All API responses follow this format:
```json
{
  "data": {},
  "error": null,
  "timestamp": "2024-01-01T00:00:00Z"
}
```

## Markets API

### Get All Markets
```http
GET /api/markets
```

**Query Parameters:**
- `page` (integer, optional): Page number (default: 1)
- `per_page` (integer, optional): Items per page (default: 20, max: 100)
- `status` (string, optional): Filter by status (`active`, `closed`, `resolved`, `cancelled`)
- `creator` (string, optional): Filter by creator address

**Response:**
```json
{
  "markets": [
    {
      "id": 1,
      "contract_market_id": 1,
      "creator_address": "GXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
      "event_name": "Bitcoin price above $50,000 by end of 2024",
      "outcome_a_name": "Yes",
      "outcome_b_name": "No",
      "end_time": "2024-12-31T23:59:59Z",
      "resolution_time": "2025-01-01T12:00:00Z",
      "status": "active",
      "total_pool_a": "1000000000",
      "total_pool_b": "800000000",
      "total_pool": "1800000000",
      "min_bet_amount": "1000000",
      "max_bet_amount": "100000000000",
      "creator_fee_rate": 100,
      "platform_fee_rate": 100,
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-01T00:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "per_page": 20,
    "total": 50,
    "pages": 3,
    "has_next": true,
    "has_prev": false
  }
}
```

### Get Market by ID
```http
GET /api/markets/{id}
```

**Response:**
```json
{
  "id": 1,
  "contract_market_id": 1,
  "creator_address": "GXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  "event_name": "Bitcoin price above $50,000 by end of 2024",
  "outcome_a_name": "Yes",
  "outcome_b_name": "No",
  "end_time": "2024-12-31T23:59:59Z",
  "resolution_time": "2025-01-01T12:00:00Z",
  "status": "active",
  "total_pool_a": "1000000000",
  "total_pool_b": "800000000",
  "total_pool": "1800000000",
  "min_bet_amount": "1000000",
  "max_bet_amount": "100000000000",
  "creator_fee_rate": 100,
  "platform_fee_rate": 100,
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-01T00:00:00Z",
  "bets": [
    {
      "id": 1,
      "contract_bet_id": 1,
      "market_id": 1,
      "contract_market_id": 1,
      "bettor_address": "GXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
      "outcome": "outcome_a",
      "amount": "10000000",
      "odds_at_bet": 12000,
      "claimed": false,
      "transaction_hash": "abc123...",
      "created_at": "2024-01-01T01:00:00Z"
    }
  ],
  "bet_count": 1
}
```

### Create Market
```http
POST /api/markets
```

**Request Body:**
```json
{
  "contract_market_id": 1,
  "creator_address": "GXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  "event_name": "Bitcoin price above $50,000 by end of 2024",
  "outcome_a_name": "Yes",
  "outcome_b_name": "No",
  "end_time": "2024-12-31T23:59:59Z",
  "resolution_time": "2025-01-01T12:00:00Z",
  "min_bet_amount": "1000000",
  "max_bet_amount": "100000000000",
  "creator_fee_rate": 100,
  "platform_fee_rate": 100
}
```

### Place Bet
```http
POST /api/bets
```

**Request Body:**
```json
{
  "contract_bet_id": 1,
  "market_id": 1,
  "contract_market_id": 1,
  "bettor_address": "GXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  "outcome": "outcome_a",
  "amount": "10000000",
  "odds_at_bet": 12000,
  "transaction_hash": "abc123..."
}
```

### Get User Bets
```http
GET /api/users/{address}/bets
```

**Query Parameters:**
- `page` (integer, optional): Page number
- `per_page` (integer, optional): Items per page

## Staking API

### Get Stake Info
```http
GET /api/staking/stakes/{address}
```

**Response:**
```json
{
  "id": 1,
  "staker_address": "GXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  "amount": "100000000000",
  "stake_time": "2024-01-01T00:00:00Z",
  "last_reward_time": "2024-01-01T12:00:00Z",
  "accumulated_rewards": "1000000000",
  "total_claimed_rewards": "5000000000",
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-01T12:00:00Z"
}
```

### Create/Update Stake
```http
POST /api/staking/stakes
```

**Request Body:**
```json
{
  "staker_address": "GXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  "amount": "100000000000",
  "accumulated_rewards": "1000000000"
}
```

### Claim Rewards
```http
POST /api/staking/stakes/{address}/claim
```

**Request Body:**
```json
{
  "claimed_amount": "1000000000"
}
```

### Get Staking Statistics
```http
GET /api/staking/stats
```

**Response:**
```json
{
  "total_stakers": 150,
  "total_staked": "50000000000000",
  "total_rewards_distributed": "2000000000000",
  "pending_rewards": "500000000000",
  "average_stake": "333333333333",
  "top_stakers": [
    {
      "address": "GXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
      "amount": "5000000000000",
      "percentage": 10.0
    }
  ]
}
```

### Get Current APY
```http
GET /api/staking/apy
```

**Response:**
```json
{
  "current_apy": 1200,
  "current_apy_percentage": 12.0,
  "total_staked": "50000000000000",
  "last_updated": "2024-01-01T12:00:00Z"
}
```

## Oracle API

### Get All Prices
```http
GET /api/oracle/prices
```

**Query Parameters:**
- `max_age_hours` (integer, optional): Maximum age of prices in hours (default: 24)

**Response:**
```json
{
  "prices": [
    {
      "id": 1,
      "asset_name": "BTC",
      "price": "5000000000000",
      "confidence": 95,
      "source": "coinbase",
      "timestamp": "2024-01-01T12:00:00Z",
      "created_at": "2024-01-01T12:00:00Z"
    }
  ],
  "count": 1,
  "max_age_hours": 24
}
```

### Get Asset Price
```http
GET /api/oracle/prices/{asset_name}
```

**Query Parameters:**
- `max_age_hours` (integer, optional): Maximum acceptable age in hours

**Response:**
```json
{
  "id": 1,
  "asset_name": "BTC",
  "price": "5000000000000",
  "confidence": 95,
  "source": "coinbase",
  "timestamp": "2024-01-01T12:00:00Z",
  "created_at": "2024-01-01T12:00:00Z",
  "is_stale": false,
  "age_hours": 0.5
}
```

### Update Price Feed
```http
POST /api/oracle/prices
```

**Request Body:**
```json
{
  "asset_name": "BTC",
  "price": "5000000000000",
  "confidence": 95,
  "source": "coinbase",
  "timestamp": "2024-01-01T12:00:00Z"
}
```

### Get Oracle Health
```http
GET /api/oracle/health
```

**Response:**
```json
{
  "status": "healthy",
  "health_score": 95,
  "total_feeds": 10,
  "fresh_feeds": 9,
  "stale_feeds": 1,
  "low_confidence_feeds": 0,
  "last_updated": "2024-01-01T12:00:00Z"
}
```

### Submit Event Data
```http
POST /api/oracle/events
```

**Request Body:**
```json
{
  "event_id": "btc-price-2024-12-31",
  "outcome": "outcome_a",
  "confidence": 95,
  "data_source": "coinbase"
}
```

## Error Codes

| Code | Description |
|------|-------------|
| 400 | Bad Request - Invalid input parameters |
| 404 | Not Found - Resource not found |
| 500 | Internal Server Error - Server error |

## Rate Limiting

Currently no rate limiting is implemented. In production, implement appropriate rate limiting based on your requirements.

## Data Types

### Market Status
- `active`: Market is open for betting
- `closed`: Market is closed, awaiting resolution
- `resolved`: Market has been resolved
- `cancelled`: Market has been cancelled

### Market Outcome
- `outcome_a`: First outcome option
- `outcome_b`: Second outcome option
- `draw`: Draw/tie outcome
- `invalid`: Invalid outcome

### Amount Format
All amounts are represented as strings in the smallest unit (e.g., stroops for XLM, with 7 decimal places).

Example: "10000000" = 1.0000000 tokens


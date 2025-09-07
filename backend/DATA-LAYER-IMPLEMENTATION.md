# KALE-ndar Data Layer Implementation

## Overview

This document describes the comprehensive data layer implementation for KALE-ndar, integrating TimescaleDB, Redis Cluster, IPFS Cluster, and MongoDB Atlas to provide a robust, scalable, and decentralized data storage solution.

## Architecture

The data layer follows a multi-database architecture pattern, where each database is optimized for specific data types and use cases:

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   TimescaleDB   │    │  Redis Cluster  │    │  IPFS Cluster   │    │  MongoDB Atlas  │
│                 │    │                 │    │                 │    │                 │
│ • Time-series   │    │ • Caching       │    │ • File Storage  │    │ • Documents     │
│ • Farming Events│    │ • Leaderboards  │    │ • Proofs       │    │ • User Profiles │
│ • Market Data   │    │ • Sessions      │    │ • Logs         │    │ • Metadata      │
│ • Block Data    │    │ • Ephemeral     │    │ • Off-chain    │    │ • Configs       │
└─────────────────┘    └─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │                       │
         └───────────────────────┼───────────────────────┼───────────────────────┘
                                 │                       │
                    ┌─────────────────────────────────────┴─────────────────────────────┐
                    │                    Data Layer Service                              │
                    │                                                                   │
                    │  • Service Orchestration                                          │
                    │  • Transaction Management                                          │
                    │  • Health Monitoring                                               │
                    │  • Error Handling                                                  │
                    └───────────────────────────────────────────────────────────────────┘
```

## Components

### 1. TimescaleDB Service (`timescaledb.service.ts`)

**Purpose**: Time-series data storage and analytics

**Key Features**:
- Hypertable creation for efficient time-series queries
- Farming events storage with timestamps
- Market data tracking (prices, volumes, liquidity)
- Block data storage for blockchain information
- Aggregated statistics and analytics

**Data Types**:
- `farming_events`: Farmer activities, stakes, rewards
- `market_data`: Price points, volumes, participant counts
- `block_data`: Blockchain block information

**Example Usage**:
```typescript
const farmingEvent = {
  eventTime: new Date(),
  farmer: 'GAFARMER123...',
  stakedAmount: '1000000000',
  workHash: '0xworkhash...',
  reward: '50000000',
  blockNumber: 12345,
  transactionHash: '0xtxhash...',
};

await dataLayer.storeFarmingEvent(farmingEvent);
```

### 2. Redis Cluster Service (`redis-cluster.service.ts`)

**Purpose**: High-performance caching and ephemeral data storage

**Key Features**:
- Distributed caching with cluster support
- Sorted sets for leaderboards
- Session management
- TTL support for automatic expiration
- Batch operations for efficiency

**Data Types**:
- Leaderboards: Real-time rankings
- Market data cache: Fast access to current market state
- Price data cache: Real-time price information
- User sessions: Authentication and session data

**Example Usage**:
```typescript
// Cache leaderboard
await dataLayer.cacheLeaderboard({
  name: 'top_farmers',
  entries: [
    { address: 'GAFARMER1', score: 1000, rank: 1 },
    { address: 'GAFARMER2', score: 800, rank: 2 },
  ],
  ttl: 300, // 5 minutes
});

// Update leaderboard score
await dataLayer.getRedisCluster().updateLeaderboardScore('farming_rewards', 'GAFARMER1', 1000);
```

### 3. IPFS Cluster Service (`ipfs-cluster.service.ts`)

**Purpose**: Decentralized file storage for off-chain data

**Key Features**:
- HTTP API integration with IPFS Cluster
- File pinning for persistence
- Content addressing for immutability
- Batch upload operations
- Proof and log storage

**Data Types**:
- Farming proofs: Off-chain proof data
- System logs: Application logs and events
- Market logs: Historical market data
- User documents: Off-chain user data

**Example Usage**:
```typescript
// Upload proof
const proofData = {
  farmer: 'GAFARMER1',
  blockNumber: 12345,
  proofData: {
    workHash: '0xproofhash...',
    nonce: 42,
    signature: '0xsig...',
  },
};

const result = await dataLayer.uploadProof(proofData);
console.log('IPFS CID:', result.cid);
```

### 4. MongoDB Service (`mongodb.service.ts`)

**Purpose**: Document-based storage for user data and metadata

**Key Features**:
- Flexible document schema
- Indexing for performance
- Aggregation pipelines
- Connection pooling
- User profile management

**Data Types**:
- User profiles: Account information and preferences
- Market metadata: Market configuration and details
- Bet metadata: Betting information and history
- System configuration: Application settings

**Example Usage**:
```typescript
// Update user profile
await dataLayer.updateUserProfile('GAFARMER1', {
  username: 'farmmaster',
  email: 'farmmaster@example.com',
  preferences: { notifications: true },
  metadata: { joinDate: new Date().toISOString() },
});

// Store market metadata
await dataLayer.storeMarketMetadata({
  market_id: 'market_123',
  creator_address: 'GCREATOR123...',
  description: 'Will KALE price reach $1 by end of month?',
  target_price: '1000000',
  resolve_time: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
});
```

### 5. Data Layer Service (`data-layer.service.ts`)

**Purpose**: Unified orchestration of all data stores

**Key Features**:
- Service coordination and management
- Cross-service transaction handling
- Health monitoring and status reporting
- Comprehensive error handling
- Performance optimization

**Integration Points**:
- Coordinates data storage across all services
- Ensures data consistency
- Provides unified API for all operations
- Monitors service health and connectivity

## Configuration

### Environment Variables

```bash
# TimescaleDB Configuration
TIMESCALEDB_USER=postgres
TIMESCALEDB_HOST=localhost
TIMESCALEDB_DATABASE=kale_timeseries
TIMESCALEDB_PASSWORD=password
TIMESCALEDB_PORT=5432

# Redis Cluster Configuration
REDIS_NODE1_HOST=localhost
REDIS_NODE1_PORT=7000
REDIS_NODE2_HOST=localhost
REDIS_NODE2_PORT=7001
REDIS_NODE3_HOST=localhost
REDIS_NODE3_PORT=7002
REDIS_PASSWORD=
REDIS_DB=0

# IPFS Cluster Configuration
IPFS_CLUSTER_API_URL=http://localhost:9094/api/v0
IPFS_GATEWAY_URL=http://localhost:8080/ipfs
IPFS_TIMEOUT=30000
IPFS_MAX_FILE_SIZE=104857600

# MongoDB Atlas Configuration
MONGODB_URI=mongodb://localhost:27017
MONGODB_DATABASE=kale_ndar
MONGODB_MAX_POOL_SIZE=10
MONGODB_MIN_POOL_SIZE=2
MONGODB_MAX_IDLE_TIME_MS=30000
MONGODB_SERVER_SELECTION_TIMEOUT_MS=5000
```

## Data Flow Examples

### Farming Event Storage

1. **TimescaleDB**: Store event with timestamp for time-series analysis
2. **IPFS**: Upload proof data for off-chain storage
3. **Redis**: Update leaderboard scores and cache proof CID
4. **MongoDB**: Update user statistics and metadata

```typescript
const result = await dataLayer.storeFarmingEvent({
  eventTime: new Date(),
  farmer: 'GAFARMER123...',
  stakedAmount: '1000000000',
  workHash: '0xworkhash...',
  reward: '50000000',
  blockNumber: 12345,
  transactionHash: '0xtxhash...',
});

// Result contains:
// - timescaleDB: Event stored in time-series database
// - ipfs: Proof uploaded to IPFS with CID
// - redis: Leaderboard updated
```

### Market Data Flow

1. **TimescaleDB**: Store price/volume data points over time
2. **MongoDB**: Store market metadata and configuration
3. **Redis**: Cache current market state for fast access
4. **IPFS**: Store market logs and historical data

```typescript
// Store market data point
await dataLayer.storeMarketData({
  timestamp: new Date(),
  market_id: 'market_123',
  price: '950000',
  volume: '5000000000',
  liquidity: '10000000000',
  participants: 25,
});

// Cache current state
await dataLayer.cacheMarketData('market_123', {
  currentPrice: '950000',
  volume24h: '5000000000',
  liquidity: '10000000000',
  participants: 25,
  lastUpdate: new Date().toISOString(),
}, 60); // 1 minute TTL
```

## API Integration

The data layer is integrated with the existing backend through API routes (`data-layer.ts`):

### Health Check
```bash
GET /api/data-layer/health
```

### Farming Events
```bash
POST /api/data-layer/farming-events
GET /api/data-layer/farming-stats/:farmer?
```

### Leaderboards
```bash
POST /api/data-layer/leaderboards
GET /api/data-layer/leaderboards/:name
```

### Proofs
```bash
POST /api/data-layer/proofs
```

### User Profiles
```bash
GET /api/data-layer/users/:address
PUT /api/data-layer/users/:address
```

### Market Data
```bash
POST /api/data-layer/markets/:marketId/cache
GET /api/data-layer/markets/:marketId/cache
```

### Price Data
```bash
POST /api/data-layer/prices/:symbol/cache
GET /api/data-layer/prices/:symbol/cache
```

## Performance Considerations

### TimescaleDB
- Hypertables for efficient time-series queries
- Proper indexing on time columns
- Connection pooling for concurrent access
- Query optimization for time-range operations

### Redis Cluster
- Sorted sets for leaderboards
- TTL for automatic cleanup
- Cluster distribution for scalability
- Batch operations for efficiency

### IPFS Cluster
- Content addressing for deduplication
- Pinning for persistence
- Batch operations for efficiency
- HTTP API for integration

### MongoDB
- Proper indexing strategy
- Connection pooling
- Aggregation pipelines for complex queries
- Document-based flexible schema

## Security

- Environment-based configuration
- Connection encryption where supported
- Input validation and sanitization
- Access control and authentication
- Secure secret management

## Monitoring and Health Checks

The data layer provides comprehensive monitoring:

```typescript
// Check overall health
const health = await dataLayer.getHealthStatus();

// Test individual connections
const connections = await dataLayer.testConnections();

// Setup periodic health checks
dataLayerIntegration.setupHealthChecks(30000); // Every 30 seconds
```

## Error Handling

All services include comprehensive error handling:

- Connection retry logic
- Graceful degradation
- Detailed logging
- Health status monitoring
- Fallback mechanisms

## Testing

Run the example to test all services:

```bash
# Install dependencies
npm install

# Run the data layer example
npm run dev
# Then run the data layer example
```

## Dependencies

- `pg`: PostgreSQL/TimescaleDB client
- `ioredis`: Redis cluster client
- `mongodb`: MongoDB client
- `axios`: HTTP client for IPFS
- `ipfs-http-client`: IPFS client library

## Future Enhancements

1. **Data Replication**: Implement cross-region data replication
2. **Backup Strategies**: Automated backup and recovery
3. **Performance Monitoring**: Advanced metrics and alerting
4. **Data Archiving**: Long-term data archiving strategies
5. **Query Optimization**: Advanced query optimization
6. **Security Enhancements**: Enhanced security features
7. **Scalability**: Horizontal scaling capabilities

## Conclusion

The KALE-ndar data layer provides a comprehensive, scalable, and robust data storage solution that integrates multiple specialized databases to handle different types of data efficiently. The architecture supports high-performance operations, decentralized storage, and comprehensive monitoring, making it suitable for production use in the KALE ecosystem.

The implementation follows best practices for each database type, provides comprehensive error handling, and includes extensive documentation and examples for easy integration and maintenance.


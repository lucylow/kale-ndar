# KALE-ndar Data Layer Services

This directory contains the comprehensive data layer services for KALE-ndar, integrating TimescaleDB, Redis Cluster, IPFS Cluster, and MongoDB Atlas.

## Architecture Overview

The data layer is designed with a multi-database architecture to handle different types of data efficiently:

- **TimescaleDB**: Time-series data (farming events, market data, block data)
- **Redis Cluster**: Caching, leaderboards, ephemeral data
- **IPFS Cluster**: Decentralized file storage (proofs, logs, off-chain data)
- **MongoDB Atlas**: Document storage (user profiles, metadata, configurations)

## Services

### 1. TimescaleDB Service (`timescaledb.service.ts`)

Handles time-series data storage and retrieval:

- **Farming Events**: Store and query farming activities with timestamps
- **Market Data**: Track market prices, volumes, and liquidity over time
- **Block Data**: Store blockchain block information
- **Statistics**: Aggregate farming statistics and analytics

**Key Features:**
- Hypertable creation for efficient time-series queries
- Automatic indexing for performance
- Connection pooling and error handling
- Query optimization for time-range operations

### 2. Redis Cluster Service (`redis-cluster.service.ts`)

Provides distributed caching and ephemeral data storage:

- **Leaderboards**: Real-time ranking systems
- **Session Management**: User session caching
- **Market Data Caching**: Fast access to frequently accessed data
- **Price Data Caching**: Real-time price information

**Key Features:**
- Cluster support for high availability
- Sorted sets for leaderboards
- TTL support for automatic expiration
- Batch operations for efficiency

### 3. IPFS Cluster Service (`ipfs-cluster.service.ts`)

Manages decentralized file storage:

- **Proof Storage**: Store farming proofs off-chain
- **Log Storage**: Archive system logs and events
- **File Management**: Upload, pin, and retrieve files
- **Content Addressing**: Immutable content addressing

**Key Features:**
- HTTP API integration
- File pinning for persistence
- Batch upload operations
- Content integrity verification

### 4. MongoDB Service (`mongodb.service.ts`)

Handles document-based data storage:

- **User Profiles**: User account information and preferences
- **Market Metadata**: Market configuration and details
- **Bet Metadata**: Betting information and history
- **System Configuration**: Application settings and configs

**Key Features:**
- Document-based storage
- Flexible schema design
- Indexing for performance
- Aggregation pipelines

### 5. Data Layer Service (`data-layer.service.ts`)

Unified service that orchestrates all data stores:

- **Service Coordination**: Manages all data layer services
- **Transaction Management**: Ensures data consistency across stores
- **Health Monitoring**: Monitors service health and connectivity
- **Error Handling**: Comprehensive error handling and recovery

## Configuration

### Environment Variables

```bash
# TimescaleDB
TIMESCALEDB_USER=postgres
TIMESCALEDB_HOST=localhost
TIMESCALEDB_DATABASE=kale_timeseries
TIMESCALEDB_PASSWORD=password
TIMESCALEDB_PORT=5432

# Redis Cluster
REDIS_NODE1_HOST=localhost
REDIS_NODE1_PORT=7000
REDIS_NODE2_HOST=localhost
REDIS_NODE2_PORT=7001
REDIS_NODE3_HOST=localhost
REDIS_NODE3_PORT=7002
REDIS_PASSWORD=
REDIS_DB=0

# IPFS Cluster
IPFS_CLUSTER_API_URL=http://localhost:9094/api/v0
IPFS_GATEWAY_URL=http://localhost:8080/ipfs
IPFS_TIMEOUT=30000
IPFS_MAX_FILE_SIZE=104857600

# MongoDB Atlas
MONGODB_URI=mongodb://localhost:27017
MONGODB_DATABASE=kale_ndar
MONGODB_MAX_POOL_SIZE=10
MONGODB_MIN_POOL_SIZE=2
```

## Usage Examples

### Basic Initialization

```typescript
import { DataLayerService } from './services/data-layer.service';
import { getDataLayerConfig } from './config/data-layer.config';

const config = getDataLayerConfig();
const dataLayer = new DataLayerService(config);

await dataLayer.initialize();
```

### Store Farming Event

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

const result = await dataLayer.storeFarmingEvent(farmingEvent);
```

### Cache Leaderboard

```typescript
const leaderboardData = {
  name: 'top_farmers',
  entries: [
    { address: 'GAFARMER1', score: 1000, rank: 1 },
    { address: 'GAFARMER2', score: 800, rank: 2 },
  ],
  ttl: 300, // 5 minutes
};

await dataLayer.cacheLeaderboard(leaderboardData);
```

### Upload Proof to IPFS

```typescript
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
```

### Manage User Profile

```typescript
// Update user profile
await dataLayer.updateUserProfile('GAFARMER1', {
  username: 'farmmaster',
  email: 'farmmaster@example.com',
  preferences: { notifications: true },
});

// Get user profile
const profile = await dataLayer.getUserProfile('GAFARMER1');
```

## Data Flow

### Farming Event Storage

1. **TimescaleDB**: Store event with timestamp for time-series analysis
2. **IPFS**: Upload proof data for off-chain storage
3. **Redis**: Update leaderboard scores and cache proof CID
4. **MongoDB**: Update user statistics and metadata

### Market Data Flow

1. **TimescaleDB**: Store price/volume data points over time
2. **MongoDB**: Store market metadata and configuration
3. **Redis**: Cache current market state for fast access
4. **IPFS**: Store market logs and historical data

## Health Monitoring

The data layer provides comprehensive health monitoring:

```typescript
// Check overall health
const health = await dataLayer.getHealthStatus();

// Test individual connections
const connections = await dataLayer.testConnections();
```

## Error Handling

All services include comprehensive error handling:

- Connection retry logic
- Graceful degradation
- Detailed logging
- Health status monitoring

## Performance Considerations

### TimescaleDB
- Hypertables for efficient time-series queries
- Proper indexing on time columns
- Connection pooling for concurrent access

### Redis Cluster
- Sorted sets for leaderboards
- TTL for automatic cleanup
- Cluster distribution for scalability

### IPFS Cluster
- Content addressing for deduplication
- Pinning for persistence
- Batch operations for efficiency

### MongoDB
- Proper indexing strategy
- Connection pooling
- Aggregation pipelines for complex queries

## Security

- Environment-based configuration
- Connection encryption where supported
- Access control and authentication
- Input validation and sanitization

## Testing

Run the example to test all services:

```bash
npm run dev
# Then run the data layer example
```

## Dependencies

- `pg`: PostgreSQL/TimescaleDB client
- `ioredis`: Redis cluster client
- `mongodb`: MongoDB client
- `axios`: HTTP client for IPFS
- `ipfs-http-client`: IPFS client library

## Contributing

When adding new features:

1. Follow the existing service patterns
2. Add proper error handling
3. Include health monitoring
4. Update configuration as needed
5. Add comprehensive logging
6. Write tests for new functionality


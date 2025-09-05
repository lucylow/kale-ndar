#!/bin/bash

# KALE-ndar Contract Deployment Script
# This script deploys all contracts to Stellar testnet for the hackathon

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
NETWORK=${NETWORK:-"testnet"}
RPC_URL=${RPC_URL:-"https://soroban-testnet.stellar.org"}
NETWORK_PASSPHRASE=${NETWORK_PASSPHRASE:-"Test SDF Network ; September 2015"}

# Contract addresses (from research)
KALE_TOKEN_ADDRESS="CDBG4XY2T5RRPH7HKGZIWMR2MFPLC6RJ453ITXQGNQXG6LNVL4375MRJ"
REFLECTOR_ORACLE_ADDRESS="CAFJZQWSED6YAWZU3GWRTOCNPPCGBN32L7QV43XX5LZLFTK6JLN34DLN"

# Output file for contract addresses
DEPLOYMENT_FILE="deployed-contracts.json"

echo -e "${BLUE}🚀 KALE-ndar Contract Deployment${NC}"
echo -e "${BLUE}Network: ${NETWORK}${NC}"
echo -e "${BLUE}RPC URL: ${RPC_URL}${NC}"
echo ""

# Check if Soroban CLI is installed
if ! command -v soroban &> /dev/null; then
    echo -e "${RED}❌ Soroban CLI not found. Please install it first:${NC}"
    echo "cargo install --locked soroban-cli --features opt"
    exit 1
fi

# Check if we're in the right directory
if [ ! -f "contracts/Cargo.toml" ]; then
    echo -e "${RED}❌ Please run this script from the project root directory${NC}"
    exit 1
fi

# Build contracts
echo -e "${YELLOW}🔨 Building contracts...${NC}"
cd contracts
cargo build --release
cd ..

echo -e "${GREEN}✅ Contracts built successfully${NC}"

# Deploy contracts
echo ""
echo -e "${YELLOW}📦 Deploying contracts to ${NETWORK}...${NC}"

# Deploy Market Factory Contract
echo -e "${BLUE}Deploying Market Factory Contract...${NC}"
FACTORY_CONTRACT_ID=$(soroban contract deploy \
    --wasm contracts/target/wasm32-unknown-unknown/release/market_factory.wasm \
    --source alice \
    --network ${NETWORK} \
    --rpc-url ${RPC_URL} \
    --network-passphrase "${NETWORK_PASSPHRASE}" \
    --output json | jq -r '.contractId')

echo -e "${GREEN}✅ Market Factory deployed: ${FACTORY_CONTRACT_ID}${NC}"

# Deploy Prediction Market Contract
echo -e "${BLUE}Deploying Prediction Market Contract...${NC}"
MARKET_CONTRACT_ID=$(soroban contract deploy \
    --wasm contracts/target/wasm32-unknown-unknown/release/prediction_market.wasm \
    --source alice \
    --network ${NETWORK} \
    --rpc-url ${RPC_URL} \
    --network-passphrase "${NETWORK_PASSPHRASE}" \
    --output json | jq -r '.contractId')

echo -e "${GREEN}✅ Prediction Market deployed: ${MARKET_CONTRACT_ID}${NC}"

# Deploy KALE Integration Contract
echo -e "${BLUE}Deploying KALE Integration Contract...${NC}"
KALE_INTEGRATION_ID=$(soroban contract deploy \
    --wasm contracts/target/wasm32-unknown-unknown/release/kale_integration.wasm \
    --source alice \
    --network ${NETWORK} \
    --rpc-url ${RPC_URL} \
    --network-passphrase "${NETWORK_PASSPHRASE}" \
    --output json | jq -r '.contractId')

echo -e "${GREEN}✅ KALE Integration deployed: ${KALE_INTEGRATION_ID}${NC}"

# Deploy Reflector Oracle Contract
echo -e "${BLUE}Deploying Reflector Oracle Contract...${NC}"
ORACLE_CONTRACT_ID=$(soroban contract deploy \
    --wasm contracts/target/wasm32-unknown-unknown/release/reflector_oracle.wasm \
    --source alice \
    --network ${NETWORK} \
    --rpc-url ${RPC_URL} \
    --network-passphrase "${NETWORK_PASSPHRASE}" \
    --output json | jq -r '.contractId')

echo -e "${GREEN}✅ Reflector Oracle deployed: ${ORACLE_CONTRACT_ID}${NC}"

# Initialize contracts
echo ""
echo -e "${YELLOW}🔧 Initializing contracts...${NC}"

# Initialize Market Factory
echo -e "${BLUE}Initializing Market Factory...${NC}"
soroban contract invoke \
    --id ${FACTORY_CONTRACT_ID} \
    --source alice \
    --network ${NETWORK} \
    --rpc-url ${RPC_URL} \
    --network-passphrase "${NETWORK_PASSPHRASE}" \
    -- initialize \
    --admin GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF \
    --kale_token ${KALE_TOKEN_ADDRESS} \
    --reflector_oracle ${REFLECTOR_ORACLE_ADDRESS} \
    --creator_fee_rate 20 \
    --min_market_fee 100000000

echo -e "${GREEN}✅ Market Factory initialized${NC}"

# Initialize KALE Integration
echo -e "${BLUE}Initializing KALE Integration...${NC}"
soroban contract invoke \
    --id ${KALE_INTEGRATION_ID} \
    --source alice \
    --network ${NETWORK} \
    --rpc-url ${RPC_URL} \
    --network-passphrase "${NETWORK_PASSPHRASE}" \
    -- initialize \
    --admin GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF \
    --kale_token ${KALE_TOKEN_ADDRESS} \
    --reward_rate_per_second 100 \
    --min_stake_amount 100000000

echo -e "${GREEN}✅ KALE Integration initialized${NC}"

# Initialize Reflector Oracle
echo -e "${BLUE}Initializing Reflector Oracle...${NC}"
soroban contract invoke \
    --id ${ORACLE_CONTRACT_ID} \
    --source alice \
    --network ${NETWORK} \
    --rpc-url ${RPC_URL} \
    --network-passphrase "${NETWORK_PASSPHRASE}" \
    -- initialize \
    --admin GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF \
    --min_confidence 80 \
    --max_price_age 3600

echo -e "${GREEN}✅ Reflector Oracle initialized${NC}"

# Save deployment information
echo ""
echo -e "${YELLOW}💾 Saving deployment information...${NC}"

cat > ${DEPLOYMENT_FILE} << EOF
{
  "network": "${NETWORK}",
  "rpc_url": "${RPC_URL}",
  "deployment_time": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
  "contracts": {
    "factory": {
      "id": "${FACTORY_CONTRACT_ID}",
      "name": "Market Factory",
      "description": "Creates new prediction markets"
    },
    "prediction_market": {
      "id": "${MARKET_CONTRACT_ID}",
      "name": "Prediction Market",
      "description": "Individual market contract template"
    },
    "kale_integration": {
      "id": "${KALE_INTEGRATION_ID}",
      "name": "KALE Integration",
      "description": "KALE staking and farming integration"
    },
    "reflector_oracle": {
      "id": "${ORACLE_CONTRACT_ID}",
      "name": "Reflector Oracle",
      "description": "Price feeds and oracle data"
    }
  },
  "external_addresses": {
    "kale_token": "${KALE_TOKEN_ADDRESS}",
    "reflector_oracle": "${REFLECTOR_ORACLE_ADDRESS}"
  }
}
EOF

echo -e "${GREEN}✅ Deployment information saved to ${DEPLOYMENT_FILE}${NC}"

# Create environment file for frontend
echo ""
echo -e "${YELLOW}📝 Creating environment file...${NC}"

cat > .env.local << EOF
# KALE-ndar Environment Configuration
VITE_NETWORK=${NETWORK}
VITE_SOROBAN_RPC_URL=${RPC_URL}
VITE_NETWORK_PASSPHRASE="${NETWORK_PASSPHRASE}"

# Contract Addresses
VITE_FACTORY_CONTRACT_ID=${FACTORY_CONTRACT_ID}
VITE_KALE_TOKEN_ID=${KALE_TOKEN_ADDRESS}
VITE_REFLECTOR_ORACLE_ID=${REFLECTOR_ORACLE_ADDRESS}
VITE_KALE_INTEGRATION_ID=${KALE_INTEGRATION_ID}

# External Addresses
VITE_KALE_TOKEN_ADDRESS=${KALE_TOKEN_ADDRESS}
VITE_REFLECTOR_ORACLE_ADDRESS=${REFLECTOR_ORACLE_ADDRESS}
EOF

echo -e "${GREEN}✅ Environment file created: .env.local${NC}"

# Test deployment
echo ""
echo -e "${YELLOW}🧪 Testing deployment...${NC}"

# Test factory contract
echo -e "${BLUE}Testing Market Factory...${NC}"
FACTORY_CONFIG=$(soroban contract invoke \
    --id ${FACTORY_CONTRACT_ID} \
    --source alice \
    --network ${NETWORK} \
    --rpc-url ${RPC_URL} \
    --network-passphrase "${NETWORK_PASSPHRASE}" \
    -- get_config)

echo -e "${GREEN}✅ Factory contract test passed${NC}"

# Test KALE integration
echo -e "${BLUE}Testing KALE Integration...${NC}"
KALE_STATS=$(soroban contract invoke \
    --id ${KALE_INTEGRATION_ID} \
    --source alice \
    --network ${NETWORK} \
    --rpc-url ${RPC_URL} \
    --network-passphrase "${NETWORK_PASSPHRASE}" \
    -- get_staking_stats)

echo -e "${GREEN}✅ KALE Integration test passed${NC}"

# Test oracle contract
echo -e "${BLUE}Testing Reflector Oracle...${NC}"
ORACLE_NODES=$(soroban contract invoke \
    --id ${ORACLE_CONTRACT_ID} \
    --source alice \
    --network ${NETWORK} \
    --rpc-url ${RPC_URL} \
    --network-passphrase "${NETWORK_PASSPHRASE}" \
    -- get_oracle_nodes)

echo -e "${GREEN}✅ Oracle contract test passed${NC}"

echo ""
echo -e "${GREEN}🎉 Deployment completed successfully!${NC}"
echo ""
echo -e "${BLUE}📋 Deployment Summary:${NC}"
echo -e "  • Market Factory: ${FACTORY_CONTRACT_ID}"
echo -e "  • Prediction Market: ${MARKET_CONTRACT_ID}"
echo -e "  • KALE Integration: ${KALE_INTEGRATION_ID}"
echo -e "  • Reflector Oracle: ${ORACLE_CONTRACT_ID}"
echo ""
echo -e "${BLUE}📁 Files created:${NC}"
echo -e "  • ${DEPLOYMENT_FILE} - Contract addresses and metadata"
echo -e "  • .env.local - Frontend environment variables"
echo ""
echo -e "${YELLOW}🚀 Next steps:${NC}"
echo -e "  1. Update your frontend with the new contract addresses"
echo -e "  2. Test the market creation and betting flow"
echo -e "  3. Create a demo market for the hackathon presentation"
echo ""
echo -e "${GREEN}✅ Ready for hackathon submission!${NC}"


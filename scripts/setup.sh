#!/bin/bash

# Kale-ndar Backend Setup Script
# This script sets up the development environment for Kale-ndar

set -e

echo "🌱 Setting up Kale-ndar Backend Development Environment"

# Check system requirements
echo "🔍 Checking system requirements..."

# Check for Rust
if ! command -v rustc &> /dev/null; then
    echo "❌ Rust not found. Installing Rust..."
    curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y
    source ~/.cargo/env
else
    echo "✅ Rust found: $(rustc --version)"
fi

# Check for wasm32 target
if ! rustup target list --installed | grep -q wasm32-unknown-unknown; then
    echo "📦 Adding wasm32-unknown-unknown target..."
    rustup target add wasm32-unknown-unknown
else
    echo "✅ wasm32-unknown-unknown target already installed"
fi

# Check for Soroban CLI
if ! command -v soroban &> /dev/null; then
    echo "📦 Installing Soroban CLI..."
    cargo install --locked soroban-cli
else
    echo "✅ Soroban CLI found: $(soroban --version)"
fi

# Check for Python
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 not found. Please install Python 3.8 or later."
    exit 1
else
    echo "✅ Python found: $(python3 --version)"
fi

# Setup Soroban network configuration
echo "🌐 Setting up Soroban network configuration..."

# Configure testnet
soroban network add \
  --global testnet \
  --rpc-url https://soroban-testnet.stellar.org:443 \
  --network-passphrase "Test SDF Network ; September 2015" || true

# Configure mainnet (for future use)
soroban network add \
  --global mainnet \
  --rpc-url https://soroban-mainnet.stellar.org:443 \
  --network-passphrase "Public Global Stellar Network ; September 2015" || true

echo "✅ Network configuration completed"

# Generate identity if not exists
echo "🔑 Setting up Soroban identity..."
if ! soroban keys list | grep -q "default"; then
    soroban keys generate --global default --network testnet
    echo "✅ Default identity generated"
else
    echo "✅ Default identity already exists"
fi

# Fund testnet account
echo "💰 Funding testnet account..."
soroban keys fund default --network testnet || echo "⚠️  Account funding may have failed (this is normal if already funded)"

# Build contracts
echo "🔨 Building smart contracts..."
cd contracts
cargo build --target wasm32-unknown-unknown --release
cd ..

# Setup Python backend
echo "🐍 Setting up Python backend..."
cd kale-ndar-api

# Activate virtual environment and install dependencies
source venv/bin/activate
pip install -r requirements.txt

echo "✅ Python backend setup completed"
cd ..

# Create environment configuration
echo "⚙️  Creating environment configuration..."
cat > .env << EOF
# Kale-ndar Backend Configuration
NETWORK=testnet
SOROBAN_RPC_URL=https://soroban-testnet.stellar.org:443
FLASK_ENV=development
FLASK_DEBUG=true
DATABASE_URL=sqlite:///kale-ndar-api/src/database/app.db

# Contract addresses (update after deployment)
PREDICTION_MARKET_CONTRACT=
KALE_INTEGRATION_CONTRACT=
REFLECTOR_ORACLE_CONTRACT=
KALE_TOKEN_CONTRACT=

# API Configuration
API_HOST=0.0.0.0
API_PORT=5000
CORS_ORIGINS=*

# Oracle Configuration
ORACLE_MIN_CONFIDENCE=80
ORACLE_MAX_PRICE_AGE=3600
EOF

echo "✅ Environment configuration created"

# Create development scripts
echo "📝 Creating development scripts..."

# Start development server script
cat > scripts/start-dev.sh << 'EOF'
#!/bin/bash
echo "🚀 Starting Kale-ndar development server..."
cd kale-ndar-api
source venv/bin/activate
python src/main.py
EOF

chmod +x scripts/start-dev.sh

# Test contracts script
cat > scripts/test-contracts.sh << 'EOF'
#!/bin/bash
echo "🧪 Running smart contract tests..."
cd contracts
cargo test
EOF

chmod +x scripts/test-contracts.sh

echo "✅ Development scripts created"

echo ""
echo "🎉 Kale-ndar Backend Setup Complete!"
echo ""
echo "📋 Next Steps:"
echo "  1. Deploy contracts: ./scripts/deploy-contracts.sh"
echo "  2. Start development server: ./scripts/start-dev.sh"
echo "  3. Run tests: ./scripts/test-contracts.sh"
echo ""
echo "📚 Documentation:"
echo "  - Smart contracts: ./contracts/README.md"
echo "  - API documentation: ./docs/api.md"
echo "  - Architecture: ./docs/architecture.md"
echo ""
echo "🔧 Configuration:"
echo "  - Environment variables: .env"
echo "  - Contract addresses: deployed-contracts.json (after deployment)"


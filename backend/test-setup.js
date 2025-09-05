const { logger } = require('./utils/logger');

console.log('🧪 Testing KALE-ndar Backend Setup...\n');

// Test 1: Check if all required modules can be imported
console.log('1. Testing module imports...');

try {
  require('./config/database');
  console.log('   ✅ Database config imported successfully');
} catch (error) {
  console.log('   ❌ Database config import failed:', error.message);
}

try {
  require('./utils/logger');
  console.log('   ✅ Logger utility imported successfully');
} catch (error) {
  console.log('   ❌ Logger utility import failed:', error.message);
}

try {
  require('./utils/websocket');
  console.log('   ✅ WebSocket utility imported successfully');
} catch (error) {
  console.log('   ❌ WebSocket utility import failed:', error.message);
}

try {
  require('./routes/markets');
  console.log('   ✅ Markets routes imported successfully');
} catch (error) {
  console.log('   ❌ Markets routes import failed:', error.message);
}

try {
  require('./routes/users');
  console.log('   ✅ Users routes imported successfully');
} catch (error) {
  console.log('   ❌ Users routes import failed:', error.message);
}

try {
  require('./routes/blockchain');
  console.log('   ✅ Blockchain routes imported successfully');
} catch (error) {
  console.log('   ❌ Blockchain routes import failed:', error.message);
}

try {
  require('./routes/health');
  console.log('   ✅ Health routes imported successfully');
} catch (error) {
  console.log('   ❌ Health routes import failed:', error.message);
}

try {
  require('./middleware/validation');
  console.log('   ✅ Validation middleware imported successfully');
} catch (error) {
  console.log('   ❌ Validation middleware import failed:', error.message);
}

try {
  require('./event-listener');
  console.log('   ✅ Event listener imported successfully');
} catch (error) {
  console.log('   ❌ Event listener import failed:', error.message);
}

// Test 2: Check if package.json has all required dependencies
console.log('\n2. Checking package.json dependencies...');

const packageJson = require('./package.json');
const requiredDeps = [
  'express', 'cors', 'helmet', 'dotenv', 'pg', 'ws', 'winston', 'joi'
];

const missingDeps = requiredDeps.filter(dep => !packageJson.dependencies[dep]);

if (missingDeps.length === 0) {
  console.log('   ✅ All required dependencies are present');
} else {
  console.log('   ❌ Missing dependencies:', missingDeps.join(', '));
}

// Test 3: Check if environment file exists
console.log('\n3. Checking environment configuration...');

const fs = require('fs');
const path = require('path');

if (fs.existsSync(path.join(__dirname, '.env'))) {
  console.log('   ✅ .env file exists');
} else if (fs.existsSync(path.join(__dirname, 'env.example'))) {
  console.log('   ⚠️  .env file not found, but env.example exists');
  console.log('   💡 Run: cp env.example .env');
} else {
  console.log('   ❌ No environment configuration files found');
}

// Test 4: Check if logs directory exists
console.log('\n4. Checking directory structure...');

const requiredDirs = ['logs', 'scripts'];
const missingDirs = requiredDirs.filter(dir => !fs.existsSync(path.join(__dirname, dir)));

if (missingDirs.length === 0) {
  console.log('   ✅ All required directories exist');
} else {
  console.log('   ❌ Missing directories:', missingDirs.join(', '));
}

// Test 5: Check if main server file can be imported
console.log('\n5. Testing main server file...');

try {
  // Just test the import, don't start the server
  const serverModule = require('./api/server');
  console.log('   ✅ Main server file can be imported');
} catch (error) {
  console.log('   ❌ Main server file import failed:', error.message);
}

console.log('\n🎉 Backend setup test completed!');
console.log('\n📋 Next steps:');
console.log('   1. Copy env.example to .env and configure your settings');
console.log('   2. Set up PostgreSQL database');
console.log('   3. Run: npm run dev (to start the API server)');
console.log('   4. Run: npm run event-listener (to start the event listener)');
console.log('\n🚀 Ready to build the future of prediction markets! 🌿');

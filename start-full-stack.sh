#!/bin/bash

# KALE-ndar Full Stack Startup Script
echo "🚀 Starting KALE-ndar Full Stack Application..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "📦 Installing frontend dependencies..."
    npm install
fi

if [ ! -d "backend/node_modules" ]; then
    echo "📦 Installing backend dependencies..."
    cd backend && npm install && cd ..
fi

# Check if PostgreSQL is running (for backend)
echo "🔍 Checking database connection..."
if ! pg_isready -h localhost -p 5432 &> /dev/null; then
    echo "⚠️  PostgreSQL is not running. Please start PostgreSQL first."
    echo "   You can start it with: brew services start postgresql (macOS)"
    echo "   Or: sudo systemctl start postgresql (Linux)"
    echo ""
    echo "   The backend will still start but database operations will fail."
    echo "   You can also use Docker: docker-compose -f backend/docker-compose.yml up -d"
fi

# Create .env files if they don't exist
if [ ! -f ".env.local" ]; then
    echo "📝 Creating frontend environment file..."
    cp env.local.example .env.local
fi

if [ ! -f "backend/.env" ]; then
    echo "📝 Creating backend environment file..."
    cp backend/env.example backend/.env
fi

echo ""
echo "🎯 Starting both frontend and backend..."
echo "   Frontend: http://localhost:5173"
echo "   Backend API: http://localhost:3000"
echo "   Backend Health: http://localhost:3000/health"
echo ""
echo "Press Ctrl+C to stop both servers"
echo ""

# Start both servers concurrently
npm run dev:full

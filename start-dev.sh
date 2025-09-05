#!/bin/bash

# KALE-ndar Development Startup Script

echo "🚀 Starting KALE-ndar Development Environment..."

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

# Install dependencies if needed
echo "📦 Installing dependencies..."
if [ ! -d "node_modules" ]; then
    npm install
fi

if [ ! -d "backend/node_modules" ]; then
    echo "📦 Installing backend dependencies..."
    cd backend && npm install && cd ..
fi

# Check if ports are available
echo "🔍 Checking port availability..."

# Check port 3000 (backend)
if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null ; then
    echo "⚠️  Port 3000 is already in use. Backend may not start properly."
fi

# Check port 5173 (frontend)
if lsof -Pi :5173 -sTCP:LISTEN -t >/dev/null ; then
    echo "⚠️  Port 5173 is already in use. Frontend may not start properly."
fi

echo "✅ Starting both services..."
echo "🌐 Frontend will be available at: http://localhost:5173"
echo "🔧 Backend will be available at: http://localhost:3000"
echo "📊 Health check: http://localhost:3000/health"
echo ""
echo "Press Ctrl+C to stop both services"
echo ""

# Start both services
npm run dev:full

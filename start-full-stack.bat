@echo off
REM KALE-ndar Full Stack Startup Script for Windows

echo 🚀 Starting KALE-ndar Full Stack Application...

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js first.
    pause
    exit /b 1
)

REM Check if npm is installed
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ npm is not installed. Please install npm first.
    pause
    exit /b 1
)

REM Install dependencies if node_modules doesn't exist
if not exist "node_modules" (
    echo 📦 Installing frontend dependencies...
    npm install
)

if not exist "backend\node_modules" (
    echo 📦 Installing backend dependencies...
    cd backend
    npm install
    cd ..
)

REM Create .env files if they don't exist
if not exist ".env.local" (
    echo 📝 Creating frontend environment file...
    copy env.local.example .env.local
)

if not exist "backend\.env" (
    echo 📝 Creating backend environment file...
    copy backend\env.example backend\.env
)

echo.
echo 🎯 Starting both frontend and backend...
echo    Frontend: http://localhost:5173
echo    Backend API: http://localhost:3000
echo    Backend Health: http://localhost:3000/health
echo.
echo Press Ctrl+C to stop both servers
echo.

REM Start both servers concurrently
npm run dev:full

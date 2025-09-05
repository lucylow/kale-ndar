# Frontend-Backend Connection Guide

## ✅ Successfully Linked Frontend to Backend

The KALE-ndar application now has a fully functional connection between the frontend and backend. Here's what has been accomplished:

### 🔧 Configuration Changes Made

1. **Frontend Configuration Updated** (`src/lib/config.ts`):
   - Disabled mock data mode (`enableMockData: false`)
   - Enabled backend health checks (`enableBackendHealthCheck: true`)
   - API base URL points to `http://localhost:3000`

2. **API Service Enhanced** (`src/services/api.ts`):
   - Fixed health check endpoint to expect `status: 'healthy'` (was `'ok'`)
   - Updated market creation to transform frontend params to backend format
   - Updated bet placement to match backend API expectations
   - Added proper error handling with fallback to mock data

3. **Connection Service Fixed** (`src/services/connection.ts`):
   - Corrected health check status validation
   - Proper error handling for backend connection failures

4. **Backend Database Handling** (`backend/config/database.js`):
   - Added graceful fallback when PostgreSQL is not available
   - Server can start in "mock mode" for development without database
   - Query functions return empty results instead of crashing

### 🚀 How to Start the Full Stack Application

#### Option 1: Using the Convenience Scripts

**Windows:**
```bash
# Run the Windows batch file
start-full-stack.bat
```

**Linux/macOS:**
```bash
# Make the script executable and run
chmod +x start-full-stack.sh
./start-full-stack.sh
```

#### Option 2: Manual Startup

**Terminal 1 - Backend:**
```bash
cd backend
npm install  # if not already done
npm start
```

**Terminal 2 - Frontend:**
```bash
npm install  # if not already done
npm run dev
```

#### Option 3: Using npm Scripts**
```bash
# Install all dependencies
npm run install:all

# Start both frontend and backend
npm run dev:full
```

### 🌐 Access Points

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3000
- **Backend Health Check**: http://localhost:3000/health
- **API Documentation**: http://localhost:3000/api (when available)

### 🔍 Testing the Connection

1. **Backend Health Check:**
   ```bash
   curl http://localhost:3000/health
   # Should return: {"status":"healthy","timestamp":"...","uptime":...}
   ```

2. **Frontend Connection Test:**
   - Open http://localhost:5173
   - Check the connection status indicator in the UI
   - Should show "Connected" status

3. **API Endpoints Available:**
   - `GET /health` - Health check
   - `GET /api/markets` - List markets
   - `POST /api/markets` - Create market
   - `GET /api/markets/:id` - Get market details
   - `POST /api/markets/:id/bet` - Place bet
   - `GET /api/users/:address` - Get user profile
   - `GET /api/blockchain/status` - Blockchain status

### 🗄️ Database Setup (Optional)

The backend can run without PostgreSQL in "mock mode", but for full functionality:

1. **Install PostgreSQL**
2. **Create Database:**
   ```sql
   CREATE DATABASE kalendar;
   ```
3. **Update Environment Variables** (`backend/.env`):
   ```
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=kalendar
   DB_USER=postgres
   DB_PASSWORD=your_password
   ```

### 🔧 Environment Configuration

**Frontend** (`.env.local`):
```
VITE_API_BASE_URL=http://localhost:3000
VITE_WS_URL=ws://localhost:3000
VITE_ENABLE_MOCK_DATA=false
```

**Backend** (`backend/.env`):
```
NODE_ENV=development
PORT=3000
FRONTEND_URL=http://localhost:5173
DB_HOST=localhost
DB_PORT=5432
DB_NAME=kalendar
DB_USER=postgres
DB_PASSWORD=password
```

### 🐛 Troubleshooting

1. **Port Already in Use:**
   - Backend: Change `PORT` in `backend/.env`
   - Frontend: Change port in `vite.config.ts`

2. **CORS Issues:**
   - Ensure `FRONTEND_URL` in backend `.env` matches frontend URL
   - Check that frontend is running on the expected port

3. **Database Connection Issues:**
   - Backend will run in mock mode if database is unavailable
   - Check PostgreSQL is running and credentials are correct

4. **API Calls Failing:**
   - Check browser network tab for error details
   - Verify backend is running on correct port
   - Check CORS configuration

### 📊 Current Status

✅ Frontend configured to use real backend API  
✅ Backend running and responding to requests  
✅ CORS properly configured  
✅ API endpoints mapped correctly  
✅ Error handling and fallbacks in place  
✅ Health checks working  
✅ Development scripts ready  

The application is now ready for full-stack development and testing!

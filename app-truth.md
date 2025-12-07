# Application Truth - CO2 Trading Platform

## Port Configuration

### Frontend Development Server
- **Default Port**: 3000
- **Command**: `npm run dev`
- **URL**: http://localhost:3000
- **Configuration**: Set in `vite.config.ts` - uses PORT environment variable or defaults to 3000
- **Host**: 0.0.0.0 (accessible from all network interfaces)
- **HMR Port**: Same as server port (3000)

### Backend API Server
- **Port**: 5000 (internal)
- **External Port** (Docker): 5001
- **Proxy**: Frontend proxies `/api` requests to `http://localhost:5000`
- **Health Check**: Available at `/health` endpoint

## Development Setup

### Running the Application
1. **Frontend**: `npm run dev` - runs on port 3000
2. **Backend**: Backend runs separately (Python Flask on port 5000, or Docker on 5001)

### Environment Variables
- `PORT`: Overrides default port 3000 for frontend
- `VITE_BACKEND_API_URL`: Backend API URL (defaults to http://localhost:5001 in Docker)
- `VITE_OILPRICE_API_KEY`: Optional API key for enhanced price data

## Docker Configuration

### Services
- **backend**: Python Flask service on port 5001:5000
- **co2-trading-app**: Production build on port 3000:80
- **co2-trading-dev**: Development service on port 5174:5173 (optional, uses dev profile)

### Allowed Hosts
- platonos.mooo.com
- localhost
- 127.0.0.1

## Important Notes

- Frontend development server **MUST** run on port **3000** (not 3001 or other ports)
- Backend API is proxied through `/api` path to avoid CORS issues
- HMR (Hot Module Replacement) uses WebSocket on the same port as the server
- CORS is enabled for cross-origin requests


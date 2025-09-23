# 🚀 CPMI Frontend Deployment Guide

## ✅ Current Status
- ✅ Frontend code is fixed and working
- ✅ API connection is configured correctly
- ✅ Local development environment is working
- ✅ Build process is successful

## 🏃‍♂️ Quick Deploy Options

### Option 1: Vercel (Recommended for Frontend)
```bash
# 1. Install Vercel CLI
npm install -g vercel

# 2. Login to Vercel
vercel login

# 3. Deploy frontend
cd frontend
vercel --prod

# 4. Set environment variable in Vercel dashboard
# NEXT_PUBLIC_CPMI_API_URL = https://your-api-domain.com
```

### Option 2: Netlify
```bash
# 1. Build the frontend
cd frontend
npm run build

# 2. Deploy the .next folder to Netlify
# Set environment variable: NEXT_PUBLIC_CPMI_API_URL
```

### Option 3: Docker (Full Stack)
```bash
# Use the existing docker-compose.yml in deploy/ folder
cd deploy
docker-compose up -d
```

## 🔧 Configuration

### Environment Variables
The frontend needs this environment variable:
```bash
NEXT_PUBLIC_CPMI_API_URL=https://your-api-server.com
```

### API Endpoints
The frontend expects these API endpoints:
- `GET /api/cpmi/current` - Current CPMI index
- `GET /api/cpmi/history` - Historical data

## 🧪 Testing Locally

### Start API Server
```bash
cd /path/to/project
PORT=3001 node src/api-server.js
```

### Start Frontend
```bash
cd frontend
npm run dev
```

### Test Connection
- Frontend: http://localhost:3000
- API: http://localhost:3001/api/cpmi/current

## 📊 Current API Status
✅ API is working and returning real CPMI data:
- Current Index: ~115.89 (Bullish)
- Categories: Bitcoin, Ethereum, Altcoins
- Real-time data from Polymarket

## 🚨 Important Notes

1. **API URL**: Update `NEXT_PUBLIC_CPMI_API_URL` to point to your deployed API
2. **CORS**: API server has CORS enabled for all origins
3. **Real Data**: API is fetching live data from Polymarket and Kraken
4. **Auto-refresh**: Frontend refreshes data every 30 seconds

## 🔄 Deployment Steps

1. **Deploy API Server** (choose one):
   - VPS with PM2: `pm2 start src/api-server.js --name cpmi`
   - Docker: Use `deploy/docker-compose.yml`
   - Vercel: Use `api-vercel/` folder (mock data only)

2. **Deploy Frontend**:
   - Run `./deploy-frontend.sh`
   - Deploy to Vercel/Netlify
   - Set environment variable

3. **Test**:
   - Verify API endpoints work
   - Check frontend loads data
   - Test auto-refresh functionality

## 🆘 Troubleshooting

### Frontend shows "Loading..." forever
- Check if API server is running
- Verify API URL is correct
- Check browser console for errors

### CORS errors
- API server has CORS enabled
- Check if API URL is accessible

### Build errors
- Run `npm install` in frontend folder
- Check Node.js version (18+)

## 📞 Support
- Check logs: `pm2 logs cpmi` (if using PM2)
- Test API: `curl http://your-api/api/cpmi/current`
- Test frontend: Open browser dev tools

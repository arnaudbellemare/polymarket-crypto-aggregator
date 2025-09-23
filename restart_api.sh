#!/bin/bash

echo "🔄 Restarting CPMI API with latest code..."

# Navigate to project directory
cd ~/polymarket-crypto-aggregator

# Pull latest code
echo "📥 Pulling latest code..."
git pull origin main

# Stop current PM2 process
echo "🛑 Stopping current API..."
pm2 stop cpmi-api

# Start API with new code
echo "🚀 Starting API with new code..."
pm2 start src/api-server.js --name "cpmi-api" --env PORT=3000,HOST=0.0.0.0

# Check status
echo "✅ API Status:"
pm2 status

echo "🎉 API restarted with latest code!"
echo "📊 Check: http://35.203.43.14:3000/health"
echo "📈 Export: http://35.203.43.14:3000/api/cpmi/export"

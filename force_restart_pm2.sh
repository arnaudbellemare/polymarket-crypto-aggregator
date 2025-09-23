#!/bin/bash
echo '🔄 Force restarting PM2 to clear cache...'
cd /home/asapbellemare/polymarket-crypto-aggregator

echo '🛑 Stopping all PM2 processes...'
pm2 stop all
pm2 delete all

echo '⏳ Waiting 3 seconds...'
sleep 3

echo '🚀 Starting fresh API process...'
pm2 start src/api-server.js --name 'cpmi-api' --env PORT=3000,HOST=0.0.0.0

echo '⏳ Waiting 5 seconds for API to start...'
sleep 5

echo '📊 Checking logs...'
pm2 logs cpmi-api --lines 15

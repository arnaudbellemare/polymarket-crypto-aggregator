#!/bin/bash
echo '🔄 Force updating VM with latest code...'
cd /home/asapbellemare/polymarket-crypto-aggregator

echo '📥 Pulling latest code...'
git pull origin main

echo '🔍 Verifying line 277 has correct code:'
sed -n '275,280p' src/CPMI_Final.js

echo '🛑 Stopping PM2 completely...'
pm2 stop all
pm2 delete all

echo '⏳ Waiting 3 seconds...'
sleep 3

echo '🚀 Starting fresh API...'
pm2 start src/api-server.js --name 'cpmi-api' --env PORT=3000,HOST=0.0.0.0

echo '⏳ Waiting 5 seconds...'
sleep 5

echo '📊 Checking logs...'
pm2 logs cpmi-api --lines 15

#!/bin/bash
echo '🔄 Updating CPMI API on VM...'
cd /home/asapbellemare/polymarket-crypto-aggregator
echo '📥 Pulling latest code...'
git pull origin main
echo '🔄 Restarting API with new code...'
pm2 restart cpmi-api
echo '✅ API updated and restarted!'
echo '📊 Checking logs...'
pm2 logs cpmi-api --lines 10

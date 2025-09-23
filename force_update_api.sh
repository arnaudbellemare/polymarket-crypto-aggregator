#!/bin/bash
echo '🔄 Force updating CPMI API on VM...'
cd /home/asapbellemare/polymarket-crypto-aggregator

echo '📥 Stashing any local changes...'
git stash

echo '📥 Pulling latest code...'
git pull origin main

echo '🔍 Checking current code...'
echo 'Line 277 should show: throw new Error(`Failed to fetch trades: ${tradesResponse.error}`)'
head -n 280 src/CPMI_Final.js | tail -n 10

echo '🔄 Restarting API with new code...'
pm2 restart cpmi-api

echo '⏳ Waiting 5 seconds for API to start...'
sleep 5

echo '📊 Checking logs...'
pm2 logs cpmi-api --lines 10

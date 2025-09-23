#!/bin/bash
echo '🔍 Debugging VM code update issue...'
cd /home/asapbellemare/polymarket-crypto-aggregator

echo '📋 Current git status:'
git status

echo '📋 Current branch:'
git branch

echo '📋 Last commit:'
git log --oneline -1

echo '📋 Checking line 277 in CPMI_Final.js:'
sed -n '275,280p' src/CPMI_Final.js

echo '📋 Checking if getCryptoMarkets method exists:'
grep -n 'getCryptoMarkets' src/clients/SimplePolymarketClient.js

echo '📋 Checking if markets endpoint is called:'
grep -n 'getCryptoMarkets' src/CPMI_Final.js

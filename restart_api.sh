#!/bin/bash
cd /home/asapbellemare/polymarket-crypto-aggregator
git pull origin main
pm2 restart cpmi-api
echo 'API restarted with increased trade limit (8000)'
pm2 logs cpmi-api --lines 10

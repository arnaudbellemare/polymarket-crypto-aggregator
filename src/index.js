import { CryptoMarketAggregator } from './CryptoMarketAggregator.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

/**
 * Example usage of the CryptoMarketAggregator
 */
async function main() {
  console.log('🚀 Starting Polymarket Crypto Market Aggregator...\n');

  // Initialize the aggregator
  const aggregator = new CryptoMarketAggregator({
    apiKey: process.env.POLYMARKET_API_KEY,
    secretKey: process.env.POLYMARKET_SECRET_KEY
  });

  try {
    // Connect to WebSocket for real-time data
    console.log('📡 Connecting to Polymarket WebSocket...');
    const connected = await aggregator.connect();
    
    if (!connected) {
      console.error('❌ Failed to connect to WebSocket');
      return;
    }

    console.log('✅ Connected to WebSocket successfully!\n');

    // Get all available crypto markets
    console.log('📊 Fetching available crypto markets...');
    const markets = await aggregator.getAllCryptoMarkets();
    console.log(`Found ${markets.length} crypto markets\n`);

    // Example asset IDs (you would get these from the markets response)
    const exampleAssetIds = ['BTC-USD', 'ETH-USD', 'SOL-USD']; // Replace with actual asset IDs

    // Subscribe to real-time data for example assets
    console.log('🔔 Subscribing to real-time data...');
    try {
      aggregator.subscribeToAssets(exampleAssetIds);
      console.log('✅ Subscribed to assets successfully!\n');
    } catch (error) {
      console.warn('⚠️  Could not subscribe to example assets (they may not exist):', error.message);
      console.log('This is normal for demo purposes. In production, use actual asset IDs from the markets response.\n');
    }

    // Wait for some data to accumulate
    console.log('⏳ Waiting for market data to accumulate...');
    await new Promise(resolve => setTimeout(resolve, 10000)); // Wait 10 seconds

    // Calculate weighted averages for each asset
    console.log('🧮 Calculating weighted averages...\n');
    
    for (const assetId of exampleAssetIds) {
      try {
        // Calculate VWAP (Volume Weighted Average Price)
        const vwap = aggregator.calculateWeightedAverage(assetId, 'VWAP');
        console.log(`📈 ${assetId} VWAP: $${vwap.weightedAverage.toFixed(4)} (Volume: ${vwap.totalVolume}, Trades: ${vwap.tradeCount})`);

        // Calculate TWAP (Time Weighted Average Price)
        const twap = aggregator.calculateWeightedAverage(assetId, 'TWAP');
        console.log(`⏰ ${assetId} TWAP: $${twap.weightedAverage.toFixed(4)} (Trades: ${twap.tradeCount})`);

        // Get asset statistics
        const stats = aggregator.getAssetStatistics(assetId);
        if (stats) {
          console.log(`📊 ${assetId} Stats: Min: $${stats.minPrice.toFixed(4)}, Max: $${stats.maxPrice.toFixed(4)}, Avg: $${stats.avgPrice.toFixed(4)}`);
        }

        console.log(''); // Empty line for readability
      } catch (error) {
        console.warn(`⚠️  Could not calculate averages for ${assetId}: ${error.message}`);
      }
    }

    // Calculate portfolio weighted average
    console.log('💼 Calculating portfolio weighted average...');
    try {
      const portfolioAvg = aggregator.calculatePortfolioWeightedAverage(
        exampleAssetIds,
        [0.5, 0.3, 0.2], // Example weights: 50% BTC, 30% ETH, 20% SOL
        'VWAP'
      );
      
      if (portfolioAvg) {
        console.log(`🎯 Portfolio VWAP: $${portfolioAvg.portfolioAverage.toFixed(4)}`);
        console.log(`📊 Individual Results:`);
        portfolioAvg.individualResults.forEach(result => {
          console.log(`   ${result.symbol}: $${result.weightedAverage.toFixed(4)}`);
        });
      }
    } catch (error) {
      console.warn('⚠️  Could not calculate portfolio average:', error.message);
    }

    console.log('\n');

    // Get current status
    const status = aggregator.getStatus();
    console.log('📋 Current Status:');
    console.log(`   Connected: ${status.isConnected}`);
    console.log(`   Subscribed Assets: ${status.subscribedAssets.length}`);
    console.log(`   Market Data Cache: ${status.marketDataCacheSize} assets`);
    console.log(`   Trade Data Cache: ${status.tradeDataCacheSize} trades`);

    // Get global statistics
    console.log('\n🌍 Fetching global market statistics...');
    try {
      const globalStats = await aggregator.getGlobalStats();
      console.log('Global Stats:', JSON.stringify(globalStats, null, 2));
    } catch (error) {
      console.warn('⚠️  Could not fetch global stats:', error.message);
    }

    // Keep the connection alive for demonstration
    console.log('\n🔄 Keeping connection alive for 30 seconds to demonstrate real-time updates...');
    console.log('Press Ctrl+C to exit\n');

    // Set up periodic status updates
    const statusInterval = setInterval(() => {
      const currentStatus = aggregator.getStatus();
      console.log(`📊 Status Update: ${currentStatus.tradeDataCacheSize} trades, ${currentStatus.marketDataCacheSize} market updates`);
    }, 5000);

    // Clean up after 30 seconds
    setTimeout(() => {
      clearInterval(statusInterval);
      console.log('\n🧹 Cleaning up...');
      aggregator.cleanupOldData();
      aggregator.disconnect();
      console.log('✅ Cleanup complete. Exiting...');
      process.exit(0);
    }, 30000);

  } catch (error) {
    console.error('❌ Error in main execution:', error);
    aggregator.disconnect();
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Received SIGINT. Shutting down gracefully...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Received SIGTERM. Shutting down gracefully...');
  process.exit(0);
});

// Run the main function
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { CryptoMarketAggregator };

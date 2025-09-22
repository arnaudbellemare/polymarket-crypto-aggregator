import { CryptoMarketIndex } from './CryptoMarketIndex.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

/**
 * Demo application for the Crypto Market Index
 * Similar to UPFI but for cryptocurrency markets
 */
async function main() {
  console.log('🚀 Starting Crypto Market Index Demo...\n');
  console.log('📊 This index provides a comprehensive, real-time measure of crypto market sentiment');
  console.log('🎯 Based on Polymarket prediction market data with weighted methodology\n');

  // Initialize the crypto market index
  const cryptoIndex = new CryptoMarketIndex({
    apiKey: process.env.POLYMARKET_API_KEY,
    secretKey: process.env.POLYMARKET_SECRET_KEY,
    
    // Customize category weights if needed
    categoryWeights: {
      'major-crypto': 0.40,      // BTC, ETH, major cryptocurrencies (40%)
      'altcoins': 0.30,          // Alternative cryptocurrencies (30%)
      'defi': 0.20,              // DeFi tokens and protocols (20%)
      'meme-coins': 0.08,        // Meme coins and viral tokens (8%)
      'nft-gaming': 0.02         // NFT and gaming tokens (2%)
    },
    
    // Sensitivity parameters (0-10 scale)
    sensitivity: {
      volume: 7,                 // High importance of trading activity
      time: 6,                   // Moderate preference for near-term markets
      marketCap: 5,              // Balanced market cap representation
      impact: 8                  // Strong emphasis on market significance
    }
  });

  try {
    // Start the index
    console.log('🔄 Starting Crypto Market Index...');
    const started = await cryptoIndex.start();
    
    if (!started) {
      console.error('❌ Failed to start Crypto Market Index');
      return;
    }

    console.log('✅ Crypto Market Index started successfully!\n');

    // Display initial index information
    console.log('📋 Index Configuration:');
    console.log('   Baseline Value: 100 (Perfect market balance)');
    console.log('   Values > 100: Bullish sentiment');
    console.log('   Values < 100: Bearish sentiment');
    console.log('   Update Interval: 5 minutes');
    console.log('   Smoothing: 1-hour Simple Moving Average\n');

    // Set up periodic status updates
    const statusInterval = setInterval(() => {
      const currentIndex = cryptoIndex.getCurrentIndex();
      const breakdown = cryptoIndex.getCategoryBreakdown();
      const stats = cryptoIndex.getIndexStatistics();

      console.log('📈 === CRYPTO MARKET INDEX UPDATE ===');
      console.log(`🎯 Current Index: ${currentIndex.value.toFixed(2)} (${currentIndex.interpretation})`);
      console.log(`🕐 Last Update: ${currentIndex.lastUpdate?.toLocaleTimeString() || 'Never'}`);
      
      if (stats) {
        console.log(`📊 Statistics: Min: ${stats.min.toFixed(2)}, Max: ${stats.max.toFixed(2)}, Avg: ${stats.avg.toFixed(2)}`);
        console.log(`📈 Volatility: ${stats.volatility.toFixed(2)}, Data Points: ${stats.dataPoints}`);
      }

      console.log('\n📋 Category Breakdown:');
      for (const [category, data] of Object.entries(breakdown)) {
        console.log(`   ${category.toUpperCase()}: ${data.index.toFixed(1)} (${data.interpretation}, Weight: ${(data.weight * 100).toFixed(1)}%)`);
      }

      console.log('\n' + '='.repeat(50) + '\n');
    }, 30000); // Update every 30 seconds

    // Set up detailed analysis every 5 minutes
    const analysisInterval = setInterval(() => {
      const exportData = cryptoIndex.exportIndexData();
      
      console.log('🔍 === DETAILED INDEX ANALYSIS ===');
      console.log('📊 Current Market Sentiment Analysis:');
      
      const currentIndex = exportData.currentIndex;
      if (currentIndex.value > 105) {
        console.log('🚀 STRONG BULLISH: Market showing strong positive sentiment');
      } else if (currentIndex.value > 100) {
        console.log('📈 BULLISH: Market showing positive sentiment');
      } else if (currentIndex.value < 95) {
        console.log('📉 BEARISH: Market showing negative sentiment');
      } else if (currentIndex.value < 100) {
        console.log('🐻 WEAK BEARISH: Market showing weak negative sentiment');
      } else {
        console.log('⚖️ NEUTRAL: Market showing balanced sentiment');
      }

      console.log('\n📈 Category Performance:');
      for (const [category, data] of Object.entries(exportData.categoryBreakdown)) {
        const trend = data.deviation > 0 ? '📈' : '📉';
        console.log(`   ${trend} ${category}: ${data.index.toFixed(1)} (Deviation: ${data.deviation > 0 ? '+' : ''}${data.deviation.toFixed(1)})`);
      }

      if (exportData.statistics) {
        console.log('\n📊 Historical Performance:');
        console.log(`   Range: ${exportData.statistics.min.toFixed(2)} - ${exportData.statistics.max.toFixed(2)}`);
        console.log(`   Average: ${exportData.statistics.avg.toFixed(2)}`);
        console.log(`   Volatility: ${exportData.statistics.volatility.toFixed(2)}`);
      }

      console.log('\n' + '='.repeat(60) + '\n');
    }, 5 * 60 * 1000); // Every 5 minutes

    // Keep running for demonstration
    console.log('🔄 Index will run for 10 minutes to demonstrate functionality...');
    console.log('📊 Updates will appear every 30 seconds with detailed analysis every 5 minutes');
    console.log('🛑 Press Ctrl+C to stop early\n');

    // Clean up after 10 minutes
    setTimeout(() => {
      clearInterval(statusInterval);
      clearInterval(analysisInterval);
      
      console.log('\n🏁 === FINAL INDEX SUMMARY ===');
      const finalData = cryptoIndex.exportIndexData();
      
      console.log(`🎯 Final Index Value: ${finalData.currentIndex.value.toFixed(2)}`);
      console.log(`📊 Final Interpretation: ${finalData.currentIndex.interpretation}`);
      
      if (finalData.statistics) {
        console.log('\n📈 Session Statistics:');
        console.log(`   Highest: ${finalData.statistics.max.toFixed(2)}`);
        console.log(`   Lowest: ${finalData.statistics.min.toFixed(2)}`);
        console.log(`   Average: ${finalData.statistics.avg.toFixed(2)}`);
        console.log(`   Volatility: ${finalData.statistics.volatility.toFixed(2)}`);
        console.log(`   Data Points: ${finalData.statistics.dataPoints}`);
      }

      console.log('\n🧹 Cleaning up...');
      cryptoIndex.stop();
      console.log('✅ Demo completed successfully!');
      process.exit(0);
    }, 10 * 60 * 1000); // 10 minutes

  } catch (error) {
    console.error('❌ Error in demo execution:', error);
    cryptoIndex.stop();
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

// Run the demo
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { CryptoMarketIndex };

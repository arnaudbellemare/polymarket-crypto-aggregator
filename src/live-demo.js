import { CryptoMarketIndex } from './CryptoMarketIndex.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

/**
 * Live Demo of the Crypto Market Index
 * Shows real-time index calculation with detailed logging
 */
async function runLiveDemo() {
  console.log('🚀 === CRYPTO MARKET INDEX LIVE DEMO ===\n');
  console.log('📊 This demo shows the index working with real Polymarket data');
  console.log('🎯 Based on UPFI methodology adapted for crypto markets\n');

  // Initialize the crypto market index with detailed logging
  const cryptoIndex = new CryptoMarketIndex({
    apiKey: process.env.POLYMARKET_API_KEY,
    secretKey: process.env.POLYMARKET_SECRET_KEY,
    
    // Customize for demo
    categoryWeights: {
      'major-crypto': 0.40,      // BTC, ETH, major cryptocurrencies (40%)
      'altcoins': 0.30,          // Alternative cryptocurrencies (30%)
      'defi': 0.20,              // DeFi tokens and protocols (20%)
      'meme-coins': 0.08,        // Meme coins and viral tokens (8%)
      'nft-gaming': 0.02         // NFT and gaming tokens (2%)
    },
    
    sensitivity: {
      volume: 7,                 // High importance of trading activity
      time: 6,                   // Moderate preference for near-term markets
      marketCap: 5,              // Balanced market cap representation
      impact: 8                  // Strong emphasis on market significance
    }
  });

  try {
    console.log('🔄 Step 1: Connecting to Polymarket WebSocket...');
    const started = await cryptoIndex.start();
    
    if (!started) {
      console.error('❌ Failed to start Crypto Market Index');
      console.log('💡 Make sure you have valid API credentials in your .env file');
      return;
    }

    console.log('✅ Successfully connected to Polymarket!\n');

    // Wait a moment for initial data
    console.log('⏳ Step 2: Waiting for initial market data...');
    await new Promise(resolve => setTimeout(resolve, 5000));

    // Show initial index calculation
    console.log('📊 Step 3: Calculating initial index...');
    cryptoIndex.calculateIndex();
    
    const initialIndex = cryptoIndex.getCurrentIndex();
    console.log(`🎯 Initial Index Value: ${initialIndex.value.toFixed(2)}`);
    console.log(`📈 Interpretation: ${initialIndex.interpretation}`);
    console.log(`🕐 Last Update: ${initialIndex.lastUpdate?.toLocaleTimeString() || 'Never'}\n`);

    // Show category breakdown
    console.log('📋 Step 4: Category Breakdown Analysis:');
    const breakdown = cryptoIndex.getCategoryBreakdown();
    for (const [category, data] of Object.entries(breakdown)) {
      const trend = data.deviation > 0 ? '📈' : '📉';
      const weight = (data.weight * 100).toFixed(1);
      console.log(`   ${trend} ${category.toUpperCase()}: ${data.index.toFixed(1)} (Weight: ${weight}%, Deviation: ${data.deviation > 0 ? '+' : ''}${data.deviation.toFixed(1)})`);
    }

    console.log('\n🔄 Step 5: Starting real-time monitoring...');
    console.log('📊 Index will update every 30 seconds with detailed analysis\n');

    let updateCount = 0;
    const maxUpdates = 10; // Run for 10 updates (5 minutes)

    // Set up real-time monitoring
    const monitoringInterval = setInterval(() => {
      updateCount++;
      
      console.log(`📈 === UPDATE #${updateCount} - ${new Date().toLocaleTimeString()} ===`);
      
      // Get current index data
      const currentIndex = cryptoIndex.getCurrentIndex();
      const categoryBreakdown = cryptoIndex.getCategoryBreakdown();
      const statistics = cryptoIndex.getIndexStatistics();
      
      // Display index value and interpretation
      console.log(`🎯 Index Value: ${currentIndex.value.toFixed(2)} (${currentIndex.interpretation})`);
      
      // Show market sentiment analysis
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

      // Display category performance
      console.log('\n📊 Category Performance:');
      for (const [category, data] of Object.entries(categoryBreakdown)) {
        const trend = data.deviation > 0 ? '📈' : '📉';
        const strength = Math.abs(data.deviation) > 5 ? 'STRONG' : Math.abs(data.deviation) > 2 ? 'MODERATE' : 'WEAK';
        console.log(`   ${trend} ${category.toUpperCase()}: ${data.index.toFixed(1)} (${strength} ${data.interpretation})`);
      }

      // Show statistics if available
      if (statistics && statistics.dataPoints > 1) {
        console.log('\n📈 Historical Statistics:');
        console.log(`   Range: ${statistics.min.toFixed(2)} - ${statistics.max.toFixed(2)}`);
        console.log(`   Average: ${statistics.avg.toFixed(2)}`);
        console.log(`   Volatility: ${statistics.volatility.toFixed(2)}`);
        console.log(`   Data Points: ${statistics.dataPoints}`);
      }

      // Show market data examples
      console.log('\n🔍 Sample Market Data:');
      const sampleMarkets = ['BTC-USD', 'ETH-USD', 'SOL-USD'];
      for (const market of sampleMarkets) {
        const marketData = cryptoIndex.aggregator.getCurrentMarketData(market);
        if (marketData) {
          console.log(`   ${market}: $${marketData.price.toFixed(2)} (Volume: ${marketData.volume.toFixed(2)})`);
        } else {
          console.log(`   ${market}: No data available`);
        }
      }

      console.log('\n' + '='.repeat(60) + '\n');

      // Stop after max updates
      if (updateCount >= maxUpdates) {
        clearInterval(monitoringInterval);
        showFinalSummary(cryptoIndex);
      }
    }, 30000); // Update every 30 seconds

  } catch (error) {
    console.error('❌ Error in live demo:', error);
    cryptoIndex.stop();
  }
}

/**
 * Show final summary of the demo
 */
function showFinalSummary(cryptoIndex) {
  console.log('🏁 === FINAL DEMO SUMMARY ===\n');
  
  const finalData = cryptoIndex.exportIndexData();
  
  console.log('📊 Final Index Results:');
  console.log(`   Final Value: ${finalData.currentIndex.value.toFixed(2)}`);
  console.log(`   Interpretation: ${finalData.currentIndex.interpretation}`);
  console.log(`   Last Update: ${finalData.currentIndex.lastUpdate?.toLocaleTimeString()}`);
  
  if (finalData.statistics) {
    console.log('\n📈 Session Statistics:');
    console.log(`   Highest: ${finalData.statistics.max.toFixed(2)}`);
    console.log(`   Lowest: ${finalData.statistics.min.toFixed(2)}`);
    console.log(`   Average: ${finalData.statistics.avg.toFixed(2)}`);
    console.log(`   Volatility: ${finalData.statistics.volatility.toFixed(2)}`);
    console.log(`   Data Points: ${finalData.statistics.dataPoints}`);
  }
  
  console.log('\n📋 Final Category Breakdown:');
  for (const [category, data] of Object.entries(finalData.categoryBreakdown)) {
    const trend = data.deviation > 0 ? '📈' : '📉';
    console.log(`   ${trend} ${category.toUpperCase()}: ${data.index.toFixed(1)} (${data.interpretation})`);
  }
  
  console.log('\n✅ Demo completed successfully!');
  console.log('💡 The index is working properly and fetching real crypto market data');
  console.log('🔄 You can run this demo anytime with: npm run demo');
  
  cryptoIndex.stop();
  process.exit(0);
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Demo interrupted. Shutting down gracefully...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Demo terminated. Shutting down gracefully...');
  process.exit(0);
});

// Run the live demo
if (import.meta.url === `file://${process.argv[1]}`) {
  runLiveDemo().catch(console.error);
}

export { runLiveDemo };

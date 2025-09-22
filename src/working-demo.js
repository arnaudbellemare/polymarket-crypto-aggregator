import { SimpleCryptoIndex } from './SimpleCryptoIndex.js';
import { SimplePolymarketClient } from './clients/SimplePolymarketClient.js';

/**
 * Working Demo of the Crypto Market Index
 * Uses Polymarket's simple GET endpoint - no authentication required!
 */
async function runWorkingDemo() {
  console.log('🚀 === WORKING CRYPTO MARKET INDEX DEMO ===\n');
  console.log('📊 Using Polymarket\'s simple GET endpoint - no API keys needed!');
  console.log('🎯 Fetching real trade data and calculating crypto market sentiment\n');

  // Initialize the simple crypto market index
  const cryptoIndex = new SimpleCryptoIndex({
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
    console.log('🔄 Step 1: Testing Polymarket API connection...');
    const client = new SimplePolymarketClient();
    const healthCheck = await client.healthCheck();
    
    if (!healthCheck.success) {
      throw new Error('Failed to connect to Polymarket API');
    }
    
    console.log('✅ Successfully connected to Polymarket API!');
    console.log('📡 No authentication required - using public endpoint\n');

    console.log('🔄 Step 2: Fetching recent trades...');
    const tradesResponse = await client.getAllRecentTrades(100);
    
    if (!tradesResponse.success) {
      throw new Error(`Failed to fetch trades: ${tradesResponse.error}`);
    }
    
    const trades = tradesResponse.data;
    console.log(`✅ Fetched ${trades.length} recent trades from Polymarket`);
    
    // Show sample trades
    console.log('\n📊 Sample Trades:');
    trades.slice(0, 3).forEach((trade, index) => {
      console.log(`   ${index + 1}. ${trade.title}`);
      console.log(`      Side: ${trade.side}, Size: ${trade.size}, Price: $${trade.price}`);
      console.log(`      User: ${trade.name || trade.pseudonym || 'Anonymous'}`);
      console.log(`      Time: ${new Date(trade.timestamp * 1000).toLocaleString()}`);
    });

    console.log('\n🔄 Step 3: Filtering crypto-related trades...');
    const cryptoTrades = cryptoIndex.filterCryptoTrades(trades);
    console.log(`✅ Found ${cryptoTrades.length} crypto-related trades`);
    
    if (cryptoTrades.length > 0) {
      console.log('\n🔍 Crypto Trades Found:');
      cryptoTrades.slice(0, 5).forEach((trade, index) => {
        console.log(`   ${index + 1}. ${trade.title}`);
        console.log(`      Side: ${trade.side}, Size: ${trade.size}, Price: $${trade.price}`);
      });
    }

    console.log('\n🔄 Step 4: Processing crypto markets...');
    const cryptoMarkets = client.processCryptoTrades(cryptoTrades);
    console.log(`✅ Processed ${cryptoMarkets.length} crypto markets`);
    
    if (cryptoMarkets.length > 0) {
      console.log('\n📈 Crypto Market Analysis:');
      cryptoMarkets.slice(0, 3).forEach((market, index) => {
        console.log(`   ${index + 1}. ${market.title}`);
        console.log(`      Trades: ${market.trades.length}, Volume: ${market.totalVolume.toFixed(2)}`);
        console.log(`      Avg Price: $${market.avgPrice.toFixed(2)}, Buy/Sell: ${market.buyVolume.toFixed(2)}/${market.sellVolume.toFixed(2)}`);
      });
    }

    console.log('\n🔄 Step 5: Starting Crypto Market Index...');
    const started = await cryptoIndex.start();
    
    if (!started) {
      throw new Error('Failed to start Crypto Market Index');
    }

    console.log('✅ Crypto Market Index started successfully!\n');

    // Wait for initial calculation
    console.log('⏳ Waiting for initial index calculation...');
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Show initial results
    const currentIndex = cryptoIndex.getCurrentIndex();
    const breakdown = cryptoIndex.getCategoryBreakdown();
    
    console.log('📊 === INITIAL INDEX RESULTS ===');
    console.log(`🎯 Index Value: ${currentIndex.value.toFixed(2)}`);
    console.log(`📈 Interpretation: ${currentIndex.interpretation}`);
    console.log(`🕐 Last Update: ${currentIndex.lastUpdate?.toLocaleTimeString() || 'Never'}`);
    
    console.log('\n📋 Category Breakdown:');
    for (const [category, data] of Object.entries(breakdown)) {
      const trend = data.deviation > 0 ? '📈' : '📉';
      const weight = (data.weight * 100).toFixed(1);
      console.log(`   ${trend} ${category.toUpperCase()}: ${data.index.toFixed(1)} (Weight: ${weight}%, ${data.interpretation})`);
    }

    // Show market statistics
    const stats = client.getCryptoMarketStats(cryptoTrades);
    console.log('\n📊 Market Statistics:');
    console.log(`   Total Trades: ${stats.totalTrades}`);
    console.log(`   Total Volume: ${stats.totalVolume.toFixed(2)}`);
    console.log(`   Total Value: $${stats.totalValue.toFixed(2)}`);
    console.log(`   Average Price: $${stats.avgPrice.toFixed(2)}`);
    console.log(`   Buy/Sell Ratio: ${stats.buyTrades}/${stats.sellTrades}`);
    console.log(`   Unique Markets: ${stats.markets}`);
    console.log(`   Unique Users: ${stats.users}`);

    console.log('\n🔄 Step 6: Starting real-time monitoring...');
    console.log('📊 Index will update every 30 seconds for 5 minutes\n');

    let updateCount = 0;
    const maxUpdates = 10; // 5 minutes

    // Set up real-time monitoring
    const monitoringInterval = setInterval(() => {
      updateCount++;
      
      console.log(`📈 === UPDATE #${updateCount} - ${new Date().toLocaleTimeString()} ===`);
      
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

      console.log('\n' + '='.repeat(60) + '\n');

      // Stop after max updates
      if (updateCount >= maxUpdates) {
        clearInterval(monitoringInterval);
        showFinalSummary(cryptoIndex);
      }
    }, 30000); // Update every 30 seconds

  } catch (error) {
    console.error('❌ Error in working demo:', error);
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
  console.log('💡 The index is working with real Polymarket data!');
  console.log('🔄 You can run this demo anytime with: npm run working');
  console.log('📊 No API keys required - uses public Polymarket endpoint');
  
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

// Run the working demo
if (import.meta.url === `file://${process.argv[1]}`) {
  runWorkingDemo().catch(console.error);
}

export { runWorkingDemo };

import { RefinedCryptoIndex } from './RefinedCryptoIndex.js';
import { SimplePolymarketClient } from './clients/SimplePolymarketClient.js';

/**
 * Refined Demo of the Crypto Market Index
 * Shows the improved logic with proper probability extraction
 */
async function runRefinedDemo() {
  console.log('🚀 === REFINED CRYPTO MARKET INDEX DEMO ===\n');
  console.log('📊 Using improved logic with proper probability extraction');
  console.log('🎯 Accurate UPFI-style methodology for crypto markets\n');

  // Initialize the refined crypto market index
  const cryptoIndex = new RefinedCryptoIndex({
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

    console.log('\n🔄 Step 2: Fetching recent trades...');
    const tradesResponse = await client.getAllRecentTrades(100);
    
    if (!tradesResponse.success) {
      throw new Error(`Failed to fetch trades: ${tradesResponse.error}`);
    }
    
    const trades = tradesResponse.data;
    console.log(`✅ Fetched ${trades.length} recent trades from Polymarket`);
    
    // Show sample trades with analysis
    console.log('\n📊 Sample Trades with Refined Analysis:');
    const cryptoTrades = cryptoIndex.filterCryptoTrades(trades);
    
    if (cryptoTrades.length > 0) {
      const sampleTrades = cryptoTrades.slice(0, 5);
      
      for (let i = 0; i < sampleTrades.length; i++) {
        const trade = sampleTrades[i];
        console.log(`\n   ${i + 1}. ${trade.title}`);
        console.log(`      Side: ${trade.side}, Size: ${trade.size}, Price: $${trade.price}`);
        console.log(`      User: ${trade.name || trade.pseudonym || 'Anonymous'}`);
        console.log(`      Time: ${new Date(trade.timestamp * 1000).toLocaleString()}`);
        
        // Show refined analysis
        const marketType = cryptoIndex.classifyMarketType(trade.title);
        console.log(`      Market Type: ${marketType.toUpperCase()}`);
        
        // Show probability extraction logic
        if (marketType === 'binary') {
          console.log(`      Logic: Binary outcome market - using price as probability`);
        } else if (marketType === 'price_prediction') {
          const targetPrice = cryptoIndex.extractTargetPrice(trade.title);
          const currentPrice = cryptoIndex.getCurrentPrice(trade.title);
          console.log(`      Logic: Price prediction - Target: $${targetPrice}, Current: $${currentPrice}`);
        } else if (marketType === 'range') {
          const range = cryptoIndex.extractPriceRange(trade.title);
          const currentPrice = cryptoIndex.getCurrentPrice(trade.title);
          console.log(`      Logic: Range market - Range: $${range?.min}-$${range?.max}, Current: $${currentPrice}`);
        } else if (marketType === 'directional') {
          const isBullish = cryptoIndex.isBullishOutcome(trade.title);
          console.log(`      Logic: Directional market - ${isBullish ? 'Bullish' : 'Bearish'} outcome`);
        }
      }
    }

    console.log('\n🔄 Step 3: Processing markets with refined logic...');
    const cryptoMarkets = cryptoIndex.processCryptoTradesRefined(cryptoTrades);
    console.log(`✅ Processed ${cryptoMarkets.length} crypto markets with refined logic`);
    
    if (cryptoMarkets.length > 0) {
      console.log('\n📈 Refined Market Analysis:');
      cryptoMarkets.slice(0, 3).forEach((market, index) => {
        console.log(`\n   ${index + 1}. ${market.title}`);
        console.log(`      Market Type: ${market.marketType.toUpperCase()}`);
        console.log(`      Trades: ${market.trades.length}, Volume: ${market.totalVolume.toFixed(2)}`);
        console.log(`      Buy/Sell: ${market.buyTrades}/${market.sellTrades} trades, ${market.buyVolume.toFixed(2)}/${market.sellVolume.toFixed(2)} volume`);
        console.log(`      Bullish Probability: ${market.bullishProbability?.toFixed(1)}%`);
        console.log(`      Confidence: ${(market.confidence * 100).toFixed(1)}%`);
        console.log(`      Avg Price: $${market.avgPrice.toFixed(2)}`);
      });
    }

    console.log('\n🔄 Step 4: Starting Refined Crypto Market Index...');
    const started = await cryptoIndex.start();
    
    if (!started) {
      throw new Error('Failed to start Refined Crypto Market Index');
    }

    console.log('✅ Refined Crypto Market Index started successfully!\n');

    // Wait for initial calculation
    console.log('⏳ Waiting for initial index calculation...');
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Show initial results
    const currentIndex = cryptoIndex.getCurrentIndex();
    const breakdown = cryptoIndex.getCategoryBreakdown();
    
    console.log('📊 === REFINED INDEX RESULTS ===');
    console.log(`🎯 Index Value: ${currentIndex.value.toFixed(2)}`);
    console.log(`📈 Interpretation: ${currentIndex.interpretation}`);
    console.log(`🕐 Last Update: ${currentIndex.lastUpdate?.toLocaleTimeString() || 'Never'}`);
    
    console.log('\n📋 Category Breakdown:');
    for (const [category, data] of Object.entries(breakdown)) {
      const trend = data.deviation > 0 ? '📈' : '📉';
      const weight = (data.weight * 100).toFixed(1);
      console.log(`   ${trend} ${category.toUpperCase()}: ${data.index.toFixed(1)}% (Weight: ${weight}%, ${data.interpretation})`);
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

    console.log('\n🔄 Step 5: Starting real-time monitoring...');
    console.log('📊 Index will update every 30 seconds for 3 minutes\n');

    let updateCount = 0;
    const maxUpdates = 6; // 3 minutes

    // Set up real-time monitoring
    const monitoringInterval = setInterval(() => {
      updateCount++;
      
      console.log(`📈 === REFINED UPDATE #${updateCount} - ${new Date().toLocaleTimeString()} ===`);
      
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
        console.log(`   ${trend} ${category.toUpperCase()}: ${data.index.toFixed(1)}% (${strength} ${data.interpretation})`);
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
    console.error('❌ Error in refined demo:', error);
    cryptoIndex.stop();
  }
}

/**
 * Show final summary of the refined demo
 */
function showFinalSummary(cryptoIndex) {
  console.log('🏁 === FINAL REFINED DEMO SUMMARY ===\n');
  
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
    console.log(`   ${trend} ${category.toUpperCase()}: ${data.index.toFixed(1)}% (${data.interpretation})`);
  }
  
  console.log('\n✅ Refined demo completed successfully!');
  console.log('💡 The index now uses proper probability extraction logic!');
  console.log('🔄 You can run this demo anytime with: npm run refined');
  console.log('📊 Improved accuracy with UPFI-style methodology');
  
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

// Run the refined demo
if (import.meta.url === `file://${process.argv[1]}`) {
  runRefinedDemo().catch(console.error);
}

export { runRefinedDemo };

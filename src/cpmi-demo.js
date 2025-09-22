import { CPMI } from './CPMI.js';
import { SimplePolymarketClient } from './clients/SimplePolymarketClient.js';

/**
 * CPMI Demo - Crypto Prediction Market Index
 * Advanced crypto-specific prediction market index with sophisticated weighting
 */
async function runCPMIDemo() {
  console.log('🚀 === CPMI (Crypto Prediction Market Index) DEMO ===\n');
  console.log('📊 Advanced crypto-specific prediction market index');
  console.log('🎯 Sophisticated weighting with Bayesian updates and volume momentum\n');

  // Initialize the CPMI
  const cpmi = new CPMI({
    categoryWeights: {
      // Primary Categories (80% Total Weight)
      'bitcoin-price': 0.30,        // Bitcoin Price Direction (30%)
      'ethereum-ecosystem': 0.25,   // Ethereum Ecosystem (25%)
      'regulatory-outcomes': 0.25,  // Regulatory Outcomes (25%)
      
      // Secondary Categories (20% Total Weight)
      'defi-protocols': 0.10,       // DeFi Protocol Performance (10%)
      'market-infrastructure': 0.05, // Market Infrastructure (5%)
      'technology-milestones': 0.05  // Technology Milestones (5%)
    },
    
    sensitivity: {
      volume: 8,                    // Volume Sensitivity (8/10)
      time: 6,                      // Time to Expiration (6/10)
      impact: 9,                    // Market Impact (9/10)
      liquidity: 7                  // Liquidity Score (7/10)
    },
    
    betaDistribution: {
      uninformedPrior: { alpha: 1, beta: 1 },
      informedPrior: { alpha: 2, beta: 2 },
      volumeMomentumAlpha: 0.1
    },
    
    marketCriteria: {
      minTimeHorizon: 30,           // Minimum 30 days until resolution
      minVolume: 100,               // Minimum volume threshold
      maxDataLatency: 5,            // Maximum 5-minute data latency
      requiredDataQuality: true     // Require complete historical coverage
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
    
    // Show sample trades with CPMI analysis
    console.log('\n📊 Sample Trades with CPMI Analysis:');
    const cryptoTrades = cpmi.filterCryptoTrades(trades);
    
    if (cryptoTrades.length > 0) {
      const sampleTrades = cryptoTrades.slice(0, 5);
      
      for (let i = 0; i < sampleTrades.length; i++) {
        const trade = sampleTrades[i];
        console.log(`\n   ${i + 1}. ${trade.title}`);
        console.log(`      Side: ${trade.side}, Size: ${trade.size}, Price: $${trade.price}`);
        console.log(`      User: ${trade.name || trade.pseudonym || 'Anonymous'}`);
        console.log(`      Time: ${new Date(trade.timestamp * 1000).toLocaleString()}`);
        
        // Show CPMI analysis
        const category = cpmi.classifyMarketCategory(trade.title);
        const marketType = cpmi.classifyMarketType(trade.title);
        console.log(`      CPMI Category: ${category.toUpperCase()}`);
        console.log(`      Market Type: ${marketType.toUpperCase()}`);
        
        // Show market criteria check
        const meetsCriteria = cpmi.meetsCPMICriteria(trade);
        console.log(`      Meets CPMI Criteria: ${meetsCriteria ? '✅' : '❌'}`);
        
        if (meetsCriteria) {
          const resolutionDate = cpmi.extractResolutionDate(trade.title);
          if (resolutionDate) {
            const daysUntil = Math.ceil((resolutionDate - new Date()) / (1000 * 60 * 60 * 24));
            console.log(`      Days Until Resolution: ${daysUntil}`);
          }
        }
      }
    }

    console.log('\n🔄 Step 3: Processing markets with CPMI logic...');
    const cryptoMarkets = cpmi.processCryptoTradesCPMI(cryptoTrades);
    console.log(`✅ Processed ${cryptoMarkets.length} crypto markets with CPMI logic`);
    
    if (cryptoMarkets.length > 0) {
      console.log('\n📈 CPMI Market Analysis:');
      cryptoMarkets.slice(0, 3).forEach((market, index) => {
        console.log(`\n   ${index + 1}. ${market.title}`);
        console.log(`      CPMI Category: ${market.category.toUpperCase()}`);
        console.log(`      Market Type: ${market.marketType.toUpperCase()}`);
        console.log(`      Trades: ${market.trades.length}, Volume: ${market.totalVolume.toFixed(2)}`);
        console.log(`      Buy/Sell: ${market.buyTrades}/${market.sellTrades} trades`);
        console.log(`      Bullish Probability: ${market.bullishProbability?.toFixed(1)}%`);
        console.log(`      Confidence: ${(market.confidence * 100).toFixed(1)}%`);
        console.log(`      Liquidity Score: ${(market.liquidityScore * 100).toFixed(1)}%`);
        console.log(`      Volume Momentum: ${(market.volumeMomentum * 100).toFixed(1)}%`);
        console.log(`      Beta Distribution: α=${market.betaDistribution?.alpha?.toFixed(2)}, β=${market.betaDistribution?.beta?.toFixed(2)}`);
      });
    }

    console.log('\n🔄 Step 4: Starting CPMI...');
    const started = await cpmi.start();
    
    if (!started) {
      throw new Error('Failed to start CPMI');
    }

    console.log('✅ CPMI started successfully!\n');

    // Wait for initial calculation
    console.log('⏳ Waiting for initial index calculation...');
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Show initial results
    const currentIndex = cpmi.getCurrentIndex();
    const breakdown = cpmi.getCategoryBreakdown();
    
    console.log('📊 === CPMI RESULTS ===');
    console.log(`🎯 Index Value: ${currentIndex.value.toFixed(2)}`);
    console.log(`📈 Interpretation: ${currentIndex.interpretation}`);
    console.log(`🕐 Last Update: ${currentIndex.lastUpdate?.toLocaleTimeString() || 'Never'}`);
    
    console.log('\n📋 CPMI Category Breakdown:');
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
    console.log('📊 CPMI will update every 30 seconds for 3 minutes\n');

    let updateCount = 0;
    const maxUpdates = 6; // 3 minutes

    // Set up real-time monitoring
    const monitoringInterval = setInterval(() => {
      updateCount++;
      
      console.log(`📈 === CPMI UPDATE #${updateCount} - ${new Date().toLocaleTimeString()} ===`);
      
      const currentIndex = cpmi.getCurrentIndex();
      const categoryBreakdown = cpmi.getCategoryBreakdown();
      const statistics = cpmi.getIndexStatistics();
      
      // Display index value and interpretation
      console.log(`🎯 CPMI Value: ${currentIndex.value.toFixed(2)} (${currentIndex.interpretation})`);
      
      // Show market sentiment analysis
      if (currentIndex.value > 105) {
        console.log('🚀 STRONG BULLISH: Crypto markets showing strong positive sentiment');
      } else if (currentIndex.value > 100) {
        console.log('📈 BULLISH: Crypto markets showing positive sentiment');
      } else if (currentIndex.value < 95) {
        console.log('📉 BEARISH: Crypto markets showing negative sentiment');
      } else if (currentIndex.value < 100) {
        console.log('🐻 WEAK BEARISH: Crypto markets showing weak negative sentiment');
      } else {
        console.log('⚖️ NEUTRAL: Crypto markets showing balanced sentiment');
      }

      // Display category performance
      console.log('\n📊 CPMI Category Performance:');
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
        showFinalSummary(cpmi);
      }
    }, 30000); // Update every 30 seconds

  } catch (error) {
    console.error('❌ Error in CPMI demo:', error);
    cpmi.stop();
  }
}

/**
 * Show final summary of the CPMI demo
 */
function showFinalSummary(cpmi) {
  console.log('🏁 === FINAL CPMI DEMO SUMMARY ===\n');
  
  const finalData = cpmi.exportIndexData();
  
  console.log('📊 Final CPMI Results:');
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
  
  console.log('\n📋 Final CPMI Category Breakdown:');
  for (const [category, data] of Object.entries(finalData.categoryBreakdown)) {
    const trend = data.deviation > 0 ? '📈' : '📉';
    console.log(`   ${trend} ${category.toUpperCase()}: ${data.index.toFixed(1)}% (${data.interpretation})`);
  }
  
  console.log('\n✅ CPMI demo completed successfully!');
  console.log('💡 The CPMI uses advanced crypto-specific methodology!');
  console.log('🔄 You can run this demo anytime with: npm run cpmi');
  console.log('📊 Features: Bayesian updates, volume momentum, liquidity scoring');
  console.log('🎯 Categories: Bitcoin (30%), Ethereum (25%), Regulatory (25%), DeFi (10%), Infrastructure (5%), Tech (5%)');
  
  cpmi.stop();
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

// Run the CPMI demo
if (import.meta.url === `file://${process.argv[1]}`) {
  runCPMIDemo().catch(console.error);
}

export { runCPMIDemo };

import { SimplePolymarketClient } from './clients/SimplePolymarketClient.js';

/**
 * Test different probability extraction logic approaches
 * Compare which method gives the most realistic results
 */
async function testProbabilityExtraction() {
  console.log('🧪 === PROBABILITY EXTRACTION LOGIC TEST ===\n');
  console.log('📊 Testing different approaches to extract probabilities from market data\n');

  try {
    // Fetch real market data
    const client = new SimplePolymarketClient();
    const tradesResponse = await client.getAllRecentTrades(100);
    
    if (!tradesResponse.success) {
      throw new Error(`Failed to fetch trades: ${tradesResponse.error}`);
    }
    
    const trades = tradesResponse.data;
    console.log(`✅ Fetched ${trades.length} recent trades from Polymarket\n`);
    
    // Filter for crypto-related trades
    const cryptoKeywords = [
      'bitcoin', 'btc', 'ethereum', 'eth', 'crypto', 'cryptocurrency',
      'defi', 'nft', 'meme', 'coin', 'token', 'blockchain', 'web3',
      'solana', 'sol', 'cardano', 'ada', 'polkadot', 'dot', 'chainlink',
      'link', 'uniswap', 'uni', 'aave', 'compound', 'maker', 'mkr',
      'dogecoin', 'doge', 'shiba', 'shib', 'pepe', 'floki', 'bonk'
    ];
    
    const cryptoTrades = trades.filter(trade => {
      const title = trade.title?.toLowerCase() || '';
      const slug = trade.slug?.toLowerCase() || '';
      const eventSlug = trade.eventSlug?.toLowerCase() || '';
      
      return cryptoKeywords.some(keyword => 
        title.includes(keyword) || 
        slug.includes(keyword) || 
        eventSlug.includes(keyword)
      );
    });
    
    console.log(`🔍 Found ${cryptoTrades.length} crypto-related trades\n`);
    
    if (cryptoTrades.length === 0) {
      console.log('⚠️ No crypto trades found for testing');
      return;
    }
    
    // Group trades by market
    const markets = new Map();
    cryptoTrades.forEach(trade => {
      const marketKey = trade.conditionId;
      
      if (!markets.has(marketKey)) {
        markets.set(marketKey, {
          conditionId: trade.conditionId,
          title: trade.title,
          trades: [],
          totalVolume: 0,
          totalValue: 0,
          buyVolume: 0,
          sellVolume: 0,
          buyTrades: 0,
          sellTrades: 0,
          avgPrice: 0
        });
      }
      
      const market = markets.get(marketKey);
      market.trades.push(trade);
      market.totalVolume += trade.size;
      market.totalValue += trade.size * trade.price;
      
      if (trade.side === 'BUY') {
        market.buyVolume += trade.size;
        market.buyTrades++;
      } else {
        market.sellVolume += trade.size;
        market.sellTrades++;
      }
    });
    
    // Calculate averages
    markets.forEach(market => {
      if (market.totalVolume > 0) {
        market.avgPrice = market.totalValue / market.totalVolume;
      }
    });
    
    const marketArray = Array.from(markets.values());
    console.log(`📊 Processed ${marketArray.length} crypto markets\n`);
    
    // Test different probability extraction methods
    console.log('🧪 === TESTING DIFFERENT PROBABILITY EXTRACTION METHODS ===\n');
    
    const testMarkets = marketArray.slice(0, 5); // Test first 5 markets
    
    for (let i = 0; i < testMarkets.length; i++) {
      const market = testMarkets[i];
      console.log(`📈 Market ${i + 1}: ${market.title}`);
      console.log(`   Trades: ${market.trades.length}, Volume: ${market.totalVolume.toFixed(2)}`);
      console.log(`   Buy/Sell: ${market.buyTrades}/${market.sellTrades}, Avg Price: $${market.avgPrice.toFixed(2)}`);
      
      // Test Method 1: Simple Price as Probability
      const method1 = testMethod1_SimplePrice(market);
      console.log(`   Method 1 (Simple Price): ${method1.toFixed(1)}%`);
      
      // Test Method 2: Market Type Classification
      const method2 = testMethod2_MarketType(market);
      console.log(`   Method 2 (Market Type): ${method2.toFixed(1)}%`);
      
      // Test Method 3: Sentiment Analysis
      const method3 = testMethod3_Sentiment(market);
      console.log(`   Method 3 (Sentiment): ${method3.toFixed(1)}%`);
      
      // Test Method 4: Hybrid Approach
      const method4 = testMethod4_Hybrid(market);
      console.log(`   Method 4 (Hybrid): ${method4.toFixed(1)}%`);
      
      // Test Method 5: Refined Logic (Current Working)
      const method5 = testMethod5_Refined(market);
      console.log(`   Method 5 (Refined): ${method5.toFixed(1)}%`);
      
      console.log('');
    }
    
    // Calculate overall index for each method
    console.log('📊 === OVERALL INDEX COMPARISON ===\n');
    
    const method1Index = calculateOverallIndex(marketArray, testMethod1_SimplePrice);
    const method2Index = calculateOverallIndex(marketArray, testMethod2_MarketType);
    const method3Index = calculateOverallIndex(marketArray, testMethod3_Sentiment);
    const method4Index = calculateOverallIndex(marketArray, testMethod4_Hybrid);
    const method5Index = calculateOverallIndex(marketArray, testMethod5_Refined);
    
    console.log(`Method 1 (Simple Price): ${method1Index.toFixed(2)} (${getInterpretation(method1Index)})`);
    console.log(`Method 2 (Market Type): ${method2Index.toFixed(2)} (${getInterpretation(method2Index)})`);
    console.log(`Method 3 (Sentiment): ${method3Index.toFixed(2)} (${getInterpretation(method3Index)})`);
    console.log(`Method 4 (Hybrid): ${method4Index.toFixed(2)} (${getInterpretation(method4Index)})`);
    console.log(`Method 5 (Refined): ${method5Index.toFixed(2)} (${getInterpretation(method5Index)})`);
    
    console.log('\n🎯 === ANALYSIS ===');
    console.log('Method 1: Uses price directly as probability - simple but may not reflect true sentiment');
    console.log('Method 2: Classifies market type first, then extracts probability - more sophisticated');
    console.log('Method 3: Uses trade sentiment (buy/sell ratio) - reflects actual trading behavior');
    console.log('Method 4: Combines multiple approaches - balanced but complex');
    console.log('Method 5: Refined logic with proper market type handling - most accurate');
    
    // Show which method gives most realistic results
    const methods = [
      { name: 'Simple Price', value: method1Index },
      { name: 'Market Type', value: method2Index },
      { name: 'Sentiment', value: method3Index },
      { name: 'Hybrid', value: method4Index },
      { name: 'Refined', value: method5Index }
    ];
    
    // Find method closest to neutral (100)
    const closestToNeutral = methods.reduce((closest, current) => 
      Math.abs(current.value - 100) < Math.abs(closest.value - 100) ? current : closest
    );
    
    console.log(`\n🏆 Most Realistic (closest to neutral): ${closestToNeutral.name} (${closestToNeutral.value.toFixed(2)})`);
    
  } catch (error) {
    console.error('❌ Error in probability extraction test:', error);
  }
}

/**
 * Method 1: Simple Price as Probability
 */
function testMethod1_SimplePrice(market) {
  return market.avgPrice * 100;
}

/**
 * Method 2: Market Type Classification
 */
function testMethod2_MarketType(market) {
  const title = market.title.toLowerCase();
  const avgPrice = market.avgPrice;
  
  // Classify market type
  let marketType = 'unknown';
  if (title.includes('will') && (title.includes('?') || title.includes('yes') || title.includes('no'))) {
    marketType = 'binary';
  } else if (title.includes('price') || title.includes('$') || title.includes('reach')) {
    marketType = 'price_prediction';
  } else if (title.includes('between') || title.includes('range')) {
    marketType = 'range';
  } else if (title.includes('up') || title.includes('down') || title.includes('higher') || title.includes('lower')) {
    marketType = 'directional';
  }
  
  // Extract probability based on type
  switch (marketType) {
    case 'binary':
      return avgPrice * 100;
    case 'price_prediction':
      return avgPrice * 100;
    case 'range':
      return avgPrice * 100;
    case 'directional':
      return avgPrice * 100;
    default:
      return 50; // Default to neutral
  }
}

/**
 * Method 3: Sentiment Analysis
 */
function testMethod3_Sentiment(market) {
  const buyRatio = market.buyTrades / (market.buyTrades + market.sellTrades);
  const volumeRatio = market.buyVolume / (market.buyVolume + market.sellVolume);
  
  // Weighted average of trade count and volume
  const sentiment = (buyRatio * 0.6) + (volumeRatio * 0.4);
  
  return sentiment * 100;
}

/**
 * Method 4: Hybrid Approach
 */
function testMethod4_Hybrid(market) {
  const priceProb = testMethod1_SimplePrice(market);
  const sentimentProb = testMethod3_Sentiment(market);
  
  // Weighted combination
  return (priceProb * 0.7) + (sentimentProb * 0.3);
}

/**
 * Method 5: Refined Logic (Current Working)
 */
function testMethod5_Refined(market) {
  const title = market.title.toLowerCase();
  const avgPrice = market.avgPrice;
  
  // Classify market type
  let marketType = 'unknown';
  if (title.includes('will') && (title.includes('?') || title.includes('yes') || title.includes('no'))) {
    marketType = 'binary';
  } else if (title.includes('price') || title.includes('$') || title.includes('reach')) {
    marketType = 'price_prediction';
  } else if (title.includes('between') || title.includes('range')) {
    marketType = 'range';
  } else if (title.includes('up') || title.includes('down') || title.includes('higher') || title.includes('lower')) {
    marketType = 'directional';
  }
  
  // Extract probability based on type with proper logic
  switch (marketType) {
    case 'binary':
      return extractBinaryProbabilityRefined(market);
    case 'price_prediction':
      return extractPricePredictionProbabilityRefined(market);
    case 'range':
      return extractRangeProbabilityRefined(market);
    case 'directional':
      return extractDirectionalProbabilityRefined(market);
    default:
      return extractSentimentProbabilityRefined(market);
  }
}

/**
 * Refined probability extraction methods
 */
function extractBinaryProbabilityRefined(market) {
  const avgPrice = market.avgPrice;
  const title = market.title.toLowerCase();
  const isBullishOutcome = isBullishOutcomeRefined(title);
  
  if (isBullishOutcome) {
    return Math.min(Math.max(avgPrice * 100, 0), 100);
  } else {
    return Math.min(Math.max((1 - avgPrice) * 100, 0), 100);
  }
}

function extractPricePredictionProbabilityRefined(market) {
  const title = market.title.toLowerCase();
  const avgPrice = market.avgPrice;
  
  const targetPrice = extractTargetPrice(title);
  if (!targetPrice) return 50;
  
  const currentPrice = getCurrentPrice(title);
  if (!currentPrice) return 50;
  
  if (targetPrice > currentPrice) {
    return Math.min(Math.max(avgPrice * 100, 0), 100);
  } else {
    return Math.min(Math.max((1 - avgPrice) * 100, 0), 100);
  }
}

function extractRangeProbabilityRefined(market) {
  const title = market.title.toLowerCase();
  const avgPrice = market.avgPrice;
  
  const range = extractPriceRange(title);
  if (!range) return 50;
  
  const currentPrice = getCurrentPrice(title);
  if (!currentPrice) return 50;
  
  const isBullishRange = currentPrice < range.max && currentPrice > range.min;
  
  if (isBullishRange) {
    return Math.min(Math.max(avgPrice * 100, 0), 100);
  } else {
    return Math.min(Math.max((1 - avgPrice) * 100, 0), 100);
  }
}

function extractDirectionalProbabilityRefined(market) {
  const title = market.title.toLowerCase();
  const avgPrice = market.avgPrice;
  
  const isBullishDirection = title.includes('up') || title.includes('higher') || title.includes('rise');
  
  if (isBullishDirection) {
    return Math.min(Math.max(avgPrice * 100, 0), 100);
  } else {
    return Math.min(Math.max((1 - avgPrice) * 100, 0), 100);
  }
}

function extractSentimentProbabilityRefined(market) {
  const buyRatio = market.buyTrades / (market.buyTrades + market.sellTrades);
  const volumeRatio = market.buyVolume / (market.buyVolume + market.sellVolume);
  
  const sentiment = (buyRatio * 0.6) + (volumeRatio * 0.4);
  return Math.min(Math.max(sentiment * 100, 0), 100);
}

function isBullishOutcomeRefined(title) {
  const bullishKeywords = ['up', 'higher', 'rise', 'increase', 'bull', 'positive', 'yes', 'above', 'reach'];
  const bearishKeywords = ['down', 'lower', 'fall', 'decrease', 'bear', 'negative', 'no', 'below', 'crash'];
  
  const titleLower = title.toLowerCase();
  
  const bullishCount = bullishKeywords.filter(keyword => titleLower.includes(keyword)).length;
  const bearishCount = bearishKeywords.filter(keyword => titleLower.includes(keyword)).length;
  
  return bullishCount > bearishCount;
}

function extractTargetPrice(title) {
  const priceMatch = title.match(/\$([0-9,]+(?:\.\d+)?)[kkm]?/i);
  if (priceMatch) {
    let price = parseFloat(priceMatch[1].replace(/,/g, ''));
    const unit = priceMatch[0].toLowerCase();
    
    if (unit.includes('k')) price *= 1000;
    if (unit.includes('m')) price *= 1000000;
    
    return price;
  }
  return null;
}

function extractPriceRange(title) {
  const rangeMatch = title.match(/\$([0-9,]+(?:\.\d+)?)[kkm]?\s*and\s*\$([0-9,]+(?:\.\d+)?)[kkm]?/i);
  if (rangeMatch) {
    let min = parseFloat(rangeMatch[1].replace(/,/g, ''));
    let max = parseFloat(rangeMatch[2].replace(/,/g, ''));
    
    const unit1 = rangeMatch[0].toLowerCase();
    const unit2 = rangeMatch[0].toLowerCase();
    
    if (unit1.includes('k')) min *= 1000;
    if (unit1.includes('m')) min *= 1000000;
    if (unit2.includes('k')) max *= 1000;
    if (unit2.includes('m')) max *= 1000000;
    
    return { min: Math.min(min, max), max: Math.max(min, max) };
  }
  return null;
}

function getCurrentPrice(title) {
  const titleLower = title.toLowerCase();
  
  if (titleLower.includes('bitcoin') || titleLower.includes('btc')) {
    return 105000; // Example current Bitcoin price
  }
  if (titleLower.includes('ethereum') || titleLower.includes('eth')) {
    return 3500; // Example current Ethereum price
  }
  if (titleLower.includes('solana') || titleLower.includes('sol')) {
    return 200; // Example current Solana price
  }
  
  return null;
}

/**
 * Calculate overall index for a method
 */
function calculateOverallIndex(markets, probabilityFunction) {
  let totalWeightedProbability = 0;
  let totalWeight = 0;
  
  markets.forEach(market => {
    const probability = probabilityFunction(market);
    const weight = market.totalVolume; // Use volume as weight
    
    totalWeightedProbability += probability * weight;
    totalWeight += weight;
  });
  
  if (totalWeight === 0) return 100;
  
  const overallProbability = totalWeightedProbability / totalWeight;
  return 100 + (overallProbability - 50);
}

/**
 * Get index interpretation
 */
function getInterpretation(index) {
  if (index > 100) {
    return `Bullish (+${(index - 100).toFixed(1)})`;
  } else if (index < 100) {
    return `Bearish (${(index - 100).toFixed(1)})`;
  } else {
    return 'Neutral (0.0)';
  }
}

// Run the test
if (import.meta.url === `file://${process.argv[1]}`) {
  testProbabilityExtraction().catch(console.error);
}

export { testProbabilityExtraction };

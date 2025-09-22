import { SimplePolymarketClient } from './clients/SimplePolymarketClient.js';
import { WeightedAverageCalculator } from './utils/WeightedAverageCalculator.js';
import { DataValidator } from './utils/DataValidator.js';
import { TradeData, MarketData } from './types/index.js';

/**
 * Refined Crypto Market Index with accurate UPFI-style methodology
 * Properly extracts probabilities and implements correct weighting
 */
export class RefinedCryptoIndex {
  constructor(config = {}) {
    this.config = {
      // Category weights for different crypto market types
      categoryWeights: {
        'major-crypto': 0.40,      // BTC, ETH, major cryptocurrencies (40%)
        'altcoins': 0.30,          // Alternative cryptocurrencies (30%)
        'defi': 0.20,              // DeFi tokens and protocols (20%)
        'meme-coins': 0.08,        // Meme coins and viral tokens (8%)
        'nft-gaming': 0.02         // NFT and gaming tokens (2%)
      },
      
      // Sensitivity parameters (0-10 scale) - matching UPFI defaults
      sensitivity: {
        volume: 7,                 // High importance of trading activity
        time: 6,                   // Moderate preference for near-term markets
        marketCap: 5,              // Balanced market cap representation
        impact: 8                  // Strong emphasis on market significance
      },
      
      // Index configuration
      baselineValue: 100,          // Perfect market balance baseline
      updateInterval: 5 * 60 * 1000, // 5 minutes
      smoothingPeriod: 60 * 60 * 1000, // 1 hour SMA
      
      ...config
    };

    this.client = new SimplePolymarketClient();
    this.calculator = new WeightedAverageCalculator();
    this.validator = DataValidator;
    
    // Index state
    this.currentIndex = this.config.baselineValue;
    this.historicalValues = [];
    this.categoryIndices = {};
    this.lastUpdate = null;
    this.isRunning = false;
    
    // Market categorization
    this.marketCategories = new Map();
    this.initializeMarketCategories();
    
    // Crypto market detection keywords
    this.cryptoKeywords = [
      'bitcoin', 'btc', 'ethereum', 'eth', 'crypto', 'cryptocurrency',
      'defi', 'nft', 'meme', 'coin', 'token', 'blockchain', 'web3',
      'solana', 'sol', 'cardano', 'ada', 'polkadot', 'dot', 'chainlink',
      'link', 'uniswap', 'uni', 'aave', 'compound', 'maker', 'mkr',
      'dogecoin', 'doge', 'shiba', 'shib', 'pepe', 'floki', 'bonk'
    ];

    // Current crypto prices for context (would be fetched from real API)
    this.currentPrices = {
      'BTC': 105000,  // Example current Bitcoin price
      'ETH': 3500,    // Example current Ethereum price
      'SOL': 200,     // Example current Solana price
    };
  }

  /**
   * Initialize market categories based on crypto types
   */
  initializeMarketCategories() {
    // Major cryptocurrencies
    this.marketCategories.set('major-crypto', [
      'bitcoin', 'btc', 'ethereum', 'eth', 'binance', 'bnb', 'ripple', 'xrp',
      'cardano', 'ada', 'solana', 'sol', 'polkadot', 'dot', 'dogecoin', 'doge',
      'avalanche', 'avax', 'polygon', 'matic'
    ]);

    // Altcoins
    this.marketCategories.set('altcoins', [
      'chainlink', 'link', 'uniswap', 'uni', 'litecoin', 'ltc', 'cosmos', 'atom',
      'filecoin', 'fil', 'tron', 'trx', 'ethereum classic', 'etc', 'stellar', 'xlm',
      'vechain', 'vet', 'internet computer', 'icp'
    ]);

    // DeFi tokens
    this.marketCategories.set('defi', [
      'aave', 'compound', 'comp', 'maker', 'mkr', 'synthetix', 'snx', 'yearn', 'yfi',
      'sushiswap', 'sushi', 'curve', 'crv', '1inch', 'balancer', 'bal', 'lend'
    ]);

    // Meme coins
    this.marketCategories.set('meme-coins', [
      'shiba inu', 'shib', 'pepe', 'dogecoin', 'doge', 'floki', 'bonk', 'meme'
    ]);

    // NFT and Gaming
    this.marketCategories.set('nft-gaming', [
      'axie infinity', 'axs', 'sandbox', 'sand', 'decentraland', 'mana', 'enjin', 'enj', 'gala'
    ]);
  }

  /**
   * Start the refined crypto market index
   */
  async start() {
    try {
      console.log('🚀 Starting Refined Crypto Market Index...');
      
      // Test API connection
      const healthCheck = await this.client.healthCheck();
      if (!healthCheck.success) {
        throw new Error('Failed to connect to Polymarket API');
      }
      
      console.log('✅ Connected to Polymarket API successfully!');
      
      // Start index calculation loop
      this.isRunning = true;
      await this.calculateIndex();
      
      // Set up periodic updates
      this.updateInterval = setInterval(() => {
        if (this.isRunning) {
          this.calculateIndex();
        }
      }, this.config.updateInterval);

      console.log('✅ Refined Crypto Market Index started successfully');
      return true;
    } catch (error) {
      console.error('❌ Failed to start Refined Crypto Market Index:', error);
      return false;
    }
  }

  /**
   * Stop the crypto market index
   */
  stop() {
    this.isRunning = false;
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
    }
    console.log('🛑 Refined Crypto Market Index stopped');
  }

  /**
   * Calculate the refined crypto market index
   */
  async calculateIndex() {
    try {
      console.log('📊 Fetching trade data from Polymarket...');
      
      // Fetch recent trades
      const tradesResponse = await this.client.getAllRecentTrades(2000);
      if (!tradesResponse.success) {
        throw new Error(`Failed to fetch trades: ${tradesResponse.error}`);
      }
      
      const trades = tradesResponse.data;
      console.log(`📈 Fetched ${trades.length} recent trades`);
      
      // Filter for crypto-related trades
      const cryptoTrades = this.filterCryptoTrades(trades);
      console.log(`🔍 Found ${cryptoTrades.length} crypto-related trades`);
      
      if (cryptoTrades.length === 0) {
        console.log('⚠️ No crypto trades found in recent data');
        return;
      }
      
      // Process crypto markets with refined logic
      const cryptoMarkets = this.processCryptoTradesRefined(cryptoTrades);
      console.log(`📊 Processed ${cryptoMarkets.length} crypto markets`);
      
      // Calculate category indices
      const categoryIndices = {};
      let totalWeightedProbability = 0;
      let totalWeight = 0;

      for (const [category, keywords] of this.marketCategories) {
        const categoryIndex = this.calculateCategoryIndexRefined(category, keywords, cryptoMarkets);
        categoryIndices[category] = categoryIndex;

        if (categoryIndex !== null) {
          const categoryWeight = this.config.categoryWeights[category];
          totalWeightedProbability += categoryIndex * categoryWeight;
          totalWeight += categoryWeight;
        }
      }

      // Calculate overall index
      if (totalWeight > 0) {
        const overallProbability = totalWeightedProbability / totalWeight;
        this.currentIndex = this.config.baselineValue + (overallProbability - 50);
        
        // Apply smoothing (1-hour SMA)
        this.historicalValues.push({
          timestamp: new Date(),
          value: this.currentIndex,
          probability: overallProbability
        });

        // Keep only last hour of data for SMA
        const oneHourAgo = new Date(Date.now() - this.config.smoothingPeriod);
        this.historicalValues = this.historicalValues.filter(
          entry => entry.timestamp >= oneHourAgo
        );

        // Calculate smoothed index
        if (this.historicalValues.length > 0) {
          const sum = this.historicalValues.reduce((acc, entry) => acc + entry.value, 0);
          this.currentIndex = sum / this.historicalValues.length;
        }
      }

      this.categoryIndices = categoryIndices;
      this.lastUpdate = new Date();

      console.log(`📈 Refined Crypto Market Index: ${this.currentIndex.toFixed(2)} (${this.getIndexInterpretation()})`);
      
    } catch (error) {
      console.error('❌ Error calculating refined index:', error);
    }
  }

  /**
   * Filter trades for crypto-related markets
   */
  filterCryptoTrades(trades) {
    return trades.filter(trade => {
      const title = trade.title?.toLowerCase() || '';
      const slug = trade.slug?.toLowerCase() || '';
      const eventSlug = trade.eventSlug?.toLowerCase() || '';
      
      // Check if any crypto keywords are present
      return this.cryptoKeywords.some(keyword => 
        title.includes(keyword) || 
        slug.includes(keyword) || 
        eventSlug.includes(keyword)
      );
    });
  }

  /**
   * Process crypto trades with refined logic
   */
  processCryptoTradesRefined(trades) {
    const cryptoMarkets = new Map();
    
    trades.forEach(trade => {
      const marketKey = trade.conditionId;
      
      if (!cryptoMarkets.has(marketKey)) {
        cryptoMarkets.set(marketKey, {
          conditionId: trade.conditionId,
          title: trade.title,
          slug: trade.slug,
          eventSlug: trade.eventSlug,
          icon: trade.icon,
          trades: [],
          totalVolume: 0,
          totalValue: 0,
          buyVolume: 0,
          sellVolume: 0,
          buyTrades: 0,
          sellTrades: 0,
          avgPrice: 0,
          lastTrade: null,
          // Refined fields
          marketType: this.classifyMarketType(trade.title),
          bullishProbability: null,
          confidence: 0
        });
      }
      
      const market = cryptoMarkets.get(marketKey);
      market.trades.push(trade);
      market.totalVolume += trade.size;
      market.totalValue += trade.size * trade.price;
      market.lastTrade = trade;
      
      if (trade.side === 'BUY') {
        market.buyVolume += trade.size;
        market.buyTrades++;
      } else {
        market.sellVolume += trade.size;
        market.sellTrades++;
      }
    });
    
    // Calculate refined metrics
    cryptoMarkets.forEach(market => {
      if (market.totalVolume > 0) {
        market.avgPrice = market.totalValue / market.totalVolume;
      }
      
      // Calculate bullish probability using refined logic
      market.bullishProbability = this.calculateBullishProbability(market);
      
      // Calculate confidence based on volume and trade count
      market.confidence = this.calculateMarketConfidence(market);
    });
    
    return Array.from(cryptoMarkets.values());
  }

  /**
   * Classify market type for proper probability extraction
   */
  classifyMarketType(title) {
    const titleLower = title.toLowerCase();
    
    // Binary outcome markets (true/false, yes/no)
    if (titleLower.includes('will') && (titleLower.includes('?') || titleLower.includes('yes') || titleLower.includes('no'))) {
      return 'binary';
    }
    
    // Price prediction markets
    if (titleLower.includes('price') || titleLower.includes('$') || titleLower.includes('reach')) {
      return 'price_prediction';
    }
    
    // Range markets
    if (titleLower.includes('between') || titleLower.includes('range')) {
      return 'range';
    }
    
    // Directional markets (up/down, higher/lower)
    if (titleLower.includes('up') || titleLower.includes('down') || titleLower.includes('higher') || titleLower.includes('lower')) {
      return 'directional';
    }
    
    return 'unknown';
  }

  /**
   * Calculate bullish probability using refined logic
   */
  calculateBullishProbability(market) {
    const title = market.title.toLowerCase();
    const marketType = market.marketType;
    
    switch (marketType) {
      case 'binary':
        return this.extractBinaryProbability(market);
      
      case 'price_prediction':
        return this.extractPricePredictionProbability(market);
      
      case 'range':
        return this.extractRangeProbability(market);
      
      case 'directional':
        return this.extractDirectionalProbability(market);
      
      default:
        return this.extractSentimentProbability(market);
    }
  }

  /**
   * Extract probability from binary outcome markets
   */
  extractBinaryProbability(market) {
    // For binary markets, use the average price as probability
    // This is the most accurate for true prediction markets
    const avgPrice = market.avgPrice;
    
    // Determine if the outcome is bullish or bearish
    const title = market.title.toLowerCase();
    const isBullishOutcome = this.isBullishOutcome(title);
    
    if (isBullishOutcome) {
      // If the outcome is bullish, price = probability of bullish
      return Math.min(Math.max(avgPrice * 100, 0), 100);
    } else {
      // If the outcome is bearish, price = probability of bearish
      return Math.min(Math.max((1 - avgPrice) * 100, 0), 100);
    }
  }

  /**
   * Extract probability from price prediction markets
   */
  extractPricePredictionProbability(market) {
    const title = market.title.toLowerCase();
    const avgPrice = market.avgPrice;
    
    // Extract target price from title
    const targetPrice = this.extractTargetPrice(title);
    if (!targetPrice) return 50; // Default to neutral
    
    // Get current price for comparison
    const currentPrice = this.getCurrentPrice(title);
    if (!currentPrice) return 50; // Default to neutral
    
    // Calculate probability based on price relationship
    if (targetPrice > currentPrice) {
      // Target is higher than current - bullish prediction
      // Higher price = higher probability of reaching target
      return Math.min(Math.max(avgPrice * 100, 0), 100);
    } else {
      // Target is lower than current - bearish prediction
      // Higher price = lower probability of reaching target
      return Math.min(Math.max((1 - avgPrice) * 100, 0), 100);
    }
  }

  /**
   * Extract probability from range markets
   */
  extractRangeProbability(market) {
    const title = market.title.toLowerCase();
    const avgPrice = market.avgPrice;
    
    // Extract range from title
    const range = this.extractPriceRange(title);
    if (!range) return 50; // Default to neutral
    
    // Get current price for comparison
    const currentPrice = this.getCurrentPrice(title);
    if (!currentPrice) return 50; // Default to neutral
    
    // Determine if range is bullish or bearish relative to current price
    const isBullishRange = currentPrice < range.max && currentPrice > range.min;
    
    if (isBullishRange) {
      // Current price is in the range - use price as probability
      return Math.min(Math.max(avgPrice * 100, 0), 100);
    } else {
      // Current price is outside range - use inverse probability
      return Math.min(Math.max((1 - avgPrice) * 100, 0), 100);
    }
  }

  /**
   * Extract probability from directional markets
   */
  extractDirectionalProbability(market) {
    const title = market.title.toLowerCase();
    const avgPrice = market.avgPrice;
    
    // Determine direction from title
    const isBullishDirection = title.includes('up') || title.includes('higher') || title.includes('rise');
    
    if (isBullishDirection) {
      // Bullish direction - use price as probability
      return Math.min(Math.max(avgPrice * 100, 0), 100);
    } else {
      // Bearish direction - use inverse probability
      return Math.min(Math.max((1 - avgPrice) * 100, 0), 100);
    }
  }

  /**
   * Extract probability from sentiment analysis
   */
  extractSentimentProbability(market) {
    // Use trade sentiment as fallback
    const buyRatio = market.buyTrades / (market.buyTrades + market.sellTrades);
    const volumeRatio = market.buyVolume / (market.buyVolume + market.sellVolume);
    
    // Weighted average of trade count and volume
    const sentiment = (buyRatio * 0.6) + (volumeRatio * 0.4);
    
    // Convert to probability (0-100%)
    return Math.min(Math.max(sentiment * 100, 0), 100);
  }

  /**
   * Determine if an outcome is bullish
   */
  isBullishOutcome(title) {
    const bullishKeywords = ['up', 'higher', 'rise', 'increase', 'bull', 'positive', 'yes'];
    const bearishKeywords = ['down', 'lower', 'fall', 'decrease', 'bear', 'negative', 'no'];
    
    const titleLower = title.toLowerCase();
    
    const bullishCount = bullishKeywords.filter(keyword => titleLower.includes(keyword)).length;
    const bearishCount = bearishKeywords.filter(keyword => titleLower.includes(keyword)).length;
    
    return bullishCount > bearishCount;
  }

  /**
   * Extract target price from title
   */
  extractTargetPrice(title) {
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

  /**
   * Extract price range from title
   */
  extractPriceRange(title) {
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

  /**
   * Get current price for a crypto from title
   */
  getCurrentPrice(title) {
    const titleLower = title.toLowerCase();
    
    if (titleLower.includes('bitcoin') || titleLower.includes('btc')) {
      return this.currentPrices.BTC;
    }
    if (titleLower.includes('ethereum') || titleLower.includes('eth')) {
      return this.currentPrices.ETH;
    }
    if (titleLower.includes('solana') || titleLower.includes('sol')) {
      return this.currentPrices.SOL;
    }
    
    return null;
  }

  /**
   * Calculate market confidence
   */
  calculateMarketConfidence(market) {
    const volumeConfidence = Math.min(market.totalVolume / 1000, 1); // Cap at 1
    const tradeConfidence = Math.min(market.trades.length / 10, 1); // Cap at 1
    const timeConfidence = market.lastTrade ? 
      Math.max(0, 1 - (Date.now() - market.lastTrade.timestamp * 1000) / (24 * 60 * 60 * 1000)) : 0;
    
    return (volumeConfidence * 0.5) + (tradeConfidence * 0.3) + (timeConfidence * 0.2);
  }

  /**
   * Calculate index for a specific category with refined logic
   */
  calculateCategoryIndexRefined(category, keywords, cryptoMarkets) {
    try {
      let totalWeightedProbability = 0;
      let totalWeight = 0;

      // Find markets that match this category
      const categoryMarkets = cryptoMarkets.filter(market => {
        const title = market.title?.toLowerCase() || '';
        const slug = market.slug?.toLowerCase() || '';
        const eventSlug = market.eventSlug?.toLowerCase() || '';
        
        return keywords.some(keyword => 
          title.includes(keyword) || 
          slug.includes(keyword) || 
          eventSlug.includes(keyword)
        );
      });

      if (categoryMarkets.length === 0) {
        return null;
      }

      for (const market of categoryMarkets) {
        try {
          // Calculate market weight based on volume, time, market cap, and impact
          const marketWeight = this.calculateMarketWeightRefined(market);
          
          // Use the refined bullish probability
          const probability = market.bullishProbability;
          
          if (probability !== null && marketWeight > 0) {
            totalWeightedProbability += probability * marketWeight;
            totalWeight += marketWeight;
          }
        } catch (error) {
          console.warn(`⚠️ Error processing market ${market.title}:`, error.message);
        }
      }

      return totalWeight > 0 ? totalWeightedProbability / totalWeight : null;
    } catch (error) {
      console.error(`❌ Error calculating category index for ${category}:`, error);
      return null;
    }
  }

  /**
   * Calculate market weight with refined logic
   */
  calculateMarketWeightRefined(market) {
    const factors = {
      volume: this.calculateVolumeWeight(market),
      time: this.calculateTimeWeight(market),
      marketCap: this.calculateMarketCapWeight(market),
      impact: this.calculateImpactWeight(market),
      confidence: market.confidence || 0
    };

    // Weighted combination of factors including confidence
    const totalWeight = 
      factors.volume * (this.config.sensitivity.volume / 10) +
      factors.time * (this.config.sensitivity.time / 10) +
      factors.marketCap * (this.config.sensitivity.marketCap / 10) +
      factors.impact * (this.config.sensitivity.impact / 10) +
      factors.confidence * 0.5; // Additional confidence factor

    return totalWeight;
  }

  /**
   * Calculate volume-based weight
   */
  calculateVolumeWeight(market) {
    const volume = market.totalVolume || 0;
    // Normalize volume (higher volume = higher weight)
    return Math.min(volume / 1000, 1); // Cap at 1.0
  }

  /**
   * Calculate time-based weight (prefer more recent data)
   */
  calculateTimeWeight(market) {
    if (!market.lastTrade) return 0;
    
    const now = new Date();
    const lastTradeTime = new Date(market.lastTrade.timestamp * 1000);
    const dataAge = now - lastTradeTime;
    const maxAge = 24 * 60 * 60 * 1000; // 24 hours
    
    return Math.max(0, 1 - (dataAge / maxAge));
  }

  /**
   * Calculate market cap-based weight
   */
  calculateMarketCapWeight(market) {
    // Simplified market cap ranking based on title keywords
    const title = market.title?.toLowerCase() || '';
    
    if (title.includes('bitcoin') || title.includes('btc')) return 1.0;
    if (title.includes('ethereum') || title.includes('eth')) return 0.9;
    if (title.includes('solana') || title.includes('sol')) return 0.8;
    if (title.includes('cardano') || title.includes('ada')) return 0.7;
    if (title.includes('polkadot') || title.includes('dot')) return 0.6;
    if (title.includes('chainlink') || title.includes('link')) return 0.5;
    if (title.includes('uniswap') || title.includes('uni')) return 0.4;
    if (title.includes('dogecoin') || title.includes('doge')) return 0.3;
    
    return 0.2; // Default for other cryptos
  }

  /**
   * Calculate impact-based weight (market significance)
   */
  calculateImpactWeight(market) {
    // Major cryptocurrencies have higher impact
    const impactScores = {
      'major-crypto': 1.0,
      'altcoins': 0.7,
      'defi': 0.6,
      'meme-coins': 0.3,
      'nft-gaming': 0.2
    };

    // Find category for this market
    for (const [category, keywords] of this.marketCategories) {
      const title = market.title?.toLowerCase() || '';
      if (keywords.some(keyword => title.includes(keyword))) {
        return impactScores[category] || 0.1;
      }
    }
    
    return 0.1;
  }

  /**
   * Get index interpretation
   */
  getIndexInterpretation() {
    if (this.currentIndex > 100) {
      return `Bullish (+${(this.currentIndex - 100).toFixed(1)})`;
    } else if (this.currentIndex < 100) {
      return `Bearish (${(this.currentIndex - 100).toFixed(1)})`;
    } else {
      return 'Neutral (0.0)';
    }
  }

  /**
   * Get current index value
   */
  getCurrentIndex() {
    return {
      value: this.currentIndex,
      interpretation: this.getIndexInterpretation(),
      lastUpdate: this.lastUpdate,
      categoryIndices: this.categoryIndices,
      historicalValues: this.historicalValues.slice(-10) // Last 10 values
    };
  }

  /**
   * Get category breakdown
   */
  getCategoryBreakdown() {
    const breakdown = {};
    
    for (const [category, index] of Object.entries(this.categoryIndices)) {
      if (index !== null) {
        breakdown[category] = {
          index: index,
          weight: this.config.categoryWeights[category],
          interpretation: index > 50 ? 'Bullish' : 'Bearish',
          deviation: index - 50
        };
      }
    }
    
    return breakdown;
  }

  /**
   * Get index statistics
   */
  getIndexStatistics() {
    if (this.historicalValues.length === 0) {
      return null;
    }

    const values = this.historicalValues.map(entry => entry.value);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const avg = values.reduce((a, b) => a + b, 0) / values.length;
    
    // Calculate volatility (standard deviation)
    const variance = values.reduce((acc, val) => acc + Math.pow(val - avg, 2), 0) / values.length;
    const volatility = Math.sqrt(variance);

    return {
      min,
      max,
      average: avg,
      volatility,
      dataPoints: values.length,
      timeRange: {
        start: this.historicalValues[0].timestamp,
        end: this.historicalValues[this.historicalValues.length - 1].timestamp
      }
    };
  }

  /**
   * Export index data for analysis
   */
  exportIndexData() {
    return {
      currentIndex: this.getCurrentIndex(),
      categoryBreakdown: this.getCategoryBreakdown(),
      statistics: this.getIndexStatistics(),
      configuration: this.config,
      marketCategories: Object.fromEntries(this.marketCategories),
      lastUpdate: this.lastUpdate
    };
  }
}

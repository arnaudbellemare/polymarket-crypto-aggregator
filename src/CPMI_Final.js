import { SimplePolymarketClient } from './clients/SimplePolymarketClient.js';

/**
 * CPMI - Crypto Prediction Market Index (Final Implementation)
 * Clean UPFI-style methodology for crypto markets
 * 
 * Formula: CPMI = 100 + (Bullish Probability - 50)
 * 100 = Market neutral (50/50 bull/bear)
 * Above 100 = Bullish crypto sentiment
 * Below 100 = Bearish crypto sentiment
 */
export class CPMI_Final {
  constructor(config = {}) {
    this.config = {
      // CPMI Category Weights (Following UPFI's exact methodology)
      categoryWeights: {
        'bitcoin-markets': 0.40,        // Bitcoin Markets (40%) - Highest crypto impact
        'ethereum-ecosystem': 0.30,     // Ethereum Ecosystem (30%) - Major ecosystem
        'regulatory-outcomes': 0.20,    // Regulatory Outcomes (20%) - Policy impact
        'major-altcoins': 0.08,         // Major Altcoins (8%) - Secondary markets
        'infrastructure': 0.02          // Infrastructure (2%) - Supporting systems
      },
      
      // Market Weighting Within Categories (UPFI's exact sensitivity values)
      sensitivity: {
        volume: 7,                      // Volume Sensitivity (7/10) - High importance of trading activity
        time: 6,                        // Time Sensitivity (6/10) - Moderate preference for near-term markets
        impact: 8,                      // Impact Sensitivity (8/10) - Strong emphasis on inherent crypto significance
        marketCap: 5                    // Market Cap Sensitivity (5/10) - Balanced representation (replaces Population)
      },
      
      // Index configuration
      baselineValue: 100,               // Perfect market balance baseline
      updateInterval: 5 * 60 * 1000,    // 5 minutes
      smoothingPeriod: 60 * 60 * 1000,  // 1 hour SMA
      
      ...config
    };

    this.client = new SimplePolymarketClient();
    
    // Index state
    this.currentIndex = this.config.baselineValue;
    this.historicalValues = [];
    this.categoryIndices = {};
    this.lastUpdate = null;
    this.isRunning = false;
    
    // Market categorization
    this.marketCategories = new Map();
    this.initializeMarketCategories();
  }

  /**
   * Initialize CPMI market categories
   */
  initializeMarketCategories() {
    // Bitcoin Markets (40%)
    this.marketCategories.set('bitcoin-markets', [
      'bitcoin', 'btc', 'bitcoin price', 'btc price', 'bitcoin adoption',
      'bitcoin etf', 'bitcoin halving', 'bitcoin regulation'
    ]);

    // Ethereum Ecosystem (25%)
    this.marketCategories.set('ethereum-ecosystem', [
      'ethereum', 'eth', 'ethereum price', 'eth price', 'ethereum upgrade',
      'ethereum 2.0', 'eth2', 'merge', 'shanghai', 'cancun', 'defi',
      'decentralized finance', 'uniswap', 'aave', 'compound'
    ]);

    // Regulatory Outcomes (20%)
    this.marketCategories.set('regulatory-outcomes', [
      'sec', 'regulation', 'regulatory', 'approval', 'policy', 'cftc',
      'crypto regulation', 'digital asset', 'stablecoin', 'crypto bill',
      'regulatory approval', 'sec approval'
    ]);

    // Major Altcoins (10%)
    this.marketCategories.set('major-altcoins', [
      'solana', 'sol', 'cardano', 'ada', 'polkadot', 'dot', 'chainlink',
      'link', 'litecoin', 'ltc', 'avalanche', 'avax', 'polygon', 'matic'
    ]);

    // Infrastructure (5%)
    this.marketCategories.set('infrastructure', [
      'exchange', 'custody', 'institutional', 'adoption', 'listing',
      'coinbase', 'binance', 'kraken', 'fidelity', 'blackrock',
      'exchange listing', 'custody solution'
    ]);
  }

  /**
   * Start the CPMI
   */
  async start() {
    try {
      console.log('🚀 Starting CPMI (Crypto Prediction Market Index)...');
      
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

      console.log('✅ CPMI started successfully');
      return true;
    } catch (error) {
      console.error('❌ Failed to start CPMI:', error);
      return false;
    }
  }

  /**
   * Stop the CPMI
   */
  stop() {
    this.isRunning = false;
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
    }
    console.log('🛑 CPMI stopped');
  }

  /**
   * Calculate the CPMI using simple UPFI-style methodology
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
      
      // Process crypto markets
      const cryptoMarkets = this.processCryptoTrades(cryptoTrades);
      console.log(`📊 Processed ${cryptoMarkets.length} crypto markets`);
      
      // Calculate category indices using simple aggregation
      const categoryIndices = {};
      let totalWeightedProbability = 0;
      let totalWeight = 0;

      for (const [category, keywords] of this.marketCategories) {
        const categoryIndex = this.calculateCategoryIndex(category, keywords, cryptoMarkets);
        categoryIndices[category] = categoryIndex;

        if (categoryIndex !== null) {
          const categoryWeight = this.config.categoryWeights[category];
          totalWeightedProbability += categoryIndex * categoryWeight;
          totalWeight += categoryWeight;
        }
      }

      // Calculate overall CPMI
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

      console.log(`📈 CPMI: ${this.currentIndex.toFixed(2)} (${this.getIndexInterpretation()})`);
      
    } catch (error) {
      console.error('❌ Error calculating CPMI:', error);
    }
  }

  /**
   * Filter trades for crypto-related markets
   */
  filterCryptoTrades(trades) {
    const cryptoKeywords = [
      'bitcoin', 'btc', 'ethereum', 'eth', 'crypto', 'cryptocurrency',
      'defi', 'nft', 'meme', 'coin', 'token', 'blockchain', 'web3',
      'solana', 'sol', 'cardano', 'ada', 'polkadot', 'dot', 'chainlink',
      'link', 'uniswap', 'uni', 'aave', 'compound', 'maker', 'mkr',
      'dogecoin', 'doge', 'shiba', 'shib', 'pepe', 'floki', 'bonk'
    ];
    
    return trades.filter(trade => {
      const title = trade.title?.toLowerCase() || '';
      const slug = trade.slug?.toLowerCase() || '';
      const eventSlug = trade.eventSlug?.toLowerCase() || '';
      
      return cryptoKeywords.some(keyword => 
        title.includes(keyword) || 
        slug.includes(keyword) || 
        eventSlug.includes(keyword)
      );
    });
  }

  /**
   * Process crypto trades
   */
  processCryptoTrades(trades) {
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
          lastTrade: null
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
    
    // Calculate averages
    cryptoMarkets.forEach(market => {
      if (market.totalVolume > 0) {
        market.avgPrice = market.totalValue / market.totalVolume;
      }
    });
    
    return Array.from(cryptoMarkets.values());
  }

  /**
   * Calculate index for a specific category using simple aggregation
   */
  calculateCategoryIndex(category, keywords, cryptoMarkets) {
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
          // Calculate market weight using UPFI methodology
          const marketWeight = this.calculateMarketWeight(market);
          
          // Market type-aware probability extraction
          const probability = this.calculateBullishProbability(market);
          
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
   * Calculate market weight using UPFI's exact methodology
   * Following UPFI's weighted combination approach
   */
  calculateMarketWeight(market) {
    const factors = {
      volume: this.calculateVolumeWeight(market),
      time: this.calculateTimeWeight(market),
      impact: this.calculateImpactWeight(market),
      marketCap: this.calculateMarketCapWeight(market)
    };

    // UPFI's exact weighted combination formula
    // Each factor is normalized (0-1) and weighted by sensitivity
    const totalWeight = 
      factors.volume * (this.config.sensitivity.volume / 10) +
      factors.time * (this.config.sensitivity.time / 10) +
      factors.impact * (this.config.sensitivity.impact / 10) +
      factors.marketCap * (this.config.sensitivity.marketCap / 10);

    // Normalize to ensure weights are reasonable (0-1 range)
    return Math.min(Math.max(totalWeight, 0), 1);
  }

  /**
   * Calculate volume-based weight (7/10 sensitivity)
   * Following UPFI's volume-weighted approach
   */
  calculateVolumeWeight(market) {
    const volume = market.totalVolume || 0;
    
    // UPFI approach: Higher-volume markets receive proportionally increased weight
    // Normalize volume relative to typical market volumes
    // Cap at 1.0 to prevent extreme outliers from dominating
    return Math.min(volume / 1000, 1);
  }

  /**
   * Calculate time-based weight (6/10 sensitivity)
   * Following UPFI's time sensitivity approach
   */
  calculateTimeWeight(market) {
    if (!market.lastTrade) return 0;
    
    const now = new Date();
    const lastTradeTime = new Date(market.lastTrade.timestamp * 1000);
    const dataAge = now - lastTradeTime;
    
    // UPFI approach: Moderate preference for near-term markets
    // Recent trades get higher weight, older trades get lower weight
    const maxAge = 24 * 60 * 60 * 1000; // 24 hours
    return Math.max(0, 1 - (dataAge / maxAge));
  }

  /**
   * Calculate impact-based weight (8/10 sensitivity)
   * Following UPFI's impact sensitivity approach
   */
  calculateImpactWeight(market) {
    // UPFI approach: Strong emphasis on inherent political significance
    // CPMI adaptation: Strong emphasis on inherent crypto significance
    
    const impactScores = {
      'bitcoin-markets': 1.0,        // Highest crypto impact
      'ethereum-ecosystem': 0.9,     // Major ecosystem impact
      'regulatory-outcomes': 0.8,    // Policy impact
      'major-altcoins': 0.6,         // Secondary market impact
      'infrastructure': 0.5          // Supporting system impact
    };

    // Find category for this market
    for (const [category, keywords] of this.marketCategories) {
      const title = market.title?.toLowerCase() || '';
      if (keywords.some(keyword => title.includes(keyword))) {
        return impactScores[category] || 0.1;
      }
    }
    
    return 0.1; // Default for uncategorized markets
  }

  /**
   * Calculate market cap-based weight (5/10 sensitivity)
   * Following UPFI's population sensitivity approach
   */
  calculateMarketCapWeight(market) {
    // UPFI approach: Balanced geographic representation
    // CPMI adaptation: Balanced market cap representation
    
    const title = market.title?.toLowerCase() || '';
    
    // Market cap-based ranking (higher cap = higher weight)
    if (title.includes('bitcoin') || title.includes('btc')) return 1.0;      // #1 market cap
    if (title.includes('ethereum') || title.includes('eth')) return 0.9;     // #2 market cap
    if (title.includes('solana') || title.includes('sol')) return 0.8;       // #3 market cap
    if (title.includes('cardano') || title.includes('ada')) return 0.7;      // #4 market cap
    if (title.includes('polkadot') || title.includes('dot')) return 0.6;     // #5 market cap
    if (title.includes('chainlink') || title.includes('link')) return 0.5;   // #6 market cap
    if (title.includes('uniswap') || title.includes('uni')) return 0.4;      // #7 market cap
    if (title.includes('dogecoin') || title.includes('doge')) return 0.3;    // #8 market cap
    
    return 0.2; // Default for other cryptos
  }

  /**
   * Calculate bullish probability using market type classification
   */
  calculateBullishProbability(market) {
    const title = market.title.toLowerCase();
    const marketType = this.classifyMarketType(title);
    
    switch (marketType) {
      case 'binary':
        return this.extractBinaryProbability(market);
      case 'directional':
        return this.extractDirectionalProbability(market);
      case 'price_prediction':
        return this.extractPricePredictionProbability(market);
      case 'range':
        return this.extractRangeProbability(market);
      default:
        return this.extractSentimentProbability(market);
    }
  }

  /**
   * Classify market type based on title
   */
  classifyMarketType(title) {
    if (title.includes('up or down') || title.includes('up/down')) {
      return 'directional';
    }
    
    if (title.includes('will') && (title.includes('above') || title.includes('below') || title.includes('reach'))) {
      return 'price_prediction';
    }
    
    if (title.includes('between') || title.includes('range')) {
      return 'range';
    }
    
    if (title.includes('will') && (title.includes('be') || title.includes('happen'))) {
      return 'binary';
    }
    
    return 'sentiment';
  }

  /**
   * Extract probability for binary markets
   */
  extractBinaryProbability(market) {
    return market.avgPrice * 100;
  }

  /**
   * Extract probability for directional markets
   */
  extractDirectionalProbability(market) {
    return market.avgPrice * 100;
  }

  /**
   * Extract probability for price prediction markets
   */
  extractPricePredictionProbability(market) {
    // For price prediction markets, we need to analyze the target vs current price
    // For now, use the market price as it reflects market expectations
    return market.avgPrice * 100;
  }

  /**
   * Extract probability for range markets
   */
  extractRangeProbability(market) {
    // For range markets, we need to analyze if current price is in range
    // For now, use the market price as it reflects market expectations
    return market.avgPrice * 100;
  }

  /**
   * Extract probability for sentiment markets
   */
  extractSentimentProbability(market) {
    // Use buy/sell ratio for sentiment analysis
    const totalVolume = market.buyVolume + market.sellVolume;
    if (totalVolume > 0) {
      const buyRatio = market.buyVolume / totalVolume;
      return buyRatio * 100;
    }
    return market.avgPrice * 100;
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
      historicalValues: this.historicalValues.slice(-10)
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

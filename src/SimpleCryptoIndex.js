import { SimplePolymarketClient } from './clients/SimplePolymarketClient.js';
import { WeightedAverageCalculator } from './utils/WeightedAverageCalculator.js';
import { DataValidator } from './utils/DataValidator.js';
import { TradeData, MarketData } from './types/index.js';

/**
 * Simple Crypto Market Index using Polymarket's basic GET endpoint
 * No authentication required - fetches real trade data
 */
export class SimpleCryptoIndex {
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
      
      // Sensitivity parameters (0-10 scale)
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
   * Start the crypto market index
   */
  async start() {
    try {
      console.log('🚀 Starting Simple Crypto Market Index...');
      
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

      console.log('✅ Simple Crypto Market Index started successfully');
      return true;
    } catch (error) {
      console.error('❌ Failed to start Simple Crypto Market Index:', error);
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
    console.log('🛑 Simple Crypto Market Index stopped');
  }

  /**
   * Calculate the crypto market index
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
      const cryptoMarkets = this.client.processCryptoTrades(cryptoTrades);
      console.log(`📊 Processed ${cryptoMarkets.length} crypto markets`);
      
      // Calculate category indices
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

      console.log(`📈 Crypto Market Index: ${this.currentIndex.toFixed(2)} (${this.getIndexInterpretation()})`);
      
    } catch (error) {
      console.error('❌ Error calculating index:', error);
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
   * Calculate index for a specific category
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
          // Calculate market weight based on volume, time, market cap, and impact
          const marketWeight = this.calculateMarketWeight(market);
          
          // Extract probability from market data (using average price as proxy)
          const probability = this.extractProbability(market);
          
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
   * Calculate market weight based on multiple factors
   */
  calculateMarketWeight(market) {
    const factors = {
      volume: this.calculateVolumeWeight(market),
      time: this.calculateTimeWeight(market),
      marketCap: this.calculateMarketCapWeight(market),
      impact: this.calculateImpactWeight(market)
    };

    // Weighted combination of factors
    const totalWeight = 
      factors.volume * (this.config.sensitivity.volume / 10) +
      factors.time * (this.config.sensitivity.time / 10) +
      factors.marketCap * (this.config.sensitivity.marketCap / 10) +
      factors.impact * (this.config.sensitivity.impact / 10);

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
   * Extract probability from market data
   */
  extractProbability(market) {
    // Use average price as probability proxy
    // In real prediction markets, this would be the actual probability
    const price = market.avgPrice;
    if (!price || price <= 0) return null;

    // Convert price to probability (0-100%)
    // This is a simplified conversion - real implementation would use
    // actual prediction market probabilities
    const probability = Math.min(Math.max(price * 100, 0), 100);
    return probability;
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
   * Get recent crypto trades
   */
  async getRecentCryptoTrades(limit = 100) {
    try {
      const response = await this.client.getAllRecentTrades(limit);
      if (response.success) {
        return this.filterCryptoTrades(response.data);
      }
      return [];
    } catch (error) {
      console.error('Error fetching recent crypto trades:', error);
      return [];
    }
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

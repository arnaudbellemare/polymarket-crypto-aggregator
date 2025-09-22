import { CryptoMarketAggregator } from './CryptoMarketAggregator.js';
import { WeightedAverageResult } from './types/index.js';

/**
 * Crypto Market Index - Similar to UPFI but for cryptocurrency markets
 * Provides a comprehensive, real-time measure of crypto market sentiment
 * Based on Polymarket prediction market data
 */
export class CryptoMarketIndex {
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

    this.aggregator = new CryptoMarketAggregator(config);
    
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
   * Initialize market categories based on crypto types
   */
  initializeMarketCategories() {
    // Major cryptocurrencies
    this.marketCategories.set('major-crypto', [
      'BTC-USD', 'ETH-USD', 'BNB-USD', 'XRP-USD', 'ADA-USD', 
      'SOL-USD', 'DOT-USD', 'DOGE-USD', 'AVAX-USD', 'MATIC-USD'
    ]);

    // Altcoins
    this.marketCategories.set('altcoins', [
      'LINK-USD', 'UNI-USD', 'LTC-USD', 'ATOM-USD', 'FIL-USD',
      'TRX-USD', 'ETC-USD', 'XLM-USD', 'VET-USD', 'ICP-USD'
    ]);

    // DeFi tokens
    this.marketCategories.set('defi', [
      'AAVE-USD', 'COMP-USD', 'MKR-USD', 'SNX-USD', 'YFI-USD',
      'SUSHI-USD', 'CRV-USD', '1INCH-USD', 'BAL-USD', 'LEND-USD'
    ]);

    // Meme coins
    this.marketCategories.set('meme-coins', [
      'SHIB-USD', 'PEPE-USD', 'DOGE-USD', 'FLOKI-USD', 'BONK-USD'
    ]);

    // NFT and Gaming
    this.marketCategories.set('nft-gaming', [
      'AXS-USD', 'SAND-USD', 'MANA-USD', 'ENJ-USD', 'GALA-USD'
    ]);
  }

  /**
   * Start the crypto market index
   */
  async start() {
    try {
      console.log('🚀 Starting Crypto Market Index...');
      
      // Connect to WebSocket
      const connected = await this.aggregator.connect();
      if (!connected) {
        throw new Error('Failed to connect to Polymarket WebSocket');
      }

      // Get all available crypto markets
      const markets = await this.aggregator.getAllCryptoMarkets();
      console.log(`📊 Found ${markets.length} crypto markets`);

      // Subscribe to all relevant markets
      const allAssetIds = Array.from(this.marketCategories.values()).flat();
      this.aggregator.subscribeToAssets(allAssetIds);

      // Start index calculation loop
      this.isRunning = true;
      this.calculateIndex();
      
      // Set up periodic updates
      this.updateInterval = setInterval(() => {
        if (this.isRunning) {
          this.calculateIndex();
        }
      }, this.config.updateInterval);

      console.log('✅ Crypto Market Index started successfully');
      return true;
    } catch (error) {
      console.error('❌ Failed to start Crypto Market Index:', error);
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
    this.aggregator.disconnect();
    console.log('🛑 Crypto Market Index stopped');
  }

  /**
   * Calculate the crypto market index
   */
  calculateIndex() {
    try {
      const categoryIndices = {};
      let totalWeightedProbability = 0;
      let totalWeight = 0;

      // Calculate index for each category
      for (const [category, assetIds] of this.marketCategories) {
        const categoryIndex = this.calculateCategoryIndex(category, assetIds);
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
   * Calculate index for a specific category
   */
  calculateCategoryIndex(category, assetIds) {
    try {
      let totalWeightedProbability = 0;
      let totalWeight = 0;

      for (const assetId of assetIds) {
        try {
          // Get current market data
          const marketData = this.aggregator.getCurrentMarketData(assetId);
          if (!marketData) continue;

          // Calculate market weight based on volume, time, market cap, and impact
          const marketWeight = this.calculateMarketWeight(assetId, marketData);
          
          // Extract probability from market data (assuming price represents probability)
          const probability = this.extractProbability(marketData);
          
          if (probability !== null && marketWeight > 0) {
            totalWeightedProbability += probability * marketWeight;
            totalWeight += marketWeight;
          }
        } catch (error) {
          console.warn(`⚠️ Error processing ${assetId}:`, error.message);
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
  calculateMarketWeight(assetId, marketData) {
    const factors = {
      volume: this.calculateVolumeWeight(marketData),
      time: this.calculateTimeWeight(marketData),
      marketCap: this.calculateMarketCapWeight(assetId),
      impact: this.calculateImpactWeight(assetId)
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
  calculateVolumeWeight(marketData) {
    const volume = marketData.volume || 0;
    // Normalize volume (higher volume = higher weight)
    return Math.min(volume / 1000, 1); // Cap at 1.0
  }

  /**
   * Calculate time-based weight (prefer more recent data)
   */
  calculateTimeWeight(marketData) {
    const now = new Date();
    const dataAge = now - marketData.timestamp;
    const maxAge = 24 * 60 * 60 * 1000; // 24 hours
    
    return Math.max(0, 1 - (dataAge / maxAge));
  }

  /**
   * Calculate market cap-based weight
   */
  calculateMarketCapWeight(assetId) {
    // Simplified market cap ranking (in real implementation, fetch actual market caps)
    const marketCapRankings = {
      'BTC-USD': 1.0, 'ETH-USD': 0.9, 'BNB-USD': 0.8, 'XRP-USD': 0.7,
      'ADA-USD': 0.6, 'SOL-USD': 0.5, 'DOT-USD': 0.4, 'DOGE-USD': 0.3,
      'AVAX-USD': 0.2, 'MATIC-USD': 0.1
    };
    
    return marketCapRankings[assetId] || 0.05;
  }

  /**
   * Calculate impact-based weight (market significance)
   */
  calculateImpactWeight(assetId) {
    // Major cryptocurrencies have higher impact
    const impactScores = {
      'major-crypto': 1.0,
      'altcoins': 0.7,
      'defi': 0.6,
      'meme-coins': 0.3,
      'nft-gaming': 0.2
    };

    // Find category for this asset
    for (const [category, assets] of this.marketCategories) {
      if (assets.includes(assetId)) {
        return impactScores[category] || 0.1;
      }
    }
    
    return 0.1;
  }

  /**
   * Extract probability from market data
   */
  extractProbability(marketData) {
    // In a real implementation, this would extract the actual probability
    // from Polymarket's prediction market data
    // For now, we'll use a simplified approach based on price movement
    
    const price = marketData.price;
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

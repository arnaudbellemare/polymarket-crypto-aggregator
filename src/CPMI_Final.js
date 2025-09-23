import { SimplePolymarketClient } from './clients/SimplePolymarketClient.js';
import ccxt from 'ccxt';

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
        // Note: 'uncategorized' markets are excluded from CPMI calculation
      },
      
      // Market Weighting Within Categories (UPFI's exact sensitivity values + crypto enhancements)
      sensitivity: {
        volume: 7,                      // Volume Sensitivity (7/10) - High importance of trading activity
        time: 6,                        // Time Sensitivity (6/10) - Moderate preference for near-term markets
        impact: 8,                      // Impact Sensitivity (8/10) - Strong emphasis on inherent crypto significance
        marketCap: 5,                   // Market Cap Sensitivity (5/10) - Balanced representation (replaces Population)
        volatility: 4                   // Volatility Sensitivity (4/10) - Crypto-specific risk factor
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
    
    // Market data cache
    this.marketCapData = new Map();
    this.volatilityData = new Map();
    this.priceHistory = new Map(); // For EWMA volatility calculation
    this.probabilityHistory = new Map(); // For probability volatility
    this.lastMarketDataUpdate = null;
    
    // CCXT exchange instance
    this.exchange = new ccxt.kraken({
      sandbox: false,
      enableRateLimit: true,
    });
    
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
   * Fetch real market cap and volatility data using CCXT
   */
  async fetchMarketData() {
    try {
      // Check if we need to update (every 5 minutes)
      const now = new Date();
      if (this.lastMarketDataUpdate && (now - this.lastMarketDataUpdate) < 5 * 60 * 1000) {
        return; // Use cached data
      }

      console.log('📊 Fetching real market cap and volatility data using CCXT (Kraken)...');
      
      // Get ticker data for major crypto pairs (Kraken format)
      const symbols = ['BTC/USD', 'ETH/USD', 'SOL/USD', 'ADA/USD', 'DOT/USD', 'LINK/USD', 'UNI/USD', 'DOGE/USD'];
      
      for (const symbol of symbols) {
        try {
          // Get current ticker
          const ticker = await this.exchange.fetchTicker(symbol);
          
          // Get historical data for volatility calculation (last 30 days)
          const ohlcv = await this.exchange.fetchOHLCV(symbol, '1d', undefined, 30);
          
          if (ohlcv.length > 1) {
            const baseSymbol = symbol.split('/')[0].toLowerCase();
            
            // Store actual price data for crypto price lookups
            const currentPrice = ohlcv[ohlcv.length - 1][4]; // Last close price
            this.marketCapData.set(baseSymbol, {
              price: currentPrice,
              ranking: this.getMarketCapRanking(baseSymbol)
            });
            
            // Calculate annualized volatility using EWMA of log returns
            const volatility = this.calculateAnnualizedVolatility(ohlcv);
            this.volatilityData.set(baseSymbol, volatility);
            
            // Store price history for future volatility calculations
            this.priceHistory.set(baseSymbol, ohlcv.map(candle => candle[4])); // Close prices
          }
          
        } catch (error) {
          console.warn(`⚠️ Failed to fetch data for ${symbol}:`, error.message);
        }
      }
      
      this.lastMarketDataUpdate = now;
      console.log(`✅ Updated market data for ${symbols.length} cryptocurrencies`);
      
    } catch (error) {
      console.warn('⚠️ Failed to fetch market data, using fallback:', error.message);
      // Fallback to hardcoded data if API fails
    }
  }

  /**
   * Get market cap ranking for a crypto symbol
   */
  getMarketCapRanking(symbol) {
    const rankings = {
      'btc': 1.0,    // #1
      'eth': 0.9,    // #2
      'sol': 0.8,    // #3
      'ada': 0.7,    // #4
      'dot': 0.6,    // #5
      'link': 0.5,   // #6
      'uni': 0.4,    // #7
      'doge': 0.3    // #8
    };
    return rankings[symbol] || 0.2;
  }

  /**
   * Calculate annualized volatility using EWMA of log returns
   * Formula: σ_annual = √(365 * EWMA(log_returns²))
   */
  calculateAnnualizedVolatility(ohlcv) {
    if (ohlcv.length < 2) return 0.1; // Default 10% volatility
    
    const closes = ohlcv.map(candle => candle[4]); // Close prices
    const logReturns = [];
    
    // Calculate log returns
    for (let i = 1; i < closes.length; i++) {
      const logReturn = Math.log(closes[i] / closes[i-1]);
      logReturns.push(logReturn);
    }
    
    // Calculate EWMA of squared log returns
    const lambda = 0.94; // Decay factor (RiskMetrics standard)
    let ewmaVariance = 0;
    
    // Initialize with first squared return
    if (logReturns.length > 0) {
      ewmaVariance = logReturns[0] * logReturns[0];
    }
    
    // Calculate EWMA
    for (let i = 1; i < logReturns.length; i++) {
      ewmaVariance = lambda * ewmaVariance + (1 - lambda) * (logReturns[i] * logReturns[i]);
    }
    
    // Annualize: multiply by 365 and take square root
    const annualizedVolatility = Math.sqrt(365 * ewmaVariance);
    
    // Normalize to 0-1 range (cap at 200% annual volatility)
    return Math.min(annualizedVolatility, 2.0) / 2.0;
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
      
      // Fetch real market data
      await this.fetchMarketData();
      
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
      
      // Fetch trades with higher limit to get more crypto markets
      const tradesResponse = await this.client.getCryptoTrades(10000);  // Max limit
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
      this.lastProcessedMarkets = cryptoMarkets; // Store for export
      console.log(`📊 Processed ${cryptoMarkets.length} crypto markets`);
      
      // Calculate category indices using improved methodology
      const categoryIndices = {};
      let totalWeightedProbability = 0;
      let totalWeight = 0;
      let totalAccuracyWeight = 0;

      for (const [category, keywords] of this.marketCategories) {
        // Skip uncategorized markets - they shouldn't be in the calculation
        if (category === 'uncategorized') {
          continue;
        }
        
        const categoryIndex = this.calculateCategoryIndex(category, keywords, cryptoMarkets);
        categoryIndices[category] = categoryIndex;

        if (categoryIndex !== null) {
          const categoryWeight = this.config.categoryWeights[category];
          
          // Calculate multi-factor weights for this category
          const accuracyWeight = this.calculateCategoryAccuracy(category, cryptoMarkets);
          const volumeWeight = this.calculateCategoryVolumeWeight(category, cryptoMarkets);
          const timeWeight = this.calculateCategoryTimeWeight(category, cryptoMarkets);
          
          // Combined weight: volume × time (temporarily removing accuracy weighting)
          const combinedWeight = volumeWeight * timeWeight;
          const adjustedProbability = categoryIndex * combinedWeight;
          
          totalWeightedProbability += adjustedProbability * categoryWeight;
          totalWeight += categoryWeight;
          totalAccuracyWeight += accuracyWeight * categoryWeight;
        }
      }

      // Calculate overall CPMI with accuracy and time adjustments
      if (totalWeight > 0) {
        const overallProbability = totalWeightedProbability / totalWeight;
        const averageAccuracy = totalAccuracyWeight / totalWeight;
        
        // Apply time decay adjustment to the final index
        const timeDecayFactor = this.calculateOverallTimeDecay(cryptoMarkets);
        const adjustedProbability = overallProbability * timeDecayFactor;
        
        this.currentIndex = this.config.baselineValue + (adjustedProbability - 50);
        
        // Apply smoothing (1-hour SMA) with enhanced metadata
        this.historicalValues.push({
          timestamp: new Date(),
          value: this.currentIndex,
          probability: overallProbability,
          accuracy: averageAccuracy,
          timeDecay: timeDecayFactor,
          rawProbability: totalWeightedProbability / totalWeight
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

      const interpretation = this.getIndexInterpretation();
      const accuracy = totalAccuracyWeight / totalWeight;
      const timeDecay = this.calculateOverallTimeDecay(cryptoMarkets);
      const volumeWeight = this.calculateOverallVolumeWeight(cryptoMarkets);
      console.log(`📈 CPMI: ${this.currentIndex.toFixed(2)} (${interpretation}) [Accuracy: ${(accuracy * 100).toFixed(1)}%, Volume: ${(volumeWeight * 100).toFixed(1)}%, Time: ${(timeDecay * 100).toFixed(1)}%]`);
      
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
    
    // All trades are already filtered for crypto by the client
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
      marketCap: this.calculateMarketCapWeight(market),
      volatility: this.calculateVolatilityWeight(market)
    };

    // UPFI's exact weighted combination formula + crypto enhancements
    // Each factor is normalized (0-1) and weighted by sensitivity
    const totalWeight = 
      factors.volume * (this.config.sensitivity.volume / 10) +
      factors.time * (this.config.sensitivity.time / 10) +
      factors.impact * (this.config.sensitivity.impact / 10) +
      factors.marketCap * (this.config.sensitivity.marketCap / 10) +
      factors.volatility * (this.config.sensitivity.volatility / 10);

    // Normalize to ensure weights are reasonable (0-1 range)
    return Math.min(Math.max(totalWeight, 0), 1);
  }

  /**
   * Calculate volume-based weight (7/10 sensitivity)
   * Following UPFI's volume-weighted approach with crypto-specific enhancements
   */
  calculateVolumeWeight(market) {
    const volume = market.totalVolume || 0;
    const tradeCount = market.tradeCount || 0;
    const avgTradeSize = volume > 0 && tradeCount > 0 ? volume / tradeCount : 0;
    
    // Multi-factor volume analysis
    const volumeScore = this.calculateVolumeScore(volume, tradeCount, avgTradeSize);
    const liquidityScore = this.calculateLiquidityScore(market);
    const activityScore = this.calculateActivityScore(market);
    
    // Weighted combination of volume factors
    const totalScore = (volumeScore * 0.5) + (liquidityScore * 0.3) + (activityScore * 0.2);
    
    // Apply logarithmic scaling to prevent extreme outliers from dominating
    // while still giving higher weight to more active markets
    return Math.min(Math.log10(totalScore + 1) / 3, 1.0); // Normalize to 0-1 range
  }
  
  /**
   * Calculate volume score based on total volume and trade count
   */
  calculateVolumeScore(volume, tradeCount, avgTradeSize) {
    // Base volume score (normalized)
    const baseVolumeScore = Math.min(volume / 10000, 1.0); // Cap at 10k volume
    
    // Trade count bonus (more trades = more confidence)
    const tradeCountScore = Math.min(tradeCount / 100, 1.0); // Cap at 100 trades
    
    // Average trade size penalty (very large trades might be manipulation)
    const avgTradePenalty = avgTradeSize > 1000 ? 0.8 : 1.0;
    
    return (baseVolumeScore * 0.6 + tradeCountScore * 0.4) * avgTradePenalty;
  }
  
  /**
   * Calculate liquidity score based on recent trading activity
   */
  calculateLiquidityScore(market) {
    // Check if market has recent activity (within last 24 hours)
    const now = Date.now();
    const lastTradeTime = market.lastTradeTime || 0;
    const hoursSinceLastTrade = (now - lastTradeTime) / (1000 * 60 * 60);
    
    // Liquidity decreases with time since last trade
    let liquidityScore = 1.0;
    if (hoursSinceLastTrade > 24) {
      liquidityScore = 0.3; // Very low liquidity
    } else if (hoursSinceLastTrade > 12) {
      liquidityScore = 0.6; // Low liquidity
    } else if (hoursSinceLastTrade > 6) {
      liquidityScore = 0.8; // Moderate liquidity
    }
    
    return liquidityScore;
  }
  
  /**
   * Calculate activity score based on trading patterns
   */
  calculateActivityScore(market) {
    const volume = market.totalVolume || 0;
    const tradeCount = market.tradeCount || 0;
    
    // Activity score based on both volume and trade frequency
    const volumeActivity = Math.min(volume / 5000, 1.0);
    const tradeActivity = Math.min(tradeCount / 50, 1.0);
    
    // Markets with both high volume AND high trade count get bonus
    const combinedActivity = (volumeActivity + tradeActivity) / 2;
    const activityBonus = (volumeActivity > 0.5 && tradeActivity > 0.5) ? 1.2 : 1.0;
    
    return Math.min(combinedActivity * activityBonus, 1.0);
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
    const lowerTitle = title.toLowerCase();
    
    // Price range markets (between X and Y)
    if (lowerTitle.includes('between') && lowerTitle.includes('and') && 
        (lowerTitle.includes('$') || lowerTitle.includes('price'))) {
      return 'range';
    }
    
    // Price target markets (specific price levels)
    if ((lowerTitle.includes('reach') || lowerTitle.includes('hit') || 
         lowerTitle.includes('above') || lowerTitle.includes('below') ||
         lowerTitle.includes('dip to') || lowerTitle.includes('go to') ||
         lowerTitle.includes('touch') || lowerTitle.includes('drop to') ||
         lowerTitle.includes('fall to') || lowerTitle.includes('crash to')) && 
        (lowerTitle.includes('$') || lowerTitle.includes('price'))) {
      return 'price_target';
    }
    
    // Directional markets
    if (lowerTitle.includes('up or down') || lowerTitle.includes('up/down') ||
        lowerTitle.includes('bullish') || lowerTitle.includes('bearish')) {
      return 'direction';
    }
    
    // Binary markets (yes/no questions)
    if (lowerTitle.includes('will') && (lowerTitle.includes('?') || lowerTitle.includes('happen'))) {
      return 'binary';
    }
    
    // Alternative binary patterns
    if (lowerTitle.includes('will') && (lowerTitle.includes('say') || lowerTitle.includes('pass') || lowerTitle.includes('win'))) {
      return 'binary';
    }
    
    // Default to sentiment
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
    // For "Up or Down" markets, we need to calculate bullish probability
    // by considering trade outcomes and directions
    const title = market.title.toLowerCase();
    
    if (title.includes('up or down') || title.includes('up/down')) {
      // Calculate bullish probability from trade outcomes
      let bullishValue = 0;
      let bearishValue = 0;
      
      if (market.trades && market.trades.length > 0) {
        market.trades.forEach(trade => {
          const value = trade.size * trade.price;
          if (trade.outcome && trade.outcome.toLowerCase().includes('up')) {
            bullishValue += value;
          } else if (trade.outcome && trade.outcome.toLowerCase().includes('down')) {
            bearishValue += value;
          }
        });
        
        const totalValue = bullishValue + bearishValue;
        if (totalValue > 0) {
          return (bullishValue / totalValue) * 100;
        }
      }
    }
    
    // For other directional markets, analyze keywords
    const targetInfo = this.extractTargetFromMarket(market);
    
    if (targetInfo && targetInfo.type === 'direction') {
      // For directional markets, the market price represents confidence in the direction
      if (targetInfo.direction === 'up' || targetInfo.direction === 'bullish') {
        // Bullish direction: market price = confidence in going up
        return market.avgPrice * 100;
      } else if (targetInfo.direction === 'down' || targetInfo.direction === 'bearish') {
        // Bearish direction: market price = confidence in going down
        // Convert to bullish probability: 100 - bearish_probability
        return 100 - (market.avgPrice * 100);
      }
    }
    
    // Fallback to raw market price if we can't determine direction
    return market.avgPrice * 100;
  }

  /**
   * Extract probability for price prediction markets
   */
  extractPricePredictionProbability(market) {
    // For price prediction markets, we need to analyze the target vs current price
    const targetInfo = this.extractTargetFromMarket(market);
    
    if (targetInfo && targetInfo.type === 'price_target') {
      const currentPrice = this.getCurrentCryptoPrice(targetInfo.crypto);
      
      if (currentPrice && targetInfo.targetPrice) {
        // Calculate the required price movement
        const priceChange = targetInfo.targetPrice - currentPrice;
        const percentChange = (priceChange / currentPrice) * 100;
        
        // Determine if this is a bullish or bearish prediction
        if (targetInfo.direction === 'down' || priceChange < 0) {
          // Bearish prediction: market expects price to go DOWN
          // Market probability = confidence in price decrease
          // Convert to bullish probability: 100 - bearish_probability
          const bullishProb = 100 - (market.avgPrice * 100);
          console.log(`📉 BEARISH: ${targetInfo.crypto} ${currentPrice} → ${targetInfo.targetPrice} (${percentChange.toFixed(1)}%) - Market: ${(market.avgPrice * 100).toFixed(1)}% → Bullish: ${bullishProb.toFixed(1)}%`);
          return bullishProb;
        } else {
          // Bullish prediction: market expects price to go UP
          // Market probability = confidence in price increase
          console.log(`📈 BULLISH: ${targetInfo.crypto} ${currentPrice} → ${targetInfo.targetPrice} (+${percentChange.toFixed(1)}%) - Market: ${(market.avgPrice * 100).toFixed(1)}%`);
          return market.avgPrice * 100;
        }
      }
    }
    
    // Fallback to raw market price if we can't determine direction
    return market.avgPrice * 100;
  }

  /**
   * Extract probability for range markets
   */
  extractRangeProbability(market) {
    // For range markets, we need to analyze if current price is in range
    const targetInfo = this.extractTargetFromMarket(market);
    
    if (targetInfo && targetInfo.type === 'range') {
      const currentPrice = this.getCurrentCryptoPrice(targetInfo.crypto);
      
      if (currentPrice && targetInfo.minPrice && targetInfo.maxPrice) {
        // Check if current price is within the range
        const isInRange = currentPrice >= targetInfo.minPrice && currentPrice <= targetInfo.maxPrice;
        
        if (isInRange) {
          // Current price is in range: market price = confidence it stays in range
          return market.avgPrice * 100;
        } else {
          // Current price is outside range: market price = confidence it moves into range
          // This is more complex - for now, use market price as bullish indicator
          return market.avgPrice * 100;
        }
      }
    }
    
    // Fallback to raw market price if we can't determine range
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
   * Calculate volatility-based weight (4/10 sensitivity)
   * Using both crypto price volatility and probability change volatility
   */
  calculateVolatilityWeight(market) {
    const title = market.title.toLowerCase();
    
    // 1. Try to find real crypto price volatility data
    let cryptoVolatility = null;
    for (const [symbol, volatility] of this.volatilityData) {
      if (title.includes(symbol)) {
        cryptoVolatility = volatility;
        break;
      }
    }
    
    // 2. Calculate probability change volatility
    const probabilityVolatility = this.calculateProbabilityVolatility(market);
    
    // 3. Combine both volatilities (weighted average)
    let combinedVolatility;
    if (cryptoVolatility !== null) {
      // 70% crypto volatility + 30% probability volatility
      combinedVolatility = 0.7 * cryptoVolatility + 0.3 * probabilityVolatility;
    } else {
      // Use only probability volatility if no crypto data
      combinedVolatility = probabilityVolatility;
    }
    
    // Higher volatility = lower weight (more risky = less reliable)
    return 1 - combinedVolatility;
  }

  /**
   * Calculate volatility of prediction market probability changes
   * Based on Archak & Ipeirotis (2008) model: volatility = f(price, time_to_expiration)
   */
  calculateProbabilityVolatility(market) {
    const marketKey = market.conditionId;
    
    // Initialize probability history if not exists
    if (!this.probabilityHistory.has(marketKey)) {
      this.probabilityHistory.set(marketKey, []);
    }
    
    const history = this.probabilityHistory.get(marketKey);
    const currentProbability = market.avgPrice;
    
    // Add current probability to history
    history.push({
      probability: currentProbability,
      timestamp: Date.now()
    });
    
    // Keep only last 30 data points
    if (history.length > 30) {
      history.shift();
    }
    
    // Need at least 2 data points to calculate volatility
    if (history.length < 2) {
      return this.getDefaultProbabilityVolatility(market);
    }
    
    // Calculate probability changes (not log returns for probabilities)
    const probabilityChanges = [];
    for (let i = 1; i < history.length; i++) {
      const change = history[i].probability - history[i-1].probability;
      probabilityChanges.push(change);
    }
    
    if (probabilityChanges.length < 2) {
      return this.getDefaultProbabilityVolatility(market);
    }
    
    // Calculate standard deviation of probability changes
    const mean = probabilityChanges.reduce((sum, change) => sum + change, 0) / probabilityChanges.length;
    const variance = probabilityChanges.reduce((sum, change) => sum + Math.pow(change - mean, 2), 0) / probabilityChanges.length;
    const stdDev = Math.sqrt(variance);
    
    // Apply time-to-expiration adjustment (Archak & Ipeirotis model)
    const timeAdjustment = this.getTimeToExpirationAdjustment(market);
    
    // Final volatility = base volatility * time adjustment
    const adjustedVolatility = stdDev * timeAdjustment;
    
    // Normalize to 0-1 range (cap at 50% probability volatility)
    return Math.min(adjustedVolatility, 0.5) / 0.5;
  }

  /**
   * Get default probability volatility based on market characteristics
   */
  getDefaultProbabilityVolatility(market) {
    const title = market.title.toLowerCase();
    
    // Different default volatilities based on market type
    if (title.includes('bitcoin') || title.includes('btc')) return 0.15; // 15% default
    if (title.includes('ethereum') || title.includes('eth')) return 0.20; // 20% default
    if (title.includes('regulatory') || title.includes('sec')) return 0.25; // 25% default (high uncertainty)
    if (title.includes('price') && title.includes('reach')) return 0.30; // 30% default (price predictions)
    
    return 0.20; // 20% default for other markets
  }

  /**
   * Get time-to-expiration adjustment factor
   * Based on Black-Scholes time decay model: volatility decreases as we approach expiration
   */
  getTimeToExpirationAdjustment(market) {
    try {
      // Parse expiration date from market title or use market data
      const expirationDate = this.parseExpirationDate(market);
      if (!expirationDate) {
        return this.getHeuristicTimeAdjustment(market);
      }
      
      const now = new Date();
      const timeToExpiration = (expirationDate - now) / (1000 * 60 * 60 * 24); // days
      
      if (timeToExpiration <= 0) {
        return 0.1; // Expired or very close to expiration
      }
      
      // Black-Scholes time decay: sqrt(T) where T is time to expiration
      // Normalize to 0-1 range with reasonable bounds
      const timeDecay = Math.sqrt(Math.min(timeToExpiration / 365, 1)); // Cap at 1 year
      
      // Apply minimum threshold to avoid zero weight
      return Math.max(timeDecay, 0.1);
      
    } catch (error) {
      console.warn('Error calculating time adjustment:', error);
      return this.getHeuristicTimeAdjustment(market);
    }
  }
  
  /**
   * Parse expiration date from market title
   */
  parseExpirationDate(market) {
    const title = market.title.toLowerCase();
    
    // Look for specific date patterns
    const datePatterns = [
      /(\d{4})-(\d{1,2})-(\d{1,2})/, // YYYY-MM-DD
      /(\d{1,2})\/(\d{1,2})\/(\d{4})/, // MM/DD/YYYY
      /(\d{1,2})-(\d{1,2})-(\d{4})/, // MM-DD-YYYY
      /december \d{1,2},? \d{4}/i,
      /january \d{1,2},? \d{4}/i,
      /february \d{1,2},? \d{4}/i,
      /march \d{1,2},? \d{4}/i,
      /april \d{1,2},? \d{4}/i,
      /may \d{1,2},? \d{4}/i,
      /june \d{1,2},? \d{4}/i,
      /july \d{1,2},? \d{4}/i,
      /august \d{1,2},? \d{4}/i,
      /september \d{1,2},? \d{4}/i,
      /october \d{1,2},? \d{4}/i,
      /november \d{1,2},? \d{4}/i
    ];
    
    for (const pattern of datePatterns) {
      const match = title.match(pattern);
      if (match) {
        try {
          return new Date(match[0]);
        } catch (e) {
          continue;
        }
      }
    }
    
    // Look for year-only patterns
    const yearMatch = title.match(/(\d{4})/);
    if (yearMatch) {
      const year = parseInt(yearMatch[1]);
      if (year >= 2024 && year <= 2030) {
        return new Date(year, 11, 31); // End of year
      }
    }
    
    return null;
  }
  
  /**
   * Fallback heuristic time adjustment
   */
  getHeuristicTimeAdjustment(market) {
    const title = market.title.toLowerCase();
    
    // Estimate time to expiration based on keywords
    if (title.includes('2024') || title.includes('end of year')) return 0.8; // ~3 months
    if (title.includes('2025')) return 1.0; // ~1 year
    if (title.includes('month') || title.includes('30 days')) return 0.6; // ~1 month
    if (title.includes('week') || title.includes('7 days')) return 0.4; // ~1 week
    if (title.includes('day') || title.includes('24 hours')) return 0.2; // ~1 day
    
    return 0.7; // Default: moderate time adjustment
  }

  /**
   * Calculate prediction accuracy score for a market
   * Compares prediction market probabilities with actual crypto price movements
   */
  calculatePredictionAccuracy(market) {
    try {
      // Extract target price or direction from market title
      const targetInfo = this.extractTargetFromMarket(market);
      if (!targetInfo) {
        return 0.5; // Default neutral accuracy
      }
      
      // Get current crypto price
      const currentPrice = this.getCurrentCryptoPrice(targetInfo.symbol);
      if (!currentPrice) {
        return 0.5; // Default if price unavailable
      }
      
      // Calculate accuracy based on market type
      let accuracy = 0.5; // Default
      
      if (targetInfo.type === 'price_target') {
        // For price targets: accuracy = how close prediction is to actual movement
        const predictedProbability = market.avgPrice;
        const actualMovement = (currentPrice - targetInfo.currentPrice) / targetInfo.currentPrice;
        const predictedMovement = (predictedProbability - 0.5) * 2; // Convert 0-1 to -1 to +1
        
        // Calculate accuracy as inverse of prediction error
        const error = Math.abs(predictedMovement - actualMovement);
        accuracy = Math.max(0.1, 1 - error); // Cap at 0.1 minimum
      } else if (targetInfo.type === 'direction') {
        // For directional markets: accuracy = correct direction prediction
        const predictedDirection = market.avgPrice > 0.5 ? 1 : -1;
        const actualDirection = currentPrice > targetInfo.currentPrice ? 1 : -1;
        accuracy = predictedDirection === actualDirection ? 0.8 : 0.2;
      }
      
      return Math.min(Math.max(accuracy, 0.1), 1.0); // Clamp between 0.1 and 1.0
      
    } catch (error) {
      console.warn('Error calculating prediction accuracy:', error);
      return 0.5; // Default neutral accuracy
    }
  }
  
  /**
   * Extract target information from market title
   */
  extractTargetFromMarket(market) {
    const title = market.title.toLowerCase();
    
    // Look for range markets (between X and Y)
    const rangeMatch = title.match(/(\w+)\s+.*?between\s+\$?(\d+(?:,\d+)*(?:\.\d+)?)\s+and\s+\$?(\d+(?:,\d+)*(?:\.\d+)?)/);
    if (rangeMatch) {
      const symbol = rangeMatch[1].toUpperCase();
      const minPrice = parseFloat(rangeMatch[2].replace(/,/g, ''));
      const maxPrice = parseFloat(rangeMatch[3].replace(/,/g, ''));
      const currentPrice = this.getCurrentCryptoPrice(symbol);
      
      return {
        type: 'range',
        crypto: symbol,
        minPrice,
        maxPrice,
        currentPrice
      };
    }
    
    // Look for "dip to" or "drop to" markets (bearish price targets)
    const dipMatch = title.match(/(\w+)\s+(?:dip\s+to|drop\s+to|fall\s+to|crash\s+to)\s+\$?(\d+(?:\.\d+)?)/);
    if (dipMatch) {
      const symbol = dipMatch[1].toUpperCase();
      const targetPrice = parseFloat(dipMatch[2]);
      const currentPrice = this.getCurrentCryptoPrice(symbol);
      
      return {
        type: 'price_target',
        crypto: symbol,
        targetPrice,
        currentPrice,
        direction: 'down' // This is a bearish prediction
      };
    }
    
    // Look for "reach" or "hit" markets (bullish price targets)
    const reachMatch = title.match(/(\w+)\s+(?:reach|hit|be\s+at|be\s+above)\s+\$?(\d+(?:\.\d+)?)/);
    if (reachMatch) {
      const symbol = reachMatch[1].toUpperCase();
      const targetPrice = parseFloat(reachMatch[2]);
      const currentPrice = this.getCurrentCryptoPrice(symbol);
      
      return {
        type: 'price_target',
        crypto: symbol,
        targetPrice,
        currentPrice,
        direction: 'up' // This is a bullish prediction
      };
    }
    
    // Look for "below" markets (bearish price targets)
    const belowMatch = title.match(/(\w+)\s+(?:be\s+below|below)\s+\$?(\d+(?:\.\d+)?)/);
    if (belowMatch) {
      const symbol = belowMatch[1].toUpperCase();
      const targetPrice = parseFloat(belowMatch[2]);
      const currentPrice = this.getCurrentCryptoPrice(symbol);
      
      return {
        type: 'price_target',
        crypto: symbol,
        targetPrice,
        currentPrice,
        direction: 'down' // This is a bearish prediction
      };
    }
    
    // Look for directional markets
    const directionMatch = title.match(/(\w+)\s+(?:up|down|rise|fall|increase|decrease)/);
    if (directionMatch) {
      const symbol = directionMatch[1].toUpperCase();
      const currentPrice = this.getCurrentCryptoPrice(symbol);
      const direction = title.includes('up') || title.includes('rise') || title.includes('increase') ? 'up' : 'down';
      
      return {
        type: 'direction',
        crypto: symbol,
        currentPrice,
        direction
      };
    }
    
    return null;
  }
  
  /**
   * Get current crypto price from market data
   */
  getCurrentCryptoPrice(symbol) {
    // Try to get from market cap data first
    if (this.marketCapData.has(symbol)) {
      const data = this.marketCapData.get(symbol);
      return data.price;
    }
    
    // Fallback: try to get from exchange
    try {
      // This would need to be implemented with actual exchange data
      // For now, return null to use default accuracy
      return null;
    } catch (error) {
      return null;
    }
  }

  /**
   * Calculate category accuracy score
   */
  calculateCategoryAccuracy(category, cryptoMarkets) {
    const categoryMarkets = cryptoMarkets.filter(market => 
      this.isMarketInCategory(market, category)
    );
    
    if (categoryMarkets.length === 0) {
      return 0.5; // Default neutral accuracy
    }
    
    // Calculate average accuracy for markets in this category
    const accuracies = categoryMarkets.map(market => 
      this.calculatePredictionAccuracy(market)
    );
    
    return accuracies.reduce((sum, acc) => sum + acc, 0) / accuracies.length;
  }
  
  /**
   * Calculate category volume weight
   */
  calculateCategoryVolumeWeight(category, cryptoMarkets) {
    const categoryMarkets = cryptoMarkets.filter(market => 
      this.isMarketInCategory(market, category)
    );
    
    if (categoryMarkets.length === 0) {
      return 0.5; // Default neutral volume weight
    }
    
    // Calculate average volume weight for markets in this category
    const volumeWeights = categoryMarkets.map(market => 
      this.calculateVolumeWeight(market)
    );
    
    return volumeWeights.reduce((sum, weight) => sum + weight, 0) / volumeWeights.length;
  }
  
  /**
   * Calculate category time weight
   */
  calculateCategoryTimeWeight(category, cryptoMarkets) {
    const categoryMarkets = cryptoMarkets.filter(market => 
      this.isMarketInCategory(market, category)
    );
    
    if (categoryMarkets.length === 0) {
      return 0.5; // Default neutral time weight
    }
    
    // Calculate average time weight for markets in this category
    const timeWeights = categoryMarkets.map(market => 
      this.getTimeToExpirationAdjustment(market)
    );
    
    return timeWeights.reduce((sum, weight) => sum + weight, 0) / timeWeights.length;
  }
  
  /**
   * Calculate overall time decay factor for all markets
   */
  calculateOverallTimeDecay(cryptoMarkets) {
    if (cryptoMarkets.length === 0) {
      return 1.0; // No time decay if no markets
    }
    
    // Calculate average time decay across all markets
    const timeDecays = cryptoMarkets.map(market => 
      this.getTimeToExpirationAdjustment(market)
    );
    
    return timeDecays.reduce((sum, decay) => sum + decay, 0) / timeDecays.length;
  }
  
  /**
   * Calculate overall volume weight for all markets
   */
  calculateOverallVolumeWeight(cryptoMarkets) {
    if (cryptoMarkets.length === 0) {
      return 1.0; // No volume adjustment if no markets
    }
    
    // Calculate average volume weight across all markets
    const volumeWeights = cryptoMarkets.map(market => 
      this.calculateVolumeWeight(market)
    );
    
    return volumeWeights.reduce((sum, weight) => sum + weight, 0) / volumeWeights.length;
  }
  
  /**
   * Check if a market belongs to a specific category
   */
  isMarketInCategory(market, category) {
    const keywords = this.marketCategories.get(category);
    if (!keywords) return false;
    
    const title = market.title.toLowerCase();
    return keywords.some(keyword => title.includes(keyword.toLowerCase()));
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
      markets: this.getIndividualMarkets(),
      lastUpdate: this.lastUpdate
    };
  }
  
  /**
   * Get individual markets used in calculation
   */
  getIndividualMarkets() {
    if (!this.lastProcessedMarkets) {
      return [];
    }
    
    return this.lastProcessedMarkets.map(market => {
      const probability = this.calculateBullishProbability(market);
      const weight = this.calculateMarketWeight(market);
      const category = this.getMarketCategory(market);
      const targetInfo = this.extractTargetFromMarket(market);
      
      return {
        title: market.title,
        category: category,
        probability: probability,
        volume: market.totalVolume || 0,
        weight: weight,
        type: targetInfo ? targetInfo.type : 'unknown',
        avgPrice: market.avgPrice,
        tradeCount: market.tradeCount || 0,
        lastTradeTime: market.lastTradeTime,
        slug: market.slug,
        eventSlug: market.eventSlug,
        trades: market.trades || [],
        totalVolume: market.totalVolume,
        totalValue: market.totalValue
      };
    });
  }
  
  /**
   * Get the category for a market
   */
  getMarketCategory(market) {
    const title = market.title?.toLowerCase() || '';
    const slug = market.slug?.toLowerCase() || '';
    const eventSlug = market.eventSlug?.toLowerCase() || '';
    
    // Categorize markets based on keywords
    for (const [category, keywords] of this.marketCategories) {
      if (keywords.some(keyword => 
        title.includes(keyword) || 
        slug.includes(keyword) || 
        eventSlug.includes(keyword)
      )) {
        return category;
      }
    }
    
    return 'uncategorized';
  }
}

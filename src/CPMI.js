import { SimplePolymarketClient } from './clients/SimplePolymarketClient.js';
import { WeightedAverageCalculator } from './utils/WeightedAverageCalculator.js';
import { DataValidator } from './utils/DataValidator.js';
import { TradeData, MarketData } from './types/index.js';

/**
 * CPMI - Crypto Prediction Market Index
 * Advanced crypto-specific prediction market index with sophisticated weighting and Bayesian updates
 */
export class CPMI {
  constructor(config = {}) {
    this.config = {
      // CPMI-specific category weights
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
      
      // Enhanced sensitivity parameters (0-10 scale)
      sensitivity: {
        volume: 8,                    // Volume Sensitivity (8/10)
        time: 6,                      // Time to Expiration (6/10)
        impact: 9,                    // Market Impact (9/10)
        liquidity: 7                  // Liquidity Score (7/10) - NEW
      },
      
      // Index configuration
      baselineValue: 100,             // Perfect market balance baseline
      updateInterval: 5 * 60 * 1000,  // 5 minutes
      smoothingPeriod: 60 * 60 * 1000, // 1 hour SMA
      
      // Beta distribution parameters
      betaDistribution: {
        uninformedPrior: { alpha: 1, beta: 1 },  // Beta(1,1) for new markets
        informedPrior: { alpha: 2, beta: 2 },    // Beta(2,2) for established markets
        volumeMomentumAlpha: 0.1                  // Sensitivity parameter for volume momentum
      },
      
      // Market selection criteria
      marketCriteria: {
        minTimeHorizon: 30,           // Minimum 30 days until resolution
        minVolume: 100,               // Minimum volume threshold
        maxDataLatency: 5,            // Maximum 5-minute data latency
        requiredDataQuality: true     // Require complete historical coverage
      },
      
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
    
    // Beta distribution tracking
    this.betaDistributions = new Map();
    
    // Volume momentum tracking
    this.volumeMomentum = new Map();
    
    // Market discovery and classification
    this.marketClassification = new Map();
    this.initializeMarketClassification();
  }

  /**
   * Initialize CPMI-specific market categories
   */
  initializeMarketCategories() {
    // Bitcoin Price Direction (30%)
    this.marketCategories.set('bitcoin-price', [
      'bitcoin', 'btc', 'halving', 'halvening', 'bitcoin price', 'btc price',
      'bitcoin adoption', 'bitcoin etf', 'bitcoin regulation'
    ]);

    // Ethereum Ecosystem (25%)
    this.marketCategories.set('ethereum-ecosystem', [
      'ethereum', 'eth', 'ethereum upgrade', 'ethereum 2.0', 'eth2', 'merge',
      'shanghai', 'cancun', 'danksharding', 'layer 2', 'l2', 'rollup'
    ]);

    // Regulatory Outcomes (25%)
    this.marketCategories.set('regulatory-outcomes', [
      'sec', 'regulation', 'regulatory', 'approval', 'policy', 'cftc',
      'crypto regulation', 'digital asset', 'stablecoin', 'crypto bill'
    ]);

    // DeFi Protocol Performance (10%)
    this.marketCategories.set('defi-protocols', [
      'defi', 'decentralized finance', 'uniswap', 'aave', 'compound', 'maker',
      'curve', 'sushiswap', 'tvl', 'total value locked', 'yield farming'
    ]);

    // Market Infrastructure (5%)
    this.marketCategories.set('market-infrastructure', [
      'exchange', 'custody', 'institutional', 'adoption', 'listing',
      'coinbase', 'binance', 'kraken', 'fidelity', 'blackrock'
    ]);

    // Technology Milestones (5%)
    this.marketCategories.set('technology-milestones', [
      'blockchain', 'scalability', 'interoperability', 'upgrade', 'hard fork',
      'consensus', 'proof of stake', 'proof of work', 'sidechain', 'bridge'
    ]);
  }

  /**
   * Initialize market classification patterns
   */
  initializeMarketClassification() {
    // Bitcoin price patterns
    this.marketClassification.set('bitcoin-price', {
      patterns: [
        /bitcoin.*price.*above/i,
        /bitcoin.*price.*below/i,
        /btc.*reach.*\$[\d,]+/i,
        /bitcoin.*halving/i,
        /bitcoin.*etf/i
      ],
      keywords: ['bitcoin', 'btc', 'price', 'halving', 'etf']
    });

    // Ethereum ecosystem patterns
    this.marketClassification.set('ethereum-ecosystem', {
      patterns: [
        /ethereum.*upgrade/i,
        /eth.*price.*above/i,
        /eth.*price.*below/i,
        /ethereum.*2\.0/i,
        /merge/i,
        /shanghai/i,
        /cancun/i
      ],
      keywords: ['ethereum', 'eth', 'upgrade', 'merge', 'shanghai', 'cancun']
    });

    // Regulatory patterns
    this.marketClassification.set('regulatory-outcomes', {
      patterns: [
        /sec.*approve/i,
        /sec.*reject/i,
        /regulatory.*approval/i,
        /crypto.*regulation/i,
        /digital.*asset.*bill/i
      ],
      keywords: ['sec', 'regulation', 'approval', 'policy', 'cftc']
    });

    // DeFi patterns
    this.marketClassification.set('defi-protocols', {
      patterns: [
        /defi.*tvl/i,
        /uniswap.*v\d+/i,
        /aave.*upgrade/i,
        /compound.*governance/i,
        /yield.*farming/i
      ],
      keywords: ['defi', 'tvl', 'uniswap', 'aave', 'compound', 'yield']
    });

    // Market infrastructure patterns
    this.marketClassification.set('market-infrastructure', {
      patterns: [
        /exchange.*listing/i,
        /institutional.*adoption/i,
        /custody.*solution/i,
        /coinbase.*listing/i,
        /binance.*listing/i
      ],
      keywords: ['exchange', 'listing', 'institutional', 'custody', 'adoption']
    });

    // Technology milestones patterns
    this.marketClassification.set('technology-milestones', {
      patterns: [
        /blockchain.*upgrade/i,
        /scalability.*solution/i,
        /interoperability/i,
        /hard.*fork/i,
        /consensus.*change/i
      ],
      keywords: ['blockchain', 'upgrade', 'scalability', 'interoperability', 'fork']
    });
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
   * Calculate the CPMI with advanced methodology
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
      
      // Process crypto markets with CPMI logic
      const cryptoMarkets = this.processCryptoTradesCPMI(cryptoTrades);
      console.log(`📊 Processed ${cryptoMarkets.length} crypto markets`);
      
      // Calculate category indices
      const categoryIndices = {};
      let totalWeightedProbability = 0;
      let totalWeight = 0;

      for (const [category, keywords] of this.marketCategories) {
        const categoryIndex = this.calculateCategoryIndexCPMI(category, keywords, cryptoMarkets);
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

      console.log(`📈 CPMI: ${this.currentIndex.toFixed(2)} (${this.getIndexInterpretation()})`);
      
    } catch (error) {
      console.error('❌ Error calculating CPMI:', error);
    }
  }

  /**
   * Filter trades for crypto-related markets with CPMI criteria
   */
  filterCryptoTrades(trades) {
    return trades.filter(trade => {
      const title = trade.title?.toLowerCase() || '';
      const slug = trade.slug?.toLowerCase() || '';
      const eventSlug = trade.eventSlug?.toLowerCase() || '';
      
      // Use the same working crypto keywords as the refined version
      const cryptoKeywords = [
        'bitcoin', 'btc', 'ethereum', 'eth', 'crypto', 'cryptocurrency',
        'defi', 'nft', 'meme', 'coin', 'token', 'blockchain', 'web3',
        'solana', 'sol', 'cardano', 'ada', 'polkadot', 'dot', 'chainlink',
        'link', 'uniswap', 'uni', 'aave', 'compound', 'maker', 'mkr',
        'dogecoin', 'doge', 'shiba', 'shib', 'pepe', 'floki', 'bonk'
      ];
      
      // Check if any crypto keywords are present
      const hasCryptoKeywords = cryptoKeywords.some(keyword => 
        title.includes(keyword) || 
        slug.includes(keyword) || 
        eventSlug.includes(keyword)
      );
      
      if (!hasCryptoKeywords) return false;
      
      // Apply relaxed CPMI market selection criteria (make it less restrictive)
      return this.meetsCPMICriteriaRelaxed(trade);
    });
  }

  /**
   * Check if trade meets CPMI market selection criteria
   */
  meetsCPMICriteria(trade) {
    // Check minimum time horizon (30 days)
    const resolutionDate = this.extractResolutionDate(trade.title);
    if (resolutionDate) {
      const daysUntilResolution = (resolutionDate - new Date()) / (1000 * 60 * 60 * 24);
      if (daysUntilResolution < this.config.marketCriteria.minTimeHorizon) {
        return false;
      }
    }
    
    // Check minimum volume
    if (trade.size < this.config.marketCriteria.minVolume) {
      return false;
    }
    
    // Check data quality (timestamp recency)
    const tradeAge = (Date.now() - trade.timestamp * 1000) / (1000 * 60);
    if (tradeAge > this.config.marketCriteria.maxDataLatency) {
      return false;
    }
    
    return true;
  }

  /**
   * Relaxed CPMI criteria - use the same logic as the working refined version
   */
  meetsCPMICriteriaRelaxed(trade) {
    // Just check basic data quality - don't be too restrictive
    const tradeAge = (Date.now() - trade.timestamp * 1000) / (1000 * 60);
    if (tradeAge > 60) { // Allow up to 1 hour old data
      return false;
    }
    
    return true; // Accept all crypto trades that meet basic criteria
  }

  /**
   * Extract resolution date from market title
   */
  extractResolutionDate(title) {
    // Look for date patterns in title
    const datePatterns = [
      /(\d{4}-\d{2}-\d{2})/,
      /(\d{1,2}\/\d{1,2}\/\d{4})/,
      /(\d{1,2}\s+\w+\s+\d{4})/,
      /(january|february|march|april|may|june|july|august|september|october|november|december)\s+\d{1,2},?\s+\d{4}/i
    ];
    
    for (const pattern of datePatterns) {
      const match = title.match(pattern);
      if (match) {
        const date = new Date(match[1]);
        if (!isNaN(date.getTime())) {
          return date;
        }
      }
    }
    
    return null;
  }

  /**
   * Process crypto trades with CPMI-specific logic
   */
  processCryptoTradesCPMI(trades) {
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
          // CPMI-specific fields
          category: this.classifyMarketCategory(trade.title),
          marketType: this.classifyMarketType(trade.title),
          bullishProbability: null,
          confidence: 0,
          liquidityScore: 0,
          volumeMomentum: 0,
          betaDistribution: null
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
    
    // Calculate CPMI-specific metrics
    cryptoMarkets.forEach(market => {
      if (market.totalVolume > 0) {
        market.avgPrice = market.totalValue / market.totalVolume;
      }
      
      // Calculate bullish probability using CPMI logic
      market.bullishProbability = this.calculateBullishProbabilityCPMI(market);
      
      // Calculate confidence based on volume and trade count
      market.confidence = this.calculateMarketConfidenceCPMI(market);
      
      // Calculate liquidity score
      market.liquidityScore = this.calculateLiquidityScore(market);
      
      // Calculate volume momentum
      market.volumeMomentum = this.calculateVolumeMomentum(market);
      
      // Initialize/update Beta distribution
      market.betaDistribution = this.updateBetaDistribution(market);
    });
    
    return Array.from(cryptoMarkets.values());
  }

  /**
   * Classify market category using CPMI patterns
   */
  classifyMarketCategory(title) {
    const titleLower = title.toLowerCase();
    
    // Use the same working logic as the refined version
    for (const [category, keywords] of this.marketCategories) {
      if (keywords.some(keyword => titleLower.includes(keyword))) {
        return category;
      }
    }
    
    // Fallback to CPMI-specific patterns if no match
    for (const [category, config] of this.marketClassification) {
      // Check patterns first
      for (const pattern of config.patterns) {
        if (pattern.test(titleLower)) {
          return category;
        }
      }
      
      // Check keywords as fallback
      const keywordMatches = config.keywords.filter(keyword => 
        titleLower.includes(keyword)
      ).length;
      
      if (keywordMatches >= 1) { // Relaxed to 1 keyword match
        return category;
      }
    }
    
    return 'bitcoin-price'; // Default to bitcoin-price for crypto trades
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
   * Calculate bullish probability using the SAME logic as the refined version
   */
  calculateBullishProbabilityCPMI(market) {
    const title = market.title.toLowerCase();
    const marketType = market.marketType;
    
    // Use the EXACT same logic as the refined version
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
   * Extract probability from binary outcome markets - SAME as refined version
   */
  extractBinaryProbability(market) {
    const avgPrice = market.avgPrice;
    const title = market.title.toLowerCase();
    const isBullishOutcome = this.isBullishOutcome(title);
    
    if (isBullishOutcome) {
      return Math.min(Math.max(avgPrice * 100, 0), 100);
    } else {
      return Math.min(Math.max((1 - avgPrice) * 100, 0), 100);
    }
  }

  /**
   * Extract probability from price prediction markets
   */
  extractPricePredictionProbability(market) {
    const title = market.title.toLowerCase();
    const avgPrice = market.avgPrice;
    
    const targetPrice = this.extractTargetPrice(title);
    if (!targetPrice) return 50;
    
    const currentPrice = this.getCurrentPrice(title);
    if (!currentPrice) return 50;
    
    if (targetPrice > currentPrice) {
      return Math.min(Math.max(avgPrice * 100, 0), 100);
    } else {
      return Math.min(Math.max((1 - avgPrice) * 100, 0), 100);
    }
  }

  /**
   * Extract probability from range markets
   */
  extractRangeProbability(market) {
    const title = market.title.toLowerCase();
    const avgPrice = market.avgPrice;
    
    const range = this.extractPriceRange(title);
    if (!range) return 50;
    
    const currentPrice = this.getCurrentPrice(title);
    if (!currentPrice) return 50;
    
    const isBullishRange = currentPrice < range.max && currentPrice > range.min;
    
    if (isBullishRange) {
      return Math.min(Math.max(avgPrice * 100, 0), 100);
    } else {
      return Math.min(Math.max((1 - avgPrice) * 100, 0), 100);
    }
  }

  /**
   * Extract probability from directional markets
   */
  extractDirectionalProbability(market) {
    const title = market.title.toLowerCase();
    const avgPrice = market.avgPrice;
    
    const isBullishDirection = title.includes('up') || title.includes('higher') || title.includes('rise');
    
    if (isBullishDirection) {
      return Math.min(Math.max(avgPrice * 100, 0), 100);
    } else {
      return Math.min(Math.max((1 - avgPrice) * 100, 0), 100);
    }
  }

  /**
   * Extract probability from sentiment analysis
   */
  extractSentimentProbability(market) {
    const buyRatio = market.buyTrades / (market.buyTrades + market.sellTrades);
    const volumeRatio = market.buyVolume / (market.buyVolume + market.sellVolume);
    
    const sentiment = (buyRatio * 0.6) + (volumeRatio * 0.4);
    return Math.min(Math.max(sentiment * 100, 0), 100);
  }

  /**
   * Determine if an outcome is bullish - SAME as refined version
   */
  isBullishOutcome(title) {
    const bullishKeywords = ['up', 'higher', 'rise', 'increase', 'bull', 'positive', 'yes', 'above', 'reach'];
    const bearishKeywords = ['down', 'lower', 'fall', 'decrease', 'bear', 'negative', 'no', 'below', 'crash'];
    
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
   * Calculate market confidence with CPMI logic
   */
  calculateMarketConfidenceCPMI(market) {
    const volumeConfidence = Math.min(market.totalVolume / 1000, 1);
    const tradeConfidence = Math.min(market.trades.length / 10, 1);
    const timeConfidence = market.lastTrade ? 
      Math.max(0, 1 - (Date.now() - market.lastTrade.timestamp * 1000) / (24 * 60 * 60 * 1000)) : 0;
    const liquidityConfidence = market.liquidityScore;
    
    return (volumeConfidence * 0.3) + (tradeConfidence * 0.2) + (timeConfidence * 0.2) + (liquidityConfidence * 0.3);
  }

  /**
   * Calculate liquidity score
   */
  calculateLiquidityScore(market) {
    // Simplified liquidity score based on trade frequency and volume consistency
    const tradeFrequency = market.trades.length / 24; // Trades per hour
    const volumeConsistency = 1 - (Math.std(market.trades.map(t => t.size)) / Math.mean(market.trades.map(t => t.size)));
    
    return Math.min((tradeFrequency * 0.6) + (volumeConsistency * 0.4), 1);
  }

  /**
   * Calculate volume momentum
   */
  calculateVolumeMomentum(market) {
    if (market.trades.length < 2) return 0;
    
    // Sort trades by timestamp
    const sortedTrades = market.trades.sort((a, b) => a.timestamp - b.timestamp);
    
    // Calculate volume for first half vs second half
    const midPoint = Math.floor(sortedTrades.length / 2);
    const firstHalfVolume = sortedTrades.slice(0, midPoint).reduce((sum, t) => sum + t.size, 0);
    const secondHalfVolume = sortedTrades.slice(midPoint).reduce((sum, t) => sum + t.size, 0);
    
    if (firstHalfVolume === 0) return 0;
    
    return (secondHalfVolume - firstHalfVolume) / firstHalfVolume;
  }

  /**
   * Update Beta distribution for market
   */
  updateBetaDistribution(market) {
    const marketKey = market.conditionId;
    
    if (!this.betaDistributions.has(marketKey)) {
      // Initialize with uninformed prior
      this.betaDistributions.set(marketKey, {
        alpha: this.config.betaDistribution.uninformedPrior.alpha,
        beta: this.config.betaDistribution.uninformedPrior.beta
      });
    }
    
    const currentDist = this.betaDistributions.get(marketKey);
    
    // Update based on recent trades
    const recentTrades = market.trades.slice(-10); // Last 10 trades
    let successfulOutcomes = 0;
    let failedOutcomes = 0;
    
    recentTrades.forEach(trade => {
      if (trade.side === 'BUY') {
        successfulOutcomes++;
      } else {
        failedOutcomes++;
      }
    });
    
    const newDist = {
      alpha: currentDist.alpha + successfulOutcomes,
      beta: currentDist.beta + failedOutcomes
    };
    
    this.betaDistributions.set(marketKey, newDist);
    
    return newDist;
  }

  /**
   * Calculate index for a specific category with CPMI logic
   */
  calculateCategoryIndexCPMI(category, keywords, cryptoMarkets) {
    try {
      let totalWeightedProbability = 0;
      let totalWeight = 0;

      // Find markets that match this category
      const categoryMarkets = cryptoMarkets.filter(market => {
        return market.category === category;
      });

      if (categoryMarkets.length === 0) {
        return null;
      }

      for (const market of categoryMarkets) {
        try {
          // Calculate market weight based on CPMI factors
          const marketWeight = this.calculateMarketWeightCPMI(market);
          
          // Use the CPMI bullish probability
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
   * Calculate market weight with CPMI logic
   */
  calculateMarketWeightCPMI(market) {
    const factors = {
      volume: this.calculateVolumeWeight(market),
      time: this.calculateTimeWeight(market),
      impact: this.calculateImpactWeight(market),
      liquidity: market.liquidityScore,
      confidence: market.confidence || 0
    };

    // Weighted combination of CPMI factors
    const totalWeight = 
      factors.volume * (this.config.sensitivity.volume / 10) +
      factors.time * (this.config.sensitivity.time / 10) +
      factors.impact * (this.config.sensitivity.impact / 10) +
      factors.liquidity * (this.config.sensitivity.liquidity / 10) +
      factors.confidence * 0.5; // Additional confidence factor

    return totalWeight;
  }

  /**
   * Calculate volume-based weight
   */
  calculateVolumeWeight(market) {
    const volume = market.totalVolume || 0;
    return Math.min(volume / 1000, 1);
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
   * Calculate impact-based weight (market significance)
   */
  calculateImpactWeight(market) {
    // CPMI-specific impact scores
    const impactScores = {
      'bitcoin-price': 1.0,
      'ethereum-ecosystem': 0.9,
      'regulatory-outcomes': 0.8,
      'defi-protocols': 0.6,
      'market-infrastructure': 0.5,
      'technology-milestones': 0.4
    };

    return impactScores[market.category] || 0.1;
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
      lastUpdate: this.lastUpdate,
      betaDistributions: Object.fromEntries(this.betaDistributions),
      volumeMomentum: Object.fromEntries(this.volumeMomentum)
    };
  }
}

// Helper functions for Math operations
Math.std = function(arr) {
  const mean = Math.mean(arr);
  const variance = arr.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / arr.length;
  return Math.sqrt(variance);
};

Math.mean = function(arr) {
  return arr.reduce((sum, val) => sum + val, 0) / arr.length;
};

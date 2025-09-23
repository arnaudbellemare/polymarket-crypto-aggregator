import axios from 'axios';
import { ApiResponse } from '../types/index.js';

/**
 * Simple Polymarket Client using the basic GET endpoint
 * No authentication required - perfect for fetching trade data
 */
export class SimplePolymarketClient {
  constructor(baseUrl = 'https://data-api.polymarket.com') {
    this.baseUrl = baseUrl;
    this.timeout = 30000;
    
    this.client = axios.create({
      baseURL: this.baseUrl,
      timeout: this.timeout,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });

    // Add response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        console.error('Polymarket API Error:', error.response?.data || error.message);
        return Promise.reject(error);
      }
    );
  }

  /**
   * Get all trades from Polymarket
   * @param {Object} params - Query parameters
   * @param {number} params.limit - Number of trades to fetch (default: 100, max: 10000)
   * @param {number} params.offset - Offset for pagination (default: 0)
   * @param {boolean} params.takerOnly - Only show taker trades (default: true)
   * @param {string[]} params.market - Array of condition IDs to filter by
   * @param {string} params.user - User profile address to filter by
   * @param {string} params.side - Trade side: 'BUY' or 'SELL'
   * @param {string} params.filterType - Filter type: 'CASH' or 'TOKENS'
   * @param {number} params.filterAmount - Filter amount (must be used with filterType)
   */
  async getTrades(params = {}) {
    try {
      const response = await this.client.get('/trades', { params });
      return new ApiResponse(true, response.data);
    } catch (error) {
      return new ApiResponse(false, null, error.message);
    }
  }

  /**
   * Get trades for specific crypto markets
   * @param {string[]} conditionIds - Array of condition IDs for crypto markets
   * @param {number} limit - Number of trades to fetch
   */
  async getCryptoTrades(conditionIds, limit = 1000) {
    try {
      const params = {
        market: conditionIds.join(','),
        limit: Math.min(limit, 10000), // Cap at API limit
        takerOnly: true
      };
      
      const response = await this.client.get('/trades', { params });
      return new ApiResponse(true, response.data);
    } catch (error) {
      return new ApiResponse(false, null, error.message);
    }
  }

  /**
   * Get recent trades for a specific market
   * @param {string} conditionId - Condition ID of the market
   * @param {number} limit - Number of recent trades
   */
  async getMarketTrades(conditionId, limit = 100) {
    try {
      const params = {
        market: conditionId,
        limit: Math.min(limit, 10000),
        takerOnly: true
      };
      
      const response = await this.client.get('/trades', { params });
      return new ApiResponse(true, response.data);
    } catch (error) {
      return new ApiResponse(false, null, error.message);
    }
  }

  /**
   * Get trades by user
   * @param {string} userAddress - User profile address (0x-prefixed)
   * @param {number} limit - Number of trades to fetch
   */
  async getUserTrades(userAddress, limit = 100) {
    try {
      const params = {
        user: userAddress,
        limit: Math.min(limit, 10000),
        takerOnly: true
      };
      
      const response = await this.client.get('/trades', { params });
      return new ApiResponse(true, response.data);
    } catch (error) {
      return new ApiResponse(false, null, error.message);
    }
  }

  /**
   * Get buy trades only
   * @param {number} limit - Number of trades to fetch
   */
  async getBuyTrades(limit = 100) {
    try {
      const params = {
        side: 'BUY',
        limit: Math.min(limit, 10000),
        takerOnly: true
      };
      
      const response = await this.client.get('/trades', { params });
      return new ApiResponse(true, response.data);
    } catch (error) {
      return new ApiResponse(false, null, error.message);
    }
  }

  /**
   * Get sell trades only
   * @param {number} limit - Number of trades to fetch
   */
  async getSellTrades(limit = 100) {
    try {
      const params = {
        side: 'SELL',
        limit: Math.min(limit, 10000),
        takerOnly: true
      };
      
      const response = await this.client.get('/trades', { params });
      return new ApiResponse(true, response.data);
    } catch (error) {
      return new ApiResponse(false, null, error.message);
    }
  }

  /**
   * Get trades with size filter
   * @param {string} filterType - 'CASH' or 'TOKENS'
   * @param {number} filterAmount - Minimum amount
   * @param {number} limit - Number of trades to fetch
   */
  async getTradesBySize(filterType, filterAmount, limit = 100) {
    try {
      const params = {
        filterType,
        filterAmount,
        limit: Math.min(limit, 10000),
        takerOnly: true
      };
      
      const response = await this.client.get('/trades', { params });
      return new ApiResponse(true, response.data);
    } catch (error) {
      return new ApiResponse(false, null, error.message);
    }
  }

  /**
   * Get all recent trades (no filters)
   * @param {number} limit - Number of trades to fetch
   */
  async getAllRecentTrades(limit = 1000) {
    try {
      const params = {
        limit: Math.min(limit, 10000),
        takerOnly: true
      };
      
      const response = await this.client.get('/trades', { params });
      return new ApiResponse(true, response.data);
    } catch (error) {
      return new ApiResponse(false, null, error.message);
    }
  }

  /**
   * Get crypto-specific trades by filtering for crypto keywords
   * @param {number} limit - Number of trades to fetch
   */
  async getCryptoTrades(limit = 1000) {
    try {
      const params = {
        limit: Math.min(limit, 10000),
        takerOnly: true
      };
      
      const response = await this.client.get('/trades', { params });
      
      if (response.data && Array.isArray(response.data)) {
        // Filter for crypto-related trades (more strict)
        const cryptoKeywords = [
          'bitcoin', 'btc', 'ethereum', 'eth', 'crypto', 'cryptocurrency',
          'solana', 'sol', 'cardano', 'ada', 'polkadot', 'dot', 
          'dogecoin', 'doge', 'litecoin', 'ltc', 'chainlink', 'link',
          'avalanche', 'avax', 'polygon', 'matic', 'defi', 'nft',
          'binance', 'coinbase', 'kraken', 'exchange', 'mining', 'staking'
        ];
        
        // Exclude non-crypto keywords
        const excludeKeywords = [
          'election', 'mayor', 'mayoral', 'votes', 'voting', 'senate', 'congress',
          'tennis', 'sports', 'championship', 'tournament', 'game', 'match',
          'trump', 'biden', 'president', 'political', 'politics'
        ];
        
        const cryptoTrades = response.data.filter(trade => {
          const title = trade.title?.toLowerCase() || '';
          const slug = trade.slug?.toLowerCase() || '';
          const eventSlug = trade.eventSlug?.toLowerCase() || '';
          
          // First check if it contains crypto keywords
          const hasCryptoKeywords = cryptoKeywords.some(keyword => 
            title.includes(keyword) || slug.includes(keyword) || eventSlug.includes(keyword)
          );
          
          // Then check if it should be excluded (non-crypto)
          const shouldExclude = excludeKeywords.some(keyword => 
            title.includes(keyword) || slug.includes(keyword) || eventSlug.includes(keyword)
          );
          
          return hasCryptoKeywords && !shouldExclude;
        });
        
        return new ApiResponse(true, cryptoTrades);
      }
      
      return new ApiResponse(true, response.data);
    } catch (error) {
      return new ApiResponse(false, null, error.message);
    }
  }

  /**
   * Process trade data to extract crypto market information
   * @param {Array} trades - Array of trade objects
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
      } else {
        market.sellVolume += trade.size;
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
   * Get crypto market statistics
   * @param {Array} trades - Array of trade objects
   */
  getCryptoMarketStats(trades) {
    const stats = {
      totalTrades: trades.length,
      totalVolume: 0,
      totalValue: 0,
      buyTrades: 0,
      sellTrades: 0,
      buyVolume: 0,
      sellVolume: 0,
      avgPrice: 0,
      markets: new Set(),
      users: new Set(),
      timeRange: {
        earliest: null,
        latest: null
      }
    };
    
    trades.forEach(trade => {
      stats.totalVolume += trade.size;
      stats.totalValue += trade.size * trade.price;
      stats.markets.add(trade.conditionId);
      stats.users.add(trade.proxyWallet);
      
      if (trade.side === 'BUY') {
        stats.buyTrades++;
        stats.buyVolume += trade.size;
      } else {
        stats.sellTrades++;
        stats.sellVolume += trade.size;
      }
      
      const timestamp = new Date(trade.timestamp * 1000);
      if (!stats.timeRange.earliest || timestamp < stats.timeRange.earliest) {
        stats.timeRange.earliest = timestamp;
      }
      if (!stats.timeRange.latest || timestamp > stats.timeRange.latest) {
        stats.timeRange.latest = timestamp;
      }
    });
    
    if (stats.totalVolume > 0) {
      stats.avgPrice = stats.totalValue / stats.totalVolume;
    }
    
    stats.markets = stats.markets.size;
    stats.users = stats.users.size;
    
    return stats;
  }

  /**
   * Get markets from Polymarket Gamma API
   * @param {Object} params - Query parameters for filtering markets
   * @param {string} params.status - Market status filter (e.g., 'ACTIVE', 'RESOLVED')
   * @param {string} params.category - Market category filter
   * @param {string} params.tokens - Token filter
   * @param {number} params.limit - Number of markets to fetch
   * @param {number} params.offset - Offset for pagination
   */
  async getMarkets(params = {}) {
    try {
      // Use the Gamma API endpoint for markets
      const gammaClient = axios.create({
        baseURL: 'https://gamma-api.polymarket.com',
        timeout: this.timeout,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });

      const response = await gammaClient.get('/markets', { params });
      return new ApiResponse(true, response.data);
    } catch (error) {
      return new ApiResponse(false, null, error.message);
    }
  }

  /**
   * Get active markets from Polymarket Gamma API
   * @param {number} limit - Number of active markets to fetch
   */
  async getActiveMarkets(limit = 100) {
    try {
      const params = {
        status: 'ACTIVE',
        limit: Math.min(limit, 1000)
      };
      return await this.getMarkets(params);
    } catch (error) {
      return new ApiResponse(false, null, error.message);
    }
  }

  /**
   * Get markets by category from Polymarket Gamma API
   * @param {string} category - Market category to filter by
   * @param {number} limit - Number of markets to fetch
   */
  async getMarketsByCategory(category, limit = 100) {
    try {
      const params = {
        category,
        limit: Math.min(limit, 1000)
      };
      return await this.getMarkets(params);
    } catch (error) {
      return new ApiResponse(false, null, error.message);
    }
  }

  /**
   * Get comprehensive market data with all fields
   * @param {Object} params - Query parameters for filtering markets
   * @param {string} params.status - Market status filter (e.g., 'ACTIVE', 'RESOLVED')
   * @param {string} params.category - Market category filter
   * @param {string} params.tokens - Token filter
   * @param {number} params.limit - Number of markets to fetch
   * @param {number} params.offset - Offset for pagination
   * @param {boolean} params.includeEvents - Include event data
   * @param {boolean} params.includeCategories - Include category data
   * @param {boolean} params.includeTags - Include tag data
   */
  async getComprehensiveMarkets(params = {}) {
    try {
      // Use the Gamma API endpoint for markets with comprehensive data
      const gammaClient = axios.create({
        baseURL: 'https://gamma-api.polymarket.com',
        timeout: this.timeout,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });

      // Add parameters to include related data
      const queryParams = {
        ...params,
        include: 'events,categories,tags,creator,imageOptimized,iconOptimized'
      };

      const response = await gammaClient.get('/markets', { params: queryParams });
      return new ApiResponse(true, response.data);
    } catch (error) {
      return new ApiResponse(false, null, error.message);
    }
  }

  /**
   * Get crypto markets with comprehensive data
   * @param {number} limit - Number of crypto markets to fetch
   */
  async getCryptoMarkets(limit = 100) {
    try {
      const params = {
        category: 'crypto',
        limit: Math.min(limit, 1000),
        active: true,
        include: 'events,categories,tags,creator,imageOptimized,iconOptimized'
      };
      return await this.getComprehensiveMarkets(params);
    } catch (error) {
      return new ApiResponse(false, null, error.message);
    }
  }

  /**
   * Get only crypto-related markets with strict filtering
   * @param {number} limit - Number of crypto markets to fetch
   * @param {boolean} activeOnly - Only fetch active markets (default: true)
   */
  async getCryptoOnlyMarkets(limit = 100, activeOnly = true) {
    try {
      const gammaClient = axios.create({
        baseURL: 'https://gamma-api.polymarket.com',
        timeout: this.timeout,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });

      const params = {
        category: 'crypto',
        limit: Math.min(limit, 1000),
        include: 'events,categories,tags,creator,imageOptimized,iconOptimized'
      };

      if (activeOnly) {
        params.active = true;
      }

      const response = await gammaClient.get('/markets', { params });
      
      // Additional client-side filtering to ensure crypto-only results
      let cryptoMarkets = response.data;
      
      if (Array.isArray(cryptoMarkets)) {
        // Filter for crypto-related markets based on multiple criteria
        cryptoMarkets = cryptoMarkets.filter(market => {
          const isCryptoCategory = market.category && 
            (market.category.toLowerCase().includes('crypto') || 
             market.category.toLowerCase().includes('bitcoin') ||
             market.category.toLowerCase().includes('ethereum') ||
             market.category.toLowerCase().includes('cryptocurrency'));
          
          const isCryptoQuestion = market.question && 
            (market.question.toLowerCase().includes('bitcoin') ||
             market.question.toLowerCase().includes('ethereum') ||
             market.question.toLowerCase().includes('crypto') ||
             market.question.toLowerCase().includes('btc') ||
             market.question.toLowerCase().includes('eth') ||
             market.question.toLowerCase().includes('cryptocurrency'));
          
          const isCryptoSlug = market.slug && 
            (market.slug.toLowerCase().includes('bitcoin') ||
             market.slug.toLowerCase().includes('ethereum') ||
             market.slug.toLowerCase().includes('crypto') ||
             market.slug.toLowerCase().includes('btc') ||
             market.slug.toLowerCase().includes('eth'));
          
          return isCryptoCategory || isCryptoQuestion || isCryptoSlug;
        });
      }
      
      return new ApiResponse(true, cryptoMarkets);
    } catch (error) {
      return new ApiResponse(false, null, error.message);
    }
  }

  /**
   * Get crypto markets by specific cryptocurrency
   * @param {string} cryptoName - Name of cryptocurrency (e.g., 'bitcoin', 'ethereum')
   * @param {number} limit - Number of markets to fetch
   */
  async getCryptoMarketsByToken(cryptoName, limit = 50) {
    try {
      const gammaClient = axios.create({
        baseURL: 'https://gamma-api.polymarket.com',
        timeout: this.timeout,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });

      const params = {
        limit: Math.min(limit, 1000),
        include: 'events,categories,tags,creator,imageOptimized,iconOptimized'
      };

      const response = await gammaClient.get('/markets', { params });
      
      // Filter for specific cryptocurrency
      let cryptoMarkets = response.data;
      
      if (Array.isArray(cryptoMarkets)) {
        const searchTerm = cryptoName.toLowerCase();
        cryptoMarkets = cryptoMarkets.filter(market => {
          const question = (market.question || '').toLowerCase();
          const slug = (market.slug || '').toLowerCase();
          const category = (market.category || '').toLowerCase();
          
          return question.includes(searchTerm) || 
                 slug.includes(searchTerm) || 
                 category.includes(searchTerm);
        });
      }
      
      return new ApiResponse(true, cryptoMarkets);
    } catch (error) {
      return new ApiResponse(false, null, error.message);
    }
  }

  /**
   * Get featured markets
   * @param {number} limit - Number of featured markets to fetch
   */
  async getFeaturedMarkets(limit = 50) {
    try {
      const params = {
        featured: true,
        limit: Math.min(limit, 1000),
        include: 'events,categories,tags,creator,imageOptimized,iconOptimized'
      };
      return await this.getComprehensiveMarkets(params);
    } catch (error) {
      return new ApiResponse(false, null, error.message);
    }
  }

  /**
   * Get markets by volume (highest volume first)
   * @param {number} limit - Number of markets to fetch
   * @param {string} timeFrame - Volume timeframe: '24hr', '1wk', '1mo', '1yr'
   */
  async getMarketsByVolume(limit = 100, timeFrame = '24hr') {
    try {
      const params = {
        limit: Math.min(limit, 1000),
        sortBy: `volume${timeFrame}`,
        order: 'desc',
        include: 'events,categories,tags,creator,imageOptimized,iconOptimized'
      };
      return await this.getComprehensiveMarkets(params);
    } catch (error) {
      return new ApiResponse(false, null, error.message);
    }
  }

  /**
   * Health check for the API
   */
  async healthCheck() {
    try {
      const response = await this.client.get('/trades', { 
        params: { limit: 1 } 
      });
      return new ApiResponse(true, { status: 'healthy', data: response.data });
    } catch (error) {
      return new ApiResponse(false, null, error.message);
    }
  }
}

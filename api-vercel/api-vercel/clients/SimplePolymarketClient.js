const axios = require('axios');
const { ApiResponse } = require('../types/index.js');

/**
 * Simple Polymarket Client using the basic GET endpoint
 * No authentication required - perfect for fetching trade data
 */
class SimplePolymarketClient {
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

module.exports = { SimplePolymarketClient };

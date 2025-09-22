import axios from 'axios';
import { ApiResponse } from '../types/index.js';

/**
 * Data API Client for Polymarket
 * Handles user data, holdings, and on-chain activities
 */
export class DataApiClient {
  constructor(apiKey, secretKey, baseUrl = 'https://data-api.polymarket.com') {
    this.apiKey = apiKey;
    this.secretKey = secretKey;
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

    // Add request interceptor for authentication
    this.client.interceptors.request.use((config) => {
      if (this.apiKey && this.secretKey) {
        config.headers['Authorization'] = `Bearer ${this.apiKey}`;
        // Add signature if needed for authenticated endpoints
      }
      return config;
    });

    // Add response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        console.error('Data API Error:', error.response?.data || error.message);
        return Promise.reject(error);
      }
    );
  }

  /**
   * Get user profile information
   */
  async getUserProfile(userId) {
    try {
      const response = await this.client.get(`/users/${userId}`);
      return new ApiResponse(true, response.data);
    } catch (error) {
      return new ApiResponse(false, null, error.message);
    }
  }

  /**
   * Get user holdings/positions
   */
  async getUserHoldings(userId) {
    try {
      const response = await this.client.get(`/users/${userId}/holdings`);
      return new ApiResponse(true, response.data);
    } catch (error) {
      return new ApiResponse(false, null, error.message);
    }
  }

  /**
   * Get user trading history
   */
  async getUserTradingHistory(userId, limit = 100, offset = 0) {
    try {
      const response = await this.client.get(`/users/${userId}/trades`, {
        params: { limit, offset }
      });
      return new ApiResponse(true, response.data);
    } catch (error) {
      return new ApiResponse(false, null, error.message);
    }
  }

  /**
   * Get user portfolio summary
   */
  async getUserPortfolio(userId) {
    try {
      const response = await this.client.get(`/users/${userId}/portfolio`);
      return new ApiResponse(true, response.data);
    } catch (error) {
      return new ApiResponse(false, null, error.message);
    }
  }

  /**
   * Get on-chain activities for a user
   */
  async getUserOnChainActivities(userId, limit = 100) {
    try {
      const response = await this.client.get(`/users/${userId}/activities`, {
        params: { limit }
      });
      return new ApiResponse(true, response.data);
    } catch (error) {
      return new ApiResponse(false, null, error.message);
    }
  }

  /**
   * Get market participation data
   */
  async getMarketParticipation(marketId) {
    try {
      const response = await this.client.get(`/markets/${marketId}/participation`);
      return new ApiResponse(true, response.data);
    } catch (error) {
      return new ApiResponse(false, null, error.message);
    }
  }

  /**
   * Get liquidity provider data
   */
  async getLiquidityProviders(marketId) {
    try {
      const response = await this.client.get(`/markets/${marketId}/liquidity`);
      return new ApiResponse(true, response.data);
    } catch (error) {
      return new ApiResponse(false, null, error.message);
    }
  }

  /**
   * Get market analytics
   */
  async getMarketAnalytics(marketId) {
    try {
      const response = await this.client.get(`/markets/${marketId}/analytics`);
      return new ApiResponse(true, response.data);
    } catch (error) {
      return new ApiResponse(false, null, error.message);
    }
  }

  /**
   * Get global market statistics
   */
  async getGlobalStats() {
    try {
      const response = await this.client.get('/stats/global');
      return new ApiResponse(true, response.data);
    } catch (error) {
      return new ApiResponse(false, null, error.message);
    }
  }

  /**
   * Get top traders
   */
  async getTopTraders(timeframe = '24h', limit = 100) {
    try {
      const response = await this.client.get('/stats/top-traders', {
        params: { timeframe, limit }
      });
      return new ApiResponse(true, response.data);
    } catch (error) {
      return new ApiResponse(false, null, error.message);
    }
  }

  /**
   * Get market volume statistics
   */
  async getVolumeStats(timeframe = '24h') {
    try {
      const response = await this.client.get('/stats/volume', {
        params: { timeframe }
      });
      return new ApiResponse(true, response.data);
    } catch (error) {
      return new ApiResponse(false, null, error.message);
    }
  }

  /**
   * Get price impact data
   */
  async getPriceImpact(marketId, tradeSize) {
    try {
      const response = await this.client.get(`/markets/${marketId}/price-impact`, {
        params: { trade_size: tradeSize }
      });
      return new ApiResponse(true, response.data);
    } catch (error) {
      return new ApiResponse(false, null, error.message);
    }
  }

  /**
   * Get historical market data
   */
  async getHistoricalData(marketId, startDate, endDate, interval = '1h') {
    try {
      const response = await this.client.get(`/markets/${marketId}/historical`, {
        params: {
          start_date: startDate,
          end_date: endDate,
          interval
        }
      });
      return new ApiResponse(true, response.data);
    } catch (error) {
      return new ApiResponse(false, null, error.message);
    }
  }

  /**
   * Health check for the Data API
   */
  async healthCheck() {
    try {
      const response = await this.client.get('/health');
      return new ApiResponse(true, response.data);
    } catch (error) {
      return new ApiResponse(false, null, error.message);
    }
  }
}

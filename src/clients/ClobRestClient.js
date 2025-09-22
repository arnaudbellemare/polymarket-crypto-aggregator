import axios from 'axios';
import { ApiResponse } from '../types/index.js';

/**
 * CLOB REST API Client for Polymarket
 * Handles all REST API interactions with the CLOB endpoint
 */
export class ClobRestClient {
  constructor(apiKey, secretKey, baseUrl = 'https://clob.polymarket.com') {
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
        console.error('CLOB API Error:', error.response?.data || error.message);
        return Promise.reject(error);
      }
    );
  }

  /**
   * Get all available markets/assets
   */
  async getMarkets() {
    try {
      const response = await this.client.get('/markets');
      return new ApiResponse(true, response.data);
    } catch (error) {
      return new ApiResponse(false, null, error.message);
    }
  }

  /**
   * Get market data for a specific asset
   */
  async getMarketData(assetId) {
    try {
      const response = await this.client.get(`/markets/${assetId}`);
      return new ApiResponse(true, response.data);
    } catch (error) {
      return new ApiResponse(false, null, error.message);
    }
  }

  /**
   * Get order book for a specific asset
   */
  async getOrderBook(assetId) {
    try {
      const response = await this.client.get(`/markets/${assetId}/orderbook`);
      return new ApiResponse(true, response.data);
    } catch (error) {
      return new ApiResponse(false, null, error.message);
    }
  }

  /**
   * Get recent trades for a specific asset
   */
  async getRecentTrades(assetId, limit = 100) {
    try {
      const response = await this.client.get(`/markets/${assetId}/trades`, {
        params: { limit }
      });
      return new ApiResponse(true, response.data);
    } catch (error) {
      return new ApiResponse(false, null, error.message);
    }
  }

  /**
   * Get all crypto markets
   */
  async getAllCryptoMarkets() {
    try {
      const response = await this.client.get('/markets', {
        params: {
          type: 'crypto',
          status: 'active'
        }
      });
      return new ApiResponse(true, response.data);
    } catch (error) {
      return new ApiResponse(false, null, error.message);
    }
  }

  /**
   * Get market statistics
   */
  async getMarketStats(assetId) {
    try {
      const response = await this.client.get(`/markets/${assetId}/stats`);
      return new ApiResponse(true, response.data);
    } catch (error) {
      return new ApiResponse(false, null, error.message);
    }
  }

  /**
   * Get price history for an asset
   */
  async getPriceHistory(assetId, timeframe = '1h', limit = 100) {
    try {
      const response = await this.client.get(`/markets/${assetId}/history`, {
        params: {
          timeframe,
          limit
        }
      });
      return new ApiResponse(true, response.data);
    } catch (error) {
      return new ApiResponse(false, null, error.message);
    }
  }

  /**
   * Batch request for multiple assets
   */
  async getBatchMarketData(assetIds) {
    try {
      const promises = assetIds.map(assetId => this.getMarketData(assetId));
      const results = await Promise.allSettled(promises);
      
      const successful = results
        .filter(result => result.status === 'fulfilled' && result.value.success)
        .map(result => result.value.data);
      
      const failed = results
        .filter(result => result.status === 'rejected' || !result.value.success)
        .map(result => result.reason || result.value.error);

      return new ApiResponse(true, {
        successful,
        failed,
        total: assetIds.length,
        successCount: successful.length,
        failureCount: failed.length
      });
    } catch (error) {
      return new ApiResponse(false, null, error.message);
    }
  }

  /**
   * Health check for the API
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

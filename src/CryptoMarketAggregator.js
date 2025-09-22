import { ClobRestClient } from './clients/ClobRestClient.js';
import { DataApiClient } from './clients/DataApiClient.js';
import { WebSocketClient } from './clients/WebSocketClient.js';
import { WeightedAverageCalculator } from './utils/WeightedAverageCalculator.js';
import { DataValidator } from './utils/DataValidator.js';
import { MarketData, TradeData, WeightedAverageResult } from './types/index.js';

/**
 * Main aggregator class that combines all Polymarket APIs
 * to fetch crypto market data and calculate weighted averages
 */
export class CryptoMarketAggregator {
  constructor(config = {}) {
    this.config = {
      apiKey: config.apiKey || process.env.POLYMARKET_API_KEY,
      secretKey: config.secretKey || process.env.POLYMARKET_SECRET_KEY,
      clobBaseUrl: config.clobBaseUrl || process.env.CLOB_BASE_URL || 'https://clob.polymarket.com',
      dataApiBaseUrl: config.dataApiBaseUrl || process.env.DATA_API_BASE_URL || 'https://data-api.polymarket.com',
      wsEndpoint: config.wsEndpoint || process.env.WS_ENDPOINT || 'wss://ws-subscriptions-clob.polymarket.com/ws/',
      ...config
    };

    // Initialize clients
    this.clobClient = new ClobRestClient(
      this.config.apiKey,
      this.config.secretKey,
      this.config.clobBaseUrl
    );

    this.dataApiClient = new DataApiClient(
      this.config.apiKey,
      this.config.secretKey,
      this.config.dataApiBaseUrl
    );

    this.wsClient = new WebSocketClient(this.config.wsEndpoint, {
      reconnectInterval: this.config.reconnectInterval || 5000,
      maxReconnectAttempts: this.config.maxReconnectAttempts || 10
    });

    this.calculator = new WeightedAverageCalculator();
    this.validator = DataValidator;

    // State management
    this.isConnected = false;
    this.subscribedAssets = new Set();
    this.marketDataCache = new Map();
    this.tradeDataCache = new Map();

    // Setup WebSocket event handlers
    this.setupWebSocketHandlers();
  }

  /**
   * Setup WebSocket event handlers
   */
  setupWebSocketHandlers() {
    this.wsClient.on('connect', () => {
      console.log('Connected to Polymarket WebSocket');
      this.isConnected = true;
    });

    this.wsClient.on('disconnect', () => {
      console.log('Disconnected from Polymarket WebSocket');
      this.isConnected = false;
    });

    this.wsClient.on('error', (error) => {
      console.error('WebSocket error:', error);
    });

    this.wsClient.on('marketUpdate', (marketData) => {
      this.handleMarketUpdate(marketData);
    });

    this.wsClient.on('tradeUpdate', (tradeData) => {
      this.handleTradeUpdate(tradeData);
    });

    this.wsClient.on('orderBookUpdate', (orderBookData) => {
      this.handleOrderBookUpdate(orderBookData);
    });
  }

  /**
   * Connect to WebSocket and start real-time data streaming
   */
  async connect() {
    try {
      await this.wsClient.connect();
      return true;
    } catch (error) {
      console.error('Failed to connect to WebSocket:', error);
      return false;
    }
  }

  /**
   * Disconnect from WebSocket
   */
  disconnect() {
    this.wsClient.disconnect();
    this.isConnected = false;
  }

  /**
   * Get all available crypto markets
   */
  async getAllCryptoMarkets() {
    try {
      const response = await this.clobClient.getAllCryptoMarkets();
      if (response.success) {
        return response.data;
      } else {
        throw new Error(response.error);
      }
    } catch (error) {
      console.error('Error fetching crypto markets:', error);
      throw error;
    }
  }

  /**
   * Subscribe to real-time data for specific assets
   */
  subscribeToAssets(assetIds) {
    if (!this.isConnected) {
      throw new Error('WebSocket not connected. Call connect() first.');
    }

    const validAssetIds = assetIds.filter(assetId => {
      const validation = this.validator.validateAssetId(assetId);
      if (!validation.isValid) {
        console.warn(`Invalid asset ID: ${assetId} - ${validation.error}`);
        return false;
      }
      return true;
    });

    if (validAssetIds.length === 0) {
      throw new Error('No valid asset IDs provided');
    }

    this.wsClient.subscribeToMarket(validAssetIds);
    validAssetIds.forEach(id => this.subscribedAssets.add(id));

    console.log(`Subscribed to ${validAssetIds.length} assets:`, validAssetIds);
  }

  /**
   * Unsubscribe from real-time data for specific assets
   */
  unsubscribeFromAssets(assetIds) {
    if (!this.isConnected) {
      throw new Error('WebSocket not connected');
    }

    this.wsClient.unsubscribeFromMarket(assetIds);
    assetIds.forEach(id => this.subscribedAssets.delete(id));

    console.log(`Unsubscribed from ${assetIds.length} assets:`, assetIds);
  }

  /**
   * Handle market data updates from WebSocket
   */
  handleMarketUpdate(marketData) {
    try {
      // Validate the data
      const validation = this.validator.validateMarketData(marketData);
      if (!validation.isValid) {
        console.warn('Invalid market data received:', validation.errors);
        return;
      }

      // Cache the data
      this.marketDataCache.set(marketData.assetId, marketData);
      
      // Add to calculator
      this.calculator.addMarketData(marketData);

      console.log(`Market update for ${marketData.symbol}: $${marketData.price}`);
    } catch (error) {
      console.error('Error handling market update:', error);
    }
  }

  /**
   * Handle trade data updates from WebSocket
   */
  handleTradeUpdate(tradeData) {
    try {
      // Validate the data
      const validation = this.validator.validateTradeData(tradeData);
      if (!validation.isValid) {
        console.warn('Invalid trade data received:', validation.errors);
        return;
      }

      // Cache the data
      if (!this.tradeDataCache.has(tradeData.assetId)) {
        this.tradeDataCache.set(tradeData.assetId, []);
      }
      this.tradeDataCache.get(tradeData.assetId).push(tradeData);

      // Add to calculator
      this.calculator.addTradeData(tradeData);

      console.log(`Trade update for ${tradeData.assetId}: ${tradeData.side} ${tradeData.volume} @ $${tradeData.price}`);
    } catch (error) {
      console.error('Error handling trade update:', error);
    }
  }

  /**
   * Handle order book updates from WebSocket
   */
  handleOrderBookUpdate(orderBookData) {
    try {
      // Validate the data
      const validation = this.validator.validateOrderBookData(orderBookData);
      if (!validation.isValid) {
        console.warn('Invalid order book data received:', validation.errors);
        return;
      }

      console.log(`Order book update for ${orderBookData.asset_id}`);
    } catch (error) {
      console.error('Error handling order book update:', error);
    }
  }

  /**
   * Calculate weighted average for a specific asset
   */
  calculateWeightedAverage(assetId, method = 'VWAP', timeWindow = null) {
    // Validate parameters
    const assetValidation = this.validator.validateAssetId(assetId);
    if (!assetValidation.isValid) {
      throw new Error(`Invalid asset ID: ${assetValidation.error}`);
    }

    const methodValidation = this.validator.validateCalculationMethod(method);
    if (!methodValidation.isValid) {
      throw new Error(`Invalid calculation method: ${methodValidation.error}`);
    }

    const timeWindowValidation = this.validator.validateTimeWindow(timeWindow);
    if (!timeWindowValidation.isValid) {
      throw new Error(`Invalid time window: ${timeWindowValidation.error}`);
    }

    // Calculate based on method
    let result;
    switch (method.toUpperCase()) {
      case 'VWAP':
        result = this.calculator.calculateVWAP(assetId, timeWindow);
        break;
      case 'TWAP':
        result = this.calculator.calculateTWAP(assetId, timeWindow);
        break;
      case 'SMA':
        result = this.calculator.calculateSMA(assetId, 20, timeWindow);
        break;
      case 'EMA':
        result = this.calculator.calculateEMA(assetId, 20, timeWindow);
        break;
    }

    if (!result) {
      throw new Error(`No data available for asset ${assetId} in the specified time window`);
    }

    return result;
  }

  /**
   * Calculate portfolio weighted average for multiple assets
   */
  calculatePortfolioWeightedAverage(assetIds, weights = null, method = 'VWAP', timeWindow = null) {
    // Validate weights
    const weightsValidation = this.validator.validateWeights(weights, assetIds.length);
    if (!weightsValidation.isValid) {
      throw new Error(`Invalid weights: ${weightsValidation.error}`);
    }

    return this.calculator.calculatePortfolioWeightedAverage(assetIds, weights, method, timeWindow);
  }

  /**
   * Get comprehensive statistics for an asset
   */
  getAssetStatistics(assetId, timeWindow = null) {
    const assetValidation = this.validator.validateAssetId(assetId);
    if (!assetValidation.isValid) {
      throw new Error(`Invalid asset ID: ${assetValidation.error}`);
    }

    return this.calculator.getAssetStatistics(assetId, timeWindow);
  }

  /**
   * Get current market data for an asset
   */
  getCurrentMarketData(assetId) {
    return this.marketDataCache.get(assetId) || null;
  }

  /**
   * Get recent trades for an asset
   */
  getRecentTrades(assetId, limit = 100) {
    const trades = this.tradeDataCache.get(assetId) || [];
    return trades.slice(-limit);
  }

  /**
   * Fetch historical data for an asset
   */
  async fetchHistoricalData(assetId, timeframe = '1h', limit = 100) {
    try {
      const response = await this.clobClient.getPriceHistory(assetId, timeframe, limit);
      if (response.success) {
        return response.data;
      } else {
        throw new Error(response.error);
      }
    } catch (error) {
      console.error('Error fetching historical data:', error);
      throw error;
    }
  }

  /**
   * Get global market statistics
   */
  async getGlobalStats() {
    try {
      const response = await this.dataApiClient.getGlobalStats();
      if (response.success) {
        return response.data;
      } else {
        throw new Error(response.error);
      }
    } catch (error) {
      console.error('Error fetching global stats:', error);
      throw error;
    }
  }

  /**
   * Clean up old data to prevent memory issues
   */
  cleanupOldData(maxAge = 24 * 60 * 60 * 1000) { // 24 hours default
    this.calculator.clearOldData(maxAge);
    
    // Clean up trade data cache
    const cutoffTime = new Date(Date.now() - maxAge);
    this.tradeDataCache.forEach((trades, assetId) => {
      const filteredTrades = trades.filter(trade => trade.timestamp >= cutoffTime);
      this.tradeDataCache.set(assetId, filteredTrades);
    });
  }

  /**
   * Get connection status and statistics
   */
  getStatus() {
    return {
      isConnected: this.isConnected,
      subscribedAssets: Array.from(this.subscribedAssets),
      marketDataCacheSize: this.marketDataCache.size,
      tradeDataCacheSize: Array.from(this.tradeDataCache.values()).reduce((sum, trades) => sum + trades.length, 0),
      wsStatus: this.wsClient.getStatus()
    };
  }

  /**
   * Export all data for analysis
   */
  exportData(assetId = null) {
    return this.calculator.exportData(assetId);
  }
}

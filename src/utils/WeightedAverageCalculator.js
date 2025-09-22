import { WeightedAverageResult, TradeData, MarketData } from '../types/index.js';

/**
 * Utility class for calculating weighted averages from market data
 */
export class WeightedAverageCalculator {
  constructor() {
    this.tradeData = new Map(); // assetId -> array of trades
    this.marketData = new Map(); // assetId -> latest market data
  }

  /**
   * Add trade data for calculation
   */
  addTradeData(tradeData) {
    if (!(tradeData instanceof TradeData)) {
      throw new Error('Invalid trade data format');
    }

    if (!this.tradeData.has(tradeData.assetId)) {
      this.tradeData.set(tradeData.assetId, []);
    }

    this.tradeData.get(tradeData.assetId).push(tradeData);
  }

  /**
   * Add market data
   */
  addMarketData(marketData) {
    if (!(marketData instanceof MarketData)) {
      throw new Error('Invalid market data format');
    }

    this.marketData.set(marketData.assetId, marketData);
  }

  /**
   * Calculate Volume Weighted Average Price (VWAP) for an asset
   */
  calculateVWAP(assetId, timeWindow = null) {
    const trades = this.getTradesInTimeWindow(assetId, timeWindow);
    
    if (trades.length === 0) {
      return null;
    }

    let totalVolume = 0;
    let totalValue = 0;

    trades.forEach(trade => {
      const value = trade.price * trade.volume;
      totalValue += value;
      totalVolume += trade.volume;
    });

    if (totalVolume === 0) {
      return null;
    }

    const vwap = totalValue / totalVolume;
    const marketData = this.marketData.get(assetId);
    const symbol = marketData ? marketData.symbol : assetId;

    return new WeightedAverageResult(
      assetId,
      symbol,
      vwap,
      totalVolume,
      trades.length,
      timeWindow
    );
  }

  /**
   * Calculate Time Weighted Average Price (TWAP) for an asset
   */
  calculateTWAP(assetId, timeWindow = null) {
    const trades = this.getTradesInTimeWindow(assetId, timeWindow);
    
    if (trades.length === 0) {
      return null;
    }

    // Sort trades by timestamp
    const sortedTrades = trades.sort((a, b) => a.timestamp - b.timestamp);
    
    let totalTime = 0;
    let weightedPrice = 0;

    for (let i = 0; i < sortedTrades.length - 1; i++) {
      const currentTrade = sortedTrades[i];
      const nextTrade = sortedTrades[i + 1];
      
      const timeDiff = nextTrade.timestamp - currentTrade.timestamp;
      const price = currentTrade.price;
      
      weightedPrice += price * timeDiff;
      totalTime += timeDiff;
    }

    if (totalTime === 0) {
      return null;
    }

    const twap = weightedPrice / totalTime;
    const marketData = this.marketData.get(assetId);
    const symbol = marketData ? marketData.symbol : assetId;

    return new WeightedAverageResult(
      assetId,
      symbol,
      twap,
      null, // TWAP doesn't use volume
      trades.length,
      timeWindow
    );
  }

  /**
   * Calculate Simple Moving Average (SMA) for an asset
   */
  calculateSMA(assetId, period = 20, timeWindow = null) {
    const trades = this.getTradesInTimeWindow(assetId, timeWindow);
    
    if (trades.length === 0) {
      return null;
    }

    // Sort trades by timestamp and take the last 'period' trades
    const sortedTrades = trades
      .sort((a, b) => a.timestamp - b.timestamp)
      .slice(-period);

    const sum = sortedTrades.reduce((acc, trade) => acc + trade.price, 0);
    const sma = sum / sortedTrades.length;
    
    const marketData = this.marketData.get(assetId);
    const symbol = marketData ? marketData.symbol : assetId;

    return new WeightedAverageResult(
      assetId,
      symbol,
      sma,
      null,
      sortedTrades.length,
      timeWindow
    );
  }

  /**
   * Calculate Exponential Moving Average (EMA) for an asset
   */
  calculateEMA(assetId, period = 20, timeWindow = null) {
    const trades = this.getTradesInTimeWindow(assetId, timeWindow);
    
    if (trades.length === 0) {
      return null;
    }

    // Sort trades by timestamp
    const sortedTrades = trades.sort((a, b) => a.timestamp - b.timestamp);
    
    if (sortedTrades.length < period) {
      return this.calculateSMA(assetId, sortedTrades.length, timeWindow);
    }

    const multiplier = 2 / (period + 1);
    let ema = sortedTrades[0].price;

    for (let i = 1; i < sortedTrades.length; i++) {
      ema = (sortedTrades[i].price * multiplier) + (ema * (1 - multiplier));
    }

    const marketData = this.marketData.get(assetId);
    const symbol = marketData ? marketData.symbol : assetId;

    return new WeightedAverageResult(
      assetId,
      symbol,
      ema,
      null,
      sortedTrades.length,
      timeWindow
    );
  }

  /**
   * Calculate weighted average for multiple assets
   */
  calculatePortfolioWeightedAverage(assetIds, weights = null, method = 'VWAP', timeWindow = null) {
    const results = [];
    let totalWeight = 0;
    let weightedSum = 0;

    assetIds.forEach((assetId, index) => {
      let result;
      
      switch (method.toUpperCase()) {
        case 'VWAP':
          result = this.calculateVWAP(assetId, timeWindow);
          break;
        case 'TWAP':
          result = this.calculateTWAP(assetId, timeWindow);
          break;
        case 'SMA':
          result = this.calculateSMA(assetId, 20, timeWindow);
          break;
        case 'EMA':
          result = this.calculateEMA(assetId, 20, timeWindow);
          break;
        default:
          throw new Error(`Unknown calculation method: ${method}`);
      }

      if (result) {
        results.push(result);
        
        // Use provided weights or equal weights
        const weight = weights ? weights[index] : 1;
        weightedSum += result.weightedAverage * weight;
        totalWeight += weight;
      }
    });

    if (totalWeight === 0) {
      return null;
    }

    const portfolioAverage = weightedSum / totalWeight;
    
    return {
      portfolioAverage,
      individualResults: results,
      totalWeight,
      method,
      timeWindow,
      calculatedAt: new Date()
    };
  }

  /**
   * Get trades within a specific time window
   */
  getTradesInTimeWindow(assetId, timeWindow) {
    const trades = this.tradeData.get(assetId) || [];
    
    if (!timeWindow) {
      return trades;
    }

    const now = new Date();
    const windowStart = new Date(now.getTime() - timeWindow);

    return trades.filter(trade => trade.timestamp >= windowStart);
  }

  /**
   * Clear old data to prevent memory issues
   */
  clearOldData(maxAge = 24 * 60 * 60 * 1000) { // 24 hours default
    const cutoffTime = new Date(Date.now() - maxAge);
    
    this.tradeData.forEach((trades, assetId) => {
      const filteredTrades = trades.filter(trade => trade.timestamp >= cutoffTime);
      this.tradeData.set(assetId, filteredTrades);
    });
  }

  /**
   * Get statistics for an asset
   */
  getAssetStatistics(assetId, timeWindow = null) {
    const trades = this.getTradesInTimeWindow(assetId, timeWindow);
    
    if (trades.length === 0) {
      return null;
    }

    const prices = trades.map(t => t.price);
    const volumes = trades.map(t => t.volume);
    
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const avgPrice = prices.reduce((a, b) => a + b, 0) / prices.length;
    const totalVolume = volumes.reduce((a, b) => a + b, 0);
    
    const vwap = this.calculateVWAP(assetId, timeWindow);
    const twap = this.calculateTWAP(assetId, timeWindow);

    return {
      assetId,
      tradeCount: trades.length,
      minPrice,
      maxPrice,
      avgPrice,
      totalVolume,
      vwap: vwap ? vwap.weightedAverage : null,
      twap: twap ? twap.weightedAverage : null,
      timeWindow,
      calculatedAt: new Date()
    };
  }

  /**
   * Export data for analysis
   */
  exportData(assetId = null) {
    if (assetId) {
      return {
        trades: this.tradeData.get(assetId) || [],
        marketData: this.marketData.get(assetId) || null
      };
    }

    return {
      trades: Object.fromEntries(this.tradeData),
      marketData: Object.fromEntries(this.marketData)
    };
  }
}

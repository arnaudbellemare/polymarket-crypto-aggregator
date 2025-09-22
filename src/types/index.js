/**
 * Type definitions for Polymarket API responses and data structures
 */

export const MessageTypes = {
  SUBSCRIBE: 'subscribe',
  UNSUBSCRIBE: 'unsubscribe',
  MARKET_UPDATE: 'market_update',
  TRADE_UPDATE: 'trade_update',
  ORDER_BOOK_UPDATE: 'order_book_update',
  ERROR: 'error'
};

export const Channels = {
  MARKET: 'market',
  USER: 'user'
};

export const EventTypes = {
  TRADE: 'trade',
  ORDER_BOOK: 'order_book',
  MARKET_DATA: 'market_data'
};

/**
 * Market data structure
 */
export class MarketData {
  constructor(data) {
    this.assetId = data.asset_id;
    this.symbol = data.symbol;
    this.price = parseFloat(data.price);
    this.volume = parseFloat(data.volume);
    this.timestamp = new Date(data.timestamp);
    this.bid = parseFloat(data.bid || 0);
    this.ask = parseFloat(data.ask || 0);
    this.lastTradePrice = parseFloat(data.last_trade_price || 0);
    this.lastTradeVolume = parseFloat(data.last_trade_volume || 0);
  }
}

/**
 * Trade data structure
 */
export class TradeData {
  constructor(data) {
    this.tradeId = data.trade_id;
    this.assetId = data.asset_id;
    this.price = parseFloat(data.price);
    this.volume = parseFloat(data.volume);
    this.timestamp = new Date(data.timestamp);
    this.side = data.side; // 'buy' or 'sell'
    this.maker = data.maker;
    this.taker = data.taker;
  }
}

/**
 * Weighted average calculation result
 */
export class WeightedAverageResult {
  constructor(assetId, symbol, weightedAverage, totalVolume, tradeCount, timeRange) {
    this.assetId = assetId;
    this.symbol = symbol;
    this.weightedAverage = weightedAverage;
    this.totalVolume = totalVolume;
    this.tradeCount = tradeCount;
    this.timeRange = timeRange;
    this.calculatedAt = new Date();
  }
}

/**
 * API response wrapper
 */
export class ApiResponse {
  constructor(success, data, error = null) {
    this.success = success;
    this.data = data;
    this.error = error;
    this.timestamp = new Date();
  }
}

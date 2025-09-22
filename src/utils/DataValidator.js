/**
 * Data validation utilities for Polymarket API responses
 */
export class DataValidator {
  /**
   * Validate market data structure
   */
  static validateMarketData(data) {
    const requiredFields = ['asset_id', 'price', 'volume', 'timestamp'];
    const errors = [];

    if (!data || typeof data !== 'object') {
      errors.push('Market data must be an object');
      return { isValid: false, errors };
    }

    requiredFields.forEach(field => {
      if (!(field in data)) {
        errors.push(`Missing required field: ${field}`);
      }
    });

    // Validate price
    if (data.price !== undefined) {
      const price = parseFloat(data.price);
      if (isNaN(price) || price < 0) {
        errors.push('Price must be a valid positive number');
      }
    }

    // Validate volume
    if (data.volume !== undefined) {
      const volume = parseFloat(data.volume);
      if (isNaN(volume) || volume < 0) {
        errors.push('Volume must be a valid positive number');
      }
    }

    // Validate timestamp
    if (data.timestamp !== undefined) {
      const timestamp = new Date(data.timestamp);
      if (isNaN(timestamp.getTime())) {
        errors.push('Timestamp must be a valid date');
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Validate trade data structure
   */
  static validateTradeData(data) {
    const requiredFields = ['trade_id', 'asset_id', 'price', 'volume', 'timestamp', 'side'];
    const errors = [];

    if (!data || typeof data !== 'object') {
      errors.push('Trade data must be an object');
      return { isValid: false, errors };
    }

    requiredFields.forEach(field => {
      if (!(field in data)) {
        errors.push(`Missing required field: ${field}`);
      }
    });

    // Validate side
    if (data.side && !['buy', 'sell'].includes(data.side)) {
      errors.push('Side must be either "buy" or "sell"');
    }

    // Validate price
    if (data.price !== undefined) {
      const price = parseFloat(data.price);
      if (isNaN(price) || price < 0) {
        errors.push('Price must be a valid positive number');
      }
    }

    // Validate volume
    if (data.volume !== undefined) {
      const volume = parseFloat(data.volume);
      if (isNaN(volume) || volume < 0) {
        errors.push('Volume must be a valid positive number');
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Validate order book data structure
   */
  static validateOrderBookData(data) {
    const errors = [];

    if (!data || typeof data !== 'object') {
      errors.push('Order book data must be an object');
      return { isValid: false, errors };
    }

    // Validate bids
    if (data.bids && Array.isArray(data.bids)) {
      data.bids.forEach((bid, index) => {
        if (!Array.isArray(bid) || bid.length !== 2) {
          errors.push(`Bid at index ${index} must be an array with [price, volume]`);
        } else {
          const [price, volume] = bid;
          if (isNaN(parseFloat(price)) || parseFloat(price) < 0) {
            errors.push(`Bid price at index ${index} must be a valid positive number`);
          }
          if (isNaN(parseFloat(volume)) || parseFloat(volume) < 0) {
            errors.push(`Bid volume at index ${index} must be a valid positive number`);
          }
        }
      });
    }

    // Validate asks
    if (data.asks && Array.isArray(data.asks)) {
      data.asks.forEach((ask, index) => {
        if (!Array.isArray(ask) || ask.length !== 2) {
          errors.push(`Ask at index ${index} must be an array with [price, volume]`);
        } else {
          const [price, volume] = ask;
          if (isNaN(parseFloat(price)) || parseFloat(price) < 0) {
            errors.push(`Ask price at index ${index} must be a valid positive number`);
          }
          if (isNaN(parseFloat(volume)) || parseFloat(volume) < 0) {
            errors.push(`Ask volume at index ${index} must be a valid positive number`);
          }
        }
      });
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Validate WebSocket message structure
   */
  static validateWebSocketMessage(data) {
    const errors = [];

    if (!data || typeof data !== 'object') {
      errors.push('WebSocket message must be an object');
      return { isValid: false, errors };
    }

    if (!data.type) {
      errors.push('Message must have a type field');
    }

    if (!data.channel) {
      errors.push('Message must have a channel field');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Validate API response structure
   */
  static validateApiResponse(data) {
    const errors = [];

    if (!data || typeof data !== 'object') {
      errors.push('API response must be an object');
      return { isValid: false, errors };
    }

    if (typeof data.success !== 'boolean') {
      errors.push('API response must have a boolean success field');
    }

    if (data.success && data.data === undefined) {
      errors.push('Successful API response must have data field');
    }

    if (!data.success && !data.error) {
      errors.push('Failed API response must have error field');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Sanitize and normalize numeric values
   */
  static sanitizeNumeric(value, defaultValue = 0) {
    if (value === null || value === undefined) {
      return defaultValue;
    }

    const num = parseFloat(value);
    return isNaN(num) ? defaultValue : num;
  }

  /**
   * Sanitize and normalize date values
   */
  static sanitizeDate(value, defaultValue = new Date()) {
    if (value === null || value === undefined) {
      return defaultValue;
    }

    const date = new Date(value);
    return isNaN(date.getTime()) ? defaultValue : date;
  }

  /**
   * Validate asset ID format
   */
  static validateAssetId(assetId) {
    if (!assetId || typeof assetId !== 'string') {
      return { isValid: false, error: 'Asset ID must be a non-empty string' };
    }

    if (assetId.length < 1 || assetId.length > 100) {
      return { isValid: false, error: 'Asset ID must be between 1 and 100 characters' };
    }

    return { isValid: true };
  }

  /**
   * Validate time window parameter
   */
  static validateTimeWindow(timeWindow) {
    if (timeWindow === null || timeWindow === undefined) {
      return { isValid: true }; // null/undefined is valid (no time window)
    }

    if (typeof timeWindow !== 'number') {
      return { isValid: false, error: 'Time window must be a number' };
    }

    if (timeWindow < 0) {
      return { isValid: false, error: 'Time window must be non-negative' };
    }

    if (timeWindow > 365 * 24 * 60 * 60 * 1000) { // 1 year in milliseconds
      return { isValid: false, error: 'Time window cannot exceed 1 year' };
    }

    return { isValid: true };
  }

  /**
   * Validate calculation method
   */
  static validateCalculationMethod(method) {
    const validMethods = ['VWAP', 'TWAP', 'SMA', 'EMA'];
    
    if (!method || typeof method !== 'string') {
      return { isValid: false, error: 'Calculation method must be a string' };
    }

    if (!validMethods.includes(method.toUpperCase())) {
      return { 
        isValid: false, 
        error: `Calculation method must be one of: ${validMethods.join(', ')}` 
      };
    }

    return { isValid: true };
  }

  /**
   * Validate weights array for portfolio calculations
   */
  static validateWeights(weights, assetCount) {
    if (!weights) {
      return { isValid: true }; // null/undefined is valid (equal weights)
    }

    if (!Array.isArray(weights)) {
      return { isValid: false, error: 'Weights must be an array' };
    }

    if (weights.length !== assetCount) {
      return { 
        isValid: false, 
        error: `Weights array length (${weights.length}) must match asset count (${assetCount})` 
      };
    }

    const totalWeight = weights.reduce((sum, weight) => {
      const num = parseFloat(weight);
      if (isNaN(num) || num < 0) {
        throw new Error('All weights must be non-negative numbers');
      }
      return sum + num;
    }, 0);

    if (totalWeight === 0) {
      return { isValid: false, error: 'Total weight cannot be zero' };
    }

    return { isValid: true, totalWeight };
  }

  /**
   * Comprehensive data validation with detailed error reporting
   */
  static validateData(data, type) {
    const validators = {
      market: this.validateMarketData,
      trade: this.validateTradeData,
      orderBook: this.validateOrderBookData,
      websocket: this.validateWebSocketMessage,
      apiResponse: this.validateApiResponse
    };

    const validator = validators[type];
    if (!validator) {
      return {
        isValid: false,
        errors: [`Unknown validation type: ${type}`]
      };
    }

    return validator.call(this, data);
  }
}

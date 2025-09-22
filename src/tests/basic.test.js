import { test, describe } from 'node:test';
import assert from 'node:assert';
import { CryptoMarketAggregator } from '../CryptoMarketAggregator.js';
import { WeightedAverageCalculator } from '../utils/WeightedAverageCalculator.js';
import { DataValidator } from '../utils/DataValidator.js';
import { TradeData, MarketData } from '../types/index.js';

describe('CryptoMarketAggregator Tests', () => {
  test('should initialize with default config', () => {
    const aggregator = new CryptoMarketAggregator();
    assert.ok(aggregator);
    assert.ok(aggregator.clobClient);
    assert.ok(aggregator.dataApiClient);
    assert.ok(aggregator.wsClient);
    assert.ok(aggregator.calculator);
  });

  test('should initialize with custom config', () => {
    const config = {
      apiKey: 'test_key',
      secretKey: 'test_secret',
      clobBaseUrl: 'https://test-clob.com'
    };
    
    const aggregator = new CryptoMarketAggregator(config);
    assert.strictEqual(aggregator.config.apiKey, 'test_key');
    assert.strictEqual(aggregator.config.secretKey, 'test_secret');
    assert.strictEqual(aggregator.config.clobBaseUrl, 'https://test-clob.com');
  });

  test('should validate asset IDs', () => {
    const aggregator = new CryptoMarketAggregator();
    
    // Valid asset ID (should not throw validation error, but may throw data error)
    try {
      aggregator.calculateWeightedAverage('BTC-USD', 'VWAP');
    } catch (error) {
      // Should not be a validation error
      assert.ok(!error.message.includes('Invalid asset ID'));
    }
    
    // Invalid asset ID
    assert.throws(() => {
      aggregator.calculateWeightedAverage('', 'VWAP');
    }, /Invalid asset ID/);
  });

  test('should validate calculation methods', () => {
    const aggregator = new CryptoMarketAggregator();
    
    // Valid methods (should not throw validation error, but may throw data error)
    const validMethods = ['VWAP', 'TWAP', 'SMA', 'EMA'];
    validMethods.forEach(method => {
      try {
        aggregator.calculateWeightedAverage('BTC-USD', method);
      } catch (error) {
        // Should not be a validation error
        assert.ok(!error.message.includes('Invalid calculation method'));
      }
    });
    
    // Invalid method
    assert.throws(() => {
      aggregator.calculateWeightedAverage('BTC-USD', 'INVALID');
    }, /Invalid calculation method/);
  });
});

describe('WeightedAverageCalculator Tests', () => {
  test('should calculate VWAP correctly', () => {
    const calculator = new WeightedAverageCalculator();
    
    // Add test trade data
    const trades = [
      new TradeData({
        trade_id: '1',
        asset_id: 'BTC-USD',
        price: 100,
        volume: 10,
        timestamp: new Date(),
        side: 'buy',
        maker: 'user1',
        taker: 'user2'
      }),
      new TradeData({
        trade_id: '2',
        asset_id: 'BTC-USD',
        price: 200,
        volume: 5,
        timestamp: new Date(),
        side: 'sell',
        maker: 'user2',
        taker: 'user1'
      })
    ];
    
    trades.forEach(trade => calculator.addTradeData(trade));
    
    const vwap = calculator.calculateVWAP('BTC-USD');
    assert.ok(vwap);
    assert.strictEqual(vwap.assetId, 'BTC-USD');
    assert.strictEqual(vwap.totalVolume, 15);
    assert.strictEqual(vwap.tradeCount, 2);
    
    // VWAP = (100*10 + 200*5) / (10+5) = 2000/15 = 133.33...
    assert.ok(Math.abs(vwap.weightedAverage - 133.333) < 0.1);
  });

  test('should handle empty trade data', () => {
    const calculator = new WeightedAverageCalculator();
    const vwap = calculator.calculateVWAP('BTC-USD');
    assert.strictEqual(vwap, null);
  });

  test('should calculate portfolio weighted average', () => {
    const calculator = new WeightedAverageCalculator();
    
    // Add trade data for multiple assets
    const btcTrades = [
      new TradeData({
        trade_id: '1',
        asset_id: 'BTC-USD',
        price: 100,
        volume: 10,
        timestamp: new Date(),
        side: 'buy',
        maker: 'user1',
        taker: 'user2'
      })
    ];
    
    const ethTrades = [
      new TradeData({
        trade_id: '2',
        asset_id: 'ETH-USD',
        price: 50,
        volume: 20,
        timestamp: new Date(),
        side: 'buy',
        maker: 'user1',
        taker: 'user2'
      })
    ];
    
    [...btcTrades, ...ethTrades].forEach(trade => calculator.addTradeData(trade));
    
    const portfolioAvg = calculator.calculatePortfolioWeightedAverage(
      ['BTC-USD', 'ETH-USD'],
      [0.6, 0.4], // 60% BTC, 40% ETH
      'VWAP'
    );
    
    assert.ok(portfolioAvg);
    assert.strictEqual(portfolioAvg.individualResults.length, 2);
    assert.ok(portfolioAvg.portfolioAverage > 0);
  });
});

describe('DataValidator Tests', () => {
  test('should validate market data', () => {
    const validMarketData = {
      asset_id: 'BTC-USD',
      price: 45000,
      volume: 100.5,
      timestamp: new Date().toISOString()
    };
    
    const validation = DataValidator.validateMarketData(validMarketData);
    assert.strictEqual(validation.isValid, true);
    assert.strictEqual(validation.errors.length, 0);
  });

  test('should reject invalid market data', () => {
    const invalidMarketData = {
      asset_id: 'BTC-USD',
      price: -100, // Invalid negative price
      volume: 'invalid', // Invalid volume
      timestamp: 'invalid-date' // Invalid timestamp
    };
    
    const validation = DataValidator.validateMarketData(invalidMarketData);
    assert.strictEqual(validation.isValid, false);
    assert.ok(validation.errors.length > 0);
  });

  test('should validate trade data', () => {
    const validTradeData = {
      trade_id: 'trade_123',
      asset_id: 'BTC-USD',
      price: 45000,
      volume: 0.5,
      timestamp: new Date().toISOString(),
      side: 'buy'
    };
    
    const validation = DataValidator.validateTradeData(validTradeData);
    assert.strictEqual(validation.isValid, true);
  });

  test('should reject invalid trade data', () => {
    const invalidTradeData = {
      trade_id: 'trade_123',
      asset_id: 'BTC-USD',
      price: 45000,
      volume: 0.5,
      timestamp: new Date().toISOString(),
      side: 'invalid' // Invalid side
    };
    
    const validation = DataValidator.validateTradeData(invalidTradeData);
    assert.strictEqual(validation.isValid, false);
    assert.ok(validation.errors.includes('Side must be either "buy" or "sell"'));
  });

  test('should validate asset IDs', () => {
    // Valid asset ID
    const validValidation = DataValidator.validateAssetId('BTC-USD');
    assert.strictEqual(validValidation.isValid, true);
    
    // Invalid asset ID
    const invalidValidation = DataValidator.validateAssetId('');
    assert.strictEqual(invalidValidation.isValid, false);
    assert.ok(invalidValidation.error.includes('Asset ID must be a non-empty string'));
  });

  test('should validate calculation methods', () => {
    // Valid methods
    const validMethods = ['VWAP', 'TWAP', 'SMA', 'EMA'];
    validMethods.forEach(method => {
      const validation = DataValidator.validateCalculationMethod(method);
      assert.strictEqual(validation.isValid, true);
    });
    
    // Invalid method
    const invalidValidation = DataValidator.validateCalculationMethod('INVALID');
    assert.strictEqual(invalidValidation.isValid, false);
    assert.ok(invalidValidation.error.includes('Calculation method must be one of'));
  });

  test('should validate weights array', () => {
    // Valid weights
    const validValidation = DataValidator.validateWeights([0.5, 0.3, 0.2], 3);
    assert.strictEqual(validValidation.isValid, true);
    assert.strictEqual(validValidation.totalWeight, 1.0);
    
    // Invalid weights (wrong length)
    const invalidValidation = DataValidator.validateWeights([0.5, 0.3], 3);
    assert.strictEqual(invalidValidation.isValid, false);
    assert.ok(invalidValidation.error.includes('Weights array length'));
    
    // Invalid weights (negative)
    assert.throws(() => {
      DataValidator.validateWeights([0.5, -0.3, 0.2], 3);
    }, /All weights must be non-negative numbers/);
  });
});

describe('Data Structure Tests', () => {
  test('should create TradeData correctly', () => {
    const rawData = {
      trade_id: 'trade_123',
      asset_id: 'BTC-USD',
      price: '45000.50',
      volume: '0.5',
      timestamp: new Date().toISOString(),
      side: 'buy',
      maker: 'user1',
      taker: 'user2'
    };
    
    const tradeData = new TradeData(rawData);
    assert.strictEqual(tradeData.tradeId, 'trade_123');
    assert.strictEqual(tradeData.assetId, 'BTC-USD');
    assert.strictEqual(tradeData.price, 45000.50);
    assert.strictEqual(tradeData.volume, 0.5);
    assert.strictEqual(tradeData.side, 'buy');
    assert.ok(tradeData.timestamp instanceof Date);
  });

  test('should create MarketData correctly', () => {
    const rawData = {
      asset_id: 'BTC-USD',
      symbol: 'BTC',
      price: '45000.00',
      volume: '100.5',
      timestamp: new Date().toISOString(),
      bid: '44995.00',
      ask: '45005.00',
      last_trade_price: '45000.00',
      last_trade_volume: '0.5'
    };
    
    const marketData = new MarketData(rawData);
    assert.strictEqual(marketData.assetId, 'BTC-USD');
    assert.strictEqual(marketData.symbol, 'BTC');
    assert.strictEqual(marketData.price, 45000.00);
    assert.strictEqual(marketData.volume, 100.5);
    assert.strictEqual(marketData.bid, 44995.00);
    assert.strictEqual(marketData.ask, 45005.00);
    assert.ok(marketData.timestamp instanceof Date);
  });
});

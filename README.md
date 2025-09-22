# Polymarket Crypto Market Index

A comprehensive Node.js application that creates a real-time crypto market sentiment index based on Polymarket's prediction market data. Features the **CPMI (Crypto Prediction Market Index)** - a professional-grade crypto sentiment index following the proven UPFI methodology.

## 🎯 CPMI - Crypto Prediction Market Index

The **CPMI** is a professional-grade crypto sentiment index that follows the proven methodology of the US Political Future Index (UPFI). It provides real-time crypto market sentiment using prediction market data from Polymarket.

### Key Features

- **100-based scale**: 100 = perfect market balance (50/50 bullish/bearish)
- **Above 100**: Bullish crypto sentiment
- **Below 100**: Bearish crypto sentiment
- **Real-time updates**: 5-minute updates with 1-hour smoothing
- **Category weighting**: Bitcoin (40%), Ethereum (30%), Regulatory (20%), Altcoins (8%), Infrastructure (2%)
- **Market weighting**: Volume, time, impact, and market cap sensitivity

### Quick Start

```bash
# Run the CPMI demo (recommended)
npm run cpmi-final

# Run other demos
npm run demo
npm run refined
npm run cpmi
```

### Example Output

```
📈 CPMI Results:
========================================
Index Value: 115.74 (Bullish (+15.7))
Last Update: 9/22/2025, 6:34:05 PM

📊 Category Breakdown:
========================================
bitcoin-markets: 64.0% (Bullish +14.0) - Weight: 40.0%
ethereum-ecosystem: 69.9% (Bullish +19.9) - Weight: 30.0%
major-altcoins: 58.6% (Bullish +8.6) - Weight: 8.0%
```

For detailed methodology, see [CPMI_METHODOLOGY.md](./CPMI_METHODOLOGY.md).

## 🎯 Index Overview

The Crypto Market Index provides a comprehensive, real-time measure of crypto market sentiment using Polymarket's prediction market data. The index employs a weighting methodology that reflects both market significance and trading characteristics:

- **Category Weights**: Bitcoin Markets (40%), Ethereum Ecosystem (30%), Regulatory Outcomes (20%), Major Altcoins (8%), Infrastructure (2%)
- **Market Weights**: Volume sensitivity, time to expiration, market cap representation, and inherent market impact
- **Scale**: 100-based scale where 100 represents perfect market balance, values above 100 indicate bullish sentiment, and values below 100 indicate bearish sentiment
- **Updates**: 24/7 with 5-minute lag and 1-hour simple moving average (SMA)

## Features

- 🔄 **Real-time Data Streaming**: WebSocket integration for live market updates
- 📊 **Multiple Calculation Methods**: VWAP, TWAP, SMA, EMA calculations
- 🏗️ **Modular Architecture**: Separate clients for different API endpoints
- ✅ **Data Validation**: Comprehensive input validation and error handling
- 💼 **Portfolio Analysis**: Multi-asset weighted average calculations
- 📈 **Historical Data**: Fetch and analyze historical price data
- 🧹 **Memory Management**: Automatic cleanup of old data

## API Endpoints Used

- **CLOB REST API**: `https://clob.polymarket.com/` - Market data, order books, trades
- **Data API**: `https://data-api.polymarket.com/` - User data, holdings, analytics
- **WebSocket**: `wss://ws-subscriptions-clob.polymarket.com/ws/` - Real-time updates

## Installation

1. Clone or download the project
2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp env.example .env
   ```
   
   Edit `.env` with your Polymarket API credentials:
   ```
   POLYMARKET_API_KEY=your_api_key_here
   POLYMARKET_SECRET_KEY=your_secret_key_here
   ```

## Usage

### Basic Usage

```javascript
import { CryptoMarketAggregator } from './src/CryptoMarketAggregator.js';

// Initialize the aggregator
const aggregator = new CryptoMarketAggregator({
  apiKey: 'your_api_key',
  secretKey: 'your_secret_key'
});

// Connect to WebSocket
await aggregator.connect();

// Subscribe to assets
aggregator.subscribeToAssets(['BTC-USD', 'ETH-USD']);

// Calculate weighted averages
const vwap = aggregator.calculateWeightedAverage('BTC-USD', 'VWAP');
console.log(`BTC VWAP: $${vwap.weightedAverage}`);
```

### Running the Crypto Market Index Demo

```bash
npm run demo
```

This will:
1. Connect to Polymarket WebSocket
2. Fetch available crypto markets
3. Subscribe to real-time data for all crypto categories
4. Calculate the Crypto Market Index using weighted methodology
5. Display real-time index updates and category breakdowns
6. Show historical statistics and volatility analysis

### Running the Basic Example

```bash
npm start
```

This will run the basic aggregator example with individual asset calculations.

## API Reference

### CryptoMarketIndex

The main index class that implements the UPFI-style methodology for crypto markets.

#### Constructor
```javascript
new CryptoMarketIndex(config)
```

**Config Options:**
- `categoryWeights`: Object defining weights for different crypto categories
- `sensitivity`: Object defining sensitivity parameters for volume, time, marketCap, impact
- `baselineValue`: Baseline value for the index (default: 100)
- `updateInterval`: Update interval in milliseconds (default: 5 minutes)
- `smoothingPeriod`: SMA period in milliseconds (default: 1 hour)

#### Methods

##### Index Management
- `start()`: Start the crypto market index
- `stop()`: Stop the crypto market index
- `calculateIndex()`: Manually trigger index calculation

##### Data Retrieval
- `getCurrentIndex()`: Get current index value and interpretation
- `getCategoryBreakdown()`: Get breakdown by crypto categories
- `getIndexStatistics()`: Get historical statistics and volatility
- `exportIndexData()`: Export all index data for analysis

#### Index Interpretation

- **100**: Perfect market balance (50/50 bullish/bearish)
- **> 100**: Bullish sentiment (higher values = stronger bullish)
- **< 100**: Bearish sentiment (lower values = stronger bearish)

### CryptoMarketAggregator

#### Constructor
```javascript
new CryptoMarketAggregator(config)
```

**Config Options:**
- `apiKey`: Polymarket API key
- `secretKey`: Polymarket secret key
- `clobBaseUrl`: CLOB API base URL (default: https://clob.polymarket.com)
- `dataApiBaseUrl`: Data API base URL (default: https://data-api.polymarket.com)
- `wsEndpoint`: WebSocket endpoint (default: wss://ws-subscriptions-clob.polymarket.com/ws/)

#### Methods

##### Connection Management
- `connect()`: Connect to WebSocket
- `disconnect()`: Disconnect from WebSocket
- `getStatus()`: Get connection status and statistics

##### Data Subscription
- `subscribeToAssets(assetIds)`: Subscribe to real-time data for specific assets
- `unsubscribeFromAssets(assetIds)`: Unsubscribe from assets

##### Market Data
- `getAllCryptoMarkets()`: Get all available crypto markets
- `getCurrentMarketData(assetId)`: Get current market data for an asset
- `getRecentTrades(assetId, limit)`: Get recent trades for an asset
- `fetchHistoricalData(assetId, timeframe, limit)`: Fetch historical price data

##### Calculations
- `calculateWeightedAverage(assetId, method, timeWindow)`: Calculate weighted average for a single asset
- `calculatePortfolioWeightedAverage(assetIds, weights, method, timeWindow)`: Calculate portfolio weighted average
- `getAssetStatistics(assetId, timeWindow)`: Get comprehensive statistics for an asset

##### Utility
- `cleanupOldData(maxAge)`: Clean up old data to prevent memory issues
- `exportData(assetId)`: Export all data for analysis

### Calculation Methods

#### VWAP (Volume Weighted Average Price)
```javascript
const vwap = aggregator.calculateWeightedAverage('BTC-USD', 'VWAP');
```

#### TWAP (Time Weighted Average Price)
```javascript
const twap = aggregator.calculateWeightedAverage('BTC-USD', 'TWAP');
```

#### SMA (Simple Moving Average)
```javascript
const sma = aggregator.calculateWeightedAverage('BTC-USD', 'SMA');
```

#### EMA (Exponential Moving Average)
```javascript
const ema = aggregator.calculateWeightedAverage('BTC-USD', 'EMA');
```

### Portfolio Calculations

```javascript
const portfolioAvg = aggregator.calculatePortfolioWeightedAverage(
  ['BTC-USD', 'ETH-USD', 'SOL-USD'],
  [0.5, 0.3, 0.2], // Weights: 50% BTC, 30% ETH, 20% SOL
  'VWAP'
);
```

## Data Structures

### MarketData
```javascript
{
  assetId: 'BTC-USD',
  symbol: 'BTC',
  price: 45000.00,
  volume: 100.5,
  timestamp: new Date(),
  bid: 44995.00,
  ask: 45005.00,
  lastTradePrice: 45000.00,
  lastTradeVolume: 0.5
}
```

### TradeData
```javascript
{
  tradeId: 'trade_123',
  assetId: 'BTC-USD',
  price: 45000.00,
  volume: 0.5,
  timestamp: new Date(),
  side: 'buy', // or 'sell'
  maker: 'user_123',
  taker: 'user_456'
}
```

### WeightedAverageResult
```javascript
{
  assetId: 'BTC-USD',
  symbol: 'BTC',
  weightedAverage: 45000.00,
  totalVolume: 100.5,
  tradeCount: 25,
  timeRange: null,
  calculatedAt: new Date()
}
```

## Error Handling

The application includes comprehensive error handling:

- **Data Validation**: All incoming data is validated before processing
- **Connection Management**: Automatic reconnection with exponential backoff
- **API Error Handling**: Graceful handling of API errors and rate limits
- **Memory Management**: Automatic cleanup of old data to prevent memory leaks

## Configuration

### Environment Variables

```bash
# Polymarket API Configuration
POLYMARKET_API_KEY=your_api_key_here
POLYMARKET_SECRET_KEY=your_secret_key_here

# API Endpoints
CLOB_BASE_URL=https://clob.polymarket.com
DATA_API_BASE_URL=https://data-api.polymarket.com
WS_ENDPOINT=wss://ws-subscriptions-clob.polymarket.com/ws/

# Configuration
RECONNECT_INTERVAL=5000
MAX_RECONNECT_ATTEMPTS=10
REQUEST_TIMEOUT=30000
```

## Development

### Project Structure
```
src/
├── clients/           # API clients
│   ├── ClobRestClient.js
│   ├── DataApiClient.js
│   └── WebSocketClient.js
├── utils/             # Utility classes
│   ├── WeightedAverageCalculator.js
│   └── DataValidator.js
├── types/             # Type definitions
│   └── index.js
├── CryptoMarketAggregator.js  # Main aggregator class
├── CryptoMarketIndex.js       # UPFI-style crypto market index
├── index.js           # Basic example usage
└── crypto-index-demo.js # Crypto market index demo
```

### Running Tests
```bash
npm test
```

### Development Mode
```bash
npm run dev
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For issues and questions:
1. Check the documentation
2. Review the example code
3. Open an issue on GitHub

## Disclaimer

This software is for educational and research purposes. Always verify data accuracy and use appropriate risk management when making trading decisions.

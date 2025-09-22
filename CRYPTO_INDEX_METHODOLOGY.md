# Crypto Market Index Methodology

## Overview

This document outlines the methodology for the Crypto Market Index, a real-time sentiment indicator for cryptocurrency markets based on Polymarket prediction market data. The methodology is adapted from the US Political Future Index (UPFI) approach, as described in the [Adjacent News UPFI Methodology](https://adj.news/upfi-methodology/).

## 1. Executive Summary

### 1.1 Index Purpose and Design

The Crypto Market Index provides a comprehensive, real-time measure of cryptocurrency market sentiment across major crypto categories. Built on prediction market data from Polymarket, the index aggregates market-based probabilities to deliver a forward-looking gauge of crypto market sentiment and price direction expectations.

### 1.2 Key Methodology Highlights

- **Data Source**: Exclusively uses Polymarket prediction market data for consistency
- **Weighting Methodology**: Reflects both market significance and trading characteristics
- **Category Weights**: Major Crypto (40%), Altcoins (30%), DeFi (20%), Meme Coins (8%), NFT/Gaming (2%)
- **Market Weights**: Volume sensitivity, time to expiration, market cap representation, and inherent market impact
- **Scale**: 100-based scale where 100 represents perfect market balance, values above 100 indicate bullish sentiment, and values below 100 indicate bearish sentiment
- **Updates**: 24/7 with 5-minute lag and 1-hour simple moving average (SMA)

## 2. Index Design Principles

### 2.1 Forward Looking

The index focuses on future crypto market outcomes rather than current or historical conditions. It incorporates markets for price predictions and sentiment indicators that have not yet resolved.

### 2.2 Market-Based Pricing

The index relies on prediction market mechanisms where participants risk capital based on their expectations. This approach leverages the "wisdom of crowds" effect and provides financial incentives for accurate prediction.

### 2.3 Real-Time Updates

The index updates continuously to reflect new information and changing market dynamics, capturing rapid shifts in crypto sentiment that might not be reflected in traditional analysis.

### 2.4 Transparency

All index components, weights, and calculation methodologies are publicly documented to ensure transparency and enable independent verification.

### 2.5 Market Agnostic

The index methodology is designed to be market agnostic, reflecting market expectations rather than specific crypto preferences.

## 3. Universe Definition

### 3.1 Eligible Markets

The Crypto Market Index universe includes prediction markets for cryptocurrency price movements and sentiment indicators within the following categories:

1. **Major Cryptocurrencies (40%)**
   - Bitcoin (BTC), Ethereum (ETH), Binance Coin (BNB)
   - Ripple (XRP), Cardano (ADA), Solana (SOL)
   - Polkadot (DOT), Dogecoin (DOGE), Avalanche (AVAX), Polygon (MATIC)

2. **Alternative Cryptocurrencies (30%)**
   - Chainlink (LINK), Uniswap (UNI), Litecoin (LTC)
   - Cosmos (ATOM), Filecoin (FIL), Tron (TRX)
   - Ethereum Classic (ETC), Stellar (XLM), VeChain (VET), Internet Computer (ICP)

3. **DeFi Tokens (20%)**
   - Aave (AAVE), Compound (COMP), Maker (MKR)
   - Synthetix (SNX), Yearn Finance (YFI), SushiSwap (SUSHI)
   - Curve (CRV), 1inch (1INCH), Balancer (BAL), Aave (LEND)

4. **Meme Coins (8%)**
   - Shiba Inu (SHIB), Pepe (PEPE), Dogecoin (DOGE)
   - Floki (FLOKI), Bonk (BONK)

5. **NFT and Gaming Tokens (2%)**
   - Axie Infinity (AXS), The Sandbox (SAND), Decentraland (MANA)
   - Enjin (ENJ), Gala (GALA)

### 3.2 Platform Requirements

Currently, the index is composed exclusively of Polymarket-listed prediction markets. Future eligibility considerations would include:

- Licensed and regulated prediction market operators
- Minimum 12-month operational history
- Demonstrated market integrity and settlement procedures
- Real-time data feeds available via API
- Transparent terms of service and market rules

### 3.3 Volume Thresholds

The index does not impose minimum volume thresholds for market inclusion, instead incorporating volume into the weighting calculation to reduce the impact of thinly traded markets while maintaining comprehensive coverage.

## 4. Weighting Methodology

### 4.1 Category Weights

Fixed weights are assigned to each crypto category based on market significance and trading activity:

- **Major Crypto**: 40% - Represents the most significant and liquid crypto markets
- **Altcoins**: 30% - Alternative cryptocurrencies with substantial market presence
- **DeFi**: 20% - Decentralized finance tokens representing the DeFi ecosystem
- **Meme Coins**: 8% - Viral and community-driven tokens
- **NFT/Gaming**: 2% - Specialized tokens in NFT and gaming sectors

### 4.2 Market Weights

Individual markets within each category are weighted based on multiple factors:

#### Volume Sensitivity (Weight: 7/10)
- Higher-volume markets receive proportionally increased weight
- Reflects market confidence and information aggregation
- Formula: `volume_weight = min(volume / 1000, 1.0)`

#### Time Sensitivity (Weight: 6/10)
- Prefers more recent market data
- Balances near-term accuracy with long-term coverage
- Formula: `time_weight = max(0, 1 - (data_age / 24_hours))`

#### Market Cap Sensitivity (Weight: 5/10)
- Larger market cap cryptocurrencies receive higher weight
- Avoids excessive bias toward small-cap tokens
- Based on relative market cap rankings

#### Impact Sensitivity (Weight: 8/10)
- Emphasizes inherent market significance
- Major cryptocurrencies have higher impact scores
- Maintains focus on politically significant contests

### 4.3 Weight Calculation Formula

```
Market Weight = (Volume Weight × 0.7) + 
                (Time Weight × 0.6) + 
                (Market Cap Weight × 0.5) + 
                (Impact Weight × 0.8)
```

## 5. Index Calculation

### 5.1 Core Formula

The index uses a standardized financial market convention:

**Core Formula:**
```
Crypto Market Index = 100 + (Bullish Probability - 50)
```

Where:
- **Bullish Probability** = Weighted average bullish probability across all categories
- **100** = Perfect market balance baseline (50/50 bullish/bearish)
- **Values above 100** = Bullish sentiment
- **Values below 100** = Bearish sentiment

### 5.2 Category Calculation

For each category:
```
Category Index = Σ(Market Probability × Market Weight) / Σ(Market Weight)
```

### 5.3 Overall Index Calculation

```
Overall Index = Σ(Category Index × Category Weight) / Σ(Category Weight)
```

### 5.4 Smoothing

The index applies a 1-hour simple moving average (SMA) to smooth out large spikes and provide more stable readings:

```
Smoothed Index = Σ(Index Values in Last Hour) / Number of Values
```

## 6. Data Processing

### 6.1 Probability Extraction

The index extracts bullish probabilities directly from Polymarket prediction market data:

- **Data Source**: `market.probability` field from Polymarket API
- **Validation**: Probability values expected to range 0-100%
- **Default**: Markets without probability data receive 0% default

### 6.2 Outlier Treatment

The index employs systematic procedures to identify and handle probability outliers:

**Outlier Detection Criteria:**
- Extreme values: Probabilities >95% or <5%
- Rapid changes: Movements >20% within 24 hours
- Low-volume markets with extreme probabilities

**Outlier Handling:**
- Volume sensitivity mechanism naturally reduces impact
- Additional monitoring for extreme behavior
- Manual review for persistent outliers

## 7. Index Maintenance

### 7.1 Update Frequency

- **Real-time**: Continuous updates with maximum 5-minute delay
- **Rebalancing**: Daily comprehensive rebalancing
- **New Markets**: Added as they become available
- **Expired Markets**: Removed upon resolution

### 7.2 Market Disruptions

When Polymarket experiences technical disruptions:
- Index updates are paused
- Upon restoration, all missed prices are updated
- Historical continuity is maintained

## 8. Interpretation Guide

### 8.1 Index Values

- **100**: Perfect market balance (50/50 bullish/bearish sentiment)
- **105+**: Strong bullish sentiment
- **100-105**: Moderate bullish sentiment
- **95-100**: Moderate bearish sentiment
- **<95**: Strong bearish sentiment

### 8.2 Category Analysis

Each category provides insights into specific crypto market segments:
- **Major Crypto**: Overall market direction
- **Altcoins**: Alternative investment sentiment
- **DeFi**: Decentralized finance ecosystem health
- **Meme Coins**: Retail investor sentiment
- **NFT/Gaming**: Specialized sector trends

### 8.3 Volatility Analysis

The index tracks volatility through:
- **Range**: Minimum and maximum values over time
- **Standard Deviation**: Measure of price volatility
- **Trend Analysis**: Directional momentum indicators

## 9. Risk Factors and Limitations

### 9.1 Market Risk Factors

- **Demographic Bias**: Market participants may not represent broader crypto community
- **Information Asymmetry**: Some participants may have access to non-public information
- **Behavioral Biases**: Overconfidence or emotional trading can affect accuracy
- **Manipulation Risk**: Coordinated trading efforts could impact market accuracy
- **Time Horizon**: Accuracy varies based on prediction timeframe

### 9.2 Methodology Limitations

- **Market Coverage**: Selective coverage based on available Polymarket listings
- **Volume Dependencies**: Thin trading volumes can result in inefficient price discovery
- **Category Weighting**: Fixed weights may not reflect changing market dynamics
- **Data Quality**: Dependent on Polymarket data accuracy and availability

## 10. Usage Applications

### 10.1 Trading and Investment

- **Portfolio Management**: Hedging crypto market risk
- **Asset Allocation**: Adjusting crypto portfolio composition
- **Sector Rotation**: Positioning for different crypto market segments
- **Timing Strategies**: Entry and exit timing based on sentiment

### 10.2 Research and Analysis

- **Market Research**: Analyzing crypto market sentiment trends
- **Behavioral Studies**: Examining market psychology and crowd behavior
- **Policy Impact**: Measuring market reactions to regulatory developments
- **Academic Research**: Studying prediction market accuracy in crypto

### 10.3 Media and Commentary

- **Real-time Analysis**: Data-driven crypto market commentary
- **Trend Identification**: Early detection of sentiment shifts
- **Market Coverage**: Objective measures alongside traditional analysis
- **Educational Content**: Explaining crypto market dynamics

## 11. Technical Implementation

### 11.1 System Architecture

The index is implemented using:
- **Node.js**: Runtime environment
- **WebSocket**: Real-time data streaming from Polymarket
- **REST APIs**: Historical data and market information
- **Modular Design**: Separate components for data collection, processing, and calculation

### 11.2 Data Flow

1. **Data Collection**: WebSocket connection to Polymarket
2. **Data Validation**: Input validation and error handling
3. **Weight Calculation**: Dynamic weight computation based on market factors
4. **Index Calculation**: Category and overall index computation
5. **Smoothing**: SMA application for stable readings
6. **Output**: Real-time index values and analysis

### 11.3 Performance Considerations

- **Memory Management**: Automatic cleanup of old data
- **Error Handling**: Graceful handling of API failures
- **Scalability**: Modular design for easy expansion
- **Monitoring**: Comprehensive logging and status tracking

## 12. Future Enhancements

### 12.1 Planned Improvements

- **Additional Exchanges**: Integration with other prediction market platforms
- **Advanced Analytics**: Machine learning for pattern recognition
- **API Access**: Public API for third-party integration
- **Mobile App**: Real-time index monitoring on mobile devices

### 12.2 Research Opportunities

- **Accuracy Studies**: Validation against actual market outcomes
- **Behavioral Analysis**: Understanding market participant psychology
- **Cross-Asset Correlation**: Relationship with traditional financial markets
- **Regulatory Impact**: Effect of policy changes on prediction accuracy

## Conclusion

The Crypto Market Index provides a novel approach to measuring cryptocurrency market sentiment using prediction market data. By adapting the proven UPFI methodology to crypto markets, the index offers a transparent, real-time, and comprehensive view of market expectations across different cryptocurrency categories.

The methodology emphasizes transparency, real-time updates, and market-based pricing while maintaining flexibility for future enhancements and improvements. As prediction markets continue to mature and expand, the index will evolve to provide increasingly accurate and valuable insights into cryptocurrency market sentiment.

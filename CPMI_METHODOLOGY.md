# CPMI - Crypto Prediction Market Index Methodology

## 1. Executive Summary

### 1.1 Index Purpose and Design

The Crypto Prediction Market Index (CPMI) provides a comprehensive, real-time measure of anticipated bullish versus bearish sentiment across major cryptocurrency markets. Built on prediction market data from Polymarket, CPMI aggregates market-based probabilities to deliver a forward-looking gauge of crypto market sentiment and price direction expectations.

### 1.2 Key Methodology Highlights

CPMI exclusively uses Polymarket prediction market data due to its regulatory oversight and to maintain data consistency across all included markets.

The index employs a weighting methodology that reflects both crypto market significance and market characteristics:

* **Category Weights**: Bitcoin Markets (40%), Ethereum Ecosystem (30%), Regulatory Outcomes (20%), Major Altcoins (8%), Infrastructure (2%)
* **Market Weights**: Volume sensitivity, time to expiration, market impact, and market cap representation

Following established financial market conventions, CPMI uses a 100-based scale where 100 represents perfect market balance, values above 100 indicate bullish sentiment, and values below 100 indicate bearish sentiment.

The index spans five major crypto categories across different market segments, incorporating markets for Bitcoin price direction, Ethereum ecosystem developments, regulatory outcomes, major altcoin performance, and crypto infrastructure.

CPMI updates 24/7 on a 5-minute lag with a 1-hour simple moving average (SMA).

## 2. Index Overview

### 2.1 Objective

The Crypto Prediction Market Index (CPMI) provides a comprehensive, forward-looking measure of anticipated bullish versus bearish sentiment across major cryptocurrency markets. The index serves as a gauge of market expectations regarding future crypto market direction and sentiment distribution.

Crypto market outcomes significantly impact financial markets, investment decisions, and economic conditions. Traditional analysis suffers from methodological limitations, lag, and predictive inaccuracy. By aggregating prediction market data, where participants have financial incentives for accuracy, CPMI provides a more reliable and timely measure of crypto sentiment than conventional analysis or pundit predictions.

**What CPMI Measures**

* Forward-looking crypto expectations: Market-based probabilities of bullish vs. bearish market outcomes
* Aggregate crypto sentiment: Weighted average across multiple crypto categories and market segments
* Real-time crypto momentum: Dynamic updating based on new information and market activity
* Relative market strength: Comparative advantage between bullish and bearish sentiment

**What CPMI Does Not Measure**

* Current crypto prices: Not a measure of current market valuations or price levels
* Technical analysis: Does not reflect chart patterns or technical indicators
* Fundamental analysis: Not an indicator of specific project fundamentals or development progress
* Price predictions: Not a direct forecast of specific crypto price levels
* Third-party influence: Focused exclusively on bullish vs. bearish binary outcomes

### 2.2 Index Design Principles

#### Forward Looking

CPMI is exclusively focused on future crypto market outcomes rather than current or historical market conditions. The index only incorporates markets for events that have not yet occurred, immediately removing resolved events.

#### Pricing

The index relies on prediction market mechanisms where participants risk capital based on their expectations. This approach leverages the "wisdom of crowds" effect and provides financial incentives for accurate prediction, generally producing more reliable forecasts than cost-free opinion surveys.

CPMI updates continuously to reflect new information and changing crypto market dynamics. This real-time capability enables the index to capture rapid shifts in crypto sentiment that might not be reflected in traditional analysis for days or weeks.

All index components, weights, and calculation methodologies are publicly documented to ensure transparency and enable independent verification. Data sources are clearly identified, and calculation procedures are designed to be replicable by third parties with access to the same underlying market data.

The index methodology is designed to be market agnostic, reflecting market expectations rather than partisan preferences. Weighting schemes and calculation procedures are based on objective criteria such as market significance and crypto impact rather than ideological considerations.

#### Standardization

Following established practices in financial markets, CPMI uses a 100-based scale where:

* 100 represents perfect market balance (50/50 bullish/bearish probability)
* Values above 100 indicate bullish sentiment
* Values below 100 indicate bearish sentiment
* CPMI = 100 + (Bullish Probability - 50)

## 3. Universe Definition

### 3.1 Eligible Markets

The CPMI universe includes prediction markets for crypto-related events within the cryptocurrency ecosystem. CPMI incorporates the following categories of crypto markets.

1. **Bitcoin Markets (40%)**
   * Bitcoin price direction markets (bullish vs. bearish)
   * Bitcoin adoption milestone markets
   * Bitcoin ETF and institutional adoption markets
   * Bitcoin regulatory outcome markets

2. **Ethereum Ecosystem (30%)**
   * Ethereum price direction markets
   * Ethereum upgrade and development markets
   * DeFi protocol performance markets
   * Ethereum ecosystem growth markets

3. **Regulatory Outcomes (20%)**
   * SEC regulatory decision markets
   * Crypto policy change markets
   * Regulatory approval markets
   * Government crypto adoption markets

4. **Major Altcoins (8%)**
   * Top 10 crypto performance prediction markets
   * Altcoin price direction markets
   * Altcoin adoption milestone markets
   * Altcoin ecosystem development markets

5. **Infrastructure (2%)**
   * Exchange listing markets
   * Custody solution markets
   * Institutional adoption markets
   * Crypto infrastructure development markets

#### Platform Requirements

Currently the CPMI is composed exclusively of Polymarket-listed prediction markets.

There are currently no plans for inclusions of other markets from other prediction market exchanges. However, future eligibility considerations for inclusion would likely center upon the following criteria:

* Licensed and regulated prediction market operators
* Minimum 12-month operational history
* Demonstrated market integrity and settlement procedures
* Real-time data feeds available via API or direct access
* Transparent terms of service and market rules
* Broad market listing across crypto categories with reasonable volume and intent to list future crypto markets after resolution

#### Volume Thresholds

CPMI does not currently impose minimum volume or trading activity thresholds for market inclusion. This approach is adopted for several reasons:

* Many crypto-significant events occur in markets with naturally limited liquidity and/or volume
* Early exclusion of low-volume markets would reduce the index's comprehensive coverage
* Emerging markets require time to develop trading activity and crypto markets are often listed multiple months in advance
* Volume thresholds could inadvertently exclude important but niche crypto events such as regulatory developments
* Fixed volume requirements create incentives for artificial volume inflation and potential manipulation

Rather than excluding markets based on volume, CPMI incorporates volume-based weighting:

* Lower-volume markets receive proportionally reduced weight in index calculations
* Volume-weighted pricing mechanisms reduce the impact of thinly traded markets

The Index Committee reserves the right to introduce volume-based inclusion criteria as prediction markets mature:

* Minimum 1-month advance notice before implementing volume thresholds
* Gradual phase-in over 1-month period to allow market adaptation
* Grandfathering provisions for existing included markets
* Regular reassessment of threshold appropriateness

#### Data Quality

All included markets must meet the following data quality requirements:

* Real-time price updates (≤5 minute delay acceptable)
* Historical price data availability for ≥30 days
* Volume and open interest data available
* Clear timestamp accuracy for all trades
* Consistent data format across all markets
* Reliable market status indicators (active, suspended, resolved)

## 4. Category Classification

### 4.1 Bitcoin Markets (40% Weight)

**Purpose**: Capture the most significant crypto market sentiment through Bitcoin-related prediction markets.

**Included Markets**:
* Bitcoin price direction predictions
* Bitcoin adoption milestone markets
* Bitcoin ETF approval and performance markets
* Bitcoin institutional adoption markets
* Bitcoin regulatory outcome markets
* Bitcoin halving and supply dynamics markets

**Market Examples**:
* "Will Bitcoin reach $100K by end of 2024?"
* "Will Bitcoin ETF be approved by SEC?"
* "Will Bitcoin be adopted by major corporations?"

### 4.2 Ethereum Ecosystem (30% Weight)

**Purpose**: Measure sentiment around the second-largest cryptocurrency and its ecosystem.

**Included Markets**:
* Ethereum price direction predictions
* Ethereum upgrade and development markets
* DeFi protocol performance markets
* Ethereum ecosystem growth markets
* Ethereum scaling solution markets
* Ethereum regulatory outcome markets

**Market Examples**:
* "Will Ethereum reach $5K by end of 2024?"
* "Will Ethereum 2.0 upgrade be successful?"
* "Will DeFi TVL exceed $200B?"

### 4.3 Regulatory Outcomes (20% Weight)

**Purpose**: Capture the impact of regulatory decisions on crypto markets.

**Included Markets**:
* SEC regulatory decision markets
* Crypto policy change markets
* Regulatory approval markets
* Government crypto adoption markets
* Crypto taxation policy markets
* International regulatory coordination markets

**Market Examples**:
* "Will SEC approve Bitcoin ETF?"
* "Will crypto regulation be passed by Congress?"
* "Will China lift crypto ban?"

### 4.4 Major Altcoins (8% Weight)

**Purpose**: Include sentiment around other significant cryptocurrencies.

**Included Markets**:
* Top 10 crypto performance prediction markets
* Altcoin price direction markets
* Altcoin adoption milestone markets
* Altcoin ecosystem development markets
* Altcoin regulatory outcome markets

**Market Examples**:
* "Will Solana reach $200 by end of 2024?"
* "Will Cardano be adopted by governments?"
* "Will Polkadot ecosystem grow significantly?"

### 4.5 Infrastructure (2% Weight)

**Purpose**: Capture developments in crypto infrastructure and supporting systems.

**Included Markets**:
* Exchange listing markets
* Custody solution markets
* Institutional adoption markets
* Crypto infrastructure development markets
* Payment system integration markets

**Market Examples**:
* "Will major bank offer crypto custody?"
* "Will crypto be accepted by major retailers?"
* "Will crypto infrastructure improve significantly?"

## 5. Market Weighting Methodology

### 5.1 Weighting Factors

CPMI employs a multi-factor weighting system that reflects both market characteristics and crypto significance. Each market receives a weight based on four key factors:

#### Volume Sensitivity (7/10)
* **Purpose**: Emphasize markets with higher trading activity and market confidence
* **Rationale**: Higher volume indicates greater market participation and information aggregation
* **Implementation**: Markets with higher volume receive proportionally increased weight
* **Formula**: `volumeWeight = min(volume / 1000, 1)`

#### Time Sensitivity (6/10)
* **Purpose**: Moderate preference for near-term markets with fresher data
* **Rationale**: Recent trades provide more current market sentiment
* **Implementation**: Markets with more recent trades receive higher weight
* **Formula**: `timeWeight = max(0, 1 - (dataAge / 24hours))`

#### Impact Sensitivity (8/10)
* **Purpose**: Strong emphasis on inherent crypto market significance
* **Rationale**: More significant events should have greater influence on the index
* **Implementation**: Markets are weighted based on their category impact scores
* **Formula**: Category-specific impact scores (Bitcoin: 1.0, Ethereum: 0.9, etc.)

#### Market Cap Sensitivity (5/10)
* **Purpose**: Balanced representation based on market capitalization
* **Rationale**: Larger market cap cryptos should have appropriate representation
* **Implementation**: Markets are weighted based on the underlying crypto's market cap ranking
* **Formula**: Market cap-based ranking (Bitcoin: 1.0, Ethereum: 0.9, etc.)

### 5.2 Weight Calculation

The total market weight is calculated using a weighted combination of all four factors:

```
marketWeight = (volumeWeight × 0.7) + (timeWeight × 0.6) + (impactWeight × 0.8) + (marketCapWeight × 0.5)
```

This approach ensures that:
* High-volume markets receive appropriate emphasis
* Recent data is prioritized over stale information
* Significant events maintain proper influence
* Market cap representation is balanced

### 5.3 Category Index Calculation

For each category, the index is calculated using a weighted average approach:

```
Category_Probability = Σ(Market_Prob × Market_Weight) / Σ(Market_Weight)
```

Where:
* **Market_Prob** = Market price × 100 (probability extraction)
* **Market_Weight** = Calculated using the four-factor weighting system
* **Category_Probability** = Weighted average probability for the category

## 6. Index Calculation

### 6.1 Core Formula

CPMI employs a standardized financial market convention that provides intuitive interpretation while conforming to established practices in derivatives markets.

**CPMI = 100 + (Bullish Probability - 50)**

Where:

* **Bullish Probability** = Weighted average bullish probability across all categories
* **100** = Perfect market balance baseline (50/50 bullish/bearish split)
* **Values above 100** = Bullish sentiment
* **Values below 100** = Bearish sentiment

This convention mirrors established financial instruments such as VIX futures and Federal Funds futures, where pricing reflects inverse relationships to underlying rates. The 100-based scale provides professional familiarity while enabling clear interpretation:

**Example Calculations**

* Bullish Probability 55% → CPMI = 100 + (55 - 50) = 105
* Bullish Probability 45% → CPMI = 100 + (45 - 50) = 95
* Bullish Probability 50% → CPMI = 100 + (50 - 50) = 100

The Bullish Probability input represents a weighted composite across all crypto categories:

**Category Contribution Formula**

```
Bullish Probability = Σ(CategoryIndex × CategoryWeight) / Σ(CategoryWeight)
```

Where:

* **CategoryIndex** = Bullish probability for each crypto category (Bitcoin, Ethereum, Regulatory, Altcoins, Infrastructure)
* **CategoryWeight** = Fixed weights (40%, 30%, 20%, 8%, 2% respectively)
* **Normalization** = Division by total active category weights when some categories lack markets

### 6.2 Probability Extraction

#### Market Price to Probability Conversion

CPMI extracts bullish probabilities directly from Polymarket prediction market data using streamlined data integration:

* **Polymarket Data Structure**: Binary outcome markets provide single probability values
* **Bullish Probability** = Market price × 100 (direct probability conversion)
* **Data Source**: Market price field from Polymarket API response
* **Validation**: Probability values expected to range 0-100%

Markets without price data receive 0% default.

#### Volume Weighting Integration

Rather than excluding low-volume markets, CPMI incorporates volume directly into probability weighting:

```
Category Probability = Σ(Market Probability × Market Weight) / Σ(Market Weight)
```

Where Market Weight incorporates volume sensitivity as described in Section 5.3.

**Volume Impact Mechanism**

* **High Volume Markets**: Receive proportionally higher weight
* **Low Volume Markets**: Contribute to index but with reduced weight
* **Dynamic Adjustment**: Weights update as volume patterns change

#### Outlier Treatment

CPMI employs systematic procedures to identify and handle probability outliers:

**Outlier Detection Criteria**

* **Extreme Values**: Probabilities >95% or <5% may receive additional scrutiny
* **Rapid Changes**: Probability movements >20% within 24 hours may be flagged for review
* **Volume Context**: Low-volume markets with extreme probabilities may be monitored closely
* **Market Context**: May be cross-referenced with crypto significance and news events

**Outlier Handling Procedures**

* **Weight Adjustment**: Volume sensitivity mechanism naturally reduces impact of low-confidence outliers
* **Monitoring Enhancement**: Additional surveillance for markets exhibiting extreme behavior
* **Documentation**: Logging of outlier events and their treatment in index calculation
* **Manual Review**: Index Committee assessment of persistent outlier situations

## 7. Index Maintenance

### 7.1 Rebalancing Procedures

The index updates continuously with maximum 5-minute delay from market price changes. Daily comprehensive rebalancing at day of market inclusion, incorporating new markets and removing expired contests.

Weight changes occur as market volumes change and time to expiration decreases and as new crypto markets are listed. New markets are added or removed as they are opened for trading. Category weight shifts are triggered by significant changes in market composition or extraordinary crypto events requiring Index Committee review.

### 7.2 Market Disruptions

The index maintains real-time accuracy by updating continuously throughout trading hours, with market price changes reflected within a maximum five-minute delay.

When Polymarket experiences technical disruptions the index will not be updated since all underlying markets are on the Polymarket platform. When the platform is back up any prices that were not reported will be updated.

## 8. Data Sources and Integration

### 8.1 Primary Data Source

**Polymarket API**: The primary source for all prediction market data
* **Endpoint**: `/trades` GET endpoint for recent trade data
* **Update Frequency**: Real-time with 5-minute maximum delay
* **Data Quality**: High-quality, regulated prediction market data
* **Coverage**: Comprehensive coverage of crypto-related prediction markets

### 8.2 Data Processing Pipeline

1. **Data Extraction**: Fetch recent trades from Polymarket API
2. **Crypto Filtering**: Filter trades for crypto-related markets
3. **Market Processing**: Aggregate trades by market and calculate averages
4. **Category Classification**: Classify markets into appropriate categories
5. **Weight Calculation**: Calculate market weights using four-factor system
6. **Index Calculation**: Compute category indices and overall CPMI
7. **Smoothing**: Apply 1-hour simple moving average
8. **Output**: Generate index value and category breakdown

### 8.3 Data Quality Assurance

* **Real-time Validation**: Continuous monitoring of data quality
* **Outlier Detection**: Automated identification of anomalous data
* **Error Handling**: Graceful handling of API failures and data issues
* **Backup Procedures**: Fallback mechanisms for data disruptions

## 9. Governance

### 9.1 Index Committee

Sessions occur on an ad-hoc basis, around key crypto events and listing of new markets to be included. Emergency meetings called within 48 hours for critical issues.

Full committee approval required for methodology changes affecting index calculation. Trading prohibition in CPMI-constituent markets during tenure.

### 9.2 Methodology Changes

A formal written proposal including rationale, implementation plan, and impact assessment, including markets that settle to the index is required. Technical review by methodology team for feasibility evaluation.

The rationale will be publicly posted and the methodology will be updated accordingly after a 30-day period.

## 10. Risk Factors and Limitations

### 10.1 Market Risk Factors

The CPMI relies on prediction markets whose participants may not represent the broader crypto market demographically, potentially creating biases in probability estimates. Information asymmetries exist where some market participants may have access to non-public information, while behavioral biases such as overconfidence or crypto preferences can affect trading decisions and market accuracy. Prediction markets remain vulnerable to potential manipulation through coordinated trading efforts, and their accuracy varies significantly based on the time horizon until resolution, with longer-term markets generally exhibiting greater uncertainty.

Many crypto-significant events, particularly at the regulatory and infrastructure level, suffer from thin trading volumes that can result in inefficient price discovery and increased volatility. Wide bid-ask spreads in illiquid markets may not accurately reflect the true underlying probabilities, while limited market depth means that even moderate trading activity can cause significant price movements that may not reflect genuine changes in crypto market prospects.

### 10.2 Methodology Limitations

Initially there are sampling limitations due to selective market coverage and limited listings around crypto-specific markets. A list of market types that could be included are covered in section 3.1.

Currently markets are excluded as soon as they resolve even if the underlying crypto event does not occur for a few months following. During this time period there may not be the next cycle's markets listed yet and the index can potentially be significantly underweight a given category. In the future this can be addressed by including markets until the event occurs, possibly with an aggressive decay function into when the next cycle market is listed.

## 11. Implementation Details

### 11.1 Technical Architecture

**Core Components**:
* **CPMI_Final.js**: Main index calculation class
* **SimplePolymarketClient.js**: API client for data fetching
* **Data processing pipeline**: Real-time data processing and index calculation
* **Configuration management**: Flexible configuration for weights and parameters

**Key Features**:
* **Real-time updates**: 5-minute update interval
* **Smoothing**: 1-hour simple moving average
* **Error handling**: Robust error handling and recovery
* **Logging**: Comprehensive logging for monitoring and debugging

### 11.2 Usage Examples

**Basic Usage**:
```javascript
import { CPMI_Final } from './src/CPMI_Final.js';

const cpmi = new CPMI_Final();
await cpmi.start();

// Get current index
const indexData = cpmi.getCurrentIndex();
console.log(`CPMI: ${indexData.value} (${indexData.interpretation})`);

// Get category breakdown
const breakdown = cpmi.getCategoryBreakdown();
console.log(breakdown);

cpmi.stop();
```

**Configuration**:
```javascript
const cpmi = new CPMI_Final({
  categoryWeights: {
    'bitcoin-markets': 0.40,
    'ethereum-ecosystem': 0.30,
    'regulatory-outcomes': 0.20,
    'major-altcoins': 0.08,
    'infrastructure': 0.02
  },
  sensitivity: {
    volume: 7,
    time: 6,
    impact: 8,
    marketCap: 5
  }
});
```

### 11.3 Performance Characteristics

* **Update Frequency**: 5 minutes
* **Data Latency**: Maximum 5-minute delay
* **Smoothing**: 1-hour simple moving average
* **Memory Usage**: Efficient data structures for real-time processing
* **Error Recovery**: Automatic recovery from API failures

## 12. Conclusion

The Crypto Prediction Market Index (CPMI) provides a comprehensive, real-time measure of crypto market sentiment using prediction market data from Polymarket. By following the proven methodology of the US Political Future Index (UPFI), CPMI delivers a reliable, transparent, and accurate gauge of crypto market expectations.

The index's 100-based scale, multi-factor weighting system, and real-time updates make it a valuable tool for investors, analysts, and researchers seeking to understand crypto market sentiment and make informed decisions based on market-based probability assessments.

CPMI represents a significant advancement in crypto market analysis, providing a data-driven alternative to traditional sentiment analysis and offering insights into market expectations that are not available through other means.

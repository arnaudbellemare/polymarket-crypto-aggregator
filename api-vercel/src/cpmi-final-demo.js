import { CPMI_Final } from './CPMI_Final.js';

/**
 * CPMI Final Demo - Clean UPFI-style implementation
 * 
 * This demo shows the final CPMI implementation using:
 * - Simple probability extraction (market price = probability)
 * - UPFI-style category weighting
 * - Clean aggregation without over-engineering
 * - 5-minute updates with 1-hour smoothing
 */
async function runCPMIFinalDemo() {
  console.log('🚀 CPMI Final Demo - Clean UPFI-Style Implementation');
  console.log('=' .repeat(60));
  
  try {
    // Initialize CPMI
    const cpmi = new CPMI_Final();
    
    // Start the index
    console.log('\n📊 Starting CPMI calculation...');
    const started = await cpmi.start();
    
    if (!started) {
      console.error('❌ Failed to start CPMI');
      return;
    }
    
    // Wait a moment for initial calculation
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Get current index
    const indexData = cpmi.getCurrentIndex();
    console.log('\n📈 CPMI Results:');
    console.log('=' .repeat(40));
    console.log(`Index Value: ${indexData.value.toFixed(2)} (${indexData.interpretation})`);
    console.log(`Last Update: ${indexData.lastUpdate?.toLocaleString() || 'Never'}`);
    
    // Show category breakdown
    console.log('\n📊 Category Breakdown:');
    console.log('=' .repeat(40));
    const breakdown = cpmi.getCategoryBreakdown();
    
    for (const [category, data] of Object.entries(breakdown)) {
      if (data) {
        const weightPercent = (data.weight * 100).toFixed(1);
        const deviation = data.deviation > 0 ? `+${data.deviation.toFixed(1)}` : data.deviation.toFixed(1);
        console.log(`${category}: ${data.index.toFixed(1)}% (${data.interpretation} ${deviation}) - Weight: ${weightPercent}%`);
      }
    }
    
    // Show index statistics
    console.log('\n📈 Index Statistics:');
    console.log('=' .repeat(40));
    const stats = cpmi.getIndexStatistics();
    if (stats) {
      console.log(`Min: ${stats.min.toFixed(2)}`);
      console.log(`Max: ${stats.max.toFixed(2)}`);
      console.log(`Average: ${stats.average.toFixed(2)}`);
      console.log(`Volatility: ${stats.volatility.toFixed(2)}`);
      console.log(`Data Points: ${stats.dataPoints}`);
    } else {
      console.log('No historical data available yet');
    }
    
    // Show configuration
    console.log('\n⚙️ CPMI Configuration (Following UPFI Methodology):');
    console.log('=' .repeat(40));
    console.log('Category Weights (UPFI-Style):');
    for (const [category, weight] of Object.entries(cpmi.config.categoryWeights)) {
      console.log(`  ${category}: ${(weight * 100).toFixed(1)}%`);
    }
    
    console.log('\nSensitivity Weights (UPFI\'s Exact Values):');
    for (const [factor, weight] of Object.entries(cpmi.config.sensitivity)) {
      console.log(`  ${factor}: ${weight}/10`);
    }
    
    console.log(`\nUpdate Interval: ${cpmi.config.updateInterval / 1000 / 60} minutes`);
    console.log(`Smoothing Period: ${cpmi.config.smoothingPeriod / 1000 / 60 / 60} hours`);
    
    // Export full data
    console.log('\n💾 Exporting index data...');
    const exportData = cpmi.exportIndexData();
    console.log('✅ Index data exported successfully');
    
    // Show methodology summary
    console.log('\n📚 CPMI Methodology Summary (Following UPFI):');
    console.log('=' .repeat(40));
    console.log('✅ Formula: CPMI = 100 + (Bullish Probability - 50)');
    console.log('✅ 100 = Market neutral (50/50 bull/bear)');
    console.log('✅ Above 100 = Bullish crypto sentiment');
    console.log('✅ Below 100 = Bearish crypto sentiment');
    console.log('✅ Market type-aware probability extraction:');
    console.log('   - BINARY: "Will X happen?" → Price = probability');
    console.log('   - DIRECTIONAL: "X Up or Down" → Price = probability');
    console.log('   - PRICE_PREDICTION: "Will X reach $Y?" → Target vs current analysis');
    console.log('   - RANGE: "Will X be between $Y-$Z?" → Range vs current analysis');
    console.log('✅ UPFI-style category weighting (40%, 30%, 20%, 8%, 2%)');
    console.log('✅ UPFI\'s exact sensitivity values (7/10, 6/10, 8/10, 5/10)');
    console.log('✅ 5-minute updates with 1-hour smoothing');
    console.log('✅ No complex Bayesian updates or over-engineering');
    console.log('✅ Follows proven UPFI methodology from political markets');
    
    // Stop the index
    cpmi.stop();
    
    console.log('\n🎯 CPMI Final Demo completed successfully!');
    console.log('=' .repeat(60));
    
  } catch (error) {
    console.error('❌ CPMI Final Demo failed:', error);
  }
}

// Run the demo
runCPMIFinalDemo().catch(console.error);

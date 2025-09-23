import express from 'express';
import cors from 'cors';
import { CPMI_Final } from './CPMI_Final.js';

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: true, // Allow all origins for now
  credentials: true
}));
app.use(express.json());

// Initialize CPMI
const cpmi = new CPMI_Final();

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Get current CPMI value
app.get('/api/cpmi/current', (req, res) => {
  try {
    const currentIndex = cpmi.getCurrentIndex();
    const categoryBreakdown = cpmi.getCategoryBreakdown();
    
    res.json({
      success: true,
      data: {
        index: currentIndex,
        categories: categoryBreakdown,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get CPMI history
app.get('/api/cpmi/history', (req, res) => {
  try {
    const statistics = cpmi.getIndexStatistics();
    
    res.json({
      success: true,
      data: {
        history: statistics.historicalValues || [],
        statistics,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get full CPMI data export
app.get('/api/cpmi/export', (req, res) => {
  try {
    const exportData = cpmi.exportIndexData();
    
    res.json({
      success: true,
      data: exportData,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get CPMI configuration
app.get('/api/cpmi/config', (req, res) => {
  try {
    res.json({
      success: true,
      data: {
        configuration: cpmi.config,
        methodology: {
          formula: "CPMI = 100 + (Bullish Probability - 50)",
          baseline: "100 = Market neutral (50/50 bull/bear)",
          categories: Object.keys(cpmi.config.categoryWeights),
          sensitivities: Object.keys(cpmi.config.sensitivity)
        },
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Start CPMI and server
async function start() {
  try {
    console.log('🚀 Starting CPMI API Server...');
    
    // Start CPMI in background
    await cpmi.start();
    
    // Start Express server
    app.listen(port, () => {
      console.log(`✅ CPMI API Server running on port ${port}`);
      console.log(`📊 Health check: http://localhost:${port}/health`);
      console.log(`📈 Current CPMI: http://localhost:${port}/api/cpmi/current`);
      console.log(`📚 Full export: http://localhost:${port}/api/cpmi/export`);
    });
    
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down gracefully...');
  await cpmi.stop();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n🛑 Shutting down gracefully...');
  await cpmi.stop();
  process.exit(0);
});

start();

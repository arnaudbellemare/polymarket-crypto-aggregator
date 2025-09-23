const express = require('express');
const cors = require('cors');

// Import CPMI (we'll need to copy the CPMI files)
const { CPMI_Final } = require('../src/CPMI_Final.js');

const app = express();

// Middleware
app.use(cors({
  origin: true, // Allow all origins
  credentials: true
}));
app.use(express.json());

// Initialize CPMI
let cpmi;
let cpmiStarted = false;

async function initializeCPMI() {
  if (!cpmiStarted) {
    cpmi = new CPMI_Final();
    await cpmi.start();
    cpmiStarted = true;
    console.log('✅ CPMI initialized');
  }
  return cpmi;
}

// Health check endpoint
app.get('/health', async (req, res) => {
  try {
    await initializeCPMI();
    res.json({ 
      status: 'healthy', 
      timestamp: new Date().toISOString(),
      uptime: process.uptime()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get current CPMI value
app.get('/api/cpmi/current', async (req, res) => {
  try {
    const cpmiInstance = await initializeCPMI();
    const currentIndex = cpmiInstance.getCurrentIndex();
    const categoryBreakdown = cpmiInstance.getCategoryBreakdown();
    
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
app.get('/api/cpmi/history', async (req, res) => {
  try {
    const cpmiInstance = await initializeCPMI();
    const statistics = cpmiInstance.getIndexStatistics();
    
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
app.get('/api/cpmi/export', async (req, res) => {
  try {
    const cpmiInstance = await initializeCPMI();
    const exportData = cpmiInstance.exportIndexData();
    
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
app.get('/api/cpmi/config', async (req, res) => {
  try {
    const cpmiInstance = await initializeCPMI();
    res.json({
      success: true,
      data: {
        configuration: cpmiInstance.config,
        methodology: {
          formula: "CPMI = 100 + (Bullish Probability - 50)",
          baseline: "100 = Market neutral (50/50 bull/bear)",
          categories: Object.keys(cpmiInstance.config.categoryWeights),
          sensitivities: Object.keys(cpmiInstance.config.sensitivity)
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

// Export the app for Vercel
module.exports = app;

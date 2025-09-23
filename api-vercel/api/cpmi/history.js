module.exports = (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  
  // Mock history data
  const mockHistory = {
    success: true,
    data: {
      history: [
        {
          timestamp: new Date(Date.now() - 300000).toISOString(),
          value: 119.54,
          probability: 69.54
        },
        {
          timestamp: new Date(Date.now() - 600000).toISOString(),
          value: 131.84,
          probability: 81.84
        }
      ],
      statistics: {
        min: 119.54,
        max: 131.84,
        average: 125.69,
        volatility: 6.15,
        dataPoints: 2,
        timeRange: {
          start: new Date(Date.now() - 600000).toISOString(),
          end: new Date(Date.now() - 300000).toISOString()
        }
      },
      timestamp: new Date().toISOString()
    }
  };

  res.json(mockHistory);
};

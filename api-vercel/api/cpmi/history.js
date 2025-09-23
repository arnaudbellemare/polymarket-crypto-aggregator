export default function handler(req, res) {
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
        { timestamp: new Date(Date.now() - 1800000).toISOString(), index: 114.19 },
        { timestamp: new Date(Date.now() - 1200000).toISOString(), index: 115.44 },
        { timestamp: new Date(Date.now() - 600000).toISOString(), index: 116.42 },
        { timestamp: new Date().toISOString(), index: 116.42 }
      ],
      statistics: {
        min: 114.19,
        max: 116.42,
        average: 115.62,
        volatility: 0.89,
        dataPoints: 4,
        timeRange: {
          start: new Date(Date.now() - 1800000).toISOString(),
          end: new Date().toISOString()
        }
      },
      timestamp: new Date().toISOString()
    }
  };

  res.json(mockHistory);
}
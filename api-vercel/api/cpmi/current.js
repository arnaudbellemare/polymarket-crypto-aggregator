export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Mock data that matches your real API format
  const mockData = {
    success: true,
    data: {
      index: {
        value: 116.42,
        interpretation: "Bullish (+16.4)",
        lastUpdate: new Date().toISOString(),
        categoryIndices: {
          "bitcoin-markets": 42.81,
          "ethereum-ecosystem": 78.95,
          "regulatory-outcomes": null,
          "major-altcoins": 76.33,
          "infrastructure": null
        },
        historicalValues: [
          {
            timestamp: new Date(Date.now() - 300000).toISOString(),
            value: 115.44,
            probability: 65.44
          },
          {
            timestamp: new Date().toISOString(),
            value: 116.42,
            probability: 66.42
          }
        ]
      },
      categories: {
        "bitcoin-markets": {
          index: 42.81,
          weight: 0.4,
          interpretation: "Bearish",
          deviation: -7.19
        },
        "ethereum-ecosystem": {
          index: 78.95,
          weight: 0.3,
          interpretation: "Bullish",
          deviation: 28.95
        },
        "major-altcoins": {
          index: 76.33,
          weight: 0.08,
          interpretation: "Bullish",
          deviation: 26.33
        }
      },
      timestamp: new Date().toISOString()
    }
  };

  res.json(mockData);
}
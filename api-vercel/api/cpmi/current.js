module.exports = (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  
  // Mock data for now - this will be replaced with real CPMI data
  const mockData = {
    success: true,
    data: {
      index: {
        value: 125.69,
        interpretation: "Bullish (+25.7)",
        lastUpdate: new Date().toISOString(),
        categoryIndices: {
          "bitcoin-markets": 87.25,
          "ethereum-ecosystem": 73.85,
          "regulatory-outcomes": null,
          "major-altcoins": 84.80,
          "infrastructure": null
        }
      },
      categories: {
        "bitcoin-markets": {
          index: 87.25,
          weight: 0.4,
          interpretation: "Bullish",
          deviation: 37.25
        },
        "ethereum-ecosystem": {
          index: 73.85,
          weight: 0.3,
          interpretation: "Bullish",
          deviation: 23.85
        },
        "major-altcoins": {
          index: 84.80,
          weight: 0.08,
          interpretation: "Bullish",
          deviation: 34.80
        }
      },
      timestamp: new Date().toISOString()
    }
  };

  res.json(mockData);
};

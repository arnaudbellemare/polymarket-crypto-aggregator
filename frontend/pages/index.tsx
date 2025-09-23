import { useState, useEffect } from 'react';
import Head from 'next/head';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar
} from 'recharts';
import { TrendingUp, TrendingDown, Activity, BarChart3, PieChart as PieChartIcon } from 'lucide-react';
import axios from 'axios';

interface CPMIData {
  success: boolean;
  data: {
    index: {
      value: number;
      interpretation: string;
      lastUpdate: string;
      categoryIndices: {
        [key: string]: number;
      };
    };
    categories: {
      [key: string]: {
        index: number;
        weight: number;
        interpretation: string;
        deviation: number;
      };
    };
    timestamp: string;
  };
}

interface HistoryData {
  success: boolean;
  data: {
    history: Array<{
      timestamp: string;
      index: number;
    }>;
    statistics: {
      min: number;
      max: number;
      average: number;
      volatility: number;
      dataPoints: number;
    };
  };
}

export default function Home() {
  const [cpmiData, setCpmiData] = useState<CPMIData | null>(null);
  const [historyData, setHistoryData] = useState<HistoryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const API_BASE_URL = process.env.NEXT_PUBLIC_CPMI_API_URL || 'http://localhost:3000';
      const [currentResponse, historyResponse] = await Promise.all([
        axios.get(`${API_BASE_URL}/api/cpmi/current`),
        axios.get(`${API_BASE_URL}/api/cpmi/history`)
      ]);
      
      setCpmiData(currentResponse.data);
      setHistoryData(historyResponse.data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch CPMI data. Make sure your VM is running.');
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const getSentimentColor = (index: number) => {
    if (index > 100) return 'bullish';
    if (index < 100) return 'bearish';
    return 'neutral';
  };

  const getSentimentText = (index: number) => {
    if (index > 100) return 'Bullish';
    if (index < 100) return 'Bearish';
    return 'Neutral';
  };

  const formatCategoryName = (key: string) => {
    return key.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  if (loading) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white mx-auto mb-4"></div>
          <h2 className="text-white text-xl">Loading CPMI Data...</h2>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center">
        <div className="card text-center max-w-md">
          <h2 className="text-red-500 text-xl mb-4">Error</h2>
          <p className="text-white mb-4">{error}</p>
          <button 
            onClick={fetchData}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const categoryData = cpmiData ? Object.entries(cpmiData.data.categories).map(([key, value], index) => ({
    name: formatCategoryName(key),
    value: value.index,
    color: COLORS[index % COLORS.length]
  })) : [];

  const historyChartData = historyData?.data.history.map(item => ({
    time: new Date(item.timestamp).toLocaleTimeString(),
    index: item.index,
    sentiment: item.index > 100 ? 'Bullish' : item.index < 100 ? 'Bearish' : 'Neutral'
  })) || [];

  return (
    <div className="min-h-screen gradient-bg">
      <Head>
        <title>CPMI - Crypto Prediction Market Index</title>
        <meta name="description" content="Real-time Crypto Prediction Market Index" />
      </Head>

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            Crypto Prediction Market Index
          </h1>
          <p className="text-white/80">
            Real-time sentiment analysis from Polymarket crypto prediction markets
          </p>
          <div className="mt-4">
            <span className="text-white/60 text-sm">
              Last updated: {cpmiData ? new Date(cpmiData.data.timestamp).toLocaleString() : 'N/A'}
            </span>
          </div>
        </div>

        {/* Main Index Card */}
        <div className="card mb-8 text-center">
          <div className="flex items-center justify-center mb-4">
            {cpmiData && (
              <>
                {cpmiData.data.index.value > 100 ? (
                  <TrendingUp className="h-8 w-8 text-green-500 mr-2" />
                ) : cpmiData.data.index.value < 100 ? (
                  <TrendingDown className="h-8 w-8 text-red-500 mr-2" />
                ) : (
                  <Activity className="h-8 w-8 text-gray-500 mr-2" />
                )}
                <h2 className="text-3xl font-bold text-white">
                  {cpmiData.data.index.value.toFixed(2)}
                </h2>
              </>
            )}
          </div>
          <div className={`text-2xl font-semibold ${getSentimentColor(cpmiData?.data.index.value || 100)}`}>
            {cpmiData ? getSentimentText(cpmiData.data.index.value) : 'Loading...'}
          </div>
          <div className="text-white/60 mt-2">
            {cpmiData && (
              <span>
                {cpmiData.data.index.value > 100 
                  ? `+${(cpmiData.data.index.value - 100).toFixed(2)} above neutral`
                  : cpmiData.data.index.value < 100 
                  ? `${(cpmiData.data.index.value - 100).toFixed(2)} below neutral`
                  : 'Perfectly neutral'
                }
              </span>
            )}
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Historical Chart */}
          <div className="card">
            <div className="flex items-center mb-4">
              <BarChart3 className="h-6 w-6 text-white mr-2" />
              <h3 className="text-xl font-semibold text-white">Historical Trend</h3>
            </div>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={historyChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis 
                    dataKey="time" 
                    stroke="#9CA3AF"
                    fontSize={12}
                  />
                  <YAxis 
                    stroke="#9CA3AF"
                    fontSize={12}
                    domain={[95, 105]}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: '#1F2937',
                      border: '1px solid #374151',
                      borderRadius: '8px',
                      color: '#F9FAFB'
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="index" 
                    stroke="#3B82F6" 
                    strokeWidth={3}
                    dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, stroke: '#3B82F6', strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Category Distribution */}
          <div className="card">
            <div className="flex items-center mb-4">
              <PieChartIcon className="h-6 w-6 text-white mr-2" />
              <h3 className="text-xl font-semibold text-white">Category Distribution</h3>
            </div>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: '#1F2937',
                      border: '1px solid #374151',
                      borderRadius: '8px',
                      color: '#F9FAFB'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Statistics */}
        {historyData && (
          <div className="card">
            <h3 className="text-xl font-semibold text-white mb-4">Statistics</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-white">
                  {historyData.data.statistics.min.toFixed(2)}
                </div>
                <div className="text-white/60 text-sm">Minimum</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white">
                  {historyData.data.statistics.max.toFixed(2)}
                </div>
                <div className="text-white/60 text-sm">Maximum</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white">
                  {historyData.data.statistics.average.toFixed(2)}
                </div>
                <div className="text-white/60 text-sm">Average</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white">
                  {historyData.data.statistics.volatility.toFixed(2)}
                </div>
                <div className="text-white/60 text-sm">Volatility</div>
              </div>
            </div>
          </div>
        )}

        {/* Refresh Button */}
        <div className="text-center mt-8">
          <button 
            onClick={fetchData}
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
          >
            Refresh Data
          </button>
        </div>
      </div>
    </div>
  );
}

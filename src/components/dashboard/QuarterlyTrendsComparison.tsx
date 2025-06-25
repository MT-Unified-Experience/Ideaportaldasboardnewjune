import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, ReferenceLine } from 'recharts';
import { TrendingUp, TrendingDown, Minus, AlertTriangle, CheckCircle, Clock, Users, X, HelpCircle } from 'lucide-react';

interface Feature {
  feature_name: string;
  vote_count: number;
  status: 'Delivered' | 'Under Review' | 'Committed';
  client_voters: string[];
  estimated_impact?: 'High' | 'Medium' | 'Low';
  resource_requirement?: 'High' | 'Medium' | 'Low';
  strategic_alignment?: number;
  risks?: string[];
}

interface TrendData {
  id: string;
  name: string;
  q1_votes: number;
  q2_votes: number;
  q3_votes: number;
  q4_votes: number;
  q3_rank: number;
  q4_rank: number;
  percentage_change: number;
  growth_rate: number;
  confidence_interval: [number, number];
  is_significant: boolean;
  trend_direction: 'up' | 'down' | 'stable';
  seasonal_pattern: 'none' | 'increasing' | 'decreasing' | 'cyclical';
  status: 'Delivered' | 'Under Review' | 'Committed';
  client_voters: string[];
  estimated_impact: 'High' | 'Medium' | 'Low';
  resource_requirement: 'High' | 'Medium' | 'Low';
  strategic_alignment: number;
  risks: string[];
}

interface QuarterlyTrendsComparisonProps {
  currentFeatures: Feature[]; // Q4 features
  previousFeatures: Feature[]; // Q3 features
  currentQuarterLabel?: string;
  previousQuarterLabel?: string;
}

const QuarterlyTrendsComparison: React.FC<QuarterlyTrendsComparisonProps> = ({ 
  currentFeatures, 
  previousFeatures,
  currentQuarterLabel = 'Q4',
  previousQuarterLabel = 'Q3'
}) => {
  const [trendAnalysis, setTrendAnalysis] = useState<string[]>([
    'AI Integration continues to lead with highest vote count across all quarters',
    'Mobile App requests show consistent growth pattern',
    'Reporting Tools maintain steady demand from enterprise clients'
  ]);
  const [newBulletPoint, setNewBulletPoint] = useState('');

  // Format quarter labels for display
  const formatQuarterLabel = (quarter: string) => {
    const match = quarter.match(/FY(\d+)\s+Q(\d+)/);
    if (match) {
      return `FY${match[1]} Q${match[2]}`;
    }
    return quarter;
  };

  const formattedCurrentQuarter = formatQuarterLabel(currentQuarterLabel);
  const formattedPreviousQuarter = formatQuarterLabel(previousQuarterLabel);
  // Get top 10 most-voted items across all fiscal years
  const getTop10Features = (): Feature[] => {
    // Combine all features from current and previous quarters
    const allFeatures = [...currentFeatures, ...previousFeatures];
    
    // Remove duplicates by feature name, keeping the one with higher vote count
    const uniqueFeatures = allFeatures.reduce((acc, feature) => {
      const existing = acc.find(f => f.feature_name === feature.feature_name);
      if (!existing || feature.vote_count > existing.vote_count) {
        return [...acc.filter(f => f.feature_name !== feature.feature_name), feature];
      }
      return acc;
    }, [] as Feature[]);
    
    // Sort by vote count and take top 10
    return uniqueFeatures
      .sort((a, b) => b.vote_count - a.vote_count)
      .slice(0, 10);
  };

  const top10Features = getTop10Features();

  const addBulletPoint = () => {
    if (newBulletPoint.trim()) {
      setTrendAnalysis([...trendAnalysis, newBulletPoint.trim()]);
      setNewBulletPoint('');
    }
  };

  const removeBulletPoint = (index: number) => {
    setTrendAnalysis(trendAnalysis.filter((_, i) => i !== index));
  };

  const updateBulletPoint = (index: number, newText: string) => {
    const updated = [...trendAnalysis];
    updated[index] = newText;
    setTrendAnalysis(updated);
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 shadow-lg rounded-lg border border-gray-200">
          <p className="font-medium text-gray-900 mb-2">{data.feature_name}</p>
          <div className="space-y-1">
            <div className="flex justify-between text-sm">
              <span>Vote Count:</span>
              <span className="font-medium">{data.vote_count}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Status:</span>
              <span className="font-medium">{data.status}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Client Voters:</span>
              <span className="font-medium">{data.client_voters?.length || 0}</span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center gap-2 mb-6">
        <h3 className="text-lg font-medium text-gray-900">
          Top 10 Trends
        </h3>
        <div className="relative group">
          <HelpCircle className="h-4 w-4 text-gray-400 cursor-help" />
          <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-64 p-2 bg-gray-900 text-white text-xs rounded-md opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
            Top 10 most-voted feature requests across all fiscal years with trend analysis
          </div>
        </div>
      </div>

      {/* Main Layout: Graph on Left, Trend Analysis on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Side: Graph */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="text-md font-medium text-gray-900 mb-4">Top 10 Most-Voted Features</h4>
          <div className="h-[500px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={top10Features} 
                margin={{ top: 20, right: 30, left: 20, bottom: 120 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="feature_name" 
                  angle={-45}
                  textAnchor="end"
                  height={100}
                  tick={{ fontSize: 10 }}
                  interval={0}
                />
                <YAxis />
                <Tooltip content={<CustomTooltip />} />
                <Bar 
                  dataKey="vote_count" 
                  name="Vote Count"
                  fill="#3b82f6" 
                  minPointSize={5}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right Side: Trend Analysis */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="text-md font-medium text-gray-900 mb-4">Trend Analysis</h4>
          
          {/* Existing Bullet Points */}
          <div className="space-y-3 mb-4">
            {trendAnalysis.map((point, index) => (
              <div key={index} className="flex items-start gap-2 group">
                <span className="text-blue-600 mt-1">•</span>
                <input
                  type="text"
                  value={point}
                  onChange={(e) => updateBulletPoint(index, e.target.value)}
                  className="flex-1 bg-transparent border-none outline-none text-sm text-gray-700 focus:bg-white focus:border focus:border-blue-300 focus:rounded px-2 py-1"
                />
                <button
                  onClick={() => removeBulletPoint(index)}
                  className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-700 transition-opacity"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
          
          {/* Add New Bullet Point */}
          <div className="flex items-center gap-2 mt-4">
            <input
              type="text"
              value={newBulletPoint}
              onChange={(e) => setNewBulletPoint(e.target.value)}
              placeholder="Add new trend analysis point..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              onKeyPress={(e) => e.key === 'Enter' && addBulletPoint()}
            />
            <button
              onClick={addBulletPoint}
              disabled={!newBulletPoint.trim()}
              className="px-3 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Add
            </button>
          </div>
          
          {/* Instructions */}
          <div className="mt-6 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-xs text-blue-700">
              <strong>Instructions:</strong> Click on any bullet point to edit it. Use the "Add" button to create new trend analysis points. Remove points by hovering and clicking the X button.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuarterlyTrendsComparison;
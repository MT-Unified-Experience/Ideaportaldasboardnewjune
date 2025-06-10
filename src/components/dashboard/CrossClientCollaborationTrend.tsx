import React, { useState } from 'react';
import { Users, X, HelpCircle, TrendingUp, TrendingDown } from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';

interface CollaborativeIdea {
  id: string;
  name: string;
  originalSubmitter: string;
  contributors: string[];
  submissionDate: string;
  collaborationScore: number;
  status: 'Active' | 'Delivered' | 'In Development';
  comments: string;
}

interface QuarterlyCollaborationData {
  quarter: string;
  year: number;
  collaborativeIdeas: number;
  totalIdeas: number;
  collaborationRate: number;
  significantChange: boolean;
  changeDirection: 'up' | 'down' | 'stable';
  changePercentage: number;
  topCollaborativeIdeas: CollaborativeIdea[];
}

interface CrossClientCollaborationTrendProps {
  isOpen: boolean;
  onClose: () => void;
  embedded?: boolean;
}

const CrossClientCollaborationTrend: React.FC<CrossClientCollaborationTrendProps> = ({
  isOpen,
  onClose,
  embedded = false,
}) => {
  const [selectedDataPoint, setSelectedDataPoint] = useState<QuarterlyCollaborationData | null>(null);

  // Generate comprehensive quarterly data for the past 8 quarters
  const generateQuarterlyData = (): QuarterlyCollaborationData[] => {
    const quarters = ['Q1', 'Q2', 'Q3', 'Q4'];
    
    const currentDate = new Date();
    const data: QuarterlyCollaborationData[] = [];
    
    for (let i = 7; i >= 0; i--) {
      const quarterIndex = Math.floor(i / 4);
      const quarterNum = (i % 4) + 1;
      const year = currentDate.getFullYear() - Math.floor(i / 4);
      const quarter = `Q${quarterNum}`;
      
      // Generate realistic collaboration data with trends
      const baseCollaborativeIdeas = 15 + Math.floor(Math.random() * 20);
      const totalIdeas = 40 + Math.floor(Math.random() * 30);
      const collaborationRate = Math.round((baseCollaborativeIdeas / totalIdeas) * 100);
      
      // Determine if this is a significant change
      const prevRate = data.length > 0 ? data[data.length - 1].collaborationRate : collaborationRate;
      const changePercentage = data.length > 0 ? collaborationRate - prevRate : 0;
      const significantChange = Math.abs(changePercentage) >= 8;
      
      let changeDirection: 'up' | 'down' | 'stable' = 'stable';
      if (changePercentage > 3) changeDirection = 'up';
      else if (changePercentage < -3) changeDirection = 'down';

      // Generate sample collaborative ideas with comments
      const ideaTemplates = [
        'AI-Powered Document Analysis',
        'Multi-Client Workflow Integration',
        'Cross-Platform Data Sync',
        'Collaborative Review Dashboard',
        'Unified Reporting System',
        'Smart Notification Engine',
        'Advanced Search Capabilities',
        'Real-time Collaboration Tools'
      ];

      const commentTemplates = [
        'Multiple clients have requested enhanced AI capabilities for document processing and analysis.',
        'Cross-client collaboration needed for workflow standardization across different organizations.',
        'Data synchronization requirements identified by several enterprise clients.',
        'Collaborative review features requested to improve multi-stakeholder decision making.',
        'Unified reporting system to consolidate data from multiple client environments.',
        'Smart notifications to improve cross-client communication and updates.',
        'Advanced search requested by clients dealing with large document repositories.',
        'Real-time collaboration tools for distributed teams across client organizations.'
      ];

      const topCollaborativeIdeas: CollaborativeIdea[] = Array.from({ length: Math.min(5, baseCollaborativeIdeas) }, (_, index) => ({
        id: `COLLAB-${year}-${quarter}-${String(index + 1).padStart(3, '0')}`,
        name: ideaTemplates[index % 8],
        originalSubmitter: ['Client A', 'Client B', 'Client C', 'Client D'][Math.floor(Math.random() * 4)],
        contributors: [
          'Client A', 'Client B', 'Client C', 'Client D', 'Client E', 'Client F'
        ].slice(0, 2 + Math.floor(Math.random() * 3)),
        submissionDate: new Date(year, (quarterNum - 1) * 3, 1).toISOString(),
        collaborationScore: 60 + Math.floor(Math.random() * 40),
        status: ['Active', 'Delivered', 'In Development'][Math.floor(Math.random() * 3)] as any,
        comments: commentTemplates[index % 8]
      }));

      data.push({
        quarter,
        year,
        collaborativeIdeas: baseCollaborativeIdeas,
        totalIdeas,
        collaborationRate,
        significantChange,
        changeDirection,
        changePercentage,
        topCollaborativeIdeas
      });
    }
    
    return data.reverse(); // Show chronological order
  };

  const quarterlyData = generateQuarterlyData();

  // Custom tooltip for the chart
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload as QuarterlyCollaborationData;
      return (
        <div className="bg-white p-4 shadow-lg rounded-lg border border-gray-200 min-w-[250px]">
          <p className="font-medium text-gray-900 mb-3">{`${data.quarter} ${data.year}`}</p>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Collaborative Ideas:</span>
              <span className="font-medium text-amber-600">{data.collaborativeIdeas}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Total Ideas:</span>
              <span className="font-medium text-gray-900">{data.totalIdeas}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Collaboration Rate:</span>
              <span className="font-medium text-blue-600">{data.collaborationRate}%</span>
            </div>
            {data.significantChange && (
              <div className="flex items-center justify-between text-sm pt-2 border-t border-gray-100">
                <span className="text-gray-600">Change:</span>
                <div className="flex items-center">
                  {data.changeDirection === 'up' ? (
                    <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
                  ) : data.changeDirection === 'down' ? (
                    <TrendingDown className="h-3 w-3 text-red-500 mr-1" />
                  ) : null}
                  <span className={`font-medium text-xs ${
                    data.changeDirection === 'up' ? 'text-green-600' : 
                    data.changeDirection === 'down' ? 'text-red-600' : 'text-gray-600'
                  }`}>
                    {data.changePercentage > 0 ? '+' : ''}{data.changePercentage}%
                  </span>
                </div>
              </div>
            )}
            {!embedded && (
            <div className="pt-2 border-t border-gray-100">
              <p className="text-xs text-gray-500">Click to view detailed metrics</p>
            </div>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  // Handle data point click
  const handleDataPointClick = (data: any) => {
    if (data && data.activePayload && data.activePayload[0]) {
      setSelectedDataPoint(data.activePayload[0].payload);
    }
  };

  // Format quarter labels for display
  const formatQuarterLabel = (quarter: string, year: number) => {
    return `${quarter} '${year.toString().slice(-2)}`;
  };

  // If embedded, render simplified version
  if (embedded) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100">
            <Users className="h-6 w-6 text-amber-600" />
          </div>
          <div className="ml-4">
            <h2 className="text-xl font-semibold text-gray-900">
              Cross-Client Collaboration Trend
            </h2>
            <div className="flex items-center mt-1">
              <HelpCircle className="h-4 w-4 text-gray-400 mr-2" />
              <p className="text-sm text-gray-600">
                Shows ideas that received contributions from multiple clients over time
              </p>
            </div>
          </div>
        </div>

        {/* Main Chart */}
        <div className="bg-gray-50 rounded-lg p-6">
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={quarterlyData}
                onClick={handleDataPointClick}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="quarter"
                  tickFormatter={(value, index) => {
                    const item = quarterlyData[index];
                    return formatQuarterLabel(value, item?.year || new Date().getFullYear());
                  }}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                />
                <YAxis 
                  domain={[0, 100]}
                  label={{ value: 'Collaboration Rate (%)', angle: -90, position: 'insideLeft' }}
                />
                <Tooltip content={<CustomTooltip />} />
                
                {/* Reference line for average */}
                <ReferenceLine 
                  y={Math.round(quarterlyData.reduce((sum, item) => sum + item.collaborationRate, 0) / quarterlyData.length)}
                  stroke="#6b7280"
                  strokeDasharray="5 5"
                  label={{ value: "Average", position: "topRight" }}
                />
                
                <Line
                  type="monotone"
                  dataKey="collaborationRate"
                  stroke="#f59e0b"
                  strokeWidth={3}
                  dot={(props: any) => {
                    const { cx, cy, payload } = props;
                    const isSignificant = payload.significantChange;
                    return (
                      <circle
                        cx={cx}
                        cy={cy}
                        r={isSignificant ? 8 : 5}
                        fill={isSignificant ? "#dc2626" : "#f59e0b"}
                        stroke={isSignificant ? "#fef2f2" : "#fff"}
                        strokeWidth={2}
                        className="cursor-pointer"
                      />
                    );
                  }}
                  activeDot={{ r: 10, stroke: '#f59e0b', strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 flex items-center justify-center space-x-6 text-sm text-gray-600">
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-amber-500 mr-2"></div>
              <span>Regular Data Point</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 rounded-full bg-red-600 mr-2"></div>
              <span>Significant Change (±8%)</span>
            </div>
          </div>
        </div>

        {/* Selected Data Point Details */}
        {selectedDataPoint && (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                {selectedDataPoint.quarter} {selectedDataPoint.year} - Detailed Metrics
              </h3>
              <button
                onClick={() => setSelectedDataPoint(null)}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Metrics Summary */}
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900">Collaboration Metrics</h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm text-gray-600">Collaborative Ideas</span>
                    <span className="font-medium text-amber-600">{selectedDataPoint.collaborativeIdeas}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm text-gray-600">Total Ideas</span>
                    <span className="font-medium text-gray-900">{selectedDataPoint.totalIdeas}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm text-gray-600">Collaboration Rate</span>
                    <span className="font-medium text-blue-600">{selectedDataPoint.collaborationRate}%</span>
                  </div>
                  {selectedDataPoint.significantChange && (
                    <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                      <span className="text-sm text-gray-600">Quarter-over-Quarter Change</span>
                      <div className="flex items-center">
                        {selectedDataPoint.changeDirection === 'up' ? (
                          <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                        ) : selectedDataPoint.changeDirection === 'down' ? (
                          <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
                        ) : null}
                        <span className={`font-medium ${
                          selectedDataPoint.changeDirection === 'up' ? 'text-green-600' : 
                          selectedDataPoint.changeDirection === 'down' ? 'text-red-600' : 'text-gray-600'
                        }`}>
                          {selectedDataPoint.changePercentage > 0 ? '+' : ''}{selectedDataPoint.changePercentage}%
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Top Collaborative Ideas Data Table */}
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900">Top Collaborative Ideas</h4>
                
                {/* Horizontal Metrics */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
                  <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Collaborative Ideas</span>
                      <span className="text-lg font-bold text-amber-600">{selectedDataPoint.collaborativeIdeas}</span>
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Total Ideas</span>
                      <span className="text-lg font-bold text-gray-900">{selectedDataPoint.totalIdeas}</span>
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Collaboration Rate</span>
                      <span className="text-lg font-bold text-blue-600">{selectedDataPoint.collaborationRate}%</span>
                    </div>
                  </div>
                  {selectedDataPoint.significantChange && (
                    <div className="bg-yellow-50 rounded-lg p-3 border border-yellow-200">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Quarter-over-Quarter Change</span>
                        <div className="flex items-center">
                          {selectedDataPoint.changeDirection === 'up' ? (
                            <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                          ) : selectedDataPoint.changeDirection === 'down' ? (
                            <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
                          ) : null}
                          <span className={`text-lg font-bold ${
                            selectedDataPoint.changeDirection === 'up' ? 'text-green-600' : 
                            selectedDataPoint.changeDirection === 'down' ? 'text-red-600' : 'text-gray-600'
                          }`}>
                            {selectedDataPoint.changePercentage > 0 ? '+' : ''}{selectedDataPoint.changePercentage}%
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="overflow-x-auto max-h-64 overflow-y-auto">
                    <table className="min-w-full bg-white border border-gray-200 rounded-lg">
                      <thead className="bg-gray-100 sticky top-0">
                        <tr>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-700 border-b border-gray-200">
                            Idea ID
                          </th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-700 border-b border-gray-200">
                            Idea Summary
                          </th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-700 border-b border-gray-200">
                            Idea Comments
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {selectedDataPoint.topCollaborativeIdeas.map((idea, index) => (
                          <tr key={idea.id} className="hover:bg-gray-50">
                            <td className="px-3 py-2 text-xs font-medium text-blue-600 border-r border-gray-200">
                              {idea.id}
                            </td>
                            <td className="px-3 py-2 text-xs text-gray-900 border-r border-gray-200">
                              <div className="max-w-[150px]">
                                <div className="font-medium">{idea.name}</div>
                                <div className={`text-xs px-2 py-1 rounded-full mt-1 inline-block ${
                                  idea.status === 'Delivered' ? 'bg-green-100 text-green-800' :
                                  idea.status === 'In Development' ? 'bg-blue-100 text-blue-800' :
                                  'bg-yellow-100 text-yellow-800'
                                }`}>
                                  {idea.status}
                                </div>
                              </div>
                            </td>
                            <td className="px-3 py-2 text-xs text-gray-700">
                              <div className="max-w-[200px]">
                                {idea.comments}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-gray-500 bg-opacity-75">
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative transform overflow-hidden rounded-lg bg-white w-full max-w-6xl shadow-xl" style={{ minWidth: '800px', maxHeight: '80vh' }}>
          <div className="bg-white px-6 py-4">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100">
                  <Users className="h-6 w-6 text-amber-600" />
                </div>
                <div className="ml-4">
                  <h2 className="text-2xl font-semibold text-gray-900">
                    Cross-Client Collaboration Trend
                  </h2>
                  <div className="flex items-center mt-1">
                    <HelpCircle className="h-4 w-4 text-gray-400 mr-2" />
                    <p className="text-sm text-gray-600">
                      Shows ideas that received contributions from multiple clients over time
                    </p>
                  </div>
                </div>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-500 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-6 max-h-[70vh] overflow-y-auto">
              {/* Main Chart */}
              <div className="bg-gray-50 rounded-lg p-6">
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={quarterlyData}
                      onClick={handleDataPointClick}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="quarter"
                        tickFormatter={(value, index) => {
                          const item = quarterlyData[index];
                          return formatQuarterLabel(value, item?.year || new Date().getFullYear());
                        }}
                        angle={-45}
                        textAnchor="end"
                        height={60}
                      />
                      <YAxis 
                        domain={[0, 100]}
                        label={{ value: 'Collaboration Rate (%)', angle: -90, position: 'insideLeft' }}
                      />
                      <Tooltip content={<CustomTooltip />} />
                      
                      {/* Reference line for average */}
                      <ReferenceLine 
                        y={Math.round(quarterlyData.reduce((sum, item) => sum + item.collaborationRate, 0) / quarterlyData.length)}
                        stroke="#6b7280"
                        strokeDasharray="5 5"
                        label={{ value: "Average", position: "topRight" }}
                      />
                      
                      <Line
                        type="monotone"
                        dataKey="collaborationRate"
                        stroke="#f59e0b"
                        strokeWidth={3}
                        dot={(props: any) => {
                          const { cx, cy, payload } = props;
                          const isSignificant = payload.significantChange;
                          return (
                            <circle
                              cx={cx}
                              cy={cy}
                              r={isSignificant ? 8 : 5}
                              fill={isSignificant ? "#dc2626" : "#f59e0b"}
                              stroke={isSignificant ? "#fef2f2" : "#fff"}
                              strokeWidth={2}
                              className="cursor-pointer"
                            />
                          );
                        }}
                        activeDot={{ r: 10, stroke: '#f59e0b', strokeWidth: 2 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-4 flex items-center justify-center space-x-6 text-sm text-gray-600">
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-amber-500 mr-2"></div>
                    <span>Regular Data Point</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-4 h-4 rounded-full bg-red-600 mr-2"></div>
                    <span>Significant Change (±8%)</span>
                  </div>
                </div>
              </div>

              {/* Selected Data Point Details */}
              {selectedDataPoint && (
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium text-gray-900">
                      {selectedDataPoint.quarter} {selectedDataPoint.year} - Detailed Metrics
                    </h3>
                    <button
                      onClick={() => setSelectedDataPoint(null)}
                      className="text-gray-400 hover:text-gray-500"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Metrics Summary */}
                    <div className="space-y-4">
                      <h4 className="font-medium text-gray-900">Collaboration Metrics</h4>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                          <span className="text-sm text-gray-600">Collaborative Ideas</span>
                          <span className="font-medium text-amber-600">{selectedDataPoint.collaborativeIdeas}</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                          <span className="text-sm text-gray-600">Total Ideas</span>
                          <span className="font-medium text-gray-900">{selectedDataPoint.totalIdeas}</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                          <span className="text-sm text-gray-600">Collaboration Rate</span>
                          <span className="font-medium text-blue-600">{selectedDataPoint.collaborationRate}%</span>
                        </div>
                        {selectedDataPoint.significantChange && (
                          <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                            <span className="text-sm text-gray-600">Quarter-over-Quarter Change</span>
                            <div className="flex items-center">
                              {selectedDataPoint.changeDirection === 'up' ? (
                                <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                              ) : selectedDataPoint.changeDirection === 'down' ? (
                                <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
                              ) : null}
                              <span className={`font-medium ${
                                selectedDataPoint.changeDirection === 'up' ? 'text-green-600' : 
                                selectedDataPoint.changeDirection === 'down' ? 'text-red-600' : 'text-gray-600'
                              }`}>
                                {selectedDataPoint.changePercentage > 0 ? '+' : ''}{selectedDataPoint.changePercentage}%
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Top Collaborative Ideas Data Table */}
                    <div className="space-y-4">
                      <h4 className="font-medium text-gray-900">Top Collaborative Ideas</h4>
                      
                      {/* Horizontal Metrics */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
                        <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Collaborative Ideas</span>
                            <span className="text-lg font-bold text-amber-600">{selectedDataPoint.collaborativeIdeas}</span>
                          </div>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Total Ideas</span>
                            <span className="text-lg font-bold text-gray-900">{selectedDataPoint.totalIdeas}</span>
                          </div>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Collaboration Rate</span>
                            <span className="text-lg font-bold text-blue-600">{selectedDataPoint.collaborationRate}%</span>
                          </div>
                        </div>
                        {selectedDataPoint.significantChange && (
                          <div className="bg-yellow-50 rounded-lg p-3 border border-yellow-200">
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-gray-600">Quarter-over-Quarter Change</span>
                              <div className="flex items-center">
                                {selectedDataPoint.changeDirection === 'up' ? (
                                  <TrendingUp className="h-
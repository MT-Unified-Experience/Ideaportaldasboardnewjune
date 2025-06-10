import React, { useState } from 'react';
import { Briefcase, X, HelpCircle } from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface CommitmentTrendsCardProps {
  value: { committed: number; total: number };
  tooltip?: string;
  commitmentTrends?: Array<{
    year: string;
    committed: number;
    delivered: number;
  }>;
  quarterlyDeliveries?: Array<{
    quarter: string;
    year: string;
    delivered: number;
  }>;
}

const CommitmentTrendsCard: React.FC<CommitmentTrendsCardProps> = ({ 
  value, 
  tooltip,
  commitmentTrends = [],
  quarterlyDeliveries = []
}) => {
  const [isOpen, setIsOpen] = useState(false);

  // Generate default data if none provided
  const defaultCommitmentTrends = [
    { year: '2020', committed: 45, delivered: 42 },
    { year: '2021', committed: 52, delivered: 48 },
    { year: '2022', committed: 48, delivered: 45 },
    { year: '2023', committed: 55, delivered: 52 },
    { year: '2024', committed: value.total, delivered: value.committed }
  ];

  const defaultQuarterlyDeliveries = [
    { quarter: 'Q1', year: '2023', delivered: 12 },
    { quarter: 'Q2', year: '2023', delivered: 15 },
    { quarter: 'Q3', year: '2023', delivered: 13 },
    { quarter: 'Q4', year: '2023', delivered: 12 },
    { quarter: 'Q1', year: '2024', delivered: 14 },
    { quarter: 'Q2', year: '2024', delivered: 16 },
    { quarter: 'Q3', year: '2024', delivered: 11 },
    { quarter: 'Q4', year: '2024', delivered: 13 }
  ];

  const chartData = commitmentTrends.length > 0 ? commitmentTrends : defaultCommitmentTrends;
  const quarterlyData = quarterlyDeliveries.length > 0 ? quarterlyDeliveries : defaultQuarterlyDeliveries;

  // Transform quarterly data for chart display
  const transformedQuarterlyData = quarterlyData.map(item => ({
    ...item,
    quarterLabel: `${item.quarter} ${item.year}`
  }));

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 shadow-lg rounded-lg border border-gray-200">
          <p className="font-medium text-gray-900 mb-2">{label}</p>
          <div className="space-y-1">
            {payload.map((entry: any, index: number) => (
              <div key={index} className="flex items-center justify-between text-sm">
                <span className="flex items-center">
                  <span
                    className="w-3 h-3 rounded-full mr-2"
                    style={{ backgroundColor: entry.color }}
                  />
                  {entry.name}:
                </span>
                <span className="ml-4 font-medium">{entry.value}</span>
              </div>
            ))}
          </div>
        </div>
      );
    }
    return null;
  };

  const CustomLegend = ({ payload }: any) => (
    <div className="flex justify-center gap-6 mt-4">
      {payload.map((entry: any, index: number) => (
        <div key={index} className="flex items-center">
          <span
            className="w-3 h-3 rounded-full mr-2"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-sm text-gray-600">{entry.value}</span>
        </div>
      ))}
    </div>
  );

  return (
    <>
      <div
        onClick={() => setIsOpen(true)}
        className="bg-white rounded-lg shadow-sm border border-gray-200 p-5 h-full transition-all duration-300 cursor-pointer hover:shadow-md hover:-translate-y-1"
      >
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-[13px] font-medium text-gray-500">Idea Portal Commitment</h3>
              {tooltip && (
                <div className="relative group">
                  <HelpCircle className="h-4 w-4 text-gray-400 hover:text-gray-600 cursor-help" />
                  <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-64 p-2 bg-gray-900 text-white text-xs rounded-md opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                    {tooltip}
                  </div>
                </div>
              )}
            </div>
            <div className="mt-1 flex items-baseline">
              <p className="text-2xl font-semibold text-gray-900">
                {value.committed}/{value.total}
              </p>
            </div>
            <p className="mt-1 text-xs text-gray-500">Total Planned Ideas Delivered to Date vs Annual Commitment</p>
          </div>
          <div className="p-2 rounded-full bg-purple-100">
            <Briefcase className="h-5 w-5 text-purple-600" />
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-gray-500 bg-opacity-75">
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="relative transform overflow-hidden rounded-lg bg-white w-full max-w-7xl shadow-xl">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100">
                      <Briefcase className="h-6 w-6 text-purple-600" />
                    </div>
                    <h2 className="text-2xl font-semibold text-gray-900 ml-4">
                      Commitment & Delivery Trends
                    </h2>
                  </div>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <X className="h-6 w-6 text-gray-500" />
                  </button>
                </div>

                <div className="space-y-6 max-h-[80vh] overflow-y-auto">
                  {/* Current Status Summary */}
                  <div className="bg-purple-50 rounded-lg p-6">
                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-center">
                        <div className="text-3xl font-bold text-purple-600">{value.committed}</div>
                        <div className="text-sm text-gray-600">Ideas Delivered</div>
                      </div>
                      <div className="text-center">
                        <div className="text-3xl font-bold text-gray-600">{value.total}</div>
                        <div className="text-sm text-gray-600">Annual Commitment</div>
                      </div>
                      <div className="text-center">
                        <div className="text-3xl font-bold text-blue-600">
                          {Math.round((value.committed / value.total) * 100)}%
                        </div>
                        <div className="text-sm text-gray-600">Progress</div>
                      </div>
                    </div>
                  </div>

                  {/* Annual Commitments vs Deliveries Chart */}
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">
                      Annual Commitments vs Deliveries (Past 5 Years)
                    </h3>
                    <div className="h-[350px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis 
                            dataKey="year"
                            label={{ value: 'Year', position: 'insideBottom', offset: -5 }}
                          />
                          <YAxis 
                            label={{ value: 'Number of Ideas', angle: -90, position: 'insideLeft' }}
                          />
                          <Tooltip content={<CustomTooltip />} />
                          <Legend content={<CustomLegend />} />
                          <Line
                            type="monotone"
                            dataKey="committed"
                            name="Total Committed Ideas"
                            stroke="#3b82f6"
                            strokeWidth={3}
                            dot={{ fill: '#3b82f6', r: 6 }}
                            activeDot={{ r: 8, stroke: '#3b82f6', strokeWidth: 2 }}
                          />
                          <Line
                            type="monotone"
                            dataKey="delivered"
                            name="Delivered Ideas"
                            stroke="#22c55e"
                            strokeWidth={3}
                            dot={{ fill: '#22c55e', r: 6 }}
                            activeDot={{ r: 8, stroke: '#22c55e', strokeWidth: 2 }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Quarterly Deliveries Chart */}
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">
                      Quarterly Idea Deliveries
                    </h3>
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={transformedQuarterlyData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis 
                            dataKey="quarterLabel"
                            angle={-45}
                            textAnchor="end"
                            height={60}
                            label={{ value: 'Quarter', position: 'insideBottom', offset: -5 }}
                          />
                          <YAxis 
                            label={{ value: 'Delivered Ideas', angle: -90, position: 'insideLeft' }}
                          />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: 'white',
                              border: '1px solid #ccc',
                              borderRadius: '4px',
                              boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
                            }}
                            formatter={(value: number) => [value, 'Delivered Ideas']}
                            labelFormatter={(label: string) => `Quarter: ${label}`}
                          />
                          <Line
                            type="monotone"
                            dataKey="delivered"
                            stroke="#22c55e"
                            strokeWidth={3}
                            dot={{ fill: '#22c55e', r: 5 }}
                            activeDot={{ r: 7, stroke: '#22c55e', strokeWidth: 2 }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Performance Summary */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white rounded-lg p-6 border border-gray-200">
                      <h4 className="text-lg font-medium text-gray-900 mb-4">5-Year Summary</h4>
                      <div className="space-y-3">
                        {chartData.map((item, index) => {
                          const deliveryRate = Math.round((item.delivered / item.committed) * 100);
                          return (
                            <div key={item.year} className="flex items-center justify-between">
                              <span className="text-sm text-gray-600">{item.year}</span>
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-medium text-gray-900">
                                  {item.delivered}/{item.committed}
                                </span>
                                <span className={`text-xs px-2 py-1 rounded-full ${
                                  deliveryRate >= 90 ? 'bg-green-100 text-green-800' :
                                  deliveryRate >= 80 ? 'bg-yellow-100 text-yellow-800' :
                                  'bg-red-100 text-red-800'
                                }`}>
                                  {deliveryRate}%
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div className="bg-white rounded-lg p-6 border border-gray-200">
                      <h4 className="text-lg font-medium text-gray-900 mb-4">Key Metrics</h4>
                      <div className="space-y-4">
                        <div>
                          <div className="text-2xl font-bold text-purple-600">
                            {Math.round(chartData.reduce((sum, item) => sum + (item.delivered / item.committed), 0) / chartData.length * 100)}%
                          </div>
                          <div className="text-sm text-gray-600">Average Delivery Rate</div>
                        </div>
                        <div>
                          <div className="text-2xl font-bold text-blue-600">
                            {Math.round(quarterlyData.reduce((sum, item) => sum + item.delivered, 0) / quarterlyData.length)}
                          </div>
                          <div className="text-sm text-gray-600">Avg Quarterly Deliveries</div>
                        </div>
                        <div>
                          <div className="text-2xl font-bold text-green-600">
                            {chartData[chartData.length - 1]?.delivered || 0}
                          </div>
                          <div className="text-sm text-gray-600">Current Year Delivered</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Insights */}
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-3">
                      Key Insights
                    </h3>
                    <div className="space-y-2 text-sm text-gray-600">
                      <p>
                        • Blue line shows total ideas committed annually, representing planning targets
                      </p>
                      <p>
                        • Green line shows actual deliveries, indicating execution performance
                      </p>
                      <p>
                        • Quarterly view helps identify seasonal patterns and delivery consistency
                      </p>
                      <p>
                        • Target delivery rate is typically 85% or higher for optimal commitment fulfillment
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CommitmentTrendsCard;
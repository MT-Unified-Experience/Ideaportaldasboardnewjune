import React, { useState } from 'react';
import { Briefcase, X, HelpCircle, Upload } from 'lucide-react';
import ExportToPdfButton from '../common/ExportToPdfButton';
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

import { useData } from '../../contexts/DataContext';

interface CommitmentTrendsCardProps {
  value: { committed: number; total: number };
  tooltip?: string;
  commitmentTrends?: Array<{
    year: string;
    committed: number;
    delivered: number;
    ideas?: Array<{
      id: string;
      summary: string;
    }>;
  }>;
  quarterlyDeliveries?: Array<{
    quarter: string;
    year: string;
    delivered: number;
    ideas?: Array<{
      id: string;
      summary: string;
    }>;
  }>;
}

const CommitmentTrendsCard: React.FC<CommitmentTrendsCardProps> = ({ 
  value, 
  tooltip,
  commitmentTrends = [],
  quarterlyDeliveries = []
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const modalContentRef = React.useRef<HTMLDivElement>(null);
  const [selectedDataPoint, setSelectedDataPoint] = useState<{
    type: 'annual' | 'quarterly';
    label: string;
    ideas: Array<{ id: string; summary: string }>;
  } | null>(null);
  const { uploadCommitmentTrendsCSV, isLoading } = useData();
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);

  // Generate default data if none provided
  const defaultCommitmentTrends = [
    { year: '2020', committed: 45, delivered: 42, ideas: [] },
    { year: '2021', committed: 52, delivered: 48, ideas: [] },
    { year: '2022', committed: 48, delivered: 45, ideas: [] },
    { year: '2023', committed: 55, delivered: 52, ideas: [] },
    { year: '2024', committed: value.total, delivered: value.committed, ideas: [] }
  ];

  const defaultQuarterlyDeliveries = [
    { quarter: 'Q1', year: '2023', delivered: 12, ideas: [] },
    { quarter: 'Q2', year: '2023', delivered: 15, ideas: [] },
    { quarter: 'Q3', year: '2023', delivered: 13, ideas: [] },
    { quarter: 'Q4', year: '2023', delivered: 12, ideas: [] },
    { quarter: 'Q1', year: '2024', delivered: 14, ideas: [] },
    { quarter: 'Q2', year: '2024', delivered: 16, ideas: [] },
    { quarter: 'Q3', year: '2024', delivered: 11, ideas: [] },
    { quarter: 'Q4', year: '2024', delivered: 13, ideas: [] }
  ];

  const chartData = commitmentTrends.length > 0 ? commitmentTrends : defaultCommitmentTrends;
  const quarterlyData = quarterlyDeliveries.length > 0 ? quarterlyDeliveries : defaultQuarterlyDeliveries;

  // Transform quarterly data for chart display
  const transformedQuarterlyData = quarterlyData.map(item => ({
    ...item,
    quarterLabel: `${item.quarter} ${item.year}`
  }));

  // Generate sample ideas for data points if none provided
  const generateIdeasForDataPoint = (type: 'annual' | 'quarterly', label: string, count: number) => {
    const ideaTemplates = [
      'AI-Powered Document Analysis',
      'Mobile App Enhancement',
      'Reporting Dashboard Improvements',
      'API Integration Updates',
      'Custom Workflow Builder',
      'Document Management System',
      'Search Functionality Enhancement',
      'Bulk Actions Feature',
      'Dashboard Customization',
      'Email Integration',
      'Advanced Analytics',
      'Multi-language Support',
      'Real-time Notifications',
      'Data Export Enhancements',
      'User Permission Management',
      'Automated Workflow Templates',
      'Integration with Third-party Tools',
      'Mobile Responsive Design',
      'Advanced Search Filters',
      'Audit Trail Improvements'
    ];

    return Array.from({ length: count }, (_, index) => ({
      id: `${type === 'annual' ? 'ANN' : 'QTR'}-${label.replace(/\s+/g, '')}-${String(index + 1).padStart(3, '0')}`,
      summary: ideaTemplates[index % ideaTemplates.length]
    }));
  };

  // Handle chart clicks
  const handleAnnualChartClick = (data: any) => {
    if (data && data.activePayload && data.activePayload[0]) {
      const payload = data.activePayload[0].payload;
      const year = payload.year;
      const delivered = payload.delivered;
      const ideas = payload.ideas || [];
      
      setSelectedDataPoint({
        type: 'annual',
        label: `${year} Delivered Ideas`,
        ideas: ideas.length > 0 ? ideas : generateIdeasForDataPoint('annual', year, delivered)
      });
    }
  };

  const handleQuarterlyChartClick = (data: any) => {
    if (data && data.activePayload && data.activePayload[0]) {
      const payload = data.activePayload[0].payload;
      const quarterLabel = payload.quarterLabel;
      const delivered = payload.delivered;
      const ideas = payload.ideas || [];
      
      setSelectedDataPoint({
        type: 'quarterly',
        label: `${quarterLabel} Delivered Ideas`,
        ideas: ideas.length > 0 ? ideas : generateIdeasForDataPoint('quarterly', quarterLabel, delivered)
      });
    }
  };

  // Handle commitment trends CSV upload
  const handleCommitmentTrendsUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setUploadStatus('Uploading...');
      await uploadCommitmentTrendsCSV(file);
      setUploadStatus('Upload successful!');
      
      // Clear the file input
      event.target.value = '';
      
      // Clear success message after 3 seconds
      setTimeout(() => setUploadStatus(null), 3000);
    } catch (error) {
      setUploadStatus('Upload failed. Please check the file format.');
      setTimeout(() => setUploadStatus(null), 5000);
    }
  };

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
        <div className="fixed inset-y-0 right-0 w-full md:w-[800px] bg-white shadow-xl z-50 overflow-y-auto transform transition-transform duration-300 ease-in-out">
          <div ref={modalContentRef} className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100">
                      <Briefcase className="h-6 w-6 text-purple-600" />
                    </div>
                    <h2 className="text-2xl font-semibold text-gray-900 ml-4">
                      Idea Portal Commitment Trends
                    </h2>
                  </div>
                  <div className="flex items-center gap-3">
                    <ExportToPdfButton 
                      targetRef={modalContentRef}
                      filename="Commitment_Trends_Analysis"
                      size="sm"
                    />
                    <button
                      onClick={() => setIsOpen(false)}
                      className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                      <X className="h-6 w-6 text-gray-500" />
                    </button>
                  </div>
                </div>

                <div className="space-y-6 max-h-[80vh] overflow-y-auto">
                  {/* CSV Upload Section */}
                  <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                    <h4 className="text-md font-medium text-purple-900 mb-2">Upload Commitment Trends CSV</h4>
                    <p className="text-sm text-purple-700 mb-3">
                      Upload a CSV file containing annual commitment and delivery data with columns: year, committed, delivered, quarter (optional), quarterly_delivered (optional), idea_id (optional), idea_summary (optional).
                    </p>
                    <div className="flex items-center gap-3">
                      <input
                        type="file"
                        accept=".csv"
                        onChange={handleCommitmentTrendsUpload}
                        className="hidden"
                        id="commitment-trends-csv-upload"
                        disabled={isLoading}
                      />
                      <label
                        htmlFor="commitment-trends-csv-upload"
                        className={`inline-flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors cursor-pointer ${
                          isLoading 
                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                            : 'bg-purple-600 text-white hover:bg-purple-700'
                        }`}
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        {isLoading ? 'Uploading...' : 'Upload Commitment CSV'}
                      </label>
                      {uploadStatus && (
                        <span className={`text-sm ${
                          uploadStatus.includes('successful') ? 'text-green-600' : 
                          uploadStatus.includes('failed') ? 'text-red-600' : 'text-purple-600'
                        }`}>
                          {uploadStatus}
                        </span>
                      )}
                    </div>
                    <div className="mt-2 text-xs text-purple-600">
                      <a 
                        href="data:text/csv;charset=utf-8,year,committed,delivered,quarter,quarterly_delivered,idea_id,idea_summary%0A2020,45,42,Q1,12,COMM-2020-001,AI%20Integration%0A2021,52,48,Q2,15,COMM-2021-001,Mobile%20App%0A2022,48,45,Q3,13,COMM-2022-001,Reporting%20Tools%0A2023,55,52,Q4,12,COMM-2023-001,API%20Enhancements%0A2024,60,57,Q1,14,COMM-2024-001,Custom%20Workflows"
                        download="commitment_trends_template.csv"
                        className="hover:underline"
                      >
                        Download sample CSV template
                      </a>
                    </div>
                  </div>

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
                        <LineChart data={chartData} onClick={handleAnnualChartClick}>
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
                            activeDot={{ 
                              r: 8, 
                              stroke: '#3b82f6', 
                              strokeWidth: 2,
                              style: { cursor: 'pointer' }
                            }}
                          />
                          <Line
                            type="monotone"
                            dataKey="delivered"
                            name="Delivered Ideas"
                            stroke="#22c55e"
                            strokeWidth={3}
                            dot={{ fill: '#22c55e', r: 6 }}
                            activeDot={{ 
                              r: 8, 
                              stroke: '#22c55e', 
                              strokeWidth: 2,
                              onClick: handleAnnualChartClick,
                              style: { cursor: 'pointer' }
                            }}
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
                        <LineChart data={transformedQuarterlyData} onClick={handleQuarterlyChartClick}>
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
                            activeDot={{ 
                              r: 7, 
                              stroke: '#22c55e', 
                              strokeWidth: 2,
                              onClick: handleQuarterlyChartClick,
                              style: { cursor: 'pointer' }
                            }}
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

                  {/* Ideas Data Table */}
                  {selectedDataPoint && (
                    <div className="bg-white rounded-lg border border-gray-200 p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-medium text-gray-900">
                          {selectedDataPoint.label}
                        </h3>
                        <button
                          onClick={() => setSelectedDataPoint(null)}
                          className="text-gray-400 hover:text-gray-500"
                        >
                          <X className="h-5 w-5" />
                        </button>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="overflow-x-auto">
                          <table className="min-w-full bg-white border border-gray-200 rounded-lg">
                            <thead className="bg-gray-100">
                              <tr>
                                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 border-b border-gray-200">
                                  Idea ID
                                </th>
                                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 border-b border-gray-200">
                                  Idea Summary Title
                                </th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                              {selectedDataPoint.ideas.map((idea, index) => (
                                <tr key={index} className="hover:bg-gray-50">
                                  <td className="px-4 py-3 text-sm font-medium text-blue-600 border-r border-gray-200">
                                    {idea.id}
                                  </td>
                                  <td className="px-4 py-3 text-sm text-gray-900">
                                    {idea.summary}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  )}

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
                      <p>
                        • Click on any data point in the charts to view the specific ideas delivered for that period
                      </p>
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
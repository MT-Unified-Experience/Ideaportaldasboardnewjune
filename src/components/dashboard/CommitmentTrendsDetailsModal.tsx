import React, { useState } from 'react';
import { X, Upload } from 'lucide-react';
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

interface CommitmentTrendsDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  value: { committed: number; total: number; commitmentStatus?: 'On Track' | 'Off Track' | 'At Risk' };
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

const CommitmentTrendsDetailsModal: React.FC<CommitmentTrendsDetailsModalProps> = ({
  isOpen,
  onClose,
  value,
  commitmentTrends = [],
  quarterlyDeliveries = []
}) => {
  const modalContentRef = React.useRef<HTMLDivElement>(null);
  const [selectedDataPoint, setSelectedDataPoint] = useState<{
    type: 'annual' | 'quarterly';
    label: string;
    ideas: Array<{ id: string; summary: string }>;
  } | null>(null);
  const { uploadCommitmentTrendsCSV, isLoading } = useData();
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);

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
        ideas: ideas
      });
    }
  };

  const handleQuarterlyChartClick = (data: any) => {
    if (data && data.activePayload && data.activePayload[0]) {
      const payload = data.activePayload[0].payload;
      const quarterLabel = `${payload.quarter} ${payload.year}`;
      const ideas = payload.ideas || [];
      
      setSelectedDataPoint({
        type: 'quarterly',
        label: `${quarterLabel} Delivered Ideas`,
        ideas: ideas
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 w-full md:w-[800px] bg-white shadow-xl z-50 overflow-y-auto transform transition-transform duration-300 ease-in-out">
      <div ref={modalContentRef} className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100">
              <svg className="h-6 w-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h2 className="text-2xl font-semibold text-gray-900 ml-4">
              Idea Portal Commitment Trends
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="h-6 w-6 text-gray-500" />
          </button>
        </div>

        <div className="space-y-6 max-h-[80vh] overflow-y-auto">
          {/* CSV Upload Section */}
          <div className="p-4">
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
            <div className="mt-3 text-xs text-purple-600">
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
          {commitmentTrends && commitmentTrends.length > 0 ? (
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Annual Commitments vs Deliveries
              </h3>
              <div className="h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={commitmentTrends} onClick={handleAnnualChartClick}>
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
          ) : (
            <div className="bg-gray-50 rounded-lg p-6 text-center">
              <div className="text-gray-500 mb-4">
                <div className="text-lg font-medium">No Annual Commitment Data Available</div>
                <p className="text-sm mt-2">Upload a CSV file above to view annual commitment trends and detailed analytics.</p>
              </div>
            </div>
          )}

          {/* Quarterly Deliveries Chart */}
          {quarterlyDeliveries && quarterlyDeliveries.length > 0 ? (
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Quarterly Idea Deliveries
              </h3>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={quarterlyDeliveries} onClick={handleQuarterlyChartClick}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="quarter"
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
          ) : (
            <div className="bg-gray-50 rounded-lg p-6 text-center">
              <div className="text-gray-500 mb-4">
                <div className="text-lg font-medium">No Quarterly Delivery Data Available</div>
                <p className="text-sm mt-2">Upload a CSV file above to view quarterly delivery trends.</p>
              </div>
            </div>
          )}

          {/* Ideas Data Table */}
          {selectedDataPoint && selectedDataPoint.ideas.length > 0 && (
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

        </div>
      </div>
    </div>
  );
};

export default CommitmentTrendsDetailsModal;
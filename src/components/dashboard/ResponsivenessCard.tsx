import React, { useState } from 'react';
import { TrendingUp, X, HelpCircle, Upload, Users } from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { LineChartData, Feature, Quarter } from '../../types';
import { useData } from '../../contexts/DataContext';

interface ResponsivenessCardProps {
  value: number;
  tooltip?: string;
  currentQuarter: Quarter;
  quarterlyData?: Array<{
    quarter: string;
    percentage: number;
    totalIdeas: number;
    ideasMovedOutOfReview: number;
    ideasList?: string[];
  }>;
}

const ResponsivenessCard: React.FC<ResponsivenessCardProps> = ({ 
  value, 
  tooltip,
  currentQuarter,
  quarterlyData = []
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const modalContentRef = React.useRef<HTMLDivElement>(null);
  const [selectedQuarterIdeas, setSelectedQuarterIdeas] = useState<string[] | null>(null);
  const [selectedQuarterName, setSelectedQuarterName] = useState<string | null>(null);
  const { uploadResponsivenessTrendCSV, isLoading } = useData();
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);

  // Helper function to get the past four quarters based on current quarter
  const getPastFourQuarters = (currentQuarter: Quarter): string[] => {
    const quarterMap: { [key: string]: string[] } = {
      'FY25 Q1': ['FY24 Q2', 'FY24 Q3', 'FY24 Q4', 'FY25 Q1'],
      'FY25 Q2': ['FY24 Q3', 'FY24 Q4', 'FY25 Q1', 'FY25 Q2'],
      'FY25 Q3': ['FY24 Q4', 'FY25 Q1', 'FY25 Q2', 'FY25 Q3'],
      'FY25 Q4': ['FY25 Q1', 'FY25 Q2', 'FY25 Q3', 'FY25 Q4'],
      'FY26 Q1': ['FY25 Q2', 'FY25 Q3', 'FY25 Q4', 'FY26 Q1']
    };
    return quarterMap[currentQuarter] || ['FY25 Q1', 'FY25 Q2', 'FY25 Q3', 'FY25 Q4'];
  };

  // Filter quarterly data to show only the past four quarters
  const pastFourQuarters = getPastFourQuarters(currentQuarter);
  const filteredChartData = quarterlyData.filter(item => 
    pastFourQuarters.includes(item.quarter)
  ).sort((a, b) => {
    // Sort by the order in pastFourQuarters array
    return pastFourQuarters.indexOf(a.quarter) - pastFourQuarters.indexOf(b.quarter);
  });

  // Handle data point click
  const handleDataPointClick = (data: any) => {
    if (data && data.activePayload && data.activePayload[0]) {
      const quarterData = data.activePayload[0].payload;
      setSelectedQuarterIdeas(quarterData.ideasList || []);
      setSelectedQuarterName(quarterData.quarter);
    }
  };

  // Format quarter labels for display
  const formatQuarterLabel = (quarter: string) => {
    // Return the quarter as-is since it's already in the correct FYXX QX format
    return quarter;
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 shadow-lg rounded-lg border border-gray-200">
          <p className="font-medium text-gray-900 mb-2">{formatQuarterLabel(label)}</p>
          <div className="space-y-1">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Responsiveness:</span>
              <span className="font-medium text-blue-600">{data.percentage}%</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Ideas Moved Out of Review:</span>
              <span className="font-medium text-green-600">{data.ideasMovedOutOfReview || Math.round(data.totalIdeas * data.percentage / 100)}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Total Ideas:</span>
              <span className="font-medium text-gray-900">{data.totalIdeas}</span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  // Handle responsiveness trend CSV upload
  const handleResponsivenessTrendUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setUploadStatus('Uploading...');
      await uploadResponsivenessTrendCSV(file);
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

  return (
    <>
      <div
        onClick={() => setIsOpen(true)}
        className="bg-white rounded-lg shadow-sm border border-gray-200 p-5 h-full transition-all duration-300 cursor-pointer hover:shadow-md hover:-translate-y-1"
      >
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-[13px] font-medium text-gray-500">Responsiveness</h3>
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
              <p className="text-2xl font-semibold text-gray-900">{value}%</p>
            </div>
            <p className="mt-1 text-xs text-gray-500">Ideas responded to with a status update within 2 weeks of client submissions</p>
          </div>
          <div className="p-2 rounded-full bg-blue-100">
            <TrendingUp className="h-5 w-5 text-blue-600" />
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="fixed inset-y-0 right-0 w-full md:w-[700px] bg-white shadow-xl z-50 overflow-y-auto transform transition-transform duration-300 ease-in-out">
          <div ref={modalContentRef} className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                  <TrendingUp className="h-6 w-6 text-blue-600" />
                </div>
                <h2 className="text-2xl font-semibold text-gray-900 ml-4">
                  Responsiveness Trend
                </h2>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="h-6 w-6 text-gray-500" />
              </button>
            </div>

            <div className="space-y-6">
              {/* CSV Upload Section */}
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <h4 className="text-md font-medium text-blue-900 mb-2">Upload Responsiveness Trend CSV</h4>
                <p className="text-sm text-blue-700 mb-3">
                  Upload a CSV file containing quarterly responsiveness data with columns: quarter, percentage, total_ideas, ideas_moved_out_of_review, ideas_list (optional).
                </p>
                <div className="flex items-center gap-3">
                  <input
                    type="file"
                    accept=".csv"
                    onChange={handleResponsivenessTrendUpload}
                    className="hidden"
                    id="responsiveness-trend-csv-upload"
                    disabled={isLoading}
                  />
                  <label
                    htmlFor="responsiveness-trend-csv-upload"
                    className={`inline-flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors cursor-pointer ${
                      isLoading 
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    {isLoading ? 'Uploading...' : 'Upload Responsiveness CSV'}
                  </label>
                  {uploadStatus && (
                    <span className={`text-sm ${
                      uploadStatus.includes('successful') ? 'text-green-600' : 
                      uploadStatus.includes('failed') ? 'text-red-600' : 'text-blue-600'
                    }`}>
                      {uploadStatus}
                    </span>
                  )}
                </div>
                <div className="mt-2 text-xs text-blue-600">
                  <a 
                    href="data:text/csv;charset=utf-8,quarter,percentage,total_ideas,ideas_moved_out_of_review,ideas_list%0AFY25%20Q1,82,45,37,%22AI%20Integration,Mobile%20App,Reporting%20Tools%22%0AFY25%20Q2,78,52,41,%22API%20Enhancements,Custom%20Workflows,Document%20Management%22%0AFY25%20Q3,85,38,32,%22Search%20Improvements,Bulk%20Actions,Dashboard%20Customization%22%0AFY25%20Q4,95,41,39,%22Email%20Integration,Advanced%20Analytics,Performance%20Optimization%22"
                    download="responsiveness_trend_template.csv"
                    className="hover:underline"
                  >
                    Download sample CSV template
                  </a>
                </div>
              </div>

              {/* Current Quarter Summary */}
              {filteredChartData.length > 0 && (
                <div className="bg-blue-50 rounded-lg p-6">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-blue-600">{value}%</div>
                      <div className="text-sm text-gray-600">Current Quarter</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-green-600">
                        {filteredChartData[filteredChartData.length - 1]?.ideasMovedOutOfReview || Math.round((filteredChartData[filteredChartData.length - 1]?.totalIdeas || 0) * value / 100)}
                      </div>
                      <div className="text-sm text-gray-600">Ideas Moved Out of Review</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-gray-600">
                        {filteredChartData[filteredChartData.length - 1]?.totalIdeas || 0}
                      </div>
                      <div className="text-sm text-gray-600">Total Ideas</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Trend Chart */}
              {filteredChartData.length > 0 ? (
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Quarterly Performance Trend (Past 4 Quarters)
                  </h3>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={filteredChartData} onClick={handleDataPointClick}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                          dataKey="quarter" 
                          tickFormatter={formatQuarterLabel}
                          angle={-45}
                          textAnchor="end"
                          height={60}
                        />
                        <YAxis 
                          domain={[0, 100]}
                          label={{ value: 'Responsiveness %', angle: -90, position: 'insideLeft' }}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Line
                          type="monotone"
                          dataKey="percentage"
                          stroke="#3b82f6"
                          strokeWidth={3}
                          dot={{ fill: '#3b82f6', r: 6 }}
                          activeDot={{ 
                            r: 8, 
                            stroke: '#3b82f6', 
                            strokeWidth: 2,
                            onClick: handleDataPointClick,
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
                    <div className="text-lg font-medium">No Responsiveness Data Available</div>
                    <p className="text-sm mt-2">Upload a CSV file above to view quarterly responsiveness trends and detailed analytics.</p>
                  </div>
                </div>
              )}

              {/* Quarterly Breakdown */}
              {filteredChartData.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    Quarterly Breakdown (Past 4 Quarters)
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    {filteredChartData.map((item, index) => {
                      const isCurrentQuarter = item.quarter === currentQuarter;
                      const prevItem = index > 0 ? filteredChartData[index - 1] : null;
                      const change = prevItem ? item.percentage - prevItem.percentage : 0;
                      
                      return (
                        <div
                          key={item.quarter}
                          className={`p-4 rounded-lg border cursor-pointer hover:shadow-lg transition-all ${
                            isCurrentQuarter 
                              ? 'bg-blue-50 border-blue-200' 
                              : 'bg-white border-gray-200'
                          }`}
                          onClick={() => {
                            setSelectedQuarterIdeas(item.ideasList || []);
                            setSelectedQuarterName(item.quarter);
                          }}
                        >
                          <div className="text-center">
                            <h4 className="font-medium text-gray-900 mb-2">
                              {formatQuarterLabel(item.quarter)}
                            </h4>
                            <div className="text-2xl font-bold text-gray-900 mb-2">
                              {item.percentage}%
                            </div>
                            {prevItem && (
                              <div className={`text-sm font-medium mb-2 ${
                                change > 0 ? 'text-green-600' : change < 0 ? 'text-red-600' : 'text-gray-500'
                              }`}>
                                {change > 0 ? '+' : ''}{change.toFixed(1)}% vs prev
                              </div>
                            )}
                            <p className="text-sm text-gray-600">
                              {item.ideasMovedOutOfReview || Math.round(item.totalIdeas * item.percentage / 100)} of {item.totalIdeas} ideas moved out of review
                            </p>
                            {isCurrentQuarter && (
                              <span className="mt-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                Current
                              </span>
                            )}
                            <div className="mt-2 text-xs text-blue-600 font-medium">
                              Click to view ideas
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Ideas List for Selected Quarter */}
              {selectedQuarterIdeas && selectedQuarterIdeas.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium text-gray-900">
                      {formatQuarterLabel(selectedQuarterName || '')} - Ideas Moved Out of Review
                    </h3>
                    <button
                      onClick={() => {
                        setSelectedQuarterIdeas(null);
                        setSelectedQuarterName(null);
                      }}
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
                          {selectedQuarterIdeas.map((idea, index) => (
                            <tr key={index} className="hover:bg-gray-50">
                              <td className="px-4 py-3 text-sm font-medium text-blue-600 border-r border-gray-200">
                                ID-{String(index + 1).padStart(3, '0')}
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-900">
                                {idea}
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
              {filteredChartData.length > 0 && (
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-3">
                    Key Insights
                  </h3>
                  <div className="space-y-2 text-sm text-gray-600">
                    <p>
                      • Responsiveness measures the percentage of ideas that moved out of the "Need Review" stage after client submission
                    </p>
                    <p>
                      • Higher percentages indicate better engagement and faster feedback loops with clients
                    </p>
                    <p>
                      • Target responsiveness rate is typically 85% or higher for optimal client satisfaction
                    </p>
                    <p>
                      • The chart shows the past 4 quarters relative to the selected quarter: {pastFourQuarters.map(formatQuarterLabel).join(', ')}
                    </p>
                    <p>
                      • Click on any data point in the chart to view the specific ideas that moved out of review for that quarter
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ResponsivenessCard;
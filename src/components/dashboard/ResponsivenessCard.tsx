import React, { useState } from 'react';
import { TrendingUp, X, HelpCircle } from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface ResponsivenessCardProps {
  value: number;
  tooltip?: string;
  quarterlyData?: Array<{
    quarter: string;
    percentage: number;
    totalIdeas: number;
    ideasMovedOutOfReview: number;
  }>;
}

const ResponsivenessCard: React.FC<ResponsivenessCardProps> = ({ 
  value, 
  tooltip,
  quarterlyData = []
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedQuarterIdeas, setSelectedQuarterIdeas] = useState<string[] | null>(null);
  const [selectedQuarterName, setSelectedQuarterName] = useState<string | null>(null);

  // Generate default quarterly data if none provided
  const defaultQuarterlyData = [
    { 
      quarter: 'FY25 Q1', 
      percentage: 82, 
      totalIdeas: 45, 
      ideasMovedOutOfReview: 37,
      ideasList: [
        'AI-Powered Document Analysis',
        'Mobile App Enhancement',
        'Reporting Dashboard Improvements',
        'API Integration Updates',
        'Custom Workflow Builder',
        'Document Management System',
        'Search Functionality Enhancement',
        'Bulk Actions Feature',
        'Dashboard Customization',
        'Email Integration'
      ]
    },
    { 
      quarter: 'FY25 Q2', 
      percentage: 78, 
      totalIdeas: 52, 
      ideasMovedOutOfReview: 41,
      ideasList: [
        'Advanced Analytics Dashboard',
        'Multi-language Support',
        'Real-time Notifications',
        'Data Export Enhancements',
        'User Permission Management',
        'Automated Workflow Templates',
        'Integration with Third-party Tools',
        'Mobile Responsive Design',
        'Advanced Search Filters',
        'Audit Trail Improvements'
      ]
    },
    { 
      quarter: 'FY25 Q3', 
      percentage: 85, 
      totalIdeas: 38, 
      ideasMovedOutOfReview: 32,
      ideasList: [
        'Cloud Storage Integration',
        'Enhanced Security Features',
        'Performance Optimization',
        'Custom Report Builder',
        'Collaboration Tools',
        'Version Control System',
        'Automated Backup Solutions',
        'Single Sign-On (SSO)',
        'Advanced User Analytics',
        'Mobile App Offline Mode'
      ]
    },
    { 
      quarter: 'FY25 Q4', 
      percentage: value, 
      totalIdeas: 41, 
      ideasMovedOutOfReview: Math.round(41 * value / 100),
      ideasList: [
        'Machine Learning Integration',
        'Advanced Data Visualization',
        'Cross-platform Synchronization',
        'Enhanced Mobile Features',
        'Automated Testing Framework',
        'Real-time Collaboration',
        'Advanced Security Protocols',
        'Custom Integration APIs',
        'Enhanced User Experience',
        'Performance Monitoring Tools'
      ]
    }
  ];

  const chartData = quarterlyData.length > 0 ? quarterlyData : defaultQuarterlyData;

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
    const match = quarter.match(/FY(\d+)\s+Q(\d+)/);
    if (match) {
      const year = `20${match[1]}`;
      return `Q${match[2]} ${year}`;
    }
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
            <p className="mt-1 text-xs text-gray-500">Ideas responded to with a status update after client submissions</p>
          </div>
          <div className="p-2 rounded-full bg-blue-100">
            <TrendingUp className="h-5 w-5 text-blue-600" />
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="fixed inset-y-0 right-0 w-full md:w-[700px] bg-white shadow-xl z-50 overflow-y-auto transform transition-transform duration-300 ease-in-out">
          <div className="p-6">
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
              {/* Current Quarter Summary */}
              <div className="bg-blue-50 rounded-lg p-6">
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600">{value}%</div>
                    <div className="text-sm text-gray-600">Current Quarter</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600">
                      {chartData[chartData.length - 1]?.ideasMovedOutOfReview || Math.round((chartData[chartData.length - 1]?.totalIdeas || 0) * value / 100)}
                    </div>
                    <div className="text-sm text-gray-600">Ideas Moved Out of Review</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-gray-600">
                      {chartData[chartData.length - 1]?.totalIdeas || 0}
                    </div>
                    <div className="text-sm text-gray-600">Total Ideas</div>
                  </div>
                </div>
              </div>

              {/* Trend Chart */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Quarterly Performance Trend
                </h3>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData} onClick={handleDataPointClick}>
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

              {/* Quarterly Breakdown */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Quarterly Breakdown
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {chartData.map((item, index) => {
                    const isCurrentQuarter = index === chartData.length - 1;
                    const prevItem = index > 0 ? chartData[index - 1] : null;
                    const change = prevItem ? item.percentage - prevItem.percentage : 0;
                    
                    return (
                      <div
                        key={item.quarter}
                        className={`p-4 rounded-lg border ${
                          isCurrentQuarter 
                            ? 'bg-blue-50 border-blue-200' 
                            : 'bg-white border-gray-200'
                        }`}
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
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

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
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {selectedQuarterIdeas.map((idea, index) => (
                        <div
                          key={index}
                          className="flex items-center p-3 bg-white rounded-lg shadow-sm border border-gray-200"
                        >
                          <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                            <span className="text-sm font-medium text-blue-600">
                              {index + 1}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {idea}
                            </p>
                          </div>
                        </div>
                      ))}
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
                    • Responsiveness measures the percentage of ideas that moved out of the "Need Review" stage after client submission
                  </p>
                  <p>
                    • Higher percentages indicate better engagement and faster feedback loops with clients
                  </p>
                  <p>
                    • Target responsiveness rate is typically 85% or higher for optimal client satisfaction
                  </p>
                  <p>
                    • The metric shows both the number of ideas that progressed and the total ideas submitted for context
                  </p>
                  <p>
                    • Click on any data point in the chart to view the specific ideas that moved out of review for that quarter
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

export default ResponsivenessCard;
import React, { useState } from 'react';
import { RefreshCw, X, HelpCircle, CheckCircle, Clock } from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface ContinuedEngagementCardProps {
  value: number;
  numerator: number;
  denominator: number;
  tooltip?: string;
  ideas?: Array<{
    id: string;
    name: string;
    initialStatusChange: string;
    subsequentChanges: Array<{
      date: string;
      status: string;
    }>;
    daysBetween: number;
    included: boolean;
  }>;
  quarterlyTrends?: Array<{
    quarter: string;
    rate: number;
    numerator: number;
    denominator: number;
  }>;
}

const ContinuedEngagementCard: React.FC<ContinuedEngagementCardProps> = ({ 
  value, 
  numerator, 
  denominator, 
  tooltip,
  ideas = [],
  quarterlyTrends = []
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'trend' | 'included' | 'excluded'>('trend');
  const [selectedQuarterIdeas, setSelectedQuarterIdeas] = useState<Array<{ id: string; summary: string }> | null>(null);
  const [selectedQuarterName, setSelectedQuarterName] = useState<string | null>(null);

  // Generate default quarterly trends if none provided
  const defaultQuarterlyTrends = [
    { quarter: 'FY25 Q1', rate: 72, numerator: 18, denominator: 25 },
    { quarter: 'FY25 Q2', rate: 68, numerator: 17, denominator: 25 },
    { quarter: 'FY25 Q3', rate: 75, numerator: 21, denominator: 28 },
    { quarter: 'FY25 Q4', rate: value, numerator: numerator, denominator: denominator }
  ];

  const chartData = quarterlyTrends.length > 0 ? quarterlyTrends : defaultQuarterlyTrends;

  const includedIdeas = ideas.filter(idea => idea.included);
  const excludedIdeas = ideas.filter(idea => !idea.included);

  // Generate sample ideas for each quarter
  const generateIdeasForQuarter = (quarter: string, count: number) => {
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
    ];

    return Array.from({ length: count }, (_, index) => ({
      id: `ENG-${quarter.replace(/\s+/g, '')}-${String(index + 1).padStart(3, '0')}`,
      summary: ideaTemplates[index % ideaTemplates.length]
    }));
  };

  // Handle chart data point click
  const handleChartClick = (data: any) => {
    if (data && data.activePayload && data.activePayload[0]) {
      const quarterData = data.activePayload[0].payload;
      const quarter = quarterData.quarter;
      const numerator = quarterData.numerator;
      
      setSelectedQuarterIdeas(generateIdeasForQuarter(quarter, numerator));
      setSelectedQuarterName(quarter);
    }
  };

  // Handle quarterly breakdown box click
  const handleQuarterBoxClick = (quarter: string, numerator: number) => {
    setSelectedQuarterIdeas(generateIdeasForQuarter(quarter, numerator));
    setSelectedQuarterName(quarter);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  // Format quarter labels for display
  const formatQuarterLabel = (quarter: string) => {
    const match = quarter.match(/FY(\d+)\s+Q(\d+)/);
    if (match) {
      return `Q${match[2]}`;
    }
    return quarter;
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 shadow-lg rounded-lg border border-gray-200">
          <p className="font-medium text-gray-900 mb-2">{label}</p>
          <div className="space-y-1">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Engagement Rate:</span>
              <span className="font-medium text-green-600">{data.rate}%</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Ideas with Follow-up:</span>
              <span className="font-medium text-gray-900">{data.numerator}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Total Reviewed:</span>
              <span className="font-medium text-gray-900">{data.denominator}</span>
            </div>
            <div className="pt-2 border-t border-gray-100">
              <p className="text-xs text-gray-500">Click to view ideas with follow-up</p>
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
              <h3 className="text-[13px] font-medium text-gray-500">Continued Engagement Rate</h3>
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
            <p className="mt-1 text-xs text-gray-500">% of reviewed ideas updated again within 90 days</p>
            <p className="mt-2 text-xs text-gray-400">{numerator} of {denominator} ideas</p>
          </div>
          <div className="p-2 rounded-full bg-green-100">
            <RefreshCw className="h-5 w-5 text-green-600" />
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="fixed inset-y-0 right-0 w-full md:w-[700px] bg-white shadow-xl z-50 overflow-y-auto">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
                  <RefreshCw className="h-6 w-6 text-green-600" />
                </div>
                <h2 className="text-2xl font-semibold text-gray-900 ml-4">
                  Continued Engagement Rate
                </h2>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="h-6 w-6 text-gray-500" />
              </button>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200 mb-6">
              <nav className="-mb-px flex space-x-8">
                <button
                  onClick={() => setActiveTab('trend')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'trend'
                      ? 'border-green-500 text-green-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Quarterly Trends
                  </div>
                </button>
                <button
                  onClick={() => setActiveTab('included')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'included'
                      ? 'border-green-500 text-green-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Ideas with Follow-up ({includedIdeas.length})
                  </div>
                </button>
                <button
                  onClick={() => setActiveTab('excluded')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'excluded'
                      ? 'border-gray-500 text-gray-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-2" />
                    Ideas without Follow-up ({excludedIdeas.length})
                  </div>
                </button>
              </nav>
            </div>

            <div className="space-y-6">
              {/* Quarterly Trends Tab */}
              {activeTab === 'trend' && (
                <div>
                  {/* Current Quarter Summary */}
                  <div className="bg-green-50 rounded-lg p-6 mb-6">
                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-center">
                        <div className="text-3xl font-bold text-green-600">{value}%</div>
                        <div className="text-sm text-gray-600">Current Quarter Rate</div>
                      </div>
                      <div className="text-center">
                        <div className="text-3xl font-bold text-blue-600">{numerator}</div>
                        <div className="text-sm text-gray-600">Ideas with Follow-up</div>
                      </div>
                      <div className="text-center">
                        <div className="text-3xl font-bold text-gray-600">{denominator}</div>
                        <div className="text-sm text-gray-600">Total Reviewed</div>
                      </div>
                    </div>
                  </div>

                  {/* Trend Chart */}
                  <div className="bg-gray-50 rounded-lg p-6 mb-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">
                      FY25 Quarterly Engagement Trends
                    </h3>
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartData} onClick={handleChartClick}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis 
                            dataKey="quarter" 
                            tickFormatter={formatQuarterLabel}
                          />
                          <YAxis 
                            domain={[0, 100]}
                            label={{ value: 'Engagement Rate %', angle: -90, position: 'insideLeft' }}
                          />
                          <Tooltip content={<CustomTooltip />} />
                          <Line
                            type="monotone"
                            dataKey="rate"
                            stroke="#22c55e"
                            strokeWidth={3}
                            dot={{ fill: '#22c55e', r: 6 }}
                            activeDot={{ 
                              r: 8, 
                              stroke: '#22c55e', 
                              strokeWidth: 2,
                              onClick: handleChartClick,
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
                    <div className="grid gap-3">
                      {chartData.map((item, index) => {
                        const isCurrentQuarter = index === chartData.length - 1;
                        const prevItem = index > 0 ? chartData[index - 1] : null;
                        const change = prevItem ? item.rate - prevItem.rate : 0;
                        
                        return (
                          <div
                            key={item.quarter}
                            onClick={() => handleQuarterBoxClick(item.quarter, item.numerator)}
                            className={`p-4 rounded-lg border ${
                              isCurrentQuarter 
                                ? 'bg-green-50 border-green-200' 
                                : 'bg-white border-gray-200'
                            } cursor-pointer hover:shadow-md transition-all duration-200`}
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <h4 className="font-medium text-gray-900">
                                  {item.quarter}
                                  {isCurrentQuarter && (
                                    <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                      Current
                                    </span>
                                  )}
                                </h4>
                                <p className="text-sm text-gray-600 mt-1">
                                  {item.numerator} of {item.denominator} ideas had follow-up
                                </p>
                                <p className="text-xs text-blue-600 font-medium mt-1">
                                  Click to view ideas with follow-up
                                </p>
                              </div>
                              <div className="text-right">
                                <div className="text-2xl font-bold text-gray-900">
                                  {item.rate}%
                                </div>
                                {prevItem && (
                                  <div className={`text-sm font-medium ${
                                    change > 0 ? 'text-green-600' : change < 0 ? 'text-red-600' : 'text-gray-500'
                                  }`}>
                                    {change > 0 ? '+' : ''}{change.toFixed(1)}% vs prev
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Ideas Data Table */}
                  {selectedQuarterIdeas && selectedQuarterIdeas.length > 0 && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-medium text-gray-900">
                          {selectedQuarterName} - Ideas with Follow-up
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

                  {/* Calculation Details */}
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-3">
                      Calculation Details
                    </h3>
                    <div className="text-sm text-gray-600 space-y-2">
                      <p>
                        <strong>Formula:</strong> (Ideas with follow-up ÷ Total reviewed ideas) × 100
                      </p>
                      <p>
                        <strong>Follow-up criteria:</strong> Ideas that received at least one additional status update 
                        within 90 days after being moved out of "Needs Review\" status.
                      </p>
                      <p>
                        <strong>Purpose:</strong> This metric helps track whether ideas continue progressing through the pipeline 
                        after initial review, indicating sustained engagement and follow-through.
                      </p>
                      <p>
                        <strong>Interaction:</strong> Click on any data point in the chart or quarterly breakdown boxes 
                        to view the specific ideas that had follow-up for that quarter.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Ideas with Follow-up Tab */}
              {activeTab === 'included' && (
                <div className="space-y-3">
                  {includedIdeas.length > 0 ? (
                    includedIdeas.map((idea) => (
                      <div
                        key={idea.id}
                        className="bg-white rounded-lg p-4 shadow-sm border border-gray-200"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900 mb-2">{idea.name}</h4>
                            <div className="text-sm text-gray-600 space-y-1">
                              <p>
                                <span className="font-medium">Initial change:</span> {formatDate(idea.initialStatusChange)}
                              </p>
                              <p>
                                <span className="font-medium">Follow-up changes:</span>
                              </p>
                              <div className="ml-4 space-y-1">
                                {idea.subsequentChanges.map((change, index) => (
                                  <div key={index} className="flex items-center text-xs">
                                    <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
                                    {formatDate(change.date)} - {change.status}
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                          <div className="ml-4 text-right">
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              {idea.daysBetween} days
                            </span>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      No ideas with follow-up changes found
                    </div>
                  )}
                </div>
              )}

              {/* Ideas without Follow-up Tab */}
              {activeTab === 'excluded' && (
                <div className="space-y-3">
                  {excludedIdeas.length > 0 ? (
                    excludedIdeas.map((idea) => (
                      <div
                        key={idea.id}
                        className="bg-white rounded-lg p-4 shadow-sm border border-gray-200"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900 mb-2">{idea.name}</h4>
                            <div className="text-sm text-gray-600">
                              <p>
                                <span className="font-medium">Initial change:</span> {formatDate(idea.initialStatusChange)}
                              </p>
                              <p className="text-gray-500 mt-1">
                                No additional status changes within 90 days
                              </p>
                            </div>
                          </div>
                          <div className="ml-4 text-right">
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                              No follow-up
                            </span>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      All reviewed ideas had follow-up changes
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ContinuedEngagementCard;
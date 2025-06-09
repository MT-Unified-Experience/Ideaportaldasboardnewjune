import React, { useState, useEffect } from 'react';
import { X, HelpCircle, BarChart2, Users, Clock, LineChart as LineChartIcon } from 'lucide-react';
import { DashboardData } from '../../types';
import { useData } from '../../contexts/DataContext';

interface DashboardManagementProps {
  isOpen: boolean;
  onClose: () => void;
}

const DashboardManagement: React.FC<DashboardManagementProps> = ({ isOpen, onClose }) => {
  const { dashboardData, updateDashboardData, isLoading } = useData();
  const { currentProduct, currentQuarter } = useData();
  const [formData, setFormData] = useState<DashboardData>(dashboardData || {} as DashboardData);
  const [activeTab, setActiveTab] = useState('metrics');
  const expectedYears = ['FY22', 'FY23', 'FY24', 'FY25'];
  
  const tooltips = {
    responsiveness: "Measures how quickly Mitratech responds to client ideas. A higher percentage indicates better engagement and faster feedback loops with clients.",
    roadmapAlignment: "Shows cumulative progress towards the yearly planning goal by tracking the total number of ideas committed versus the annual target.",
    crossClientCollaboration: "Indicates the percentage of ideas that benefit multiple clients, highlighting opportunities for shared solutions.",
    agingIdeas: "Tracks ideas that have been in Candidate status for over 90 days, helping identify potential bottlenecks in the review process.",
    distribution: "Shows the distribution of ideas across different statuses by year",
    submissions: "Tracks client submission trends over time",
    features: "Manages top requested features and their details"
  };

  const tabs = [
    { id: 'metrics', name: 'Key Metrics', icon: BarChart2 },
    { id: 'distribution', name: 'Idea Status Distribution by Year', icon: Users },
    { id: 'submissions', name: 'Client Submissions by Quarter', icon: LineChartIcon },
    { id: 'features', name: 'Top 10 Requested Features', icon: Clock },
    { id: 'forums', name: 'Data Socialization Forums', icon: Users }
  ];

  useEffect(() => {
    if (dashboardData) {
      // Ensure all expected years are present in stackedBarData
      const updatedStackedBarData = expectedYears.map(year => {
        const existingData = dashboardData.stackedBarData.find(item => item.year === year);
        return existingData || {
          year,
          candidateIdeas: 0,
          inDevelopment: 0,
          archivedIdeas: 0,
          flaggedForFuture: 0
        };
      });

      setFormData({
        ...dashboardData,
        stackedBarData: updatedStackedBarData
      });
    }
  }, [dashboardData]);

  const handleStackedBarDataChange = (index: number, field: string, value: number) => {
    setFormData(prev => ({
      ...prev,
      stackedBarData: (prev.stackedBarData || []).map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      )
    }));
  };

  const handleLineChartDataChange = (index: number, value: number) => {
    const quarters = ['FY25 Q1', 'FY25 Q2', 'FY25 Q3', 'FY25 Q4'];
    const quarter = quarters[index];
    
    setFormData(prev => ({
      ...prev,
      lineChartData: [
        ...prev.lineChartData.filter(item => item.quarter !== quarter),
        { quarter, clientsRepresenting: value }
      ].sort((a, b) => {
        const getQuarterNum = (str: string) => parseInt(str.slice(-1));
        return getQuarterNum(a.quarter) - getQuarterNum(b.quarter);
      })
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateDashboardData(formData);
      onClose();
    } catch (error) {
      console.error('Error updating dashboard:', error);
    }
  };

  const handleMetricChange = (field: string, value: number | object) => {
    if (typeof value === 'object') {
      setFormData(prev => ({
        ...prev,
        metricSummary: {
          ...prev.metricSummary,
          [field]: {
            ...prev.metricSummary[field],
            ...value
          }
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        metricSummary: {
          ...prev.metricSummary,
          [field]: value
        }
      }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-gray-500 bg-opacity-75">
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative transform overflow-hidden rounded-lg bg-white w-full max-w-4xl">
          <form onSubmit={handleSubmit}>
            <div className="px-6 py-4">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">
                  Edit {currentProduct} - {currentQuarter} Metrics
                </h2>
                <button
                  type="button"
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

            {/* Tabs */}
            <div className="border-b border-gray-200 mb-6">
              <nav className="-mb-px flex space-x-6">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setActiveTab(tab.id)}
                      className={`
                        flex items-center px-3 py-4 text-sm font-medium border-b-2 whitespace-normal text-left min-w-[150px]
                        ${activeTab === tab.id
                          ? 'border-blue-500 text-blue-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
                      `}
                    >
                      <Icon className="h-4 w-4 mr-2" />
                      <span className="line-clamp-2">{tab.name}</span>
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Tab Content */}
            <div className="space-y-6 max-h-[60vh] overflow-y-auto">
              {/* Key Metrics Tab */}
              {activeTab === 'metrics' && (
                <div>
                {/* Responsiveness */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="relative group">
                      <HelpCircle className="h-4 w-4 text-gray-400 hover:text-gray-600 cursor-help" />
                      <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-64 p-2 bg-gray-900 text-white text-xs rounded-md opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                        {tooltips.responsiveness}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="w-full">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Responsiveness (%)
                      </label>
                      <input
                        type="number"
                        value={formData.metricSummary?.responsiveness || 0}
                        onChange={(e) => handleMetricChange('responsiveness', Number(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div className="w-full">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Trend (%)
                      </label>
                      <input
                        type="number"
                        value={formData.metricSummary?.responsivenessTrend || 0}
                        onChange={(e) => handleMetricChange('responsivenessTrend', Number(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Roadmap Alignment */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-4">
                    <h3 className="text-sm font-medium text-gray-700">
                      Idea Portal Commitment
                    </h3>
                    <div className="relative group">
                      <HelpCircle className="h-4 w-4 text-gray-400 hover:text-gray-600 cursor-help" />
                      <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-64 p-2 bg-gray-900 text-white text-xs rounded-md opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                        {tooltips.roadmapAlignment}
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mt-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Total Ideas Committed
                      </label>
                      <input
                        type="number"
                        value={formData.metricSummary?.roadmapAlignment?.committed || 0}
                        onChange={(e) => handleMetricChange('roadmapAlignment', { committed: Number(e.target.value) })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Annual Target
                      </label>
                      <input
                        type="number"
                        value={formData.metricSummary?.roadmapAlignment?.total || 0}
                        onChange={(e) => handleMetricChange('roadmapAlignment', { total: Number(e.target.value) })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Cross-Client Collaboration */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Cross-Client Collaboration (%)
                    </label>
                    <div className="relative group">
                      <HelpCircle className="h-4 w-4 text-gray-400 hover:text-gray-600 cursor-help" />
                      <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-64 p-2 bg-gray-900 text-white text-xs rounded-md opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                        {tooltips.crossClientCollaboration}
                      </div>
                    </div>
                  </div>
                  <input
                    type="number"
                    value={formData.metricSummary?.crossClientCollaboration || 0}
                    onChange={(e) => handleMetricChange('crossClientCollaboration', Number(e.target.value))} 
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <div className="mt-4 space-y-4">
                    {['FY25 Q1', 'FY25 Q2', 'FY25 Q3', 'FY25 Q4'].map((quarter, index) => (
                      <div key={quarter} className="bg-gray-50 p-4 rounded-lg">
                        <div className="flex items-center gap-4">
                          <h4 className="text-sm font-medium text-gray-700 w-24 flex-shrink-0">{quarter}</h4>
                          <div className="w-[107px] flex-shrink-0">
                            <label className="block text-sm font-medium text-gray-700 mb-1 whitespace-nowrap">
                              Collaboration Rate (%)
                            </label>
                            <input
                              type="number"
                              value={(formData.metricSummary?.collaborationTrends || [])[index]?.rate || 0} 
                              onChange={(e) => {
                                setFormData(prev => {
                                  const newTrends = Array.from({ length: 4 }, (_, i) => ({
                                    rate: (prev.metricSummary?.collaborationTrends || [])[i]?.rate || 0,
                                    clientName: (prev.metricSummary?.collaborationTrends || [])[i]?.clientName || ''
                                  }));
                                  newTrends[index] = { ...(newTrends[index] || {}), rate: Number(e.target.value) };
                                  return {
                                    ...prev,
                                    metricSummary: { ...prev.metricSummary, collaborationTrends: newTrends }
                                  };
                                });
                              }}
                              className="w-[107px] px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 text-sm"
                            />
                          </div>
                          <div className="w-[250px] ml-[80px]">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Client Name
                            </label>
                            <input
                              type="text"
                              value={(formData.metricSummary?.collaborationTrends || [])[index]?.clientName || ''}
                              onChange={(e) => {
                                setFormData(prev => {
                                  const newTrends = Array.from({ length: 4 }, (_, i) => ({
                                    rate: (prev.metricSummary?.collaborationTrends || [])[i]?.rate || 0,
                                    clientName: (prev.metricSummary?.collaborationTrends || [])[i]?.clientName || ''
                                  }));
                                  newTrends[index] = { ...(newTrends[index] || {}), clientName: e.target.value };
                                  return {
                                    ...prev,
                                    metricSummary: { ...prev.metricSummary, collaborationTrends: newTrends }
                                  };
                                });
                              }}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 text-sm" 
                              placeholder="Enter client name"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Continued Engagement */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-4">
                    <h3 className="text-sm font-medium text-gray-700">
                      Continued Engagement Rate
                    </h3>
                    <div className="relative group">
                      <HelpCircle className="h-4 w-4 text-gray-400 hover:text-gray-600 cursor-help" />
                      <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-64 p-2 bg-gray-900 text-white text-xs rounded-md opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                        Percentage of ideas that received at least one additional status update within 90 days after being moved out of 'Needs Review'
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4 mt-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Rate (%)
                      </label>
                      <input
                        type="number"
                        value={formData.metricSummary?.continuedEngagement?.rate || 0}
                        onChange={(e) => handleMetricChange('continuedEngagement', { rate: Number(e.target.value) })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Ideas with Follow-up
                      </label>
                      <input
                        type="number"
                        value={formData.metricSummary?.continuedEngagement?.numerator || 0}
                        onChange={(e) => handleMetricChange('continuedEngagement', { numerator: Number(e.target.value) })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Total Reviewed Ideas
                      </label>
                      <input
                        type="number"
                        value={formData.metricSummary?.continuedEngagement?.denominator || 0}
                        onChange={(e) => handleMetricChange('continuedEngagement', { denominator: Number(e.target.value) })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Aging Ideas */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Aging Ideas Count
                    </label>
                    <div className="relative group">
                      <HelpCircle className="h-4 w-4 text-gray-400 hover:text-gray-600 cursor-help" />
                      <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-64 p-2 bg-gray-900 text-white text-xs rounded-md opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                        {tooltips.agingIdeas}
                      </div>
                    </div>
                  </div>
                  <input
                    type="number"
                    value={formData.metricSummary?.agingIdeas?.count || 0}
                    onChange={(e) => handleMetricChange('agingIdeas', { count: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <div className="mt-4 space-y-4">
                    {['FY25 Q1', 'FY25 Q2', 'FY25 Q3', 'FY25 Q4'].map((quarter, index) => (
                      <div key={quarter} className="bg-gray-50 p-4 rounded-lg">
                        <div className="flex items-center gap-4">
                          <h4 className="text-sm font-medium text-gray-700 w-24 flex-shrink-0">{quarter}</h4>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Aging Ideas Count
                            </label>
                            <input
                              type="number"
                              value={(formData.metricSummary?.agingIdeas?.trend || [])[index]?.count || 0}
                              onChange={(e) => {
                                setFormData(prev => {
                                  const newTrend = Array.from({ length: 4 }, (_, i) => ({
                                    quarter: ['FY25 Q1', 'FY25 Q2', 'FY25 Q3', 'FY25 Q4'][i],
                                    count: (prev.metricSummary?.agingIdeas?.trend || [])[i]?.count || 0
                                  }));
                                  newTrend[index] = { ...newTrend[index], count: Number(e.target.value) };
                                  return {
                                    ...prev,
                                    metricSummary: {
                                      ...prev.metricSummary,
                                      agingIdeas: {
                                        ...prev.metricSummary?.agingIdeas,
                                        trend: newTrend
                                      }
                                    }
                                  };
                                });
                              }}
                              className="w-32 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 text-sm"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                </div>
              )}

              {/* Distribution Tab */}
              {activeTab === 'distribution' && (
                <div className="space-y-6">
                  {(formData.stackedBarData || expectedYears.map(year => ({
                    year,
                    candidateIdeas: 0,
                    inDevelopment: 0,
                    archivedIdeas: 0,
                    flaggedForFuture: 0
                  }))).map((item, index) => (
                    <div key={index} className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="text-sm font-medium text-gray-700 mb-4">{item.year}</h4>
                      <div className="flex flex-wrap gap-4 mb-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Candidate Ideas
                          </label>
                          <input
                            type="number"
                            value={item.candidateIdeas}
                            onChange={(e) => handleStackedBarDataChange(index, 'candidateIdeas', Number(e.target.value))}
                            className="w-32 px-3 py-2 border border-gray-300 rounded-md"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            In Development
                          </label>
                          <input
                            type="number"
                            value={item.inDevelopment}
                            onChange={(e) => handleStackedBarDataChange(index, 'inDevelopment', Number(e.target.value))}
                            className="w-32 px-3 py-2 border border-gray-300 rounded-md"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Archived
                          </label>
                          <input
                            type="number"
                            value={item.archivedIdeas}
                            onChange={(e) => handleStackedBarDataChange(index, 'archivedIdeas', Number(e.target.value))}
                            className="w-32 px-3 py-2 border border-gray-300 rounded-md"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Flagged for Future
                          </label>
                          <input
                            type="number"
                            value={item.flaggedForFuture}
                            onChange={(e) => handleStackedBarDataChange(index, 'flaggedForFuture', Number(e.target.value))}
                            className="w-32 px-3 py-2 border border-gray-300 rounded-md"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Submissions Tab */}
              {activeTab === 'submissions' && (
                <div className="space-y-6">
                  <div className="space-y-4">
                    {['FY25 Q1', 'FY25 Q2', 'FY25 Q3', 'FY25 Q4'].map((quarter, index) => {
                      const item = formData.lineChartData.find(d => d.quarter === quarter) || {
                        quarter,
                        clientsRepresenting: 0,
                        clients: []
                      };
                      return (
                      <div key={index} className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="text-sm font-medium text-gray-700 mb-4">{item.quarter}</h4>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Number of Clients
                            </label>
                            <input
                              type="number"
                              value={item.clientsRepresenting}
                              onChange={(e) => handleLineChartDataChange(index, Number(e.target.value))}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Client Names (separate with semicolon)
                            </label>
                            <input
                              type="text"
                              value={(item.clients || []).join('; ')}
                              onChange={(e) => {
                                const newLineChartData = [...formData.lineChartData];
                                const itemIndex = newLineChartData.findIndex(d => d.quarter === quarter);
                                const clients = e.target.value.split(';').map(s => s.trim()).filter(Boolean);
                                if (itemIndex >= 0) {
                                  newLineChartData[itemIndex] = { ...item, clients };
                                } else {
                                  newLineChartData.push({ ...item, clients });
                                }
                                setFormData({ ...formData, lineChartData: newLineChartData });
                              }}
                              placeholder="Client A; Client B; Client C"
                              className="w-full px-3 py-2 border border-gray-300 rounded-md"
                            />
                          </div>
                        </div>
                      </div>
                    )})}
                  </div>
                </div>
              )}

              {/* Features Tab */}
              {activeTab === 'features' && (
                <div className="space-y-6">
                  {Array.from({ length: 10 }).map((_, index) => {
                    const feature = formData.topFeatures[index] || {
                      feature_name: '',
                      vote_count: 0,
                      status: 'Under Review' as const,
                      status_updated_at: new Date().toISOString(),
                      client_voters: []
                    };
                    return (
                    <div key={index} className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="text-sm font-medium text-gray-700 mb-4">
                        Feature #{index + 1}
                      </h4>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Feature Name
                          </label>
                          <input
                            type="text"
                            value={feature.feature_name}
                            onChange={(e) => {
                              const newFeatures = [...formData.topFeatures];
                              newFeatures[index] = { ...feature, feature_name: e.target.value };
                              setFormData({ ...formData, topFeatures: newFeatures });
                            }}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Vote Count
                            </label>
                            <input
                              type="number"
                              value={feature.vote_count}
                              onChange={(e) => {
                                const newFeatures = [...formData.topFeatures];
                                newFeatures[index] = { ...feature, vote_count: Number(e.target.value) };
                                setFormData({ ...formData, topFeatures: newFeatures });
                              }}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Status
                            </label>
                            <select
                              value={feature.status}
                              onChange={(e) => {
                                const newFeatures = [...formData.topFeatures];
                                newFeatures[index] = { 
                                  ...feature, 
                                  status: e.target.value as 'Delivered' | 'Under Review' | 'Committed'
                                };
                                setFormData({ ...formData, topFeatures: newFeatures });
                              }}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md"
                            >
                              <option value="Under Review">Under Review</option>
                              <option value="Committed">Committed</option>
                              <option value="Delivered">Delivered</option>
                            </select>
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Contributing Clients (separate with semicolon)
                          </label>
                          <input
                            type="text"
                            value={feature.client_voters.join('; ')}
                            onChange={(e) => {
                              const newFeatures = [...formData.topFeatures];
                              newFeatures[index] = {
                                ...feature,
                                client_voters: e.target.value.split(';').map(s => s.trim()).filter(Boolean)
                              };
                              setFormData({ ...formData, topFeatures: newFeatures });
                            }}
                            placeholder="Client A; Client B; Client C"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md"
                          />
                        </div>
                      </div>
                    </div>
                    );
                  })}
                </div>
              )}

              {/* Forums Tab */}
              {activeTab === 'forums' && (
                <div className="space-y-6">
                  {(formData.data_socialization_forums || [
                    { name: 'CSC' },
                    { name: 'Sprint Reviews' },
                    { name: 'Customer Advisory Board (CAB)' },
                    { name: 'CWG' },
                    { name: 'Quarterly Product Reviews (QBRs)' }
                  ]).map((forum, index) => (
                    <div key={index} className="bg-gray-50 p-4 rounded-lg">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Forum Name
                        </label>
                        <input
                          type="text"
                          value={forum.name}
                          onChange={(e) => {
                            const newForums = [...(formData.data_socialization_forums || [
                              { name: 'CSC' },
                              { name: 'Sprint Reviews' },
                              { name: 'Customer Advisory Board (CAB)' },
                              { name: 'CWG' },
                              { name: 'Quarterly Product Reviews (QBRs)' }
                            ])];
                            newForums[index] = { 
                              name: e.target.value 
                            };
                            setFormData({ ...formData, data_socialization_forums: newForums });
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        />
                      </div>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => {
                      const newForums = [...(formData.data_socialization_forums || [
                        { name: 'CSC' },
                        { name: 'Sprint Reviews' },
                        { name: 'Customer Advisory Board (CAB)' },
                        { name: 'CWG' },
                        { name: 'Quarterly Product Reviews (QBRs)' }
                      ])];
                      newForums.push({ name: '' });
                      setFormData({ ...formData, data_socialization_forums: newForums });
                    }}
                    className="w-full px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    Add Forum
                  </button>
                </div>
              )}

            </div>

            <div className="bg-gray-50 px-6 py-4 flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default DashboardManagement;

export default DashboardManagement
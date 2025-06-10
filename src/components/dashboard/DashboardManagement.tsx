import React, { useState, useEffect } from 'react';
import { X, HelpCircle, BarChart2, Users, Clock, LineChart as LineChartIcon } from 'lucide-react';
import { DashboardData } from '../../types';
import { useData } from '../../contexts/DataContext';

interface WidgetSettings {
  responsiveness: boolean;
  commitment: boolean;
  continuedEngagement: boolean;
  ideaDistribution: boolean;
  clientSubmissions: boolean;
  topFeatures: boolean;
  dataSocialization: boolean;
}

interface DashboardManagementProps {
  isOpen: boolean;
  onClose: () => void;
  widgetSettings: WidgetSettings;
}

type Quarter = 'FY25 Q1' | 'FY25 Q2' | 'FY25 Q3' | 'FY25 Q4';

const DashboardManagement: React.FC<DashboardManagementProps> = ({ isOpen, onClose, widgetSettings }) => {
  const { dashboardData, updateDashboardData, isLoading } = useData();
  const { currentProduct, currentQuarter } = useData();
  const [formData, setFormData] = useState<DashboardData>(dashboardData || {} as DashboardData);
  const [activeTab, setActiveTab] = useState('metrics');
  const [featuresSubTab, setFeaturesSubTab] = useState<'current' | 'previous'>('current');
  const expectedYears = ['FY22', 'FY23', 'FY24', 'FY25'];
  
  const tooltips = {
    responsiveness: "Measures how quickly Mitratech responds to client ideas. A higher percentage indicates better engagement and faster feedback loops with clients.",
    roadmapAlignment: "Shows cumulative progress towards the yearly planning goal by tracking the total number of ideas committed versus the annual target.",
    continuedEngagement: "Percentage of ideas that received at least one additional status update within 90 days after being moved out of 'Needs Review'",
    ideaVolume: "Tracks the number of ideas submitted and processed during the quarter",
    distribution: "Shows the distribution of ideas across different statuses by year",
    submissions: "Tracks client submission trends over time",
    features: "Manages top requested features and their details"
  };

  // Filter tabs based on widget settings
  const allTabs = [
    { 
      id: 'metrics', 
      name: 'Key Metrics', 
      icon: BarChart2,
      visible: widgetSettings.responsiveness || widgetSettings.commitment || widgetSettings.continuedEngagement
    },
    { 
      id: 'distribution', 
      name: 'Idea Status Distribution by Year', 
      icon: Users,
      visible: widgetSettings.ideaDistribution
    },
    { 
      id: 'submissions', 
      name: 'Client Submissions by Quarter', 
      icon: LineChartIcon,
      visible: widgetSettings.clientSubmissions
    },
    { 
      id: 'features', 
      name: 'Top 10 Features (Current & Previous Quarter)', 
      icon: Clock,
      visible: widgetSettings.topFeatures
    },
    { 
      id: 'forums', 
      name: 'Data Socialization Forums', 
      icon: Users,
      visible: widgetSettings.dataSocialization
    }
  ];

  const tabs = allTabs.filter(tab => tab.visible);

  // Helper function to get previous quarter
  const getPreviousQuarter = (): string => {
    const quarters: Quarter[] = ['FY25 Q1', 'FY25 Q2', 'FY25 Q3', 'FY25 Q4'];
    const currentIndex = quarters.indexOf(currentQuarter);
    if (currentIndex > 0) {
      return quarters[currentIndex - 1];
    }
    // If current quarter is Q1, return Q4 of previous fiscal year
    return 'FY24 Q4';
  };

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

  // Update active tab if current tab becomes invisible
  useEffect(() => {
    const isActiveTabVisible = tabs.some(tab => tab.id === activeTab);
    if (!isActiveTabVisible && tabs.length > 0) {
      setActiveTab(tabs[0].id);
    }
  }, [widgetSettings, activeTab, tabs]);

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

  // Don't render if no tabs are visible
  if (tabs.length === 0) {
    return null;
  }

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
                  <div className="space-y-6">
                    {/* Responsiveness - only show if enabled */}
                    {widgetSettings.responsiveness && (
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="flex items-center gap-2 mb-4">
                          <h3 className="text-sm font-medium text-gray-700">Responsiveness</h3>
                          <div className="relative group">
                            <HelpCircle className="h-4 w-4 text-gray-400 hover:text-gray-600 cursor-help" />
                            <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-64 p-2 bg-gray-900 text-white text-xs rounded-md opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                              {tooltips.responsiveness}
                            </div>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
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
                          <div>
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
                        
                        {/* Quarterly Responsiveness Data */}
                        <div className="mt-4 space-y-4">
                          <h4 className="text-sm font-medium text-gray-700">Quarterly Responsiveness Data</h4>
                          {['FY25 Q1', 'FY25 Q2', 'FY25 Q3', 'FY25 Q4'].map((quarter, index) => (
                            <div key={quarter} className="bg-white p-4 rounded-lg border border-gray-200">
                              <div className="flex items-center gap-4">
                                <h5 className="text-sm font-medium text-gray-700 w-24 flex-shrink-0">{quarter}</h5>
                                <div className="grid grid-cols-3 gap-4 flex-1">
                                  <div>
                                    <label className="block text-xs font-medium text-gray-600 mb-1">
                                      Percentage (%)
                                    </label>
                                    <input
                                      type="number"
                                      value={(formData.metricSummary?.responsivenessQuarterlyData || [])[index]?.percentage || 0}
                                      onChange={(e) => {
                                        setFormData(prev => {
                                          const newData = Array.from({ length: 4 }, (_, i) => ({
                                            quarter: ['FY25 Q1', 'FY25 Q2', 'FY25 Q3', 'FY25 Q4'][i],
                                            percentage: (prev.metricSummary?.responsivenessQuarterlyData || [])[i]?.percentage || 0,
                                            totalIdeas: (prev.metricSummary?.responsivenessQuarterlyData || [])[i]?.totalIdeas || 0,
                                            ideasMovedOutOfReview: (prev.metricSummary?.responsivenessQuarterlyData || [])[i]?.ideasMovedOutOfReview || 0
                                          }));
                                          newData[index] = { ...newData[index], percentage: Number(e.target.value) };
                                          return {
                                            ...prev,
                                            metricSummary: { 
                                              ...prev.metricSummary, 
                                              responsivenessQuarterlyData: newData 
                                            }
                                          };
                                        });
                                      }}
                                      className="w-full px-2 py-1 border border-gray-300 rounded text-xs focus:ring-2 focus:ring-blue-500"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-xs font-medium text-gray-600 mb-1">
                                      Ideas Moved Out of Review
                                    </label>
                                    <input
                                      type="number"
                                      value={(formData.metricSummary?.responsivenessQuarterlyData || [])[index]?.ideasMovedOutOfReview || 0}
                                      onChange={(e) => {
                                        setFormData(prev => {
                                          const newData = Array.from({ length: 4 }, (_, i) => ({
                                            quarter: ['FY25 Q1', 'FY25 Q2', 'FY25 Q3', 'FY25 Q4'][i],
                                            percentage: (prev.metricSummary?.responsivenessQuarterlyData || [])[i]?.percentage || 0,
                                            totalIdeas: (prev.metricSummary?.responsivenessQuarterlyData || [])[i]?.totalIdeas || 0,
                                            ideasMovedOutOfReview: (prev.metricSummary?.responsivenessQuarterlyData || [])[i]?.ideasMovedOutOfReview || 0
                                          }));
                                          newData[index] = { ...newData[index], ideasMovedOutOfReview: Number(e.target.value) };
                                          return {
                                            ...prev,
                                            metricSummary: { 
                                              ...prev.metricSummary, 
                                              responsivenessQuarterlyData: newData 
                                            }
                                          };
                                        });
                                      }}
                                      className="w-full px-2 py-1 border border-gray-300 rounded text-xs focus:ring-2 focus:ring-blue-500"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-xs font-medium text-gray-600 mb-1">
                                      Total Ideas
                                    </label>
                                    <input
                                      type="number"
                                      value={(formData.metricSummary?.responsivenessQuarterlyData || [])[index]?.totalIdeas || 0}
                                      onChange={(e) => {
                                        setFormData(prev => {
                                          const newData = Array.from({ length: 4 }, (_, i) => ({
                                            quarter: ['FY25 Q1', 'FY25 Q2', 'FY25 Q3', 'FY25 Q4'][i],
                                            percentage: (prev.metricSummary?.responsivenessQuarterlyData || [])[i]?.percentage || 0,
                                            totalIdeas: (prev.metricSummary?.responsivenessQuarterlyData || [])[i]?.totalIdeas || 0,
                                            ideasMovedOutOfReview: (prev.metricSummary?.responsivenessQuarterlyData || [])[i]?.ideasMovedOutOfReview || 0
                                          }));
                                          newData[index] = { ...newData[index], totalIdeas: Number(e.target.value) };
                                          return {
                                            ...prev,
                                            metricSummary: { 
                                              ...prev.metricSummary, 
                                              responsivenessQuarterlyData: newData 
                                            }
                                          };
                                        });
                                      }}
                                      className="w-full px-2 py-1 border border-gray-300 rounded text-xs focus:ring-2 focus:ring-blue-500"
                                    />
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Roadmap Alignment - only show if enabled */}
                    {widgetSettings.commitment && (
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
                        <div className="grid grid-cols-2 gap-4">
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
                    )}

                    {/* Continued Engagement - only show if enabled */}
                    {widgetSettings.continuedEngagement && (
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="flex items-center gap-2 mb-4">
                          <h3 className="text-sm font-medium text-gray-700">
                            Continued Engagement Rate
                          </h3>
                          <div className="relative group">
                            <HelpCircle className="h-4 w-4 text-gray-400 hover:text-gray-600 cursor-help" />
                            <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-64 p-2 bg-gray-900 text-white text-xs rounded-md opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                              {tooltips.continuedEngagement}
                            </div>
                          </div>
                        </div>
                        <div className="grid grid-cols-3 gap-4">
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
                    )}

                    {/* Idea Volume */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex items-center gap-2 mb-4">
                        <h3 className="text-sm font-medium text-gray-700">
                          Idea Volume
                        </h3>
                        <div className="relative group">
                          <HelpCircle className="h-4 w-4 text-gray-400 hover:text-gray-600 cursor-help" />
                          <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-64 p-2 bg-gray-900 text-white text-xs rounded-md opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                            {tooltips.ideaVolume}
                          </div>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Quarterly Ideas
                          </label>
                          <input
                            type="number"
                            value={formData.metricSummary?.ideaVolume?.quarterly || 0}
                            onChange={(e) => handleMetricChange('ideaVolume', { quarterly: Number(e.target.value) })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Total Ideas
                          </label>
                          <input
                            type="number"
                            value={formData.metricSummary?.ideaVolume?.total || 0}
                            onChange={(e) => handleMetricChange('ideaVolume', { total: Number(e.target.value) })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
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
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Candidate Ideas
                            </label>
                            <input
                              type="number"
                              value={item.candidateIdeas}
                              onChange={(e) => handleStackedBarDataChange(index, 'candidateIdeas', Number(e.target.value))}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  Number of Clients
                                </label>
                                <input
                                  type="number"
                                  value={item.clientsRepresenting}
                                  onChange={(e) => handleLineChartDataChange(index, Number(e.target.value))}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Features Tab */}
                {activeTab === 'features' && (
                  <div className="space-y-6">
                    {/* Sub-tabs for Current and Previous Quarter */}
                    <div className="border-b border-gray-200">
                      <nav className="-mb-px flex space-x-8">
                        <button
                          type="button"
                          onClick={() => setFeaturesSubTab('current')}
                          className={`py-2 px-1 border-b-2 font-medium text-sm ${
                            featuresSubTab === 'current'
                              ? 'border-blue-500 text-blue-600'
                              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                          }`}
                        >
                          Current Quarter Features
                        </button>
                        <button
                          type="button"
                          onClick={() => setFeaturesSubTab('previous')}
                          className={`py-2 px-1 border-b-2 font-medium text-sm ${
                            featuresSubTab === 'previous'
                              ? 'border-blue-500 text-blue-600'
                              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                          }`}
                        >
                          Previous Quarter Features
                        </button>
                      </nav>
                    </div>

                    {/* Current Quarter Features */}
                    {featuresSubTab === 'current' && (
                      <div className="space-y-6">
                        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                          <h4 className="text-sm font-medium text-blue-800 mb-2">
                            Current Quarter ({currentQuarter}) Features
                          </h4>
                          <p className="text-xs text-blue-600">
                            These features will be displayed in the main dashboard view for the current quarter.
                          </p>
                        </div>
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
                                Current Quarter Feature #{index + 1}
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
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                  />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                  />
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* Previous Quarter Features */}
                    {featuresSubTab === 'previous' && (
                      <div className="space-y-6">
                        <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
                          <h4 className="text-sm font-medium text-amber-800 mb-2">
                            Previous Quarter ({getPreviousQuarter()}) Features
                          </h4>
                          <p className="text-xs text-amber-600">
                            These features will be displayed in the comparison view for the previous quarter.
                          </p>
                        </div>
                        {Array.from({ length: 10 }).map((_, index) => {
                          const feature = formData.previousQuarterFeatures?.[index] || {
                            feature_name: '',
                            vote_count: 0,
                            status: 'Under Review' as const,
                            status_updated_at: new Date().toISOString(),
                            client_voters: []
                          };
                          return (
                            <div key={index} className="bg-gray-50 p-4 rounded-lg">
                              <h4 className="text-sm font-medium text-gray-700 mb-4">
                                Previous Quarter Feature #{index + 1}
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
                                      const newFeatures = [...(formData.previousQuarterFeatures || [])];
                                      newFeatures[index] = { ...feature, feature_name: e.target.value };
                                      setFormData({ ...formData, previousQuarterFeatures: newFeatures });
                                    }}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                  />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                      Vote Count
                                    </label>
                                    <input
                                      type="number"
                                      value={feature.vote_count}
                                      onChange={(e) => {
                                        const newFeatures = [...(formData.previousQuarterFeatures || [])];
                                        newFeatures[index] = { ...feature, vote_count: Number(e.target.value) };
                                        setFormData({ ...formData, previousQuarterFeatures: newFeatures });
                                      }}
                                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                      Status
                                    </label>
                                    <select
                                      value={feature.status}
                                      onChange={(e) => {
                                        const newFeatures = [...(formData.previousQuarterFeatures || [])];
                                        newFeatures[index] = { 
                                          ...feature, 
                                          status: e.target.value as 'Delivered' | 'Under Review' | 'Committed'
                                        };
                                        setFormData({ ...formData, previousQuarterFeatures: newFeatures });
                                      }}
                                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                                      const newFeatures = [...(formData.previousQuarterFeatures || [])];
                                      newFeatures[index] = {
                                        ...feature,
                                        client_voters: e.target.value.split(';').map(s => s.trim()).filter(Boolean)
                                      };
                                      setFormData({ ...formData, previousQuarterFeatures: newFeatures });
                                    }}
                                    placeholder="Client A; Client B; Client C"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                  />
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}

                {/* Forums Tab */}
                {activeTab === 'forums' && (
                  <div className="space-y-6">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="text-sm font-medium text-gray-700 mb-4">Data Socialization Forums</h3>
                      <div className="space-y-4">
                        {Array.from({ length: 5 }).map((_, index) => {
                          const forum = formData.dataSocializationForums?.[index] || {
                            title: '',
                            date: '',
                            attendees: 0,
                            keyTopics: []
                          };
                          return (
                            <div key={index} className="bg-white p-4 rounded border">
                              <h4 className="text-sm font-medium text-gray-700 mb-3">
                                Forum #{index + 1}
                              </h4>
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Forum Title
                                  </label>
                                  <input
                                    type="text"
                                    value={forum.title}
                                    onChange={(e) => {
                                      const newForums = [...(formData.dataSocializationForums || [])];
                                      newForums[index] = { ...forum, title: e.target.value };
                                      setFormData({ ...formData, dataSocializationForums: newForums });
                                    }}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                  />
                                </div>
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Date
                                  </label>
                                  <input
                                    type="date"
                                    value={forum.date}
                                    onChange={(e) => {
                                      const newForums = [...(formData.dataSocializationForums || [])];
                                      newForums[index] = { ...forum, date: e.target.value };
                                      setFormData({ ...formData, dataSocializationForums: newForums });
                                    }}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                  />
                                </div>
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Attendees
                                  </label>
                                  <input
                                    type="number"
                                    value={forum.attendees}
                                    onChange={(e) => {
                                      const newForums = [...(formData.dataSocializationForums || [])];
                                      newForums[index] = { ...forum, attendees: Number(e.target.value) };
                                      setFormData({ ...formData, dataSocializationForums: newForums });
                                    }}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                  />
                                </div>
                              </div>
                              <div className="mt-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  Key Topics (separate with semicolon)
                                </label>
                                <input
                                  type="text"
                                  value={forum.keyTopics.join('; ')}
                                  onChange={(e) => {
                                    const newForums = [...(formData.dataSocializationForums || [])];
                                    newForums[index] = {
                                      ...forum,
                                      keyTopics: e.target.value.split(';').map(s => s.trim()).filter(Boolean)
                                    };
                                    setFormData({ ...formData, dataSocializationForums: newForums });
                                  }}
                                  placeholder="Topic A; Topic B; Topic C"
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Form Actions */}
              <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
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
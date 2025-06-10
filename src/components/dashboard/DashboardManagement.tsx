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
                        
                        {/* Commitment Trends Data */}
                        <div className="mt-6">
                          <h4 className="text-sm font-medium text-gray-700 mb-4">Annual Commitment Trends (Past 5 Years)</h4>
                          <div className="space-y-4">
                            {['2020', '2021', '2022', '2023', '2024'].map((year, index) => (
                              <div key={year} className="bg-white p-4 rounded-lg border border-gray-200">
                                <div className="flex items-center gap-4">
                                  <h5 className="text-sm font-medium text-gray-700 w-16 flex-shrink-0">{year}</h5>
                                  <div className="flex-1">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                      Committed Ideas
                                    </label>
                                    <input
                                      type="number"
                                      value={(formData.metricSummary?.roadmapAlignment?.commitmentTrends || [])[index]?.committed || 0}
                                      onChange={(e) => {
                                        setFormData(prev => {
                                          const newTrends = Array.from({ length: 5 }, (_, i) => ({
                                            year: ['2020', '2021', '2022', '2023', '2024'][i],
                                            committed: (prev.metricSummary?.roadmapAlignment?.commitmentTrends || [])[i]?.committed || 0,
                                            delivered: (prev.metricSummary?.roadmapAlignment?.commitmentTrends || [])[i]?.delivered || 0
                                          }));
                                          newTrends[index] = { ...newTrends[index], committed: Number(e.target.value) };
                                          return {
                                            ...prev,
                                            metricSummary: {
                                              ...prev.metricSummary,
                                              roadmapAlignment: {
                                                ...prev.metricSummary?.roadmapAlignment,
                                                commitmentTrends: newTrends
                                              }
                                            }
                                          };
                                        });
                                      }}
                                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 text-sm"
                                    />
                                  </div>
                                  <div className="flex-1">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                      Delivered Ideas
                                    </label>
                                    <input
                                      type="number"
                                      value={(formData.metricSummary?.roadmapAlignment?.commitmentTrends || [])[index]?.delivered || 0}
                                      onChange={(e) => {
                                        setFormData(prev => {
                                          const newTrends = Array.from({ length: 5 }, (_, i) => ({
                                            year: ['2020', '2021', '2022', '2023', '2024'][i],
                                            committed: (prev.metricSummary?.roadmapAlignment?.commitmentTrends || [])[i]?.committed || 0,
                                            delivered: (prev.metricSummary?.roadmapAlignment?.commitmentTrends || [])[i]?.delivered || 0
                                          }));
                                          newTrends[index] = { ...newTrends[index], delivered: Number(e.target.value) };
                                          return {
                                            ...prev,
                                            metricSummary: {
                                              ...prev.metricSummary,
                                              roadmapAlignment: {
                                                ...prev.metricSummary?.roadmapAlignment,
                                                commitmentTrends: newTrends
                                              }
                                            }
                                          };
                                        });
                                      }}
                                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 text-sm"
                                    />
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Quarterly Deliveries Data */}
                        <div className="mt-6">
                          <h4 className="text-sm font-medium text-gray-700 mb-4">Quarterly Deliveries</h4>
                          <div className="grid grid-cols-2 gap-4">
                            {[
                              { quarter: 'Q1', year: '2023' }, { quarter: 'Q2', year: '2023' },
                              { quarter: 'Q3', year: '2023' }, { quarter: 'Q4', year: '2023' },
                              { quarter: 'Q1', year: '2024' }, { quarter: 'Q2', year: '2024' },
                              { quarter: 'Q3', year: '2024' }, { quarter: 'Q4', year: '2024' }
                            ].map((item, index) => (
                              <div key={`${item.quarter}-${item.year}`} className="bg-white p-3 rounded-lg border border-gray-200">
                                <div className="flex items-center gap-2">
                                  <h5 className="text-sm font-medium text-gray-700 w-16 flex-shrink-0">
                                    {item.quarter} {item.year}
                                  </h5>
                                  <div className="flex-1">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                      Delivered
                                    </label>
                                    <input
                                      type="number"
                                      value={(formData.metricSummary?.roadmapAlignment?.quarterlyDeliveries || [])[index]?.delivered || 0}
                                      onChange={(e) => {
                                        setFormData(prev => {
                                          const newDeliveries = Array.from({ length: 8 }, (_, i) => {
                                            const quarterData = [
                                              { quarter: 'Q1', year: '2023' }, { quarter: 'Q2', year: '2023' },
                                              { quarter: 'Q3', year: '2023' }, { quarter: 'Q4', year: '2023' },
                                              { quarter: 'Q1', year: '2024' }, { quarter: 'Q2', year: '2024' },
                                              { quarter: 'Q3', year: '2024' }, { quarter: 'Q4', year: '2024' }
                                            ][i];
                                            return {
                                              quarter: quarterData.quarter,
                                              year: quarterData.year,
                                              delivered: (prev.metricSummary?.roadmapAlignment?.quarterlyDeliveries || [])[i]?.delivered || 0
                                            };
                                          });
                                          newDeliveries[index] = { ...newDeliveries[index], delivered: Number(e.target.value) };
                                          return {
                                            ...prev,
                                            metricSummary: {
                                              ...prev.metricSummary,
                                              roadmapAlignment: {
                                                ...prev.metricSummary?.roadmapAlignment,
                                                quarterlyDeliveries: newDeliveries
                                              }
                                            }
                                          };
                                        });
                                      }}
                                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 text-sm"
                                    />
                                  </div>
                                </div>
                              </div>
                            ))}
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

                        {/* Continued Engagement Quarterly
import React, { useState, useEffect } from 'react';
import { X, HelpCircle, BarChart2, Users, Clock, LineChart as LineChartIcon } from 'lucide-react';
import { DashboardData } from '../../types';
import { useData } from '../../contexts/DataContext';

interface WidgetSettings {
  responsiveness: boolean;
  commitment: boolean;
  continuedEngagement: boolean;
  clientSubmissions: boolean;
  topFeatures: boolean;
  dataSocialization: boolean;
}

interface DashboardManagementProps {
  isOpen: boolean;
  onClose: () => void;
  widgetSettings: WidgetSettings;
}

const DashboardManagement: React.FC<DashboardManagementProps> = ({ isOpen, onClose, widgetSettings }) => {
  const { dashboardData, updateDashboardData, isLoading } = useData();
  const { currentProduct, currentQuarter } = useData();
  const [formData, setFormData] = useState<DashboardData>(dashboardData || {} as DashboardData);
  const [activeTab, setActiveTab] = useState('metrics');
  const [featuresSubTab, setFeaturesSubTab] = useState<'q3' | 'q4'>('q3');
  
  const tooltips = {
    responsiveness: "Measures how quickly Mitratech responds to client ideas. A higher percentage indicates better engagement and faster feedback loops with clients.",
    roadmapAlignment: "Shows cumulative progress towards the yearly planning goal by tracking the total number of ideas committed versus the annual target.",
    continuedEngagement: "Percentage of ideas that received at least one additional status update within 90 days after being moved out of 'Needs Review'",
    submissions: "Tracks client submission trends over time",
    features: "Manages top requested features and their details"
  };

  // Filter tabs based on widget settings
  const allTabs = [
    { id: 'metrics', name: 'Key Metrics', icon: BarChart2 },
    { id: 'submissions', name: 'Client Submissions by Quarter', icon: LineChartIcon, requiresSetting: 'clientSubmissions' },
    { id: 'features', name: 'Top 10 Requested Features', icon: Clock, requiresSetting: 'topFeatures' },
    { id: 'forums', name: 'Data Socialization Forums', icon: Users, requiresSetting: 'dataSocialization' }
  ];

  const tabs = allTabs.filter(tab => 
    !tab.requiresSetting || widgetSettings[tab.requiresSetting as keyof WidgetSettings]
  );

  // Ensure activeTab is valid when tabs change
  React.useEffect(() => {
    if (!tabs.find(tab => tab.id === activeTab)) {
      setActiveTab('metrics');
    }
  }, [tabs, activeTab]);

  useEffect(() => {
    if (dashboardData) {
      setFormData({
        ...dashboardData,
      });
    }
  }, [dashboardData]);

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
                  <div className="space-y-6">
                    {/* Responsiveness */}
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
                      <div className="mt-4">
                        <h4 className="text-sm font-medium text-gray-700 mb-3">Quarterly Responsiveness Data</h4>
                        <div className="space-y-3">
                          {['FY25 Q1', 'FY25 Q2', 'FY25 Q3', 'FY25 Q4'].map((quarter, index) => (
                            <div key={quarter} className="bg-white p-3 rounded border">
                              <h5 className="text-sm font-medium text-gray-700 mb-2">{quarter}</h5>
                              <div className="grid grid-cols-3 gap-3">
                                <div>
                                  <label className="block text-xs text-gray-600 mb-1">Percentage (%)</label>
                                  <input
                                    type="number"
                                    value={(formData.metricSummary?.responsivenessQuarterlyData || [])[index]?.percentage || 0}
                                    onChange={(e) => {
                                      const newData = [...(formData.metricSummary?.responsivenessQuarterlyData || [])];
                                      newData[index] = {
                                        quarter,
                                        percentage: Number(e.target.value),
                                        totalIdeas: newData[index]?.totalIdeas || 0,
                                        ideasMovedOutOfReview: newData[index]?.ideasMovedOutOfReview || 0
                                      };
                                      handleMetricChange('responsivenessQuarterlyData', newData);
                                    }}
                                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                                  />
                                </div>
                                <div>
                                  <label className="block text-xs text-gray-600 mb-1">Total Ideas</label>
                                  <input
                                    type="number"
                                    value={(formData.metricSummary?.responsivenessQuarterlyData || [])[index]?.totalIdeas || 0}
                                    onChange={(e) => {
                                      const newData = [...(formData.metricSummary?.responsivenessQuarterlyData || [])];
                                      newData[index] = {
                                        quarter,
                                        percentage: newData[index]?.percentage || 0,
                                        totalIdeas: Number(e.target.value),
                                        ideasMovedOutOfReview: newData[index]?.ideasMovedOutOfReview || 0
                                      };
                                      handleMetricChange('responsivenessQuarterlyData', newData);
                                    }}
                                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                                  />
                                </div>
                                <div>
                                  <label className="block text-xs text-gray-600 mb-1">Ideas Moved Out</label>
                                  <input
                                    type="number"
                                    value={(formData.metricSummary?.responsivenessQuarterlyData || [])[index]?.ideasMovedOutOfReview || 0}
                                    onChange={(e) => {
                                      const newData = [...(formData.metricSummary?.responsivenessQuarterlyData || [])];
                                      newData[index] = {
                                        quarter,
                                        percentage: newData[index]?.percentage || 0,
                                        totalIdeas: newData[index]?.totalIdeas || 0,
                                        ideasMovedOutOfReview: Number(e.target.value)
                                      };
                                      handleMetricChange('responsivenessQuarterlyData', newData);
                                    }}
                                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                                  />
                                </div>
                              </div>
                            </div>
                          ))}
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
                      <div className="grid grid-cols-2 gap-4 mb-4">
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

                      {/* Commitment Trends */}
                      <div className="mt-4">
                        <h4 className="text-sm font-medium text-gray-700 mb-3">5-Year Commitment Trends</h4>
                        <div className="space-y-3">
                          {['2020', '2021', '2022', '2023', '2024'].map((year, index) => (
                            <div key={year} className="bg-white p-3 rounded border">
                              <h5 className="text-sm font-medium text-gray-700 mb-2">{year}</h5>
                              <div className="grid grid-cols-2 gap-3">
                                <div>
                                  <label className="block text-xs text-gray-600 mb-1">Committed</label>
                                  <input
                                    type="number"
                                    value={(formData.metricSummary?.roadmapAlignment?.commitmentTrends || [])[index]?.committed || 0}
                                    onChange={(e) => {
                                      const newTrends = [...(formData.metricSummary?.roadmapAlignment?.commitmentTrends || [])];
                                      newTrends[index] = {
                                        year,
                                        committed: Number(e.target.value),
                                        delivered: newTrends[index]?.delivered || 0
                                      };
                                      handleMetricChange('roadmapAlignment', { commitmentTrends: newTrends });
                                    }}
                                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                                  />
                                </div>
                                <div>
                                  <label className="block text-xs text-gray-600 mb-1">Delivered</label>
                                  <input
                                    type="number"
                                    value={(formData.metricSummary?.roadmapAlignment?.commitmentTrends || [])[index]?.delivered || 0}
                                    onChange={(e) => {
                                      const newTrends = [...(formData.metricSummary?.roadmapAlignment?.commitmentTrends || [])];
                                      newTrends[index] = {
                                        year,
                                        committed: newTrends[index]?.committed || 0,
                                        delivered: Number(e.target.value)
                                      };
                                      handleMetricChange('roadmapAlignment', { commitmentTrends: newTrends });
                                    }}
                                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                                  />
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Quarterly Deliveries */}
                      <div className="mt-4">
                        <h4 className="text-sm font-medium text-gray-700 mb-3">Quarterly Deliveries</h4>
                        <div className="space-y-3">
                          {[
                            { quarter: 'Q1', year: '2023' }, { quarter: 'Q2', year: '2023' },
                            { quarter: 'Q3', year: '2023' }, { quarter: 'Q4', year: '2023' },
                            { quarter: 'Q1', year: '2024' }, { quarter: 'Q2', year: '2024' },
                            { quarter: 'Q3', year: '2024' }, { quarter: 'Q4', year: '2024' }
                          ].map((item, index) => (
                            <div key={`${item.quarter}-${item.year}`} className="bg-white p-3 rounded border">
                              <div className="grid grid-cols-3 gap-3 items-center">
                                <div>
                                  <label className="block text-xs text-gray-600 mb-1">Quarter</label>
                                  <span className="text-sm font-medium">{item.quarter} {item.year}</span>
                                </div>
                                <div>
                                  <label className="block text-xs text-gray-600 mb-1">Delivered</label>
                                  <input
                                    type="number"
                                    value={(formData.metricSummary?.roadmapAlignment?.quarterlyDeliveries || [])[index]?.delivered || 0}
                                    onChange={(e) => {
                                      const newDeliveries = [...(formData.metricSummary?.roadmapAlignment?.quarterlyDeliveries || [])];
                                      newDeliveries[index] = {
                                        quarter: item.quarter,
                                        year: item.year,
                                        delivered: Number(e.target.value)
                                      };
                                      handleMetricChange('roadmapAlignment', { quarterlyDeliveries: newDeliveries });
                                    }}
                                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                                  />
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
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
                            {tooltips.continuedEngagement}
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

                      {/* Quarterly Continued Engagement Trends */}
                      <div className="mt-4">
                        <h4 className="text-sm font-medium text-gray-700 mb-3">Quarterly Continued Engagement Trends</h4>
                        <div className="space-y-3">
                          {['FY25 Q1', 'FY25 Q2', 'FY25 Q3', 'FY25 Q4'].map((quarter, index) => (
                            <div key={quarter} className="bg-white p-3 rounded border">
                              <h5 className="text-sm font-medium text-gray-700 mb-2">{quarter}</h5>
                              <div className="grid grid-cols-3 gap-3">
                                <div>
                                  <label className="block text-xs text-gray-600 mb-1">Rate (%)</label>
                                  <input
                                    type="number"
                                    value={(formData.metricSummary?.continuedEngagement?.quarterlyTrends || [])[index]?.rate || 0}
                                    onChange={(e) => {
                                      const newTrends = [...(formData.metricSummary?.continuedEngagement?.quarterlyTrends || [])];
                                      newTrends[index] = {
                                        quarter,
                                        rate: Number(e.target.value),
                                        numerator: newTrends[index]?.numerator || 0,
                                        denominator: newTrends[index]?.denominator || 0
                                      };
                                      handleMetricChange('continuedEngagement', { quarterlyTrends: newTrends });
                                    }}
                                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                                  />
                                </div>
                                <div>
                                  <label className="block text-xs text-gray-600 mb-1">Ideas with Follow-up</label>
                                  <input
                                    type="number"
                                    value={(formData.metricSummary?.continuedEngagement?.quarterlyTrends || [])[index]?.numerator || 0}
                                    onChange={(e) => {
                                      const newTrends = [...(formData.metricSummary?.continuedEngagement?.quarterlyTrends || [])];
                                      newTrends[index] = {
                                        quarter,
                                        rate: newTrends[index]?.rate || 0,
                                        numerator: Number(e.target.value),
                                        denominator: newTrends[index]?.denominator || 0
                                      };
                                      handleMetricChange('continuedEngagement', { quarterlyTrends: newTrends });
                                    }}
                                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                                  />
                                </div>
                                <div>
                                  <label className="block text-xs text-gray-600 mb-1">Total Reviewed</label>
                                  <input
                                    type="number"
                                    value={(formData.metricSummary?.continuedEngagement?.quarterlyTrends || [])[index]?.denominator || 0}
                                    onChange={(e) => {
                                      const newTrends = [...(formData.metricSummary?.continuedEngagement?.quarterlyTrends || [])];
                                      newTrends[index] = {
                                        quarter,
                                        rate: newTrends[index]?.rate || 0,
                                        numerator: newTrends[index]?.numerator || 0,
                                        denominator: Number(e.target.value)
                                      };
                                      handleMetricChange('continuedEngagement', { quarterlyTrends: newTrends });
                                    }}
                                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                                  />
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Idea Volume */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="text-sm font-medium text-gray-700 mb-4">Idea Volume</h3>
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
                    {/* Sub-tabs for Q3 and Q4 */}
                    <div className="border-b border-gray-200">
                      <nav className="-mb-px flex space-x-8">
                        <button
                          type="button"
                          onClick={() => setFeaturesSubTab('q3')}
                          className={`py-2 px-1 border-b-2 font-medium text-sm ${
                            featuresSubTab === 'q3'
                              ? 'border-purple-500 text-purple-600'
                              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                          }`}
                        >
                          Q3 Features (Previous Quarter)
                        </button>
                        <button
                          type="button"
                          onClick={() => setFeaturesSubTab('q4')}
                          className={`py-2 px-1 border-b-2 font-medium text-sm ${
                            featuresSubTab === 'q4'
                              ? 'border-green-500 text-green-600'
                              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                          }`}
                        >
                          Q4 Features (Current Quarter)
                        </button>
                      </nav>
                    </div>

                    {/* Q3 Features Content */}
                    {featuresSubTab === 'q3' && (
                      <div className="space-y-6">
                        <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                          <h4 className="text-md font-medium text-purple-900 mb-2">Q3 Features (Previous Quarter)</h4>
                          <p className="text-sm text-purple-700">
                            Features from the previous quarter for comparison analysis in the quarterly trends chart.
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
                              Q3 Feature #{index + 1}
                            </h4>
                            <div className="space-y-4">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  Q3 Feature Name
                                </label>
                                <input
                                  type="text"
                                  value={feature.feature_name}
                                  onChange={(e) => {
                                    const newFeatures = [...(formData.previousQuarterFeatures || [])];
                                    newFeatures[index] = { ...feature, feature_name: e.target.value };
                                    setFormData({ ...formData, previousQuarterFeatures: newFeatures });
                                  }}
                                  placeholder="Enter Q3 feature name"
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                />
                              </div>
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Q3 Vote Count
                                  </label>
                                  <input
                                    type="number"
                                    value={feature.vote_count}
                                    onChange={(e) => {
                                      const newFeatures = [...(formData.previousQuarterFeatures || [])];
                                      newFeatures[index] = { ...feature, vote_count: Number(e.target.value) };
                                      setFormData({ ...formData, previousQuarterFeatures: newFeatures });
                                    }}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                  />
                                </div>
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Q3 Status
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
                                  Q3 Contributing Clients (separate with semicolon)
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
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                />
                              </div>
                            </div>
                          </div>
                          );
                        })}
                      </div>
                    )}

                    {/* Q4 Features Content */}
                    {featuresSubTab === 'q4' && (
                      <div className="space-y-6">
                        <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                          <h4 className="text-md font-medium text-green-900 mb-2">Q4 Features (Current Quarter)</h4>
                          <p className="text-sm text-green-700">
                            Features from the current quarter for comparison analysis in the quarterly trends chart.
                          </p>
                        </div>
                        
                        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200 mb-6">
                          <h4 className="text-md font-medium text-blue-900 mb-2">Top 10 Requested Features</h4>
                          <p className="text-sm text-blue-700">
                            Manage the top requested features for Q3 and Q4. These features will be displayed in the quarterly trends comparison chart.
                          </p>
                        </div>

                        {/* Q3 Features */}
                        <div className="space-y-4">
                          <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                            <h4 className="text-lg font-medium text-purple-900 mb-2">Q3 Features (Previous Quarter)</h4>
                            <p className="text-sm text-purple-700 mb-4">
                              Features from the previous quarter for comparison analysis
                            </p>
                          </div>
                          
                          {Array.from({ length: 5 }).map((_, index) => {
                            const feature = (formData.previousQuarterFeatures || [])[index] || {
                              feature_name: '',
                              vote_count: 0,
                              status: 'Under Review' as const,
                              status_updated_at: new Date().toISOString(),
                              client_voters: []
                            };
                            return (
                              <div key={`q3-${index}`} className="bg-purple-25 border border-purple-200 p-4 rounded-lg">
                                <h5 className="text-sm font-medium text-gray-700 mb-4">
                                  Q3 Feature #{index + 1}
                                </h5>
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
                                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                      placeholder="Enter Q3 feature name"
                                    />
                                  </div>
                                  <div className="grid grid-cols-2 gap-4">
                                    <div>
                                      <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Q3 Vote Count
                                      </label>
                                      <input
                                        type="number"
                                        value={feature.vote_count}
                                        onChange={(e) => {
                                          const newFeatures = [...(formData.previousQuarterFeatures || [])];
                                          newFeatures[index] = { ...feature, vote_count: Number(e.target.value) };
                                          setFormData({ ...formData, previousQuarterFeatures: newFeatures });
                                        }}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                        placeholder="0"
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
                                        const newFeatures = [...(formData.previousQuarterFeatures || [])];
                                        newFeatures[index] = {
                                          ...feature,
                                          client_voters: e.target.value.split(';').map(s => s.trim()).filter(Boolean)
                                        };
                                        setFormData({ ...formData, previousQuarterFeatures: newFeatures });
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

                        {/* Q4 Features */}
                        <div className="space-y-4">
                          <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                            <h4 className="text-lg font-medium text-green-900 mb-2">Q4 Features (Current Quarter)</h4>
                            <p className="text-sm text-green-700 mb-4">
                              Features from the current quarter for trend analysis
                            </p>
                          </div>
                          
                          {Array.from({ length: 5 }).map((_, index) => {
                            const feature = formData.topFeatures[index] || {
                              feature_name: '',
                              vote_count: 0,
                              status: 'Under Review' as const,
                              status_updated_at: new Date().toISOString(),
                              client_voters: []
                            };
                            return (
                              <div key={`q4-${index}`} className="bg-green-25 border border-green-200 p-4 rounded-lg">
                                <h5 className="text-sm font-medium text-gray-700 mb-4">
                                  Q4 Feature #{index + 1}
                                </h5>
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
                                      placeholder="Enter Q4 feature name"
                                    />
                                  </div>
                                  <div className="grid grid-cols-2 gap-4">
                                    <div>
                                      <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Q4 Vote Count
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
                                        placeholder="0"
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
                      </div>
                    )}
                  </div>
                )}

                {/* Forums Tab */}
                {activeTab === 'forums' && (
                  <div className="space-y-6">
                    <div className="bg-blue-50 rounded-lg p-4 border border-blue-200 mb-6">
                      <h4 className="text-md font-medium text-blue-900 mb-2">Data Socialization Forums</h4>
                      <p className="text-sm text-blue-700">
                        Select which forums are actively used for data socialization and insights sharing. 
                        Selected forums will show a checkmark (✓) on the dashboard, while unselected forums will show an X (✗).
                      </p>
                    </div>
                    
                    <div className="space-y-3">
                      {[
                        { name: 'CSC', description: 'Client Success Committee - Product Managers, Leadership, Client Success' },
                        { name: 'Sprint Reviews', description: 'Product, Engineering, Design Teams - Share progress on idea implementation' },
                        { name: 'Customer Advisory Board (CAB)', description: 'Strategic Clients, Product Leadership - Validate roadmap decisions' },
                        { name: 'CWG', description: 'Client Working Group Members - Deep dive into specific feature requirements' },
                        { name: 'Quarterly Product Reviews (QBRs)', description: 'Executive Leadership, Product Teams - Strategic product planning' }
                      ].map((forumOption, index) => {
                        const isSelected = (formData.data_socialization_forums || []).some(
                          forum => forum.name === forumOption.name
                        );
                        
                        return (
                          <div
                            key={index}
                            className={`p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                              isSelected 
                                ? 'border-green-300 bg-green-50 hover:bg-green-100' 
                                : 'border-gray-200 bg-white hover:bg-gray-50'
                            }`}
                            onClick={() => {
                              const currentForums = formData.data_socialization_forums || [];
                              let newForums;
                              
                              if (isSelected) {
                                // Remove forum if currently selected
                                newForums = currentForums.filter(forum => forum.name !== forumOption.name);
                              } else {
                                // Add forum if not currently selected
                                newForums = [...currentForums, { name: forumOption.name }];
                              }
                              
                              setFormData({ ...formData, data_socialization_forums: newForums });
                            }}
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex items-start space-x-3">
                                <div className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                                  isSelected 
                                    ? 'border-green-500 bg-green-500' 
                                    : 'border-gray-300 bg-white'
                                }`}>
                                  {isSelected && (
                                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                  )}
                                </div>
                                <div className="flex-1">
                                  <h5 className="text-sm font-medium text-gray-900 mb-1">
                                    {forumOption.name}
                                  </h5>
                                  <p className="text-xs text-gray-600 leading-relaxed">
                                    {forumOption.description}
                                  </p>
                                </div>
                              </div>
                              <div className="flex-shrink-0 ml-4">
                                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                  isSelected 
                                    ? 'bg-green-100 text-green-800' 
                                    : 'bg-gray-100 text-gray-600'
                                }`}>
                                  {isSelected ? 'Active' : 'Inactive'}
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    
                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <h5 className="text-sm font-medium text-gray-900 mb-2">Selection Summary</h5>
                      <div className="text-sm text-gray-600">
                        <p className="mb-1">
                          <span className="font-medium">
                            {(formData.data_socialization_forums || []).length} of 5
                          </span> forums selected for data socialization
                        </p>
                        <p className="text-xs">
                          Selected forums will display with a checkmark (✓) on the dashboard card, 
                          while unselected forums will show an X (✗).
                        </p>
                      </div>
                    </div>
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
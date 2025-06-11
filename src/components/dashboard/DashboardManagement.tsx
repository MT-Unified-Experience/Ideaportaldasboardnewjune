import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Save, BarChart3, TrendingUp, Users, MessageSquare, Upload } from 'lucide-react';
import { useData } from '../../contexts/DataContext';
import { Feature, LineChartData, Forum } from '../../types';

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

const DashboardManagement: React.FC<DashboardManagementProps> = ({
  isOpen,
  onClose,
  widgetSettings
}) => {
  const { dashboardData, updateDashboardData, uploadTopFeaturesCSV, currentProduct, currentQuarter, isLoading } = useData();
  const { uploadClientSubmissionsCSV } = useData();
  const [activeTab, setActiveTab] = useState('metrics');
  const [activeSubTab, setActiveSubTab] = useState('current');
  const [isLocalLoading, setIsLocalLoading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);

  // Local state for editing
  const [localData, setLocalData] = useState(dashboardData);

  // Update local data when dashboard data changes
  useEffect(() => {
    if (dashboardData) {
      setLocalData(dashboardData);
    }
  }, [dashboardData]);

  const handleSave = async () => {
    if (!localData) return;
    
    setIsLocalLoading(true);
    try {
      await updateDashboardData(localData);
      onClose();
    } catch (error) {
      console.error('Error saving dashboard data:', error);
    } finally {
      setIsLocalLoading(false);
    }
  };

  const handleCancel = () => {
    setLocalData(dashboardData);
    onClose();
  };

  // Handle top features CSV upload
  const handleTopFeaturesUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setUploadStatus('Uploading...');
      await uploadTopFeaturesCSV(file);
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

  // Handle client submissions CSV upload
  const handleClientSubmissionsUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setUploadStatus('Uploading...');
      await uploadClientSubmissionsCSV(file);
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

  // Helper functions for managing features
  const addFeature = (isCurrentQuarter: boolean) => {
    if (!localData) return;

    const newFeature: Feature = {
      feature_name: '',
      vote_count: 0,
      status: 'Under Review',
      status_updated_at: new Date().toISOString(),
      client_voters: []
    };

    if (isCurrentQuarter) {
      setLocalData({
        ...localData,
        topFeatures: [...localData.topFeatures, newFeature]
      });
    } else {
      setLocalData({
        ...localData,
        previousQuarterFeatures: [...(localData.previousQuarterFeatures || []), newFeature]
      });
    }
  };

  const updateFeature = (index: number, field: keyof Feature, value: any, isCurrentQuarter: boolean) => {
    if (!localData) return;

    if (isCurrentQuarter) {
      const updatedFeatures = [...localData.topFeatures];
      if (field === 'client_voters' && typeof value === 'string') {
        updatedFeatures[index] = {
          ...updatedFeatures[index],
          [field]: value.split(',').map(s => s.trim()).filter(s => s.length > 0)
        };
      } else {
        updatedFeatures[index] = {
          ...updatedFeatures[index],
          [field]: value
        };
      }
      setLocalData({
        ...localData,
        topFeatures: updatedFeatures
      });
    } else {
      const updatedFeatures = [...(localData.previousQuarterFeatures || [])];
      if (field === 'client_voters' && typeof value === 'string') {
        updatedFeatures[index] = {
          ...updatedFeatures[index],
          [field]: value.split(',').map(s => s.trim()).filter(s => s.length > 0)
        };
      } else {
        updatedFeatures[index] = {
          ...updatedFeatures[index],
          [field]: value
        };
      }
      setLocalData({
        ...localData,
        previousQuarterFeatures: updatedFeatures
      });
    }
  };

  const removeFeature = (index: number, isCurrentQuarter: boolean) => {
    if (!localData) return;

    if (isCurrentQuarter) {
      const updatedFeatures = localData.topFeatures.filter((_, i) => i !== index);
      setLocalData({
        ...localData,
        topFeatures: updatedFeatures
      });
    } else {
      const updatedFeatures = (localData.previousQuarterFeatures || []).filter((_, i) => i !== index);
      setLocalData({
        ...localData,
        previousQuarterFeatures: updatedFeatures
      });
    }
  };

  // Helper functions for managing line chart data
  const addLineChartEntry = () => {
    if (!localData) return;

    const newEntry: LineChartData = {
      quarter: '',
      clientsRepresenting: 0,
      clients: []
    };

    setLocalData({
      ...localData,
      lineChartData: [...localData.lineChartData, newEntry]
    });
  };

  const updateLineChartEntry = (index: number, field: keyof LineChartData, value: any) => {
    if (!localData) return;

    const updatedData = [...localData.lineChartData];
    if (field === 'clients' && typeof value === 'string') {
      updatedData[index] = {
        ...updatedData[index],
        [field]: value.split(',').map(s => s.trim()).filter(s => s.length > 0)
      };
    } else {
      updatedData[index] = {
        ...updatedData[index],
        [field]: value
      };
    }

    setLocalData({
      ...localData,
      lineChartData: updatedData
    });
  };

  const removeLineChartEntry = (index: number) => {
    if (!localData) return;

    const updatedData = localData.lineChartData.filter((_, i) => i !== index);
    setLocalData({
      ...localData,
      lineChartData: updatedData
    });
  };

  // Helper functions for managing forums
  const addForum = () => {
    if (!localData) return;

    const newForum: Forum = {
      name: ''
    };

    setLocalData({
      ...localData,
      data_socialization_forums: [...(localData.data_socialization_forums || []), newForum]
    });
  };

  const updateForum = (index: number, field: keyof Forum, value: string) => {
    if (!localData) return;

    const updatedForums = [...(localData.data_socialization_forums || [])];
    updatedForums[index] = {
      ...updatedForums[index],
      [field]: value
    };

    setLocalData({
      ...localData,
      data_socialization_forums: updatedForums
    });
  };

  const removeForum = (index: number) => {
    if (!localData) return;

    const updatedForums = (localData.data_socialization_forums || []).filter((_, i) => i !== index);
    setLocalData({
      ...localData,
      data_socialization_forums: updatedForums
    });
  };

  if (!isOpen || !localData) return null;

  const tabs = [
    { id: 'metrics', name: 'Key Metrics', icon: BarChart3 },
    { id: 'submissions', name: 'Client Submissions by Quarter', icon: TrendingUp },
    { id: 'features', name: 'Top 10 Requested Features', icon: Users },
    { id: 'forums', name: 'Data Socialization Forums', icon: MessageSquare }
  ];

  const visibleTabs = tabs.filter(tab => {
    switch (tab.id) {
      case 'metrics':
        return widgetSettings.responsiveness || widgetSettings.commitment || widgetSettings.continuedEngagement;
      case 'submissions':
        return widgetSettings.clientSubmissions;
      case 'features':
        return widgetSettings.topFeatures;
      case 'forums':
        return widgetSettings.dataSocialization;
      default:
        return true;
    }
  });

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-gray-500 bg-opacity-75">
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative transform overflow-hidden rounded-lg bg-white w-full max-w-6xl shadow-xl">
          {/* Header */}
          <div className="bg-white px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">
                Edit {currentProduct} - {currentQuarter} Metrics
              </h2>
              <button
                onClick={handleCancel}
                className="text-gray-400 hover:text-gray-500 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6">
              {visibleTabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="h-4 w-4 mr-2" />
                    {tab.name}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Content */}
          <div className="px-6 py-6 max-h-[60vh] overflow-y-auto">
            {/* Key Metrics Tab */}
            {activeTab === 'metrics' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {widgetSettings.responsiveness && (
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h3 className="text-lg font-medium text-gray-900 mb-4">Responsiveness</h3>
                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Percentage (%)
                          </label>
                          <input
                            type="number"
                            value={localData.metricSummary.responsiveness}
                            onChange={(e) => setLocalData({
                              ...localData,
                              metricSummary: {
                                ...localData.metricSummary,
                                responsiveness: parseInt(e.target.value) || 0
                              }
                            })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            min="0"
                            max="100"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {widgetSettings.commitment && (
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h3 className="text-lg font-medium text-gray-900 mb-4">Idea Portal Commitment</h3>
                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Committed Ideas
                          </label>
                          <input
                            type="number"
                            value={localData.metricSummary.roadmapAlignment.committed}
                            onChange={(e) => setLocalData({
                              ...localData,
                              metricSummary: {
                                ...localData.metricSummary,
                                roadmapAlignment: {
                                  ...localData.metricSummary.roadmapAlignment,
                                  committed: parseInt(e.target.value) || 0
                                }
                              }
                            })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            min="0"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Total Ideas Target
                          </label>
                          <input
                            type="number"
                            value={localData.metricSummary.roadmapAlignment.total}
                            onChange={(e) => setLocalData({
                              ...localData,
                              metricSummary: {
                                ...localData.metricSummary,
                                roadmapAlignment: {
                                  ...localData.metricSummary.roadmapAlignment,
                                  total: parseInt(e.target.value) || 0
                                }
                              }
                            })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            min="0"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {widgetSettings.continuedEngagement && (
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h3 className="text-lg font-medium text-gray-900 mb-4">Continued Engagement Rate</h3>
                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Rate (%)
                          </label>
                          <input
                            type="number"
                            value={localData.metricSummary.continuedEngagement?.rate || 0}
                            onChange={(e) => setLocalData({
                              ...localData,
                              metricSummary: {
                                ...localData.metricSummary,
                                continuedEngagement: {
                                  ...localData.metricSummary.continuedEngagement,
                                  rate: parseInt(e.target.value) || 0
                                }
                              }
                            })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            min="0"
                            max="100"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Numerator
                          </label>
                          <input
                            type="number"
                            value={localData.metricSummary.continuedEngagement?.numerator || 0}
                            onChange={(e) => setLocalData({
                              ...localData,
                              metricSummary: {
                                ...localData.metricSummary,
                                continuedEngagement: {
                                  ...localData.metricSummary.continuedEngagement,
                                  numerator: parseInt(e.target.value) || 0
                                }
                              }
                            })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            min="0"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Denominator
                          </label>
                          <input
                            type="number"
                            value={localData.metricSummary.continuedEngagement?.denominator || 0}
                            onChange={(e) => setLocalData({
                              ...localData,
                              metricSummary: {
                                ...localData.metricSummary,
                                continuedEngagement: {
                                  ...localData.metricSummary.continuedEngagement,
                                  denominator: parseInt(e.target.value) || 0
                                }
                              }
                            })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            min="0"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Client Submissions Tab */}
            {activeTab === 'submissions' && (
              <div className="space-y-6">
                {/* CSV Upload Section */}
                <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                  <h4 className="text-md font-medium text-purple-900 mb-2">Upload Client Submissions CSV</h4>
                  <p className="text-sm text-purple-700 mb-3">
                    Upload a CSV file containing quarterly client submission data with columns: quarter, clients_representing, client_names (optional).
                  </p>
                  <div className="flex items-center gap-3">
                    <input
                      type="file"
                      accept=".csv"
                      onChange={handleClientSubmissionsUpload}
                      className="hidden"
                      id="client-submissions-csv-upload"
                      disabled={isLoading}
                    />
                    <label
                      htmlFor="client-submissions-csv-upload"
                      className={`inline-flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors cursor-pointer ${
                        isLoading 
                          ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                          : 'bg-purple-600 text-white hover:bg-purple-700'
                      }`}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      {isLoading ? 'Uploading...' : 'Upload Client Submissions CSV'}
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
                      href="data:text/csv;charset=utf-8,quarter,clients_representing,client_names%0AFY25%20Q1,8,%22Client%20A,Client%20B,Client%20C,Client%20D,Client%20E,Client%20F,Client%20G,Client%20H%22%0AFY25%20Q2,10,%22Client%20A,Client%20B,Client%20C,Client%20D,Client%20E,Client%20F,Client%20G,Client%20H,Client%20I,Client%20J%22%0AFY25%20Q3,12,%22Client%20A,Client%20B,Client%20C,Client%20D,Client%20E,Client%20F,Client%20G,Client%20H,Client%20I,Client%20J,Client%20K,Client%20L%22%0AFY25%20Q4,15,%22Client%20A,Client%20B,Client%20C,Client%20D,Client%20E,Client%20F,Client%20G,Client%20H,Client%20I,Client%20J,Client%20K,Client%20L,Client%20M,Client%20N,Client%20O%22"
                      download="client_submissions_template.csv"
                      className="hover:underline"
                    >
                      Download sample CSV template
                    </a>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-gray-900">Client Submissions by Quarter</h3>
                  <button
                    onClick={addLineChartEntry}
                    className="inline-flex items-center px-3 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Quarter
                  </button>
                </div>

                <div className="space-y-4">
                  {localData.lineChartData.map((entry, index) => (
                    <div key={index} className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-md font-medium text-gray-900">Quarter {index + 1}</h4>
                        <button
                          onClick={() => removeLineChartEntry(index)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Quarter
                          </label>
                          <input
                            type="text"
                            value={entry.quarter}
                            onChange={(e) => updateLineChartEntry(index, 'quarter', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="e.g., FY25 Q1"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Clients Representing
                          </label>
                          <input
                            type="number"
                            value={entry.clientsRepresenting}
                            onChange={(e) => updateLineChartEntry(index, 'clientsRepresenting', parseInt(e.target.value) || 0)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            min="0"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Client Names (comma-separated)
                          </label>
                          <input
                            type="text"
                            value={entry.clients?.join(', ') || ''}
                            onChange={(e) => updateLineChartEntry(index, 'clients', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Client A, Client B, Client C"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Top 10 Requested Features Tab */}
            {activeTab === 'features' && (
              <div className="space-y-6">
                {/* CSV Upload Section - Outside of sub-tabs */}
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                  <h4 className="text-md font-medium text-blue-900 mb-2">Upload Features CSV</h4>
                  <p className="text-sm text-blue-700 mb-3">
                    Upload a CSV file containing both current and previous quarter features. The CSV should include a 'feature_quarter' column with values 'current' or 'previous'.
                  </p>
                  <div className="flex items-center gap-3">
                    <input
                      type="file"
                      accept=".csv"
                      onChange={handleTopFeaturesUpload}
                      className="hidden"
                      id="top-features-csv-upload"
                      disabled={isLoading}
                    />
                    <label
                      htmlFor="top-features-csv-upload"
                      className={`inline-flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors cursor-pointer ${
                        isLoading 
                          ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                          : 'bg-blue-600 text-white hover:bg-blue-700'
                      }`}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      {isLoading ? 'Uploading...' : 'Upload Features CSV'}
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
                      href="data:text/csv;charset=utf-8,feature_name,vote_count,status,status_updated_at,client_voters,feature_quarter%0AAI%20Integration,35,Committed,2025-01-15,%22Client%20A,Client%20B,Client%20C%22,current%0AMobile%20App,25,Under%20Review,2025-02-01,%22Client%20D,Client%20E%22,current%0AReporting%20Tools,20,Delivered,2025-01-30,%22Client%20F,Client%20G%22,previous%0AAPI%20Enhancements,18,Under%20Review,2025-02-15,%22Client%20H,Client%20I%22,previous"
                      download="top_features_template.csv"
                      className="hover:underline"
                    >
                      Download sample CSV template
                    </a>
                  </div>
                </div>

                {/* Sub-tabs for Q3 and Q4 Features */}
                <div className="border-b border-gray-200">
                  <nav className="-mb-px flex space-x-8">
                    <button
                      onClick={() => setActiveSubTab('previous')}
                      className={`py-2 px-1 border-b-2 font-medium text-sm ${
                        activeSubTab === 'previous'
                          ? 'border-green-500 text-green-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      Q3 Features (Previous Quarter)
                    </button>
                    <button
                      onClick={() => setActiveSubTab('current')}
                      className={`py-2 px-1 border-b-2 font-medium text-sm ${
                        activeSubTab === 'current'
                          ? 'border-green-500 text-green-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      Q4 Features (Current Quarter)
                    </button>
                  </nav>
                </div>

                {/* Q4 Features (Current Quarter) */}
                {activeSubTab === 'current' && (
                  <div className="space-y-6">
                    <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                      <h3 className="text-lg font-medium text-green-900 mb-2">Q4 Features (Current Quarter)</h3>
                      <p className="text-sm text-green-700">
                        Features from the current quarter for comparison analysis in the quarterly trends chart.
                      </p>
                    </div>

                    <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                      <h4 className="text-md font-medium text-blue-900 mb-2">Top 10 Requested Features</h4>
                      <p className="text-sm text-blue-700">
                        Manage the top requested features for Q4. These features will be displayed in the quarterly trends comparison chart.
                      </p>
                    </div>

                    <div className="flex items-center justify-between">
                      <h4 className="text-lg font-medium text-gray-900">Current Quarter Features</h4>
                      <button
                        onClick={() => addFeature(true)}
                        className="inline-flex items-center px-3 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Feature
                      </button>
                    </div>

                    <div className="space-y-4">
                      {localData.topFeatures.map((feature, index) => (
                        <div key={index} className="bg-gray-50 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-4">
                            <h5 className="text-md font-medium text-gray-900">Feature {index + 1}</h5>
                            <button
                              onClick={() => removeFeature(index, true)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Feature Name
                              </label>
                              <input
                                type="text"
                                value={feature.feature_name}
                                onChange={(e) => updateFeature(index, 'feature_name', e.target.value, true)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Enter feature name"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Vote Count
                              </label>
                              <input
                                type="number"
                                value={feature.vote_count}
                                onChange={(e) => updateFeature(index, 'vote_count', parseInt(e.target.value) || 0, true)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                min="0"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Status
                              </label>
                              <select
                                value={feature.status}
                                onChange={(e) => updateFeature(index, 'status', e.target.value as 'Delivered' | 'Under Review' | 'Committed', true)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                              >
                                <option value="Under Review">Under Review</option>
                                <option value="Committed">Committed</option>
                                <option value="Delivered">Delivered</option>
                              </select>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Status Updated Date
                              </label>
                              <input
                                type="date"
                                value={feature.status_updated_at ? feature.status_updated_at.split('T')[0] : ''}
                                onChange={(e) => updateFeature(index, 'status_updated_at', e.target.value ? new Date(e.target.value).toISOString() : '', true)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                              />
                            </div>
                            <div className="md:col-span-2">
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Client Voters (comma-separated)
                              </label>
                              <input
                                type="text"
                                value={feature.client_voters.join(', ')}
                                onChange={(e) => updateFeature(index, 'client_voters', e.target.value, true)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Client A, Client B, Client C"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Q3 Features (Previous Quarter) */}
                {activeSubTab === 'previous' && (
                  <div className="space-y-6">
                    <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                      <h3 className="text-lg font-medium text-blue-900 mb-2">Q3 Features (Previous Quarter)</h3>
                      <p className="text-sm text-blue-700">
                        Features from the previous quarter for comparison analysis.
                      </p>
                    </div>

                    <div className="flex items-center justify-between">
                      <h4 className="text-lg font-medium text-gray-900">Previous Quarter Features</h4>
                      <button
                        onClick={() => addFeature(false)}
                        className="inline-flex items-center px-3 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Feature
                      </button>
                    </div>

                    <div className="space-y-4">
                      {(localData.previousQuarterFeatures || []).map((feature, index) => (
                        <div key={index} className="bg-gray-50 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-4">
                            <h5 className="text-md font-medium text-gray-900">Feature {index + 1}</h5>
                            <button
                              onClick={() => removeFeature(index, false)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Feature Name
                              </label>
                              <input
                                type="text"
                                value={feature.feature_name}
                                onChange={(e) => updateFeature(index, 'feature_name', e.target.value, false)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Enter feature name"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Vote Count
                              </label>
                              <input
                                type="number"
                                value={feature.vote_count}
                                onChange={(e) => updateFeature(index, 'vote_count', parseInt(e.target.value) || 0, false)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                min="0"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Status
                              </label>
                              <select
                                value={feature.status}
                                onChange={(e) => updateFeature(index, 'status', e.target.value as 'Delivered' | 'Under Review' | 'Committed', false)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                              >
                                <option value="Under Review">Under Review</option>
                                <option value="Committed">Committed</option>
                                <option value="Delivered">Delivered</option>
                              </select>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Status Updated Date
                              </label>
                              <input
                                type="date"
                                value={feature.status_updated_at ? feature.status_updated_at.split('T')[0] : ''}
                                onChange={(e) => updateFeature(index, 'status_updated_at', e.target.value ? new Date(e.target.value).toISOString() : '', false)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                              />
                            </div>
                            <div className="md:col-span-2">
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Client Voters (comma-separated)
                              </label>
                              <input
                                type="text"
                                value={feature.client_voters.join(', ')}
                                onChange={(e) => updateFeature(index, 'client_voters', e.target.value, false)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Client A, Client B, Client C"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Data Socialization Forums Tab */}
            {activeTab === 'forums' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-gray-900">Data Socialization Forums</h3>
                  <button
                    onClick={addForum}
                    className="inline-flex items-center px-3 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Forum
                  </button>
                </div>

                <div className="space-y-4">
                  {(localData.data_socialization_forums || []).map((forum, index) => (
                    <div key={index} className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-md font-medium text-gray-900">Forum {index + 1}</h4>
                        <button
                          onClick={() => removeForum(index)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                      <div className="grid grid-cols-1 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Forum Name
                          </label>
                          <input
                            type="text"
                            value={forum.name}
                            onChange={(e) => updateForum(index, 'name', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter forum name"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-6 py-4 flex justify-end space-x-3">
            <button
              onClick={handleCancel}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
             disabled={isLocalLoading || isLoading}
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
             {isLocalLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardManagement;
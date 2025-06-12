import React, { useState, useEffect } from 'react';
import { X, Save, Plus, Trash2, Upload } from 'lucide-react';
import { useData } from '../../contexts/DataContext';
import { DashboardData, TopFeature, DataSocializationForum } from '../../types';
import Papa from 'papaparse';

interface DashboardManagementProps {
  isOpen: boolean;
  onClose: () => void;
}

const DashboardManagement: React.FC<DashboardManagementProps> = ({ isOpen, onClose }) => {
  const { dashboardData, updateDashboardData, uploadCrossClientCollaborationCSV, isLoading } = useData();
  const [activeTab, setActiveTab] = useState<'features' | 'collaboration' | 'forums'>('features');
  const [activeSubTab, setActiveSubTab] = useState<'current' | 'previous'>('current');
  const [localData, setLocalData] = useState<DashboardData>(dashboardData || {
    metricSummary: {
      responsiveness: 0,
      roadmapAlignment: { committed: 0, total: 0 },
      continuedEngagement: { rate: 0, numerator: 0, denominator: 0, ideas: [] },
      ideaVolume: { quarterly: 0, total: 0 }
    },
    lineChartData: [],
    topFeatures: [],
    previousQuarterFeatures: [],
    data_socialization_forums: []
  });
  const [isLocalLoading, setIsLocalLoading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<string>('');

  // Handle top features CSV upload
  const handleTopFeaturesUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadStatus('Uploading...');
    try {
      await uploadTopFeaturesCSV(file);
      setUploadStatus('Upload successful!');
      
      // Clear the file input
      event.target.value = '';
      
      // Refresh local data after successful upload
      if (dashboardData) {
        setLocalData(dashboardData);
      }
      
      // Clear success message after 3 seconds
      setTimeout(() => setUploadStatus(''), 3000);
    } catch (error) {
      console.error('Upload failed:', error);
      setUploadStatus('Upload failed. Please try again.');
      setTimeout(() => setUploadStatus(''), 5000);
    }
  };

  useEffect(() => {
    if (dashboardData) {
      setLocalData(dashboardData);
    }
  }, [dashboardData]);

  const handleSave = async () => {
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
    setLocalData(dashboardData || {
      metricSummary: {
        responsiveness: 0,
        roadmapAlignment: { committed: 0, total: 0 },
        continuedEngagement: { rate: 0, numerator: 0, denominator: 0, ideas: [] },
        ideaVolume: { quarterly: 0, total: 0 }
      },
      lineChartData: [],
      topFeatures: [],
      previousQuarterFeatures: [],
      data_socialization_forums: []
    });
    onClose();
  };

  const addFeature = (isCurrentQuarter: boolean) => {
    const newFeature: TopFeature = {
      feature_name: '',
      vote_count: 0,
      status: 'Under Review',
      client_voters: []
    };

    if (isCurrentQuarter) {
      setLocalData(prev => ({
        ...prev,
        topFeatures: [...prev.topFeatures, newFeature]
      }));
    } else {
      setLocalData(prev => ({
        ...prev,
        previousQuarterFeatures: [...(prev.previousQuarterFeatures || []), newFeature]
      }));
    }
  };

  const removeFeature = (index: number, isCurrentQuarter: boolean) => {
    if (isCurrentQuarter) {
      setLocalData(prev => ({
        ...prev,
        topFeatures: prev.topFeatures.filter((_, i) => i !== index)
      }));
    } else {
      setLocalData(prev => ({
        ...prev,
        previousQuarterFeatures: (prev.previousQuarterFeatures || []).filter((_, i) => i !== index)
      }));
    }
  };

  const updateFeature = (index: number, field: keyof TopFeature, value: any, isCurrentQuarter: boolean) => {
    if (isCurrentQuarter) {
      setLocalData(prev => ({
        ...prev,
        topFeatures: prev.topFeatures.map((feature, i) => {
          if (i === index) {
            if (field === 'client_voters' && typeof value === 'string') {
              return { ...feature, [field]: value.split(',').map(v => v.trim()).filter(v => v) };
            }
            return { ...feature, [field]: value };
          }
          return feature;
        })
      }));
    } else {
      setLocalData(prev => ({
        ...prev,
        previousQuarterFeatures: (prev.previousQuarterFeatures || []).map((feature, i) => {
          if (i === index) {
            if (field === 'client_voters' && typeof value === 'string') {
              return { ...feature, [field]: value.split(',').map(v => v.trim()).filter(v => v) };
            }
            return { ...feature, [field]: value };
          }
          return feature;
        })
      }));
    }
  };

  const addForum = () => {
    const newForum: DataSocializationForum = { name: '' };
    setLocalData(prev => ({
      ...prev,
      data_socialization_forums: [...(prev.data_socialization_forums || []), newForum]
    }));
  };

  const removeForum = (index: number) => {
    setLocalData(prev => ({
      ...prev,
      data_socialization_forums: (prev.data_socialization_forums || []).filter((_, i) => i !== index)
    }));
  };

  const updateForum = (index: number, field: keyof DataSocializationForum, value: string) => {
    setLocalData(prev => ({
      ...prev,
      data_socialization_forums: (prev.data_socialization_forums || []).map((forum, i) => 
        i === index ? { ...forum, [field]: value } : forum
      )
    }));
  };

  const handleCollaborationUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadStatus('Uploading...');
    try {
      await uploadCrossClientCollaborationCSV(file);
      setUploadStatus('Upload successful!');
      setTimeout(() => setUploadStatus(''), 3000);
    } catch (error) {
      console.error('Upload failed:', error);
      setUploadStatus('Upload failed. Please try again.');
      setTimeout(() => setUploadStatus(''), 5000);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">Dashboard Management</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex flex-col h-full max-h-[calc(90vh-120px)]">
          {/* Tab Navigation */}
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('features')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'features'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Top Features
              </button>
              <button
                onClick={() => setActiveTab('collaboration')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'collaboration'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Cross-Client Collaboration
              </button>
              <button
                onClick={() => setActiveTab('forums')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'forums'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Data Socialization Forums
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {/* Top Features Tab */}
            {activeTab === 'features' && (
              <div className="space-y-6">
                {/* CSV Upload Section */}
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                  <h4 className="text-md font-medium text-blue-900 mb-2">Upload Top Features CSV</h4>
                  <p className="text-sm text-blue-700 mb-3">
                    Upload a CSV file containing top features data with columns: feature_name, vote_count, status, status_updated_at, client_voters, feature_quarter (current/previous).
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
                      {isLoading ? 'Uploading...' : 'Upload Top Features CSV'}
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

                {/* Sub-tab Navigation */}
                <div className="border-b border-gray-200">
                  <nav className="flex space-x-8">
                    <button
                      onClick={() => setActiveSubTab('current')}
                      className={`py-2 px-1 border-b-2 font-medium text-sm ${
                        activeSubTab === 'current'
                          ? 'border-blue-500 text-blue-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      Current Quarter (Q4)
                    </button>
                    <button
                      onClick={() => setActiveSubTab('previous')}
                      className={`py-2 px-1 border-b-2 font-medium text-sm ${
                        activeSubTab === 'previous'
                          ? 'border-blue-500 text-blue-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      Previous Quarter (Q3)
                    </button>
                  </nav>
                </div>

                {/* Q4 Features (Current Quarter) */}
                {activeSubTab === 'current' && (
                  <div className="space-y-6">
                    <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                      <h3 className="text-lg font-medium text-blue-900 mb-2">Q4 Features (Current Quarter)</h3>
                      <p className="text-sm text-blue-700">
                        Manage the top features for the current quarter. These will be displayed in the main dashboard and quarterly trends comparison.
                      </p>
                    </div>

                    <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                      <h4 className="text-md font-medium text-blue-900 mb-2">Current Quarter Features</h4>
                      <div className="flex justify-end mb-4">
                        <button
                          onClick={() => addFeature(true)}
                          className="inline-flex items-center px-3 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add Feature
                        </button>
                      </div>

                      {localData.topFeatures.map((feature, index) => (
                        <div key={index} className="bg-white rounded-lg p-4 mb-4 shadow-sm">
                          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Feature Name
                              </label>
                              <input
                                type="text"
                                value={feature.feature_name}
                                onChange={(e) => updateFeature(index, 'feature_name', e.target.value, true)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md"
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
                                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                min="0"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Status
                              </label>
                              <select
                                value={feature.status}
                                onChange={(e) => updateFeature(index, 'status', e.target.value, true)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                              >
                                <option value="Under Review">Under Review</option>
                                <option value="Committed">Committed</option>
                                <option value="Delivered">Delivered</option>
                                <option value="Rejected">Rejected</option>
                              </select>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Client Voters
                              </label>
                              <input
                                type="text"
                                value={feature.client_voters.join(', ')}
                                onChange={(e) => updateFeature(index, 'client_voters', e.target.value, true)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                placeholder="Client A, Client B"
                              />
                            </div>
                          </div>
                          <button
                            onClick={() => removeFeature(index, true)}
                            className="mt-2 text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Q3 Features (Previous Quarter) */}
                {activeSubTab === 'previous' && (
                  <div className="space-y-6">
                    <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
                      <h3 className="text-lg font-medium text-yellow-900 mb-2">Q3 Features (Previous Quarter)</h3>
                      <p className="text-sm text-yellow-700">
                        Features from the previous quarter for comparison analysis in the quarterly trends chart.
                      </p>
                    </div>

                    <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                      <h4 className="text-md font-medium text-blue-900 mb-2">Previous Quarter Features</h4>
                      <div className="flex justify-end mb-4">
                        <button
                          onClick={() => addFeature(false)}
                          className="inline-flex items-center px-3 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add Feature
                        </button>
                      </div>

                      {(localData.previousQuarterFeatures || []).map((feature, index) => (
                        <div key={index} className="bg-white rounded-lg p-4 mb-4 shadow-sm">
                          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Feature Name
                              </label>
                              <input
                                type="text"
                                value={feature.feature_name}
                                onChange={(e) => updateFeature(index, 'feature_name', e.target.value, false)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md"
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
                                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                min="0"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Status
                              </label>
                              <select
                                value={feature.status}
                                onChange={(e) => updateFeature(index, 'status', e.target.value, false)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                              >
                                <option value="Under Review">Under Review</option>
                                <option value="Committed">Committed</option>
                                <option value="Delivered">Delivered</option>
                                <option value="Rejected">Rejected</option>
                              </select>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Client Voters
                              </label>
                              <input
                                type="text"
                                value={feature.client_voters.join(', ')}
                                onChange={(e) => updateFeature(index, 'client_voters', e.target.value, false)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                placeholder="Client A, Client B"
                              />
                            </div>
                          </div>
                          <button
                            onClick={() => removeFeature(index, false)}
                            className="mt-2 text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Cross-Client Collaboration Tab */}
            {activeTab === 'collaboration' && (
              <div className="space-y-6">
                {/* CSV Upload Section */}
                <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                  <h4 className="text-md font-medium text-green-900 mb-2">Upload Cross-Client Collaboration CSV</h4>
                  <p className="text-sm text-green-700 mb-3">
                    Upload a CSV file containing quarterly cross-client collaboration data with columns: quarter, collaboration_count.
                  </p>
                  <div className="flex items-center gap-3">
                    <input
                      type="file"
                      accept=".csv"
                      onChange={handleCollaborationUpload}
                      className="hidden"
                      id="collaboration-csv-upload"
                      disabled={isLoading}
                    />
                    <label
                      htmlFor="collaboration-csv-upload"
                      className={`inline-flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors cursor-pointer ${
                        isLoading 
                          ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                          : 'bg-green-600 text-white hover:bg-green-700'
                      }`}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      {isLoading ? 'Uploading...' : 'Upload Collaboration CSV'}
                    </label>
                    {uploadStatus && (
                      <span className={`text-sm ${
                        uploadStatus.includes('successful') ? 'text-green-600' : 
                        uploadStatus.includes('failed') ? 'text-red-600' : 'text-green-600'
                      }`}>
                        {uploadStatus}
                      </span>
                    )}
                  </div>
                  <div className="mt-2 text-xs text-green-600">
                    <a 
                      href="data:text/csv;charset=utf-8,quarter,collaboration_count%0AFY25%20Q1,5%0AFY25%20Q2,8%0AFY25%20Q3,12%0AFY25%20Q4,15"
                      download="collaboration_template.csv"
                      className="hover:underline"
                    >
                      Download sample CSV template
                    </a>
                  </div>
                </div>
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
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
            <div className="flex justify-end space-x-3">
              <button
                onClick={handleCancel}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={isLocalLoading}
                className={`inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md ${
                  isLocalLoading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700'
                }`}
              >
                <Save className="h-4 w-4 mr-2" />
                {isLocalLoading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardManagement;
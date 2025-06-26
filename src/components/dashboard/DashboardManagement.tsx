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
  const { dashboardData, updateDashboardData, uploadCrossClientCollaborationCSV, uploadTopFeaturesCSV, uploadClientSubmissionsCSV, isLoading, currentQuarter } = useData();
  const [activeTab, setActiveTab] = useState<'features' | 'collaboration' | 'client-submissions' | 'forums'>('features');
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

  // Helper function to get previous quarter
  const getPreviousQuarter = (quarter: string): string => {
    const quarterMap: { [key: string]: string } = {
      'FY25 Q1': 'FY24 Q4',
      'FY25 Q2': 'FY25 Q1',
      'FY25 Q3': 'FY25 Q2',
      'FY25 Q4': 'FY25 Q3',
      'FY26 Q1': 'FY25 Q4'
    };
    return quarterMap[quarter] || 'FY25 Q3';
  };

  const previousQuarter = getPreviousQuarter(currentQuarter);

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

  // Handle client submissions CSV upload
  const handleClientSubmissionsUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadStatus('Uploading...');
    try {
      await uploadClientSubmissionsCSV(file);
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
    // Not needed anymore - using single input field
  };

  const removeForum = (index: number) => {
    // Not needed anymore - using single input field
  };

  const updateForums = (value: string) => {
    // Convert comma-separated string to array of forum objects
    const forumNames = value.split(',').map(name => name.trim()).filter(name => name.length > 0);
    const forums = forumNames.map(name => ({ name }));
    
    setLocalData(prev => ({
      ...prev,
      data_socialization_forums: forums
    }));
  };

  // Helper function to get forums as comma-separated string
  const getForumsAsString = () => {
    return (localData.data_socialization_forums || [])
      .map(forum => forum.name)
      .join(', ');
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
                onClick={() => setActiveTab('client-submissions')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'client-submissions'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Client Submissions
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
              <button
                onClick={() => setActiveTab('metrics')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'metrics'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Key Metrics
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
                    <a 
                      href="data:text/csv;charset=utf-8,feature_name,vote_count,status,status_updated_at,client_voters,feature_quarter%0AAI%20Integration,35,Committed,2025-01-15,%22Client%20A,Client%20B,Client%20C%22,current%0AMobile%20App,25,Under%20Review,2025-02-01,%22Client%20D,Client%20E%22,current%0AReporting%20Tools,20,Delivered,2025-01-30,%22Client%20F,Client%20G%22,previous%0AAPI%20Enhancements,18,Under%20Review,2025-02-15,%22Client%20H,Client%20I%22,previous"
                      download="top_features_template.csv"
                      className="text-xs text-blue-600 hover:underline ml-2"
                    >
                      Download template
                    </a>
                  </div>
                </div>

                {/* Manual Feature Management */}
                <div className="space-y-6">
                  <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                    <h3 className="text-lg font-medium text-blue-900 mb-2">Manage Top Features</h3>
                    <p className="text-sm text-blue-700">
                      Add and manage top features manually. These features will be displayed in the Top 10 Trends chart on the dashboard.
                    </p>
                  </div>

                  <div className="bg-white rounded-lg p-4 border border-gray-200">
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="text-md font-medium text-gray-900">Features List</h4>
                      <button
                        onClick={() => addFeature(true)}
                        className="inline-flex items-center px-3 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Feature
                      </button>
                    </div>

                    {/* Current Quarter Features */}
                    <div className="space-y-4">
                      <h5 className="text-sm font-medium text-gray-700 border-b border-gray-200 pb-2">
                        Current Quarter ({currentQuarter}) Features
                      </h5>
                      {localData.topFeatures.length === 0 ? (
                        <p className="text-sm text-gray-500 italic">No features added yet. Click "Add Feature" to get started.</p>
                      ) : (
                        localData.topFeatures.map((feature, index) => (
                          <div key={index} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
                                  placeholder="0"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  Status
                                </label>
                                <select
                                  value={feature.status}
                                  onChange={(e) => updateFeature(index, 'status', e.target.value, true)}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                  placeholder="Client A, Client B, Client C"
                                />
                              </div>
                            </div>
                            <div className="mt-3 flex justify-end">
                              <button
                                onClick={() => removeFeature(index, true)}
                                className="inline-flex items-center px-2 py-1 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors"
                              >
                                <Trash2 className="h-4 w-4 mr-1" />
                                Remove
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>

                    {/* Previous Quarter Features */}
                    <div className="space-y-4 mt-8">
                      <div className="flex justify-between items-center">
                        <h5 className="text-sm font-medium text-gray-700 border-b border-gray-200 pb-2">
                          Previous Quarter ({previousQuarter}) Features
                        </h5>
                        <button
                          onClick={() => addFeature(false)}
                          className="inline-flex items-center px-2 py-1 text-sm font-medium text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200"
                        >
                          <Plus className="h-3 w-3 mr-1" />
                          Add Previous
                        </button>
                      </div>
                      {(localData.previousQuarterFeatures || []).length === 0 ? (
                        <p className="text-sm text-gray-500 italic">No previous quarter features added yet.</p>
                      ) : (
                        (localData.previousQuarterFeatures || []).map((feature, index) => (
                          <div key={index} className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
                                  placeholder="0"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  Status
                                </label>
                                <select
                                  value={feature.status}
                                  onChange={(e) => updateFeature(index, 'status', e.target.value, false)}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                  placeholder="Client A, Client B, Client C"
                                />
                              </div>
                            </div>
                            <div className="mt-3 flex justify-end">
                              <button
                                onClick={() => removeFeature(index, false)}
                                className="inline-flex items-center px-2 py-1 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors"
                              >
                                <Trash2 className="h-4 w-4 mr-1" />
                                Remove
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Cross-Client Collaboration Tab */}
            {activeTab === 'collaboration' && (
              <div className="space-y-6">
                {/* CSV Upload Section */}
                <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                  <h4 className="text-md font-medium text-green-900 mb-2">Upload Cross-Client Collaboration CSV</h4>
                  <p className="text-sm text-green-700 mb-3">
                    Upload a CSV file containing quarterly cross-client collaboration data with columns: quarter, year, collaborative_ideas, total_ideas, collaboration_rate.
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
                      href="data:text/csv;charset=utf-8,quarter,year,collaborative_ideas,total_ideas,collaboration_rate%0AFY25%20Q1,FY25,5,25,20%0AFY25%20Q2,FY25,8,30,27%0AFY25%20Q3,FY25,12,35,34%0AFY25%20Q4,FY25,15,40,38"
                      download="collaboration_template.csv"
                      className="hover:underline"
                    >
                      Download sample CSV template
                    </a>
                  </div>
                </div>
              </div>
            )}

            {/* Key Metrics Tab */}
            {activeTab === 'metrics' && (
              <div className="space-y-6">
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                  <h3 className="text-lg font-medium text-blue-900 mb-2">Key Metrics Configuration</h3>
                  <p className="text-sm text-blue-700">
                    Configure status indicators and thresholds for key dashboard metrics.
                  </p>
                </div>

                {/* Commitment Status Section */}
                <div className="bg-white rounded-lg p-6 border border-gray-200">
                  <h4 className="text-md font-medium text-gray-900 mb-4">Idea Portal Commitment Status</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Current Status
                      </label>
                      <select
                        value={localData.metricSummary.roadmapAlignment.commitmentStatus || 'On Track'}
                        onChange={(e) => setLocalData(prev => ({
                          ...prev,
                          metricSummary: {
                            ...prev.metricSummary,
                            roadmapAlignment: {
                              ...prev.metricSummary.roadmapAlignment,
                              commitmentStatus: e.target.value as 'On Track' | 'Off Track' | 'At Risk'
                            }
                          }
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="On Track">On Track</option>
                        <option value="At Risk">At Risk</option>
                        <option value="Off Track">Off Track</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Status Preview
                      </label>
                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-md">
                        <span className="text-lg font-semibold text-gray-900">
                          {localData.metricSummary.roadmapAlignment.committed}/{localData.metricSummary.roadmapAlignment.total}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          (localData.metricSummary.roadmapAlignment.commitmentStatus || 'On Track') === 'On Track' ? 'bg-green-100 text-green-800' :
                          (localData.metricSummary.roadmapAlignment.commitmentStatus || 'On Track') === 'Off Track' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {localData.metricSummary.roadmapAlignment.commitmentStatus || 'On Track'}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Status Descriptions */}
                  <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                      <div className="flex items-center mb-2">
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          On Track
                        </span>
                      </div>
                      <p className="text-sm text-green-700">
                        Commitments are being delivered on schedule and within expected timelines.
                      </p>
                    </div>
                    <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                      <div className="flex items-center mb-2">
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                          At Risk
                        </span>
                      </div>
                      <p className="text-sm text-yellow-700">
                        Some delays or challenges may impact delivery timelines. Monitoring required.
                      </p>
                    </div>
                    <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                      <div className="flex items-center mb-2">
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          Off Track
                        </span>
                      </div>
                      <p className="text-sm text-red-700">
                        Significant delays or issues are impacting delivery. Immediate attention needed.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}


            {/* Client Submissions Tab */}
            {activeTab === 'client-submissions' && (
              <div className="space-y-6">
                {/* CSV Upload Section */}
                <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                  <h4 className="text-md font-medium text-purple-900 mb-2">Upload Client Submissions CSV</h4>
                  <p className="text-sm text-purple-700 mb-3">
                    Upload a CSV file containing quarterly client submission data with columns: quarter, clients_representing, client_names (optional), idea_id (optional), idea_summary (optional), idea_client_name (optional).
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
                      href={`${import.meta.env.BASE_URL}client_submissions_template.csv?t=${Date.now()}`}
                      download="client_submissions_template.csv"
                      className="hover:underline"
                    >
                      Download sample CSV template
                    </a>
                  </div>
                </div>

                {/* Information Section */}
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                  <h4 className="text-md font-medium text-blue-900 mb-2">About Client Submissions Data</h4>
                  <div className="text-sm text-blue-700 space-y-2">
                    <p>
                      <strong>Purpose:</strong> This data feeds the "Client Submissions by Quarter" line chart on the dashboard.
                    </p>
                    <p>
                      <strong>Required Fields:</strong>
                    </p>
                    <ul className="list-disc list-inside ml-4 space-y-1">
                      <li><code>quarter</code> - The fiscal quarter (e.g., FY25 Q1, FY25 Q2)</li>
                      <li><code>clients_representing</code> - Number of clients who submitted ideas in that quarter</li>
                    </ul>
                    <p>
                      <strong>Optional Fields:</strong>
                    </p>
                    <ul className="list-disc list-inside ml-4 space-y-1">
                      <li><code>client_names</code> - Comma-separated list of client names for detailed drill-down</li>
                      <li><code>idea_id</code> - Unique identifier for each idea (enables detailed idea tracking)</li>
                      <li><code>idea_summary</code> - Brief description of the idea</li>
                      <li><code>idea_client_name</code> - Name of the client who submitted the idea</li>
                    </ul>
                    <p>
                      <strong>Chart Interaction:</strong> Users can click on data points in the line chart to view detailed client information and actual idea lists for each quarter. If idea details are provided in the CSV, they will be displayed; otherwise, sample ideas will be generated.
                    </p>
                  </div>
                </div>
              </div>
            )}
            {/* Data Socialization Forums Tab */}
            {activeTab === 'forums' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Data Socialization Forums</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Enter forum names separated by commas (e.g., CSC, Sprint Reviews, Customer Advisory Board)
                  </p>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Forum Names (comma-separated)
                    </label>
                    <textarea
                      value={getForumsAsString()}
                      onChange={(e) => updateForums(e.target.value)}
                      className="w-full px-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                      placeholder="CSC, Sprint Reviews, Customer Advisory Board (CAB), CWG, Quarterly Product Reviews (QBRs)"
                      rows={3}
                    />
                    <div className="mt-2 text-xs text-gray-500">
                      Current forums: {(localData.data_socialization_forums || []).length} forum(s)
                    </div>
                  </div>
                </div>

                {/* Preview of parsed forums */}
                {(localData.data_socialization_forums || []).length > 0 && (
                  <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                    <h4 className="text-sm font-medium text-blue-900 mb-2">Forum Preview</h4>
                    <div className="flex flex-wrap gap-2">
                      {(localData.data_socialization_forums || []).map((forum, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                        >
                          {forum.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Instructions */}
                <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
                  <h4 className="text-sm font-medium text-yellow-900 mb-2">Instructions</h4>
                  <div className="text-sm text-yellow-700 space-y-1">
                    <p>• Enter each forum name separated by commas</p>
                    <p>• Extra spaces around forum names will be automatically trimmed</p>
                    <p>• Empty forum names will be ignored</p>
                    <p>• These forums will appear in the Data Socialization Forums card on the dashboard</p>
                  </div>
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

export default DashboardManagement
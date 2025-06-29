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
    data_socialization_forums: []
  });
  const [isLocalLoading, setIsLocalLoading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<string>('');

  // Define all available forums
  const allAvailableForums = [
    'CSC',
    'Sprint Reviews',
    'Customer Advisory Board (CAB)',
    'CWG',
    'Quarterly Business Reviews (QBRs)'
  ];

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
      data_socialization_forums: []
    });
    onClose();
  };

  const addFeature = () => {
    const newFeature: TopFeature = {
      feature_name: '',
      vote_count: 0,
      status: 'Under Review',
      client_voters: []
    };

    setLocalData(prev => ({
      ...prev,
      topFeatures: [...prev.topFeatures, newFeature]
    }));
  };

  const removeFeature = (index: number) => {
    setLocalData(prev => ({
      ...prev,
      topFeatures: prev.topFeatures.filter((_, i) => i !== index)
    }));
  };

  const updateFeature = (index: number, field: keyof TopFeature, value: any) => {
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
  };

  // Handle forum toggle
  const handleForumToggle = (forumName: string, isChecked: boolean) => {
    setLocalData(prev => {
      const currentForums = prev.data_socialization_forums || [];
      
      if (isChecked) {
        // Add forum if not already present
        const forumExists = currentForums.some(forum => forum.name === forumName);
        if (!forumExists) {
          return {
            ...prev,
            data_socialization_forums: [...currentForums, { name: forumName }]
          };
        }
      } else {
        // Remove forum
        return {
          ...prev,
          data_socialization_forums: currentForums.filter(forum => forum.name !== forumName)
        };
      }
      
      return prev;
    });
  };

  // Check if a forum is currently enabled
  const isForumEnabled = (forumName: string): boolean => {
    return (localData.data_socialization_forums || []).some(forum => forum.name === forumName);
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
                {/* Action Buttons Header */}
                <div className="flex justify-end items-center gap-3 mb-6">
                  <input
                    type="file"
                    accept=".csv"
                    onChange={handleTopFeaturesUpload}
                    className="hidden"
                    id="top-features-csv-upload"
                    disabled={isLoading}
                  />
                  <button
                    onClick={() => document.getElementById('top-features-csv-upload')?.click()}
                    disabled={isLoading}
                    className={`inline-flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                      isLoading 
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    {isLoading ? 'Uploading...' : 'Upload Top Features CSV'}
                  </button>
                  <button
                    onClick={() => addFeature()}
                    className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Feature
                  </button>
                </div>

                {/* Upload Status */}
                {uploadStatus && (
                  <div className="mb-4">
                    <span className={`text-sm ${
                      uploadStatus.includes('successful') ? 'text-green-600' : 
                      uploadStatus.includes('failed') ? 'text-red-600' : 'text-blue-600'
                    }`}>
                      {uploadStatus}
                    </span>
                  </div>
                )}

                {/* Current Quarter Features */}
                <div className="space-y-4">
                  <h4 className="text-lg font-medium text-gray-900 border-b border-gray-200 pb-2">
                    Top Features
                  </h4>
                  {localData.topFeatures.length === 0 ? (
                    <p className="text-sm text-gray-500 italic">No features added yet. Click "Add Feature" to get started.</p>
                  ) : (
                    localData.topFeatures.map((feature, index) => (
                      <div key={index} className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Feature Name
                            </label>
                            <input
                              type="text"
                              value={feature.feature_name}
                              onChange={(e) => updateFeature(index, 'feature_name', e.target.value)}
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
                              onChange={(e) => updateFeature(index, 'vote_count', parseInt(e.target.value) || 0)}
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
                              onChange={(e) => updateFeature(index, 'status', e.target.value)}
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
                              onChange={(e) => updateFeature(index, 'client_voters', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                              placeholder="Client A, Client B, Client C"
                            />
                          </div>
                        </div>
                        <div className="mt-3 flex justify-end">
                          <button
                            onClick={() => removeFeature(index)}
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
                      href={`/client_submissions_template.csv?v=${Date.now()}`}
                      download="client_submissions_template.csv"
                      className="hover:underline"
                    >
                      Download CSV template
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
                    Select which forums are active for data socialization. Enabled forums will show with a green checkmark on the dashboard, while disabled forums will show with a red X.
                  </p>
                </div>

                <div className="bg-gray-50 rounded-lg p-6">
                  <h4 className="text-md font-medium text-gray-900 mb-4">Available Forums</h4>
                  <div className="space-y-4">
                    {allAvailableForums.map((forumName, index) => {
                      const isEnabled = isForumEnabled(forumName);
                      return (
                        <div
                          key={index}
                          className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex items-center space-x-3">
                            <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center ${
                              isEnabled ? 'bg-green-100' : 'bg-red-100'
                            }`}>
                              {isEnabled ? (
                                <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                              ) : (
                                <svg className="w-4 h-4 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                </svg>
                              )}
                            </div>
                            <div>
                              <h5 className="text-sm font-medium text-gray-900">{forumName}</h5>
                              <p className="text-xs text-gray-500">
                                {isEnabled ? 'Active - will show with green checkmark' : 'Inactive - will show with red X'}
                              </p>
                            </div>
                          </div>
                          <div className="flex-shrink-0">
                            <button
                              onClick={() => handleForumToggle(forumName, !isEnabled)}
                              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                                isEnabled ? 'bg-green-600' : 'bg-gray-200'
                              }`}
                            >
                              <span
                                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                  isEnabled ? 'translate-x-6' : 'translate-x-1'
                                }`}
                              />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Summary */}
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                  <h4 className="text-sm font-medium text-blue-900 mb-2">Forum Status Summary</h4>
                  <div className="text-sm text-blue-700">
                    <p>
                      <strong>Active Forums:</strong> {(localData.data_socialization_forums || []).length} of {allAvailableForums.length}
                    </p>
                    <p className="mt-1">
                      <strong>Coverage:</strong> {Math.round(((localData.data_socialization_forums || []).length / allAvailableForums.length) * 100)}%
                    </p>
                  </div>
                </div>

                {/* Instructions */}
                <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
                  <h4 className="text-sm font-medium text-yellow-900 mb-2">How it Works</h4>
                  <div className="text-sm text-yellow-700 space-y-1">
                    <p>• Toggle forums on/off using the switches on the right</p>
                    <p>• Enabled forums will display with a green checkmark (✓) on the dashboard</p>
                    <p>• Disabled forums will display with a red X (✗) on the dashboard</p>
                    <p>• Changes are saved when you click "Save Changes" at the bottom</p>
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
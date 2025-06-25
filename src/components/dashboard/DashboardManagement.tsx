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
  const { dashboards, saveDashboard, isLoading } = useData();
  const [selectedProduct, setSelectedProduct] = useState<string>('');
  const [selectedQuarter, setSelectedQuarter] = useState<string>('');
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [isLocalLoading, setIsLocalLoading] = useState(false);

  const products = Array.from(new Set(dashboards.map(d => d.product))).sort();
  const quarters = Array.from(new Set(dashboards.map(d => d.quarter))).sort();

  useEffect(() => {
    if (selectedProduct && selectedQuarter) {
      const dashboard = dashboards.find(d => d.product === selectedProduct && d.quarter === selectedQuarter);
      setDashboardData(dashboard?.data || null);
    }
  }, [selectedProduct, selectedQuarter, dashboards]);

  const handleSave = async () => {
    if (!selectedProduct || !selectedQuarter || !dashboardData) return;

    setIsLocalLoading(true);
    try {
      await saveDashboard(selectedProduct, selectedQuarter, dashboardData);
      onClose();
    } catch (error) {
      console.error('Failed to save dashboard:', error);
    } finally {
      setIsLocalLoading(false);
    }
  };

  const handleCancel = () => {
    onClose();
  };

  const handleTopFeatureChange = (index: number, field: keyof TopFeature, value: string | number) => {
    if (!dashboardData) return;

    const updatedFeatures = [...(dashboardData.topFeatures || [])];
    updatedFeatures[index] = { ...updatedFeatures[index], [field]: value };
    setDashboardData({ ...dashboardData, topFeatures: updatedFeatures });
  };

  const addTopFeature = () => {
    if (!dashboardData) return;

    const newFeature: TopFeature = { name: '', votes: 0 };
    setDashboardData({
      ...dashboardData,
      topFeatures: [...(dashboardData.topFeatures || []), newFeature]
    });
  };

  const removeTopFeature = (index: number) => {
    if (!dashboardData) return;

    const updatedFeatures = dashboardData.topFeatures?.filter((_, i) => i !== index) || [];
    setDashboardData({ ...dashboardData, topFeatures: updatedFeatures });
  };

  const handleForumChange = (index: number, field: keyof DataSocializationForum, value: string | number) => {
    if (!dashboardData) return;

    const updatedForums = [...(dashboardData.dataSocializationForums || [])];
    updatedForums[index] = { ...updatedForums[index], [field]: value };
    setDashboardData({ ...dashboardData, dataSocializationForums: updatedForums });
  };

  const addForum = () => {
    if (!dashboardData) return;

    const newForum: DataSocializationForum = { name: '', participants: 0 };
    setDashboardData({
      ...dashboardData,
      dataSocializationForums: [...(dashboardData.dataSocializationForums || []), newForum]
    });
  };

  const removeForum = (index: number) => {
    if (!dashboardData) return;

    const updatedForums = dashboardData.dataSocializationForums?.filter((_, i) => i !== index) || [];
    setDashboardData({ ...dashboardData, dataSocializationForums: updatedForums });
  };

  const handleCsvUpload = (event: React.ChangeEvent<HTMLInputElement>, type: 'features' | 'forums') => {
    const file = event.target.files?.[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      complete: (results) => {
        if (type === 'features') {
          const features: TopFeature[] = results.data.map((row: any) => ({
            name: row.name || row.feature || '',
            votes: parseInt(row.votes || row.count || '0') || 0
          })).filter(f => f.name);
          
          setDashboardData({
            ...dashboardData,
            topFeatures: features
          });
        } else {
          const forums: DataSocializationForum[] = results.data.map((row: any) => ({
            name: row.name || row.forum || '',
            participants: parseInt(row.participants || row.count || '0') || 0
          })).filter(f => f.name);
          
          setDashboardData({
            ...dashboardData,
            dataSocializationForums: forums
          });
        }
      }
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Dashboard Management</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {/* Product and Quarter Selection */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Product</label>
              <select
                value={selectedProduct}
                onChange={(e) => setSelectedProduct(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Product</option>
                {products.map(product => (
                  <option key={product} value={product}>{product}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Quarter</label>
              <select
                value={selectedQuarter}
                onChange={(e) => setSelectedQuarter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Quarter</option>
                {quarters.map(quarter => (
                  <option key={quarter} value={quarter}>{quarter}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Dashboard Data Management */}
          {selectedProduct && selectedQuarter && (
            <div className="space-y-6">
              {/* Top Features Section */}
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-md font-medium text-blue-900">Top Features</h4>
                  <div className="flex space-x-2">
                    <label className="inline-flex items-center px-3 py-1 text-xs font-medium text-blue-700 bg-blue-100 rounded-full cursor-pointer hover:bg-blue-200">
                      <Upload className="h-3 w-3 mr-1" />
                      Upload CSV
                      <input
                        type="file"
                        accept=".csv"
                        onChange={(e) => handleCsvUpload(e, 'features')}
                        className="hidden"
                      />
                    </label>
                    <button
                      onClick={addTopFeature}
                      className="inline-flex items-center px-3 py-1 text-xs font-medium text-blue-700 bg-blue-100 rounded-full hover:bg-blue-200"
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      Add Feature
                    </button>
                  </div>
                </div>
                
                <div className="space-y-2">
                  {dashboardData?.topFeatures?.map((feature, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={feature.name}
                        onChange={(e) => handleTopFeatureChange(index, 'name', e.target.value)}
                        placeholder="Feature name"
                        className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded"
                      />
                      <input
                        type="number"
                        value={feature.votes}
                        onChange={(e) => handleTopFeatureChange(index, 'votes', parseInt(e.target.value) || 0)}
                        placeholder="Votes"
                        className="w-20 px-2 py-1 text-sm border border-gray-300 rounded"
                      />
                      <button
                        onClick={() => removeTopFeature(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Data Socialization Forums Section */}
              <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-md font-medium text-green-900">Data Socialization Forums</h4>
                  <div className="flex space-x-2">
                    <label className="inline-flex items-center px-3 py-1 text-xs font-medium text-green-700 bg-green-100 rounded-full cursor-pointer hover:bg-green-200">
                      <Upload className="h-3 w-3 mr-1" />
                      Upload CSV
                      <input
                        type="file"
                        accept=".csv"
                        onChange={(e) => handleCsvUpload(e, 'forums')}
                        className="hidden"
                      />
                    </label>
                    <button
                      onClick={addForum}
                      className="inline-flex items-center px-3 py-1 text-xs font-medium text-green-700 bg-green-100 rounded-full hover:bg-green-200"
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      Add Forum
                    </button>
                  </div>
                </div>
                
                <div className="space-y-2">
                  {dashboardData?.dataSocializationForums?.map((forum, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={forum.name}
                        onChange={(e) => handleForumChange(index, 'name', e.target.value)}
                        placeholder="Forum name"
                        className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded"
                      />
                      <input
                        type="number"
                        value={forum.participants}
                        onChange={(e) => handleForumChange(index, 'participants', parseInt(e.target.value) || 0)}
                        placeholder="Participants"
                        className="w-20 px-2 py-1 text-sm border border-gray-300 rounded"
                      />
                      <button
                        onClick={() => removeForum(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
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
  );
};

export default DashboardManagement;
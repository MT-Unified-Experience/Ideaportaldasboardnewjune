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
  const [activeTab, setActiveTab] = useState<'overview' | 'features' | 'forums'>('overview');

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

  const handleFeatureAdd = () => {
    if (!dashboardData) return;
    
    const newFeature: TopFeature = {
      name: '',
      value: 0,
      percentage: 0
    };

    setDashboardData({
      ...dashboardData,
      topFeatures: [...(dashboardData.topFeatures || []), newFeature]
    });
  };

  const handleFeatureUpdate = (index: number, field: keyof TopFeature, value: string | number) => {
    if (!dashboardData) return;

    const updatedFeatures = [...(dashboardData.topFeatures || [])];
    updatedFeatures[index] = { ...updatedFeatures[index], [field]: value };

    setDashboardData({
      ...dashboardData,
      topFeatures: updatedFeatures
    });
  };

  const handleFeatureDelete = (index: number) => {
    if (!dashboardData) return;

    const updatedFeatures = [...(dashboardData.topFeatures || [])];
    updatedFeatures.splice(index, 1);

    setDashboardData({
      ...dashboardData,
      topFeatures: updatedFeatures
    });
  };

  const handleForumAdd = () => {
    if (!dashboardData) return;
    
    const newForum: DataSocializationForum = {
      name: '',
      value: 0
    };

    setDashboardData({
      ...dashboardData,
      dataSocializationForums: [...(dashboardData.dataSocializationForums || []), newForum]
    });
  };

  const handleForumUpdate = (index: number, field: keyof DataSocializationForum, value: string | number) => {
    if (!dashboardData) return;

    const updatedForums = [...(dashboardData.dataSocializationForums || [])];
    updatedForums[index] = { ...updatedForums[index], [field]: value };

    setDashboardData({
      ...dashboardData,
      dataSocializationForums: updatedForums
    });
  };

  const handleForumDelete = (index: number) => {
    if (!dashboardData) return;

    const updatedForums = [...(dashboardData.dataSocializationForums || [])];
    updatedForums.splice(index, 1);

    setDashboardData({
      ...dashboardData,
      dataSocializationForums: updatedForums
    });
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
            value: parseInt(row.value || row.count || '0'),
            percentage: parseFloat(row.percentage || '0')
          })).filter(f => f.name);

          setDashboardData({
            ...dashboardData!,
            topFeatures: features
          });
        } else {
          const forums: DataSocializationForum[] = results.data.map((row: any) => ({
            name: row.name || row.forum || '',
            value: parseInt(row.value || row.count || '0')
          })).filter(f => f.name);

          setDashboardData({
            ...dashboardData!,
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
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6">
            {/* Product and Quarter Selection */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Product
                </label>
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
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quarter
                </label>
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

            {/* Tabs */}
            {selectedProduct && selectedQuarter && (
              <div className="border-b border-gray-200 mb-6">
                <nav className="-mb-px flex space-x-8">
                  {[
                    { id: 'overview', label: 'Overview' },
                    { id: 'features', label: 'Top Features' },
                    { id: 'forums', label: 'Data Socialization Forums' }
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`py-2 px-1 border-b-2 font-medium text-sm ${
                        activeTab === tab.id
                          ? 'border-blue-500 text-blue-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </nav>
              </div>
            )}

            {/* Tab Content */}
            {selectedProduct && selectedQuarter && dashboardData && (
              <div>
                {activeTab === 'overview' && (
                  <div className="space-y-6">
                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <h4 className="text-md font-medium text-gray-900 mb-2">Dashboard Overview</h4>
                      <p className="text-sm text-gray-600">
                        Managing data for {selectedProduct} - {selectedQuarter}
                      </p>
                      <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="font-medium">Top Features:</span> {dashboardData.topFeatures?.length || 0} items
                        </div>
                        <div>
                          <span className="font-medium">Forums:</span> {dashboardData.dataSocializationForums?.length || 0} items
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'features' && (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h4 className="text-md font-medium text-gray-900">Top Features</h4>
                      <div className="flex space-x-2">
                        <label className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 cursor-pointer">
                          <Upload className="h-4 w-4 mr-2" />
                          Upload CSV
                          <input
                            type="file"
                            accept=".csv"
                            onChange={(e) => handleCsvUpload(e, 'features')}
                            className="hidden"
                          />
                        </label>
                        <button
                          onClick={handleFeatureAdd}
                          className="inline-flex items-center px-3 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add Feature
                        </button>
                      </div>
                    </div>

                    <div className="space-y-3">
                      {dashboardData.topFeatures?.map((feature, index) => (
                        <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                          <input
                            type="text"
                            value={feature.name}
                            onChange={(e) => handleFeatureUpdate(index, 'name', e.target.value)}
                            placeholder="Feature name"
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                          <input
                            type="number"
                            value={feature.value}
                            onChange={(e) => handleFeatureUpdate(index, 'value', parseInt(e.target.value) || 0)}
                            placeholder="Value"
                            className="w-24 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                          <input
                            type="number"
                            step="0.1"
                            value={feature.percentage}
                            onChange={(e) => handleFeatureUpdate(index, 'percentage', parseFloat(e.target.value) || 0)}
                            placeholder="Percentage"
                            className="w-28 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                          <button
                            onClick={() => handleFeatureDelete(index)}
                            className="p-2 text-red-600 hover:text-red-800"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === 'forums' && (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h4 className="text-md font-medium text-gray-900">Data Socialization Forums</h4>
                      <div className="flex space-x-2">
                        <label className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 cursor-pointer">
                          <Upload className="h-4 w-4 mr-2" />
                          Upload CSV
                          <input
                            type="file"
                            accept=".csv"
                            onChange={(e) => handleCsvUpload(e, 'forums')}
                            className="hidden"
                          />
                        </label>
                        <button
                          onClick={handleForumAdd}
                          className="inline-flex items-center px-3 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add Forum
                        </button>
                      </div>
                    </div>

                    <div className="space-y-3">
                      {dashboardData.dataSocializationForums?.map((forum, index) => (
                        <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                          <input
                            type="text"
                            value={forum.name}
                            onChange={(e) => handleForumUpdate(index, 'name', e.target.value)}
                            placeholder="Forum name"
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                          <input
                            type="number"
                            value={forum.value}
                            onChange={(e) => handleForumUpdate(index, 'value', parseInt(e.target.value) || 0)}
                            placeholder="Value"
                            className="w-24 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                          <button
                            onClick={() => handleForumDelete(index)}
                            className="p-2 text-red-600 hover:text-red-800"
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
          </div>
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
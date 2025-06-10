import React, { useState } from 'react';
import { useEffect } from 'react';
import { useData } from '../contexts/DataContext';
import ProductTabs from '../components/navigation/ProductTabs';
import ActionItemsPanel from '../components/dashboard/ActionItemsPanel';
import QuarterTabs from '../components/navigation/QuarterTabs';
import DashboardManagement from '../components/dashboard/DashboardManagement';
import { CsvUploader } from '../components/upload/CsvUploader';
import { DashboardGrid } from '../components/dashboard';
import { BarChart2, Edit, ListTodo, Settings } from 'lucide-react';
import ShareButton from '../components/common/ShareButton';
import SettingsModal from '../components/common/SettingsModal';

interface WidgetSettings {
  responsiveness: boolean;
  commitment: boolean;
  continuedEngagement: boolean;
  ideaDistribution: boolean;
  clientSubmissions: boolean;
  topFeatures: boolean;
  dataSocialization: boolean;
}

const SETTINGS_STORAGE_KEY = 'dashboard-widget-settings';

const getStoredSettings = (): WidgetSettings => {
  try {
    const stored = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Error loading stored settings:', error);
  }
  
  // Return default settings if nothing stored or error occurred
  return {
    responsiveness: true,
    commitment: true,
    continuedEngagement: true,
    ideaDistribution: true,
    clientSubmissions: true,
    topFeatures: true,
    dataSocialization: true,
  };
};

const saveSettings = (settings: WidgetSettings): void => {
  try {
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
  } catch (error) {
    console.error('Error saving settings:', error);
  }
};

const DashboardLayout: React.FC = () => {
  const { currentProduct, currentQuarter, dashboardData } = useData();
  const [isManagementOpen, setIsManagementOpen] = useState(false);
  const [isActionItemsOpen, setIsActionItemsOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [widgetSettings, setWidgetSettings] = useState<WidgetSettings>(getStoredSettings);

  // Load settings from localStorage on component mount
  useEffect(() => {
    const storedSettings = getStoredSettings();
    setWidgetSettings(storedSettings);
  }, []);

  // Handle settings change and save to localStorage
  const handleSettingsChange = (newSettings: WidgetSettings) => {
    setWidgetSettings(newSettings);
    saveSettings(newSettings);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center">
              <BarChart2 className="h-8 w-8 text-blue-600 mr-3" />
              <h1 className="text-xl font-bold text-gray-900">Idea Portal Dashboard</h1>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsSettingsOpen(true)}
                className="inline-flex items-center px-3 py-2 bg-white text-gray-700 text-sm font-medium rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200 border border-gray-200"
              >
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </button>
              <ShareButton />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Product Navigation */}
        <div className="mb-6">
          <ProductTabs />
        </div>

        {/* Quarter Navigation and CSV Upload */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-800 mb-2">
              {currentProduct} - {currentQuarter}
            </h2>
            <QuarterTabs />
          </div>
          
          <div className="w-full md:w-auto flex items-center justify-end">
            <div className="flex items-start gap-3">
              <div className="edit-dashboard-wrapper mt-0 items-top">
                <button
                  onClick={() => setIsActionItemsOpen(true)}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200 mr-2"
                >
                  <ListTodo className="h-4 w-4 mr-2" />
                  View Action Items
                </button>
                <button
                  onClick={() => setIsManagementOpen(true)}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Dashboard
                </button>
              </div>
              <CsvUploader />
            </div>
          </div>
        </div>

        {/* Dashboard Content */}
        {dashboardData ? (
          <DashboardGrid 
            data={dashboardData} 
            currentQuarter={currentQuarter} 
            widgetSettings={widgetSettings}
          />
        ) : (
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 text-center">
            <p className="text-gray-500">No data available for this product and quarter.</p>
          </div>
        )}

        <DashboardManagement
          isOpen={isManagementOpen}
          onClose={() => setIsManagementOpen(false)}
          widgetSettings={widgetSettings}
        />

        <ActionItemsPanel
          isOpen={isActionItemsOpen}
          onClose={() => setIsActionItemsOpen(false)}
        />

        <SettingsModal
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
          widgetSettings={widgetSettings}
          onSettingsChange={handleSettingsChange}
        />

      </main>
    </div>
  );
};

export default DashboardLayout;
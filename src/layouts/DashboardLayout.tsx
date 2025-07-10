import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import ProductTabs from '../components/navigation/ProductTabs';
import ActionItemsPanel from '../components/dashboard/ActionItemsPanel';
import QuarterTabs from '../components/navigation/QuarterTabs';
import DashboardManagement from '../components/dashboard/DashboardManagement';
import { DashboardGrid } from '../components/dashboard';
import { BarChart2, Edit, ListTodo, Settings, RefreshCw, LogOut, User, ChevronDown } from 'lucide-react';
import SettingsModal from '../components/common/SettingsModal';

interface WidgetSettings {
  responsiveness: boolean;
  commitment: boolean;
  continuedEngagement: boolean;
  collaborationTrend: boolean;
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
    collaborationTrend: true,
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
  const { currentProduct, currentQuarter, dashboardData, refreshDashboardData, isLoading } = useData();
  const { user, logout } = useAuth();
  
  // Calculate user initials
  const userInitials = useMemo(() => {
    if (user?.user_metadata?.full_name) {
      // Get initials from full name
      return user.user_metadata.full_name
        .split(' ')
        .map((name: string) => name.charAt(0))
        .join('')
        .toUpperCase()
        .slice(0, 2); // Limit to 2 characters
    } else if (user?.email) {
      // Get first letter from email
      return user.email.charAt(0).toUpperCase();
    }
    return 'U'; // Fallback
  }, [user]);
  
  const dashboardRef = React.useRef<HTMLDivElement>(null);
  const [isManagementOpen, setIsManagementOpen] = useState(false);
  const [isActionItemsOpen, setIsActionItemsOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [widgetSettings, setWidgetSettings] = useState<WidgetSettings>(getStoredSettings);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

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

  // Handle clicks outside dropdown to close it
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleRefresh = async () => {
    try {
      await refreshDashboardData();
    } catch (error) {
      console.error('Error refreshing data:', error);
    }
  };

  const handleLogout = () => {
    setIsDropdownOpen(false);
    logout();
  };

  const handleSettingsClick = () => {
    setIsDropdownOpen(false);
    setIsSettingsOpen(true);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center w-48">
              <img 
                src="https://i.postimg.cc/GtRsttRk/CLC-Color.png" 
                alt="Mitratech CLC" 
                className="h-8 w-32 object-contain mr-3"
              />
            </div>
            <div className="flex items-center gap-3">
              {/* Refresh Button */}
              <button
                onClick={handleRefresh}
                disabled={isLoading}
                className={`inline-flex items-center p-2 bg-white text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200 border border-gray-200 ${
                  isLoading ? 'opacity-50 cursor-not-allowed' : ''
                }`}
                title={isLoading ? 'Refreshing...' : 'Refresh'}
              >
                <RefreshCw className={`h-6 w-6 ${isLoading ? 'animate-spin' : ''}`} />
              </button>
              
              {/* User Profile Dropdown */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                >
                  <div className="h-8 w-8 rounded-full bg-purple-600 flex items-center justify-center">
                    <span className="text-white font-semibold text-sm">
                      {userInitials}
                    </span>
                  </div>
                  <ChevronDown className={`h-5 w-5 text-gray-600 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown Menu */}
                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 py-1 z-50">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-900">
                        {user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User'}
                      </p>
                      <p className="text-xs text-gray-500">{user?.email}</p>
                    </div>
                    
                    <button
                      onClick={handleSettingsClick}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                    >
                      <Settings className="h-4 w-4 mr-3" />
                      Settings
                    </button>
                    
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center"
                    >
                      <LogOut className="h-4 w-4 mr-3" />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main ref={dashboardRef} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
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
import React, { useState } from 'react';
import { X, Settings, Eye, EyeOff, Save } from 'lucide-react';

interface WidgetSettings {
  responsiveness: boolean;
  commitment: boolean;
  collaboration: boolean;
  collaborationTrend: boolean;
  continuedEngagement: boolean;
  agingIdeas: boolean;
  clientSubmissions: boolean;
  topFeatures: boolean;
  dataSocialization: boolean;
}

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  widgetSettings: WidgetSettings;
  onSettingsChange: (settings: WidgetSettings) => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  widgetSettings,
  onSettingsChange,
}) => {
  const [localSettings, setLocalSettings] = useState<WidgetSettings>(widgetSettings);

  const handleToggle = (widget: keyof WidgetSettings) => {
    const newSettings = {
      ...localSettings,
      [widget]: !localSettings[widget],
    };
    setLocalSettings(newSettings);
    onSettingsChange(newSettings);
  };

  const widgets = [
    { key: 'responsiveness' as keyof WidgetSettings, label: 'Responsiveness Card', description: 'Shows response time metrics' },
    { key: 'commitment' as keyof WidgetSettings, label: 'Idea Portal Commitment Card', description: 'Displays commitment progress' },
    { key: 'continuedEngagement' as keyof WidgetSettings, label: 'Continued Engagement Rate Card', description: 'Tracks follow-up on reviewed ideas' },
    { key: 'collaborationTrend' as keyof WidgetSettings, label: 'Cross-Client Collaboration Trend', description: 'Shows collaboration trends across quarters' },
    { key: 'clientSubmissions' as keyof WidgetSettings, label: 'Client Submissions Chart', description: 'Quarterly submission trends' },
    { key: 'topFeatures' as keyof WidgetSettings, label: 'Top Features Chart', description: 'Most requested features' },
    { key: 'dataSocialization' as keyof WidgetSettings, label: 'Data Socialization Forums', description: 'Discussion forums overview' },
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-gray-500 bg-opacity-75">
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative transform overflow-hidden rounded-lg bg-white w-full max-w-2xl shadow-xl">
          <div className="bg-white px-6 py-4">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                  <Settings className="h-6 w-6 text-blue-600" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900 ml-4">
                  Dashboard Settings
                </h2>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-500 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Widget Visibility</h3>
              <p className="text-sm text-gray-600 mb-4">
                Control which widgets are displayed on your dashboard
              </p>
            </div>

            <div className="space-y-4 max-h-96 overflow-y-auto">
              {widgets.map((widget) => (
                <div
                  key={widget.key}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      {localSettings[widget.key] ? (
                        <Eye className="h-5 w-5 text-green-600" />
                      ) : (
                        <EyeOff className="h-5 w-5 text-gray-400" />
                      )}
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">
                        {widget.label}
                      </h4>
                      <p className="text-xs text-gray-500">
                        {widget.description}
                      </p>
                    </div>
                  </div>
                  <div className="flex-shrink-0">
                    <button
                      onClick={() => handleToggle(widget.key)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                        localSettings[widget.key]
                          ? 'bg-blue-600'
                          : 'bg-gray-200'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          localSettings[widget.key]
                            ? 'translate-x-6'
                            : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gray-50 px-6 py-4 flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
            >
              Close
            </button>
            <button
              onClick={onClose}
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
            >
              <Save className="h-4 w-4 mr-2" />
              Save & Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
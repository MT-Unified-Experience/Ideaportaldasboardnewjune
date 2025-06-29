import React from 'react';
import { StackedBarData, LineChartData } from '../../types';
import LineChart from './LineChart';
import CrossClientCollaborationTrend from './CrossClientCollaborationTrend';
import DataSocializationCard from './DataSocializationCard';

interface WidgetSettings {
  clientSubmissions: boolean;
  dataSocialization?: boolean;
}

interface ChartsSectionProps {
  lineChartData: LineChartData[];
  widgetSettings: WidgetSettings;
  showCollaborationTrend?: boolean;
}

const ChartsSection: React.FC<ChartsSectionProps> = ({ 
  lineChartData, 
  widgetSettings,
  showCollaborationTrend = true
}) => {
  // Don't render if no charts are visible
  if (!widgetSettings.clientSubmissions && !showCollaborationTrend && !widgetSettings.dataSocialization) {
    return null;
  }

  return (
    <div className="space-y-4 lg:space-y-6 w-full">
      {/* Cross-Client Collaboration Trend and Client Submissions */}
      {(showCollaborationTrend || widgetSettings.clientSubmissions) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 lg:gap-6 w-full">
          {/* Cross-Client Collaboration Trend */}
          {showCollaborationTrend && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5 lg:col-span-1">
              <CrossClientCollaborationTrend
                isOpen={true}
                onClose={() => {}}
                embedded={true}
              />
            </div>
          )}
          
          {/* Client Submissions Chart */}
          {widgetSettings.clientSubmissions && (
            <div className="lg:col-span-1">
              <LineChart data={lineChartData} />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ChartsSection;
import React from 'react';
import { StackedBarData, LineChartData } from '../../types';
import HorizontalStackedBarChart from './HorizontalStackedBarChart';
import LineChart from './LineChart';
import CrossClientCollaborationTrend from './CrossClientCollaborationTrend';

interface WidgetSettings {
  ideaDistribution: boolean;
  clientSubmissions: boolean;
}

interface ChartsSectionProps {
  stackedBarData: StackedBarData[];
  lineChartData: LineChartData[];
  widgetSettings: WidgetSettings;
  showCollaborationTrend?: boolean;
}

const ChartsSection: React.FC<ChartsSectionProps> = ({ 
  stackedBarData, 
  lineChartData, 
  widgetSettings,
  showCollaborationTrend = true
}) => {
  // Don't render if no charts are visible
  if (!widgetSettings.ideaDistribution && !widgetSettings.clientSubmissions && !showCollaborationTrend) {
    return null;
  }

  return (
    <div className="space-y-4 lg:space-y-6 w-full">
      {/* Idea Distribution Chart */}
      {widgetSettings.ideaDistribution && (
        <div className="grid grid-cols-1 gap-3 lg:gap-6 w-full">
          <HorizontalStackedBarChart data={stackedBarData} />
        </div>
      )}

      {/* Cross-Client Collaboration Trend and Client Submissions in Same Row */}
      {(showCollaborationTrend || widgetSettings.clientSubmissions) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 lg:gap-6 w-full">
          {/* Cross-Client Collaboration Trend */}
          {showCollaborationTrend && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
              <CrossClientCollaborationTrend
                isOpen={true}
                onClose={() => {}}
                embedded={true}
              />
            </div>
          )}
          
          {/* Client Submissions Chart */}
          {widgetSettings.clientSubmissions && (
            <div className={showCollaborationTrend ? "" : "col-span-full"}>
              <LineChart data={lineChartData} />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ChartsSection;
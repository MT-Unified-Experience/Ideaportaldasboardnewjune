import React from 'react';
import { StackedBarData, LineChartData } from '../../types';
import HorizontalStackedBarChart from './HorizontalStackedBarChart';
import LineChart from './LineChart';

interface WidgetSettings {
  ideaDistribution: boolean;
  clientSubmissions: boolean;
}

interface ChartsSectionProps {
  stackedBarData: StackedBarData[];
  lineChartData: LineChartData[];
  widgetSettings: WidgetSettings;
}

const ChartsSection: React.FC<ChartsSectionProps> = ({ 
  stackedBarData, 
  lineChartData, 
  widgetSettings 
}) => {
  // Don't render if no charts are visible
  if (!widgetSettings.ideaDistribution && !widgetSettings.clientSubmissions) {
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

      {/* Client Submissions Chart */}
      {widgetSettings.clientSubmissions && (
        <div className="grid grid-cols-1 gap-3 lg:gap-6 w-full">
          <LineChart data={lineChartData} />
        </div>
      )}
    </div>
  );
};

export default ChartsSection;
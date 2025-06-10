import React from 'react';
import { Feature } from '../../types';
import { TopFeaturesChart } from './TopFeaturesChart';
import DataSocializationCard from './DataSocializationCard';

interface WidgetSettings {
  topFeatures: boolean;
  dataSocialization: boolean;
}

interface FeaturesAndForumsSectionProps {
  topFeatures: Feature[];
  widgetSettings: WidgetSettings;
  showDataSocializationInCharts?: boolean;
}

const FeaturesAndForumsSection: React.FC<FeaturesAndForumsSectionProps> = ({ 
  topFeatures, 
  widgetSettings,
  showDataSocializationInCharts = false
}) => {
  // Don't render if no widgets are visible
  if (!widgetSettings.topFeatures && (!widgetSettings.dataSocialization || showDataSocializationInCharts)) {
    return null;
  }

  return (
    <div className="space-y-4 lg:space-y-6 w-full">
      {/* Top Features Layout */}
      <div className="grid grid-cols-1 gap-3 lg:gap-6 w-full">
        {widgetSettings.topFeatures && (
          <div className="col-span-full">
            <TopFeaturesChart features={topFeatures} />
          </div>
        )}
      </div>
    </div>
  );
};

export default FeaturesAndForumsSection;
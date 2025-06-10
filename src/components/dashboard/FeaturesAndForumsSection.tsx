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
}

const FeaturesAndForumsSection: React.FC<FeaturesAndForumsSectionProps> = ({ 
  topFeatures, 
  widgetSettings 
}) => {
  // Don't render if no widgets are visible
  if (!widgetSettings.topFeatures && !widgetSettings.dataSocialization) {
    return null;
  }

  return (
    <div className="space-y-4 lg:space-y-6 w-full">
      {/* Data Socialization and Top Features Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-3 lg:gap-6 w-full">
        {widgetSettings.dataSocialization && (
          <div className="lg:col-span-2">
            <DataSocializationCard />
          </div>
        )}
        
        {widgetSettings.topFeatures && (
          <div className={widgetSettings.dataSocialization ? "lg:col-span-3" : "col-span-full"}>
            <TopFeaturesChart features={topFeatures} />
          </div>
        )}
      </div>
    </div>
  );
};

export default FeaturesAndForumsSection;
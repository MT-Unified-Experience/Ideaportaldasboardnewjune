import React from 'react';
import { DashboardData } from '../../types';
import DashboardSection from './DashboardSection';
import MetricCardsSection from './MetricCardsSection';
import ChartsSection from './ChartsSection';
import FeaturesAndForumsSection from './FeaturesAndForumsSection';
import DataSocializationCard from './DataSocializationCard';

interface WidgetSettings {
  responsiveness: boolean;
  commitment: boolean;
  continuedEngagement: boolean;
  ideaDistribution: boolean;
  clientSubmissions: boolean;
  topFeatures: boolean;
  dataSocialization: boolean;
}

interface DashboardGridProps {
  data: DashboardData;
  currentQuarter: string;
  widgetSettings: WidgetSettings;
}

export const DashboardGrid: React.FC<DashboardGridProps> = ({ 
  data, 
  currentQuarter, 
  widgetSettings 
}) => {
  const { metricSummary, stackedBarData, lineChartData, topFeatures } = data;

  return (
    <DashboardSection spacing="md">
      {/* First Row: Metric Summary Cards + Data Socialization Forums */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-3 lg:gap-6 w-full">
        {/* Metric Cards take up 3 columns */}
        <div className="lg:col-span-3">
          <MetricCardsSection 
            metricSummary={metricSummary}
            widgetSettings={{
              responsiveness: widgetSettings.responsiveness,
              commitment: widgetSettings.commitment,
              continuedEngagement: widgetSettings.continuedEngagement,
            }}
          />
        </div>
        
        {/* Data Socialization Forums takes up 1 column */}
        {widgetSettings.dataSocialization && (
          <div className="lg:col-span-1">
            <DataSocializationCard />
          </div>
        )}
      </div>

      {/* Charts Section - includes Cross-Client Collaboration Trend and Client Submissions */}
      <ChartsSection 
        stackedBarData={stackedBarData}
        lineChartData={lineChartData}
        widgetSettings={{
          ideaDistribution: widgetSettings.ideaDistribution,
          clientSubmissions: widgetSettings.clientSubmissions,
          dataSocialization: false, // Now handled in first row
        }}
        showCollaborationTrend={true}
      />
      
      {/* Features and Forums Section */}
      <FeaturesAndForumsSection 
        topFeatures={topFeatures}
        widgetSettings={{
          topFeatures: widgetSettings.topFeatures,
          dataSocialization: false, // Now handled in ChartsSection
        }}
        showDataSocializationInCharts={false}
      />
    </DashboardSection>
  );
};
import React from 'react';
import { DashboardData } from '../../types';
import DashboardSection from './DashboardSection';
import MetricCardsSection from './MetricCardsSection';
import ChartsSection from './ChartsSection';
import FeaturesAndForumsSection from './FeaturesAndForumsSection';

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
      {/* Metric Summary Cards Section */}
      <MetricCardsSection 
        metricSummary={metricSummary}
        widgetSettings={{
          responsiveness: widgetSettings.responsiveness,
          commitment: widgetSettings.commitment,
          continuedEngagement: widgetSettings.continuedEngagement,
        }}
      />

      {/* Charts Section - includes Cross-Client Collaboration Trend, Client Submissions, and Data Socialization */}
      <ChartsSection 
        stackedBarData={stackedBarData}
        lineChartData={lineChartData}
        widgetSettings={{
          ideaDistribution: widgetSettings.ideaDistribution,
          clientSubmissions: widgetSettings.clientSubmissions,
          dataSocialization: widgetSettings.dataSocialization,
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
        showDataSocializationInCharts={widgetSettings.dataSocialization}
      />
    </DashboardSection>
  );
};
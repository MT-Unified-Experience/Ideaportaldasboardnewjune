import React from 'react';
import { DashboardData } from '../../types';
import MetricSummaryCard from './MetricSummaryCard';
import { TopFeaturesChart } from './TopFeaturesChart';
import DataSocializationCard from './DataSocializationCard';
import CollaborationCard from './CollaborationCard';
import ContinuedEngagementCard from './ContinuedEngagementCard';
import HorizontalStackedBarChart from './HorizontalStackedBarChart';
import LineChart from './LineChart';
import AgingIdeasModal from './AgingIdeasModal';
import { useState } from 'react';

interface WidgetSettings {
  responsiveness: boolean;
  commitment: boolean;
  collaboration: boolean;
  continuedEngagement: boolean;
  agingIdeas: boolean;
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

export const DashboardGrid: React.FC<DashboardGridProps> = ({ data, currentQuarter, widgetSettings }) => {
  const { metricSummary, stackedBarData, lineChartData, topFeatures } = data;
  const [isAgingIdeasModalOpen, setIsAgingIdeasModalOpen] = useState(false);
  
  const tooltips = {
    responsiveness: "(Ideas moved out of the \"Need Review\" stage / Total ideas submitted in the quarter) × 100",
    commitment: "This shows the number of client-prioritized ideas that have been delivered so far this fiscal year, compared to the total number of ideas committed for delivery",
    collaboration: "Indicates the percentage of ideas that benefit multiple clients, highlighting opportunities for shared solutions.",
    continuedEngagement: "(Number of ideas that received another status update within 90 days after leaving \"Needs Review\") ÷ (Total number of ideas that moved out of \"Needs Review\" in the selected quarter) × 100",
    aging: "Tracks ideas that have been in Candidate status for over 90 days, helping identify potential bottlenecks in the review process.",
    distribution: "Visualizes the status breakdown of ideas across fiscal years, showing progression from candidate to delivery.",
    submissions: "Tracks the number of unique clients submitting ideas each quarter, measuring engagement trends.",
    features: "Ranks the most requested features by vote count, helping prioritize development efforts.",
    forums: "Lists the key meetings where idea portal metrics are reviewed and discussed with stakeholders."
  };

  const toggleAgingIdeasModal = () => {
    setIsAgingIdeasModalOpen(!isAgingIdeasModalOpen);
  };

  // Count visible metric cards to determine grid layout
  const visibleMetricCards = [
    widgetSettings.responsiveness,
    widgetSettings.commitment,
    widgetSettings.collaboration,
    widgetSettings.continuedEngagement,
    widgetSettings.agingIdeas
  ].filter(Boolean).length;

  // Count visible chart widgets
  const visibleChartWidgets = [
    widgetSettings.ideaDistribution,
    widgetSettings.clientSubmissions,
    widgetSettings.topFeatures,
    widgetSettings.dataSocialization
  ].filter(Boolean).length;

  // Determine grid columns based on visible widgets
  const getMetricGridCols = () => {
    if (visibleMetricCards === 0) return '';
    if (visibleMetricCards === 1) return 'grid-cols-1';
    if (visibleMetricCards === 2) return 'grid-cols-1 md:grid-cols-2';
    if (visibleMetricCards === 3) return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3';
    if (visibleMetricCards === 4) return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4';
    return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-5';
  };

  // Determine chart layout based on visible charts
  const getChartLayout = () => {
    const charts = [];
    
    if (widgetSettings.ideaDistribution && widgetSettings.clientSubmissions) {
      // Both charts visible - side by side
      charts.push(
        <div key="distribution\" className="lg:col-span-2">
          <HorizontalStackedBarChart data={stackedBarData} />
        </div>,
        <div key="submissions" className="lg:col-span-3">
          <LineChart data={lineChartData} />
        </div>
      );
    } else if (widgetSettings.ideaDistribution) {
      // Only distribution chart
      charts.push(
        <div key="distribution" className="col-span-full">
          <HorizontalStackedBarChart data={stackedBarData} />
        </div>
      );
    } else if (widgetSettings.clientSubmissions) {
      // Only submissions chart
      charts.push(
        <div key="submissions" className="col-span-full">
          <LineChart data={lineChartData} />
        </div>
      );
    }
    
    return charts;
  };

  // Get bottom row layout
  const getBottomRowLayout = () => {
    const bottomWidgets = [];
    
    if (widgetSettings.topFeatures && widgetSettings.dataSocialization) {
      // Both widgets visible
      bottomWidgets.push(
        <div key="features" className="lg:col-span-3">
          <TopFeaturesChart features={topFeatures} />
        </div>,
        <div key="forums" className="lg:col-span-2">
          <DataSocializationCard />
        </div>
      );
    } else if (widgetSettings.topFeatures) {
      // Only top features
      bottomWidgets.push(
        <div key="features" className="col-span-full">
          <TopFeaturesChart features={topFeatures} />
        </div>
      );
    } else if (widgetSettings.dataSocialization) {
      // Only data socialization
      bottomWidgets.push(
        <div key="forums" className="col-span-full">
          <DataSocializationCard />
        </div>
      );
    }
    
    return bottomWidgets;
  };
  return (
    <div className="space-y-6">
      {/* Metric Summary Cards Row */}
      {visibleMetricCards > 0 && (
        <div className={`grid ${getMetricGridCols()} gap-6`}>
          {widgetSettings.responsiveness && (
            <MetricSummaryCard
              title="Responsiveness"
              value={metricSummary.responsiveness}
              type="percentage"
              tooltip={tooltips.responsiveness}
              icon="responsiveness"
              description="Ideas responded to with a status update after client submissions"
            />
          )}
          {widgetSettings.commitment && (
            <MetricSummaryCard
              title="Idea Portal Commitment"
              value={metricSummary.roadmapAlignment}
              type="number"
              tooltip={tooltips.commitment}
              icon="roadmap"
              description="Total Planned Ideas Delivered to Date vs Annual Commitment"
            />
          )}
          {widgetSettings.collaboration && (
            <CollaborationCard
              value={metricSummary.crossClientCollaboration}
              tooltip={tooltips.collaboration}
              collaborationTrends={metricSummary.collaborationTrends}
            />
          )}
          {widgetSettings.continuedEngagement && (
            <ContinuedEngagementCard
              value={metricSummary.continuedEngagement?.rate || 0}
              numerator={metricSummary.continuedEngagement?.numerator || 0}
              denominator={metricSummary.continuedEngagement?.denominator || 0}
              tooltip={tooltips.continuedEngagement}
              ideas={metricSummary.continuedEngagement?.ideas || []}
            />
          )}
          {widgetSettings.agingIdeas && (
            <MetricSummaryCard
              title="Aging Candidate Ideas"
              value={metricSummary.agingIdeas.count}
              type="number"
              tooltip={tooltips.aging}
              icon="aging"
              trendData={metricSummary.agingIdeas.trend}
              description="Items in Candidate status > 90 days"
              onCardClick={toggleAgingIdeasModal}
            />
          )}
        </div>
      )}

      {/* Charts Row */}
      {(widgetSettings.ideaDistribution || widgetSettings.clientSubmissions) && (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {getChartLayout()}
        </div>
      )}
      
      {/* Bottom Row - Features and Forums */}
      {(widgetSettings.topFeatures || widgetSettings.dataSocialization) && (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {getBottomRowLayout()}
        </div>
      )}

      <AgingIdeasModal
        isOpen={isAgingIdeasModalOpen}
        onClose={toggleAgingIdeasModal}
        data={metricSummary.agingIdeas.trend || []}
      />
    </div>
  );
};
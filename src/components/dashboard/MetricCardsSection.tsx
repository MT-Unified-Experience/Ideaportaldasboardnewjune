import React from 'react';
import { MetricSummary, Quarter } from '../../types';
import ResponsivenessCard from './ResponsivenessCard';
import CommitmentTrendsCard from './CommitmentTrendsCard';
import ContinuedEngagementCard from './ContinuedEngagementCard';

interface WidgetSettings {
  responsiveness: boolean;
  commitment: boolean;
  continuedEngagement: boolean;
}

interface MetricCardsSectionProps {
  metricSummary: MetricSummary;
  widgetSettings: WidgetSettings;
  currentQuarter: Quarter;
}

const MetricCardsSection: React.FC<MetricCardsSectionProps> = ({ 
  metricSummary, 
  widgetSettings,
  currentQuarter
}) => {
  const tooltips = {
    responsiveness: "(Ideas moved out of the \"Need Review\" stage / Total ideas submitted in the quarter) × 100",
    commitment: "This shows the number of client-prioritized ideas that have been delivered so far this fiscal year, compared to the total number of ideas committed for delivery",
    continuedEngagement: "(Number of ideas that received another status update within 90 days after leaving \"Needs Review\") ÷ (Total number of ideas that moved out of \"Needs Review\" in the selected quarter) × 100",
  };

  // Count visible metric cards to determine grid layout
  const visibleMetricCards = [
    widgetSettings.responsiveness,
    widgetSettings.commitment,
    widgetSettings.continuedEngagement,
  ].filter(Boolean).length;

  // Determine grid columns based on visible widgets
  const getMetricGridCols = () => {
    if (visibleMetricCards === 0) return '';
    if (visibleMetricCards === 1) return 'grid-cols-1';
    if (visibleMetricCards === 2) return 'grid-cols-1 md:grid-cols-2';
    if (visibleMetricCards === 3) return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3';
    return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3';
  };

  if (visibleMetricCards === 0) return null;

  return (
    <div className={`grid ${getMetricGridCols()} gap-6`}>
      {widgetSettings.responsiveness && (
        <ResponsivenessCard
          value={metricSummary.responsiveness}
          tooltip={tooltips.responsiveness}
          quarterlyData={metricSummary.responsivenessQuarterlyData}
          currentQuarter={currentQuarter}
        />
      )}
      {widgetSettings.commitment && (
        <CommitmentTrendsCard
          value={{
            committed: metricSummary.roadmapAlignment.committed,
            total: metricSummary.roadmapAlignment.total,
            commitmentStatus: metricSummary.roadmapAlignment.commitmentStatus || 'On Track'
          }}
          tooltip={tooltips.commitment}
          commitmentTrends={metricSummary.roadmapAlignment.commitmentTrends}
          quarterlyDeliveries={metricSummary.roadmapAlignment.quarterlyDeliveries}
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
    </div>
  );
};

export default MetricCardsSection;
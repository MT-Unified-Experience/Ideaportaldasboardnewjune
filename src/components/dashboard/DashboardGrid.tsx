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
    responsiveness: "Measures how quickly Mitratech responds to client ideas. A higher percentage indicates better engagement and faster feedback loops with clients.",
    commitment: "Shows cumulative progress towards the yearly planning goal by tracking the total number of ideas committed versus the annual target.",
    collaboration: "Indicates the percentage of ideas that benefit multiple clients, highlighting opportunities for shared solutions.",
    continuedEngagement: "Percentage of ideas that received at least one additional status update within 90 days after being moved out of 'Needs Review'. Helps track whether ideas continue progressing after initial review.",
    aging: "Tracks ideas that have been in Candidate status for over 90 days, helping identify potential bottlenecks in the review process.",
    distribution: "Visualizes the status breakdown of ideas across fiscal years, showing progression from candidate to delivery.",
    submissions: "Tracks the number of unique clients submitting ideas each quarter, measuring engagement trends.",
    features: "Ranks the most requested features by vote count, helping prioritize development efforts.",
    forums: "Lists the key meetings where idea portal metrics are reviewed and discussed with stakeholders."
  };

  const toggleAgingIdeasModal = () => {
    setIsAgingIdeasModalOpen(!isAgingIdeasModalOpen);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
      {/* Metric Summary Cards - Row 1 */}
      {widgetSettings.responsiveness && (
        <MetricSummaryCard
          title="Responsiveness"
          value={metricSummary.responsiveness}
          type="percentage"
          tooltip={tooltips.responsiveness}
          icon="responsiveness"
          description="of the time ideas were responded within 2 weeks"
          trend={metricSummary.responsivenessTrend}
        />
      )}
      {widgetSettings.commitment && (
        <MetricSummaryCard
          title="Idea Portal Commitment"
          value={metricSummary.roadmapAlignment}
          type="number"
          tooltip={tooltips.commitment}
          icon="roadmap"
          description="Total ideas committed this fiscal year vs annual target"
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

      {/* Charts - Row 2 & 3 */}
      {widgetSettings.ideaDistribution && (
        <div className="md:col-span-2 lg:col-span-2">
          <HorizontalStackedBarChart data={stackedBarData} />
        </div>
      )}
      {widgetSettings.clientSubmissions && (
        <div className="md:col-span-2 lg:col-span-3">
          <LineChart data={lineChartData} />
        </div>
      )}
      
      {/* Top Features Chart */}
      {widgetSettings.topFeatures && (
        <div className="md:col-span-2 lg:col-span-3">
          <TopFeaturesChart features={topFeatures} />
        </div>
      )}
      
      {/* Data Socialization Forums Card */}
      {widgetSettings.dataSocialization && (
        <div className="md:col-span-2 lg:col-span-2">
          <DataSocializationCard />
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
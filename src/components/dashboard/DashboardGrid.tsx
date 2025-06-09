import React from 'react';
import { DashboardData } from '../../types';
import MetricSummaryCard from './MetricSummaryCard';
import { TopFeaturesChart } from './TopFeaturesChart';
import DataSocializationCard from './DataSocializationCard';
import CollaborationCard from './CollaborationCard';
import HorizontalStackedBarChart from './HorizontalStackedBarChart';
import LineChart from './LineChart';
import AgingIdeasModal from './AgingIdeasModal';
import { useState } from 'react';

interface DashboardGridProps {
  data: DashboardData;
  currentQuarter: string;
}

export const DashboardGrid: React.FC<DashboardGridProps> = ({ data, currentQuarter }) => {
  const { metricSummary, stackedBarData, lineChartData, topFeatures } = data;
  const [isAgingIdeasModalOpen, setIsAgingIdeasModalOpen] = useState(false);
  
  const tooltips = {
    responsiveness: "Measures how quickly Mitratech responds to client ideas. A higher percentage indicates better engagement and faster feedback loops with clients.",
    commitment: "Shows cumulative progress towards the yearly planning goal by tracking the total number of ideas committed versus the annual target.",
    collaboration: "Indicates the percentage of ideas that benefit multiple clients, highlighting opportunities for shared solutions.",
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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {/* Metric Summary Cards - Row 1 */}
      {widgetVisibility.responsiveness && (
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
      {widgetVisibility.commitment && (
        <MetricSummaryCard
          title="Idea Portal Commitment"
          value={metricSummary.roadmapAlignment}
          type="number"
          tooltip={tooltips.commitment}
          icon="roadmap"
          description="Total ideas committed this fiscal year vs annual target"
        />
      )}
      {widgetVisibility.collaboration && (
        <CollaborationCard
          value={metricSummary.crossClientCollaboration}
          tooltip={tooltips.collaboration}
          collaborationTrends={metricSummary.collaborationTrends}
        />
      )}
      {widgetVisibility.agingIdeas && (
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
      {widgetVisibility.ideaDistribution && (
        <div className="md:col-span-2">
          <HorizontalStackedBarChart data={stackedBarData} />
        </div>
      )}
      {widgetVisibility.clientSubmissions && (
        <div className="md:col-span-2">
          <LineChart data={lineChartData} />
        </div>
      )}
      
      {/* Top Features Chart */}
      {widgetVisibility.topFeatures && (
        <div className="md:col-span-2">
          <TopFeaturesChart features={topFeatures} />
        </div>
      )}
      
      {/* Data Socialization Forums Card */}
      {widgetVisibility.forums && (
        <div className="md:col-span-2">
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
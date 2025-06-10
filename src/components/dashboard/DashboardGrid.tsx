import React from 'react';
import { DashboardData } from '../../types';
import ResponsivenessCard from './ResponsivenessCard';
import CommitmentTrendsCard from './CommitmentTrendsCard';
import { TopFeaturesChart } from './TopFeaturesChart';
import DataSocializationCard from './DataSocializationCard';
import ContinuedEngagementCard from './ContinuedEngagementCard';
import HorizontalStackedBarChart from './HorizontalStackedBarChart';
import LineChart from './LineChart';

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

export const DashboardGrid: React.FC<DashboardGridProps> = ({ data, currentQuarter, widgetSettings }) => {
  const { metricSummary, stackedBarData, lineChartData, topFeatures } = data;
  
  const tooltips = {
    responsiveness: "(Ideas moved out of the \"Need Review\" stage / Total ideas submitted in the quarter) × 100",
    commitment: "This shows the number of client-prioritized ideas that have been delivered so far this fiscal year, compared to the total number of ideas committed for delivery",
    continuedEngagement: "(Number of ideas that received another status update within 90 days after leaving \"Needs Review\") ÷ (Total number of ideas that moved out of \"Needs Review\" in the selected quarter) × 100",
    distribution: "Visualizes the status breakdown of ideas across fiscal years, showing progression from candidate to delivery.",
    submissions: "Tracks the number of unique clients submitting ideas each quarter, measuring engagement trends.",
    features: "Ranks the most requested features by vote count, helping prioritize development efforts.",
    forums: "Lists the key meetings where idea portal metrics are reviewed and discussed with stakeholders."
  };


  // Count visible metric cards to determine grid layout
  const visibleMetricCards = [
    widgetSettings.responsiveness,
    widgetSettings.commitment,
    widgetSettings.continuedEngagement,
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
    
    if (widgetSettings.dataSocialization && widgetSettings.clientSubmissions) {
      // Data Socialization and Client Submissions side by side
      bottomWidgets.push(
        <div key="forums" className="lg:col-span-2">
          <DataSocializationCard />
        </div>,
        <div key="submissions" className="lg:col-span-3">
          <LineChart data={lineChartData} />
        </div>
      );
    } else if (widgetSettings.dataSocialization) {
      // Only data socialization
      bottomWidgets.push(
        <div key="forums" className="col-span-full">
          <DataSocializationCard />
        </div>
      );
    } else if (widgetSettings.clientSubmissions) {
      // Only client submissions
      bottomWidgets.push(
        <div key="submissions" className="col-span-full">
          <LineChart data={lineChartData} />
        </div>
      );
    }
    
    if (widgetSettings.topFeatures) {
      // Top features in its own row
      bottomWidgets.push(
        <div key="features" className="col-span-full mt-4 lg:mt-6">
          <TopFeaturesChart features={topFeatures} />
        </div>
      );
    }
    
    return bottomWidgets;
  };
  return (
    <div className="space-y-4 lg:space-y-6 w-full">
      {/* Metric Summary Cards Row */}
      {visibleMetricCards > 0 && (
        <div className={`grid ${getMetricGridCols()} gap-3 lg:gap-6 w-full`}>
          {widgetSettings.responsiveness && (
            <ResponsivenessCard
              value={metricSummary.responsiveness}
              tooltip={tooltips.responsiveness}
              quarterlyData={metricSummary.responsivenessQuarterlyData}
            />
          )}
          {widgetSettings.commitment && (
            <CommitmentTrendsCard
              value={metricSummary.roadmapAlignment}
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
      )}
      {/* Charts Row */}
      {widgetSettings.ideaDistribution && (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-3 lg:gap-6 w-full">
          <div key="distribution" className="col-span-full">
            <HorizontalStackedBarChart data={stackedBarData} />
          </div>
        </div>
      )}
      
      {/* Bottom Row - Features and Forums */}
      {(widgetSettings.dataSocialization || widgetSettings.clientSubmissions || widgetSettings.topFeatures) && (
        <div className="space-y-4 lg:space-y-6 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-3 lg:gap-6 w-full">
            {getBottomRowLayout()}
          </div>
        </div>
      )}
    </div>
  );
};  </div>
      )}

      {/* Bottom Row - Features and Forums */}
      {(widgetSettings.dataSocialization || widgetSettings.clientSubmissions || widgetSettings.topFeatures) && (
        <div className="space-y-4 lg:space-y-6 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-3 lg:gap-6 w-full">
            {getBottomRowLayout()}
          </div>
        </div>
      )}

      <AgingIdeasModal
        isOpen={isAgingIdeasModalOpen}
        onClose={toggleAgingIdeasModal}
        data={metricSummary.agingIdeas.trend || []}
      />
    </div>
  );
};}
          />
        </div>
      )}

      {/* Bottom Row - Features and Forums */}
      {(widgetSettings.dataSocialization || widgetSettings.clientSubmissions || widgetSettings.topFeatures) && (
        <div className="space-y-4 lg:space-y-6 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-3 lg:gap-6 w-full">
            {getBottomRowLayout()}
          </div>
        </div>
      )}

      <AgingIdeasModal
        isOpen={isAgingIdeasModalOpen}
        onClose={toggleAgingIdeasModal}
        data={metricSummary.agingIdeas.trend || []}
      />
    </div>
  );
};rums */}
      {(widgetSettings.dataSocialization || widgetSettings.clientSubmissions || widgetSettings.topFeatures) && (
        <div className="space-y-4 lg:space-y-6 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-3 lg:gap-6 w-full">
            {getBottomRowLayout()}
          </div>
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
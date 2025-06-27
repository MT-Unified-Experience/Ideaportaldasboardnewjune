import React from 'react';
import { memo } from 'react';
import QuarterlyTrendsComparison from './QuarterlyTrendsComparison';

interface Feature {
  feature_name: string;
  vote_count: number;
  status: 'Delivered' | 'Under Review' | 'Committed';
  status_updated_at: string;
  client_voters: string[];
  estimated_impact?: 'High' | 'Medium' | 'Low';
  resource_requirement?: 'High' | 'Medium' | 'Low';
  strategic_alignment?: number;
  risks?: string[];
}

interface TopFeaturesChartProps {
  features: Feature[];
}

export const TopFeaturesChart: React.FC<TopFeaturesChartProps> = memo(({ features }) => {
  return (
    <QuarterlyTrendsComparison features={features} />
  );
});

TopFeaturesChart.displayName = 'TopFeaturesChart';
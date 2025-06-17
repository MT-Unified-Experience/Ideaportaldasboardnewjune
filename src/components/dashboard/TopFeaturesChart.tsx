import React from 'react';
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
  previousFeatures?: Feature[];
  currentQuarterLabel?: string;
  previousQuarterLabel?: string;
}

export const TopFeaturesChart: React.FC<TopFeaturesChartProps> = ({ 
  features, 
  previousFeatures = [],
  currentQuarterLabel = 'Q4',
  previousQuarterLabel = 'Q3'
}) => {
  return (
    <QuarterlyTrendsComparison 
      currentFeatures={features} 
      previousFeatures={previousFeatures} 
      currentQuarterLabel={currentQuarterLabel}
      previousQuarterLabel={previousQuarterLabel}
    />
  );
};
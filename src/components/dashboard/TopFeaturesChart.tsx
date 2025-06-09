import React, { useState } from 'react';
import QuarterlyTrendsComparison from './QuarterlyTrendsComparison';

interface Feature {
  feature_name: string;
  vote_count: number;
  status: 'Delivered' | 'Under Review' | 'Committed';
  status_updated_at: string;
  client_voters: string[];
}

export const TopFeaturesChart: React.FC<{ features: Feature[] }> = ({ features }) => {
  return <QuarterlyTrendsComparison features={features} />;
};
import React from 'react';
import { DashboardData } from '../../types';
import DashboardSection from './DashboardSection';
import MetricCardsSection from './MetricCardsSection';
import FeaturesAndForumsSection from './FeaturesAndForumsSection';
import DataSocializationCard from './DataSocializationCard';
import LineChart from './LineChart';
import CrossClientCollaborationTrend from './CrossClientCollaborationTrend';
import { TopFeaturesChart } from './TopFeaturesChart';
import { useData } from '../../contexts/DataContext';

interface WidgetSettings {
  responsiveness: boolean;
  commitment: boolean;
  continuedEngagement: boolean;
  collaborationTrend: boolean;
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
  const { metricSummary, lineChartData, topFeatures, previousQuarterFeatures } = data;
  const { allProductsData, currentProduct } = useData();

  // Helper function to get previous quarter
  const getPreviousQuarter = (quarter: string): string => {
    const quarterMap: { [key: string]: string } = {
      'FY25 Q1': 'FY24 Q4',
      'FY25 Q2': 'FY25 Q1',
      'FY25 Q3': 'FY25 Q2',
      'FY25 Q4': 'FY25 Q3',
      'FY26 Q1': 'FY25 Q4'
    };
    return quarterMap[quarter] || 'FY25 Q3';
  };

  // Get previous quarter data
  const previousQuarter = getPreviousQuarter(currentQuarter);
  const previousQuarterData = allProductsData[currentProduct]?.[previousQuarter];

  return (
    <div className="space-y-6">
      {/* First Row: Metric Summary Cards */}
      <div className="grid grid-cols-1 gap-6">
        <MetricCardsSection 
          metricSummary={metricSummary}
          widgetSettings={{
            responsiveness: widgetSettings.responsiveness,
            commitment: widgetSettings.commitment,
            continuedEngagement: widgetSettings.continuedEngagement,
          }}
        />
      </div>

      {/* Second Row: Data Socialization Forums + Client Submissions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Data Socialization Forums takes up 1 column */}
        {widgetSettings.dataSocialization && (
          <div className="lg:col-span-1">
            <DataSocializationCard />
          </div>
        )}
        
        {/* Client Submissions takes up 2 columns */}
        {widgetSettings.clientSubmissions && (
          <div className="lg:col-span-2">
            <LineChart data={lineChartData} />
          </div>
        )}
      </div>

      {/* Third Row: Cross-Client Collaboration Trend */}
      {widgetSettings.collaborationTrend && (
        <div className="grid grid-cols-1 gap-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
            <CrossClientCollaborationTrend
              isOpen={true}
              onClose={() => {}}
              embedded={true}
            />
          </div>
        </div>
      )}
      
      {/* Fourth Row: Top 10 Trends Over Last 2 Quarters */}
      {widgetSettings.topFeatures && (
        <div className="grid grid-cols-1 gap-6">
          <div className="col-span-full">
            <TopFeaturesChart 
              features={topFeatures} 
              previousFeatures={previousQuarterFeatures || []} 
              currentQuarterLabel={currentQuarter}
              previousQuarterLabel={previousQuarter}
            />
          </div>
        </div>
      )}
    </div>
  );
};
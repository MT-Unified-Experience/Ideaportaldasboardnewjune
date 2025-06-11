import React from 'react';
import { DashboardData } from '../../types';
import DashboardSection from './DashboardSection';
import MetricCardsSection from './MetricCardsSection';
import FeaturesAndForumsSection from './FeaturesAndForumsSection';
import DataSocializationCard from './DataSocializationCard';
import LineChart from './LineChart';
import CrossClientCollaborationTrend from './CrossClientCollaborationTrend';
import { TopFeaturesChart } from './TopFeaturesChart';

interface WidgetSettings {
  responsiveness: boolean;
  commitment: boolean;
  continuedEngagement: boolean;
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
  const { metricSummary, lineChartData, topFeatures } = data;

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
      <div className="grid grid-cols-1 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
          <CrossClientCollaborationTrend
            isOpen={true}
            onClose={() => {}}
            embedded={true}
          />
        </div>
      </div>
      
      {/* Fourth Row: Top 10 Trends Over Last 2 Quarters */}
      {widgetSettings.topFeatures && (
        <div className="grid grid-cols-1 gap-6">
          <div className="col-span-full">
            <TopFeaturesChart features={topFeatures} />
          </div>
        </div>
      )}
    </div>
  );
};
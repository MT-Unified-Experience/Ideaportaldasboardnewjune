export interface CollaborationTrend {
  rate: number;
  clientName: string;
}

export interface CollaborationTrendQuarterlyData {
  quarter: string;
  year: number;
  collaborativeIdeas: number;
  totalIdeas: number;
  collaborationRate: number;
}

export interface MetricSummary {
  responsiveness: number;
  responsivenessTrend?: number;
  responsivenessQuarterlyData?: Array<{
    quarter: string;
    percentage: number;
    totalIdeas: number;
    ideasMovedOutOfReview: number;
  }>;
  roadmapAlignment: {
    committed: number;
    total: number;
    commitmentTrends?: Array<{
      year: string;
      committed: number;
      delivered: number;
    }>;
    quarterlyDeliveries?: Array<{
      quarter: string;
      year: string;
      delivered: number;
    }>;
  };
  continuedEngagement: {
    rate: number;
    numerator: number;
    denominator: number;
    ideas?: Array<{
      id: string;
      name: string;
      initialStatusChange: string;
      subsequentChanges: Array<{
        date: string;
        status: string;
      }>;
      daysBetween: number;
      included: boolean;
    }>;
  };
  ideaVolume: {
    quarterly: number;
    total: number;
  };
}

export interface StackedBarData {
  year: string;
  candidateIdeas: number;
  inDevelopment: number;
  archivedIdeas: number;
  flaggedForFuture: number;
}

export interface LineChartData {
  quarter: string;
  clientsRepresenting: number;
  clients?: string[];
}

export interface Feature {
  feature_name: string;
  vote_count: number;
  status: 'Delivered' | 'Under Review' | 'Committed';
  status_updated_at: string;
  client_voters: string[];
  created_at?: string;
  updated_at?: string;
}

export interface ProductQuarterlyData {
  id?: string;
  product_id: string;
  product_name: string;
  quarter: string;
  year: string;
  sales_data: number;
}

export interface Forum {
  name: string;
}

export interface DashboardData {
  metricSummary: MetricSummary;
  stackedBarData: StackedBarData[];
  lineChartData: LineChartData[];
  topFeatures: Feature[];
  previousQuarterFeatures?: Feature[];
  collaborationTrendData?: CollaborationTrendQuarterlyData[];
  data_socialization_forums?: Forum[];
}

export interface ProductData {
  [quarter: string]: DashboardData;
}

export type Product = 
  | 'TeamConnect' 
  | 'Collaborati' 
  | 'LegalHold' 
  | 'TAP Workflow Automation' 
  | 'HotDocs' 
  | 'eCounsel' 
  | 'CaseCloud';

export type Quarter = 'FY25 Q1' | 'FY25 Q2' | 'FY25 Q3' | 'FY25 Q4';
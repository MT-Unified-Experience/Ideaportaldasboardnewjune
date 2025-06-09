export interface CollaborationTrend {
  rate: number;
  clientName: string;
}

export interface MetricSummary {
  responsiveness: number;
  responsivenessTrend?: number;
  roadmapAlignment: {
    committed: number;
    total: number;
  };
  crossClientCollaboration: number;
  collaborationTrends?: CollaborationTrend[];
  ideaVolume: {
    quarterly: number;
    total: number;
  };
  agingIdeas: {
    count: number;
    trend: Array<{
      quarter: string;
      count: number;
    }>;
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
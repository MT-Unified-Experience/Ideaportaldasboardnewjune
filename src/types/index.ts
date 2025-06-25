export interface CollaborationTrend {
  rate: number;
  clientName: string;
}

export interface CollaborativeIdea {
  id: string;
  name: string;
  originalSubmitter: string;
  contributors: string[];
  submissionDate: string;
  collaborationScore: number;
  status: 'Active' | 'Delivered' | 'In Development';
  comments: string;
}

export interface ActionItem {
  id: string;
  product: string;
  quarter: string;
  text: string;
  completed: boolean;
  created_at: string;
  updated_at: string;
}

export interface CollaborationTrendQuarterlyData {
  quarter: string;
  year: number;
  collaborativeIdeas: number;
  totalIdeas: number;
  collaborationRate: number;
  topCollaborativeIdeas?: CollaborativeIdea[];
}

export interface MetricSummary {
  responsiveness: number;
  responsivenessTrend?: number;
  responsivenessQuarterlyData?: Array<{
    quarter: string;
    percentage: number;
    totalIdeas: number;
    ideasMovedOutOfReview: number;
    ideasList?: string[];
  }>;
  roadmapAlignment: {
    committed: number;
    total: number;
    commitmentStatus?: 'On Track' | 'Off Track' | 'At Risk';
    commitmentTrends?: Array<{
      year: string;
      committed: number;
      delivered: number;
      ideas?: Array<{
        id: string;
        summary: string;
      }>;
    }>;
    quarterlyDeliveries?: Array<{
      quarter: string;
      year: string;
      delivered: number;
      ideas?: Array<{
        id: string;
        summary: string;
      }>;
    }>;
  };
  continuedEngagement: {
    rate: number;
    numerator: number;
    denominator: number;
    quarterlyTrends?: Array<{
      quarter: string;
      rate: number;
      numerator: number;
      denominator: number;
    }>;
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
  ideas?: Array<{
    id: string;
    clientName: string;
    summary: string;
  }>;
}

export interface Feature {
  feature_name: string;
  vote_count: number;
  status: 'Delivered' | 'Under Review' | 'Committed' | 'Rejected';
  status_updated_at: string;
  client_voters: string[];
  created_at?: string;
  updated_at?: string;
  feature_quarter?: 'current' | 'previous';
  estimated_impact?: 'High' | 'Medium' | 'Low';
  resource_requirement?: 'High' | 'Medium' | 'Low';
  strategic_alignment?: number;
  risks?: string[];
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

export type Quarter = 'FY25 Q1' | 'FY25 Q2' | 'FY25 Q3' | 'FY25 Q4' | 'FY26 Q1';
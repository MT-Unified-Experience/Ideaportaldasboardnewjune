import Papa from 'papaparse';
import { DashboardData, Feature, CollaborationTrendQuarterlyData } from '../types';

export class CSVError extends Error {
  constructor(
    message: string,
    public type: 'file' | 'data' | 'application',
    public details?: string[]
  ) {
    super(message);
    this.name = 'CSVError';
  }
}

// Required headers for CSV validation
const requiredHeaders = [
  'product', 'quarter', 'responsiveness', 'responsiveness_trend', 'roadmap_alignment_committed', 'roadmap_alignment_total',
  'cross_client_collaboration', 'aging_ideas_count', 'year', 'candidate_ideas', 'in_development', 'archived_ideas', 'flagged_for_future',
  'active_quarter', 'active_clients_representing', 'feature_name', 'vote_count', 'status',
  'status_updated_at', 'client_voters', 'collaborative_ideas', 'total_ideas'
];

interface CSVRow {
  product: string;
  quarter: string;
  quarterly_ideas: string;
  total_ideas: string;
  responsiveness: string;
  responsiveness_trend: string;
  roadmap_alignment_committed: string;
  roadmap_alignment_total: string;
  cross_client_collaboration: string;
  aging_ideas_count: string;
  aging_ideas_trend_q1: string;
  aging_ideas_trend_q2: string;
  aging_ideas_trend_q3: string;
  aging_ideas_trend_q4: string;
  year: string;
  candidate_ideas: string;
  in_development: string;
  archived_ideas: string;
  flagged_for_future: string;
  active_quarter: string;
  active_clients_representing: string;
  feature_name: string;
  vote_count: string;
  status: string;
  status_updated_at: string;
  client_voters: string;
  forum_name: string;
  forum_audience: string;
  forum_purpose: string;
  continued_engagement_rate: string;
  continued_engagement_numerator: string;
  continued_engagement_denominator: string;
  collaborative_ideas: string;
  total_ideas_for_collaboration: string;
}

interface ProductQuarterlyData {
  product_id: string;
  product_name: string;
  quarter: string;
  year: string;
  sales_data: number;
}

// Function to validate CSV data matches current product
export const validateCSVData = async (csvData: string, currentProduct: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    Papa.parse(csvData, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        try {
          const rows = results.data as Array<{ product: string }>;
          
          // Check if any rows exist
          if (!rows.length) {
            throw new CSVError(
              'Empty CSV file',
              'file',
              ['The uploaded file contains no data']
            );
          }
          
          // Check if data matches current product (case-insensitive)
          const hasMatchingProduct = rows.some(row => 
            row.product?.trim().toLowerCase() === currentProduct.toLowerCase()
          );
          if (!hasMatchingProduct) {
            throw new CSVError(
              'Invalid product data',
              'data',
              [
                `The CSV file does not contain data for ${currentProduct}`,
                'Please upload a CSV file with data for the selected product'
              ]
            );
          }
          
          resolve();
        } catch (error) {
          reject(error);
        }
      },
      error: (error) => {
        reject(new CSVError(
          'Failed to parse CSV file',
          'file',
          [error.message]
        ));
      }
    });
  });
};

// Helper function to safely convert string to number
const safeNumberConversion = (value: string | null | undefined): number => {
  if (value === null || value === undefined || value === '') {
    return 0;
  }
  const num = Number(value);
  return isNaN(num) ? 0 : num;
};

// Transform CSV data into product quarterly data format
export const transformProductQuarterlyCSVData = (data: CSVRow[]): ProductQuarterlyData[] => {
  return data.map(row => ({
    product_id: row.product_id,
    product_name: row.product_name,
    quarter: row.quarter,
    year: row.year,
    sales_data: safeNumberConversion(row.sales_data)
  }));
};

// Function to parse CSV data and transform it into dashboard data
export const parseCSV = (csvData: string, currentProduct: string): Promise<DashboardData> => {
  return new Promise((resolve, reject) => {
    Papa.parse(csvData, {
      header: true,
      dynamicTyping: false, // Keep as strings to handle conversion manually
      skipEmptyLines: true,
      complete: (results) => {
        try {
          // Validate data structure
          if (!Array.isArray(results.data) || results.data.length === 0) {
            throw new CSVError(
              'Invalid data structure',
              'data',
              ['The CSV file must contain at least one row of data']
            );
          }

          // Filter data for current product (case-insensitive)
          const productData = (results.data as CSVRow[]).filter(row => 
            row.product?.trim().toLowerCase() === currentProduct.toLowerCase()
          );
          
          if (productData.length === 0) {
            throw new CSVError(
              'Invalid product data',
              'data',
              [`The CSV file does not contain data for ${currentProduct}`]
            );
          }
          // Check for empty required fields in first row
          const firstRow = results.data[0] as CSVRow;
          const emptyFields = Object.entries(firstRow)
            .filter(([key, value]) => !value && requiredHeaders.includes(key))
            .map(([key]) => key);

          if (emptyFields.length > 0) {
            throw new CSVError(
              'Missing required values',
              'data',
              [
                'The following required fields are empty in the first row:',
                ...emptyFields.map(field => `- ${field}`)
              ]
            );
          }

          const parsedData = transformCSVData(productData);
          resolve(parsedData);
        } catch (error) {
          reject(error);
        }
      },
      error: (error) => {
        reject(error);
      }
    });
  });
};

// Function to validate CSV headers
export const validateCSVHeaders = (csvData: string, requiredHeaders: string[]): Promise<boolean> => {
  return new Promise((resolve, reject) => {
    Papa.parse(csvData, {
      header: true,
      preview: 1, // Parse only first row to check headers
      complete: (results) => {
        // Check if file is empty
        if (!results.data || results.data.length === 0) {
          reject(new CSVError(
            'Empty CSV file',
            'file',
            ['The uploaded file contains no data']
          ));
          return;
        }

        const headers = results.meta.fields || [];
        const missingHeaders = requiredHeaders.filter(header => !headers.includes(header));
        
        if (missingHeaders.length > 0) {
          reject(new CSVError(
            'Invalid CSV structure',
            'data',
            [
              'The following required columns are missing:',
              ...missingHeaders.map(header => `- ${header}`)
            ]
          ));
        } else {
          resolve(true);
        }
      },
      error: (error) => {
        reject(error);
      }
    });
  });
};


// Transform feature data from CSV rows
const transformFeatureData = (row: CSVRow): Feature | null => {
  if (!row.feature_name || !row.vote_count || !row.status || !row.status_updated_at || !row.client_voters) {
    return null;
  }

  return {
    feature_name: row.feature_name,
    vote_count: parseInt(row.vote_count),
    status: row.status as 'Delivered' | 'Under Review' | 'Committed',
    status_updated_at: row.status_updated_at,
    client_voters: row.client_voters.split(',').map(s => s.trim())
  };
};

// Transform collaboration trend data from CSV rows
const transformCollaborationTrendData = (data: CSVRow[]): CollaborationTrendQuarterlyData[] => {
  const trendMap = new Map<string, CollaborationTrendQuarterlyData>();
  
  data.forEach(row => {
    if (row.quarter && row.year && row.collaborative_ideas && row.total_ideas_for_collaboration) {
      const key = `${row.quarter}-${row.year}`;
      const collaborativeIdeas = safeNumberConversion(row.collaborative_ideas);
      const totalIdeas = safeNumberConversion(row.total_ideas_for_collaboration);
      const collaborationRate = totalIdeas > 0 ? Math.round((collaborativeIdeas / totalIdeas) * 100) : 0;
      
      // Convert FY format to full year (e.g., FY25 -> 2025)
      let year = parseInt(row.year);
      if (row.year.startsWith('FY')) {
        const fyYear = parseInt(row.year.substring(2));
        year = fyYear < 50 ? 2000 + fyYear : 1900 + fyYear;
      }
      
      if (!trendMap.has(key)) {
        trendMap.set(key, {
          quarter: row.quarter,
          year: year,
          collaborativeIdeas: collaborativeIdeas,
          totalIdeas: totalIdeas,
          collaborationRate: collaborationRate
        });
      }
    }
  });
  
  return Array.from(trendMap.values()).sort((a, b) => {
    if (a.year !== b.year) return a.year - b.year;
    const getQuarterNum = (quarter: string) => parseInt(quarter.slice(-1));
    return getQuarterNum(a.quarter) - getQuarterNum(b.quarter);
  });
};

// Transform CSV data into dashboard data format
const transformCSVData = (data: CSVRow[]): DashboardData => {
  const firstRow = data[0];

  // Safely extract metric summary from first row
  const metricSummary = {
    responsiveness: safeNumberConversion(firstRow.responsiveness),
    roadmapAlignment: {
      committed: safeNumberConversion(firstRow.roadmap_alignment_committed),
      total: safeNumberConversion(firstRow.roadmap_alignment_total),
    },
    crossClientCollaboration: safeNumberConversion(firstRow.cross_client_collaboration),
    continuedEngagement: {
      rate: safeNumberConversion(firstRow.continued_engagement_rate),
      numerator: safeNumberConversion(firstRow.continued_engagement_numerator),
      denominator: safeNumberConversion(firstRow.continued_engagement_denominator),
      ideas: []
    },
    ideaVolume: {
      quarterly: safeNumberConversion(firstRow.quarterly_ideas),
      total: safeNumberConversion(firstRow.total_ideas),
    },
    agingIdeas: {
      count: safeNumberConversion(firstRow.aging_ideas_count),
      trend: [
        { quarter: 'FY25 Q1', count: safeNumberConversion(firstRow.aging_ideas_trend_q1) },
        { quarter: 'FY25 Q2', count: safeNumberConversion(firstRow.aging_ideas_trend_q2) },
        { quarter: 'FY25 Q3', count: safeNumberConversion(firstRow.aging_ideas_trend_q3) },
        { quarter: 'FY25 Q4', count: safeNumberConversion(firstRow.aging_ideas_trend_q4) }
      ]
    },
  };

  // Transform stacked bar data
  const stackedBarData = data
    .filter((row, index, self) => 
      self.findIndex(r => r.year === row.year && r.product === row.product) === index
    )
    .map(row => ({
      year: row.year,
      candidateIdeas: safeNumberConversion(row.candidate_ideas),
      inDevelopment: safeNumberConversion(row.in_development),
      archivedIdeas: safeNumberConversion(row.archived_ideas),
      flaggedForFuture: safeNumberConversion(row.flagged_for_future),
    }));

  // Transform line chart data
  const lineChartData = data
    .filter((row, index, self) => 
      self.findIndex(r => r.active_quarter === row.active_quarter) === index
    )
    .sort((a, b) => {
      // Extract quarter numbers for comparison
      const getQuarterNum = (str: string) => parseInt(str.slice(-1));
      return getQuarterNum(a.active_quarter) - getQuarterNum(b.active_quarter);
    })
    .map(row => ({
      quarter: row.active_quarter,
      clientsRepresenting: safeNumberConversion(row.active_clients_representing),
    }));

  // Transform features data
  const features = data
    .map(row => transformFeatureData(row))
    .filter((feature): feature is Feature => feature !== null)
    .sort((a, b) => b.vote_count - a.vote_count);

  // Transform collaboration trend data
  const collaborationTrendData = transformCollaborationTrendData(data);

  // Transform forums data
  const forums = data
    .filter(row => row.forum_name && row.forum_audience && row.forum_purpose)
    .map(row => ({
      name: row.forum_name,
      audience: row.forum_audience,
      purpose: row.forum_purpose
    }));

  return {
    metricSummary,
    stackedBarData,
    lineChartData,
    topFeatures: features,
    collaborationTrendData,
    data_socialization_forums: forums
  };
};
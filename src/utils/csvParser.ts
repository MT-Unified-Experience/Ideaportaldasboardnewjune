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
  'product', 'quarter', 'responsiveness', 'roadmap_alignment_committed', 'roadmap_alignment_total',
  'active_quarter', 'active_clients_representing', 'feature_name', 'vote_count', 'status',
  'status_updated_at', 'client_voters'
];

// Required headers for top features CSV validation
export const topFeaturesRequiredHeaders = [
  'feature_name',
  'vote_count', 
  'status',
  'status_updated_at',
  'client_voters',
  'feature_quarter' // To distinguish between current and previous quarter
];

// Required headers for responsiveness trend CSV validation
export const responsivenessTrendRequiredHeaders = [
  'quarter',
  'percentage',
  'total_ideas',
  'ideas_moved_out_of_review',
  'ideas_list' // Optional: comma-separated list of idea names
];

// Required headers for commitment trends CSV validation
export const commitmentTrendsRequiredHeaders = [
  'year',
  'committed',
  'delivered'
  // Optional: quarter, quarterly_delivered
];

// Required headers for continued engagement CSV validation
export const continuedEngagementRequiredHeaders = [
  'quarter',
  'rate',
  'numerator',
  'denominator'
  // Optional: idea_id, idea_name, initial_status_change, subsequent_changes, days_between, included
];

// Required headers for client submissions CSV validation
export const clientSubmissionsRequiredHeaders = [
  'quarter',
  'clients_representing',
  'client_names' // Optional: comma-separated list of client names
];

interface ResponsivenessTrendCSVRow {
  quarter: string;
  percentage: string;
  total_ideas: string;
  ideas_moved_out_of_review: string;
  ideas_list?: string;
}

interface FeatureCSVRow {
  feature_name: string;
  vote_count: string;
  status: string;
  status_updated_at: string;
  client_voters: string;
  feature_quarter: string; // 'current' or 'previous'
}

interface CommitmentTrendsCSVRow {
  year: string;
  committed: string;
  delivered: string;
  quarter?: string;
  quarterly_delivered?: string;
}

interface ContinuedEngagementCSVRow {
  quarter: string;
  rate: string;
  numerator: string;
  denominator: string;
  idea_id?: string;
  idea_name?: string;
  initial_status_change?: string;
  subsequent_changes?: string;
  days_between?: string;
  included?: string;
}

interface ClientSubmissionsCSVRow {
  quarter: string;
  clients_representing: string;
  client_names?: string;
}

interface CommitmentTrendsData {
  commitmentTrends: Array<{
    year: string;
    committed: number;
    delivered: number;
  }>;
  quarterlyDeliveries: Array<{
    quarter: string;
    year: string;
    delivered: number;
  }>;
}

interface ContinuedEngagementData {
  quarterlyTrends: Array<{
    quarter: string;
    rate: number;
    numerator: number;
    denominator: number;
  }>;
  ideas: Array<{
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
}

interface ClientSubmissionsData {
  lineChartData: Array<{
    quarter: string;
    clientsRepresenting: number;
    clients?: string[];
  }>;
}

interface TopFeaturesData {
  currentQuarterFeatures: Feature[];
  previousQuarterFeatures: Feature[];
}

interface CSVRow {
  product: string;
  quarter: string;
  quarterly_ideas: string;
  total_ideas: string;
  responsiveness: string;
  roadmap_alignment_committed: string;
  roadmap_alignment_total: string;
 responsiveness_q1_percentage: string;
 responsiveness_q1_moved_out: string;
 responsiveness_q1_total: string;
 responsiveness_q2_percentage: string;
 responsiveness_q2_moved_out: string;
 responsiveness_q2_total: string;
 responsiveness_q3_percentage: string;
 responsiveness_q3_moved_out: string;
 responsiveness_q3_total: string;
 responsiveness_q4_percentage: string;
 responsiveness_q4_moved_out: string;
 responsiveness_q4_total: string;
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

 // Transform quarterly responsiveness data
 const responsivenessQuarterlyData = [
   {
     quarter: 'FY25 Q1',
     percentage: safeNumberConversion(firstRow.responsiveness_q1_percentage),
     totalIdeas: safeNumberConversion(firstRow.responsiveness_q1_total),
     ideasMovedOutOfReview: safeNumberConversion(firstRow.responsiveness_q1_moved_out)
   },
   {
     quarter: 'FY25 Q2',
     percentage: safeNumberConversion(firstRow.responsiveness_q2_percentage),
     totalIdeas: safeNumberConversion(firstRow.responsiveness_q2_total),
     ideasMovedOutOfReview: safeNumberConversion(firstRow.responsiveness_q2_moved_out)
   },
   {
     quarter: 'FY25 Q3',
     percentage: safeNumberConversion(firstRow.responsiveness_q3_percentage),
     totalIdeas: safeNumberConversion(firstRow.responsiveness_q3_total),
     ideasMovedOutOfReview: safeNumberConversion(firstRow.responsiveness_q3_moved_out)
   },
   {
     quarter: 'FY25 Q4',
     percentage: safeNumberConversion(firstRow.responsiveness_q4_percentage),
     totalIdeas: safeNumberConversion(firstRow.responsiveness_q4_total),
     ideasMovedOutOfReview: safeNumberConversion(firstRow.responsiveness_q4_moved_out)
   }
 ];
  // Safely extract metric summary from first row
  const metricSummary = {
    responsiveness: safeNumberConversion(firstRow.responsiveness),
    responsivenessQuarterlyData: responsivenessQuarterlyData,
    roadmapAlignment: {
      committed: safeNumberConversion(firstRow.roadmap_alignment_committed),
      total: safeNumberConversion(firstRow.roadmap_alignment_total),
    },
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
  };


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
    lineChartData,
    topFeatures: features,
    collaborationTrendData,
    data_socialization_forums: forums
  };
};

// Function to parse top features CSV data
export const parseTopFeaturesCSV = (csvData: string): Promise<TopFeaturesData> => {
  return new Promise((resolve, reject) => {
    Papa.parse(csvData, {
      header: true,
      dynamicTyping: false,
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

          const rows = results.data as FeatureCSVRow[];
          const currentQuarterFeatures: Feature[] = [];
          const previousQuarterFeatures: Feature[] = [];

          rows.forEach(row => {
            // Validate required fields
            if (!row.feature_name || !row.vote_count || !row.status || !row.status_updated_at || !row.client_voters || !row.feature_quarter) {
              return; // Skip invalid rows
            }

            const feature: Feature = {
              feature_name: row.feature_name.trim(),
              vote_count: safeNumberConversion(row.vote_count),
              status: row.status.trim() as 'Delivered' | 'Under Review' | 'Committed',
              status_updated_at: row.status_updated_at.trim(),
              client_voters: row.client_voters.split(',').map(s => s.trim()).filter(s => s.length > 0)
            };

            // Categorize by quarter
            const quarter = row.feature_quarter.trim().toLowerCase();
            if (quarter === 'current' || quarter === 'q4') {
              currentQuarterFeatures.push(feature);
            } else if (quarter === 'previous' || quarter === 'q3') {
              previousQuarterFeatures.push(feature);
            }
          });

          // Sort by vote count (descending)
          currentQuarterFeatures.sort((a, b) => b.vote_count - a.vote_count);
          previousQuarterFeatures.sort((a, b) => b.vote_count - a.vote_count);

          resolve({
            currentQuarterFeatures,
            previousQuarterFeatures
          });
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

// Function to parse responsiveness trend CSV data
export const parseResponsivenessTrendCSV = (csvData: string): Promise<Array<{
  quarter: string;
  percentage: number;
  totalIdeas: number;
  ideasMovedOutOfReview: number;
  ideasList?: string[];
}>> => {
  return new Promise((resolve, reject) => {
    Papa.parse(csvData, {
      header: true,
      dynamicTyping: false,
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

          const rows = results.data as ResponsivenessTrendCSVRow[];
          const responsivenessData: Array<{
            quarter: string;
            percentage: number;
            totalIdeas: number;
            ideasMovedOutOfReview: number;
            ideasList?: string[];
          }> = [];

          rows.forEach(row => {
            // Validate required fields
            if (!row.quarter || !row.percentage || !row.total_ideas || !row.ideas_moved_out_of_review) {
              return; // Skip invalid rows
            }

            const data = {
              quarter: row.quarter.trim(),
              percentage: safeNumberConversion(row.percentage),
              totalIdeas: safeNumberConversion(row.total_ideas),
              ideasMovedOutOfReview: safeNumberConversion(row.ideas_moved_out_of_review),
              ideasList: row.ideas_list ? 
                row.ideas_list.split(',').map(s => s.trim()).filter(s => s.length > 0) : 
                undefined
            };

            responsivenessData.push(data);
          });

          // Sort by quarter (assuming FY format)
          responsivenessData.sort((a, b) => {
            const getQuarterNum = (quarter: string) => {
              const match = quarter.match(/Q(\d+)/);
              return match ? parseInt(match[1]) : 0;
            };
            return getQuarterNum(a.quarter) - getQuarterNum(b.quarter);
          });

          resolve(responsivenessData);
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

// Function to parse commitment trends CSV data
export const parseCommitmentTrendsCSV = (csvData: string): Promise<CommitmentTrendsData> => {
  return new Promise((resolve, reject) => {
    Papa.parse(csvData, {
      header: true,
      dynamicTyping: false,
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

          const rows = results.data as CommitmentTrendsCSVRow[];
          const commitmentTrends: Array<{
            year: string;
            committed: number;
            delivered: number;
          }> = [];
          const quarterlyDeliveries: Array<{
            quarter: string;
            year: string;
            delivered: number;
          }> = [];

          rows.forEach(row => {
            // Validate required fields for annual data
            if (!row.year || !row.committed || !row.delivered) {
              return; // Skip invalid rows
            }

            // Add annual commitment data
            const annualData = {
              year: row.year.trim(),
              committed: safeNumberConversion(row.committed),
              delivered: safeNumberConversion(row.delivered)
            };

            // Check if this year already exists
            const existingIndex = commitmentTrends.findIndex(item => item.year === annualData.year);
            if (existingIndex === -1) {
              commitmentTrends.push(annualData);
            } else {
              // Update existing entry
              commitmentTrends[existingIndex] = annualData;
            }

            // Add quarterly data if available
            if (row.quarter && row.quarterly_delivered) {
              const quarterlyData = {
                quarter: row.quarter.trim(),
                year: row.year.trim(),
                delivered: safeNumberConversion(row.quarterly_delivered)
              };

              // Check if this quarter-year combination already exists
              const existingQuarterIndex = quarterlyDeliveries.findIndex(
                item => item.quarter === quarterlyData.quarter && item.year === quarterlyData.year
              );
              if (existingQuarterIndex === -1) {
                quarterlyDeliveries.push(quarterlyData);
              } else {
                // Update existing entry
                quarterlyDeliveries[existingQuarterIndex] = quarterlyData;
              }
            }
          });

          // Sort by year
          commitmentTrends.sort((a, b) => parseInt(a.year) - parseInt(b.year));
          
          // Sort quarterly data by year and quarter
          quarterlyDeliveries.sort((a, b) => {
            const yearDiff = parseInt(a.year) - parseInt(b.year);
            if (yearDiff !== 0) return yearDiff;
            
            const getQuarterNum = (quarter: string) => {
              const match = quarter.match(/Q(\d+)/);
              return match ? parseInt(match[1]) : 0;
            };
            return getQuarterNum(a.quarter) - getQuarterNum(b.quarter);
          });

          resolve({
            commitmentTrends,
            quarterlyDeliveries
          });
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

// Function to parse continued engagement CSV data
export const parseContinuedEngagementCSV = (csvData: string): Promise<ContinuedEngagementData> => {
  return new Promise((resolve, reject) => {
    Papa.parse(csvData, {
      header: true,
      dynamicTyping: false,
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

          const rows = results.data as ContinuedEngagementCSVRow[];
          const quarterlyTrends: Array<{
            quarter: string;
            rate: number;
            numerator: number;
            denominator: number;
          }> = [];
          const ideas: Array<{
            id: string;
            name: string;
            initialStatusChange: string;
            subsequentChanges: Array<{
              date: string;
              status: string;
            }>;
            daysBetween: number;
            included: boolean;
          }> = [];

          // Track processed quarters to avoid duplicates
          const processedQuarters = new Set<string>();

          rows.forEach(row => {
            // Validate required fields for quarterly data
            if (!row.quarter || !row.rate || !row.numerator || !row.denominator) {
              return; // Skip invalid rows
            }

            // Add quarterly trend data (avoid duplicates)
            if (!processedQuarters.has(row.quarter)) {
              const quarterlyData = {
                quarter: row.quarter.trim(),
                rate: safeNumberConversion(row.rate),
                numerator: safeNumberConversion(row.numerator),
                denominator: safeNumberConversion(row.denominator)
              };
              quarterlyTrends.push(quarterlyData);
              processedQuarters.add(row.quarter);
            }

            // Add idea data if available
            if (row.idea_id && row.idea_name && row.initial_status_change) {
              const subsequentChanges: Array<{ date: string; status: string }> = [];
              
              // Parse subsequent changes if available
              if (row.subsequent_changes) {
                try {
                  // Expected format: "date1:status1,date2:status2"
                  const changes = row.subsequent_changes.split(',');
                  changes.forEach(change => {
                    const [date, status] = change.split(':');
                    if (date && status) {
                      subsequentChanges.push({
                        date: date.trim(),
                        status: status.trim()
                      });
                    }
                  });
                } catch (error) {
                  // If parsing fails, continue without subsequent changes
                  console.warn('Failed to parse subsequent changes:', error);
                }
              }

              const ideaData = {
                id: row.idea_id.trim(),
                name: row.idea_name.trim(),
                initialStatusChange: row.initial_status_change.trim(),
                subsequentChanges,
                daysBetween: safeNumberConversion(row.days_between),
                included: row.included ? row.included.toLowerCase() === 'true' : subsequentChanges.length > 0
              };

              ideas.push(ideaData);
            }
          });

          // Sort quarterly data by quarter
          quarterlyTrends.sort((a, b) => {
            const getQuarterNum = (quarter: string) => {
              const match = quarter.match(/Q(\d+)/);
              return match ? parseInt(match[1]) : 0;
            };
            return getQuarterNum(a.quarter) - getQuarterNum(b.quarter);
          });

          resolve({
            quarterlyTrends,
            ideas
          });
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

// Function to parse client submissions CSV data
export const parseClientSubmissionsCSV = (csvData: string): Promise<ClientSubmissionsData> => {
  return new Promise((resolve, reject) => {
    Papa.parse(csvData, {
      header: true,
      dynamicTyping: false,
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

          const rows = results.data as ClientSubmissionsCSVRow[];
          const lineChartData: Array<{
            quarter: string;
            clientsRepresenting: number;
            clients?: string[];
          }> = [];

          rows.forEach(row => {
            // Validate required fields
            if (!row.quarter || !row.clients_representing) {
              return; // Skip invalid rows
            }

            const clients = row.client_names ? 
              row.client_names.split(',').map
          }
          )
        }
      }
    }
    )
  }
  )
}
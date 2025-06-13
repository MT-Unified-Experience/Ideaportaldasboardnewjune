import React, { createContext, useContext, useState, ReactNode } from 'react';
import { DashboardData, Product, Quarter, ProductData, ProductQuarterlyData } from '../types';
import { parseCSV, validateCSVHeaders, CSVError, parseTopFeaturesCSV, topFeaturesRequiredHeaders, parseResponsivenessTrendCSV, responsivenessTrendRequiredHeaders, parseCommitmentTrendsCSV, commitmentTrendsRequiredHeaders } from '../utils/csvParser';
import { parseContinuedEngagementCSV, continuedEngagementRequiredHeaders, parseClientSubmissionsCSV, clientSubmissionsRequiredHeaders, parseCrossClientCollaborationCSV, crossClientCollaborationRequiredHeaders } from '../utils/csvParser';
import { supabase, checkSupabaseConnection } from '../utils/supabaseClient';
import { useEffect, useMemo } from 'react';
import Papa from 'papaparse';

// Define expected fiscal years
const EXPECTED_YEARS = ['FY22', 'FY23', 'FY24', 'FY25'];

interface DataContextType {
  currentProduct: Product;
  currentQuarter: Quarter;
  dashboardData: DashboardData | null;
  allProductsData: Record<Product, ProductData>;
  setCurrentProduct: (product: Product) => void;
  setCurrentQuarter: (quarter: Quarter) => void;
  uploadCSV: (file: File) => Promise<void>;
  uploadProductQuarterlyCSV: (file: File) => Promise<void>;
  uploadTopFeaturesCSV: (file: File) => Promise<void>;
  uploadResponsivenessTrendCSV: (file: File) => Promise<void>;
  uploadCommitmentTrendsCSV: (file: File) => Promise<void>;
  uploadContinuedEngagementCSV: (file: File) => Promise<void>;
  uploadClientSubmissionsCSV: (file: File) => Promise<void>;
  uploadCrossClientCollaborationCSV: (file: File) => Promise<void>;
  fetchProductQuarterlyData: (filters?: { product_id?: string; product_name?: string; quarter?: string; year?: string; page?: number; limit?: number; orderBy?: string; orderDirection?: 'asc' | 'desc'; }) => Promise<ProductQuarterlyData[]>;
  updateDashboardData: (data: DashboardData) => Promise<void>;
  isLoading: boolean;
  error: Error | null;
  isSupabaseAvailable: boolean;
}

// Create context with a default value to prevent undefined context errors
const DataContext = createContext<DataContextType | null>(null);

// Default values for the dashboard data structure
const defaultDashboardData: DashboardData = {
  metricSummary: {
    responsiveness: 0,
    roadmapAlignment: {
      committed: 0,
      total: 0
    },
    continuedEngagement: {
      rate: 0,
      numerator: 0,
      denominator: 0,
      ideas: []
    },
    ideaVolume: { 
      quarterly: 0,
      total: 0
    },
  },
  lineChartData: [],
  topFeatures: [],
};

// Helper function to create a default error object
const createError = (message: string): Error => {
  return new Error(message);
};

// Helper function to safely parse error messages
const parseError = (error: unknown): Error => {
  if (error instanceof Error) {
    return error;
  }
  return createError(String(error));
};

// Helper function to safely merge nested objects
const safelyMergeNestedObjects = (defaultObj: any, incomingObj: any | null): any => {
  if (!incomingObj || typeof incomingObj !== 'object') {
    return { ...defaultObj };
  }
  return {
    ...defaultObj,
    ...incomingObj
  };
};

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentProduct, setCurrentProduct] = useState<Product>('TeamConnect');
  const [currentQuarter, setCurrentQuarter] = useState<Quarter>('FY25 Q1');
  const [allProductsData, setAllProductsData] = useState<Record<Product, ProductData>>({} as Record<Product, ProductData>);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [isSupabaseAvailable, setIsSupabaseAvailable] = useState<boolean>(false);

  // Check Supabase connection on mount with better error handling
  useEffect(() => {
    const checkConnection = async () => {
      try {
        const available = await checkSupabaseConnection();
        setIsSupabaseAvailable(available);
        if (!available) {
          console.warn('Supabase is not available. Application will work in offline mode.');
        }
      } catch (error) {
        console.warn('Error checking Supabase connection, continuing in offline mode:', error);
        setIsSupabaseAvailable(false);
      }
    };

    // Add a small delay to prevent immediate connection attempts
    const timeoutId = setTimeout(checkConnection, 100);
    return () => clearTimeout(timeoutId);
  }, []);

  // Initialize default data for all products and quarters
  const initializeDefaultData = () => {
    const products: Product[] = [
      'TeamConnect',
      'Collaborati',
      'LegalHold',
      'TAP Workflow Automation',
      'HotDocs',
      'eCounsel',
      'CaseCloud'
    ];
    
    const quarters: Quarter[] = ['FY25 Q1', 'FY25 Q2', 'FY25 Q3', 'FY25 Q4'];
    
    const initialData: Record<Product, ProductData> = {} as Record<Product, ProductData>;
    
    products.forEach(product => {
      initialData[product] = {};
      quarters.forEach(quarter => {
        initialData[product][quarter] = {
          ...defaultDashboardData,
          metricSummary: {
            ...defaultDashboardData.metricSummary,
            roadmapAlignment: { ...defaultDashboardData.metricSummary.roadmapAlignment },
            ideaVolume: { ...defaultDashboardData.metricSummary.ideaVolume },
          },
          lineChartData: [...defaultDashboardData.lineChartData],
          topFeatures: [...defaultDashboardData.topFeatures],
          previousQuarterFeatures: [],
          data_socialization_forums: [
            { name: 'CSC' },
            { name: 'Sprint Reviews' },
            { name: 'Customer Advisory Board (CAB)' },
            { name: 'CWG' },
            { name: 'Quarterly Product Reviews (QBRs)' }
          ]
        };
      });
    });
    
    setAllProductsData(initialData);
  };

  useEffect(() => {
    initializeDefaultData();
  }, []);

  // Compute dashboardData based on current product and quarter
  const dashboardData = useMemo(() => {
    const productData = allProductsData[currentProduct];
    if (!productData) return null;
    
    const quarterData = productData[currentQuarter];
    return quarterData || null;
  }, [allProductsData, currentProduct, currentQuarter]);

  // Required headers for product quarterly CSV validation
  const productQuarterlyHeaders = [
    'product_id',
    'product_name',
    'quarter',
    'year',
    'sales_data'
  ];

  // Required headers for CSV validation
  const requiredHeaders = [
    'product', 'quarter', 'quarterly_ideas', 'total_ideas', 'responsiveness', 'roadmap_alignment_committed', 'roadmap_alignment_total',
    'active_quarter', 'active_clients_representing', 'feature_name', 'vote_count', 'status',
    'status_updated_at', 'client_voters', 'forum_name', 'forum_audience', 'forum_purpose'
  ];

  // Helper function to safely store data in Supabase with improved error handling
  const safeSupabaseUpsert = async (table: string, data: any, conflictColumns: string) => {
    if (!isSupabaseAvailable || !supabase) {
      console.warn('Supabase not available. Data saved locally only.');
      return;
    }

    try {
      const { error: upsertError } = await supabase
        .from(table)
        .upsert(data, {
          onConflict: conflictColumns
        });
      
      if (upsertError) throw upsertError;
    } catch (error: any) {
      // More specific error handling
      if (error?.message?.includes('Failed to fetch') || 
          error?.name === 'TypeError' ||
          error?.message?.includes('network')) {
        console.warn(`Network error saving to ${table}. Data saved locally only.`);
      } else {
        console.warn(`Failed to save to ${table}:`, error);
      }
      // Don't throw error - allow local operation to continue
    }
  };

  // Function to handle product quarterly CSV upload
  const uploadProductQuarterlyCSV = async (file: File): Promise<void> => {
    setIsLoading(true);
    setError(null);
    
    try {
      if (!file.name.endsWith('.csv')) {
        throw new CSVError(
          'Invalid file format',
          'file',
          ['Only CSV files are supported', 'Please upload a file with .csv extension']
        );
      }
      
      const fileContent = await file.text();
      await validateCSVHeaders(fileContent, productQuarterlyHeaders);
      
      const { data: parsedData } = Papa.parse(fileContent, {
        header: true, 
        skipEmptyLines: true
      });
      
      const quarterlyData = transformProductQuarterlyCSVData(parsedData);
      
      await safeSupabaseUpsert('product_quarterly_data', quarterlyData, 'product_id,quarter,year');
      
    } catch (err) {
      if (err instanceof Error) {
        setError(err);
      } else {
        setError(new CSVError(
          'Failed to upload product quarterly data',
          'application',
          [(err as Error)?.message || 'Please try again or contact support']
        ));
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Function to handle top features CSV upload
  const uploadTopFeaturesCSV = async (file: File): Promise<void> => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Check if file is CSV
      if (!file.name.endsWith('.csv')) {
        throw new CSVError(
          'Invalid file format',
          'file',
          ['Only CSV files are supported', 'Please upload a file with .csv extension']
        );
      }
      
      // Read file contents
      const fileContent = await file.text();
      
      // Validate CSV headers
      await validateCSVHeaders(fileContent, topFeaturesRequiredHeaders);
      
      // Parse top features CSV data
      const featuresData = await parseTopFeaturesCSV(fileContent);
      
      // Get current dashboard data
      const currentData = allProductsData[currentProduct]?.[currentQuarter] || defaultDashboardData;
      
      // Update the features data
      const updatedData: DashboardData = {
        ...currentData,
        topFeatures: featuresData.currentQuarterFeatures,
        previousQuarterFeatures: featuresData.previousQuarterFeatures
      };

      // Store data in Supabase
      await safeSupabaseUpsert('dashboards', {
        product: currentProduct,
        quarter: currentQuarter,
        data: updatedData
      }, 'product,quarter');
      
      // Update local state
      setAllProductsData(prevData => ({
        ...prevData,
        [currentProduct]: {
          ...prevData[currentProduct],
          [currentQuarter]: updatedData
        }
      }));
      
    } catch (err) {
      if (err instanceof CSVError) {
        setError(err);
      } else {
        setError(new CSVError(
          'An unexpected error occurred while uploading top features',
          'application',
          [(err as Error)?.message || 'Please try again or contact support']
        ));
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Function to handle responsiveness trend CSV upload
  const uploadResponsivenessTrendCSV = async (file: File): Promise<void> => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Check if file is CSV
      if (!file.name.endsWith('.csv')) {
        throw new CSVError(
          'Invalid file format',
          'file',
          ['Only CSV files are supported', 'Please upload a file with .csv extension']
        );
      }
      
      // Read file contents
      const fileContent = await file.text();
      
      // Validate CSV headers
      await validateCSVHeaders(fileContent, responsivenessTrendRequiredHeaders);
      
      // Parse responsiveness trend CSV data
      const responsivenessData = await parseResponsivenessTrendCSV(fileContent);
      
      // Get current dashboard data
      const currentData = allProductsData[currentProduct]?.[currentQuarter] || defaultDashboardData;
      
      // Update the responsiveness data
      const updatedData: DashboardData = {
        ...currentData,
        metricSummary: {
          ...currentData.metricSummary,
          responsivenessQuarterlyData: responsivenessData,
          // Update main responsiveness value to the latest quarter's percentage
          responsiveness: responsivenessData.length > 0 ? 
            responsivenessData[responsivenessData.length - 1].percentage : 
            currentData.metricSummary.responsiveness
        }
      };

      // Store data in Supabase
      await safeSupabaseUpsert('dashboards', {
        product: currentProduct,
        quarter: currentQuarter,
        data: updatedData
      }, 'product,quarter');
      
      // Update local state
      setAllProductsData(prevData => ({
        ...prevData,
        [currentProduct]: {
          ...prevData[currentProduct],
          [currentQuarter]: updatedData
        }
      }));
      
    } catch (err) {
      if (err instanceof CSVError) {
        setError(err);
      } else {
        setError(new CSVError(
          'An unexpected error occurred while uploading responsiveness trend data',
          'application',
          [(err as Error)?.message || 'Please try again or contact support']
        ));
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Function to handle commitment trends CSV upload
  const uploadCommitmentTrendsCSV = async (file: File): Promise<void> => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Check if file is CSV
      if (!file.name.endsWith('.csv')) {
        throw new CSVError(
          'Invalid file format',
          'file',
          ['Only CSV files are supported', 'Please upload a file with .csv extension']
        );
      }
      
      // Read file contents
      const fileContent = await file.text();
      
      // Validate CSV headers
      await validateCSVHeaders(fileContent, commitmentTrendsRequiredHeaders);
      
      // Parse commitment trends CSV data
      const commitmentData = await parseCommitmentTrendsCSV(fileContent);
      
      // Get current dashboard data
      const currentData = allProductsData[currentProduct]?.[currentQuarter] || defaultDashboardData;
      
      // Update the commitment data
      const updatedData: DashboardData = {
        ...currentData,
        metricSummary: {
          ...currentData.metricSummary,
          roadmapAlignment: {
            ...currentData.metricSummary.roadmapAlignment,
            commitmentTrends: commitmentData.commitmentTrends,
            quarterlyDeliveries: commitmentData.quarterlyDeliveries,
            // Update main values to the latest year's data
            committed: commitmentData.commitmentTrends.length > 0 ? 
              commitmentData.commitmentTrends[commitmentData.commitmentTrends.length - 1].delivered : 
              currentData.metricSummary.roadmapAlignment.committed,
            total: commitmentData.commitmentTrends.length > 0 ? 
              commitmentData.commitmentTrends[commitmentData.commitmentTrends.length - 1].committed : 
              currentData.metricSummary.roadmapAlignment.total
          }
        }
      };

      // Store data in Supabase
      await safeSupabaseUpsert('dashboards', {
        product: currentProduct,
        quarter: currentQuarter,
        data: updatedData
      }, 'product,quarter');
      
      // Update local state
      setAllProductsData(prevData => ({
        ...prevData,
        [currentProduct]: {
          ...prevData[currentProduct],
          [currentQuarter]: updatedData
        }
      }));
      
    } catch (err) {
      if (err instanceof CSVError) {
        setError(err);
      } else {
        setError(new CSVError(
          'An unexpected error occurred while uploading commitment trends data',
          'application',
          [(err as Error)?.message || 'Please try again or contact support']
        ));
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Function to handle continued engagement CSV upload
  const uploadContinuedEngagementCSV = async (file: File): Promise<void> => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Check if file is CSV
      if (!file.name.endsWith('.csv')) {
        throw new CSVError(
          'Invalid file format',
          'file',
          ['Only CSV files are supported', 'Please upload a file with .csv extension']
        );
      }
      
      // Read file contents
      const fileContent = await file.text();
      
      // Validate CSV headers
      await validateCSVHeaders(fileContent, continuedEngagementRequiredHeaders);
      
      // Parse continued engagement CSV data
      const engagementData = await parseContinuedEngagementCSV(fileContent);
      
      // Get current dashboard data
      const currentData = allProductsData[currentProduct]?.[currentQuarter] || defaultDashboardData;
      
      // Update the continued engagement data
      const updatedData: DashboardData = {
        ...currentData,
        metricSummary: {
          ...currentData.metricSummary,
          continuedEngagement: {
            // Update main values to the latest quarter's data
            rate: engagementData.quarterlyTrends.length > 0 ? 
              engagementData.quarterlyTrends[engagementData.quarterlyTrends.length - 1].rate : 
              currentData.metricSummary.continuedEngagement?.rate || 0,
            numerator: engagementData.quarterlyTrends.length > 0 ? 
              engagementData.quarterlyTrends[engagementData.quarterlyTrends.length - 1].numerator : 
              currentData.metricSummary.continuedEngagement?.numerator || 0,
            denominator: engagementData.quarterlyTrends.length > 0 ? 
              engagementData.quarterlyTrends[engagementData.quarterlyTrends.length - 1].denominator : 
              currentData.metricSummary.continuedEngagement?.denominator || 0,
            ideas: engagementData.ideas,
            quarterlyTrends: engagementData.quarterlyTrends
          }
        }
      };

      // Store data in Supabase
      await safeSupabaseUpsert('dashboards', {
        product: currentProduct,
        quarter: currentQuarter,
        data: updatedData
      }, 'product,quarter');
      
      // Update local state
      setAllProductsData(prevData => ({
        ...prevData,
        [currentProduct]: {
          ...prevData[currentProduct],
          [currentQuarter]: updatedData
        }
      }));
      
    } catch (err) {
      if (err instanceof CSVError) {
        setError(err);
      } else {
        setError(new CSVError(
          'An unexpected error occurred while uploading continued engagement data',
          'application',
          [(err as Error)?.message || 'Please try again or contact support']
        ));
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Function to handle client submissions CSV upload
  const uploadClientSubmissionsCSV = async (file: File): Promise<void> => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Check if file is CSV
      if (!file.name.endsWith('.csv')) {
        throw new CSVError(
          'Invalid file format',
          'file',
          ['Only CSV files are supported', 'Please upload a file with .csv extension']
        );
      }
      
      // Read file contents
      const fileContent = await file.text();
      
      // Validate CSV headers
      await validateCSVHeaders(fileContent, clientSubmissionsRequiredHeaders);
      
      // Parse client submissions CSV data
      const submissionsData = await parseClientSubmissionsCSV(fileContent);
      
      // Get current dashboard data
      const currentData = allProductsData[currentProduct]?.[currentQuarter] || defaultDashboardData;
      
      // Update the line chart data
      const updatedData: DashboardData = {
        ...currentData,
        lineChartData: submissionsData.lineChartData
      };

      // Store data in Supabase
      await safeSupabaseUpsert('dashboards', {
        product: currentProduct,
        quarter: currentQuarter,
        data: updatedData
      }, 'product,quarter');
      
      // Update local state
      setAllProductsData(prevData => ({
        ...prevData,
        [currentProduct]: {
          ...prevData[currentProduct],
          [currentQuarter]: updatedData
        }
      }));
      
    } catch (err) {
      if (err instanceof CSVError) {
        setError(err);
      } else {
        setError(new CSVError(
          'An unexpected error occurred while uploading client submissions data',
          'application',
          [(err as Error)?.message || 'Please try again or contact support']
        ));
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Function to handle cross-client collaboration CSV upload
  const uploadCrossClientCollaborationCSV = async (file: File): Promise<void> => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Check if file is CSV
      if (!file.name.endsWith('.csv')) {
        throw new CSVError(
          'Invalid file format',
          'file',
          ['Only CSV files are supported', 'Please upload a file with .csv extension']
        );
      }
      
      // Read file contents
      const fileContent = await file.text();
      
      // Validate CSV headers
      await validateCSVHeaders(fileContent, crossClientCollaborationRequiredHeaders);
      
      // Parse cross-client collaboration CSV data
      const collaborationData = await parseCrossClientCollaborationCSV(fileContent);
      
      // Get current dashboard data
      const currentData = allProductsData[currentProduct]?.[currentQuarter] || defaultDashboardData;
      
      // Update the collaboration trend data
      const updatedData: DashboardData = {
        ...currentData,
        collaborationTrendData: collaborationData.collaborationTrendData
      };

      // Store data in Supabase
      await safeSupabaseUpsert('dashboards', {
        product: currentProduct,
        quarter: currentQuarter,
        data: updatedData
      }, 'product,quarter');
      
      // Update local state
      setAllProductsData(prevData => ({
        ...prevData,
        [currentProduct]: {
          ...prevData[currentProduct],
          [currentQuarter]: updatedData
        }
      }));
      
    } catch (err) {
      if (err instanceof CSVError) {
        setError(err);
      } else {
        setError(new CSVError(
          'An unexpected error occurred while uploading cross-client collaboration data',
          'application',
          [(err as Error)?.message || 'Please try again or contact support']
        ));
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Function to fetch product quarterly data
  const fetchProductQuarterlyData = async (filters?: { 
    product_id?: string; 
    product_name?: string; 
    quarter?: string; 
    year?: string; 
    page?: number; 
    limit?: number; 
    orderBy?: string; 
    orderDirection?: 'asc' | 'desc'; 
  }): Promise<ProductQuarterlyData[]> => {
    // Implementation would go here - returning empty array for now
    return [];
  };

  // Transform product quarterly CSV data
  const transformProductQuarterlyCSVData = (data: any[]) => {
    return data.map(row => ({
      product_id: row.product_id,
      product_name: row.product_name,
      quarter: row.quarter,
      year: row.year,
      sales_data: row.sales_data
    }));
  };

  // Function to handle CSV upload
  const uploadCSV = async (file: File): Promise<void> => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Check if file is CSV
      if (!file.name.endsWith('.csv')) {
        throw new CSVError(
          'Invalid file format',
          'file',
          ['Only CSV files are supported', 'Please upload a file with .csv extension']
        );
      }
      
      // Read file contents
      const fileContent = await file.text();
      
      // Validate CSV headers
      await validateCSVHeaders(fileContent, requiredHeaders);
      
      // Parse CSV data
      const parsedData = await parseCSV(fileContent, currentProduct);
      
      // Store data in Supabase
      await safeSupabaseUpsert('dashboards', {
        product: currentProduct,
        quarter: currentQuarter,
        data: parsedData
      }, 'product,quarter');
      
      // Update local state
      setAllProductsData(prevData => ({
        ...prevData,
        [currentProduct]: {
          ...prevData[currentProduct],
          [currentQuarter]: parsedData
        }
      }));
      
    } catch (err) {
      if (err instanceof CSVError) {
        setError(err);
      } else {
        setError(new CSVError(
          'An unexpected error occurred while uploading the CSV file',
          'application',
          [(err as Error)?.message || 'Please try again or contact support']
        ));
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Update dashboard data function
  const updateDashboardData = async (data: DashboardData): Promise<void> => {
    setIsLoading(true);
    setError(null);
    
    try {
      await safeSupabaseUpsert('dashboards', {
        product: currentProduct,
        quarter: currentQuarter,
        data: data
      }, 'product,quarter');
      
      // Update local state
      setAllProductsData(prevData => ({
        ...prevData,
        [currentProduct]: {
          ...prevData[currentProduct],
          [currentQuarter]: data
        }
      }));
      
    } catch (err) {
      setError(parseError(err));
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const value: DataContextType = {
    currentProduct,
    currentQuarter,
    dashboardData,
    allProductsData,
    setCurrentProduct,
    setCurrentQuarter,
    uploadCSV,
    uploadProductQuarterlyCSV,
    uploadTopFeaturesCSV,
    uploadResponsivenessTrendCSV,
    uploadCommitmentTrendsCSV,
    uploadContinuedEngagementCSV,
    uploadClientSubmissionsCSV,
    uploadCrossClientCollaborationCSV,
    fetchProductQuarterlyData,
    updateDashboardData,
    isLoading,
    error,
    isSupabaseAvailable,
  };

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
};

// Custom hook to use the DataContext
export const useData = (): DataContextType => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
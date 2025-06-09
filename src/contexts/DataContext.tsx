import React, { createContext, useContext, useState, ReactNode } from 'react';
import { DashboardData, Product, Quarter, ProductData, ProductQuarterlyData } from '../types';
import { parseCSV, validateCSVHeaders, CSVError } from '../utils/csvParser';
import { supabase, checkSupabaseConnection } from '../utils/supabaseClient';
import { useEffect, useMemo } from 'react';

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
  fetchProductQuarterlyData: (filters?: { product_id?: string; product_name?: string; quarter?: string; year?: string; page?: number; limit?: number; orderBy?: string; orderDirection?: 'asc' | 'desc'; }) => Promise<ProductQuarterlyData[]>;
  updateDashboardData: (data: DashboardData) => Promise<void>;
  isLoading: boolean;
  error: Error | null;
}

export const DataContext = createContext<DataContextType | undefined>(undefined);

// Default values for the dashboard data structure
const defaultDashboardData: DashboardData = {
  metricSummary: {
    responsiveness: 0,
    responsivenessTrend: 0,
    roadmapAlignment: {
      committed: 0,
      total: 0
    },
    collaborationTrends: [],
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
    agingIdeas: {
      count: 0,
      trend: []
    },
    crossClientCollaboration: 0
  },
  stackedBarData: EXPECTED_YEARS.map(year => ({
    year,
    candidateIdeas: 0,
    inDevelopment: 0,
    archivedIdeas: 0,
    flaggedForFuture: 0
  })),
  lineChartData: [],
  topFeatures: []
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
  // Helper function to merge stacked bar data
  const mergeStackedBarData = (existingData: DashboardData['stackedBarData'], newData: DashboardData['stackedBarData']) => {
    const mergedData = [...defaultDashboardData.stackedBarData];
    
    // Update values from existing data
    existingData.forEach(item => {
      const index = mergedData.findIndex(d => d.year === item.year);
      if (index !== -1) {
        mergedData[index] = { ...mergedData[index], ...item };
      }
    });
    
    // Update values from new data
    newData.forEach(item => {
      const index = mergedData.findIndex(d => d.year === item.year);
      if (index !== -1) {
        mergedData[index] = { ...mergedData[index], ...item };
      }
    });
    
    return mergedData;
  };

  const [currentProduct, setCurrentProduct] = useState<Product>('TeamConnect');
  const [currentQuarter, setCurrentQuarter] = useState<Quarter>('FY25 Q1');
  const [allProductsData, setAllProductsData] = useState<Record<Product, ProductData>>({} as Record<Product, ProductData>);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

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
            agingIdeas: { 
              ...defaultDashboardData.metricSummary.agingIdeas,
              trend: [...(defaultDashboardData.metricSummary.agingIdeas.trend || [])]
            }
          },
          stackedBarData: [...defaultDashboardData.stackedBarData],
          lineChartData: [...defaultDashboardData.lineChartData],
          topFeatures: [...defaultDashboardData.topFeatures],
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

  // Required headers for product quarterly CSV validation
  const productQuarterlyHeaders = [
    'product_id',
    'product_name',
    'quarter',
    'year',
    'sales_data'
  ];

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
      
      const { error: upsertError } = await supabase
        .from('product_quarterly_data')
        .upsert(quarterlyData, {
          onConflict: 'product_id,quarter,year'
        });
      
      if (upsertError) throw upsertError;
      
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

  // Function to fetch product quarterly data with filters
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
    try {
      let query = supabase
        .from('product_quarterly_data')
        .select('*');
      
      // Apply filters
      if (filters?.product_id) {
        query = query.eq('product_id', filters.product_id);
      }
      if (filters?.product_name) {
        query = query.ilike('product_name', `%${filters.product_name}%`);
      }
      if (filters?.quarter) {
        query = query.eq('quarter', filters.quarter);
      }
      if (filters?.year) {
        query = query.eq('year', filters.year);
      }
      
      // Apply sorting
      if (filters?.orderBy) {
        query = query.order(filters.orderBy, {
          ascending: filters.orderDirection !== 'desc'
        });
      }
      
      // Apply pagination
      if (filters?.page !== undefined && filters?.limit !== undefined) {
        const start = filters.page * filters.limit;
        const end = start + filters.limit - 1;
        query = query.range(start, end);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      return data || [];
      
    } catch (err) {
      console.error('Error fetching product quarterly data:', err);
      throw err;
    }
  };

  // Check Supabase connection on mount
  useEffect(() => {
    const checkConnection = async () => {
      try {
        // Add a small delay before first connection attempt
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const isConnected = await checkSupabaseConnection();
        if (!isConnected) {
          setError(new Error('Unable to connect to Supabase. Please check your connection settings.'));
          return false;
        }
        return true;
      } catch (error) {
        console.error('Connection check failed:', error);
        setError(error instanceof Error ? error : new Error('Connection check failed'));
        return false;
      }
    };
    
    checkConnection();
  }, []);

  // Fetch data when product or quarter changes
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Check connection before fetching
        const isConnected = await checkSupabaseConnection();
        if (!isConnected) { 
          throw new Error('Unable to establish database connection. Please try again later.');
        }

        const { data, error: fetchError } = await supabase
          .from('dashboards')
          .select('data')
          .eq('product', currentProduct)
          .eq('quarter', currentQuarter)
          .maybeSingle();
        
        if (fetchError) throw fetchError;
        
        // If data exists
        if (data) {
          const fetchedData = data.data;

          // Deep merge the fetched data with defaults
          const mergedData = {
            ...defaultDashboardData,
            ...fetchedData,
            stackedBarData: mergeStackedBarData(
              defaultDashboardData.stackedBarData,
              fetchedData.stackedBarData || []
            ),
            metricSummary: {
              ...defaultDashboardData.metricSummary,
              ...(fetchedData.metricSummary || {}),
              roadmapAlignment: {
                ...defaultDashboardData.metricSummary.roadmapAlignment,
                ...(fetchedData.metricSummary?.roadmapAlignment || {})
              },
              ideaVolume: {
                ...defaultDashboardData.metricSummary.ideaVolume,
                ...(fetchedData.metricSummary?.ideaVolume || {})
              },
              agingIdeas: {
                ...defaultDashboardData.metricSummary.agingIdeas,
                ...(fetchedData.metricSummary?.agingIdeas || {})
              }
            },
            lineChartData: fetchedData.lineChartData || [...defaultDashboardData.lineChartData],
            topFeatures: fetchedData.topFeatures || [...defaultDashboardData.topFeatures],
            data_socialization_forums: fetchedData.data_socialization_forums || [
              { name: 'CSC' },
              { name: 'Sprint Reviews' },
              { name: 'Customer Advisory Board (CAB)' },
              { name: 'CWG' },
              { name: 'Quarterly Product Reviews (QBRs)' }
            ]
          };

          setAllProductsData(prevData => ({
            ...prevData,
            [currentProduct]: {
              ...prevData[currentProduct],
              [currentQuarter]: mergedData
            }
          }));
        } else {
          // Use default data structure when no data exists
          setAllProductsData(prevData => ({
            ...prevData,
            [currentProduct]: {
              ...prevData[currentProduct],
              [currentQuarter]: {
                ...defaultDashboardData,
                data_socialization_forums: [
                  { name: 'CSC' },
                  { name: 'Sprint Reviews' },
                  { name: 'Customer Advisory Board (CAB)' },
                  { name: 'CWG' },
                  { name: 'Quarterly Product Reviews (QBRs)' }
                ]
              }
            }
          }));
        }
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError(parseError(err));
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [currentProduct, currentQuarter]);

  // Get the current dashboard data based on selected product and quarter
  const dashboardData = allProductsData[currentProduct]?.[currentQuarter] || defaultDashboardData;

  // Required headers for CSV validation
  const requiredHeaders = [
    'product', 'quarter', 'responsiveness', 'responsiveness_trend', 'roadmap_alignment_committed', 'roadmap_alignment_total',
    'cross_client_collaboration', 'aging_ideas_count', 'year', 'candidate_ideas', 'in_development', 'archived_ideas', 'flagged_for_future',
    'active_quarter', 'active_clients_representing', 'feature_name', 'vote_count', 'status',
    'status_updated_at', 'client_voters'
  ];

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
      
      // Safely merge nested objects with defaults
      const mergedMetricSummary = {
        ...defaultDashboardData.metricSummary,
        ...(parsedData.metricSummary || {}),
        // Explicitly handle nested objects to prevent null values
        roadmapAlignment: safelyMergeNestedObjects(
          defaultDashboardData.metricSummary.roadmapAlignment,
          parsedData.metricSummary?.roadmapAlignment
        ),
        ideaVolume: safelyMergeNestedObjects(
          defaultDashboardData.metricSummary.ideaVolume,
          parsedData.metricSummary?.ideaVolume
        )
      };

      // Merge parsed data with default values
      const mergedData: DashboardData = {
        metricSummary: mergedMetricSummary,
        stackedBarData: mergeStackedBarData(
          defaultDashboardData.stackedBarData,
          parsedData.stackedBarData || []
        ),
        lineChartData: parsedData.lineChartData || defaultDashboardData.lineChartData,
        topFeatures: parsedData.topFeatures || defaultDashboardData.topFeatures
      };

      // Log the merged data for debugging
      console.log('Uploading dashboard data:', {
        product: currentProduct,
        quarter: currentQuarter,
        data: mergedData
      });

      // Store data in Supabase with onConflict option to handle duplicate keys
      const { error: upsertError } = await supabase
        .from('dashboards')
        .upsert({
          product: currentProduct,
          quarter: currentQuarter,
          data: mergedData
        }, {
          onConflict: 'product,quarter'
        })
        .select();
      
      if (upsertError) {
        console.error('Supabase upsert error:', upsertError);
      if (upsertError) throw upsertError;
      }
      
      // Update data for the current product and quarter
      setAllProductsData(prevData => ({
        ...prevData,
        [currentProduct]: {
          ...prevData[currentProduct],
          [currentQuarter]: mergedData
        }
      }));
      
    } catch (err) {
      if (err instanceof CSVError) {
        setError(err);
      } else {
        setError(new CSVError(
          'An unexpected error occurred',
          'application',
          [(err as Error)?.message || 'Please try again or contact support']
        ));
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Function to update dashboard data
  const updateDashboardData = async (data: DashboardData): Promise<void> => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Ensure we have all required fields
      const updatedData = {
        ...defaultDashboardData,
        ...data,
        stackedBarData: mergeStackedBarData(
          defaultDashboardData.stackedBarData,
          data.stackedBarData || []
        ),
        metricSummary: {
          ...defaultDashboardData.metricSummary,
          ...(data.metricSummary || {}),
          roadmapAlignment: {
            ...defaultDashboardData.metricSummary.roadmapAlignment,
            ...(data.metricSummary?.roadmapAlignment || {})
          },
          ideaVolume: {
            ...defaultDashboardData.metricSummary.ideaVolume,
            ...(data.metricSummary?.ideaVolume || {})
          },
          agingIdeas: {
            ...defaultDashboardData.metricSummary.agingIdeas,
            ...(data.metricSummary?.agingIdeas || {}),
            trend: [...(data.metricSummary?.agingIdeas?.trend || [])]
          }
        },
        stackedBarData: [...(data.stackedBarData || defaultDashboardData.stackedBarData)],
        lineChartData: [...(data.lineChartData || defaultDashboardData.lineChartData)],
        topFeatures: [...(data.topFeatures || defaultDashboardData.topFeatures)],
        data_socialization_forums: data.data_socialization_forums || []
      };

      // Store data in Supabase
      const { error: upsertError } = await supabase
        .from('dashboards')
        .upsert({
          product: currentProduct,
          quarter: currentQuarter,
          data: updatedData
        }, {
          onConflict: 'product,quarter'
        });
      
      if (upsertError) throw upsertError;
      
      // Update local state
      setAllProductsData(prevData => ({
        ...prevData,
        [currentProduct]: {
          ...prevData[currentProduct],
          [currentQuarter]: updatedData
        }
      }));
    } catch (err) {
      setError(parseError(err));
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    currentProduct,
    currentQuarter,
    dashboardData,
    allProductsData,
    setCurrentProduct,
    setCurrentQuarter,
    uploadCSV,
    uploadProductQuarterlyCSV,
    updateDashboardData,
    fetchProductQuarterlyData,
    isLoading,
    error
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};

export const useData = (): DataContextType => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
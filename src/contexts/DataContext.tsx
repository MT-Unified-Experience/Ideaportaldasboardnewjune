import React, { createContext, useContext, useState, ReactNode, useEffect, useMemo } from 'react';
import { DashboardData, Product, Quarter, ProductData, ActionItem } from '../types';
import { createDummyProductData, generateDummyActionItems } from '../utils/dummyData';
import { 
  parseResponsivenessTrendCSV, 
  validateCSVHeaders, 
  responsivenessTrendRequiredHeaders,
  parseTopFeaturesCSV,
  topFeaturesRequiredHeaders,
  parseCommitmentTrendsCSV,
  commitmentTrendsRequiredHeaders,
  parseContinuedEngagementCSV,
  continuedEngagementRequiredHeaders,
  parseClientSubmissionsCSV,
  clientSubmissionsRequiredHeaders,
  parseCrossClientCollaborationCSV,
  crossClientCollaborationRequiredHeaders,
  CSVError
} from '../utils/csvParser';

// Storage keys for persistence
const STORAGE_KEYS = {
  CURRENT_PRODUCT: 'mitratech-dashboard-current-product',
  CURRENT_QUARTER: 'mitratech-dashboard-current-quarter',
  DASHBOARD_DATA: 'mitratech-dashboard-data',
  ACTION_ITEMS: 'mitratech-dashboard-action-items'
};

// Helper functions for localStorage operations
const getStoredValue = <T,>(key: string, defaultValue: T): T => {
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : defaultValue;
  } catch (error) {
    console.warn(`Error reading from localStorage for key ${key}:`, error);
    return defaultValue;
  }
};

const setStoredValue = <T,>(key: string, value: T): void => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.warn(`Error writing to localStorage for key ${key}:`, error);
  }
};

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
  updateDashboardData: (data: DashboardData) => Promise<void>;
  refreshDashboardData: () => Promise<void>;
  isLoading: boolean;
  error: Error | null;
  isSupabaseAvailable: boolean;
  // Action Items functions
  fetchActionItems: (product: Product, quarter: Quarter) => Promise<ActionItem[]>;
  createActionItem: (product: Product, quarter: Quarter, text: string) => Promise<ActionItem>;
  updateActionItem: (id: string, updates: Partial<ActionItem>) => Promise<void>;
  deleteActionItem: (id: string) => Promise<void>;
}

// Create context with a default value to prevent undefined context errors
const DataContext = createContext<DataContextType | null>(null);

const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Initialize state with values from localStorage or defaults
  const [currentProduct, setCurrentProductState] = useState<Product>(() => 
    getStoredValue(STORAGE_KEYS.CURRENT_PRODUCT, 'TeamConnect')
  );
  const [currentQuarter, setCurrentQuarterState] = useState<Quarter>(() => 
    getStoredValue(STORAGE_KEYS.CURRENT_QUARTER, 'FY26 Q2')
  );
  const [allProductsData, setAllProductsData] = useState<Record<Product, ProductData>>(() => 
    getStoredValue(STORAGE_KEYS.DASHBOARD_DATA, createDummyProductData())
  );
  const [actionItemsData, setActionItemsData] = useState<Record<string, ActionItem[]>>(() =>
    getStoredValue(STORAGE_KEYS.ACTION_ITEMS, {})
  );
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const isSupabaseAvailable = false; // Always false since we removed Supabase

  // Persist data to localStorage whenever it changes
  useEffect(() => {
    setStoredValue(STORAGE_KEYS.CURRENT_PRODUCT, currentProduct);
  }, [currentProduct]);

  useEffect(() => {
    setStoredValue(STORAGE_KEYS.CURRENT_QUARTER, currentQuarter);
  }, [currentQuarter]);

  useEffect(() => {
    setStoredValue(STORAGE_KEYS.DASHBOARD_DATA, allProductsData);
  }, [allProductsData]);

  useEffect(() => {
    setStoredValue(STORAGE_KEYS.ACTION_ITEMS, actionItemsData);
  }, [actionItemsData]);

  // Initialize dummy data if not already present
  useEffect(() => {
    if (Object.keys(allProductsData).length === 0) {
      setAllProductsData(createDummyProductData());
    }
  }, []);

  // Compute dashboardData based on current product and quarter
  const dashboardData = useMemo(() => {
    const productData = allProductsData[currentProduct];
    if (!productData) return null;
    
    const quarterData = productData[currentQuarter];
    return quarterData || null;
  }, [allProductsData, currentProduct, currentQuarter]);

  const setCurrentProduct = (product: Product) => {
    setCurrentProductState(product);
  };

  const setCurrentQuarter = (quarter: Quarter) => {
    setCurrentQuarterState(quarter);
  };

  // Mock CSV upload functions that simulate processing
  const uploadCSV = async (file: File): Promise<void> => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // For demo purposes, just show success
      console.log('CSV uploaded successfully (demo mode)');
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Upload failed'));
    } finally {
      setIsLoading(false);
    }
  };

  const uploadProductQuarterlyCSV = async (file: File): Promise<void> => {
    setIsLoading(true);
    setError(null);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      console.log('Product quarterly CSV uploaded successfully (demo mode)');
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Upload failed'));
    } finally {
      setIsLoading(false);
    }
  };

  const uploadTopFeaturesCSV = async (file: File): Promise<void> => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Read file content
      const fileContent = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.onerror = () => reject(new Error('Failed to read file'));
        reader.readAsText(file);
      });

      // Validate CSV headers
      await validateCSVHeaders(fileContent, topFeaturesRequiredHeaders);

      // Parse CSV data
      const { features } = await parseTopFeaturesCSV(fileContent);

      // Update dashboard data with new top features data
      setAllProductsData(prevData => {
        const updatedData = { ...prevData };
        
        // Update current product's current quarter data
        if (updatedData[currentProduct] && updatedData[currentProduct][currentQuarter]) {
          const currentData = { ...updatedData[currentProduct][currentQuarter] };
          currentData.topFeatures = features;
          updatedData[currentProduct][currentQuarter] = currentData;
        }
        
        return updatedData;
      });

      console.log('Top features CSV uploaded and processed successfully');
    } catch (err) {
      const errorMessage = err instanceof CSVError ? err.message : 
                          err instanceof Error ? err.message : 'Upload failed';
      setError(new Error(errorMessage));
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const uploadResponsivenessTrendCSV = async (file: File): Promise<void> => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Read file content
      const fileContent = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.onerror = () => reject(new Error('Failed to read file'));
        reader.readAsText(file);
      });

      // Validate CSV headers - make validation more lenient
      try {
        await validateCSVHeaders(fileContent, responsivenessTrendRequiredHeaders);
      } catch (headerError) {
        console.warn('Header validation failed, proceeding with parsing:', headerError);
        // Continue with parsing even if headers don't match exactly
      }

      // Parse CSV data
      const responsivenessData = await parseResponsivenessTrendCSV(fileContent);

      // Update dashboard data with new responsiveness trend data
      setAllProductsData(prevData => {
        const updatedData = { ...prevData };
        
        // Update current product's current quarter data
        if (updatedData[currentProduct] && updatedData[currentProduct][currentQuarter]) {
          const currentData = { ...updatedData[currentProduct][currentQuarter] };
          
          // Update responsiveness quarterly data
          currentData.metricSummary = {
            ...currentData.metricSummary,
            responsivenessQuarterlyData: responsivenessData
          };
          
          // Update main responsiveness value to the latest quarter's percentage
          if (responsivenessData.length > 0) {
            const latestQuarter = responsivenessData[responsivenessData.length - 1];
            currentData.metricSummary.responsiveness = latestQuarter.percentage;
          }
          
          updatedData[currentProduct][currentQuarter] = currentData;
        }
        
        return updatedData;
      });

      console.log('Responsiveness trend CSV uploaded and processed successfully');
    } catch (err) {
      console.error('CSV upload error:', err);
      let errorMessage = 'Upload failed. Please check the file format.';
      
      if (err instanceof CSVError) {
        errorMessage = `CSV Error: ${err.message}`;
        if (err.details && err.details.length > 0) {
          errorMessage += `\nDetails: ${err.details.join(', ')}`;
        }
      } else if (err instanceof Error) {
        errorMessage = `Error: ${err.message}`;
      }
      
      setError(new Error(errorMessage));
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const uploadCommitmentTrendsCSV = async (file: File): Promise<void> => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Read file content
      const fileContent = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.onerror = () => reject(new Error('Failed to read file'));
        reader.readAsText(file);
      });

      // Validate CSV headers
      await validateCSVHeaders(fileContent, commitmentTrendsRequiredHeaders);

      // Parse CSV data
      const { commitmentTrends, quarterlyDeliveries } = await parseCommitmentTrendsCSV(fileContent);

      // Update dashboard data with new commitment trends data
      setAllProductsData(prevData => {
        const updatedData = { ...prevData };
        
        // Update current product's current quarter data
        if (updatedData[currentProduct] && updatedData[currentProduct][currentQuarter]) {
          const currentData = { ...updatedData[currentProduct][currentQuarter] };
          
          currentData.metricSummary = {
            ...currentData.metricSummary,
            roadmapAlignment: {
              ...currentData.metricSummary.roadmapAlignment,
              commitmentTrends,
              quarterlyDeliveries
            }
          };
          
          updatedData[currentProduct][currentQuarter] = currentData;
        }
        
        return updatedData;
      });

      console.log('Commitment trends CSV uploaded and processed successfully');
    } catch (err) {
      const errorMessage = err instanceof CSVError ? err.message : 
                          err instanceof Error ? err.message : 'Upload failed';
      setError(new Error(errorMessage));
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const uploadContinuedEngagementCSV = async (file: File): Promise<void> => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Read file content
      const fileContent = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.onerror = () => reject(new Error('Failed to read file'));
        reader.readAsText(file);
      });

      // Validate CSV headers
      await validateCSVHeaders(fileContent, continuedEngagementRequiredHeaders);

      // Parse CSV data
      const { quarterlyTrends, ideas } = await parseContinuedEngagementCSV(fileContent);

      // Update dashboard data with new continued engagement data
      setAllProductsData(prevData => {
        const updatedData = { ...prevData };
        
        // Update current product's current quarter data
        if (updatedData[currentProduct] && updatedData[currentProduct][currentQuarter]) {
          const currentData = { ...updatedData[currentProduct][currentQuarter] };
          
          // Find current quarter data or use the latest available
          const currentQuarterData = quarterlyTrends.find(q => q.quarter === currentQuarter) || 
                                   quarterlyTrends[quarterlyTrends.length - 1];
          
          currentData.metricSummary = {
            ...currentData.metricSummary,
            continuedEngagement: {
              rate: currentQuarterData?.rate || currentData.metricSummary.continuedEngagement.rate,
              numerator: currentQuarterData?.numerator || currentData.metricSummary.continuedEngagement.numerator,
              denominator: currentQuarterData?.denominator || currentData.metricSummary.continuedEngagement.denominator,
              quarterlyTrends,
              ideas
            }
          };
          
          updatedData[currentProduct][currentQuarter] = currentData;
        }
        
        return updatedData;
      });

      console.log('Continued engagement CSV uploaded and processed successfully');
    } catch (err) {
      const errorMessage = err instanceof CSVError ? err.message : 
                          err instanceof Error ? err.message : 'Upload failed';
      setError(new Error(errorMessage));
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const uploadClientSubmissionsCSV = async (file: File): Promise<void> => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Read file content
      const fileContent = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.onerror = () => reject(new Error('Failed to read file'));
        reader.readAsText(file);
      });

      // Validate CSV headers
      await validateCSVHeaders(fileContent, clientSubmissionsRequiredHeaders);

      // Parse CSV data
      const { lineChartData } = await parseClientSubmissionsCSV(fileContent);

      // Update dashboard data with new client submissions data
      setAllProductsData(prevData => {
        const updatedData = { ...prevData };
        
        // Update current product's current quarter data
        if (updatedData[currentProduct] && updatedData[currentProduct][currentQuarter]) {
          const currentData = { ...updatedData[currentProduct][currentQuarter] };
          currentData.lineChartData = lineChartData;
          updatedData[currentProduct][currentQuarter] = currentData;
        }
        
        return updatedData;
      });

      console.log('Client submissions CSV uploaded and processed successfully');
    } catch (err) {
      const errorMessage = err instanceof CSVError ? err.message : 
                          err instanceof Error ? err.message : 'Upload failed';
      setError(new Error(errorMessage));
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const uploadCrossClientCollaborationCSV = async (file: File): Promise<void> => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Read file content
      const fileContent = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.onerror = () => reject(new Error('Failed to read file'));
        reader.readAsText(file);
      });

      // Validate CSV headers
      await validateCSVHeaders(fileContent, crossClientCollaborationRequiredHeaders);

      // Parse CSV data
      const { collaborationTrendData } = await parseCrossClientCollaborationCSV(fileContent);

      // Update dashboard data with new collaboration data
      setAllProductsData(prevData => {
        const updatedData = { ...prevData };
        
        // Update current product's current quarter data
        if (updatedData[currentProduct] && updatedData[currentProduct][currentQuarter]) {
          const currentData = { ...updatedData[currentProduct][currentQuarter] };
          currentData.collaborationTrendData = collaborationTrendData;
          updatedData[currentProduct][currentQuarter] = currentData;
        }
        
        return updatedData;
      });

      console.log('Cross-client collaboration CSV uploaded and processed successfully');
    } catch (err) {
      const errorMessage = err instanceof CSVError ? err.message : 
                          err instanceof Error ? err.message : 'Upload failed';
      setError(new Error(errorMessage));
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const updateDashboardData = async (data: DashboardData): Promise<void> => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Update local state
      setAllProductsData(prevData => ({
        ...prevData,
        [currentProduct]: {
          ...prevData[currentProduct],
          [currentQuarter]: data
        }
      }));
      
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Update failed'));
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const refreshDashboardData = async (): Promise<void> => {
    setIsLoading(true);
    try {
      // Simulate refresh
      await new Promise(resolve => setTimeout(resolve, 500));
      console.log('Dashboard data refreshed (demo mode)');
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Refresh failed'));
    } finally {
      setIsLoading(false);
    }
  };

  // Action Items functions using localStorage
  const getActionItemsKey = (product: Product, quarter: Quarter) => `${product}-${quarter}`;

  const fetchActionItems = async (product: Product, quarter: Quarter): Promise<ActionItem[]> => {
    const key = getActionItemsKey(product, quarter);
    const existingItems = actionItemsData[key];
    
    if (existingItems && existingItems.length > 0) {
      return existingItems;
    }
    
    // Generate dummy action items if none exist
    const dummyItems = generateDummyActionItems(product, quarter);
    setActionItemsData(prev => ({
      ...prev,
      [key]: dummyItems
    }));
    
    return dummyItems;
  };

  const createActionItem = async (product: Product, quarter: Quarter, text: string): Promise<ActionItem> => {
    const newItem: ActionItem = {
      id: Date.now().toString(),
      product,
      quarter,
      text: text.trim(),
      completed: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const key = getActionItemsKey(product, quarter);
    setActionItemsData(prev => ({
      ...prev,
      [key]: [newItem, ...(prev[key] || [])]
    }));

    return newItem;
  };

  const updateActionItem = async (id: string, updates: Partial<ActionItem>): Promise<void> => {
    setActionItemsData(prev => {
      const newData = { ...prev };
      
      // Find the item across all product-quarter combinations
      for (const key in newData) {
        const items = newData[key];
        const itemIndex = items.findIndex(item => item.id === id);
        
        if (itemIndex !== -1) {
          newData[key] = items.map(item => 
            item.id === id 
              ? { ...item, ...updates, updated_at: new Date().toISOString() }
              : item
          );
          break;
        }
      }
      
      return newData;
    });
  };

  const deleteActionItem = async (id: string): Promise<void> => {
    setActionItemsData(prev => {
      const newData = { ...prev };
      
      // Find and remove the item across all product-quarter combinations
      for (const key in newData) {
        const items = newData[key];
        const filteredItems = items.filter(item => item.id !== id);
        
        if (filteredItems.length !== items.length) {
          newData[key] = filteredItems;
          break;
        }
      }
      
      return newData;
    });
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
    updateDashboardData,
    refreshDashboardData,
    isLoading,
    error,
    isSupabaseAvailable,
    fetchActionItems,
    createActionItem,
    updateActionItem,
    deleteActionItem,
  };

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
};

// Custom hook to use the DataContext
const useData = (): DataContextType => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};

export { DataProvider, useData };
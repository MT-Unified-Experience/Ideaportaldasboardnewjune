import React, { createContext, useContext, useState, ReactNode } from 'react';
import { DashboardData, Product, Quarter, ProductData } from '../types';
import { parseCSV, validateCSVHeaders, CSVError } from '../utils/csvParser';

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

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
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
          metricSummary: {
            responsiveness: defaultDashboardData.metricSummary.responsiveness,
            responsivenessTrend: defaultDashboardData.metricSummary.responsivenessTrend,
            roadmapAlignment: { ...defaultDashboardData.metricSummary.roadmapAlignment },
            collaborationTrends: [...defaultDashboardData.metricSummary.collaborationTrends],
            ideaVolume: { ...defaultDashboardData.metricSummary.ideaVolume },
            agingIdeas: { ...defaultDashboardData.metricSummary.agingIdeas },
            crossClientCollaboration: defaultDashboardData.metricSummary.crossClientCollaboration
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

  React.useEffect(() => {
    initializeDefaultData();
  }, []);

  // Function to handle CSV upload
  const uploadCSV = async (file: File): Promise<void> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const fileContent = await file.text();
      const parsedData = await parseCSV(fileContent, currentProduct);
      
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
        setError(new Error('Failed to upload CSV file'));
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
      setAllProductsData(prevData => ({
        ...prevData,
        [currentProduct]: {
          ...prevData[currentProduct],
          [currentQuarter]: data
        }
      }));
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to update dashboard data'));
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    currentProduct,
    currentQuarter,
    dashboardData: allProductsData[currentProduct]?.[currentQuarter] || null,
    allProductsData,
    setCurrentProduct,
    setCurrentQuarter,
    uploadCSV,
    updateDashboardData,
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
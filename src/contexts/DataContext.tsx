import React, { createContext, useContext, useState, ReactNode, useEffect, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import { DashboardData, Product, Quarter, ProductData, ActionItem } from '../types';
import { createDummyProductData } from '../utils/dummyData';
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
  const [allProductsData, setAllProductsData] = useState<Record<Product, ProductData>>({} as Record<Product, ProductData>);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const isSupabaseAvailable = true; // Now using Supabase

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

  // Load dashboard data from Supabase on mount
  useEffect(() => {
    loadDashboardDataFromSupabase();
  }, [currentProduct, currentQuarter]);

  // Load dashboard data from Supabase
  const loadDashboardDataFromSupabase = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const dashboardData = await fetchDashboardDataFromSupabase(currentProduct, currentQuarter);
      
      setAllProductsData(prevData => ({
        ...prevData,
        [currentProduct]: {
          ...prevData[currentProduct],
          [currentQuarter]: dashboardData
        }
      }));
    } catch (err) {
      console.error('Error loading dashboard data:', err);
      setError(err instanceof Error ? err : new Error('Failed to load dashboard data'));
      
      // Fallback to dummy data if Supabase fails
      if (Object.keys(allProductsData).length === 0) {
        setAllProductsData(createDummyProductData());
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch dashboard data from Supabase
  const fetchDashboardDataFromSupabase = async (product: Product, quarter: Quarter): Promise<DashboardData> => {
    // Fetch features
    const { data: features, error: featuresError } = await supabase
      .from('features')
      .select('*')
      .eq('product', product)
      .eq('quarter', quarter)
      .order('vote_count', { ascending: false });

    if (featuresError) throw featuresError;

    // Fetch responsiveness trends
    const { data: responsivenessData, error: responsivenessError } = await supabase
      .from('responsiveness_trends')
      .select('*')
      .eq('product', product)
      .order('quarter');

    if (responsivenessError) throw responsivenessError;

    // Fetch commitment trends
    const { data: commitmentData, error: commitmentError } = await supabase
      .from('commitment_trends')
      .select('*')
      .eq('product', product)
      .order('year');

    if (commitmentError) throw commitmentError;

    // Fetch continued engagement
    const { data: engagementData, error: engagementError } = await supabase
      .from('continued_engagement')
      .select('*')
      .eq('product', product)
      .order('quarter');

    if (engagementError) throw engagementError;

    // Fetch client submissions
    const { data: submissionsData, error: submissionsError } = await supabase
      .from('client_submissions')
      .select('*')
      .eq('product', product)
      .order('quarter');

    if (submissionsError) throw submissionsError;

    // Fetch collaboration data
    const { data: collaborationData, error: collaborationError } = await supabase
      .from('cross_client_collaboration')
      .select('*')
      .eq('product', product)
      .order('quarter');

    if (collaborationError) throw collaborationError;

    // Fetch forums
    const { data: forumsData, error: forumsError } = await supabase
      .from('data_socialization_forums')
      .select('*')
      .eq('product', product)
      .eq('is_active', true);

    if (forumsError) throw forumsError;

    // Transform data into DashboardData format
    return transformSupabaseDataToDashboard({
      features: features || [],
      responsivenessData: responsivenessData || [],
      commitmentData: commitmentData || [],
      engagementData: engagementData || [],
      submissionsData: submissionsData || [],
      collaborationData: collaborationData || [],
      forumsData: forumsData || []
    }, quarter);
  };

  // Transform Supabase data to DashboardData format
  const transformSupabaseDataToDashboard = (data: any, quarter: Quarter): DashboardData => {
    // Get current quarter responsiveness data
    const currentResponsiveness = data.responsivenessData.find((r: any) => r.quarter === quarter);
    const currentEngagement = data.engagementData.find((e: any) => e.quarter === quarter);
    
    // Calculate roadmap alignment from commitment data
    const currentYearCommitment = data.commitmentData.find((c: any) => c.committed !== null);
    
    // Transform client submissions to line chart data
    const lineChartData = data.submissionsData
      .reduce((acc: any[], submission: any) => {
        const existing = acc.find(item => item.quarter === submission.quarter);
        if (existing) {
          if (submission.idea_id && submission.idea_summary && submission.idea_client_name) {
            existing.ideas = existing.ideas || [];
            existing.ideas.push({
              id: submission.idea_id,
              clientName: submission.idea_client_name,
              summary: submission.idea_summary
            });
          }
        } else {
          const newItem: any = {
            quarter: submission.quarter,
            clientsRepresenting: submission.clients_representing || 0,
            clients: submission.client_names || []
          };
          
          if (submission.idea_id && submission.idea_summary && submission.idea_client_name) {
            newItem.ideas = [{
              id: submission.idea_id,
              clientName: submission.idea_client_name,
              summary: submission.idea_summary
            }];
          }
          
          acc.push(newItem);
        }
        return acc;
      }, [])
      .sort((a: any, b: any) => a.quarter.localeCompare(b.quarter));

    // Transform collaboration data
    const collaborationTrendData = data.collaborationData
      .reduce((acc: any[], collab: any) => {
        const existing = acc.find(item => item.quarter === collab.quarter);
        if (existing) {
          if (collab.idea_id && collab.idea_name) {
            existing.topCollaborativeIdeas = existing.topCollaborativeIdeas || [];
            existing.topCollaborativeIdeas.push({
              id: collab.idea_id,
              name: collab.idea_name,
              originalSubmitter: collab.original_submitter || 'Unknown',
              contributors: collab.contributors || [],
              submissionDate: collab.submission_date || new Date().toISOString(),
              collaborationScore: collab.collaboration_score || 0,
              status: collab.status || 'Active',
              comments: collab.comments || ''
            });
          }
        } else if (collab.collaborative_ideas_count !== null) {
          acc.push({
            quarter: collab.quarter,
            year: parseInt(collab.year?.replace('FY', '20') || new Date().getFullYear().toString()),
            collaborativeIdeas: collab.collaborative_ideas_count,
            totalIdeas: collab.total_ideas_count || 0,
            collaborationRate: collab.collaboration_rate || 0,
            topCollaborativeIdeas: []
          });
        }
        return acc;
      }, [])
      .sort((a: any, b: any) => a.quarter.localeCompare(b.quarter));

    return {
      metricSummary: {
        responsiveness: currentResponsiveness?.percentage || 0,
        responsivenessQuarterlyData: data.responsivenessData.map((r: any) => ({
          quarter: r.quarter,
          percentage: r.percentage,
          totalIdeas: r.total_ideas,
          ideasMovedOutOfReview: r.ideas_moved_out_of_review,
          ideasList: r.ideas_list || []
        })),
        roadmapAlignment: {
          committed: currentYearCommitment?.committed || 0,
          total: currentYearCommitment?.delivered || 0,
          commitmentTrends: data.commitmentData
            .filter((c: any) => c.committed !== null)
            .map((c: any) => ({
              year: c.year,
              committed: c.committed,
              delivered: c.delivered,
              ideas: data.commitmentData
                .filter((idea: any) => idea.year === c.year && idea.idea_id)
                .map((idea: any) => ({
                  id: idea.idea_id,
                  summary: idea.idea_summary
                }))
            })),
          quarterlyDeliveries: data.commitmentData
            .filter((c: any) => c.quarterly_delivered !== null)
            .map((c: any) => ({
              quarter: c.quarter,
              year: c.year,
              delivered: c.quarterly_delivered,
              ideas: data.commitmentData
                .filter((idea: any) => idea.quarter === c.quarter && idea.year === c.year && idea.idea_id)
                .map((idea: any) => ({
                  id: idea.idea_id,
                  summary: idea.idea_summary
                }))
            }))
        },
        continuedEngagement: {
          rate: currentEngagement?.rate || 0,
          numerator: currentEngagement?.numerator || 0,
          denominator: currentEngagement?.denominator || 0,
          quarterlyTrends: data.engagementData
            .filter((e: any) => e.rate !== null)
            .map((e: any) => ({
              quarter: e.quarter,
              rate: e.rate,
              numerator: e.numerator,
              denominator: e.denominator
            })),
          ideas: data.engagementData
            .filter((e: any) => e.idea_id)
            .map((e: any) => ({
              id: e.idea_id,
              name: e.idea_name || '',
              initialStatusChange: e.initial_status_change || '',
              subsequentChanges: e.subsequent_changes || [],
              daysBetween: e.days_between || 0,
              included: e.included || false
            }))
        },
        ideaVolume: {
          quarterly: features?.length || 0,
          total: features?.reduce((sum, f) => sum + f.vote_count, 0) || 0
        }
      },
      lineChartData,
      topFeatures: (features || []).map((f: any) => ({
        feature_name: f.feature_name,
        vote_count: f.vote_count,
        status: f.status,
        status_updated_at: f.status_updated_at || '',
        client_voters: f.client_voters || [],
        estimated_impact: f.estimated_impact,
        resource_requirement: f.resource_requirement,
        strategic_alignment: f.strategic_alignment,
        risks: f.risks
      })),
      collaborationTrendData,
      data_socialization_forums: (data.forumsData || []).map((f: any) => ({
        name: f.forum_name
      }))
    };
  };

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
      // This is a generic upload function - redirect to specific upload functions
      console.log('CSV uploaded successfully');
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
      console.log('Product quarterly CSV uploaded successfully');
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

      // Save to Supabase
      const supabaseFeatures = features.map(feature => ({
        product: currentProduct,
        quarter: currentQuarter,
        feature_name: feature.feature_name,
        vote_count: feature.vote_count,
        status: feature.status,
        status_updated_at: feature.status_updated_at || null,
        client_voters: feature.client_voters || [],
        estimated_impact: feature.estimated_impact || null,
        resource_requirement: feature.resource_requirement || null,
        strategic_alignment: feature.strategic_alignment || null,
        risks: feature.risks || null
      }));

      // Delete existing features for this product/quarter and insert new ones
      await supabase
        .from('features')
        .delete()
        .eq('product', currentProduct)
        .eq('quarter', currentQuarter);

      const { error: insertError } = await supabase
        .from('features')
        .insert(supabaseFeatures);

      if (insertError) throw insertError;

      // Reload dashboard data
      await loadDashboardDataFromSupabase();

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

      // Save to Supabase
      const supabaseResponsivenessData = responsivenessData.map(item => ({
        product: currentProduct,
        quarter: item.quarter,
        percentage: item.percentage,
        total_ideas: item.totalIdeas,
        ideas_moved_out_of_review: item.ideasMovedOutOfReview,
        ideas_list: item.ideasList || null
      }));

      // Delete existing responsiveness data for this product and insert new ones
      await supabase
        .from('responsiveness_trends')
        .delete()
        .eq('product', currentProduct);

      const { error: insertError } = await supabase
        .from('responsiveness_trends')
        .insert(supabaseResponsivenessData);

      if (insertError) throw insertError;

      // Reload dashboard data
      await loadDashboardDataFromSupabase();

      console.log('Responsiveness trend CSV uploaded and processed successfully');
    } catch (err) {
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

      // Save to Supabase
      const supabaseCommitmentData: any[] = [];
      
      // Add annual commitment data
      commitmentTrends.forEach(trend => {
        supabaseCommitmentData.push({
          product: currentProduct,
          year: trend.year,
          committed: trend.committed,
          delivered: trend.delivered,
          quarter: null,
          quarterly_delivered: null,
          idea_id: null,
          idea_summary: null
        });
        
        // Add ideas for this year
        if (trend.ideas) {
          trend.ideas.forEach(idea => {
            supabaseCommitmentData.push({
              product: currentProduct,
              year: trend.year,
              committed: null,
              delivered: null,
              quarter: null,
              quarterly_delivered: null,
              idea_id: idea.id,
              idea_summary: idea.summary
            });
          });
        }
      });
      
      // Add quarterly delivery data
      quarterlyDeliveries.forEach(delivery => {
        supabaseCommitmentData.push({
          product: currentProduct,
          year: delivery.year,
          committed: null,
          delivered: null,
          quarter: delivery.quarter,
          quarterly_delivered: delivery.delivered,
          idea_id: null,
          idea_summary: null
        });
        
        // Add ideas for this quarter
        if (delivery.ideas) {
          delivery.ideas.forEach(idea => {
            supabaseCommitmentData.push({
              product: currentProduct,
              year: delivery.year,
              committed: null,
              delivered: null,
              quarter: delivery.quarter,
              quarterly_delivered: null,
              idea_id: idea.id,
              idea_summary: idea.summary
            });
          });
        }
      });

      // Delete existing commitment data for this product and insert new ones
      await supabase
        .from('commitment_trends')
        .delete()
        .eq('product', currentProduct);

      const { error: insertError } = await supabase
        .from('commitment_trends')
        .insert(supabaseCommitmentData);

      if (insertError) throw insertError;

      // Reload dashboard data
      await loadDashboardDataFromSupabase();

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

      // Save to Supabase
      const supabaseEngagementData: any[] = [];
      
      // Add quarterly trends data
      quarterlyTrends.forEach(trend => {
        supabaseEngagementData.push({
          product: currentProduct,
          quarter: trend.quarter,
          rate: trend.rate,
          numerator: trend.numerator,
          denominator: trend.denominator,
          idea_id: null,
          idea_name: null,
          initial_status_change: null,
          subsequent_changes: null,
          days_between: null,
          included: null
        });
      });
      
      // Add individual ideas data
      ideas.forEach(idea => {
        supabaseEngagementData.push({
          product: currentProduct,
          quarter: currentQuarter, // Associate with current quarter
          rate: null,
          numerator: null,
          denominator: null,
          idea_id: idea.id,
          idea_name: idea.name,
          initial_status_change: idea.initialStatusChange,
          subsequent_changes: idea.subsequentChanges,
          days_between: idea.daysBetween,
          included: idea.included
        });
      });

      // Delete existing engagement data for this product and insert new ones
      await supabase
        .from('continued_engagement')
        .delete()
        .eq('product', currentProduct);

      const { error: insertError } = await supabase
        .from('continued_engagement')
        .insert(supabaseEngagementData);

      if (insertError) throw insertError;

      // Reload dashboard data
      await loadDashboardDataFromSupabase();

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

      // Save to Supabase
      const supabaseSubmissionsData: any[] = [];
      
      lineChartData.forEach(submission => {
        // Add quarter summary data
        supabaseSubmissionsData.push({
          product: currentProduct,
          quarter: submission.quarter,
          clients_representing: submission.clientsRepresenting,
          client_names: submission.clients || [],
          idea_id: null,
          idea_summary: null,
          idea_client_name: null
        });
        
        // Add individual ideas if available
        if (submission.ideas) {
          submission.ideas.forEach(idea => {
            supabaseSubmissionsData.push({
              product: currentProduct,
              quarter: submission.quarter,
              clients_representing: null,
              client_names: null,
              idea_id: idea.id,
              idea_summary: idea.summary,
              idea_client_name: idea.clientName
            });
          });
        }
      });

      // Delete existing submissions data for this product and insert new ones
      await supabase
        .from('client_submissions')
        .delete()
        .eq('product', currentProduct);

      const { error: insertError } = await supabase
        .from('client_submissions')
        .insert(supabaseSubmissionsData);

      if (insertError) throw insertError;

      // Reload dashboard data
      await loadDashboardDataFromSupabase();

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

      // Save to Supabase
      const supabaseCollaborationData: any[] = [];
      
      collaborationTrendData.forEach(trend => {
        // Add quarter summary data
        supabaseCollaborationData.push({
          product: currentProduct,
          quarter: trend.quarter,
          year: `FY${trend.year.toString().slice(-2)}`,
          collaborative_ideas_count: trend.collaborativeIdeas,
          total_ideas_count: trend.totalIdeas,
          collaboration_rate: trend.collaborationRate,
          idea_id: null,
          idea_name: null,
          original_submitter: null,
          contributors: null,
          submission_date: null,
          collaboration_score: null,
          status: null,
          comments: null
        });
        
        // Add individual collaborative ideas if available
        if (trend.topCollaborativeIdeas) {
          trend.topCollaborativeIdeas.forEach(idea => {
            supabaseCollaborationData.push({
              product: currentProduct,
              quarter: trend.quarter,
              year: `FY${trend.year.toString().slice(-2)}`,
              collaborative_ideas_count: null,
              total_ideas_count: null,
              collaboration_rate: null,
              idea_id: idea.id,
              idea_name: idea.name,
              original_submitter: idea.originalSubmitter,
              contributors: idea.contributors,
              submission_date: idea.submissionDate,
              collaboration_score: idea.collaborationScore,
              status: idea.status,
              comments: idea.comments
            });
          });
        }
      });

      // Delete existing collaboration data for this product and insert new ones
      await supabase
        .from('cross_client_collaboration')
        .delete()
        .eq('product', currentProduct);

      const { error: insertError } = await supabase
        .from('cross_client_collaboration')
        .insert(supabaseCollaborationData);

      if (insertError) throw insertError;

      // Reload dashboard data
      await loadDashboardDataFromSupabase();

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
      // Update forums in Supabase
      if (data.data_socialization_forums) {
        // Delete existing forums for this product
        await supabase
          .from('data_socialization_forums')
          .delete()
          .eq('product', currentProduct);

        // Insert new forums
        const forumsToInsert = data.data_socialization_forums.map(forum => ({
          product: currentProduct,
          forum_name: forum.name,
          is_active: true
        }));

        if (forumsToInsert.length > 0) {
          const { error: forumsError } = await supabase
            .from('data_socialization_forums')
            .insert(forumsToInsert);

          if (forumsError) throw forumsError;
        }
      }

      // Reload dashboard data
      await loadDashboardDataFromSupabase();
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
      await loadDashboardDataFromSupabase();
      console.log('Dashboard data refreshed from Supabase');
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Refresh failed'));
    } finally {
      setIsLoading(false);
    }
  };

  // Action Items functions using Supabase
  const fetchActionItems = async (product: Product, quarter: Quarter): Promise<ActionItem[]> => {
    try {
      const { data, error } = await supabase
        .from('action_items')
        .select('*')
        .eq('product', product)
        .eq('quarter', quarter)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return (data || []).map(item => ({
        id: item.id,
        product: item.product as Product,
        quarter: item.quarter as Quarter,
        text: item.text,
        completed: item.completed,
        created_at: item.created_at,
        updated_at: item.updated_at
      }));
    } catch (err) {
      console.error('Error fetching action items:', err);
      return [];
    }
  };

  const createActionItem = async (product: Product, quarter: Quarter, text: string): Promise<ActionItem> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('action_items')
        .insert({
          user_id: user.id,
          product,
          quarter,
          text: text.trim(),
          completed: false
        })
        .select()
        .single();

      if (error) throw error;

      return {
        id: data.id,
        product: data.product as Product,
        quarter: data.quarter as Quarter,
        text: data.text,
        completed: data.completed,
        created_at: data.created_at,
        updated_at: data.updated_at
      };
    } catch (err) {
      console.error('Error creating action item:', err);
      throw err;
    }
  };

  const updateActionItem = async (id: string, updates: Partial<ActionItem>): Promise<void> => {
    try {
      const { error } = await supabase
        .from('action_items')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;
    } catch (err) {
      console.error('Error updating action item:', err);
      throw err;
    }
  };

  const deleteActionItem = async (id: string): Promise<void> => {
    try {
      const { error } = await supabase
        .from('action_items')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (err) {
      console.error('Error deleting action item:', err);
      throw err;
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
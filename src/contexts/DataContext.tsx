Here's the fixed version with the missing closing brackets added:

```typescript
const fetchDashboardDataFromSupabase = async (product?: Product, quarter?: Quarter): Promise<void> => {
    const targetProduct = product || currentProduct;
    const targetQuarter = quarter || currentQuarter;

    if (!isSupabaseAvailable) {
      console.log('Supabase not available, using local data only');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from('dashboards')
        .select('*')
        .eq('product', targetProduct)
        .eq('quarter', targetQuarter)
        .single();

      if (error) throw error;

      if (data) {
        setAllProductsData(prevData => ({
          ...prevData,
          [targetProduct]: {
            ...prevData[targetProduct],
            [targetQuarter]: data.data
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

  // Function to update dashboard data
  const updateDashboardData = async (data: DashboardData): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      await safeSupabaseUpsert('dashboards', {
        product: currentProduct,
        quarter: currentQuarter,
        data: data
      }, 'product,quarter');

      setAllProductsData(prevData => ({
        ...prevData,
        [currentProduct]: {
          ...prevData[currentProduct],
          [currentQuarter]: data
        }
      }));
    } catch (err) {
      setError(parseError(err));
    } finally {
      setIsLoading(false);
    }
  };

  // Function to refresh dashboard data
  const refreshDashboardData = async (): Promise<void> => {
    if (isSupabaseAvailable) {
      await fetchDashboardDataFromSupabase();
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
    uploadTopFeaturesCSV,
    uploadResponsivenessTrendCSV,
    uploadCommitmentTrendsCSV,
    uploadContinuedEngagementCSV,
    uploadClientSubmissionsCSV,
    uploadCrossClientCollaborationCSV,
    fetchProductQuarterlyData,
    updateDashboardData,
    fetchDashboardDataFromSupabase,
    refreshDashboardData,
    isLoading,
    error,
    isSupabaseAvailable
  };

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
};

export { DataContext, DataProvider };
```
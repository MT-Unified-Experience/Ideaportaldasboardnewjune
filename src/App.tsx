import React from 'react';
import { DataProvider } from './contexts/DataContext';
import DashboardLayout from './layouts/DashboardLayout';

function App() {
  return (
    <DataProvider>
      <DashboardLayout />
    </DataProvider>
  );
}

export default App;
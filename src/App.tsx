import React from 'react';
import { AuthProvider } from './contexts/AuthContext';
import AuthGuard from './components/auth/AuthGuard';
import { DataProvider } from './contexts/DataContext';
import DashboardLayout from './layouts/DashboardLayout';

function App() {
  return (
    <AuthProvider>
      <AuthGuard>
        <DataProvider>
          <DashboardLayout />
        </DataProvider>
      </AuthGuard>
    </AuthProvider>
  );
}

export default App;
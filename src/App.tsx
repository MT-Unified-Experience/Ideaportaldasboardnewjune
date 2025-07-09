import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { DataProvider } from './contexts/DataContext';
import DashboardLayout from './layouts/DashboardLayout';
import LoginPage from './pages/LoginPage';

function App() {
  return (
    <Router>
      <DataProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<DashboardLayout />} />
          <Route path="/dashboard" element={<DashboardLayout />} />
        </Routes>
      </DataProvider>
    </Router>
  );
}

export default App;
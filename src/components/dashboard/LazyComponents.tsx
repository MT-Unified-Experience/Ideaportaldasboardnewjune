import { lazy } from 'react';

// Lazy load heavy components to improve initial bundle size
export const DashboardManagement = lazy(() => import('./DashboardManagement'));
export const ActionItemsPanel = lazy(() => import('./ActionItemsPanel'));
export const CrossClientCollaborationTrend = lazy(() => import('./CrossClientCollaborationTrend'));
export const CommitmentTrendsDetailsModal = lazy(() => import('./CommitmentTrendsDetailsModal'));
export const CrossClientCollaborationDetailsModal = lazy(() => import('./CrossClientCollaborationDetailsModal'));
export const QuarterlyTrendsComparison = lazy(() => import('./QuarterlyTrendsComparison'));
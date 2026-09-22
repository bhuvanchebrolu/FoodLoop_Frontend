import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AuthLayout from '../layouts/AuthLayout';
import MainLayout from '../layouts/MainLayout';
import ProtectedRoute from './ProtectedRoute';
import LoginPage from '../pages/LoginPage';
import HomePage from '../pages/HomePage';
import ErrorBoundary from '../components/ErrorBoundary';
import { 
  AddFoodPage, 
  AlertsPage, 
  ShareFoodPage, 
  CommunityPage, 
  ProfilePage,
  AdminPage,
  AnalyticsPage,
  NotFoundPage
} from '../pages/PlaceholderPages';

const AppRoutes = () => {
  return (
    <ErrorBoundary>
      <Routes>
        {/* Public Auth Routes */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<LoginPage />} />
        </Route>

        {/* Protected App Routes */}
        <Route element={<ProtectedRoute />}>
          <Route element={<MainLayout />}>
            <Route path="/home" element={<HomePage />} />
            <Route path="/add-food" element={<AddFoodPage />} />
            <Route path="/alerts" element={<AlertsPage />} />
            <Route path="/share-food" element={<ShareFoodPage />} />
            <Route path="/community" element={<CommunityPage />} />
            <Route path="/requests" element={<Navigate to="/community?tab=incoming" replace />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/analytics" element={<AnalyticsPage />} />
          </Route>
        </Route>

        {/* Admin Only Protected Routes */}
        <Route element={<ProtectedRoute adminOnly={true} />}>
          <Route element={<MainLayout />}>
            <Route path="/admin" element={<AdminPage />} />
            <Route path="/admin/*" element={<AdminPage />} />
          </Route>
        </Route>

        {/* 404 Catch-all route */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </ErrorBoundary>
  );
};

export default AppRoutes;

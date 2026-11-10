import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

import { PublicLayout } from '../components/layout/PublicLayout';
import { AdminLayout } from '../components/layout/AdminLayout';

import { HomePage } from '../pages/public/HomePage';
import { MoviesPage } from '../pages/public/MoviesPage';
import { MovieDetailPage } from '../pages/public/MovieDetailPage';
import { ShowtimesPage } from '../pages/public/ShowtimesPage';
import { TheatersPage } from '../pages/public/TheatersPage';

import { LoginPage } from '../pages/auth/LoginPage';
import { RegisterPage } from '../pages/auth/RegisterPage';
import { VerifyMfaPage } from '../pages/auth/VerifyMfaPage';

import { SelectSeatPage } from '../pages/booking/SelectSeatPage';
import { MyTicketsPage } from '../pages/booking/MyTicketsPage';
import { VnpayReturnPage } from '../pages/booking/VnpayReturnPage';

import { AdminDashboardPage } from '../pages/admin/AdminDashboardPage';
import { AdminMoviesPage } from '../pages/admin/AdminMoviesPage';
import { AdminShowtimesPage } from '../pages/admin/AdminShowtimesPage';
import { AdminRevenuePage } from '../pages/admin/AdminRevenuePage';
import { AdminUsersPage } from '../pages/admin/AdminUsersPage';

import { ProtectedRoute } from './ProtectedRoute';
import { RoleRoute } from './RoleRoute';

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* 1. Public Storefront (Obsidian Aurora Dark Theme) */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/movies" element={<MoviesPage />} />
        <Route path="/movies/:id" element={<MovieDetailPage />} />
        <Route path="/showtimes" element={<ShowtimesPage />} />
        <Route path="/theaters" element={<TheatersPage />} />

        {/* Auth routes */}
        <Route path="/auth/login" element={<LoginPage />} />
        <Route path="/auth/register" element={<RegisterPage />} />
        <Route path="/auth/verify-mfa" element={<VerifyMfaPage />} />

        {/* Booking flow */}
        <Route path="/booking/select-seat/:showtimeId" element={<SelectSeatPage />} />
        <Route path="/booking/vnpay-return" element={<VnpayReturnPage />} />

        {/* Protected Customer Routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/booking/my-tickets" element={<MyTicketsPage />} />
        </Route>
      </Route>

      {/* 2. Admin CMS Portal (Clean Light Theme) */}
      <Route element={<RoleRoute allowedRoles={['ADMIN', 'STAFF']} />}>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboardPage />} />
          <Route path="movies" element={<AdminMoviesPage />} />
          <Route path="showtimes" element={<AdminShowtimesPage />} />
          <Route path="revenue" element={<AdminRevenuePage />} />
          <Route path="users" element={<AdminUsersPage />} />
        </Route>
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};


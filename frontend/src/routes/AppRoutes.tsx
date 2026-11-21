import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

import { PublicLayout } from '../components/layout/PublicLayout';
import { AdminLayout } from '../components/layout/AdminLayout';

import { HomePage } from '../pages/public/HomePage';
import { MoviesPage } from '../pages/public/MoviesPage';
import { MovieDetailPage } from '../pages/public/MovieDetailPage';
import { ShowtimesPage } from '../pages/public/ShowtimesPage';

import { PromotionsPage } from '../pages/public/PromotionsPage';

import { LoginPage } from '../pages/auth/LoginPage';
import { RegisterPage } from '../pages/auth/RegisterPage';
import { VerifyMfaPage } from '../pages/auth/VerifyMfaPage';

import { SelectSeatPage } from '../pages/booking/SelectSeatPage';
import { MyTicketsPage } from '../pages/booking/MyTicketsPage';
import { VnpayReturnPage } from '../pages/booking/VnpayReturnPage';

import { ProtectedRoute } from './ProtectedRoute';
import { RoleRoute } from './RoleRoute';

// Route-level code splitting for Enterprise Admin CMS & Chart.js Analytics
const AdminDashboardPage = lazy(() =>
  import('../pages/admin/AdminDashboardPage').then((m) => ({
    default: m.AdminDashboardPage,
  })),
);
const AdminMoviesPage = lazy(() =>
  import('../pages/admin/AdminMoviesPage').then((m) => ({
    default: m.AdminMoviesPage,
  })),
);
const AdminShowtimesPage = lazy(() =>
  import('../pages/admin/AdminShowtimesPage').then((m) => ({
    default: m.AdminShowtimesPage,
  })),
);
const AdminRevenuePage = lazy(() =>
  import('../pages/admin/AdminRevenuePage').then((m) => ({
    default: m.AdminRevenuePage,
  })),
);
const AdminUsersPage = lazy(() =>
  import('../pages/admin/AdminUsersPage').then((m) => ({
    default: m.AdminUsersPage,
  })),
);

const RouteFallback: React.FC = () => (
  <div className="min-h-[calc(100vh-160px)] flex flex-col items-center justify-center gap-3 text-gray-300 text-sm">
    <Loader2 className="w-8 h-8 text-[#FF414D] animate-spin" aria-hidden="true" />
    <span>Đang tải nội dung...</span>
  </div>
);

export const AppRoutes: React.FC = () => {
  return (
    <Suspense fallback={<RouteFallback />}>
      <Routes>
        {/* 1. NCC-Inspired Cinema Storefront */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/movies" element={<MoviesPage />} />
          <Route path="/movies/:id" element={<MovieDetailPage />} />
          <Route path="/showtimes" element={<ShowtimesPage />} />
          <Route path="/promotions" element={<PromotionsPage />} />

          {/* Auth & 2FA */}
          <Route path="/auth/login" element={<LoginPage />} />
          <Route path="/auth/register" element={<RegisterPage />} />
          <Route path="/auth/verify-mfa" element={<VerifyMfaPage />} />

          {/* Auditorium Booking & Payment Verification */}
          <Route path="/booking/select-seat/:showtimeId" element={<SelectSeatPage />} />
          <Route path="/booking/vnpay-return" element={<VnpayReturnPage />} />

          {/* Protected Customer Wallet */}
          <Route element={<ProtectedRoute />}>
            <Route path="/booking/my-tickets" element={<MyTicketsPage />} />
          </Route>
        </Route>

        {/* 2. Enterprise Cinema Operations CMS Console */}
        <Route element={<RoleRoute allowedRoles={['ADMIN', 'STAFF']} />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboardPage />} />
            <Route path="movies" element={<AdminMoviesPage />} />
            <Route path="showtimes" element={<AdminShowtimesPage />} />
            <Route path="revenue" element={<AdminRevenuePage />} />

            {/* Strict Admin-Only Route */}
            <Route element={<RoleRoute allowedRoles={['ADMIN']} />}>
              <Route path="users" element={<AdminUsersPage />} />
            </Route>
          </Route>
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
};

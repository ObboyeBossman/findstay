import React from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AppLayout } from './components/AppLayout';
import { ToastProvider } from './components/ui';
import {
  AuthCallbackPage,
  AuthFlowPage,
  AuthProvider,
  VerifyEmailPage,
} from './features/identity';
import { AdminLayout } from './layouts/AdminLayout';
import { OwnerLayout } from './layouts/OwnerLayout';
import { GuestHomePage } from './pages/GuestHomePage';
import { AuthScreenPage } from './pages/AuthScreenPage';
import { OwnerAreaPage } from './pages/OwnerAreaPage';
import { AdminAreaPage } from './pages/AdminAreaPage';
import { NotFoundPage } from './pages/NotFoundPage';

/**
 * The FindStay starter shell (S1-01-T5) + responsive Owner/Admin portal shells
 * (S1-03-T3, S1-03-T4) + global ToastProvider (S1-03-T5).
 */
export const App: React.FC = () => (
  <ToastProvider>
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/auth" element={<Navigate to="/auth/sign-in" replace />} />
          <Route path="/auth/sign-in" element={<AuthFlowPage defaultIntent="sign-in" />} />
          <Route path="/auth/sign-up" element={<AuthFlowPage defaultIntent="sign-up" />} />
          <Route path="/auth/verify" element={<VerifyEmailPage />} />
          <Route path="/auth/callback" element={<AuthCallbackPage />} />
          <Route element={<AppLayout />}>
            <Route path="/" element={<GuestHomePage />} />
            <Route
              path="/auth/forgot-password"
              element={
                <AuthScreenPage
                  title="Reset your password"
                  story="S1-05 — Password Reset & User Profile"
                  note="Password reset runs through Supabase Auth, never the business API."
                />
              }
            />
            <Route path="/auth/*" element={<Navigate to="/auth/sign-in" replace />} />
          </Route>

        <Route path="/owner" element={<OwnerLayout />}>
          <Route index element={<OwnerAreaPage />} />
          <Route path="*" element={<OwnerAreaPage />} />
        </Route>

        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminAreaPage />} />
          <Route path="*" element={<AdminAreaPage />} />
        </Route>

        <Route element={<AppLayout />}>
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
      </BrowserRouter>
    </AuthProvider>
  </ToastProvider>
);

export default App;

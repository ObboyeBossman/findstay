import React from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AppLayout } from './components/AppLayout';
import { GuestHomePage } from './pages/GuestHomePage';
import { AuthScreenPage } from './pages/AuthScreenPage';
import { OwnerAreaPage } from './pages/OwnerAreaPage';
import { AdminAreaPage } from './pages/AdminAreaPage';
import { NotFoundPage } from './pages/NotFoundPage';

/**
 * The FindStay starter shell (S1-01-T5): three portal areas, wired and
 * routable, each an empty page ready for its stories.
 *
 *   /            guest area      (search, stays, booking — S1-03..)
 *   /auth/*      account area    (sign-up / sign-in / reset — S1-04, S1-05)
 *   /owner/*     owner area      (company, listings, calendar — S1-07..S1-14)
 *   /admin/*     admin area      (review, users, settings — S1-15, S1-16)
 *
 * Domain screens are built inside `src/features/<module>/` — this shell only
 * provides the chrome (layout, navigation, system status) and area entries.
 */
export const App: React.FC = () => (
  <BrowserRouter>
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<GuestHomePage />} />
        <Route path="/auth" element={<Navigate to="/auth/sign-in" replace />} />
        <Route
          path="/auth/sign-in"
          element={
            <AuthScreenPage
              title="Sign in"
              story="S1-04 — Sign-Up, Confirmation & Sign-In"
              note="Supabase Auth issues the session; business data stays behind the API."
            />
          }
        />
        <Route
          path="/auth/sign-up"
          element={
            <AuthScreenPage
              title="Create your account"
              story="S1-04 — Sign-Up, Confirmation & Sign-In"
              note="Registration confirms by email link in R1 (kickoff decision 1)."
            />
          }
        />
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
        <Route path="/owner" element={<OwnerAreaPage />} />
        <Route path="/owner/*" element={<OwnerAreaPage />} />
        <Route path="/admin" element={<AdminAreaPage />} />
        <Route path="/admin/*" element={<AdminAreaPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  </BrowserRouter>
);

export default App;

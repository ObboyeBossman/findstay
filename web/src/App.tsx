import React from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AppLayout } from './components/AppLayout';
import { ToastProvider } from './components/ui';
import {
  AccessDeniedState,
  AuthCallbackPage,
  AuthFlowPage,
  AuthProvider,
  ForgotPasswordPage,
  ProfilePage,
  RequireAccess,
  VerifyEmailPage,
} from './features/identity';
import {
  AdminDashboardPage,
  AdminReviewsPage,
  AdminSettingsPage,
  AdminUsersPage,
} from './features/admin';
import { AdminAuditLogPage } from './features/audit';
import { OwnerCalendarPage } from './features/availability';
import { NotificationsPage } from './features/notification';
import { OwnerListingsPage, PropertyEditorPage } from './features/listing';
import { InviteAcceptancePage, OwnerOrganizationPage } from './features/organization';
import { OwnerVerificationPage, PrivacyNoticePage } from './features/verification';
import { AdminLayout } from './layouts/AdminLayout';
import { OwnerLayout } from './layouts/OwnerLayout';
import { GuestHomePage } from './pages/GuestHomePage';
import { OwnerAreaPage } from './pages/OwnerAreaPage';
import { AdminAreaPage } from './pages/AdminAreaPage';
import { NotFoundPage } from './pages/NotFoundPage';

/**
 * The FindStay starter shell (S1-01-T5) + responsive Owner/Admin portal shells
 * (S1-03-T3, S1-03-T4) + global ToastProvider (S1-03-T5) + role- and
 * permission-aware route guards (S1-06-T4).
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
          <Route path="/auth/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/auth/callback" element={<AuthCallbackPage />} />
          <Route path="/owner/invitations" element={<InviteAcceptancePage />} />
          <Route path="/owner/invitations/:token" element={<InviteAcceptancePage />} />

          <Route element={<AppLayout />}>
            <Route path="/" element={<GuestHomePage />} />
            <Route path="/privacy" element={<PrivacyNoticePage />} />
            <Route
              path="/profile"
              element={
                <RequireAccess
                  requiredPermissions={['profile.read']}
                  areaName="My Profile"
                >
                  <ProfilePage />
                </RequireAccess>
              }
            />
            <Route
              path="/notifications"
              element={
                <RequireAccess
                  requiredPermissions={['notification.read']}
                  areaName="Notifications"
                >
                  <NotificationsPage />
                </RequireAccess>
              }
            />
            <Route path="/access-denied" element={<AccessDeniedState />} />
            <Route path="/auth/*" element={<Navigate to="/auth/sign-in" replace />} />
          </Route>

          <Route
            path="/owner"
            element={
              <RequireAccess
                requiredRoles={['OWNER', 'STAFF']}
                areaName="Owner Portal"
                deniedReason="The Owner Portal is only available to registered property owners and authorised property staff."
                standalone
              >
                <OwnerLayout />
              </RequireAccess>
            }
          >
            <Route index element={<OwnerAreaPage />} />
            <Route
              path="listings"
              element={
                <RequireAccess
                  requiredPermissions={['listing.read']}
                  areaName="Owner Listings"
                >
                  <OwnerListingsPage />
                </RequireAccess>
              }
            />
            <Route
              path="listings/:propertyId/edit"
              element={
                <RequireAccess
                  requiredPermissions={['listing.read']}
                  areaName="Edit Property & Units"
                >
                  <PropertyEditorPage />
                </RequireAccess>
              }
            />
            <Route
              path="listings/:propertyId/calendar"
              element={
                <RequireAccess
                  requiredPermissions={['availability.read']}
                  areaName="Availability Calendar"
                >
                  <OwnerCalendarPage />
                </RequireAccess>
              }
            />
            <Route
              path="listings/*"
              element={<Navigate to="/owner/listings" replace />}
            />
            <Route
              path="verification/*"
              element={
                <RequireAccess
                  requiredPermissions={['verification.read']}
                  areaName="Owner Verification"
                  deniedReason="Only property owners can view or submit identity and property verification documents."
                >
                  <OwnerVerificationPage />
                </RequireAccess>
              }
            />
            <Route
              path="calendar/*"
              element={
                <RequireAccess
                  requiredPermissions={['availability.read']}
                  areaName="Availability Calendar"
                >
                  <OwnerCalendarPage />
                </RequireAccess>
              }
            />
            <Route
              path="org/*"
              element={
                <RequireAccess
                  requiredPermissions={['org.staff.manage']}
                  areaName="Team & Organisation Management"
                  deniedReason="Only property owners with staff management permissions can manage organisation settings and team invitations."
                >
                  <OwnerOrganizationPage />
                </RequireAccess>
              }
            />
            <Route path="*" element={<OwnerAreaPage />} />
          </Route>

          <Route
            path="/admin"
            element={
              <RequireAccess
                requiredRoles={['ADMIN']}
                areaName="Admin Portal"
                deniedReason="The Admin Portal is restricted to FindStay platform administrators."
                standalone
              >
                <AdminLayout />
              </RequireAccess>
            }
          >
            <Route
              index
              element={
                <RequireAccess
                  requiredPermissions={['admin.dashboard.read']}
                  areaName="Admin Dashboard"
                >
                  <AdminDashboardPage />
                </RequireAccess>
              }
            />
            <Route
              path="reviews/*"
              element={
                <RequireAccess
                  requiredPermissions={['admin.review.read']}
                  areaName="Admin Review Queue"
                >
                  <AdminReviewsPage />
                </RequireAccess>
              }
            />
            <Route
              path="approvals/*"
              element={<Navigate to="/admin/reviews" replace />}
            />
            <Route
              path="users/*"
              element={
                <RequireAccess
                  requiredPermissions={['admin.user.read']}
                  areaName="User Management"
                >
                  <AdminUsersPage />
                </RequireAccess>
              }
            />
            <Route
              path="settings/*"
              element={
                <RequireAccess
                  requiredPermissions={['admin.setting.read']}
                  areaName="Platform Settings"
                >
                  <AdminSettingsPage />
                </RequireAccess>
              }
            />
            <Route
              path="audit/*"
              element={
                <RequireAccess
                  requiredPermissions={['admin.audit.read']}
                  areaName="Audit Log"
                >
                  <AdminAuditLogPage />
                </RequireAccess>
              }
            />
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

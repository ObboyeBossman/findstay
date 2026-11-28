export { AccessDeniedState } from './AccessDeniedState';
export { PermissionGate, RequireAccess } from './AccessGuards';
export { AuthProvider, resolveHomeRoute, useAuth } from './AuthContext';
export { AuthCallbackPage } from './AuthCallbackPage';
export { AuthFlowPage } from './AuthFlowPage';
export { ForgotPasswordPage } from './ForgotPasswordPage';
export {
  canAccessAdminPortal,
  canAccessOwnerPortal,
  filterNavItems,
  getEffectiveRole,
  hasAllPermissions,
  hasAnyPermission,
  hasPermission,
  hasRole,
  meetsAccessRequirement,
} from './permissions';
export { ProfilePage } from './ProfilePage';
export { SignInPage } from './SignInPage';
export { SignUpPage } from './SignUpPage';
export { VerifyEmailPage } from './VerifyEmailPage';
export type {
  AccessRequirement,
  ConsentState,
  PermissionCode,
  PlatformRole,
  Profile,
  RoleMembership,
  SessionContext,
} from './types';

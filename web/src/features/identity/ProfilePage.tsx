import React, { useEffect, useRef, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Bell,
  Building2,
  Camera,
  Check,
  CheckCircle2,
  Edit3,
  ExternalLink,
  Globe,
  KeyRound,
  Lock,
  Mail,
  Phone,
  Shield,
  ShieldCheck,
  Trash2,
  Upload,
  User,
  UserCheck,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { StatusBadge } from '../../components/StatusBadge';
import { FormField, useToast } from '../../components/ui';
import { apiFetch } from '../../lib/api';
import { supabase } from '../../lib/supabase';
import { useAuth } from './AuthContext';
import type { PlatformRole, Profile } from './types';

type ProfileTab =
  | 'profile'
  | 'contact'
  | 'notifications'
  | 'organisation'
  | 'security'
  | 'privacy';

/**
 * SCR-06: Profile & Notification Preferences
 * S1-05-T4: Build React My Profile page.
 *
 * Implements the card-based profile dashboard inspired by modern digital ID cards,
 * with native photo file upload, instant photo preview, smart portal switcher,
 * and full responsive support down to 360px mobile width.
 */
const LOCAL_AVATAR_KEY = 'findstay_profile_avatar';
const LOCAL_PROFILE_KEY = 'findstay_profile_data';

export const ProfilePage: React.FC = () => {
  const { session, sessionContext, refreshSessionContext, signOut } = useAuth();
  const { showToast } = useToast();

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [activeTab, setActiveTab] = useState<ProfileTab>('profile');
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);

  // Form fields
  const [fullName, setFullName] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [avatarUrl, setAvatarUrl] = useState<string>(() => {
    return localStorage.getItem(LOCAL_AVATAR_KEY) || '';
  });
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [nameError, setNameError] = useState<string | null>(null);

  // Notification toggles
  const [emailAlerts, setEmailAlerts] = useState<boolean>(true);
  const [smsAlerts, setSmsAlerts] = useState<boolean>(false);
  const [inAppAlerts, setInAppAlerts] = useState<boolean>(true);

  // Reset password state
  const [resetSent, setResetSent] = useState<boolean>(false);
  const [resetLoading, setResetLoading] = useState<boolean>(false);

  // Initialize data from sessionContext or fallback preview values
  useEffect(() => {
    let parsedLocal: { fullName?: string; phone?: string } | null = null;
    try {
      const savedLocal = localStorage.getItem(LOCAL_PROFILE_KEY);
      parsedLocal = savedLocal ? JSON.parse(savedLocal) : null;
    } catch {
      // Ignore JSON parse errors
    }
    const savedAvatar = localStorage.getItem(LOCAL_AVATAR_KEY);

    if (sessionContext?.profile) {
      setFullName(sessionContext.profile.fullName || parsedLocal?.fullName || '');
      setPhone(sessionContext.profile.phone || parsedLocal?.phone || '');
      setAvatarUrl(savedAvatar || sessionContext.profile.avatarUrl || '');
    } else {
      // Demo / fallback profile when testing locally without active session
      setFullName(parsedLocal?.fullName || 'Okyere Ankomah Julius');
      setPhone(parsedLocal?.phone || '+233241234567');
      if (savedAvatar) {
        setAvatarUrl(savedAvatar);
      }
    }
  }, [sessionContext]);

  const activeEmail =
    sessionContext?.profile.email ?? session?.user.email ?? 'user@findstay.com';
  const activeRole: PlatformRole =
    sessionContext?.memberships[0]?.role ?? 'OWNER';
  const orgName =
    sessionContext?.memberships[0]?.organizationName ??
    (activeRole === 'GUEST'
      ? 'Personal Guest Account'
      : 'FindStay Accommodation');

  const isOwnerOrStaff = activeRole === 'OWNER' || activeRole === 'STAFF';

  // Ghana E.164 pattern: +233 followed by 9 digits
  const GHANA_PHONE_REGEX = /^\+233\d{9}$/;

  const validatePhone = (val: string): boolean => {
    if (!val || val.trim() === '') {
      setPhoneError(null);
      return true;
    }
    if (!GHANA_PHONE_REGEX.test(val.trim())) {
      setPhoneError('Must be a Ghana E.164 number (e.g. +233241234567)');
      return false;
    }
    setPhoneError(null);
    return true;
  };

  const validateName = (val: string): boolean => {
    if (!val || val.trim().length === 0) {
      setNameError('Full name is required');
      return false;
    }
    if (val.trim().length > 100) {
      setNameError('Full name must be at most 100 characters');
      return false;
    }
    setNameError(null);
    return true;
  };

  /**
   * Handle native photo file selection directly from phone camera or gallery.
   */
  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate image format
    if (!file.type.startsWith('image/')) {
      showToast({
        variant: 'error',
        title: 'Invalid file format',
        message: 'Please choose an image file (JPG, PNG, or WebP).',
      });
      return;
    }

    // Validate size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      showToast({
        variant: 'error',
        title: 'Image too large',
        message: 'Please upload a photo under 5MB.',
      });
      return;
    }

    // Read and preview image
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setAvatarUrl(dataUrl);
      localStorage.setItem(LOCAL_AVATAR_KEY, dataUrl);
      window.dispatchEvent(new Event('findstay-avatar-changed'));
      showToast({
        variant: 'info',
        title: 'Photo selected',
        message: 'Photo saved and previewed on your ID card.',
      });
    };
    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = () => {
    setAvatarUrl('');
    localStorage.removeItem(LOCAL_AVATAR_KEY);
    window.dispatchEvent(new Event('findstay-avatar-changed'));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    showToast({
      variant: 'info',
      title: 'Photo removed',
      message: 'Reverted to your clean initials badge.',
    });
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();

    const isNameValid = validateName(fullName);
    const isPhoneValid = validatePhone(phone);

    if (!isNameValid || !isPhoneValid) {
      showToast({
        variant: 'error',
        title: 'Please fix validation errors',
        message: 'Review the form inputs highlighted in red.',
      });
      return;
    }

    setSaving(true);
    try {
      localStorage.setItem(
        LOCAL_PROFILE_KEY,
        JSON.stringify({ fullName: fullName.trim(), phone: phone.trim() }),
      );

      if (session?.access_token) {
        await apiFetch<Profile>('/me', {
          method: 'PATCH',
          accessToken: session.access_token,
          body: JSON.stringify({
            fullName: fullName.trim(),
            phone: phone.trim() ? phone.trim() : null,
            avatarUrl: avatarUrl.trim() ? avatarUrl.trim() : null,
            preferredLanguage: 'en',
          }),
        });
        await refreshSessionContext();
      }

      setIsEditing(false);
      showToast({
        variant: 'success',
        title: 'Profile updated',
        message: 'Your profile changes have been saved.',
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to update profile';
      showToast({
        variant: 'error',
        title: 'Update failed',
        message: msg,
      });
    } finally {
      setSaving(false);
    }
  };

  const handleSendPasswordReset = async () => {
    if (!activeEmail) return;
    setResetLoading(true);
    try {
      if (supabase) {
        const { error } = await supabase.auth.resetPasswordForEmail(activeEmail, {
          redirectTo: `${window.location.origin}/auth/callback`,
        });
        if (error) throw error;
      }
      setResetSent(true);
      showToast({
        variant: 'success',
        title: 'Password reset link sent',
        message: `Check ${activeEmail} for instructions to reset your password.`,
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Could not send reset link';
      showToast({
        variant: 'error',
        title: 'Reset failed',
        message: msg,
      });
    } finally {
      setResetLoading(false);
    }
  };

  // Generate initials for avatar fallback
  const getInitials = (name: string): string => {
    if (!name) return 'FS';
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <div className="mx-auto w-full max-w-6xl">
      {/* Hidden Native File Input for Photo Upload */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png, image/jpeg, image/webp"
        aria-label="Upload profile photo"
        className="hidden"
        onChange={handlePhotoSelect}
      />

      {/* Top Breadcrumb & Switcher Header */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-caption text-earth/70 sm:text-body-2">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 transition-colors hover:text-earth"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            <span>Home</span>
          </Link>
          <span>/</span>
          <span className="font-semibold text-earth">Profile Settings</span>
        </div>

        {/* Role-Aware Switcher / Action Button */}
        <div className="flex flex-wrap items-center gap-2.5">
          <StatusBadge variant="success" label="Active Account" />

          {isOwnerOrStaff ? (
            <Link
              to="/owner"
              className="inline-flex min-h-touch items-center gap-1.5 rounded-xl border border-earth bg-earth px-3.5 py-1.5 text-caption font-semibold text-on-brand shadow-sm transition-colors hover:bg-earth/90"
            >
              <Building2 className="h-4 w-4" aria-hidden="true" />
              <span>Switch to Owner Portal</span>
              <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
            </Link>
          ) : (
            <Link
              to="/owner"
              className="inline-flex min-h-touch items-center gap-1.5 rounded-xl border border-olive bg-olive px-3.5 py-1.5 text-caption font-semibold text-on-brand shadow-sm transition-colors hover:bg-olive/90"
            >
              <Building2 className="h-4 w-4" aria-hidden="true" />
              <span>List Your Property</span>
              <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
            </Link>
          )}

          {session ? (
            <button
              type="button"
              onClick={() => signOut()}
              className="fs-btn-ghost min-h-touch px-3 py-1.5 text-caption"
            >
              Sign out
            </button>
          ) : (
            <Link
              to="/auth/sign-in"
              className="fs-btn-secondary min-h-touch px-3 py-1.5 text-caption"
            >
              Sign in
            </Link>
          )}
        </div>
      </div>

      {/* Main Dashboard Card */}
      <div className="overflow-hidden rounded-3xl border border-border-subtle bg-surface-card shadow-sm">
        <div className="grid grid-cols-1 lg:grid-cols-12">
          {/* =========================================================================
              LEFT SIDEBAR: Navigation Menu
              ========================================================================= */}
          <aside className="border-b border-border-subtle p-5 lg:col-span-4 lg:border-b-0 lg:border-r lg:p-7">
            {/* Bureau / Hub Header */}
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-earth text-on-brand shadow-sm">
                <ShieldCheck className="h-6 w-6" aria-hidden="true" />
              </div>
              <div className="min-w-0">
                <h2 className="truncate font-display text-body-1 font-semibold text-earth">
                  {orgName}
                </h2>
                <p className="text-caption text-earth/70">FindStay Member Hub</p>
              </div>
            </div>

            {/* Menu Items */}
            <nav aria-label="Profile navigation" className="flex flex-col gap-1.5">
              <button
                type="button"
                onClick={() => setActiveTab('profile')}
                className={`flex w-full min-h-touch items-center gap-3 rounded-2xl px-4 py-2.5 text-left text-body-2 font-medium transition-colors ${
                  activeTab === 'profile'
                    ? 'bg-surface-muted font-semibold text-earth shadow-sm'
                    : 'text-earth/70 hover:bg-surface-hover/70 hover:text-earth'
                }`}
              >
                <User className="h-5 w-5 shrink-0" aria-hidden="true" />
                <span>Personal Profile</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('contact')}
                className={`flex w-full min-h-touch items-center gap-3 rounded-2xl px-4 py-2.5 text-left text-body-2 font-medium transition-colors ${
                  activeTab === 'contact'
                    ? 'bg-surface-muted font-semibold text-earth shadow-sm'
                    : 'text-earth/70 hover:bg-surface-hover/70 hover:text-earth'
                }`}
              >
                <Phone className="h-5 w-5 shrink-0" aria-hidden="true" />
                <span>Contact & Identity</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('notifications')}
                className={`flex w-full min-h-touch items-center gap-3 rounded-2xl px-4 py-2.5 text-left text-body-2 font-medium transition-colors ${
                  activeTab === 'notifications'
                    ? 'bg-surface-muted font-semibold text-earth shadow-sm'
                    : 'text-earth/70 hover:bg-surface-hover/70 hover:text-earth'
                }`}
              >
                <Bell className="h-5 w-5 shrink-0" aria-hidden="true" />
                <span>Notification Settings</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('organisation')}
                className={`flex w-full min-h-touch items-center gap-3 rounded-2xl px-4 py-2.5 text-left text-body-2 font-medium transition-colors ${
                  activeTab === 'organisation'
                    ? 'bg-surface-muted font-semibold text-earth shadow-sm'
                    : 'text-earth/70 hover:bg-surface-hover/70 hover:text-earth'
                }`}
              >
                <Building2 className="h-5 w-5 shrink-0" aria-hidden="true" />
                <span>Organisation & Roles</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('security')}
                className={`flex w-full min-h-touch items-center gap-3 rounded-2xl px-4 py-2.5 text-left text-body-2 font-medium transition-colors ${
                  activeTab === 'security'
                    ? 'bg-surface-muted font-semibold text-earth shadow-sm'
                    : 'text-earth/70 hover:bg-surface-hover/70 hover:text-earth'
                }`}
              >
                <KeyRound className="h-5 w-5 shrink-0" aria-hidden="true" />
                <span>Account & Security</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('privacy')}
                className={`flex w-full min-h-touch items-center gap-3 rounded-2xl px-4 py-2.5 text-left text-body-2 font-medium transition-colors ${
                  activeTab === 'privacy'
                    ? 'bg-surface-muted font-semibold text-earth shadow-sm'
                    : 'text-earth/70 hover:bg-surface-hover/70 hover:text-earth'
                }`}
              >
                <Shield className="h-5 w-5 shrink-0" aria-hidden="true" />
                <span>Privacy & Consent</span>
              </button>
            </nav>

            {/* Quick Portal Switcher Banner */}
            <div className="mt-8 rounded-2xl border border-border-subtle bg-canvas p-4">
              <p className="text-caption font-semibold text-earth">
                {isOwnerOrStaff ? 'Owner Operations' : 'Host on FindStay'}
              </p>
              <p className="mt-1 text-caption text-earth/70">
                {isOwnerOrStaff
                  ? 'Access your listings, unit calendars, and bookings.'
                  : 'Have an apartment or guest room? Start renting on FindStay.'}
              </p>
              <Link
                to="/owner"
                className="mt-3 inline-flex min-h-touch w-full items-center justify-center gap-1.5 rounded-xl bg-surface-muted px-3 py-2 text-caption font-semibold text-earth transition-colors hover:bg-surface-hover"
              >
                <span>{isOwnerOrStaff ? 'Open Owner Portal' : 'Start Hosting'}</span>
                <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
              </Link>
            </div>
          </aside>

          {/* =========================================================================
              RIGHT CONTENT AREA: Selected Tab Details
              ========================================================================= */}
          <main className="p-5 sm:p-7 lg:col-span-8 lg:p-9">
            {/* Tab 1: Personal Profile Details */}
            {activeTab === 'profile' && (
              <section aria-labelledby="profile-heading" className="space-y-8">
                <div>
                  <h1 id="profile-heading" className="font-display text-h3 text-earth">
                    Personal Profile
                  </h1>
                  <p className="mt-1 text-body-2 text-earth/70">
                    Your public accommodation identity, photo, and digital FindStay member ID.
                  </p>
                </div>

                {/* ---------------------------------------------------------------
                    DIGITAL ID CARD PREVIEW (Hero Card inspired by Dribbble)
                    --------------------------------------------------------------- */}
                <div className="relative overflow-hidden rounded-2xl bg-earth p-6 text-on-brand shadow-lg sm:p-8">
                  <div className="relative z-raised flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-5">
                      {/* Avatar with click-to-upload */}
                      <div className="relative group">
                        {avatarUrl ? (
                          <img
                            src={avatarUrl}
                            alt={fullName}
                            className="h-20 w-20 rounded-2xl border-2 border-on-brand/30 object-cover shadow-sm sm:h-24 sm:w-24"
                          />
                        ) : (
                          <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl border-2 border-on-brand/20 bg-olive text-h3 font-bold text-on-brand shadow-sm sm:h-24 sm:w-24">
                            {getInitials(fullName)}
                          </div>
                        )}
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          title="Click to change photo"
                          aria-label="Upload photo"
                          className="absolute inset-0 flex items-center justify-center rounded-2xl bg-earth/60 text-on-brand opacity-0 transition-opacity group-hover:opacity-100"
                        >
                          <Camera className="h-6 w-6" aria-hidden="true" />
                        </button>
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <h2 className="font-display text-h3 font-semibold text-on-brand">
                            {fullName || 'Anonymous User'}
                          </h2>
                          <UserCheck className="h-5 w-5 text-sand" aria-hidden="true" />
                        </div>
                        <p className="mt-1 text-body-2 text-sand">{activeRole} Member</p>
                        <p className="mt-0.5 text-caption text-on-brand/70">{orgName}</p>
                      </div>
                    </div>

                    <div className="flex flex-col items-start gap-2 border-t border-on-brand/15 pt-4 sm:border-t-0 sm:pt-0 sm:items-end">
                      <span className="rounded-full bg-on-brand/10 px-3 py-1 text-caption font-semibold text-sand">
                        FindStay ID #GH-2026
                      </span>
                      <p className="text-caption text-on-brand/60">
                        Ghana Verified Accommodation
                      </p>
                    </div>
                  </div>
                </div>

                {/* Profile Photo & Basic Info Row */}
                <div className="rounded-2xl border border-border-subtle bg-surface-card p-5 sm:p-6 space-y-6">
                  {/* Photo Uploader Card */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border-subtle pb-6">
                    <div className="flex items-center gap-4">
                      {avatarUrl ? (
                        <img
                          src={avatarUrl}
                          alt={fullName}
                          className="h-16 w-16 rounded-2xl border border-border-subtle object-cover"
                        />
                      ) : (
                        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-surface-muted text-body-1 font-bold text-earth">
                          {getInitials(fullName)}
                        </div>
                      )}
                      <div>
                        <h3 className="font-display text-body-1 font-semibold text-earth">
                          Profile Photo
                        </h3>
                        <p className="text-caption text-earth/70">
                          JPG, PNG, or WebP. Recommended 400x400px.
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2.5">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="fs-btn-secondary inline-flex min-h-touch items-center gap-2 px-3.5 py-1.5 text-caption sm:text-body-2"
                      >
                        <Upload className="h-4 w-4" aria-hidden="true" />
                        <span>Upload Photo</span>
                      </button>

                      {avatarUrl && (
                        <button
                          type="button"
                          onClick={handleRemovePhoto}
                          className="fs-btn-ghost inline-flex min-h-touch items-center gap-1.5 px-3 py-1.5 text-caption text-status-error-fg hover:bg-status-error-bg"
                        >
                          <Trash2 className="h-4 w-4" aria-hidden="true" />
                          <span>Remove</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Name & Information */}
                  <div>
                    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                      <div>
                        <h3 className="font-display text-body-1 font-semibold text-earth">
                          Personal Information
                        </h3>
                        <p className="text-caption text-earth/70">
                          Your official name as shown on Ghana verification documents.
                        </p>
                      </div>
                      {!isEditing && (
                        <button
                          type="button"
                          onClick={() => setIsEditing(true)}
                          className="fs-btn-secondary inline-flex min-h-touch items-center gap-2 px-4 py-2 text-body-2"
                        >
                          <Edit3 className="h-4 w-4" aria-hidden="true" />
                          <span>Edit Details</span>
                        </button>
                      )}
                    </div>

                    {isEditing ? (
                      <form onSubmit={handleSaveProfile} className="mt-6 space-y-4">
                        <FormField
                          id="profile-fullName"
                          label="Full Name"
                          required
                          value={fullName}
                          onChange={(e) => {
                            setFullName(e.target.value);
                            if (nameError) validateName(e.target.value);
                          }}
                          error={nameError ?? undefined}
                          placeholder="e.g. Okyere Ankomah Julius"
                          hint="Your legal name for booking confirmations and host contracts."
                        />

                        <div className="flex flex-wrap items-center justify-end gap-3 pt-3">
                          <button
                            type="button"
                            onClick={() => {
                              setIsEditing(false);
                              setNameError(null);
                            }}
                            className="fs-btn-ghost min-h-touch px-4 py-2 text-body-2"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            disabled={saving}
                            className="fs-btn-primary min-h-touch px-5 py-2 text-body-2"
                          >
                            {saving ? 'Saving...' : 'Save Changes'}
                          </button>
                        </div>
                      </form>
                    ) : (
                      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div className="rounded-xl bg-canvas p-4 border border-border-subtle/60">
                          <span className="text-caption text-earth/60">Legal Full Name</span>
                          <p className="mt-0.5 font-medium text-earth">{fullName || '—'}</p>
                        </div>
                        <div className="rounded-xl bg-canvas p-4 border border-border-subtle/60">
                          <span className="text-caption text-earth/60">Avatar Status</span>
                          <p className="mt-0.5 font-medium text-earth">
                            {avatarUrl ? 'Custom Image Active' : 'Fallback Initials Badge'}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </section>
            )}

            {/* Tab 2: Contact & Identity */}
            {activeTab === 'contact' && (
              <section aria-labelledby="contact-heading" className="space-y-6">
                <div>
                  <h1 id="contact-heading" className="font-display text-h3 text-earth">
                    Contact & Identity
                  </h1>
                  <p className="mt-1 text-body-2 text-earth/70">
                    Verify your phone number and email address for booking alerts and notifications.
                  </p>
                </div>

                <div className="rounded-2xl border border-border-subtle bg-surface-card p-5 sm:p-6 space-y-6">
                  {/* Email Section (Read-Only) */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border-subtle pb-6">
                    <div>
                      <div className="flex items-center gap-2">
                        <Mail className="h-5 w-5 text-earth/70" aria-hidden="true" />
                        <h3 className="font-display text-body-1 font-semibold text-earth">
                          Email Address
                        </h3>
                      </div>
                      <p className="mt-1 text-body-2 text-earth font-mono">{activeEmail}</p>
                      <p className="mt-0.5 text-caption text-earth/60">
                        Authentication is managed by Supabase. Email changes require security verification.
                      </p>
                    </div>
                    <div className="shrink-0 flex items-center gap-2">
                      <StatusBadge variant="success" label="Verified" icon={CheckCircle2} />
                      <span title="Read-only authentication field">
                        <Lock className="h-4 w-4 text-earth/40" aria-hidden="true" />
                      </span>
                    </div>
                  </div>

                  {/* Ghana Phone Section */}
                  <div>
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <Phone className="h-5 w-5 text-earth/70" aria-hidden="true" />
                          <h3 className="font-display text-body-1 font-semibold text-earth">
                            Ghana Phone Number
                          </h3>
                        </div>
                        <p className="mt-1 text-body-2 text-earth font-mono">
                          {phone || 'No phone registered yet'}
                        </p>
                        <p className="mt-0.5 text-caption text-earth/60">
                          Used for Mobile Money and critical SMS notifications. Format: +233XXXXXXXXX.
                        </p>
                      </div>
                    </div>

                    <form onSubmit={handleSaveProfile} className="mt-4 max-w-md">
                      <FormField
                        id="profile-phone"
                        label="Update Phone Number"
                        value={phone}
                        onChange={(e) => {
                          setPhone(e.target.value);
                          if (phoneError) validatePhone(e.target.value);
                        }}
                        error={phoneError ?? undefined}
                        placeholder="+233241234567"
                        hint="Ghana E.164 format: +233 followed by 9 digits."
                      />
                      <button
                        type="submit"
                        disabled={saving}
                        className="mt-3 fs-btn-primary min-h-touch px-4 py-2 text-body-2"
                      >
                        {saving ? 'Updating...' : 'Update Phone'}
                      </button>
                    </form>
                  </div>
                </div>
              </section>
            )}

            {/* Tab 3: Notification Settings (SCR-06) */}
            {activeTab === 'notifications' && (
              <section aria-labelledby="notification-heading" className="space-y-6">
                <div>
                  <h1 id="notification-heading" className="font-display text-h3 text-earth">
                    Notification Preferences
                  </h1>
                  <p className="mt-1 text-body-2 text-earth/70">
                    Choose how you want to receive booking confirmations, updates, and host announcements.
                  </p>
                </div>

                <div className="divide-y divide-border-subtle rounded-2xl border border-border-subtle bg-surface-card p-5 sm:p-6">
                  {/* Email Toggle */}
                  <div className="flex items-center justify-between py-4 first:pt-0">
                    <div>
                      <h3 className="font-display text-body-1 font-semibold text-earth">
                        Email Notifications
                      </h3>
                      <p className="text-caption text-earth/70">
                        Receive detailed booking receipts and system summaries.
                      </p>
                    </div>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={emailAlerts}
                      onClick={() => setEmailAlerts(!emailAlerts)}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-base ${
                        emailAlerts ? 'bg-olive' : 'bg-surface-muted'
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-on-brand shadow-lg ring-0 transition duration-base ${
                          emailAlerts ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>

                  {/* SMS Toggle */}
                  <div className="flex items-center justify-between py-4">
                    <div>
                      <h3 className="font-display text-body-1 font-semibold text-earth">
                        SMS Text Alerts
                      </h3>
                      <p className="text-caption text-earth/70">
                        Urgent check-in codes and immediate landlord alerts to your Ghana phone.
                      </p>
                    </div>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={smsAlerts}
                      onClick={() => setSmsAlerts(!smsAlerts)}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-base ${
                        smsAlerts ? 'bg-olive' : 'bg-surface-muted'
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-on-brand shadow-lg ring-0 transition duration-base ${
                          smsAlerts ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>

                  {/* In-App Toggle */}
                  <div className="flex items-center justify-between py-4 last:pb-0">
                    <div>
                      <h3 className="font-display text-body-1 font-semibold text-earth">
                        In-App Inbox Alerts
                      </h3>
                      <p className="text-caption text-earth/70">
                        Show unread badges and banner notifications inside the portal.
                      </p>
                    </div>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={inAppAlerts}
                      onClick={() => setInAppAlerts(!inAppAlerts)}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-base ${
                        inAppAlerts ? 'bg-olive' : 'bg-surface-muted'
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-on-brand shadow-lg ring-0 transition duration-base ${
                          inAppAlerts ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </section>
            )}

            {/* Tab 4: Organisation & Roles (SCR-06B) */}
            {activeTab === 'organisation' && (
              <section aria-labelledby="org-heading" className="space-y-6">
                <div>
                  <h1 id="org-heading" className="font-display text-h3 text-earth">
                    Organisation & Roles
                  </h1>
                  <p className="mt-1 text-body-2 text-earth/70">
                    Your assigned tenant workspace and access permissions.
                  </p>
                </div>

                <div className="rounded-2xl border border-border-subtle bg-surface-card p-5 sm:p-6 space-y-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-caption text-earth/60">Current Organization</span>
                      <h3 className="font-display text-h3 text-earth">{orgName}</h3>
                    </div>
                    <span className="rounded-full bg-olive/15 px-3 py-1 text-caption font-semibold text-olive">
                      {activeRole}
                    </span>
                  </div>

                  <p className="text-body-2 text-earth/70">
                    {isOwnerOrStaff
                      ? 'You have complete administrative access over property listings, unit calendars, and team staff invitations within this organization.'
                      : 'You currently hold a Personal Guest Account. You can browse and book verified properties across Ghana.'}
                  </p>

                  <div className="pt-2">
                    <h4 className="font-display text-body-2 font-semibold text-earth">
                      Available Portals:
                    </h4>
                    <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <Link
                        to="/"
                        className="flex items-center justify-between rounded-xl border border-border-subtle bg-canvas p-4 transition-colors hover:bg-surface-hover"
                      >
                        <div>
                          <p className="font-semibold text-earth">Guest Marketplace</p>
                          <p className="text-caption text-earth/60">Browse accommodations</p>
                        </div>
                        <ExternalLink className="h-4 w-4 text-earth/60" />
                      </Link>

                      <Link
                        to="/owner"
                        className="flex items-center justify-between rounded-xl border border-border-subtle bg-canvas p-4 transition-colors hover:bg-surface-hover"
                      >
                        <div>
                          <p className="font-semibold text-earth">
                            {isOwnerOrStaff ? 'Owner Portal' : 'Start Hosting'}
                          </p>
                          <p className="text-caption text-earth/60">
                            {isOwnerOrStaff
                              ? 'Manage properties & units'
                              : 'List your property on FindStay'}
                          </p>
                        </div>
                        <ExternalLink className="h-4 w-4 text-earth/60" />
                      </Link>
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* Tab 5: Account & Security */}
            {activeTab === 'security' && (
              <section aria-labelledby="security-heading" className="space-y-6">
                <div>
                  <h1 id="security-heading" className="font-display text-h3 text-earth">
                    Account & Security
                  </h1>
                  <p className="mt-1 text-body-2 text-earth/70">
                    Manage your credentials and password recovery.
                  </p>
                </div>

                <div className="rounded-2xl border border-border-subtle bg-surface-card p-5 sm:p-6 space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h3 className="font-display text-body-1 font-semibold text-earth">
                        Password Recovery
                      </h3>
                      <p className="text-caption text-earth/70">
                        We send a secure, single-use reset link directly to your email.
                      </p>
                    </div>
                    <button
                      type="button"
                      disabled={resetLoading || resetSent}
                      onClick={handleSendPasswordReset}
                      className="fs-btn-secondary min-h-touch px-4 py-2 text-body-2"
                    >
                      {resetLoading
                        ? 'Sending Link...'
                        : resetSent
                        ? 'Link Sent ✓'
                        : 'Reset Password'}
                    </button>
                  </div>
                </div>
              </section>
            )}

            {/* Tab 6: Privacy & Policy Consent (SCR-06C) */}
            {activeTab === 'privacy' && (
              <section aria-labelledby="privacy-heading" className="space-y-6">
                <div>
                  <h1 id="privacy-heading" className="font-display text-h3 text-earth">
                    Privacy & Legal Consent
                  </h1>
                  <p className="mt-1 text-body-2 text-earth/70">
                    FindStay data protection compliance and user policy agreement records.
                  </p>
                </div>

                <div className="rounded-2xl border border-border-subtle bg-surface-card p-5 sm:p-6 space-y-4">
                  <div className="flex items-center gap-3">
                    <Check className="h-5 w-5 text-olive" aria-hidden="true" />
                    <div>
                      <h3 className="font-display text-body-1 font-semibold text-earth">
                        Policy Version 1.0 (Accepted)
                      </h3>
                      <p className="text-caption text-earth/70">
                        Consent recorded per Ghana Data Protection Act 2012 (Act 843).
                      </p>
                    </div>
                  </div>

                  <p className="text-body-2 text-earth/70 leading-relaxed">
                    FindStay protects your identity, verification documents, and payment details.
                    Verification documents are stored in private Cloudflare R2 vaults and accessible
                    solely to authorized platform staff.
                  </p>

                  <div className="pt-2">
                    <span className="inline-flex items-center gap-1.5 text-caption font-medium text-olive">
                      <Globe className="h-4 w-4" aria-hidden="true" />
                      <span>Data Sovereignty: Africa/Accra</span>
                    </span>
                  </div>
                </div>
              </section>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;

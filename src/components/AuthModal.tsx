import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Lock,
  Mail,
  User as UserIcon,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  LogOut,
  RefreshCw,
  Droplets,
  Flame,
  Trash2,
} from 'lucide-react';
import { AuthUser, UserProfile } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  initialMode?: 'signin' | 'signup';
  onClose: () => void;
  currentUser: AuthUser | null;
  onAuthSuccess: (user: AuthUser, token: string) => void;
  onSignOut: () => void;
  onDeleteAccount?: () => Promise<boolean | void>;
  onOpenPrivacy?: () => void;
  currentProfile?: UserProfile;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  initialMode = 'signin',
  onClose,
  currentUser,
  onAuthSuccess,
  onSignOut,
  onDeleteAccount,
  onOpenPrivacy,
  currentProfile,
}) => {
  const [mode, setMode] = useState<'signin' | 'signup'>(initialMode);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [agreedToTerms, setAgreedToTerms] = useState(true);
  const [ageConfirmed, setAgeConfirmed] = useState(false);
  const [retentionAcknowledged, setRetentionAcknowledged] = useState(false);
  const [confirmingDeletion, setConfirmingDeletion] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleModeSwitch = (newMode: 'signin' | 'signup') => {
    setMode(newMode);
    setErrorMessage(null);
    setSuccessMessage(null);
  };

  // Prefill Ali's demo credentials for 1-click test drive
  const handleQuickDemo = () => {
    setEmail('aliyasser0222@gmail.com');
    setPassword('password123');
    setMode('signin');
    setErrorMessage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (mode === 'signup') {
      if (!name.trim()) {
        setErrorMessage('Please enter your full name.');
        return;
      }
      if (password.length < 6) {
        setErrorMessage('Password must be at least 6 characters.');
        return;
      }
      if (password !== confirmPassword) {
        setErrorMessage('Passwords do not match. Please re-enter.');
        return;
      }
      if (!ageConfirmed) {
        setErrorMessage('Age Verification Required: You must certify that you are at least 18 years old.');
        return;
      }
      if (!retentionAcknowledged) {
        setErrorMessage('Legal Consent Required: You must acknowledge that metrics and logs are stored temporarily and can be erased upon request.');
        return;
      }
      if (!agreedToTerms) {
        setErrorMessage('You must acknowledge the Privacy Policy and terms of use.');
        return;
      }
    }

    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }
    if (!password) {
      setErrorMessage('Please enter your password.');
      return;
    }

    setLoading(true);

    try {
      const endpoint = mode === 'signup' ? '/api/auth/signup' : '/api/auth/signin';
      const body =
        mode === 'signup'
          ? {
              name: name.trim(),
              email: email.trim().toLowerCase(),
              password,
              ageConfirmed: true,
              dataRetentionAcknowledged: true,
              profile: currentProfile,
              waterGoalMl: 3200,
            }
          : {
              email: email.trim().toLowerCase(),
              password,
            };

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Authentication failed. Please check your details.');
      }

      setSuccessMessage(
        mode === 'signup'
          ? `Welcome to form., ${data.user.name}! Your account is created.`
          : `Welcome back, ${data.user.name}!`
      );

      // Store token
      if (rememberMe && data.token) {
        localStorage.setItem('form_auth_token', data.token);
        localStorage.setItem('form_auth_user', JSON.stringify(data.user));
      }

      setTimeout(() => {
        onAuthSuccess(data.user, data.token);
        onClose();
      }, 700);
    } catch (err: any) {
      setErrorMessage(err.message || 'Network error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-modal-title"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        backgroundColor: 'rgba(25, 60, 50, 0.45)',
        backdropFilter: 'blur(6px)',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 12 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        style={{
          background: '#ffffff',
          width: '100%',
          maxWidth: '460px',
          borderRadius: '16px',
          boxShadow: '0 25px 50px -12px rgba(25, 60, 50, 0.25)',
          border: '1px solid var(--line)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '92vh',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div
          style={{
            padding: '20px 24px',
            borderBottom: '1px solid var(--line)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'var(--paper)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span
              style={{
                fontFamily: 'var(--font-display, Georgia, serif)',
                fontWeight: 700,
                fontSize: '18px',
                color: 'var(--green)',
                letterSpacing: '-0.02em',
              }}
            >
              form<span style={{ color: 'var(--orange)' }}>.</span>
            </span>
            <span
              style={{
                fontSize: '11px',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                background: '#ffffff',
                border: '1px solid var(--line)',
                padding: '2px 8px',
                borderRadius: '12px',
                fontWeight: 600,
                color: 'var(--ink)',
              }}
            >
              {currentUser ? 'Account' : mode === 'signin' ? 'Sign In' : 'Sign Up'}
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--muted)',
              padding: '6px',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Content Body */}
        <div style={{ padding: '24px', overflowY: 'auto' }}>
          {currentUser ? (
            /* User already signed in view */
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px',
                  background: 'var(--paper)',
                  padding: '16px',
                  borderRadius: '12px',
                  border: '1px solid var(--line)',
                }}
              >
                <div
                  style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '50%',
                    background: 'var(--green)',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '18px',
                    fontWeight: 700,
                    fontFamily: 'var(--font-display, Georgia, serif)',
                  }}
                >
                  {currentUser.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3
                    style={{
                      margin: 0,
                      fontSize: '17px',
                      fontWeight: 700,
                      color: 'var(--ink)',
                      fontFamily: 'var(--font-display, Georgia, serif)',
                    }}
                  >
                    {currentUser.name}
                  </h3>
                  <p style={{ margin: '2px 0 0', fontSize: '13px', color: 'var(--muted)' }}>
                    {currentUser.email}
                  </p>
                </div>
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, 1fr)',
                  gap: '10px',
                }}
              >
                <div
                  style={{
                    padding: '12px',
                    borderRadius: '10px',
                    background: '#f4f6f4',
                    border: '1px solid #d8e2dc',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--green)' }}>
                    <Droplets size={14} />
                    <span style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase' }}>Water Goal</span>
                  </div>
                  <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--ink)', marginTop: '4px' }}>
                    {currentUser.waterGoalMl || 3200} ml/day
                  </div>
                </div>

                <div
                  style={{
                    padding: '12px',
                    borderRadius: '10px',
                    background: '#fbf5f2',
                    border: '1px solid #f2dfd5',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--orange)' }}>
                    <Flame size={14} />
                    <span style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase' }}>Protocol</span>
                  </div>
                  <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--ink)', marginTop: '4px', textTransform: 'capitalize' }}>
                    {currentUser.profile?.compound && currentUser.profile.compound !== 'none'
                      ? currentUser.profile.compound
                      : 'Standard'}
                  </div>
                </div>
              </div>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '12px',
                  color: 'var(--green)',
                  background: 'rgba(25, 60, 50, 0.05)',
                  padding: '10px 14px',
                  borderRadius: '8px',
                }}
              >
                <ShieldCheck size={16} />
                <span>Cloud Sync Enabled — Your metrics, meals & water logs are safely saved.</span>
              </div>

              {/* Data Retention & Privacy Notice Box */}
              <div
                style={{
                  background: '#f8faf9',
                  border: '1px solid #e2ece6',
                  borderRadius: '8px',
                  padding: '10px 12px',
                  fontSize: '11.5px',
                  color: '#4a5568',
                  lineHeight: 1.45,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600, color: '#2d3748', marginBottom: '4px' }}>
                  <span>⚖️ Temporary Legal Retention Notice</span>
                </div>
                <div>
                  Your personal metrics and nutrition logs are stored temporarily for session continuity in compliance with GDPR Art. 5(1)(c). In accordance with GDPR Article 17 ("Right to Erasure"), you can permanently erase your entire account, profile, logs, and tokens at any time below.
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
                <button
                  type="button"
                  onClick={onClose}
                  style={{
                    flex: 1,
                    background: 'var(--green)',
                    color: '#ffffff',
                    border: 'none',
                    padding: '12px',
                    borderRadius: '10px',
                    fontSize: '14px',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Continue to App
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onSignOut();
                    onClose();
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    background: '#ffffff',
                    color: '#4b5563',
                    border: '1px solid #d1d5db',
                    padding: '12px 16px',
                    borderRadius: '10px',
                    fontSize: '14px',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  <LogOut size={16} />
                  <span>Sign Out</span>
                </button>
              </div>

              {/* Account Deletion / Right to Erasure Section */}
              <div
                style={{
                  borderTop: '1px dashed #fca5a5',
                  paddingTop: '14px',
                  marginTop: '8px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                }}
              >
                {!confirmingDeletion ? (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ fontSize: '11px', color: '#991b1b' }}>
                      <strong>Data Erasure (GDPR Art. 17):</strong> Permanently wipe all data.
                    </div>
                    <button
                      type="button"
                      onClick={() => setConfirmingDeletion(true)}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '5px',
                        background: '#fff1f2',
                        color: '#b91c1c',
                        border: '1px solid #fecdd3',
                        padding: '6px 12px',
                        borderRadius: '6px',
                        fontSize: '11.5px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        transition: 'background 0.15s ease',
                      }}
                    >
                      <Trash2 size={13} />
                      <span>Delete Account</span>
                    </button>
                  </div>
                ) : (
                  <div
                    style={{
                      background: '#fef2f2',
                      border: '1px solid #f87171',
                      borderRadius: '8px',
                      padding: '12px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px',
                    }}
                  >
                    <div style={{ fontSize: '12px', color: '#991b1b', fontWeight: 600 }}>
                      ⚠️ Are you sure you want to delete your account?
                    </div>
                    <div style={{ fontSize: '11px', color: '#7f1d1d', lineHeight: 1.4 }}>
                      This action is irreversible. All your stored metrics, food logs, water logs, and authentication records will be immediately and permanently deleted from the database.
                    </div>
                    <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                      <button
                        type="button"
                        disabled={isDeleting}
                        onClick={async () => {
                          if (onDeleteAccount) {
                            setIsDeleting(true);
                            try {
                              await onDeleteAccount();
                              onClose();
                            } catch (e: any) {
                              setErrorMessage(e.message || 'Failed to delete account');
                            } finally {
                              setIsDeleting(false);
                            }
                          }
                        }}
                        style={{
                          flex: 1,
                          background: '#dc2626',
                          color: '#ffffff',
                          border: 'none',
                          padding: '8px 12px',
                          borderRadius: '6px',
                          fontSize: '12px',
                          fontWeight: 600,
                          cursor: isDeleting ? 'not-allowed' : 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px',
                        }}
                      >
                        {isDeleting ? <RefreshCw size={14} className="animate-spin" /> : <Trash2 size={14} />}
                        <span>{isDeleting ? 'Deleting...' : 'Yes, Delete All My Data'}</span>
                      </button>
                      <button
                        type="button"
                        disabled={isDeleting}
                        onClick={() => setConfirmingDeletion(false)}
                        style={{
                          background: '#ffffff',
                          color: '#374151',
                          border: '1px solid #d1d5db',
                          padding: '8px 12px',
                          borderRadius: '6px',
                          fontSize: '12px',
                          fontWeight: 600,
                          cursor: 'pointer',
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* Auth Form (Sign In / Sign Up) */
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Tabs Switcher */}
              <div
                style={{
                  display: 'flex',
                  background: 'var(--paper)',
                  padding: '3px',
                  borderRadius: '10px',
                  border: '1px solid var(--line)',
                }}
              >
                <button
                  type="button"
                  onClick={() => handleModeSwitch('signin')}
                  style={{
                    flex: 1,
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: 'none',
                    background: mode === 'signin' ? '#ffffff' : 'transparent',
                    color: mode === 'signin' ? 'var(--ink)' : 'var(--muted)',
                    fontWeight: mode === 'signin' ? 600 : 500,
                    fontSize: '13px',
                    cursor: 'pointer',
                    boxShadow: mode === 'signin' ? '0 1px 3px rgba(0,0,0,0.06)' : 'none',
                    transition: 'all 0.15s ease',
                  }}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => handleModeSwitch('signup')}
                  style={{
                    flex: 1,
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: 'none',
                    background: mode === 'signup' ? '#ffffff' : 'transparent',
                    color: mode === 'signup' ? 'var(--ink)' : 'var(--muted)',
                    fontWeight: mode === 'signup' ? 600 : 500,
                    fontSize: '13px',
                    cursor: 'pointer',
                    boxShadow: mode === 'signup' ? '0 1px 3px rgba(0,0,0,0.06)' : 'none',
                    transition: 'all 0.15s ease',
                  }}
                >
                  Create Account
                </button>
              </div>

              {/* Header Title */}
              <div>
                <h2
                  id="auth-modal-title"
                  style={{
                    margin: 0,
                    fontSize: '20px',
                    fontWeight: 700,
                    color: 'var(--ink)',
                    fontFamily: 'var(--font-display, Georgia, serif)',
                  }}
                >
                  {mode === 'signin' ? 'Welcome back' : 'Start your health protocol'}
                </h2>
                <p style={{ margin: '4px 0 0', fontSize: '13px', color: 'var(--muted)' }}>
                  {mode === 'signin'
                    ? 'Sign in to access your saved calories, meal plans & water intake.'
                    : 'Create your account to sync your hydration, nutrition & training goals.'}
                </p>
              </div>

              {/* Error / Success Banners */}
              {errorMessage && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    background: '#fef2f2',
                    border: '1px solid #fecaca',
                    color: '#991b1b',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    fontSize: '13px',
                  }}
                >
                  <AlertCircle size={16} style={{ flexShrink: 0 }} />
                  <span>{errorMessage}</span>
                </div>
              )}

              {successMessage && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    background: '#f0fdf4',
                    border: '1px solid #bbf7d0',
                    color: '#166534',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    fontSize: '13px',
                  }}
                >
                  <CheckCircle2 size={16} style={{ flexShrink: 0 }} />
                  <span>{successMessage}</span>
                </div>
              )}

              {/* Inputs */}
              {mode === 'signup' && (
                <div>
                  <label
                    htmlFor="auth-name"
                    style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--ink)', marginBottom: '5px' }}
                  >
                    Full Name
                  </label>
                  <div style={{ position: 'relative' }}>
                    <UserIcon
                      size={15}
                      style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)' }}
                    />
                    <input
                      id="auth-name"
                      type="text"
                      placeholder="Ali Yasser"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      style={{
                        width: '100%',
                        padding: '10px 12px 10px 36px',
                        border: '1px solid var(--line)',
                        borderRadius: '8px',
                        fontSize: '14px',
                        color: 'var(--ink)',
                        boxSizing: 'border-box',
                        outline: 'none',
                      }}
                    />
                  </div>
                </div>
              )}

              <div>
                <label
                  htmlFor="auth-email"
                  style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--ink)', marginBottom: '5px' }}
                >
                  Email Address
                </label>
                <div style={{ position: 'relative' }}>
                  <Mail
                    size={15}
                    style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)' }}
                  />
                  <input
                    id="auth-email"
                    type="email"
                    placeholder="you@domain.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                    style={{
                      width: '100%',
                      padding: '10px 12px 10px 36px',
                      border: '1px solid var(--line)',
                      borderRadius: '8px',
                      fontSize: '14px',
                      color: 'var(--ink)',
                      boxSizing: 'border-box',
                      outline: 'none',
                    }}
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="auth-password"
                  style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--ink)', marginBottom: '5px' }}
                >
                  Password
                </label>
                <div style={{ position: 'relative' }}>
                  <Lock
                    size={15}
                    style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)' }}
                  />
                  <input
                    id="auth-password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="At least 6 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
                    style={{
                      width: '100%',
                      padding: '10px 36px 10px 36px',
                      border: '1px solid var(--line)',
                      borderRadius: '8px',
                      fontSize: '14px',
                      color: 'var(--ink)',
                      boxSizing: 'border-box',
                      outline: 'none',
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: 'absolute',
                      right: '10px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: 'var(--muted)',
                      padding: '4px',
                    }}
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {mode === 'signup' && (
                <div>
                  <label
                    htmlFor="auth-confirm-password"
                    style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--ink)', marginBottom: '5px' }}
                  >
                    Confirm Password
                  </label>
                  <div style={{ position: 'relative' }}>
                    <Lock
                      size={15}
                      style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)' }}
                    />
                    <input
                      id="auth-confirm-password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Repeat your password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      autoComplete="new-password"
                      style={{
                        width: '100%',
                        padding: '10px 12px 10px 36px',
                        border: '1px solid var(--line)',
                        borderRadius: '8px',
                        fontSize: '14px',
                        color: 'var(--ink)',
                        boxSizing: 'border-box',
                        outline: 'none',
                      }}
                    />
                  </div>
                </div>
              )}

              {/* Remember Me & Privacy Checkbox */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: 'var(--ink)', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    style={{ accentColor: 'var(--green)' }}
                  />
                  <span>Remember my session on this device</span>
                </label>

                {mode === 'signup' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '10px 12px', background: '#f8faf9', border: '1px solid #e2ece6', borderRadius: '8px' }}>
                    {/* Legal Notice: Temporary Data Storage */}
                    <div style={{ fontSize: '11px', color: '#2d3748', lineHeight: 1.4, marginBottom: '2px' }}>
                      <strong style={{ color: 'var(--green)' }}>⚖️ Legal Notice:</strong> All personal metrics, nutrition, and hydration records are stored <em>temporarily</em> solely to preserve your active session continuity. You may erase all your stored data at any time via Account settings.
                    </div>

                    {/* Age Checkbox */}
                    <label style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '12px', color: 'var(--ink)', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={ageConfirmed}
                        onChange={(e) => setAgeConfirmed(e.target.checked)}
                        style={{ accentColor: 'var(--green)', marginTop: '2px' }}
                      />
                      <span>
                        <strong>Age Requirement:</strong> I certify that I am <strong>18 years of age or older</strong>.
                      </span>
                    </label>

                    {/* Temporary Storage Acknowledgment Checkbox */}
                    <label style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '12px', color: 'var(--ink)', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={retentionAcknowledged}
                        onChange={(e) => setRetentionAcknowledged(e.target.checked)}
                        style={{ accentColor: 'var(--green)', marginTop: '2px' }}
                      />
                      <span>
                        I understand that my data is only stored temporarily for legal and session reasons, and can be permanently deleted upon request.
                      </span>
                    </label>

                    {/* Privacy & Medical Disclaimer */}
                    <label style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '11px', color: 'var(--muted)', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={agreedToTerms}
                        onChange={(e) => setAgreedToTerms(e.target.checked)}
                        style={{ accentColor: 'var(--green)', marginTop: '2px' }}
                      />
                      <span>
                        I agree to the{' '}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            onOpenPrivacy?.();
                          }}
                          style={{ background: 'none', border: 'none', padding: 0, color: 'var(--green)', textDecoration: 'underline', cursor: 'pointer', fontSize: '11px' }}
                        >
                          Privacy Policy & Terms
                        </button>{' '}
                        and understand form. is for educational purposes only.
                      </span>
                    </label>
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                style={{
                  background: 'var(--green)',
                  color: '#ffffff',
                  border: 'none',
                  padding: '12px',
                  borderRadius: '10px',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: loading ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  opacity: loading ? 0.7 : 1,
                  transition: 'all 0.15s ease',
                  marginTop: '6px',
                }}
              >
                {loading ? (
                  <>
                    <RefreshCw size={16} className="animate-spin" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <span>{mode === 'signin' ? 'Sign In' : 'Create Account'}</span>
                    <ArrowRight size={16} />
                  </>
                )}
              </button>

              {/* Demo Helper Button */}
              <div
                style={{
                  borderTop: '1px solid var(--line)',
                  paddingTop: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '8px',
                }}
              >
                <span style={{ fontSize: '11px', color: 'var(--muted)' }}>
                  Ali's Master Account:
                </span>
                <button
                  type="button"
                  onClick={handleQuickDemo}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    background: '#f4f6f4',
                    border: '1px solid #d8e2dc',
                    padding: '4px 10px',
                    borderRadius: '6px',
                    fontSize: '11px',
                    fontWeight: 600,
                    color: 'var(--green)',
                    cursor: 'pointer',
                  }}
                >
                  <Sparkles size={12} />
                  <span>1-Click Fill (Ali Yasser)</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
};

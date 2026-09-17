import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mail, ShieldCheck, Droplets, User, LogIn, UserPlus, LogOut, Check } from 'lucide-react';
import { LegalTab } from './LegalModal';
import { AuthUser } from '../types';

interface HeaderProps {
  activeTab: 'calculator' | 'tracker' | 'water' | 'training' | 'glp1' | 'science';
  onTabChange: (tab: 'calculator' | 'tracker' | 'water' | 'training' | 'glp1' | 'science') => void;
  isGLP1User?: boolean;
  onOpenContact?: () => void;
  onOpenLegal?: (tab?: LegalTab) => void;
  currentUser?: AuthUser | null;
  onOpenAuth?: (mode?: 'signin' | 'signup') => void;
  onSignOut?: () => void;
  todayWaterMl?: number;
  waterGoalMl?: number;
}

const TABS: {
  id: 'calculator' | 'tracker' | 'water' | 'training' | 'glp1' | 'science';
  label: string;
  badge?: string;
  isWater?: boolean;
}[] = [
  { id: 'calculator', label: 'Calculator' },
  { id: 'tracker', label: 'Food & Meals' },
  { id: 'water', label: 'Water Tracker', isWater: true },
  { id: 'training', label: 'Training Splits' },
  { id: 'glp1', label: 'GLP-1 & Reta Hub', badge: 'Active' },
  { id: 'science', label: 'Research' },
];

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onTabChange,
  isGLP1User,
  onOpenContact,
  onOpenLegal,
  currentUser,
  onOpenAuth,
  onSignOut,
  todayWaterMl = 0,
  waterGoalMl = 3200,
}) => {
  const [showUserMenu, setShowUserMenu] = useState(false);

  return (
    <>
      <a className="skip-link" href="#main-content">Skip to content</a>
      <header className="site-header shell" style={{ height: 'auto', paddingBlock: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', flexWrap: 'wrap', gap: '12px' }}>
          {/* Brand */}
          <a
            className="brand"
            href="#calculator"
            onClick={(e) => {
              e.preventDefault();
              onTabChange('calculator');
            }}
            aria-label="Form home"
            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <span className="brand-mark" aria-hidden="true">f</span>
            <span style={{ fontWeight: 600 }}>form</span>
            <span className="brand-period">.</span>
          </a>

          {/* Nav Tabs */}
          <nav aria-label="Main navigation" style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', background: '#ecebe3', padding: '3px', borderRadius: '12px', border: '1px solid #dcdecb' }}>
            {TABS.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => onTabChange(tab.id)}
                  style={{
                    position: 'relative',
                    border: 0,
                    background: 'transparent',
                    padding: '7px 12px',
                    borderRadius: '8px',
                    fontSize: '13px',
                    fontWeight: isActive ? 600 : 500,
                    color: isActive ? 'var(--green)' : 'var(--muted)',
                    cursor: 'pointer',
                    zIndex: 1,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px',
                    transition: 'color 0.2s ease',
                  }}
                >
                  {isActive && (
                    <motion.div
                      layoutId="header-active-pill"
                      style={{
                        position: 'absolute',
                        inset: 0,
                        background: '#ffffff',
                        borderRadius: '8px',
                        boxShadow: '0 2px 8px rgba(32, 59, 50, 0.08)',
                        zIndex: -1,
                      }}
                      transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                    />
                  )}
                  {tab.isWater && <Droplets size={13} color={isActive ? '#0284c7' : 'currentColor'} />}
                  <span>{tab.label}</span>
                  {tab.id === 'glp1' && isGLP1User && (
                    <span
                      style={{
                        fontSize: '9px',
                        fontWeight: 700,
                        padding: '1px 5px',
                        borderRadius: '6px',
                        background: 'var(--orange)',
                        color: '#fff',
                        textTransform: 'uppercase',
                        letterSpacing: '0.4px',
                      }}
                    >
                      Prot
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right Action Tools */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            {/* Quick Hydration Badge */}
            <button
              type="button"
              onClick={() => onTabChange('water')}
              title="Track daily hydration"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                background: activeTab === 'water' ? '#e0f2fe' : '#ffffff',
                border: `1px solid ${activeTab === 'water' ? '#bae6fd' : 'var(--line)'}`,
                padding: '5px 10px',
                borderRadius: '20px',
                fontSize: '12px',
                fontWeight: 600,
                color: '#0369a1',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              <Droplets size={13} />
              <span className="hidden sm:inline">
                {todayWaterMl > 0 ? `${todayWaterMl} ml` : 'Hydrate'}
              </span>
            </button>

            {/* Contact Modal Trigger */}
            {onOpenContact && (
              <button
                type="button"
                onClick={onOpenContact}
                title="Open Contact Form"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                  background: '#ffffff',
                  border: '1px solid var(--line)',
                  padding: '5px 10px',
                  borderRadius: '20px',
                  fontSize: '12px',
                  fontWeight: 600,
                  color: 'var(--ink)',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                <Mail size={13} color="var(--green)" />
                <span className="hidden sm:inline">Contact</span>
              </button>
            )}

            {/* Legal Link */}
            {onOpenLegal && (
              <button
                type="button"
                onClick={() => onOpenLegal('privacy')}
                title="Privacy Policy, Cookies & Legal Terms"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                  background: '#ffffff',
                  border: '1px solid var(--line)',
                  padding: '5px 8px',
                  borderRadius: '20px',
                  fontSize: '12px',
                  fontWeight: 500,
                  color: 'var(--muted)',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                <ShieldCheck size={13} color="var(--green)" />
                <span className="hidden sm:inline">Legal</span>
              </button>
            )}

            {/* AUTHENTICATION SYSTEM CONTROLS */}
            {currentUser ? (
              /* Signed in pill with profile menu */
              <div style={{ position: 'relative' }}>
                <button
                  type="button"
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    background: '#edf2e7',
                    padding: '5px 12px',
                    borderRadius: '20px',
                    border: '1px solid #d5e0cb',
                    cursor: 'pointer',
                  }}
                >
                  <span
                    style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      background: '#3a7d44',
                      boxShadow: '0 0 0 3px rgba(58, 125, 68, 0.2)',
                      display: 'inline-block',
                    }}
                  />
                  <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--green)' }}>
                    {currentUser.name}
                  </span>
                </button>

                {/* Dropdown Menu */}
                <AnimatePresence>
                  {showUserMenu && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: 6 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: 6 }}
                      style={{
                        position: 'absolute',
                        right: 0,
                        top: '115%',
                        zIndex: 100,
                        background: '#ffffff',
                        borderRadius: '12px',
                        border: '1px solid var(--line)',
                        boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)',
                        padding: '8px',
                        minWidth: '220px',
                      }}
                    >
                      <div style={{ padding: '8px 12px', borderBottom: '1px solid var(--line)' }}>
                        <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--ink)' }}>
                          {currentUser.name}
                        </div>
                        <div style={{ fontSize: '11px', color: 'var(--muted)', wordBreak: 'break-all' }}>
                          {currentUser.email}
                        </div>
                      </div>

                      <div style={{ padding: '6px 0' }}>
                        <button
                          type="button"
                          onClick={() => {
                            setShowUserMenu(false);
                            onOpenAuth?.('signin');
                          }}
                          style={{
                            width: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '8px 12px',
                            borderRadius: '6px',
                            background: 'transparent',
                            border: 0,
                            fontSize: '12px',
                            color: 'var(--ink)',
                            textAlign: 'left',
                            cursor: 'pointer',
                          }}
                        >
                          <User size={14} color="var(--green)" />
                          <span>View Profile & Settings</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setShowUserMenu(false);
                            onTabChange('water');
                          }}
                          style={{
                            width: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '8px 12px',
                            borderRadius: '6px',
                            background: 'transparent',
                            border: 0,
                            fontSize: '12px',
                            color: 'var(--ink)',
                            textAlign: 'left',
                            cursor: 'pointer',
                          }}
                        >
                          <Droplets size={14} color="#0284c7" />
                          <span>Hydration Log ({todayWaterMl} ml)</span>
                        </button>
                      </div>

                      <div style={{ borderTop: '1px solid var(--line)', paddingTop: '4px' }}>
                        <button
                          type="button"
                          onClick={() => {
                            setShowUserMenu(false);
                            onSignOut?.();
                          }}
                          style={{
                            width: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '8px 12px',
                            borderRadius: '6px',
                            background: 'transparent',
                            border: 0,
                            fontSize: '12px',
                            color: '#b91c1c',
                            textAlign: 'left',
                            cursor: 'pointer',
                          }}
                        >
                          <LogOut size={14} />
                          <span>Sign Out</span>
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              /* Signed out: Sign In & Sign Up buttons */
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <button
                  id="header-btn-signin"
                  type="button"
                  onClick={() => onOpenAuth?.('signin')}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    background: '#ffffff',
                    border: '1px solid var(--line)',
                    padding: '5px 12px',
                    borderRadius: '20px',
                    fontSize: '12px',
                    fontWeight: 600,
                    color: 'var(--ink)',
                    cursor: 'pointer',
                  }}
                >
                  <LogIn size={13} color="var(--green)" />
                  <span>Sign In</span>
                </button>

                <button
                  id="header-btn-signup"
                  type="button"
                  onClick={() => onOpenAuth?.('signup')}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    background: 'var(--green)',
                    border: 0,
                    padding: '5px 12px',
                    borderRadius: '20px',
                    fontSize: '12px',
                    fontWeight: 600,
                    color: '#ffffff',
                    cursor: 'pointer',
                  }}
                >
                  <UserPlus size={13} />
                  <span>Sign Up</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>
    </>
  );
};


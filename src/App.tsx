/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { Calculator } from './components/Calculator';
import { FoodTracker } from './components/FoodTracker';
import { WaterTracker } from './components/WaterTracker';
import { TrainingSplits } from './components/TrainingSplits';
import { GLP1RetaSection } from './components/GLP1RetaSection';
import { ResearchLibrary } from './components/ResearchLibrary';
import { ScienceSection } from './components/ScienceSection';
import { HealthNotice } from './components/HealthNotice';
import { Footer } from './components/Footer';
import { LegalModal, LegalTab } from './components/LegalModal';
import { ContactModal } from './components/ContactModal';
import { CookieBanner } from './components/CookieBanner';
import { AuthModal } from './components/AuthModal';
import { UserProfile, CalculateResult, GLP1Compound, AuthUser, AuthState } from './types';

export default function App() {
  const [activeTab, setActiveTab] = useState<'calculator' | 'tracker' | 'water' | 'training' | 'glp1' | 'science'>('calculator');

  // Legal & Contact modal controls
  const [isLegalModalOpen, setIsLegalModalOpen] = useState(false);
  const [legalModalTab, setLegalModalTab] = useState<LegalTab>('privacy');
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);

  // Authentication State
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'signin' | 'signup'>('signin');
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [authToken, setAuthToken] = useState<string | null>(() => localStorage.getItem('form_auth_token'));

  // Water Tracking Shared State
  const [todayWaterMl, setTodayWaterMl] = useState<number>(() => {
    const saved = localStorage.getItem('form_water_today_ml');
    return saved ? Number(saved) : 0;
  });
  const [waterGoalMl, setWaterGoalMl] = useState<number>(3200);

  // Check and restore active user session
  useEffect(() => {
    const checkAuthSession = async () => {
      const storedToken = localStorage.getItem('form_auth_token');
      if (!storedToken) {
        // Default to signed out state so guests see "Sign In" and "Sign Up"
        setCurrentUser(null);
        return;
      }

      try {
        const res = await fetch('/api/auth/me', {
          headers: { Authorization: `Bearer ${storedToken}` },
        });
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.user) {
            setCurrentUser(data.user);
            setAuthToken(storedToken);
            if (data.user.settings?.dailyWaterTargetMl) {
              setWaterGoalMl(data.user.settings.dailyWaterTargetMl);
            }
          } else {
            setCurrentUser(null);
          }
        } else {
          setCurrentUser(null);
        }
      } catch (err) {
        console.warn('Session verification fallback to signed out state');
        setCurrentUser(null);
      }
    };

    checkAuthSession();
  }, []);

  // Fetch today's water summary on load
  const refreshWaterStatus = async () => {
    try {
      const headers: Record<string, string> = {};
      if (authToken) headers['Authorization'] = `Bearer ${authToken}`;
      const res = await fetch('/api/water/today', { headers });
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setTodayWaterMl(data.totalMl || 0);
          localStorage.setItem('form_water_today_ml', String(data.totalMl || 0));
          if (data.targetMl) {
            setWaterGoalMl(data.targetMl);
          }
        }
      }
    } catch (e) {
      console.warn('Could not refresh water from server');
    }
  };

  useEffect(() => {
    refreshWaterStatus();
  }, [authToken]);

  const handleOpenLegal = (tab: LegalTab = 'privacy') => {
    setLegalModalTab(tab);
    setIsLegalModalOpen(true);
  };

  const handleOpenContact = () => {
    setIsContactModalOpen(true);
  };

  const handleOpenAuth = (mode: 'signin' | 'signup' = 'signin') => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  };

  const handleAuthSuccess = (state: AuthState) => {
    setCurrentUser(state.user);
    setAuthToken(state.token);
    if (state.token) {
      localStorage.setItem('form_auth_token', state.token);
    }
    refreshWaterStatus();
  };

  const handleSignOut = async () => {
    try {
      if (authToken) {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: { Authorization: `Bearer ${authToken}` },
        });
      }
    } catch (e) {}
    localStorage.removeItem('form_auth_token');
    setCurrentUser(null);
    setAuthToken(null);
  };

  // GDPR Art. 17 / CCPA Right to Erasure - Wipe all user data, logs, and sessions permanently
  const handleDeleteAccount = async () => {
    if (!authToken) {
      throw new Error("No active session found to delete.");
    }

    try {
      const res = await fetch('/api/auth/account', {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${authToken}` },
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to delete account.');
      }

      // Erase local client storage and cache
      localStorage.removeItem('form_auth_token');
      localStorage.removeItem('form_auth_user');
      localStorage.removeItem('form_water_today_ml');
      localStorage.removeItem('form_food_logs');

      setCurrentUser(null);
      setAuthToken(null);
      setTodayWaterMl(0);

      // Re-query water status clean
      refreshWaterStatus();
      return true;
    } catch (err: any) {
      console.error('Account deletion error:', err);
      throw err;
    }
  };

  // Quick 1-tap hydro logging from header / food tracker
  const handleQuickLogWater = async (amountMl: number) => {
    const newTotal = todayWaterMl + amountMl;
    setTodayWaterMl(newTotal);
    localStorage.setItem('form_water_today_ml', String(newTotal));

    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (authToken) headers['Authorization'] = `Bearer ${authToken}`;
      await fetch('/api/water/log', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          amountMl,
          containerType: amountMl >= 500 ? 'bottle' : 'glass',
        }),
      });
      refreshWaterStatus();
    } catch (e) {
      console.warn('Network sync failed for water log');
    }
  };

  // Initialized with Ali's profile metrics
  const [userProfile, setUserProfile] = useState<UserProfile>({
    name: 'Ali',
    age: 28,
    height: 170,
    weight: 70,
    sex: 'male',
    activity: 'moderate',
    units: 'metric',
    goal: 'maintain',
    compound: 'retatrutide',
  });

  const [calcResult, setCalcResult] = useState<CalculateResult | null>(null);

  const handleUpdateCompound = (compound: GLP1Compound) => {
    setUserProfile((prev) => ({ ...prev, compound }));
  };

  return (
    <>
      <div id="website-app-root" style={{ position: 'relative', background: 'var(--paper)', minHeight: '100vh' }}>
        <Header
          activeTab={activeTab}
          onTabChange={setActiveTab}
          isGLP1User={userProfile.compound !== 'none'}
          onOpenContact={handleOpenContact}
          onOpenLegal={handleOpenLegal}
          currentUser={currentUser}
          onOpenAuth={handleOpenAuth}
          onSignOut={handleSignOut}
          todayWaterMl={todayWaterMl}
          waterGoalMl={waterGoalMl}
        />

        <main id="main-content">
          <AnimatePresence mode="wait">
            {activeTab === 'calculator' && (
              <motion.div
                key="tab-calculator"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.22, ease: 'easeOut' }}
              >
                <Hero />
                <Calculator
                  userProfile={userProfile}
                  onProfileChange={setUserProfile}
                  onCalculateComplete={setCalcResult}
                  onNavigateToTracker={() => setActiveTab('tracker')}
                  onNavigateToTraining={() => setActiveTab('training')}
                  onNavigateToGLP1={() => setActiveTab('glp1')}
                />
                <ScienceSection />
                <HealthNotice />
              </motion.div>
            )}

            {activeTab === 'tracker' && (
              <motion.div
                key="tab-tracker"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.22, ease: 'easeOut' }}
              >
                <FoodTracker
                  userProfile={userProfile}
                  calcResult={calcResult}
                  onNavigateToCalculator={() => setActiveTab('calculator')}
                  onNavigateToGLP1={() => setActiveTab('glp1')}
                  onNavigateToWater={() => setActiveTab('water')}
                  todayWaterMl={todayWaterMl}
                  waterGoalMl={waterGoalMl}
                  onQuickLogWater={handleQuickLogWater}
                />
                <HealthNotice />
              </motion.div>
            )}

            {activeTab === 'water' && (
              <motion.div
                key="tab-water"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.22, ease: 'easeOut' }}
              >
                <WaterTracker
                  userProfile={userProfile}
                  authToken={authToken}
                  onNavigateToCalculator={() => setActiveTab('calculator')}
                  onNavigateToGLP1={() => setActiveTab('glp1')}
                  onNavigateToFoodTracker={() => setActiveTab('tracker')}
                />
                <HealthNotice />
              </motion.div>
            )}

            {activeTab === 'training' && (
              <motion.div
                key="tab-training"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.22, ease: 'easeOut' }}
              >
                <TrainingSplits
                  userProfile={userProfile}
                  onNavigateToGLP1={() => setActiveTab('glp1')}
                />
                <HealthNotice />
              </motion.div>
            )}

            {activeTab === 'glp1' && (
              <motion.div
                key="tab-glp1"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.22, ease: 'easeOut' }}
              >
                <GLP1RetaSection
                  userProfile={userProfile}
                  onUpdateCompound={handleUpdateCompound}
                  onNavigateToTracker={() => setActiveTab('tracker')}
                  onNavigateToTraining={() => setActiveTab('training')}
                />
                <HealthNotice />
              </motion.div>
            )}

            {activeTab === 'science' && (
              <motion.div
                key="tab-science"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.22, ease: 'easeOut' }}
              >
                <ResearchLibrary />
                <ScienceSection />
                <HealthNotice />
              </motion.div>
            )}
          </AnimatePresence>
        </main>

        <Footer
          onOpenLegal={handleOpenLegal}
          onOpenContact={handleOpenContact}
          onOpenAuth={handleOpenAuth}
          onNavigateToWater={() => setActiveTab('water')}
        />
      </div>

      {/* Floating GDPR / ePrivacy Cookie & Storage Consent Banner */}
      <CookieBanner onOpenLegal={handleOpenLegal} />

      {/* Legal & Governance Suite (Privacy, Terms, Medical Disclaimer, Cookies) */}
      <LegalModal
        isOpen={isLegalModalOpen}
        initialTab={legalModalTab}
        onClose={() => setIsLegalModalOpen(false)}
        onOpenContact={handleOpenContact}
      />

      {/* Direct Contact Modal Dispatched to Ali (aliyasser0222@gmail.com) */}
      <ContactModal
        isOpen={isContactModalOpen}
        onClose={() => setIsContactModalOpen(false)}
        onOpenPrivacy={() => handleOpenLegal('privacy')}
      />

      {/* Sign In & Sign Up System Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        initialMode={authModalMode}
        onClose={() => setIsAuthModalOpen(false)}
        onAuthSuccess={handleAuthSuccess}
        currentUser={currentUser}
        onSignOut={handleSignOut}
        onDeleteAccount={handleDeleteAccount}
        onOpenPrivacy={() => handleOpenLegal('privacy')}
        currentProfile={userProfile}
      />
    </>
  );
}

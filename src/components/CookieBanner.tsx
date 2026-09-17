import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Cookie, ShieldCheck, X } from 'lucide-react';

interface CookieBannerProps {
  onOpenLegal: (tab?: 'privacy' | 'terms' | 'disclaimer' | 'cookies') => void;
}

export const CookieBanner: React.FC<CookieBannerProps> = ({ onOpenLegal }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    try {
      const consent = localStorage.getItem('form_cookie_consent_v1');
      if (!consent) {
        // Small delay for natural UI entrance
        const timer = setTimeout(() => {
          setIsVisible(true);
        }, 800);
        return () => clearTimeout(timer);
      }
    } catch {
      // Fallback
    }
  }, []);

  const handleAcceptAll = () => {
    try {
      localStorage.setItem(
        'form_cookie_consent_v1',
        JSON.stringify({ accepted: true, level: 'all', timestamp: new Date().toISOString() })
      );
    } catch (e) {
      console.error(e);
    }
    setIsVisible(false);
  };

  const handleAcceptEssential = () => {
    try {
      localStorage.setItem(
        'form_cookie_consent_v1',
        JSON.stringify({ accepted: true, level: 'essential', timestamp: new Date().toISOString() })
      );
    } catch (e) {
      console.error(e);
    }
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 80, opacity: 0 }}
        transition={{ duration: 0.28, ease: 'easeOut' }}
        style={{
          position: 'fixed',
          bottom: '20px',
          left: '20px',
          right: '20px',
          maxWidth: '820px',
          margin: '0 auto',
          zIndex: 8000,
          background: '#ffffff',
          border: '1px solid var(--line)',
          borderRadius: '14px',
          padding: '16px 20px',
          boxShadow: '0 20px 35px -10px rgba(25, 60, 50, 0.22), 0 0 0 1px rgba(0,0,0,0.03)',
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
          flexWrap: 'wrap',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px', flex: '1 1 340px' }}>
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              background: '#edf4e9',
              display: 'grid',
              placeItems: 'center',
              color: 'var(--green)',
              flexShrink: 0,
            }}
          >
            <Cookie size={18} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <strong style={{ fontSize: '13px', color: 'var(--ink)' }}>
                Privacy, Cookies & Storage Transparency
              </strong>
              <span
                style={{
                  fontSize: '9px',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  background: '#f2f6ee',
                  color: 'var(--green)',
                  padding: '1px 6px',
                  borderRadius: '4px',
                  border: '1px solid #d3e2cd',
                }}
              >
                GDPR / CCPA
              </span>
            </div>
            <p style={{ margin: '4px 0 0', fontSize: '12px', color: 'var(--muted)', lineHeight: 1.5 }}>
              We use strictly necessary browser storage to remember your macronutrient targets and meal logs on this device.
              We never sell your data or use cross-site marketing trackers.{' '}
              <button
                type="button"
                onClick={() => onOpenLegal('cookies')}
                style={{
                  background: 'none',
                  border: 'none',
                  padding: 0,
                  fontSize: '12px',
                  color: 'var(--green)',
                  textDecoration: 'underline',
                  cursor: 'pointer',
                  fontWeight: 600,
                }}
              >
                Manage preferences & view policy
              </button>
              .
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
          <button
            type="button"
            onClick={handleAcceptEssential}
            style={{
              background: 'transparent',
              border: '1px solid var(--line)',
              borderRadius: '8px',
              padding: '8px 14px',
              fontSize: '12px',
              fontWeight: 500,
              color: 'var(--ink)',
              cursor: 'pointer',
              transition: 'background 0.15s ease',
            }}
          >
            Essential Only
          </button>

          <button
            type="button"
            onClick={handleAcceptAll}
            style={{
              background: 'var(--green)',
              border: 'none',
              borderRadius: '8px',
              padding: '8px 18px',
              fontSize: '12px',
              fontWeight: 600,
              color: '#ffffff',
              cursor: 'pointer',
              transition: 'opacity 0.15s ease',
            }}
          >
            Accept All
          </button>

          <button
            type="button"
            onClick={handleAcceptEssential}
            title="Dismiss notice"
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--muted)',
              cursor: 'pointer',
              padding: '4px',
              display: 'grid',
              placeItems: 'center',
            }}
          >
            <X size={16} />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

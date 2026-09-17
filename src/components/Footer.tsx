import React from 'react';
import { ShieldCheck, Mail, Lock, FileText, ShieldAlert, Cookie, ExternalLink } from 'lucide-react';
import { LegalTab } from './LegalModal';

interface FooterProps {
  onOpenLegal?: (tab?: LegalTab) => void;
  onOpenContact?: () => void;
  onOpenAuth?: (mode?: 'signin' | 'signup') => void;
  onNavigateToWater?: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  onOpenLegal,
  onOpenContact,
  onOpenAuth,
  onNavigateToWater,
}) => {
  return (
    <footer
      style={{
        borderTop: '1px solid var(--line)',
        background: '#f2f0e8',
        marginTop: '60px',
        padding: '50px 0 36px',
        color: 'var(--ink)',
      }}
    >
      <div className="shell" style={{ display: 'flex', flexDirection: 'column', gap: '36px' }}>
        {/* Top 3-column navigation grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '36px',
            alignItems: 'start',
          }}
        >
          {/* Column 1: Brand & Philosophy */}
          <div>
            <a className="brand" href="./" style={{ textDecoration: 'none' }}>
              form<span className="brand-period">.</span>
            </a>
            <p style={{ color: 'var(--muted)', fontSize: '13px', lineHeight: 1.6, margin: '12px 0 16px', maxWidth: '320px' }}>
              A more considered, clinically referenced approach to everyday wellbeing, macronutrient balancing, and metabolic longevity.
            </p>

            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                background: '#ffffff',
                border: '1px solid var(--line)',
                padding: '6px 12px',
                borderRadius: '20px',
                fontSize: '11.5px',
                color: 'var(--ink)',
              }}
            >
              <ShieldCheck size={14} color="var(--green)" />
              <span>Verified Safe Harbor · GDPR / CCPA Ready</span>
            </div>

            <div style={{ marginTop: '16px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {onOpenAuth && (
                <button
                  type="button"
                  onClick={() => onOpenAuth('signin')}
                  style={{
                    background: '#ffffff',
                    border: '1px solid var(--line)',
                    padding: '5px 10px',
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontWeight: 600,
                    color: 'var(--green)',
                    cursor: 'pointer',
                  }}
                >
                  Account / Sign In →
                </button>
              )}
              {onNavigateToWater && (
                <button
                  type="button"
                  onClick={onNavigateToWater}
                  style={{
                    background: '#ffffff',
                    border: '1px solid var(--line)',
                    padding: '5px 10px',
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontWeight: 600,
                    color: '#0284c7',
                    cursor: 'pointer',
                  }}
                >
                  💧 Water Tracker
                </button>
              )}
            </div>
          </div>

          {/* Column 2: Legal & Governance */}
          <div>
            <h4
              style={{
                fontFamily: 'var(--sans)',
                fontSize: '11px',
                textTransform: 'uppercase',
                letterSpacing: '1.2px',
                color: 'var(--muted)',
                marginBottom: '14px',
                fontWeight: 700,
              }}
            >
              Legal & Compliance
            </h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <li>
                <button
                  type="button"
                  onClick={() => onOpenLegal?.('disclaimer')}
                  style={{
                    background: 'none',
                    border: 'none',
                    padding: 0,
                    fontSize: '13px',
                    color: 'var(--ink)',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '7px',
                  }}
                >
                  <ShieldAlert size={14} color="var(--orange)" />
                  <span>Medical & Safety Disclaimer</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onOpenLegal?.('privacy')}
                  style={{
                    background: 'none',
                    border: 'none',
                    padding: 0,
                    fontSize: '13px',
                    color: 'var(--ink)',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '7px',
                  }}
                >
                  <Lock size={14} color="var(--green)" />
                  <span>Privacy Policy (GDPR / CCPA)</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onOpenLegal?.('terms')}
                  style={{
                    background: 'none',
                    border: 'none',
                    padding: 0,
                    fontSize: '13px',
                    color: 'var(--ink)',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '7px',
                  }}
                >
                  <FileText size={14} color="var(--green)" />
                  <span>Terms of Service & Liability Shield</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onOpenLegal?.('cookies')}
                  style={{
                    background: 'none',
                    border: 'none',
                    padding: 0,
                    fontSize: '13px',
                    color: 'var(--ink)',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '7px',
                  }}
                >
                  <Cookie size={14} color="var(--green)" />
                  <span>Cookies & Local Storage Rights</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Column 3: Contact & Direct Inquiries */}
          <div>
            <h4
              style={{
                fontFamily: 'var(--sans)',
                fontSize: '11px',
                textTransform: 'uppercase',
                letterSpacing: '1.2px',
                color: 'var(--muted)',
                marginBottom: '14px',
                fontWeight: 700,
              }}
            >
              Direct Communications
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button
                type="button"
                onClick={onOpenContact}
                style={{
                  background: 'var(--green)',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '9px 16px',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  width: 'fit-content',
                  transition: 'opacity 0.15s ease',
                }}
              >
                <Mail size={15} />
                <span>Contact Form</span>
              </button>

              <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '4px' }}>
                Client care & inquiries:
                <br />
                <button
                  type="button"
                  onClick={onOpenContact}
                  style={{
                    background: 'none',
                    border: 'none',
                    padding: 0,
                    color: 'var(--green)',
                    fontWeight: 600,
                    textDecoration: 'underline',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    marginTop: '2px',
                    cursor: 'pointer',
                    fontSize: '12px',
                  }}
                >
                  <span>Open Contact Form</span>
                  <ExternalLink size={12} />
                </button>
              </div>

              <div style={{ fontSize: '11px', color: 'var(--muted)', lineHeight: 1.4, marginTop: '2px' }}>
                Inquiries are securely routed directly to our support team.
              </div>
            </div>
          </div>
        </div>

        {/* Robust Health, Safety & Liability Safe-Harbor Statement */}
        <div
          style={{
            background: '#e9e7dc',
            border: '1px solid var(--line)',
            borderRadius: '12px',
            padding: '16px 20px',
            display: 'flex',
            gap: '14px',
            alignItems: 'flex-start',
          }}
        >
          <ShieldAlert size={20} color="var(--orange)" style={{ flexShrink: 0, marginTop: '2px' }} />
          <div style={{ fontSize: '11.5px', lineHeight: 1.6, color: '#4d574d' }}>
            <strong style={{ color: 'var(--ink)' }}>LEGAL, MEDICAL & RESEARCH DISCLAIMER:</strong> All calculations
            (including BMR, TDEE, macronutrient distribution targets, and caloric deficits), exercise templates, and
            educational resources concerning GLP-1, GIP, and Glucagon receptor agonist peptides (such as retatrutide,
            tirzepatide, and semaglutide) are published strictly for educational, informational, and personal tracking
            purposes. <strong>They do NOT constitute medical advice, clinical diagnosis, or medical prescription.</strong>{' '}
            Neither form. nor its operators provide medical services or prescribe pharmaceuticals. Peptides and
            prescription therapies must only be administered under the direct prescription, supervision, and ongoing
            laboratory care of a licensed, board-certified physician. Never disregard professional medical advice or delay
            seeking it because of something you read on this website. In a medical emergency, call 911 or your local
            emergency services immediately.
          </div>
        </div>

        {/* Bottom copyright line */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '12px',
            fontSize: '11.5px',
            color: 'var(--muted)',
            borderTop: '1px solid var(--line)',
            paddingTop: '20px',
          }}
        >
          <div>
            © {new Date().getFullYear()} <strong>form.</strong> All rights reserved. Precision Nutrition & Metabolic Protocol Platform.
          </div>

          <div style={{ display: 'flex', gap: '16px' }}>
            <button
              type="button"
              onClick={() => onOpenLegal?.('privacy')}
              style={{ background: 'none', border: 'none', padding: 0, fontSize: '11.5px', color: 'var(--muted)', cursor: 'pointer', textDecoration: 'underline' }}
            >
              Privacy Policy
            </button>
            <button
              type="button"
              onClick={() => onOpenLegal?.('terms')}
              style={{ background: 'none', border: 'none', padding: 0, fontSize: '11.5px', color: 'var(--muted)', cursor: 'pointer', textDecoration: 'underline' }}
            >
              Terms of Service
            </button>
            <button
              type="button"
              onClick={() => onOpenLegal?.('disclaimer')}
              style={{ background: 'none', border: 'none', padding: 0, fontSize: '11.5px', color: 'var(--muted)', cursor: 'pointer', textDecoration: 'underline' }}
            >
              Medical Disclaimer
            </button>
            <button
              type="button"
              onClick={() => onOpenLegal?.('cookies')}
              style={{ background: 'none', border: 'none', padding: 0, fontSize: '11.5px', color: 'var(--muted)', cursor: 'pointer', textDecoration: 'underline' }}
            >
              Cookies
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};

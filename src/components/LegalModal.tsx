import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ShieldAlert,
  FileText,
  Lock,
  Cookie,
  X,
  Printer,
  Trash2,
  Mail,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
} from 'lucide-react';

export type LegalTab = 'privacy' | 'terms' | 'disclaimer' | 'cookies';

interface LegalModalProps {
  isOpen: boolean;
  initialTab?: LegalTab;
  onClose: () => void;
  onOpenContact?: () => void;
}

export const LegalModal: React.FC<LegalModalProps> = ({
  isOpen,
  initialTab = 'privacy',
  onClose,
  onOpenContact,
}) => {
  const [activeTab, setActiveTab] = useState<LegalTab>(initialTab);
  const [dataCleared, setDataCleared] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
      setDataCleared(false);
      // Lock body scroll
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen, initialTab]);

  // Handle ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const handleClearAllData = () => {
    if (window.confirm('Are you sure you want to erase all locally saved meal logs, body metrics, and profile data from your browser?')) {
      try {
        localStorage.removeItem('form_user_profile');
        localStorage.removeItem('form_daily_logs');
        localStorage.removeItem('form_saved_meals');
        setDataCleared(true);
        setTimeout(() => {
          window.location.reload();
        }, 1200);
      } catch (err) {
        console.error('Failed to clear storage:', err);
      }
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '16px',
          background: 'rgba(25, 60, 50, 0.65)',
          backdropFilter: 'blur(6px)',
        }}
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 12 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          onClick={e => e.stopPropagation()}
          style={{
            background: '#ffffff',
            borderRadius: '16px',
            border: '1px solid var(--line)',
            width: '100%',
            maxWidth: '860px',
            maxHeight: '90vh',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0 25px 50px -12px rgba(25, 60, 50, 0.35)',
            overflow: 'hidden',
          }}
        >
          {/* Header */}
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
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span
                  style={{
                    fontSize: '10px',
                    letterSpacing: '1.2px',
                    textTransform: 'uppercase',
                    color: 'var(--orange)',
                    fontWeight: 700,
                  }}
                >
                  Legal Compliance & Governance
                </span>
                <span
                  style={{
                    fontSize: '10px',
                    padding: '2px 8px',
                    borderRadius: '10px',
                    background: '#e2ecd9',
                    color: 'var(--green)',
                    fontWeight: 600,
                  }}
                >
                  GDPR & CCPA Aligned
                </span>
              </div>
              <h2
                style={{
                  fontFamily: 'var(--serif)',
                  fontSize: '22px',
                  color: 'var(--ink)',
                  margin: '4px 0 0',
                  fontWeight: 600,
                }}
              >
                Policies, Terms & Disclaimers
              </h2>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                type="button"
                onClick={handlePrint}
                title="Print current policy"
                style={{
                  background: '#ffffff',
                  border: '1px solid var(--line)',
                  borderRadius: '8px',
                  padding: '7px 10px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '12px',
                  color: 'var(--muted)',
                  cursor: 'pointer',
                }}
              >
                <Printer size={14} />
                <span className="hidden sm:inline">Print</span>
              </button>

              <button
                type="button"
                onClick={onClose}
                title="Close dialog"
                style={{
                  background: '#ffffff',
                  border: '1px solid var(--line)',
                  borderRadius: '50%',
                  width: '34px',
                  height: '34px',
                  display: 'grid',
                  placeItems: 'center',
                  color: 'var(--ink)',
                  cursor: 'pointer',
                }}
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Tab Navigation */}
          <div
            style={{
              display: 'flex',
              borderBottom: '1px solid var(--line)',
              background: '#faf9f5',
              overflowX: 'auto',
              padding: '0 16px',
            }}
          >
            {[
              { id: 'disclaimer', label: 'Medical & Safety Disclaimer', icon: ShieldAlert },
              { id: 'privacy', label: 'Privacy Policy (GDPR / CCPA)', icon: Lock },
              { id: 'terms', label: 'Terms of Service', icon: FileText },
              { id: 'cookies', label: 'Cookies & Storage Rights', icon: Cookie },
            ].map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id as LegalTab)}
                  style={{
                    padding: '14px 16px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    border: 'none',
                    background: 'transparent',
                    borderBottom: isActive ? '2px solid var(--green)' : '2px solid transparent',
                    color: isActive ? 'var(--green)' : 'var(--muted)',
                    fontWeight: isActive ? 600 : 400,
                    fontSize: '13px',
                    whiteSpace: 'nowrap',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <Icon size={15} color={isActive ? 'var(--green)' : 'var(--muted)'} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Body Content */}
          <div
            style={{
              padding: '24px 28px',
              overflowY: 'auto',
              flex: 1,
              fontSize: '13.5px',
              lineHeight: 1.7,
              color: '#34453e',
            }}
          >
            {/* 1. MEDICAL & SAFETY DISCLAIMER */}
            {activeTab === 'disclaimer' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                <div
                  style={{
                    background: '#fff8f2',
                    border: '1px solid #ffd8bf',
                    borderRadius: '10px',
                    padding: '16px',
                    display: 'flex',
                    gap: '12px',
                    alignItems: 'flex-start',
                  }}
                >
                  <AlertTriangle size={22} color="var(--orange)" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <div>
                    <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: 'var(--orange)' }}>
                      CRITICAL HEALTH & MEDICAL NOTICE
                    </h4>
                    <p style={{ margin: '4px 0 0', fontSize: '12.5px', color: '#7a3e21' }}>
                      This website, its algorithms, nutrition estimations, training splits, and GLP-1 peptide educational resources DO NOT provide medical advice, diagnosis, or clinical treatment.
                    </p>
                  </div>
                </div>

                <section>
                  <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--ink)', marginBottom: '6px' }}>
                    1. Informational & Educational Purposes Only
                  </h3>
                  <p>
                    All content accessible on <strong>form.</strong> (including Total Daily Energy Expenditure calculators, macronutrient distribution ratios, dietary guidelines, and compound pharmacokinetics) is presented exclusively for informational, educational, and personal tracking use. No material on this website is intended to be a substitute for professional medical advice, clinical diagnosis, or medical prescription.
                  </p>
                </section>

                <section>
                  <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--ink)', marginBottom: '6px' }}>
                    2. No Doctor-Patient or Dietitian-Patient Relationship
                  </h3>
                  <p>
                    Your use of this service, submission of metrics, generation of calculations, or electronic communications with form. or platform operators does <strong>NOT</strong> create a physician-patient, dietitian-patient, coach-client, or any other fiduciary healthcare relationship.
                  </p>
                </section>

                <section>
                  <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--ink)', marginBottom: '6px' }}>
                    3. GLP-1, Tirzepatide & Retatrutide Peptide Research Advisory
                  </h3>
                  <p>
                    References, summaries, and calculator adjustments relating to Glucagon-Like Peptide-1 (GLP-1), Glucose-Dependent Insulinotropic Polypeptide (GIP), and Glucagon receptor agonists (including semaglutide, tirzepatide, and investigational triple agonist retatrutide) reflect published clinical literature (e.g., TRIUMPH and SURPASS trials) and are intended solely for academic research literacy and harm-reduction education.
                  </p>
                  <p style={{ marginTop: '8px' }}>
                    <strong>We do not sell, prescribe, compound, endorse, or distribute any pharmaceuticals or unscheduled research chemicals.</strong> Incretin mimetics and peptides are potent systemic pharmaceutical agents that may cause severe adverse reactions (including acute pancreatitis, hypoglycemia, gallbladder disease, thyroid C-cell pathology, gastrointestinal paresis, or cardiac changes). They must strictly be prescribed, initiated, and monitored by a board-certified licensed physician through legitimate licensed pharmacies.
                  </p>
                </section>

                <section>
                  <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--ink)', marginBottom: '6px' }}>
                    4. Assumption of Risk & Physical Clearance
                  </h3>
                  <p>
                    Engaging in caloric restriction, high-protein diets, or progressive resistance exercise regimens involves inherent physiological stress and risk of injury. You must consult your primary care physician or licensed medical professional before implementing any dietary protocol or physical training program generated or discussed on this platform.
                  </p>
                </section>

                <section>
                  <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--ink)', marginBottom: '6px' }}>
                    5. Emergency Medical Situations
                  </h3>
                  <p>
                    If you suspect you are experiencing an adverse pharmaceutical reaction, hypoglycemia, severe abdominal pain, chest pain, or any medical emergency, call <strong>911 (USA), 999 (UK), 112 (EU)</strong> or immediately proceed to your nearest hospital emergency facility.
                  </p>
                </section>
              </div>
            )}

            {/* 2. PRIVACY POLICY */}
            {activeTab === 'privacy' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                <div
                  style={{
                    background: '#edf4e9',
                    border: '1px solid #c7dcbe',
                    borderRadius: '10px',
                    padding: '14px 16px',
                    fontSize: '12.5px',
                    color: 'var(--green)',
                  }}
                >
                  <strong>Data Controller & Contact:</strong> form. Platform Operations. Inquiries can be submitted directly via our website Contact Form. Last updated: September 2026.
                </div>

                <section>
                  <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--ink)', marginBottom: '6px' }}>
                    1. Core Privacy Philosophy
                  </h3>
                  <p>
                    We believe your body metrics and nutritional logs belong to you. We design our architecture to process and store your personal fitness calculations directly in your browser whenever possible, minimizing server-side data retention. <strong>We never sell, rent, monetize, or broker your personal data to third-party advertisers.</strong>
                  </p>
                </section>

                <section>
                  <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--ink)', marginBottom: '6px' }}>
                    2. What Data We Collect & How We Process It
                  </h3>
                  <ul style={{ paddingLeft: '20px', margin: '6px 0', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <li>
                      <strong>Local Browser Storage (Metrics & Logs):</strong> Information you enter into the calculator (age, sex, height, weight, activity tier, compound selection, and logged foods) is saved locally in your browser’s HTML5 Local Storage. This data remains on your physical device.
                    </li>
                    <li>
                      <strong>AI Natural Language Nutrition Queries:</strong> When you use our Natural Language Meal Analyzer, your textual meal description (e.g., "2 grilled chicken breasts with quinoa") is transmitted securely via HTTPS to our backend API and processed via Google Gemini to compute macronutrient estimates. This query does not contain your name, email, or physical location.
                    </li>
                    <li>
                      <strong>Contact Inquiries:</strong> When you submit a message through our Contact Form, we collect your name, email address, inquiry topic, and message text, stored securely to allow our customer care team to respond to you.
                    </li>
                  </ul>
                </section>

                <section>
                  <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--ink)', marginBottom: '6px' }}>
                    3. Legal Grounds for Processing (GDPR Article 6)
                  </h3>
                  <p>
                    Under the European Union General Data Protection Regulation (GDPR) and UK GDPR, we process data based on:
                  </p>
                  <ul style={{ paddingLeft: '20px', margin: '6px 0', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <li><strong>Consent (Art. 6(1)(a)):</strong> You explicitly consent to meal parsing and local storage by entering data.</li>
                    <li><strong>Legitimate Interests (Art. 6(1)(f)):</strong> Processing customer support requests and maintaining platform security.</li>
                  </ul>
                </section>

                <section>
                  <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--ink)', marginBottom: '6px' }}>
                    4. Your GDPR & CCPA Rights
                  </h3>
                  <p>
                    Depending on your jurisdiction (such as the EU, UK, or California under CCPA/CPRA), you possess the following enforceable rights:
                  </p>
                  <ul style={{ paddingLeft: '20px', margin: '6px 0', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <li><strong>Right to Erasure / Deletion:</strong> You can delete all locally saved metrics at any time using the "Clear All Data" button below. To delete contact form records, submit a request via our Contact Form.</li>
                    <li><strong>Right to Access & Portability:</strong> You may request a copy of any personal data we hold about you.</li>
                    <li><strong>Right to Opt-Out:</strong> We do not engage in behavioral advertising tracking or selling of personal information.</li>
                  </ul>
                </section>

                <section>
                  <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--ink)', marginBottom: '6px' }}>
                    5. Children's Privacy (COPPA)
                  </h3>
                  <p>
                    This website is strictly intended for persons aged 18 and older. We do not knowingly collect personal data from children under the age of 18.
                  </p>
                </section>
              </div>
            )}

            {/* 3. TERMS OF SERVICE */}
            {activeTab === 'terms' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                <div
                  style={{
                    background: '#f9f9f9',
                    border: '1px solid var(--line)',
                    borderRadius: '10px',
                    padding: '14px 16px',
                    fontSize: '12.5px',
                    color: 'var(--ink)',
                  }}
                >
                  <strong>Binding Legal Agreement:</strong> By accessing <strong>form.</strong>, you agree to comply with and be bound by the following Terms of Service. If you do not agree, please cease using this platform immediately.
                </div>

                <section>
                  <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--ink)', marginBottom: '6px' }}>
                    1. Permitted Use & Age Requirement
                  </h3>
                  <p>
                    You certify that you are at least 18 years of age and possess the legal capacity to enter into binding agreements. The platform is provided solely for personal, non-commercial health education and fitness planning.
                  </p>
                </section>

                <section>
                  <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--ink)', marginBottom: '6px' }}>
                    2. Absolute Disclaimer of Warranties ("AS IS")
                  </h3>
                  <p>
                    THE SERVICE, INCLUDING ALL ALGORITHMS, CALCULATORS, ESTIMATIONS, ARTICLES, AND INTERFACES, IS PROVIDED ON AN <strong>"AS IS"</strong> AND <strong>"AS AVAILABLE"</strong> BASIS, WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, ACCURACY OF NUTRITIONAL DATA, OR NON-INFRINGEMENT.
                  </p>
                </section>

                <section>
                  <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--ink)', marginBottom: '6px' }}>
                    3. Limitation of Liability
                  </h3>
                  <p>
                    TO THE MAXIMUM EXTENT PERMITTED BY LAW, IN NO EVENT SHALL FORM., ITS FOUNDERS, OPERATORS, DEVELOPERS, CONTRIBUTORS, OR AFFILIATED PARTIES BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, EXEMPLARY, OR PUNITIVE DAMAGES, INCLUDING BUT NOT LIMITED TO PERSONAL INJURY, ILLNESS, METABOLIC COMPLICATIONS, LOSS OF DATA, REVENUE, OR GOODWILL, ARISING OUT OF OR IN CONNECTION WITH YOUR ACCESS TO OR USE OF (OR INABILITY TO USE) THIS WEBSITE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGES.
                  </p>
                </section>

                <section>
                  <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--ink)', marginBottom: '6px' }}>
                    4. Indemnification & Hold Harmless
                  </h3>
                  <p>
                    You agree to defend, indemnify, and hold harmless form. and its operators from and against any and all claims, liabilities, damages, losses, costs, and expenses (including reasonable legal fees) arising from or relating to: (i) your use or misuse of the platform; (ii) your violation of these Terms; or (iii) any physical harm, medical event, or dietary outcome resulting from your application of calculations or information from the site.
                  </p>
                </section>

                <section>
                  <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--ink)', marginBottom: '6px' }}>
                    5. Intellectual Property
                  </h3>
                  <p>
                    All brand elements, visual aesthetics, design layout, software code, custom CSS, and original authored content belong to form., protected under applicable intellectual property laws.
                  </p>
                </section>
              </div>
            )}

            {/* 4. COOKIE POLICY & STORAGE RIGHTS */}
            {activeTab === 'cookies' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                <div
                  style={{
                    background: '#f4f6f3',
                    border: '1px solid var(--line)',
                    borderRadius: '10px',
                    padding: '14px 16px',
                    fontSize: '12.5px',
                  }}
                >
                  <strong>ePrivacy Directive & GDPR Recital 30 Compliance:</strong> We provide full transparency on what is written to your browser storage and provide instant mechanisms to clear it.
                </div>

                <section>
                  <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--ink)', marginBottom: '8px' }}>
                    Storage Keys Utilized By This Application
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {[
                      {
                        key: 'form_user_profile',
                        category: 'Strictly Necessary',
                        purpose: 'Preserves your selected age, height, weight, sex, and activity tier so you do not have to re-enter them on every reload.',
                      },
                      {
                        key: 'form_daily_logs',
                        category: 'Strictly Necessary',
                        purpose: 'Preserves your daily logged meals, food items, and calories consumed locally on your device.',
                      },
                      {
                        key: 'form_cookie_consent_v1',
                        category: 'Functional / Compliance',
                        purpose: 'Remembers that you have reviewed and acknowledged the privacy & cookie notice.',
                      },
                    ].map(item => (
                      <div
                        key={item.key}
                        style={{
                          background: '#fff',
                          border: '1px solid var(--line)',
                          borderRadius: '8px',
                          padding: '10px 14px',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <code style={{ fontSize: '12px', color: 'var(--green)', fontWeight: 600 }}>{item.key}</code>
                          <span
                            style={{
                              fontSize: '10px',
                              fontWeight: 700,
                              background: '#e9efe4',
                              color: 'var(--green)',
                              padding: '2px 8px',
                              borderRadius: '10px',
                            }}
                          >
                            {item.category}
                          </span>
                        </div>
                        <p style={{ margin: '6px 0 0', fontSize: '12px', color: 'var(--muted)' }}>{item.purpose}</p>
                      </div>
                    ))}
                  </div>
                </section>

                <section
                  style={{
                    borderTop: '1px solid var(--line)',
                    paddingTop: '16px',
                    marginTop: '8px',
                  }}
                >
                  <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--ink)', marginBottom: '6px' }}>
                    Exercise Your Right to Erasure (Clear Stored Data)
                  </h3>
                  <p style={{ fontSize: '12.5px', color: 'var(--muted)', marginBottom: '12px' }}>
                    If you wish to remove all personal metrics, logs, and peptide records from this device immediately, you can execute a complete wipe:
                  </p>

                  <button
                    type="button"
                    onClick={handleClearAllData}
                    style={{
                      background: '#fff2ed',
                      border: '1px solid #ffd4c4',
                      color: 'var(--orange)',
                      padding: '10px 18px',
                      borderRadius: '8px',
                      fontSize: '13px',
                      fontWeight: 600,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      cursor: 'pointer',
                    }}
                  >
                    <Trash2 size={16} />
                    <span>Clear All Local Storage & Reset</span>
                  </button>

                  {dataCleared && (
                    <p style={{ color: '#2b7a4b', fontSize: '12px', fontWeight: 600, marginTop: '8px' }}>
                      ✓ All local health storage has been cleared. Reloading application...
                    </p>
                  )}
                </section>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div
            style={{
              padding: '16px 24px',
              borderTop: '1px solid var(--line)',
              background: 'var(--paper)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '12px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: 'var(--muted)' }}>
              <span>Need help or have legal inquiries?</span>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  if (onOpenContact) onOpenContact();
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--green)',
                  fontWeight: 600,
                  textDecoration: 'underline',
                  cursor: 'pointer',
                  padding: 0,
                  fontSize: '12px',
                }}
              >
                Contact our team directly
              </button>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                type="button"
                onClick={onClose}
                style={{
                  background: 'var(--green)',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '9px 20px',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'opacity 0.15s ease',
                }}
              >
                I Understand & Accept
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

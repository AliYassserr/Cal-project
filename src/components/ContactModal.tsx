import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mail, Send, CheckCircle2, AlertCircle, X, ExternalLink, ShieldCheck, User } from 'lucide-react';

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenPrivacy?: () => void;
}

export const ContactModal: React.FC<ContactModalProps> = ({ isOpen, onClose, onOpenPrivacy }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('General Inquiry');
  const [message, setMessage] = useState('');
  const [consent, setConsent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successInfo, setSuccessInfo] = useState<{ inquiryId?: string; message?: string } | null>(null);

  useEffect(() => {
    if (isOpen) {
      setErrorMsg(null);
      setSuccessInfo(null);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!name.trim() || name.trim().length < 2) {
      setErrorMsg('Please enter your full name (at least 2 characters).');
      return;
    }
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setErrorMsg('Please provide a valid email address so our team can reply to you.');
      return;
    }
    if (!message.trim() || message.trim().length < 5) {
      setErrorMsg('Please enter a message of at least 5 characters.');
      return;
    }
    if (!consent) {
      setErrorMsg('Please accept the Privacy Policy and terms acknowledgment.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          subject: subject.trim(),
          message: message.trim(),
          consent,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to dispatch message.');
      }

      setSuccessInfo({
        inquiryId: data.inquiryId,
        message: data.message,
      });
      // Reset form
      setName('');
      setEmail('');
      setMessage('');
      setConsent(false);
    } catch (err: any) {
      setErrorMsg(err.message || 'An error occurred while dispatching your message.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const mailtoLink = `mailto:aliyasser0222@gmail.com?subject=${encodeURIComponent(
    subject || 'Inquiry regarding form. platform'
  )}&body=${encodeURIComponent(
    `Hello Ali,\n\nName: ${name || 'A user'}\nEmail: ${email || 'Not specified'}\n\nMessage:\n${message}\n\n---\nSent via form. platform to aliyasser0222@gmail.com`
  )}`;

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
            maxWidth: '580px',
            maxHeight: '92vh',
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
                  Direct Communications
                </span>
                <span
                  style={{
                    fontSize: '10px',
                    padding: '2px 8px',
                    borderRadius: '10px',
                    background: '#edf2e7',
                    color: 'var(--green)',
                    fontWeight: 600,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  <Mail size={11} />
                  <span>Support Team</span>
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
                Contact Form
              </h2>
            </div>

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

          {/* Body Content */}
          <div
            style={{
              padding: '22px 24px',
              overflowY: 'auto',
              flex: 1,
              fontSize: '14px',
            }}
          >
            {successInfo ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                  padding: '24px 12px',
                  gap: '16px',
                }}
              >
                <div
                  style={{
                    width: '56px',
                    height: '56px',
                    borderRadius: '50%',
                    background: '#edf7ee',
                    border: '2px solid #a3d9ad',
                    display: 'grid',
                    placeItems: 'center',
                    color: '#2a7c40',
                  }}
                >
                  <CheckCircle2 size={32} />
                </div>

                <div>
                  <h3 style={{ fontSize: '18px', fontFamily: 'var(--serif)', color: 'var(--ink)', margin: 0 }}>
                    Message Received!
                  </h3>
                  <p style={{ color: 'var(--muted)', fontSize: '13.5px', marginTop: '8px', maxWidth: '420px' }}>
                    Thank you for reaching out. Your message has been sent directly to{' '}
                    <strong style={{ color: 'var(--ink)' }}>Ali Yasser</strong> (<code>aliyasser0222@gmail.com</code>). We will review your inquiry and reply promptly.
                  </p>
                  {successInfo.inquiryId && (
                    <div
                      style={{
                        display: 'inline-block',
                        background: 'var(--paper)',
                        border: '1px solid var(--line)',
                        padding: '4px 12px',
                        borderRadius: '6px',
                        fontSize: '11px',
                        color: 'var(--muted)',
                        marginTop: '10px',
                      }}
                    >
                      Reference ID: <code>{successInfo.inquiryId}</code>
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', gap: '10px', marginTop: '10px', flexWrap: 'wrap', justifyContent: 'center' }}>
                  <a
                    href={mailtoLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      background: 'var(--paper)',
                      border: '1px solid var(--line)',
                      padding: '10px 18px',
                      borderRadius: '8px',
                      fontSize: '13px',
                      color: 'var(--ink)',
                      textDecoration: 'none',
                      fontWeight: 600,
                    }}
                  >
                    <ExternalLink size={15} />
                    <span>Also open in Email App</span>
                  </a>

                  <button
                    type="button"
                    onClick={() => {
                      setSuccessInfo(null);
                    }}
                    style={{
                      background: 'var(--green)',
                      color: '#ffffff',
                      border: 'none',
                      padding: '10px 18px',
                      borderRadius: '8px',
                      fontSize: '13px',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    Send Another Message
                  </button>
                </div>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {/* Notice badge */}
                <div
                  style={{
                    background: '#f2f6ee',
                    border: '1px solid #d2e4cb',
                    borderRadius: '8px',
                    padding: '10px 14px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    fontSize: '12.5px',
                    color: 'var(--green)',
                  }}
                >
                  <ShieldCheck size={18} style={{ flexShrink: 0 }} />
                  <div>
                    Inquiries submitted here are delivered directly to Ali (<code>aliyasser0222@gmail.com</code>).
                  </div>
                </div>

                {errorMsg && (
                  <div
                    style={{
                      background: '#fff2f0',
                      border: '1px solid #ffccc7',
                      borderRadius: '8px',
                      padding: '10px 14px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      fontSize: '12.5px',
                      color: '#cf1322',
                    }}
                  >
                    <AlertCircle size={17} style={{ flexShrink: 0 }} />
                    <span>{errorMsg}</span>
                  </div>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label
                      htmlFor="contact-name"
                      style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '4px', color: 'var(--ink)' }}
                    >
                      Your Name *
                    </label>
                    <input
                      id="contact-name"
                      type="text"
                      required
                      placeholder="e.g. Alex Miller"
                      value={name}
                      onChange={e => setName(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '9px 12px',
                        borderRadius: '8px',
                        border: '1px solid var(--line)',
                        background: '#ffffff',
                        fontSize: '13px',
                      }}
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="contact-email"
                      style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '4px', color: 'var(--ink)' }}
                    >
                      Your Email (Reply-To) *
                    </label>
                    <input
                      id="contact-email"
                      type="email"
                      required
                      placeholder="name@domain.com"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '9px 12px',
                        borderRadius: '8px',
                        border: '1px solid var(--line)',
                        background: '#ffffff',
                        fontSize: '13px',
                      }}
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="contact-subject"
                    style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '4px', color: 'var(--ink)' }}
                  >
                    Subject / Topic
                  </label>
                  <select
                    id="contact-subject"
                    value={subject}
                    onChange={e => setSubject(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: '8px',
                      border: '1px solid var(--line)',
                      background: '#ffffff',
                      fontSize: '13px',
                      cursor: 'pointer',
                    }}
                  >
                    <option value="General Inquiry">General Inquiry / Feedback</option>
                    <option value="Nutrition & TDEE Calculation Question">Nutrition & TDEE Question</option>
                    <option value="GLP-1 & Peptide Research Protocol">GLP-1 / Peptide Research Query</option>
                    <option value="Privacy / GDPR Data Request">Privacy / GDPR Data Request</option>
                    <option value="Technical or Bug Report">Technical or Bug Report</option>
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="contact-message"
                    style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '4px', color: 'var(--ink)' }}
                  >
                    Your Message *
                  </label>
                  <textarea
                    id="contact-message"
                    required
                    rows={4}
                    placeholder="Write your question, feedback, or message here..."
                    value={message}
                    onChange={e => setMessage(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      border: '1px solid var(--line)',
                      background: '#ffffff',
                      fontSize: '13px',
                      lineHeight: 1.5,
                      resize: 'vertical',
                    }}
                  />
                </div>

                {/* Consent checkbox */}
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', marginTop: '2px' }}>
                  <input
                    id="contact-consent"
                    type="checkbox"
                    checked={consent}
                    onChange={e => setConsent(e.target.checked)}
                    style={{ marginTop: '3px', cursor: 'pointer' }}
                  />
                  <label htmlFor="contact-consent" style={{ fontSize: '11.5px', color: 'var(--muted)', lineHeight: 1.5 }}>
                    I acknowledge that communications are for informational/educational purposes only and do not constitute medical advice. I agree to the{' '}
                    <button
                      type="button"
                      onClick={onOpenPrivacy}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--green)',
                        textDecoration: 'underline',
                        padding: 0,
                        fontSize: '11.5px',
                        cursor: 'pointer',
                      }}
                    >
                      Privacy Policy & Terms
                    </button>
                    .
                  </label>
                </div>

                {/* Submit button & Mailto fallback */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginTop: '8px',
                    gap: '12px',
                    flexWrap: 'wrap',
                  }}
                >
                  <a
                    href={mailtoLink}
                    style={{
                      fontSize: '12px',
                      color: 'var(--muted)',
                      textDecoration: 'underline',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    <span>Or email directly via your mail client</span>
                    <ExternalLink size={12} />
                  </a>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    style={{
                      background: 'var(--green)',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '10px 22px',
                      fontSize: '13.5px',
                      fontWeight: 600,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      cursor: isSubmitting ? 'not-allowed' : 'pointer',
                      opacity: isSubmitting ? 0.7 : 1,
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <Send size={15} />
                    <span>{isSubmitting ? 'Sending Message...' : 'Send Message'}</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

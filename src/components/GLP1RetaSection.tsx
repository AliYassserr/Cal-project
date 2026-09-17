import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { UserProfile, GLP1Compound } from '../types';

interface GLP1RetaSectionProps {
  userProfile: UserProfile;
  onUpdateCompound: (compound: GLP1Compound) => void;
  onNavigateToTracker: () => void;
  onNavigateToTraining: () => void;
}

export const GLP1RetaSection: React.FC<GLP1RetaSectionProps> = ({
  userProfile,
  onUpdateCompound,
  onNavigateToTracker,
  onNavigateToTraining,
}) => {
  const [activeCompound, setActiveCompound] = useState<GLP1Compound>(userProfile.compound || 'retatrutide');
  const [activeSubTab, setActiveSubTab] = useState<'checklist' | 'mechanics' | 'nutrients'>('checklist');

  // Daily Habits State for Ali
  const [hydrationGlasses, setHydrationGlasses] = useState<number>(6);
  const [electrolytesTaken, setElectrolytesTaken] = useState<boolean>(true);
  const [resistanceSessionDone, setResistanceSessionDone] = useState<boolean>(true);
  const [proteinTargetHit, setProteinTargetHit] = useState<boolean>(true);

  // Suggested protein calculation
  const targetProteinGrams = Math.round(userProfile.weight * 2.0);
  const minimumProteinFloor = Math.round(userProfile.weight * 1.6);

  const handleSelectCompound = (c: GLP1Compound) => {
    setActiveCompound(c);
    onUpdateCompound(c);
  };

  const completedPillars = [
    proteinTargetHit,
    resistanceSessionDone,
    electrolytesTaken,
    hydrationGlasses >= 8,
  ].filter(Boolean).length;

  return (
    <div className="shell" style={{ paddingBlock: '32px 72px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '16px', marginBottom: '28px' }}>
        <div>
          <p className="eyebrow" style={{ color: 'var(--orange)', margin: '0 0 6px 0' }}>
            CLINICAL INCRETIN & PEPTIDE PROTOCOL
          </p>
          <h2 style={{ font: 'clamp(28px, 4vw, 36px) var(--serif)', margin: 0, color: 'var(--ink)' }}>
            GLP-1 & Retatrutide Optimization Hub
          </h2>
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <span style={{ fontSize: '12px', background: '#f5efe8', color: 'var(--orange)', padding: '5px 12px', borderRadius: '20px', fontWeight: 600, border: '1px solid #ebdad0' }}>
            Current: {activeCompound.toUpperCase()}
          </span>
        </div>
      </div>

      {/* Interactive Compound Switcher Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '12px', marginBottom: '28px' }}>
        {/* Retatrutide */}
        <motion.button
          whileHover={{ y: -2 }}
          whileTap={{ scale: 0.99 }}
          type="button"
          onClick={() => handleSelectCompound('retatrutide')}
          style={{
            border: '1px solid',
            borderColor: activeCompound === 'retatrutide' ? 'var(--orange)' : 'var(--line)',
            background: activeCompound === 'retatrutide' ? '#ffffff' : '#fbfbf8',
            padding: '16px',
            borderRadius: '14px',
            textAlign: 'left',
            cursor: 'pointer',
            boxShadow: activeCompound === 'retatrutide' ? '0 4px 16px rgba(224, 90, 43, 0.12)' : 'none',
            position: 'relative',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '10px', fontWeight: 700, color: 'var(--orange)', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
              Triple Agonist
            </span>
            {activeCompound === 'retatrutide' && (
              <span style={{ fontSize: '9px', fontWeight: 700, background: 'var(--orange)', color: '#fff', padding: '2px 6px', borderRadius: '6px' }}>
                ACTIVE
              </span>
            )}
          </div>
          <strong style={{ fontSize: '15px', display: 'block', marginBlock: '4px 2px', color: 'var(--ink)' }}>
            Retatrutide ("Reta")
          </strong>
          <small style={{ fontSize: '11px', color: 'var(--muted)', display: 'block', lineHeight: 1.4 }}>
            Phase 2 NEJM. GLP-1 + GIP + Glucagon. Elevates basal metabolism & liver lipid clearance.
          </small>
        </motion.button>

        {/* Tirzepatide */}
        <motion.button
          whileHover={{ y: -2 }}
          whileTap={{ scale: 0.99 }}
          type="button"
          onClick={() => handleSelectCompound('tirzepatide')}
          style={{
            border: '1px solid',
            borderColor: activeCompound === 'tirzepatide' ? 'var(--green)' : 'var(--line)',
            background: activeCompound === 'tirzepatide' ? '#ffffff' : '#fbfbf8',
            padding: '16px',
            borderRadius: '14px',
            textAlign: 'left',
            cursor: 'pointer',
            boxShadow: activeCompound === 'tirzepatide' ? '0 4px 16px rgba(32, 59, 50, 0.12)' : 'none',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '10px', fontWeight: 700, color: 'var(--green)', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
              Dual Incretin
            </span>
            {activeCompound === 'tirzepatide' && (
              <span style={{ fontSize: '9px', fontWeight: 700, background: 'var(--green)', color: '#fff', padding: '2px 6px', borderRadius: '6px' }}>
                ACTIVE
              </span>
            )}
          </div>
          <strong style={{ fontSize: '15px', display: 'block', marginBlock: '4px 2px', color: 'var(--ink)' }}>
            Tirzepatide
          </strong>
          <small style={{ fontSize: '11px', color: 'var(--muted)', display: 'block', lineHeight: 1.4 }}>
            SURPASS/SURMOUNT. GLP-1 + GIP synergy with milder gastric deceleration and strong insulin response.
          </small>
        </motion.button>

        {/* Semaglutide */}
        <motion.button
          whileHover={{ y: -2 }}
          whileTap={{ scale: 0.99 }}
          type="button"
          onClick={() => handleSelectCompound('semaglutide')}
          style={{
            border: '1px solid',
            borderColor: activeCompound === 'semaglutide' ? 'var(--green)' : 'var(--line)',
            background: activeCompound === 'semaglutide' ? '#ffffff' : '#fbfbf8',
            padding: '16px',
            borderRadius: '14px',
            textAlign: 'left',
            cursor: 'pointer',
            boxShadow: activeCompound === 'semaglutide' ? '0 4px 16px rgba(32, 59, 50, 0.12)' : 'none',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '10px', fontWeight: 700, color: '#526650', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
              Single Incretin
            </span>
            {activeCompound === 'semaglutide' && (
              <span style={{ fontSize: '9px', fontWeight: 700, background: 'var(--green)', color: '#fff', padding: '2px 6px', borderRadius: '6px' }}>
                ACTIVE
              </span>
            )}
          </div>
          <strong style={{ fontSize: '15px', display: 'block', marginBlock: '4px 2px', color: 'var(--ink)' }}>
            Semaglutide
          </strong>
          <small style={{ fontSize: '11px', color: 'var(--muted)', display: 'block', lineHeight: 1.4 }}>
            STEP 1. Pure GLP-1 receptor agonist with pronounced central satiety and gastric emptying deceleration.
          </small>
        </motion.button>
      </div>

      {/* Clean Segmented Sub-Navigation */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '28px' }}>
        <div
          style={{
            display: 'inline-flex',
            background: '#e9eae0',
            padding: '5px',
            borderRadius: '14px',
            gap: '4px',
          }}
        >
          <button
            type="button"
            onClick={() => setActiveSubTab('checklist')}
            style={{
              border: 0,
              background: activeSubTab === 'checklist' ? '#ffffff' : 'transparent',
              color: activeSubTab === 'checklist' ? 'var(--green)' : 'var(--muted)',
              fontWeight: activeSubTab === 'checklist' ? 600 : 500,
              padding: '9px 18px',
              borderRadius: '10px',
              fontSize: '13px',
              cursor: 'pointer',
              boxShadow: activeSubTab === 'checklist' ? '0 2px 8px rgba(0,0,0,0.08)' : 'none',
              transition: 'all 0.15s ease',
            }}
          >
            🛡️ Daily Protection Pillars ({completedPillars}/4)
          </button>
          <button
            type="button"
            onClick={() => setActiveSubTab('mechanics')}
            style={{
              border: 0,
              background: activeSubTab === 'mechanics' ? '#ffffff' : 'transparent',
              color: activeSubTab === 'mechanics' ? 'var(--green)' : 'var(--muted)',
              fontWeight: activeSubTab === 'mechanics' ? 600 : 500,
              padding: '9px 18px',
              borderRadius: '10px',
              fontSize: '13px',
              cursor: 'pointer',
              boxShadow: activeSubTab === 'mechanics' ? '0 2px 8px rgba(0,0,0,0.08)' : 'none',
              transition: 'all 0.15s ease',
            }}
          >
            🔬 Clinical Pharmacology & Heart Rate
          </button>
          <button
            type="button"
            onClick={() => setActiveSubTab('nutrients')}
            style={{
              border: 0,
              background: activeSubTab === 'nutrients' ? '#ffffff' : 'transparent',
              color: activeSubTab === 'nutrients' ? 'var(--green)' : 'var(--muted)',
              fontWeight: activeSubTab === 'nutrients' ? 600 : 500,
              padding: '9px 18px',
              borderRadius: '10px',
              fontSize: '13px',
              cursor: 'pointer',
              boxShadow: activeSubTab === 'nutrients' ? '0 2px 8px rgba(0,0,0,0.08)' : 'none',
              transition: 'all 0.15s ease',
            }}
          >
            💊 Essential Micronutrient Defense
          </button>
        </div>
      </div>

      {/* Animated Content for Sub-Tabs */}
      <AnimatePresence mode="wait">
        {/* SUBTAB 1: DAILY PROTECTION PILLARS */}
        {activeSubTab === 'checklist' && (
          <motion.div
            key="subtab-checklist"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            style={{ maxWidth: '800px', margin: '0 auto' }}
          >
            <div
              style={{
                background: '#ffffff',
                border: '1px solid var(--line)',
                borderRadius: '18px',
                padding: '28px',
                boxShadow: '0 4px 20px rgba(32, 59, 50, 0.04)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '20px', color: 'var(--ink)' }}>
                    Daily Protocol Compliance
                  </h3>
                  <small style={{ color: 'var(--muted)' }}>
                    Shield muscle tissue and sustain cellular hydration while on {activeCompound}.
                  </small>
                </div>
                <span
                  style={{
                    fontSize: '12px',
                    fontWeight: 700,
                    background: completedPillars === 4 ? '#edf4e9' : '#fcf0ea',
                    color: completedPillars === 4 ? 'var(--green)' : 'var(--orange)',
                    padding: '4px 12px',
                    borderRadius: '20px',
                  }}
                >
                  {completedPillars} / 4 Completed
                </span>
              </div>

              {/* Progress bar */}
              <div style={{ height: '6px', background: '#e9eae0', borderRadius: '4px', marginBottom: '24px', overflow: 'hidden' }}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(completedPillars / 4) * 100}%` }}
                  transition={{ duration: 0.4 }}
                  style={{ height: '100%', background: 'var(--green)', borderRadius: '4px' }}
                />
              </div>

              {/* Interactive Checklist Cards */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {/* 1. Protein */}
                <motion.div
                  whileTap={{ scale: 0.99 }}
                  onClick={() => setProteinTargetHit(!proteinTargetHit)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '14px',
                    padding: '16px',
                    borderRadius: '12px',
                    border: '1px solid',
                    borderColor: proteinTargetHit ? '#b5cbaf' : 'var(--line)',
                    background: proteinTargetHit ? '#f6f9f4' : '#ffffff',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <div
                    style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      background: proteinTargetHit ? 'var(--green)' : '#f0f0eb',
                      color: '#fff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '12px',
                      fontWeight: 700,
                      flexShrink: 0,
                    }}
                  >
                    {proteinTargetHit ? '✓' : ''}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <strong style={{ fontSize: '14px', color: 'var(--ink)' }}>
                        Hit Minimum {minimumProteinFloor}g–{targetProteinGrams}g Protein Floor
                      </strong>
                      <span style={{ fontSize: '11px', color: 'var(--green)', fontWeight: 600 }}>1.8–2.0g/kg</span>
                    </div>
                    <small style={{ fontSize: '11px', color: 'var(--muted)', display: 'block', marginTop: '2px' }}>
                      Ali's lean mass threshold. Sarcopenic defense against rapid fat mobilization.
                    </small>
                  </div>
                </motion.div>

                {/* 2. Resistance Training */}
                <motion.div
                  whileTap={{ scale: 0.99 }}
                  onClick={() => setResistanceSessionDone(!resistanceSessionDone)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '14px',
                    padding: '16px',
                    borderRadius: '12px',
                    border: '1px solid',
                    borderColor: resistanceSessionDone ? '#b5cbaf' : 'var(--line)',
                    background: resistanceSessionDone ? '#f6f9f4' : '#ffffff',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <div
                    style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      background: resistanceSessionDone ? 'var(--green)' : '#f0f0eb',
                      color: '#fff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '12px',
                      fontWeight: 700,
                      flexShrink: 0,
                    }}
                  >
                    {resistanceSessionDone ? '✓' : ''}
                  </div>
                  <div style={{ flex: 1 }}>
                    <strong style={{ fontSize: '14px', color: 'var(--ink)' }}>
                      Complete Heavy Compound Resistance Session
                    </strong>
                    <small style={{ fontSize: '11px', color: 'var(--muted)', display: 'block', marginTop: '2px' }}>
                      High-tension mechanical load signals the body that muscle tissue is essential and must not be oxidized for fuel.
                    </small>
                  </div>
                </motion.div>

                {/* 3. Hydration with interactive stepper */}
                <div
                  style={{
                    padding: '16px',
                    borderRadius: '12px',
                    border: '1px solid',
                    borderColor: hydrationGlasses >= 8 ? '#b5cbaf' : 'var(--line)',
                    background: hydrationGlasses >= 8 ? '#f6f9f4' : '#ffffff',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                      <div
                        style={{
                          width: '24px',
                          height: '24px',
                          borderRadius: '50%',
                          background: hydrationGlasses >= 8 ? '#317399' : '#f0f0eb',
                          color: '#fff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '12px',
                          fontWeight: 700,
                          flexShrink: 0,
                        }}
                      >
                        {hydrationGlasses >= 8 ? '✓' : '💧'}
                      </div>
                      <div>
                        <strong style={{ fontSize: '14px', color: 'var(--ink)' }}>
                          Hydration: {hydrationGlasses} of 8 Glasses ({hydrationGlasses * 300}ml)
                        </strong>
                        <small style={{ fontSize: '11px', color: 'var(--muted)', display: 'block' }}>
                          Peptides blunt the thirst reflex; drink consistently throughout the day.
                        </small>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <button
                        type="button"
                        onClick={() => setHydrationGlasses(Math.max(0, hydrationGlasses - 1))}
                        style={{ width: '28px', height: '28px', borderRadius: '6px', border: '1px solid var(--line)', background: '#fff', cursor: 'pointer', fontWeight: 700 }}
                      >
                        -
                      </button>
                      <button
                        type="button"
                        onClick={() => setHydrationGlasses(Math.min(12, hydrationGlasses + 1))}
                        style={{ width: '28px', height: '28px', borderRadius: '6px', border: '1px solid var(--line)', background: '#fff', cursor: 'pointer', fontWeight: 700 }}
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>

                {/* 4. Electrolytes */}
                <motion.div
                  whileTap={{ scale: 0.99 }}
                  onClick={() => setElectrolytesTaken(!electrolytesTaken)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '14px',
                    padding: '16px',
                    borderRadius: '12px',
                    border: '1px solid',
                    borderColor: electrolytesTaken ? '#b5cbaf' : 'var(--line)',
                    background: electrolytesTaken ? '#f6f9f4' : '#ffffff',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <div
                    style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      background: electrolytesTaken ? 'var(--green)' : '#f0f0eb',
                      color: '#fff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '12px',
                      fontWeight: 700,
                      flexShrink: 0,
                    }}
                  >
                    {electrolytesTaken ? '✓' : ''}
                  </div>
                  <div style={{ flex: 1 }}>
                    <strong style={{ fontSize: '14px', color: 'var(--ink)' }}>
                      Electrolyte Supplementation (Sodium & Potassium)
                    </strong>
                    <small style={{ fontSize: '11px', color: 'var(--muted)', display: 'block', marginTop: '2px' }}>
                      Prevents orthostatic lightheadedness, headaches, and neuromuscular fatigue during caloric restriction.
                    </small>
                  </div>
                </motion.div>
              </div>

              {/* Action buttons */}
              <div style={{ display: 'flex', gap: '12px', marginTop: '24px', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={onNavigateToTracker}
                  className="calculate-button"
                  style={{ width: 'auto', padding: '12px 20px', fontSize: '13px' }}
                >
                  Log Peptide Meal in Tracker ↗
                </button>
                <button
                  type="button"
                  onClick={onNavigateToTraining}
                  style={{
                    background: '#f4f4ec',
                    border: '1px solid var(--line)',
                    borderRadius: '8px',
                    padding: '12px 18px',
                    fontSize: '13px',
                    color: 'var(--ink)',
                    cursor: 'pointer',
                  }}
                >
                  View Muscle Shield Workout ↗
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* SUBTAB 2: CLINICAL PHARMACOLOGY & HEART RATE */}
        {activeSubTab === 'mechanics' && (
          <motion.div
            key="subtab-mechanics"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            style={{ maxWidth: '800px', margin: '0 auto' }}
          >
            <div
              style={{
                background: '#ffffff',
                border: '1px solid var(--line)',
                borderRadius: '18px',
                padding: '28px',
                boxShadow: '0 4px 20px rgba(32, 59, 50, 0.04)',
                display: 'flex',
                flexDirection: 'column',
                gap: '18px',
              }}
            >
              <div style={{ padding: '16px', background: '#fdf9f4', borderRadius: '12px', borderLeft: '4px solid var(--orange)' }}>
                <strong style={{ fontSize: '14px', color: 'var(--orange)', display: 'block', marginBottom: '4px' }}>
                  Glucagon Receptor Activation (Retatrutide Specific)
                </strong>
                <p style={{ fontSize: '12px', color: 'var(--ink)', margin: 0, lineHeight: 1.6 }}>
                  Unlike Semaglutide or Tirzepatide, Retatrutide uniquely stimulates <strong>hepatic glucagon receptors</strong>. This stimulates mitochondrial fat oxidation and maintains baseline energy expenditure even during aggressive weight loss. However, without adequate protein and resistance training, the glucagon pathway can accelerate gluconeogenesis from muscle tissue.
                </p>
              </div>

              <div style={{ padding: '16px', background: '#fbfbf8', borderRadius: '12px', border: '1px solid var(--line)' }}>
                <strong style={{ fontSize: '14px', color: 'var(--green)', display: 'block', marginBottom: '4px' }}>
                  Heart Rate Pacing & Autonomic Monitoring
                </strong>
                <p style={{ fontSize: '12px', color: 'var(--muted)', margin: 0, lineHeight: 1.6 }}>
                  Clinical trials showed an average 4–8 bpm increase in resting heart rate on Retatrutide. For cardiovascular fitness, prioritize <strong>Zone 2 low-impact aerobic work</strong> (brisk walking, incline treadmill, cycling) rather than high-intensity interval training (HIIT), avoiding autonomic overtraining.
                </p>
              </div>

              <div style={{ padding: '16px', background: '#fbfbf8', borderRadius: '12px', border: '1px solid var(--line)' }}>
                <strong style={{ fontSize: '14px', color: 'var(--ink)', display: 'block', marginBottom: '4px' }}>
                  Gastric Motility & Sulfur Burp Prevention
                </strong>
                <p style={{ fontSize: '12px', color: 'var(--muted)', margin: 0, lineHeight: 1.6 }}>
                  Delayed gastric emptying causes food to remain in the stomach significantly longer. Eating large, greasy, or high-sugar meals leads to fermentation, nausea, and sulfur burps. Distribute intake into 3–4 clean, high-protein meals with adequate digestive enzymes or ginger tea.
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* SUBTAB 3: ESSENTIAL MICRONUTRIENT DEFENSE */}
        {activeSubTab === 'nutrients' && (
          <motion.div
            key="subtab-nutrients"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            style={{ maxWidth: '800px', margin: '0 auto' }}
          >
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                gap: '16px',
              }}
            >
              <div style={{ background: '#ffffff', border: '1px solid var(--line)', borderRadius: '14px', padding: '20px' }}>
                <strong style={{ fontSize: '14px', color: 'var(--green)', display: 'block', marginBottom: '6px' }}>
                  Vitamin B12 (Methylcobalamin)
                </strong>
                <p style={{ fontSize: '12px', color: 'var(--muted)', margin: 0, lineHeight: 1.6 }}>
                  Reduced stomach acidity and slower gastric motility impair intrinsic factor release, reducing B12 bioavailability. Essential for RBC production and neurological endurance.
                </p>
              </div>

              <div style={{ background: '#ffffff', border: '1px solid var(--line)', borderRadius: '14px', padding: '20px' }}>
                <strong style={{ fontSize: '14px', color: 'var(--green)', display: 'block', marginBottom: '6px' }}>
                  Magnesium Glycinate / Citrate
                </strong>
                <p style={{ fontSize: '12px', color: 'var(--muted)', margin: 0, lineHeight: 1.6 }}>
                  Acts as an osmotic agent to support smooth intestinal motility and counteract peptide-mediated constipation, while enhancing nocturnal recovery.
                </p>
              </div>

              <div style={{ background: '#ffffff', border: '1px solid var(--line)', borderRadius: '14px', padding: '20px' }}>
                <strong style={{ fontSize: '14px', color: 'var(--green)', display: 'block', marginBottom: '6px' }}>
                  Creatine Monohydrate (3–5g)
                </strong>
                <p style={{ fontSize: '12px', color: 'var(--muted)', margin: 0, lineHeight: 1.6 }}>
                  Boosts intramuscular phosphocreatine stores and cellular hydration during hypocaloric phases, preserving strength and preventing sarcopenia.
                </p>
              </div>

              <div style={{ background: '#ffffff', border: '1px solid var(--line)', borderRadius: '14px', padding: '20px' }}>
                <strong style={{ fontSize: '14px', color: 'var(--green)', display: 'block', marginBottom: '6px' }}>
                  Electrolyte Complex (Na, K, Cl)
                </strong>
                <p style={{ fontSize: '12px', color: 'var(--muted)', margin: 0, lineHeight: 1.6 }}>
                  Maintains blood volume and prevents postural hypotension, dizziness, and muscle cramping caused by blunted thirst reflexes.
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

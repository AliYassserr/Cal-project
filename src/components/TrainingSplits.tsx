import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { UserProfile, TrainingSplit } from '../types';
import { TRAINING_SPLITS } from '../data/trainingSplits';

interface TrainingSplitsProps {
  userProfile: UserProfile;
  onNavigateToGLP1: () => void;
}

export const TrainingSplits: React.FC<TrainingSplitsProps> = ({ userProfile, onNavigateToGLP1 }) => {
  const initialSplit = userProfile.compound !== 'none' ? TRAINING_SPLITS[1] : TRAINING_SPLITS[0];
  const [selectedSplit, setSelectedSplit] = useState<TrainingSplit>(initialSplit);
  const [activeDayIndex, setActiveDayIndex] = useState<number>(0);
  const [completedExercises, setCompletedExercises] = useState<Record<string, boolean>>({});

  const activeDay = selectedSplit.days[activeDayIndex] || selectedSplit.days[0];

  const toggleExerciseComplete = (exerciseKey: string) => {
    setCompletedExercises(prev => ({
      ...prev,
      [exerciseKey]: !prev[exerciseKey],
    }));
  };

  const totalExercises = activeDay.exercises.length;
  const completedCount = activeDay.exercises.filter((_, i) => completedExercises[`${selectedSplit.id}-${activeDayIndex}-${i}`]).length;

  return (
    <div className="shell" style={{ paddingBlock: '32px 72px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '16px', marginBottom: '28px' }}>
        <div>
          <p className="eyebrow" style={{ color: 'var(--muted)', margin: '0 0 6px 0' }}>
            PERSONALIZED ROUTINE
          </p>
          <h2 style={{ font: 'clamp(28px, 4vw, 36px) var(--serif)', margin: 0, color: 'var(--ink)' }}>
            Evidence-Based Training Architecture
          </h2>
        </div>
        <div style={{ fontSize: '12px', color: 'var(--muted)', textAlign: 'right' }}>
          Weight: <strong>{userProfile.weight}kg</strong> · Age: <strong>{userProfile.age}</strong> · Goal: <strong>{userProfile.goal}</strong>
        </div>
      </div>

      {/* Program Selector Pills with Smooth Motion */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '12px', marginBottom: '28px' }}>
        {TRAINING_SPLITS.map(split => {
          const isSelected = selectedSplit.id === split.id;
          return (
            <motion.button
              key={split.id}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.99 }}
              type="button"
              onClick={() => {
                setSelectedSplit(split);
                setActiveDayIndex(0);
              }}
              style={{
                position: 'relative',
                border: '1px solid',
                borderColor: isSelected ? 'var(--green)' : 'var(--line)',
                background: isSelected ? 'var(--green)' : '#ffffff',
                color: isSelected ? '#f5f6e9' : 'var(--ink)',
                padding: '16px',
                borderRadius: '14px',
                cursor: 'pointer',
                textAlign: 'left',
                boxShadow: isSelected ? '0 4px 16px rgba(32, 59, 50, 0.12)' : '0 2px 8px rgba(0,0,0,0.02)',
                transition: 'all 0.15s ease',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span
                  style={{
                    fontSize: '10px',
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                    fontWeight: 700,
                    color: isSelected ? 'var(--lime)' : 'var(--muted)',
                  }}
                >
                  {split.frequency}
                </span>
                {isSelected && (
                  <span style={{ fontSize: '10px', background: 'rgba(215, 228, 161, 0.2)', color: 'var(--lime)', padding: '2px 8px', borderRadius: '10px' }}>
                    Active
                  </span>
                )}
              </div>
              <strong style={{ fontSize: '15px', display: 'block', marginBlock: '4px 4px' }}>
                {split.title}
              </strong>
              <small style={{ fontSize: '11px', opacity: isSelected ? 0.9 : 0.7, display: 'block', lineHeight: 1.4 }}>
                {split.idealFor}
              </small>
            </motion.button>
          );
        })}
      </div>

      {/* Rationale & Quick Protocol Callout */}
      <motion.div
        layout
        style={{
          background: '#ffffff',
          border: '1px solid var(--line)',
          borderRadius: '16px',
          padding: '20px 24px',
          marginBottom: '28px',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '20px',
          alignItems: 'center',
          boxShadow: '0 2px 12px rgba(32, 59, 50, 0.03)',
        }}
      >
        <div>
          <span style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', color: 'var(--orange)', display: 'block', marginBottom: '4px' }}>
            SCIENTIFIC JUSTIFICATION
          </span>
          <h4 style={{ font: '18px/1.3 var(--serif)', margin: '0 0 6px 0', color: 'var(--ink)' }}>
            Why this works for Ali
          </h4>
          <p style={{ fontSize: '12px', color: 'var(--muted)', margin: 0, lineHeight: 1.6 }}>
            {selectedSplit.scientificRationale}
          </p>
          <small style={{ display: 'block', marginTop: '6px', fontSize: '11px', color: '#7a8975' }}>
            Citation: {selectedSplit.studyCitation}
          </small>
        </div>

        <div style={{ background: '#f6f7ee', padding: '16px', borderRadius: '12px', border: '1px solid #e2e5d3' }}>
          <strong style={{ fontSize: '12px', color: 'var(--green)', display: 'block', marginBottom: '6px' }}>
            Ali's Execution Guidelines
          </strong>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '11px', color: 'var(--ink)' }}>
            <span>• <strong>RIR 1–2:</strong> Leave 1–2 reps in reserve on compound lifts.</span>
            <span>• <strong>Controlled Eccentric:</strong> 2–3 second descent preserves tensile stimulus.</span>
            <span>• <strong>Hydration:</strong> Drink 500ml water + electrolytes 30 mins prior.</span>
          </div>
          {userProfile.compound !== 'none' && (
            <button
              onClick={onNavigateToGLP1}
              style={{
                marginTop: '10px',
                fontSize: '11px',
                color: 'var(--orange)',
                background: 'transparent',
                border: 0,
                padding: 0,
                textDecoration: 'underline',
                cursor: 'pointer',
                fontWeight: 600,
              }}
            >
              GLP-1 / Reta Muscle Sparing Details ↗
            </button>
          )}
        </div>
      </motion.div>

      {/* Main Schedule & Workout Card Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px', alignItems: 'start' }}>
        {/* Left Column: Day Picker */}
        <div
          style={{
            background: '#ffffff',
            border: '1px solid var(--line)',
            borderRadius: '16px',
            padding: '22px',
            boxShadow: '0 2px 12px rgba(32, 59, 50, 0.03)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ margin: 0, fontSize: '16px', color: 'var(--ink)' }}>Training Days</h3>
            <span style={{ fontSize: '11px', color: 'var(--muted)' }}>Select a session</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {selectedSplit.days.map((day, idx) => {
              const isActive = activeDayIndex === idx;
              return (
                <motion.button
                  key={idx}
                  whileTap={{ scale: 0.98 }}
                  type="button"
                  onClick={() => setActiveDayIndex(idx)}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '14px 16px',
                    borderRadius: '10px',
                    border: '1px solid',
                    borderColor: isActive ? 'var(--green)' : 'var(--line)',
                    background: isActive ? '#edf3e8' : '#fcfcf9',
                    color: 'var(--ink)',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <div>
                    <strong style={{ fontSize: '14px', display: 'block', color: isActive ? 'var(--green)' : 'var(--ink)' }}>
                      {day.dayName}
                    </strong>
                    <small style={{ fontSize: '11px', color: 'var(--muted)' }}>{day.focus}</small>
                  </div>
                  <span
                    style={{
                      fontSize: '11px',
                      fontWeight: 600,
                      color: isActive ? 'var(--green)' : 'var(--muted)',
                      background: isActive ? '#dcebd3' : '#f0f0e8',
                      padding: '3px 8px',
                      borderRadius: '6px',
                    }}
                  >
                    {day.exercises.length} lifts
                  </span>
                </motion.button>
              );
            })}
          </div>

          <div style={{ marginTop: '20px', padding: '12px 14px', background: '#faf9f5', borderRadius: '10px', border: '1px solid var(--line)', fontSize: '11px', color: 'var(--muted)', lineHeight: 1.5 }}>
            <strong style={{ color: 'var(--ink)', display: 'block', marginBottom: '2px' }}>Progress Tracker for Ali:</strong>
            Tap the circular checkmark next to any lift as you finish your sets. Your completion resets safely when you switch days.
          </div>
        </div>

        {/* Right Column: Interactive Animated Exercise List */}
        <div
          style={{
            background: 'var(--green)',
            color: '#f5f6e9',
            borderRadius: '18px',
            padding: '26px',
            boxShadow: '0 8px 24px rgba(32, 59, 50, 0.15)',
            gridColumn: 'span 2',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', flexWrap: 'wrap', gap: '8px', marginBottom: '8px' }}>
            <span style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', color: 'var(--lime)' }}>
              SESSION SHEET · DAY {activeDayIndex + 1} OF {selectedSplit.days.length}
            </span>
            <span
              style={{
                fontSize: '12px',
                background: 'rgba(215, 228, 161, 0.15)',
                color: 'var(--lime)',
                padding: '3px 10px',
                borderRadius: '20px',
                border: '1px solid rgba(215, 228, 161, 0.3)',
              }}
            >
              {completedCount} of {totalExercises} completed
            </span>
          </div>

          <h3 style={{ font: '26px/1.2 var(--serif)', margin: '0 0 6px 0', color: '#fff' }}>
            {activeDay.dayName}
          </h3>
          <p style={{ fontSize: '13px', color: '#c5d7bf', margin: '0 0 20px 0' }}>
            {activeDay.description}
          </p>

          <AnimatePresence mode="wait">
            <motion.div
              key={`${selectedSplit.id}-${activeDayIndex}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2 }}
              style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}
            >
              {activeDay.exercises.map((ex, i) => {
                const exKey = `${selectedSplit.id}-${activeDayIndex}-${i}`;
                const isCompleted = Boolean(completedExercises[exKey]);

                return (
                  <motion.div
                    key={i}
                    whileHover={{ scale: 1.01 }}
                    style={{
                      background: isCompleted ? 'rgba(255, 255, 255, 0.03)' : 'rgba(255, 255, 255, 0.08)',
                      border: '1px solid',
                      borderColor: isCompleted ? 'rgba(215, 228, 161, 0.4)' : 'rgba(255, 255, 255, 0.12)',
                      borderRadius: '12px',
                      padding: '16px',
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '14px',
                      transition: 'all 0.2s ease',
                      opacity: isCompleted ? 0.75 : 1,
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => toggleExerciseComplete(exKey)}
                      aria-label={`Mark ${ex.name} as ${isCompleted ? 'incomplete' : 'complete'}`}
                      style={{
                        marginTop: '2px',
                        width: '24px',
                        height: '24px',
                        borderRadius: '50%',
                        border: '2px solid',
                        borderColor: isCompleted ? 'var(--lime)' : 'rgba(255, 255, 255, 0.4)',
                        background: isCompleted ? 'var(--lime)' : 'transparent',
                        color: 'var(--green)',
                        fontSize: '12px',
                        fontWeight: 800,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        flexShrink: 0,
                        transition: 'all 0.15s ease',
                      }}
                    >
                      {isCompleted ? '✓' : ''}
                    </button>

                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', flexWrap: 'wrap', gap: '8px' }}>
                        <strong
                          style={{
                            fontSize: '15px',
                            color: isCompleted ? 'var(--lime)' : '#ffffff',
                            textDecoration: isCompleted ? 'line-through' : 'none',
                          }}
                        >
                          {i + 1}. {ex.name}
                        </strong>
                        <span style={{ fontSize: '12px', color: 'var(--lime)', fontWeight: 600, background: 'rgba(0,0,0,0.25)', padding: '2px 8px', borderRadius: '4px' }}>
                          {ex.sets} sets × {ex.reps} reps · Rest: {ex.rest}
                        </span>
                      </div>

                      <p style={{ margin: '6px 0 4px 0', fontSize: '12px', color: '#dce8da', lineHeight: 1.5 }}>
                        <strong style={{ color: '#d7e4a1' }}>Form Cue:</strong> {ex.coachingCue}
                      </p>

                      <span style={{ fontSize: '11px', color: '#9cb396' }}>
                        Targets: {ex.primaryMuscles}
                      </span>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Droplets,
  Plus,
  Minus,
  RotateCcw,
  Sparkles,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Info,
  Clock,
  ChevronRight,
  Settings,
  CupSoda,
  Wine,
  Activity,
  ShieldAlert,
  ArrowUpRight,
  TrendingUp,
} from 'lucide-react';
import { UserProfile, WaterLogEntry } from '../types';

interface WaterTrackerProps {
  userProfile: UserProfile;
  authToken?: string | null;
  onNavigateToCalculator?: () => void;
  onNavigateToGLP1?: () => void;
  onNavigateToFoodTracker?: () => void;
}

const CONTAINER_PRESETS = [
  { id: 'glass', label: 'Small Glass', amountMl: 250, icon: '🥛', desc: 'Standard cup / 8.5 oz' },
  { id: 'mug', label: 'Office Mug', amountMl: 350, icon: '☕', desc: 'Coffee / tea / 12 oz' },
  { id: 'bottle', label: 'Water Bottle', amountMl: 500, icon: '🍶', desc: 'Standard bottle / 17 oz' },
  { id: 'shaker', label: 'Fitness Shaker', amountMl: 750, icon: '🥤', desc: 'Workout shaker / 25 oz' },
  { id: 'jug', label: 'Hydro Jug', amountMl: 1000, icon: '🫖', desc: 'Large container / 34 oz' },
];

export const WaterTracker: React.FC<WaterTrackerProps> = ({
  userProfile,
  authToken,
  onNavigateToCalculator,
  onNavigateToGLP1,
  onNavigateToFoodTracker,
}) => {
  // Display Unit: 'ml' or 'oz'
  const [unitMode, setUnitMode] = useState<'ml' | 'oz'>(userProfile.units === 'imperial' ? 'oz' : 'ml');

  // Calculate evidence-based recommended water target
  const calculateDefaultTarget = () => {
    // 35 ml per kg of body weight
    let base = Math.round(userProfile.weight * 35);
    // Activity boost
    if (userProfile.activity === 'moderate') base += 350;
    if (userProfile.activity === 'active' || userProfile.activity === 'veryActive') base += 700;
    // GLP-1 / Retatrutide hydration demand (prevent dehydration & renal load)
    if (userProfile.compound !== 'none') base += 500;
    return Math.max(2000, Math.min(5000, base));
  };

  const [targetGoalMl, setTargetGoalMl] = useState<number>(() => {
    const saved = localStorage.getItem('form_water_goal');
    return saved ? Number(saved) : calculateDefaultTarget();
  });

  const [entries, setEntries] = useState<WaterLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [customAmount, setCustomAmount] = useState('');
  const [isEditingGoal, setIsEditingGoal] = useState(false);
  const [newGoalInput, setNewGoalInput] = useState(targetGoalMl.toString());
  const [lastLoggedMessage, setLastLoggedMessage] = useState<string | null>(null);

  // Fetch today's logs from server or fallback to local
  useEffect(() => {
    let isMounted = true;
    const fetchTodayWater = async () => {
      try {
        const headers: Record<string, string> = {};
        if (authToken) {
          headers['Authorization'] = `Bearer ${authToken}`;
        }
        const res = await fetch('/api/water/today', { headers });
        if (res.ok) {
          const data = await res.json();
          if (data.success && isMounted) {
            setEntries(data.entries || []);
            if (data.targetMl) {
              setTargetGoalMl(data.targetMl);
              setNewGoalInput(data.targetMl.toString());
            }
          }
        }
      } catch (e) {
        console.warn('Could not fetch water logs from server, using local storage backup');
        const local = localStorage.getItem('form_water_entries_today');
        if (local && isMounted) {
          try {
            setEntries(JSON.parse(local));
          } catch {}
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchTodayWater();
    return () => {
      isMounted = false;
    };
  }, [authToken]);

  // Save to local storage whenever entries update
  useEffect(() => {
    if (!loading) {
      localStorage.setItem('form_water_entries_today', JSON.stringify(entries));
      localStorage.setItem('form_water_goal', targetGoalMl.toString());
    }
  }, [entries, targetGoalMl, loading]);

  const totalConsumedMl = entries.reduce((acc, curr) => acc + curr.amountMl, 0);
  const percentage = Math.min(100, Math.round((totalConsumedMl / targetGoalMl) * 100));
  const remainingMl = Math.max(0, targetGoalMl - totalConsumedMl);

  // Unit conversion helpers
  const mlToOz = (ml: number) => Math.round(ml / 29.5735);
  const ozToMl = (oz: number) => Math.round(oz * 29.5735);

  const formatVolume = (ml: number) => {
    if (unitMode === 'oz') {
      return `${mlToOz(ml)} fl oz`;
    }
    return ml >= 1000 ? `${(ml / 1000).toFixed(2)} L` : `${ml} ml`;
  };

  // Add water log handler
  const handleLogWater = async (
    amountMl: number,
    containerType: WaterLogEntry['containerType'] = 'bottle'
  ) => {
    const now = new Date();
    const timeFormatted = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const tempEntry: WaterLogEntry = {
      id: `wl_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
      amountMl,
      timestamp: now.toISOString(),
      timeFormatted,
      containerType,
    };

    // Optimistic UI update
    setEntries((prev) => [tempEntry, ...prev]);
    setLastLoggedMessage(`+${formatVolume(amountMl)} logged at ${timeFormatted}!`);
    setTimeout(() => setLastLoggedMessage(null), 3500);

    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (authToken) headers['Authorization'] = `Bearer ${authToken}`;

      await fetch('/api/water/log', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          amountMl,
          containerType,
          timeFormatted,
        }),
      });
    } catch (err) {
      console.warn('Network sync failed, log persisted locally.');
    }
  };

  // Custom log submit
  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const val = Number(customAmount);
    if (!val || val <= 0) return;
    const amountMl = unitMode === 'oz' ? ozToMl(val) : val;
    handleLogWater(amountMl, 'custom');
    setCustomAmount('');
  };

  // Delete entry
  const handleDeleteEntry = async (id: string) => {
    setEntries((prev) => prev.filter((item) => item.id !== id));
    try {
      const headers: Record<string, string> = {};
      if (authToken) headers['Authorization'] = `Bearer ${authToken}`;
      await fetch(`/api/water/log/${id}`, { method: 'DELETE', headers });
    } catch (e) {
      console.warn('Failed to delete on server');
    }
  };

  // Save updated goal
  const handleSaveGoal = async () => {
    const goal = Number(newGoalInput);
    if (goal >= 500 && goal <= 10000) {
      setTargetGoalMl(goal);
      setIsEditingGoal(false);
      try {
        const headers: Record<string, string> = { 'Content-Type': 'application/json' };
        if (authToken) headers['Authorization'] = `Bearer ${authToken}`;
        await fetch('/api/water/goal', {
          method: 'PUT',
          headers,
          body: JSON.stringify({ goalMl: goal }),
        });
      } catch (e) {}
    }
  };

  const isGLP1 = userProfile.compound !== 'none';

  return (
    <div className="shell" style={{ paddingTop: '24px', paddingBottom: '60px' }}>
      {/* Top Banner & Heading */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'flex-end',
          justifyContent: 'space-between',
          gap: '16px',
          marginBottom: '28px',
          borderBottom: '1px solid var(--line)',
          paddingBottom: '20px',
        }}
      >
        <div>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '11px',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              color: '#0284c7',
              background: '#e0f2fe',
              padding: '4px 10px',
              borderRadius: '20px',
              marginBottom: '8px',
            }}
          >
            <Droplets size={13} />
            <span>Hydration & Renal Protocol</span>
          </div>
          <h1
            style={{
              margin: 0,
              fontSize: '32px',
              lineHeight: 1.15,
              fontWeight: 700,
              color: 'var(--ink)',
              fontFamily: 'var(--font-display, Georgia, serif)',
            }}
          >
            Daily Water Tracker
          </h1>
          <p
            style={{
              margin: '6px 0 0',
              fontSize: '15px',
              color: 'var(--muted)',
              maxWidth: '680px',
            }}
          >
            Optimal cellular hydration ensures healthy kidney filtration, regulates electrolyte
            balance, supports metabolic efficiency, and prevents nausea associated with GLP-1/GIP
            therapy.
          </p>
        </div>

        {/* Controls: Unit Toggle & Goal Setter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              display: 'inline-flex',
              background: '#ecebe3',
              borderRadius: '8px',
              padding: '2px',
              border: '1px solid #dcdecb',
            }}
          >
            <button
              type="button"
              onClick={() => setUnitMode('ml')}
              style={{
                border: 0,
                background: unitMode === 'ml' ? '#ffffff' : 'transparent',
                color: unitMode === 'ml' ? 'var(--ink)' : 'var(--muted)',
                fontWeight: unitMode === 'ml' ? 600 : 500,
                fontSize: '12px',
                padding: '4px 10px',
                borderRadius: '6px',
                cursor: 'pointer',
              }}
            >
              Metric (ml / L)
            </button>
            <button
              type="button"
              onClick={() => setUnitMode('oz')}
              style={{
                border: 0,
                background: unitMode === 'oz' ? '#ffffff' : 'transparent',
                color: unitMode === 'oz' ? 'var(--ink)' : 'var(--muted)',
                fontWeight: unitMode === 'oz' ? 600 : 500,
                fontSize: '12px',
                padding: '4px 10px',
                borderRadius: '6px',
                cursor: 'pointer',
              }}
            >
              Imperial (fl oz)
            </button>
          </div>

          <button
            type="button"
            onClick={() => setIsEditingGoal(!isEditingGoal)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              background: '#ffffff',
              border: '1px solid var(--line)',
              padding: '6px 12px',
              borderRadius: '8px',
              fontSize: '12px',
              fontWeight: 600,
              color: 'var(--ink)',
              cursor: 'pointer',
            }}
          >
            <Settings size={13} />
            <span>Target: {formatVolume(targetGoalMl)}</span>
          </button>
        </div>
      </div>

      {/* Goal Edit Modal / Box */}
      {isEditingGoal && (
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            background: '#ffffff',
            border: '1px solid var(--line)',
            borderRadius: '12px',
            padding: '16px',
            marginBottom: '24px',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
          }}
        >
          <div>
            <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--ink)' }}>
              Customize Daily Hydration Goal
            </div>
            <div style={{ fontSize: '12px', color: 'var(--muted)' }}>
              Recommended baseline: {formatVolume(calculateDefaultTarget())} based on your {userProfile.weight}kg body weight & {userProfile.activity} activity.
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <input
              type="number"
              value={newGoalInput}
              onChange={(e) => setNewGoalInput(e.target.value)}
              step="100"
              min="1000"
              max="8000"
              style={{
                width: '100px',
                padding: '6px 10px',
                borderRadius: '6px',
                border: '1px solid var(--line)',
                fontSize: '14px',
                fontWeight: 600,
                color: 'var(--ink)',
              }}
            />
            <span style={{ fontSize: '12px', color: 'var(--muted)' }}>ml / day</span>
            <button
              type="button"
              onClick={handleSaveGoal}
              style={{
                background: 'var(--green)',
                color: '#ffffff',
                border: 0,
                padding: '7px 14px',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Save Goal
            </button>
            <button
              type="button"
              onClick={() => {
                setTargetGoalMl(calculateDefaultTarget());
                setNewGoalInput(calculateDefaultTarget().toString());
                setIsEditingGoal(false);
              }}
              style={{
                background: '#f4f4f0',
                border: '1px solid #dcdad0',
                padding: '7px 12px',
                borderRadius: '6px',
                fontSize: '12px',
                color: 'var(--ink)',
                cursor: 'pointer',
              }}
            >
              Reset to Recommended
            </button>
          </div>
        </motion.div>
      )}

      {/* Main Grid: Hydration Cylinder & Hydro Dashboard */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '24px',
          alignItems: 'stretch',
          marginBottom: '32px',
        }}
      >
        {/* Left Card: Visual Hydro Cylinder & Status */}
        <div
          style={{
            background: '#ffffff',
            borderRadius: '16px',
            border: '1px solid var(--line)',
            padding: '24px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Top stats */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Today's Progress
              </span>
              <span
                style={{
                  fontSize: '13px',
                  fontWeight: 700,
                  color: percentage >= 100 ? '#0284c7' : 'var(--ink)',
                }}
              >
                {percentage}% of goal
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginTop: '6px' }}>
              <span
                style={{
                  fontSize: '44px',
                  fontWeight: 700,
                  fontFamily: 'var(--font-display, Georgia, serif)',
                  color: 'var(--ink)',
                  lineHeight: 1,
                }}
              >
                {formatVolume(totalConsumedMl)}
              </span>
              <span style={{ fontSize: '16px', color: 'var(--muted)', fontWeight: 500 }}>
                / {formatVolume(targetGoalMl)}
              </span>
            </div>

            <p style={{ margin: '6px 0 0', fontSize: '13px', color: 'var(--muted)' }}>
              {remainingMl > 0 ? (
                <>
                  <strong style={{ color: 'var(--ink)' }}>{formatVolume(remainingMl)}</strong> remaining to achieve your daily cellular target.
                </>
              ) : (
                <span style={{ color: '#0369a1', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  <CheckCircle2 size={15} /> Daily hydration target satisfied! Outstanding job.
                </span>
              )}
            </p>
          </div>

          {/* Visual Interactive Water Vessel (SVG Graphic) */}
          <div
            style={{
              margin: '24px 0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
            }}
          >
            {/* Beaker / Bottle Graphic Container */}
            <div
              style={{
                width: '140px',
                height: '240px',
                borderRadius: '30px 30px 40px 40px',
                border: '4px solid #cbd5e1',
                position: 'relative',
                overflow: 'hidden',
                background: '#f8fafc',
                boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.06)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'flex-end',
              }}
            >
              {/* Measurement Ticks */}
              <div
                style={{
                  position: 'absolute',
                  right: '8px',
                  top: '20px',
                  bottom: '20px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  zIndex: 10,
                  pointerEvents: 'none',
                }}
              >
                <div style={{ width: '12px', height: '2px', background: '#94a3b8', opacity: 0.6 }} />
                <div style={{ width: '8px', height: '2px', background: '#94a3b8', opacity: 0.4 }} />
                <div style={{ width: '12px', height: '2px', background: '#94a3b8', opacity: 0.6 }} />
                <div style={{ width: '8px', height: '2px', background: '#94a3b8', opacity: 0.4 }} />
                <div style={{ width: '12px', height: '2px', background: '#94a3b8', opacity: 0.6 }} />
              </div>

              {/* Water Animated Fill */}
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: `${Math.min(100, Math.max(8, percentage))}%` }}
                transition={{ duration: 0.7, ease: 'easeOut' }}
                style={{
                  width: '100%',
                  background:
                    percentage >= 100
                      ? 'linear-gradient(180deg, #38bdf8 0%, #0284c7 100%)'
                      : 'linear-gradient(180deg, #7dd3fc 0%, #0284c7 100%)',
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 -4px 12px rgba(2, 132, 199, 0.3)',
                }}
              >
                {/* Surface Wave Effect */}
                <div
                  style={{
                    position: 'absolute',
                    top: '-6px',
                    left: 0,
                    right: 0,
                    height: '10px',
                    background: 'rgba(255,255,255,0.4)',
                    borderRadius: '50%',
                  }}
                />

                <span
                  style={{
                    fontSize: '18px',
                    fontWeight: 700,
                    color: '#ffffff',
                    textShadow: '0 1px 3px rgba(0,0,0,0.3)',
                  }}
                >
                  {percentage}%
                </span>
              </motion.div>
            </div>
          </div>

          {/* Quick status pill */}
          <div
            style={{
              padding: '10px 14px',
              borderRadius: '10px',
              background: percentage >= 80 ? '#f0fdf4' : percentage >= 40 ? '#f0f9ff' : '#fef2f2',
              border: `1px solid ${
                percentage >= 80 ? '#bbf7d0' : percentage >= 40 ? '#bae6fd' : '#fecaca'
              }`,
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '13px',
              color: percentage >= 80 ? '#166534' : percentage >= 40 ? '#0369a1' : '#991b1b',
            }}
          >
            {percentage >= 80 ? (
              <CheckCircle2 size={16} />
            ) : percentage >= 40 ? (
              <Droplets size={16} />
            ) : (
              <AlertTriangle size={16} />
            )}
            <span>
              {percentage >= 100
                ? 'Goal achieved! Ideal hyper-hydration for muscle recovery and metabolic rate.'
                : percentage >= 70
                ? 'Hydration on track. Great electrolyte and water balance.'
                : percentage >= 40
                ? 'Moderate hydration. Have a glass of water before your next meal.'
                : 'Hydration low today. Drink a tall glass (500ml) to assist kidney clearance.'}
            </span>
          </div>
        </div>

        {/* Right Card: Quick Log Presets & Custom Logging */}
        <div
          style={{
            background: '#ffffff',
            borderRadius: '16px',
            border: '1px solid var(--line)',
            padding: '24px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <h2
              style={{
                margin: '0 0 6px',
                fontSize: '18px',
                fontWeight: 700,
                color: 'var(--ink)',
                fontFamily: 'var(--font-display, Georgia, serif)',
              }}
            >
              1-Tap Quick Log
            </h2>
            <p style={{ margin: '0 0 16px', fontSize: '13px', color: 'var(--muted)' }}>
              Select common container sizes to instantly register your fluid intake:
            </p>

            {/* Presets Grid */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
                gap: '10px',
                marginBottom: '20px',
              }}
            >
              {CONTAINER_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => handleLogWater(preset.amountMl, preset.id as any)}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '12px 10px',
                    borderRadius: '12px',
                    background: 'var(--paper)',
                    border: '1px solid var(--line)',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    textAlign: 'center',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#0284c7';
                    e.currentTarget.style.transform = 'translateY(-1px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'var(--line)';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  <span style={{ fontSize: '24px', marginBottom: '4px' }}>{preset.icon}</span>
                  <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--ink)' }}>
                    +{formatVolume(preset.amountMl)}
                  </span>
                  <span style={{ fontSize: '11px', color: 'var(--muted)', marginTop: '2px' }}>
                    {preset.label}
                  </span>
                </button>
              ))}
            </div>

            {/* Custom Amount Form */}
            <form
              onSubmit={handleCustomSubmit}
              style={{
                display: 'flex',
                gap: '8px',
                background: 'var(--paper)',
                padding: '10px',
                borderRadius: '10px',
                border: '1px solid var(--line)',
                alignItems: 'center',
              }}
            >
              <input
                type="number"
                placeholder={unitMode === 'oz' ? 'Custom fl oz (e.g. 16)' : 'Custom ml (e.g. 400)'}
                value={customAmount}
                onChange={(e) => setCustomAmount(e.target.value)}
                min="1"
                max="3000"
                style={{
                  flex: 1,
                  padding: '8px 10px',
                  borderRadius: '6px',
                  border: '1px solid var(--line)',
                  fontSize: '13px',
                  background: '#ffffff',
                  outline: 'none',
                }}
              />
              <button
                type="submit"
                style={{
                  background: '#0284c7',
                  color: '#ffffff',
                  border: 0,
                  padding: '8px 14px',
                  borderRadius: '6px',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <Plus size={15} />
                <span>Log</span>
              </button>
            </form>

            {/* Notification alert on log */}
            <AnimatePresence>
              {lastLoggedMessage && (
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  style={{
                    marginTop: '12px',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    background: '#f0f9ff',
                    border: '1px solid #bae6fd',
                    color: '#0369a1',
                    fontSize: '12px',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <CheckCircle2 size={14} />
                  <span>{lastLoggedMessage}</span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* GLP-1 & Research Hydration Advisory */}
          <div
            style={{
              marginTop: '20px',
              padding: '14px',
              borderRadius: '10px',
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#0369a1', marginBottom: '4px' }}>
              <Info size={15} />
              <span style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase' }}>
                {isGLP1 ? 'Incretin Hydration Advisory' : 'Metabolic Fluid Tip'}
              </span>
            </div>
            <p style={{ margin: 0, fontSize: '12px', color: '#475569', lineHeight: 1.5 }}>
              {isGLP1
                ? 'Semaglutide, Tirzepatide & Retatrutide blunt central hypothalamic thirst receptors. You may not feel thirsty despite elevated cellular fluid requirements. Sip 250ml every 90 minutes to ensure renal comfort.'
                : 'High-protein diets create nitrogenous urea byproduct that requires ample kidney filtration. Ensure at least 35ml per kg of body weight daily.'}
            </p>
          </div>
        </div>
      </div>

      {/* Today's Hydration Log Timeline */}
      <div
        style={{
          background: '#ffffff',
          borderRadius: '16px',
          border: '1px solid var(--line)',
          padding: '24px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '16px',
          }}
        >
          <div>
            <h3
              style={{
                margin: 0,
                fontSize: '18px',
                fontWeight: 700,
                color: 'var(--ink)',
                fontFamily: 'var(--font-display, Georgia, serif)',
              }}
            >
              Today's Hydration Entries
            </h3>
            <p style={{ margin: '2px 0 0', fontSize: '13px', color: 'var(--muted)' }}>
              {entries.length} {entries.length === 1 ? 'entry' : 'entries'} registered today ({formatVolume(totalConsumedMl)} total)
            </p>
          </div>

          {entries.length > 0 && (
            <button
              type="button"
              onClick={() => handleDeleteEntry(entries[0].id)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                background: 'transparent',
                border: '1px solid var(--line)',
                padding: '6px 12px',
                borderRadius: '6px',
                fontSize: '12px',
                color: 'var(--muted)',
                cursor: 'pointer',
              }}
            >
              <RotateCcw size={13} />
              <span>Undo Last Entry</span>
            </button>
          )}
        </div>

        {entries.length === 0 ? (
          <div
            style={{
              padding: '36px 16px',
              textAlign: 'center',
              background: 'var(--paper)',
              borderRadius: '12px',
              border: '1px dashed var(--line)',
            }}
          >
            <Droplets size={32} color="#94a3b8" style={{ margin: '0 auto 8px' }} />
            <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--ink)' }}>
              No water logged yet today
            </div>
            <p style={{ margin: '4px 0 16px', fontSize: '13px', color: 'var(--muted)' }}>
              Tap any of the 1-Tap quick presets above to record your morning glass!
            </p>
            <button
              type="button"
              onClick={() => handleLogWater(500, 'bottle')}
              style={{
                background: '#0284c7',
                color: '#ffffff',
                border: 0,
                padding: '8px 16px',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              + Log 500 ml Morning Bottle
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {entries.map((entry) => (
              <div
                key={entry.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 16px',
                  borderRadius: '10px',
                  background: 'var(--paper)',
                  border: '1px solid var(--line)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '8px',
                      background: '#e0f2fe',
                      color: '#0284c7',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Droplets size={18} />
                  </div>
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--ink)' }}>
                      {formatVolume(entry.amountMl)}
                      <span
                        style={{
                          fontSize: '12px',
                          fontWeight: 500,
                          color: 'var(--muted)',
                          marginLeft: '8px',
                          textTransform: 'capitalize',
                        }}
                      >
                        ({entry.containerType || 'Water'})
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: 'var(--muted)' }}>
                      <Clock size={12} />
                      <span>{entry.timeFormatted}</span>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleDeleteEntry(entry.id)}
                  aria-label="Delete entry"
                  style={{
                    background: 'transparent',
                    border: 0,
                    padding: '6px',
                    color: '#94a3b8',
                    cursor: 'pointer',
                    borderRadius: '6px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = '#ef4444')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = '#94a3b8')}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Cross-Link navigation to Food Tracker or GLP-1 hub */}
      <div
        style={{
          marginTop: '24px',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '16px',
        }}
      >
        <button
          type="button"
          onClick={onNavigateToFoodTracker}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '16px 20px',
            borderRadius: '12px',
            background: '#ffffff',
            border: '1px solid var(--line)',
            cursor: 'pointer',
            textAlign: 'left',
          }}
        >
          <div>
            <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--ink)' }}>
              Log Your Meals & Protein Intake
            </div>
            <div style={{ fontSize: '12px', color: 'var(--muted)' }}>
              Track calories, macros, and USDA nutritional balance.
            </div>
          </div>
          <ArrowUpRight size={18} color="var(--green)" />
        </button>

        <button
          type="button"
          onClick={onNavigateToGLP1}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '16px 20px',
            borderRadius: '12px',
            background: '#ffffff',
            border: '1px solid var(--line)',
            cursor: 'pointer',
            textAlign: 'left',
          }}
        >
          <div>
            <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--ink)' }}>
              Incretin Protocol & Peptides
            </div>
            <div style={{ fontSize: '12px', color: 'var(--muted)' }}>
              Retatrutide and Tirzepatide lean mass and hydration guides.
            </div>
          </div>
          <ArrowUpRight size={18} color="var(--orange)" />
        </button>
      </div>
    </div>
  );
};

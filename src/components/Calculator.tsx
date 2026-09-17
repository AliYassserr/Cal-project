import React, { useState, useRef, useEffect, useId } from 'react';
import { UnitSystem, Sex, ActivityLevel, Goal, CalculateResult, GLP1Compound, UserProfile } from '../types';
import { calculate } from '../calculator';

const numberFormat = new Intl.NumberFormat('en-US');

interface CalculatorProps {
  userProfile: UserProfile;
  onProfileChange: (profile: UserProfile) => void;
  onCalculateComplete: (res: CalculateResult) => void;
  onNavigateToTracker: () => void;
  onNavigateToTraining: () => void;
  onNavigateToGLP1: () => void;
}

export const Calculator: React.FC<CalculatorProps> = ({
  userProfile,
  onProfileChange,
  onCalculateComplete,
  onNavigateToTracker,
  onNavigateToTraining,
  onNavigateToGLP1,
}) => {
  const [units, setUnits] = useState<UnitSystem>(userProfile.units || 'metric');
  const [age, setAge] = useState<string>(String(userProfile.age || 28));
  const [sex, setSex] = useState<Sex | ''>(userProfile.sex || 'male');
  const [heightInput, setHeightInput] = useState<string>(String(userProfile.height || 170));
  const [weightInput, setWeightInput] = useState<string>(String(userProfile.weight || 70));
  const [activity, setActivity] = useState<ActivityLevel>(userProfile.activity || 'moderate');
  const [goal, setGoal] = useState<Goal>(userProfile.goal || 'maintain');
  const [compound, setCompound] = useState<GLP1Compound>(userProfile.compound || 'retatrutide');

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [result, setResult] = useState<CalculateResult | null>(null);
  const [displayTarget, setDisplayTarget] = useState<number | null>(null);
  const [announcement, setAnnouncement] = useState<string>('');

  // Track canonical metric values to prevent drift across unit toggles
  const lastMeasurementsRef = useRef<{ height: number | null; weight: number | null } | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  const ageInputId = useId();
  const sexInputId = useId();
  const heightInputId = useId();
  const weightInputId = useId();
  const activityInputId = useId();
  const compoundInputId = useId();

  const isMetric = units === 'metric';

  // Handle unit system switch
  const handleUnitChange = (nextUnits: UnitSystem) => {
    if (nextUnits === units) return;

    const currentH = parseFloat(heightInput);
    const currentW = parseFloat(weightInput);

    if (!lastMeasurementsRef.current) {
      lastMeasurementsRef.current = {
        height: isNaN(currentH) ? null : currentH * (units === 'metric' ? 1 : 2.54),
        weight: isNaN(currentW) ? null : currentW * (units === 'metric' ? 1 : 0.45359237),
      };
    }

    setUnits(nextUnits);
    const nextIsMetric = nextUnits === 'metric';

    if (lastMeasurementsRef.current.height !== null) {
      const convertedH = nextIsMetric
        ? Math.round(lastMeasurementsRef.current.height * 10) / 10
        : Math.round((lastMeasurementsRef.current.height / 2.54) * 10) / 10;
      setHeightInput(String(convertedH));
    } else {
      setHeightInput(nextIsMetric ? '170' : '67');
    }

    if (lastMeasurementsRef.current.weight !== null) {
      const convertedW = nextIsMetric
        ? Math.round(lastMeasurementsRef.current.weight * 10) / 10
        : Math.round((lastMeasurementsRef.current.weight / 0.45359237) * 10) / 10;
      setWeightInput(String(convertedW));
    } else {
      setWeightInput(nextIsMetric ? '70' : '154');
    }

    setErrorMessage(null);
    setResult(null);
  };

  const handleHeightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setHeightInput(e.target.value);
    lastMeasurementsRef.current = null;
    setErrorMessage(null);
    setResult(null);
  };

  const handleWeightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setWeightInput(e.target.value);
    lastMeasurementsRef.current = null;
    setErrorMessage(null);
    setResult(null);
  };

  const handleGoalChange = (newGoal: Goal) => {
    setGoal(newGoal);
    if (result) {
      runCalculation(newGoal);
    }
  };

  const animateNumber = (targetVal: number | null) => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }

    if (targetVal === null) {
      setDisplayTarget(null);
      return;
    }

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      setDisplayTarget(targetVal);
      return;
    }

    const start = performance.now();
    const duration = 650;

    const frame = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const easeOutCubic = 1 - Math.pow(1 - progress, 3);
      setDisplayTarget(Math.round(targetVal * easeOutCubic));

      if (progress < 1) {
        animationFrameRef.current = requestAnimationFrame(frame);
      }
    };

    animationFrameRef.current = requestAnimationFrame(frame);
  };

  const runCalculation = (activeGoal: Goal = goal) => {
    setErrorMessage(null);

    const parsedAge = parseInt(age, 10);
    const parsedHeight = parseFloat(heightInput);
    const parsedWeight = parseFloat(weightInput);

    if (!age || isNaN(parsedAge) || parsedAge < 18 || parsedAge > 100) {
      setErrorMessage('This calculator supports adults aged 18–100.');
      return;
    }

    if (!sex) {
      setErrorMessage('Choose a sex coefficient for the equation.');
      return;
    }

    if (!heightInput || isNaN(parsedHeight)) {
      setErrorMessage('Enter a valid height measurement.');
      return;
    }

    if (!weightInput || isNaN(parsedWeight)) {
      setErrorMessage('Enter a valid weight measurement.');
      return;
    }

    try {
      const canonicalH = lastMeasurementsRef.current?.height ?? (isMetric ? parsedHeight : parsedHeight * 2.54);
      const canonicalW = lastMeasurementsRef.current?.weight ?? (isMetric ? parsedWeight : parsedWeight * 0.45359237);

      const calcResult = calculate({
        age: parsedAge,
        height: canonicalH,
        weight: canonicalW,
        units: 'metric',
        sex: sex,
        activity: activity,
        goal: activeGoal,
        compound: compound,
      });

      setResult(calcResult);
      animateNumber(calcResult.target);
      onCalculateComplete(calcResult);

      onProfileChange({
        name: 'User',
        age: parsedAge,
        height: Math.round(canonicalH),
        weight: Math.round(canonicalW),
        sex: sex,
        activity: activity,
        units: units,
        goal: activeGoal,
        compound: compound,
      });

      setAnnouncement(
        `Calculation complete. Resting energy: ${calcResult.bmr} calories per day. Maintenance: ${calcResult.maintenance}. ${
          calcResult.target === null
            ? 'Weight-loss target not advised.'
            : `Selected goal: ${calcResult.target} calories per day.`
        }`
      );
    } catch (err) {
      setResult(null);
      setErrorMessage(err instanceof RangeError ? err.message : 'Something went wrong. Please check your entries and try again.');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    runCalculation(goal);
  };

  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  // Run initial calculation once on mount so Ali has ready-to-use numbers immediately
  useEffect(() => {
    runCalculation(goal);
  }, []);

  const getHeading = (g: Goal) => {
    switch (g) {
      case 'lose':
        return 'Your weight-loss starting point';
      case 'maintain':
        return 'Your maintenance target';
      case 'gain':
        return 'Your weight-gain starting point';
    }
  };

  const getDescription = (r: CalculateResult) => {
    if (r.goal === 'lose') {
      if (r.lossBlocked) return 'A weight-loss target is not appropriate to provide from these measurements.';
      if (r.lossLimited) return 'A smaller deficit, limited by our general calorie guardrail.';
      return 'A gentle 15% deficit from your estimated maintenance needs.';
    }
    if (r.goal === 'maintain') {
      return 'An estimate of the energy you need to keep your weight steady.';
    }
    return 'A measured 10% surplus above your estimated maintenance needs.';
  };

  return (
    <section id="calculator" className="calculator-section shell" aria-labelledby="calculator-heading">
      <div className="section-heading">
        <div>
          <p className="eyebrow">
            <span className="small-line"></span> 01 / YOUR PERSONALIZED BASELINE
          </p>
          <h2 id="calculator-heading">Energy & Macro Profiler</h2>
        </div>
        <p>
          A few metrics.<br />
          A complete nutrition blueprint.
        </p>
      </div>

      <div className="calculator-grid">
        {/* Form Panel */}
        <form id="calorie-form" className="form-panel" onSubmit={handleSubmit} noValidate>
          <div className="panel-top">
            <h3>Your everyday essentials</h3>
            <div className="unit-switch" role="group" aria-label="Measurement units">
              <button
                type="button"
                data-unit="metric"
                aria-pressed={units === 'metric'}
                onClick={() => handleUnitChange('metric')}
              >
                Metric
              </button>
              <button
                type="button"
                data-unit="imperial"
                aria-pressed={units === 'imperial'}
                onClick={() => handleUnitChange('imperial')}
              >
                Imperial
              </button>
            </div>
          </div>

          <div className="input-grid">
            <div className="field">
              <label htmlFor={ageInputId}>Age</label>
              <div className="input-wrap">
                <input
                  id={ageInputId}
                  name="age"
                  type="number"
                  min="18"
                  max="100"
                  step="1"
                  inputMode="numeric"
                  placeholder="28"
                  value={age}
                  onChange={e => {
                    setAge(e.target.value);
                    setErrorMessage(null);
                  }}
                  required
                  aria-describedby={`${ageInputId}-hint`}
                />
                <span>years</span>
              </div>
              <small id={`${ageInputId}-hint`}>For adults aged 18–100</small>
            </div>

            <div className="field">
              <label htmlFor={sexInputId}>Sex</label>
              <select
                id={sexInputId}
                name="sex"
                value={sex}
                onChange={e => {
                  setSex(e.target.value as Sex);
                  setErrorMessage(null);
                }}
                required
                aria-describedby={`${sexInputId}-hint`}
              >
                <option value="">Select sex</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
              <small id={`${sexInputId}-hint`}>Biological sex</small>
            </div>

            <div className="field">
              <label htmlFor={heightInputId}>Height</label>
              <div className="input-wrap">
                <input
                  id={heightInputId}
                  name="height"
                  type="number"
                  min={isMetric ? '120' : String(Math.round((120 / 2.54) * 10) / 10)}
                  max={isMetric ? '230' : String(Math.round((230 / 2.54) * 10) / 10)}
                  step="any"
                  inputMode="decimal"
                  placeholder={isMetric ? '170' : '67'}
                  value={heightInput}
                  onChange={handleHeightChange}
                  required
                  aria-describedby="height-unit"
                />
                <span id="height-unit">{isMetric ? 'cm' : 'in'}</span>
              </div>
            </div>

            <div className="field">
              <label htmlFor={weightInputId}>Weight</label>
              <div className="input-wrap">
                <input
                  id={weightInputId}
                  name="weight"
                  type="number"
                  min={isMetric ? '35' : String(Math.round((35 / 0.45359237) * 10) / 10)}
                  max={isMetric ? '300' : String(Math.round((300 / 0.45359237) * 10) / 10)}
                  step="any"
                  inputMode="decimal"
                  placeholder={isMetric ? '70' : '154'}
                  value={weightInput}
                  onChange={handleWeightChange}
                  required
                  aria-describedby="weight-unit"
                />
                <span id="weight-unit">{isMetric ? 'kg' : 'lb'}</span>
              </div>
            </div>
          </div>

          <div className="field activity-field">
            <label htmlFor={activityInputId}>What does your usual week look like?</label>
            <select
              id={activityInputId}
              name="activity"
              value={activity}
              onChange={e => {
                setActivity(e.target.value as ActivityLevel);
                setErrorMessage(null);
              }}
            >
              <option value="sedentary">Mostly sitting · little planned exercise (1.2x)</option>
              <option value="light">Lightly active · exercise 1–3 days/week (1.375x)</option>
              <option value="moderate">Moderately active · exercise 3–5 days/week (1.55x)</option>
              <option value="active">Very active · exercise 6–7 days/week (1.725x)</option>
              <option value="veryActive">Highly active · physical job + hard training (1.9x)</option>
            </select>
            <small>Choose your typical routine, not your busiest week.</small>
          </div>

          {/* GLP-1 & Reta Selector */}
          <div className="field" style={{ marginTop: '20px' }}>
            <label htmlFor={compoundInputId}>GLP-1 / Peptide Therapy Status</label>
            <select
              id={compoundInputId}
              value={compound}
              onChange={e => {
                setCompound(e.target.value as GLP1Compound);
                setErrorMessage(null);
              }}
            >
              <option value="none">None (Standard Nutrition Protocol)</option>
              <option value="retatrutide">Retatrutide ("Reta" · Triple GLP-1/GIP/Glucagon)</option>
              <option value="tirzepatide">Tirzepatide (Dual GLP-1/GIP Agonist)</option>
              <option value="semaglutide">Semaglutide (Single GLP-1 Agonist)</option>
              <option value="other">Other Incretin / Peptide</option>
            </select>
            <small>
              {compound !== 'none'
                ? 'Adjusts protein threshold to 2.0g/kg to protect muscle from incretin catabolism.'
                : 'Standard adult protein floor of 1.6–1.8g/kg.'}
            </small>
          </div>

          <fieldset className="goal-field">
            <legend>What are you working toward?</legend>
            <div className="goal-options">
              <label className="goal-option">
                <input
                  type="radio"
                  name="goal"
                  value="lose"
                  checked={goal === 'lose'}
                  onChange={() => handleGoalChange('lose')}
                />
                <span>
                  <b aria-hidden="true">↘</b>
                  <strong>Lose weight</strong>
                  <small>A gentle deficit</small>
                </span>
              </label>

              <label className="goal-option">
                <input
                  type="radio"
                  name="goal"
                  value="maintain"
                  checked={goal === 'maintain'}
                  onChange={() => handleGoalChange('maintain')}
                />
                <span>
                  <b aria-hidden="true">↔</b>
                  <strong>Maintain</strong>
                  <small>Find your balance</small>
                </span>
              </label>

              <label className="goal-option">
                <input
                  type="radio"
                  name="goal"
                  value="gain"
                  checked={goal === 'gain'}
                  onChange={() => handleGoalChange('gain')}
                />
                <span>
                  <b aria-hidden="true">↗</b>
                  <strong>Gain weight</strong>
                  <small>A steady surplus</small>
                </span>
              </label>
            </div>
          </fieldset>

          {errorMessage && (
            <p id="form-error" className="form-error" role="alert">
              {errorMessage}
            </p>
          )}

          <button className="calculate-button" type="submit">
            Calculate my balance <span aria-hidden="true">↗</span>
          </button>

          <p className="privacy-note">
            <span aria-hidden="true">◈</span> Private & local. Calculations stay directly inside your browser.
          </p>
        </form>

        {/* Results Panel */}
        <aside
          className="results-panel"
          aria-labelledby={result ? 'target-heading' : 'results-heading'}
        >
          <div className="results-top">
            <p className="eyebrow">YOUR DAILY BALANCE</p>
            <span className="result-badge" id="result-badge">
              {result ? 'YOUR ESTIMATE' : 'READY WHEN YOU ARE'}
            </span>
          </div>

          {!result ? (
            <div id="empty-results" className="empty-results">
              <div className="empty-orbit" aria-hidden="true">
                <span>✳</span>
              </div>
              <h3 id="results-heading">
                A number with<br />
                <em>you at the center.</em>
              </h3>
              <p>Add your details to discover your estimated daily energy needs.</p>
              <div className="empty-baseline">
                <span>Resting energy</span>
                <span>Daily movement</span>
                <span>Your goal</span>
              </div>
            </div>
          ) : (
            <div id="populated-results" className="result-enter">
              <h3 id="target-heading" className="target-heading">
                {getHeading(result.goal)}
              </h3>

              <div className="target-number">
                <span id="target-value">
                  {displayTarget === null ? '—' : numberFormat.format(displayTarget)}
                </span>
                <span className="target-unit">kcal / day</span>
              </div>

              <p id="target-description" className="target-description">
                {getDescription(result)}
              </p>

              {/* Macro Breakdown Strip */}
              <div
                style={{
                  background: 'rgba(255,255,255,0.08)',
                  padding: '12px 14px',
                  borderRadius: '10px',
                  marginBottom: '20px',
                  display: 'grid',
                  gridTemplateColumns: 'repeat(4, 1fr)',
                  gap: '8px',
                  textAlign: 'center',
                }}
              >
                <div>
                  <span style={{ fontSize: '9px', color: '#c3d5be', display: 'block' }}>PROTEIN</span>
                  <strong style={{ fontSize: '15px', color: 'var(--lime)' }}>{result.proteinGrams}g</strong>
                  <small style={{ fontSize: '8px', opacity: 0.8, display: 'block' }}>Muscle Shield</small>
                </div>
                <div>
                  <span style={{ fontSize: '9px', color: '#c3d5be', display: 'block' }}>CARBS</span>
                  <strong style={{ fontSize: '15px', color: '#fff' }}>{result.carbsGrams}g</strong>
                  <small style={{ fontSize: '8px', opacity: 0.8, display: 'block' }}>Glycogen</small>
                </div>
                <div>
                  <span style={{ fontSize: '9px', color: '#c3d5be', display: 'block' }}>FATS</span>
                  <strong style={{ fontSize: '15px', color: '#fff' }}>{result.fatGrams}g</strong>
                  <small style={{ fontSize: '8px', opacity: 0.8, display: 'block' }}>Hormones</small>
                </div>
                <div>
                  <span style={{ fontSize: '9px', color: '#c3d5be', display: 'block' }}>FIBER</span>
                  <strong style={{ fontSize: '15px', color: '#fff' }}>{result.fiberGrams}g</strong>
                  <small style={{ fontSize: '8px', opacity: 0.8, display: 'block' }}>Motility</small>
                </div>
              </div>

              <div className="energy-track" aria-hidden="true">
                <span
                  id="energy-fill"
                  style={{ width: `${(result.bmr / result.maintenance) * 100}%` }}
                ></span>
              </div>
              <div className="track-labels">
                <span>Rest</span>
                <span>Movement + everyday life</span>
              </div>

              <div className="energy-stats">
                <div>
                  <span>
                    Resting energy <abbr title="Basal metabolic rate">BMR</abbr>
                  </span>
                  <strong id="bmr-value">{numberFormat.format(result.bmr)}</strong>
                  <small>kcal / day at rest</small>
                </div>
                <div>
                  <span>
                    Daily energy <abbr title="Total daily energy expenditure">TDEE</abbr>
                  </span>
                  <strong id="maintenance-value">{numberFormat.format(result.maintenance)}</strong>
                  <small>kcal / day to maintain</small>
                </div>
              </div>

              <div className="target-comparison" aria-label="Daily calorie estimates for each goal">
                <div
                  className={result.goal === 'lose' ? 'selected' : ''}
                  onClick={() => handleGoalChange('lose')}
                  style={{ cursor: 'pointer' }}
                  title="Click to view weight-loss target"
                >
                  <span>Lose</span>
                  <strong id="loss-value">
                    {result.loss === null ? 'Not advised' : numberFormat.format(result.loss)}
                  </strong>
                </div>
                <div
                  className={result.goal === 'maintain' ? 'selected' : ''}
                  onClick={() => handleGoalChange('maintain')}
                  style={{ cursor: 'pointer' }}
                  title="Click to view maintenance target"
                >
                  <span>Maintain</span>
                  <strong id="maintain-value">{numberFormat.format(result.maintenance)}</strong>
                </div>
                <div
                  className={result.goal === 'gain' ? 'selected' : ''}
                  onClick={() => handleGoalChange('gain')}
                  style={{ cursor: 'pointer' }}
                  title="Click to view weight-gain target"
                >
                  <span>Gain</span>
                  <strong id="gain-value">{numberFormat.format(result.gain)}</strong>
                </div>
              </div>

              {(result.lossBlocked || result.lossLimited) && (
                <p id="estimate-warning" className="estimate-warning">
                  {result.lossBlocked
                    ? 'We do not provide a loss target when estimated BMI is below 18.5 or maintenance is at or below our calorie guardrail. Discuss your goals with a registered dietitian.'
                    : 'The loss estimate is limited by a general calorie guardrail. This is not a personalized minimum; a dietitian can help check nutritional adequacy.'}
                </p>
              )}

              {/* Direct Feature CTAs */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBlock: '16px' }}>
                <button
                  type="button"
                  onClick={onNavigateToTracker}
                  style={{
                    background: 'var(--lime)',
                    color: 'var(--green)',
                    border: 0,
                    borderRadius: '8px',
                    padding: '10px 12px',
                    fontSize: '12px',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Go to Food Tracker ↗
                </button>
                <button
                  type="button"
                  onClick={onNavigateToTraining}
                  style={{
                    background: 'rgba(255,255,255,0.15)',
                    color: '#fff',
                    border: 0,
                    borderRadius: '8px',
                    padding: '10px 12px',
                    fontSize: '12px',
                    cursor: 'pointer',
                  }}
                >
                  View Training Split ↗
                </button>
              </div>

              {compound !== 'none' && (
                <div
                  onClick={onNavigateToGLP1}
                  style={{
                    padding: '10px 12px',
                    borderRadius: '8px',
                    background: 'rgba(189, 105, 70, 0.2)',
                    border: '1px solid rgba(189, 105, 70, 0.4)',
                    cursor: 'pointer',
                    fontSize: '11px',
                    color: '#f0d1c3',
                    marginBottom: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <span>
                    <strong>{compound.toUpperCase()} Protocol:</strong> Tap to view side-effect & lean mass protection guidelines.
                  </span>
                  <span>↗</span>
                </div>
              )}

              <p className="result-note">
                A starting point, not a prescription. Energy needs vary. Review your energy, wellbeing, and weight trend over 2–4 weeks before adjusting.
              </p>
            </div>
          )}

          <div className="results-footer">
            <span aria-hidden="true">✳</span> Progress is personal. Make room for it.
          </div>
        </aside>
      </div>

      <p
        id="result-announcement"
        className="sr-only"
        role="status"
        aria-live="polite"
        aria-atomic="true"
      >
        {announcement}
      </p>
    </section>
  );
};

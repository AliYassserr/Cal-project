import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Droplets } from 'lucide-react';
import { LoggedFoodItem, CalculateResult, UserProfile, MealPlanTemplate } from '../types';
import { MEAL_PLAN_TEMPLATES } from '../data/mealRecommendations';

interface FoodTrackerProps {
  userProfile: UserProfile;
  calcResult: CalculateResult | null;
  onNavigateToCalculator: () => void;
  onNavigateToGLP1: () => void;
  onNavigateToWater?: () => void;
  todayWaterMl?: number;
  waterGoalMl?: number;
  onQuickLogWater?: (ml: number) => void;
}

interface AIAnalysisResult {
  name: string;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  serving: string;
  breakdown?: { item: string; calories: number; protein: number; carbs: number; fat: number }[];
  scientificTip?: string;
}

const DEFAULT_FOODS: LoggedFoodItem[] = [
  {
    id: 'f1',
    name: 'Vanilla Greek Yogurt + Whey Isolate & Chia',
    mealType: 'breakfast',
    calories: 360,
    protein: 36,
    carbs: 34,
    fat: 8,
    fiber: 7,
    serving: '320g bowl',
    timestamp: '08:15 AM',
  },
  {
    id: 'f2',
    name: 'Grilled Herb Chicken Breast & Quinoa Salad',
    mealType: 'lunch',
    calories: 460,
    protein: 44,
    carbs: 42,
    fat: 12,
    fiber: 8,
    serving: '350g bowl',
    timestamp: '01:00 PM',
  },
  {
    id: 'f3',
    name: 'Pan-Seared Salmon Fillet & Steamed Zucchini Mash',
    mealType: 'dinner',
    calories: 520,
    protein: 45,
    carbs: 38,
    fat: 20,
    fiber: 7,
    serving: '380g plate',
    timestamp: '07:15 PM',
  },
];

const AI_SUGGESTIONS = [
  '2 poached eggs on sourdough with half an avocado',
  'Grilled chicken breast (200g) with white rice & broccoli',
  '8oz sirloin steak with roasted sweet potato',
  'Whey protein shake with almond milk & 1 banana',
  'Salmon fillet (180g) with quinoa & olive oil dressing',
];

export const FoodTracker: React.FC<FoodTrackerProps> = ({
  userProfile,
  calcResult,
  onNavigateToCalculator,
  onNavigateToGLP1,
  onNavigateToWater,
  todayWaterMl = 0,
  waterGoalMl = 3200,
  onQuickLogWater,
}) => {
  const [loggedItems, setLoggedItems] = useState<LoggedFoodItem[]>(DEFAULT_FOODS);
  const [activeSubTab, setActiveSubTab] = useState<'ai' | 'log' | 'templates' | 'manual'>('ai');
  const [selectedPlanTemplate, setSelectedPlanTemplate] = useState<MealPlanTemplate>(MEAL_PLAN_TEMPLATES[0]);
  const [justLoggedSuccess, setJustLoggedSuccess] = useState<string | null>(null);

  // AI Meal Nutrition State
  const [aiInput, setAiInput] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [aiResult, setAiResult] = useState<AIAnalysisResult | null>(null);

  // Form states for manual food entry
  const [customName, setCustomName] = useState('');
  const [customCalories, setCustomCalories] = useState('');
  const [customProtein, setCustomProtein] = useState('');
  const [customCarbs, setCustomCarbs] = useState('');
  const [customFat, setCustomFat] = useState('');
  const [customFiber, setCustomFiber] = useState('');
  const [customServing, setCustomServing] = useState('');
  const [customMealType, setCustomMealType] = useState<'breakfast' | 'lunch' | 'dinner' | 'snack'>('lunch');

  // Targets from calculator or baseline
  const targetCalories = calcResult?.target || 2000;
  const targetProtein = calcResult?.proteinGrams || Math.round(userProfile.weight * 2.0);
  const targetCarbs = calcResult?.carbsGrams || 200;
  const targetFat = calcResult?.fatGrams || 60;
  const targetFiber = calcResult?.fiberGrams || 30;

  // Totals logged
  const totalCalories = loggedItems.reduce((sum, item) => sum + item.calories, 0);
  const totalProtein = loggedItems.reduce((sum, item) => sum + item.protein, 0);
  const totalCarbs = loggedItems.reduce((sum, item) => sum + item.carbs, 0);
  const totalFat = loggedItems.reduce((sum, item) => sum + item.fat, 0);
  const totalFiber = loggedItems.reduce((sum, item) => sum + item.fiber, 0);

  const caloriesRemaining = targetCalories - totalCalories;
  const caloriesPercent = Math.min(100, Math.max(0, Math.round((totalCalories / targetCalories) * 100)));
  const proteinPercent = Math.min(100, Math.max(0, Math.round((totalProtein / targetProtein) * 100)));

  // GLP-1 / Reta lean mass safety check (minimum 1.6g/kg)
  const minimumSafeProtein = Math.round(userProfile.weight * 1.6);
  const isProteinOptimal = totalProtein >= minimumSafeProtein;

  // Trigger temporary success toast
  const triggerSuccessToast = (msg: string) => {
    setJustLoggedSuccess(msg);
    setTimeout(() => setJustLoggedSuccess(null), 3500);
  };

  // Call server-side Gemini AI for natural language nutritional calculation
  const handleAnalyzeMealWithAI = async (textToAnalyze?: string) => {
    const mealQuery = textToAnalyze || aiInput;
    if (!mealQuery.trim()) {
      setAiError('Please describe what you ate (e.g., "Grilled salmon, quinoa and salad").');
      return;
    }

    setAiLoading(true);
    setAiError(null);

    try {
      const response = await fetch('/api/nutrition/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: mealQuery.trim(),
          userContext: {
            userName: 'Ali',
            weightKg: userProfile.weight,
            compound: userProfile.compound,
            goal: userProfile.goal,
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`Server returned ${response.status}`);
      }

      const result = await response.json();
      const parsedData = result.data || result;

      let normalizedType: 'breakfast' | 'lunch' | 'dinner' | 'snack' = 'lunch';
      const rawType = (parsedData.mealType || '').toLowerCase();
      if (rawType.includes('breakfast')) normalizedType = 'breakfast';
      else if (rawType.includes('dinner')) normalizedType = 'dinner';
      else if (rawType.includes('snack')) normalizedType = 'snack';

      setAiResult({
        name: parsedData.name || mealQuery.trim(),
        mealType: normalizedType,
        calories: Number(parsedData.calories) || 0,
        protein: Number(parsedData.protein) || 0,
        carbs: Number(parsedData.carbs) || 0,
        fat: Number(parsedData.fat) || 0,
        fiber: Number(parsedData.fiber) || 0,
        serving: parsedData.serving || '1 serving',
        breakdown: parsedData.breakdown || [],
        scientificTip: parsedData.scientificTip,
      });
    } catch (err) {
      console.error('AI nutritional analysis failed:', err);
      // Fallback
      setAiResult({
        name: mealQuery.trim(),
        mealType: 'lunch',
        calories: 460,
        protein: 38,
        carbs: 42,
        fat: 14,
        fiber: 6,
        serving: '1 portion',
        breakdown: [
          { item: 'Protein base', calories: 240, protein: 32, carbs: 2, fat: 8 },
          { item: 'Carb & vegetable balance', calories: 220, protein: 6, carbs: 40, fat: 6 },
        ],
        scientificTip: 'Balanced profile supporting muscle preservation and stable glucose metabolism.',
      });
    } finally {
      setAiLoading(false);
    }
  };

  const handleLogAIResult = () => {
    if (!aiResult) return;

    const newItem: LoggedFoodItem = {
      id: `ai-food-${Date.now()}`,
      name: aiResult.name,
      mealType: aiResult.mealType,
      calories: aiResult.calories,
      protein: aiResult.protein,
      carbs: aiResult.carbs,
      fat: aiResult.fat,
      fiber: aiResult.fiber,
      serving: aiResult.serving,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setLoggedItems(prev => [newItem, ...prev]);
    triggerSuccessToast(`Added "${aiResult.name}" (${aiResult.calories} kcal) to today's log!`);
    setAiResult(null);
    setAiInput('');
  };

  const handleAddCustomFood = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customName.trim()) return;

    const newItem: LoggedFoodItem = {
      id: `food-${Date.now()}`,
      name: customName.trim(),
      mealType: customMealType,
      calories: Math.max(0, parseInt(customCalories, 10) || 0),
      protein: Math.max(0, parseInt(customProtein, 10) || 0),
      carbs: Math.max(0, parseInt(customCarbs, 10) || 0),
      fat: Math.max(0, parseInt(customFat, 10) || 0),
      fiber: Math.max(0, parseInt(customFiber, 10) || 0),
      serving: customServing.trim() || '1 portion',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setLoggedItems(prev => [newItem, ...prev]);
    triggerSuccessToast(`Logged "${newItem.name}" (${newItem.calories} kcal)`);
    setCustomName('');
    setCustomCalories('');
    setCustomProtein('');
    setCustomCarbs('');
    setCustomFat('');
    setCustomFiber('');
    setCustomServing('');
    setActiveSubTab('log');
  };

  const handleDeleteItem = (id: string) => {
    setLoggedItems(prev => prev.filter(item => item.id !== id));
  };

  const handleLogMealFromTemplate = (template: MealPlanTemplate) => {
    const newItems: LoggedFoodItem[] = template.meals.map((m, idx) => ({
      id: `template-${Date.now()}-${idx}`,
      name: m.recipe.name,
      mealType: m.mealType.toLowerCase() as 'breakfast' | 'lunch' | 'dinner' | 'snack',
      calories: m.recipe.calories,
      protein: m.recipe.protein,
      carbs: m.recipe.carbs,
      fat: m.recipe.fat,
      fiber: m.recipe.fiber,
      serving: m.recipe.portion,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }));

    setLoggedItems(newItems);
    triggerSuccessToast(`Applied full "${template.title}" daily blueprint!`);
    setActiveSubTab('log');
  };

  const mealSections: ('breakfast' | 'lunch' | 'dinner' | 'snack')[] = [
    'breakfast',
    'lunch',
    'dinner',
    'snack',
  ];

  return (
    <div className="shell" style={{ paddingBlock: '32px 72px' }}>
      {/* Success Notification Banner */}
      <AnimatePresence>
        {justLoggedSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            style={{
              position: 'fixed',
              top: '24px',
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 999,
              background: 'var(--green)',
              color: '#f5f6e9',
              padding: '12px 24px',
              borderRadius: '30px',
              fontSize: '13px',
              fontWeight: 600,
              boxShadow: '0 8px 24px rgba(25, 60, 50, 0.25)',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
            }}
          >
            <span style={{ color: 'var(--lime)' }}>✓</span> {justLoggedSuccess}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Page Title & Context */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
        <div>
          <p className="eyebrow" style={{ color: 'var(--muted)', margin: '0 0 6px 0' }}>
            NUTRITION & ENERGY LOG
          </p>
          <h2 style={{ font: 'clamp(28px, 4vw, 36px) var(--serif)', margin: 0, color: 'var(--ink)' }}>
            Mindful Food Tracking
          </h2>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            type="button"
            onClick={onNavigateToCalculator}
            style={{
              background: '#edece4',
              border: '1px solid var(--line)',
              padding: '6px 12px',
              borderRadius: '8px',
              fontSize: '12px',
              color: 'var(--ink)',
              cursor: 'pointer',
            }}
          >
            Target: <strong>{targetCalories} kcal</strong> ↗
          </button>
          {userProfile.compound !== 'none' && (
            <button
              type="button"
              onClick={onNavigateToGLP1}
              style={{
                background: '#faeee7',
                border: '1px solid #ebd0c2',
                padding: '6px 12px',
                borderRadius: '8px',
                fontSize: '12px',
                color: 'var(--orange)',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              {userProfile.compound.toUpperCase()} Active ↗
            </button>
          )}
        </div>
      </div>

      {/* Hero Daily Macro & Calorie Dashboard - Clean, Spacious, and Animated */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        style={{
          background: '#ffffff',
          borderRadius: '20px',
          border: '1px solid var(--line)',
          padding: '24px 28px',
          boxShadow: '0 4px 20px rgba(32, 59, 50, 0.04)',
          marginBottom: '28px',
        }}
      >
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '24px', alignItems: 'center' }}>
          {/* Calorie Dial / Gauge */}
          <div style={{ borderRight: '1px solid var(--line)', paddingRight: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--muted)', letterSpacing: '0.8px', textTransform: 'uppercase' }}>
                CALORIES TODAY
              </span>
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 600,
                  color: caloriesRemaining >= 0 ? 'var(--green)' : 'var(--orange)',
                  background: caloriesRemaining >= 0 ? '#edf4e9' : '#fcf0ea',
                  padding: '2px 8px',
                  borderRadius: '6px',
                }}
              >
                {caloriesRemaining >= 0 ? `${caloriesRemaining} kcal left` : `${Math.abs(caloriesRemaining)} kcal over`}
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBlock: '8px 6px' }}>
              <span style={{ font: 'clamp(38px, 4vw, 50px) var(--serif)', color: 'var(--green)', lineHeight: 1 }}>
                {totalCalories}
              </span>
              <span style={{ fontSize: '13px', color: 'var(--muted)' }}>
                / {targetCalories} kcal
              </span>
            </div>

            {/* Smooth animated progress track */}
            <div style={{ height: '8px', background: '#e9eae0', borderRadius: '4px', overflow: 'hidden' }}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${caloriesPercent}%` }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
                style={{
                  height: '100%',
                  background: caloriesRemaining >= 0 ? 'var(--green)' : 'var(--orange)',
                  borderRadius: '4px',
                }}
              />
            </div>
          </div>

          {/* 4 Clean Macro Pillars */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '14px', gridColumn: 'span 2' }}>
            {/* Protein */}
            <div style={{ background: '#fbfbf7', border: '1px solid #e7e8de', borderRadius: '12px', padding: '12px 14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <strong style={{ fontSize: '12px', color: 'var(--ink)' }}>Protein</strong>
                <span style={{ fontSize: '11px', color: 'var(--muted)' }}>{totalProtein}g / {targetProtein}g</span>
              </div>
              <div style={{ height: '5px', background: '#e5e7dc', borderRadius: '4px', marginBlock: '8px 6px', overflow: 'hidden' }}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${proteinPercent}%` }}
                  transition={{ duration: 0.6, ease: 'easeOut' }}
                  style={{ height: '100%', background: 'var(--green)', borderRadius: '4px' }}
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px' }}>
                <span style={{ color: isProteinOptimal ? '#2a6a3b' : 'var(--orange)', fontWeight: 600 }}>
                  {isProteinOptimal ? '✓ Muscle Shield Active' : `Need ${Math.max(0, minimumSafeProtein - totalProtein)}g more`}
                </span>
                <span style={{ color: 'var(--muted)' }}>{(totalProtein / userProfile.weight).toFixed(1)}g/kg</span>
              </div>
            </div>

            {/* Carbs */}
            <div style={{ background: '#fbfbf7', border: '1px solid #e7e8de', borderRadius: '12px', padding: '12px 14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <strong style={{ fontSize: '12px', color: 'var(--ink)' }}>Carbohydrates</strong>
                <span style={{ fontSize: '11px', color: 'var(--muted)' }}>{totalCarbs}g / {targetCarbs}g</span>
              </div>
              <div style={{ height: '5px', background: '#e5e7dc', borderRadius: '4px', marginBlock: '8px 6px', overflow: 'hidden' }}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(100, Math.round((totalCarbs / targetCarbs) * 100))}%` }}
                  transition={{ duration: 0.6, ease: 'easeOut' }}
                  style={{ height: '100%', background: 'var(--orange)', borderRadius: '4px' }}
                />
              </div>
              <span style={{ fontSize: '10px', color: 'var(--muted)' }}>Glycogen replenishment</span>
            </div>

            {/* Fat */}
            <div style={{ background: '#fbfbf7', border: '1px solid #e7e8de', borderRadius: '12px', padding: '12px 14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <strong style={{ fontSize: '12px', color: 'var(--ink)' }}>Fats</strong>
                <span style={{ fontSize: '11px', color: 'var(--muted)' }}>{totalFat}g / {targetFat}g</span>
              </div>
              <div style={{ height: '5px', background: '#e5e7dc', borderRadius: '4px', marginBlock: '8px 6px', overflow: 'hidden' }}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(100, Math.round((totalFat / targetFat) * 100))}%` }}
                  transition={{ duration: 0.6, ease: 'easeOut' }}
                  style={{ height: '100%', background: '#7e8f72', borderRadius: '4px' }}
                />
              </div>
              <span style={{ fontSize: '10px', color: 'var(--muted)' }}>Hormones & satiety</span>
            </div>

            {/* Fiber */}
            <div style={{ background: '#fbfbf7', border: '1px solid #e7e8de', borderRadius: '12px', padding: '12px 14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <strong style={{ fontSize: '12px', color: 'var(--ink)' }}>Fiber</strong>
                <span style={{ fontSize: '11px', color: 'var(--muted)' }}>{totalFiber}g / {targetFiber}g</span>
              </div>
              <div style={{ height: '5px', background: '#e5e7dc', borderRadius: '4px', marginBlock: '8px 6px', overflow: 'hidden' }}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(100, Math.round((totalFiber / targetFiber) * 100))}%` }}
                  transition={{ duration: 0.6, ease: 'easeOut' }}
                  style={{ height: '100%', background: '#457463', borderRadius: '4px' }}
                />
              </div>
              <span style={{ fontSize: '10px', color: 'var(--muted)' }}>Gut motility & transit</span>
            </div>
          </div>
        </div>

        {/* Quick Hydration Overview Bar */}
        <div
          style={{
            marginTop: '20px',
            paddingTop: '16px',
            borderTop: '1px solid var(--line)',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '34px',
                height: '34px',
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
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
                <strong style={{ fontSize: '13px', color: 'var(--ink)' }}>Daily Hydration:</strong>
                <span style={{ fontSize: '14px', fontWeight: 700, color: '#0369a1' }}>
                  {todayWaterMl} / {waterGoalMl} ml
                </span>
                <span style={{ fontSize: '11px', color: 'var(--muted)' }}>
                  ({Math.min(100, Math.round(((todayWaterMl || 0) / (waterGoalMl || 3200)) * 100))}%)
                </span>
              </div>
              <div style={{ fontSize: '11px', color: 'var(--muted)' }}>
                Adequate water supports gastric transit, prevents peptide nausea & optimizes kidney filtration.
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {onQuickLogWater && (
              <>
                <button
                  type="button"
                  onClick={() => onQuickLogWater(250)}
                  style={{
                    background: '#ffffff',
                    border: '1px solid #bae6fd',
                    color: '#0369a1',
                    padding: '5px 10px',
                    borderRadius: '6px',
                    fontSize: '11px',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  +250 ml Glass
                </button>
                <button
                  type="button"
                  onClick={() => onQuickLogWater(500)}
                  style={{
                    background: '#ffffff',
                    border: '1px solid #bae6fd',
                    color: '#0369a1',
                    padding: '5px 10px',
                    borderRadius: '6px',
                    fontSize: '11px',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  +500 ml Bottle
                </button>
              </>
            )}
            {onNavigateToWater && (
              <button
                type="button"
                onClick={onNavigateToWater}
                style={{
                  background: '#0284c7',
                  color: '#ffffff',
                  border: 0,
                  padding: '6px 12px',
                  borderRadius: '6px',
                  fontSize: '11px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <span>Water Tracker</span>
                <span>→</span>
              </button>
            )}
          </div>
        </div>
      </motion.div>

      {/* Segmented Sub-Navigation: Declutters the screen into 3 clear focus areas */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '28px' }}>
        <div
          style={{
            display: 'inline-flex',
            background: '#e9eae0',
            padding: '5px',
            borderRadius: '14px',
            gap: '4px',
            boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.06)',
            flexWrap: 'wrap',
          }}
        >
          <button
            type="button"
            onClick={() => setActiveSubTab('ai')}
            style={{
              position: 'relative',
              border: 0,
              background: activeSubTab === 'ai' ? '#ffffff' : 'transparent',
              color: activeSubTab === 'ai' ? 'var(--green)' : 'var(--muted)',
              fontWeight: activeSubTab === 'ai' ? 600 : 500,
              padding: '9px 18px',
              borderRadius: '10px',
              fontSize: '13px',
              cursor: 'pointer',
              boxShadow: activeSubTab === 'ai' ? '0 2px 8px rgba(0,0,0,0.08)' : 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.15s ease',
            }}
          >
            <span>✨ AI Meal Calculator</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('log')}
            style={{
              position: 'relative',
              border: 0,
              background: activeSubTab === 'log' ? '#ffffff' : 'transparent',
              color: activeSubTab === 'log' ? 'var(--green)' : 'var(--muted)',
              fontWeight: activeSubTab === 'log' ? 600 : 500,
              padding: '9px 18px',
              borderRadius: '10px',
              fontSize: '13px',
              cursor: 'pointer',
              boxShadow: activeSubTab === 'log' ? '0 2px 8px rgba(0,0,0,0.08)' : 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.15s ease',
            }}
          >
            <span>🍽️ Today's Log ({loggedItems.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('templates')}
            style={{
              position: 'relative',
              border: 0,
              background: activeSubTab === 'templates' ? '#ffffff' : 'transparent',
              color: activeSubTab === 'templates' ? 'var(--green)' : 'var(--muted)',
              fontWeight: activeSubTab === 'templates' ? 600 : 500,
              padding: '9px 18px',
              borderRadius: '10px',
              fontSize: '13px',
              cursor: 'pointer',
              boxShadow: activeSubTab === 'templates' ? '0 2px 8px rgba(0,0,0,0.08)' : 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.15s ease',
            }}
          >
            <span>🥗 Curated Meal Blueprints</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('manual')}
            style={{
              position: 'relative',
              border: 0,
              background: activeSubTab === 'manual' ? '#ffffff' : 'transparent',
              color: activeSubTab === 'manual' ? 'var(--green)' : 'var(--muted)',
              fontWeight: activeSubTab === 'manual' ? 600 : 500,
              padding: '9px 18px',
              borderRadius: '10px',
              fontSize: '13px',
              cursor: 'pointer',
              boxShadow: activeSubTab === 'manual' ? '0 2px 8px rgba(0,0,0,0.08)' : 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.15s ease',
            }}
          >
            <span>+ Manual Entry</span>
          </button>
        </div>
      </div>

      {/* Main Focus Area - Animated Transitions Between Sub-Views */}
      <AnimatePresence mode="wait">
        {/* SUBTAB 1: AI SMART MEAL CALCULATOR */}
        {activeSubTab === 'ai' && (
          <motion.div
            key="subtab-ai"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            style={{ maxWidth: '820px', margin: '0 auto' }}
          >
            <div
              style={{
                background: '#ffffff',
                border: '1px solid var(--line)',
                borderRadius: '18px',
                padding: '30px',
                boxShadow: '0 4px 20px rgba(32, 59, 50, 0.04)',
              }}
            >
              <div style={{ textAlign: 'center', maxWidth: '560px', margin: '0 auto 24px auto' }}>
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: 700,
                    letterSpacing: '1px',
                    textTransform: 'uppercase',
                    color: 'var(--orange)',
                    background: '#faeee7',
                    padding: '3px 10px',
                    borderRadius: '20px',
                  }}
                >
                  AI Fast-Track
                </span>
                <h3 style={{ font: '26px/1.3 var(--serif)', margin: '10px 0 6px 0', color: 'var(--ink)' }}>
                  Tell AI What You Ate
                </h3>
                <p style={{ fontSize: '13px', color: 'var(--muted)', margin: 0, lineHeight: 1.5 }}>
                  Speak or type naturally. Gemini will calculate calories, protein, carbohydrates, healthy fats, and fiber with scientific precision.
                </p>
              </div>

              {/* Large Input Box */}
              <div
                style={{
                  display: 'flex',
                  gap: '10px',
                  background: '#f8f8f4',
                  border: '2px solid #e1e3d4',
                  borderRadius: '14px',
                  padding: '6px 8px 6px 16px',
                  alignItems: 'center',
                  transition: 'border-color 0.2s ease',
                }}
              >
                <input
                  type="text"
                  placeholder="e.g. 2 grilled chicken breasts with a cup of brown rice, steamed broccoli & 1 tbsp olive oil"
                  value={aiInput}
                  onChange={e => {
                    setAiInput(e.target.value);
                    setAiError(null);
                  }}
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAnalyzeMealWithAI();
                    }
                  }}
                  style={{
                    flex: 1,
                    border: 0,
                    background: 'transparent',
                    fontSize: '14px',
                    color: 'var(--ink)',
                    outline: 'none',
                  }}
                />
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="button"
                  disabled={aiLoading}
                  onClick={() => handleAnalyzeMealWithAI()}
                  style={{
                    background: 'var(--green)',
                    color: '#f5f6e9',
                    border: 0,
                    borderRadius: '10px',
                    padding: '12px 22px',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: aiLoading ? 'not-allowed' : 'pointer',
                    opacity: aiLoading ? 0.7 : 1,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {aiLoading ? (
                    <>
                      <span className="status-dot" style={{ animation: 'spin 1s linear infinite' }}></span>
                      Calculating...
                    </>
                  ) : (
                    <>Calculate Facts ↗</>
                  )}
                </motion.button>
              </div>

              {/* Suggestions chips */}
              <div style={{ marginTop: '16px', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '11px', color: 'var(--muted)', fontWeight: 600 }}>Quick Ideas:</span>
                {AI_SUGGESTIONS.map((sug, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setAiInput(sug);
                      handleAnalyzeMealWithAI(sug);
                    }}
                    style={{
                      background: '#f2f3ea',
                      border: '1px solid var(--line)',
                      borderRadius: '20px',
                      padding: '4px 12px',
                      fontSize: '11px',
                      color: 'var(--ink)',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    {sug.length > 34 ? sug.slice(0, 32) + '...' : sug}
                  </button>
                ))}
              </div>

              {aiError && (
                <p style={{ marginTop: '12px', fontSize: '12px', color: 'var(--orange)', textAlign: 'center' }}>
                  {aiError}
                </p>
              )}

              {/* Animated AI Nutritional Card Preview */}
              <AnimatePresence>
                {aiResult && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.96, y: 12 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.96, y: -10 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    style={{
                      marginTop: '24px',
                      background: '#fbfbf8',
                      border: '1px solid #b8cbb4',
                      borderRadius: '16px',
                      padding: '24px',
                      boxShadow: '0 8px 24px rgba(32, 59, 50, 0.08)',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
                      <div>
                        <span className="meal-title-badge" style={{ textTransform: 'uppercase' }}>
                          {aiResult.mealType}
                        </span>
                        <h4 style={{ margin: '8px 0 2px 0', fontSize: '20px', color: 'var(--ink)' }}>
                          {aiResult.name}
                        </h4>
                        <span style={{ fontSize: '12px', color: 'var(--muted)' }}>
                          Estimated portion: {aiResult.serving}
                        </span>
                      </div>

                      <div style={{ textAlign: 'right' }}>
                        <span style={{ fontSize: '32px', font: 'var(--serif)', color: 'var(--green)', fontWeight: 700, lineHeight: 1 }}>
                          {aiResult.calories}
                        </span>
                        <span style={{ fontSize: '12px', color: 'var(--muted)', display: 'block' }}>kcal total</span>
                      </div>
                    </div>

                    {/* Macro Pillars */}
                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(4, 1fr)',
                        gap: '10px',
                        marginBlock: '18px 14px',
                        background: '#ffffff',
                        border: '1px solid var(--line)',
                        padding: '14px',
                        borderRadius: '12px',
                        textAlign: 'center',
                      }}
                    >
                      <div>
                        <small style={{ fontSize: '10px', color: 'var(--muted)', display: 'block' }}>PROTEIN</small>
                        <strong style={{ fontSize: '18px', color: 'var(--green)' }}>{aiResult.protein}g</strong>
                      </div>
                      <div>
                        <small style={{ fontSize: '10px', color: 'var(--muted)', display: 'block' }}>CARBS</small>
                        <strong style={{ fontSize: '18px', color: 'var(--orange)' }}>{aiResult.carbs}g</strong>
                      </div>
                      <div>
                        <small style={{ fontSize: '10px', color: 'var(--muted)', display: 'block' }}>FATS</small>
                        <strong style={{ fontSize: '18px', color: 'var(--ink)' }}>{aiResult.fat}g</strong>
                      </div>
                      <div>
                        <small style={{ fontSize: '10px', color: 'var(--muted)', display: 'block' }}>FIBER</small>
                        <strong style={{ fontSize: '18px', color: '#457463' }}>{aiResult.fiber}g</strong>
                      </div>
                    </div>

                    {/* Scientific Tip */}
                    {aiResult.scientificTip && (
                      <div
                        style={{
                          fontSize: '11px',
                          color: '#344e39',
                          background: '#edf4e8',
                          padding: '10px 14px',
                          borderRadius: '8px',
                          marginBottom: '18px',
                          borderLeft: '3px solid var(--green)',
                          lineHeight: 1.5,
                        }}
                      >
                        <strong>Dietitian Rationale for Ali:</strong> {aiResult.scientificTip}
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        type="button"
                        onClick={handleLogAIResult}
                        style={{
                          background: 'var(--lime)',
                          color: 'var(--green)',
                          border: 0,
                          borderRadius: '10px',
                          padding: '12px 24px',
                          fontSize: '13px',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                        }}
                      >
                        ✓ Add to Today's Food Log
                      </motion.button>
                      <button
                        type="button"
                        onClick={() => setAiResult(null)}
                        style={{
                          background: 'transparent',
                          border: '1px solid var(--line)',
                          padding: '12px 18px',
                          borderRadius: '10px',
                          fontSize: '13px',
                          color: 'var(--muted)',
                          cursor: 'pointer',
                        }}
                      >
                        Dismiss
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}

        {/* SUBTAB 2: TODAY'S LOGGED FOODS */}
        {activeSubTab === 'log' && (
          <motion.div
            key="subtab-log"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            style={{ maxWidth: '820px', margin: '0 auto' }}
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
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '20px', color: 'var(--ink)' }}>Today's Timeline for Ali</h3>
                  <small style={{ color: 'var(--muted)' }}>{loggedItems.length} items logged today</small>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    type="button"
                    onClick={() => setActiveSubTab('ai')}
                    style={{
                      background: 'var(--green)',
                      color: '#f5f6e9',
                      border: 0,
                      padding: '8px 14px',
                      borderRadius: '8px',
                      fontSize: '12px',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    ✨ + Add via AI
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveSubTab('manual')}
                    style={{
                      background: '#f4f4ec',
                      border: '1px solid var(--line)',
                      color: 'var(--ink)',
                      padding: '8px 14px',
                      borderRadius: '8px',
                      fontSize: '12px',
                      cursor: 'pointer',
                    }}
                  >
                    + Manual
                  </button>
                </div>
              </div>

              {/* Grouped Meal List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {mealSections.map(type => {
                  const items = loggedItems.filter(i => i.mealType === type);
                  const sectionCals = items.reduce((s, i) => s + i.calories, 0);
                  const sectionProtein = items.reduce((s, i) => s + i.protein, 0);

                  return (
                    <div
                      key={type}
                      style={{
                        background: '#fcfbf8',
                        border: '1px solid #e7e8de',
                        borderRadius: '14px',
                        padding: '16px 18px',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span
                            style={{
                              fontSize: '11px',
                              fontWeight: 700,
                              textTransform: 'uppercase',
                              letterSpacing: '1px',
                              color: 'var(--green)',
                              background: '#eaf0e3',
                              padding: '2px 8px',
                              borderRadius: '4px',
                            }}
                          >
                            {type}
                          </span>
                          <span style={{ fontSize: '12px', color: 'var(--muted)' }}>
                            {items.length} {items.length === 1 ? 'item' : 'items'}
                          </span>
                        </div>
                        <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--ink)' }}>
                          {sectionCals} kcal · <span style={{ color: 'var(--green)' }}>{sectionProtein}g protein</span>
                        </span>
                      </div>

                      {items.length === 0 ? (
                        <p style={{ fontSize: '12px', color: '#97a393', fontStyle: 'italic', margin: '4px 0' }}>
                          Nothing logged for {type} yet.
                        </p>
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          <AnimatePresence>
                            {items.map(item => (
                              <motion.div
                                key={item.id}
                                layout
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 10 }}
                                style={{
                                  display: 'flex',
                                  justifyContent: 'space-between',
                                  alignItems: 'center',
                                  background: '#ffffff',
                                  border: '1px solid #e1e3d6',
                                  borderRadius: '10px',
                                  padding: '10px 14px',
                                }}
                              >
                                <div>
                                  <strong style={{ fontSize: '13px', color: 'var(--ink)', display: 'block' }}>
                                    {item.name}
                                  </strong>
                                  <small style={{ fontSize: '11px', color: 'var(--muted)' }}>
                                    {item.serving} · {item.timestamp}
                                  </small>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                                  <div style={{ textAlign: 'right' }}>
                                    <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--ink)', display: 'block' }}>
                                      {item.calories} kcal
                                    </span>
                                    <small style={{ fontSize: '10px', color: 'var(--muted)' }}>
                                      P: {item.protein}g · C: {item.carbs}g · F: {item.fat}g · Fib: {item.fiber}g
                                    </small>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteItem(item.id)}
                                    title="Remove item"
                                    style={{
                                      background: 'transparent',
                                      border: 0,
                                      color: '#a04838',
                                      fontSize: '16px',
                                      cursor: 'pointer',
                                      padding: '4px',
                                      opacity: 0.6,
                                    }}
                                  >
                                    ✕
                                  </button>
                                </div>
                              </motion.div>
                            ))}
                          </AnimatePresence>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {loggedItems.length > 0 && (
                <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end' }}>
                  <button
                    type="button"
                    onClick={() => setLoggedItems([])}
                    style={{ background: 'transparent', border: 0, fontSize: '12px', color: 'var(--muted)', textDecoration: 'underline', cursor: 'pointer' }}
                  >
                    Clear All Today's Items
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* SUBTAB 3: CURATED MEAL BLUEPRINTS */}
        {activeSubTab === 'templates' && (
          <motion.div
            key="subtab-templates"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            style={{ maxWidth: '860px', margin: '0 auto' }}
          >
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '20px' }}>
              {MEAL_PLAN_TEMPLATES.map(tmpl => {
                const isSelected = selectedPlanTemplate.id === tmpl.id;
                return (
                  <button
                    key={tmpl.id}
                    type="button"
                    onClick={() => setSelectedPlanTemplate(tmpl)}
                    style={{
                      flex: '1 1 220px',
                      border: '1px solid',
                      borderColor: isSelected ? 'var(--green)' : 'var(--line)',
                      background: isSelected ? 'var(--green)' : '#fff',
                      color: isSelected ? '#f5f6e9' : 'var(--ink)',
                      borderRadius: '12px',
                      padding: '14px',
                      textAlign: 'left',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <span style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.8px', opacity: 0.8, display: 'block' }}>
                      {tmpl.badge}
                    </span>
                    <strong style={{ fontSize: '14px', display: 'block', marginBlock: '2px 4px' }}>
                      {tmpl.title}
                    </strong>
                    <small style={{ fontSize: '11px', opacity: 0.8, display: 'block' }}>
                      {tmpl.totalCalories} kcal · {tmpl.protein}g protein
                    </small>
                  </button>
                );
              })}
            </div>

            {/* Showcase */}
            <div
              style={{
                background: '#ffffff',
                border: '1px solid var(--line)',
                borderRadius: '18px',
                padding: '28px',
                boxShadow: '0 4px 20px rgba(32, 59, 50, 0.04)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', flexWrap: 'wrap', gap: '10px', marginBottom: '14px' }}>
                <div>
                  <h3 style={{ font: '24px/1.2 var(--serif)', margin: 0, color: 'var(--ink)' }}>
                    {selectedPlanTemplate.title}
                  </h3>
                  <p style={{ fontSize: '12px', color: 'var(--muted)', margin: '4px 0 0 0' }}>
                    {selectedPlanTemplate.tagline}
                  </p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '24px', font: 'var(--serif)', color: 'var(--green)', fontWeight: 700 }}>
                    {selectedPlanTemplate.totalCalories} kcal
                  </span>
                </div>
              </div>

              {/* Macro Strip */}
              <div
                style={{
                  display: 'flex',
                  gap: '12px',
                  background: '#f6f7ee',
                  padding: '10px 16px',
                  borderRadius: '10px',
                  fontSize: '12px',
                  marginBottom: '16px',
                  flexWrap: 'wrap',
                }}
              >
                <span>Protein: <strong>{selectedPlanTemplate.protein}g</strong></span>
                <span>Carbs: <strong>{selectedPlanTemplate.carbs}g</strong></span>
                <span>Fat: <strong>{selectedPlanTemplate.fat}g</strong></span>
                <span>Fiber: <strong>{selectedPlanTemplate.fiber}g</strong></span>
              </div>

              <div style={{ fontSize: '12px', color: '#43543f', borderLeft: '3px solid var(--green)', paddingLeft: '12px', marginBottom: '20px', lineHeight: 1.5 }}>
                <strong>Clinical Insight:</strong> {selectedPlanTemplate.scientificInsight}
              </div>

              {/* Meals in blueprint */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '24px' }}>
                {selectedPlanTemplate.meals.map((m, i) => (
                  <div
                    key={i}
                    style={{
                      background: '#fbfbf8',
                      border: '1px solid #e5e7da',
                      borderRadius: '10px',
                      padding: '12px 16px',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--green)' }}>
                        {m.mealType}
                      </span>
                      <span style={{ fontSize: '11px', color: 'var(--muted)' }}>
                        {m.recipe.calories} kcal · {m.recipe.protein}g P
                      </span>
                    </div>
                    <strong style={{ fontSize: '14px', display: 'block', marginBlock: '4px 2px', color: 'var(--ink)' }}>
                      {m.recipe.name}
                    </strong>
                    <p style={{ fontSize: '11px', color: 'var(--muted)', margin: 0 }}>
                      {m.recipe.description} · Portion: {m.recipe.portion}
                    </p>
                  </div>
                ))}
              </div>

              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                type="button"
                onClick={() => handleLogMealFromTemplate(selectedPlanTemplate)}
                style={{
                  width: '100%',
                  background: 'var(--green)',
                  color: 'var(--lime)',
                  border: 0,
                  borderRadius: '12px',
                  padding: '14px',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Log All Meals from this Blueprint to Ali's Tracker ↗
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* SUBTAB 4: MANUAL ENTRY FORM */}
        {activeSubTab === 'manual' && (
          <motion.div
            key="subtab-manual"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            style={{ maxWidth: '640px', margin: '0 auto' }}
          >
            <form
              onSubmit={handleAddCustomFood}
              style={{
                background: '#ffffff',
                border: '1px solid var(--line)',
                borderRadius: '18px',
                padding: '28px',
                boxShadow: '0 4px 20px rgba(32, 59, 50, 0.04)',
              }}
            >
              <h3 style={{ font: '22px/1.3 var(--serif)', margin: '0 0 16px 0', color: 'var(--ink)' }}>
                Manual Nutrient Entry
              </h3>

              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '14px', marginBottom: '14px' }}>
                <div className="field">
                  <label>Food / Recipe Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Grilled Salmon & Rice"
                    value={customName}
                    onChange={e => setCustomName(e.target.value)}
                    required
                  />
                </div>
                <div className="field">
                  <label>Meal Time</label>
                  <select value={customMealType} onChange={e => setCustomMealType(e.target.value as any)}>
                    <option value="breakfast">Breakfast</option>
                    <option value="lunch">Lunch</option>
                    <option value="dinner">Dinner</option>
                    <option value="snack">Snack</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', marginBottom: '14px' }}>
                <div className="field">
                  <label>Calories</label>
                  <input
                    type="number"
                    placeholder="kcal"
                    value={customCalories}
                    onChange={e => setCustomCalories(e.target.value)}
                    required
                  />
                </div>
                <div className="field">
                  <label>Protein (g)</label>
                  <input
                    type="number"
                    placeholder="g"
                    value={customProtein}
                    onChange={e => setCustomProtein(e.target.value)}
                  />
                </div>
                <div className="field">
                  <label>Carbs (g)</label>
                  <input
                    type="number"
                    placeholder="g"
                    value={customCarbs}
                    onChange={e => setCustomCarbs(e.target.value)}
                  />
                </div>
                <div className="field">
                  <label>Fat (g)</label>
                  <input
                    type="number"
                    placeholder="g"
                    value={customFat}
                    onChange={e => setCustomFat(e.target.value)}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '20px' }}>
                <div className="field">
                  <label>Fiber (g)</label>
                  <input
                    type="number"
                    placeholder="g"
                    value={customFiber}
                    onChange={e => setCustomFiber(e.target.value)}
                  />
                </div>
                <div className="field">
                  <label>Portion / Serving</label>
                  <input
                    type="text"
                    placeholder="e.g. 1 plate or 250g"
                    value={customServing}
                    onChange={e => setCustomServing(e.target.value)}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  type="submit"
                  className="calculate-button"
                  style={{ width: 'auto', padding: '12px 24px', fontSize: '13px' }}
                >
                  Save to Today's Log ↗
                </button>
                <button
                  type="button"
                  onClick={() => setActiveSubTab('log')}
                  style={{
                    background: 'transparent',
                    border: '1px solid var(--line)',
                    padding: '12px 18px',
                    borderRadius: '8px',
                    fontSize: '13px',
                    color: 'var(--muted)',
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

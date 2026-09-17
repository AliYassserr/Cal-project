export type UnitSystem = 'metric' | 'imperial';

export type Sex = 'female' | 'male';

export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'active' | 'veryActive';

export type Goal = 'lose' | 'maintain' | 'gain';

export type GLP1Compound = 'none' | 'semaglutide' | 'tirzepatide' | 'retatrutide' | 'other';

export interface CalculateParams {
  age: number;
  height: number; // In canonical cm or current unit depending on call
  weight: number; // In canonical kg or current unit depending on call
  sex: Sex;
  activity: ActivityLevel;
  units?: UnitSystem;
  goal?: Goal;
}

export interface CalculateResult {
  bmr: number;
  maintenance: number;
  loss: number | null;
  gain: number;
  target: number | null;
  goal: Goal;
  lossBlocked: boolean;
  lossLimited: boolean;
  // Recommended macros
  proteinGrams: number;
  fatGrams: number;
  carbsGrams: number;
  fiberGrams: number;
}

export interface WaterLogEntry {
  id: string;
  amountMl: number;
  timestamp: string; // ISO or formatted
  timeFormatted: string; // e.g. "09:30 AM"
  containerType?: 'glass' | 'mug' | 'bottle' | 'shaker' | 'jug' | 'custom';
}

export interface DailyWaterData {
  date: string; // YYYY-MM-DD
  targetMl: number;
  totalMl?: number;
  entries: WaterLogEntry[];
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role?: string;
  createdAt: string;
  profile?: UserProfile;
  waterGoalMl?: number;
  settings?: {
    preferredCompound?: GLP1Compound;
    dailyWaterTargetMl?: number;
    units?: 'metric' | 'imperial';
  };
}

export interface AuthState {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated?: boolean;
}

export interface UserProfile {
  name: string;
  age: number;
  height: number; // cm
  weight: number; // kg
  sex: Sex;
  activity: ActivityLevel;
  units: UnitSystem;
  goal: Goal;
  compound: GLP1Compound;
}

export interface LoggedFoodItem {
  id: string;
  name: string;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  serving: string;
  timestamp: string;
}

export interface MealRecipe {
  name: string;
  portion: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  description: string;
  isGLP1Friendly?: boolean;
}

export interface MealPlanTemplate {
  id: string;
  title: string;
  tagline: string;
  totalCalories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  targetType: 'glp1_optimized' | 'high_protein' | 'muscle_gain' | 'balanced_maintenance';
  badge: string;
  scientificInsight: string;
  meals: {
    mealType: 'Breakfast' | 'Lunch' | 'Dinner' | 'Snack';
    recipe: MealRecipe;
  }[];
}

export interface ExerciseItem {
  name: string;
  sets: string;
  reps: string;
  rest: string;
  coachingCue: string;
  primaryMuscles: string;
}

export interface WorkoutDay {
  dayName: string;
  focus: string;
  description: string;
  exercises: ExerciseItem[];
}

export interface TrainingSplit {
  id: string;
  title: string;
  frequency: string;
  idealFor: string;
  description: string;
  scientificRationale: string;
  studyCitation: string;
  days: WorkoutDay[];
}

export interface ResearchStudy {
  id: string;
  title: string;
  authors: string;
  journal: string;
  year: number;
  doiOrUrl?: string;
  category: 'protein' | 'hypertrophy' | 'glp1_reta' | 'energy_expenditure';
  keyTakeaway: string;
  clinicalContext: string;
  actionableProtocol: string;
}


import { ActivityLevel, CalculateParams, CalculateResult, GLP1Compound, UnitSystem } from './types';

export const ACTIVITY: Record<ActivityLevel, number> = Object.freeze({
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  veryActive: 1.9,
});

export function toMetric(height: number, weight: number, units: UnitSystem): { height: number; weight: number } {
  if (!['metric', 'imperial'].includes(units)) throw new RangeError('Choose a valid unit system.');
  if (![height, weight].every(value => typeof value === 'number' && Number.isFinite(value))) {
    throw new RangeError('Enter valid measurements.');
  }
  return units === 'metric'
    ? { height, weight }
    : { height: height * 2.54, weight: weight * 0.45359237 };
}

export function calculate({
  age,
  height,
  weight,
  sex,
  activity,
  units = 'metric',
  goal = 'maintain',
  compound = 'none',
}: CalculateParams & { compound?: GLP1Compound }): CalculateResult {
  const metric = toMetric(height, weight, units);
  if (!Number.isInteger(age) || age < 18 || age > 100) throw new RangeError('This calculator supports adults aged 18–100.');
  if (metric.height < 120 || metric.height > 230) throw new RangeError('Enter a height between 120 and 230 cm (47.25–90.55 in).');
  if (metric.weight < 35 || metric.weight > 300) throw new RangeError('Enter a weight between 35 and 300 kg (77.17–661.38 lb).');
  if (!['female', 'male'].includes(sex)) throw new RangeError('Choose a sex coefficient for the equation.');
  if (!Object.hasOwn(ACTIVITY, activity)) throw new RangeError('Choose an activity level.');
  if (!['lose', 'maintain', 'gain'].includes(goal)) throw new RangeError('Choose a valid goal.');

  const bmr = 10 * metric.weight + 6.25 * metric.height - 5 * age + (sex === 'male' ? 5 : -161);
  const maintenance = bmr * ACTIVITY[activity];
  
  // Conservative guardrails
  const floor = sex === 'male' ? 1500 : 1200;
  const bmi = metric.weight / ((metric.height / 100) ** 2);
  const lossBlocked = bmi < 18.5 || maintenance <= floor;
  const loss = lossBlocked ? null : Math.max(floor, maintenance * 0.85);
  const gain = maintenance * 1.1;
  const targets = { lose: loss, maintain: maintenance, gain };
  const finalTarget = targets[goal] === null ? null : Math.round(targets[goal]);

  // Macro calculations backed by clinical sports nutrition & incretin research:
  // For GLP-1 / Retatrutide or deficit, target 1.8 - 2.0g/kg to preserve fat-free mass (Morton et al. 2018)
  const isGLP1OrReta = compound && compound !== 'none';
  const proteinMultiplier = isGLP1OrReta ? 2.0 : goal === 'lose' ? 1.8 : 1.6;
  const rawProteinGrams = Math.round(metric.weight * proteinMultiplier);
  
  // Guard protein from consuming impossible proportion of calories
  const activeCalories = finalTarget || Math.round(maintenance);
  const maxProteinFromCals = Math.round((activeCalories * 0.4) / 4);
  const proteinGrams = Math.min(rawProteinGrams, maxProteinFromCals);
  const proteinCalories = proteinGrams * 4;

  // Fat: 28% of total daily energy expenditure for hormonal health and vitamin absorption
  const fatCalories = Math.round(activeCalories * 0.28);
  const fatGrams = Math.max(35, Math.round(fatCalories / 9));

  // Carbs: Remaining caloric allocation for glycogen replenishment
  const remainingCalories = Math.max(0, activeCalories - (proteinCalories + fatGrams * 9));
  const carbsGrams = Math.round(remainingCalories / 4);

  // Fiber: 14g per 1000 kcal (minimum 25g, max 40g to prevent GI distress on GLP1)
  const fiberGrams = Math.min(38, Math.max(25, Math.round((activeCalories / 1000) * 14)));

  return {
    bmr: Math.round(bmr),
    maintenance: Math.round(maintenance),
    loss: loss === null ? null : Math.round(loss),
    gain: Math.round(gain),
    target: finalTarget,
    goal,
    lossBlocked,
    lossLimited: !lossBlocked && loss !== null && loss > maintenance * 0.85,
    proteinGrams,
    fatGrams,
    carbsGrams,
    fiberGrams,
  };
}

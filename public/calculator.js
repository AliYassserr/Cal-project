export const ACTIVITY = Object.freeze({
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  veryActive: 1.9,
});

export function toMetric(height, weight, units) {
  if (!['metric', 'imperial'].includes(units)) throw new RangeError('Choose a valid unit system.');
  if (![height, weight].every(value => typeof value === 'number' && Number.isFinite(value))) {
    throw new RangeError('Enter valid measurements.');
  }
  return units === 'metric'
    ? { height, weight }
    : { height: height * 2.54, weight: weight * 0.45359237 };
}

export function calculate({ age, height, weight, sex, activity, units = 'metric', goal = 'maintain' }) {
  const metric = toMetric(height, weight, units);
  if (!Number.isInteger(age) || age < 18 || age > 100) throw new RangeError('This calculator supports adults aged 18–100.');
  if (metric.height < 120 || metric.height > 230) throw new RangeError('Enter a height between 120 and 230 cm (47.25–90.55 in).');
  if (metric.weight < 35 || metric.weight > 300) throw new RangeError('Enter a weight between 35 and 300 kg (77.17–661.38 lb).');
  if (!['female', 'male'].includes(sex)) throw new RangeError('Choose a sex coefficient for the equation.');
  if (!Object.hasOwn(ACTIVITY, activity)) throw new RangeError('Choose an activity level.');
  if (!['lose', 'maintain', 'gain'].includes(goal)) throw new RangeError('Choose a valid goal.');

  const bmr = 10 * metric.weight + 6.25 * metric.height - 5 * age + (sex === 'male' ? 5 : -161);
  const maintenance = bmr * ACTIVITY[activity];
  // Conservative guardrails, not individualized nutritional minimums.
  const floor = sex === 'male' ? 1500 : 1200;
  const bmi = metric.weight / ((metric.height / 100) ** 2);
  const lossBlocked = bmi < 18.5 || maintenance <= floor;
  const loss = lossBlocked ? null : Math.max(floor, maintenance * 0.85);
  const gain = maintenance * 1.1;
  const targets = { lose: loss, maintain: maintenance, gain };
  return {
    bmr: Math.round(bmr),
    maintenance: Math.round(maintenance),
    loss: loss === null ? null : Math.round(loss),
    gain: Math.round(gain),
    target: targets[goal] === null ? null : Math.round(targets[goal]),
    goal,
    lossBlocked,
    lossLimited: !lossBlocked && loss > maintenance * 0.85,
  };
}

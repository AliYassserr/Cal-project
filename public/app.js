import { calculate } from './calculator.js';

const byId = id => document.getElementById(id);
const form = byId('calorie-form');
const numberFormat = new Intl.NumberFormat('en-US');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
let units = 'metric';
let animationId;
let lastMeasurements = null;

function clearError() {
  byId('form-error').hidden = true;
  form.querySelectorAll('[aria-invalid]').forEach(field => field.removeAttribute('aria-invalid'));
}

function invalidateResults() {
  cancelAnimationFrame(animationId);
  byId('empty-results').hidden = false;
  byId('populated-results').hidden = true;
  document.querySelector('.results-panel').setAttribute('aria-labelledby', 'results-heading');
  byId('result-badge').textContent = 'READY WHEN YOU ARE';
  byId('result-announcement').textContent = '';
}

function animateNumber(value) {
  cancelAnimationFrame(animationId);
  if (value === null) {
    byId('target-value').textContent = '—';
    return;
  }
  if (reducedMotion.matches) {
    byId('target-value').textContent = numberFormat.format(value);
    return;
  }
  const start = performance.now();
  function frame(now) {
    const progress = Math.min((now - start) / 650, 1);
    byId('target-value').textContent = numberFormat.format(Math.round(value * (1 - (1 - progress) ** 3)));
    if (progress < 1) animationId = requestAnimationFrame(frame);
  }
  animationId = requestAnimationFrame(frame);
}

function render(result) {
  const descriptions = {
    lose: result.lossBlocked ? 'A weight-loss target is not appropriate to provide from these measurements.' : result.lossLimited ? 'A smaller deficit, limited by our general calorie guardrail.' : 'A gentle 15% deficit from your estimated maintenance needs.',
    maintain: 'An estimate of the energy you need to keep your weight steady.',
    gain: 'A measured 10% surplus above your estimated maintenance needs.',
  };
  const headings = { lose: 'Your weight-loss starting point', maintain: 'Your maintenance target', gain: 'Your weight-gain starting point' };
  byId('empty-results').hidden = true;
  const panel = byId('populated-results');
  panel.hidden = false;
  document.querySelector('.results-panel').setAttribute('aria-labelledby', 'target-heading');
  panel.classList.remove('result-enter');
  void panel.offsetWidth;
  panel.classList.add('result-enter');
  byId('result-badge').textContent = 'YOUR ESTIMATE';
  byId('target-heading').textContent = headings[result.goal];
  byId('target-description').textContent = descriptions[result.goal];
  byId('bmr-value').textContent = numberFormat.format(result.bmr);
  byId('maintenance-value').textContent = numberFormat.format(result.maintenance);
  byId('maintain-value').textContent = numberFormat.format(result.maintenance);
  byId('loss-value').textContent = result.loss === null ? 'Not advised' : numberFormat.format(result.loss);
  byId('gain-value').textContent = numberFormat.format(result.gain);
  byId('energy-fill').style.width = `${result.bmr / result.maintenance * 100}%`;
  document.querySelectorAll('[data-result-goal]').forEach(card => {
    card.classList.toggle('selected', card.dataset.resultGoal === result.goal);
  });
  const warning = byId('estimate-warning');
  warning.hidden = !result.lossBlocked && !result.lossLimited;
  warning.textContent = result.lossBlocked
    ? 'We do not provide a loss target when estimated BMI is below 18.5 or maintenance is at or below our calorie guardrail. Discuss your goals with a registered dietitian.'
    : 'The loss estimate is limited by a general calorie guardrail. This is not a personalized minimum; a dietitian can help check nutritional adequacy.';
  animateNumber(result.target);
  byId('result-announcement').textContent = `Calculation complete. Resting energy: ${result.bmr} calories per day. Maintenance: ${result.maintenance}. ${result.target === null ? 'Weight-loss target not advised.' : `Selected goal: ${result.target} calories per day.`}`;
}

form.addEventListener('input', event => {
  clearError();
  if (['height', 'weight'].includes(event.target.id)) lastMeasurements = null;
  invalidateResults();
});

for (const button of document.querySelectorAll('[data-unit]')) {
  button.addEventListener('click', () => {
    const next = button.dataset.unit;
    if (next === units) return;
    const height = byId('height');
    const weight = byId('weight');
    // Preserve canonical values across repeated toggles, until the user edits them.
    if (!lastMeasurements) {
      lastMeasurements = {
        height: height.value === '' ? null : height.valueAsNumber * (units === 'metric' ? 1 : 2.54),
        weight: weight.value === '' ? null : weight.valueAsNumber * (units === 'metric' ? 1 : 0.45359237),
      };
    }
    units = next;
    const metric = units === 'metric';
    height.min = metric ? '120' : String(120 / 2.54);
    height.max = metric ? '230' : String(230 / 2.54);
    weight.min = metric ? '35' : String(35 / 0.45359237);
    weight.max = metric ? '300' : String(300 / 0.45359237);
    height.placeholder = metric ? '170' : '67';
    weight.placeholder = metric ? '70' : '154';
    height.value = lastMeasurements.height === null ? '' : String(lastMeasurements.height / (metric ? 1 : 2.54));
    weight.value = lastMeasurements.weight === null ? '' : String(lastMeasurements.weight / (metric ? 1 : 0.45359237));
    byId('height-unit').textContent = metric ? 'cm' : 'in';
    byId('weight-unit').textContent = metric ? 'kg' : 'lb';
    document.querySelectorAll('[data-unit]').forEach(control => control.setAttribute('aria-pressed', String(control.dataset.unit === units)));
    clearError();
    invalidateResults();
  });
}

form.addEventListener('submit', event => {
  event.preventDefault();
  clearError();
  const invalid = [...form.elements].find(field => field.willValidate && !field.validity.valid);
  if (invalid) {
    invalidateResults();
    invalid.setAttribute('aria-invalid', 'true');
    byId('form-error').textContent = invalid.validationMessage;
    byId('form-error').hidden = false;
    invalid.focus();
    return;
  }
  const data = new FormData(form);
  try {
    const result = calculate({
      age: byId('age').valueAsNumber,
      height: lastMeasurements?.height ?? byId('height').valueAsNumber,
      weight: lastMeasurements?.weight ?? byId('weight').valueAsNumber,
      units: lastMeasurements ? 'metric' : units,
      sex: data.get('sex'),
      activity: data.get('activity'),
      goal: data.get('goal'),
    });
    render(result);
  } catch (error) {
    invalidateResults();
    byId('form-error').textContent = error instanceof RangeError ? error.message : 'Something went wrong. Please check your entries and try again.';
    byId('form-error').hidden = false;
  }
});

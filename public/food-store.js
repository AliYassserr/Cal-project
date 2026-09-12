export const STORAGE_KEY = 'form.food-log.v1';
export const MEALS = Object.freeze(['breakfast', 'lunch', 'dinner', 'snack']);
const NUTRIENTS = ['calories', 'protein', 'carbs', 'fat'];

export function localDate(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

export function validDate(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T12:00:00`);
  return Number.isFinite(date.getTime()) && localDate(date) === value;
}

export function moveDate(value, offset) {
  if (!validDate(value) || !Number.isInteger(offset)) throw new RangeError('Choose a valid date.');
  const date = new Date(`${value}T12:00:00`);
  date.setDate(date.getDate() + offset);
  const result = localDate(date);
  if (!validDate(result)) throw new RangeError('Choose a date between years 0001 and 9999.');
  return result;
}

function bounded(value, min, max, label) {
  if (typeof value !== 'number' || !Number.isFinite(value) || value < min || value > max) {
    throw new RangeError(`${label} must be between ${min} and ${max}.`);
  }
  return value;
}

export function validateEntry(entry) {
  if (!entry || typeof entry !== 'object') throw new RangeError('Invalid food entry.');
  if (typeof entry.id !== 'string' || !/^[a-zA-Z0-9-]{1,80}$/.test(entry.id)) throw new RangeError('Invalid food ID.');
  if (typeof entry.name !== 'string' || !entry.name.trim() || entry.name.trim().length > 120) throw new RangeError('Give your food a name of 1–120 characters.');
  if (!MEALS.includes(entry.meal)) throw new RangeError('Choose a meal.');
  const clean = { id: entry.id, name: entry.name.trim(), meal: entry.meal, servings: bounded(entry.servings, 0.01, 100, 'Servings') };
  for (const key of NUTRIENTS) {
    clean[key] = key !== 'calories' && entry[key] === null ? null : bounded(entry[key], 0, key === 'calories' ? 10000 : 1000, key);
  }
  return clean;
}

export function validateTarget(target) {
  if (target === null) return null;
  bounded(target, 1, 20000, 'Daily calorie target');
  if (!Number.isInteger(target)) throw new RangeError('Use a whole number for your calorie target.');
  return target;
}

export function emptyLog() { return { version: 1, days: {} }; }

export function parseLog(raw) {
  if (raw === null) return emptyLog();
  let parsed;
  try { parsed = JSON.parse(raw); } catch { throw new Error('Your saved log could not be read. Export a backup before attempting recovery.'); }
  if (!parsed || parsed.version !== 1 || !parsed.days || typeof parsed.days !== 'object' || Array.isArray(parsed.days)) {
    throw new Error('This saved log has an unsupported format. Your existing data has not been overwritten.');
  }
  const log = emptyLog();
  for (const [date, day] of Object.entries(parsed.days)) {
    if (!validDate(date) || !day || !Array.isArray(day.entries)) throw new RangeError('Invalid day in saved log.');
    const entries = day.entries.map(validateEntry);
    if (new Set(entries.map(entry => entry.id)).size !== entries.length) throw new RangeError('Duplicate food IDs in saved log.');
    log.days[date] = { target: validateTarget(day.target), entries };
  }
  return log;
}

export function getDay(log, date) {
  if (!validDate(date)) throw new RangeError('Choose a valid date.');
  return log.days[date] ?? { target: null, entries: [] };
}

export function saveEntry(log, date, entry, editing = false) {
  const clean = validateEntry(entry);
  const day = getDay(log, date);
  const exists = day.entries.some(item => item.id === clean.id);
  if (editing && !exists) throw new Error('This entry no longer exists. Add it again instead.');
  if (!editing && exists) throw new Error('This entry is already in your log.');
  const entries = editing ? day.entries.map(item => item.id === clean.id ? clean : item) : [...day.entries, clean];
  return { ...log, days: { ...log.days, [date]: { ...day, entries } } };
}

export function deleteEntry(log, date, id) {
  const day = getDay(log, date);
  if (!day.entries.some(entry => entry.id === id)) throw new Error('This entry no longer exists.');
  return { ...log, days: { ...log.days, [date]: { ...day, entries: day.entries.filter(entry => entry.id !== id) } } };
}

export function setTarget(log, date, target) {
  return { ...log, days: { ...log.days, [date]: { ...getDay(log, date), target: validateTarget(target) } } };
}

export function totals(entries) {
  const result = { calories: 0, protein: 0, carbs: 0, fat: 0, incompleteMacros: false };
  for (const entry of entries) {
    for (const key of NUTRIENTS) {
      if (entry[key] === null) result.incompleteMacros = true;
      else result[key] += entry[key] * entry.servings;
    }
  }
  for (const key of NUTRIENTS) result[key] = Math.round((result[key] + Number.EPSILON) * 10) / 10;
  return result;
}

export function recentFoods(log, limit = 6) {
  const seen = new Set();
  const result = [];
  for (const date of Object.keys(log.days).sort().reverse()) {
    for (const entry of [...log.days[date].entries].reverse()) {
      const key = JSON.stringify([entry.name.toLowerCase(), ...NUTRIENTS.map(field => entry[field])]);
      if (seen.has(key)) continue;
      seen.add(key);
      result.push(entry);
      if (result.length >= limit) return result;
    }
  }
  return result;
}

export function persistLog(storage, expectedRaw, next) {
  if (storage.getItem(STORAGE_KEY) !== expectedRaw) throw new Error('Your log changed in another tab. Reload this page before saving.');
  const raw = JSON.stringify(next);
  storage.setItem(STORAGE_KEY, raw);
  return raw;
}

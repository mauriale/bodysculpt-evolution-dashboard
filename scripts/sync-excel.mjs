#!/usr/bin/env node
/**
 * sync-excel.mjs
 * Reads Tracking-Body-Sculp.xlsx from the project root and regenerates
 * src/data/bodyData.ts with the latest measurements.
 *
 * Usage:
 *   npm run sync
 *   node scripts/sync-excel.mjs
 *   node scripts/sync-excel.mjs --dry-run   (print without writing)
 */

import * as XLSX from 'xlsx';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const EXCEL_PATH = resolve(ROOT, 'Tracking-Body-Sculp.xlsx');
const OUT_PATH = resolve(ROOT, 'src', 'data', 'bodyData.ts');
const DRY_RUN = process.argv.includes('--dry-run');

// ─── Column aliases ────────────────────────────────────────────────────────────
const COL = {
  date: ['fecha', 'date', 'día', 'dia', 'fecha medición'],
  weight: ['peso', 'weight', 'peso (kg)', 'peso kg'],
  bodyFat: ['grasa', '% grasa', 'grasa corporal', 'grasa (%)', 'body fat', 'bf%'],
  bmi: ['imc', 'bmi', 'índice de masa corporal'],
  waist: ['cintura', 'waist', 'cintura (cm)', 'abdomen'],
  muscleMass: ['masa muscular', 'muscle mass', 'masa muscular (kg)'],
  visceralFat: ['grasa visceral', 'visceral fat', 'gv', 'nivel grasa visceral'],
  boneMass: ['masa ósea', 'masa osea', 'bone mass', 'hueso (kg)'],
  water: ['agua', 'water', '% agua', 'agua (%)'],
  caloriesConsumed: ['calorías consumidas', 'kcal consumidas', 'calories in', 'consumidas'],
  caloriesBurned: ['calorías quemadas', 'kcal quemadas', 'calories out', 'quemadas'],
  protein: ['proteína', 'proteina', 'protein', 'proteínas (g)', 'prot'],
  carbs: ['carbohidratos', 'carbs', 'hidratos', 'ch (g)'],
  fat: ['grasa dieta', 'grasas', 'fat', 'grasas (g)'],
};

function findCol(headers, key) {
  const aliases = COL[key] || [key];
  return headers.findIndex(h =>
    h != null &&
    aliases.some(a => h.toString().toLowerCase().trim().includes(a.toLowerCase()))
  );
}

function parseDate(val) {
  if (!val) return null;
  if (val instanceof Date) {
    const y = val.getFullYear();
    const m = String(val.getMonth() + 1).padStart(2, '0');
    const d = String(val.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }
  if (typeof val === 'number') {
    const SSF = XLSX.SSF || (XLSX.default && XLSX.default.SSF);
    if (SSF) {
      const d = SSF.parse_date_code(val);
      if (d) return `${d.y}-${String(d.m).padStart(2, '0')}-${String(d.d).padStart(2, '0')}`;
    }
    // fallback just in case
    const date = new Date(Math.round((val - 25569) * 86400 * 1000));
    return date.toISOString().split('T')[0];
  }
  if (typeof val === 'string') {
    if (/^\d{4}-\d{2}-\d{2}/.test(val)) return val.slice(0, 10);
    const parts = val.split(/[/\-\.]/);
    if (parts.length === 3) {
      const [a, b, c] = parts.map(Number);
      if (c > 1900) return `${c}-${String(b).padStart(2, '0')}-${String(a).padStart(2, '0')}`;
      if (a > 1900) return `${a}-${String(b).padStart(2, '0')}-${String(c).padStart(2, '0')}`;
    }
  }
  return null;
}

function n(v) { return v != null ? parseFloat(String(v)) : NaN; }

// ─── Parse ────────────────────────────────────────────────────────────────────

if (!existsSync(EXCEL_PATH)) {
  console.error(`❌  File not found: ${EXCEL_PATH}`);
  process.exit(1);
}

console.log('📊  Reading:', EXCEL_PATH);
const wb = XLSX.read(readFileSync(EXCEL_PATH), { type: 'buffer' });

const measurements = [];
const bodyCompositions = [];
const nutritionData = [];

for (const shName of wb.SheetNames) {
  const ws = wb.Sheets[shName];
  const rows = XLSX.utils.sheet_to_json(ws, { header: 1, defval: null });
  if (rows.length < 2) continue;

  let hdrIdx = 0;
  for (let i = 0; i < Math.min(6, rows.length); i++) {
    if (rows[i].filter(v => v !== null).length >= 3) { hdrIdx = i; break; }
  }
  const headers = rows[hdrIdx].map(h => h?.toString() ?? '');
  const idx = Object.fromEntries(Object.keys(COL).map(k => [k, findCol(headers, k)]));

  const hasMeasure = idx.date >= 0 && idx.weight >= 0;
  const hasComp = idx.muscleMass >= 0 || idx.visceralFat >= 0;
  const hasNutr = idx.caloriesConsumed >= 0 || idx.caloriesBurned >= 0;
  if (!hasMeasure && !hasComp && !hasNutr) continue;

  for (let i = hdrIdx + 1; i < rows.length; i++) {
    const row = rows[i];
    if (!row || row.every(v => v === null)) continue;
    const date = parseDate(row[idx.date]);
    if (!date) continue;

    if (hasMeasure) {
      const w = n(row[idx.weight]);
      if (!isNaN(w) && w > 0) {
        measurements.push({
          date, weight: w,
          bodyFat: idx.bodyFat >= 0 ? (n(row[idx.bodyFat]) || 0) : 0,
          bmi: idx.bmi >= 0 ? (n(row[idx.bmi]) || 0) : 0,
          ...(idx.waist >= 0 && !isNaN(n(row[idx.waist])) ? { waist: n(row[idx.waist]) } : {}),
        });
      }
    }
    if (hasComp) {
      const mm = idx.muscleMass >= 0 ? n(row[idx.muscleMass]) : NaN;
      const vf = idx.visceralFat >= 0 ? n(row[idx.visceralFat]) : NaN;
      if (!isNaN(mm) || !isNaN(vf)) {
        bodyCompositions.push({
          date,
          muscleMass: isNaN(mm) ? 0 : mm,
          visceralFat: isNaN(vf) ? 0 : vf,
          ...(idx.boneMass >= 0 && !isNaN(n(row[idx.boneMass])) ? { boneMass: n(row[idx.boneMass]) } : {}),
          ...(idx.water >= 0 && !isNaN(n(row[idx.water])) ? { water: n(row[idx.water]) } : {}),
        });
      }
    }
    if (hasNutr) {
      const cc = idx.caloriesConsumed >= 0 ? n(row[idx.caloriesConsumed]) : NaN;
      const cb = idx.caloriesBurned >= 0 ? n(row[idx.caloriesBurned]) : NaN;
      if (!isNaN(cc) || !isNaN(cb)) {
        nutritionData.push({
          date,
          caloriesConsumed: isNaN(cc) ? 0 : cc,
          caloriesBurned: isNaN(cb) ? 0 : cb,
          ...(idx.protein >= 0 && !isNaN(n(row[idx.protein])) ? { protein: n(row[idx.protein]) } : {}),
          ...(idx.carbs >= 0 && !isNaN(n(row[idx.carbs])) ? { carbs: n(row[idx.carbs]) } : {}),
          ...(idx.fat >= 0 && !isNaN(n(row[idx.fat])) ? { fat: n(row[idx.fat]) } : {}),
        });
      }
    }
  }
}

// De-duplicate & sort
const dedup = (arr) => {
  const m = new Map();
  arr.forEach(r => m.set(r.date, r));
  return [...m.values()].sort((a, b) => a.date.localeCompare(b.date));
};

const finalMeasurements = dedup(measurements);
const finalBodyCompositions = dedup(bodyCompositions);
const finalNutritionData = dedup(nutritionData);

console.log(`✅  Parsed:`);
console.log(`   measurements:     ${finalMeasurements.length} rows`);
console.log(`   bodyCompositions: ${finalBodyCompositions.length} rows`);
console.log(`   nutritionData:    ${finalNutritionData.length} rows`);

if (finalMeasurements.length === 0) {
  console.error('❌  No measurement data found. Check column headers.');
  process.exit(1);
}

// ─── Code generation ──────────────────────────────────────────────────────────

const fmt = (obj) => JSON.stringify(obj, null, 2)
  .replace(/"([a-zA-Z_][a-zA-Z0-9_]*)": /g, '$1: ')  // unquote keys
  .replace(/,\n(\s*})/g, '\n$1');                       // trailing commas

const fmtArray = (arr, label) =>
  `export const ${label} = [\n` +
  arr.map(r => `  ${JSON.stringify(r)}`).join(',\n') +
  '\n];';

// Read current bodyData.ts to preserve the static sections (types + calculations)
const current = readFileSync(OUT_PATH, 'utf8');
const dataSection = [
  fmtArray(finalMeasurements, 'measurements'),
  fmtArray(finalBodyCompositions, 'bodyCompositions'),
  fmtArray(finalNutritionData, 'nutritionData'),
].join('\n\n');

// Replace everything between the data markers
const START_MARKER = '// ─── Raw Data ─────────────────────────────────────────────────────────────────';
const END_MARKER = '// ─── Accessors ────────────────────────────────────────────────────────────────';

const before = current.slice(0, current.indexOf(START_MARKER));
const after = current.slice(current.indexOf(END_MARKER));

const first = finalMeasurements[0];
const latest = finalMeasurements[finalMeasurements.length - 1];
const syncDate = new Date().toISOString().split('T')[0];

const newContent =
  before +
  `// ─── Raw Data ─────────────────────────────────────────────────────────────────\n` +
  `// Last synced: ${syncDate} | Rows: ${finalMeasurements.length}\n` +
  `// Period: ${first.date}  →  ${latest.date}\n` +
  `// Start: ${first.weight} kg, ${first.bodyFat}% grasa   ` +
  `Latest: ${latest.weight} kg, ${latest.bodyFat}% grasa\n\n` +
  dataSection + '\n\n' +
  after;

if (DRY_RUN) {
  console.log('\n--- DRY RUN: would write to', OUT_PATH, '---\n');
  console.log(newContent.slice(0, 1000), '...');
} else {
  writeFileSync(OUT_PATH, newContent, 'utf8');
  console.log('💾  Written to:', OUT_PATH);
}

console.log('\n🏋️  Sync complete!');

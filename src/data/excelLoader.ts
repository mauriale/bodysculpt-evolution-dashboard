/**
 * excelLoader.ts
 * Fetches and parses Tracking-Body-Sculp.xlsx from GitHub at runtime.
 * Flexible column-alias matching so any reasonable header format works.
 */
import * as XLSX from 'xlsx';
import type { Measurement, BodyComposition, NutritionEntry } from './bodyData';

export const EXCEL_RAW_URL =
  'https://raw.githubusercontent.com/mauriale/bodysculpt-evolution-dashboard/main/Tracking-Body-Sculp.xlsx';

// ─── Column aliases ────────────────────────────────────────────────────────────
const COL: Record<string, string[]> = {
  date:             ['fecha', 'date', 'día', 'dia', 'fecha medición', 'fecha de medicion'],
  weight:           ['peso', 'weight', 'peso (kg)', 'peso kg', 'peso corporal'],
  bodyFat:          ['grasa', '% grasa', 'grasa corporal', 'grasa (%)', 'body fat', 'bf%',
                     '% grasa corporal', 'grasa corporal (%)'],
  bmi:              ['imc', 'bmi', 'índice de masa corporal', 'indice masa corporal'],
  waist:            ['cintura', 'waist', 'cintura (cm)', 'abdomen'],
  muscleMass:       ['masa muscular', 'muscle mass', 'masa muscular (kg)', 'músculo', 'musculo'],
  visceralFat:      ['grasa visceral', 'visceral fat', 'gv', 'nivel grasa visceral',
                     'grasa visceral (nivel)'],
  boneMass:         ['masa ósea', 'masa osea', 'bone mass', 'hueso', 'hueso (kg)'],
  water:            ['agua', 'water', '% agua', 'agua (%)', 'hidratación', 'hidratacion'],
  caloriesConsumed: ['calorías consumidas', 'cal consumidas', 'kcal consumidas',
                     'calories in', 'consumidas', 'ingeridas', 'kcal ingeridas'],
  caloriesBurned:   ['calorías quemadas', 'cal quemadas', 'kcal quemadas',
                     'calories out', 'quemadas', 'gasto calórico', 'gasto calorico'],
  protein:          ['proteína', 'proteina', 'protein', 'proteínas (g)', 'prot (g)', 'prot'],
  carbs:            ['carbohidratos', 'carbs', 'hidratos', 'ch (g)', 'carbs (g)', 'hc'],
  fat:              ['grasa dieta', 'grasas', 'fat', 'grasas (g)', 'lípidos', 'lipidos'],
};

function findCol(headers: string[], key: string): number {
  const aliases = COL[key] || [key];
  return headers.findIndex(h =>
    h != null &&
    aliases.some(a =>
      h.toString().toLowerCase().trim().includes(a.toLowerCase())
    )
  );
}

function parseDate(val: unknown): string | null {
  if (val == null) return null;
  if (val instanceof Date) return val.toISOString().split('T')[0];
  if (typeof val === 'number') {
    // Excel serial number
    const d = XLSX.SSF.parse_date_code(val);
    if (d) return `${d.y}-${String(d.m).padStart(2, '0')}-${String(d.d).padStart(2, '0')}`;
  }
  if (typeof val === 'string') {
    // ISO already
    if (/^\d{4}-\d{2}-\d{2}/.test(val)) return val.slice(0, 10);
    // DD/MM/YYYY or DD-MM-YYYY
    const parts = val.split(/[/\-\.]/); 
    if (parts.length === 3) {
      const nums = parts.map(Number);
      if (nums[2] > 1900) // DD/MM/YYYY
        return `${nums[2]}-${String(nums[1]).padStart(2,'0')}-${String(nums[0]).padStart(2,'0')}`;
      if (nums[0] > 1900) // YYYY/MM/DD
        return `${nums[0]}-${String(nums[1]).padStart(2,'0')}-${String(nums[2]).padStart(2,'0')}`;
    }
  }
  return null;
}

const n = (v: unknown): number => (v != null ? parseFloat(String(v)) : NaN);

export interface ExcelBodyData {
  measurements: Measurement[];
  bodyCompositions: BodyComposition[];
  nutritionData: NutritionEntry[];
  lastUpdated: string;
  source: 'excel' | 'static';
}

// ─── Main public API ──────────────────────────────────────────────────────────

export async function loadBodyDataFromExcel(
  url = EXCEL_RAW_URL
): Promise<ExcelBodyData | null> {
  try {
    const res = await fetch(url, { cache: 'no-cache' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const buf = await res.arrayBuffer();
    return parseExcelBuffer(buf);
  } catch (err) {
    console.warn('[excelLoader] Could not load Excel:', err);
    return null;
  }
}

export function parseExcelBuffer(arrayBuffer: ArrayBuffer): ExcelBodyData {
  const wb = XLSX.read(arrayBuffer, { type: 'array', cellDates: true });

  const measurements: Measurement[] = [];
  const bodyCompositions: BodyComposition[] = [];
  const nutritionData: NutritionEntry[] = [];

  for (const shName of wb.SheetNames) {
    const ws = wb.Sheets[shName];
    const rows = XLSX.utils.sheet_to_json<unknown[]>(ws, { header: 1, defval: null });
    if (rows.length < 2) continue;

    // Find the header row (first row with ≥ 3 non-null cells)
    let hdrIdx = 0;
    for (let i = 0; i < Math.min(6, rows.length); i++) {
      if ((rows[i] as unknown[]).filter(v => v !== null).length >= 3) { hdrIdx = i; break; }
    }
    const headers = (rows[hdrIdx] as unknown[]).map(h => h?.toString() ?? '');

    const idx = Object.fromEntries(
      Object.keys(COL).map(k => [k, findCol(headers, k)])
    ) as Record<keyof typeof COL, number>;

    const hasMeasure = idx.date >= 0 && idx.weight >= 0;
    const hasComp    = idx.muscleMass >= 0 || idx.visceralFat >= 0;
    const hasNutr    = idx.caloriesConsumed >= 0 || idx.caloriesBurned >= 0;

    if (!hasMeasure && !hasComp && !hasNutr) continue;

    for (let i = hdrIdx + 1; i < rows.length; i++) {
      const row = rows[i] as unknown[];
      if (!row || row.every(v => v === null)) continue;

      const date = parseDate(row[idx.date]);
      if (!date) continue;

      if (hasMeasure) {
        const w = n(row[idx.weight]);
        if (!isNaN(w) && w > 0) {
          measurements.push({
            date,
            weight: w,
            bodyFat: idx.bodyFat >= 0 ? (n(row[idx.bodyFat]) || 0) : 0,
            bmi:     idx.bmi >= 0     ? (n(row[idx.bmi])     || 0) : 0,
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
            muscleMass:  isNaN(mm) ? 0 : mm,
            visceralFat: isNaN(vf) ? 0 : vf,
            ...(idx.boneMass >= 0 && !isNaN(n(row[idx.boneMass])) ? { boneMass: n(row[idx.boneMass]) } : {}),
            ...(idx.water >= 0    && !isNaN(n(row[idx.water]))    ? { water:    n(row[idx.water])    } : {}),
          });
        }
      }

      if (hasNutr) {
        const cc = idx.caloriesConsumed >= 0 ? n(row[idx.caloriesConsumed]) : NaN;
        const cb = idx.caloriesBurned   >= 0 ? n(row[idx.caloriesBurned])   : NaN;
        if (!isNaN(cc) || !isNaN(cb)) {
          nutritionData.push({
            date,
            caloriesConsumed: isNaN(cc) ? 0 : cc,
            caloriesBurned:   isNaN(cb) ? 0 : cb,
            ...(idx.protein >= 0 && !isNaN(n(row[idx.protein])) ? { protein: n(row[idx.protein]) } : {}),
            ...(idx.carbs   >= 0 && !isNaN(n(row[idx.carbs]))   ? { carbs:   n(row[idx.carbs])   } : {}),
            ...(idx.fat     >= 0 && !isNaN(n(row[idx.fat]))     ? { fat:     n(row[idx.fat])     } : {}),
          });
        }
      }
    }
  }

  // De-duplicate by date (keep last occurrence)
  const dedup = <T extends { date: string }>(arr: T[]): T[] => {
    const map = new Map<string, T>();
    arr.forEach(item => map.set(item.date, item));
    return [...map.values()].sort((a, b) => a.date.localeCompare(b.date));
  };

  return {
    measurements:    dedup(measurements),
    bodyCompositions: dedup(bodyCompositions),
    nutritionData:   dedup(nutritionData),
    lastUpdated: new Date().toISOString(),
    source: 'excel',
  };
}

// BodySculpt Evolution — Data Layer
// Datos de seguimiento de transformación física: 16 Feb - 24 Feb 2026
// Datos de un usuario: Hombre, 190cm, muñeca 17.5cm

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Measurement {
  date: string;
  weight: number;     // kg
  bodyFat: number;    // %
  bmi: number;
  waist?: number;     // cm
}

export interface BodyComposition {
  date: string;
  muscleMass: number;    // kg
  visceralFat: number;   // nivel (1-20)
  boneMass?: number;     // kg
  water?: number;        // %
}

export interface NutritionEntry {
  date: string;
  caloriesConsumed: number;
  caloriesBurned: number;
  protein?: number;    // g
  carbs?: number;      // g
  fat?: number;        // g
}

export interface KPI {
  name: string;
  actual: number;
  target: number;
  description: string;
  tip: string;
}

export interface BodyComparison {
  zone: string;
  actual: number;
  ideal: number;
  unit: string;
  title: string;
  reason: string;
  impact: string;
  difference: number;
  timeline: string;
  actions: string[];
  priority: 1 | 2 | 3;
}

// ─── Raw Data ─────────────────────────────────────────────────────────────────
// Período: 16 de Febrero al 24 de Febrero 2026 (8 días)
// Perfil: Hombre 190 cm, muñeca 17.5 cm
// Inicio: 92.59 kg, 22.6% grasa, BMI 25.7
// Actual: 89.03 kg, 19.4% grasa, BMI 24.7

export const measurements: Measurement[] = [
  { date: '2026-02-16', weight: 92.59, bodyFat: 22.6, bmi: 25.7, waist: 94 },
  { date: '2026-02-17', weight: 91.80, bodyFat: 22.1, bmi: 25.4, waist: 93 },
  { date: '2026-02-18', weight: 91.20, bodyFat: 21.6, bmi: 25.2, waist: 92.5 },
  { date: '2026-02-19', weight: 90.75, bodyFat: 21.2, bmi: 25.1, waist: 92 },
  { date: '2026-02-20', weight: 90.30, bodyFat: 20.8, bmi: 25.0, waist: 91 },
  { date: '2026-02-21', weight: 89.90, bodyFat: 20.3, bmi: 24.9, waist: 90 },
  { date: '2026-02-22', weight: 89.50, bodyFat: 19.9, bmi: 24.8, waist: 89 },
  { date: '2026-02-23', weight: 89.20, bodyFat: 19.6, bmi: 24.7, waist: 88.5 },
  { date: '2026-02-24', weight: 89.03, bodyFat: 19.4, bmi: 24.7, waist: 88 },
];

export const bodyCompositions: BodyComposition[] = [
  { date: '2026-02-16', muscleMass: 65.65, visceralFat: 14, boneMass: 3.8, water: 55.2 },
  { date: '2026-02-18', muscleMass: 65.80, visceralFat: 13, boneMass: 3.8, water: 55.8 },
  { date: '2026-02-20', muscleMass: 66.10, visceralFat: 12, boneMass: 3.8, water: 56.2 },
  { date: '2026-02-22', muscleMass: 66.40, visceralFat: 11, boneMass: 3.8, water: 56.8 },
  { date: '2026-02-24', muscleMass: 66.72, visceralFat: 10, boneMass: 3.8, water: 57.3 },
];

export const nutritionData: NutritionEntry[] = [
  { date: '2026-02-16', caloriesConsumed: 2100, caloriesBurned: 2650, protein: 185, carbs: 210, fat: 72 },
  { date: '2026-02-17', caloriesConsumed: 1950, caloriesBurned: 2600, protein: 180, carbs: 185, fat: 68 },
  { date: '2026-02-18', caloriesConsumed: 2200, caloriesBurned: 2750, protein: 195, carbs: 215, fat: 75 },
  { date: '2026-02-19', caloriesConsumed: 1800, caloriesBurned: 2500, protein: 175, carbs: 165, fat: 62 },
  { date: '2026-02-20', caloriesConsumed: 2050, caloriesBurned: 2700, protein: 190, carbs: 200, fat: 70 },
  { date: '2026-02-21', caloriesConsumed: 1900, caloriesBurned: 2580, protein: 178, carbs: 178, fat: 65 },
  { date: '2026-02-22', caloriesConsumed: 2150, caloriesBurned: 2720, protein: 192, carbs: 208, fat: 73 },
  { date: '2026-02-23', caloriesConsumed: 1950, caloriesBurned: 2620, protein: 182, carbs: 188, fat: 67 },
  { date: '2026-02-24', caloriesConsumed: 2000, caloriesBurned: 2680, protein: 188, carbs: 195, fat: 69 },
];

// ─── Accessors ────────────────────────────────────────────────────────────────

export const getLatestMeasurement = (): Measurement =>
  measurements[measurements.length - 1];

export const getFirstMeasurement = (): Measurement => measurements[0];

export const getLatestComposition = (): BodyComposition =>
  bodyCompositions[bodyCompositions.length - 1];

// ─── Calculations ─────────────────────────────────────────────────────────────

/**
 * Calculates progress percentage toward a target.
 * Returns 0-100, where 100 = target reached.
 */
export const calculateProgress = (
  current: number,
  target: number,
  start: number
): number => {
  const totalChange = Math.abs(target - start);
  const achievedChange = Math.abs(current - start);
  if (totalChange === 0) return 100;
  return Math.min((achievedChange / totalChange) * 100, 100);
};

/**
 * Calculates scientific KPIs based on the latest measurement.
 * Height: 190cm, wrist: 17.5cm
 */
export const calculateKPIs = (measurement: Measurement): KPI[] => {
  const height = 190;
  const wrist = 17.5;

  // Ideal waist (McCallum / height ratio)
  const idealWaist = height * 0.45; // 85.5 cm
  const currentWaist = measurement.waist ?? 88;

  // WHtR: waist-to-height ratio
  const whtr = currentWaist / height;

  // Adonis Index: shoulder / waist
  // Ideal shoulder = waist * 1.618
  const idealShoulder = idealWaist * 1.618; // ~138.3 cm (target)
  const currentShoulder = 125; // measured
  const adonisIndex = currentShoulder / currentWaist;

  // Golden Ratio: chest / waist
  const idealChest = wrist * 6.5; // 113.75 cm
  const currentChest = 113;
  const goldenRatio = currentChest / currentWaist;

  // Ideal biceps
  const idealBiceps = wrist * 2.5; // 43.75 cm
  const currentBiceps = 38;

  return [
    {
      name: 'WHtR',
      actual: whtr,
      target: 0.47,
      description: 'Relación cintura/estatura. Indicador de riesgo metabólico. Menos de 0.50 es saludable; menos de 0.47 es óptimo.',
      tip: `Reduce cintura ${(currentWaist - idealWaist).toFixed(1)} cm más con déficit calórico moderado y cardio en ayunas 3x semana.`,
    },
    {
      name: 'Adonis Index',
      actual: adonisIndex,
      target: 1.618,
      description: 'Ratio hombros/cintura. El "número de oro" del físico masculino. Objetivo: 1.618 (proporción áurea).',
      tip: `Desarrolla deltoides laterales con press militar y elevaciones laterales. Reduce cintura otros ${(currentWaist - idealWaist).toFixed(0)} cm.`,
    },
    {
      name: 'Golden Ratio',
      actual: goldenRatio,
      target: 1.4,
      description: 'Relación pecho/cintura. Indica el desarrollo del torso superior vs. la cintura. Objetivo: 1.3-1.5.',
      tip: 'Añade volumen al pecho con press inclinado y aperturas. Combina con reducción de cintura para maximizar el ratio.',
    },
    {
      name: 'Biceps/Muñeca',
      actual: currentBiceps / wrist,
      target: 2.5,
      description: 'Ratio bíceps flexionado / circunferencia de muñeca. Indica desarrollo muscular proporcional al frame óseo.',
      tip: `Faltan ${(idealBiceps - currentBiceps).toFixed(1)} cm de bíceps para el ideal (${idealBiceps.toFixed(1)} cm). Entrena con curl concentrado y martillo.`,
    },
    {
      name: 'IMC Ajustado',
      actual: measurement.bmi,
      target: 23.5,
      description: 'IMC corregido por composición corporal. Con alta masa muscular, el IMC puede estar elevado artificialmente.',
      tip: 'Al ganar músculo y perder grasa, tu IMC bajará naturalmente. Objetivo: 23-24 manteniendo masa magra.',
    },
    {
      name: 'Grasa Visceral',
      actual: getLatestComposition().visceralFat,
      target: 7,
      description: 'Grasa alrededor de órganos internos. Nivel 1-9 es saludable; nivel 10+ es elevado. Reduce con cardio y déficit calórico.',
      tip: 'Incorpora 20-30 min de cardio MISS post-entrenamiento. Prioriza sueño de 7-8h para regular cortisol.',
    },
  ];
};

/**
 * Returns comparison between current and ideal measurements by body zone.
 * Based on McCallum formula (wrist = 17.5 cm, height = 190 cm).
 */
export const getComparisons = (measurement: Measurement): BodyComparison[] => {
  const wrist = 17.5;
  const height = 190;

  // Current values (can be expanded with real measurements)
  const current = {
    shoulders: 125,
    chest: 113,
    waist: measurement.waist ?? 88,
    biceps: 38,
    forearm: 33,
    thigh: 56,
    calf: 39,
    neck: 42,
    hip: 94,
  };

  // Ideal values based on McCallum + Golden Ratio
  const idealWaist = height * 0.45; // 85.5
  const ideal = {
    shoulders: idealWaist * 1.618,   // 138.3
    chest: wrist * 6.5,              // 113.75
    waist: idealWaist,               // 85.5
    biceps: wrist * 2.5,             // 43.75
    forearm: wrist * 2.0,            // 35.0
    thigh: idealWaist * 0.78,        // 66.7
    calf: wrist * 2.5,               // 43.75
    neck: idealWaist * 0.37,         // 31.6
    hip: idealWaist * 1.1,           // 94.1
  };

  return [
    {
      zone: 'Hombros',
      actual: current.shoulders,
      ideal: ideal.shoulders,
      unit: 'cm',
      title: 'Desarrollar Hombros (Deltoides)',
      reason: 'Los hombros son el factor #1 del V-Taper y el Adonis Index.',
      impact: 'Cada 2cm de hombros mejora el Adonis Index en ~0.025 puntos. Impacto visual inmediato.',
      difference: ideal.shoulders - current.shoulders,
      timeline: '12-16 semanas',
      actions: [
        'Press militar con barra 3x5 (fuerza base)',
        'Elevaciones laterales 4x15 (volumen deltoides medios)',
        'Face pulls 3x20 (cabeza posterior y salud articular)',
        'Frecuencia: 2-3 veces por semana',
      ],
      priority: 1,
    },
    {
      zone: 'Cintura',
      actual: current.waist,
      ideal: ideal.waist,
      unit: 'cm',
      title: 'Reducir Cintura a 85.5 cm',
      reason: 'La cintura es el denominador del Adonis Index y WHtR. Reducirla mejora todos los ratios.',
      impact: `Faltan ${(current.waist - ideal.waist).toFixed(1)} cm. Cada cm menos = +0.017 en Adonis Index.`,
      difference: current.waist - ideal.waist,
      timeline: '4-6 semanas',
      actions: [
        'Déficit calórico de 400-500 kcal/día',
        'Cardio en ayunas 30 min, 4x semana (caminata rápida o bici)',
        'Reducir sodio y carbohidratos refinados',
        'Planchas y vacuum abdominal para fortalecer transverso',
      ],
      priority: 1,
    },
    {
      zone: 'Bíceps',
      actual: current.biceps,
      ideal: ideal.biceps,
      unit: 'cm',
      title: 'Ganar Masa en Bíceps',
      reason: 'El ratio bíceps/muñeca (2.17 actual vs 2.5 ideal) indica potencial de crecimiento.',
      impact: `${(ideal.biceps - current.biceps).toFixed(1)} cm para el ideal. Visible al llevar camiseta.`,
      difference: ideal.biceps - current.biceps,
      timeline: '16-24 semanas',
      actions: [
        'Curl con barra EZ 4x8-10 (sobrecarga progresiva)',
        'Curl martillo 3x12 (braquial y braquiorradial)',
        'Curl concentrado 3x12 por brazo (pico)',
        'No exceder 2 días de entrenamiento directo por semana',
      ],
      priority: 2,
    },
    {
      zone: 'Pecho',
      actual: current.chest,
      ideal: ideal.chest,
      unit: 'cm',
      title: 'Volumen en Pecho',
      reason: 'Pecho casi en el ideal. Pequeño ajuste mejorará el Golden Ratio.',
      impact: 'Mejora visual del torso y Golden Ratio pecho/cintura.',
      difference: ideal.chest - current.chest,
      timeline: '4-8 semanas',
      actions: [
        'Press banca inclinado 4x6-8',
        'Press con mancuernas plano 3x12',
        'Aperturas en cable 3x15',
      ],
      priority: 3,
    },
    {
      zone: 'Muslo',
      actual: current.thigh,
      ideal: ideal.thigh,
      unit: 'cm',
      title: 'Desarrollar Cuádriceps',
      reason: 'Proporción muslo/cintura importante para el equilibrio visual.',
      impact: 'Equilibrio corporal y simetría general del físico.',
      difference: ideal.thigh - current.thigh,
      timeline: '20-30 semanas',
      actions: [
        'Sentadilla trasera 4x5-8 (fuerza base)',
        'Prensa de piernas 3x12-15',
        'Extensiones de cuádriceps 3x15',
        'Frecuencia: 2x semana',
      ],
      priority: 3,
    },
    {
      zone: 'Pantorrilla',
      actual: current.calf,
      ideal: ideal.calf,
      unit: 'cm',
      title: 'Desarrollar Pantorrillas',
      reason: 'Pantorrillas = bíceps del lower body. Proporción ideal = muñeca x 2.5.',
      impact: 'Simetría general y proporciones de las piernas.',
      difference: ideal.calf - current.calf,
      timeline: '24-36 semanas',
      actions: [
        'Elevaciones de talón de pie 4x20-25 (soleus + gastrocnemius)',
        'Elevaciones sentado 4x20 (soleus profundo)',
        'Entrena con frecuencia alta (4-6x semana) por su resistencia a la fatiga',
      ],
      priority: 3,
    },
    {
      zone: 'Antebrazo',
      actual: current.forearm,
      ideal: ideal.forearm,
      unit: 'cm',
      title: 'Fortalecer Antebrazos',
      reason: 'Ratio ideal antebrazo/bíceps = 0.80. Visible en todos los outfits de manga corta.',
      impact: 'Apariencia de fuerza y grosor general del brazo.',
      difference: ideal.forearm - current.forearm,
      timeline: '16-24 semanas',
      actions: [
        'Curl de muñeca con barra 3x20',
        'Farmer carries (agarres cargados)',
        'Curl martillo y curl reverso para braquiorradial',
      ],
      priority: 2,
    },
  ];
};

/**
 * Extracts and sorts the top "Quick Wins" — zones with highest impact
 * relative to the difference from ideal.
 */
export const getQuickWins = (comparisons: BodyComparison[]): BodyComparison[] => {
  return [...comparisons]
    .sort((a, b) => a.priority - b.priority || b.difference - a.difference)
    .slice(0, 5);
};

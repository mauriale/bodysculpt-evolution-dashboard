// BodySculpt Evolution — Static Data Layer (fallback / build-time snapshot)
// Auto-updated by: npm run sync  |  or GitHub Actions on Excel push
// ─────────────────────────────────────────────────────────────────────────────

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
// Last synced: 2026-03-13 | Rows: 4
// Period: 2026-02-15  →  2026-03-06
// Start: 92.15 kg, 25.8% grasa   Latest: 88.56 kg, 22.62% grasa

export const measurements = [
  {"date":"2026-02-15","weight":92.15,"bodyFat":25.8,"bmi":25.53,"waist":100},
  {"date":"2026-02-23","weight":88.59,"bodyFat":22.6,"bmi":24.54,"waist":94},
  {"date":"2026-02-28","weight":89.17,"bodyFat":22.93,"bmi":24.96,"waist":93},
  {"date":"2026-03-06","weight":88.56,"bodyFat":22.62,"bmi":24.79,"waist":93}
];

export const bodyCompositions = [
  {"date":"2026-02-15","muscleMass":66,"visceralFat":14},
  {"date":"2026-02-18","muscleMass":64.88,"visceralFat":13,"water":50.08},
  {"date":"2026-02-20","muscleMass":64.27,"visceralFat":13,"water":56.66},
  {"date":"2026-02-23","muscleMass":64.78,"visceralFat":13,"water":56.46},
  {"date":"2026-02-28","muscleMass":64.99,"visceralFat":13,"water":56.26},
  {"date":"2026-03-06","muscleMass":64.79,"visceralFat":13,"water":56.48}
];

export const nutritionData = [
  {"date":"2026-02-15","caloriesConsumed":1093,"caloriesBurned":987,"protein":0.46,"carbs":0.19,"fat":0.35},
  {"date":"2026-02-16","caloriesConsumed":1510,"caloriesBurned":323,"protein":0.42,"carbs":0.17,"fat":0.41},
  {"date":"2026-02-17","caloriesConsumed":991,"caloriesBurned":870,"protein":0.37,"carbs":0.47,"fat":0.16},
  {"date":"2026-02-18","caloriesConsumed":1137,"caloriesBurned":688,"protein":0.26,"carbs":0.34,"fat":0.4},
  {"date":"2026-02-19","caloriesConsumed":773,"caloriesBurned":1344,"protein":0.51,"carbs":0.17,"fat":0.32},
  {"date":"2026-02-20","caloriesConsumed":1706,"caloriesBurned":1050,"protein":0.34,"carbs":0.37,"fat":0.29},
  {"date":"2026-02-21","caloriesConsumed":1928,"caloriesBurned":214,"protein":0.35,"carbs":0.27,"fat":0.38},
  {"date":"2026-03-06","caloriesConsumed":1386,"caloriesBurned":546,"protein":0.33,"carbs":0.4,"fat":0.27}
];

// ─── Accessors ────────────────────────────────────────────────────────────────

export const getLatestMeasurement = (): Measurement =>
  measurements[measurements.length - 1];

export const getFirstMeasurement = (): Measurement => measurements[0];

export const getLatestComposition = (): BodyComposition =>
  bodyCompositions[bodyCompositions.length - 1];

// ─── Calculations ─────────────────────────────────────────────────────────────

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

export const calculateKPIs = (measurement: Measurement): KPI[] => {
  const height = 190;
  const wrist = 17.5;

  const idealWaist = height * 0.45;
  const currentWaist = measurement.waist ?? 88;

  const whtr = currentWaist / height;

  const idealShoulder = idealWaist * 1.618;
  const currentShoulder = 125;
  const adonisIndex = currentShoulder / currentWaist;

  const idealChest = wrist * 6.5;
  const currentChest = 113;
  const goldenRatio = currentChest / currentWaist;

  const idealBiceps = wrist * 2.5;
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

export const getComparisons = (measurement: Measurement): BodyComparison[] => {
  const wrist = 17.5;
  const height = 190;

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

  const idealWaist = height * 0.45;
  const ideal = {
    shoulders: idealWaist * 1.618,
    chest: wrist * 6.5,
    waist: idealWaist,
    biceps: wrist * 2.5,
    forearm: wrist * 2.0,
    thigh: idealWaist * 0.78,
    calf: wrist * 2.5,
    neck: idealWaist * 0.37,
    hip: idealWaist * 1.1,
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

export const getQuickWins = (comparisons: BodyComparison[]): BodyComparison[] => {
  return [...comparisons]
    .sort((a, b) => a.priority - b.priority || b.difference - a.difference)
    .slice(0, 5);
};

import { useState } from 'react';
import { motion, AnimatePresence, type Variants } from 'framer-motion';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area, BarChart, Bar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts';
import {
  TrendingDown, TrendingUp, Target, Activity,
  Scale, Ruler, Zap, ChevronDown, ChevronUp, Calendar,
  Utensils, Droplets, ArrowRight, Trophy, BarChart3,
  Gauge, Percent, Dumbbell, RefreshCw, CheckCircle2
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import {
  calculateProgress, calculateKPIs, getComparisons, getQuickWins
} from '@/data/bodyData';
import { useBodyData } from '@/hooks/useBodyData';
import './App.css';

// Animation variants
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 }
  }
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

// Custom tooltip for charts
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass rounded-lg p-3 border border-amber-500/20">
        <p className="text-amber-400 font-semibold text-sm">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="text-slate-200 text-sm">
            {entry.name}: <span className="font-bold" style={{ color: entry.color }}>{entry.value}</span>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

// Metric Card Component
const MetricCard = ({ title, value, unit, change, changeType, icon: Icon }: any) => (
  <motion.div variants={itemVariants}>
    <Card className="metric-card glass border-0 overflow-hidden relative group">
      <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      <CardContent className="p-6 relative">
        <div className="flex items-start justify-between">
          <div className="p-3 rounded-xl bg-gradient-to-br from-amber-500/20 to-amber-600/10">
            <Icon className="w-6 h-6 text-amber-400" />
          </div>
          {change !== undefined && (
            <Badge variant={changeType === 'positive' ? 'default' : 'destructive'}
                   className={`text-xs ${
                     changeType === 'positive'
                       ? 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30'
                       : 'bg-rose-500/20 text-rose-400 hover:bg-rose-500/30'
                   }`}>
              {changeType === 'positive' ? <TrendingDown className="w-3 h-3 mr-1" /> : <TrendingUp className="w-3 h-3 mr-1" />}
              {change > 0 ? '+' : ''}{change}{unit}
            </Badge>
          )}
        </div>
        <div className="mt-4">
          <p className="text-slate-400 text-sm">{title}</p>
          <p className="text-3xl font-bold text-white mt-1">
            {value}<span className="text-lg text-slate-400 ml-1">{unit}</span>
          </p>
        </div>
      </CardContent>
    </Card>
  </motion.div>
);

// Progress Card Component
const ProgressCard = ({ title, current, target, unit, progress }: any) => (
  <motion.div variants={itemVariants}>
    <Card className="glass border-0 overflow-hidden">
      <CardContent className="p-5">
        <div className="flex justify-between items-center mb-3">
          <span className="text-slate-300 text-sm font-medium">{title}</span>
          <span className="text-amber-400 text-sm font-bold">{progress.toFixed(1)}%</span>
        </div>
        <div className="flex justify-between items-end mb-2">
          <span className="text-2xl font-bold text-white">{current}<span className="text-sm text-slate-400 ml-1">{unit}</span></span>
          <span className="text-slate-500 text-sm">→ {target}{unit}</span>
        </div>
        <div className="h-2 bg-slate-700/50 rounded-full overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-amber-500 to-amber-400"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 1, delay: 0.5 }}
          />
        </div>
      </CardContent>
    </Card>
  </motion.div>
);

// KPI Card Component
const KPICard = ({ kpi }: any) => {
  const isGood = kpi.name === 'WHtR' ? kpi.actual < kpi.target : Math.abs(kpi.actual - kpi.target) < 0.1;
  return (
    <motion.div variants={itemVariants}>
      <Card className="glass border-0 overflow-hidden h-full hover:border-amber-500/30 transition-colors duration-300">
        <CardContent className="p-5">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-slate-200 font-semibold">{kpi.name}</h4>
            <Badge className={`text-xs ${isGood ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'}`}>
              {isGood ? '✓ Óptimo' : 'En progreso'}
            </Badge>
          </div>
          <div className="flex items-baseline gap-2 mb-2">
            <span className="text-3xl font-bold text-white">{kpi.actual.toFixed(kpi.name === 'WHtR' ? 3 : 2)}</span>
            <span className="text-slate-500 text-sm">/ {kpi.target} ideal</span>
          </div>
          <p className="text-slate-400 text-xs mb-3 leading-relaxed">{kpi.description}</p>
          <div className="p-3 rounded-lg bg-slate-800/50 border border-slate-700/50">
            <p className="text-amber-400 text-xs font-medium mb-1">🎯 Acción:</p>
            <p className="text-slate-300 text-xs">{kpi.tip}</p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

// Quick Win Card Component
const QuickWinCard = ({ win }: any) => {
  const [expanded, setExpanded] = useState(false);
  const priorityColors = ['from-rose-500 to-red-600', 'from-orange-500 to-amber-600', 'from-amber-500 to-yellow-600'];
  const priorityLabels = ['CRÍTICO', 'ALTA', 'MEDIA'];
  return (
    <motion.div variants={itemVariants}>
      <Card className="glass border-0 overflow-hidden">
        <div className={`h-1 bg-gradient-to-r ${priorityColors[win.priority - 1]}`} />
        <CardContent className="p-5">
          <div className="flex items-start justify-between mb-3">
            <div>
              <Badge className={`mb-2 bg-gradient-to-r ${priorityColors[win.priority - 1]} text-white border-0`}>
                {priorityLabels[win.priority - 1]}
              </Badge>
              <h4 className="text-white font-bold text-lg">{win.title}</h4>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setExpanded(!expanded)} className="text-slate-400 hover:text-white">
              {expanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </Button>
          </div>
          <p className="text-slate-400 text-sm mb-3">{win.reason}</p>
          <AnimatePresence>
            {expanded && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="p-3 rounded-lg bg-purple-500/10 border border-purple-500/20 mb-3">
                  <p className="text-purple-300 text-xs font-medium mb-1">💡 Impacto:</p>
                  <p className="text-slate-300 text-xs">{win.impact}</p>
                </div>
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div className="p-3 rounded-lg bg-slate-800/50 text-center">
                    <p className="text-slate-500 text-xs mb-1">Diferencia</p>
                    <p className="text-amber-400 font-bold">+{win.difference.toFixed(1)} cm</p>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-800/50 text-center">
                    <p className="text-slate-500 text-xs mb-1">Timeline</p>
                    <p className="text-emerald-400 font-bold">{win.timeline}</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-slate-300 text-sm font-medium">Acciones recomendadas:</p>
                  {win.actions.map((action: string, i: number) => (
                    <div key={i} className="flex items-start gap-2">
                      <ArrowRight className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
                      <p className="text-slate-400 text-xs">{action}</p>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </motion.div>
  );
};

// ─── Main App Component ───────────────────────────────────────────────────────
function App() {
  const [activeTab, setActiveTab] = useState('overview');
  const [showCalculator, setShowCalculator] = useState(false);

  // Dynamic data – starts from static snapshot, upgrades to live Excel
  const { measurements, bodyCompositions, nutritionData, loading, lastUpdated, source } = useBodyData();

  const latest = measurements[measurements.length - 1];
  const first  = measurements[0];
  const latestComp = bodyCompositions[bodyCompositions.length - 1] ?? {
    muscleMass: 65.65, visceralFat: 14, boneMass: 3.8, water: 55.2, date: first?.date ?? ''
  };

  const kpis        = calculateKPIs(latest ?? measurements[0]);
  const comparisons = getComparisons(latest ?? measurements[0]);
  const quickWins   = getQuickWins(comparisons);

  const weightProgress  = calculateProgress(latest?.weight ?? 89, 83, first?.weight ?? 92.59);
  const bodyFatProgress = calculateProgress(latest?.bodyFat ?? 19.4, 13, first?.bodyFat ?? 22.6);
  const muscleProgress  = calculateProgress(latestComp.muscleMass, 69, 65.65);

  // Dynamic labels
  const fmt = (d: string) => new Date(d).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
  const dateRange = measurements.length
    ? `${fmt(first.date)} — ${fmt(latest.date)} ${new Date(latest.date).getFullYear()}`
    : 'Cargando...';
  const daysDiff  = measurements.length > 1
    ? Math.round((new Date(latest.date).getTime() - new Date(first.date).getTime()) / 86_400_000)
    : 8;
  const weightLost   = ((first?.weight ?? 92.59) - (latest?.weight ?? 89.03)).toFixed(2);
  const fatLost      = ((first?.bodyFat ?? 22.6)  - (latest?.bodyFat ?? 19.4)).toFixed(1);
  const waistReduced = (first?.waist && latest?.waist)
    ? (first.waist - latest.waist).toFixed(0)
    : '6';

  const weightData = measurements.map(m => ({
    date: fmt(m.date),
    peso: m.weight,
    grasa: m.bodyFat,
  }));

  const compositionData = bodyCompositions.map(c => ({
    date: fmt(c.date),
    masaMuscular: c.muscleMass,
    grasaVisceral: c.visceralFat,
  }));

  const nutritionChartData = nutritionData.map(n => ({
    date: fmt(n.date),
    consumidas: n.caloriesConsumed,
    quemadas: n.caloriesBurned,
    balance: n.caloriesConsumed - n.caloriesBurned,
  }));

  const radarData = comparisons.map(c => ({
    zona: c.zone,
    actual: (c.actual / c.ideal) * 100,
    ideal: 100,
  }));

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* ── Header ── */}
      <header className="sticky top-0 z-50 glass border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center">
                <Dumbbell className="w-5 h-5 text-slate-950" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">
                  BodySculpt <span className="text-gradient-gold">Evolution</span>
                </h1>
                <p className="text-slate-400 text-xs">Tu transformación física en datos</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {/* Live sync badge */}
              <div className="hidden sm:flex items-center gap-2">
                {loading ? (
                  <span className="flex items-center gap-1.5 text-xs text-amber-400 animate-pulse">
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Sincronizando Excel...
                  </span>
                ) : source === 'excel' ? (
                  <span className="flex items-center gap-1.5 text-xs text-emerald-400">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Excel en vivo
                  </span>
                ) : (
                  <span className="text-xs text-slate-500">datos locales</span>
                )}
              </div>
              <div className="hidden sm:flex items-center gap-2 text-sm text-slate-400">
                <Calendar className="w-4 h-4" />
                <span>{dateRange}</span>
              </div>
              <Button
                onClick={() => setShowCalculator(!showCalculator)}
                className="bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-semibold hover:from-amber-400 hover:to-amber-500"
              >
                <Gauge className="w-4 h-4 mr-2" />
                {showCalculator ? 'Cerrar Calc.' : 'Calculadora'}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* ── Calculator overlay ── */}
      <AnimatePresence>
        {showCalculator && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-slate-950/90 backdrop-blur-sm overflow-y-auto"
          >
            <div className="min-h-screen py-8 px-4">
              <div className="max-w-4xl mx-auto">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-white">Calculadora de Proporciones Ideales</h2>
                  <Button variant="ghost" onClick={() => setShowCalculator(false)} className="text-slate-400 hover:text-white">
                    Cerrar
                  </Button>
                </div>
                <ProportionsCalculator />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Main ── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <TabsList className="glass border border-white/5 p-1">
            <TabsTrigger value="overview" className="data-[state=active]:bg-amber-500 data-[state=active]:text-slate-950">
              <Activity className="w-4 h-4 mr-2" /> Resumen
            </TabsTrigger>
            <TabsTrigger value="progress" className="data-[state=active]:bg-amber-500 data-[state=active]:text-slate-950">
              <TrendingDown className="w-4 h-4 mr-2" /> Progreso
            </TabsTrigger>
            <TabsTrigger value="kpis" className="data-[state=active]:bg-amber-500 data-[state=active]:text-slate-950">
              <Target className="w-4 h-4 mr-2" /> KPIs
            </TabsTrigger>
            <TabsTrigger value="wins" className="data-[state=active]:bg-amber-500 data-[state=active]:text-slate-950">
              <Zap className="w-4 h-4 mr-2" /> Quick Wins
            </TabsTrigger>
          </TabsList>

          {/* ── Overview tab ── */}
          <TabsContent value="overview">
            <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <MetricCard title="Peso Actual"     value={latest?.weight ?? '–'}  unit="kg" change={parseFloat(((latest?.weight ?? 0) - (first?.weight ?? 0)).toFixed(2))} changeType="positive" icon={Scale} />
                <MetricCard title="% Grasa Corporal" value={latest?.bodyFat ?? '–'} unit="%"  change={parseFloat(((latest?.bodyFat ?? 0) - (first?.bodyFat ?? 0)).toFixed(1))} changeType="positive" icon={Percent} />
                <MetricCard title="Masa Muscular"   value={latestComp.muscleMass}   unit="kg" change={parseFloat((latestComp.muscleMass - 65.65).toFixed(2))} changeType="positive" icon={Dumbbell} />
                <MetricCard title="IMC"             value={latest?.bmi ?? '–'}      unit=""   change={parseFloat(((latest?.bmi ?? 0) - (first?.bmi ?? 0)).toFixed(2))} changeType="positive" icon={Activity} />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <motion.div variants={itemVariants} className="lg:col-span-2">
                  <Card className="glass border-0">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center gap-2">
                        <TrendingDown className="w-5 h-5 text-amber-400" />
                        Evolución del Peso y Grasa
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-72">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={weightData}>
                            <defs>
                              <linearGradient id="colorPeso" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
                                <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                              </linearGradient>
                              <linearGradient id="colorGrasa" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#a855f7" stopOpacity={0.3}/>
                                <stop offset="95%" stopColor="#a855f7" stopOpacity={0}/>
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
                            <XAxis dataKey="date" stroke="#64748b" fontSize={12} />
                            <YAxis yAxisId="left" stroke="#f59e0b" fontSize={12} />
                            <YAxis yAxisId="right" orientation="right" stroke="#a855f7" fontSize={12} />
                            <Tooltip content={<CustomTooltip />} />
                            <Area yAxisId="left"  type="monotone" dataKey="peso"  stroke="#f59e0b" strokeWidth={3} fillOpacity={1} fill="url(#colorPeso)"  name="Peso (kg)" />
                            <Area yAxisId="right" type="monotone" dataKey="grasa" stroke="#a855f7" strokeWidth={3} fillOpacity={1} fill="url(#colorGrasa)" name="% Grasa" />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div variants={itemVariants}>
                  <Card className="glass border-0 h-full">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center gap-2">
                        <Target className="w-5 h-5 text-amber-400" />
                        Progreso hacia Objetivos
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <ProgressCard title="Peso (83 kg objetivo)"       current={latest?.weight ?? 89} target={83}   unit="kg" progress={weightProgress} />
                      <ProgressCard title="% Grasa (13% objetivo)"      current={latest?.bodyFat ?? 19.4} target={13} unit="%"  progress={bodyFatProgress} />
                      <ProgressCard title="Masa Muscular (69 kg)"       current={latestComp.muscleMass}  target={69}  unit="kg" progress={muscleProgress} />
                      <ProgressCard title="Grasa Visceral (objetivo 5)" current={latestComp.visceralFat} target={5}   unit=""   progress={calculateProgress(latestComp.visceralFat, 5, 14)} />
                    </CardContent>
                  </Card>
                </motion.div>
              </div>

              {/* Summary card – dynamic */}
              <motion.div variants={itemVariants}>
                <Card className="glass border-0 border-l-4 border-l-amber-500">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="p-3 rounded-xl bg-amber-500/10">
                        <Trophy className="w-6 h-6 text-amber-400" />
                      </div>
                      <div>
                        <h3 className="text-white font-bold text-lg mb-2">
                          ¡Excelente progreso en {daysDiff} día{daysDiff !== 1 ? 's' : ''}!
                        </h3>
                        <p className="text-slate-400 text-sm leading-relaxed">
                          Has perdido{' '}
                          <span className="text-amber-400 font-semibold">{weightLost} kg</span>{' '}
                          y reducido tu grasa corporal en{' '}
                          <span className="text-amber-400 font-semibold">{fatLost}%</span>.
                          Tu cintura disminuyó{' '}
                          <span className="text-emerald-400 font-semibold">{waistReduced} cm</span>,{' '}
                          lo que mejora significativamente tu Adonis Index y proporción V-Taper.
                          Mantén el déficit calórico moderado para preservar masa muscular.
                          {source === 'excel' && lastUpdated && (
                            <span className="block mt-2 text-xs text-slate-500">
                              Datos sincronizados desde Excel ·{' '}
                              {new Date(lastUpdated).toLocaleString('es-ES', {
                                day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
                              })}
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </motion.div>
          </TabsContent>

          {/* ── Progress tab ── */}
          <TabsContent value="progress">
            <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <motion.div variants={itemVariants}>
                  <Card className="glass border-0">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center gap-2">
                        <Droplets className="w-5 h-5 text-cyan-400" />
                        Composición Corporal
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={compositionData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
                            <XAxis dataKey="date" stroke="#64748b" fontSize={12} />
                            <YAxis yAxisId="left" stroke="#06b6d4" fontSize={12} />
                            <YAxis yAxisId="right" orientation="right" stroke="#f59e0b" fontSize={12} />
                            <Tooltip content={<CustomTooltip />} />
                            <Line yAxisId="left"  type="monotone" dataKey="masaMuscular"  stroke="#06b6d4" strokeWidth={3} dot={{ fill: '#06b6d4' }} name="Masa Muscular (kg)" />
                            <Line yAxisId="right" type="monotone" dataKey="grasaVisceral" stroke="#f59e0b" strokeWidth={3} dot={{ fill: '#f59e0b' }} name="Grasa Visceral" />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div variants={itemVariants}>
                  <Card className="glass border-0">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center gap-2">
                        <Utensils className="w-5 h-5 text-emerald-400" />
                        Balance Calórico
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={nutritionChartData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
                            <XAxis dataKey="date" stroke="#64748b" fontSize={12} />
                            <YAxis stroke="#64748b" fontSize={12} />
                            <Tooltip content={<CustomTooltip />} />
                            <Bar dataKey="consumidas" fill="#10b981" radius={[4,4,0,0]} name="Calorías Consumidas" />
                            <Bar dataKey="quemadas"   fill="#f59e0b" radius={[4,4,0,0]} name="Calorías Quemadas" />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </div>

              <motion.div variants={itemVariants}>
                <Card className="glass border-0">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Ruler className="w-5 h-5 text-purple-400" />
                      Comparación Actual vs Ideal
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <RadarChart data={radarData}>
                          <PolarGrid stroke="#334155" />
                          <PolarAngleAxis dataKey="zona" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                          <PolarRadiusAxis angle={30} domain={[0, 120]} tick={{ fill: '#64748b', fontSize: 10 }} />
                          <Radar name="Actual % del Ideal" dataKey="actual" stroke="#f59e0b" strokeWidth={2} fill="#f59e0b" fillOpacity={0.3} />
                          <Radar name="Objetivo (100%)"   dataKey="ideal"  stroke="#10b981" strokeWidth={2} fill="#10b981" fillOpacity={0.1} />
                          <Tooltip content={<CustomTooltip />} />
                        </RadarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </motion.div>
          </TabsContent>

          {/* ── KPIs tab ── */}
          <TabsContent value="kpis">
            <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {kpis.map(kpi => <KPICard key={kpi.name} kpi={kpi} />)}
              </div>
              <motion.div variants={itemVariants}>
                <Card className="glass border-0">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <BarChart3 className="w-5 h-5 text-amber-400" />
                      Tabla Comparativa Completa
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-slate-700">
                            <th className="text-left py-3 px-4 text-slate-400 font-medium text-sm">Zona</th>
                            <th className="text-center py-3 px-4 text-slate-400 font-medium text-sm">Actual</th>
                            <th className="text-center py-3 px-4 text-slate-400 font-medium text-sm">Ideal</th>
                            <th className="text-center py-3 px-4 text-slate-400 font-medium text-sm">Diferencia</th>
                            <th className="text-center py-3 px-4 text-slate-400 font-medium text-sm">% del Ideal</th>
                            <th className="text-left py-3 px-4 text-slate-400 font-medium text-sm">Progreso</th>
                          </tr>
                        </thead>
                        <tbody>
                          {comparisons.map(comp => {
                            const diff = comp.actual - comp.ideal;
                            const pct  = (comp.actual / comp.ideal) * 100;
                            return (
                              <tr key={comp.zone} className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors">
                                <td className="py-3 px-4 text-white font-medium">{comp.zone}</td>
                                <td className="py-3 px-4 text-center text-slate-300">{comp.actual.toFixed(1)} {comp.unit}</td>
                                <td className="py-3 px-4 text-center text-amber-400">{comp.ideal.toFixed(1)} {comp.unit}</td>
                                <td className={`py-3 px-4 text-center font-medium ${diff > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                                  {diff > 0 ? '+' : ''}{diff.toFixed(1)} {comp.unit}
                                </td>
                                <td className="py-3 px-4 text-center">
                                  <span className={`font-bold ${
                                    pct >= 95 && pct <= 105 ? 'text-emerald-400' :
                                    pct > 105 ? 'text-rose-400' : 'text-amber-400'
                                  }`}>{pct.toFixed(1)}%</span>
                                </td>
                                <td className="py-3 px-4">
                                  <div className="h-2 bg-slate-700 rounded-full overflow-hidden w-24">
                                    <div
                                      className={`h-full rounded-full ${
                                        pct >= 95 && pct <= 105 ? 'bg-emerald-500' :
                                        pct > 105 ? 'bg-rose-500' : 'bg-amber-500'
                                      }`}
                                      style={{ width: `${Math.min(pct, 100)}%` }}
                                    />
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </motion.div>
          </TabsContent>

          {/* ── Quick Wins tab ── */}
          <TabsContent value="wins">
            <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
              <motion.div variants={itemVariants}>
                <div className="p-6 rounded-xl bg-gradient-to-r from-amber-500/10 to-purple-500/10 border border-amber-500/20">
                  <h3 className="text-white font-bold text-lg mb-2 flex items-center gap-2">
                    <Zap className="w-5 h-5 text-amber-400" />
                    Estrategia Inteligente de Transformación
                  </h3>
                  <p className="text-slate-400 text-sm">
                    Enfócate primero en los cambios que generan mayor impacto visual y son más alcanzables.
                    Estos movimientos darán resultados rápidos (4-8 semanas) y maximizan tu atractivo físico.
                  </p>
                </div>
              </motion.div>
              <div className="space-y-4">
                {quickWins.map(win => <QuickWinCard key={win.title} win={win} />)}
              </div>
            </motion.div>
          </TabsContent>
        </Tabs>
      </main>

      <footer className="border-t border-white/5 py-6 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-slate-500 text-sm">
            BodySculpt Evolution Dashboard · Métodos: McCallum, Adonis Index, Proporción Áurea
          </p>
        </div>
      </footer>
    </div>
  );
}

// ─── Proportions Calculator ────────────────────────────────────────────────────
function ProportionsCalculator() {
  const [userMeasurements, setUserMeasurements] = useState({
    height: 190, weight: 88.59, bodyFat: 22.6, wrist: 17.5,
    shoulders: 125, chest: 113, waist: 94, hip: 94,
    biceps: 38, forearm: 33, thigh: 56, calf: 39, neck: 42
  });

  const handleChange = (field: string, value: number) =>
    setUserMeasurements(prev => ({ ...prev, [field]: value }));

  const ideals = {
    biceps:    userMeasurements.wrist * 2.5,
    forearm:   (userMeasurements.wrist * 2.5) * 0.8,
    chest:     userMeasurements.wrist * 6.5,
    waist:     userMeasurements.height * 0.45,
    shoulders: (userMeasurements.height * 0.45) * 1.618,
    hip:       (userMeasurements.height * 0.45) * 1.1,
    calf:      userMeasurements.wrist * 2.5,
    thigh:     (userMeasurements.height * 0.45) * 0.78,
    neck:      (userMeasurements.height * 0.45) * 0.37,
  };

  const adonisIndex = userMeasurements.shoulders / userMeasurements.waist;
  const goldenRatio = userMeasurements.chest    / userMeasurements.waist;
  const vTaper      = userMeasurements.shoulders / userMeasurements.waist;
  const whtr        = userMeasurements.waist    / userMeasurements.height;
  const whr         = userMeasurements.waist    / userMeasurements.hip;

  const inputFields = [
    { label: 'Estatura (cm)',     field: 'height',    info: 'De pie, descalzo, desde la coronilla' },
    { label: 'Peso (kg)',         field: 'weight',    info: 'Por la mañana, en ayunas, sin ropa' },
    { label: '% Grasa Corporal', field: 'bodyFat',   info: 'Báscula bioimpedancia o calibre' },
    { label: 'Muñeca (cm)',       field: 'wrist',     info: 'Punto más estrecho, debajo del hueso' },
    { label: 'Hombros (cm)',      field: 'shoulders', info: 'Contorno por deltoides, brazos relajados' },
    { label: 'Pecho (cm)',        field: 'chest',     info: 'A la altura de los pezones, sin flexionar' },
    { label: 'Cintura (cm)',      field: 'waist',     info: 'Punto más estrecho, ombligo' },
    { label: 'Cadera (cm)',       field: 'hip',       info: 'Punto más ancho de los glúteos' },
    { label: 'Bíceps (cm)',       field: 'biceps',    info: 'Brazo flexionado, punto más alto' },
    { label: 'Antebrazo (cm)',    field: 'forearm',   info: 'Punto más grueso, puño cerrado' },
    { label: 'Muslo (cm)',        field: 'thigh',     info: 'Punto más grueso, debajo del glúteo' },
    { label: 'Pantorrilla (cm)', field: 'calf',      info: 'Punto más grueso, de pie' },
    { label: 'Cuello (cm)',       field: 'neck',      info: 'Punto medio, debajo de la nuez' },
  ];

  return (
    <div className="space-y-6">
      <Card className="glass border-0">
        <CardHeader><CardTitle className="text-white">Tus Medidas Actuales</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {inputFields.map(({ label, field, info }) => (
              <div key={field} className="space-y-1">
                <label className="text-slate-300 text-sm font-medium">{label}</label>
                <input
                  type="number" step="0.1"
                  value={userMeasurements[field as keyof typeof userMeasurements]}
                  onChange={e => handleChange(field, parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-amber-500 transition-colors"
                />
                <p className="text-slate-500 text-xs italic">{info}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="glass border-0">
          <CardHeader><CardTitle className="text-white">Tus Medidas Ideales</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              {Object.entries(ideals).map(([key, value]) => (
                <div key={key} className="p-3 rounded-lg bg-slate-800/30">
                  <p className="text-slate-400 text-xs capitalize">{key}</p>
                  <p className="text-amber-400 font-bold text-lg">{value.toFixed(1)} cm</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="glass border-0">
          <CardHeader><CardTitle className="text-white">Tus Índices Corporales</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { label: 'Adonis Index',               value: adonisIndex, target: '1.618', ok: adonisIndex >= 1.55 && adonisIndex <= 1.65 },
                { label: 'Golden Ratio (Pecho/Cintura)', value: goldenRatio, target: '1.4',   ok: goldenRatio >= 1.33 && goldenRatio <= 1.45 },
                { label: 'V-Taper',                    value: vTaper,      target: '1.6',   ok: vTaper >= 1.55 && vTaper <= 1.65 },
                { label: 'WHtR (Cintura/Estatura)',     value: whtr,        target: '<0.50', ok: whtr < 0.50 },
                { label: 'WHR (Cintura/Cadera)',        value: whr,         target: '0.92',  ok: whr >= 0.90 && whr <= 0.95 },
              ].map(({ label, value, target, ok }) => (
                <div key={label} className="flex justify-between items-center p-3 rounded-lg bg-slate-800/30">
                  <div>
                    <p className="text-slate-400 text-xs">{label}</p>
                    <p className="text-white font-bold">{value.toFixed(3)}</p>
                  </div>
                  <Badge className={ok ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'}>
                    Objetivo: {target}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default App;

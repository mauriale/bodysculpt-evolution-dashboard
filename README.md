# 🏋️ BodySculpt Evolution Dashboard

Dashboard web personal de **seguimiento de transformación física**. Carga tus datos directamente desde un Excel, los visualiza con gráficos interactivos y calcula índices científicos de proporciones corporales.

![React](https://img.shields.io/badge/React-19-61DAFB?logo=react) ![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript) ![Vite](https://img.shields.io/badge/Vite-7-646CFF?logo=vite) ![Tailwind](https://img.shields.io/badge/Tailwind-3.4-06B6D4?logo=tailwindcss) ![XLSX](https://img.shields.io/badge/SheetJS-0.18-green)

---

## 📋 Índice

1. [Cómo funciona la app](#-cómo-funciona-la-app)
2. [Actualizar el Excel cada semana](#-actualizar-el-excel-cada-semana)
3. [Estructura del Excel](#-estructura-del-excel)
4. [Qué muestran los gráficos](#-qué-muestran-los-gráficos)
5. [Cómo se calculan los valores](#-cómo-se-calculan-los-valores)
6. [Stack tecnológico](#-stack-tecnológico)
7. [Desarrollo local](#-desarrollo-local)

---

## ⚙️ Cómo funciona la app

La app tiene **dos fuentes de datos** que trabajan en capas:

```
┌─────────────────────────────────────────────────────────────┐
│  Capa 1 — Datos estáticos (src/data/bodyData.ts)            │
│  ↳ Se muestran instantáneamente al cargar la página         │
│  ↳ Son el fallback si el Excel no está disponible           │
├─────────────────────────────────────────────────────────────┤
│  Capa 2 — Excel en vivo (Tracking-Body-Sculp.xlsx)          │
│  ↳ Se descarga de GitHub en cada visita (cache: no-cache)   │
│  ↳ Si tiene ≥ filas que el estático, reemplaza los datos    │
│  ↳ El header muestra "✅ Excel en vivo" cuando está activo  │
└─────────────────────────────────────────────────────────────┘
```

### Flujo completo al abrir el dashboard

```
Usuario abre la app
        │
        ▼
Se renderizan los datos estáticos de bodyData.ts  ← (instantáneo)
        │
        ▼
useBodyData hook inicia fetch de Tracking-Body-Sculp.xlsx desde GitHub
        │
   ┌────┴────┐
   │ Éxito  │  → Se parsea con SheetJS → se actualizan gráficos y KPIs
   │ Error  │  → Se mantienen los datos estáticos (sin interrupción)
   └────────┘
```

### Archivos clave del sistema de datos

| Archivo | Rol |
|---|---|
| `src/data/excelLoader.ts` | Descarga y parsea el Excel en el navegador (SheetJS) |
| `src/hooks/useBodyData.ts` | Hook React que orquesta la carga en dos capas |
| `src/data/bodyData.ts` | Snapshot estático — fallback y datos iniciales |
| `scripts/sync-excel.mjs` | Script Node.js para sincronizar localmente |

---

## 🔄 Actualizar el Excel cada semana

### Opción A — Solo subir el Excel (más simple)

Cuando subes el archivo `Tracking-Body-Sculp.xlsx` al repositorio, **dos cosas pasan automáticamente**:

**1. GitHub Actions `sync-data.yml` se activa:**
```
Excel pusheado → workflow detecta cambio → npm run sync →
bodyData.ts actualizado → commit automático → deploy.yml relanzado
```

**2. El dashboard en producción carga el Excel fresco en cada visita:**
- Sin necesidad de redeploy manual
- El header muestra `✅ Excel en vivo` cuando los datos vienen del archivo

### Pasos concretos cada semana

```bash
# 1. Abre tu archivo Excel y añade las nuevas filas con las mediciones de la semana

# 2. Sube el archivo al repositorio (cualquiera de estas formas):

# Opción git:
git add Tracking-Body-Sculp.xlsx
git commit -m "📊 semana XX - nuevas mediciones"
git push

# Opción web: arrastra el archivo a github.com/mauriale/bodysculpt-evolution-dashboard
# y haz commit directamente desde la interfaz web de GitHub
```

**Resultado:** En ~2-3 minutos el dashboard en GitHub Pages está actualizado con todos los datos históricos + los nuevos.

### Opción B — Sincronizar localmente primero

Si quieres previsualizar los cambios antes de publicar:

```bash
# Clonar el repo (si no lo tienes)
git clone https://github.com/mauriale/bodysculpt-evolution-dashboard.git
cd bodysculpt-evolution-dashboard
npm install

# Ver qué cambiaría sin escribir nada
npm run sync:dry

# Aplicar la sincronización (actualiza src/data/bodyData.ts)
npm run sync

# Ver el resultado en el navegador
npm run dev

# Publicar
git add Tracking-Body-Sculp.xlsx src/data/bodyData.ts
git commit -m "📊 semana XX - sincronizado"
git push
```

---

## 📊 Estructura del Excel

El parser detecta las columnas **por nombre**, no por posición. Puedes tener las columnas en cualquier orden y el sistema las encuentra automáticamente. Se aceptan nombres en **español e inglés**.

### Columnas reconocidas

| Campo interno | Nombres aceptados en el Excel |
|---|---|
| `date` | `Fecha`, `Date`, `Día`, `Fecha Medición` |
| `weight` | `Peso`, `Weight`, `Peso (kg)`, `Peso kg` |
| `bodyFat` | `Grasa`, `% Grasa`, `Grasa Corporal`, `Body Fat`, `BF%` |
| `bmi` | `IMC`, `BMI`, `Índice de Masa Corporal` |
| `waist` | `Cintura`, `Waist`, `Cintura (cm)`, `Abdomen` |
| `muscleMass` | `Masa Muscular`, `Muscle Mass`, `Masa Muscular (kg)` |
| `visceralFat` | `Grasa Visceral`, `Visceral Fat`, `GV`, `Nivel Grasa Visceral` |
| `boneMass` | `Masa Ósea`, `Bone Mass`, `Hueso (kg)` |
| `water` | `Agua`, `Water`, `% Agua` |
| `caloriesConsumed` | `Calorías Consumidas`, `Kcal Consumidas`, `Calories In` |
| `caloriesBurned` | `Calorías Quemadas`, `Kcal Quemadas`, `Calories Out` |
| `protein` | `Proteína`, `Protein`, `Proteínas (g)`, `Prot` |
| `carbs` | `Carbohidratos`, `Carbs`, `Hidratos`, `CH (g)` |
| `fat` | `Grasas`, `Fat`, `Grasas (g)` |

### Reglas del Excel

- **Fechas aceptadas:** `DD/MM/YYYY`, `YYYY-MM-DD`, `DD-MM-YYYY`, fecha de Excel nativo
- **Múltiples hojas:** soportado — el parser lee todas las hojas y combina los datos
- **Filas vacías:** ignoradas automáticamente
- **Duplicados por fecha:** si una fecha aparece en varias hojas, se queda la última ocurrencia
- **Columnas opcionales:** solo `Fecha` y `Peso` son obligatorias; el resto es opcional

### Ejemplo mínimo de Excel

| Fecha | Peso | % Grasa | IMC | Cintura |
|---|---|---|---|---|
| 16/02/2026 | 92.59 | 22.6 | 25.7 | 94 |
| 17/02/2026 | 91.80 | 22.1 | 25.4 | 93 |
| 03/03/2026 | 88.50 | 18.9 | 24.5 | 87 |

---

## 📈 Qué muestran los gráficos

### Tab Resumen — 4 tarjetas métricas

Muestran el **valor más reciente** del Excel junto al **delta** (cambio desde el primer registro):

| Tarjeta | Valor | Delta |
|---|---|---|
| Peso Actual | último `weight` | `último - primero` (kg) |
| % Grasa Corporal | último `bodyFat` | `último - primero` (%) |
| Masa Muscular | último `muscleMass` | vs 65.65 kg (línea base) |
| IMC | último `bmi` | `último - primero` |

### Tab Resumen — Gráfico "Evolución del Peso y Grasa"

**Tipo:** Area Chart con dos ejes Y  
**Eje izquierdo (ámbar):** Peso en kg — curva de área degradada  
**Eje derecho (violeta):** % de grasa corporal — curva de área degradada  
**X:** Fecha formateada como `16 feb`, `17 feb`, etc.  
**Datos:** todos los registros del Excel, ordenados cronológicamente

### Tab Resumen — Barras de Progreso hacia Objetivos

Muestran el porcentaje de avance entre el valor inicial y el objetivo final:

| Barra | Inicio | Objetivo | Fórmula |
|---|---|---|---|
| Peso | primer registro | 83 kg | `(inicio - actual) / (inicio - 83) × 100` |
| % Grasa | primer registro | 13% | `(inicio - actual) / (inicio - 13) × 100` |
| Masa Muscular | 65.65 kg | 69 kg | `(actual - 65.65) / (69 - 65.65) × 100` |
| Grasa Visceral | 14 | 5 | `(14 - actual) / (14 - 5) × 100` |

### Tab Progreso — Composición Corporal

**Tipo:** Line Chart con dos ejes Y  
**Línea cian:** Masa Muscular (kg) — eje izquierdo  
**Línea ámbar:** Grasa Visceral (nivel 1-20) — eje derecho  
**Frecuencia de datos:** cada medición disponible en el Excel (puede ser diaria, bisemanal, etc.)

### Tab Progreso — Balance Calórico

**Tipo:** Bar Chart agrupado  
**Barra verde:** Calorías consumidas en el día  
**Barra ámbar:** Calorías quemadas en el día  
**Interpretación:** cuando la barra verde es menor que la ámbar = déficit calórico = pérdida de grasa

### Tab Progreso — Comparación Actual vs Ideal (Radar)

**Tipo:** Radar Chart  
**Verde (relleno tenue):** 100% = medida ideal según método McCallum  
**Ámbar (relleno):** porcentaje del ideal que tienes actualmente  
**7 ejes:** Hombros, Cintura, Bíceps, Pecho, Muslo, Pantorrilla, Antebrazo  
**Lectura:** cuanto más cerca del verde, más cerca de las proporciones óptimas

---

## 🧮 Cómo se calculan los valores

### Perfil base del usuario

| Parámetro | Valor |
|---|---|
| Altura | 190 cm |
| Muñeca | 17.5 cm |
| Cintura ideal | `190 × 0.45 = 85.5 cm` |

### Proporciones ideales (Método McCallum)

Todas las medidas ideales derivan de la muñeca y la altura:

| Zona | Fórmula | Resultado |
|---|---|---|
| Cintura | `altura × 0.45` | 85.5 cm |
| Hombros | `cintura_ideal × 1.618` | 138.3 cm |
| Pecho | `muñeca × 6.5` | 113.75 cm |
| Bíceps | `muñeca × 2.5` | 43.75 cm |
| Antebrazo | `muñeca × 2.0` | 35.0 cm |
| Muslo | `cintura_ideal × 0.78` | 66.7 cm |
| Pantorrilla | `muñeca × 2.5` | 43.75 cm |
| Cuello | `cintura_ideal × 0.37` | 31.6 cm |
| Cadera | `cintura_ideal × 1.1` | 94.1 cm |

### KPIs científicos

#### WHtR — Waist-to-Height Ratio
```
WHtR = cintura_actual / altura
Objetivo: < 0.47 (óptimo) | < 0.50 (saludable)
```
Indicador de riesgo metabólico y cardiovascular. Más preciso que el IMC.

#### Adonis Index
```
Adonis Index = hombros_actual / cintura_actual
Objetivo: 1.618 (proporción áurea)
```
El "número de oro" del físico masculino. Combina amplitud de hombros y estrechez de cintura.

#### Golden Ratio (Pecho / Cintura)
```
Golden Ratio = pecho_actual / cintura_actual
Objetivo: 1.3 – 1.5 (óptimo: 1.4)
```
Proporción del torso superior. Indica el desarrollo pectoral relativo a la cintura.

#### Ratio Bíceps / Muñeca
```
Ratio = bíceps_flexionado / circunferencia_muñeca
Objetivo: 2.5
```
Indica el desarrollo muscular proporcional al frame óseo del individuo.

#### IMC Ajustado
```
IMC = peso / (altura_metros²)
Objetivo: 23 – 24 (con alta masa muscular puede estar artificialmente elevado)
```

#### Grasa Visceral
```
Nivel del 1 al 20 medido por bioimpedancia
Objetivo: < 7 (saludable: < 9)
```

### Tab KPIs — Tabla Comparativa

Muestra para cada zona corporal:
- **Actual:** medida real actual (hardcodeada en `bodyData.ts` para medidas no registradas en Excel)
- **Ideal:** calculada con las fórmulas McCallum de arriba
- **Diferencia:** `actual - ideal` (negativo = falta músculo, positivo = falta reducir)
- **% del Ideal:** `(actual / ideal) × 100` — verde 95-105%, rojo > 105%, ámbar < 95%

### Quick Wins — Priorización

Las 5 mejores oportunidades de mejora se ordenan por:
1. **Prioridad:** 1 = Crítico (impacto visual inmediato), 2 = Alta, 3 = Media
2. **Diferencia:** dentro de la misma prioridad, mayor diferencia = aparece primero

Cada Quick Win incluye timeline estimado y acciones específicas basadas en la literatura de hipertrofia y composición corporal.

---

## 🛠️ Stack Tecnológico

| Tecnología | Versión | Uso |
|---|---|---|
| React | 19 | Framework UI |
| TypeScript | 5.9 | Tipado estático |
| Vite | 7 | Build tool y dev server |
| Tailwind CSS | 3.4 | Estilos utilitarios |
| shadcn/ui | latest | Componentes UI (Card, Badge, Tabs, Button…) |
| Framer Motion | 12 | Animaciones de entrada y transiciones |
| Recharts | 2.15 | Area Chart, Line Chart, Bar Chart, Radar Chart |
| SheetJS (xlsx) | 0.18 | Parser de Excel en el navegador y en Node.js |
| Lucide React | 0.56 | Iconografía |

---

## 🚀 Desarrollo local

```bash
# Clonar
git clone https://github.com/mauriale/bodysculpt-evolution-dashboard.git
cd bodysculpt-evolution-dashboard

# Instalar
npm install

# Desarrollo
npm run dev

# Sincronizar Excel → bodyData.ts (preview sin escribir)
npm run sync:dry

# Sincronizar Excel → bodyData.ts (escribe el archivo)
npm run sync

# Build producción
npm run build
```

### Estructura del proyecto

```
bodysculpt-evolution-dashboard/
├── Tracking-Body-Sculp.xlsx        ← Tu archivo de datos (actualizar semanalmente)
├── scripts/
│   └── sync-excel.mjs              ← Script de sincronización local
├── src/
│   ├── App.tsx                     ← Componente principal y todos los gráficos
│   ├── App.css                     ← Estilos globales y glassmorphism
│   ├── data/
│   │   ├── bodyData.ts             ← Snapshot estático (generado por sync)
│   │   └── excelLoader.ts          ← Parser de Excel para el navegador
│   ├── hooks/
│   │   └── useBodyData.ts          ← Hook de carga de datos en dos capas
│   └── components/ui/              ← Componentes shadcn/ui
├── .github/workflows/
│   ├── deploy.yml                  ← Build y deploy a GitHub Pages
│   └── sync-data.yml               ← Auto-sync al detectar cambio en el Excel
└── package.json                    ← scripts: dev, build, sync, sync:dry
```

---

*BodySculpt Evolution Dashboard · Métodos científicos: McCallum, Adonis Index, Proporción Áurea*

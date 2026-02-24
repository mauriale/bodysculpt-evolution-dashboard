# 🏋️ BodySculpt Evolution Dashboard

Dashboard web personal de **seguimiento de transformación física**, construido con React 19, TypeScript y Tailwind CSS. Visualiza y analiza tu progreso corporal con métricas científicas.

![React](https://img.shields.io/badge/React-19-61DAFB?logo=react) ![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript) ![Vite](https://img.shields.io/badge/Vite-7-646CFF?logo=vite) ![Tailwind](https://img.shields.io/badge/Tailwind-3.4-06B6D4?logo=tailwindcss)

## ✨ Características

- **📊 Resumen (Overview)** — Métricas clave: peso, % grasa, masa muscular, IMC con tarjetas animadas
- **📈 Progreso** — Composición corporal, balance calórico y comparación actual vs ideal (gráfico radar)
- **🎯 KPIs** — Índices científicos (Adonis Index, Golden Ratio, WHtR) con tips de acción
- **⚡ Quick Wins** — Estrategia priorizada de mejoras con impacto visual y timeline estimado
- **🔢 Calculadora Interactiva** — Calcula tus proporciones ideales basadas en el método McCallum y la proporción áurea

## 🛠️ Stack Tecnológico

| Tecnología | Uso |
|---|---|
| **React 19** | Framework UI |
| **TypeScript** | Tipado estático |
| **Vite 7** | Build tool |
| **Tailwind CSS 3** | Estilos utilitarios |
| **shadcn/ui** | Componentes UI (40+) |
| **Framer Motion** | Animaciones fluidas |
| **Recharts** | Gráficas (Area, Line, Bar, Radar) |
| **Lucide React** | Iconografía |

## 🚀 Inicio Rápido

```bash
# Clonar el repositorio
git clone https://github.com/mauriale/bodysculpt-evolution-dashboard.git
cd bodysculpt-evolution-dashboard

# Instalar dependencias
npm install

# Ejecutar en modo desarrollo
npm run dev

# Build para producción
npm run build
```

## 📁 Estructura del Proyecto

```
src/
├── App.tsx              # Componente raíz con toda la lógica
├── App.css              # Estilos específicos de la app
└── components/
    └── ui/              # Componentes shadcn/ui (40+)
index.html
package.json
```

## 📐 Métricas Científicas Implementadas

- **Adonis Index** — Ratio hombros/cintura (objetivo: 1.618)
- **Golden Ratio** — Pecho/cintura (objetivo: 1.4)
- **V-Taper** — Proporción visual del torso
- **WHtR** — Cintura/estatura (objetivo: < 0.50)
- **WHR** — Cintura/cadera
- **Método McCallum** — Cálculo de medidas ideales basado en la muñeca

## 🎨 Diseño

Diseño oscuro premium con paleta dorada/ámbar, efectos glassmorphism, animaciones de entrada y transiciones fluidas.

---

*Generado con [Kimi Agent](https://kimi.ai) • Dashboard de evolución física personal*

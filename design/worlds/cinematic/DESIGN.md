---
version: alpha
name: Cinematic
description: Painéis escuros de ponta a ponta concentram a leitura em um elemento por vez. Elevação separa superfícies com sombra contida. A linha de evolução ganha uma área sutil, e o movimento desacelera as entradas.
colors:
  background: "#eff2f9"
  surface: "#e7ebf5"
  surface-raised: "#f7f9ff"
  foreground: "#141929"
  muted: "#47516a"
  border: "#bbc4dd"
  primary: "#353b84"
  on-primary: "#ffffff"
  accent: "#424965"
  on-accent: "#ffffff"
  focus: "#1d4ed8"
  success: "#15803d"
  on-success: "#ffffff"
  warning: "#a16207"
  on-warning: "#ffffff"
  danger: "#b91c1c"
  on-danger: "#ffffff"
  info: "#1d4ed8"
  on-info: "#ffffff"
  control-border: "#4d5875"
  data-1: "#353b84"
  data-2: "#15803d"
  data-3: "#b91c1c"
  data-4: "#a16207"
  data-5: "#7e22ce"
  data-6: "#0e7490"
  data-grid: "#bbc4dd"
  data-axis: "#47516a"
typography:
  display:
    fontFamily: '"Sora Variable", system-ui, sans-serif'
    fontWeight: 600
    letterSpacing: -0.055em
  headline:
    fontWeight: 600
  body:
    fontFamily: '"Sora Variable", system-ui, sans-serif'
    fontSize: 1rem
  label:
    fontWeight: 500
  mono:
    fontFamily: '"JetBrains Mono Variable", monospace'
rounded:
  sm: 8px
  md: 12px
  lg: 16px
  control: 12px
spacing:
  unit: 0.25rem
  control: 44px
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
  button-primary-hover:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
  button-secondary:
    backgroundColor: "{colors.surface-raised}"
    textColor: "{colors.foreground}"
  button-secondary-hover:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.foreground}"
  button-ghost:
    backgroundColor: "{colors.background}"
    textColor: "{colors.foreground}"
  button-ghost-hover:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.foreground}"
  card:
    backgroundColor: "{colors.surface-raised}"
    textColor: "{colors.foreground}"
  card-divider:
    backgroundColor: "{colors.border}"
  input:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.muted}"
  input-outline:
    backgroundColor: "{colors.control-border}"
  badge-neutral:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.on-accent}"
  focus-ring:
    backgroundColor: "{colors.focus}"
  chart:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.data-axis}"
  chart-grid:
    backgroundColor: "{colors.data-grid}"
  badge-success:
    backgroundColor: "{colors.success}"
    textColor: "{colors.on-success}"
  alert-success:
    backgroundColor: "{colors.success}"
    textColor: "{colors.on-success}"
  badge-warning:
    backgroundColor: "{colors.warning}"
    textColor: "{colors.on-warning}"
  alert-warning:
    backgroundColor: "{colors.warning}"
    textColor: "{colors.on-warning}"
  badge-danger:
    backgroundColor: "{colors.danger}"
    textColor: "{colors.on-danger}"
  alert-danger:
    backgroundColor: "{colors.danger}"
    textColor: "{colors.on-danger}"
  badge-info:
    backgroundColor: "{colors.info}"
    textColor: "{colors.on-info}"
  alert-info:
    backgroundColor: "{colors.info}"
    textColor: "{colors.on-info}"
  chart-series-1:
    backgroundColor: "{colors.data-1}"
  chart-series-2:
    backgroundColor: "{colors.data-2}"
  chart-series-3:
    backgroundColor: "{colors.data-3}"
  chart-series-4:
    backgroundColor: "{colors.data-4}"
  chart-series-5:
    backgroundColor: "{colors.data-5}"
  chart-series-6:
    backgroundColor: "{colors.data-6}"
motion:
  instant: {duration: 100ms, timingFunction: "cubic-bezier(0.2, 0, 0, 1)", delay: 0ms}
  fast: {duration: 150ms, timingFunction: "cubic-bezier(0.3, 0, 1, 1)", delay: 0ms}
  normal: {duration: 250ms, timingFunction: "cubic-bezier(0.2, 0, 0, 1)", delay: 0ms}
  slow: {duration: 300ms, timingFunction: "cubic-bezier(0, 0, 0, 1)", delay: 0ms}
  showcase: {duration: 500ms, timingFunction: "cubic-bezier(0, 0, 0, 1)", delay: 0ms}
genesis:
  density: 1
  borderWidth: 1px
  surfaceStyle: elevation
  iconWeight: thin
  metricTypeface: mono
  typeScale: 1.06
  displayWeight: 600
  displayTracking: -0.055em
  sectionHeading: { size: 1.375rem, fluid: 2.1, maxSize: 1.875rem, weight: 600, tracking: -0.035em }
  composition: immersive
  dialogScrim: "#18181b73"
  shadows:
    sm: 0 1px 2px rgb(0 0 0 / 0.06)
    md: 0 4px 12px rgb(0 0 0 / 0.08)
    lg: 0 12px 32px rgb(0 0 0 / 0.12)
  motionProfile:
    name: calm
    intensity: 0.55
    scale: 1.2
    spring: { stiffness: 150, damping: 30, mass: 1.1 }
  data:
    data-1: "#353b84"
    data-2: "#15803d"
    data-3: "#b91c1c"
    data-4: "#a16207"
    data-5: "#7e22ce"
    data-6: "#0e7490"
    data-grid: "#bbc4dd"
    data-axis: "#47516a"
  darkData:
    data-1: "#a6b6ff"
    data-2: "#4ade80"
    data-3: "#f87171"
    data-4: "#facc15"
    data-5: "#c084fc"
    data-6: "#22d3ee"
    data-grid: "#424d6d"
    data-axis: "#b2bedb"
  darkColors:
    background: "#090c16"
    surface: "#111627"
    surface-raised: "#1a2136"
    foreground: "#f1f4ff"
    muted: "#b2bedb"
    border: "#424d6d"
    primary: "#bdc7ff"
    on-primary: "#141a32"
    accent: "#c6b9f0"
    on-accent: "#16152a"
    focus: "#60a5fa"
    success: "#4ade80"
    on-success: "#0b0b0c"
    warning: "#facc15"
    on-warning: "#0b0b0c"
    danger: "#f87171"
    on-danger: "#0b0b0c"
    info: "#60a5fa"
    on-info: "#0b0b0c"
    control-border: "#8d9dc3"
---

# Cinematic

## Overview

Painéis escuros de ponta a ponta concentram a leitura em um elemento por vez. Elevação separa superfícies com sombra contida. A linha de evolução ganha uma área sutil, e o movimento desacelera as entradas.

## Colors

As cores semânticas separam ações, estados e superfícies. Os dados mantêm rótulos diretos.

## Typography

Sora nos títulos e Sora no corpo.

## Layout

Painéis escuros de ponta a ponta concentram a leitura em um elemento por vez. Elevação separa superfícies com sombra contida. A linha de evolução ganha uma área sutil, e o movimento desacelera as entradas.

## Elevation & Depth

Use sombra contida para separar as camadas.

## Shapes

O raio principal dos painéis é 16 px.

## Components

Preserve os rótulos, o contexto das métricas e os estados explícitos do resultado.

## Do's and Don'ts

- Preserve contraste e foco visível.
- Respeite o movimento reduzido.

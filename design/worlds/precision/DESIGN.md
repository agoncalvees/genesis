---
version: alpha
name: Precision
description: Instrumento técnico com grade estrutural de linhas de 1 px e marcadores de interseção. A hierarquia combina uma manchete com evidência inline, uma faixa de métricas monoespaçadas e uma área de trabalho em colunas. A cor azul identifica ações e a série principal.
colors:
  background: "#f9fafb"
  surface: "#f2f4f6"
  surface-raised: "#ffffff"
  foreground: "#161f29"
  muted: "#455466"
  border: "#bfc8d3"
  primary: "#18334e"
  on-primary: "#ffffff"
  accent: "#263848"
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
  control-border: "#526172"
  data-1: "#174e80"
  data-2: "#15803d"
  data-3: "#b91c1c"
  data-4: "#a16207"
  data-5: "#7e22ce"
  data-6: "#0e7490"
  data-grid: "#acb7c2"
  data-axis: "#455466"
typography:
  display:
    fontFamily: '"IBM Plex Sans Variable", system-ui, sans-serif'
    fontWeight: 600
    letterSpacing: -0.045em
  headline:
    fontWeight: 600
  body:
    fontFamily: '"IBM Plex Sans Variable", system-ui, sans-serif'
    fontSize: 1rem
  label:
    fontWeight: 500
  mono:
    fontFamily: '"IBM Plex Mono", monospace'
rounded:
  sm: 2px
  md: 3px
  lg: 4px
  control: 3px
spacing:
  unit: 0.25rem
  control: 40px
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
  slow: {duration: 400ms, timingFunction: "cubic-bezier(0, 0, 0, 1)", delay: 0ms}
  showcase: {duration: 600ms, timingFunction: "cubic-bezier(0, 0, 0, 1)", delay: 0ms}
genesis:
  density: 0.8
  borderWidth: 1px
  surfaceStyle: border
  iconWeight: light
  metricTypeface: mono
  typeScale: 1.05
  displayWeight: 600
  displayTracking: -0.045em
  sectionHeading: { size: 1.125rem, weight: 600, tracking: 0em }
  composition: workspace
  dialogScrim: "#18181b73"
  shadows:
    sm: 0 1px 2px rgb(0 0 0 / 0.06)
    md: 0 4px 12px rgb(0 0 0 / 0.08)
    lg: 0 12px 32px rgb(0 0 0 / 0.12)
  motionProfile:
    name: crisp
    intensity: 0.35
    scale: 0.7
    spring: { stiffness: 460, damping: 44, mass: 0.85 }
  data:
    data-1: "#174e80"
    data-2: "#15803d"
    data-3: "#b91c1c"
    data-4: "#a16207"
    data-5: "#7e22ce"
    data-6: "#0e7490"
    data-grid: "#acb7c2"
    data-axis: "#455466"
---

# Precision

## Overview

Instrumento técnico com grade estrutural de linhas de 1 px e marcadores de interseção. A hierarquia combina uma manchete com evidência inline, uma faixa de métricas monoespaçadas e uma área de trabalho em colunas. A cor azul identifica ações e a série principal.

## Colors

As cores semânticas separam ações, estados e superfícies. Os dados mantêm rótulos diretos.

## Typography

IBM Plex Sans nos títulos e IBM Plex Sans no corpo.

## Layout

Instrumento técnico com grade estrutural de linhas de 1 px e marcadores de interseção. A hierarquia combina uma manchete com evidência inline, uma faixa de métricas monoespaçadas e uma área de trabalho em colunas. A cor azul identifica ações e a série principal.

## Elevation & Depth

Use bordas para organizar as superfícies.

## Shapes

O raio principal dos painéis é 4 px.

## Components

Preserve os rótulos, o contexto das métricas e os estados explícitos do resultado.

## Do's and Don'ts

- Preserve contraste e foco visível.
- Respeite o movimento reduzido.

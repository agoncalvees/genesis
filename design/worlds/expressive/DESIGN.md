---
version: alpha
name: Expressive
description: A tipografia pesada organiza uma pilha editorial de seções largas. Ações em cápsula contrastam com cartões retos. As barras largas reservam o acento saturado para o último valor da série, com identificação textual.
colors:
  background: "#fff9ee"
  surface: "#f9eddc"
  surface-raised: "#fff5e7"
  foreground: "#24151c"
  muted: "#614551"
  border: "#d5b7b7"
  primary: "#9f1454"
  on-primary: "#ffffff"
  accent: "#65273f"
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
  control-border: "#785365"
  data-1: "#ab1457"
  data-2: "#15803d"
  data-3: "#b91c1c"
  data-4: "#a16207"
  data-5: "#6836b6"
  data-6: "#0e7490"
  data-grid: "#d5b7b7"
  data-axis: "#614551"
typography:
  display:
    fontFamily: '"Bricolage Grotesque Variable", system-ui, sans-serif'
    fontWeight: 800
    letterSpacing: -0.07em
  headline:
    fontWeight: 800
  body:
    fontFamily: '"Figtree Variable", system-ui, sans-serif'
    fontSize: 1rem
  label:
    fontWeight: 500
  mono:
    fontFamily: ui-monospace, monospace
rounded:
  sm: 0px
  md: 0px
  lg: 0px
  control: 999px
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
  showcase: {duration: 540ms, timingFunction: "cubic-bezier(0.22, 1, 0.36, 1)", delay: 30ms}
genesis:
  density: 1.25
  borderWidth: 1px
  surfaceStyle: tint
  iconWeight: bold
  typeScale: 1.16
  displayWeight: 800
  displayTracking: -0.07em
  sectionHeading: { size: 1.75rem, fluid: 3.3, maxSize: 3.25rem, weight: 800, tracking: -0.05em }
  composition: editorial
  dialogScrim: "#18181b73"
  shadows:
    sm: 0 1px 2px rgb(0 0 0 / 0.06)
    md: 0 4px 12px rgb(0 0 0 / 0.08)
    lg: 0 12px 32px rgb(0 0 0 / 0.12)
  motionProfile:
    name: lively
    intensity: 1
    scale: 1
    spring: { stiffness: 300, damping: 19, mass: 0.8 }
  data:
    data-1: "#ab1457"
    data-2: "#15803d"
    data-3: "#b91c1c"
    data-4: "#a16207"
    data-5: "#6836b6"
    data-6: "#0e7490"
    data-grid: "#d5b7b7"
    data-axis: "#614551"
---

# Expressive

## Overview

A tipografia pesada organiza uma pilha editorial de seções largas. Ações em cápsula contrastam com cartões retos. As barras largas reservam o acento saturado para o último valor da série, com identificação textual.

## Colors

As cores semânticas separam ações, estados e superfícies. Os dados mantêm rótulos diretos.

## Typography

Bricolage Grotesque nos títulos e Figtree no corpo.

## Layout

A tipografia pesada organiza uma pilha editorial de seções largas. Ações em cápsula contrastam com cartões retos. As barras largas reservam o acento saturado para o último valor da série, com identificação textual.

## Elevation & Depth

Diferencie superfícies com tintas suaves.

## Shapes

O raio principal dos painéis é 0 px.

## Components

Preserve os rótulos, o contexto das métricas e os estados explícitos do resultado.

## Do's and Don'ts

- Preserve contraste e foco visível.
- Respeite o movimento reduzido.

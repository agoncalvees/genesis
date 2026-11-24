---
version: alpha
name: Civic
description: Uma coluna guiada conduz da leitura do resultado à verificação. Passos numerados, bordas de 2 px, rótulos diretos e alvos amplos apoiam a navegação. As transições são instantâneas.
colors:
  background: "#fbfdf9"
  surface: "#eef4ed"
  surface-raised: "#ffffff"
  foreground: "#172821"
  muted: "#354a40"
  border: "#8da195"
  primary: "#164b38"
  on-primary: "#ffffff"
  accent: "#264a40"
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
  control-border: "#496356"
  data-1: "#164b38"
  data-2: "#397624"
  data-3: "#b91c1c"
  data-4: "#a16207"
  data-5: "#7e22ce"
  data-6: "#0e7490"
  data-grid: "#a6b8aa"
  data-axis: "#354a40"
typography:
  display:
    fontFamily: '"Newsreader Variable", serif'
    fontWeight: 600
    letterSpacing: -0.025em
  headline:
    fontWeight: 600
  body:
    fontFamily: '"Atkinson Hyperlegible", system-ui, sans-serif'
    fontSize: 1.125rem
  label:
    fontWeight: 500
  mono:
    fontFamily: ui-monospace, monospace
rounded:
  sm: 8px
  md: 10px
  lg: 12px
  control: 10px
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
  density: 1.15
  borderWidth: 2px
  surfaceStyle: border
  iconWeight: regular
  typeScale: 1.03
  displayWeight: 600
  displayTracking: -0.025em
  sectionHeading: { size: 1.625rem, fluid: 2.5, maxSize: 1.75rem, weight: 600, tracking: -0.015em }
  composition: guided
  dialogScrim: "#18181b73"
  shadows:
    sm: 0 1px 2px rgb(0 0 0 / 0.06)
    md: 0 4px 12px rgb(0 0 0 / 0.08)
    lg: 0 12px 32px rgb(0 0 0 / 0.12)
  motionProfile:
    name: still
    intensity: 0
    scale: 0
    spring: { stiffness: 300, damping: 40, mass: 1 }
  data:
    data-1: "#164b38"
    data-2: "#397624"
    data-3: "#b91c1c"
    data-4: "#a16207"
    data-5: "#7e22ce"
    data-6: "#0e7490"
    data-grid: "#a6b8aa"
    data-axis: "#354a40"
---

# Civic

## Overview

Uma coluna guiada conduz da leitura do resultado à verificação. Passos numerados, bordas de 2 px, rótulos diretos e alvos amplos apoiam a navegação. As transições são instantâneas.

## Colors

As cores semânticas separam ações, estados e superfícies. Os dados mantêm rótulos diretos.

## Typography

Newsreader nos títulos e Atkinson Hyperlegible no corpo.

## Layout

Uma coluna guiada conduz da leitura do resultado à verificação. Passos numerados, bordas de 2 px, rótulos diretos e alvos amplos apoiam a navegação. As transições são instantâneas.

## Elevation & Depth

Use bordas para organizar as superfícies.

## Shapes

O raio principal dos painéis é 12 px.

## Components

Preserve os rótulos, o contexto das métricas e os estados explícitos do resultado.

## Do's and Don'ts

- Preserve contraste e foco visível.
- Respeite o movimento reduzido.

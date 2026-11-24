---
version: alpha
name: Isoterma
description: Atlas térmico editorial. Papel cor de areia, tinta de terra, verde de vegetação para ações e uma rampa térmica que vai do mineral frio ao óxido quente. O território é a superfície principal; texto e controles orbitam o mapa em composição assimétrica, com hairlines precisas e numerais monoespaçados.
colors:
  background: "#f3eee4"
  surface: "#ebe4d6"
  surface-raised: "#faf7f1"
  foreground: "#1e1a15"
  muted: "#574d42"
  border: "#cfc4b1"
  primary: "#1f4d3a"
  on-primary: "#ffffff"
  accent: "#7c3318"
  on-accent: "#ffffff"
  focus: "#0e5a78"
  success: "#2d6a3c"
  on-success: "#ffffff"
  warning: "#835400"
  on-warning: "#ffffff"
  danger: "#a1281c"
  on-danger: "#ffffff"
  info: "#1f5878"
  on-info: "#ffffff"
  control-border: "#73665a"
  data-1: "#b23a1d"
  data-2: "#2d6a3c"
  data-3: "#1f5878"
  data-4: "#835400"
  data-5: "#6a3d6c"
  data-6: "#4a4a3c"
  data-grid: "#b9ad97"
  data-axis: "#574d42"
typography:
  display:
    fontFamily: '"Newsreader Variable", serif'
    fontWeight: 500
    letterSpacing: -0.02em
  headline:
    fontWeight: 500
  body:
    fontFamily: '"IBM Plex Sans Variable", system-ui, sans-serif'
    fontSize: 1rem
  label:
    fontWeight: 500
  mono:
    fontFamily: '"IBM Plex Mono", monospace'
rounded:
  sm: 1px
  md: 2px
  lg: 3px
  control: 2px
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
  caption:
    backgroundColor: "{colors.background}"
    textColor: "{colors.muted}"
  input:
    backgroundColor: "{colors.surface-raised}"
    textColor: "{colors.foreground}"
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
  fast: {duration: 160ms, timingFunction: "cubic-bezier(0.4, 0, 1, 1)", delay: 0ms}
  normal: {duration: 280ms, timingFunction: "cubic-bezier(0.25, 0.1, 0.1, 1)", delay: 0ms}
  slow: {duration: 400ms, timingFunction: "cubic-bezier(0.16, 1, 0.3, 1)", delay: 0ms}
  showcase: {duration: 600ms, timingFunction: "cubic-bezier(0.16, 1, 0.3, 1)", delay: 0ms}
genesis:
  density: 1
  borderWidth: 1px
  surfaceStyle: border
  iconWeight: light
  metricTypeface: mono
  typeScale: 1.25
  displayWeight: 500
  displayTracking: -0.02em
  sectionHeading: { size: 1.375rem, weight: 500, tracking: -0.01em }
  composition: atlas
  dialogScrim: "#1e1a1580"
  shadows:
    sm: 0 1px 0 rgb(30 26 21 / 0.06)
    md: 0 2px 8px rgb(30 26 21 / 0.08)
    lg: 0 12px 28px rgb(30 26 21 / 0.12)
  motionProfile:
    name: calm
    intensity: 0.5
    scale: 1
    spring: { stiffness: 220, damping: 32, mass: 1 }
  data:
    data-1: "#b23a1d"
    data-2: "#2d6a3c"
    data-3: "#1f5878"
    data-4: "#835400"
    data-5: "#6a3d6c"
    data-6: "#4a4a3c"
    data-grid: "#b9ad97"
    data-axis: "#574d42"
---

# Isoterma

## Overview

Atlas térmico editorial para entender como intervenções urbanas podem mudar a temperatura de superfície de um território. A interface se comporta como uma prancha de atlas científico impressa em papel de areia: o mapa ocupa a maior parte do campo visual, o texto aparece em colunas estreitas como legendas e notas de rodapé, e os controles da simulação ficam junto do território, não em uma barra administrativa.

Princípios (referências usadas como princípios, não como modelos):
- Comunicação científica sóbria: cada número tem unidade, origem e incerteza visíveis.
- Narrativa orientada por dados: o usuário percorre uma sequência clara (problema → território → região → intervenção → transformação → comparação → limites).
- Visualização espacial como superfície principal: o território é a interface.
- Materialidade de prancha de arquitetura e urbanismo: hairlines, cotas, legendas numeradas, margens generosas, composição assimétrica.
- Mecanismos técnicos explicados por diagramas simples (o que muda, por quê, em quanto).

## Colors

Papel (`background` #f3eee4), areia (`surface` #ebe4d6) e folha clara (`surface-raised` #faf7f1) formam as superfícies. Tinta de terra (`foreground` #1e1a15) para texto; `muted` #574d42 para legendas. Verde de vegetação (`primary` #1f4d3a) para ações e para tudo que é intervenção verde. Óxido (`accent` #7c3318) marca o calor e chamadas editoriais. Foco em azul mineral (`focus` #0e5a78), sempre visível.

### Rampa térmica (sequencial, uso exclusivo para temperatura)
Sete passos, do mais frio ao mais quente. Use sempre com legenda numérica em °C e nunca como única forma de informação (acompanhe com valor, rótulo ou padrão).

| Passo | Cor | Faixa sugerida (°C, sintético) |
|---|---|---|
| t1 | #2f5d62 | ≤ 30 |
| t2 | #6f8f7a | 30–32 |
| t3 | #b8b98f | 32–34 |
| t4 | #e3c98a | 34–36 |
| t5 | #d99a5b | 36–38 |
| t6 | #b5572e | 38–40 |
| t7 | #8a2a17 | > 40 |

Texto sobre a rampa: use `foreground` sobre t2–t5 e branco sobre t1, t6 e t7, ou coloque rótulos fora do preenchimento sobre `surface-raised`.

### Diferença (antes/depois)
Resfriamento usa a família verde/mineral (`data-2`, `data-3`); aquecimento usa óxido (`data-1`). Sempre com sinal explícito (−1,8 °C) e não só cor.

## Typography

Newsreader (serifada editorial, OFL) para manchetes, títulos de seção e números de destaque narrativos. IBM Plex Sans (OFL) para corpo, controles e legendas. IBM Plex Mono para métricas, coordenadas, cotas e valores com unidade, com numerais tabulares. Escala de razão 1,25. Manchetes grandes, com peso 500 e tracking levemente negativo; corpo a 16 px com linhas de 60–72 caracteres. Rótulos de legenda em caixa alta pequena só em mono, com tracking positivo.

## Layout

Composição `atlas`: grade assimétrica de 12 colunas em telas largas. O território ocupa 7–8 colunas; uma coluna estreita de narrativa (3–4 colunas) segue a leitura; anotações e legendas ficam em margens. Nada de sidebar administrativa nem grade de cards iguais. Em 768 px, mapa em largura total com a narrativa abaixo; em 360 px, sequência vertical com o mapa fixo em proporção legível e controles grandes (≥ 44 px) abaixo dele. Margens generosas e respiração vertical; hairlines de 1 px separam blocos como em uma prancha técnica. Cotas e índices numerados (01, 02, …) marcam as etapas da narrativa.

## Elevation & Depth

Superfície por borda (`border`), não por sombra. Sombras quase imperceptíveis apenas em camadas flutuantes (tooltip, popover). Sem glassmorphism, sem gradientes decorativos; o único gradiente permitido é a rampa térmica quando representa dado.

## Shapes

Geometria precisa: raios de 1–3 px, hairlines de 1 px, marcadores de interseção e cotas em cruz. Regiões do mapa com contornos finos; seleção indicada por contorno mais espesso + hachura ou deslocamento de rótulo, não só por cor.

## Components

- Território (mapa SVG): regiões selecionáveis por clique e por teclado, com nome acessível, valor em °C e legenda da rampa.
- Controles de intervenção: sliders/steppers com valor numérico visível, unidade e faixa; botão primário verde para simular.
- Comparação antes/depois: duas leituras lado a lado ou deslizante, sempre com diferença numérica e sinal.
- Evidências e limitações: notas numeradas no estilo de rodapé editorial, com rótulo claro de "dados sintéticos" e "cálculo demonstrativo".
- Estados: inicial, região selecionada, parâmetros alterados, processando (demonstrativo), resultado, erro e reset — todos explícitos e anunciados a leitores de tela.

## Motion

Perfil `calm`: transições graduais e explicativas, nunca ornamentais. O mapa recolore de forma progressiva (≤ 600 ms) para mostrar a transformação; números interpolam até o valor final; a comparação revela a diferença por varredura. Interações ≤ 400 ms. Com `prefers-reduced-motion: reduce`, tudo muda instantaneamente e o estado final é o mesmo.

## Do's and Don'ts

- Faça do território a interface principal; o texto é legenda.
- Mostre unidade, rótulo "sintético" e incerteza em todo resultado.
- Preserve contraste AA, foco visível e navegação completa por teclado.
- Respeite o movimento reduzido.
- Não use sidebar administrativa, dashboard de cards, gradientes roxos/azuis, glassmorphism, ícones decorativos repetidos, chatbot ou landing page de marketing.
- Não apresente o cálculo demonstrativo como previsão científica.

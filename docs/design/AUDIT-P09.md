# Auditoria P09 — Design System atual (somente leitura)

Data: 2026-11-24. Auditor: OpenCode (hy4-flash-free). Task `P09-OC-01`. Coordenador: Claude.

## Escopo, método e limites

- Inspecionado: `src/design-system/**` (tokens, temas, primitivas, componentes, padrões, motion, lib), `src/layouts/**`, `src/studio/**`, `src/routes/**`, `src/features/**` como consumidores, `src/styles/base.css`, `tests/**` relacionados e `docs/design/*.md`. Contexto: `docs/architecture/decisions/0006-design-engine.md` (ADR **proposta**, não implementada) e `docs/STATUS.md`.
- Comandos executados nesta máquina: `bun run test` → **194 passed, 1 skipped (195)**; `bun run check` (Biome) → **0 erros, 181 arquivos**. **Não** executei `test:e2e` (exige servidor, proibido pela task). Achados E2E abaixo são de **definição de teste lida no código** e do registro preexistente em `docs/STATUS.md:16-17`, não de execução minha.
- Nenhum arquivo de código foi alterado. Saídas: este documento e o checkpoint `docs/engineering/phase-09/checkpoints/P09-OC-01.md`.
- Citação `arquivo:linha` = linha exata no estado atual da branch `main`.
- Severidade: **alta** = bloqueia eixo estrutural do motor de temas; **média** = limita reuso/qualidade e exigirá refatoração; **baixa** = dívida local ou risco condicional.

**Contagem total: 37 achados — 8 altos, 19 médios, 10 baixos.**

---

## 1. Inventário de componentes, padrões, layouts e primitivas exportados

Fonte da API pública: `src/design-system/index.ts:1-29`; layouts em `src/layouts/index.ts:1-4`. "Testes" = arquivos que exercitam o export diretamente ou por composição.

| Export | Arquivo | Propósito | Variantes disponíveis | Tokens/classes consumidos | Testes que cobrem |
|---|---|---|---|---|---|
| `Dialog` | `components/overlays.tsx:20` | Modal com trigger, título, descrição e ação de fechar | `trigger`, `title`, `description`, `closeLabel`, children | `floatingSurface` (`overlays.tsx:10-11`), `bg-foreground/45` + `z-40` (`:34,:36`), `fade` (`:8-9`), `max-w-md p-5` (`:41`) | `tests/component/design-system.test.tsx:232` |
| `Popover` | `components/overlays.tsx:69` | Popover ancorado | `trigger`, `title`, `description`, children | `floatingSurface`, `z-50`, `sideOffset={8}` (`:80`), `max-w-[min(20rem,…)]` (`:85`), `fade` | `design-system.test.tsx:255` |
| `Tooltip`, `TooltipProvider` | `components/overlays.tsx:106`, `:104` | Dica acessível por foco | `trigger`, children; provider = alias base UI | `z-50`, `sideOffset={8}` (`:123`), `bg-primary text-on-primary shadow-md text-xs` (`:129`), `role="tooltip"` (`:126`) | `design-system.test.tsx:271`; provider usado em `studio/catalog.tsx:69` |
| `EmptyState` | `components/states.tsx:11` | Estado vazio com heading/descrição/ação | `title`, `headingLevel`, `description`, `action` | `border-dashed border-muted bg-surface rounded-lg p-4` (`:21`) | `design-system.test.tsx:320`; `motion-patterns.test.tsx:84` (via `ResultPanel`) |
| `ErrorState` | `components/states.tsx:33` | Erro com mensagem e retry condicional | `error.retryable`, `onRetry`, `retryLabel`, `headingLevel` | `border-danger bg-surface` (`:41`), `role="alert"` (`:42`), `Button secondary sm` (`:47`) | `design-system.test.tsx:320`; `motion-patterns.test.tsx:84` |
| `Tabs` | `components/tabs.tsx:11` | Abas controladas/não controladas | `label`, `items`, `defaultValue`, `disabled` por item | `border-b border-border pb-1 gap-1` (`:29`), `min-h-8 px-3 rounded-md` (`:36`), `data-active:bg-primary text-on-primary` (`:36`) | `design-system.test.tsx:277`; `motion-patterns.test.tsx:42` |
| `Toast`, `ToastProvider`, `useToast` | `components/toast.tsx:34`, `:7`, `:5` | Notificação com dismiss e swipe | `toast`, `dismissLabel` (viewport), `swipeDirection="down"` | viewport `fixed inset-x-4 bottom-4 z-60` (`:25`), `rounded-lg border-border bg-surface-raised shadow-lg` (`:45`), `duration-(--duration-fast)` (`:45`) | `design-system.test.tsx:307` |
| `cn` | `lib/cn.ts:4` | `clsx` + `tailwind-merge` | — | nenhum | indireto (todos os componentes) |
| `Button`, `IconButton`, `ButtonProps` | `primitives/button.tsx:37`, `:71`, `:31` | Ação e ação só-ícone | `variant` primary/secondary/ghost/danger (`:11-20`), `size` sm/md/lg (`:21-25`), `loading`, `requireHydration` | `rounded-md border font-body text-sm`, `duration-(--duration-instant)`, `ease-standard`, `active:scale-[0.98]` (`:8`), `min-h-(--control-height)` (`:23`), `size-(--control-height)` (`:67`), `SpinnerMark` (`:5,:59`) | `design-system.test.tsx:45`, `:62` |
| `Badge`, `Progress`, `Skeleton`, `Spinner` | `primitives/feedback.tsx:14`, `:70`, `:57`, `:40` | Feedback e carregamento | `tone` neutral/success/warning/danger/info (`:6-12`); `Progress.value` determinado/indeterminado (`:70-82`) | `rounded-sm px-2 py-0.5 text-xs` (`:23`), `size-4 border-2 … [animation-duration:var(--duration-showcase)]` (`:35`), `h-2 rounded-full bg-surface ring-1 ring-muted` (`:99`), `h-4 rounded-sm bg-border` (`:65`) | `design-system.test.tsx:207` |
| `Field`, `Input`, `Textarea` | `primitives/field.tsx:36`, `:94`, `:110` | Rótulo, ajuda, erro e controles de texto | `label`, `description`, `error`, `invalid`; `Textarea` com `min-h-24` | `controlStyles` (`:13-14`) com `min-h-(--control-height)`, `rounded-md border-muted`, `gap-1.5` (`:58`), `role="alert"` (`:84`) | `design-system.test.tsx:99`, `:352` |
| `Card`, `Container`, `Grid`, `Stack` | `primitives/layout.tsx:34`, `:4`, `:22`, `:16` | Superfície e composição | somente `className`/props nativas | `rounded-lg border-border bg-surface-raised p-4 shadow-sm` (`:39`), `max-w-(--content-max) px-4 sm:px-6 lg:px-8` (`:9`), `grid-cols-[repeat(auto-fit,minmax(min(100%,16rem),1fr))] gap-4` (`:27`), `flex-col gap-4` (`:18`) | `design-system.test.tsx:182` |
| `Select` | `primitives/select.tsx:9` | Seleção com options/placeholder/triggerProps | `options` com `disabled`, `placeholder`, `triggerProps` | `controlStyles` (`:29`), `sideOffset={6}` (`:45`), `z-50` (`:46`), `rounded-md border-border shadow-md p-1 duration-(--duration-fast)` (`:48`), `grid-cols-[1rem_minmax(0,1fr)]` (`:55`) | `design-system.test.tsx:125` |
| `Checkbox`, `Switch` | `primitives/toggles.tsx:8`, `:37` | Seleção booleana com estado indeterminado | `indeterminate` (`:10`), `data-checked`/`data-indeterminate` | `size-6 rounded-sm border-muted` (`:22`), `h-6 w-11 rounded-full p-0.5` (`:49`), thumb `size-[18px] … duration-(--duration-fast)` (`:53`) | `design-system.test.tsx:158`, `:352` |
| `Code`, `Heading`, `Text` | `primitives/typography.tsx:48`, `:13`, `:31` | Tipografia semântica | `Heading.level` 1–6 (`:4-11`); `Text.muted` (`:32`) | `font-display/body/mono` (`:23,:40,:53`), `tracking-tight` (`:23`), `leading-relaxed` (`:40`), `text-3xl..5xl` (`:5-10`), `rounded-sm bg-surface px-1.5 py-0.5` (`:53`) | `design-system.test.tsx:182` |
| `durations`, `easings`, `readMotionTiming`, `MotionDuration` | `motion/presets.ts:1`, `:9`, `:17`, `:15` | Nomes dos tokens de motion e leitura computed | 5 durações, 3 easings | CSS vars `--duration-*`, `--ease-*` (`tokens/base.css:13-17,28-30`) | indireto via `motion-patterns.test.tsx:20` |
| `MotionProvider` | `motion/motion-provider.tsx:4` | Respeito global a reduced motion | `reducedMotion="user"` (`:5`) | `MotionConfig` da Motion | `motion-patterns.test.tsx:20`; `e2e/motion.spec.ts:135` |
| `FadeIn`, `StaggerGroup` | `motion/entrances.tsx:6`, `:26` | Entrada e stagger | `duration` (`:8-11`), `Children.map` com atraso (`:33-40`) | `ds-fade-in` + `--enter-duration` (`:15,18`); `--enter-delay` calculado (`:39`); `gap-2` (`:32`) | `motion-patterns.test.tsx:20`; `e2e/motion.spec.ts:92,135` |
| `AnimatedNumber` | `motion/animated-number.tsx:18` | Contagem animada com `Intl` | `locale`, `format`, `duration` | `--duration-*` e `--ease-standard` via `readMotionTiming` (`:47`); `sr-only` (`:64`); `matchMedia` (`:6-16,33-37`) | `motion-patterns.test.tsx:20` |
| `AnimatedTabsIndicator` | `motion/animated-tabs-indicator.tsx:6` | `Tabs` com indicador animado | herda `Tabs` | wrapper `ds-animated-tabs` (`:14`); indicador `currentColor`, `2px`, `9999px` (`motion.css:55-63`) | `motion-patterns.test.tsx:42` |
| `Expandable` | `motion/expandable.tsx:6` | Disclosure nativo animado | `label`, props de `<details>` | `rounded-lg border-border bg-surface` (`:16`), `min-h-11 px-4 py-2` (`:20`), `duration-(--duration-fast)` (`:25`) | `motion-patterns.test.tsx:42`; `e2e/motion.spec.ts:148` |
| `ProcessingFeedback` | `motion/processing-feedback.tsx:7` | Progresso + etapas observáveis | `steps`, `label`, `progress` | compõe `Progress` e `ProcessTimeline` (`:18-19`), `gap-4` (`:17`) | `motion-patterns.test.tsx:66` |
| `BeforeAfter` | `patterns/before-after.tsx:29` | Comparação com slider de revelação | `before`/`after` = imagem (`src`/`alt`) ou `ReactNode`, `label` | `aspect-video rounded-md bg-surface ring-1 ring-border` (`:44`), `w-px bg-foreground` (`:55`), slider `h-11 accent-primary` (`:65`), `aria-valuetext` (`:72`) | `motion-patterns.test.tsx:145`; `e2e/motion.spec.ts:61` |
| `EvidenceExcerpt` | `patterns/evidence-excerpt.tsx:1` | Trecho de evidência com destaque | `start`, `end`, `context`, `label`; valida UTF-16 (`:17-27`) | `<mark>` `bg-warning text-on-warning underline decoration-2` (`:35`), `sr-only` (`:36`), `text-sm` (`:30`) | `motion-patterns.test.tsx:165` |
| `Metric` | `patterns/metric.tsx:3` | Métrica com delta e amostra | `locale`, `format`; `EvaluationResult` (`:1`) | `font-display text-2xl tabular-nums` (`:22`), `text-muted` (`:21,27,36`) | `motion-patterns.test.tsx:186` |
| `ProcessStep`, `ProcessTimeline` | `patterns/process-timeline.tsx:4`, `:19` | Linha do tempo de execução | status idle/running/completed/failed/cancelled → tone (`:11-17`) | `ms-3 border-s border-border ps-5 space-y-3` (`:29`), `Badge` (`:37`) | `motion-patterns.test.tsx:66` |
| `ResultPanel` | `patterns/result-panel.tsx:38` | Painel com 6 estados via `toUiState` | união discriminada por `status` (`:8-27`), `feedback`, `onRetry`, `isEmpty`, `renderResult` | `border-border bg-surface-raised rounded-lg p-4 sm:p-5` (`:89`), `role="status"` (`:95`), `FadeIn` (`:99`) | `motion-patterns.test.tsx:84`; `result-panel.types.tsx:9-29` (tipos); `e2e/motion.spec.ts:35` |
| `ApplicationLayout` | `layouts/application-layout.tsx:5` | Cabeçalho + nav + conteúdo + rodapé | `header`, `navigation?`, `footer` | `min-h-dvh bg-background` (`:13`), `max-w-(--content-max)`, `md:grid-cols-[12rem_minmax(0,1fr)]` (`:22-23`) | `layouts.test.tsx:12`, `:34` |
| `FocusedLayout` | `layouts/focused-layout.tsx:3` | Coluna única | `header?`, `footer?` | `max-w-xl px-4 sm:px-6` (`:6`), `py-8 sm:py-12` (`:11`) | `layouts.test.tsx:12` |
| `PresentationLayout` | `layouts/presentation-layout.tsx:3` | Leitura larga centralizada | `header?`, `footer?` | `min-h-svh`, `px-5 sm:px-10`, `py-16 sm:py-24` (`:6,9,16`) | `layouts.test.tsx:12` |
| `WorkspaceLayout` | `layouts/workspace-layout.tsx:4` | Área central + ferramentas + inspetor | `tools?`, `inspector?` | `md:w-40` (`:22`), `md:w-48 lg:w-64` (`:37`), bordas `border-b/border-e/border-s` | `layouts.test.tsx:12`, `:34` |
| `SkipLink`, `useMainContentId`, `LayoutProps` | `layouts/layout-parts.tsx:13`, `:9`, `:3` | Navegação por teclado e landmarks | `target` | `sr-only z-50 focus:not-sr-only focus:fixed` (`:17`) | `layouts.test.tsx:12` |

Componentes locais do Studio (não exportados pelo design system): `ThemeToggle` (`studio/catalog.tsx:239`), `ToastExample` (`:268`), `ErrorExample` (`:287`), `ComparisonGraphic` (`:408`), `ResultExamples` (`:449`), `LayoutLinks` (`:525`).

---

## 2. Valores hardcoded

**F01 — médio.** `size-[18px]` no thumb do Switch (`primitives/toggles.tsx:53`) é um px arbitrário que não passa por `--control-height` (`tokens/base.css:8`) nem por escala de espaço.

**F02 — médio.** Larguras arbitrárias e "números mágicos" de layout: `max-w-[min(20rem,var(--available-width))]` (`components/overlays.tsx:85`), `max-w-[min(16rem,var(--available-width))]` (`:129`), `md:grid-cols-[12rem_minmax(0,1fr)]` (`layouts/application-layout.tsx:23`), `grid-cols-[repeat(auto-fit,minmax(min(100%,16rem),1fr))]` (`primitives/layout.tsx:27`), `grid-cols-[1rem_minmax(0,1fr)]` (`primitives/select.tsx:55`).

**F03 — médio.** `z-index` literal sem token: `z-40` (`components/overlays.tsx:34,36`), `z-50` (`:80,:123`; `primitives/select.tsx:46`; `layouts/layout-parts.tsx:17`), `z-60` (`components/toast.tsx:25`). Ordem de empilhamento é parte da composição visual e não é configurável.

**F04 — baixo.** Offsets e durações literais: `sideOffset={8}` (`components/overlays.tsx:80,123`), `sideOffset={6}` (`primitives/select.tsx:45`), `duration-0` (`components/toast.tsx:45`). Arbitrários com variáveis de token são menos graves: `motion-safe:[animation-duration:var(--duration-showcase)]` (`primitives/feedback.tsx:35`) e `motion-safe:[transition-duration:var(--duration-fast)]` (`motion/expandable.tsx:25`).

**F05 — baixo.** Cores de sombra fixas em preto: `--shadow-sm/md/lg: … rgb(0 0 0 / …)` (`tokens/base.css:25-27`). São tokens, mas o *hue* preto é uma decisão de identidade disfarçada de escala; o teste de tokens só proíbe literais em `primitives/` e `components/` (`tests/unit/design-system/tokens.test.ts:10-13,67-70`), não nos tokens.

**F06 — baixo.** Geometria estática fora dos tokens de raio: `active:scale-[0.98]` (`primitives/button.tsx:8`), `rounded-full` em `primitives/feedback.tsx:35,99` e `primitives/toggles.tsx:49`, e `border-radius: 9999px` literal em `motion/motion.css:61`. Os raios `sm/md/lg` em `tokens/base.css:22-24` são variáveis CSS (bom), mas `full` não é.

**F07 — médio.** Escala tipográfica não é token: `text-3xl sm:text-4xl … text-sm` (`primitives/typography.tsx:5-10`), `text-sm` (`primitives/typography.tsx:40,53`; `patterns/metric.tsx:21,24`), `text-4xl sm:text-5xl` (`routes/index.tsx:23`). `docs/design/DESIGN-SYSTEM.md:6` pede tamanho/peso/line-height/tracking parametrizados; só a família é variável (`themes/product.css:30-32`).

> Varredura: nenhum `text-[13px]`, `rounded-[…]`, `duration-[…]` ou cor literal (`#hex`, `rgb`, `hsl`, `oklch`) em componentes/primitivas fora de `themes/product.css` e `tokens/base.css`. `bun run check` = 0; teste de tokens confirma a ausência (`tokens.test.ts:88-115`).

---

## 3. Acoplamento à identidade atual (olhar neutro)

**F08 — alto.** Superfícies definidas por borda em quase todo lugar: `Card` (`primitives/layout.tsx:39`), `ResultPanel` (`patterns/result-panel.tsx:89`), `floatingSurface` de Dialog/Popover (`components/overlays.tsx:10-11`), `EmptyState`/`ErrorState` (`components/states.tsx:21,41`), `Expandable` (`motion/expandable.tsx:16`), cabeçalhos/rodapés dos quatro layouts (`layouts/application-layout.tsx:16,29,39`; `layouts/focused-layout.tsx:9,15`; `layouts/presentation-layout.tsx:9,21`; `layouts/workspace-layout.tsx:16,22,37,44`). Um mundo "elevation" ou "tint" (ADR 0006:22) deixaria de existir visualmente sem alterar cada arquivo.

**F09 — alto.** O backdrop do Dialog usa `bg-foreground/45` (`components/overlays.tsx:34`). No tema claro, `foreground` é quase preto (`themes/product.css:13`) → scrim escuro correto; no escuro, `foreground` é quase branco (`:40`) → scrim **claro**, invertendo a convenção. Nenhum par `foreground/foreground` é medido (`tests/unit/design-system/contrast.test.ts:96-116`). É uma suposição de "dark-on-light" embutida no componente.

**F10 — médio.** Enquadramento fixo: `aspect-video` em `BeforeAfter` (`patterns/before-after.tsx:44`) e `viewBox="0 0 240 240"` / `viewBox="0 0 320 180"` desenhados à mão em `features/route-opt/route-optimizer.tsx:70` e `studio/catalog.tsx:423`. Direções cinematográficas (2.39:1) ou científicas (grid denso) não cabem sem reescrita.

**F11 — médio.** Métricas de fonte do sistema assumidas: `system-ui, -apple-system, "Segoe UI", sans-serif` (`themes/product.css:30-32`), aplicado ao `body` (`styles/base.css:34`), combinado a degraus Tailwind fixos (`primitives/typography.tsx:5-10`). `docs/design/FIGMA-WORKFLOW.md:8` recomenda escolher fontes por contexto e evitar Geist por padrão, mas não há razão de escala nem `line-height`/`tracking` por tema.

**F12 — médio.** Raio único por componente: só `rounded-sm/md/lg` (`tokens/base.css:22-24`) mais `rounded-full` estático (F06). Um mundo orgânico (raios grandes) ou denso/científico (cantos vivos) não tem um eixo `shape` único para alternar.

**F13 — baixo.** Textos de UI fixos em inglês dentro de componentes reutilizáveis: `Skip to main content` (`layouts/layout-parts.tsx:19`), `Ready to run.`/`Execution is in progress.`/`No results`/`Execution failed`/`Execution was cancelled.` (`patterns/result-panel.tsx:50,53,60,63,72,81`), rótulos de status (`patterns/process-timeline.tsx:12-16,21`), `Before and after comparison`/`Before`/`After` (`patterns/before-after.tsx:32,62,79-80`), `Highlighted evidence` (`patterns/evidence-excerpt.tsx:6`). Isso dificulta reuso em mundos com outro idioma e reforça F23.

---

## 4. Acoplamento entrecomponentes e lógica

**F14 — médio.** O design system depende de fora de `design-system/`: `Button` importa `useHydrated` de `core/hydration` (`primitives/button.tsx:3,49`); `Metric` (`patterns/metric.tsx:1`), `ProcessTimeline` (`patterns/process-timeline.tsx:1`) e `ResultPanel` (`patterns/result-panel.tsx:2`) importam `core/contracts`. Isso é intencional no escopo atual, mas impede copiar o DS isoladamente para outro produto.

**F15 — médio.** Apresentação misturada com dados: `Metric` formata com `Intl` a partir de `EvaluationResult` (`patterns/metric.tsx:12-18`); `ProcessTimeline` traduz `ExecutionStatus` em rótulo/tone (`patterns/process-timeline.tsx:11-17,32`); `ResultPanel` chama `toUiState` e faz `switch` no status de domínio (`patterns/result-panel.tsx:43,48-83`). Um motor de temas que só troca CSS não consegue alterar essas regras sem tocar na lógica.

**F16 — médio.** Importações cruzadas que bloqueiam reuso parcial: `overlays → Button` (`components/overlays.tsx:6,57`), `toast → IconButton` (`components/toast.tsx:3,55`), `result-panel → EmptyState/ErrorState + FadeIn + Badge + typography` (`patterns/result-panel.tsx:3-6`), `processing-feedback → Progress + ProcessTimeline` (`motion/processing-feedback.tsx:4-5`), `animated-tabs-indicator → Tabs` (`motion/animated-tabs-indicator.tsx:2`), `Button → SpinnerMark` (`primitives/button.tsx:5`), `select`/`toggles → field` (`primitives/select.tsx:5`; `primitives/toggles.tsx:6`). Em particular, não há `ResultPanel` sem `motion` e não há `Tabs` animado independente de `Tabs`.

**F17 — alto.** Espaçamento interno fixo em cada componente, sem eixo de densidade: `p-4` em `Card` (`primitives/layout.tsx:39`), `p-4 sm:p-5` em `ResultPanel` (`patterns/result-panel.tsx:89`), `gap-4 p-5` em `Dialog` (`components/overlays.tsx:41`), `gap-4` em `Stack` (`primitives/layout.tsx:18`), `px-2 py-0.5` em `Badge` (`primitives/feedback.tsx:23`), `min-h-8 px-3` em `Tabs.Tab` (`components/tabs.tsx:36`). A densidade "compacta/científica" exigiria sobrescrever todas essas classes.

**F18 — médio.** Layouts fixam larguras internas: `max-w-(--content-max)` + `12rem` (`layouts/application-layout.tsx:22-23`), `md:w-40` e `md:w-48 lg:w-64` (`layouts/workspace-layout.tsx:22,37`), `max-w-xl` (`layouts/focused-layout.tsx:6`), `max-w-(--content-max)` com `px-5 sm:px-10 py-16 sm:py-24` (`layouts/presentation-layout.tsx:16`).

**F19 — médio.** Markup visual duplicado fora do DS: o card da vitrine de demos é artesanal (`routes/demos.index.tsx:46`: `rounded-lg border border-border bg-surface-raised p-5 sm:p-6`), o canvas do preview também (`studio/layout-preview.tsx:100`), e os cards de link do catálogo (`studio/catalog.tsx:535`). Um tema que mudar `Card` não alcança essas superfícies.

**F20 — médio.** Alternância de tema é efeito colateral direto no DOM: `document.documentElement.dataset.theme` lido/escrito em `studio/catalog.tsx:243,253-255`, sem contexto React, persistência ou escopo. Não há provedor de tema na API pública (`design-system/index.ts:1-29`).

---

## 5. Eixos de variante ausentes (propostas concretas)

**F21 — alto.** Inventário do que falta para um motor de temas (todos os arquivos citados são os que precisariam mudar):

- `Card` (`primitives/layout.tsx:34-43`): hoje só `className`. Propor `surface: border | elevation | tint` (token `--surface-style`), `elevation: 0|1|2|3` → `--shadow-*`, `radius` → `--radius-*`, `density: compact|default|comfortable` → `--space-*`.
- `Button`/`IconButton` (`primitives/button.tsx:7-29,65-97`): já tem `variant`+`size`, mas falta `shape` (raio/pílula vindo de tokens), `density`, `emphasis` (solid/outline/quiet) e um `iconOnly` tokenizado em vez de `px-0` + mapa `iconSizes`.
- `Field`/`Input`/`Textarea` (`primitives/field.tsx:13-14,36-123`) e `Select` (`primitives/select.tsx:28-48`): falta `size`/`density`, `shape` (outline/underline/filled) e `tone` explícito (hoje só `aria-invalid:border-danger` em `:14`).
- `Badge` (`primitives/feedback.tsx:6-29`): tem `tone`, falta `shape`, `size` e `emphasis` (sólido vs sutil).
- `Heading`/`Text` (`primitives/typography.tsx:4-58`): falta `scale`, `weight`, `tracking`, `family` (display/editorial/mono) e `balance`; `Text` só tem o booleano `muted`.
- `Tabs` (`components/tabs.tsx:11-53`): falta `appearance` (linha/pílula/segmented), `size` e `density`; a orientação vertical é só `data-[orientation=vertical]` (`:29`).
- `Dialog`/`Popover`/`Tooltip` (`components/overlays.tsx:20-138`): falta `surface`, `elevation`, `size` e `placement` tokenizado (os `sideOffset` são números, F04).
- `Toast` (`components/toast.tsx:20-62`): falta `tone` e `placement`; o viewport é `fixed` com classes literais (`:25`).
- `Progress`/`Spinner`/`Skeleton` (`primitives/feedback.tsx:31-109`): falta `shape`, `tone` e `size`; track é `h-2 rounded-full ring-1` fixo (`:99`).
- `Container`/`Grid`/`Stack` (`primitives/layout.tsx:4-32`): falta `width`, `columns`, `gap` e `direction` como eixos; `16rem` é fixo em `:27`.
- `ResultPanel` (`patterns/result-panel.tsx:85-103`): falta `surface`/`density`/`tone`; `BeforeAfter` (`patterns/before-after.tsx:44,55`) falta `aspect` e estilo do handle; `Metric` (`patterns/metric.tsx:20-43`) falta `size`/`emphasis`; `ProcessTimeline` (`patterns/process-timeline.tsx:27-43`) falta `orientation`/`compact`.
- Layouts (`layouts/*.tsx`): falta `density` e `surface` nos slots (F18).
- Motion: `FadeIn` tem `duration` (`motion/entrances.tsx:8`), mas `StaggerGroup` fixa a fórmula de atraso e o teto de 4 itens (`:39`), `Expandable` e `AnimatedTabsIndicator` não aceitam duração (`motion/expandable.tsx:6-31`; `motion/animated-tabs-indicator.tsx:6-19`), e não há eixo `profile/intensity/spring` (ADR 0006:22).

---

## 6. Inconsistências de espaçamento

**F22 — médio.** Convivem dois sistemas sem ponte: tokens CSS em `tokens/base.css:5-18` (`--content-max`, `--control-height`, `--focus-ring-*`, `--duration-*`) e a escala padrão do Tailwind usada em todo lugar (`gap-1/1.5/2/3/4/5/6/9`, `p-1/3/4/5`, `px-2/2.5/3/4/5/8/10`, `py-0.5/1/2/3/4/8/12/16/24`, `space-y-2/3`, `min-h-8/11/12/24`, `size-4/6/8/12`, `h-2/4/11`). `docs/design/DESIGN-SYSTEM.md:6` fala em "escala 4px como ponto inicial", mas não existe `--space-*`. Valores fora da grade: `gap-1.5` = 6 px (`primitives/field.tsx:58`), `px-2.5` = 10 px (`components/overlays.tsx:129`), `sideOffset` 8 e 6 (F04), `gap-9` = 36 px (`studio/catalog.tsx:71`).

O mesmo papel (superfície de conteúdo) usa paddings diferentes: `p-4` (`primitives/layout.tsx:39`), `p-4 sm:p-5` (`patterns/result-panel.tsx:89`), `p-5` (`components/overlays.tsx:41`), `p-5 sm:p-6` (`routes/demos.index.tsx:46`), `p-5 sm:p-8` (`studio/layout-preview.tsx:100`). O `Container` usa `px-4 sm:px-6 lg:px-8` (`primitives/layout.tsx:9`) enquanto os layouts usam `px-4`/`px-5`/`px-10` (`layouts/application-layout.tsx:16; layouts/presentation-layout.tsx:9,16`).

---

## 7. Acessibilidade

### Verificado por execução nesta auditoria (`bun run test`)

- 194 testes passaram, 1 skipped (`tests/unit/ai/real.opt-in.test.ts`, opt-in). `bun run check` = 0.
- Nomes, estados e teclado: Button `aria-busy`/disabled (`design-system.test.tsx:45-60`), disable SSR→hydrate (`:62-97`), `Field` com `aria-labelledby`/`aria-describedby`/`aria-invalid` (`:99-123,352-377`), `Select` por teclado (`:125-156`), `Checkbox`/`Switch` com Space (`:158-180`), `Dialog` nome + foco restaurado no Escape (`:232-253`), `Popover` por teclado (`:255-269`), `Tooltip` no foco (`:271-275`), `Tabs` por setas (`:277-296`), `Toast` com ação nomeada (`:307-318`), `Spinner role=status`/`Skeleton aria-hidden`/`Progress` determinado e indeterminado (`:207-230`).
- Motion e padrões: `AnimatedNumber` + stagger (`motion-patterns.test.tsx:20-40`), Tabs/Expandable (`:42-64`), `ProcessingFeedback` (`:66-82`), seis estados do `ResultPanel` + retry (`:84-143`), `BeforeAfter` com slider `role=slider` (`:145-163`), `EvidenceExcerpt` com `<mark>` e rótulo `sr-only` (`:165-184`), `Metric` (`:186-202`).
- Layouts: skip link aponta para o `<main>` com `tabIndex=-1`, landmarks `banner`/`contentinfo`/`navigation`/`complementary` (`layouts.test.tsx:12-32`).
- Contraste: 28 pares calculados nos dois temas com AA (`tests/unit/design-system/contrast.test.ts:95-187`); pares de foco só sobre `background`/`surface` (`:109-112`). `docs/STATUS.md:16` registra mínimo 4.92:1 (on-warning/warning claro).
- Tokens: nenhuma cor/fonte literal em `primitives/` e `components/` (`tests/unit/design-system/tokens.test.ts:67-115`) e paridade claro/escuro completa (`:42-65`).

### Definido em código / registrado pelo coordenador, mas **não executado por mim** (sem servidor)

- `tests/e2e/a11y.spec.ts:38-100`: axe `wcag2a/wcag2aa/wcag21aa/wcag22aa`, sem overflow e foco visível após 5 Tabs em 360/768/1440 × claro/escuro. `docs/STATUS.md:16` registra 0 violações.
- `tests/e2e/motion.spec.ts:23-33,35-59,61-90,92-133,135-178`: sem overflow nos 3 viewports, seis estados, slider operável por teclado, clique não bloqueado durante entrada, reduced motion sem animações em execução.

### Suspeitas por leitura de código (não verificadas por teste)

**F23 — médio.** `<html lang="en">` (`routes/__root.tsx:31`) enquanto a maioria do conteúdo visível é pt-BR (`routes/index.tsx:17`, `routes/demos.tsx:10`, `routes/demos.doc-evidence.tsx:104`) e parte do catálogo é em inglês (`studio/catalog.tsx:74-77`). Leitores de tela usarão a pronúncia errada por padrão; não há teste de `lang`.

**F24 — baixo.** O anel de foco existe **apenas** no CSS global `:focus-visible` (`styles/base.css:37-39`) com `--focus-ring-width/offset` (`:9-10`); nenhum componente define o próprio foco. Se um tema escopo novo não carregar `base.css` ou sobrescrever `--focus`, o foco desaparece. O contraste de `--focus` é testado só contra `background` e `surface` (`contrast.test.ts:109-112`).

**F25 — baixo.** `Progress` indeterminado expõe `role=progressbar` sem `aria-valuenow` (correto) mas sem `aria-valuetext` descritivo (`primitives/feedback.tsx:70-107`; o teste só verifica a ausência do atributo em `design-system.test.tsx:226-229`). `BeforeAfter` usa `aria-valuetext` em inglês (`patterns/before-after.tsx:72`). Alvos de toque: por leitura, `Checkbox` `size-6` = 24 px (`primitives/toggles.tsx:22`), `Switch` `h-6` = 24 px (`:49`), `IconButton` sm = 32 px (`primitives/button.tsx:66`) — atendem ao mínimo 24×24 da WCAG 2.2 AA; **nenhum teste automatizado mede isso**.

**Ponto forte verificado por leitura:** reduced motion é tratado em quatro camadas — tokens zerados (`tokens/base.css:33-40`), animações CSS dentro de `@media (prefers-reduced-motion: no-preference)` (`motion/motion.css:37-53`), `MotionConfig reducedMotion="user"` (`motion/motion-provider.tsx:5`) e `matchMedia` em `AnimatedNumber` (`motion/animated-number.tsx:6-16,33-37`).

---

## 8. Limitações estruturais para um motor de temas multi-mundo

**F26 — alto.** Hoje o tema é **global**: variáveis em `:root` / `[data-theme="light"]` (`themes/product.css:7-33`) e `[data-theme="dark"]` (`:35-56`), alternados por mutação de `document.documentElement.dataset.theme` (`studio/catalog.tsx:243,253-255`). Como as variáveis CSS cascateiam, dois temas lado a lado seriam possíveis apenas configurando `data-theme` manualmente em containers — **nenhuma API do design system expõe isso** (`design-system/index.ts:1-29`) e não há contexto/provedor de tema. A ADR 0006 propõe `data-world` por container e `data-theme` ortogonal (`docs/architecture/decisions/0006-design-engine.md:21`), mas nada disso está implementado.

**F27 — alto.** Não existe eixo de densidade: o único token relacionado é `--control-height: 2.5rem` (`tokens/base.css:8`), consumido em `Button` md (`primitives/button.tsx:23`), `IconButton` md (`:67`) e `controlStyles` (`primitives/field.tsx:14`). Todos os demais gaps/paddings são literais (F17/F22). Um mundo "dense/scientific" não pode ser expresso só com CSS.

**F28 — alto.** Fontes são trocáveis apenas como família (`--typeface-display/body/mono` em `themes/product.css:30-32`, mapeados em `styles/base.css:26-28`), sem `@font-face`, sem carregamento por rota e sem escala/rácio/weight/tracking por tema (`primitives/typography.tsx:5-10`). Um mundo "expressive/large-type" exige editar componentes, não apenas o tema.

**F29 — médio.** Motion é **parcialmente** configurável: durações e easings são CSS vars (`tokens/base.css:13-17,28-30`) e `readMotionTiming` lê computed style (`motion/presets.ts:17-38`), então um container pode alterar durações; porém `readMotionTiming` lê **somente** `--ease-standard` (`presets.ts:20`), `StaggerGroup` fixa delay e teto (F21), e `MotionProvider` é global (F21). Não há perfil/intensidade/spring por mundo.

**F30 — médio.** Os testes de token/contraste reconhecem apenas os selectores `:root` e `[data-theme="light"|"dark"]` (`tokens.test.ts:21-38`; `contrast.test.ts:40-57,118-121`); qualquer CSS gerado com escopo `[data-world="…"]` seria **silenciosamente ignorado** pelo parser. Também não há `design:check` nem contrato `DESIGN.md` no repositório — a ADR 0006 os propõe (`docs/architecture/decisions/0006-design-engine.md:18,24`), mas não estão presentes em `docs/design/` (que contém só `DESIGN-SYSTEM.md`, `MOTION.md` e `FIGMA-WORKFLOW.md`).

**Ponto forte parcial:** os raios `sm/md/lg` são variáveis CSS via `@theme` (`tokens/base.css:21-31`) e o mapeamento `@theme inline` (`styles/base.css:6-29`) referencia variáveis herdadas, então um escopo por container pode sobrescrever cores e esses raios sem recompilar. O que falta é densidade, geometria de `full`, tipografia e superfície como eixos (F21/F27/F28/F08).

---

## 9. Componentes/padrões de alto reuso — cobertura real

| Item | Estado | Evidência |
|---|---|---|
| Apresentação editorial | **parcial** | `Heading`/`Text`/`Code` (`primitives/typography.tsx:13-58`), `Container` (`:4-14`) e `PresentationLayout` (`layouts/presentation-layout.tsx:3`); falta lede, kicker, pull-quote, figure/caption e largura de medida editorial como token. |
| Before/after | **existe** | `patterns/before-after.tsx:29-85`; teste em `motion-patterns.test.tsx:145`; uso em `route-optimizer.tsx:152` e `studio/catalog.tsx:486`. Limitação: `aspect-video` fixo (F10). |
| Visualização de processamento | **parcial** | `ProcessingFeedback` (`motion/processing-feedback.tsx:7-22`) = `Progress` + `ProcessTimeline`; faltam sparkline/throughput/gráfico de etapas. |
| Resultados/evidências | **existe** | `ResultPanel` (`patterns/result-panel.tsx:38`), `EvidenceExcerpt` (`patterns/evidence-excerpt.tsx:1`), `Metric` (`patterns/metric.tsx:3`); vitrine em `studio/catalog.tsx:449-503`. |
| Visualização de dados (charts) | **falta** | API pública não tem nenhum export de chart (`design-system/index.ts:1-29`); os dois gráficos existentes são SVG artesanais em `route-optimizer.tsx:66-113` e `studio/catalog.tsx:423-441`. Nenhum eixo de grid/legenda/paleta categórica. **F32 — alto.** |
| Interfaces de IA (prompt, streaming, citações) | **falta / parcial** | Nada em `design-system/index.ts:1-29`; a dem usa `Textarea` + `EvidenceExcerpt` como "citação" (`routes/demos.doc-evidence.tsx:68,124`). O adaptador de IA é server-only e fora do DS. **F34 — médio.** |
| Workspace interativo | **parcial** | `WorkspaceLayout` só fornece slots `tools`/`inspector` (`layouts/workspace-layout.tsx:18-42`); sem canvas pan/zoom, painéis redimensionáveis ou command palette. |
| Upload/preview de arquivo | **falta** | Nenhum `type="file"` em `src/`; ausente da API (`index.ts:1-29`), embora `docs/design/DESIGN-SYSTEM.md:9` liste FileUpload como P0 "quando necessário". **F33 — médio.** |
| Navegação mobile-first | **parcial** | Breakpoints `md:` nos layouts, mas sem Navbar/Sidebar/Drawer/Breadcrumb exportados (`index.ts:1-29`; `docs/design/DESIGN-SYSTEM.md:9` os classifica como P1). Navegação artesanal em `routes/demos.tsx:9-26` e `routes/index.tsx:31-46`. **F36 — baixo.** |
| Estados erro/loading/empty | **existe** | `EmptyState`/`ErrorState` (`components/states.tsx:11,33`), `Spinner`/`Skeleton`/`Progress` (`primitives/feedback.tsx:40,57,70`) e os 6 estados do `ResultPanel` (`patterns/result-panel.tsx:29-36,48-83`). |

**F35 — baixo.** "Apresentação editorial" e "visualização de processamento" são as lacunas parciais mais prováveis de virarem trabalho duplicado (F19 mostra o padrão: markup artesanal em rotas).

---

## 10. Preservar — o que funciona e não deve ser quebrado

1. **Separação tokens neutros vs identidade** (`tokens/base.css:1-41` vs `themes/product.css:1-56`) com mapeamento único `@theme inline` (`styles/base.css:5-29`). É a base da ADR 0005 e do motor proposto.
2. **Proteção automatizada da fronteira**: nenhuma cor/fonte literal em `primitives/` e `components/` (`tests/unit/design-system/tokens.test.ts:67-115`) e paridade de tokens claro/escuro (`:42-65`).
3. **Contraste medido com lista fechada de pares** em ambos os temas (`contrast.test.ts:95-187`) — qualquer paleta nova deve passar pelo mesmo procedimento; o mínimo atual é 4.92:1 (`docs/STATUS.md:16`).
4. **Reduced motion em camadas** (`tokens/base.css:33-40`; `motion/motion.css:37-53`; `motion-provider.tsx:5`; `animated-number.tsx:6-16,33-37`), com E2E que exige zero animações em execução (`tests/e2e/motion.spec.ts:135-178`).
5. **Base UI sem estilo + CVA + `cn`/tailwind-merge** (`button.tsx:1,7-29`; `lib/cn.ts:1-6`) — evita segunda biblioteca UI e resolve conflito de classes.
6. **Acessibilidade embutida e testada**: nomes, `role`, `aria-*`, foco restaurado, markup SSR (`design-system.test.tsx:45-377`) e landmarks/skip link nos layouts (`layouts.test.tsx:12-32`).
7. **Disciplina anti-overflow**: `min-w-0` + `wrap-anywhere` disseminados e verificados em 360/768/1440 (`tests/e2e/a11y.spec.ts:64-72`; `tests/e2e/motion.spec.ts:14-33`).
8. **`ResultPanel` com união discriminada** (`patterns/result-panel.tsx:8-27`) e teste de tipos negativos (`result-panel.types.tsx:19-29`) — não perder a segurança ao adicionar eixos visuais.
9. **`EvidenceExcerpt` com validação UTF-16** (`evidence-excerpt.tsx:17-27`) e `<mark>` + `sr-only` (`:35-38`).
10. **`BeforeAfter` com slider acessível e `aria-valuetext`** (`before-after.tsx:64-74`) — manter ao trocar o `aspect-video`.
11. **Layouts independentes e opcionais** (`layouts/index.ts:1-4`) com slots opcionais e skip link (`layout-parts.tsx:13-21`) — não transformar em estrutura obrigatória.
12. **Gating fail-closed do Studio** (`routes/studio.tsx:5-7`, `studio.index.tsx:5-9`, `studio.catalog.tsx:10-14`, `studio.layouts.$name.tsx:4-25`) — preservar quando o tema real exigir ocultar a vitrine.

---

## Resumo para o coordenador

| Severidade | Quantidade | IDs |
|---|---|---|
| Alta | 8 | F08, F09, F17, F21, F26, F27, F28, F32 |
| Média | 19 | F01, F02, F03, F07, F10, F11, F12, F14, F15, F16, F18, F19, F20, F22, F23, F29, F30, F33, F34 |
| Baixa | 10 | F04, F05, F06, F13, F24, F25, F31, F35, F36, F37 |
| **Total** | **37** | — |

Os dez mais impactantes, em ordem: **F26** (tema só global), **F27** (sem densidade), **F32** (sem charts), **F21** (eixos de variante ausentes), **F08** (superfícies por borda), **F28** (tipografia não trocável por tema), **F17** (espaçamento interno fixo), **F09** (scrim `foreground/45` inverte no escuro), **F30** (testes ignoram `[data-world]`), **F22** (duas escalas de espaço).

Nota sobre F31 (baixa, listada na tabela mas sem seção própria): a ausência de `DESIGN.md`/`VISUAL-ENGINEERING.md` em `docs/design/` é registrada em F30; a ADR 0006 a propõe em `docs/architecture/decisions/0006-design-engine.md:18-19`. Não é um defeito de código, apenas a falta do contrato legível por agente que o P09 pede.

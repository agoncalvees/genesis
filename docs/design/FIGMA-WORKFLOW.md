# Creative Sprint e Figma → DESIGN.md

Créditos informados pelo responsável: aproximadamente 3.000; saldo e custo por operação não verificados. Não gastar créditos ou criar arquivos externamente sem autorização. Guardar a maior parte para o tema real.

## Creative Sprint (pré-tema — manter)

Meta 25 min, paralelo à engenharia:

1. Problema, público, contexto cultural, objetivo da interface e restrições.
2. Definir três atributos de marca e três antiatributos. Escolher associações de cores com base em semiótica, contexto e acessibilidade, não estereótipos universais.
3. Escolher fontes com suporte a português, licença e legibilidade; evitar Geist por padrão. Explorar Newsreader/Instrument Serif/Fraunces, Sora/Space Grotesk, IBM Plex, Figtree, Bricolage Grotesque conforme necessidade. Não baixar todas antecipadamente.
4. Wireframe de fluxo principal; explorar duas direções rápidas e escolher uma. Definir screen states e momento de demonstração. Usar Figma para wireframes, imagens, elementos vetoriais quando disponíveis; exportar SVG/PNG/WebP conforme finalidade.
5. Preencher BRAND-BRIEF e mapear tokens de `product.css`; handoff ao agente com frame URL/exports, estados, dimensões, comportamento e critérios.

### Assets (sprint criativo — manter)

Registrar origem, licença e eventuais limitações em inventário. Não copiar assets do Robin. SVG externo sanitizado; evitar scripts, referências externas e inline HTML inseguro. Imagens comprimidas e responsivas, alt text quando informativas. Diagramas baseados em dados reais. Não representar fixtures como evidência. Não compartilhar dados pessoais em prompts de geração.

---

## Da direção de arte aprovada ao DESIGN.md (P09)

Este fluxo converte uma direção de arte **já aprovada** no Figma nos contratos ativos do motor (`ADR 0006`, `DESIGN-ENGINE.md`, `VISUAL-ENGINEERING.md`). Vale para o produto (`design/DESIGN.md`) e para mundos (`design/worlds/<id>/DESIGN.md`). Nenhum passo autoriza gasto de crédito Figma sem autorização humana (§ Passo 8).

**Pré-requisitos (todos devem estar verdadeiros antes de começar):**

- [ ] Tema revelado e regras confirmadas; `CHALLENGE` e `PRODUCT-BRIEF` preenchidos.
- [ ] Direção de arte aprovada pelo responsável (frame URL/exports, estados e dimensões entregues no handoff).
- [ ] `BRAND-BRIEF.md` preenchido conforme o Passo 1.
- [ ] Contrato semântico e regras permanentes lidos: `DESIGN-ENGINE.md` e `VISUAL-ENGINEERING.md`.
- [ ] Inventário de componentes lido: `AUDIT-P09.md` §1.

**Regra de ouro:** quando o Figma não traz um valor exigido pelo contrato, **decide-se explicitamente e registra-se a decisão** — nunca se autogera um token.

---

### Passo 1 — Preencher `BRAND-BRIEF.md`

Cada campo tem uma origem. Não preencher "de cabeça" o que vem do problema, nem inventar o que deveria vir do Figma.

| Campo do BRAND-BRIEF | Origem | Como preencher |
|---|---|---|
| Público e contexto cultural | **Problema/audiência** (challenge + PRODUCT-BRIEF) | Quem usa, onde e com quais restrições; sem inventar domínio. |
| Personalidade (3 atributos/3 antiatributos) | Direção de arte aprovada + problema | Adjetivos observáveis na interface; o Figma só ilustra, não decide. |
| Associações de cor e justificativa | **Figma** (cores escolhidas) + semiótica/contexto | Justificar por contexto e acessibilidade, não por estereótipos universais. |
| Paleta semântica claro/escuro | **Figma variables** (nomes canônicos) + decisão explícita | Nomes ausentes no contrato = erro, não autogeração (Passo 2). |
| Fontes display/body/mono e licenças | **Figma text styles** + registro de fontes | Somente fontes presentes em `tools/design-engine/fonts.ts` (pacote + licença). |
| Referências e frames Figma | **Figma** | Registrar URL do frame/exports e a versão revisada. |
| Direção de imagens, SVG, iconografia e motion | Figma + direção aprovada | Origem/licença por asset; peso de ícone em `genesis.iconWeight`. |
| Fluxo principal e estados | Problema/audiência + **frames Figma** | Listar repouso/hover/active/disabled/foco/erro/vazio. |
| Inventário de assets e origem | Figma exports + fontes externas | Tabela completa no Passo 6. |
| Verificações de contraste e responsividade | **Medição**, não Figma | Registrar resultado real (Passo 7); nunca estimar. |

- [ ] Nenhum campo com valor inventado para preencher lacuna.
- [ ] Toda lacuna do Figma virou decisão explícita com justificativa curta.

---

### Passo 2 — Escrever `DESIGN.md` (formato Google + extensão `genesis:`)

**Estrutura:** front matter YAML + seções na ordem canônica da spec do Google + chave de extensão `genesis:`. A spec aceita chaves de extensão silenciosamente (`ADR 0006`); `version: alpha`, fixada em `@google/design.md@0.4.0`. **Conferir `docs/spec.md` do pacote para chaves e ordem exatas — não inventar chaves fora da spec + `genesis:`.**

Estrutura validada (P09): **todos os tokens ficam no front matter YAML**, inclusive a extensão `genesis:`; o corpo Markdown traz só o racional, em seções na ordem canônica da spec. **Partir de um exemplo real que passa no linter:** `design/worlds/precision/DESIGN.md` (ou outro mundo), nunca de um arquivo em branco.

```md
---
version: alpha
name: <identidade aprovada>
description: <intenção em 1–2 linhas, do BRAND-BRIEF>
colors:            # nomes canônicos do contrato (primary, on-primary, surface, ...)
  primary: "#..."
typography:        # display, headline, body, label, mono (+ section)
  display: { fontFamily: "<família registrada>", fontWeight: 600 }
rounded:           # sm, md, lg, control
  control: 8px
spacing:           # unit, control
  unit: 4px
motion:            # formato da spec: { duration, timingFunction, delay }
  normal: { duration: 250ms, timingFunction: cubic-bezier(0.2, 0, 0, 1) }
components:        # entradas por estado: button-primary, button-primary-hover, card, ...
  button-primary: { backgroundColor: "{colors.primary}", textColor: "{colors.on-primary}" }
genesis:           # extensão Genesis (ver DESIGN-ENGINE.md)
  density: 1
  surfaceStyle: border
  motionProfile: { name: crisp, intensity: 0.4 }
  data: ["#...", "#..."]
  composition: <preset>
  darkColors: { ... }
---

## Overview
## Colors
## Typography
## Layout
## Elevation & Depth
## Shapes
## Motion & Micro-interaction
## Voice & Content Strategy
## Components
## Do's and Don'ts
```

Seções podem ser omitidas, mas as presentes seguem essa ordem (spec 0.4.0). `rounded`/`spacing` são **chaves de token**, não seções; o racional delas vai em **Shapes** e **Layout**. Validar sempre com `bun run design:lint` e `bunx @google/design.md@0.4.0 lint <arquivo>` (avisos esperados e aceitos: chave `genesis` e `motion`, ver `REVIEW-P09.md`).

#### 2.1 Como ler o Figma e mapear para o contrato semântico

| Figma (variable / style) | DESIGN.md (spec Google / `genesis:`) | Contrato semântico (`DESIGN-ENGINE.md`) |
|---|---|---|
| Color style/variable `primary`, `on-primary` | `colors.primary`, `colors.on-primary` | `--primary`, `--on-primary` |
| `surface`, `surface-raised`, `background`, `border`, `foreground`, `muted` | `colors.*` (mesmo nome canônico) | `--surface`, `--surface-raised`, `--background`, `--border`, `--foreground`, `--muted` |
| `accent`/`on-accent`, `focus`, `success`/`on-success`, `warning`/`on-warning`, `danger`/`on-danger`, `info`/`on-info` | `colors.*` | variáveis de ação/estado correspondentes |
| Paleta categórica de dataviz (cores de série/grade/eixo) | `genesis.data` | `--data-1 … --data-6`, `--data-grid`, `--data-axis` |
| Variantes escuras (modo escuro do Figma) | `genesis.darkColors` | mesmas variáveis no escopo escuro |
| Text style `display` (família, peso, tamanho, tracking) | `typography.display` + `genesis.displayWeight`, `genesis.displayTracking`, `genesis.typeScale` | `--typeface-display`, `--display-weight`, `--display-tracking`, `--type-scale`, `--text-base` |
| Text styles `headline`/`body`/`label`/`mono` | `typography.headline|body|label|mono` | `--typeface-body`, `--typeface-mono`, `--heading-weight` |
| Corner radius (raios de cantos) | `rounded` | `--radius-sm`, `--radius-md`, `--radius-lg` |
| Forma de botão/input (pílula vs. canto) | entrada de componente em `rounded`/Components | `--radius-control` |
| Grid/escala de espaçamento | `spacing` | `--space-unit`, `--control-height` |
| Densidade (compacto/padrão/amplo) | `genesis.density` | `--density` (0.75 / 1 / 1.25) |
| Largura de borda de controle | `rounded`/componente | `--border-width` |
| Tratamento de superfície (borda/sombra/tint) | `genesis.surfaceStyle` | `--surface-style`, `--shadow-sm/md/lg`, `--border-width` |
| Effect styles de sombra/brilho | registrar a origem; mapear para `--shadow-*` | `--shadow-sm/md/lg` |
| Durações e easing de transição | `motion` | `--duration-*`, `--ease-standard/enter/exit` |
| Perfil de motion / intensidade / spring | `genesis.motionProfile` (+ spring) | `--motion-intensity`, `--spring-stiffness`, `--spring-damping` |
| Peso de ícone (Phosphor) | `genesis.iconWeight` | `--icon-weight` |
| Composição da tela/vitrine | `genesis.composition` | preset de layout do mundo |

- [ ] Todas as variáveis do contrato (`DESIGN-ENGINE.md` § Contrato semântico) estão presentes.
- [ ] Nenhum nome canônico ausente foi "chutado" pelo gerador.

#### 2.2 Quando o Figma não tem um token exigido

1. Listar o contrato semântico completo e comparar com as variables/styles exportadas.
2. Para **cada** variável faltante, escolher explicitamente uma saída:
   - **Reusar** um token semântico existente (ex.: `--muted` para texto secundário) — documentar o reuso;
   - **Derivar** com fórmula escrita (ex.: `on-primary` = branco ou preto conforme contraste) — documentar a fórmula;
   - **Adicionar** a variable no Figma e reexportar — registrar a pendência.
3. Escrever a decisão no `BRAND-BRIEF.md` e em comentário/`REFERENCES.md` do DESIGN.md.
4. Rodar a validação (contraste e paridade). Se a decisão falhar, ajustar a decisão — nunca deixar o gerador inventar.
5. Nomes ausentes no mapeamento canônico = **erro**, não autogeração (`DESIGN-ENGINE.md`).

#### 2.3 Variante escura (dark)

- [ ] Preferir `genesis.darkColors` vindo das variantes escuras do Figma (se existirem).
- [ ] Se o Figma não tiver escuro: **decidir explicitamente** as cores escuras (não inverter automaticamente); documentar a regra usada.
- [ ] Medir **todos** os pares de `VISUAL-ENGINEERING.md` § Contraste nos dois temas; informação nunca depende só de cor.
- [ ] `data-theme="dark"` continua ortogonal a `data-world` (`ADR 0006` §4) — escopo é o container, não global.

#### 2.4 Validação obrigatória antes de seguir (falha = não gera)

- [ ] Todos os pares de contraste de `VISUAL-ENGINEERING.md` no claro e no escuro.
- [ ] Paleta `data-*` com contraste ≥ 3:1 contra `--surface` e distinguidável (ΔE mínimo documentado).
- [ ] Fontes declaradas existem em `tools/design-engine/fonts.ts` (pacote + licença).
- [ ] Nenhum literal de cor/fonte/raio/sombra/duração em componentes.

---

### Passo 3 — Ativar os tokens (comandos)

**Todos os comandos abaixo ficam disponíveis após P09-CDX-01.** Registrá-los aqui como contrato planejado; **não executar nem afirmar que funcionam antes disso.**

| Comando | O que faz | Status |
|---|---|---|
| `bun run design:lint` | Valida sintaxe/estrutura do DESIGN.md contra a spec Google e as chaves `genesis:`; aponta seções ou chaves inválidas. | **disponível (P09-CDX-01)** |
| `bun run design:build` | Normaliza o DESIGN.md para o contrato semântico e escreve o CSS em `src/design-system/themes/generated/` (`product.css`, `worlds.css`). | **disponível (P09-CDX-01)** |
| `bun run design:check` | Regera em memória e falha se o CSS commitado divergir do DESIGN.md (drift); roda no CI. | **disponível (P09-CDX-01)** |
| `bun run design:diff old new` | Mostra as diferenças semânticas entre duas identidades (`old` vs `new`). | **disponível (P09-CDX-01)** |

- [ ] Antes de P09-CDX-01: conferir manualmente os `--*` calculados contra o `colors.*` do DESIGN.md e registrar que a automação ainda não existe.
- [ ] Depois de P09-CDX-01: `lint` → `build` → `check` (CI) em sequência; `diff` para revisar mudanças entre versões.

---

### Passo 4 — Componentes reutilizados (mapping Figma → Genesis)

Inventário real de `AUDIT-P09.md` §1 (API pública em `src/design-system/index.ts`; layouts em `src/layouts/index.ts`).

| Figma (componente/frame) | Genesis (export real) | Evidência |
|---|---|---|
| Button (primary/secondary/ghost/danger, sm/md/lg) | `Button` (`primitives/button.tsx:37`) | AUDIT §1 |
| Icon Button | `IconButton` (`primitives/button.tsx:71`) | AUDIT §1 |
| Field / label / help / error | `Field` (`primitives/field.tsx:36`) | AUDIT §1 |
| Text input | `Input` (`primitives/field.tsx:94`) | AUDIT §1 |
| Textarea | `Textarea` (`primitives/field.tsx:110`) | AUDIT §1 |
| Select / dropdown | `Select` (`primitives/select.tsx:9`) | AUDIT §1 |
| Checkbox | `Checkbox` (`primitives/toggles.tsx:8`) | AUDIT §1 |
| Switch / toggle | `Switch` (`primitives/toggles.tsx:37`) | AUDIT §1 |
| Card / surface | `Card` (`primitives/layout.tsx:34`) | AUDIT §1 |
| Badge / tag | `Badge` (`primitives/feedback.tsx:14`) | AUDIT §1 |
| Progress bar | `Progress` (`primitives/feedback.tsx:70`) | AUDIT §1 |
| Skeleton | `Skeleton` (`primitives/feedback.tsx:57`) | AUDIT §1 |
| Spinner / loader | `Spinner` (`primitives/feedback.tsx:40`) | AUDIT §1 |
| Tabs | `Tabs` (`components/tabs.tsx:11`) | AUDIT §1 |
| Modal / dialog | `Dialog` (`components/overlays.tsx:20`) | AUDIT §1 |
| Popover | `Popover` (`components/overlays.tsx:69`) | AUDIT §1 |
| Tooltip | `Tooltip` / `TooltipProvider` (`components/overlays.tsx:106`) | AUDIT §1 |
| Toast / snackbar | `Toast` / `ToastProvider` / `useToast` (`components/toast.tsx:34`) | AUDIT §1 |
| Empty state | `EmptyState` (`components/states.tsx:11`) | AUDIT §1 |
| Error state | `ErrorState` (`components/states.tsx:33`) | AUDIT §1 |
| Heading / text / code | `Heading` / `Text` / `Code` (`primitives/typography.tsx`) | AUDIT §1 |
| Container / grid / stack | `Container` / `Grid` / `Stack` (`primitives/layout.tsx`) | AUDIT §1 |
| Result panel | `ResultPanel` (`patterns/result-panel.tsx:38`) | AUDIT §1 |
| Metric | `Metric` (`patterns/metric.tsx:3`) | AUDIT §1 |
| Evidence excerpt / highlight | `EvidenceExcerpt` (`patterns/evidence-excerpt.tsx:1`) | AUDIT §1 |
| Before/after slider | `BeforeAfter` (`patterns/before-after.tsx:29`) | AUDIT §1 |
| Process timeline / step | `ProcessStep` / `ProcessTimeline` (`patterns/process-timeline.tsx`) | AUDIT §1 |
| Processing feedback | `ProcessingFeedback` (`motion/processing-feedback.tsx:7`) | AUDIT §1 |
| Fade in / stagger | `FadeIn` / `StaggerGroup` (`motion/entrances.tsx`) | AUDIT §1 |
| Animated number | `AnimatedNumber` (`motion/animated-number.tsx:18`) | AUDIT §1 |
| Animated tabs indicator | `AnimatedTabsIndicator` (`motion/animated-tabs-indicator.tsx:6`) | AUDIT §1 |
| Accordion / disclosure | `Expandable` (`motion/expandable.tsx:6`) | AUDIT §1 |
| App shell / focused / presentation / workspace | `ApplicationLayout` / `FocusedLayout` / `PresentationLayout` / `WorkspaceLayout` (`src/layouts/`) | AUDIT §1 |
| Skip link | `SkipLink` (`layouts/layout-parts.tsx:13`) | AUDIT §1 |

**Escada de decisão (nesta ordem):**

1. **Reutilizar primeiro** — se existe export com as props/variantes necessárias, usar e configurar por tokens/eixos. Não criar markup artesanal (risco F19).
2. **Nova variante segundo** — se o componente existe mas falta um eixo (ex.: `shape`, `density`, `tone`, `appearance`; ver AUDIT F21), **estender o componente** com o eixo e justificar no DESIGN.md/checkpoint.
3. **Novo componente por último** — só se nenhum export cobre a necessidade e ela for recorrente. Justificar: caso de uso, por que não foi extensão, custo de manutenção; registrar ADR/issue antes de implementar.

Sem equivalente hoje — candidatos a "novo componente por último", **com justificativa obrigatória**: charts/dataviz (F32), upload de arquivo (F33), Navbar/Sidebar/Drawer/Breadcrumb (F36), prompt/streaming/citações de IA (F34).

- [ ] Cada componente do Figma tem uma linha na tabela (reuso, extensão ou novo).
- [ ] Nenhum "novo componente" sem justificativa registrada.

---

### Passo 5 — Expressar as variantes necessárias

O formato Google usa **entradas nomeadas** para estados: `<componente>-<variante>-<estado>`. Exemplo exigido: `button-primary-hover`. Os estados são declarados explicitamente (não inferidos pelo gerador).

| Entrada (DESIGN.md / Components) | Estado | Tokens/eixos consumidos | Observação |
|---|---|---|---|
| `button-primary` | repouso | `--primary`, `--on-primary`, `--radius-control`, `--control-height` | base |
| `button-primary-hover` | hover | `--primary` (variação declarada) + `--on-primary` | declarar a cor de hover explicitamente; sem mudança de layout |
| `button-primary-active` | pressionado | `--primary` + `--on-primary`; intensidade via `--motion-intensity` | `active:scale` conforme o perfil de motion |
| `button-primary-disabled` | desabilitado | `--muted`/`--surface`, `--on-primary` com opacidade declarada | legível; nunca depender só de cor |
| `button-primary-focus` | foco visível | `--focus`, anel ≥ 2px, contraste ≥ 3:1 | `VISUAL-ENGINEERING.md` § Interação |

**Eixos que cobrem essas variantes:**

| Eixo | Cobre | Tokens |
|---|---|---|
| `density` | altura e espaçamento do alvo em todos os estados | `--density`, `--control-height`, `--space-unit` |
| `surface-style` | tratamento da superfície do botão/card nos estados | `--surface-style`, `--shadow-*`, `--border-width` |
| `radius-control` | forma (raio) de botão/input, estável entre estados | `--radius-control` |

- [ ] Estado nunca depende de animação; `prefers-reduced-motion: reduce` zera durações.
- [ ] Hover/active/disabled declarados por entrada nomeada, não por cor mágica no componente.

---

### Passo 6 — Assets licenciados

Template de inventário (uma linha por asset; manter em `BRAND-BRIEF.md` e/ou `design/worlds/<id>/REFERENCES.md`):

| Asset | Origem (URL/frame) | Licença | Autor | Uso (onde) | Alt text |
|---|---|---|---|---|---|
| `<arquivo>` | `<frame Figma ou URL>` | `<licença>` | `<autor>` | `<tela/componente>` | `<descrição informativa ou vazio se decorativo>` |

- [ ] SVG externo **sanitizado**: remover `<script>`, handlers `on*`, `foreignObject`, referências externas (`url(http…)`, `<image href>` externo) e inline HTML inseguro; manter só markup vetorial; SVG informativo com `title`/`desc`.
- [ ] Fontes **apenas** do registro `tools/design-engine/fonts.ts` (pacote + licença); self-hosted com fallback de sistema.
- [ ] Imagens comprimidas e responsivas, com dimensões e `alt` quando informativas.
- [ ] Nenhum asset copiado do Robin; sem dados pessoais em prompts de geração.
- [ ] Fixtures claramente rotuladas — nunca apresentadas como evidência real.

---

### Passo 7 — Critérios de fidelidade visual (mediáveis)

| Critério | Como medir | Limite / aprovação |
|---|---|---|
| Paridade de tokens | `bun run design:check` (após P09-CDX-01) — diff zero; antes disso, comparação manual dos `--*` com `colors.*` | 0 divergências |
| Contraste | Pares de `VISUAL-ENGINEERING.md` § Contraste medidos no claro e no escuro | ≥ 4:1 texto normal; ≥ 3:1 texto grande/não textual; nenhuma informação só por cor |
| Foco visível | `:focus-visible` em todo interativo, anel ≥ 2px e ≥ 3:1; ordem de foco = ordem visual | 100% dos interativos |
| Screenshots 360 / 768 / 1440 | Playwright contra frames Figma exportados (mesmo estado, fontes normalizadas) | **limiar proposto, a aprovar:** SSIM ≥ 0,98 ou ≤ 2% dos pixels com ΔE > 3; 0 overflow horizontal; ok em zoom 200% |
| Motion | Revisão de `prefers-reduced-motion: reduce` → 0 animações em execução; durações ≤ 400 ms (interação) e ≤ 600 ms (apresentação) | revisão humana + conferência do E2E quando disponível |
| Aprovação | Responsável de produto/design aceita o resultado; coordenador registra em `docs/STATUS.md` | aceite registrado; sem aceite, não é "aprovado" |

- [ ] Comparação usa frames exportados efetivamente aprovados, não estimativa.
- [ ] Tolerâncias propostas foram confirmadas pelo responsável antes de virarem gate.

---

### Passo 8 — Política de créditos Figma MCP

Créditos **só com autorização humana explícita e prévia**. O que cada operação pode fazer:

| Operação Figma MCP | Usa crédito? | Condição |
|---|---|---|
| Ler variáveis, estilos e frames de uma direção **já aprovada** | Sim | Somente após autorização do responsável |
| Exportar frames/SVG/PNG para comparação visual | Sim | Somente após autorização do responsável |
| Gerar novas variações / exploração automática | Não sem autorização | Pedir autorização antes |
| Criar arquivos externos, publicar ou conectar contas | Não | Proibido sem autorização do responsável |

**Como batchar (economia):**

- [ ] Agrupar, num único pedido, a leitura de variáveis + estilos + frames do **mesmo arquivo**.
- [ ] Uma chamada por frame/página relevante; evitar reler o que já foi exportado.
- [ ] Reutilizar exports locais salvos no handoff em vez de consultar o Figma de novo.
- [ ] Registrar o que foi lido (frame, versão) para não repetir trabalho.
- [ ] Guardar a maior parte dos créditos para o tema real; não gastar em exploração sem necessidade.

---

### Checklist final de handoff

- [ ] BRAND-BRIEF com origem declarada em cada campo e lacunas decididas.
- [ ] DESIGN.md no formato Google + `genesis:`, com todas as variáveis do contrato e variante escura.
- [ ] Validação de contraste/fonte/paleta `data-*` passou antes de gerar.
- [ ] Componentes mapeados pela escada reutilizar → variante → novo (com justificativa).
- [ ] Estados expressos como entradas nomeadas (`button-primary-hover`, …) e cobertos pelos eixos.
- [ ] Inventário de assets com licença e SVG sanitizado; fontes do registro.
- [ ] Critérios de fidelidade medidos e aceitos pelo responsável.
- [ ] Créditos Figma usados apenas com autorização e em lote.
- [ ] Comandos `design:*` marcados como disponíveis após P09-CDX-01 — nenhuma afirmação de funcionamento anterior.

# Status

- Fase atual: 07 validada pelo coordenador. Todas as fases 00–07 entregues; pendências externas abaixo. Fase 00 aprovada em 2026-11-24. Execução autônoma autorizada pelo responsável.
- Código de aplicação: scaffold TanStack Start, `src/core`, tokens neutros (branch `phase-01-scaffold`, sem push).
- Versões/lockfile: pins da ADR 0001 instalados; `bun.lock` versionado.
- Ambiente: instalação aprovada pelo responsável em 2026-11-24. `brew install node@24 oven-sh/bun/bun` + `brew link --force node@24` → node v24.22.3, npm 11.19.1, bun 1.4.5 em /opt/homebrew/bin.
- Deploy: **em produção** em https://genesis-alpha-two.vercel.app (deploy manual do responsável a partir de `main`, 2026-11-24). Verificado pelo coordenador: `/` e `/smoke` = 200, `/smoke` hidrata no Chromium sem erros de console; `/studio`, `/studio/catalog`, `/studio/layouts/workspace` = 404; assets JS públicos sem OPENROUTER/chave/token/código do Studio. Funções executam em `iad1` (edge `gru1`). Convex não configurado.
- Regulamento e código prévio: reutilização **permitida**, confirmada pelo responsável em 2026-11-24 (fonte: declaração do responsável; texto oficial não anexado).
- Revisão do frontend interno do Robin: não realizada (código não fornecido).

## Registro por fase
| Fase | Estado | Comandos e evidências | Bloqueios | Próximo passo |
|---|---|---|---|---|
| 00 | Validado (aprovação humana 2026-11-24) | Run Orca `run_738dcd161d50`: P00-CDX-01 (Codex), P00-OC-01 e P00-OC-02 (OpenCode hy4-flash-free) concluídos com `worker_done`. Probe `opencode run` em 10 modelos gratuitos. Versões-chave reverificadas via `curl registry.npmjs.org/<pkg>/latest`. Detalhes: `docs/engineering/phase-00/PLAN.md`. Experimento isolado P00-CDX-02 (Codex, `ctx_9427d9c2e014`) concluído: scaffold, install frozen, build, `tsc --noEmit` (TS 7.0.2), Biome, Vitest e Playwright passaram em /tmp; reverificado pelo coordenador (tsc=0, build=0) | Nitro pré-release (risco aceito) | Concluir P00-CDX-02 e iniciar fase 01 |
| 01 | Técnico validado; Convex **bloqueado / não validado** | Revisão independente P01-OC-02 (`docs/engineering/phase-01/review.md`) e reexecução do coordenador: `bun install --frozen-lockfile`=0, `bun run check`=0, `typecheck`=0 (TS 7.0.2), `test`=0 (51 testes: unit+component, inclui fronteiras ADR 0002), `build`=0 (`.vercel/output`, nodejs24.x), `test:e2e`=0 (2 testes, falha em `pageerror` e `console.error`), `grep -r "OPENROUTER\|CONVEX" .vercel/output/static`=1 (sem ocorrências). Avisos Rolldown (`debugName`, `"use client"` do router) aceitos como risco conhecido (F-06). | Sem credenciais Convex (G4); clone limpo em 2º ambiente não executado (E-1); deploy aguardando confirmação de conta | Fase 02 |
| 02 | Validado (coordenador) | Run `run_f81add3a5c0d`: P02-CDX-01 (Codex, 26 componentes Base UI + `/catalog`) e P02-OC-01 (OpenCode, testes do gate). Reexecução do coordenador: `check`=0, `typecheck`=0, `test`=0 (70 testes), `build`=0, `test:e2e`=0 (9 testes; axe wcag2a/aa/21aa/22aa sem violações em 360/768/1440 × claro/escuro; sem overflow; foco visível; reduced motion). Contraste: 28 pares AA, mínimo 4.92:1 (on-warning/warning claro). Varredura sem cores/fontes literais em componentes. Inspeção visual por screenshot (claro, escuro, 360 px). | Revisão humana visual pendente; barra indeterminada com artefato visual nas pontas (corrigir na fase 03) | Fases 03/04/05 |
| 03 | Validado (coordenador) | P03-CDX-01 (Codex, worktree `p03-motion`, commit 38d1847, merge no coordenador): MotionProvider, FadeIn, StaggerGroup, AnimatedNumber, AnimatedTabsIndicator, Expandable, ProcessingFeedback; ResultPanel (6 estados via `toUiState`), Metric, ProcessTimeline, BeforeAfter; 4 layouts independentes com preview em `/layouts/$name`; correção da barra indeterminada. Pós-merge: `check`/`typecheck`/`build`=0, `test`=0 (141 passed, 1 skipped), `test:e2e`=0 (16: reduced motion sem animações ativas, 6 estados, sem overflow 360/768/1440, clique durante transição, axe 2 temas). Inspeção visual por screenshot. | Verificação em dispositivo físico pendente (humano) | — |
| 04 | Validado com mocks **e com API real (tier gratuito)** | P04-CDX-02 (Codex, worktree `p04-ai`, commits 0dbd88d + a572834, merge no coordenador). Adaptador `src/ai` server-only: texto, stream, objeto validado (zod), tool call neutra; timeout 15 s, cancelamento, limite de entrada 4000 chars, 512 tokens, orçamento de passos, fallback só em erro retryable, erros sanitizados. Revisão do coordenador exigiu guarda de acesso: endpoints desligados por padrão (`AI_ENDPOINTS_ENABLED`), token em produção com comparação em tempo constante, rate limit 5/IP e 30 global por minuto por instância (best-effort em serverless). Pós-merge: `check`/`typecheck`/`build`=0, `test`=0 (131 passed, 1 skipped = teste real opt-in), varredura `.vercel/output/static` por OPENROUTER/openrouter.ai/AI_MODEL_ = sem ocorrências. Teste real 2026-11-24 (chave free tier, limite de crédito US$ 0, gasto confirmado US$ 0 via `/api/v1/key`): texto ✓, streaming ✓, tool call ✓ (=5), structured output ✓ em `nvidia/nemotron-3.5-super-vl:free` e `inclusionai/ling-3.2-flash:free`. Falhas observadas: timeout com 15 s (modelos gratuitos levam ~15–24 s → `AI_TIMEOUT_MS` configurável, teto 120 s); 429 upstream em `google/gemma-4-31b-it:free` e `ling-3.2-flash:free`. A suíte opt-in não passou inteira numa única execução por congestionamento dos provedores gratuitos. | Tier gratuito: 50 req/dia, 20/min, provedores congestionados — arriscado para demo com público | Decidir créditos antes do evento |
| 05 | Validado (coordenador) | P05-OC-01 (OpenCode hy4): runner com warm-up, brutos, erros e estatísticas derivadas; export JSON/CSV determinístico (22 campos); fixture sintética seed 20261124; benchmark builtin vs insertion sort, 15 repetições. Coordenador: `bun run bench`=0 (resultado medido, não fixado: builtin mediana ≈0.198 ms, insertion ≈0.235 ms, n=15, 0 erros, codeVersion 8e773e2); `check`/`typecheck`/`test`=0. Prova de isolamento: remover `recipes/csv-summary` + seu teste → `test`=0, `build`=0, `typecheck`=0. | Amostra pequena, máquina única (macOS arm64) — não extrapolar | Fase 06 |
| 06 | Validado (coordenador) | P06-CDX-01 (Codex): Studio dev-only em `/studio` integrando catálogo e prévias; `test:e2e:prod` (build node-server) prova HTTP 404 por URL direta em `/studio`, `/studio/catalog`, `/studio/layouts/workspace` e ausência de strings do catálogo/OPENROUTER no JS de produção; `.github/workflows/ci.yml` (contents: read, sem segredos, actions v7/setup-bun v2; YAML validado, **não executado no GitHub** — sem push). P06-OC-01: `docs/engineering/RUNBOOK.md`. P06-OC-02: revisão independente 03–05 (0 crítico, 2 altos, 3 médios, 2 baixos). Correções: P06-CDX-02 (guard fail-closed fora do dev server Vite, IP confiável `x-vercel-forwarded-for`, limite por token, `unavailable` não consome cota, sem retry após progresso) e P06-OC-03 (erros exportados sem mensagem bruta + redação, `codeDirty`). Reverificação do coordenador: `check`/`typecheck`/`build`/`bench`=0, `test`=0 (164 passed, 1 skipped), `test:e2e`=0 (17), `test:e2e:prod`=0 (6), varredura do bundle Vercel = sem ocorrências. Pendência OC-03-05-03 (contadores por instância, best-effort) aceita e documentada. | CI remoto não executado (sem push); rate limit não é global entre instâncias | Fase 07 |
| 07 | Validado (coordenador) | Run `run_f4595a91a927`. SIM-A (Codex, otimização de rota + visualização, worktree descartável `p07-sim-a`): 6,80 min (18:09:14Z→18:16:02Z), redução de distância 66,06% vs baseline na fixture sintética. SIM-B (OpenCode hy4, extração de prazos/obrigações com evidência, `p07-sim-b`): 10,55 min (18:09:25Z→18:19:58Z), P/R/F1 = 1,0 em fixture de 17 itens **escrita pelo mesmo agente** (não mede generalização). Ambas: check/typecheck/test/build/E2E = 0. Relatórios em `docs/engineering/phase-07/`; código das simulações não integrado. Melhorias derivadas dos atritos: P07-CDX-01 (PORT configurável, `useHydrated`, `ResultPanel` tipado, `BeforeAfter` com ReactNode, `EvidenceExcerpt`, Select estável 5×, preset Vercel só no build — aviso OIDC eliminado) e P07-OC-01 (métricas de qualidade por repetição, `scoreClassification`, JSON no formato Biome). Reverificação: `check`/`typecheck`/`build`/`bench`=0, `test`=0 (180 passed, 1 skipped), `test:e2e`=0 (17) também com `PORT=3100`, `test:e2e:prod`=0 (6). CI GitHub (1ª execução, commit 02e19a2): 16/17 E2E passaram; falha de hidratação lenta em runner frio → timeout de `expect` 15 s só em CI, sem retries. | Ensaio humano no dia; deploy Vercel; credenciais | — |
| 08 (vitrine) | Validado (coordenador) | Decisão humana 2026-11-24: tornar visível o produto. P08-CDX-01 (Codex): home como hub, `/demos` com os dois ensaios da fase 07 portados para `main` (`src/features/route-opt`, `src/features/doc-evidence`, adaptados a `EvidenceExcerpt`, `useHydrated`, `ResultPanel`), **Studio público por padrão** — reverte o critério do gate 06 por decisão do responsável; `VITE_STUDIO_DISABLED=1` no build restaura 404 em `/studio*`. Reverificação: `check`/`typecheck`/`build`=0, `test`=0 (194 passed, 1 skipped), `test:e2e`=0 (28), `test:e2e:prod`=0 (10), variante `VITE_STUDIO_DISABLED=1` = 0 (10); CI roda ambas. | Se o regulamento vetar material prévio visível, publicar com `VITE_STUDIO_DISABLED=1` e remover `/demos` | — |

P09-CDX-01 concluído na máquina local. `check`, `typecheck`, `test` (210 passaram, 1 opt-in ignorado), `build`, `test:e2e` (30), `test:e2e:prod` (10) e `design:check` retornaram 0. Revisão do coordenador pendente. [Checkpoint P09-CDX-01](engineering/phase-09/checkpoints/P09-CDX-01.md).

P09-CDX-02: `genesis:new` validado localmente antes da integração com o design engine. Instalação congelada, check, typecheck, test, build e E2E retornaram 0 no clone descartável. [Comandos, resultados e verificação pendente](engineering/phase-09/checkpoints/P09-CDX-02.md).

P09-CDX-03: quatro Genesis Worlds, gráficos SVG, perfis de movimento e fontes escopadas entregues localmente. Check, typecheck, build, testes (252 passaram, 1 opt-in ignorado), E2E (44), E2E de produção nas duas variantes (12 cada), design:check e os dois linters retornaram 0. O lint oficial encontrou zero tokens órfãos e registrou avisos sobre as duas extensões. A revisão independente está pendente. [Checkpoint e 12 capturas](engineering/phase-09/checkpoints/P09-CDX-03.md).

P09-CDX-04: padrões de experiência (editorial, IA apresentacional com mock rotulado, upload, processamento com tempos e sparkline, AppNav/BottomNav com Drawer, ResizablePanels) integrados ao catálogo e aos quatro mundos. Check, typecheck, test (269 passaram, 1 opt-in), build, E2E (57), E2E de produção nas duas variantes (12 cada) e design:check retornaram 0. Revisão independente pendente. [Checkpoint](engineering/phase-09/checkpoints/P09-CDX-04.md).

| P09 | Validado (coordenador) | Motor DESIGN.md (ADR 0006), 4 Genesis Worlds, dataviz, motion, padrões de experiência, fluxo Figma, portabilidade. Auditoria 37 achados (8 altos corrigidos), revisão independente 0 crítico/alto (médio OC03-01 corrigido). Coordenador: revisão visual por screenshot com 6 correções; portabilidade real `--world precision --e2e` = 0 após corrigir fontes do produto e specs dependentes do Studio. Fallback Codex→Claude registrado. Detalhes: `docs/DESIGN-READINESS.md`. | Revisão em dispositivo real; achados baixos OC03-02…07 | — |

Estados: pendente / em andamento / bloqueado / validado. Não marcar validado sem evidência.

| Experimento | Estado | Comandos e evidências | Bloqueios | Próximo passo |
|---|---|---|---|---|
| EXP ISOTERMA | Evidência automatizada concluída; **avaliação humana cega pendente** | Experimento controlado A (stack) × B (stack + DESIGN.md) × C (Genesis via `genesis:new`), Codex `gpt-6.2-sol` nas três, run `run_d7aa59e1e455`. Totais medidos: A 7 min 16 s, B 10 min 17 s, C 8 min 40 s; preparação 43–48 s nas três. Harness pré-registrado (SHA-256 `2896a991…`): 12/12 nas três (axe 0, overflow 0, teclado, estados, reduced motion, console 0). C reutilizou 3 peças de UI; B ≈ C visualmente. Auditoria OpenCode: 0 alto; médios B1, C1, C2, A1. Fundação **não alterada**. Detalhes: `docs/experiments/ISOTERMA-VALIDATION.md`. | n=1; mesmo modelo; tarefa usou <10 % do orçamento | Avaliação humana cega com `evaluation/blind/`; decidir recomendações §11 |

## Evolução após ISOTERMA · 24/11/2026

Escopo e responsabilidade do agente desta sessão: protocolo em AGENTS/CLAUDE e guias, títulos e rótulos no design system, execução local do build e simulação em repositório irmão. Aceite: tema aplicado no navegador, componentes preservando consumidores existentes e produto independente validado de ponta a ponta.

- ISOTERMA encontrou desvios em tamanho de títulos e numerais apesar dos tokens gerados, além de textos fixos e dificuldade de descobrir componentes. `Heading variant="section"` usa os tokens de seção; dataviz e etapas aceitam rótulos da aplicação. O índice de componentes acompanha o clone. Progresso e legendas preservam os valores padrão de consumidores existentes.
- `bun run check`, `typecheck`, `design:check` e `test` passaram na fundação (277 testes passaram, um opt-in de IA ignorado). Os testes novos de título e gráfico acusaram a ausência das respectivas capacidades antes das mudanças.
- `bun run build:local` produziu a saída Node do Nitro. Rolldown emitiu o aviso conhecido de diretiva de módulo do Router. Sem mudanças em dependências, tema neutro ou lockfile. A etapa inicial passou por autorrevisão.

O ensaio **Entrelaços** foi iniciado em repositório separado com `genesis:new`.
O motor de temas, o bootstrap, Button, Heading, BarChart e a guarda de hidratação
foram reutilizados. A detecção de padrões em frações, a composição e a escala
cromática ficaram no produto. Voltou à fundação apenas o teto de referência
`maxValue` do gráfico de barras. Ele permite comparar contagens e cenários
sem redimensionar o eixo quando os dados mudam.

Uma revisão independente identificou a formatação automática quando o locale
era omitido e o indicador de seleção invisível em cores forçadas. Ambos foram
corrigidos, com regressões automatizadas. O ensaio verificou tamanho, peso,
tracking, fontes carregadas e cor de ação no Chromium. O [índice de
componentes](design/COMPONENTS.md) e o [protocolo visual](design/VISUAL-ENGINEERING.md)
são os pontos de entrada para retomar em qualquer agente.

Limites: avaliação humana cega do ISOTERMA segue pendente. O ensaio não mede
ganho de tempo, eficácia pedagógica ou vantagem entre agentes. Não houve
sessão no Claude Code nesta rodada, teste em dispositivo físico ou uso da
integração remota de IA.

### Verificação final

- Genesis: `bun run check`, `typecheck`, `design:check`, `build` e
  `test` retornaram 0 (278 passaram, um opt-in de IA ignorado).
  `PORT=3184 bun run test:e2e:prod`: 12 passaram.
  `CI=true PORT=3188 bun run test:e2e --workers=3`, com saída isolada
  do Playwright: 57 passaram. A primeira execução concorrente teve
  45 aprovações e 12 falhas, incluindo timeouts de hidratação; a
  reexecução com os timeouts já configurados para CI passou integralmente.
- Entrelaços: commit local `5ed8346`; build, lint, typecheck e
  verificação de tema passaram. Vitest: 273 passaram, um opt-in ignorado.
  Playwright Chromium: 7 em dev e 14 na saída Node, com axe, teclado,
  cores forçadas, movimento reduzido e estilos computados a 360/768/1440 px.
- Avisos de build: diretivas de módulo de dependências e configuração
  de cor do console. Git preservado; nenhum push, merge remoto ou deploy.

## Seletor de projetos · 24/11/2026

Escopo desta sessão: página `/projetos`, link na home, inicializador local,
capturas de prévia e exclusão da vitrine no `genesis:new`. Direção visual:
uma tela de seleção de fases, em moldura escura, com arte das próprias
experiências e indicação textual da seleção. Referência: a tela inicial do
Entrelaços e o resultado cartográfico da versão C do ISOTERMA. Aceite:
prévia navegável por teclado, abertura das duas aplicações independentes,
vitrine disponível sem elas e validação de build e responsividade.

- `bun run dev:projects` aguardou os dois apps antes de anunciar a URL. No Chromium, a partir da vitrine, a versão C do ISOTERMA produziu um resultado de simulação e o Entrelaços apresentou uma atividade após analisar as respostas. Foram inspecionadas capturas desktop e mobile. Uma variável pública sintética do processo pai não chegou a nenhum dos três servidores. O encerramento por sinal liberou as três portas.
- Revisão independente levou à espera pela prontidão dos apps, ao isolamento do ambiente e ao idioma `pt-BR` do documento. A vitrine está nas prévias do build. A abertura das aplicações usa o inicializador local.
- `bun run check`, `typecheck`, `design:check`, `build` e Vitest passaram (279 passaram, um opt-in de IA ignorado). Playwright: 59 em desenvolvimento na reexecução isolada, 13 no build Node. A primeira execução de desenvolvimento teve duas falhas de carregamento de módulos ao iniciar Vite simultaneamente no mesmo checkout. A cobertura da vitrine inclui seleção por setas, troca de prévia, idioma, 360 px sem overflow e zero violações nas regras axe avaliadas.

## P10 · Creative engineering reset · 24/11/2026

Objetivo: elevar a qualidade da primeira entrega visual a partir de um tema desconhecido, sem aumentar a fundação. Branch local `p10-creative-reset`. Não avançar para a P11.

**Diagnóstico.** ISOTERMA mostrou que o DESIGN.md é a alavanca e que os componentes pouco aceleram (3 peças reutilizadas, bundle +73 KB gzip). O que induzia interfaces genéricas: começar por um "mundo" pré-definido; layouts e padrões com moldura de card, texto em inglês e formato fixo (`BeforeAfter`, `ResultPanel`); fade-in/stagger como motion padrão; nenhum passo de conceito visual antes do código; nenhuma verificação entre intenção e CSS renderizado.

**Decisões.**
- Protocolo obrigatório de 9 passos em `docs/design/CREATIVE-DIRECTION.md` (problema → mecanismo → 3 referências → direção → conceito visual → DESIGN.md + fidelity.json → implementação → `design:verify` + comparação → refinamento), com princípios aplicáveis, sinais de interface gerada por IA e ferramentas visuais por ambiente com custo verificado. `AGENTS.md` e `CLAUDE.md` reescritos em torno dele, com mapa "tarefa → documento" para não exigir leitura do repositório.
- `DESIGN-TEMPLATE.md`: seções de arte (composição, ritmo, escala, profundidade, densidade, narrativa, materiais, recursos gráficos, comportamento, motion).
- `EXPERIENCES.md` (Experience Registry) por mecanismo, com versões e licenças conferidas no npm/GitHub. React Bits e Animate UI são MIT + Commons Clause: uso no produto, nunca redistribuição na fundação.
- `MOTION.md` reescrito por intenção; fade/stagger deixam de ser padrão.
- Mundos e layouts passam a ser exemplos; `--world neutral` + DESIGN.md próprio é o caminho recomendado. Nada foi removido.
- Código novo na fundação: `design:verify` (`tools/design-engine/verify.ts`, `fidelity.ts`; estilos computados vs DESIGN.md e `{--var}` do produto, fontes carregadas, overflow, erros de página, capturas por viewport) e `CompareMask` (comparação headless sobre o mesmo quadro, arrasto direto e teclado, sem texto fixo).

**Ensaio.** Aceiro — ver `docs/experiments/ACEIRO-P10.md` (capturas, tempos, limitações). Primeira tela convincente em ~37 min do brief ao refinamento, sem intervenção humana e com uma rodada de direção.

**Ferramentas verificadas.** Codex `image_gen` disponível e usado (incluído no plano). Figma MCP conectado (conta estudante); `generate_image`/vetores consomem créditos de IA e não foram usados. OpenCode: `deepseek-v4.1-flash-free` esgotou a cota gratuita; troca para `hy4-flash-free`.

**Verificação (Genesis).** `bun run check`, `typecheck`, `design:check`, `test` (289 passaram, 1 opt-in ignorado) e `build` = 0. `design:verify` exercitado contra `/` do Genesis (detectou divergência proposital) e no Aceiro (145/145). E2E do Genesis não reexecutado nesta fase (nenhuma rota alterada).

**Limitações.** n = 1 e sem comparação cega; avaliação cega do ISOTERMA continua pendente; mobile só em emulação; `design:verify` não detecta qualidade da camada computacional (fogo em blocos passou) — por isso o passo 8 exige olhar capturas durante a interação. Revisão independente do código da fundação: autorrevisão.

**Retomada.** Revisar e, se aprovado, integrar `p10-creative-reset` em `main`. Para um tema novo: `AGENTS.md` → `CREATIVE-DIRECTION.md`.

## Base e Lab · 24/11/2026 (ADR 0007)

Aprovação do responsável: "pode criar um repo novo pra separar a base do lab". P10 integrada em `main` (merge local `027f88d`). Criada a **Genesis Base** em `/Users/arthurgoncalves/orca/projects/genesis-base` (histórico próprio, commit `6ed469a`, sem remoto): 146 arquivos versionados (Lab: 314). Este repositório passa a ser o Lab.

- Removido da Base: Studio, demos, seletor de projetos, mundos e suas 7 fontes, layouts, padrões editoriais/resultado/métrica/BeforeAfter/ProcessingFeedback, FadeIn/Stagger, navegação, EmptyState/ErrorState, evidence, receitas, benchmarks, Convex vazio, docs de fases e experimentos.
- Módulos opcionais: `ai` e `dataviz`, via `bun run new -- --with ai,dataviz`. O gerador copia arquivos versionados para um repositório novo, remove módulos não pedidos (arquivos, testes, dependências) e o próprio gerador, instala, valida e faz o commit inicial.
- Tailwind restrito a `src/` (`source("../")`): CSS base 56,7 KB (Aceiro) → 32–34 KB (7 KB gzip).
- `design:build`/`apply` falham com o comando `bun add` exato quando a fonte do DESIGN.md não está instalada. `design:apply example/aceiro` aplica o exemplo de referência.
- Teste de teclado do `Select` sincronizado com o foco (correção do Codex no Aceiro), aplicado também no Lab.

Verificação na Base: `check`, `typecheck`, `design:check`, `test` (178 passaram, 1 opt-in), `build` e `test:e2e` (2) = 0. Ensaio: `bun run new -- --name "Sonda" --slug sonda --with dataviz` em 7 s; produto com 129 arquivos, 122 testes = 0; `design:apply example/aceiro` pediu as três fontes; após `bun add`, `design:check`, `build` e `test:e2e` (2) = 0.

Pendências: publicar a Base num remoto (GitHub privado) exige autorização; produtos antigos não migram; avaliação cega do ISOTERMA pendente.

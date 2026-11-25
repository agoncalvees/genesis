# Runbook — dia do hackathon (Fase 06)

Guia prático e **verificado contra o código desta árvore**. Todo comando abaixo existe em `package.json`, em documento citado ou foi executado em fase anterior com evidência em `docs/STATUS.md`. Se algo mudar no dia, atualize este arquivo e o STATUS — não presuma.

**Regra de partida (AGENTS.md:6, ROADMAP.md:27):** o tema é desconhecido. Não implemente produto, domínio, usuário ou branding antes de preencher `docs/product/CHALLENGE.md` e `docs/product/PRODUCT-BRIEF.md` **e** confirmar o regulamento. Genesis é fundação, não solução inscrita.

---

## 1. T-0 — checklist de pré-evento

### Ferramentas e instalação

| Item | Comando / fonte | Estado esperado |
|---|---|---|
| Identidade Git (bloqueia deploy na Vercel se errada) | `git config user.email` | e-mail associado à conta GitHub (ex.: `<id>+<login>@users.noreply.github.com`); com e-mail `*.local` a Vercel bloqueia o deploy ("commit author email is not valid") |
| Bun 1.4.5 e Node 24 (`24.x` em `package.json`) | `bun --version`, `node --version` | Ambiente local: bun 1.4.5, node v24.22.3, npm 11.19.1 (`docs/STATUS.md:6`) |
| Instalação reproduzível | `bun install --frozen-lockfile` (`README.md:17`) | `bun.lock` versionado; não alterar lockfile sem ADR/coordenador |
| Qualidade | `bun run check` (Biome), `bun run typecheck` (TS 7 strict) | exit 0 (`docs/STATUS.md:16-19`) |
| Testes | `bun run test` (Vitest: `unit` + `component`), `bun run test:e2e` (Playwright/Chromium) | exit 0; `test:e2e` sobe `bun run dev` em `http://127.0.0.1:3000` (`playwright.config.ts:3-11`) |
| Build | `bun run build` | saída Vercel em `.vercel/output/` (nodejs24.x) |
| Browser do Playwright | `bun run playwright install chromium` (`docs/engineering/phase-00/compat-matrix.md:116,153`) | Chromium disponível; E2E falha sem ele |
| Orca rodando | `orca orchestration --help` (comandos confirmados em `ORCHESTRATION.md:7`; Orca 1.4.272) | um Run por fase via `orca orchestration run-create --environment local --objective "<fase>"` (`ORCHESTRATION.md:10`) |
| Probe de modelo | `opencode run --archived -m <id> "Reply with exactly: PONG"` (`MODEL-ROUTING.md:7`) | refazer no início da sessão; ordem: deepseek → mimo → hy4 → outro gratuito testado → auxiliares (`MODEL-ROUTING.md:31-34`). "OK" = respondeu prompt trivial, não prova qualidade |
| Benchmark (ápice do runner) | `bun run bench` (`package.json:15`) | opcional no T-0; detalhes na §4 |

### Credenciais — status e destino (nunca no chat)

| Variável / serviço | Onde vai | Status em `docs/STATUS.md` |
|---|---|---|
| `VITE_CONVEX_URL` | `.env` local (prefixo `VITE_*` é **visível no navegador**) | não configurada; Convex bloqueado/não validado (`:7`, linha 15) |
| `OPENROUTER_API_KEY`, `AI_MODEL_PRIMARY`, `AI_MODEL_FALLBACK` | `.env` local, **server-only**; nunca prefixar com `VITE_` | não configuradas; sem autorização de gasto (`:7`, linha 18) |
| `AI_ENDPOINTS_ENABLED=1` | `.env` local | endpoints desligados por padrão (`src/ai/access.ts:28`) |
| `AI_ACCESS_TOKEN` | `.env` local; em produção exige header `x-genesis-ai-token` (`.env.example:9`, `src/ai/access.ts:29-33`) | não configurado |
| `GENESIS_REAL_AI=1` | prefixo do comando de teste real (`.env.example:12`) | teste real opt-in **não executado** |
| Vercel | ambiente/CI local; conta conectada é `stemidcomercial-9127's projects` | responsável deve confirmar a conta; deploy real pendente (`:7`) |

Nomes em `.env.example` (sem valores). Chaves ficam no ambiente local do responsável: **nunca** em prompt, Orca, chat, logs, Git ou bundle. Rotacionar se expostas (`OPERATIONS.md:4`, `AGENTS.md:10`). Ações pagas, deploy e publicação só com autorização.

---

## 2. Primeiros 45 minutos

Fonte: `docs/strategy/PLAYBOOK.md:3-10`, `docs/strategy/COMPETITION.md:5-6,16` e `docs/design/FIGMA-WORKFLOW.md:5-10`.

| Janela | Ação | Onde registrar |
|---|---|---|
| 0–5 min | **Gate de conformidade:** perguntar à organização (boilerplate, código prévio, docs/prompts, assets/Figma, IA/modelos, dados, repo/data, entrega, pitch, critérios). Registrar fonte, data e resposta; se incerto, **não reutilizar** | `docs/product/CHALLENGE.md:2-8` (texto literal, fonte, requisitos, pesos, restrições, formato/pitch) |
| 5–15 min | Pesquisar problema/dados; propor 3 ideias; pontuar e criticar por valor, evidência, viabilidade e mecanismo | `docs/product/PRODUCT-BRIEF.md:2-11` (problema, público, 3 alternativas, escolha, valor, mecanismo, por que não alternativa simples, entrada→transformação→saída, métrica/baseline, riscos) |
| 15–30 min | Definir **antes do código**: funcionalidade central, must/should/won't, owners/contratos, dados/falhas, testes/benchmarks e **horário absoluto de feature freeze** | `docs/product/MVP-SCOPE.md:2-8` |
| 30–45 min | Escrever demo, baseline e critério de sucesso; travar momento de destaque e Plano B. Protocolo de direção artística em paralelo (passos 1–6 de `docs/design/CREATIVE-DIRECTION.md`: referências, conceito visual, DESIGN.md e fidelity.json) | `docs/product/DEMO-SCRIPT.md:2-9`; `docs/product/BRAND-BRIEF.md` + `src/design-system/themes/product.css` |

Papéis: coordenador (arquitetura/integração), mecanismo central, experiência visual, testes/evidências; papéis podem ser acumulados. Tarefas com arquivos permitidos, contratos, aceite e saída esperada (`PLAYBOOK.md:7`).

---

## 3. Como fazer (verificado na árvore)

### 3.1 Mudar a marca

- **Um único arquivo:** `src/design-system/themes/product.css` — tokens claros/escuros e `--typeface-display/body/mono` (`:7-56`). É o "THE single file to change for brand" (ADR 0005, `FIGMA-WORKFLOW.md:10`).
- Fontes: escolher com suporte a português, licença e legibilidade; **evitar Geist por padrão**; não baixar todas antecipadamente (`FIGMA-WORKFLOW.md:8`).
- Pares `on-*` devem manter WCAG 2.2 AA (`tests/unit/design-system/contrast.test.ts`, citado em `product.css:4-5`). Rode `bun run test` e `bun run test:e2e` (axe em 360/768/1440 × claro/escuro — `docs/STATUS.md:16`).
- Componentes consomem tokens semânticos; **não** fixar paleta/tipografia em componentes (`AGENTS.md:13`). Preencher `docs/product/BRAND-BRIEF.md` antes do handoff. Tokens são arquivo coordenado (`ORCHESTRATION.md:30`).

### 3.2 Adicionar uma rota

- Criar arquivo em `src/routes/` com `createFileRoute("/caminho")({ component: ... })` — modelo real: `src/routes/smoke.tsx:1-22` (`/smoke`), `src/routes/index.tsx` (`/`).
- `src/routeTree.gen.ts` é gerado pelo plugin `tanstackStart()` em `vite.config.ts:11`; **não** editar na mão.
- `src/routes/__root.tsx` controla `<head>`/`<html lang>`; ajustar título/meta ali se necessário.
- Coordene alterações de rotas conforme `ORCHESTRATION.md:30`. Valide com `bun run dev` (`/smoke`) e `bun run test:e2e`. Para rodar em worktrees simultâneas, atribua uma porta por processo, por exemplo `PORT=3100 bun run test:e2e`. `dev` e `test:e2e:prod` também aceitam `PORT`, com padrão 3000.
- Em formulários renderizados no servidor, use `<Button type="submit" requireHydration>` quando o envio deve aguardar o cliente. Use `useHydrated()` de `src/core/hydration.ts` para outros controles que dependem da hidratação, como em `/smoke`.

### 3.3 Adicionar feature sem tocar no core

- Destino planejado: `src/features/<nome>/` (`docs/BLUEPRINT.md:18`; hoje vazio). Criar somente com uso real.
- `src/core/env.ts:3-8` e `src/core/contracts.ts:3-6` **nunca importam** `features/`, `ai/`, `integrations/` ou `studio/`. Sentido permitido: feature → core/design-system/layouts; nunca o inverso.
- Reusar contratos existentes em `src/core/contracts.ts` (`ExecutionStatus`, `ExecutionResult<T>`, `AppError`, `EvaluationResult`, `toUiState`). Contrato público novo = arquivo coordenado; pedir ao coordenador, não editar `core/`.
- OBRIGATÓRIO: `bun run check`, `bun run typecheck`, `bun run test`, `bun run build`.

### 3.4 Habilitar IA

| Passo | Comando / arquivo | Detalhe |
|---|---|---|
| Configurar env | `.env.example:3-12` | `OPENROUTER_API_KEY` + `AI_MODEL_PRIMARY` são suficientes para `getCapabilities` (`src/core/env.ts:21-22,50`) e `getAiConfig` (`src/ai/config.ts:11-22`) |
| Abrir endpoints | `AI_ENDPOINTS_ENABLED=1` | padrão é **desligado**; `src/ai/access.ts:26-44` |
| Proteger produção | `AI_ACCESS_TOKEN` + header `x-genesis-ai-token` | comparação em tempo constante via SHA-256 + `timingSafeEqual` (`src/ai/access.ts:17-24,29-33`); rate limit best-effort 5/IP e 30 global/min por instância (`:7-15,46-69`) |
| Chamar | `src/ai/server.ts` | `generateAiText`, `generateAiObject`, `callAiTool`, `streamAiText` (NDJSON); validação Zod estrita, prompt 1..`AI_LIMITS.inputCharacters`, sinal de aborto (`:16-87`). Timeout 15 s, cancelamento, 4000 chars, 512 tokens, fallback só em erro retryable (`docs/STATUS.md:18`) |
| Teste real (opt-in, gasta créditos) | `GENESIS_REAL_AI=1 bun run test` | somente com credencial local e autorização do responsável; padrão = mock **rotulado** (`test-strategy.md:81-99`, `.env.example:12`) |
| Provar que não vazou | após `bun run build`, varrer `.vercel/output/static` por `OPENROUTER`/`openrouter.ai`/`AI_MODEL_` | zero ocorrências (`docs/STATUS.md:18`); `src/ai/*` começa com `import "@tanstack/react-start/server-only"` |

Sem chave, a aplicação inicia e reporta indisponibilidade; não prometer IA offline (`OPERATIONS.md:5`).

### 3.5 UI de evidência

Importar do barrel `src/design-system/index.ts:15-21` (`MotionProvider`, `ProcessingFeedback`, `Metric`, `ResultPanel`, `ProcessTimeline`); envolver em `MotionProvider` quando houver motion.

| Componente | Props reais (arquivo) | Uso |
|---|---|---|
| `ResultPanel<T>` | `title`, `status` e `headingLevel?`. O estado `completed` exige `data` e exige `renderResult(data)` se houver dados. Use `isEmpty?` para identificar dados vazios. `failed` exige `error: AppError` e aceita `onRetry?`. `running` aceita `feedback?`. Para passar uma variável `status`, forneça os campos exigidos pelos estados que ela puder assumir. | Expõe seis estados de interface via `toUiState(status, hasData)`, `data-state` e `role="status"`. |
| `BeforeAfter` | `before` e `after` aceitam descritores `{ src, alt }` ou conteúdo React. Inclua nomes acessíveis nas ilustrações. | Controle de comparação ajustável por teclado. O catálogo mostra dois SVGs. |
| `EvidenceExcerpt` | `text`, `start` inclusivo, `end` exclusivo e `context?` por lado, em unidades UTF-16. `label?` descreve o destaque. | Marca o trecho e indica cortes no contexto com reticências. Um intervalo inválido exibe o texto integral. |
| `ProcessingFeedback` | `steps: readonly ProcessStep[]`, `label?`, `progress?: number \| null` (`src/design-system/motion/processing-feedback.tsx:7-15`) | `Progress` + `ProcessTimeline` durante execução; passar como `feedback` do `ResultPanel` |
| `Metric` | `result: EvaluationResult`, `locale?`, `format?: Intl.NumberFormatOptions` (`src/design-system/patterns/metric.tsx:3-11`) | mostra `metric`, `value`+`unit`, delta vs `baseline` e `sampleSize` (`:12-43`) |

Dados vêm do runner (`src/evidence/runner.ts`, `src/evidence/export.ts`): registros compatíveis com `EvaluationResult` (22 campos). Fixture **sintética rotulada**, nunca apresentada como resultado real (`benchmarks/README.md:20-26`).

### 3.6 Rodar benchmark e adicionar receita

- `bun run bench` (`package.json:15`) executa `benchmarks/run.ts`: 3 warm-ups não registrados, 15 repetições, `builtin-sort` vs `insertion-sort` sobre fixture mulberry32 seed `20261124`, verificação de saída igual antes de medir. Escreve `benchmarks/results/<timestamp>.json` e `.csv` (gitignored), mesmos 22 campos (`benchmarks/README.md:8-47`). Amostra pequena, uma máquina — não extrapolar (`:58-64`).
- Receita: criar diretório em `recipes/<nome>/` com problema genérico, fonte oficial, versões, pré-requisitos, custo/quota, comandos, exemplo executável, teste, falhas e remoção (`recipes/README.md:3-6`). Modelo implementado: `recipes/csv-summary/` — sem dependências, sem custo, execução local com `bun recipes/csv-summary/summarize.ts recipes/csv-summary/fixture.csv` (`P05-OC-01.md:84`).
- Toda receita precisa de teste de isolamento que varre `src/` em busca de imports/menções (`P05-OC-01.md:66-68`). **Nenhuma** receita é importada por `src/`; a app inicia sem ela. Não instalar dependências opcionais em massa: verificar docs oficiais, peers, runtime e compatibilidade antes; preservar lockfile (`AGENTS.md:12`).

---

## 4. Orquestração no evento (cheat-sheet)

Fonte: `docs/engineering/ORCHESTRATION.md`, `docs/engineering/MODEL-ROUTING.md`.

| Comando | Quando | Atenção |
|---|---|---|
| `orca orchestration run-create --environment local --objective "<fase>"` | início de cada fase | um Run por fase (`:10`) |
| `orca orchestration worker-start --environment local --run <run> --spec-file <f> --task-title "<ID título>" --worktree <current\|new-child> --agent <claude\|codex\|opencode> [--model <id>] --base-branch <branch-da-fase>` | distribuir tarefa | **`--worktree new-child` parte do branch default (`main`), NÃO do HEAD do coordenador** (observado em 1.4.272, fases 03/04): sempre passar `--base-branch` e conferir com `git worktree list` logo após (`:34`). `--effort` só com `--model`; OpenCode não aceita `--effort` (`:16`) |
| `orca orchestration send --to dispatch:<id> --subject ... --body ...` | steering do dispatch vigente | conferir Dispatch ID antes (`:14,33`) |
| `orca orchestration worker-read --dispatch <id>` | ler resultado | aceitar `worker_done` só do dispatch vigente (`:13,33`) |
| `orca orchestration check` / `inbox` | consultar mail | **não fazer polling**: encerrar o turno; o Orca acorda com `worker_done`/`question`/`escalation` (`:7,12`) |

**Fallback de modelo:** cota esgotada (`FreeUsageLimit`) → Nível 1 imediato com `worker-stop` + `worker-start --task <mesmo id> --retry-of <dispatch antigo> --model <próximo>` retomando da "próxima ação" do checkpoint; cooldown 6 h; nunca substituir por modelo pago sem autorização (`MODEL-ROUTING.md:47-68`).

### Propriedade de arquivos e worktrees

- Coordenador é o único que altera/autoriza: `package.json`, `bun.lock`, config global (tsconfig, biome, vite, tailwind), contratos públicos, design tokens, rotas compartilhadas, `.env.example`, ADRs e merges (`ORCHESTRATION.md:30`).
- **Um responsável por arquivo/contrato**; paralelismo só com conjuntos de arquivos disjuntos (`:31`, `AGENTS.md:18`).
- `--worktree current` se arquivos disjuntos e sem build concorrente; `--worktree new-child --name <task-id>` para implementações paralelas que rodam install/build (`:32`). Até ~4 workers simultâneos (`:16`).
- Todo checkpoint fica em `docs/engineering/<fase>/checkpoints/<TASK-ID>.md` e deve permitir retomada sem a conversa, sem segredos (`:39`).

**Checklist de merge:** (1) ler resultado com `worker-read` e comparar Dispatch ID; (2) revisar diff; (3) rodar `bun run check`, `typecheck`, `test`, `build`, `test:e2e`; (4) registrar comandos/saídas reais em `docs/STATUS.md`; (5) commits pequenos sem credenciais; (6) **nenhum** push, merge remoto ou deploy sem autorização; não reescrever histórico (`AGENTS.md:18,21`).

---

## 5. Contingência e corte

Matriz completa: `docs/engineering/phase-00/test-strategy.md:147-161` (§5). Resumo:

| Falha | Fallback imediato |
|---|---|
| Deploy/produção falha | manter demo local; reportar bloqueio; sem push/deploy sem autorização |
| Provedor de IA 5xx/indisponível | fallback **testado**; senão modo "IA indisponível" com mensagem clara; UI segue sem chave |
| Quota/orçamento | reduzir concorrência, backoff limitado, desativar capacidade, fixtures rotuladas |
| Internet ausente | UI/fixtures **rotuladas** ou demo gravada autorizada; não prometer IA/persistência offline |
| Convex/credenciais ausentes | modo local só se implementado; senão bloqueio + passo manual |
| Agente/modelo fora do ar | redistribuir por capacidade; reduzir escopo secundário; não obrigar todos os modelos |
| Conflito de merge | worktrees descartáveis; um owner por arquivo; coordenador integra; nunca reescrever histórico |
| Falta de tempo | cortar e **congelar features** antes da última janela |
| Studio/vazamento de env em produção | desativar rota/flag; rever build; nenhum painel com env/config |

**Ordem de corte** (`ROADMAP.md:19-20`): primeiro 3D, voz, auth, mapas, agentes complexos, Storybook, telas adicionais e receitas de baixa prioridade. **Não cortar** segurança, core funcional, testes mínimos nem plano de contingência. Studio é galeria de dev, não produto. Gates: build/typecheck/lint/unit/E2E passam; integração real distinguida de mock (`ROADMAP.md:22-27`).

---

## 6. Checklist final de submissão

- [ ] **Regulamento:** reutilização permitida foi confirmada pelo responsável em 2026-11-24, mas o texto oficial não está anexado (`docs/STATUS.md:8`, `COMPETITION.md:6`) — confirmar fonte/anexo antes de entregar; se vedado, usar repositório limpo, sem copiar materiais.
- [ ] `docs/product/CHALLENGE.md`, `PRODUCT-BRIEF.md`, `MVP-SCOPE.md` e `DEMO-SCRIPT.md` preenchidos; horário de freeze em `MVP-SCOPE.md:8`; Plano B em `DEMO-SCRIPT.md:8`.
- [ ] `docs/STATUS.md` com comandos e saídas **reais** de todas as fases; nenhum teste não rodado marcado como sucesso; revisão registrada (ou autorrevisão declarada).
- [ ] **Sem segredos:** `.env.example` sem valores; nenhuma chave em Git, logs, chat, prompts, bundle ou JSON/CSV; varredura de `.vercel/output/static` sem ocorrência; origem/licença de assets e bibliotecas inventariadas (`FIGMA-WORKFLOW.md:13`, `AGENTS.md:11`).
- [ ] **Demo local como fallback:** `bun run dev` em `http://127.0.0.1:3000` com `/smoke` respondendo; `bun run build` gera `.vercel/output`; Studio indisponível em produção inclusive por URL direta (gate 06, `test-strategy.md:39,161`).
- [ ] **Replay gravado e rotulado** como gravação, nunca apresentado como execução ao vivo (`test-strategy.md:139,179`; `OPERATIONS.md:5`); fixtures sintéticas também rotuladas.
- [ ] Acessibilidade mínima: foco visível, teclado, estados de erro textuais, reduced motion, 360/768/1440 sem overflow (`AGENTS.md:14`, `STATUS.md:16`).
- [ ] Nenhum push remoto, merge ou deploy feito sem autorização; histórico intacto.

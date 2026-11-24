# Phase 00 — Relatório consolidado e plano de implementação

Coordenador: Claude (P00-CLA-01). Data: 2026-11-24. Run Orca `run_738dcd161d50`. **Aprovado pelo responsável em 2026-11-24.** Reutilização permitida pelo evento; deploy na Vercel aprovado.

## Entregáveis

| Entregável | Arquivo | Autor / revisão |
|---|---|---|
| Matriz de compatibilidade e versões candidatas | `docs/engineering/phase-00/compat-matrix.md` | Codex; versões-chave reverificadas pelo coordenador no registro npm |
| Auditoria documental e reescrita de gates | `docs/engineering/phase-00/doc-audit.md` | OpenCode (hy4-flash-free); revisada pelo coordenador |
| Estratégia de testes, benchmarks, contingência | `docs/engineering/phase-00/test-strategy.md` | OpenCode (hy4-flash-free); revisada pelo coordenador |
| Inventário de agentes/modelos, roteamento, fallback | `docs/engineering/MODEL-ROUTING.md` | Claude, com probe real |
| Política de orquestração | `docs/engineering/ORCHESTRATION.md` | Claude |
| ADRs propostos | `docs/architecture/decisions/0001`–`0005` | Claude |
| Checkpoints | `docs/engineering/phase-00/checkpoints/` | cada worker |

## Classificação do conhecimento

**Fatos confirmados (executados nesta sessão):** Orca 1.4.272 com `orca orchestration` funcional (3 workers reais concluídos); agentes `claude`, `codex`, `opencode`, `opencode2` instalados segundo Orca; OpenCode v2.4.1; 10 modelos gratuitos no catálogo; DeepSeek V4.1 Flash, MiMo V2.6 Flash e Nemotron Super VL com "Free usage limit reached"; Bun, Node e npm **ausentes** no PATH; git 2.50.1; gh 2.105.0; macOS 26.6 arm64.

**Confirmado por documentação/registro (não testado):** todas as versões da ADR 0001; `@base-ui/react` é o nome atual; `VITE_CONVEX_URL` é a convenção do quickstart Convex; Vercel suporta Node 24 em Functions; preset Vercel do TanStack depende de Nitro pré-release.

**Compatibilidade efetivamente testada:** nenhuma (sem runtime JS na máquina).

**Hipóteses:** cota compartilhada entre modelos gratuitos do OpenCode; TS 7 compatível com tipos gerados do Router/Convex; scaffold `--blank` migra sem conflito.

## Decisões propostas sobre a auditoria

| Item | Proposta |
|---|---|
| I-01 tema claro/escuro vs gate 02 | Gate 02 exige troca **centralizada** de tokens (um arquivo); dark mode não é P0. Ajustar texto do gate. |
| I-02 ADR aceita inexistente | ADRs 0001–0005 propostos; aceitação = aprovação humana deste plano. |
| I-03 padrões de resultado no gate 03 | Gate 03 cobre **estados** (mapeados de `ExecutionStatus`), não componentes P1. |
| I-04 ResultPanel vs ResultInspector | Nome canônico `ResultPanel`. |
| I-05 fallback "independente" vs "compatível" | Fallback = outro modelo testado; outro provedor só se testado e autorizado (custo). |
| A-01 `product.css` | Definido pela ADR 0005: `src/design-system/themes/product.css`. |
| A-03 "smoke" | Rota `/smoke` + teste Vitest/Playwright que a consome; smoke de persistência é separado. |
| §3 reescritas de gates | Adotar as reescritas da auditoria no ROADMAP após aprovação (alteração de doc coordenado). |

## Plano de implementação

### Fase 01 — scaffold (pré-requisito humano: instalar Bun e Node 24)

| Task | Owner | Arquivos autorizados | Depende de | Paralelo? | Esforço |
|---|---|---|---|---|---|
| P01-CDX-01 scaffold em `/tmp`, migrar config/router/rota `/smoke` | Codex (high) | `package.json`, `bun.lock`, `tsconfig.json`, `vite.config.ts`, `src/routes/**`, `src/router.tsx` — **autorizados pelo coordenador** | aprovação + binários | não | M |
| P01-CDX-02 Biome, Vitest, Playwright configs + smoke tests | Codex (medium) | `biome.json`, `vitest.config.ts`, `playwright.config.ts`, `tests/**` | P01-CDX-01 | não | S |
| P01-OC-01 `src/core/env` + `AppError` + unit tests | OpenCode (melhor gratuito) | `src/core/**`, `tests/unit/core/**` | P01-CDX-01 | sim, com CDX-02 | S |
| P01-OC-02 revisão independente da fase + checklist de gate | OpenCode | `docs/engineering/phase-01/review.md` | todas acima | — | S |
| P01-CLA-01 integração, decisão TS 7 vs fallback, STATUS | Claude | `docs/STATUS.md`, ADR 0001 | todas | — | S |

### Fases seguintes (visão)
- **02** tokens + corte P0 de primitivas (Button, Input, Dialog, Tabs, Toast, Typography, Stack, EmptyState/ErrorState primeiro): Codex primitivas; OpenCode testes a11y/teclado; Claude tokens (arquivo coordenado).
- **04** em paralelo com 02 após contratos: Codex adaptador IA; OpenCode testes com mock rotulado. Chamadas reais só com autorização de custo.
- **03** depende de 02. **05** depende de `core`. **06** integra Studio/CI. **07** simulações em worktrees descartáveis.

Corte de escopo (ROADMAP): 3D, voz, auth, mapas, agentes complexos, Storybook primeiro. Nunca cortar smoke, segurança, core, testes mínimos, contingência.

## Riscos técnicos (top)

1. **Bun/Node ausentes** — bloqueia toda a fase 01. Humano.
2. **TypeScript 7.0.2 (major nova)** — pode quebrar tipos gerados; fallback para linha anterior decidido com evidência.
3. **Nitro só pré-release** — deploy Vercel incerto; demo local é o caminho garantido.
4. **Cota gratuita OpenCode** — 3 de 5 modelos preferidos já esgotados; carga recai em Codex/Claude.
5. **Regulamento Hack IA Brasil desconhecido** — todo o Genesis pode ser apenas treino.
6. **`@convex-dev/react-query` 0.x** e OpenRouter provider comunitário — fixar versões em conjunto.

## Pendências humanas

1. Aprovar ou ajustar este plano e as ADRs 0001–0005 (gate da fase 00).
2. Instalar Bun (candidato 1.4.5) e Node 24.x e confirmar no terminal do Orca.
3. Confirmar com a organização do Hack IA Brasil as regras de reutilização (perguntas em `docs/strategy/COMPETITION.md`).
4. Decidir se o deploy Vercel com Nitro pré-release é aceitável ou se a hospedagem fica adiada.
5. Autorizar (ou não) commit deste pacote no repositório: os arquivos foram copiados de `~/Downloads/genesis` e estão **não rastreados**.
6. Credenciais (Convex, OpenRouter) apenas quando a fase correspondente chegar, via `.env` local.

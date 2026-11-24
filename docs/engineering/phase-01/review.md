# Revisão independente da Fase 01 contra o gate (P01-OC-02)

**Revisor:** OpenCode (hy4-flash-free), despacho P01-OC-02. **Coordenador:** Claude. **Branch:** `phase-01-scaffold`. **Data:** 2026-11-24. **Ambiente:** macOS, Bun 1.4.5, Node v24.22.3, Chromium via Playwright 1.65.1.

**Escopo e limites:** revisão somente leitura do código; nenhum arquivo de código, manifesto ou lockfile foi alterado.Únicos arquivos escritos: este documento e `docs/engineering/phase-01/checkpoints/P01-OC-02.md`. Nenhum commit, deploy, publicação ou chamada paga foi feito. Critérios adotados: reescrita do gate 01 em `docs/engineering/phase-00/doc-audit.md:55-63`, gate original em `docs/ROADMAP.md:8`, smoke em `docs/engineering/phase-00/test-strategy.md:17-28` e ADRs 0001/0002/0003.

**Contexto relevante da revisão:** durante a execução, um worker paralelo da Fase 02 editou `src/styles/base.css` e, em seguida, commitou `1e19ede feat(design-system): neutral semantic tokens and Phase 02 deps`. Por isso, `bun run check` retornou **1** numa execução intermediária (`@theme inline` em `src/styles/base.css:6` sem `tailwindDirectives` no parser CSS do Biome) e **0** após o commit que habilitou a opção em `biome.json`. A falha transitória não é defect da Fase 01. Todos os comandos abaixo foram **reexecutados no HEAD final (`1e19ede`)**, com árvore limpa (`git status --short` vazio), e os códigos registrados são dessas execuções finais.

---

## 1. Checklist do gate

Legenda: **passa** / **falha** / **bloqueado**. Quando um critério tem partes, ambas são explicitadas.

| # | Critério (origem) | Resultado | Evidência real |
|---|---|---|---|
| G1 | Instalação reproduzível: `bun install --frozen-lockfile` exit 0, lockfile versionado, repetível (`doc-audit.md:59`) | **passa (com ressalva)** | `bun install --frozen-lockfile` → **exit 0**, `Checked 216 installs across 289 packages (no changes)`; execução anterior no mesmo despacho → **exit 0**, `160 installs`/`234 packages`. `bun.lock` versionado. **Ressalva:** não executei instalação em clone limpo em segundo ambiente, nem comparei hashes do lockfile entre ambientes; essa parte da reescrita não foi validada aqui (vide E-1). |
| G2 | `bun run dev` serve a smoke route em porta documentada; `GET /` 200 com marcação identificável (`doc-audit.md:60`) | **passa** | Servidor iniciado via `bun run dev`; `curl GET /` → **HTTP 200**, `<h1>Application</h1>`; `curl GET /smoke` → **HTTP 200**, `<h1>Genesis smoke</h1>`. `bun run test:e2e` → **exit 0**, 2 testes (status 200 nas duas rotas, hidratação de `/smoke`). Porta 3000 em `package.json:9`, `playwright.config.ts:3` e documentada em `docs/engineering/phase-00/compat-matrix.md:94,110` (não no README — F-03). |
| G3 | `build`, `check`, `typecheck`, `test` com exit 0, sem erros, e saídas reais coladas no STATUS (`doc-audit.md:61`) | **falha (somente na evidência documental)** | Comandos: `bun run build` → **0** (cliente + SSR + Nitro/Vercel, `.vercel/output/`), `bun run check` → **0** (`Checked 66 files in 11ms. No fixes applied.`), `bun run typecheck` → **0** (`tsc --noEmit` sem diagnósticos; TS 7.0.2), `bun run test` → **0** (4 arquivos, 48 testes). Porém `docs/STATUS.md:3-5` ainda afirma fase 00, "código inexistente" e "nada instalado, nada testado", e a tabela em `:11-16` **não contém linha da Fase 01**. A subcriterição "saídas reais coladas no STATUS" não é atendida (F-01). |
| G4 | Persistência Convex real com credenciais; sem credenciais, STATUS registra "bloqueado" e o subcritério fica "não validado" (`doc-audit.md:62`; I-08/A-06) | **bloqueado** | `VITE_CONVEX_URL`, `CONVEX_DEPLOY_KEY`, `OPENROUTER_API_KEY` e `AI_MODEL_PRIMARY` **não estão definidos**; não há `.env` (apenas `.env.example`). Nenhuma query/mutation foi executada. `docs/STATUS.md` não registra bloqueio nem "não validado" para a Fase 01; os checkpoints também não. Não há aprovação para deploy (`AGENTS.md:10`). |

### Critérios complementares verificados

| Critério | Resultado | Evidência |
|---|---|---|
| Scaffold oficial TanStack Start | **passa** | `package.json:17-34` e configurações condizem com ADR 0001; origem `@tanstack/cli@0.72.16` registrada em `P01-CDX-01.md:30-32`. |
| TypeScript strict | **passa** | `tsconfig.json:22-26` (`strict`, `noUnusedLocals`, `noUnusedParameters`, `noFallthroughCasesInSwitch`, `noUncheckedSideEffectImports`); typecheck 0. |
| Pins do ADR 0001 | **passa** | Todos os pacotes do grupo Núcleo/Qualidade/Estilo em `package.json` batem com `0001-stack-and-versions.md:13-15` (inclui `nitro@3.0.260610-beta` em `:19-20`). Pacotes de UI/Motion/IA não instalados antecipadamente, conforme `:9`. |
| Convex opcional no arranque (ADR 0002/0003, `ROADMAP.md:8`) | **passa** | Build, unit e E2E passam sem nenhuma variável de aplicação; E2E executou sem credenciais. `src/ai/`, `src/integrations/` etc. contêm apenas `.gitkeep`. |
| Núcleo não importa `features/`, `ai/`, `integrations/`, `studio/` (`AGENTS.md:7`, ADR 0002:6) | **passa (manualmente)** | Varredura: único import em `src/core/` é `src/core/errors.ts:1` (`import type ... from "./contracts"`). As únicas ocorrências dos termos proibidos são comentários em `src/core/contracts.ts:5` e `src/core/env.ts:5`. Nenhum import aponta para diretórios proibidos em todo `src/**`. **Não há enforcement automatizado** (F-02). |
| Nenhum segredo / nome de serviço opcional no bundle público | **passa** | `grep -r "OPENROUTER\|CONVEX" .vercel/output/static` → **exit 1** (zero ocorrências); varredura case-insensitive também **exit 1**. A saída real do preset Vercel é `.vercel/output/static`; o caminho `.output/public` sugerido no despacho **não existe** (F-04). |
| Rotas smoke e hidratação | **passa** | `tests/e2e/smoke.spec.ts:3-23` — 2 testes, `data-hydrated="true"`, `pageerror` vazio; `tests/unit/smoke.test.ts:5-13` — roteador casa `/smoke` em Node. |

---

## 2. Findings

| ID | Severidade | Arquivo:linha | Descrição | Sugestão de correção |
|---|---|---|---|---|
| F-01 | **média-alta** | `docs/STATUS.md:3-5`, `:11-16` | Fonte de verdade da progressão está desatualizada: nega código e instalação, não registra os exit codes da Fase 01 e não marca o subcritério Convex como bloqueado/não validado. Viola diretamente `doc-audit.md:61-62` e a DoD em `ROADMAP.md:23` ("comandos e saídas reais no STATUS"). | Acrescentar linha da Fase 01 com os sete comandos e códigos reais deste relatório; corrigir `:4-5`; registrar em "Bloqueios" a ausência de credenciais Convex e o subcritério "não validado". Não marcar o gate inteiro como validado. |
| F-02 | **média** | `biome.json:1-23`; `docs/architecture/decisions/0002-module-boundaries.md:7` | ADR 0002 propôs enforcement por `noRestrictedImports` **ou** teste Vitest que varre imports. Nada foi implementado: `biome.json` não tem seção `linter` e não há teste de fronteira. Hoje a conformidade é apenas manual (G4 complementar); uma futura importação proibida passaria despercebida. | Adicionar regra `noRestrictedImports` (após confirmar suporte no Biome 2.6.9) ou um teste em `tests/unit/` que falhe se `src/core/**` importar `features/`, `ai/`, `integrations/` ou `studio/`. |
| F-03 | **baixa** | `README.md:15-17` | Scripts continuam anunciados como "previstos (ainda inexistentes)" Embora os sete comandos existam e passem. I-09 (`doc-audit.md:21`) pedia a substituição por nomes confirmados. | Substituir o título e a lista por "Scripts disponíveis" com os comandos reais e a porta 3000. |
| F-04 | **baixa** | procedimento de verificação (`P01-CDX-02.md:28` já usa o caminho correto) | O comando de varredura do despacho referencia `.output/public`, que não existe com o preset Vercel; a busca pode retornar 2 (erro de caminho) em vez de 1 (sem correspondência), dando falsa sensação de verificação. | Padronizar a varredura em `.vercel/output/static` (e, se algum dia o preset mudar, também `.output/public`) e registrar o exit code esperado = 1. |
| F-05 | **baixa** | `.env.example:2` | Comentário "use the integration's actual convention" mantém A-11 (`doc-audit.md:43`) em aberto; `src/core/env.ts:23` usa `VITE_CONVEX_URL` sem confirmação documentada da convenção. | Confirmar a convenção com fonte oficial e registrar em ADR/STATUS; remover o comentário condicional do `.env.example`. |
| F-06 | **informativa** | `P01-CDX-02.md:31` | Avisos de build não triados: Rolldown pede `debugName` para grupo de code splitting e sinaliza que diretivas `"use client"` de `@tanstack/react-router` podem não ser preservadas. Exit code é 0; não bloqueiam o gate. | Registrar decisão de aceitar ou corrigir; se aceito, anotar que é risco conhecido para produção. |
| F-07 | **informativa** | `tests/e2e/smoke.spec.ts:13-14,23` | E2E captura apenas `pageerror`; erros emitidos via `console.error` (inclusive avisos de hidratação do React) não falham o teste. | Adicionar listener de `console` com filtro para erros críticos no smoke E2E. |

---

## 3. Casos limítrofes não cobertos por testes

1. **E-1 — clone limpo / segundo ambiente:** `bun install --frozen-lockfile` foi executado duas vezes no mesmo workspace com `node_modules` presente. Não houve instalação em clone limpo nem comparação de hash do lockfile entre ambientes (critério literal de `doc-audit.md:59`). O checkpoint `P01-CDX-01.md:17-18` registra instalação anterior, mas não foi reproduzida de forma independente nesta revisão.
2. **Persistência real:** nenhuma query/mutation Convex, nenhum teste de "capacidade disponível vs. indisponível" em runtime e nenhum registro automatizado do estado `unavailable`.
3. **Deploy:** apenas o artefato local `.vercel/output/` foi inspecionado; nenhuma execução em infraestrutura Vercel (sem autorização, `AGENTS.md:10`). `P01-CDX-02.md:54` declara essa limitação.
4. **Segredo no bundle como regressão:** varredura é manual; não existe teste ou step de CI que falhe se um nome de variável/valor aparecer no bundle futuro.
5. **Fronteiras de módulo:** nenhum teste automático de imports proibidos (F-02).
6. **Rota desconhecida / erro:** não há teste de 404 nem de `errorComponent`/`CatchBoundary` no roteador (`src/router.tsx:5-10`).
7. **Console do navegador:** `console.error` não é capturado no E2E (F-07).
8. **Comportamento do roteador além do match:** `scrollRestoration`, `defaultPreload: "intent"` e `defaultPreloadStaleTime: 0` (`src/router.tsx:6-9`) não têm teste.
9. **Erros/valores exóticos em `src/core`:** `normalizeError` com arrays, funções, símbolos, BigInt, proxies ou getters que lançam; `isAppError` com objeto sem protótipo ou propriedades herdadas; `withCorrelationId` sem `crypto.randomUUID` (contexto inseguro) — `tests/unit/core/errors.test.ts:33-47,67-85,97-118` cobre apenas uma amostra.
10. **Capacidades com entradas não string:** `getCapabilities` com números, `null`, chaves `__proto__` ou propriedades herdadas; `isPresent` (`src/core/env.ts:25-31`) trata com segurança, mas não há teste.
11. **Porta ocupada / host:** comportamento de `--strictPort` em `package.json:9` quando a porta 3000 está em uso não é testado.
12. **Acessibilidade e reduced motion na rota smoke:** matriz da Fase 01 marca axe como opcional (`test-strategy.md:34`); nenhuma verificação foi executada nesta revisão.
13. **Mismatch de hidratação:** o E2E verifica apenas o atributo `data-hydrated` (`src/routes/smoke.tsx:18`); avisos de hidratação no console não são detectados (F-07).
14. **Avisos de build:** os avisos de Rolldown/`use client` (F-06) não possuem teste de regressão nem decisão registrada.

---

## 4. Veredito

**Bloqueado para aprovação integral do gate 01.** A execução técnica da Fase 01 passa integralmente nas sete verificações exigidas (`install --frozen-lockfile`, `check`, `typecheck`, `test`, `build`, `test:e2e` e varredura do bundle, todos com exit 0 / zero ocorrências), e o código respeita as fronteiras de ADR 0002/0003 e os pins de ADR 0001. Entretanto, dois requisitos explícitos da reescrita do gate não são atendidos: (a) as saídas reais não estão registradas em `docs/STATUS.md` (G3/F-01), e (b) o subcritério Convex está sem credenciais e **não foi registrado como bloqueado / não validado** (G4/F-01). Conforme `doc-audit.md:62` e `test-strategy.md:45`, isso impede aprovar o gate inteiro.

**Passos para o coordenador (sem alteração de código por este revisor):** atualizar `docs/STATUS.md` com os exit codes acima e com o bloqueio Convex; corrigir README (F-03); decidir sobre enforcement de imports (F-02) e sobre os avisos de build (F-06). Após isso, G3 e G4 podem ser reavaliados — G4 continuará "bloqueado" até que existam credenciais e uma query/mutation isolada, conforme a condição do próprio gate.

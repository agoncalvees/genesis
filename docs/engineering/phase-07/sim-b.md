# P07-SIM-B — Simulação cronometrada: "document with evidence"

Treino descartável, branch `p07-sim-b` (sem merge, push ou deploy). Tema fictício escrito antes do início: extrair, de texto colado, datas, prazos e frases de obrigação, mostrando o trecho de origem como evidência. Nenhuma chamada a provedor de IA, nenhuma dependência nova, nenhuma alteração em `src/core` ou `src/design-system`. Tema neutro preservado.

## Tempo

| Campo | Valor (UTC) |
|---|---|
| start | `2026-11-24T18:09:25Z` |
| end | `2026-11-24T18:19:58Z` |
| duration_min | **10.55** (10 min 33 s) |

Meta de 45 min não estourada; sem overrun a explicar.

## Plano e critérios (registrados antes da execução)

1. Extrator determinístico puro (regex/heurísticas, sem IA) em `src/features/doc-evidence/`, com datas `dd/mm/aaaa` e `15 de março de 2027`, prazos relativos (`em até 30 dias`) e obrigações (`deve`, `é obrigatório`, `vedado`).
2. Fixture sintética rotulada + valores esperados; precisão/recall calculados por função pura e registrados via `src/evidence` runner.
3. Rota `/doc-evidence` usando somente o design system (Textarea, Button, ResultPanel, Card/Badge, EmptyState/ErrorState via ResultPanel), cada item com excerto de origem; estados vazio e de erro tratados.
4. `check`, `typecheck`, `test`, `build` e um teste E2E da rota.

Arquivos sob responsabilidade: `src/features/doc-evidence/{extract,fixture,metrics,index}.ts`, `scripts/doc-evidence-report.ts`, `src/routes/doc-evidence.tsx`, `tests/unit/doc-evidence.test.ts`, `tests/e2e/doc-evidence.spec.ts`, `src/routeTree.gen.ts` (regenerado), `docs/engineering/phase-07/sim-b.md` e o artefato JSON de evidência. Nenhum outro arquivo foi alterado.

## O que foi construído

- `extractEvidence(text)` puro e determinístico: normaliza offsets, produz `id` estável (`kind-start-end`), `value` (frase exata), `excerpt` (até 40 caracteres de contexto, whitespace colapsado) e `start/end`. Ordena por posição e deduplica por `(kind, start, end)`.
- Datas númericas e longas (12 meses em português, `giu`); prazos com prefixos `em até | no prazo de | dentro de | até | em` e unidades `dias úteis | dias | horas | semanas | meses`; obrigações por sentença com fronteiras Unicode (`(?<![\p{L}\p{N}_])...(?![\p{L}\p{N}_])`) para capturar `É obrigatório`/`É vedado` sem confundir `devem`/`deverá`.
- `scoreExtraction` por multiconjunto de chaves `(kind, valor normalizado)`: TP = soma dos mínimos por chave; FP/FN derivados de TP; precisão, recall e F1 explícitos (zero quando o denominador é zero).
- Rota `/doc-evidence`: `Field`/`Textarea` com contador, `Button` desabilitado para entrada vazia, limite de 8000 caracteres com `AppError` (`INPUT_TOO_LONG`), `ResultPanel` com `isEmpty` e badges por tipo; cada `Card` mostra o valor extraído e o excerto em `Code`. Marcador `data-hydrated` (padrão já usado em `/smoke`) para E2E não correr contra a hidratação.
- `scripts/doc-evidence-report.ts`: pontua a fixture, executa `defineBenchmark`/`run` do runner compartilhado (3 warm-ups, 15 repetições) e grava o registro canônico em `docs/engineering/phase-07/doc-evidence-evidence.json`.

## Comandos e códigos de saída (execuções finais)

| Comando | Saída | Código |
|---|---|---|
| `date -u +%Y-%m-%dT%H:%M:%SZ` (start/end) | timestamps acima | 0 |
| `bun install --frozen-lockfile` | 230 pacotes, `bun.lock` inalterado | 0 |
| `./node_modules/.bin/biome check --write <arquivos próprios>` | 6 arquivos formatados | 0 |
| `./node_modules/.bin/biome format --write docs/engineering/phase-07/doc-evidence-evidence.json` | artefato normalizado | 0 |
| `bun scripts/doc-evidence-report.ts` | scores abaixo | 0 |
| `bun run check` | 162 arquivos, sem erros | 0 |
| `bun run typecheck` | TS 7.0.2, sem erros | 0 |
| `bun run test` | 19 arquivos: 171 passed, 1 skipped (172 testes) | 0 |
| `bun run build` | `.vercel/output` (nodejs24.x); apenas avisos Rolldown `use client` já conhecidos (F-06) | 0 |
| `bun run test:e2e` | 18 passed (inclui o teste novo da rota) | 0 |

## Precisão e recall medidos (não estimados)

Runner `doc-evidence-fixture-score`, caso `regex-heuristic-extractor`, dataset `synthetic-edital-evidence-v1` (fixture sintética escrita à mão, v1; **não é edital real**), `modelVersion: n/a`, `codeVersion: f8fd166`, `codeDirty: true` (medição anterior ao commit).

| Métrica | Valor medido |
|---|---|
| esperados / extraídos | 17 / 17 |
| TP / FP / FN | 17 / 0 / 0 |
| **precision** | **1.0000** |
| **recall** | **1.0000** |
| F1 | 1.0000 |
| repetições (warm-up 3) | 15 |
| mediana do tempo de pontuação | 0.0843 ms (n=15) |

O runner mede tempo; as razões de qualidade são saídas puras registradas em `config` do mesmo registro (`toJson`). Artefato: `docs/engineering/phase-07/doc-evidence-evidence.json`. Limitações: uma única fixture sintética, casamento por valor exato normalizado, nenhum documento real; o valor 1.0000 não deve ser extrapolado para editais reais. O `codeDirty: true` é esperado porque a medição ocorreu antes do commit.

## Falhas e correções

1. `bun run build` → **127**: `vite: command not found`; `node_modules` ausente no worktree fresco. Correção: `bun install --frozen-lockfile` (0), sem mudar lockfile.
2. `bun run check` → **1**: 8 erros de formatação/ordem de imports nos arquivos novos. Correção: `biome check --write` escopo aos arquivos próprios (0).
3. `bun run typecheck` → **1**: `ResultPanelProps<T>` exige `renderResult` mesmo nos estados `idle`/`failed`, embora nunca o use. Correção: passar o mesmo renderer nas três variantes (0). Ver "Genesis friction".
4. `bun run test` → **1** (2 falhas de 172): `\b` do JS é ASCII-only, então `É` não é caractere de palavra e `É obrigatório`/`É vedado` casavam só o sufixo. A pontuação real nesse ponto era TP 14, FP 3, FN 3, precisão=recall=0.8235. Correção: fronteiras Unicode com lookarounds; pontuação passou a 17/17 e os testes a 171 passed/1 skipped.
5. `bun run test:e2e` (1ª tentativa) → **1**: porta 3000 ocupada pelo servidor de dev do worktree irmão `p07-sim-a` (processo de outro trabalhador, não foi morto). Além disso, o teste interagia antes da hidratação: `fill` alterava o DOM, mas o estado React permanecia vazio e o botão continuava desabilitado. Correção: marcador `data-hydrated` na rota + espera no E2E; execução intermediária com config temporária na porta 3100 (removida, não commitada); quando a porta 3000 ficou livre, `bun run test:e2e` passou 18/18 com o comando oficial.
6. `bun run check` após gerar o JSON → **1**: `toJson` usa 2 espaços e arrays em linhas separadas; Biome espera tabs e arrays curtos em uma linha. Correção: `biome format --write` no artefato e nota no script sobre o passo de re-formatação após regenerar.

Não houve revisão independente neste worktree descartável; autorrevisão dos diffs e execução completa dos gates (conforme AGENTS.md, limitação declarada).

## Genesis friction

**Ajudou**
- `src/evidence` (`defineBenchmark`, `run`, `toJson`) permitiu registrar evidência reproduzível sem nova infraestrutura nem chamada externa.
- `ResultPanel` já concentra `EmptyState`, `ErrorState`, badge de estado e reduced motion; com `Field`, `Textarea`, `Button`, `Card`, `Badge` e `Code` a rota não precisou de nenhum token ou CSS de marca.
- Roteamento por arquivo regenerou `src/routeTree.gen.ts` automaticamente no build; bastou criar `src/routes/doc-evidence.tsx`.
- Scripts de `package.json`, lockfile congelado e instalação determinística facilitaram retomar gates em worktree limpo.

**Atrasou**
- `ResultPanelProps<T>` obriga `renderResult` em `idle`/`failed` por causa da interseção do tipo base com a união discriminada; renderer não usado teve que ser passado.
- `status` local forçou três chamadas explícitas a `ResultPanel` (não foi possível usar uma única variável tipada sem cast).
- Hidratação não tem sinal compartilhado: tive que copiar o padrão `useSyncExternalStore` de `/smoke` para evitar corrida no primeiro clique.
- `playwright.config.ts` fixa a porta 3000 e não oferece override por ambiente/trabalhador; contention com outro worktree exigiu config temporária fora do commit.
- Formato do `toJson` do runner diverge do formatador Biome para JSON, exigindo uma etapa manual extra antes de `check`.

**Faltou (mudanças que seriam necessárias no Genesis, não feitas aqui)**
- Métricas de classificação (precisão/recall/F1) como utilitário de primeira classe em `src/evidence`; hoje só há temporização e exportação, então o scoring vive no feature e as razões foram parar em `config`.
- Exportar da base um `useHydrated`/sentinela de hidratação, em vez de duplicar o padrão do smoke route.
- Primitiva de "excerto com evidência" (destaque por offsets) no design system; as cards foram montadas à mão com `Code`.
- Internacionalização/estrutura de conteúdo neutra para textos de UI; a rota mistura o chrome em inglês do design system com o texto do desafio em português (sem branding, conforme a regra de tema desconhecido).

## Estado final

Worktree descartável, commit local único; nada foi mesclado, enviado ou implantado. Todos os gates pedidos passaram com comandos oficiais; scores medidos 1.0000/1.0000 apenas na fixture sintética rotulada.

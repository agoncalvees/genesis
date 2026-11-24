# Revisão independente P09 — motor de design, mundos, licenças e acessibilidade

Task: P09-OC-03. Revisor: OpenCode (hy4-flash-free). Coordenador: Claude.
Data: 2026-11-24. Local: esta máquina (sem dev server, build ou e2e).

## Escopo, método e limites

- **Somente leitura de código.** Edito apenas este arquivo e
  `docs/engineering/phase-09/checkpoints/P09-OC-03.md`. Um worker Codex edita `src/`
  e roda build/e2e em paralelo; não toquei nesses arquivos.
- **Comandos executados (resultados reais):**
  - `bun run design:lint` → **0 erros**; 5 arquivos, 2 avisos conhecidos em cada
    (`motion`, `genesis`) e 1 `info` de resumo.
  - `bun run design:check` → **saída vazia, exit 0** (sem drift).
  - `bunx @google/design.md@0.4.0 lint design/DESIGN.md` → `{"errors":0,"warnings":2,"infos":1}`.
    Avisos: `token-like-ignored` em `motion` e `genesis`.
  - `bun run test` → **252 passed, 1 skipped** (27 arquivos; 1 arquivo pulado).
  - `grep` em `src/` e leitura de `node_modules/@google/design.md/dist/spec.md`,
    `node_modules/@google/design.md/LICENSE` e dos 8 `node_modules/@fontsource*/LICENSE`.
  - Sondas **sem escrita** via `bun -e` sobre `loadDesign()` com valores hostis
    (`;}` + `url()`/`expression()` em `colors`, `genesis.data`, `darkColors`,
    `darkData`, `fontFamily` e `shadows`) — todas rejeitadas.
- **Não executado** (fora da autorização da task): `dev`, `build`, `test:e2e`.
  Achados E2E citados abaixo são de **leitura das definições de teste**, não de
  execução própria.
- Citação `arquivo:linha` = linha exata no estado lido em 2026-11-24.
  `src/design-system/tokens/base.css` estava em edição pelo worker Codex; as
  linhas citadas refletem a versão relida após essa alteração ( adição de `--measure`).

## Veredito

**Aprovado com ressalvas.** Nenhum achado **crítico** ou **alto**. Segurança do
motor, fidelidade à spec, completude do contrato, licenciamento e isolamento
passam. Restam 1 meio e 6 baixos, todos de endurecimento/localização de risco —
nenhum bloqueia o gate P09.

| Severidade | Quantidade | IDs |
|---|---|---|
| Critical | 0 | — |
| High | 0 | — |
| Medium | 1 | OC03-01 |
| Low | 6 | OC03-02 … OC03-07 |
| **Total** | **7** | — |

## Achados

| ID | Severidade | Arquivo:linha | Descrição | Correção concreta |
|---|---|---|---|---|
| OC03-01 | medium | `tools/design-engine/cli.ts:65-69` | `design:import <url>` usa `fetch(url, { signal: AbortSignal.timeout(15_000) })` e depois `response.text()`: há limite de **tempo**, mas **nenhum limite de bytes**. Uma URL hostil pode enviar corpo arbitrário em 15 s e esgotar memória da máquina que roda o CLI. | Verificar `Content-Length` e ler o corpo como stream com teto fixo (ex.: 1 MiB), abortando ao exceder; registrar o limite em `design/imports/README.md:3`. |
| OC03-02 | low | `tools/design-engine/cli.ts:51-52,71`; `design/imports/README.md:3` | A mesma importação aceita qualquer `http(s)://` (inclusive loopback/rede interna — SSRF local) e qualquer caminho local legível. O impacto é limitado: o conteúdo só vai para quarentena e a operação é explícita do operador, mas a fronteira de confiança não está documentada. | Documentar que a entrada é de confiança do operador; opcionalmente exigir `--allow-remote` ou restringir hosts antes de `fetch`. Não afeta o destino da escrita (bloqueado por `safeId`). |
| OC03-03 | low | `tools/design-engine/generate.ts:144-151` | `checkDrift` percorre **somente** os três caminhos esperados. Um arquivo extra criado em `src/design-system/themes/generated/` não é detectado (um arquivo existente editado à mão **é** detectado por comparação byte a byte). | Listar o diretório e falhar também em arquivos não esperados, além da comparação de conteúdo. |
| OC03-04 | low | `tools/design-engine/generate.ts:17-26` | A verificação cruzada com o export oficial do Google compara apenas `--color-primary`. Divergências de tipografia/raios/espaçamento entre o normalizador Genesis e o export `css-tailwind` passariam despercebidas. | Comparar todas as chaves compartilhadas ou registrar explicitamente no contrato que a checagem é intencionalmente restrita a `primary`. |
| OC03-05 | low | `src/studio/worlds/worlds.css:10-18,36-51,139-351` | O CSS escrito à mão dos mundos é escopado por prefixo de classe (`world-*`), não por `[data-world]`. O CSS **gerado** é corretamente escopado (`generate.ts:94-101`), mas regras globais como `.world-navigation a`, `.world-form button` ou `[data-composition="guided"] :is(button, select, input)` atingiriam qualquer elemento fora do mundo que reutilizasse esses nomes. Hoje a folha só entra pela rota lazy (`src/studio/worlds/page.tsx:12`), então o risco é teórico. | Prefixar os seletores com um escopo estável (`:where([data-world], .world-detail)` onde couber) ou documentar `world-*` como namespace reservado e proibido fora de `src/studio/worlds/`. |
| OC03-06 | low | `tools/design-engine/validate.ts:17-22`; `docs/design/VISUAL-ENGINEERING.md:11` | `--focus` é validado apenas contra `background` e `surface`; a regra permanente exige contraste ≥ 3:1 também contra superfícies adjacentes (`surface-raised`, botões preenchidos). Os valores atuais passam, mas um mundo futuro poderia registrar foco invisível sobre `surface-raised` sem o validador reclamar. | Acrescentar `["focus","surface-raised"]` a `controlPairs` (e pares com `primary`/`accent` quando o foco for desenhado sobre eles). |
| OC03-07 | low | `design/worlds/*/REFERENCES.md:5-7`; `tools/design-engine/fonts.ts:12-37` | As licenças OFL-1.1 estão **confirmadas** nos 8 pacotes e listadas nas referências, mas não há NOTICE/texto de licença acompanhando as fontes auto-hospedadas no bundle (`find` não encontrou `NOTICE`/`LICENSE` fora de `node_modules`). | Se a política de distribuição exigir, incluir um `NOTICE` com os textos OFL das oito famílias (ou link oficial) no repositório/publicação. |

## 1. Segurança do motor

**Travessia de caminho — bloqueada.** `safeId = /^[a-z0-9]+(?:-[a-z0-9]+)*$/`
(`tools/design-engine/generate.ts:9`) é aplicado ao nome da importação
(`cli.ts:59-62`), ao nome do `apply` (`cli.ts:127-133`) e ao id do mundo
(`generate.ts:84`); teste explícito em `tests/unit/design-system/engine.test.ts:80`.
O caminho de escrita da importação é `join("design/imports", id(...))` e o arquivo
é criado com `flag: "wx"` (`cli.ts:63,73-74`) — não há escrita fora de `design/imports/`.

**URLs remotas — ver OC03-01/02.** Somente `http(s)://` é tratado como remoto
(`cli.ts:51`); timeout de 15 s existe (`cli.ts:66`), limite de tamanho não.

**Injeção de CSS — bloqueada, verificado por leitura e por sonda.** Ainda que
`normalize.ts:19` aceite cor como `z.string()` (para `genesis.data`, `darkColors`,
`darkData`), `validate()` reanalisa **todas** as chaves de paleta com o resolvedor
do Google e grava apenas `.hex` opaco (`validate.ts:46-61`, `generate.ts:58-62`).
Famílias são permit-listadas (`validate.ts:99-105`, `fonts.ts:1-38`); sombras,
tracking, comprimentos e `dialogScrim` têm regex restritivas (`normalize.ts:7-18,85`);
números de motion passam por `z.number()` (`normalize.ts:99-139`). Sondas com
`;}` + `url()`/`expression()` em todos os pontos acima foram rejeitadas com
erros de cor/fonte/formato — nenhum valor chega ao CSS gerado sem normalização.

**Aplicação — nunca automática e bloqueada em erro.** `import` apenas copia para
quarentena e reporta (`cli.ts:74-76`); a promoção exige `design:apply` explícito
(ADR 0006:23, `design/imports/README.md:3`). Em `apply`, `renderFiles(source)` —
que chama `loadDesign()` → `validate()` — é avaliado **antes** de qualquer
`writeAtomically` (`cli.ts:135-139`, `generate.ts:119-124`), então erro de
contraste/estrutura aborta sem escrita.

## 2. Fidelidade à spec

- **Ordem das seções:** `spec.md:104-113` prescreve Overview → Colors →
  Typography → Layout → Elevation & Depth → Shapes → Components → Do's and Don'ts.
  Os 5 arquivos (`design/DESIGN.md`, `design/worlds/*/DESIGN.md`) seguem exatamente
  essa ordem (ex.: `precision/DESIGN.md:169-202`).
- **Tipos de token:** `colors` com referências `{colors.*}`, `typography` com
  `fontFamily/fontWeight/letterSpacing/fontSize`, `rounded` em px/rem, `spacing`,
  `components` — todos aceitos pelo lint 0.4.0 (0 erros nos 5 arquivos).
- **Avisos `motion`/`genesis` — aceitáveis.** São chaves de extensão declaradas
  na ADR 0006:18 e no contrato (`DESIGN-ENGINE.md:39-41`) e lidas via
  `unknownKeyValues` (`normalize.ts:165-166`), não pelo exportador do Google. O
  aviso `token-like-ignored` diz que o *export* as ignora — é exatamente o motivo
  pelo qual o motor faz normalização própria (ADR 0006:20). Classifico como
  **aceitável e documentado**, não como defeito.
- **Drift — detecta edição manual.** `checkDrift` compara bytes exatos
  (`generate.ts:144-151`); `engine.test.ts:83-100` cobre arquivo ausente, conteúdo
  `stale` e conteúdo igual. `bun run design:check` retornou 0 nesta máquina.
  Ressalva em OC03-03 (arquivo extra).

## 3. Completude do contrato

- `normalize.ts:199-241` emite superfícies, texto, ação, estado, tipografia,
  geometria, densidade, superfície, motion e ícones; `:242-263` completa raios,
  sombras, durações/easings; `:265-288` completa cores e a variante escura.
- `tests/unit/design-system/tokens.test.ts:24-35` exige **todas** as chaves nos
  dois modos de `product` + 4 mundos; o teste passou. `worlds.ts:1-19` registra
  `hasDark` derivado de `Boolean(identity.dark)` — apenas cinematic declara escuro,
  como previsto (`DESIGN-ENGINE.md:53-61`).
- **Limiares da paleta de dados documentados e aplicados:**
  `DESIGN-ENGINE.md:49` e `VISUAL-ENGINEERING.md:5-8` definem ≥ 3:1 contra
  `--surface`, ΔE OK ≥ 0,07 em OKLab 0–1 e texto ≥ 4,5:1; `validate.ts:62-94`
  aplica exatamente esses números (inclusive pares `on-*/*`), e
  `contrast.test.ts:12-15` revalida todos os escopos gerados.

## 4. Licenciamento

- `@google/design.md@0.4.0` (devDependency exata em `package.json:53`): LICENSE
  é **Apache License 2.0** (`node_modules/@google/design.md/LICENSE:1-2`), coerente
  com ADR 0006:11.
- Oito pacotes `@fontsource*`, versões 5.3.0 em `package.json:27-34`; todos os
  arquivos `LICENSE` dizem "SIL Open Font License, Version 1.1" (verificados um a
  um: bricolage-grotesque, figtree, ibm-plex-sans, jetbrains-mono, newsreader,
  sora, atkinson-hyperlegible, ibm-plex-mono). Coincidem com o registro em
  `fonts.ts:12-37`.
- `REFERENCES.md` de cada mundo lista fontes + licenças e origem da direção de
  arte; `precision/REFERENCES.md:7` cita Robin explicitamente como referência de
  **princípios**, sem licença de reuso. Nomes dos mundos são descritivos
  genéricos, paletas e composições são originais, sem logotipos, nomes de marca ou
  cópia reconhecível de identidade. Ressalva de distribuição em OC03-07.

## 5. Acessibilidade (leitura de código)

- **Dataviz:** `dataviz/index.tsx:33-68` dá ao SVG `role="img"`,
  `aria-labelledby`/`aria-describedby`, `<title>`/`<desc>` e uma tabela
  `sr-only` com `<caption>`, `scope="col"`/`scope="row"`; `dataviz.test.tsx:17-41`
  verifica nome, descrição, tabela e valores. `Legend` usa swatches `aria-hidden`
  com rótulo textual (`:244-261`), e os rótulos de barras são visíveis
  (`index.tsx:105-119`). Nenhuma codificação depende só da cor.
- **Foco:** anel global `:focus-visible` com 2 px (`base.css:111-114`,
  `tokens/base.css:6-7`); `--focus` validado contra `background`/`surface`
  (`validate.ts:18-19`). E2E lê contorno visível em `worlds.spec.ts:143-149,156-157`.
- **Reduced motion:** tokens zerados em `@media (prefers-reduced-motion: reduce)`
  para `:root`, `[data-world]` e `[data-theme]` (`tokens/base.css:26-44`);
  animações CSS só em `@media (prefers-reduced-motion: no-preference)`
  (`motion/motion.css:37-53`); `readMotionProfile` zera intensidade/spring
  (`motion/presets.ts:39-44,57-65`); e o hero do mundo não anima nem reage a
  mudança de preferência com `animation.complete()` (`composition.tsx:120-139`).
  O desenho de traço do sparkline acrescentado pelo worker Codex também fica
  dentro de `@media (prefers-reduced-motion: no-preference)`
  (`charts.css:96-103`) e usa `--duration-showcase`, que os perfis `still`
  zeram. `worlds.spec.ts:23,158-165` define zero animações em execução.
- **Alvos:** `--target-min: 24px` (`tokens/base.css:8`), alturas de controle
  `max(24px, …)` (`base.css:36-47`) e `min-w-(--target-min)` em todo botão
  (`button.tsx:8`), com `size-control-sm` para `IconButton` (`:65-69`). Mesmo com
  densidade compacta do Precision (0.8; `precision/DESIGN.md:138`), o menor alvo
  é ≈25,6 px; Civic eleva explicitamente para ≥44 px
  (`worlds.css:294-296`). Conferido por leitura — nenhum teste unitário mede px.
- **Eixo de cor:** informação sempre acompanhada de rótulo/tabela/legenda, conforme
  `VISUAL-ENGINEERING.md:8`; `worlds.spec.ts:126-132` define axe
  `wcag2a/aa/21aa/22aa` sem violações nos 4 mundos × 3 larguras (não executado por mim).

## 6. Isolamento

- **Fontes:** `grep -rn "@fontsource" src/` retorna **somente**
  `src/studio/worlds/page.tsx:2-11`. `__root.tsx:1-43`, `index`, `demos*` e os
  demais entry points não importam fontes de mundo. O módulo é lazy e condicionado
  a `VITE_STUDIO_DISABLED !== "1"` (`studio.worlds.$id.tsx:12-16`,
  `studio.worlds.index.tsx:20-24`). `worlds.spec.ts:216-235` define que `/` e
  `/demos` não requisitam fontes de mundo e que `/studio/worlds/precision` sim.
- **CSS:** os tokens gerados por mundo ficam em `[data-world="<id>"]`
  (`generate.ts:83-103`); o produto usa `:root:not([data-world])` e
  `[data-theme="…"]:not([data-world], [data-world] *)`
  (`generate.ts:65-80`), portanto não sobrescreve um mundo aninhado.
  `worlds.spec.ts:184-214` define dois mundos lado a lado com tokens distintos e
  a navegação externa inalterada; `world-scopes.spec.ts:5-101` define o mesmo
  para dois scopes injetados. `themed-primitives.test.tsx:63-78` cobre portal de
  Dialog dentro do escopo. Ressalva do CSS escrito à mão em OC03-05.

## Limitações desta revisão

Não executei build, dev server nem e2e por determinação da task; afirmações sobre
comportamento em navegador vêm de leitura de código e de testes pré-existentes,
não de medição minha. O worker Codex ainda alterava `src/` durante a leitura;
`bun run test` (252 passed) foi rodado **antes** da última alteração incremental
em `src/design-system/dataviz/{index.tsx,charts.css}` (desenho de traço do
sparkline, já citado acima por releitura). Esta revisão cobre o estado listado,
não alterações posteriores a ele.

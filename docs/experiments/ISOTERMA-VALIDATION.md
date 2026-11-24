# ISOTERMA — validação controlada do Genesis (frontend)

Experimento de design engineering executado em 2026-11-24 (19:05–19:40 BRT). **Não é produto nem submissão.** Território, dados e cálculo são sintéticos e demonstrativos.

> **Estado:** evidência automatizada completa; **avaliação humana cega pendente**. Os critérios visuais (originalidade, adequação, composição, interatividade/motion, consistência) ainda não têm nota. O coordenador viu as versões identificadas, então as observações visuais abaixo são **não cegas** e não substituem a avaliação humana.

## 1. Hipótese e desenho

Hipótese: o Genesis permite construir produtos visualmente sofisticados, contextualizados e não genéricos com **mais velocidade e consistência**.

| Versão | Stack | DESIGN.md ISOTERMA | Componentes, padrões e motor do Genesis | Inicialização |
|---|---|---|---|---|
| A | mesma (TanStack Start 1.169.7, React 19.3.1, Vite 8.3.8, Tailwind 4.3.5, TS 7.0.2, Bun 1.4.5) | não | não | do zero |
| B | mesma | sim (traduzido à mão) | não | do zero |
| C | Genesis `d78595f` | sim (via `design:import`/`apply`) | sim | `genesis:new` |

Controles: mesmo briefing funcional ([`isoterma/BRIEF.md`](isoterma/BRIEF.md)), mesmos dados sintéticos (seed 20261124, SHA-256 `7a5d84f4…cefcc4e`), mesmo protocolo de medição ([`isoterma/PROTOCOL.md`](isoterma/PROTOCOL.md)), mesmo orçamento (preparação ≤ 30 min; implementação ≤ 75 min), mesma lista de dependências permitidas (sem bibliotecas de mapa/gráfico), mesmo agente e modelo, workspaces isolados fora do repositório Genesis, sessões independentes iniciadas no mesmo minuto. A versão A **não** recebeu a direção visual (paleta, tipografia) — apenas o briefing funcional e as regras anti-genéricas.

**Pré-registro:** o harness de avaliação ([`isoterma/evaluation/harness.spec.ts.txt`](isoterma/evaluation/harness.spec.ts.txt) (cópia byte a byte; sufixo `.txt` para ficar fora do lint/typecheck da fundação)) foi escrito e teve o hash SHA-256 gravado às 22:11:42Z, antes de qualquer interface existir, e não foi alterado depois (`shasum -c` = OK antes da execução). Ele usa só nomes acessíveis definidos no briefing, nunca seletores internos.

Execução: Orca run `run_d7aa59e1e455`. Workers Codex `ctx_fbcefcc3339b` (A), `ctx_addb85e153a4` (B), `ctx_6992411e5e18` (C); auditoria OpenCode `ctx_a0685e1c9d68`.

## 2. Preparação

- **P10:** não há entregáveis P10 no repositório (último commit: `d78595f`, P09; `git log`, `docs/STATUS.md`). O experimento usou o estado P09. Se P10 existir fora do repositório, esta validação não o cobre.
- Capacidades reais inventariadas (P09): motor DESIGN.md (lint/build/check/import/apply), `genesis:new`, ~45 exportações em `src/design-system` (primitives, components, patterns editorial/IA/upload/evidência/resultado, motion, dataviz Bar/Line/Sparkline/Legend), 4 mundos, Studio (removido do produto pelo `genesis:new`).
- Ambientes descartáveis: `/Users/arthurgoncalves/orca/experiments/isoterma/version-{a,b,c}` (git próprios, registrados no Orca). A fundação não foi alterada; `git status` do Genesis limpo durante todo o experimento.
- Nenhum crédito Figma ou pago usado; nada publicado.

## 3. DESIGN.md experimental

[`isoterma/DESIGN.md`](isoterma/DESIGN.md) — identidade "Isoterma": papel/areia, tinta de terra, verde de vegetação (ação/resfriamento), óxido (calor), azul mineral (foco), Newsreader + IBM Plex Sans + IBM Plex Mono (OFL, já registradas no motor), raios 1–3 px, superfície por borda, perfil de motion `calm`, composição `atlas`, rampa térmica sequencial de 7 passos (extensão em prosa — o contrato do motor não tem escala sequencial).

| Validação | Resultado |
|---|---|
| `bun tools/design-engine/cli.ts lint <arquivo>` (contraste WCAG, fontes registradas, ΔE das séries) | 0; só os avisos conhecidos de extensões `motion`/`genesis` |
| `npx --no-install design.md lint` (Google 0.4.0) | 0 erros, 2 avisos (extensões), 1 info |
| Primeira tentativa | falhou: fallback `Georgia` não está no registro de fontes → removido |
| Rampa térmica (cálculo do coordenador) | texto `foreground` sobre t2–t5 ≥ 4,85:1; branco sobre t1/t6/t7 ≥ 4,81:1 (t6 ajustado de `#bf5f34` para `#b5572e`, que dava 4,28:1) |
| Em C: `design:import` → `apply` → `build` → `check` → `lint` | 0 em todos |

## 4. Tempos medidos

Timestamps UTC registrados pelos próprios workers e conferidos contra os horários dos commits (coerentes). Coordenador: preparação dos materiais comuns ~22:00–22:10Z (antes do despacho; idêntica para as três).

| | A | B | C |
|---|---|---|---|
| Modelo / esforço | Codex `gpt-6.2-sol` / padrão | idem | idem |
| Troca de modelo | não | não | não |
| T0 início | 22:10:15Z | 22:10:15Z | 22:10:14Z |
| Preparação (T0→T1) | **48 s** | **43 s** | **46 s** |
| Primeira interface funcional (T1→T2) | 1 min 53 s | 1 min 12 s | 2 min 19 s |
| Fluxo completo (T1→T3) | 4 min 29 s | 4 min 35 s | 4 min 33 s |
| Implementação + verificação (T1→T4) | 6 min 28 s | 9 min 34 s | 7 min 54 s |
| **Total (T0→T4)** | **7 min 16 s** | **10 min 17 s** | **8 min 40 s** |
| Correções (ciclos de verificação falhos) | 1 | 5 | 4 |
| Orçamento usado | ~7 % | ~10 % | ~9 % |

A preparação em C incluiu `genesis:new` (clone, instalação congelada, build, check, typecheck, 262 testes) e a aplicação do DESIGN.md; A e B montaram a stack do zero no mesmo tempo (cache local do Bun aquecido).

## 5. Avaliação automatizada uniforme (mesmo harness, build de produção, sequencial, máquina ociosa)

| Teste (Chromium, `run-eval.sh`) | A | B | C |
|---|---|---|---|
| `bun run build` / `typecheck` | 0 / 0 | 0 / 0 | 0 / 0 |
| Harness (12 testes) | **12/12** | **12/12** | **12/12** |
| axe WCAG 2.0/2.1/2.2 A/AA, inicial e resultado, 360/768/1440 | 0 violações | 0 | 0 |
| Overflow horizontal 360/768/1440 | 0 px | 0 px | 0 px |
| Erros de console / `pageerror` | 0 | 0 | 0 |
| Teclado: Tabs até "Centro Antigo" / seleção / simular / redefinir | 6 / ✓ / ✓ / ✓ | 7 / ✓ / ✓ / ✓ | 7 / ✓ / ✓ / ✓ |
| Foco visível (heurística outline/box-shadow do harness) | falso negativo* | falso negativo* | ✓ |
| Cálculo de referência r06 (38,3 °C; −3,0 °C) | ✓ | ✓ | ✓ |
| Erro "configure ao menos uma intervenção" | ✓ | ✓ | ✓ |
| Erro "dados insuficientes" (r11) | ✓ (aviso na seleção e após simular) | ✓ | ✓ |
| Resultado marcado "desatualizado" após alterar parâmetro | ✓ | ✓ | ✓ |
| Reduced motion: animações em execução após resultado | 0 | 0 | 0 |
| Região visível após navegação (ms, 1440) | 540 | 544 | 547 |
| JS+CSS do cliente (bruto / gzip) | 380 KB / 122 KB | 386 KB / 122 KB | 631 KB / 195 KB |

\* Inspeção por captura (`out/<v>/focus.png`): A desenha contorno branco de 2 px no polígono (contraste fraco sobre células claras); B contorno azul-mineral espesso; C contorno branco + outline retangular do `<g>`. As três têm foco visível; a heurística do harness não detecta foco pintado por `stroke` SVG. Limitação do harness, registrada.

Comando: `evaluation/run-eval.sh <v> <porta>` (build → typecheck → `serve` → harness). Saídas brutas: `evaluation/out/<v>/{build.txt,harness.log,results.json,metrics.jsonl}`.

## 6. Métricas estáticas e reutilização

| | A | B | C |
|---|---|---|---|
| Dependências adicionadas | 17 (stack fixa, nenhuma opcional) | 20 (stack + 3 fontes OFL) | **0** (herdadas do Genesis) |
| Linhas escritas (src+tests, sem JSON/gerados) | ~650 | ~1.737 (736 de CSS traduzindo o DESIGN.md) | ~1.396 |
| Literais hex no código autoral | 36 | 30 (tokens em CSS próprio) | 7 (só a rampa térmica, extensão local) + 56 gerados pelo motor |
| Fontes | sistema (`Avenir Next`, `Trebuchet MS`, serifa do sistema) — dependem do SO | Newsreader/Plex self-hosted | idem, carregadas pelo módulo gerado |
| Itens da lista anti-genérica usados | nenhum declarado (`linear-gradient` só no trilho dos sliders, como valor) | nenhum | nenhum |

**Reutilização em C** (REPORT.md §5 e §10 da versão C):
- Reutilizados: `Button`, `AnimatedNumber`, `useHydrated`, tokens semânticos, pipeline do motor (fontes, CSS gerado), config Playwright.
- Adaptados: `__root` (pt-BR), rota inicial, testes (smoke → atlas), preset Nitro `vercel` → `node-server` para servir localmente.
- Criados: atlas, mapa SVG, legenda térmica, perfil da região, controles, comparação, notas de evidência, modelo de cálculo, rampa térmica (tokens locais).
- Consultados e não usados, com motivo declarado: `Metric` (texto fixo em inglês "Change from baseline", API acoplada a `EvaluationResult`), `BeforeAfter` (sobreposição em proporção de vídeo, rótulos em inglês), `ProcessingFeedback` (sempre compõe indicador + `ProcessTimeline`), padrões editoriais (não se encaixaram na prancha). Vários outros (`ResultPanel`, `Card`, `Grid`, `Legend`, `Expandable`, `FadeIn`…) foram vistos **só pelo índice de exportações**, não pelo código — custo de descoberta (o catálogo do Studio é removido do produto).

Onde a fundação acelerou (evidência de C): inicialização validada em um comando; identidade aplicada e verificada pelo motor (contraste, fontes); `Button` com hidratação; `AnimatedNumber` com pt-BR e reduced motion; sincronização de hidratação para E2E.
Onde restringiu: sem escala sequencial no contrato; strings em inglês fixas em padrões; `BeforeAfter`/`ProcessingFeedback` com formato rígido; preset de build Vercel inadequado para servir localmente; bundle 60 % maior (CSS base de 55 KB e runtime de motion herdados).

## 7. Observações visuais do coordenador (NÃO cegas)

- **B e C convergiram para quase a mesma interface**: mesma paleta, rampa, tipografia, índices 01–07 em mono, hachura na região selecionada, prancha 8/4. As diferenças são menores: C é menos densa (páginas 20–40 % mais altas), rótulos de região menores no mapa em 360 px; B traz cotas de eixo (000–1000) no mapa.
- **A convergiu para o mesmo gênero sem DESIGN.md**: "atlas térmico", papel areia, serifa editorial, rampa teal→âmbar→vermelho, mapa como superfície principal. Diferenças: moldura e cabeçalho escuros, temperaturas rotuladas em todas as regiões (mais direto ao dado), fontes do sistema (aparência varia por SO).
- Nenhuma das três caiu em sidebar administrativa, dashboard de cards, gradientes roxos/azuis, glassmorphism, chatbot ou landing tradicional.

## 8. Auditoria independente (OpenCode)

Leitura estática por `opencode/hy4-flash-free` (relatório completo: `/Users/arthurgoncalves/orca/experiments/isoterma/evaluation/audit/OC-AUDIT.md`; cópia em [`isoterma/OC-AUDIT.md`](isoterma/OC-AUDIT.md)). Sem achados de severidade alta em nenhuma versão.

| Verificação | A | B | C |
|---|---|---|---|
| Fórmulas, teto 60 %, faixa ±40 % | conforme | conforme | conforme |
| Citações/fontes inventadas | nenhuma | nenhuma | nenhuma |
| Nota "fontes não verificadas" + rótulo sintético + "não científico" | sim | sim | sim |
| Anti-genéricas | nenhum uso sustentado | nenhum | nenhum na rota |
| Rampa térmica | 9 faixas próprias | 7 faixas exatas | 7 faixas exatas |
| Achados médios | A1 alvos de toque dos sliders 26 px / polegar 18 px | **B1 mapa continua mostrando "depois" quando o resultado está desatualizado** (só a comparação marca) | **C1 títulos de seção 32–52 px vs 22 px do contrato**; **C2 delta em fonte display, contrato pede mono** |
| Achados baixos | A2 literais de cor; A3 +0,3 °C no Parque Linear (efeito do briefing) | B2 `aria-disabled` sem desabilitar; B3 risco de hidratação (não reproduzido: 0 erros de console no harness); B4 literais duplicando tokens | C3 filete de erro 3 px vs hairline; C4 `scaleMax = 6` literal; C5 teste de toque relatado mas não versionado; C6 espaçamentos absolutos fora de `--space-unit` |

Leituras relevantes para a hipótese:
- **B1 escapou do harness**: o teste de "desatualizado" só procura o texto, e B o exibe na comparação. Falha real de estado em B, não detectada automaticamente.
- **C1/C2 indicam que o motor não garante fidelidade ao DESIGN.md na camada do produto**: ele gera e valida tokens, mas o CSS autoral de C contrariou a escala de título e a regra de numerais mono. B, traduzindo à mão, seguiu esses dois pontos.
- Fidelidade de tokens de cor: C (gerado) > B (literais duplicados em 4 pontos) > A (sem contrato).

## 9. Respostas

**1. O DESIGN.md isolado melhora a consistência?** Sim, como contrato de identidade entre implementações: B (traduzido à mão) e C (gerado pelo motor) produziram identidades praticamente iguais a partir do mesmo arquivo, enquanto A escolheu fontes dependentes do sistema e uma paleta própria. A consistência interna de cada app não difere de forma mensurável (as três passaram nos mesmos testes); não há métrica de consistência visual além da inspeção. O ganho do DESIGN.md é **determinismo e portabilidade** da identidade — e ele funcionou sem o motor (B). Nuance da auditoria (§8): o motor garantiu tokens de cor/fonte sem literais duplicados (C), mas não impediu desvios do contrato no CSS autoral (C1 escala de título, C2 numerais mono), que B, traduzindo à mão, respeitou.

**2. O Genesis completo aumenta a velocidade?** **Não foi observado.** Preparação: 46 s (C) vs 43–48 s (A/B). Total: A 7:16 < C 8:40 < B 10:17. Com n = 1 por versão, diferenças de 1–3 min estão dentro do ruído. Para este modelo e esta escala de tarefa, montar a stack não é o gargalo, e o orçamento (75 min) não chegou a pressionar nenhuma versão (< 10 % usado). O experimento **não sustenta** a parte "velocidade" da hipótese.

**3. O Genesis completo melhora a qualidade visual?** **Indeterminado até a avaliação humana cega.** O que a evidência já mostra: C ≈ B visualmente, e C usou só 3 peças de UI do Genesis; portanto, qualquer diferença de qualidade entre A e {B, C} é atribuível ao DESIGN.md (e ao mesmo modelo), não aos componentes. Em acessibilidade/estados/responsividade as três empataram no harness.

**4. Os componentes existentes restringem a criatividade?** Não restringiram a composição — o worker de C ignorou os que não encaixavam e construiu a prancha livremente sobre os tokens. Restringiram por **adequação**: strings em inglês fixas, `BeforeAfter` voltado a mídia, `ProcessingFeedback` rígido, ausência de escala sequencial. O efeito prático foi baixo reuso, não uniformização.

**5. Quais capacidades ainda faltam?** (i) escalas sequenciais/divergentes no contrato DESIGN.md (`genesis`); (ii) padrões sem texto fixo e com rótulos/locale por props (pt-BR por padrão); (iii) comparação numérica antes/depois com delta assinado e faixa; (iv) primitiva de slider/range com valor e unidade; (v) visualização espacial acessível genérica (regiões SVG selecionáveis por teclado + legenda por faixas) — candidata, não domínio; (vi) descoberta no produto (índice de componentes com exemplos, já que o Studio sai no `genesis:new`); (vii) preset local `node-server` e script `serve` no `genesis:new`; (viii) orçamento de bundle (C carrega +73 KB gzip sem usar).

**6. A fundação está pronta para um tema desconhecido?** **Parcialmente.** O pipeline de identidade (DESIGN.md → validação → tokens → fontes) e o `genesis:new` funcionaram na primeira tentativa, em 46 s, com testes verdes — essa parte está pronta. A camada de componentes/padrões contribuiu pouco para um tema espacial/científico e não trouxe ganho de velocidade mensurável. A proposta de valor demonstrada hoje é "identidade validada + scaffold testado", não "biblioteca que acelera telas de domínio".

## 10. Limitações da comparação

- n = 1 por versão; sem repetições nem intervalo de confiança. Diferenças de minutos não são conclusivas.
- O mesmo modelo escreveu as três versões; seus vieses convergem (A chegou ao mesmo gênero visual sem direção). Isso mede "Genesis + este modelo", não Genesis em geral.
- Esforço de raciocínio: o padrão da sessão (A relata "baixo"; B/C não expõem). Igual para as três, mas não verificado nominalmente.
- A tarefa foi pequena demais para o modelo (< 10 % do orçamento): não testa pressão de tempo, várias telas nem iteração com feedback humano — cenários em que uma fundação tende a pesar mais.
- O coordenador escreveu briefing, DESIGN.md e harness e conhece o Genesis (risco de viés). Mitigações: harness pré-registrado e só com nomes acessíveis; mesmos documentos; pacote cego para humanos.
- Briefing muito detalhado (fluxo, estados, fórmula, contrato de nomes) reduz o espaço de diferenças.
- Defeito do briefing: `min(copa + Δ, 60)` gera +0,33 °C no Parque Linear (copa 63 %) quando outra intervenção é aplicada. As três versões detectaram e explicaram na interface.
- Tempos auto-relatados pelos workers (conferidos com horários de commit). Execução simultânea das três sessões na mesma máquina.
- Somente Chromium, viewport emulado; sem dispositivo físico nem leitor de tela real.
- Heurística de foco do harness gerou falso negativo em A/B (corrigido por inspeção visual, sem alterar o harness).
- A retrospectiva de reúso de C (§10 do REPORT de C) é post hoc.
- Auditoria OpenCode estática, feita por modelo gratuito (`hy4-flash-free`; `deepseek`/`mimo` com "Free usage limit reached" no probe da sessão). O harness não detectou a falha B1 (estado desatualizado no mapa).

## 11. Recomendações para a fundação (não aplicadas — aguardam avaliação humana)

1. Adicionar `genesis.scales` (sequencial/divergente, com validação de contraste por passo) ao contrato do motor.
2. Varrer padrões por strings fixas; aceitar rótulos por props e definir locale pt-BR por padrão.
3. Generalizar `Metric`/`BeforeAfter` para comparação numérica (antes, depois, delta assinado, faixa), desacoplada de `EvaluationResult`.
4. Adicionar uma primitiva de range acessível (valor, unidade, passo, limites explicados).
5. Avaliar um padrão genérico de "regiões SVG selecionáveis + legenda por faixas" somente se outro tema também pedir (evitar domínio inventado).
6. `genesis:new`: gerar script `serve` e preset `node-server` para execução local; manter Vercel só no build de deploy.
7. Manter no produto um índice de componentes com exemplos (o catálogo some no clone e o custo de descoberta levou a não usar componentes).
8. Medir o peso herdado (CSS base 55 KB, runtime de motion) e permitir tree-shaking por padrão.
9. Reexecutar o experimento com n ≥ 3, uma tarefa multi-tela com orçamento apertado, e pelo menos um segundo modelo, antes de afirmar ganho de velocidade.
10. Reaproveitar o harness pré-registrado por nomes acessíveis como kit de avaliação de produtos — e fortalecê-lo: estado "desatualizado" deve verificar o mapa/atributos, não só o texto (B1 passou); foco SVG deve aceitar `stroke`.
11. Adicionar ao `design:check` (ou a um lint de produto) uma verificação de conformidade do CSS autoral com eixos do contrato (escala de títulos, numerais mono, espessura de bordas, espaçamento derivado de `--space-unit`), já que tokens corretos não impediram C1/C2/C3/C6.

## 12. Avaliação humana cega (pendente)

Pacote: `/Users/arthurgoncalves/orca/experiments/isoterma/evaluation/blind/{X,Y,Z}/` — 8 capturas por versão (1440 inicial/resultado/limitações/erro, 768 inicial/resultado, 360 inicial/resultado) e `demo-1440.webm`. A chave X/Y/Z → A/B/C está em `coordination/blind-key.json` (SHA-256 `717aa310…dfa5517`), gerada com aleatoriedade do sistema e **não aberta pelo coordenador**. Avaliar antes de ler as seções 7–9.

| Critério | Peso | X | Y | Z |
|---|---|---|---|---|
| Originalidade visual | 20 % | | | |
| Adequação ao problema | 20 % | | | |
| Composição | 15 % | | | |
| Interatividade e motion | 15 % | | | |
| Consistência | 10 % | | | |
| Velocidade | 10 % | usar §4 após revelar a chave | | |
| Responsividade e acessibilidade | 10 % | empate no harness (§5); ajustar por inspeção | | |

Sugestão: notas 1–5 por avaliador, ≥ 2 avaliadores independentes, revelar a chave só depois de consolidar.

## 13. Artefatos e reprodução

- Versões executáveis: `/Users/arthurgoncalves/orca/experiments/isoterma/version-{a,b,c}/app` → `bun install && bun run build && bun run serve` (portas 3201/3202/3203). Relatórios: `version-*/REPORT.md`.
- Capturas identificadas e vídeos: `/Users/arthurgoncalves/orca/experiments/isoterma/evaluation/out/{a,b,c}/` (abrir após a avaliação cega).
- Materiais versionados aqui: [`isoterma/`](isoterma/) — BRIEF, PROTOCOL, DESIGN.md, ENVIRONMENT por versão, gerador de dados, harness e script de avaliação.
- Dados: `python3 -I isoterma/make_data.py saida.json` reproduz o JSON (seed fixa).

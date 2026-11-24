# Auditoria documental e análise de critérios de aceitação — Fase 00 (P00-OC-01)

**Objetivo:** auditar inconsistências, ambiguidades, riscos de confiabilidade e lacunas do pacote de planejamento, e avaliar se os gates 01–07 são objetivamente verificáveis.

**Método e limites:** somente leitura; nenhum arquivo existente foi alterado; nenhuma instalação, chamada de rede ou código foi produzido. Citação no formato `arquivo:linha`. Revisão é autorrevisão (limitação declarada conforme `AGENTS.md:20`). O tema é desconhecido (`AGENTS.md:6`, `docs/product/CHALLENGE.md:1`); nenhum domínio foi inventado. Versões, preços, quotas e compatibilidades não foram testados neste pacote (`docs/BLUEPRINT.md:33`).

---

## 1. Inconsistências e contradições entre documentos

| ID | Arquivos:linhas | Descrição | Severidade | Resolução sugerida |
|---|---|---|---|---|
| I-01 | `docs/design/DESIGN-SYSTEM.md:6`; `docs/ROADMAP.md:9`, `docs/ROADMAP.md:25` | Temas claro/escuro são condicionais ("se implementados"), mas o gate 02 exige "troca de tema/fonte centralizada" e a DoD exige "alterar tema em arquivo central". O gate cobre o que o guia permite não fazer. | alta | Decidir explicitamente se troca de tema é P0 obrigatório; se for, remover o "se implementados" de `docs/design/DESIGN-SYSTEM.md:6` e nomear o arquivo central no gate. |
| I-02 | `prompts/01-execute-phase.md:5`; `docs/ROADMAP.md:7`; `docs/architecture/decisions/0000-template.md:1-10`; `docs/STATUS.md:13` | A execução de fase exige "ADRs aceitos" e o gate 00 exige "ADR de versões", mas só existe o template vazio; STATUS registra ADR como próximo passo. Não há decisão aceita para balizar a fase 01. | alta | Registrar ADR(s) de stack/versões com status "aceito" e aprovação humana antes de autorizar a fase 01; atualizar STATUS. |
| I-03 | `docs/ROADMAP.md:10`; `docs/design/DESIGN-SYSTEM.md:9`; `docs/engineering/EVIDENCE.md:5` | O gate 03 exige "padrões de resultados", porém `ResultPanel`/`EvidencePanel` e afins estão classificados como P1 no catálogo e como "opcionais" em evidências. Escopo do gate maior que o escopo declarado. | média | Trazer os padrões de resultado necessários para P0 no gate 03 ou rebaixar o gate para "estados de resultado" sem exigir os componentes P1. |
| I-04 | `docs/design/DESIGN-SYSTEM.md:9`; `docs/engineering/EVIDENCE.md:5` | Mesma família, nomes divergentes: `ResultPanel` no catálogo vs `ResultInspector` em evidências. Pode gerar dois componentes ou nenhum. | média | Escolher um nome canônico e referenciá-lo nos dois documentos; o outro vira alias documentado ou é removido. |
| I-05 | `docs/BLUEPRINT.md:13`; `docs/engineering/INTELLIGENCE.md:6` | Blueprint pede "fallback independente somente se testado"; Inteligência pede "testar modelo principal e fallback compatível". "Independente" (outro provedor) e "compatível" (mesmo provedor, outro modelo) são estratégias diferentes de contingência. | média | Explicitar se o fallback deve ser outro provedor; se for, apenas "compatível" não atende. Registrar em ADR. |
| I-06 | `docs/strategy/COMPETITION.md:3`; `prompts/00-master.md:9` | O evento de interesse é `https://www.hackiabrasil.com/`, e o mesmo kit alerta para não confundir com "Hack Brasil, evento distinto". A similaridade dos nomes torna ambígua a identidade do evento. | média | Registrar nome oficial, URL e fonte/data da confirmação no CHALLENGE (`docs/product/CHALLENGE.md:2-3`) antes de qualquer pergunta à organização. |
| I-07 | `docs/strategy/PLAYBOOK.md:9`; `docs/strategy/COMPETITION.md:3` | Planejamento usa "seis horas úteis (hipótese)", enquanto duração do evento/pitch está confirmada como desconhecida. Cronograma e percentuais dependem de premissa não validada. | média | Marcar a hipótese como premissa a confirmar e fornecer versão de 3h e 6h no PLAYBOOK até a confirmação. |
| I-08 | `docs/ROADMAP.md:8`; `docs/BLUEPRINT.md:12`; `docs/engineering/CONTRACTS.md:14`; `docs/STATUS.md:6` | Convex é "opcional no arranque", mas o gate 01 exige "conexão Convex real quando credenciais disponíveis"; STATUS diz credenciais não configuradas. A condição sobre credenciais pode tornar o gate vazio sem registrar bloqueio. | média | Separar critério obrigatório (scaffold e build) de critério condicional (integração real), com estado explícito "bloqueado" quando não houver credencial. |
| I-09 | `README.md:15-17`; `docs/ROADMAP.md:8`; `docs/STATUS.md:5` | README anuncia sete scripts `bun run ...` sob o título "ainda inexistentes" e o gate 01 cobra "dev, build, check/typecheck e smoke", mas não há `package.json`, lockfile nem `scripts/` com conteúdo no repositório. | média | Criar `package.json` com os scripts reais na fase 01 e substituir a lista "previstos" por nomes confirmados; STATUS deve registrar versões/lockfile. |
| I-10 | `docs/STATUS.md:3`, `docs/STATUS.md:13`; `docs/ROADMAP.md:7` | STATUS declara "Fase atual: 00 (não iniciada)" e gate 00 "Pendente" enquanto a própria auditoria da fase 00 está em execução. Fonte de verdade da progresso desatualizada. | baixa | Atualizar STATUS para "em andamento" com a evidência desta auditoria ao registrar o checkpoint. |
| I-11 | `README.md:16`; `docs/engineering/OPERATIONS.md:3`; `docs/BLUEPRINT.md:14` | `check` e `typecheck` são listados como comandos distintos, e CI executa ambos, mas o que cada um cobre (Biome vs compilador TS) não é definido em nenhum documento. | baixa | Definir na ADR: `check` = lint/format (Biome) e `typecheck` = TS strict, com comandos e saídas esperadas. |
| I-12 | `docs/BLUEPRINT.md:18`; `src/README.md:2`; `README.md:16`, `README.md:19-26` | Blueprint usa `src/routes/` mas lista as demais fronteiras sem prefixo (`core/`, `design-system/`, `studio/`), enquanto a árvore real concentra tudo sob `src/`; o mapa do README também omite `src/routes/`. | baixa | Padronizar todos os caminhos com prefixo `src/` e atualizar o mapa do README. |
| I-13 | `docs/ROADMAP.md:10`; `docs/engineering/CONTRACTS.md:5` | Gate 03 nomeia quatro estados (loading/empty/error/success); o contrato `ExecutionStatus` define cinco (`idle`, `running`, `completed`, `failed`, `cancelled`). "empty" e "cancelled" não têm correspondência explícita. | baixa | Mapear estados do contrato para estados de UI (ex.: `completed` + dado vazio => empty; `cancelled` => feedback próprio) no contrato. |

---

## 2. Ambiguidades e termos não definidos

| ID | Termo / referência | Onde aparece | Por que é ambíguo | Resolução sugerida |
|---|---|---|---|---|
| A-01 | `product.css` | `docs/design/FIGMA-WORKFLOW.md:10` | Caminho citado uma única vez, sem definição em nenhum outro arquivo; os tokens são descritos de forma abstrata em `docs/design/DESIGN-SYSTEM.md:6` e o diretório planejado é `design-system/tokens` (`docs/BLUEPRINT.md:18`). Não há arquivo `product.css` no repositório. | Definir o caminho canônico do arquivo de tokens e o esquema de mapeamento token → variável CSS no handoff do Figma. |
| A-02 | Scripts prometidos | `README.md:15-17` | `bun run dev/build/check/typecheck/test/test:e2e/bench` são "previstos (ainda inexistentes)"; `docs/STATUS.md:5` diz versões/lockfile não escolhidos; nenhum `package.json` existe na árvore. | Implementar e documentar na fase 01; até lá, tratar como nomes pretendidos, nunca como comandos que funcionam. |
| A-03 | "smoke" | `docs/ROADMAP.md:8`; `docs/engineering/OPERATIONS.md:3`; `docs/engineering/CONTRACTS.md:14` | Não se define se "smoke" é rota HTTP, teste E2E ou teste de persistência isolada; as três menções podem significar coisas diferentes. | Unificar: "smoke route" = rota mínima; "smoke test" = teste automatizado que a consome; "smoke de persistência" = teste isolado removível. |
| A-04 | "pares relevantes" | `docs/ROADMAP.md:9` | AA é definido em `docs/design/DESIGN-SYSTEM.md:15` (4.5:1 / 3:1), mas quais pares de tokens auditar não é enumerado. | Publicar lista fechada de pares (text/background, on-primary/primary, focus/surface etc.) no artefato de tokens. |
| A-05 | "catálogo enxuto" | `docs/ROADMAP.md:9` | Catálogo P0 tem 24 itens em `docs/design/DESIGN-SYSTEM.md:9`; "enxuto" não indica subconjunto nem critério de corte. | Declarar explicitamente quais primitivos P0 compõem o corte da fase 02. |
| A-06 | "conexão Convex real quando credenciais disponíveis" | `docs/ROADMAP.md:8` | Não diz quais credenciais, nem o que conta como "real" (query? mutation? deploy?), nem qual o estado do gate sem elas (`docs/STATUS.md:6`). | Ver I-08: critério condicional com registro obrigatório de bloqueio. |
| A-07 | "interação funcional" | `docs/ROADMAP.md:10` | Sem definição de ação, resultado observável ou critério de passagem; `docs/design/MOTION.md:5` lista presets, mas não os critérios. | Definir: cada preset responde a ação de usuário e altera estado verificável sem bloquear cliques (`docs/design/MOTION.md:7`). |
| A-08 | "natureza distinta" / "como meta" | `docs/ROADMAP.md:14`; `docs/strategy/PLAYBOOK.md:13` | Categorias dos dois desafios não são nomeadas no gate (o PLAYBOOK sugere exemplos em `:13`), e "meta" não diz se 45 min é requisito de passagem. | Definir categorias e separar "meta atingida" de "registro obrigatório com causa do atraso". |
| A-09 | "conforme viabilidade" | `docs/engineering/OPERATIONS.md:3` | Smoke E2E no CI fica a critério de quem executa; gate 06 exige "build e E2E" (`docs/ROADMAP.md:13`) sem condicional. | Tornar o E2E obrigatório no gate 06 e usar "conforme viabilidade" apenas para ajustes de tempo. |
| A-10 | "se necessário" generalizado | `docs/BLUEPRINT.md:12`, `docs/BLUEPRINT.md:13`; `docs/design/DESIGN-SYSTEM.md:9`; `docs/ROADMAP.md:11`; `docs/engineering/INTELLIGENCE.md:12` | Upload, Convex, fallback, FileUpload e receitas ficam condicionais sem gatilho objetivo; difícil decidir o que é P0 no dia do evento. | Cada "se necessário" deve virar uma pergunta com resposta no PRODUCT-BRIEF (`docs/product/PRODUCT-BRIEF.md:2-11`) após o tema. |
| A-11 | Convenção `VITE_CONVEX_URL` | `.env.example:1-4`; `docs/BLUEPRINT.md:10` | O arquivo diz "use the integration's actual convention" e alerta que segredos não devem usar `VITE_`, mas a convenção real do TanStack Start não foi verificada (`docs/BLUEPRINT.md:33`). | Confirmar na fase 00 e registrar na ADR; corrigir `.env.example` se o prefixo estiver errado. |
| A-12 | "dispositivo real" | `docs/design/MOTION.md:3` | Nenhum dispositivo, navegador ou método de medição é especificado. | Listar dispositivo(s)/navegador(es) alvo e comando de medição no plano de evidências. |
| A-13 | "aprovação humana" | `docs/ROADMAP.md:7`; `prompts/00-master.md:16` | Não define artefato, aprovador nem registro; "validado" depende de evidência (`docs/STATUS.md:15`). | Exigir ADR assinada/aceita com responsável e data (`docs/architecture/decisions/0000-template.md:10`). |
| A-14 | "feature freeze" | `docs/strategy/PLAYBOOK.md:10`; `docs/product/MVP-SCOPE.md:8` | PLAYBOOK diz "antes da última janela" sem horário; o campo do MVP-SCOPE está em branco. | Preencher horário absoluto no MVP-SCOPE no início do evento. |
| A-15 | "requisitos obrigatórios" / critérios oficiais | `docs/product/CHALLENGE.md:4-5`; `docs/strategy/COMPETITION.md:6` | Existe template, mas sem fonte/data da resposta da organização não há como saber se o planejamento é válido. | Registrar pergunta, canal, responsável, fonte e timestamp no CHALLENGE. |

---

## 3. Análise dos critérios de aceitação por fase (ROADMAP 01–07)

Legenda: **verificável** = passa/falha objetivo com evidência; **parcial** = parte mensurável, parte subjetiva; **não verificável** = depende só de interpretação.

### Fase 01 — gate em `docs/ROADMAP.md:8`
**Veredito: parcial.** "dev, build, check/typecheck" nomeia comandos, mas não define saída; "instalação reproduzível" não tem procedimento; "smoke" é ambíguo (A-03); a conexão Convex é condicional (I-08).

**Reescrita proposta:**
1. A partir de clone limpo sem `node_modules`, `bun install --frozen-lockfile` (ou comando real confirmado na ADR) termina com exit code 0, gera lockfile versionado e é repetível em segundo ambiente com o mesmo hash do lockfile.
2. `bun run dev` serve a smoke route em porta documentada; `GET /` responde 200 e contém marcação identificável da rota.
3. `bun run build`, `bun run check`, `bun run typecheck` e `bun run test` terminam com exit code 0, sem erros; saídas reais coladas no STATUS (`docs/STATUS.md:11-13`).
4. Persistência: com credenciais de deployment de teste presentes no ambiente local, uma query/mutation isolada grava e lê um valor; sem credenciais, STATUS registra "bloqueado" e o subcritério fica "não validado", sem aprovar o gate inteiro.

### Fase 02 — gate em `docs/ROADMAP.md:9`
**Veredito: parcial.** "360/768/1440" é objetivo; AA tem limiares em `docs/design/DESIGN-SYSTEM.md:15`; "troca centralizada", "teclado", "foco" e "pares relevantes" não são mensuráveis (I-01, A-04, A-05).

**Reescrita proposta:**
1. Alterar **um único arquivo** de tokens alterna tema e fonte display/body/mono em todos os primitivos do corte P0; teste automatizado falha se qualquer componente contiver cor/fonte literal; capturas antes/depois arquivadas.
2. Cada primitivo do corte P0 é operável por Tab/Shift+Tab/Enter/Espaço/Esc, com indicador de foco visível de contraste ≥ 3:1 e sem armadilha de foco; um teste de teclado por primitivo.
3. Em 360, 768 e 1440 px, `document.scrollWidth <= document.documentElement.clientWidth` nas páginas do catálogo, sem corte de conteúdo; capturas por largura.
4. Lista fechada de pares de tokens atinge ≥ 4.5:1 para texto normal e ≥ 3:1 para texto grande e controles; relatório do script com cada par e valor.

### Fase 03 — gate em `docs/ROADMAP.md:10`
**Veredito: parcial.** "Reduced motion" pode ser testado por media query; "sem overflow", "estados" e "interação funcional" carecem de critério (A-07, I-03, I-13).

**Reescrita proposta:**
1. Com `prefers-reduced-motion: reduce` emulado, nenhum preset de `docs/design/MOTION.md:5` produz movimento contínuo; teste com a media query passa.
2. Mesmo critério de overflow da fase 02 aplicado a todos os layouts e padrões de resultado.
3. Para cada padrão de resultado no escopo acordado (I-03), os estados `running`, `completed` com dado vazio, `failed` e `completed` com dado são renderizados e identificáveis por teste; `cancelled` tem feedback próprio (I-13).
4. Cada preset P0 responde a ação de usuário com mudança de estado observável; nenhum clique é bloqueado por transição (`docs/design/MOTION.md:7`).

### Fase 04 — gate em `docs/ROADMAP.md:11`
**Veredito: parcial.** "sem segredo no bundle" é verificável por varredura; modalidades e limites não são quantificados; teste real depende de autorização (`AGENTS.md:10`).

**Reescrita proposta:**
1. Mock de IA declarado com rótulo explícito de fixture; nenhum resultado de mock é apresentado como execução real (`AGENTS.md:9`, `docs/engineering/OPERATIONS.md:9`).
2. Com chave no ambiente local e autorização registrada, uma chamada real por modalidade P0 (texto, streaming, objeto validado, tool call; `docs/engineering/INTELLIGENCE.md:6`) retorna resposta; sem autorização, subcritério = "bloqueado".
3. Cada chamada tem timeout com valor padrão documentado, cancelamento que aborta a requisição (teste de abort), limite de entrada/saída e orçamento por execução; um teste por mecanismo.
4. Varredura do bundle de produção por valores de `.env` (ex.: `OPENROUTER_API_KEY`, `.env.example:5`) retorna zero ocorrências; chaves apenas em código server-only.

### Fase 05 — gate em `docs/ROADMAP.md:12`
**Veredito: parcial.** Campos `metric/value/unit/sampleSize/baseline` existem em `docs/engineering/CONTRACTS.md:8` e requisitos de registro em `docs/engineering/EVIDENCE.md:3`, mas "reproduzível", tamanho de amostra e "isolada" não são definidos.

**Reescrita proposta:**
1. Duas execuções do runner sobre a mesma fixture produzem JSON/CSV com o mesmo conjunto de campos e diferença dentro de tolerância declarada; dataset/fixture, versão do código, configuração, baseline, unidade, amostra, duração, resultados brutos e limitações são gravados (`docs/engineering/EVIDENCE.md:3`).
2. Toda entrada contém `metric`, `value`, `unit`, `sampleSize` e `baseline` (`docs/engineering/CONTRACTS.md:8`); amostra mínima (ex.: 10 repetições) declarada antes da medição; erros são registrados como erros, não removidos.
3. Uma receita de `docs/engineering/INTELLIGENCE.md:12` traz todos os campos exigidos e roda com sucesso; após remover sua pasta, build e testes continuam passando (prova de isolamento).

### Fase 06 — gate em `docs/ROADMAP.md:13`
**Veredito: parcial.** Negação de acesso ao Studio é observável, mas rotas não são nomeadas; "CI sem segredos" e "E2E" não têm escopo; há conflito com "conforme viabilidade" (A-09).

**Reescrita proposta:**
1. Em build de produção servido localmente, toda rota do Studio — incluindo acesso direto por URL — responde 404 ou redirect; teste E2E automatiza a tentativa direta.
2. Workflow de CI referencia apenas variáveis públicas; nenhuma chave de API em arquivos ou secrets do repositório; execução em fork não vaza config nem falha por chave ausente (`docs/engineering/OPERATIONS.md:4`, `docs/engineering/OPERATIONS.md:7`).
3. CI executa `bun run build` e `bun run test:e2e` com exit code 0; o fluxo E2E cobre smoke route, uma interação do catálogo e a negação do Studio; catálogo é integrado, não duplicado (`docs/ROADMAP.md:13`).

### Fase 07 — gate em `docs/ROADMAP.md:14`
**Veredito: não verificável como gate.** "Natureza distinta" é vago, "em até 45 min cada como meta" é aspiração explícita, e "registrar tempos, falhas, correções" não tem artefato nem esquema.

**Reescrita proposta:**
1. Dois desafios de categorias pré-definidas (ex.: documento com evidências e multimodal com ferramenta, `docs/strategy/PLAYBOOK.md:13`), cada um com entrada, saída e critério de sucesso escritos **antes** de iniciar o cronômetro.
2. Cada simulação registra `inicio`, `fim`, `duracao_min`, `falhas`, `correcoes`; `duracao_min <= 45` é "meta atingida", `> 45` é "meta não atingida com causa documentada". O gate passa se o registro completo existir — não se o tempo for cumprido.
3. Demo local roda sem rede usando fixtures rotuladas (`docs/engineering/OPERATIONS.md:8`); cada simulação ocorre em worktree descartável, registrando-se o commit de origem (`AGENTS.md:18`).

**Resumo dos vereditos:** 01 parcial · 02 parcial · 03 parcial · 04 parcial · 05 parcial · 06 parcial · 07 não verificável. Nenhum gate 01–07 é integralmente objetivo no formato atual; o problema dominante é a ausência de comandos, limiares e artefatos de evidência.

---

## 4. Riscos de confiabilidade encontrados nos documentos

| Risco | Citação | Natureza | Mitigação prevista / pendente |
|---|---|---|---|
| Coordenador único controla `package.json`, lockfile, rotas, tokens e merges — gargalo e ponto único de falha humano. | `docs/ROADMAP.md:17`; `prompts/01-execute-phase.md:5` | SPOF de integração | Worktrees e paralelismo são previstos (`AGENTS.md:18`), mas sem plano de substituto do coordenador. |
| Convex como dependência externa de persistência; credenciais não configuradas. | `docs/BLUEPRINT.md:12`; `docs/STATUS.md:6`; `docs/engineering/OPERATIONS.md:5` | Serviço externo | Contingência "banco -> modo local apenas se implementado" (`docs/engineering/OPERATIONS.md:8`) — ainda não implementado. |
| Preço, quota, compatibilidade e versões de toda a stack não testados. | `docs/BLUEPRINT.md:33`; `docs/STATUS.md:5` | Incerteza de planejamento | Fase 00 deve verificar e registrar (`docs/BLUEPRINT.md:33`, `prompts/00-master.md:9`). |
| OpenRouter é provider comunitário e o fallback pode ser do mesmo provedor. | `docs/BLUEPRINT.md:13`; `docs/engineering/INTELLIGENCE.md:6` (I-05) | SPOF de IA / cota | "Fallback independente" exigido no blueprint, mas não garantido pela definição de "compatível". |
| Créditos de Figma ~3.000, saldo e custo por operação não verificados. | `docs/design/FIGMA-WORKFLOW.md:3`; `prompts/00-master.md:6` | Quota/custo externo | Não gastar sem autorização; guardar créditos para o tema real. |
| Regras do evento, reutilização de código e duração do pitch desconhecidas — risco de todo o kit ser inutilizável. | `docs/strategy/COMPETITION.md:3`, `docs/strategy/COMPETITION.md:6`; `README.md:13`; `docs/STATUS.md:7` | Risco legal/regulatório | Gate de conformidade e "se incerto, não reutilizar" (`docs/strategy/COMPETITION.md:6`); sem responsável ou prazo definido (A-15). |
| Deploy em Vercel/Convex Cloud depende de contas, custos e autorização. | `docs/BLUEPRINT.md:14`, `docs/BLUEPRINT.md:21`; `docs/engineering/OPERATIONS.md:4` | Serviço externo / custo | Contingência "falha deploy -> local" (`docs/engineering/OPERATIONS.md:8`); modo local sem rede após instalação (`docs/BLUEPRINT.md:21`). |
| IA e persistência offline **não** são prometidas; dependência de rede permanece se não houver implementação própria. | `docs/BLUEPRINT.md:21`; `docs/engineering/OPERATIONS.md:5`, `docs/engineering/OPERATIONS.md:8` | Dependência de rede | Demo gravada/fixtures rotuladas como Plano B (`docs/product/DEMO-SCRIPT.md:8`, `docs/engineering/OPERATIONS.md:8`). |
| CI em GitHub Actions depende de disponibilidade externa e é habilitado "após build local". | `docs/BLUEPRINT.md:14`; `docs/engineering/OPERATIONS.md:3` | Serviço externo | Não há plano alternativo de CI documentado. |
| Sem lockfile, instalação não é reproduzível hoje. | `docs/STATUS.md:5`; `AGENTS.md:12` | Reprodutibilidade | Exigência de lockfile no protocolo; a ser satisfeita na fase 01. |
| Modelos patrocinados e uso de IA no evento dependem de regras não confirmadas. | `docs/strategy/COMPETITION.md:6`, `docs/strategy/COMPETITION.md:9` | Regulatório/custo | Pergunta à organização prevista, sem owner ou canal (A-15). |

---

## 5. Lacunas — o que o dia do hackathon precisa e nenhum documento cobre

| ID | Lacuna | Evidência da ausência | Impacto |
|---|---|---|---|
| G-01 | ADR de stack/versões aceita, com evidência, alternativa, impacto e aprovação. | Só existe template (`docs/architecture/decisions/0000-template.md:1-10`); STATUS aponta ADR como próximo passo (`docs/STATUS.md:13`); fase 01 exige "ADRs aceitos" (`prompts/01-execute-phase.md:5`). | Bloqueia a fase 01. |
| G-02 | `package.json`, lockfile e scripts reais com nomes, comandos e saídas esperadas. | `README.md:15-17` marca scripts como inexistentes; `docs/STATUS.md:5`; nenhum `package.json` na árvore (I-09). | Bloqueia gates 01, 04, 05 e 06. |
| G-03 | Definição e caminho do arquivo de tokens do produto (`product.css`). | `docs/design/FIGMA-WORKFLOW.md:10` cita uma vez; sem definição em `docs/design/DESIGN-SYSTEM.md:6` ou `docs/BLUEPRINT.md:18` (A-01). | Handoff do Figma chega sem destino de tokens. |
| G-04 | Nomes/responsáveis reais e mapa arquivo→owner para o dia do evento. | `docs/strategy/PLAYBOOK.md:7` descreve papéis genéricos; `docs/product/MVP-SCOPE.md:5` está em branco. | Tarefas paralelas não podem ser atribuídas com "um responsável por arquivo" (`AGENTS.md:18`). |
| G-05 | Questionário, canal, responsável e prazo para a pergunta à organização. | `docs/strategy/COMPETITION.md:6` lista perguntas; `prompts/00-master.md:9` pede a pergunta; nenhum owner/meio registrado (A-15). | Regras de reutilização podem ficar indefinidas até o início. |
| G-06 | Artefato único de registro da simulação (tempos, falhas, correções, commit, categoria). | `docs/ROADMAP.md:14` e `docs/strategy/PLAYBOOK.md:13` pedem registro, mas não nomeiam arquivo nem campos (A-08). | Gate 07 não gera evidência consistente. |
| G-07 | Inventário de assets e licenças com caminho definido. | Exigido em `AGENTS.md:11`, `docs/design/FIGMA-WORKFLOW.md:13`, `docs/product/BRAND-BRIEF.md:10`, `docs/engineering/OPERATIONS.md:9`; nenhum arquivo inventário existe. | Risco de violar regras de origem/licença no dia da entrega. |
| G-08 | Momento de demonstração travado por escrito antes do código. | `docs/strategy/COMPETITION.md:16` manda definir antes; `docs/product/DEMO-SCRIPT.md:5` está em branco. | Risco de construir algo não demonstrável (anti-genericidade em `docs/strategy/COMPETITION.md:12`). |
| G-09 | Horário de feature freeze e plano de corte com gatilho temporal. | `docs/strategy/PLAYBOOK.md:10` fala em "última janela"; `docs/product/MVP-SCOPE.md:8` em branco (A-14). | Decisões de corte no calor do evento ficam subjetivas. |
| G-10 | Ferramenta/comando de auditoria de acessibilidade e contraste. | `docs/design/DESIGN-SYSTEM.md:15` define metas e snapshots, mas `docs/engineering/EVIDENCE.md:5` só cita Vitest/Playwright; nenhum auditor nomeado (A-04). | Gate 02 pode ser "validado" sem medição real. |
| G-11 | Plano de scaffold alternativo se o tema exigir CLI/científico/sem IA. | `docs/BLUEPRINT.md:4` diz que a stack não deve impedir esses formatos; `prompts/00-master.md:9` pede scaffold único; `docs/ROADMAP.md:8` fixa TanStack Start. | Risco de descartar o melhor mecanismo por inércia de stack. |
| G-12 | Procedimento de rollback/ descarte de worktree e política de merge. | `AGENTS.md:18`, `docs/ROADMAP.md:14`, `docs/strategy/PLAYBOOK.md:13` citam worktrees descartáveis; sem passos concretos de criação/limpeza. | Perda de trabalho ou acidente de merge no dia do evento. |
| G-13 | Runbook do próprio Orca/orquestração e verificação de capacidades. | `prompts/00-master.md:18` diz não supor função de orquestração sem verificar; `README.md:8` orienta colar prompt em sessão; nada documentado sobre native orchestration. | Coordenador e workers podem assumir ferramentas inexistentes. |
| G-14 | Lista de dispositivos/navegadores e método de medição de performance real. | `docs/design/MOTION.md:3` pede medição em dispositivo real; sem alvo definido (A-12). | Requisito de "desempenho" fica não verificável. |
| G-15 | Planilha/formulário do scorecard oficial com os pesos. | `docs/strategy/COMPETITION.md:9` descreve pesos (soma 100) e meta 80/100; nenhum artefato preenchível existe. | Avaliação da ideia no PLAYBOOK (`docs/strategy/PLAYBOOK.md:4`) não gera registro comparável. |
| G-16 | Procedimento de rodízio/rotação de chaves e regime de segredos no Orca local. | `docs/engineering/OPERATIONS.md:4` diz rotacionar se expostas e não enviar chaves por prompt; sem passo a passo. | Vazamento acidental ou bloqueio de integração no dia do evento. |

---

## 6. Constatações consolidadas

- 13 inconsistências mapeadas (2 altas, 7 médias, 4 baixas, conforme a tabela em §1).
- 15 ambiguidades mapeadas; as mais críticas são `product.css` (A-01), scripts inexistentes (A-02) e "smoke"/"pares relevantes" (A-03, A-04).
- 7 de 7 gates (01–07) precisam de reescrita: nenhum é integralmente objetivo; o gate 07 é o mais fraco ("meta", não requisito).
- 11 riscos de confiabilidade, concentrados em serviços externos (Convex, OpenRouter, Figma, Vercel, GitHub Actions, regras do evento) e em SPOF de coordenação.
- 16 lacunas operacionais para o dia do evento; as bloqueantes são ADR aceita (G-01), scripts/lockfile reais (G-02) e confirmação das regras (G-05).

**Recomendação ao coordenador:** antes de autorizar a fase 01, fechar I-01, I-02 e I-03 em ADR, converter os gates 01–07 com as reescritas de §3 e atribuir owners para G-01, G-02, G-04 e G-05. Nenhuma alteração foi feita em arquivos existentes; este documento e o checkpoint são os únicos arquivos criados.

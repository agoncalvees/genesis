# Estratégia de testes, metodologia de benchmark e contingências (Fase 00)

> **Status: proposto — planejamento, não execução.** Nenhum comando, teste, medição ou benchmark foi executado neste pacote. Versões da stack proposta (TanStack Start, React, TS strict, Bun, Tailwind v4, Base UI, Motion, Convex, AI SDK + OpenRouter, Biome, Vitest, Playwright) **não estão congeladas**; os comandos e ferramentas abaixo são convenções a validar na Fase 00/01. Não marcar gate como validado sem saída real registrada em `docs/STATUS.md`.

## Referências e critérios de aceitação deste plano

- `docs/ROADMAP.md` (gates por fase), `docs/engineering/EVIDENCE.md`, `docs/engineering/OPERATIONS.md`, `docs/engineering/CONTRACTS.md`, `docs/engineering/INTELLIGENCE.md`, `docs/design/DESIGN-SYSTEM.md`, `docs/design/MOTION.md`, `docs/strategy/PLAYBOOK.md`, `benchmarks/README.md`.
- Tipos compartilhados citados: `ExecutionStatus`, `ExecutionResult<T>`, `AppError`, `EvaluationResult` (ver `CONTRACTS.md`).
- Aceitação destas tarefa: ambos os arquivos escritos, sem tocar em arquivos existentes, sem instalação e sem código de aplicação.

---

## 1. Pirâmide de testes por fase (01–07)

Convenção de nomes (proposta, sujeita a validação): unit/integration com Vitest; componente com Vitest + ambiente DOM + Testing Library; fluxo com Playwright; a11y com `@axe-core/playwright` (ou equivalente axe); visual com screenshot de componentes (Playwright ou ferramenta de snapshots), **sempre com revisão humana** — snapshot não é gate isolado.

### Smoke mínimo (conjunto comum a todas as fases)

O "smoke" é o menor conjunto que prova que a aplicação ainda inicializa e que os comandos base funcionam. Deve rodar localmente sem rede e sem credenciais após dependências instaladas:

1. `bun install --frozen-lockfile` reproduzível (quando lockfile existir).
2. `dev` sobe e a rota smoke responde (status 2xx).
3. `check`/lint, `typecheck` e `build` passam sem erros (warnings críticos não omitidos).
4. Um teste unitário mínimo do `core/` (ambiente/erros).
5. Um E2E de smoke: abrir a rota, sem erro crítico no console.
6. Nenhuma credencial necessária; capacidades opcionais (IA/Convex) reportam indisponibilidade explícita.

> Nota: o smoke **não** inclui teste real de IA, teste de deploy nem benchmark; esses são gates específicos das fases 04/05/06.

### Matriz por fase

| Fase | Unit / Vitest | Componente | E2E / Playwright | A11y (axe) | Visual | Gate da fase (ver ROADMAP) |
|---|---|---|---|---|---|---|
| 01 — Scaffold | Ambiente/erros, contratos compartilhados, smoke route | Opcional (ainda sem catálogo) | Smoke route + build local | Opcional: axe na rota smoke | Não | Instalação reproduzível, dev/build/check/typecheck e smoke; Convex real **somente** com credenciais (senão registrado como bloqueio) |
| 02 — Tokens e primitivas | Tokens e aplicação de tema; CVA/variantes | Cada primitiva P0: teclado, foco, nome acessível, erro textual | Navegação e foco entre primitivas; 360/768/1440 | axe nas primitivas e pares de cor; contraste AA verificável | Screenshot das primitivas relevantes (revisão humana) | Troca de tema/fonte centralizada; teclado/foco; viewports; contraste AA nos pares relevantes |
| 03 — Motion e layouts | Presets (duração/easing), `prefers-reduced-motion` | Loading/empty/error/success; Expandable/AnimatedTabs | Sem overflow nos viewports; interação funcional; reduced motion emulado | axe nos estados; foco visível após transição; não bloquear cliques | Screenshot dos estados e layouts (não como gate único) | Reduced motion; sem overflow; quatro estados; interação funcional |
| 04 — IA opcional | Adapters `ai/` com **mock rotulado**: texto, stream, structured output (Zod), tool calling; timeout/cancel/budget; bundle sem segredo | Renderização de estados de IA (loading/erro/sucesso) | Fluxo de IA com mock; teste real com credencial **separado e opt-in** | axe nos estados de erro/mensagens | Opcional | Mock rotulado + teste real com credencial + timeout/cancel/limites + sem segredo no bundle |
| 05 — Evidence runner e receitas | Runner determinístico: schema, amostra, baseline, tratamento de erros, export JSON/CSV | Não prioritário | Fluxo de benchmark ponta a ponta com fixture rotulada | axe no painel de evidências, se houver UI | Opcional | JSON/CSV reproduzível com baseline/unidade/amostra; uma receita executável e isolada |
| 06 — Studio, docs e CI | Cobertura dos utilitários estáveis | Catálogo do Studio (sem duplicar o de dev) | URL direta do Studio em build de produção → **indisponível**; E2E no CI | axe no Studio | Opcional | Studio indisponível em produção inclusive por URL direta; CI sem segredos; build e E2E |
| 07 — Simulação e contingência | Reexecução do smoke após cada simulação | Reexecução dos componentes afetados | Demo local ponta a ponta em worktree descartável | Reexecução de axe nas telas da demo | Revisão humana da demo | Dois desafios distintos em até 45 min cada (meta); tempos, falhas e correções registrados; demo local |

### Regras de gate

- Gate = comandos + saídas reais em `docs/STATUS.md`; falha registrada como falha, nunca como sucesso.
- Se um gate depender de serviço externo sem credencial/permissão: marcar **bloqueado**, manter os testes independentes e descrever o passo manual. Não prometer IA ou persistência offline.
- Corte de escopo por falta de tempo reduz testes secundários (visual, opcionais), nunca smoke, segurança, core funcional nem plano de contingência.

---

## 2. Plano de testes de acessibilidade e responsivo

**Meta:** WCAG 2.2 AA. Verificações automatizadas (axe) + verificações manuais com teclado e leitor de tela quando disponível; axe sozinho não prova conformidade.

### Critérios e como verificar

| Critério (WCAG 2.2) | Alvo | Verificação proposta |
|---|---|---|
| 1.4.3 Contraste texto | ≥ 4.5:1 (normal), ≥ 3:1 (grande) | axe + cálculo nos pares de tokens; ambos os temas se implementados |
| 1.4.11 Contraste não textual | ≥ 3:1 em controles e foco | axe + inspeção manual de bordas/indicadores |
| 2.4.7 / 2.4.11 Foco | Foco visível e perceptível | Navegação por Tab/Shift+Tab; `:focus-visible`; Dialog com focus trap e retorno de foco |
| 2.1.1 Teclado | Todas as ações por teclado | Teste de componente + E2E (Enter/Space/Escape/setas onde aplicável) |
| 4.1.2 Nome, função, valor | Nomes acessíveis | axe + consulta por role/nome nos testes de componente |
| 3.3.1 / 3.3.3 Erros | Erro identificado e sugestão textual | Teste de componente com mensagem textual, não só cor/ícone |
| 1.4.1 Uso de cor | Informação não depende só de cor | Revisão manual + axe parcial |
| 1.4.10 Reflow / 1.4.4 Zoom | Sem perda a 320 px equivalentes (zoom 200%) | E2E com viewports e zoom; ver item abaixo |
| 2.5.8 Target size | Alvos ≥ 24×24 CSS px (AA 2.2) | Inspeção manual/axe quando suportado |
| 2.3.3 / reduced motion | Respeitar `prefers-reduced-motion` | Emulação no Playwright; ver `docs/design/MOTION.md` |

### Matriz de viewports e estados

- Viewports obrigatórios: **360 px** (mobile), **768 px** (tablet), **1440 px** (desktop). Complementar: zoom 200% (equivalente a 320 px de largura) para reflow.
- Verificar em cada viewport: sem overflow horizontal, foco visível, alvos tocáveis, hierarquia legível, temas claro/escuro se ambos implementados.
- Movimento reduzido: com `prefers-reduced-motion: reduce`, animações não essenciais desligadas; nenhum estado dependente de animação para ser compreendido (conforme `MOTION.md`). Não bloquear cliques durante transições.
- Teclado/foco: ordem de Tab, focus trap em Dialog/Popover, Escape fecha, foco retornado ao gatilho, nenhum `outline` suprimido sem substituto visível.
- Screenshots: usar em componentes/layouts relevantes como **sinal de revisão humana**, não como critério automático isolado; exigir aprovação de pessoa responsável.

---

## 3. Plano de testes de IA

### Mocks rotulados vs testes com credencial real

- **Padrão no CI e local:** mocks **explicitamente rotulados** como `MOCK — não é execução real`. Fixtures ficam em diretório de fixtures com nome/descriptor que deixe claro o rótulo. Nenhum resultado de mock é reportado como evidência de desempenho real.
- **Testes reais:** opt-in, separados por tag (`@real`) ou projeto/config distinto no Vitest/Playwright, executados somente quando a credencial existir no ambiente local e a pessoa responsável autorizar. Nunca habilitados por padrão no CI. Registrar provedor/modelo e data **sem registrar a chave**.
- Não migrar dados sensíveis entre provedores sem autorização; não expor endpoint público irrestrito; Studio apenas em dev.

### Casos de teste (com mock e, quando opt-in, com real)

1. Texto: resposta normalize para `AppError`/`ExecutionResult<T>`; mensagens seguras ao usuário.
2. Streaming: chunks recebidos e concatenados; erro parcial tratado; log redigido com correlation ID, sem prompt sensível.
3. Structured output: validação com Zod; rejeição de formato inválido com erro textual.
4. Tool calling: ferramenta neutra e segura, allowlist; nenhum efeito externo sem confirmação humana; conteúdo externo tratado como dado (prompt injection) — separar instruções de dados.
5. **Timeout:** limite configurado; operação longa encerrada com erro `retryable` adequado; retry apenas para falha transitória e com limite.
6. **Cancelamento:** `AbortController`/sinal de cancelamento interrompe geração e tool call; estado final `cancelled` (`ExecutionStatus`); sem vazamento de listener.
7. **Budget/limites:** limite de entrada/saída e orçamento por execução; exceder limite gera erro explícito; concorrência limitada; idempotência quando houver efeito colateral.
8. **Sem segredo no bundle:** verificação pós-build procurando padrões de chave e nomes de variáveis de ambiente no cliente; `.env.example` sem valores secretos; aplicação inicia sem chave e informa indisponibilidade. `ai/` permanece `server-only`.
9. Fallback independente: testado com o mesmo conjunto de casos; não assumido.

> Nota: a capacidade IA é opcional — `features/` e o `core/` não a exigem para iniciar. Testes de IA não entram no smoke.

---

## 4. Metodologia de benchmark para o evidence runner

O runner deve ser pequeno, determinístico e auditável. Nenhum resultado é inventado; quando não houver execução real, o campo de resultados permanece vazio/viável de "não executado".

### Schema de registro (proposto, alinhado a `EvaluationResult` e `EVIDENCE.md`)

| Campo | Tipo | Obrigatório | Descrição |
|---|---|---|---|
| `dataset` | string | sim | Nome do dataset/fixture (neutro, rotulado quando sintético) |
| `datasetSource` | string | sim | Origem/licença ou `fixture sintética — rotulada` |
| `datasetVersion` | string | sim | Versão do dataset/fixture |
| `codeVersion` | string | sim | Commit/versão do código sob teste (ou `desconhecido` explicitamente) |
| `modelVersion` | string | cond. | Versão do modelo/provedor quando houver IA; `n/a` caso determinístico |
| `config` | object | sim | Parâmetros da execução (ex.: tamanho de entrada, concorrência, limites) |
| `baseline` | number \| null | sim | Valor de referência; `null` + justificativa se inexistente (não inventar) |
| `sampleSize` | number | sim | Número de amostras válidas |
| `metric` | string | sim | Nome da métrica (ex.: latência, acurácia) |
| `unit` | string | sim | Unidade (ms, %, contagem) — obrigatória mesmo que implícita |
| `rawResults` | array | sim | Todos os valores brutos, inclusive os que falharam (com marcação) |
| `errors` | array | sim | Erros registrados como erros, nunca excluídos silenciosamente |
| `duration` | string/number | sim | Duração total da execução |
| `procedure` | string | sim | Passos/warm-up/repetições (ver abaixo) |
| `limitations` | array | sim | Limitações conhecidas (amostra pequena, ambiente, etc.) |
| `cost` | object \| null | opt. | Somente se medido ou estimativa **rotulada como estimativa** |
| `date` | string (ISO 8601) | sim | Data/hora da execução |

### Procedimento

- **Warm-up:** executar itens de aquecimento **não contabilizados** nos resultados; registrar quantidade em `procedure`.
- **Repetições:** número fixo de repetições por caso (config em `config`); reportar todas (`rawResults`) e estatísticas derivadas (ex.: mediana, p95) **calculadas a partir dos brutos**. Não descartar valores sem motivo documentado em `errors`/`limitations`.
- **Amostra:** `sampleSize` deve refletir o número real de observações; não extrapolar de amostras pequenas; não comparar tarefas diferentes.
- **Saída:** JSON e CSV com os **mesmos campos** e nomes estáveis; UTF-8, ordem determinística, `date` ISO 8601, sem dados sensíveis. CSV com coluna por campo; `config`/listas serializados de forma documentada.

### Regras anti-fabrication

1. Não gerar, estimar ou "preencher" resultados ausentes; ausência é registrada como ausência.
2. Fixtures sintéticas e replays são **rotulados**; replay é gravação, nunca apresentado como ao vivo.
3. Não comparar tarefas/configurações diferentes sob a mesma métrica sem normalização explícita.
4. Custo apenas com medição real ou estimativa marcada como tal; nunca apresentar preço/quota como verificado sem fonte oficial na Fase 00.
5. Nenhum item marcado como "validado/testado" sem comando e saída real em `docs/STATUS.md`.
6. Resultados brutos ficam em `benchmarks/` com nomes kebab-case e origem rastreável; nada de segredos em JSON/CSV.

---

## 5. Matriz de contingência

Papéis (conforme `PLAYBOOK.md`): **Coordenador** (integração, package.json/lockfile, rotas, tokens, merges e decisão de escopo), **Owner IA** (adapters/auth), **Owner evidências** (runner/receitas), **Owner visual** (tokens/primitivas/motion), responsável de operações/deploy quando houver. Ações externas pagas, deploy e publicação exigem autorização do responsável.

| Falha | Detecção | Fallback | Quem age |
|---|---|---|---|
| Deploy (Vercel/produção) falha ou indisponível | Smoke pós-deploy; health check; build local passa | Manter demo local; reportar bloqueio; não fazer push/merge remoto sem autorização | Coordenador + responsável de deploy |
| Provedor de IA (OpenRouter) indisponível / erro 5xx | Teste real opt-in falha; health do provider; erro `retryable` no adapter | Ativar fallback independente **testado**; se indisponível, modo "IA indisponível" com mensagem clara; UI continua sem chave | Owner IA |
| Quota / rate limit / orçamento excedido | Erro de limite no adapter; contador de budget; aviso de provider | Reduzir concorrência, aplicar backoff limitado, desativar capacidade e usar fixtures rotuladas; registrar limite como bloqueio | Owner IA + Coordenador (decisão de custo) |
| Internet ausente | `dev`/build/smoke falham por rede; teste de modo local | Modo UI/fixtures **explicitamente rotuladas**; demo real gravada anteriormente quando autorizada; **não prometer IA/persistência offline** | Coordenador |
| Convex indisponível / credenciais ausentes | Smoke de persistência falha; health do serviço | Modo local somente se implementado; senão registrar bloqueio e descrever passo manual; não duplicar cache com React Query | Coordenador + responsável de dados |
| Agente/modelo indisponível (fora do ar no evento) | Modelo não responde; teste de disponibilidade rápido | Redistribuir tarefas entre agentes/modelos disponíveis por capacidade; reduzir escopo secundário; não obrigar todos os modelos | Coordenador |
| Conflitos de merge / trabalho paralelo | Conflito em `git`; falha em check após integração | Worktrees descartáveis; um owner por arquivo/contrato; coordenador integra e revisa; nunca reescrever histórico | Coordenador |
| Falta de tempo | Cronômetro da fase; features fora do MVP | Cortar primeiro 3D, voz, auth, mapas, agentes complexos, Storybook, telas extras e receitas de baixa prioridade; congelar features antes da janela final; **não cortar** smoke, segurança, core, testes mínimos nem contingência | Coordenador |
| Studio/vazamento de env em produção | E2E com URL direta em build de produção | Desativar rota/feature flag; rever build; nenhum painel com env/config | Owner visual + Coordenador |

---

## 6. Edge cases e riscos de confiabilidade

1. Chave de IA ausente/presente no cliente: a aplicação deve iniciar sem chave e informar indisponibilidade; nenhum segredo em bundle, logs, Git ou `.env.example`.
2. Timeout em streaming e cancelamento durante tool call: encerrar sem vazamento, estado `cancelled`, erro seguro; retry apenas transitório e limitado.
3. Structured output inválido ou alucinado: validar com Zod; tratar como não confiável até validação; erro textual ao usuário.
4. Prompt injection em conteúdo externo: separar dados/instruções; allowlist de ferramentas; confirmação humana para efeitos externos.
5. Payload muito grande e concorrência: limites de entrada/saída, limite de concorrência e budget por execução.
6. Viewport estreito e zoom 200%: overflow horizontal, reflow a 320 px, alvos de toque pequenos, barra de rolagem altersando layout.
7. Fontes: fallback do sistema muda métricas e quebra screenshots/layout; verificar com fonte realmente carregada e fallback.
8. Tema claro/escuro: pares on-color com contraste insuficiente em um dos temas; foco invisível.
9. Reduced motion: animação essencial desligada impede compreensão do estado; ou transição bloqueia clique; indeterminado vs progresso real.
10. Ícones/decorativos e SVG sem nome acessível; cor como único indicador de erro/sucesso.
11. E2E flaky por espera implícita, animação ou ordem não determinística: usar esperas explícitas e dados controlados; não mascarar flakes com retry cego.
12. Screenshot tests instáveis (fonte, antialias, animação, fuso/hora): revisão humana obrigatória; não usar como gate único.
13. Runner: amostra pequena, baseline inventado, erro excluído silenciosamente, unidade ausente, dados sensíveis exportados, replay apresentado como ao vivo.
14. Lockfile/drift de versões e runtime local (Bun) vs deploy (Node/Vercel): documentar diferença; congelar versões na Fase 00 antes de medir.
15. Código gerado do Convex desatualizado; cache duplicado Convex + React Query; schema de persistência antecipado sem uso real.
16. CI sem segredos, mas teste real dependente de chave: garantir que CI não quebre nem vaze credenciais; teste real permanece opt-in.
17. Regulamento/código prévio não confirmados: não reutilizar nada do Robin nem publicar código prévio sem autorização do evento (ver `COMPETITION.md`).

---

## Limitações declaradas

Este é um plano. Comandos, versões, limites de API/quota, compatibilidade de peers e comportamento de deploy **não foram testados** aqui e devem ser verificados na Fase 00/01 com fontes oficiais e registrados em `docs/STATUS.md` antes de qualquer execução. Revisão independente pendente; quando indisponível, declarar autorrevisão.

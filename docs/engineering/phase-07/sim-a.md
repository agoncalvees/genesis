# P07-SIM-A — Otimização com visualização

Ensaio local e descartável com dados sintéticos, na branch `p07-sim-a` a partir de `f8fd166`. A rota inicial e o tema placeholder do Genesis permanecem neutros.

| Relógio UTC | Valor |
|---|---|
| start | `2026-11-24T18:09:14Z` |
| end | `2026-11-24T18:16:02Z` |
| duration_min | 6,80 (6 min 48 s) |
| Meta | 45 minutos |

## Escopo e implementação

A tarefa ficou com um responsável. Os arquivos de trabalho foram a feature `src/features/route-opt/`, a rota `src/routes/route-opt.tsx` e sua entrada gerada no TanStack Router, o benchmark, os testes e este relatório com o registro em STATUS. Os critérios foram a repetibilidade da fixture, comparação pela mesma distância, teste unitário da heurística, comparação acessível na rota, evidência exportável e verificação dos gates locais.

- `/route-opt` abre com 18 pontos sintéticos gerados pela seed 20261124. Aceita de 2 a 80 pares de coordenadas decimais e restaura a fixture por botão. Erros de entrada indicam a linha quando aplicável.
- Baseline em ordem de entrada. A heurística faz vizinho mais próximo e até dez rodadas de 2-opt, com desempate determinístico e retorno à baseline se a candidata for igual ou pior. A primeira linha é o início fixo. O percurso é aberto e soma distâncias euclidianas entre visitas consecutivas.
- A interface usa `WorkspaceLayout`, `ResultPanel`, `Metric`, `Field`, `Textarea`, `Button`, `Grid`, `Card` e tokens semânticos. Os dois SVGs compartilham escala, expõem título e descrição acessíveis e marcam o início com um quadrado. A ordem também aparece em texto com números de linha. O cálculo local é síncrono e limitado, com resultado exibido diretamente.
- Seis testes unitários cobrem distância aberta, melhoria por 2-opt, fallback, duplicatas, fixture e leitura da entrada. O E2E cobre a fixture inicial, erro acessível, envio por teclado, redução conhecida, restauração e axe a 360 px com movimento reduzido.
- Autorrevisão do diff, do algoritmo e do vínculo entre entrada, distância, SVG e benchmark. O despacho previa um único executor, então a revisão independente fica pendente.

## Evidência medida

`bun benchmarks/route-opt.ts`, executado em macOS arm64, Bun 1.4.5, às `2026-11-24T18:13:58.638Z`. Código medido `b3ddbe2`, árvore limpa. A execução cronometrou a construção de uma rota e o cálculo de sua distância, com 25 aquecimentos e 101 repetições por estratégia. As distâncias foram calculadas separadamente na mesma fixture e exportadas em `config.distanceByCase`. O campo de runtime `node` registra a versão reportada por `process.versions.node` sob Bun (26.3.0). O executável Node local usado pelos comandos de projeto é 24.22.3.

| Estratégia | Distância (unidades) | Mediana (ms) | P95 (ms) | Amostras | Erros |
|---|---:|---:|---:|---:|---:|
| Ordem de entrada | 1017,109875 | 0,002750 | 0,004375 | 101 | 0 |
| Vizinho mais próximo + 2-opt | 345,216552 | 0,020625 | 0,032083 | 101 | 0 |

A redução foi de **66,06%**, com tempo mediano **7,5 vezes maior**. Os tempos são de uma única fixture pequena, com casos sequenciais no mesmo processo e sujeitos a ruído local. As distâncias representam um plano abstrato. A busca limitada não garante um ótimo global.

Artefatos locais em `benchmarks/results/route-opt-2026-11-24T18-13-58-638Z.json` e `benchmarks/results/route-opt-2026-11-24T18-13-58-638Z.csv`. O script verifica a equivalência estrutural dos dois. A pasta de resultados é ignorada pelo Git, conforme a convenção existente. O comando acima gera novos arquivos.

## Comandos, falhas e correções

| Comando | Código | Resultado |
|---|---:|---|
| `date -u +%Y-%m-%dT%H:%M:%SZ` | 0 | Início e encerramento em UTC |
| `bun install --frozen-lockfile` | 0 | Instalou somente o conjunto já travado |
| `bun run check` | 0 | O Biome inicialmente sinalizou chave por índice e `aria-hidden` em grupo SVG; a chave passou a usar a identidade da linha e o atributo redundante foi removido |
| `bun run typecheck` | 1 → 0 | O alvo TypeScript não inclui `toSorted`; o teste passou a ordenar uma cópia |
| `bun run test` | 1 → 0 | O teste existente de teclado do Select variava entre A e B. Passava isolado, mas falhou repetidamente na suíte. Passou a definir a opção inicial e esperar o destaque antes da próxima tecla. Resultado final de 170 passaram e um teste real opt-in foi pulado |
| `bun run build` | 0 | Saída local em `.vercel/output`, com avisos Rolldown sobre `"use client"` nas dependências |
| `bun run test:e2e` | 1 → 1 → 0 | Primeira execução teve 17 aprovados e um erro no ensaio. O SVG passou a usar uma única string em `title` para corrigir a hidratação, e a redução esperada no caso de 8 → 7 unidades foi corrigida para 12,5%. A segunda execução também teve 17 aprovados e uma falha: um preenchimento antes da hidratação se perdeu. Campo e botões ficaram desabilitados até hidratar, reutilizando o padrão de `/smoke`. Terceira execução com 18 aprovados |
| `bun run test:e2e tests/e2e/route-opt.spec.ts` | 1 → 0 | A outra simulação ocupava a porta 3000. Após liberação da porta e correção da hidratação, o teste focado passou |
| `bun benchmarks/route-opt.ts` | 1 → 0 | A primeira comparação usava `JSON.stringify` e falhava pela ordem das chaves de `stats`; igualdade estrutural resolveu a checagem dos valores |
| `git diff --check` / `git diff --cached --check` | 0 | Sem conflitos de whitespace |

## Genesis friction

- **Ajudou.** O scaffold aceitou a rota apenas com o arquivo de entrada e a regeneração da árvore. Layout, campos com erro, métricas, painel de resultado e tokens deram uma tela funcional sem mexer em `src/core` nem em `src/design-system`. Bun frozen, Vitest e o setup Playwright/axe já estavam disponíveis.
- **Porta compartilhada.** Playwright e Vite usam 3000 fixa. Duas worktrees locais disputaram o mesmo listener. Um parâmetro de porta propagado pelos scripts e pela configuração E2E permitiria execução concorrente.
- **Formulários antes da hidratação.** A página já mostrava controles enquanto o cliente ainda não aceitava alterações. O padrão de `/smoke` resolveu isso localmente. Um exemplo de formulário SSR que só habilita controles após hidratar reduziria esse retrabalho.
- **Teste de teclado sensível a tempo.** O teste do Select enviava a sequência antes de estabilizar a opção destacada. A correção ficou no teste preexistente, preservando a interação por teclado e sem editar o componente.
- **Comparação de dados.** `BeforeAfter` espera URLs de imagens. Para dois mapas vetoriais com título, descrição e ordem de visita, foi necessário compor dois `Card` em um `Grid` e escrever os SVGs. Um exemplo de comparação lado a lado com conteúdo React ajudaria.
- **Uma métrica por execução.** O runner mede duração e descarta o retorno de `run`. A qualidade da rota precisou ser calculada separadamente e exportada em `config`. Um exemplo oficial de comparação com qualidade e latência deixaria esse caminho explícito, inclusive a verificação de paridade por valores.
- **Avisos no fluxo local.** O dev server anuncia `VERCEL_OIDC_TOKEN` ausente mesmo para a rota sem serviços. O build tem avisos de diretivas de módulos. No ensaio, nenhum desses avisos exigiu credencial ou alteração de dependência.

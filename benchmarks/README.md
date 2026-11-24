# Benchmarks

Runner pequeno e determinístico para evidência neutra (`docs/engineering/EVIDENCE.md`,
`docs/engineering/phase-00/test-strategy.md` §4). Não é plataforma de analytics e
não contém resultados inventados: todo número emitido vem de `performance.now()`
durante a execução.

## Como executar

```sh
bun run bench
```

O comando escreve dois arquivos com o mesmo carimbo temporal em
`benchmarks/results/` (diretório ignorado pelo Git):

- `<timestamp>.json` — array de registros;
- `<timestamp>.csv` — os mesmos campos, mesma ordem, uma linha por registro.

## O que é medido

`benchmarks/run.ts` usa `src/evidence/runner.ts` e `src/evidence/export.ts` sobre
`benchmarks/fixtures/integers.ts`, uma **fixture sintética rotulada**: inteiros
determinísticos gerados por PRNG mulberry32 com seed fixo `20261124`. Nenhum dado
real, serviço externo, credencial ou rede é usado.

São comparadas duas implementações determinísticas sobre o mesmo conjunto de
128 arrays de 32 inteiros: `builtin-sort` (referência) e `insertion-sort`.
Antes de medir, o script verifica que ambas produzem a mesma saída. Warm-up de
3 execuções por caso não é registrado; 15 repetições por caso são registradas
uma a uma em `rawResults`. A implementação de referência é declarada em
`config.baselineImplementation`; como nenhum valor numérico foi medido
anteriormente, `baseline` é `null` com justificativa em `baselineJustification`.

## Esquema do registro

Campos, na ordem estável usada em JSON e CSV: `benchmark`, `caseName`,
`dataset`, `datasetSource`, `datasetVersion`, `codeVersion`, `codeDirty`,
`modelVersion`, `config`, `baseline`, `baselineJustification`, `metric`,
`value`, `unit`, `sampleSize`, `stats`, `metricStats`, `rawResults`, `errors`,
`durationMs`, `procedure`, `limitations`, `runtime`, `date`.

`codeVersion` é o SHA curto do `git rev-parse --short HEAD` e `codeDirty`
indica se `git status --porcelain` estava não vazio no momento da medição
(`true` = código medido diverge do commit registrado). Ambos são `unknown`/
`false` quando o git não está disponível.

`stats` contém `n`, `mean`, `median`, `p95`, `min`, `max` e `stddev`, calculados
apenas das medições bem-sucedidas. Um valor temporizado que lançou erro
permanece em `rawResults` com `ok: false` e também em `errors`; nunca é
removido silenciosamente. `value` é a mediana e `sampleSize` é `stats.n`.

`metricStats` repete as mesmas sete estatísticas para cada métrica de qualidade
retornada por `run()`, com os nomes das métricas em ordem alfabética e `{}`
quando nenhuma métrica é retornada.

## Métricas de qualidade por repetição

Um caso pode retornar `{ metrics: Record<string, number> }`: o runner grava os
valores finitos em `rawResults[].metrics` na repetição em que foram obtidos e
calcula `metricStats[nome]` somente com os valores bem-sucedidos que trouxeram
aquela métrica. Repetições que lançaram erro não têm `metrics`; valores
não-numéricos, não-finitos ou um objeto `metrics` malformado são ignorados em
vez de virarem zero. Um retorno com qualquer outra forma continua medindo
apenas a duração, como antes.

O benchmark neutro retorna `unsortedAdjacentPairs` (pares adjacentes ainda fora
de ordem na saída ordenada): é uma checagem de correção, igual a zero nas duas
implementações em toda repetição. A coluna aparece em JSON e CSV com os mesmos
valores; o CSV usa uma coluna aninhada `metricStats`, equivalente à do JSON.

Para comparar listas esperadas e obtidas (precisão/recall/F1), use
`scoreClassification` de `src/evidence/classification.ts`: contagem por
multiconjunto da chave fornecida, duplicatas com multiplicidade e zeros
definidos quando o denominador é zero (`0`, nunca `NaN`).

Cada entrada de `errors` traz `name` (classe do erro), `correlationId`
(UUID), `caseName`, `phase`, `repetition` e — somente com
`includeErrorMessages: true` na definição — uma `message` redigida. Por padrão
a mensagem bruta não é exportada. A redação remove padrões de chaves (`sk-...`),
`Bearer ...`, emails e tokens longos em base64/hex; é conservadora e pode
remover texto inofensivo. O benchmark neutro mantém a opção desligada.

## Serialização

JSON: UTF-8, chaves na ordem documentada, indentação com tabs (largura de linha
80, tab contado como duas colunas), arrays curtos em uma linha e objetos com
uma chave por linha — o mesmo estilo do Biome, então o artefato gerado passa em
`bun run check` sem reformatação manual. CSV: UTF-8, cabeçalho com os mesmos
campos, todas as células entre aspas, aspas internas duplicadas, fim de linha
LF. `config`, `stats`, `metricStats`, `rawResults`, `errors`, `limitations` e
`runtime` são serializados como JSON com chaves ordenadas recursivamente.
`baseline` ausente é `null` no JSON e célula vazia no CSV. Números não finitos
(amostra vazia) viram `null`, nunca `0` inventado.

## Limitações

Amostra pequena, execução local e sequencial no mesmo processo, com ruído de
runtime/sistema não controlado. O resultado compara apenas algoritmos
determinísticos em arrays pequenos e sintéticos; não é evidência de desempenho
de produto, IA ou tarefas diferentes. Veja `docs/engineering/phase-05/checkpoints/P05-OC-01.md`
para os comandos executados e os nomes dos arquivos gerados.

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
`value`, `unit`, `sampleSize`, `stats`, `rawResults`, `errors`, `durationMs`,
`procedure`, `limitations`, `runtime`, `date`.

`codeVersion` é o SHA curto do `git rev-parse --short HEAD` e `codeDirty`
indica se `git status --porcelain` estava não vazio no momento da medição
(`true` = código medido diverge do commit registrado). Ambos são `unknown`/
`false` quando o git não está disponível.

`stats` contém `n`, `mean`, `median`, `p95`, `min`, `max` e `stddev`, calculados
apenas das medições bem-sucedidas. Um valor temporizado que lançou erro
permanece em `rawResults` com `ok: false` e também em `errors`; nunca é
removido silenciosamente. `value` é a mediana e `sampleSize` é `stats.n`.

Cada entrada de `errors` traz `name` (classe do erro), `correlationId`
(UUID), `caseName`, `phase`, `repetition` e — somente com
`includeErrorMessages: true` na definição — uma `message` redigida. Por padrão
a mensagem bruta não é exportada. A redação remove padrões de chaves (`sk-...`),
`Bearer ...`, emails e tokens longos em base64/hex; é conservadora e pode
remover texto inofensivo. O benchmark neutro mantém a opção desligada.

## Serialização

JSON: UTF-8, indentação de 2 espaços, chaves na ordem documentada, objetos
aninhados com chaves ordenadas recursivamente. CSV: UTF-8, cabeçalho com os
mesmos campos, todas as células entre aspas, aspas internas duplicadas, fim de
linha LF. `config`, `stats`, `rawResults`, `errors`, `limitations` e `runtime`
são serializados como JSON compacto com chaves ordenadas. `baseline` ausente é
`null` no JSON e célula vazia no CSV. Números não finitos (amostra vazia) viram
`null`, nunca `0` inventado.

## Limitações

Amostra pequena, execução local e sequencial no mesmo processo, com ruído de
runtime/sistema não controlado. O resultado compara apenas algoritmos
determinísticos em arrays pequenos e sintéticos; não é evidência de desempenho
de produto, IA ou tarefas diferentes. Veja `docs/engineering/phase-05/checkpoints/P05-OC-01.md`
para os comandos executados e os nomes dos arquivos gerados.

# Receita isolada: resumo de CSV numérico (sem dependências)

**Status:** executada localmente em 24/11/2026 nesta máquina. Não testada em
produção. Nenhuma dependência foi instalada; nenhuma chave, rede ou serviço
externo foi usado.

## Problema

Resumir colunas numéricas de um CSV pequeno (contagem, mínimo, máximo e média)
com TypeScript puro, como exemplo de receita **opcional** que pode ser
adicionada e removida sem afetar o núcleo. Não é um produto, não lida com
planilhas grandes e não substitui DuckDB/Polars.

## Fonte oficial

- ECMAScript 2022 — `Number`, `Array`, `Math`: https://tc39.es/ecma262/
- Node.js 24 — `node:fs`, `node:path`, `node:url`: https://nodejs.org/docs/latest-v24.x/api/
- Bun — execução de arquivos TypeScript e `process.argv`: https://bun.sh/docs
- RFC 4180 (contexto do formato CSV): https://www.rfc-editor.org/rfc/rfc4180

As URLs acima são documentação pública de referência; não foram reconsultadas
durante esta tarefa e nenhum trecho de código ou texto foi copiado. Nenhuma
fonte paga foi utilizada.

## Versões

Medidas localmente em 24/11/2026: Bun `1.4.5`, Node `v24.22.3`,
TypeScript `7.0.2` (somente `typecheck`, não é dependência de execução).
Bibliotecas de terceiros: **nenhuma**. Versão da receita: `1.0.0`.

## Pré-requisitos

Bun 1.4.5 (ou Node 24 com um executor de TypeScript equivalente), sistema de
arquivos local e um arquivo CSV pequeno. Sem credenciais, sem rede, sem
variáveis de ambiente, sem `node_modules` específico da receita.

## Custo / quota

**Nenhum.** Não há chamada de API, provedor, serviço pago, limite de quota,
upload ou telemetria. Nenhuma estimativa de preço foi inventada.

## Comandos

```sh
# Executar sobre a fixture sintética rotulada
bun recipes/csv-summary/summarize.ts recipes/csv-summary/fixture.csv

# Teste unitário da receita
bunx vitest run --project unit tests/unit/recipes/csv-summary.test.ts

# remoção (ver seção "Remoção")
```

A fixture `fixture.csv` é **SINTÉTICA**: quatro linhas de inteiros gerados à
mão para o exemplo, sem dado real. As colunas começam com `synthetic_` para
deixar o rótulo no próprio arquivo.

## Exemplo executável

Entrada (`recipes/csv-summary/fixture.csv`):

```csv
synthetic_a,synthetic_b,synthetic_c
1,10,100
2,20,200
3,30,300
4,40,400
```

Saída real do comando (exit 0):

```json
{
  "columns": [
    { "column": "synthetic_a", "count": 4, "min": 1, "max": 4, "mean": 2.5 },
    { "column": "synthetic_b", "count": 4, "min": 10, "max": 40, "mean": 25 },
    { "column": "synthetic_c", "count": 4, "min": 100, "max": 400, "mean": 250 }
  ]
}
```

(A saída impressa pelo comando usa JSON com indentação de 2 espaços; acima ela
está apenas condensada para o documento. Os números são os medidos pela
execução real, não estimados.)

## Teste

`tests/unit/recipes/csv-summary.test.ts` cobre: resumo conhecido, leitura da
fixture rotulada, nove entradas malformadas com mensagens explícitas, e duas
provas de isolamento (nenhum `src/` importa ou menciona `csv-summary`, e o
scanner detecta um import fictício — não é vacuo). Execução local:
`bunx vitest run --project unit tests/unit/evidence/ tests/unit/recipes/` →
exit 0, 4 arquivos, 30 testes.

## Falhas

O parser aceita um subconjunto estrito: uma linha de cabeçalho, células não
vazias, numéricas e finitas, separadas por vírgula, sem aspas. Qualquer outra
entrada gera `CsvParseError` com número da linha e, quando aplicável, nome da
coluna:

- `CSV is empty: a header row is required`
- `CSV has a header but no data rows`
- `row 1: header contains an empty column name`
- `row 1: duplicate column name "x"`
- `row N: expected X fields, got Y`
- `row N, column "c": empty value`
- `row N, column "c": "v" is not a finite number`
- `row N: empty row`
- `row N: quoted CSV fields are not supported`

Limitações declaradas: não há parser RFC 4180 completo (campos com aspas,
vírgulas ou quebras de linha internas são rejeitados, não interpretados);
`Infinity`/`NaN` são rejeitados; colunas não numéricas não são suportadas.

## Remoção

```sh
rm -rf recipes/csv-summary
rm tests/unit/recipes/csv-summary.test.ts
bun run test
bun run typecheck
bun run check
```

A remoção física **não foi executada nesta tarefa**. A prova de isolamento
automatizada acima verifica a condição que a tornaria segura: nenhum arquivo
sob `src/` importa ou menciona esta receita, e o módulo só usa `node:fs`,
`node:path` e `node:url`. Nenhum script, configuração ou `package.json`
referencia a pasta.

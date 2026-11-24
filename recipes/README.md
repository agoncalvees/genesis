# Recipes

Capacidades opcionais, adicionadas após validação. Cada receita traz problema
genérico, fonte oficial, versões, pré-requisitos, custo/quota, comandos,
exemplo executável, teste, falhas e remoção. Nenhuma receita é importada por
`src/`; a aplicação inicia sem elas.

## Implementadas

- [`csv-summary/`](./csv-summary/README.md) — resumo de CSV numérico em
  TypeScript puro, sem dependências, custo ou quota. Executada localmente em
  24/11/2026; isolamento verificado por teste que varre `src/`.

As demais receitas do `docs/engineering/INTELLIGENCE.md` (structured output,
streaming, tools, multimodal, DuckDB/Polars, ECharts, Python/uv, Docling,
OR-Tools, MapLibre, React Flow, Mastra, Firecrawl, E2B, LiveKit, 3D) seguem
pendentes e não devem ser instaladas em massa.

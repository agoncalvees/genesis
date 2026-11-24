# Escolher componentes

A direção artística escolhe os componentes. Estas peças garantem **comportamento** (teclado, foco, portais com tema, hidratação, tabelas acessíveis); a aparência e a composição são do produto. Para visualizações, simulações, redes, mapas e motion avançado, consulte primeiro o [Experience Registry](EXPERIENCES.md).

Consulte as assinaturas e os exemplos no código abaixo. Os produtos iniciados com `genesis:new` preservam a biblioteca. Importe pelo caminho do componente quando precisar manter a dependência explícita.

| Necessidade | Candidatos | Uso |
|---|---|---|
| Ação, formulário ou diálogo | [Primitivas](../../src/design-system/primitives/), [overlays](../../src/design-system/components/overlays.tsx) | `Button` recebe o rótulo como conteúdo. Use `Field` para associar nome, instrução e erro, ou controles nativos quando couberem melhor. |
| Título fiel ao tema | [Typography](../../src/design-system/primitives/typography.tsx) | `Heading` com nível e variante de seção, ou tokens `--section-heading-*` em CSS autoral. Para números, aplique `--metric-typeface` quando o contrato pedir. |
| Resultado e fonte | [ResultPanel](../../src/design-system/patterns/result-panel.tsx), [EvidenceExcerpt](../../src/design-system/patterns/evidence-excerpt.tsx) | Use para estados de execução ou evidência textual quando seus contratos couberem. `BeforeAfter` recebe conteúdo React e serve à comparação por mídia ou composição. |
| Série de dados | [Dataviz](../../src/design-system/dataviz/index.tsx) | `BarChart`, `LineChart` e `Sparkline` incluem tabela acessível. Em `BarChart`, use `maxValue` como teto de referência para manter a escala estável entre seleções. Passe `locale`, `messages` e, quando útil, `description` para localizar a apresentação. |
| Etapas observáveis | [ProcessingFeedback](../../src/design-system/motion/processing-feedback.tsx) | Passe etapas, rótulos, locale e progresso medido quando disponível. |
| Composição | [Padrões editoriais](../../src/design-system/patterns/editorial.tsx), [layouts](../../src/layouts/), [painéis redimensionáveis](../../src/design-system/components/resizable-panels.tsx) | Parta da tarefa principal. Combine blocos com a estrutura própria da experiência. |
| Mudança de estado | [Motion](../../src/design-system/motion/) | Use CSS para feedback simples; use os presets e o provedor quando a transição precisar de coordenação. Preserve reduced motion. |

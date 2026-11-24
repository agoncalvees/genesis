# Genesis Blueprint v1.0

## Missão
Acelerar a construção de uma solução para problema desconhecido. Qualidade visual inspirada no refinamento do Robin, profundidade técnica e evidência mensurável. A fundação é agnóstica ao domínio e ao formato da experiência; a stack favorece web, mas não deve impedir uma solução CLI, científica ou sem IA se o tema assim exigir.

## Escopo
**P0:** aplicação mínima executável; design tokens adaptáveis; primitivas essenciais; motion; tratamento de erros; dados e IA integráveis; testes; documentação; plano de contingência. **P1:** catálogo dev, resultados/evidências, layouts adicionais, receitas selecionadas. **P2:** demais integrações somente se justificadas. Sem produto, login obrigatório, billing, entidades de negócio, microserviços ou marca final.

## Stack proposta (congelar versões após prova)
- TanStack Start/Router + React + TypeScript strict; Bun como gerenciador. Runtime de produção conforme suporte do deploy, não assumir Bun na Vercel.
- Tailwind v4, Base UI, Motion, Phosphor Icons, CVA, clsx/tailwind-merge se necessário. Sem segunda biblioteca UI.
- Convex + integração oficial com TanStack Query se necessária; sem duplicar cache ou estado. Zod para fronteiras não cobertas por validadores nativos.
- AI SDK + OpenRouter (provider comunitário); fallback independente somente se testado. Módulo removível; aplicação inicia sem chave de IA e informa indisponibilidade.
- Biome, Vitest, Playwright. Vercel/Convex Cloud como caminhos de deploy, não requisitos para testes locais de UI. GitHub Actions após build local.
- Opcionais: TanStack Form, ECharts, Better Auth, Elysia, Python/uv, DuckDB, Polars, OR-Tools, Docling, Firecrawl, MapLibre, React Flow, Mastra, LiveKit, E2B, GSAP, Storybook, Promptfoo.

## Fronteiras
`src/routes/` usa o roteamento oficial; `core/` ambiente/erros/providers; `design-system/` tokens, primitivas, padrões, motion, temas; `layouts/` composição opcional; `features/` domínio (vazio); `ai/` adaptadores server-only; `evidence/` utilitários de medição; `integrations/` extensões; `studio/` demos internas. `convex/` segue convenções oficiais e código gerado. `recipes/` exemplos isolados. Evitar abstrações e diretórios que não tenham uso real.

## Estratégia de deploy
Aplicação e funções server-side na Vercel se validado, Convex para persistência/realtime quando necessário. Proteger endpoints de IA e dados, não publicar playground de execução em produção. Projeto local funciona em modo UI/fixtures sem rede após dependências instaladas; não prometer persistência/IA offline sem implementação própria.

## Referências técnicas
- https://tanstack.com/start/latest/docs/framework/react/getting-started
- https://tanstack.com/start/latest/docs/framework/react/guide/hosting
- https://docs.convex.dev/quickstart/tanstack-start
- https://docs.convex.dev/client/tanstack/tanstack-start/
- https://ai-sdk.dev/providers/community-providers/openrouter
- https://base-ui.com/
- https://motion.dev/docs/react
- https://robin-dashboard-amber.vercel.app/ (referência visual; código do frontend não fornecido)

As versões decididas estão nos [ADRs](architecture/decisions/). Consulte o [STATUS](STATUS.md) para distinguir validação local, integrações opcionais e regras confirmadas pelo responsável.

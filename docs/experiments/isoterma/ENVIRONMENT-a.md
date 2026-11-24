# Ambiente — Versão A (mesma stack, sem Genesis, sem DESIGN.md)

- Workspace: `/Users/arthurgoncalves/orca/experiments/isoterma/version-a` · app em `/Users/arthurgoncalves/orca/experiments/isoterma/version-a/app`
- Portas: produção **3201**, dev/E2E **3211**.
- Você recebe apenas o briefing funcional, o protocolo e os dados. **Não há DESIGN.md nem design system**: a direção visual é decisão sua, respeitando o briefing e as regras anti-genéricas.
- Não leia nem use `/Users/arthurgoncalves/orca/projects/genesis`, `/Users/arthurgoncalves/orca/workspaces/genesis`, `/Users/arthurgoncalves/Downloads/genesis` ou qualquer produto derivado deles.

## Stack (a mesma do Genesis; versões fixas)
- Runtime: Bun 1.4.5 (`/opt/homebrew/bin/bun`) e Node 24.x.
- Núcleo: `@tanstack/react-start@1.169.7`, `@tanstack/react-router@1.170.46`, `react@19.3.1`, `react-dom@19.3.1`, `vite@8.3.8`, `@vitejs/plugin-react@6.3.0`, `nitro@3.0.260610-beta`, `tailwindcss@4.3.5`, `@tailwindcss/vite@4.3.5`, `typescript@7.0.2`, `@types/react@19.3.0`, `@types/react-dom@19.3.0`, `@types/node@24.19.2`.
- Qualidade: `@biomejs/biome@2.6.9`, `vitest@5.1.1`, `@playwright/test@1.65.1`, `@axe-core/playwright@4.14.1`.
- Opcionais permitidas (registre se usar): `motion@14.14.0`, `@base-ui/react@1.9.0`, `@phosphor-icons/react@2.1.10`, `clsx@2.1.1`, `tailwind-merge@3.7.1`, `class-variance-authority@0.7.1`, `zod@4.6.7`, fontes OFL self-hosted via `@fontsource/*` ou `@fontsource-variable/*` (verifique a versão no registry antes de fixar).
- **Proibido** (para todas as versões): bibliotecas de mapa ou gráfico (mapbox, maplibre, leaflet, deck.gl, d3*, recharts, visx, chart.js etc.), UI kits completos (shadcn copiado, MUI, Chakra…), CDN de fontes, chamadas de rede em runtime. Mapa e gráficos em SVG próprio.
- Monte o projeto do zero ou com o gerador oficial do TanStack Start, terminando nas versões acima. **Não copie arquivos do Genesis nem de outros projetos locais.**

## Scripts exigidos no `app/package.json`
`dev`, `build`, `typecheck`, `test:e2e` e `serve` (serve o build de produção na porta de produção indicada acima, lendo `PORT` com esse valor como padrão).

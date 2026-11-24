# Ambiente — Versão C (Genesis completo via `genesis:new`)

- Workspace: `/Users/arthurgoncalves/orca/experiments/isoterma/version-c` · app em `/Users/arthurgoncalves/orca/experiments/isoterma/version-c/app` (criado pelo `genesis:new`; o destino precisa estar ausente/vazio).
- Portas: produção **3203**, dev/E2E **3213** (use `PORT=3213` para Playwright/dev).
- Você recebe o briefing funcional, o protocolo, os dados e `brief/DESIGN.md` (identidade ISOTERMA, já validada pelo `design:lint` do Genesis).

## Inicialização (faz parte da preparação, cronometrada)
```sh
cd /Users/arthurgoncalves/orca/projects/genesis
bun run genesis:new -- --name "ISOTERMA" --slug isoterma --world neutral --dir /Users/arthurgoncalves/orca/experiments/isoterma/version-c/app
cd /Users/arthurgoncalves/orca/experiments/isoterma/version-c/app
bun run design:import /Users/arthurgoncalves/orca/experiments/isoterma/version-c/brief/DESIGN.md isoterma
bun run design:apply import/isoterma
bun run design:build && bun run design:check && bun run design:lint
```
Se algum passo falhar, registre a saída real e o diagnóstico no REPORT.md (é evidência do experimento). Não altere o repositório Genesis em `/Users/arthurgoncalves/orca/projects/genesis` (somente leitura; o `genesis:new` só clona dele).

## Reuso obrigatório (ordem: reusar → variante → componente novo)
- Leia no produto: `AGENTS.md`, `docs/design/DESIGN-SYSTEM.md`, `docs/design/DESIGN-ENGINE.md`, `docs/design/MOTION.md`, `docs/design/VISUAL-ENGINEERING.md`, `src/design-system/index.ts` e os diretórios `primitives`, `components`, `patterns`, `motion`, `dataviz`.
- O Studio (catálogo, mundos, motion lab) é removido do produto pelo `genesis:new`; consulte-o **somente leitura** em `/Users/arthurgoncalves/orca/projects/genesis/src/studio` se precisar de exemplos de uso.
- Use tokens semânticos (sem literais de cor/fonte/raio/duração nos componentes). A rampa térmica do DESIGN.md não existe no contrato do motor: defina-a como extensão local documentada.
- Registre no REPORT.md componentes reutilizados, adaptados e criados, onde a fundação acelerou e onde restringiu.
- O `docs/product/` e `docs/STATUS.md` do produto podem ficar como o `genesis:new` deixou; não é necessário preenchê-los para este experimento (registre isso).

## Stack (a mesma do Genesis; versões fixas)
- Runtime: Bun 1.4.5 (`/opt/homebrew/bin/bun`) e Node 24.x.
- Núcleo: `@tanstack/react-start@1.169.7`, `@tanstack/react-router@1.170.46`, `react@19.3.1`, `react-dom@19.3.1`, `vite@8.3.8`, `@vitejs/plugin-react@6.3.0`, `nitro@3.0.260610-beta`, `tailwindcss@4.3.5`, `@tailwindcss/vite@4.3.5`, `typescript@7.0.2`, `@types/react@19.3.0`, `@types/react-dom@19.3.0`, `@types/node@24.19.2`.
- Qualidade: `@biomejs/biome@2.6.9`, `vitest@5.1.1`, `@playwright/test@1.65.1`, `@axe-core/playwright@4.14.1`.
- Opcionais permitidas (registre se usar): `motion@14.14.0`, `@base-ui/react@1.9.0`, `@phosphor-icons/react@2.1.10`, `clsx@2.1.1`, `tailwind-merge@3.7.1`, `class-variance-authority@0.7.1`, `zod@4.6.7`, fontes OFL self-hosted via `@fontsource/*` ou `@fontsource-variable/*` (verifique a versão no registry antes de fixar).
- **Proibido** (para todas as versões): bibliotecas de mapa ou gráfico (mapbox, maplibre, leaflet, deck.gl, d3*, recharts, visx, chart.js etc.), UI kits completos (shadcn copiado, MUI, Chakra…), CDN de fontes, chamadas de rede em runtime. Mapa e gráficos em SVG próprio.
- Monte o projeto do zero ou com o gerador oficial do TanStack Start, terminando nas versões acima. **Não copie arquivos do Genesis nem de outros projetos locais.**

## Scripts exigidos no `app/package.json`
`dev`, `build`, `typecheck`, `test:e2e` e `serve` (serve o build de produção na porta de produção indicada acima, lendo `PORT` com esse valor como padrão).

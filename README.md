# Genesis
Built for the unknown.

Fundação de desenvolvimento modular para desafios ainda desconhecidos. Não é um produto, SaaS ou solução inscrita. A aplicação local reúne a fundação, o catálogo de componentes e os ensaios.

## Comece aqui
1. Leia `docs/BLUEPRINT.md` e `docs/strategy/COMPETITION.md`.
2. Abra esta pasta no Orca. Cole `prompts/00-master.md` em uma sessão que tenha acesso ao repositório.
3. A fase 00 valida stack, ambiente, versões e plano. Só depois do gate ela pode iniciar a fase 01, conforme instruções do prompt.
4. Consulte `docs/ROADMAP.md` e `docs/STATUS.md` a cada fase.

## Preparação e submissão
Mantenha este repositório privado e separado da submissão até confirmar o regulamento. Não copie código, arquivos, assets ou documentação prévia para a entrega se isso não for permitido. Não manipule datas de commits nem esconda autoria.

## Scripts
Requer Bun 1.4.5 e Node 24.
- `bun install --frozen-lockfile`
- `bun run dev` — http://127.0.0.1:3000 (`/smoke` para verificação rápida)
- `bun run build` — saída Vercel em `.vercel/output/`
- `bun run check` (Biome), `bun run typecheck` (TS 7 strict)
- `bun run test` (Vitest: projetos `unit` e `component`), `bun run test:e2e` (Playwright, Chromium)
- `PORT=3100 bun run test:e2e` — usa outra porta para o Playwright e o servidor. `dev` e `test:e2e:prod` também aceitam `PORT`. O padrão é 3000.
- `bun run test:e2e:prod` — compila com o preset Nitro `node-server`, serve `.output/` com Node e executa o projeto Playwright de produção.
- `bun run bench` — executa o benchmark local.

## Demos e Studio

A página inicial leva a `/demos`, `/studio` e `/smoke`. Em `/demos`, a comparação de rotas e a extração de evidências de documentos rodam no navegador, com exemplos sintéticos identificados e sem chamadas de IA. Os tempos de construção vêm dos [relatórios dos ensaios](docs/engineering/phase-07/).

O Studio é público por padrão. Acesse o catálogo em `/studio/catalog` e as prévias em `/studio/layouts/$name`. Defina `VITE_STUDIO_DISABLED=1` antes de compilar para remover o link da página inicial e responder HTTP 404 nas rotas do Studio. O CI verifica as duas configurações com `bun run test:e2e:prod` e `VITE_STUDIO_DISABLED=1 bun run test:e2e:prod`.

## Mapa
- `AGENTS.md`: regras canônicas de trabalho.
- `docs/BLUEPRINT.md`: escopo e arquitetura.
- `docs/design/`: direção visual e Figma.
- `docs/engineering/`: contratos, IA, evidências e operação.
- `docs/strategy/`: avaliação competitiva e dia do evento.
- `docs/product/`: campos em branco até conhecer o desafio.
- `prompts/`: instruções de entrada para Orca.

# Genesis Lab

> **Para criar um produto novo, use a [Genesis Base](../genesis-base) (`/Users/arthurgoncalves/orca/projects/genesis-base`, ADR 0007).** Este repositório é o laboratório: Studio, mundos, demos, ensaios (ISOTERMA, Entrelaços, Aceiro) e o histórico das fases.
Built for the unknown.

Fundação de desenvolvimento modular para desafios ainda desconhecidos. Não é um produto, SaaS ou solução inscrita. A aplicação local reúne a fundação, o catálogo de componentes e os ensaios.

## Comece aqui
1. Abra esta pasta no Codex ou no Claude Code e peça para continuar a partir de [AGENTS.md](AGENTS.md).
2. Consulte [Blueprint](docs/BLUEPRINT.md), [Roadmap](docs/ROADMAP.md) e [Status](docs/STATUS.md) para o estado atual e os gates.
3. Para um tema novo, siga o [protocolo de direção artística](docs/design/CREATIVE-DIRECTION.md), o [guia para iniciar um produto](docs/engineering/PORTABILITY.md) e o [Experience Registry](docs/design/EXPERIENCES.md). Valide com `bun run design:verify <url>` ([fidelidade](docs/design/FIDELITY.md)).

## Preparação e submissão
Mantenha este repositório privado e separado da submissão até confirmar o regulamento. Não copie código, arquivos, assets ou documentação prévia para a entrega se isso não for permitido. Não manipule datas de commits nem esconda autoria.

## Scripts
Requer Bun 1.4.5 e Node 24.
- `bun install --frozen-lockfile`
- `bun run dev` — http://127.0.0.1:3000 (`/smoke` para verificação rápida)
- `bun run build` — saída Vercel em `.vercel/output/`
- `bun run build:local` e `NITRO_HOST=127.0.0.1 NITRO_PORT=3000 bun run serve` — saída Node em `.output/` e execução local.
- `bun run check` (Biome), `bun run typecheck` (TS 7 strict)
- `bun run test` (Vitest: projetos `unit` e `component`), `bun run test:e2e` (Playwright, Chromium)
- `PORT=3100 bun run test:e2e` — usa outra porta para o Playwright e o servidor. `dev` e `test:e2e:prod` também aceitam `PORT`. O padrão é 3000.
- `bun run test:e2e:prod` — compila com o preset Nitro `node-server`, serve `.output/` com Node e executa o projeto Playwright de produção.
- `bun run bench` — executa o benchmark local.

## Projetos

Abra [`/projetos`](http://127.0.0.1:3000/projetos) para navegar pelas prévias do ISOTERMA e do Entrelaços. Para executar os dois projetos a partir do seletor:

```sh
bun run dev:projects
```

O comando inicia Genesis na porta 3000, ISOTERMA (versão C) na 3213 e Entrelaços na 3214. Quando o terminal mostrar a URL do seletor, escolha uma fase e use **Abrir projeto**. Pressione Ctrl+C para encerrar os três servidores. Com `bun run dev` ou no build do Genesis, a página apresenta as prévias.

O inicializador procura os projetos em `../../experiments/isoterma/version-c/app` e `../../experiments/entrelacos`, a partir da raiz do Genesis. Em outra estrutura de pastas, defina `GENESIS_ISOTERMA_DIR` e `GENESIS_ENTRELACOS_DIR` com os diretórios das aplicações. Instale as dependências em cada repositório com `bun install --frozen-lockfile`. Use `PORT` para mudar a porta do Genesis.

## Demos e Studio

A página inicial também leva a `/demos`, `/studio` e `/smoke`. Em `/demos`, a comparação de rotas e a extração de evidências de documentos rodam no navegador, com exemplos sintéticos identificados e sem chamadas de IA. Os tempos de construção vêm dos [relatórios dos ensaios](docs/engineering/phase-07/).

O Studio é público por padrão. Acesse o catálogo em `/studio/catalog` e as prévias em `/studio/layouts/$name`. Defina `VITE_STUDIO_DISABLED=1` antes de compilar para remover o link da página inicial e responder HTTP 404 nas rotas do Studio. O CI verifica as duas configurações com `bun run test:e2e:prod` e `VITE_STUDIO_DISABLED=1 bun run test:e2e:prod`.

## Mapa
- `AGENTS.md`: regras canônicas de trabalho.
- `docs/BLUEPRINT.md`: escopo e arquitetura.
- `docs/design/`: direção visual e Figma.
- `docs/engineering/`: contratos, IA, evidências e operação.
- `docs/strategy/`: avaliação competitiva e dia do evento.
- `docs/product/`: campos em branco até conhecer o desafio.
- `prompts/`: prompts opcionais de entrada e execução por fase.

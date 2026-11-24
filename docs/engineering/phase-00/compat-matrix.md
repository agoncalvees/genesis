# Matriz de compatibilidade do Genesis

Consulta de 24/11/2026. Escopo da Fase 00: inventariar o ambiente, identificar candidatos a partir do registro, comparar os guias oficiais e propor a prova da Fase 01. Os dois arquivos deste dispatch estão sob responsabilidade de Codex. Critério de aceitação: fonte por versão, bloqueios explícitos e comandos futuros identificados como proposta.

## Ambiente observado

| Item | Resultado |
|---|---|
| Sistema | `sw_vers`: macOS 26.6, build 25G72. `uname -sm`: Darwin arm64. |
| Git | `/usr/bin/git`, 2.50.1 (Apple Git-155). |
| GitHub CLI | `/opt/homebrew/bin/gh`, 2.105.0 (2026-11-17). |
| Bun | Ausente no `PATH` da sessão. |
| Node.js | Ausente no `PATH` da sessão. |
| npm | Ausente no `PATH` da sessão. |

Para validação futura, os índices oficiais retornaram Bun `1.4.5` e Node `24.22.3` com npm `11.19.1`. São candidatos observados. A pessoa responsável deve disponibilizar Bun e Node/npm na sessão Orca e confirmar as versões pelo terminal. [Release do Bun](https://api.github.com/repos/oven-sh/bun/releases/latest), [índice do Node](https://nodejs.org/dist/index.json).

## Dependências candidatas

`registry-confirmed` descreve a leitura de metadados publicados, inclusive licença e `peerDependencies`. `doc-confirmed` identifica instruções verificadas em fonte oficial. `tested` fica reservado à execução da capacidade. A tabela usa a tag `latest` consultada e explicita as exceções de pré-release. `∅` indica campo ausente ou vazio e `(opcional)` vem de `peerDependenciesMeta`. Os riscos indicam o que validar antes de congelar o lockfile.

| Pacote | Versão candidata | Finalidade | Peer dependencies | Fonte | Evidência | Risco |
|---|---|---|---|---|---|---|
| `@tanstack/react-start` | `1.169.7` | SSR, roteamento e funções de servidor | `vite: >=8.0.0` (opcional), `react: >=18.0.0 \|\| >=19.0.0`, `react-dom: >=18.0.0 \|\| >=19.0.0`, `@rsbuild/core: ^2.0.5` (opcional) | [npm](https://registry.npmjs.org/@tanstack%2Freact-start/latest) · MIT | tested | Node ≥22.12. Vite é opcional no metadado e obrigatório para o caminho escolhido. |
| `@tanstack/react-router` | `1.170.46` | Rotas tipadas | `react: >=18.0.0 \|\| >=19.0.0`, `react-dom: >=18.0.0 \|\| >=19.0.0` | [npm](https://registry.npmjs.org/@tanstack%2Freact-router/latest) · MIT | tested | Alinhar à dependência direta do Start para evitar cópias divergentes. |
| `react` | `19.3.1` | Renderização e interação | ∅ | [npm](https://registry.npmjs.org/react/latest) · MIT | tested | Manter o mesmo número de versão em React DOM. |
| `react-dom` | `19.3.1` | Renderização no servidor e navegador | `react: ^19.3.1` | [npm](https://registry.npmjs.org/react-dom/latest) · MIT | tested | Verificar hidratação e singleton de React. |
| `typescript` | `7.0.2` | Verificação estática em modo estrito | ∅ | [npm](https://registry.npmjs.org/typescript/latest) · Apache-2.0 | tested | Major nova. Confirmar emissão de diagnósticos, resolução de módulos e tipos gerados com o scaffold. |
| `vite` | `8.3.8` | Dev server e build | `tsx: ^4.8.1` (opcional), `jiti: >=1.21.0` (opcional), `less: ^4.0.0` (opcional), `sass: ^1.70.0` (opcional), `yaml: ^2.4.2` (opcional), `stylus: >=0.54.8` (opcional), `terser: ^5.16.0` (opcional), `esbuild: ^0.27.0 \|\| ^0.28.0` (opcional), `sugarss: ^5.0.0` (opcional), `@types/node: ^20.19.0 \|\| >=22.12.0` (opcional), `sass-embedded: ^1.70.0` (opcional), `@vitejs/devtools: ^0.7.1 \|\| ^0.8.0` (opcional) | [npm](https://registry.npmjs.org/vite/latest) · MIT | tested | Provar integração com Start, Tailwind e adapter de produção. Conferir engine de Node. |
| `tailwindcss` | `4.3.5` | CSS utilitário e tokens | ∅ | [npm](https://registry.npmjs.org/tailwindcss/latest) · MIT | tested | Manter versão alinhada ao plugin Vite. |
| `@tailwindcss/vite` | `4.3.5` | Integra Tailwind ao build | `vite: ^5.2.0 \|\| ^6 \|\| ^7 \|\| ^8` | [npm](https://registry.npmjs.org/@tailwindcss%2Fvite/latest) · MIT | tested | Faixa de Vite inclui a versão candidata. Provar compilação. |
| `@base-ui-components/react` | Sem estável (latest `1.0.0-rc.0`) | Nome anterior de Base UI | `react: ^17 \|\| ^18 \|\| ^19`, `react-dom: ^17 \|\| ^18 \|\| ^19`, `@types/react: ^17 \|\| ^18 \|\| ^19` (opcional) | [npm](https://registry.npmjs.org/@base-ui-components%2Freact/latest), [histórico](https://registry.npmjs.org/@base-ui-components%2Freact) · MIT | registry-confirmed | Deprecado, sem release estável no registro. Excluir da instalação. |
| `@base-ui/react` | `1.9.0` | Primitivas acessíveis sem estilos | `react: ^17 \|\| ^18 \|\| ^19`, `date-fns: ^4.0.0` (opcional), `react-dom: ^17 \|\| ^18 \|\| ^19`, `@date-fns/tz: ^1.2.0` (opcional), `@types/react: ^17 \|\| ^18 \|\| ^19` (opcional) | [npm](https://registry.npmjs.org/@base-ui%2Freact/latest) · MIT | tested | Validar portal, foco e teclado. Adicionar peers de data somente se a primitiva escolhida os exigir. |
| `motion` | `14.14.0` | Interações e animação | `react: ^18.0.0 \|\| ^19.0.0` (opcional), `remix: ^3.1.0` (opcional), `react-dom: ^18.0.0 \|\| ^19.0.0` (opcional) | [npm](https://registry.npmjs.org/motion/latest) · MIT | tested | Verificar SSR e reduced motion quando introduzido. |
| `@phosphor-icons/react` | `2.1.10` | Ícones | `react: >= 16.8`, `react-dom: >= 16.8` | [npm](https://registry.npmjs.org/@phosphor-icons%2Freact/latest) · MIT | registry-confirmed | Verificar custo de imports e hidratação quando introduzido. |
| `class-variance-authority` | `0.7.1` | Variantes de classes | ∅ | [npm](https://registry.npmjs.org/class-variance-authority/latest) · Apache-2.0 | registry-confirmed | Adotar quando uma primitiva exigir variantes. |
| `clsx` | `2.1.1` | Composição condicional de classes | ∅ | [npm](https://registry.npmjs.org/clsx/latest) · MIT | registry-confirmed | CVA já declara clsx como dependência. adicionar diretamente somente para imports próprios. |
| `tailwind-merge` | `3.7.1` | Resolver conflitos entre utilitários | ∅ | [npm](https://registry.npmjs.org/tailwind-merge/latest) · MIT | registry-confirmed | Testar classes e grupos dos tokens adotados antes de usar. |
| `convex` | `1.51.0` | Cliente, CLI e backend opcional | `react: ^18.0.0 \|\| ^19.0.0-0 \|\| ^19.0.0` (opcional), `@clerk/react: ^6.4.3` (opcional), `@auth0/auth0-react: ^2.0.1` (opcional), `@clerk/clerk-react: ^4.12.8 \|\| ^5.0.0` (opcional) | [npm](https://registry.npmjs.org/convex/latest) · Apache-2.0 | tested | Node ≥22 e engine de npm ≥7 declarados. Validar CLI, codegen e ausência de rede no smoke padrão. |
| `@convex-dev/react-query` | `0.1.0` | Integração reativa com React Query | `convex: ^1.29.3`, `@tanstack/react-query: ^5.0.0` | [npm](https://registry.npmjs.org/@convex-dev%2Freact-query/latest) · Apache-2.0 | registry-confirmed | Versão 0.x. Adicionar se houver necessidade de cache/loading com React Query. |
| `@tanstack/react-query` | `5.108.4` | Cache, carregamento e integração SSR | `react: ^18 \|\| ^19`, `@types/react: ^18 \|\| ^19` (opcional) | [npm](https://registry.npmjs.org/@tanstack%2Freact-query/latest) · MIT | registry-confirmed | Usar o mesmo cliente por instância de router com o adaptador Convex. |
| `zod` | `4.6.7` | Validação em fronteiras | ∅ | [npm](https://registry.npmjs.org/zod/latest) · MIT | tested | Usar onde o validador nativo não cobre. Conferir schemas com o AI SDK. |
| `ai` | `7.0.181` | SDK server-side de IA | `zod: ^3.25.76 \|\| ^4.1.8` | [npm](https://registry.npmjs.org/ai/latest) · Apache-2.0 | tested | Node ≥22. Validar modelo, streaming e structured output na Fase 04. |
| `@openrouter/ai-sdk-provider` | `3.1.0` | Provider comunitário do AI SDK | `ai: ^7.0.0`, `zod: ^3.25.76 \|\| ^4.1.8` | [npm](https://registry.npmjs.org/@openrouter%2Fai-sdk-provider/latest) · Apache-2.0 | tested | Node ≥22. Manter o pin acoplado ao major de ai, com teste real opt-in. |
| `@biomejs/biome` | `2.6.9` | Formatter e linter | ∅ | [npm](https://registry.npmjs.org/@biomejs%2Fbiome/latest) · MIT OR Apache-2.0 | tested | Validar binário para arm64 e Linux e excluir arquivos gerados. |
| `vitest` | `5.1.1` | Testes unitários | `vite: ^6.4.0 \|\| ^7.0.0 \|\| ^8.0.0`, `jsdom: *` (opcional), `happy-dom: *` (opcional), `@vitest/ui: 5.1.1` (opcional), `@types/node: ^22.0.0 \|\| >=24.0.0` (opcional), `@edge-runtime/vm: *` (opcional), `@opentelemetry/api: ^1.9.0` (opcional), `@vitest/coverage-v8: 5.1.1` (opcional), `@vitest/browser-preview: 5.1.1` (opcional), `@vitest/coverage-istanbul: 5.1.1` (opcional), `@vitest/browser-playwright: 5.1.1` (opcional), `@vitest/browser-webdriverio: ^5.0.0-beta.5 \|\| >=5.0.0` (opcional) | [npm](https://registry.npmjs.org/vitest/latest) · MIT | tested | Usar Node 24 e configuração de coleta restrita. Provar carregamento do Vite. |
| `@playwright/test` | `1.65.1` | Smoke em navegador | ∅ | [npm](https://registry.npmjs.org/@playwright%2Ftest/latest) · Apache-2.0 | tested | Node ≥20. Instalar Chromium correspondente à versão no ambiente de teste. |
| `@tanstack/cli` | `0.72.16` | Gerador oficial usado no estudo | ∅ | [npm](https://registry.npmjs.org/@tanstack%2Fcli/latest) · MIT | tested | Fixar versão e revisar arquivos gerados antes de migrar. |
| `create-convex` | `0.0.48` | Gerador da alternativa Convex-first | ∅ | [npm](https://registry.npmjs.org/create-convex/latest) · Apache-2.0 | registry-confirmed | O tarball lista o template tanstack-start. Revisar antes de considerar a alternativa. |
| `create-start-app` | `0.59.61` | Comando ainda referenciado no quickstart Convex | ∅ | [npm](https://registry.npmjs.org/create-start-app/latest) · MIT | registry-confirmed | Preferir o CLI indicado pelo Getting Started atual do TanStack. |
| `@vitejs/plugin-react` | `6.3.0` | Plugin React do Vite | `vite: ^8.0.0`, `oxc-transform-react: >=0.152.0 <0.157.0` (opcional), `@rolldown/plugin-babel: ^0.1.7 \|\| ^0.2.0 \|\| ^0.3.0` (opcional), `babel-plugin-react-compiler: ^1.0.0` (opcional) | [npm](https://registry.npmjs.org/@vitejs%2Fplugin-react/latest) · MIT | tested | Peer em Vite 8. Manter opções de compilador fora do núcleo inicial. |
| `@types/react` | `19.3.0` | Tipos de React | ∅ | [npm](https://registry.npmjs.org/@types%2Freact/latest) · MIT | tested | Verificar com TS e versão do React. |
| `@types/react-dom` | `19.3.0` | Tipos de React DOM | `@types/react: ^19.3.0` | [npm](https://registry.npmjs.org/@types%2Freact-dom/latest) · MIT | tested | Alinhar à faixa declarada de @types/react. |
| `@types/node` | `26.6.6` | Tipos para ferramentas Node | ∅ | [npm](https://registry.npmjs.org/@types%2Fnode/latest) · MIT | tested (24.19.2); registry-confirmed (26.6.6) | Latest abrange outro major. Usar a versão consultada 24.19.2 para Node 24. |
| `@tanstack/react-router-ssr-query` | `1.167.3` | Integração SSR de React Query | `react: >=18.0.0 \|\| >=19.0.0`, `react-dom: >=18.0.0 \|\| >=19.0.0`, `@tanstack/query-core: >=5.102.0`, `@tanstack/react-query: >=5.102.0`, `@tanstack/react-router: >=1.170.33` | [npm](https://registry.npmjs.org/@tanstack%2Freact-router-ssr-query/latest) · MIT | registry-confirmed | Conferir query-core transitivo e Router antes de introduzir. |
| `nitro` | `3.0.0` deprecada (latest `3.0.261103-rc`) | Adapter de produção do Vite para Vercel | `vite: ^7` (opcional), `xml2js: ^0.6.2` (opcional), `rolldown: *` (opcional) | [npm](https://registry.npmjs.org/nitro/latest) · [3.0.0](https://registry.npmjs.org/nitro/3.0.0) · MIT | registry-confirmed | Latest é RC. A 3.0.0 é deprecada e declara Vite 7. Ver a análise de hospedagem. |

### Leitura de compatibilidade

- O Start consultado depende diretamente de Router `1.170.46`, mesma versão retornada como `latest` do Router. [Manifesto do Start](https://registry.npmjs.org/@tanstack%2Freact-start/1.169.7). React e React DOM têm a mesma versão candidata. A faixa de Vite do Start, do plugin React, do Tailwind e do Vitest inclui Vite `8.3.8`. Node `24.x` atende aos engines declarados desse conjunto e dos CLIs analisados. Para os tipos de Node, a versão proposta é [`@types/node@24.19.2`](https://registry.npmjs.org/@types%2Fnode/24.19.2).
- As faixas do adaptador Convex incluem o Convex e o React Query da tabela. O quickstart adiciona `@tanstack/react-router-ssr-query` quando há integração SSR de React Query. A faixa dele também exige `@tanstack/query-core`. O manifesto do React Query fixa esse pacote em `5.108.4`, dentro da faixa declarada. Verificar a resolução no lockfile. [Manifesto do React Query](https://registry.npmjs.org/@tanstack%2Freact-query/5.108.4). A documentação usa `ConvexQueryClient.connect(queryClient)`, seus hooks e `ConvexProvider` para compartilhar o cliente. [Quickstart Convex](https://docs.convex.dev/quickstart/tanstack-start), [integração Convex](https://docs.convex.dev/client/tanstack/tanstack-start/).
- O peer do provider OpenRouter aceita o major `7` de `ai` e ambos aceitam o Zod da tabela. Guardar `OPENROUTER_API_KEY` e seleção de modelo no servidor. A compatibilidade declarada cobre as versões npm. Cada capacidade ainda depende do modelo escolhido e de execução autorizada. [AI SDK](https://ai-sdk.dev/providers/community-providers/openrouter), [OpenRouter](https://openrouter.ai/docs/guides/community/vercel-ai-sdk).
- A documentação de Base UI confirma `@base-ui/react` como nome atual. [Quick start Base UI](https://base-ui.com/react/overview/quick-start).

## TanStack Start, Convex e Vercel

**Scaffold oficial (doc-confirmed).** O TanStack documenta `npx @tanstack/cli@latest create` e oferece a alternativa `npx gitpick TanStack/router/tree/main/examples/react/start-basic start-basic`. Para Vercel, documenta `npx @tanstack/cli@latest create my-tanstack-app --deployment vercel`; em app Vite existente, orienta adicionar o plugin `nitro()` com `tanstackStart()` e `viteReact()` e usar `framework: "tanstack-start"` no `vercel.json`. O Convex documenta `npm create convex@latest -- -t tanstack-start` e ainda cita `npx create-start-app@latest` na etapa manual. O quickstart Convex chama Start de RC, enquanto o site do TanStack publica a documentação v1 e o registro oferece releases estáveis. Para o Genesis, usar o CLI do TanStack e tratar Convex como capacidade opcional. [Getting Started](https://tanstack.com/start/latest/docs/framework/react/getting-started), [Hosting](https://tanstack.com/start/latest/docs/framework/react/guide/hosting), [Quickstart Convex](https://docs.convex.dev/quickstart/tanstack-start).

**Runtime (doc-confirmed).** Proposta de Bun para instalação/lockfile e Node `24.x` para ferramentas com shebang de Node e para as Functions de produção. Vercel documenta Node 24 para builds e Functions e oferece Bun Functions em beta com configuração própria. Presença de `bun.lock` e uso de Bun na instalação não estabelecem o runtime das Functions. Inspecionar o artefato gerado pelo adapter e confirmar SSR e funções depois de um deploy autorizado. [Node 24 na Vercel](https://vercel.com/changelog/node-js-24-lts-is-now-generally-available-for-builds-and-functions), [Bun na Vercel](https://vercel.com/docs/functions/runtimes/bun), [TanStack Start na Vercel](https://vercel.com/kb/guide/deploy-a-tanstack-start-app-to-vercel).

**Risco do adapter (registry-confirmed).** O tarball oficial do gerador inclui um preset Vercel que fixa `nitro@3.0.260610-beta`, cujo peer de Vite aceita `^7 || ^8`. Na consulta, a tag `latest` aponta para outro pré-release e `3.0.0` declara Vite `^7` e está deprecada. A versão `3.0.1` indicada pela mensagem de depreciação retornou HTTP 404. Comparar o preset emitido e o canal atual em ambiente descartável. Se a equipe exigir dependências estáveis para hospedagem, manter o núcleo local e registrar a pendência de deploy até resolver Nitro. [Tarball do gerador](https://registry.npmjs.org/@tanstack/create/-/create-0.71.15.tgz), [Nitro do preset](https://registry.npmjs.org/nitro/3.0.260610-beta), [Nitro 3.0.0](https://registry.npmjs.org/nitro/3.0.0), [Nitro latest](https://registry.npmjs.org/nitro/latest).

**Variáveis (doc-confirmed).** `VITE_CONVEX_URL` no `.env.example` coincide com `import.meta.env.VITE_CONVEX_URL` do quickstart para o endpoint público de dados. O guia genérico de Vercel usa `CONVEX_URL` como exemplo e permite forçar o nome com `--cmd-url-env-var-name`. Para eventual build integrado e autorizado, a adaptação proposta é `bun run convex deploy --cmd-url-env-var-name VITE_CONVEX_URL --cmd 'bun run build'`, com `CONVEX_DEPLOY_KEY` restrita ao ambiente de build. Manter a CLI e suas variáveis de seleção de deployment separadas da configuração pública da UI. Toda variável `VITE_*` deve ser considerada visível ao navegador. [Quickstart Convex](https://docs.convex.dev/quickstart/tanstack-start), [Convex na Vercel](https://docs.convex.dev/production/hosting/vercel).

**Sem credenciais.** O alvo da Fase 01 é dev, build, checagens, unit e smoke E2E em loopback com dependências e Chromium instalados. Convex e IA ficam indisponíveis quando ausentes, sem construção de cliente, requests ou importação obrigatória de código gerado no núcleo. Fixtures, quando usadas, são rotuladas. Convex documenta desenvolvimento local anônimo em beta, que permite uma prova separada de queries/mutations sem conta, sujeita à preparação do backend local e ao download inicial do binário. Esse ensaio não comprova Convex Cloud. A prova de Cloud e a chamada real de IA dependem de configuração e autorização. [Convex local](https://docs.convex.dev/cli/local-deployments).

## Estratégia de scaffold e comandos propostos para a Fase 01

A inspeção estática em `/tmp/genesis-p00-cdx/` leu os tarballs oficiais de `@tanstack/cli`, sua dependência `@tanstack/create` e `create-convex`. O scaffold TanStack contém templates de raiz, Vite e TS estrito. O modo `--blank` reduz o conteúdo inicial a uma rota e retira Tailwind e testes do template. O bundle do Convex lista o template `tanstack-start`, apesar de o README empacotado omiti-lo da lista de exemplos. O estudo não executou geradores ou scripts npm. [CLI oficial empacotado](https://registry.npmjs.org/@tanstack/cli/-/cli-0.72.16.tgz), [templates TanStack](https://registry.npmjs.org/@tanstack/create/-/create-0.71.15.tgz), [gerador Convex empacotado](https://registry.npmjs.org/create-convex/-/create-convex-0.0.48.tgz).

**Proposta, ainda sem execução.** Após aprovação da Fase 00 e disponibilidade dos binários, gerar e revisar primeiro em diretório temporário vazio. As opções foram lidas no CLI publicado.

```sh
cd /tmp/genesis-p00-cdx
TANSTACK_CLI_TELEMETRY_DISABLED=1 npx @tanstack/cli@0.72.16 create genesis-start-study --framework react --build-tool vite --package-manager bun --blank --no-install --no-git --no-intent --yes
```

Comparar o inventário de arquivos e aplicar manualmente apenas os arquivos de configuração necessários, o router, as rotas mínimas e os testes. Preservar `README.md`, `AGENTS.md`, `CLAUDE.md`, `docs/`, `prompts/`, `.gitignore`, `.env.example`, `src/README.md` e os diretórios já definidos. Revisar arquivos ignorados e não rastreados, pois o `git status` já inicia com arquivos não rastreados. Qualquer colisão deve ser conciliada explicitamente. Deixar o preset Vercel para prova separada sem deploy. Se houver falha, reverter apenas as alterações da Fase 01 e ajustar o conjunto no temporário.

No manifesto revisado, fixar as versões efetivamente aprovadas. Limitar a instalação inicial a Start, Router, React, React DOM, Vite e plugin React, TypeScript e tipos, Biome, Vitest e Playwright. Integrar Tailwind se houver CSS de base já nesta fase. Acrescentar Base UI, Motion, ícones/utilitários, dados e IA apenas quando utilizados. Manter `bun.lock` junto ao manifesto. Candidatos de tabela podem mudar após a prova.

| Script proposto em `package.json` | Comando interno |
|---|---|
| `dev` | `vite dev --host 127.0.0.1 --port 3000 --strictPort` |
| `build` | `vite build` |
| `check` | `biome check .` |
| `typecheck` | `tsc --noEmit` |
| `test` | `vitest run` |
| `test:e2e` | `playwright test` |

```sh
# Na raiz, com o manifesto já revisado.
bun --version
node --version
npm --version
bun install
bun install --frozen-lockfile
bun run dev
# Em outro terminal, com dev ativo.
curl --fail --silent --show-error http://127.0.0.1:3000/smoke
# Após encerrar dev.
bun run build
bun run check
bun run typecheck
bun run test
bun run playwright install chromium
bun run test:e2e
```

Rodar geração de rotas pelo dev/build antes do typecheck em checkout limpo, ou versionar a árvore gerada se essa for a convenção confirmada do scaffold. Confirmar resolução única de Start/Router/React, scripts efetivos, hidratação e resposta 2xx. Registrar no STATUS o comando, o resultado e os bloqueios observados pela coordenação.

## Testes e CI

- `vitest.config.ts` com ambiente Node e inclusão de `tests/unit/**/*.test.ts`; validar inicialização sem env e tratamento de configuração opcional inválida. `bun run test` executa o script Vitest. [Vitest](https://vitest.dev/guide/).
- `playwright.config.ts` com Chromium, `testDir: "tests/e2e"`, `baseURL` loopback e `webServer` iniciando `bun run dev`; verificar rota smoke, conteúdo acessível e ausência de erros de página. O gate de produção exige smoke adicional contra o artefato SSR quando houver servidor de produção validado. [Playwright CI](https://playwright.dev/docs/ci).
- `biome.json` com lint, formatação, organização de imports e exclusão de saídas de build, `routeTree.gen.ts` e `convex/_generated/`. Manter `check` sem autoescrita. [Biome CLI](https://biomejs.dev/reference/cli/).
- Planejar `.github/workflows/ci.yml` após o build local. Em Linux, configurar Node 24 e a versão de Bun confirmada pelo gate com as actions oficiais, executar `bun install --frozen-lockfile`, `bun run build`, `bun run check`, `bun run typecheck`, `bun run test`, `bun run playwright install --with-deps chromium` e `bun run test:e2e`. Usar permissões de leitura e publicar traces de falhas como artefatos internos, sem credenciais. O ROADMAP posiciona a integração formal de CI na Fase 06. [Bun e GitHub Actions](https://bun.com/docs/pm/cli/install), [Playwright CI](https://playwright.dev/docs/ci).

## Pendências do gate

- A premissa de `OPERATIONS.md` sobre Bun instalado diverge do `PATH` observado. A pessoa responsável deve preparar os binários e aprovar o plano antes do scaffold.
- TypeScript, resolução de peers/engines, binários do Vite e Biome, codegen, browsers e SSR aguardam execução local. O preset Nitro envolve pré-release e exige prova própria ou decisão de adiar hospedagem. Confirmar a versão efetiva do runtime em eventual ambiente remoto autorizado.
- Cloud, custos e quotas dependem do plano, modelo e autorizações escolhidos. Regulamento e reutilização de código prévio aguardam confirmação humana. Nenhuma integração externa foi acionada.
- Revisão independente pendente. A autorrevisão checou a correspondência entre nomes, versões, fontes e escopo. A coordenação pode incorporar as evidências ao STATUS, que está fora dos arquivos atribuídos a este dispatch.

## Experimento isolado P00-CDX-02

Em 24/11/2026, `node --version`, `npm --version` e `bun --version` retornaram `v24.22.3`, `11.19.1` e `1.4.5`, respectivamente, com saída 0. Isso atualiza o retrato inicial do ambiente acima. O plano foi gerar o scaffold oficial, fixar os pins do ADR 0001, reproduzir a instalação e provar build, tipos, lint, teste unitário, SSR local e interação no Chromium. A variante opcional acrescenta quatro imports no servidor. Codex ficou responsável apenas por esta matriz e pelo checkpoint. Todos os arquivos executáveis, caches de instalação, navegadores e logs do estudo ficaram em `/tmp/genesis-p00-cdx/`, com `TANSTACK_CLI_TELEMETRY_DISABLED=1`.

| Etapa | Comando | Saída | Duração (s) | Trecho observado |
|---|---|---:|---:|---|
| Descobrir opções | `npx --yes @tanstack/cli@0.72.16 create --help` | 0 | 9,67 | `--framework`, `--build-tool`, `--package-manager`, `--blank` e `--yes`. npm mostrou aviso de nova versão major. |
| Scaffold | `npx --yes @tanstack/cli@0.72.16 create study --framework react --build-tool vite --package-manager bun --blank --no-git --yes --no-intent --no-install` | 0 | 1,51 | `Dependency installation skipped`; `Your TanStack app is ready in 'study'.` |
| Instalar pins | `bun install` | 0 | 2,94 | `Saved lockfile`; `157 packages installed`. |
| Lockfile | `bun install --frozen-lockfile` | 0 | 0,03 | `Checked 157 installs across 230 packages (no changes)`. |
| Build inicial | `bun run build` | 0 | 5,14 | Vite 8.3.8; 599 módulos cliente e 56 SSR; `dist/server/server.js`. |
| Verificar compilador | `bun run tsc --version` | 0 | 1,04 | `Version 7.0.2`. |
| Tipos iniciais e finais | `bun run tsc --noEmit` | 0 / 0 | 0,18 / 0,21 | Sem diagnósticos, com `strict`, árvore gerada de rotas e, no passe final, tipos explícitos de Node e React DOM. |
| Biome inicial | `bun run biome check` | 1 | 2,64 | `Found 16 errors`; scaffold e arquivos do estudo divergiam das regras padrão. |
| Formatação e configuração | `bun run biome check --write` | 0 / 0 / 0 | 0,06 / 0,07 / 0,14 | `Fixed 15 files` no primeiro passe, seguido de ajustes para os tipos explícitos e a hidratação. Configuração excluiu `routeTree.gen.ts`, `dist` e `test-results`. |
| Biome final | `bun run biome check` | 0 | 0,06 | `Checked 16 files`; `No fixes applied`. |
| Unitário | `bun run vitest run smoke.unit.test.ts` | 0 | 0,94 | Vitest 5.1.1; `1 passed`. |
| Chromium | `bun run playwright install chromium` | 0 | 19,15 | Chrome for Testing e Chrome Headless Shell 159.0.8154.6 (v1255). |
| Dev e SSR por HTTP | `node node_modules/vite/bin/vite.js dev --host 127.0.0.1 --port 43102 --strictPort` e `curl --retry 20 --retry-connrefused` em `/smoke`, via `../dev-check baseline` | 1 / 0 | 10,23 / 3,27 | Nos dois passes, curl repetiu a conexão após a primeira recusa e recebeu `HTTP 200` com `<h1>Genesis smoke</h1>`. Código 1 no primeiro passe veio do E2E chamado pelo script. O Vite ficou pronto em 459 / 442 ms. |
| E2E inicial | `bun run playwright test` | 1 | 8,31 | `getByText('Hydrated')` expirou após 5000 ms. O teste enviava Enter antes de aguardar a hidratação. |
| E2E após sincronização | `bun run playwright test` | 0 | 1,83 | `1 passed (1.4s)`. Confirmou CSS Tailwind (padding de 16 px), foco por Tab e ativação do botão Base UI por Enter após a hidratação, com reduced motion emulado. |
| Rebuild após sincronização | `bun run build` | 0 | 0,72 | `599 modules transformed` no cliente; 56 em SSR. |
| Opcionais | `bun add --exact convex@1.51.0 ai@7.0.181 @openrouter/ai-sdk-provider@3.1.0 zod@4.6.7` | 0 | 1,31 | `14 packages installed`; pins exatos gravados. |
| Build e tipos com opcionais | `bun run build` → `bun run tsc --noEmit` | 0 / 0 | 0,76 / 0,17 | `dist/server/assets/local-dependencies.server-Cz_EueUS.js`; typecheck sem diagnósticos. |
| SSR com opcionais | `../dev-check optional` | 0 | 1,50 | `HTTP 200`; `local-dependencies-ready` no HTML após execução da função de servidor. |
| Inspecionar artefatos | `rg -l "local-dependencies-ready" dist/server` e busca equivalente em `dist/client` | 0 / 1 | 0,01 (conjunto) | Encontrado no chunk de servidor. A busca no cliente retornou 1 por ausência do marcador. |
| Lockfile com opcionais | `bun install --frozen-lockfile` | 0 | 0,01 | `Checked 171 installs across 269 packages (no changes)`. |
| Biome com opcionais | `bun run biome check --write` → `bun run biome check` | 0 / 0 | 0,07 / 0,06 | `Fixed 2 files`; no segundo passe, `Checked 17 files` e `No fixes applied`. |

Bun não emitiu avisos de peer dependencies nas instalações. O Playwright mostrou o aviso de Node sobre `NO_COLOR` ignorado na presença de `FORCE_COLOR`. Motion emitiu no console do navegador o aviso esperado de reduced motion habilitado. O botão do smoke permaneceu desabilitado até a hidratação e o teste passou esperando que ele estivesse habilitado antes de simular o teclado.

**Veredito.** TypeScript 7.0.2 passou com o scaffold, rotas geradas e os opcionais. O critério para repetir com TS 5.x/6.x era a falha do typecheck. Os quatro opcionais foram exercitados apenas no import e execução local da função de servidor, com validação por Zod e sem chamadas a Convex Cloud ou OpenRouter. Codegen, persistência, chamadas de IA, adapter Nitro e deploy continuam pendentes de prova. As evidências acima se limitam aos caminhos exercitados, ao macOS arm64 observado e ao lockfile do estudo.

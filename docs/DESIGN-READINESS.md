# Design readiness (P09)

Estado do Genesis como **motor de design adaptável** em 2026-11-24. O tema do hackathon continua desconhecido; nada aqui é funcionalidade de negócio.

## Veredito
**Pronto para o dia do evento**, com as limitações listadas no fim. A mesma fundação gera produtos visualmente distintos a partir de um `DESIGN.md`, valida contraste/fontes/estrutura antes de aplicar e inicia um produto isolado com um comando.

## O que existe (com evidência)

| Capacidade | Onde | Evidência |
|---|---|---|
| Contrato visual ativo (spec Google `alpha`, CLI `@google/design.md@0.4.0`, Apache-2.0) | `design/DESIGN.md` (Genesis Neutral) | Linter oficial: 0 erros; `bun run design:lint` = 0 |
| Regras permanentes separadas da identidade | `docs/design/VISUAL-ENGINEERING.md` | Validadas pelo gerador (contraste, fontes registradas) |
| Motor isolado (adaptador, normalização semântica, validação, geração Tailwind v4, import em quarentena, apply explícito, diff, drift) | `tools/design-engine/`, ADR 0006, `docs/design/DESIGN-ENGINE.md` | `design:check` no CI; testes de motor, drift, limite de 1 MiB no import, carregamento de fontes |
| Temas escopados sem vazamento | `[data-world]` em `themes/generated/worlds.css` | E2E de dois mundos lado a lado; teste de fontes não requisitadas por `/` |
| Eixos estruturais (densidade, raio de controle, superfície, tipografia contextual, peso de ícone, scrim, motion) | `tokens/base.css`, componentes refatorados | Auditoria `AUDIT-P09.md`: 8 achados altos corrigidos |
| **Genesis Worlds**: Precision, Expressive, Cinematic, Civic | `design/worlds/*/DESIGN.md` + `REFERENCES.md`; `/studio/worlds` | Mesmos componentes e mesmos dados sintéticos; composição, densidade, geometria e motion diferentes; axe 0 violações em 360/768/1440 |
| Visualização de dados acessível | `src/design-system/dataviz` (Bar, Line, Sparkline, Legend) | Rótulos com tamanho de token e sem colisão (testado) |
| Motion engineering | `src/design-system/motion` (perfis still/calm/crisp/lively, spring, reveal, layout, micro-interação, path draw, apresentação de resultado) | Reduced motion zera tudo (E2E) |
| Padrões de experiência (lacunas reais da auditoria) | editorial, interface de IA apresentacional, upload, processamento com vazão, AppNav/BottomNav, ResizablePanels | Testes de componente + E2E em catálogo e mundos |
| Fluxo Figma → DESIGN.md | `docs/design/FIGMA-WORKFLOW.md` | Estrutura conferida contra exemplos que passam no linter; nenhum crédito Figma usado |
| Portabilidade | `bun run genesis:new` (`docs/engineering/PORTABILITY.md`) | Ensaio real com `--world precision --e2e`: clone com histórico, sem `origin`, `PROVENANCE.md`, demos/Studio removidos, 262 testes + E2E = 0, fonte IBM Plex carregada no navegador |

Números da última verificação completa no Genesis: `check`, `typecheck`, `build`, `design:check`, `design:lint` = 0; `test` 270+ passaram (1 opt-in de IA real ignorado); `test:e2e` 57; `test:e2e:prod` 12 em cada variante (Studio público e `VITE_STUDIO_DISABLED=1`).

## Como usar no dia
1. Creative sprint → `BRAND-BRIEF.md` (`FIGMA-WORKFLOW.md`, passos 1–2).
2. Partir do mundo mais próximo em `design/worlds/` e ajustar o `DESIGN.md`; `bun run design:lint`.
3. Iniciar o produto: `bun run genesis:new -- --name "<Nome>" --slug <slug> --world <id> --dir <caminho>`.
4. No produto: `bun run design:build`, `design:check`; construir sobre os componentes existentes (reusar → variante → componente novo).
5. Validar: `check`, `typecheck`, `test`, `build`, `test:e2e`.

## Escolha de mundo (heurística)
| Se o problema pede… | Comece por |
|---|---|
| ferramenta técnica, análise, dados densos | Precision |
| narrativa, impacto, apresentação para público | Expressive |
| um resultado central, demo imersiva | Cinematic |
| serviço público, qualquer cidadão, acessibilidade máxima | Civic |

## Limitações conhecidas (aceitas)
- Linter oficial 0.4.0 avisa sobre as chaves `genesis` e `motion` (o README do Google lista `motion`; o linter ainda não). Documentado em `REVIEW-P09.md`.
- Achados baixos da revisão independente (OC03-02…07): import aceita URLs de rede local; drift ignora arquivos extras em `generated/`; verificação cruzada com o export do Google compara só `primary`; CSS de composição dos mundos escopado por classe (não por `[data-world]`); `--focus` validado contra 2 superfícies; sem NOTICE de licenças OFL distribuído.
- Specs E2E de acessibilidade do Genesis dependem do Studio e **não** vão para o produto; o produto precisa escrever as suas na fase 1.
- Um E2E de hidratação falhou 1 vez em 6 execuções locais sob carga; não reproduzido em 5 reexecuções (inclusive cache frio). CI usa timeout de 15 s.
- Mundos Humanist, Scientific, Institutional e Organic Technology não foram criados: a arquitetura foi validada com 4; expandir só se o tema pedir.
- Nenhuma identidade de marca foi importada; awesome-design-md/getdesign.md usados só como referência de formato.

## Pendências humanas
- Revisão visual dos quatro mundos em dispositivo real (mobile).
- Escolher tolerâncias de fidelidade visual Figma ↔ código (proposta em `FIGMA-WORKFLOW.md`, passo 7).
- Autorizar uso de créditos Figma quando houver direção aprovada.

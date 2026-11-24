# Design engine — contrato (P09)

Decisão: ADR 0006. Regras permanentes: `VISUAL-ENGINEERING.md`. Este documento é o contrato entre DESIGN.md, gerador, componentes e mundos.

## Arquivos
```
design/
  DESIGN.md                    # identidade ativa do produto (hoje: Genesis Neutral)
  worlds/<id>/DESIGN.md        # mundos experimentais (Studio)
  worlds/<id>/REFERENCES.md    # referências, origem e licença
  imports/<nome>/              # quarentena de DESIGN.md externos (gitignored exceto README)
tools/design-engine/           # adaptador + normalizador + gerador (build-time; nunca importado por src/)
src/design-system/themes/generated/
  product.css                  # :root ← design/DESIGN.md
  worlds.css                   # [data-world="<id>"] ← design/worlds/*/DESIGN.md
```
Scripts: `design:lint`, `design:build`, `design:check` (drift, CI), `design:diff <a> <b>`, `design:import <arquivo|url>`, `design:apply <id|import>`.

## Contrato semântico (saída do normalizador)
Toda identidade precisa produzir **todas** estas variáveis, para claro e, se declarado, escuro:

| Grupo | Variáveis CSS |
|---|---|
| Superfícies | `--background --surface --surface-raised --border` |
| Texto | `--foreground --muted` |
| Ação | `--primary --on-primary --accent --on-accent --focus` |
| Estado | `--success/--on-success --warning/--on-warning --danger/--on-danger --info/--on-info` |
| Dados | `--data-1 … --data-6`, `--data-grid`, `--data-axis` |
| Tipografia | `--typeface-display --typeface-body --typeface-mono`, `--display-weight`, `--display-tracking`, `--heading-weight`, `--type-scale` (razão), `--text-base` |
| Geometria | `--radius-sm --radius-md --radius-lg --radius-control` (forma de botão/input), `--border-width` |
| Densidade | `--density` (0.75 compacto · 1 padrão · 1.25 amplo), `--control-height`, `--space-unit` |
| Superfície | `--surface-style` (`border` · `elevation` · `tint`), `--shadow-sm/md/lg` |
| Motion | `--duration-*` (escalados pelo perfil), `--ease-standard/enter/exit`, `--motion-intensity` (0–1), spring (`--spring-stiffness`, `--spring-damping`) |
| Ícones | `--icon-weight` (Phosphor: thin/light/regular/bold) |

Mapeamento a partir da spec do Google: `colors.*` → superfícies/texto/ação/estado por nome canônico (`primary`, `on-primary`, `surface`, …; nomes ausentes → erro, não autogeração); `typography.display|headline|body|label|mono` → tipografia; `rounded` → geometria; `spacing` → escala; `motion` → durações/easing. Chave de extensão **`genesis:`** carrega: `density`, `surfaceStyle`, `iconWeight`, `typeScale`, `displayWeight`, `displayTracking`, `motionProfile` (`still|calm|crisp|lively` + spring), `data` (paleta categórica), `composition`, `darkColors` (variante escura).

Validação (falha = não gera): todos os pares de `VISUAL-ENGINEERING.md` com contraste mínimo; paleta `data-*` com contraste ≥ 3:1 contra `--surface` e distinguível (ΔE mínimo documentado); fontes declaradas precisam existir no registro de fontes licenciadas (`tools/design-engine/fonts.ts` com pacote + licença).

## Mundos — direção de arte (primeira entrega: 4)
Mesmos componentes e mesmos dados sintéticos; mudam composição, densidade, geometria, superfície, tipo e motion.

| Mundo | Intenção | Luminância | Densidade | Geometria | Superfície | Tipo (OFL) | Motion | Dataviz | Composição |
|---|---|---|---|---|---|---|---|---|---|
| **Precision** | instrumento técnico confiável; inspirado nos *princípios* do Robin: contenção, hairlines estruturais, evidência inline | claro, quase monocromático + 1 acento funcional | compacta (0.8) | cantos 2–4px, hairlines 1px | `border` | IBM Plex Sans + IBM Plex Mono (numerais tabulares) | `crisp`: curto, sem overshoot | linhas finas, grade visível, valores rotulados | grade de trabalho multi-coluna, métricas no topo |
| **Expressive** | comunicar uma ideia com força editorial | claro quente, contraste alto, acento saturado | ampla (1.25) | contraste de formas: pill em ações, cartões retos | `tint` | Bricolage Grotesque (display pesado) + Figtree | `lively`: springs com leve overshoot, stagger | barras grossas, uma série destacada | pilha editorial: hero tipográfico, seções full-width |
| **Cinematic** | imersão e foco num resultado | escuro primeiro, superfícies em camadas | padrão (1) | raios médios 12–16px | `elevation` (sombras/brilho contidos, sem glass) | Sora + JetBrains Mono | `calm`: revelações lentas e suaves | área/gradiente sutil, fundo escuro, alto contraste de dados | painéis full-bleed, conteúdo central, pouca coisa por tela |
| **Civic** | serviço público claro para qualquer cidadão | claro, alto contraste AAA onde possível | ampla (1.15), alvos ≥ 44px | arredondado 8–12px | `border` espesso 2px | Newsreader (títulos) + Atkinson Hyperlegible (corpo) | `still`/mínimo | barras simples, rótulos diretos, sem legenda separada | coluna única guiada, passos numerados |

Próximos (após validar arquitetura): Humanist, Scientific, Institutional, Organic Technology.

## Componentes que precisam consumir os eixos
Definido pela auditoria `docs/design/AUDIT-P09.md`; mínimo: Button/IconButton (`--radius-control`, `--control-height`), Field/Input/Select (densidade), Card (`--surface-style`), Typography (display weight/tracking/scale), Badge, Tabs, ResultPanel, Metric (numerais mono tabulares quando o mundo pedir), motion presets (perfil por mundo), ícones (peso).

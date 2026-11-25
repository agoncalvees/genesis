# Auditoria OC — Aceiro (somente leitura)

**Data:** 2026-11-24 · **Modelo:** hy4-flash-free · **Tipo:** auditoria estática de código, sem execução de navegador.

## Escopo e método

- **Código auditado:** `src/features/aceiro/` (`aceiro.tsx`, `aceiro.css`, `instruments.tsx`, `field-map.tsx`, `field-art.ts`, `model.ts`, `chalk.ts`) e `src/routes/index.tsx`.
- **Contratos consultados:** `design/DESIGN.md` (especialmente *Comportamento e motion*, *Não fazer*, *Tipografia*, *Cor e materiais*, *Profundidade*) e `docs/product/IMPLEMENTATION-SPEC.md` (itens 12–25).
- **Tokens verificados:** `src/design-system/themes/generated/product.css`, `src/design-system/tokens/base.css`, `src/design-system/motion/presets.ts`, `src/styles/base.css`, `src/routes/__root.tsx` — apenas para confirmar o que o código de produto consome.
- **Escala de severidade:** **Alta** = bloqueia requisito explícito; **Média** = divergência visível ou perda de informação para o usuário; **Baixa** = inconsistência ou risco marginal.

## Resumo

| Categoria | Achados | Alta | Média | Baixa |
|---|---:|---:|---:|---:|
| 1. "Não fazer" | 5 | 0 | 2 | 3 |
| 2. Acessibilidade | 3 | 0 | 2 | 1 |
| 3. Estados ausentes/parciais | 2 | 0 | 1 | 1 |
| 4. Formatação numérica pt-BR | 1 | 0 | 0 | 1 |
| **Total** | **11** | **0** | **5** | **6** |

Nenhum achado de severidade Alta. Os pontos mais relevantes são o raio de borda circular nas anotações do mapa, a ausência de anúncio vivo para o inspetor e para o estado "desatualizado", e a contagem de leituras aplicada a apenas duas das três métricas.

---

## 1. Violações de "Não fazer"

### NC-01 — Cantos arredondados > 4 px nas anotações numeradas · **Média**
- **Arquivo:** `src/features/aceiro/aceiro.css:243-252` (linha exata: `aceiro.css:250`).
- **Evidência:**
  ```css
  .ace-map-steps b {
    inline-size: 20px;
    block-size: 20px;
    border: 1px solid var(--muted);
    border-radius: 50%;
  }
  ```
- **Contrato:** `design/DESIGN.md:227` — "cantos arredondados > 4 px"; `DESIGN.md:210` pede "três anotações em giz numeradas" e `DESIGN.md:167` pede "traço creme fino", não distintivos circulares.
- **Impacto:** `50%` de um caixa de 20×20 px resulta em raio de 10 px — mais que o dobro do permitido, e visualmente oposto à linguagem de anotação a lápis/giz. É o único `border-radius` > 4 px do produto; os controles usam `--radius-control: 3px` (`product.css:63`).

### NC-02 — `box-shadow` no cabo de comparação · **Baixa**
- **Arquivo:** `src/features/aceiro/aceiro.css:346-352` (linha exata: `aceiro.css:351`).
- **Evidência:**
  ```css
  .ace-compare-handle::before {
    content: "";
    position: absolute;
    inset: 0 calc(50% - 1px);
    background: var(--chalk);
    box-shadow: 1px 0 var(--map-ink);
  }
  ```
- **Contrato:** `design/DESIGN.md:198` — "Sem sombras em painéis; separação só por régua e luz do fogo".
- **Observação:** é uma sombra dura de 1 px usada como filete de contorno, não uma sombra difusa de painel; não há nenhum `box-shadow` de painel no produto. Ainda assim, a separação poderia ser feita com `border-inline-end` para aderir literalmente à regra.

### NC-03 — `--ember` no marcador de foco (possível laranja fora de fogo/ignição) · **Baixa**
- **Arquivo:** `src/features/aceiro/field-art.ts:366-385` (linhas exatas: `field-art.ts:383-384`).
- **Evidência:**
  ```ts
  context.strokeStyle = ink.chalk; // cruz de giz
  ...
  context.fillStyle = ink.ember;
  context.fillRect(x - 2, y - 2, 4, 4);
  ```
- **Contrato:** `design/DESIGN.md:194` — "`--ember` **somente** para fogo, a palavra-sinal do título e a ação de ignição. Nada decorativo em laranja."
- **Observação:** o marcador representa o ponto onde o fogo será aceso, então é interpretável como "ignição"; sinalizo como achado marginal para decisão explícita, não como violação confirmada. Não é decorativo.

### NC-04 — Ticks da escala de vento sem unidade · **Baixa**
- **Arquivo:** `src/features/aceiro/instruments.tsx:191-195` (linhas exatas: `192-194`).
- **Evidência:**
  ```tsx
  <div className="ace-wind-ticks" aria-hidden="true">
    {[0, 10, 20, 30, 40].map((mark) => (
      <span key={mark}>{mark}</span>
    ))}
  </div>
  ```
- **Contrato:** `design/DESIGN.md:228` — "Números sem unidade"; `DESIGN.md:187` — unidade em tamanho menor e `muted` ("ha", "%", "km/h").
- **Observação:** a leitura imediata ao lado traz `km/h` (`instruments.tsx:179-181`), então é uma convenção de escala aceitável; ainda assim os rótulos da escala de umidade receberam `%` apenas no primeiro (ver NC-05), o que torna o tratamento incoerente.

### NC-05 — Ticks de umidade: só o primeiro tem unidade · **Média**
- **Arquivo:** `src/features/aceiro/instruments.tsx:222-228` (linhas exatas: `223-227`).
- **Evidência:**
  ```tsx
  <div className="ace-humidity-ticks" aria-hidden="true">
    <span>80 %</span>
    <span>60</span>
    <span>40</span>
    <span>20</span>
    <span>10</span>
  </div>
  ```
- **Contrato:** `design/DESIGN.md:228` ("Números sem unidade") e `DESIGN.md:187` (`%` em tamanho menor/muted).
- **Impacto:** quatro dos cinco rótulos da mesma escala são números nus. É a inconsistência mais clara de unidade na interface visível.

---

## 2. Acessibilidade

### AC-01 — Inspetor de célula não é anunciado ao mover o cursor por teclado · **Média**
- **Arquivo:** `src/features/aceiro/field-map.tsx:425-434` (descrição) e `field-map.tsx:256-275` (`moveCursor`), `field-map.tsx:243` (`track`).
- **Evidência:**
  ```tsx
  <p id="ace-map-description" className="ace-sr">
    ...
    {inspected && ` Célula atual: ${inspected}, ${formatNumber(chance * 100)} por cento de chance de ignição a favor do vento.`}
  </p>
  ```
  O elemento é apenas alvo de `aria-describedby` da button (`field-map.tsx:388`); não tem `aria-live`, e o único `role="status"` do mapa está em `aceiro.tsx:424`, usado para eventos de simulação. O `ace-inspector` visual é `aria-hidden="true"` (`field-map.tsx:498`).
- **Contrato:** `design/DESIGN.md:223` — "ao passar **ou focar** uma célula, anotação pequena em mono mostra classe de combustível e probabilidade de ignição"; `IMPLEMENTATION-SPEC.md:23` — "Canvas com descrição textual atualizada".
- **Impacto:** a descrição muda a cada seta pressionada, mas leitores de tela não anunciam mudanças em `aria-describedby`; o usuário de teclado+leitor de tela não consegue acessar a classe de combustível nem a probabilidade sem re-sinalizar o controle. As duas regiões vivas existentes (`aceiro.tsx:391`, `aceiro.tsx:424`) cobrem apenas dica/erro e início/fim/resultado.

### AC-02 — Erro de carregamento e erro sem foco usam apenas anúncio polido · **Baixa**
- **Arquivo:** `src/features/aceiro/aceiro.tsx:177-185`, `aceiro.tsx:276-280`, `aceiro.tsx:387-394`.
- **Evidência:**
  ```tsx
  const hint = feedback || (loadFailed ? "O mapa não pôde ser carregado." : ...);
  ...
  if (classes) setFeedback("Marque um foco no mapa antes de acender.");
  ...
  <p id="ace-ignite-help" className="ace-help" role="status">{hint}</p>
  ```
- **Contrato:** `design/DESIGN.md:219` — "Erro: sem foco → mensagem inline em giz junto ao botão" (implementado); `IMPLEMENTATION-SPEC.md:23` — "Região viva anuncia início, fim e resultados".
- **Observação:** o texto inline existe e o foco permanece no botão, o que é adequado. Porém a falha de carregamento do terreno é um estado bloqueante e é veiculada por `role="status"` (polite), sem `role="alert"` nem deslocamento de foco — pode passar despercebida. Não é uma ausência de estado, apenas de ênfase.

### AC-03 — Estado "desatualizado" fora de região viva · **Média**
- **Arquivo:** `src/features/aceiro/aceiro.tsx:117-121` e `aceiro.tsx:236-238`, `aceiro.tsx:325-334`.
- **Evidência:**
  ```tsx
  {stale && (
    <p className="ace-stale" data-label>Resultado desatualizado</p>
  )}
  ...
  const invalidate = () => { if (comparison) setStale(true); };
  ```
  `invalidate()` é chamado por `edit()` (`aceiro.tsx:273`) e `weatherChange()` (`aceiro.tsx:333`), mas não chama `setAnnouncement`.
- **Contrato:** `design/DESIGN.md:218` — "alterar aceiro, foco, vento ou umidade após o resultado marca as leituras com 'desatualizado' e esmaece a comparação, sem apagá-la".
- **Impacto:** o estado visual existe (texto + `data-stale` em `field-map.tsx:306` / `aceiro.css:189-191`), mas usuários de leitor de tela não são informados de que os números exibidos não correspondem mais aos parâmetros atuais.

---

## 3. Estados ausentes ou parciais

### ES-01 — "Leituras rolam até o valor" aplicado a apenas 2 de 3 métricas · **Média**
- **Arquivo:** `src/features/aceiro/aceiro.tsx:122-137` (linhas exatas: `129-133`), com `AreaReading` em `aceiro.tsx:64-92`.
- **Evidência:**
  ```tsx
  {value === undefined ? (
    "—"
  ) : index === 0 ? (
    formatNumber(value)
  ) : (
    <AreaReading value={value} reduced={reduced} />
  )}
  ```
  "Área queimada" (`index === 0`) é estático no resultado; "Área preservada" e "Sem aceiros" usam `AreaReading` com `readMotionTiming(..., "showcase", "enter")` (560 ms, `--ease-enter`).
- **Contrato:** `design/DESIGN.md:217` — "leituras rolam até o valor"; `IMPLEMENTATION-SPEC.md:17` — mesmas leituras; `IMPLEMENTATION-SPEC.md:25` — reduced motion sem contagem.
- **Observação:** em `reduced` o comportamento está correto (sem contagem). A assimetria aparece apenas no modo normal — a métrica principal, que é a mais importante, não recebe o movimento de chegada.

### ES-02 — Pausa não refletida na descrição textual/atributos do mapa · **Baixa**
- **Arquivo:** `src/features/aceiro/field-map.tsx:301-309` e `field-map.tsx:425-434` (linha exata: `429`).
- **Evidência:**
  ```tsx
  <div className="ace-map" data-ready={...} data-comparing={...} data-stale={stale} ...>
  ...
  `{` ${breaks.size} células de aceiro, ${foci.length} de 3 focos. Hora simulada ${clock}.${locked ? ` Passo ${tick}.` : ""}`}`
  ```
  `locked` agrupa `running` e `paused`, então o texto não distingue "executando" de "pausado"; não há `data-phase`.
- **Contrato:** `design/DESIGN.md:216` — "Botão vira 'Pausar'; 'Recomeçar' disponível"; `IMPLEMENTATION-SPEC.md:23` — "descrição textual atualizada".
- **Observação:** o estado de pausa **existe** e funciona (`ignite()` em `aceiro.tsx:282-291`, rótulo "Retomar" em `instruments.tsx:302-308`, anúncio "Simulação pausada."), e a animação do fogo para (`field-map.tsx:215`). O achado é apenas a falta de representação do estado no mapa/canvas para quem não vê o botão.

**Estados verificados como presentes:** vazio (`field-map.tsx:435-447` com as três anotações e `aceiro.tsx:183-184` com o motivo textual do botão desabilitado); erro sem foco (`aceiro.tsx:278` + dica inline); desatualizado (AC-03, visualmente completo); pausa (ES-02, funcionalmente completo).

---

## 4. Inconsistências de formatação numérica pt-BR

### NB-01 — Sinal de porcentagem com e sem espaço na mesma interface · **Baixa**
- **Arquivo:** `src/features/aceiro/instruments.tsx:223` (`80 %`), `src/features/aceiro/field-map.tsx:511` (`12,3% ignição`), `src/features/aceiro/field-map.tsx:464` (`50% do mapa`), `src/features/aceiro/instruments.tsx:245` (`<small>%</small>`).
- **Evidência:** a escala de umidade escreve `80 %` (com espaço), enquanto o inspetor e o valor de comparação escrevem `50%`/`12,3%` (sem espaço).
- **Contrato:** `design/DESIGN.md:188` — "Números em pt-BR (vírgula decimal, ponto de milhar)"; `DESIGN.md:187` — unidade "%" em tamanho menor e `muted`.
- **Observação:** a vírgula decimal está correta (`formatNumber` usa `Intl.NumberFormat("pt-BR", { maximumFractionDigits: 2 })` em `instruments.tsx:26-30`), e os `aria-valuetext` por extenso ("graus", "quilômetros por hora", "por cento" em `instruments.tsx:136,202,235` e `field-map.tsx:431`) são boa prática para leitores de tela — **não** são inconsistência. O único ponto é o espaçamento visual do `%`.

---

## Verificações conformes (sem achado)

- **Texto em inglês:** nenhum encontrado na interface. Rótulos, dicas, anúncios e escalas estão em pt-BR; as iniciais de rumo são portuguesas (`N, NE, L, SE, S, SO, O, NO` — `instruments.tsx:34`). `src/routes/index.tsx:6` define `staticData: { language: "pt-BR" }`, propagado para `<html lang>` em `src/routes/__root.tsx:44-48`.
- **Modelo didático:** presente em `aceiro.tsx:419` ("Modelo didático, não preditivo"), como exige `DESIGN.md:229` e `IMPLEMENTATION-SPEC.md:18`.
- **Escala declarada:** `aceiro.tsx:420` — "1 célula = 0,25 ha"; compatível com `model.ts:3` e com a barra `250 m` (`field-map.tsx:494`), já que 5 células × 50 m = 250 m.
- **Cores：** `--ember` restrito a fogo (`field-art.ts:203,230`), palavra-sinal (`aceiro.css:83-85`) e ação de ignição (`aceiro.css:699-704`); `--risk-high: #ff5a1f` (`aceiro.css:11`) corresponde ao topo da escala de risco prescrita em `DESIGN.md:195` — não é violação.
- **Sombras de painel:** inexistentes; apenas o filete de NC-02. Gradientes presentes são funcionais (véu radial do título, autorizado por `DESIGN.md:172`; scrim inferior para legibilidade; preenchimento de dados de vento/umidade) — não são "gradientes decorativos" no sentido de `DESIGN.md:227`.
- **Ícones / emoji:** Phosphor com `weight="light"` e `currentColor`; nenhum emoji. O glifo `✳` (`field-map.tsx:294`) é um símbolo tipográfico com apresentação textual, não emoji.
- **Nomes acessíveis:** button do mapa (`aria-label` + `aria-describedby`), `radiogroup` e rádios com `<label>`, ranges com `aria-label`/`aria-valuetext`, botões de ação com texto/`aria-label`, seções com `aria-label`, `img` com `alt`. Nenhum controle sem nome.
- **Ordem de foco:** mapa → alça de comparação (quando presente) → vento (direção, velocidade) → umidade → 3 ferramentas → Acender → Recomeçar, coerente com a leitura da tela; nada focalizável escondido atrás de `aria-hidden`.
- **Alvos ≥ 44 px:** `aceiro.css:657-667` (ferramentas e ações), `aceiro.css:695` (Recomeçar 44 px), `aceiro.css:340` (alça 44 px), `.ace-wind-scale` com `min-block-size: 44px` (`aceiro.css:523-527`),`.ace-compass` 161 px (`aceiro.css:455-460`), não-compass 110×132 px (`aceiro.css:575-582`). Inputs invisíveis cobrem 100% de seus recipientes (`aceiro.css:366-377`).
- **Reduced motion:** coberto em `aceiro.tsx:69-71,209-213,302-305`, `field-map.tsx:166-191,215`, `field-art.ts:271,275,280-294` (setas estáticas), `instruments.tsx:71-77` (sem spring) e `aceiro.css:976-981`, além da zeragem de tokens em `tokens/base.css:26-44` e de `readMotionTiming` em `presets.ts:39-43`. A comparação aparece em 50% sem transição, como prescreve `DESIGN.md:224`.
- **Motion do resultado:** `clip-path` de 0 → 50% em 560 ms com `--ease-enter` (`aceiro.css:153-162`; tokens em `product.css:79,83`) — confere com `DESIGN.md:217`.
- **Foco visível:** `:focus-visible` global com `outline: 2px solid var(--focus)` (`src/styles/base.css:111-114`; `--focus: #f6efe0` em `product.css:16`), com realces específicos em `aceiro.css:205-207,684-691`.

## Limitações

- Auditoria estática: não houve execução de navegador, medição de contraste calculada, teste com leitor de tela nem verificação de 60 fps. As conclusões sobre ordem de foco e alvos vêm da leitura do DOM/CSS e podem diferir em dispositivos reais.
- Não foram executados `check`, `typecheck`, `test`, `test:e2e` ou `design:verify`; nenhum código foi modificado e nenhum commit foi feito.
- NC-03 e NC-02 são julgamentos de fronteira (interpretáveis como conformes); estão registrados para decisão explícita, não como certezas.

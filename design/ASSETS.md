# Assets do Aceiro

Os três PNGs foram gerados com a ferramenta nativa ImageGen do Codex (`image_gen`). A ferramenta não informou o identificador exato do modelo. Foi gerada e selecionada a primeira versão de cada asset, em chamadas independentes, sem imagens de entrada.

Os originais foram copiados para `raw/` byte a byte. Os WebP foram codificados em qualidade 82 no Pillow 11.3.0. O terreno e o espécime mantêm a resolução gerada. O conceito teve um recorte de 1 px em cada borda para atingir 16:10 exatos.

| Arquivo web | Dimensões | Tamanho | PNG original | Dimensões | Tamanho |
| --- | ---: | ---: | --- | ---: | ---: |
| [`terrain.webp`](terrain.webp) | 1.448 × 1.086 | 337.796 bytes | [`raw/terrain.png`](raw/terrain.png) | 1.448 × 1.086 | 3.385.977 bytes |
| [`specimen.webp`](specimen.webp) | 1.086 × 1.448 | 118.914 bytes | [`raw/specimen.png`](raw/specimen.png) | 1.086 × 1.448 | 1.873.426 bytes |
| [`concept.webp`](concept.webp) | 1.584 × 990 | 422.508 bytes | [`raw/concept.png`](raw/concept.png) | 1.586 × 992 | 3.395.091 bytes |

## Avaliação visual

- **Terreno.** A composição tem leitura de planta, sem horizonte, com o córrego e a estrada vistos de cima. Algumas copas, galhos e faces do afloramento têm volume e ligeira obliquidade, portanto a ortogonalidade é aproximada. O corredor úmido em verde-azulado escuro se distingue bem do campo seco ocre. O cerrado arbustivo aparece em oliva e a rocha em cinza-bege claro. As bordas das copas e os buritis misturam tons de vegetação úmida e seca. A estrada estreita, em bege quente, se aproxima dos pixels mais claros do capim. As classes são separáveis nas grandes manchas pela cor, mas um limiar simples de cor ou luminância pode confundir os limites e a estrada. A classificação por célula precisaria de uma máscara revisada.
- **Espécime.** Escolhi o pequizeiro como tema. A gravura mostra o rebrote com folhas trifolioladas acima da base escurecida e rachada. O fundo carvão parece liso em escala de uso, com pequenas variações de tom no arquivo.
- **Conceito.** O mapa ocupa cerca de dois terços da largura e sugere relevo com árvores ligeiramente inclinadas. O título, a frente de fogo, os aceiros em giz, a hachura da área queimada e os controles do caderno de campo estão presentes. As leituras em hectares são ilustrativas.

## Termos de uso

Os Termos de Uso da OpenAI atribuem ao usuário, na relação com a OpenAI e na medida permitida pela legislação aplicável, os direitos que a OpenAI tiver sobre a saída. Os termos também preveem que saídas podem se assemelhar às de outros usuários. Este registro não acrescenta licença de redistribuição aos arquivos. [Termos de Uso da OpenAI](https://openai.com/policies/terms-of-use/)

## Prompts finais

### `terrain`

```text
Generate one original base terrain image for Aceiro, a Brazilian Cerrado firebreak simulation. Canvas exactly 4:3 landscape, ideally 2048 × 1536. A strict straight-down orthogonal map at uniform scale, covering the entire canvas edge to edge: camera nadir, flat planimetric shapes, no perspective, no slanted trees, no horizon, no cast shadows. A narrow sinuous muted dark teal stream (#2f5552) with a buriti-palm wetland runs continuously from top to bottom just right of center, flanked by darker muted teal gallery forest. Broken islands of olive (#7d7a45) scrub Cerrado with tiny twisting crowns visualized strictly from above, contrasted against broad uninterrupted fields of dry golden ochre (#a8894a) and straw. One pale, cool, gray-beige rock outcrop and a clearly distinguishable fine pale earth road crossing the lower part. Keep strong hue and value separation among the dark teal wet corridor, mid-value olive scrub, warm ochre grass, and pale desaturated rock and road, with broad readable color masses and restrained local texture so the painting can serve as a fuel classification reference. Art direction: dry-season August Cerrado, opaque hand-painted gouache on subtle fine paper grain, with hints of thin etched hatching, a vintage field map as illustration. Diffuse light and matte pigments. No fire, no smoke, no text, no labels, no compass, no legend, no symbols, no frame, no border.
```

### `specimen`

```text
Generate one original portrait 3:4 botanical spot illustration for the Aceiro Cerrado field notebook interface. A single pequi tree (Caryocar brasiliense) branch, charred at the lower end and re-sprouting. Show a handful of new leaves opening from a side shoot above the blackened stump, with botanically plausible trifoliate leaves and gently serrate leaflets. Center the specimen with generous breathing space and an organic diagonal rising from the lower center. Exquisitely fine cream (#efe6d2) etched lines, sparse crosshatching and stippling, antique metal-plate botanical etching, matte field notebook palette. The lower char is conveyed by denser cream hatching around cracked dark bark and still reads against the completely flat solid warm charcoal background (#15110e) that goes edge to edge. Cream ink only. No text, numbers, specimen label, frame, border, shadow, ambient glow or texture in the charcoal background.
```

### `concept`

```text
Generate one original full-bleed 16:10 desktop UI visual concept for Aceiro, a Brazilian educational simulation of Cerrado firebreaks. Render the screen itself straight on and edge to edge. Direction is Carta de campo ao entardecer: a brigadista’s field notebook meets an old topographic chart in the dry season. Left ~68% full-bleed strictly top-down Cerrado gouache map, dry ochre grass, olive brush, meandering dark teal stream and riparian forest, pale rock, subtle etched topographic strokes. Overlaid at the upper left in very large high-contrast editorial serif, in cream, the exact Portuguese title “O fogo lê o vento.” with only “vento” in italic ember orange. Lower across the map, a thin luminous ember-orange to amber advancing fire front (#ff5a1f to #ffb347), charcoal burned ground (#3a332e) with clearly visible etched diagonal hatching behind it, and sparse deliberate cream chalk lines drawn as firebreaks. Fire is the only source of light. Right ~32% solid warm charcoal (#15110e) field-notebook column, with comfortable spacing and a deliberate information hierarchy. Show a compact compass rose with selectable wind direction, an adjacent vertical humidity scale labeled “Umidade”, a tool row labeled “Aceiro”, “Foco”, “Apagar”, a prominent matte button “Acender foco”, and paired monospaced readouts “Área queimada” and “Área preservada”. Cream paper and chalk (#efe6d2), newspaper grotesk for labels, instrument mono for measurements, fine hairline rules and metal-engraving hatching. Keep the typography composed and the controls convincing. Brasa and dry Cerrado palette only. No logos, browser chrome, monitor or device mockup, gradients in purple, neon, gloss, or glass effects.
```

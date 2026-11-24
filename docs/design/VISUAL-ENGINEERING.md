# Visual engineering — regras permanentes

Valem para **qualquer** identidade (DESIGN.md do produto ou de um mundo). Um DESIGN.md não pode relaxá-las; o gerador falha se forem violadas.

## Contraste (WCAG 2.2 AA mínimo)
- Texto normal ≥ 4.5:1: `foreground`/`background|surface|surface-raised`, `muted`/`background|surface`, todo `on-*`/`*`.
- Texto grande e componentes não textuais ≥ 3:1: `focus`/`background|surface`, `border` de controles interativos/`background`, cada `data-n`/`surface`.
- Informação nunca depende só de cor (rótulo, forma ou padrão junto).

## Interação
- Foco visível em todo elemento interativo (`:focus-visible`, anel ≥ 2px, contraste ≥ 3:1). Nunca `outline: none` sem substituto.
- Alvos ≥ 24×24 CSS px (2.5.8); mundos com densidade compacta não reduzem abaixo disso.
- Teclado completo; ordem de foco = ordem visual; Escape fecha camadas; foco volta ao gatilho.

## Motion
- `prefers-reduced-motion: reduce` zera durações e desliga movimento não essencial em todos os mundos; estado nunca depende de animação.
- Animar apenas `opacity`, `transform`, `clip-path`, `filter` leve; layout via técnicas FLIP do Motion. Proibido animar `width/height/top/left` diretamente.
- Nenhuma animação bloqueia clique; durações de interação ≤ 400 ms; revelações de apresentação ≤ 600 ms.
- Progresso reflete medida real; desconhecido = indeterminado.

## Tokens e componentes
- Componentes referenciam só variáveis semânticas e eixos (`DESIGN-ENGINE.md`). Literais de cor, fonte, raio, sombra ou duração em componentes são erro (teste automatizado).
- Temas são escopados (`data-world` / `:root`); nenhum estilo de um mundo pode afetar elemento fora do seu escopo.
- Fontes: apenas de `tools/design-engine/fonts.ts` (pacote + licença registrados), self-hosted, com fallback de sistema.

## Responsividade e performance
- Sem overflow horizontal em 360 / 768 / 1440 px e zoom 200%.
- Imagens com dimensões e `alt`; SVG informativo com `title`/`desc`.
- Fontes de mundos carregadas apenas onde usadas.

## Direção artística e recursos gerados

1. Defina problema, público, contexto cultural e momento central da demonstração. Escolha até três referências e registre a contribuição de cada uma. Crie o `design/DESIGN.md` do produto com a identidade e os comportamentos. Use o linter e gere os tokens antes de compor a interface.
2. Verifique as ferramentas disponíveis na sessão e as permissões da operação. Use Figma MCP para composição, exploração e handoff quando houver acesso autorizado a um arquivo. Use geração de imagens para arte conceitual, fotografia, ilustração, materiais ou mascotes com papel no produto. Para diagramas técnicos e comportamento interativo, use um recurso gráfico adequado ao conteúdo, como SVG, CSS, Canvas ou Motion. Sem ferramenta disponível, registre a limitação e mantenha o fluxo central executável. Não contrate serviços nem adquira créditos.
3. Produza de um a três recursos estratégicos. Confira enquadramento em telas pequenas, consistência com a direção, legibilidade e peso. Exporte com dimensões proporcionais ao uso, comprima para web, use texto alternativo quando informativo e mantenha dados pessoais fora de prompts. Registre ferramenta, origem, prompt quando pertinente, licença ou termos conhecidos e arquivo final.
4. Abra o resultado no navegador. Espere as fontes carregarem e confira família efetivamente carregada, peso, tamanho do título, numerais, cores, foco e espaçamento nos elementos centrais. `design:check` verifica os arquivos gerados. Use Playwright com `getComputedStyle` e `document.fonts.check` para as regras de identidade que precisam de regressão. Exercite a interação e capture desktop e mobile após refinamento. Documente evidências e limites no checkpoint.

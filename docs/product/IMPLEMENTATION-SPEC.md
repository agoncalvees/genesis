# Aceiro — especificação de implementação (passo 7)

Você implementa **uma tela principal excepcional** na rota `/`. A direção artística já está decidida: leia `design/DESIGN.md` (inteiro, é o contrato) e **olhe `design/concept.webp`** (conceito visual de referência; a interface final deve ser ao menos tão rica quanto ele, com tipografia e controles mais precisos). Leia também `docs/design/MOTION.md` e `docs/design/EXPERIENCES.md`. Não use a aparência do Genesis Studio, cards, layouts ou mundos do Genesis. Use primitivas Genesis só onde ajudarem no comportamento (ex.: `AnimatedNumber`, `useHydrated`).

## Mecanismo
1. **Grade de combustível a partir da arte.** Carregue `public/art/terrain.webp` num canvas fora da tela e amostre uma grade (~160×120 células, ajuste se necessário). Classifique cada célula por cor (HSL/OKLab) em: `water` (vereda/mata de galeria verde-azulada escura, combustível 0,06), `scrub` (cerrado oliva, 0,45), `grass` (campo ocre/palha, 0,9), `bare` (rocha cinza-bege e estrada clara, 0). Use a moda de uma janela 3×3 para suavizar. A estrada fina se confunde com capim claro: aceite isso ou trate pela saturação; registre a decisão. Escreva a classificação como função pura testável.
2. **Autômato celular estocástico com semente** (PRNG determinístico, ex.: mulberry32). Estados: não queimado, queimando (dura N passos conforme combustível), queimado. A cada passo, cada célula queimando tenta ignitar as 8 vizinhas com p = combustível × (1 − umidade·k) × fatorVento(alinhamento entre direção vizinha e vento, velocidade) × fatorDiagonal. Aceiros zeram o combustível. Calibre para que, com vento médio (15 km/h) e umidade 30 %, um foco no campo seco atravesse boa parte do mapa em ~10–20 s a ~12 passos/s, e que a vereda geralmente segure o fogo.
3. **Contrafactual:** ao acender, rode também (sincronamente, sem render) o mesmo cenário **sem aceiros** com a mesma semente. Resultado: área queimada com e sem aceiros, área preservada = diferença (≥ 0, mostre 0 se negativa e explique). Converta células em hectares (escolha a escala, ex.: 1 célula = 0,25 ha, declare na interface).
4. Lógica em `src/features/aceiro/` (modelo puro, sem React) e UI em componentes próprios do produto.

## Tela
Siga a composição, escala, tipografia, cor, profundidade, narrativa e comportamento do DESIGN.md. Pontos inegociáveis:
- Mapa sangrando 68 % à esquerda no desktop, título sobreposto ("O fogo lê o *vento*."), coluna de instrumentos de carvão à direita; mobile com mapa em largura total e barra inferior de ferramentas.
- Canvas: terreno + cicatriz hachurada + aceiros em giz + fogo aditivo com cintilação + partículas de vento + anotações de instrução numeradas + inspetor de célula (hover/foco) + hora simulada.
- Rosa dos ventos arrastável e por teclado; escala de umidade vertical arrastável e por teclado; ferramentas Aceiro / Foco / Apagar (radiogroup); Acender ↔ Pausar; Recomeçar.
- **Momento-assinatura:** comparação com alça vertical arrastável (e por teclado) que revela "sem aceiros" | "com aceiros" sobre o próprio mapa, entrando com `clip-path`.
- Leituras "Área queimada", "Área preservada" (e "Sem aceiros") em mono tabular, pt-BR, com unidade; estado "desatualizado" quando parâmetros mudam após o resultado.
- Espécime `public/art/specimen.webp` no rodapé da coluna com legenda curta sobre o Cerrado e o fogo (sem citar fontes que você não verificou). Rótulo "Modelo didático, não preditivo".
- Atributos exigidos por `design/fidelity.json`: `data-hero-title`, `data-signal-word`, `data-reading`, `data-label`, `data-action="ignite"`, `data-map`. Defina os tokens de produto (`--ember`, `--ember-hot`, `--ash`, `--chalk`, `--vereda`, `--hatch`) em `:root`.
- Grão de papel e hachura feitos em SVG/CSS/canvas, sem novos assets.

## Acessibilidade e motion
- Tudo operável por teclado: o mapa é focável; setas movem um cursor de célula visível; Enter/Espaço aplica a ferramenta atual (aceiro pinta a célula sob o cursor; foco marca). Região viva anuncia início, fim e resultados. Canvas com descrição textual atualizada.
- `prefers-reduced-motion`: sem partículas (setas estáticas), simulação mostra o estado final imediatamente com os mesmos números, comparação a 50 % sem transição.
- Foco visível em giz; alvos ≥ 44 px; contraste conforme DESIGN.md. 60 fps no desktop (use `requestAnimationFrame`, `ImageData`/`putImageData` ou desenho em camada de baixa resolução escalada).

## Entrega e evidências
- Atualize `tests/e2e/smoke.spec.ts` para o novo título e escreva `tests/e2e/aceiro.spec.ts`: fluxo com teclado (traçar aceiro, marcar foco, acender, ver resultado com números), erro sem foco, desatualizado, reduced motion, sem overflow em 360/768/1440, axe sem violações. Testes unitários para classificação e autômato (determinismo por semente, aceiro bloqueia propagação em caso controlado).
- Rode e reporte: `bun run check`, `typecheck`, `test`, `build`, `test:e2e`, e com o servidor de dev em 3000: `bun run design:verify` (deve passar). Olhe as capturas em `design/evidence/` com sua ferramenta de visualização de imagem e compare com `design/concept.webp`; faça **uma rodada de refinamento** corrigindo as três maiores divergências de composição/hierarquia antes de concluir, e registre-as.
- Capture também o estado de resultado com a comparação visível (desktop e mobile) em `design/evidence/resultado-*.png`.
- Dependências novas só se justificadas (licença, peso); registre em `PROVENANCE.md`. Commits locais pequenos; sem push, deploy ou serviços pagos.
- Escreva no fim de `docs/STATUS.md`: comandos e resultados reais, decisões (classificação, calibração, escala), divergências corrigidas e limitações.

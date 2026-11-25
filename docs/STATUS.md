# Fase 0 do produto

Tema e escopo a definir em `docs/product/`. A validação da inicialização está em `PROVENANCE.md`.

## Aceiro — tela principal implementada

O passo 7 entregou a carta interativa em `/`. O código do produto fica em `src/features/aceiro/`, com entrada em `src/routes/index.tsx`. Os critérios de aceite foram o fluxo de manejo operável por ponteiro e teclado, a comparação com a mesma semente, os seis comandos aprovados e a inspeção da tela nos três tamanhos. Implementação e testes no commit `ca672b80f31ae7626ef097ec44a582a1da2e6a8c`.

### Modelo

- O canvas fora da tela amostra a arte em 160 × 120. A classificação por HSL separa vereda, cerrado arbustivo, campo seco e rocha/estrada, com moda 3 × 3. Baixa saturação e alta luminosidade ajudam a identificar rocha e estrada. Trechos finos da estrada ainda se confundem com capim e podem queimar.
- Com vento de 15 km/h a nordeste e umidade de 30%, dois ensaios separados de um único foco em campo seco, nas células (42, 54) e (32, 48), terminaram em 141 passos, equivalentes a 11,75 s a 12 passos/s. Cada ensaio queimou cerca de 9.570 das 19.200 células. Queimaram 59 e 55 das 4.115 células de vereda, respectivamente.
- O contrafactual usa o mesmo sorteio para cada tentativa equivalente. Se vento ou umidade mudarem durante a propagação, o cenário sem aceiros é recalculado com o histórico meteorológico por passo.
- A escala fictícia é de 0,25 ha por célula (50 m × 50 m), com um minuto simulado por passo. Para reproduzir as capturas, trace um aceiro vertical de uma extremidade a outra na coluna 60, acenda os focos em (42, 54) e (125, 60) com os parâmetros iniciais e arraste o divisor para 32%. As coordenadas começam em zero. Resultado das duas capturas: 3.102 ha com aceiros, 3.721 ha sem aceiros, 619 ha preservados.
- Fontes da legenda botânica: [Falleiro et al., 2025](https://doi.org/10.37002/biodiversidadebrasileira.v15i3.2795) e [Medeiros e Miranda, 2008](https://doi.org/10.1017/S0960428608004708).

### Revisão visual

- A manchete tinha pouco alcance sobre o mapa. Aumentei a escala no desktop de 6,2 para 6,9 vw, mantive o teto de 6,5 rem e ampliei o véu escuro atrás das letras.
- As três placas de instrução fragmentavam o terreno. Reuni as anotações em um bloco menor com uma régua lateral e mantive a hora na margem inferior. No tablet, alinhei as leituras abaixo das ferramentas para aproveitar a segunda coluna.
- O recorte do espécime escondia a ponta do broto e a base do galho. A gravura passou a aparecer inteira sobre o carvão, com a legenda ao lado. Reduzi a opacidade da cicatriz para recuperar parte da textura do terreno.

Autorrevisão de código e inspeção no navegador do Orca, com capturas do Chromium comparadas a `design/concept.webp`. As capturas inspecionadas estão em `design/evidence/`: `inicial-360.png`, `inicial-768.png`, `inicial-1440.png`, `resultado-desktop.png` e `resultado-mobile.png`. O relatório fica em `design/evidence/fidelity.json`. Uma amostra local de quatro segundos durante a propagação em 1440 × 900, com CPU desacelerada em 4× pelo Chromium, mediu 60,0 fps e nenhum intervalo superior a 25 ms. A revisão mobile usou emulação, sem aparelho físico.

### Verificações executadas

| Comando | Resultado |
|---|---|
| `bun run check` | 0. Biome verificou 249 arquivos. O relatório gerado em `design/evidence/` fica fora do formatador. |
| `bun run typecheck` | 0. |
| `bun run test` | 0. 276 passaram e 1 teste opcional de IA foi pulado. |
| `bun run build` | 0. O empacotador emitiu avisos sobre diretivas `use client` na dependência Motion. |
| `bun run test:e2e` | 0. 11 passaram, incluindo teclado, pausa e retomada, resultado desatualizado, movimento reduzido, larguras 360/768/1440 e axe antes e depois da simulação. |
| `bun run design:verify` | 0 com Vite em `127.0.0.1:3000`. 175/175 verificações e 0 problemas globais. |

Para retomar, rode `bun run dev --port 3000 --host 127.0.0.1` e abra `/`. Nenhuma dependência nova e nenhum bloqueio para os comandos exigidos.

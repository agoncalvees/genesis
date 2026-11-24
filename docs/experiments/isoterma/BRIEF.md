# ISOTERMA — briefing funcional (idêntico para as três versões)

Experimento controlado de frontend. **Não é produto real nem submissão a evento.** Foco: experiência, composição, interação e direção visual.

## Desafio simulado
Como utilizar inteligência artificial para reduzir os impactos das ilhas de calor nas cidades brasileiras?

Nome experimental: **ISOTERMA**.
Público: pesquisadores, gestores urbanos e cidadãos interessados em compreender o impacto térmico de intervenções urbanas.

## Fora de escopo
Backend, autenticação, integração real com IA, chamadas de rede externas, persistência remota, analytics, deploy/publicação.

## Dados
Use **somente** `brief/data/isoterma-synthetic.json` (copie para dentro do app). É um território **fictício e sintético**: 12 regiões (polígonos em `viewBox` 0 0 1000 680), uma grade térmica 50×34 (células de 20 px), um ribeirão (polilinha) e atributos por região (`surfaceTempC`, `canopyPct`, `imperviousPct`, `roofSharePct`, `albedo`, `populationDensity`, `vulnerabilityIndex`, `dataQuality`). Toda tela que mostra dados deve rotulá-los como **sintéticos**.

## Fluxo obrigatório (estados reais no frontend)
1. **Compreender o problema** — introdução curta sobre ilhas de calor e sobre o que a ferramenta faz e não faz.
2. **Explorar o território** — mapa térmico do território com legenda em °C; leitura de valores por região (hover/foco/toque).
3. **Selecionar uma região** — por clique/toque **e** por teclado; mostrar atributos da região selecionada.
4. **Configurar uma intervenção** — três parâmetros com valor numérico visível:
   - Arborização: aumento de copa arbórea, `deltaCanopyPp` de 0 a 30 pontos percentuais (passo 1); a copa final não pode exceder 60%.
   - Coberturas frias (telhados reflexivos): `coolRoofPct` de 0 a 100% dos telhados (passo 5).
   - Pavimentos frios/permeáveis: `coolPavementPct` de 0 a 50% da área impermeável convertida (passo 5).
5. **Visualizar a transformação** — "processamento demonstrativo" local (atraso fixo entre 1,2 s e 1,8 s, anunciado como demonstrativo; cancelável ou não bloqueante), depois o mapa/região muda para o estado "depois".
6. **Comparar os resultados** — antes × depois da região: temperatura, diferença com sinal (ex.: −2,4 °C), faixa ilustrativa e contribuição de cada intervenção.
7. **Consultar limitações** — evidências (mecanismos) e limitações do cálculo, acessíveis a qualquer momento após o resultado.

Estados exigidos: inicial (nenhuma região), região selecionada, parâmetros alterados (resultado anterior marcado como desatualizado), processando, resultado, **erro** e **reset** (volta ao estado inicial).

### Erros determinísticos
- Simular com os três parâmetros em zero → erro de validação ("configure ao menos uma intervenção").
- Região com `dataQuality: "insuficiente"` (Novo Loteamento, `r11`) → a simulação termina em erro explicável ("dados insuficientes para esta região sintética"), com opção de escolher outra região.
- Copa final acima de 60% → limitar o controle e explicar o motivo.

## Cálculo demonstrativo (NÃO é previsão científica)
Coeficientes ilustrativos, escolhidos para o experimento de interface; devem ser apresentados como tal.

```
copaFinal        = min(canopyPct + deltaCanopyPp, 60)
deltaCopaEfetivo = copaFinal - canopyPct
dTArborizacao    = -0.11  * deltaCopaEfetivo
dTCoberturas     = -0.018 * coolRoofPct     * (roofSharePct / 100)
dTPavimentos     = -0.025 * coolPavementPct * (imperviousPct / 100)
dT               = dTArborizacao + dTCoberturas + dTPavimentos      (°C)
tempoDepois      = surfaceTempC + dT
faixaIlustrativa = [dT * 1.4, dT * 0.6]   (±40%, apenas ilustrativa)
```
Arredonde a exibição para 0,1 °C (vírgula decimal, pt-BR). Exemplo de verificação: região `r06` (Centro Antigo: 41,3 °C, copa 5%, impermeável 91%, telhados 41%) com `deltaCanopyPp=20`, `coolRoofPct=50`, `coolPavementPct=20` → dTArborizacao −2,2; dTCoberturas −0,369; dTPavimentos −0,455; dT ≈ −3,0 °C; depois ≈ 38,3 °C.

## Evidências e limitações (conteúdo mínimo)
**Sem citações inventadas.** Não cite autores, instituições, artigos, links ou números externos. Apresente os mecanismos abaixo como conhecimento geral, com a nota "fontes não verificadas neste experimento".
- Copa arbórea reduz a temperatura de superfície por sombreamento e evapotranspiração.
- Superfícies de maior refletância (albedo) absorvem menos radiação solar.
- Superfícies impermeáveis e escuras armazenam calor e o liberam à noite.
- Limitações: dados sintéticos; coeficientes ilustrativos e lineares; ignora vento, umidade, sombra de edifícios, efeitos entre regiões vizinhas, sazonalidade e custo; temperatura de superfície ≠ temperatura do ar ≠ conforto térmico; não serve para decisão real.

## Regras anti-genéricas
Não usar automaticamente (só com justificativa funcional escrita no relatório): sidebar administrativa; dashboard só de cards; gradientes roxos ou azuis genéricos; glassmorphism indiscriminado; tipografia padrão de SaaS; ícones decorativos repetitivos; chatbot como interface principal; animações ornamentais; landing page tradicional (hero + três features + CTA).
A interface deve ser organizada em torno do **território e da simulação**, e comunicar a natureza do problema mesmo com o logotipo oculto. Animações comunicam mudança de estado e relação entre dados. Respeitar `prefers-reduced-motion`.

## Requisitos de qualidade
- Responsivo sem overflow horizontal em 360, 768 e 1440 px.
- Teclado completo (seleção de região inclusive), foco visível, ordem lógica, nomes acessíveis, contraste WCAG AA, estados anunciados (`aria-live` ou equivalente).
- Sem erros no console. Build de produção passa.

## Contrato mínimo para a avaliação automatizada (comum às três versões)
A avaliação externa usa nomes acessíveis, não seletores internos:
- Rota única `/`.
- Cada região do mapa é focável e tem nome acessível que **contém o nome da região** (ex.: "Centro Antigo, 41,3 °C").
- Botão de simular com nome acessível contendo "Simular".
- Botão de reset com nome acessível contendo "Redefinir".
- Os três controles têm rótulos acessíveis contendo "Arborização", "Coberturas" e "Pavimentos".
- Um título (heading) contendo "Limitações".
- Servidor de produção local na porta indicada em `brief/ENVIRONMENT.md`.

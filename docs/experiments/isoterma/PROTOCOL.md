# Protocolo de execução e medição (comum às três versões)

## Isolamento
- Trabalhe **somente** dentro do seu workspace (indicado em `brief/ENVIRONMENT.md`). O app fica em `app/` dentro dele.
- **Não leia** os outros workspaces do experimento (`/Users/arthurgoncalves/orca/experiments/isoterma/version-*` que não sejam o seu), nem `/Users/arthurgoncalves/orca/experiments/isoterma/coordination` ou `evaluation`.
- Não publique, não faça deploy, não faça push, não use serviços pagos nem Figma, não adicione chaves/segredos.
- Dependências: só as permitidas em `brief/ENVIRONMENT.md`; registre cada uma adicionada (nome@versão, motivo).

## Orçamento (idêntico para as três versões)
- **Preparação** (do início até o app servir uma página em branco/placeholder com build passando): limite 30 min.
- **Implementação** (do fim da preparação até a entrega): limite **75 min** de relógio. Ao atingir o limite, pare de adicionar funcionalidades, garanta que `build` passa e entregue o que estiver funcionando. Não estenda o orçamento.

## Medição (obrigatória, honesta)
Registre timestamps UTC reais (`date -u +%Y-%m-%dT%H:%M:%SZ`) em `REPORT.md` na raiz do workspace:
- `T0` início da tarefa
- `T1` fim da preparação (app sobe; build passa)
- `T2` primeira interface funcional (mapa renderiza com dados e uma região pode ser selecionada)
- `T3` fluxo completo funcionando (7 etapas)
- `T4` entrega (testes e build finais executados)
Não estime nem arredonde a favor; se esquecer um timestamp, escreva "não registrado".

## Correções
Conte como "correção" cada ciclo em que um comando de verificação (build, typecheck, lint, teste, e2e) falhou e você alterou código para corrigir. Registre: comando, erro resumido, correção.

## Verificações mínimas antes da entrega
Execute e registre comando + código de saída:
- build de produção;
- typecheck;
- lint/format (se configurado);
- pelo menos um teste E2E Playwright que percorra o fluxo (selecionar região por teclado → configurar → simular → ver resultado → limitações → redefinir) e falhe em `console.error`/`pageerror`;
- verificação axe (se `@axe-core/playwright` estiver disponível).
Testes que não rodaram devem ser declarados como não executados.

## REPORT.md (estrutura)
1. Identificação: versão (A/B/C), agente, modelo e esforço (como aparecem na sua sessão), troca de modelo (sim/não + motivo).
2. Tempos T0–T4 e durações derivadas.
3. Comandos e saídas (código de saída).
4. Dependências adicionadas.
5. Componentes: reutilizados / adaptados / criados (para A e B: "criados" lista tudo que você escreveu).
6. Decisões de design (composição, tipografia, cor, motion) e justificativa para qualquer item da lista anti-genérica usado.
7. Correções (lista numerada).
8. Problemas, restrições e limitações conhecidas.
9. Como rodar: comandos de dev, build e servidor de produção na porta indicada.

Faça commits locais pequenos no repositório do seu workspace. Ao terminar, informe o coordenador.

# Genesis — instruções para agentes

Leia [README](README.md), [Blueprint](docs/BLUEPRINT.md), [Roadmap](docs/ROADMAP.md) e [Status](docs/STATUS.md) ao retomar o projeto. Consulte apenas os guias aplicáveis à tarefa. Use português na documentação, inglês em código e identificadores e kebab-case em arquivos, salvo nomes convencionais.

## Execução

1. Registre em poucas linhas o objetivo, os arquivos sob sua responsabilidade e os critérios de aceitação. Siga os gates do Roadmap. A fase 00 é de análise e exige aprovação humana para avançar. Registre e obtenha aprovação de exceções.
2. Mantenha a fundação agnóstica ao domínio e à marca. O núcleo não importa `features/`. Serviços e capacidades opcionais ficam fora do caminho crítico de inicialização. Mudanças de escopo, stack ou custo exigem ADR com evidência, alternativa, impacto e decisão humana. Confira documentação oficial, runtime e peers antes de alterar dependências. Preserve o lockfile.
3. Após a revelação e confirmação das regras, preencha `CHALLENGE.md` e `PRODUCT-BRIEF.md` antes de implementar. Isole o produto com `genesis:new`; mantenha as funcionalidades de domínio no produto. Trabalhe na experiência central. Só promova melhorias à fundação com outro uso plausível e evidência de necessidade.
4. Implemente a menor solução funcional. Um responsável por arquivo ou contrato; o coordenador revisa e integra. Continue o trabalho local quando faltar serviço externo e registre o bloqueio. Identifique fixtures e mocks, diferencie medições de estimativas e registre apenas testes executados.
5. Rode as verificações pertinentes e faça revisão independente quando disponível. Na falta dela, faça autorrevisão e registre a limitação. Atualize o STATUS com comandos, resultados, bloqueios e ponto de retomada. Receitas, comandos e checkpoints devem funcionar em Codex e Claude Code pelo terminal, sem exigir um orquestrador ou modelo.
6. Preserve o histórico com commits locais pequenos. Operações destrutivas exigem aprovação. Push, merges remotos, publicação, deploy, conexão de contas e ações externas pagas exigem autorização. Mantenha segredos fora do cliente, dos logs e do Git. Use ambiente local para credenciais. Respeite permissões de acesso e limites de coleta.

## Design e validação

- Defina direção artística antes da implementação, a partir do problema, público e contexto cultural. Selecione até três referências úteis e anote o que pretende aprender de cada uma. Use o Robin como referência de acabamento. Preserve identidades, licenças e autoria.
- Cada produto tem seu próprio `design/DESIGN.md`. Mapear cores, tipografia, geometria, densidade e motion a tokens semânticos permite que a composição varie com o problema. Consulte o [índice de componentes](docs/design/COMPONENTS.md) e reutilize seletivamente.
- Siga o [protocolo visual](docs/design/VISUAL-ENGINEERING.md) para escolher ferramentas, gerar assets e validar a aparência. Inspecione a aplicação no navegador e compare estilos computados de elementos centrais com o DESIGN.md. Verifique teclado, foco, contraste, erros, responsividade e movimento reduzido. Capture estados relevantes após o refinamento.

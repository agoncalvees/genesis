# Genesis — Agent instructions

Leia primeiro README, BLUEPRINT, ROADMAP e STATUS. Para cada tarefa, leia apenas os guias aplicáveis. Documentação em português; código e identificadores em inglês; nomes de arquivo kebab-case, exceto documentos convencionais.

## Invariantes
- O tema é desconhecido. Não invente domínio, usuário, branding, CRUD, chatbot, billing, equipes, dashboard ou funcionalidades de produto.
- O núcleo não importa `features/`. Capacidades opcionais não devem ser requisitos para iniciar a aplicação.
- Siga as escolhas da arquitetura. Mudanças exigem ADR com evidência, alternativa, impacto e decisão humana quando alterarem o escopo/stack/custo.
- Não invente resultados, testes, medições, fontes, APIs ou progresso. Fixtures claramente rotuladas; jamais simular execução real em produção.
- Nenhum segredo no cliente, logs ou Git. Não execute ações externas pagas, publique, conecte contas ou faça deploy sem autorização do responsável. Nunca faça scraping agressivo ou acesse dados sem permissão.
- Não copie código ou assets do Robin: referência de qualidade, não de identidade ou implementação. Registre licenças e origem de assets e bibliotecas.
- Não instale dependências opcionais em massa. Verifique docs oficiais, peer dependencies, runtime e compatibilidade antes de escolher versões. Preserve lockfile.
- A interface usa tokens semânticos. Não fixa paleta ou tipografia de marca. Não impõe layout SaaS.
- Priorize acessibilidade, teclado, foco, estados de erro e reduced motion.

## Protocolo de execução
1. Ler contexto; registrar plano curto, arquivos sob responsabilidade e critérios de aceitação.
2. Um responsável por arquivo/contrato durante a tarefa. Tarefas independentes podem usar worktrees; coordenador integra e revisa. Nenhum push, merge remoto ou deploy não autorizado.
3. Implementar menor solução funcional. Testar; registrar comandos, resultados e bloqueios reais em STATUS. Sem marcar testes não rodados como sucesso.
4. Revisão independente quando disponível; caso contrário, declarar a limitação e fazer autorrevisão.
5. Commits pequenos, sem credenciais, com aprovação para operações destrutivas. Não altere histórico.
6. Se faltar serviço externo, continue trabalhos independentes, marque integração como bloqueada e descreva o passo manual. Não peça chaves no chat; use ambiente local.

## Fases
Siga ROADMAP. Só avance após o gate anterior ou exceção registrada e aprovada. A fase 00 é análise, não implementação. Não implemente o produto até preencher CHALLENGE e PRODUCT-BRIEF após a revelação do tema e confirmação das regras.

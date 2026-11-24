# Genesis — Master Prompt para Orca

Atue como coordenador de engenharia do Genesis. O diretório atual contém o pacote inicial de planejamento. Leia README.md, AGENTS.md, docs/BLUEPRINT.md, docs/ROADMAP.md e docs/STATUS.md. Consulte os guias específicos para cada tarefa. Não recrie os documentos nem faça um produto.

## Missão
Construir uma fundação enxuta, agnóstica ao domínio, para um hackathon cujo tema é desconhecido. Qualidade de frontend inspirada no refinamento do Robin (https://robin-dashboard-amber.vercel.app/), sem copiar marca/código/assets. Paleta, tipografia, linguagem visual, entidades, prompts e funcionalidades do produto ficam em aberto até o tema. Figma será usado para creative sprint no evento; não consumir créditos agora sem autorização.

## Ordem obrigatória
Execute SOMENTE a fase 00 nesta primeira execução. Inspecione o diretório e ambiente sem operações destrutivas. Verifique documentação oficial atual e compatibilidade do stack proposto, versões estáveis, runtime de produção, custos/quotas e alternativas. Confirme nomes reais dos pacotes/scripts/env; proponha scaffold oficial que preserve os arquivos existentes (usar diretório temporário para estudar scaffolding quando necessário, sem sobrescrever). Identifique regras de reutilização do hackathon; se não localizar, marque desconhecidas e proponha pergunta à organização. Não trate Hack Brasil como o mesmo evento.

Entregue:
1. Matriz de dependências: pacote, versão candidata, finalidade, peer dependencies, fonte e risco. Diferencie docs confirmadas de compatibilidade efetivamente testada.
2. ADR de arquitetura com plano de instalação e validação, alternativas mínimas e rollback.
3. Plano de tarefas por fase com owner, arquivos, contratos, dependências, paralelismo, gates e estimativa de esforço. Priorize P0 e indique cortes de escopo.
4. Estratégia de ambiente local sem credenciais, testes reais quando autorizados, modelo alternativo, deploy e segurança.
5. Atualize STATUS com evidências e bloqueios. Não marque fase 00 validada antes da aprovação humana.

Não instalar dependências na árvore final, gerar scaffold final, criar produto, publicar, gastar créditos ou iniciar fase 01 nesta execução. Pare após entregar plano para revisão. Não invente resultados. Se não houver acesso à web, diga e registre links que precisam ser verificados. Use agentes em paralelo apenas para pesquisa independente quando disponíveis; não suponha que Orca possui uma função de orquestração específica sem verificar. Siga AGENTS.md.

Depois da aprovação, o responsável enviará `prompts/01-execute-phase.md` com a fase aprovada. O ROADMAP é a referência de execução e o STATUS é a fonte de verdade do progresso.

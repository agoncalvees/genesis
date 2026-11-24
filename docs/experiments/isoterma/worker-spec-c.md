Experimento controlado ISOTERMA — Versão C. Você implementa UMA versão de um experimento de frontend comparativo. Três versões são construídas em paralelo por agentes independentes; a comparação só é válida se você seguir exatamente os documentos do seu workspace.

Workspace (único local onde você pode escrever): /Users/arthurgoncalves/orca/experiments/isoterma/version-c
Leia, nesta ordem, antes de qualquer ação: /Users/arthurgoncalves/orca/experiments/isoterma/version-c/brief/ENVIRONMENT.md, /Users/arthurgoncalves/orca/experiments/isoterma/version-c/brief/PROTOCOL.md, /Users/arthurgoncalves/orca/experiments/isoterma/version-c/brief/BRIEF.md e /Users/arthurgoncalves/orca/experiments/isoterma/version-c/brief/DESIGN.md.

Tarefa: registrar T0, preparar o app em /Users/arthurgoncalves/orca/experiments/isoterma/version-c/app conforme ENVIRONMENT.md, implementar a experiência completa do BRIEF.md (7 etapas, todos os estados, erros determinísticos, cálculo demonstrativo exato, evidências e limitações sem citações inventadas), respeitar o orçamento do PROTOCOL.md (preparação ≤ 30 min, implementação ≤ 75 min de relógio), executar as verificações mínimas e escrever /Users/arthurgoncalves/orca/experiments/isoterma/version-c/REPORT.md com tempos UTC reais, comandos e códigos de saída, dependências, componentes, decisões de design, correções e problemas.

Regras:
- Não leia os outros workspaces do experimento nem /Users/arthurgoncalves/orca/experiments/isoterma/coordination ou /evaluation.
- Não publique, não faça deploy/push, não use créditos pagos nem Figma, não crie segredos.
- Não invente resultados: comando que não rodou é "não executado"; falha é registrada como falha.
- Commits locais pequenos no repositório git do workspace (o app em app/ é um clone git próprio criado pelo genesis:new — faça os commits do código nele, no branch product/isoterma, e o REPORT.md no repositório externo do workspace).
- Deixe nenhum servidor rodando ao terminar.
- Não peça confirmação para passos previstos nos documentos; pergunte ao coordenador (ask) só se estiver bloqueado.

Entrega (worker_done): resumo com os timestamps T0–T4, status de build/typecheck/E2E/axe (código de saída), comando `serve` e porta de produção, dependências adicionadas, contagem de correções, modelo/esforço da sua sessão e qualquer troca de modelo. Uma falha de build ao fim do orçamento NÃO deve ser reportada como sucesso.

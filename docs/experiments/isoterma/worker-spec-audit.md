Auditoria independente (somente leitura) do experimento ISOTERMA — três versões de um mesmo app frontend.

NÃO edite nenhum arquivo, exceto o único arquivo de saída: /Users/arthurgoncalves/orca/experiments/isoterma/evaluation/audit/OC-AUDIT.md (crie a pasta se faltar). Não altere /Users/arthurgoncalves/orca/projects/genesis. Não rode servidores, installs nem builds. Não faça commits.

Leia:
- Briefing comum: /Users/arthurgoncalves/orca/experiments/isoterma/shared/BRIEF.md
- Contrato visual (válido para B e C): /Users/arthurgoncalves/orca/experiments/isoterma/shared/DESIGN.md
- Versão A (sem DESIGN.md): /Users/arthurgoncalves/orca/experiments/isoterma/version-a/app/src e tests, REPORT.md
- Versão B (DESIGN.md sem Genesis): /Users/arthurgoncalves/orca/experiments/isoterma/version-b/app/src e tests, REPORT.md
- Versão C (Genesis + DESIGN.md): /Users/arthurgoncalves/orca/experiments/isoterma/version-c/app/src/isoterma, src/routes/index.tsx, src/routes/__root.tsx, tests/e2e/atlas.spec.ts, REPORT.md (o resto de app/src é a fundação Genesis)

Verifique, para CADA versão, com citação arquivo:linha:
1. Cálculo demonstrativo: as fórmulas e coeficientes batem exatamente com o BRIEF (incluindo teto de copa 60% e faixa ±40%)?
2. Evidências e limitações: há alguma citação, autor, instituição, link ou número externo inventado? A nota "fontes não verificadas" aparece? Os dados são rotulados como sintéticos? O cálculo é apresentado como não científico?
3. Regras anti-genéricas (sidebar administrativa, dashboard de cards, gradientes roxos/azuis, glassmorphism, tipografia SaaS padrão, ícones decorativos repetidos, chatbot, animação ornamental, landing hero+3 features+CTA): algum uso? com justificativa?
4. Fidelidade ao DESIGN.md (B e C): cores, rampa térmica de 7 passos, fontes, raios, motion (durações ≤ 400 ms interação / ≤ 600 ms revelação), reduced motion. Liste divergências concretas.
5. Acessibilidade no código: nomes acessíveis, aria-live, foco visível, controle de teclado das regiões, alvos de toque.
6. Inconsistências entre o REPORT.md e o código (afirmações não sustentadas).
7. Qualidade de código: duplicação, literais fora de tokens, código morto.

Formato do OC-AUDIT.md: uma seção por versão com achados numerados (severidade alta/média/baixa, arquivo:linha, evidência), depois uma tabela comparativa e uma seção "Limitações desta auditoria". Não atribua notas de preferência visual. Não invente achados: se não verificou, diga "não verificado".

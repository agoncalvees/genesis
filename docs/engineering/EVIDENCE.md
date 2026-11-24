# Evidence Engineering

Runner pequeno, não plataforma de analytics. Registrar dataset/fixture e origem, versão do código/modelo, configuração, baseline, procedimento, amostra, métrica/unidade, duração, resultados brutos, limitações e data. Exportar JSON/CSV sem dados sensíveis. Não comparar tarefas diferentes ou extrapolar amostras pequenas. Medir latência com repetições se viável; registrar erros como erros, não excluir silenciosamente. Custo apenas quando houver medição ou estimativa rotulada.

Primeiro exemplo neutro pode comparar implementações determinísticas sobre fixture, sem inventar resultado. IA avaliada com casos esperados e critérios verificáveis, não só outro LLM opinando. P0: Vitest; Playwright para fluxo; P1: Promptfoo quando necessário. Padrões UI opcionais: BeforeAfter, ProcessTimeline, EvidencePanel, ResultInspector e Metric. Replays identificados como gravações, nunca live.

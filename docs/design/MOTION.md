# Motion System

Motion para layout/gestos e entradas/saídas; CSS para transições simples. Presets iniciais: instant 100 ms, fast 150 ms, normal 250 ms, slow 400 ms, showcase 600 ms. Easing centralizado e ajustável. Priorizar opacity/transform, evitar layout thrashing; medir desempenho em dispositivo real quando possível.

P0: FadeIn, StaggerGroup, AnimatedNumber, AnimatedTabs/indicator, Expandable, feedback de processamento. P1: BlurReveal, TextReveal, MorphingContainer, AmbientGradient, GrainSurface. Não criar abstrações para efeitos usados uma única vez.

Reduced motion respeitado globalmente; sem movimento essencial para compreender estado. Não bloquear cliques durante transições. Indicadores de progresso refletem medidas reais; caso desconhecido usar estado indeterminado. Não mostrar raciocínio interno do modelo: apenas etapas de execução observáveis.

# Roadmap e gates

**Estado inicial:** planejamento entregue; nenhuma fase de código executada. P0 antes de P1. Se houver falta de tempo, reduzir escopo, não qualidade dos gates.

| Fase | Entregável | Gate verificável |
|---|---|---|
| 00 | ADR de versões, plano, riscos, regras do evento, divisão de tarefas | Fontes oficiais; compatibilidade proposta; comandos; bloqueios explícitos; aprovação humana do plano |
| 01 | Scaffold oficial TanStack Start, Bun, TS strict, Biome, smoke route, testes básicos, env; Convex opcional no arranque | Instalação reproduzível, dev, build, check/typecheck e smoke; conexão Convex real quando credenciais disponíveis |
| 02 | Tokens neutros, primitives P0 e catálogo enxuto | Troca de tema/fonte centralizada, teclado, foco, viewport 360/768/1440, contraste AA nos pares relevantes |
| 03 | Motion presets, layouts independentes, padrões de resultados | Reduced motion, sem overflow, estados loading/empty/error/success, interação funcional |
| 04 | IA opcional server-only, texto/stream/objeto/tool call, upload se necessário | Testes locais com mock rotulado; teste real com credencial; timeout, cancelamento, limites; sem segredo no bundle |
| 05 | Evidence runner e receitas selecionadas | Benchmark reproduzível JSON/CSV com baseline, unidade e amostra; pelo menos uma receita executável e isolada |
| 06 | Studio dev-only (integrar catálogo existente, não duplicar), docs e CI | Studio indisponível em produção inclusive acesso direto; CI sem segredos; build e E2E |
| 07 | Simulação em worktree descartável e contingência | Dois desafios de natureza distinta em até 45 min cada como meta; registrar tempos, falhas, correções; demo local |

## Ordem e paralelismo
00 -> 01; depois 02 e 04 podem avançar em paralelo com contratos estáveis. 03 depende de 02. 05 depende dos utilitários do core, e não precisa aguardar integração de IA se usar algoritmo determinístico. 06 integra. 07 valida. Um coordenador controla package.json, lockfile, rotas, tokens e merges.

## Corte de escopo
Cortar primeiro 3D, voz, auth, mapas, agentes complexos, Storybook, telas adicionais e receitas de baixa prioridade. Studio é uma galeria de dev, não produto. Não cortar segurança, core funcional, testes mínimos nem o plano de contingência.

## Definition of Done
- Cada fase: comandos e saídas reais no STATUS; sem warnings críticos omitidos; revisão; documentação atualizada.
- Build, typecheck, lint, unit e E2E básicos passam; teste de integração real diferenciado de mocks.
- Alterar tema em arquivo central; criar uma rota e integrar uma capacidade sem refatorar core.
- Credenciais e serviços externos opcionais têm estado indisponível explícito.
- Regulamento confirmado antes de reutilizar qualquer parte do Genesis.

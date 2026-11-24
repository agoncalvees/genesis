# Orquestração multiagente

Como Claude Code, Codex e OpenCode trabalham juntos no Genesis via Orca. Roteamento e fallback de modelos: `MODEL-ROUTING.md`. Nenhum componente de orquestração entra no runtime do Genesis.

## Mecanismo (verificado em Orca 1.4.272)

Comandos confirmados por `orca orchestration --help`: `run-create`, `task-create`, `task-list`, `task-update`, `worker-start`, `worker-show`, `worker-read`, `worker-stop`, `worker-list`, `send`, `check`, `reply`, `ask`, `inbox`, `gate-create/resolve/list`, `reset`. Guia versionado: `orca skills get orchestration`.

Ciclo do coordenador:
1. `orca orchestration run-create --environment local --objective "<fase>"` — um Run por fase.
2. Escrever spec autocontida em arquivo; `orca orchestration worker-start --environment local --run <run> --spec-file <f> --task-title "<ID título>" --worktree <current|new-child> --agent <claude|codex|opencode> [--model <id>]`.
3. Encerrar o turno; o Orca acorda o coordenador com `worker_done`, `question` ou `escalation`. Não fazer polling.
4. Ler resultado (`worker-read --dispatch <id>`), revisar diffs, integrar, atualizar STATUS.
5. Steering: `orca orchestration send --to dispatch:<id> --subject ... --body ...`.

Regras do guia Orca: até ~4 workers simultâneos; não reexecutar `worker-start` que falhou (ler `failedStage`); `--effort` só com `--model`; OpenCode não aceita `--effort`.

## Papéis

| Agente | Responsabilidade | Não faz |
|---|---|---|
| Claude (lead) | arquitetura, contratos, ADRs, escopo, revisão crítica, integração, aprovação de critérios | implementação delegável |
| Codex | núcleo, integrações, frontend sofisticado, design system, motion, backend, IA, segurança, revisão de código | decisões de escopo/stack sem ADR |
| OpenCode | auxiliares, testes, benchmarks, docs, pesquisa delimitada, edge cases, revisão independente | arquivos coordenados, decisões arquiteturais |

## Protocolo de dispatch

Toda spec define: Task ID (`P<fase>-<AGT>-<nn>`, ex. `P01-CDX-02`), objetivo, responsável, dependências, arquivos autorizados (lista fechada), contratos, critérios de aceitação, comandos de validação, política de fallback, e linha final `Placement:`.

- **Arquivos coordenados** (só o coordenador altera ou autoriza explicitamente): `package.json`, `bun.lock`, configuração global (tsconfig, biome, vite, tailwind), contratos públicos, design tokens, rotas compartilhadas, `.env.example`, ADRs, merges.
- Um responsável por arquivo. Paralelismo só entre tarefas com conjuntos de arquivos disjuntos.
- `--worktree current` quando os arquivos são disjuntos e não há build concorrente; `--worktree new-child --name <task-id>` para implementações paralelas que rodam install/build.
- Conclusão só é aceita do dispatch vigente (comparar Dispatch ID).
- **`--worktree new-child` cria a branch a partir do branch default (`main`), não do HEAD do coordenador** (observado em Orca 1.4.272, fases 03/04). Sempre passar `--base-branch <branch-da-fase>` e conferir com `git worktree list` logo após o start.
- Workers em worktrees irmãs que rodam `test:e2e` disputam a porta 3000 (`--strictPort`); serializar E2E ou instruir retry.

## Checkpoints

Cada tarefa mantém `docs/engineering/<fase>/checkpoints/<TASK-ID>.md` com: Task ID, Dispatch ID, agente, modelo, branch/worktree, objetivo, arquivos autorizados, arquivos modificados, decisões, comandos, testes, resultados, pendências, última ação concluída, próxima ação. Sem segredos. O checkpoint deve permitir retomada por outro agente sem a conversa.

## Revisão cruzada

Claude revisa arquitetura/decisões; Codex revisa código crítico e integrações; OpenCode revisa testes e edge cases. Divergência → reproduzir, consultar docs oficiais, testar, escolher a solução mais simples. "Funciona" do autor não é evidência.

## Fallback manual

Se `orca orchestration` estiver indisponível: as specs em `docs/engineering/<fase>/` continuam válidas para distribuição manual (colar a spec na sessão do agente), mantendo os mesmos checkpoints.

## Registro da Phase 00

Run `run_738dcd161d50`.

| Task | Dispatch | Agente/modelo | Escopo |
|---|---|---|---|
| P00-CDX-01 (`task_708445d31a8a`) | `ctx_09d91539570a` | codex (default) | ambiente + matriz de compatibilidade |
| P00-OC-01 (`task_4aa69db0a76d`) | `ctx_c0e889501aae` | opencode / hy4-flash-free | auditoria documental |
| P00-OC-02 (`task_c41f42cd89cf`) | `ctx_5ef7a1f655c4` | opencode / hy4-flash-free | estratégia de testes, benchmarks, contingência |
| P00-CLA-01 | — (sessão coordenadora) | claude | ADRs, políticas, plano, STATUS |

hy4 foi escolhido porque DeepSeek V4.1 Flash e MiMo V2.6 Flash retornaram "Free usage limit reached" no probe — primeiro uso real do Nível 1.

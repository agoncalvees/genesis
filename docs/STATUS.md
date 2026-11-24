# Status

- Fase atual: 00 **aprovada** pelo responsável em 2026-11-24 (PLAN + ADRs 0001–0005 aceitos). Fase 01 autorizada; início após P00-CDX-02.
- Código de aplicação: inexistente.
- Versões/lockfile: candidatas propostas em ADR 0001; nada instalado, nada testado.
- Ambiente: instalação aprovada pelo responsável em 2026-11-24. `brew install node@24 oven-sh/bun/bun` + `brew link --force node@24` → node v24.22.3, npm 11.19.1, bun 1.4.5 em /opt/homebrew/bin.
- Deploy: Vercel aprovado pelo responsável (2026-11-24), com Nitro pré-release. Credenciais ainda não configuradas.
- Regulamento e código prévio: reutilização **permitida**, confirmada pelo responsável em 2026-11-24 (fonte: declaração do responsável; texto oficial não anexado).
- Revisão do frontend interno do Robin: não realizada (código não fornecido).

## Registro por fase
| Fase | Estado | Comandos e evidências | Bloqueios | Próximo passo |
|---|---|---|---|---|
| 00 | Validado (aprovação humana 2026-11-24) | Run Orca `run_738dcd161d50`: P00-CDX-01 (Codex), P00-OC-01 e P00-OC-02 (OpenCode hy4-flash-free) concluídos com `worker_done`. Probe `opencode run` em 10 modelos gratuitos. Versões-chave reverificadas via `curl registry.npmjs.org/<pkg>/latest`. Detalhes: `docs/engineering/phase-00/PLAN.md`. Experimento isolado P00-CDX-02 (Codex, `ctx_9427d9c2e014`) concluído: scaffold, install frozen, build, `tsc --noEmit` (TS 7.0.2), Biome, Vitest e Playwright passaram em /tmp; reverificado pelo coordenador (tsc=0, build=0) | Nitro pré-release (risco aceito) | Concluir P00-CDX-02 e iniciar fase 01 |

Estados: pendente / em andamento / bloqueado / validado. Não marcar validado sem evidência.

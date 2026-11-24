# Model routing e fallback

Política de escolha de modelo/agente e de continuidade operacional. Complementa `ORCHESTRATION.md`. Nada aqui é dependência de runtime do Genesis: refere-se apenas aos ambientes de desenvolvimento.

## Inventário verificado (2026-11-24)

Fonte: `orca agent installed --json` (Orca 1.4.272), `opencode --version` (v2.4.1), `opencode models`, e probe real `opencode run --archived -m <id> "Reply with exactly: PONG"` executado em paralelo às ~14:10 BRT.

| Agente Orca (`--agent`) | Papel | Seleção de modelo via Orca | Effort via Orca |
|---|---|---|---|
| `claude` (default) | Engineering Lead | `--model` aceito | `--effort` exige `--model` |
| `codex` (runtime Orca 0.172.0) | Principal Software Engineer | `--model` aceito | `--effort` exige `--model` |
| `opencode` / `opencode2` | Adaptive worker | `--model provider/id`, exige worktree existente | **não suportado** pelo Orca |

`opencode run` aceita `--model provider/model#variant`; variantes de reasoning por modelo **não foram verificadas** (hipótese, não usar sem teste).

### Catálogo OpenCode gratuito e estado observado

| ID real | Probe | Uso pretendido |
|---|---|---|
| `opencode/deepseek-v4.1-flash-free` | **FreeUsageLimit** ("Free usage limit reached") | 1ª preferência para código quando cota voltar |
| `opencode/mimo-v2.6-flash-free` | **FreeUsageLimit** | 2ª preferência para código |
| `opencode/hy4-flash-free` | OK (~7 s) | 3ª preferência; **ativo** na Phase 00 |
| `opencode/nemotron-3.5-super-vl-free` | **FreeUsageLimit** | multimodal |
| `opencode/nemotron-3.5-lightning-free` | OK (~3 s) | auxiliar/rápido |
| `opencode/big-pickle` | OK (~6 s) | só baixo risco, sem dado confidencial |
| `opencode/beam-free`, `flint-40b-free`, `iceman-free`, `tidepool-alpha-free` | OK (3–5 s) | **não avaliados** para código; usar só após teste de qualidade |

"OK" significa apenas que o modelo respondeu a um prompt trivial — não comprova qualidade de programação nem tool calling. O mesmo erro de cota em três modelos sugere (hipótese) uma cota compartilhada da conta gratuita para parte do catálogo; tratar como cota esgotada, não como falha transitória.

## Ordem de roteamento (OpenCode)

1. `deepseek-v4.1-flash-free` → 2. `mimo-v2.6-flash-free` → 3. `hy4-flash-free` → 4. outro gratuito com qualidade comprovada → 5. auxiliares (`nemotron-3.5-lightning-free`).
Multimodal: `nemotron-3.5-super-vl-free`. Big Pickle: só baixo risco e sem dados confidenciais. Modelos pagos: **nunca** automaticamente.

A ordem é reavaliada no início de cada sessão por probe (comando acima) e ajustada por: disponibilidade, qualidade observada em testes, tool calling, multimodal, contexto, latência, privacidade e limites.

### Roteamento por tipo de tarefa

| Tarefa | Responsável | Effort |
|---|---|---|
| Inventário, docs, mecânico | OpenCode (melhor gratuito) | default |
| Componentes, testes, utilitários, revisão delimitada | OpenCode → Codex se crítico | medium quando suportado |
| Núcleo, integrações, segurança, algoritmos, debugging complexo | Codex | high |
| Arquitetura, contratos, ADR, revisão estratégica | Claude | high; max só excepcional |

## Classificação de falhas

| Sinal | Classe | Ação |
|---|---|---|
| HTTP 429 com `Retry-After` | transitória | esperar o `Retry-After` (máx. 2 tentativas) |
| 429/timeout sem `Retry-After`, erro 5xx do provedor | transitória | backoff 15 s → 60 s (máx. 2), depois Nível 1 |
| `FreeUsageLimitError`, "Free usage limit reached", quota exceeded | cota esgotada | Nível 1 imediato + cooldown de 6 h no modelo |
| Model unavailable/deprecated | indisponível | remover da ordem até novo probe |
| Context window exceeded | capacidade | dividir tarefa ou ir a modelo de contexto maior |
| Tool calling falha 2× seguidas | capacidade | Nível 1 |
| Testes mostram qualidade insuficiente | qualidade | Nível 1; se persistir, Nível 2 |
| Erro de compilação/teste do código | **não é falha do provedor** | corrigir na mesma tarefa |

## Níveis de recuperação

**Nível 1 — model fallback.** Registrar no checkpoint (tarefa, modelo, erro, horário); preservar arquivos e checkpoint; `worker-stop` do dispatch atual; novo `worker-start --task <mesmo task_id> --retry-of <dispatch antigo> --model <próximo>` retomando da "próxima ação" do checkpoint. Não repetir ações externas já feitas.

**Nível 2 — agent fallback.** Sem gratuito adequado: implementação → Codex; decisão/revisão estratégica → Claude. Só acessos já existentes.

**Nível 3 — graceful degradation.** Todos indisponíveis: preservar repositório, registrar bloqueio no checkpoint e em `docs/STATUS.md`, informar o usuário, não declarar conclusão.

Regras: sem loops infinitos; não alternar entre modelos de cota compartilhada esgotada; cooldown registrado; nunca substituir silenciosamente por modelo pago; nunca aceitar `worker_done` de um dispatch substituído como conclusão do novo.

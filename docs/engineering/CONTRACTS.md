# Contratos e fronteiras

Contratos propostos, somente para operações que precisarem. Não impor a CRUD ou a componentes simples.
```ts
export type ExecutionStatus = "idle" | "running" | "completed" | "failed" | "cancelled";
export type ExecutionResult<T> = { data: T; durationMs?: number; metadata?: Record<string, unknown>; warnings?: string[] };
export type AppError = { code: string; message: string; retryable: boolean };
export type EvaluationResult = { metric: string; value: number; unit?: string; sampleSize?: number; baseline?: number };
```

- Server functions ou rotas de servidor para segredos/IA, conforme API oficial da versão escolhida. Convex queries/mutations/actions conforme documentação. Validar e autorizar inputs no servidor, não confiar no cliente.
- Tipos compartilhados não importam código server-only. Normalizar erros seguros para usuário; log técnico redigido com correlation ID, sem prompts sensíveis por padrão.
- Operações longas: cancelamento/timeout, limites de concorrência, retry limitado apenas para falhas transitórias; idempotência quando houver efeitos colaterais.
- Sem tabelas de domínio antecipadas. Smoke test de persistência isolado, removível. Não duplicar cache Convex e React Query.
- Upload somente se necessário: tipos permitidos, tamanho máximo, autenticação/autorização quando aplicável, retenção e erros explícitos. Não executar conteúdo enviado.

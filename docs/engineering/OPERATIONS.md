# Operação e segurança

- Bun e Git instalados; verificar versão, ambiente e compatibilidade. Instalação com lockfile reproduzível. CI executa check/typecheck/test/build e smoke E2E conforme viabilidade. Usar runtime suportado no deploy, documentar diferença local/produção.
- `.env.example` sem valores secretos; validar apenas as credenciais necessárias à capacidade ativada. Não enviar chaves ao Orca por prompt. Rotacionar se expostas. Deploy externo, contas e custos exigem autorização.
- Validar limites de APIs, modelos e serviços antes da competição. Fallback real e testado; para modo local UI use fixtures explicitamente rotuladas; não prometer IA offline.
- Proteger endpoints contra abuso: autenticação quando necessário, rate limits e orçamento. Logs sem segredo ou dados pessoais. Rejeitar inputs inválidos, aplicar timeout e limites de payload.
- Studio dev-only, testar URL direta em build de produção. Sem painel que vaze env/config. Dependências opcionais não entram no bundle por padrão.
- Contingências: falha deploy -> local; API -> fallback testado; internet -> demo real previamente gravada/fixtures; banco -> modo local apenas se implementado; conflitos -> worktrees; falta de tempo -> cortar features secundárias.
- Não simular dados, métricas ou execução como reais. Manter origem de assets e licenças. Não publicar código prévio sem autorização do evento.

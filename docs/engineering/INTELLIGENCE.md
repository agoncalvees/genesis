# Intelligence e receitas

AI SDK + OpenRouter como primeira integração, versão/provedor verificados na fase 00. Não depender de IA para iniciar a UI. Usar abstrações nativas, não construir um framework próprio. Escolher modelo por capacidade (tool calling, visão, structured output, latência), não por nome popular. Assinaturas de ferramentas de coding não equivalem a créditos de API.

## P0
Texto, streaming, structured output validado, tool calling com ferramenta neutra e segura. Chaves server-only, limite de entrada/saída, orçamento por execução, timeout, cancelamento, mensagens de falha. Testar modelo principal e fallback compatível; nunca migrar dados sensíveis entre provedores sem autorização. Não expor endpoint público irrestrito; Studio só em dev.

## Padrões opcionais
Pipeline, routing, processamento paralelo, evaluator-optimizer com limite, tool calling, inteligência híbrida (IA interpreta; algoritmo calcula e valida). Preferir menor complexidade. Resultados de IA são não confiáveis até validação. Conteúdo externo pode conter prompt injection: separar dados/instruções, allowlist de ferramentas, confirmação humana para efeitos externos.

## Receitas (não instalar todas)
P0: structured output, streaming, tools, multimodal conforme capacidade. P1: CSV/DuckDB/Polars, ECharts, Python/uv, Docling. P2: OR-Tools, MapLibre, React Flow, Mastra, Firecrawl, E2B, LiveKit, 3D. Cada receita contém fonte oficial, versão, pré-requisitos, custo/quota, comandos, exemplo executável, teste, falhas e remoção. Nunca dizer que receita foi testada se não foi.

Referência: https://www.anthropic.com/research/building-effective-agents

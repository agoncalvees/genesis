# Fixtures sintéticas

`integers.ts` contém **apenas dados sintéticos rotulados**: arrays de inteiros
gerados de forma determinística por mulberry32 a partir de um seed fixo
(`20261124`). Não há dado real, segredo, serviço externo ou rede envolvido.

O gerador é estável entre execuções com o mesmo seed e versão da fixture
(`1.0.0`). Use `makeFixture` com `count`/`length` explícitos para declarar o
tamanho da entrada em `config` do benchmark. Nenhum valor gerado aqui é
apresentado como medição: ele é somente entrada para as implementações
determinísticas medidas por `benchmarks/run.ts`.

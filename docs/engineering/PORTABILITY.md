# Iniciar um produto a partir do Genesis

Confirme o regulamento do evento antes de reutilizar material. Use Bun e Node nas versões indicadas no README e configure sua identidade Git. A árvore de trabalho do Genesis deve estar limpa, inclusive de arquivos novos que o Git não ignora.

```sh
bun run genesis:new -- --name "Nome do Produto" --slug nome-do-produto --world neutral --dir /caminho/absoluto/nome-do-produto
```

O destino deve estar ausente ou vazio e fora das árvores de trabalho registradas do Genesis. Nome é o texto exibido na interface. O slug em kebab-case passa a ser o nome do pacote e compõe o branch `product/<slug>`. Use `--dry-run` para conferir o SHA, o destino, o branch e os caminhos planejados sem criar arquivos.

O comando clona o repositório local com o histórico e sem compartilhamento de objetos, remove o remoto `origin` e cria o branch no SHA registrado. Arquivos locais ignorados pelo Git ficam na origem. Se o commit de origem contiver artefatos como `.env`, `.vercel`, `node_modules`, `benchmarks/results` ou `test-results` versionados, o comando recusa a inicialização antes de clonar. A instalação e o build podem gerar seus próprios artefatos no destino.

O nome da aplicação vem de `src/core/app-config.ts`. A página inicial recebe um texto provisório. Demos, Studio e testes exclusivos dessas páginas saem do clone. O smoke, o design system, as decisões de arquitetura e a documentação de engenharia e design continuam disponíveis. Os cinco documentos em `docs/product/` começam em branco, e `docs/STATUS.md` começa na fase 0 do produto.

Informe `--world neutral` para manter o design da origem. Para outro identificador, o comando executa `bun run design:apply <id>` quando tanto o script quanto `design/worlds/<id>/DESIGN.md` estiverem disponíveis no commit. Se algum deles faltar, ele preserva o design de origem e registra o motivo em `PROVENANCE.md`.

A validação instala dependências com o lockfile congelado, gera a árvore de rotas no build e executa check, typecheck e testes. Passe `--e2e` para executar também o Playwright no clone. Use `bun run playwright install chromium` se faltar o navegador e `PORT=3100` se precisar trocar a porta padrão.

`PROVENANCE.md` registra a origem, o SHA, a versão quando declarada, o comando, os caminhos excluídos e as saídas numéricas dos comandos executados. O commit de inicialização é local. Se a instalação, a aplicação de um mundo ou alguma validação falhar, o clone fica disponível para diagnóstico. A inicialização exige um destino vazio em cada tentativa.

Specs E2E que navegam para `/studio` ou `/demos` são detectados pelo conteúdo e removidos do produto (inclusive os de acessibilidade do Genesis); o produto precisa escrever os seus. As fontes licenciadas do mundo aplicado são carregadas pelo módulo gerado `src/design-system/themes/generated/product-fonts.ts`, importado pela rota raiz.

Após a revelação, preencha `CHALLENGE.md` e `PRODUCT-BRIEF.md` antes de implementar o produto.

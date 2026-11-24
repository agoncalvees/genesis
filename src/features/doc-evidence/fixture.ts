/**
 * Handwritten SYNTHETIC fixture for the rehearsal. It is not a real public
 * notice and contains no personal data. The expected items are labels, not
 * extractor output: the score is computed by comparing both.
 */

import type { EvidenceKind } from "./extract";

export const FIXTURE_NAME = "synthetic-edital-evidence-v1";
export const FIXTURE_SOURCE =
	"Handwritten synthetic rehearsal fixture (not a real document)";
export const FIXTURE_VERSION = "1";

export type ExpectedItem = { kind: EvidenceKind; value: string };

export const FIXTURE_TEXT = `EDITAL SINTÉTICO DE TREINO (FIXTURE — NÃO É UM DOCUMENTO REAL)

1. As inscrições abrem em 15/01/2027 e encerram em 15 de fevereiro de 2027.
2. O candidato deve enviar a documentação até 30/03/2027.
3. É obrigatório assinar o formulário em até 30 dias contados da publicação.
4. É vedado o uso de recursos externos durante a prova.
5. A taxa pode ser paga em até 5 dias úteis após a confirmação.
6. Os recursos devem ser enviados no prazo de 10 dias.
7. A lista final será publicada em 20 de abril de 2027.
8. O resultado deve ser divulgado em até 48 horas após a sessão.
9. A inscrição é facultativa e não gera obrigação de comparecimento.
10. Reuniões de orientação em 12/2027, sem dia definido.
11. É obrigatório comparecer no dia 03/05/2027 com documento de identidade.
12. A comissão deve publicar a ata em 10 dias.`;

export const EXPECTED_ITEMS: readonly ExpectedItem[] = [
	{ kind: "date", value: "15/01/2027" },
	{ kind: "date", value: "15 de fevereiro de 2027" },
	{ kind: "obligation", value: "deve" },
	{ kind: "date", value: "30/03/2027" },
	{ kind: "obligation", value: "É obrigatório" },
	{ kind: "deadline", value: "em até 30 dias" },
	{ kind: "obligation", value: "É vedado" },
	{ kind: "deadline", value: "em até 5 dias úteis" },
	{ kind: "obligation", value: "devem" },
	{ kind: "deadline", value: "no prazo de 10 dias" },
	{ kind: "date", value: "20 de abril de 2027" },
	{ kind: "obligation", value: "deve" },
	{ kind: "deadline", value: "em até 48 horas" },
	{ kind: "obligation", value: "É obrigatório" },
	{ kind: "date", value: "03/05/2027" },
	{ kind: "obligation", value: "deve" },
	{ kind: "deadline", value: "em 10 dias" },
];

import { describe, expect, test } from "vitest";
import {
	EXPECTED_ITEMS,
	type ExtractedItem,
	extractEvidence,
	FIXTURE_TEXT,
	scoreExtraction,
} from "../../src/features/doc-evidence";

function itemsOfKind(
	items: readonly ExtractedItem[],
	kind: ExtractedItem["kind"],
) {
	return items
		.filter((candidate) => candidate.kind === kind)
		.map((item) => item.value);
}

describe("extractEvidence", () => {
	test("extracts numeric and long-form Portuguese dates with source offsets", () => {
		const text = "Abertura em 15/01/2027 e fechamento em 15 de março de 2027.";
		const items = extractEvidence(text);

		expect(itemsOfKind(items, "date")).toEqual([
			"15/01/2027",
			"15 de março de 2027",
		]);
		expect(items[0]?.start).toBe(text.indexOf("15/01/2027"));
		expect(items[0]?.excerpt).toContain("15/01/2027");
		expect(items[1]?.end).toBe(text.indexOf("15 de março de 2027") + 19);
	});

	test("extracts relative deadlines including dias úteis and horas", () => {
		const text =
			"Enviar em até 30 dias, pagar em até 5 dias úteis e publicar em até 48 horas.";
		expect(itemsOfKind(extractEvidence(text), "deadline")).toEqual([
			"em até 30 dias",
			"em até 5 dias úteis",
			"em até 48 horas",
		]);
	});

	test("extracts obligation triggers at sentence level", () => {
		const text =
			"O candidato deve enviar o formulário. É vedado usar recursos. A taxa é facultativa.";
		const obligations = extractEvidence(text).filter(
			(item) => item.kind === "obligation",
		);
		expect(obligations.map((item) => item.value)).toEqual(["deve", "É vedado"]);
		expect(obligations[0]?.excerpt).toContain("O candidato deve enviar");
	});

	test("returns no items for blank or unmatched text", () => {
		expect(extractEvidence("   ")).toEqual([]);
		expect(extractEvidence("Texto sem datas, prazos ou obrigações.")).toEqual(
			[],
		);
		expect(extractEvidence("Reunião em 12/2027, sem dia definido.")).toEqual(
			[],
		);
	});

	test("is deterministic and reproduces the labelled fixture exactly", () => {
		const first = extractEvidence(FIXTURE_TEXT);
		const second = extractEvidence(FIXTURE_TEXT);

		expect(second).toEqual(first);
		expect(first).toHaveLength(EXPECTED_ITEMS.length);
		expect(scoreExtraction(first, EXPECTED_ITEMS)).toMatchObject({
			truePositives: EXPECTED_ITEMS.length,
			falsePositives: 0,
			falseNegatives: 0,
			precision: 1,
			recall: 1,
			f1: 1,
		});
		expect(new Set(first.map((item) => item.id)).size).toBe(first.length);
	});
});

describe("scoreExtraction", () => {
	test("counts repeated labels with a multiset and reports precision and recall", () => {
		const actual = [
			{
				id: "date-0-1",
				kind: "date" as const,
				value: "15/01/2027",
				excerpt: "15/01/2027",
				start: 0,
				end: 10,
			},
			{
				id: "deadline-1-2",
				kind: "deadline" as const,
				value: "em até 30 dias",
				excerpt: "em até 30 dias",
				start: 11,
				end: 25,
			},
		];
		const expected = [
			{ kind: "date" as const, value: "15/01/2027" },
			{ kind: "date" as const, value: "20 de abril de 2027" },
		];

		expect(scoreExtraction(actual, expected)).toMatchObject({
			expectedCount: 2,
			actualCount: 2,
			truePositives: 1,
			falsePositives: 1,
			falseNegatives: 1,
			precision: 0.5,
			recall: 0.5,
			f1: 0.5,
		});
	});

	test("returns explicit zeros when both sides are empty", () => {
		expect(scoreExtraction([], [])).toMatchObject({
			precision: 0,
			recall: 0,
			f1: 0,
		});
	});
});

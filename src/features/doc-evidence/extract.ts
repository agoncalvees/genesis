/**
 * Pure, deterministic extractor of dates, relative deadlines and obligation
 * sentences from Portuguese text. No IO, no network, no AI, no optional
 * features. Every returned item carries the exact source offsets so the UI can
 * show the original excerpt as evidence.
 */

export type EvidenceKind = "date" | "deadline" | "obligation";

export type ExtractedItem = {
	/** Stable identifier derived from position and kind. */
	id: string;
	kind: EvidenceKind;
	/** Exact source phrase that triggered the match. */
	value: string;
	/** Source excerpt with limited surrounding context. */
	excerpt: string;
	start: number;
	end: number;
};

const MONTHS = [
	"janeiro",
	"fevereiro",
	"março",
	"abril",
	"maio",
	"junho",
	"julho",
	"agosto",
	"setembro",
	"outubro",
	"novembro",
	"dezembro",
];

const NUMERIC_DATE = /\b(?:0?[1-9]|[12]\d|3[01])\/(?:0?[1-9]|1[0-2])\/\d{4}\b/g;
const LONG_DATE = new RegExp(
	`\\b\\d{1,2}\\s+de\\s+(?:${MONTHS.join("|")})\\s+de\\s+\\d{4}\\b`,
	"giu",
);
// Longest prefixes first so "em até" is not shadowed by "em".
const DEADLINE =
	/\b(?:em até|no prazo de|dentro de|até|em)\s+\d{1,3}\s+(?:dias?\s+úteis|dias?|horas?|semanas?|meses?)\b/giu;
// Unicode-aware boundaries: `\b` is ASCII-only, so it cannot sit before "É".
// Longest triggers first so "devem" and "É obrigatório" are not truncated.
const OBLIGATION =
	/(?<![\p{L}\p{N}_])(?:deverá|devem|deve|é obrigatóri[oa]|obrigatóri[oa]|é vedad[oa]|vedad[oa]|proibid[oa]|não pode)(?![\p{L}\p{N}_])/iu;
const SENTENCE = /[^.!?\n]+/g;
const CONTEXT_CHARS = 40;
const KIND_ORDER: Record<EvidenceKind, number> = {
	date: 0,
	deadline: 1,
	obligation: 2,
};

/** Build a collapsed-whitespace excerpt around a source range. */
function makeExcerpt(text: string, start: number, end: number): string {
	const from = Math.max(0, start - CONTEXT_CHARS);
	const to = Math.min(text.length, end + CONTEXT_CHARS);
	const before = from > 0 ? "…" : "";
	const after = to < text.length ? "…" : "";
	return `${before}${text.slice(from, to).replace(/\s+/g, " ").trim()}${after}`;
}

function item(
	text: string,
	kind: EvidenceKind,
	value: string,
	start: number,
	end: number,
): ExtractedItem {
	return {
		id: `${kind}-${start}-${end}`,
		kind,
		value,
		excerpt: makeExcerpt(text, start, end),
		start,
		end,
	};
}

/**
 * Extract all evidence items from `text`, ordered by source position.
 * Identical matches produced by more than one rule are emitted once.
 */
export function extractEvidence(text: string): ExtractedItem[] {
	if (typeof text !== "string" || text.trim() === "") return [];

	const found: ExtractedItem[] = [];

	for (const pattern of [NUMERIC_DATE, LONG_DATE, DEADLINE]) {
		pattern.lastIndex = 0;
		for (const match of text.matchAll(pattern)) {
			const start = match.index ?? 0;
			found.push(
				item(
					text,
					pattern === DEADLINE ? "deadline" : "date",
					match[0],
					start,
					start + match[0].length,
				),
			);
		}
	}

	for (const match of text.matchAll(SENTENCE)) {
		const raw = match[0];
		const leading = raw.length - raw.trimStart().length;
		const sentence = raw.trim();
		if (sentence === "") continue;
		const trigger = OBLIGATION.exec(sentence);
		if (!trigger) continue;
		const start = (match.index ?? 0) + leading;
		found.push(
			item(text, "obligation", trigger[0], start, start + sentence.length),
		);
	}

	found.sort(
		(a, b) => a.start - b.start || KIND_ORDER[a.kind] - KIND_ORDER[b.kind],
	);

	const seen = new Set<string>();
	return found.filter((candidate) => {
		const key = `${candidate.kind}|${candidate.start}|${candidate.end}`;
		if (seen.has(key)) return false;
		seen.add(key);
		return true;
	});
}

import { type ReactNode, useId, useState } from "react";

type ComparisonImage = { src: string; alt: string };
type ComparisonContent = ComparisonImage | ReactNode;

function isImage(content: ComparisonContent): content is ComparisonImage {
	return (
		typeof content === "object" &&
		content !== null &&
		"src" in content &&
		typeof content.src === "string" &&
		"alt" in content &&
		typeof content.alt === "string"
	);
}

function renderContent(content: ComparisonContent) {
	return isImage(content) ? (
		<img
			src={content.src}
			alt={content.alt}
			className="size-full object-contain"
		/>
	) : (
		content
	);
}

export function BeforeAfter({
	before,
	after,
	label = "Before and after comparison",
}: {
	before: ComparisonContent;
	after: ComparisonContent;
	label?: string;
}) {
	const id = useId();
	const [reveal, setReveal] = useState(50);

	return (
		<figure className="grid min-w-0 gap-3">
			<figcaption className="text-sm font-medium">{label}</figcaption>
			<div className="relative isolate aspect-video overflow-hidden rounded-md bg-surface ring-1 ring-border">
				<div className="absolute inset-0">{renderContent(before)}</div>
				<div
					className="absolute inset-0 bg-surface"
					style={{ clipPath: `inset(0 0 0 ${100 - reveal}%)` }}
				>
					{renderContent(after)}
				</div>
				{reveal > 0 && reveal < 100 && (
					<div
						aria-hidden="true"
						className="pointer-events-none absolute inset-y-0 w-px bg-foreground"
						style={{ left: `${100 - reveal}%` }}
					/>
				)}
			</div>
			<div className="grid gap-1">
				<label htmlFor={id} className="text-sm font-medium">
					{isImage(after) ? "After image revealed" : "After content revealed"}
				</label>
				<input
					className="h-11 w-full cursor-pointer accent-primary"
					id={id}
					type="range"
					dir="ltr"
					min={0}
					max={100}
					value={reveal}
					aria-valuetext={`${reveal}% after, ${100 - reveal}% before`}
					onChange={(event) => setReveal(event.currentTarget.valueAsNumber)}
				/>
				<div
					aria-hidden="true"
					className="flex justify-between text-xs text-muted"
				>
					<span>Before</span>
					<span>After</span>
				</div>
			</div>
		</figure>
	);
}

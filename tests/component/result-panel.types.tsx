import type { AppError, ExecutionStatus } from "../../src/core/contracts";
import { ResultPanel } from "../../src/design-system";

declare const status: ExecutionStatus;
declare const pendingStatus: "idle" | "running" | "cancelled";
declare const error: AppError;
declare const data: number | undefined;

<ResultPanel
	title="Result"
	status={status}
	error={error}
	data={data}
	renderResult={(value) => value.toFixed(2)}
/>;
<ResultPanel title="Pending" status={pendingStatus} />;
<ResultPanel title="Failed" status="failed" error={error} />;
<ResultPanel title="Empty" status="completed" data={null} />;
// @ts-expect-error A completed result with data requires a renderer.
<ResultPanel title="Missing renderer" status="completed" data={0} />;
// @ts-expect-error The dynamic execution can finish with data.
<ResultPanel
	title="Missing renderer"
	status={status}
	error={error}
	data={data}
/>;
// @ts-expect-error Failure still requires an error.
<ResultPanel title="Missing error" status="failed" />;

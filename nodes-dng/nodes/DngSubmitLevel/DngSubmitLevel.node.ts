import * as fs from "node:fs";
import * as path from "node:path";
import type {
	IConnection,
	IConnections,
	IExecuteFunctions,
	IDataObject,
	INode,
	INodeType,
	INodeTypeDescription,
} from "n8n-workflow";
import { NodeConnectionType, NodeOperationError } from "n8n-workflow";
import { DNG_NODE_PACKAGE, DNG_TYPE_NAME_TO_LABEL } from "../../generated/dng-lookup";

type DngMeta = (typeof DNG_TYPE_NAME_TO_LABEL)[string];

const NUM_PARAM_KEYS = new Set([
	"temperature",
	"maxOutputTokens",
	"maxIterations",
	"numResults",
	"index",
	"delayBetweenIterations",
]);

const CLIENT_VERSION = "2.0.0";

function getSuffixFromN8nType(t: string): string {
	const p = t.split(".");
	return p.length ? p[p.length - 1]! : t;
}

function buildEdges(connections: IConnections | IDataObject | undefined | null): { source: string; target: string }[] {
	const out: { source: string; target: string }[] = [];
	if (!connections || typeof connections !== "object") return out;
	for (const fromName of Object.keys(connections)) {
		const byType = (connections as IDataObject)[fromName];
		if (!byType || typeof byType !== "object") continue;
		for (const portKey of Object.keys(byType as object)) {
			const ports = (byType as IDataObject)[portKey] as
				| (Array<unknown[] | null> | null)
				| undefined;
			if (!Array.isArray(ports)) continue;
			for (const outputPort of ports) {
				if (!Array.isArray(outputPort)) continue;
				for (const link of outputPort) {
					if (!link || typeof link !== "object") continue;
					const c = link as IConnection;
					if (c.node) out.push({ source: fromName, target: c.node });
				}
			}
		}
	}
	return out;
}

function normalizeParam(
	name: string,
	v: unknown,
): { name: string; value: string | number | null } {
	if (v === null || v === undefined) {
		return { name, value: null };
	}
	if (typeof v === "number" && Number.isFinite(v)) {
		return { name, value: v };
	}
	if (typeof v === "string") {
		if (NUM_PARAM_KEYS.has(name) && /^-?[\d.]+$/u.test(v.trim())) {
			return { name, value: parseFloat(v) };
		}
		return { name, value: v };
	}
	if (typeof v === "boolean") {
		return { name, value: v ? "true" : "false" };
	}
	return { name, value: JSON.stringify(v) };
}

function n8nNodeToDng(
	node: INode,
	parameters: IDataObject,
): { id: string; type: string; data: Record<string, unknown> } | null {
	const t = String(node.type ?? "");
	if (t.toLowerCase().includes("dngsubmitlevel") || t.toLowerCase().includes("dngsubmitl")) {
		return null;
	}
	const suffix = getSuffixFromN8nType(t);
	const meta: DngMeta | undefined = DNG_TYPE_NAME_TO_LABEL[suffix];
	if (!meta) {
		return null;
	}
	const name = String(node.name ?? "node");
	const inputParams: { name: string; value: string | number | null }[] = [];
	for (const k of Object.keys(parameters)) {
		if (k === "dngNotice") continue;
		inputParams.push(normalizeParam(k, parameters[k]));
	}
	return {
		id: name,
		type: "customNode",
		data: {
			label: meta.label,
			name,
			type: meta.dngType,
			category: meta.category,
			inputParams,
		},
	};
}

function getFullWorkflow(ef: IExecuteFunctions): { nodes: INode[]; connections: IConnections } {
	// IExecuteFunctions has no public API that returns the full canvas:
	//   - getWorkflow()                   → IWorkflowMetadata { id, name, active }
	//   - getWorkflowDataProxy(0).$workflow → proxy exposing only id/name/active
	// n8n's runtime however keeps the loaded Workflow instance on the execution
	// context, where:
	//   - .nodes                  is INodes, i.e. Record<name, INode>
	//   - .connectionsBySourceNode is the canonical IConnections (by source name)
	// We read it via a deliberate `any` cast and normalise both shapes.
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const w = (ef as any).workflow as
		| {
			nodes?: Record<string, INode> | INode[];
			connectionsBySourceNode?: IConnections;
			connections?: IConnections;
		}
		| undefined;
	if (w?.nodes) {
		const nodes = Array.isArray(w.nodes) ? w.nodes : (Object.values(w.nodes) as INode[]);
		const connections = (w.connectionsBySourceNode ?? w.connections ?? {}) as IConnections;
		if (nodes.length) {
			return { nodes, connections };
		}
	}
	return { nodes: [], connections: {} as IConnections };
}

type ChallengeIndex = {
	id: string;
	title: string;
	difficulty?: string;
	category?: string;
	time_limit_minutes?: number;
};

function loadIndexJson(): ChallengeIndex[] {
	try {
		const p = path.join(__dirname, "..", "..", "..", "challenges", "index.json");
		const raw = fs.readFileSync(p, "utf8");
		return JSON.parse(raw) as ChallengeIndex[];
	} catch {
		return [];
	}
}

const CHALLENGE_INDEX = loadIndexJson();
const CHALLENGE_IDS = new Set(CHALLENGE_INDEX.map((c) => c.id));
const CHALLENGE_ID_OPTIONS: { name: string; value: string }[] = (() => {
	if (!CHALLENGE_INDEX.length) {
		return [{ name: "summarization-pipeline", value: "summarization-pipeline" }];
	}
	return CHALLENGE_INDEX.map((c) => ({
		name: c.time_limit_minutes ? `${c.title} (${c.difficulty ?? ""} · ${c.time_limit_minutes} min)` : c.title,
		value: c.id,
	}));
})();

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/u;

export class DngSubmitLevel implements INodeType {
	description: INodeTypeDescription = {
		displayName: "DNG Submit Level",
		name: "dngSubmitLevel",
		group: ["transform"],
		subtitle: "={{$parameter[\"challengeId\"]}}",
		version: 2,
		defaults: { name: "DNG Submit" },
		description:
			"Sends the candidate's canvas (DNG nodes only) and identity to the DNG scoring webhook hosted on the official n8n cloud. The challenge content is fetched server-side; only the challenge id is transmitted.",
		inputs: [NodeConnectionType.Main],
		outputs: [NodeConnectionType.Main],
		credentials: [{ name: "dngScoringWebhook", required: true }],
		properties: [
			{
				displayName:
					"This node submits your canvas to the DNG scoring service. The reference solution and grading rubric live on the server only — the exam can NOT be solved by reading local files.",
				name: "dngSubmitNotice",
				type: "notice",
				default: "",
			},
			{
				displayName: "Challenge",
				name: "challengeId",
				type: "options",
				options: CHALLENGE_ID_OPTIONS,
				default: CHALLENGE_ID_OPTIONS[0]!.value,
			},
			{
				displayName: "Candidate name",
				name: "candidateName",
				type: "string",
				placeholder: "Full name",
				default: "",
			},
			{
				displayName: "Candidate email",
				name: "candidateEmail",
				type: "string",
				placeholder: "candidate@example.com",
				default: "",
			},
			{
				displayName: "Step answers (JSON, optional)",
				name: "stepAnswersJson",
				type: "string",
				default: "{}",
				typeOptions: { rows: 6 },
			},
		] as any,
	};

	async execute(this: IExecuteFunctions) {
		const challengeId = String(
			(await this.getNodeParameter("challengeId", 0, "")) ?? "",
		).trim();
		if (!challengeId) {
			throw new NodeOperationError(this.getNode(), "Select a challenge.");
		}
		if (CHALLENGE_IDS.size && !CHALLENGE_IDS.has(challengeId)) {
			throw new NodeOperationError(
				this.getNode(),
				`Unknown challenge id "${challengeId}". Rebuild the node pack to refresh the catalogue.`,
			);
		}
		const candidateName = String((await this.getNodeParameter("candidateName", 0, "")) ?? "").trim();
		if (!candidateName) {
			throw new NodeOperationError(this.getNode(), "Candidate name is required.");
		}
		const candidateEmail = String((await this.getNodeParameter("candidateEmail", 0, "")) ?? "").trim();
		if (!candidateEmail || !EMAIL_RE.test(candidateEmail)) {
			throw new NodeOperationError(
				this.getNode(),
				"Candidate email is required and must be a valid address.",
			);
		}
		const raw = String((await this.getNodeParameter("stepAnswersJson", 0, "{}")) ?? "{}");
		let stepAnswers: Record<string, Record<string, unknown>> = {};
		if (raw?.trim() && raw.trim() !== "{}") {
			try {
				stepAnswers = JSON.parse(raw) as typeof stepAnswers;
			} catch {
				throw new NodeOperationError(this.getNode(), "Invalid JSON in Step answers.");
			}
		}

		const wf = getFullWorkflow(this);
		const dngNodes: { id: string; type: string; data: Record<string, unknown> }[] = [];
		for (const n of wf.nodes) {
			const c = n8nNodeToDng(n, (n.parameters ?? {}) as IDataObject);
			if (c) dngNodes.push(c);
		}
		if (!dngNodes.length) {
			throw new NodeOperationError(
				this.getNode(),
				'No DNG nodes found. Add DNG mirror nodes (e.g. "LLM", "Text") to this canvas and re-run.',
			);
		}
		const edges = buildEdges(wf.connections);

		const creds = (await this.getCredentials("dngScoringWebhook")) as {
			webhookUrl: string;
			sharedSecret: string;
			examToken: string;
		};
		const url = String(creds?.webhookUrl ?? "").trim();
		if (!url) {
			throw new NodeOperationError(this.getNode(), "DNG Scoring Webhook: Webhook URL is not set.");
		}
		const secret = String(creds?.sharedSecret ?? "").trim();
		if (!secret) {
			throw new NodeOperationError(
				this.getNode(),
				"DNG Scoring Webhook: shared secret is required. Ask DraftNGoal for the value to put in this credential.",
			);
		}
		const examToken = String(creds?.examToken ?? "").trim();
		if (!examToken) {
			throw new NodeOperationError(
				this.getNode(),
				"DNG Scoring Webhook: candidate exam token is required. Each candidate receives a personal token from DraftNGoal.",
			);
		}

		const submittedAt = new Date().toISOString();
		const body: IDataObject = {
			candidate: {
				name: candidateName,
				email: candidateEmail,
			},
			challenge: {
				id: challengeId,
			},
			submission: {
				workflow: { nodes: dngNodes, edges },
				step_answers: stepAnswers,
			},
			client: {
				package: DNG_NODE_PACKAGE,
				version: CLIENT_VERSION,
			},
			submitted_at: submittedAt,
		};

		const headers: Record<string, string> = {
			"content-type": "application/json",
			"x-dng-secret": secret,
			"x-dng-exam-token": examToken,
			"x-dng-client-version": CLIENT_VERSION,
		};

		let res: unknown;
		try {
			res = await this.helpers.httpRequest({
				method: "POST",
				url,
				headers,
				body,
				timeout: 30_000,
			} as any);
		} catch (e: unknown) {
			const ex = e as {
				message?: string;
				error?: { message?: string; description?: string };
				statusCode?: number;
			};
			const msg = ex.error?.message ?? ex.error?.description ?? ex.message ?? String(e);
			throw new NodeOperationError(
				this.getNode(),
				`Scoring webhook call failed${ex.statusCode ? ` (HTTP ${ex.statusCode})` : ""}: ${msg}`,
			);
		}

		const j =
			typeof res === "object" && res !== null && !Array.isArray(res)
				? { ...(res as IDataObject) }
				: ({ raw: res } as IDataObject);

		if (j && typeof j === "object" && (j as IDataObject).error) {
			const err = String((j as IDataObject).error ?? "scoring_error");
			const detail = String((j as IDataObject).message ?? "");
			throw new NodeOperationError(
				this.getNode(),
				`Scoring server rejected submission: ${err}${detail ? ` — ${detail}` : ""}`,
			);
		}

		return await this.prepareOutputData([
			{
				json: {
					...j,
					submitted_nodes: dngNodes.length,
					submitted_edges: edges.length,
					dng_package: DNG_NODE_PACKAGE,
					client_version: CLIENT_VERSION,
					challenge_id: challengeId,
				} as IDataObject,
			},
		]);
	}
}

export default DngSubmitLevel;

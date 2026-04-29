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

const DNG_NODE_PACKAGE = "n8n-nodes-dng";
const CLIENT_VERSION = "3.0.0";

function isDngSubmitNodeType(t: string): boolean {
	const s = t.toLowerCase();
	return s.includes("dngsubmitlevel") || s.includes("dngsubmitl");
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

function cloneParams(parameters: IDataObject): IDataObject {
	try {
		return JSON.parse(JSON.stringify(parameters)) as IDataObject;
	} catch {
		return { ...parameters };
	}
}

function n8nNodeToSubmission(
	node: INode,
): { id: string; type: string; typeVersion: number; parameters: IDataObject } | null {
	const t = String(node.type ?? "");
	if (!t || isDngSubmitNodeType(t)) {
		return null;
	}
	const name = String(node.name ?? "node");
	const parameters = (node.parameters ?? {}) as IDataObject;
	return {
		id: name,
		type: t,
		typeVersion: typeof node.typeVersion === "number" ? node.typeVersion : 1,
		parameters: cloneParams(parameters),
	};
}

function getFullWorkflow(ef: IExecuteFunctions): { nodes: INode[]; connections: IConnections } {
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
		return [{ name: "quick-summarize (Easy · 10 min)", value: "quick-summarize" }];
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
		version: 3,
		defaults: { name: "DNG Submit" },
		description:
			"Sends the workflow canvas (native n8n nodes only; credentials stripped server-side from reference) and identity to the DraftNGoal scoring webhook. Only the challenge id is transmitted — grading uses server-side reference workflows.",
		inputs: [NodeConnectionType.Main],
		outputs: [NodeConnectionType.Main],
		credentials: [{ name: "dngScoringWebhook", required: true }],
		properties: [
			{
				displayName:
					"This node submits your canvas to the DNG scoring service. Build with standard n8n nodes (Webhook, Set, OpenAI, …). The reference solution and grading rubric live on the server only.",
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
		const workflowNodes: { id: string; type: string; typeVersion: number; parameters: IDataObject }[] = [];
		for (const n of wf.nodes) {
			const c = n8nNodeToSubmission(n);
			if (c) workflowNodes.push(c);
		}
		if (!workflowNodes.length) {
			throw new NodeOperationError(
				this.getNode(),
				"No workflow nodes found. Add at least one native n8n node before DNG Submit Level and re-run.",
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
				workflow: { nodes: workflowNodes, edges },
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

		let response: { statusCode?: number; body?: unknown };
		try {
			response = (await this.helpers.httpRequest({
				method: "POST",
				url,
				headers,
				body,
				timeout: 30_000,
				returnFullResponse: true,
				ignoreHttpStatusErrors: true,
			} as any)) as { statusCode?: number; body?: unknown };
		} catch (e: unknown) {
			const ex = e as { message?: string; cause?: { code?: string }; code?: string };
			const reason = ex.cause?.code ?? ex.code ?? ex.message ?? String(e);
			throw new NodeOperationError(
				this.getNode(),
				`Scoring webhook unreachable at ${url}: ${reason}`,
			);
		}

		const statusCode = Number(response?.statusCode ?? 0);
		let bodyParsed: unknown = response?.body;
		if (typeof bodyParsed === "string") {
			try {
				bodyParsed = JSON.parse(bodyParsed);
			} catch {
				/* keep as raw string */
			}
		}
		const bodyObj =
			bodyParsed && typeof bodyParsed === "object" && !Array.isArray(bodyParsed)
				? (bodyParsed as IDataObject)
				: undefined;

		if (statusCode >= 400) {
			const errCode = bodyObj?.error ? String(bodyObj.error) : "";
			const detail = bodyObj?.message ? String(bodyObj.message) : "";
			const summary = errCode
				? `${errCode}${detail ? ` — ${detail}` : ""}`
				: typeof bodyParsed === "string" && bodyParsed
					? bodyParsed
					: JSON.stringify(bodyParsed ?? null);
			throw new NodeOperationError(
				this.getNode(),
				`Scoring webhook rejected submission (HTTP ${statusCode}): ${summary}`,
			);
		}

		if (bodyObj?.error) {
			const err = String(bodyObj.error);
			const detail = bodyObj.message ? String(bodyObj.message) : "";
			throw new NodeOperationError(
				this.getNode(),
				`Scoring server rejected submission: ${err}${detail ? ` — ${detail}` : ""}`,
			);
		}

		const j: IDataObject = bodyObj ? { ...bodyObj } : ({ raw: bodyParsed } as IDataObject);

		return await this.prepareOutputData([
			{
				json: {
					...j,
					submitted_nodes: workflowNodes.length,
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

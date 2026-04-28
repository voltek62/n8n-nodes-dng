import type { ICredentialType, INodeProperties } from "n8n-workflow";

/**
 * Credentials used by the `DNG Submit Level` node to authenticate the candidate against
 * the official DraftNGoal scoring webhook (hosted on n8n cloud).
 *
 * The candidate receives the three values below from DraftNGoal:
 *   - Webhook URL: shared cloud endpoint (rarely changes).
 *   - Shared secret: rotated per cohort/intake.
 *   - Exam token: personal, single-candidate value used for audit and rate-limiting.
 *
 * No part of these values gives access to the reference solution: the scoring server
 * holds the ideal workflows and grading rubrics privately.
 */
export class DngScoringWebhook implements ICredentialType {
	name = "dngScoringWebhook";

	displayName = "DNG Scoring Webhook";

	documentationUrl = "https://github.com/voltek62/n8n-nodes-dng";

	properties: INodeProperties[] = [
		{
			displayName: "Webhook URL",
			name: "webhookUrl",
			type: "string",
			default: "https://draftngoal.app.n8n.cloud/webhook/dng-score",
			placeholder: "https://draftngoal.app.n8n.cloud/webhook/dng-score",
			description:
				"Public scoring endpoint operated by DraftNGoal. Do not change unless instructed.",
		},
		{
			displayName: "Shared secret",
			name: "sharedSecret",
			type: "string",
			typeOptions: {
				password: true,
			},
			default: "",
			required: true,
			description:
				"Cohort-wide secret provided by DraftNGoal. Sent as the X-DNG-Secret header on every submission.",
		},
		{
			displayName: "Exam token (per candidate)",
			name: "examToken",
			type: "string",
			typeOptions: {
				password: true,
			},
			default: "",
			required: true,
			description:
				"Personal, single-candidate token issued by DraftNGoal. Sent as X-DNG-Exam-Token. The server binds it to your name/email and uses it for audit and attempt limits.",
		},
	];
}

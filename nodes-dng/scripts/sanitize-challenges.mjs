#!/usr/bin/env node
/**
 * Generates the candidate-facing sanitized challenge JSON files.
 *
 * Reads each full challenge from <repo>/server/server-challenges/<id>.json (the source
 * of truth, server-only, gitignored) and writes only the fields the candidate is allowed
 * to see into <repo>/nodes-dng/challenges/<id>.json. NEVER writes ideal_workflow,
 * grading_rubric or step required_types / critical_criteria.
 *
 * If the server directory is absent (typical on a candidate machine that only cloned the
 * public repo), this script becomes a no-op so `npm run build` still works — the
 * sanitized JSON checked-in to the public repo is then assumed to be the source.
 *
 * Run:
 *   node scripts/sanitize-challenges.mjs
 *
 * Invoked automatically by `npm run build` so the published bundle stays in sync with
 * any server-side challenge change made by the maintainer.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const pkgRoot = path.resolve(__dirname, "..");
const repoRoot = path.resolve(pkgRoot, "..");
const serverDir = path.resolve(repoRoot, "server", "server-challenges");
const publicDir = path.resolve(pkgRoot, "challenges");

if (!fs.existsSync(serverDir)) {
	console.warn(
		`[sanitize-challenges] no server-challenges/ directory at ${serverDir}; skipping sanitization (using committed challenges/ as-is).`,
	);
	process.exit(0);
}
fs.mkdirSync(publicDir, { recursive: true });

const PUBLIC_TOP_FIELDS = [
	"id",
	"title",
	"description",
	"difficulty",
	"category",
	"time_limit_minutes",
	"available_node_types",
	"available_node_displayNames",
];

function sanitizeStep(step) {
	if (!step || typeof step !== "object") return null;
	const out = {};
	if (step.id !== undefined) out.id = step.id;
	if (step.title !== undefined) out.title = step.title;
	if (step.instructions !== undefined) out.instructions = step.instructions;
	return out;
}

function sanitize(full) {
	const out = {};
	for (const k of PUBLIC_TOP_FIELDS) {
		if (full[k] !== undefined) out[k] = full[k];
	}
	if (Array.isArray(full.exam_blueprint)) {
		out.exam_blueprint = full.exam_blueprint.map(sanitizeStep).filter(Boolean);
	}
	return out;
}

const indexEntries = [];
const files = fs.readdirSync(serverDir).filter((f) => f.endsWith(".json"));
for (const file of files) {
	const srcPath = path.join(serverDir, file);
	const raw = fs.readFileSync(srcPath, "utf8");
	let parsed;
	try {
		parsed = JSON.parse(raw);
	} catch (e) {
		console.error(`[sanitize-challenges] invalid JSON in ${srcPath}: ${e.message}`);
		process.exit(1);
	}
	if (!parsed.id) {
		console.error(`[sanitize-challenges] ${file} is missing "id"`);
		process.exit(1);
	}
	const publicVersion = sanitize(parsed);
	const dstPath = path.join(publicDir, `${parsed.id}.json`);
	fs.writeFileSync(dstPath, `${JSON.stringify(publicVersion, null, 2)}\n`, "utf8");
	indexEntries.push({
		id: parsed.id,
		title: parsed.title,
		difficulty: parsed.difficulty,
		category: parsed.category,
		time_limit_minutes: parsed.time_limit_minutes,
	});
}

indexEntries.sort((a, b) => String(a.id).localeCompare(String(b.id)));
fs.writeFileSync(
	path.join(publicDir, "index.json"),
	`${JSON.stringify(indexEntries, null, 2)}\n`,
	"utf8",
);

console.log(
	`[sanitize-challenges] wrote ${files.length} public challenge files + index.json to ${publicDir}`,
);

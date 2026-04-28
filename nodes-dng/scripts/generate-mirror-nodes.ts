/**
 * Run: cd n8n/nodes-dng && npm install && npx tsx scripts/generate-mirror-nodes.ts
 */
import * as fs from "node:fs";
import * as path from "node:path";
import { fileURLToPath } from "node:url";
import { NODE_DEFINITIONS } from "../source/node-definitions";
import type { NodeDefinition } from "../source/types";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const genDir = path.join(root, "generated");
const mirrorDir = path.join(root, "nodes", "mirror");

function keyToPascal(key: string): string {
	// Use non-capturing split so spaces/underscores are not included as tokens
	return key
		.split(/[\s_]+/g)
		.filter(Boolean)
		.map((p) => p[0]!.toUpperCase() + p.slice(1).toLowerCase())
		.join("");
}

function dngNameFromKey(key: string): string {
	const p = keyToPascal(key);
	return "dng" + p[0]!.toUpperCase() + p.slice(1);
}

function classNameFromKey(key: string): string {
	return "Dng" + keyToPascal(key);
}

function fileNameFromKey(key: string): string {
	return classNameFromKey(key) + ".node.ts";
}

const PACKAGE_NAME = "n8n-nodes-dng";

const TYPE_TO_META: Record<string, { label: string; dngType: string; category: string; outputCount: number; outputOrder: string[] }> = {};

function mapParamType(p: {
	name: string;
	type: string;
	label: string;
	options?: string[];
	default?: string | number;
}): { line: string } {
	if (p.type === "select" && p.options?.length) {
		const opts = p.options
			.map(
				(o) =>
					`{ name: ${JSON.stringify(o)}, value: ${JSON.stringify(o)} }`,
			)
			.join(", ");
		const d = p.options[0]!;
		return {
			line: `{ displayName: ${JSON.stringify(p.label || p.name)}, name: ${JSON.stringify(p.name)}, type: "options", options: [${opts}], default: ${JSON.stringify(d)} }`,
		};
	}
	if (p.type === "number") {
		const d =
			p.default !== undefined && typeof p.default === "number" ? p.default : 0;
		return {
			line: `{ displayName: ${JSON.stringify(p.label || p.name)}, name: ${JSON.stringify(p.name)}, type: "number", default: ${d} }`,
		};
	}
	if (p.type === "textarea") {
		const d = JSON.stringify(
			typeof p.default === "string" ? p.default : "",
		);
		return {
			line: `{ displayName: ${JSON.stringify(p.label || p.name)}, name: ${JSON.stringify(p.name)}, type: "string", typeOptions: { rows: 5 }, default: ${d} }`,
		};
	}
	// text
	if (p.default !== undefined) {
		return {
			line: `{ displayName: ${JSON.stringify(p.label || p.name)}, name: ${JSON.stringify(p.name)}, type: "string", default: ${JSON.stringify(p.default)} }`,
		};
	}
	return {
		line: `{ displayName: ${JSON.stringify(p.label || p.name)}, name: ${JSON.stringify(p.name)}, type: "string", default: "" }`,
	};
}

function buildNodeFileSimpler(key: string, def: NodeDefinition): string {
	const className = classNameFromKey(key);
	const nodeName = dngNameFromKey(key);
	const outCount = Math.max(1, def.outputs.length);
	const hasMultipleOut = outCount > 1;
	const returnStmt = hasMultipleOut
		? `    const out: Awaited<ReturnType<IExecuteFunctions["prepareOutputData"]>>[] = [];
    for (let b = 0; b < ${outCount}; b += 1) {
      const batch = b === 0 ? [...items] : (JSON.parse(JSON.stringify(items)) as INodeExecutionData[]);
      out.push(await this.prepareOutputData(batch));
    }
    return out as any;`
		: "    return await this.prepareOutputData([...items]);";

	const props: string[] = def.params.map((p) => mapParamType(p).line);
	props.unshift(
		`{ displayName: "DNG", name: "dngNotice", type: "notice", default: "DNG label: ${def.label.replace(/"/g, "\\\"")}" }`,
	);

	const outputs = hasMultipleOut
		? `outputs: [${new Array(outCount)
				.fill(0)
				.map(() => "NodeConnectionType.Main")
				.join(", ")}]`
		: "outputs: [NodeConnectionType.Main]";

	return `import type {
  IExecuteFunctions,
  INodeType,
  INodeTypeDescription,
  INodeExecutionData,
} from 'n8n-workflow';
import { NodeConnectionType, NodeOperationError } from 'n8n-workflow';

export class ${className} implements INodeType {
  description: INodeTypeDescription = {
    displayName: ${JSON.stringify(def.label)},
    name: ${JSON.stringify(nodeName)},
    group: ['transform'],
    version: 1,
    defaults: { name: ${JSON.stringify(def.label)} },
    description: ${JSON.stringify(def.description)},
    inputs: [NodeConnectionType.Main],
    ${outputs},
    properties: [
${props.map((p) => "      " + p).join(",\n")}
    ],
  };

  async execute(this: IExecuteFunctions) {
    const items = this.getInputData();
    if (!items.length) {
      throw new NodeOperationError(
        this.getNode(),
        'DNG mirror nodes need an incoming main connection (Manual trigger or previous DNG node).',
      );
    }
    ${returnStmt}
  }
}

export default ${className};

`;
}

function main() {
	if (!fs.existsSync(genDir)) fs.mkdirSync(genDir, { recursive: true });
	if (fs.existsSync(mirrorDir)) {
		// Clean stale generated files (e.g. when keyToPascal changed and old
		// names like "DngStatic_Text.node.ts" must not linger next to the
		// fresh ones).
		for (const f of fs.readdirSync(mirrorDir)) {
			if (f.endsWith(".node.ts")) {
				fs.unlinkSync(path.join(mirrorDir, f));
			}
		}
	} else {
		fs.mkdirSync(mirrorDir, { recursive: true });
	}

	const keys = Object.keys(NODE_DEFINITIONS);
	for (const key of keys) {
		const def = NODE_DEFINITIONS[key]!;
		const outOrder = def.outputs.length
			? def.outputs.map((o) => o.id)
			: ["output_0"];
		TYPE_TO_META[dngNameFromKey(key)] = {
			label: def.label,
			dngType: def.type,
			category: def.category,
			outputCount: Math.max(1, def.outputs.length),
			outputOrder: outOrder,
		};

		fs.writeFileSync(
			path.join(mirrorDir, fileNameFromKey(key)),
			buildNodeFileSimpler(key, def),
			"utf8",
		);
	}

	const lookupTs = `// AUTO-GENERATED — do not edit
export const DNG_TYPE_NAME_TO_LABEL: Record<string, { label: string; dngType: string; category: string; outputCount: number; outputOrder: string[] }> =
  ${JSON.stringify(TYPE_TO_META, null, 2)};

export const DNG_NODE_PACKAGE = ${JSON.stringify(PACKAGE_NAME)};
`;
	fs.writeFileSync(path.join(genDir, "dng-lookup.ts"), lookupTs, "utf8");

	const packageJson = JSON.parse(
		fs.readFileSync(path.join(root, "package.json"), "utf8"),
	) as { n8n: { nodes: string[]; credentials: string[] } };
	packageJson.n8n = packageJson.n8n || { credentials: [], nodes: [] };
	packageJson.n8n.credentials = ["dist/credentials/DngScoringWebhook.credentials.js"];
	packageJson.n8n.nodes = [
		"dist/nodes/DngSubmitLevel/DngSubmitLevel.node.js",
		...keys.sort().map(
			(k) => "dist/nodes/mirror/" + classNameFromKey(k) + ".node.js",
		),
	];
	fs.writeFileSync(
		path.join(root, "package.json"),
		JSON.stringify(packageJson, null, 2) + "\n",
		"utf8",
	);
	console.log(`Generated ${keys.length} mirror nodes + dng-lookup.ts, updated package.json.`);
}

main();

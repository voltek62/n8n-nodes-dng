import type {
  IExecuteFunctions,
  INodeType,
  INodeTypeDescription,
  INodeExecutionData,
} from 'n8n-workflow';
import { NodeConnectionType, NodeOperationError } from 'n8n-workflow';

export class DngConditionalNode implements INodeType {
  description: INodeTypeDescription = {
    displayName: "Conditional Node",
    name: "dngConditionalNode",
    group: ['transform'],
    version: 1,
    defaults: { name: "Conditional Node" },
    description: "Conditional branching (IF / ELSE)",
    inputs: [NodeConnectionType.Main],
    outputs: [NodeConnectionType.Main, NodeConnectionType.Main],
    properties: [
      { displayName: "DNG", name: "dngNotice", type: "notice", default: "DNG label: Conditional Node" },
      { displayName: "Variable to test", name: "variable", type: "string", default: "" },
      { displayName: "Operator", name: "operator", type: "options", options: [{ name: "contains", value: "contains" }, { name: "not_contains", value: "not_contains" }, { name: "equals", value: "equals" }, { name: "not_equals", value: "not_equals" }, { name: "starts_with", value: "starts_with" }, { name: "ends_with", value: "ends_with" }, { name: "greater_than", value: "greater_than" }, { name: "less_than", value: "less_than" }, { name: "is_empty", value: "is_empty" }, { name: "is_not_empty", value: "is_not_empty" }], default: "contains" },
      { displayName: "Compare value", name: "value", type: "string", default: "" }
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
        const out: Awaited<ReturnType<IExecuteFunctions["prepareOutputData"]>>[] = [];
    for (let b = 0; b < 2; b += 1) {
      const batch = b === 0 ? [...items] : (JSON.parse(JSON.stringify(items)) as INodeExecutionData[]);
      out.push(await this.prepareOutputData(batch));
    }
    return out as any;
  }
}

export default DngConditionalNode;


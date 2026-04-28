import type {
  IExecuteFunctions,
  INodeType,
  INodeTypeDescription,
  INodeExecutionData,
} from 'n8n-workflow';
import { NodeConnectionType, NodeOperationError } from 'n8n-workflow';

export class DngAiCode implements INodeType {
  description: INodeTypeDescription = {
    displayName: "AI Code",
    name: "dngAiCode",
    group: ['transform'],
    version: 1,
    defaults: { name: "AI Code" },
    description: "AI code generation",
    inputs: [NodeConnectionType.Main],
    outputs: [NodeConnectionType.Main],
    properties: [
      { displayName: "DNG", name: "dngNotice", type: "notice", default: "DNG label: AI Code" },
      { displayName: "Model", name: "modelName", type: "options", options: [{ name: "gpt-4o", value: "gpt-4o" }, { name: "gpt-4", value: "gpt-4" }, { name: "claude-3.5-sonnet", value: "claude-3.5-sonnet" }], default: "gpt-4o" },
      { displayName: "Prompt", name: "prompt", type: "string", typeOptions: { rows: 5 }, default: "" }
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
        return await this.prepareOutputData([...items]);
  }
}

export default DngAiCode;


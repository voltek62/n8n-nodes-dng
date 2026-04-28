import type {
  IExecuteFunctions,
  INodeType,
  INodeTypeDescription,
  INodeExecutionData,
} from 'n8n-workflow';
import { NodeConnectionType, NodeOperationError } from 'n8n-workflow';

export class DngImageToText implements INodeType {
  description: INodeTypeDescription = {
    displayName: "Image to Text",
    name: "dngImageToText",
    group: ['transform'],
    version: 1,
    defaults: { name: "Image to Text" },
    description: "Extract text from an image",
    inputs: [NodeConnectionType.Main],
    outputs: [NodeConnectionType.Main],
    properties: [
      { displayName: "DNG", name: "dngNotice", type: "notice", default: "DNG label: Image to Text" },
      { displayName: "Model", name: "modelName", type: "options", options: [{ name: "gpt-4o", value: "gpt-4o" }, { name: "claude-3.5-sonnet", value: "claude-3.5-sonnet" }, { name: "gemini-1.5-pro", value: "gemini-1.5-pro" }], default: "gpt-4o" },
      { displayName: "Instructions", name: "prompt", type: "string", typeOptions: { rows: 5 }, default: "" }
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

export default DngImageToText;


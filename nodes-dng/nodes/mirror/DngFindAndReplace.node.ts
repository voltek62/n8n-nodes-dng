import type {
  IExecuteFunctions,
  INodeType,
  INodeTypeDescription,
  INodeExecutionData,
} from 'n8n-workflow';
import { NodeConnectionType, NodeOperationError } from 'n8n-workflow';

export class DngFindAndReplace implements INodeType {
  description: INodeTypeDescription = {
    displayName: "Find And Replace",
    name: "dngFindAndReplace",
    group: ['transform'],
    version: 1,
    defaults: { name: "Find And Replace" },
    description: "Find and replace in text",
    inputs: [NodeConnectionType.Main],
    outputs: [NodeConnectionType.Main],
    properties: [
      { displayName: "DNG", name: "dngNotice", type: "notice", default: "DNG label: Find And Replace" },
      { displayName: "Find", name: "find", type: "string", default: "" },
      { displayName: "Replace with", name: "replace", type: "string", default: "" },
      { displayName: "Regex", name: "useRegex", type: "options", options: [{ name: "false", value: "false" }, { name: "true", value: "true" }], default: "false" }
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

export default DngFindAndReplace;


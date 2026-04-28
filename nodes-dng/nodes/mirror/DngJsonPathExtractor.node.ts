import type {
  IExecuteFunctions,
  INodeType,
  INodeTypeDescription,
  INodeExecutionData,
} from 'n8n-workflow';
import { NodeConnectionType, NodeOperationError } from 'n8n-workflow';

export class DngJsonPathExtractor implements INodeType {
  description: INodeTypeDescription = {
    displayName: "JSON Path Extractor",
    name: "dngJsonPathExtractor",
    group: ['transform'],
    version: 1,
    defaults: { name: "JSON Path Extractor" },
    description: "Extract values from JSON with JSONPath",
    inputs: [NodeConnectionType.Main],
    outputs: [NodeConnectionType.Main],
    properties: [
      { displayName: "DNG", name: "dngNotice", type: "notice", default: "DNG label: JSON Path Extractor" },
      { displayName: "JSONPath", name: "path", type: "string", default: "" }
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

export default DngJsonPathExtractor;


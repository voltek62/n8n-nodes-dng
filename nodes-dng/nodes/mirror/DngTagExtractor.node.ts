import type {
  IExecuteFunctions,
  INodeType,
  INodeTypeDescription,
  INodeExecutionData,
} from 'n8n-workflow';
import { NodeConnectionType, NodeOperationError } from 'n8n-workflow';

export class DngTagExtractor implements INodeType {
  description: INodeTypeDescription = {
    displayName: "Tag Extractor",
    name: "dngTagExtractor",
    group: ['transform'],
    version: 1,
    defaults: { name: "Tag Extractor" },
    description: "Extract specific HTML tags",
    inputs: [NodeConnectionType.Main],
    outputs: [NodeConnectionType.Main],
    properties: [
      { displayName: "DNG", name: "dngNotice", type: "notice", default: "DNG label: Tag Extractor" },
      { displayName: "Tag (h1, a, img, …)", name: "tagName", type: "string", default: "" }
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

export default DngTagExtractor;


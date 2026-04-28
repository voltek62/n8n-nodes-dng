import type {
  IExecuteFunctions,
  INodeType,
  INodeTypeDescription,
  INodeExecutionData,
} from 'n8n-workflow';
import { NodeConnectionType, NodeOperationError } from 'n8n-workflow';

export class DngSerperDev implements INodeType {
  description: INodeTypeDescription = {
    displayName: "Serper Dev",
    name: "dngSerperDev",
    group: ['transform'],
    version: 1,
    defaults: { name: "Serper Dev" },
    description: "Web search via Serper (SERP API)",
    inputs: [NodeConnectionType.Main],
    outputs: [NodeConnectionType.Main],
    properties: [
      { displayName: "DNG", name: "dngNotice", type: "notice", default: "DNG label: Serper Dev" },
      { displayName: "Search query", name: "query", type: "string", default: "" },
      { displayName: "Number of results", name: "numResults", type: "number", default: 10 },
      { displayName: "Type", name: "searchType", type: "options", options: [{ name: "search", value: "search" }, { name: "news", value: "news" }, { name: "images", value: "images" }], default: "search" }
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

export default DngSerperDev;


import type {
  IExecuteFunctions,
  INodeType,
  INodeTypeDescription,
  INodeExecutionData,
} from 'n8n-workflow';
import { NodeConnectionType, NodeOperationError } from 'n8n-workflow';

export class DngGoogleSearchConsole implements INodeType {
  description: INodeTypeDescription = {
    displayName: "Google Search Console",
    name: "dngGoogleSearchConsole",
    group: ['transform'],
    version: 1,
    defaults: { name: "Google Search Console" },
    description: "Search Console data (queries, pages, …)",
    inputs: [NodeConnectionType.Main],
    outputs: [NodeConnectionType.Main],
    properties: [
      { displayName: "DNG", name: "dngNotice", type: "notice", default: "DNG label: Google Search Console" },
      { displayName: "Site URL", name: "siteUrl", type: "string", default: "" },
      { displayName: "Date range", name: "dateRange", type: "options", options: [{ name: "7d", value: "7d" }, { name: "28d", value: "28d" }, { name: "3m", value: "3m" }, { name: "6m", value: "6m" }, { name: "12m", value: "12m" }], default: "7d" },
      { displayName: "Dimension", name: "dimension", type: "options", options: [{ name: "query", value: "query" }, { name: "page", value: "page" }, { name: "country", value: "country" }, { name: "device", value: "device" }], default: "query" }
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

export default DngGoogleSearchConsole;


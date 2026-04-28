import type {
  IExecuteFunctions,
  INodeType,
  INodeTypeDescription,
  INodeExecutionData,
} from 'n8n-workflow';
import { NodeConnectionType, NodeOperationError } from 'n8n-workflow';

export class DngHttpRequest implements INodeType {
  description: INodeTypeDescription = {
    displayName: "HTTP Request",
    name: "dngHttpRequest",
    group: ['transform'],
    version: 1,
    defaults: { name: "HTTP Request" },
    description: "HTTP call (API, webhook, …)",
    inputs: [NodeConnectionType.Main],
    outputs: [NodeConnectionType.Main],
    properties: [
      { displayName: "DNG", name: "dngNotice", type: "notice", default: "DNG label: HTTP Request" },
      { displayName: "URL", name: "url", type: "string", default: "" },
      { displayName: "Method", name: "method", type: "options", options: [{ name: "GET", value: "GET" }, { name: "POST", value: "POST" }, { name: "PUT", value: "PUT" }, { name: "PATCH", value: "PATCH" }, { name: "DELETE", value: "DELETE" }], default: "GET" },
      { displayName: "Headers (JSON)", name: "headers", type: "string", typeOptions: { rows: 5 }, default: "" },
      { displayName: "Body", name: "body", type: "string", typeOptions: { rows: 5 }, default: "" }
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

export default DngHttpRequest;


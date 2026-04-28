import type {
  IExecuteFunctions,
  INodeType,
  INodeTypeDescription,
  INodeExecutionData,
} from 'n8n-workflow';
import { NodeConnectionType, NodeOperationError } from 'n8n-workflow';

export class DngWordpressPostCreate implements INodeType {
  description: INodeTypeDescription = {
    displayName: "WordPress Post Create",
    name: "dngWordpressPostCreate",
    group: ['transform'],
    version: 1,
    defaults: { name: "WordPress Post Create" },
    description: "Publish a WordPress post",
    inputs: [NodeConnectionType.Main],
    outputs: [NodeConnectionType.Main],
    properties: [
      { displayName: "DNG", name: "dngNotice", type: "notice", default: "DNG label: WordPress Post Create" },
      { displayName: "Status", name: "status", type: "options", options: [{ name: "draft", value: "draft" }, { name: "publish", value: "publish" }, { name: "pending", value: "pending" }], default: "draft" },
      { displayName: "Category", name: "category", type: "string", default: "" },
      { displayName: "Tags (comma-separated)", name: "tags", type: "string", default: "" }
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

export default DngWordpressPostCreate;


import type {
  IExecuteFunctions,
  INodeType,
  INodeTypeDescription,
  INodeExecutionData,
} from 'n8n-workflow';
import { NodeConnectionType, NodeOperationError } from 'n8n-workflow';

export class DngPickListItem implements INodeType {
  description: INodeTypeDescription = {
    displayName: "Pick_List_Item",
    name: "dngPickListItem",
    group: ['transform'],
    version: 1,
    defaults: { name: "Pick_List_Item" },
    description: "Pick an element by index",
    inputs: [NodeConnectionType.Main],
    outputs: [NodeConnectionType.Main],
    properties: [
      { displayName: "DNG", name: "dngNotice", type: "notice", default: "DNG label: Pick_List_Item" },
      { displayName: "Index", name: "index", type: "number", default: 0 }
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

export default DngPickListItem;


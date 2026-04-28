import type {
  IExecuteFunctions,
  INodeType,
  INodeTypeDescription,
  INodeExecutionData,
} from 'n8n-workflow';
import { NodeConnectionType, NodeOperationError } from 'n8n-workflow';

export class DngCreateList implements INodeType {
  description: INodeTypeDescription = {
    displayName: "Create_List",
    name: "dngCreateList",
    group: ['transform'],
    version: 1,
    defaults: { name: "Create_List" },
    description: "Build a list from items",
    inputs: [NodeConnectionType.Main],
    outputs: [NodeConnectionType.Main],
    properties: [
      { displayName: "DNG", name: "dngNotice", type: "notice", default: "DNG label: Create_List" }
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

export default DngCreateList;


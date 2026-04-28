import type {
  IExecuteFunctions,
  INodeType,
  INodeTypeDescription,
  INodeExecutionData,
} from 'n8n-workflow';
import { NodeConnectionType, NodeOperationError } from 'n8n-workflow';

export class DngHumanInTheLoop implements INodeType {
  description: INodeTypeDescription = {
    displayName: "Human_in_the_Loop",
    name: "dngHumanInTheLoop",
    group: ['transform'],
    version: 1,
    defaults: { name: "Human_in_the_Loop" },
    description: "Human validation checkpoint",
    inputs: [NodeConnectionType.Main],
    outputs: [NodeConnectionType.Main],
    properties: [
      { displayName: "DNG", name: "dngNotice", type: "notice", default: "DNG label: Human_in_the_Loop" },
      { displayName: "Instructions for the reviewer", name: "instructions", type: "string", typeOptions: { rows: 5 }, default: "" }
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

export default DngHumanInTheLoop;


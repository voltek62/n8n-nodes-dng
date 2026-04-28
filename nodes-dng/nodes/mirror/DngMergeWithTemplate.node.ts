import type {
  IExecuteFunctions,
  INodeType,
  INodeTypeDescription,
  INodeExecutionData,
} from 'n8n-workflow';
import { NodeConnectionType, NodeOperationError } from 'n8n-workflow';

export class DngMergeWithTemplate implements INodeType {
  description: INodeTypeDescription = {
    displayName: "Merge With Template",
    name: "dngMergeWithTemplate",
    group: ['transform'],
    version: 1,
    defaults: { name: "Merge With Template" },
    description: "Merge data into a template with {{variable}}",
    inputs: [NodeConnectionType.Main],
    outputs: [NodeConnectionType.Main],
    properties: [
      { displayName: "DNG", name: "dngNotice", type: "notice", default: "DNG label: Merge With Template" },
      { displayName: "Template", name: "template", type: "string", typeOptions: { rows: 5 }, default: "" }
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

export default DngMergeWithTemplate;


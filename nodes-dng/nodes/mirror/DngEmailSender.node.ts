import type {
  IExecuteFunctions,
  INodeType,
  INodeTypeDescription,
  INodeExecutionData,
} from 'n8n-workflow';
import { NodeConnectionType, NodeOperationError } from 'n8n-workflow';

export class DngEmailSender implements INodeType {
  description: INodeTypeDescription = {
    displayName: "Email Sender",
    name: "dngEmailSender",
    group: ['transform'],
    version: 1,
    defaults: { name: "Email Sender" },
    description: "Send an email",
    inputs: [NodeConnectionType.Main],
    outputs: [NodeConnectionType.Main],
    properties: [
      { displayName: "DNG", name: "dngNotice", type: "notice", default: "DNG label: Email Sender" },
      { displayName: "To", name: "to", type: "string", default: "" },
      { displayName: "Subject", name: "subject", type: "string", default: "" },
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

export default DngEmailSender;


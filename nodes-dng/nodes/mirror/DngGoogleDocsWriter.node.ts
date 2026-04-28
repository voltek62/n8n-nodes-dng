import type {
  IExecuteFunctions,
  INodeType,
  INodeTypeDescription,
  INodeExecutionData,
} from 'n8n-workflow';
import { NodeConnectionType, NodeOperationError } from 'n8n-workflow';

export class DngGoogleDocsWriter implements INodeType {
  description: INodeTypeDescription = {
    displayName: "Google_Docs_Writer",
    name: "dngGoogleDocsWriter",
    group: ['transform'],
    version: 1,
    defaults: { name: "Google_Docs_Writer" },
    description: "Write to Google Docs",
    inputs: [NodeConnectionType.Main],
    outputs: [NodeConnectionType.Main],
    properties: [
      { displayName: "DNG", name: "dngNotice", type: "notice", default: "DNG label: Google_Docs_Writer" },
      { displayName: "Document title", name: "documentTitle", type: "string", default: "" }
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

export default DngGoogleDocsWriter;


import type {
  IExecuteFunctions,
  INodeType,
  INodeTypeDescription,
  INodeExecutionData,
} from 'n8n-workflow';
import { NodeConnectionType, NodeOperationError } from 'n8n-workflow';

export class DngFile implements INodeType {
  description: INodeTypeDescription = {
    displayName: "File",
    name: "dngFile",
    group: ['transform'],
    version: 1,
    defaults: { name: "File" },
    description: "File input (PDF, CSV, TXT, …)",
    inputs: [NodeConnectionType.Main],
    outputs: [NodeConnectionType.Main],
    properties: [
      { displayName: "DNG", name: "dngNotice", type: "notice", default: "DNG label: File" },
      { displayName: "File type", name: "type", type: "options", options: [{ name: "PDF", value: "PDF" }, { name: "CSV", value: "CSV" }, { name: "TXT", value: "TXT" }, { name: "JSON", value: "JSON" }, { name: "DOCX", value: "DOCX" }], default: "PDF" }
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

export default DngFile;


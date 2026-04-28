import type {
  IExecuteFunctions,
  INodeType,
  INodeTypeDescription,
  INodeExecutionData,
} from 'n8n-workflow';
import { NodeConnectionType, NodeOperationError } from 'n8n-workflow';

export class DngGoogleSheetsReader implements INodeType {
  description: INodeTypeDescription = {
    displayName: "Google Sheets Reader",
    name: "dngGoogleSheetsReader",
    group: ['transform'],
    version: 1,
    defaults: { name: "Google Sheets Reader" },
    description: "Read from Google Sheets",
    inputs: [NodeConnectionType.Main],
    outputs: [NodeConnectionType.Main],
    properties: [
      { displayName: "DNG", name: "dngNotice", type: "notice", default: "DNG label: Google Sheets Reader" },
      { displayName: "Spreadsheet ID", name: "spreadsheetId", type: "string", default: "" },
      { displayName: "Sheet name", name: "sheetName", type: "string", default: "" },
      { displayName: "Range (e.g. A1:D50)", name: "range", type: "string", default: "" }
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

export default DngGoogleSheetsReader;


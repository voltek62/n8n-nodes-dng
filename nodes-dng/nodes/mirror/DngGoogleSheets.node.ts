import type {
  IExecuteFunctions,
  INodeType,
  INodeTypeDescription,
  INodeExecutionData,
} from 'n8n-workflow';
import { NodeConnectionType, NodeOperationError } from 'n8n-workflow';

export class DngGoogleSheets implements INodeType {
  description: INodeTypeDescription = {
    displayName: "Google Sheets",
    name: "dngGoogleSheets",
    group: ['transform'],
    version: 1,
    defaults: { name: "Google Sheets" },
    description: "Write to Google Sheets",
    inputs: [NodeConnectionType.Main],
    outputs: [NodeConnectionType.Main],
    properties: [
      { displayName: "DNG", name: "dngNotice", type: "notice", default: "DNG label: Google Sheets" },
      { displayName: "Spreadsheet ID", name: "spreadsheetId", type: "string", default: "" },
      { displayName: "Sheet name", name: "sheetName", type: "string", default: "" },
      { displayName: "Write mode", name: "writeMode", type: "options", options: [{ name: "append", value: "append" }, { name: "overwrite", value: "overwrite" }], default: "append" }
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

export default DngGoogleSheets;


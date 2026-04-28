import type {
  IExecuteFunctions,
  INodeType,
  INodeTypeDescription,
  INodeExecutionData,
} from 'n8n-workflow';
import { NodeConnectionType, NodeOperationError } from 'n8n-workflow';

export class DngCsvAnalyzer implements INodeType {
  description: INodeTypeDescription = {
    displayName: "CSV Analyzer",
    name: "dngCsvAnalyzer",
    group: ['transform'],
    version: 1,
    defaults: { name: "CSV Analyzer" },
    description: "Analyze a CSV file",
    inputs: [NodeConnectionType.Main],
    outputs: [NodeConnectionType.Main],
    properties: [
      { displayName: "DNG", name: "dngNotice", type: "notice", default: "DNG label: CSV Analyzer" },
      { displayName: "Analysis type", name: "analysisType", type: "options", options: [{ name: "summary", value: "summary" }, { name: "statistics", value: "statistics" }, { name: "preview", value: "preview" }], default: "summary" }
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

export default DngCsvAnalyzer;


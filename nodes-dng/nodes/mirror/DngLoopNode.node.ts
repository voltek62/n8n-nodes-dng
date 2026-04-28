import type {
  IExecuteFunctions,
  INodeType,
  INodeTypeDescription,
  INodeExecutionData,
} from 'n8n-workflow';
import { NodeConnectionType, NodeOperationError } from 'n8n-workflow';

export class DngLoopNode implements INodeType {
  description: INodeTypeDescription = {
    displayName: "Loop Node",
    name: "dngLoopNode",
    group: ['transform'],
    version: 1,
    defaults: { name: "Loop Node" },
    description: "Iterate over a list",
    inputs: [NodeConnectionType.Main],
    outputs: [NodeConnectionType.Main, NodeConnectionType.Main],
    properties: [
      { displayName: "DNG", name: "dngNotice", type: "notice", default: "DNG label: Loop Node" },
      { displayName: "Max iterations", name: "maxIterations", type: "number", default: 10 },
      { displayName: "Delay between iterations (ms)", name: "delayBetweenIterations", type: "number", default: 100 },
      { displayName: "Error handling", name: "errorHandling", type: "options", options: [{ name: "None", value: "None" }, { name: "Skip", value: "Skip" }], default: "None" }
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
        const out: Awaited<ReturnType<IExecuteFunctions["prepareOutputData"]>>[] = [];
    for (let b = 0; b < 2; b += 1) {
      const batch = b === 0 ? [...items] : (JSON.parse(JSON.stringify(items)) as INodeExecutionData[]);
      out.push(await this.prepareOutputData(batch));
    }
    return out as any;
  }
}

export default DngLoopNode;


import type {
  IExecuteFunctions,
  INodeType,
  INodeTypeDescription,
  INodeExecutionData,
} from 'n8n-workflow';
import { NodeConnectionType, NodeOperationError } from 'n8n-workflow';

export class DngAgent implements INodeType {
  description: INodeTypeDescription = {
    displayName: "Agent",
    name: "dngAgent",
    group: ['transform'],
    version: 1,
    defaults: { name: "Agent" },
    description: "Autonomous AI agent with tools",
    inputs: [NodeConnectionType.Main],
    outputs: [NodeConnectionType.Main],
    properties: [
      { displayName: "DNG", name: "dngNotice", type: "notice", default: "DNG label: Agent" },
      { displayName: "Model", name: "modelName", type: "options", options: [{ name: "gpt-4o", value: "gpt-4o" }, { name: "gpt-4", value: "gpt-4" }, { name: "claude-3.5-sonnet", value: "claude-3.5-sonnet" }, { name: "claude-3-opus", value: "claude-3-opus" }, { name: "gemini-1.5-pro", value: "gemini-1.5-pro" }], default: "gpt-4o" },
      { displayName: "Temperature", name: "temperature", type: "number", default: 0.5 },
      { displayName: "Max tokens", name: "maxOutputTokens", type: "number", default: 4000 },
      { displayName: "System message", name: "agentSystemMessage", type: "string", typeOptions: { rows: 5 }, default: "" },
      { displayName: "Tools", name: "agentTools", type: "options", options: [{ name: "web_search", value: "web_search" }, { name: "code_execution", value: "code_execution" }, { name: "file_read", value: "file_read" }, { name: "calculator", value: "calculator" }], default: "web_search" },
      { displayName: "Prompt", name: "prompt", type: "string", typeOptions: { rows: 5 }, default: "" }
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

export default DngAgent;


import type {
  IExecuteFunctions,
  INodeType,
  INodeTypeDescription,
  INodeExecutionData,
} from 'n8n-workflow';
import { NodeConnectionType, NodeOperationError } from 'n8n-workflow';

export class DngLlm implements INodeType {
  description: INodeTypeDescription = {
    displayName: "LLM",
    name: "dngLlm",
    group: ['transform'],
    version: 1,
    defaults: { name: "LLM" },
    description: "Language model (GPT, Claude, …)",
    inputs: [NodeConnectionType.Main],
    outputs: [NodeConnectionType.Main],
    properties: [
      { displayName: "DNG", name: "dngNotice", type: "notice", default: "DNG label: LLM" },
      { displayName: "Model", name: "modelName", type: "options", options: [{ name: "gpt-4o", value: "gpt-4o" }, { name: "gpt-4", value: "gpt-4" }, { name: "gpt-4-turbo", value: "gpt-4-turbo" }, { name: "gpt-3.5-turbo", value: "gpt-3.5-turbo" }, { name: "claude-3.5-sonnet", value: "claude-3.5-sonnet" }, { name: "claude-3-opus", value: "claude-3-opus" }, { name: "claude-3-sonnet", value: "claude-3-sonnet" }, { name: "claude-3-haiku", value: "claude-3-haiku" }, { name: "gemini-1.5-pro", value: "gemini-1.5-pro" }, { name: "gemini-1.5-flash", value: "gemini-1.5-flash" }, { name: "mistral-large", value: "mistral-large" }], default: "gpt-4o" },
      { displayName: "Temperature", name: "temperature", type: "number", default: 0.7 },
      { displayName: "Max tokens", name: "maxOutputTokens", type: "number", default: 2000 },
      { displayName: "System message", name: "systemMessage", type: "string", typeOptions: { rows: 5 }, default: "" },
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

export default DngLlm;


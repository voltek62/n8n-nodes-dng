import type {
  IExecuteFunctions,
  INodeType,
  INodeTypeDescription,
  INodeExecutionData,
} from 'n8n-workflow';
import { NodeConnectionType, NodeOperationError } from 'n8n-workflow';

export class DngTextToImage implements INodeType {
  description: INodeTypeDescription = {
    displayName: "Text to Image",
    name: "dngTextToImage",
    group: ['transform'],
    version: 1,
    defaults: { name: "Text to Image" },
    description: "Generate an image from text",
    inputs: [NodeConnectionType.Main],
    outputs: [NodeConnectionType.Main],
    properties: [
      { displayName: "DNG", name: "dngNotice", type: "notice", default: "DNG label: Text to Image" },
      { displayName: "Model", name: "modelName", type: "options", options: [{ name: "dall-e-3", value: "dall-e-3" }, { name: "dall-e-2", value: "dall-e-2" }, { name: "stable-diffusion-xl", value: "stable-diffusion-xl" }, { name: "midjourney", value: "midjourney" }], default: "dall-e-3" },
      { displayName: "Size", name: "size", type: "options", options: [{ name: "1024x1024", value: "1024x1024" }, { name: "1792x1024", value: "1792x1024" }, { name: "1024x1792", value: "1024x1792" }, { name: "512x512", value: "512x512" }], default: "1024x1024" },
      { displayName: "Quality", name: "quality", type: "options", options: [{ name: "standard", value: "standard" }, { name: "hd", value: "hd" }], default: "standard" },
      { displayName: "Image prompt", name: "prompt", type: "string", typeOptions: { rows: 5 }, default: "" }
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

export default DngTextToImage;


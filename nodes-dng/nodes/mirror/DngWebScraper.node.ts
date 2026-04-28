import type {
  IExecuteFunctions,
  INodeType,
  INodeTypeDescription,
  INodeExecutionData,
} from 'n8n-workflow';
import { NodeConnectionType, NodeOperationError } from 'n8n-workflow';

export class DngWebScraper implements INodeType {
  description: INodeTypeDescription = {
    displayName: "Web Scraper",
    name: "dngWebScraper",
    group: ['transform'],
    version: 1,
    defaults: { name: "Web Scraper" },
    description: "Fetch and extract web content",
    inputs: [NodeConnectionType.Main],
    outputs: [NodeConnectionType.Main],
    properties: [
      { displayName: "DNG", name: "dngNotice", type: "notice", default: "DNG label: Web Scraper" },
      { displayName: "Content type", name: "contentType", type: "options", options: [{ name: "Article", value: "Article" }, { name: "ArticleList", value: "ArticleList" }, { name: "Product", value: "Product" }, { name: "ProductList", value: "ProductList" }, { name: "No Template", value: "No Template" }], default: "Article" },
      { displayName: "XPath 1 (optional)", name: "xPath_1", type: "string", default: "" },
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
        return await this.prepareOutputData([...items]);
  }
}

export default DngWebScraper;


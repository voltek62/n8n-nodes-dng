/**
 * Shared types for DNG mirror node definitions (used by n8n only).
 */
export interface NodeParam {
  name: string;
  value: string | number | null;
}

export interface WorkflowNodeData extends Record<string, unknown> {
  label: string;
  name: string;
  type: string;
  category: string;
  description?: string;
  inputs?: { id: string; label: string; type: string }[];
  outputs?: { id: string; label: string; type: string }[];
  inputParams: NodeParam[];
}

export interface NodeDefinition {
  label: string;
  category: "input" | "ai" | "tools" | "integrations" | "constants" | "output";
  type: string;
  description: string;
  inputs: { id: string; label: string; type: string }[];
  outputs: { id: string; label: string; type: string }[];
  params: {
    name: string;
    label: string;
    type: "text" | "textarea" | "number" | "select";
    options?: string[];
    default?: string | number;
  }[];
}

export interface CategoryMeta {
  label: string;
  color: string;
  bgClass: string;
  borderClass: string;
  headerClass: string;
}

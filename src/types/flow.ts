export type StageId = "client" | "portal" | "service" | "platform";

export type NodeId =
  | "new-request"
  | "email"
  | "api-integration"
  | "request-intake"
  | "validation"
  | "request-tracker"
  | "routing-gateway"
  | "quotation-service"
  | "campaign-service"
  | "notification-service"
  | "feature-flags"
  | "translation-api"
  | "erp-system"
  | "data-platform"
  | "analytics";

export type ComponentId =
  | "web-portal"
  | "routing-gateway"
  | "quotation-service"
  | "campaign-service"
  | "data-platform"
  | "feature-flags"
  | "translation-api";

export interface FlowNode {
  id: NodeId;
  label: string;
  stage: StageId;
}

export interface FlowStage {
  id: StageId;
  no: string;
  title: string;
  nodes: NodeId[];
}

export interface FlowEdge {
  from: NodeId;
  to: NodeId;
}

export interface CatalogEntry {
  id: ComponentId;
  label: string;
  /** The node highlighted when this component is selected. */
  nodeId: NodeId;
  stage: StageId;
  what: string;
  when: string;
  how: { lang: string; code: string };
}

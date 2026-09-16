export type StageId = "client" | "platform" | "service" | "enterprise";

/**
 * The nodes are the services the technical lead named on 2026-09-16, and no
 * others. See `lib/flow-data.ts` for what was confirmed and what is still
 * this site's reading.
 */
export type NodeId =
  // 01 customer
  | "web-app"
  // 02 platform
  | "node-gateway"
  | "feature-flags"
  | "translation"
  // 03 ONE QUOTE services — core
  | "booking"
  | "oog"
  // 03 — value-added services
  | "premium"
  | "osl-plus"
  | "dnd"
  | "pudo"
  // 03 — support & sales
  | "campaigns"
  | "coupons"
  | "price-alerts"
  | "notify-me"
  | "missing-route"
  // 04 enterprise, via Apigee
  | "apigee"
  | "schedule"
  | "space"
  | "rate-engine"
  | "opus-booking"
  | "bigquery";

export type ComponentId =
  | "web-app"
  | "node-gateway"
  | "booking"
  | "oog"
  | "campaigns"
  | "feature-flags"
  | "translation"
  | "apigee"
  | "bigquery";

export interface FlowNode {
  id: NodeId;
  label: string;
  stage: StageId;
  /** One line, on EVERY node. There is never a dead click. */
  roleKey: string;
  /**
   * A heading drawn above the first node of each run that shares it, so a
   * column of eleven services reads as three lists rather than one.
   */
  groupKey?: string;
  /** Present only where a full what/when/how deep dive exists. */
  componentId?: ComponentId;
}

export interface FlowStage {
  id: StageId;
  no: string;
  titleKey: string;
  nodes: NodeId[];
}

export interface FlowEdge {
  from: NodeId;
  to: NodeId;
}

export type RouteMap = Record<NodeId, readonly NodeId[]>;

export interface CatalogEntry {
  id: ComponentId;
  label: string;
  /** The node highlighted when this component is selected. */
  nodeId: NodeId;
  stage: StageId;
  whatKey: string;
  whenKey: string;
  how: { lang: string; code: string };
}

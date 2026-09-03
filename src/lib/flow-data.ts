import type {
  ComponentId,
  FlowEdge,
  FlowNode,
  FlowStage,
  NodeId,
} from "@/types/flow";

export const STAGES: readonly FlowStage[] = [
  {
    id: "client",
    no: "01",
    title: "CLIENT REQUEST",
    nodes: ["new-request", "email", "api-integration"],
  },
  {
    id: "portal",
    no: "02",
    title: "WEB PORTAL",
    nodes: ["request-intake", "validation", "request-tracker"],
  },
  {
    id: "service",
    no: "03",
    title: "SERVICE LAYER",
    nodes: [
      "routing-gateway",
      "quotation-service",
      "campaign-service",
      "feature-flags",
      "translation-api",
      "notification-service",
    ],
  },
  {
    id: "platform",
    no: "04",
    title: "ERP / DATA PLATFORM",
    nodes: ["erp-system", "data-platform", "analytics"],
  },
] as const;

export const NODES: Record<NodeId, FlowNode> = {
  "new-request": { id: "new-request", label: "New Request", stage: "client" },
  email: { id: "email", label: "Email", stage: "client" },
  "api-integration": {
    id: "api-integration",
    label: "API / Integration",
    stage: "client",
  },
  "request-intake": {
    id: "request-intake",
    label: "Request Intake",
    stage: "portal",
  },
  validation: { id: "validation", label: "Validation", stage: "portal" },
  "request-tracker": {
    id: "request-tracker",
    label: "Request Tracker",
    stage: "portal",
  },
  "routing-gateway": {
    id: "routing-gateway",
    label: "Routing Gateway",
    stage: "service",
  },
  "quotation-service": {
    id: "quotation-service",
    label: "Quotation Service",
    stage: "service",
  },
  "campaign-service": {
    id: "campaign-service",
    label: "Campaign Service",
    stage: "service",
  },
  "notification-service": {
    id: "notification-service",
    label: "Notification Service",
    stage: "service",
  },
  "feature-flags": {
    id: "feature-flags",
    label: "Feature Flag Service",
    stage: "service",
  },
  "translation-api": {
    id: "translation-api",
    label: "Translation API",
    stage: "service",
  },
  "erp-system": { id: "erp-system", label: "ERP System", stage: "platform" },
  "data-platform": {
    id: "data-platform",
    label: "Data Platform",
    stage: "platform",
  },
  analytics: {
    id: "analytics",
    label: "Analytics & Reporting",
    stage: "platform",
  },
};

/** Every edge in the graph. Rendering decides which are solid vs dashed. */
export const EDGES: readonly FlowEdge[] = [
  { from: "new-request", to: "request-intake" },
  { from: "email", to: "request-intake" },
  { from: "api-integration", to: "request-intake" },
  { from: "request-intake", to: "validation" },
  { from: "validation", to: "request-tracker" },
  { from: "request-intake", to: "routing-gateway" },
  { from: "routing-gateway", to: "quotation-service" },
  { from: "routing-gateway", to: "campaign-service" },
  { from: "routing-gateway", to: "feature-flags" },
  { from: "routing-gateway", to: "translation-api" },
  { from: "quotation-service", to: "notification-service" },
  { from: "campaign-service", to: "notification-service" },
  { from: "routing-gateway", to: "erp-system" },
  { from: "quotation-service", to: "erp-system" },
  { from: "campaign-service", to: "data-platform" },
  { from: "erp-system", to: "data-platform" },
  { from: "data-platform", to: "analytics" },
] as const;

/**
 * Precomputed, static. No runtime graph traversal means no pathfinding bug —
 * the highlighted route for each component is a fact, not a search result.
 */
export const DEFAULT_PATH: readonly NodeId[] = [
  "new-request",
  "request-intake",
  "routing-gateway",
  "erp-system",
] as const;

export const PRIMARY_PATH_BY_COMPONENT: Record<ComponentId, NodeId[]> = {
  "web-portal": ["new-request", "request-intake", "validation", "request-tracker"],
  "routing-gateway": ["request-intake", "routing-gateway", "erp-system"],
  "quotation-service": [
    "request-intake",
    "routing-gateway",
    "quotation-service",
    "erp-system",
  ],
  "campaign-service": [
    "request-intake",
    "routing-gateway",
    "campaign-service",
    "data-platform",
  ],
  "data-platform": ["erp-system", "data-platform", "analytics"],
  "feature-flags": ["request-intake", "routing-gateway", "feature-flags"],
  "translation-api": ["request-intake", "routing-gateway", "translation-api"],
};

/** Turn a node sequence into the set of edges it traverses. */
export function pathEdgeKeys(path: readonly NodeId[]): Set<string> {
  const keys = new Set<string>();
  for (let i = 0; i < path.length - 1; i += 1) {
    keys.add(`${path[i]}->${path[i + 1]}`);
  }
  return keys;
}

export function edgeKey(edge: FlowEdge): string {
  return `${edge.from}->${edge.to}`;
}

import type {
  FlowEdge,
  FlowNode,
  FlowStage,
  NodeId,
  RouteMap,
} from "@/types/flow";

export const STAGES: readonly FlowStage[] = [
  {
    id: "client",
    no: "01",
    titleKey: "stage.client",
    nodes: ["new-request", "email", "api-integration"],
  },
  {
    id: "portal",
    no: "02",
    titleKey: "stage.portal",
    nodes: ["request-intake", "validation", "request-tracker"],
  },
  {
    id: "service",
    no: "03",
    titleKey: "stage.service",
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
    titleKey: "stage.platform",
    nodes: ["erp-system", "data-platform", "analytics"],
  },
] as const;

/**
 * Every node carries a one-line role, so selecting any box says something.
 * Nodes with a `componentId` additionally open the full what/when/how card.
 */
export const NODES: Record<NodeId, FlowNode> = {
  "new-request": {
    id: "new-request",
    label: "New Request",
    stage: "client",
    roleKey: "node.new-request.role",
  },
  email: {
    id: "email",
    label: "Email",
    stage: "client",
    roleKey: "node.email.role",
  },
  "api-integration": {
    id: "api-integration",
    label: "API / Integration",
    stage: "client",
    roleKey: "node.api-integration.role",
  },
  "request-intake": {
    id: "request-intake",
    label: "Request Intake",
    stage: "portal",
    roleKey: "node.request-intake.role",
    componentId: "web-portal",
  },
  validation: {
    id: "validation",
    label: "Validation",
    stage: "portal",
    roleKey: "node.validation.role",
  },
  "request-tracker": {
    id: "request-tracker",
    label: "Request Tracker",
    stage: "portal",
    roleKey: "node.request-tracker.role",
  },
  "routing-gateway": {
    id: "routing-gateway",
    label: "Routing Gateway",
    stage: "service",
    roleKey: "node.routing-gateway.role",
    componentId: "routing-gateway",
  },
  "quotation-service": {
    id: "quotation-service",
    label: "Quotation Service",
    stage: "service",
    roleKey: "node.quotation-service.role",
    componentId: "quotation-service",
  },
  "campaign-service": {
    id: "campaign-service",
    label: "Campaign Service",
    stage: "service",
    roleKey: "node.campaign-service.role",
    componentId: "campaign-service",
  },
  "notification-service": {
    id: "notification-service",
    label: "Notification Service",
    stage: "service",
    roleKey: "node.notification-service.role",
  },
  "feature-flags": {
    id: "feature-flags",
    label: "Feature Flag Service",
    stage: "service",
    roleKey: "node.feature-flags.role",
    componentId: "feature-flags",
  },
  "translation-api": {
    id: "translation-api",
    label: "Translation API",
    stage: "service",
    roleKey: "node.translation-api.role",
    componentId: "translation-api",
  },
  "erp-system": {
    id: "erp-system",
    label: "ERP System",
    stage: "platform",
    roleKey: "node.erp-system.role",
  },
  "data-platform": {
    id: "data-platform",
    label: "Data Platform",
    stage: "platform",
    roleKey: "node.data-platform.role",
    componentId: "data-platform",
  },
  analytics: {
    id: "analytics",
    label: "Analytics & Reporting",
    stage: "platform",
    roleKey: "node.analytics.role",
  },
};

/** Every edge in the graph. Used only for the hover ego-layer now. */
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
 * The spine: always drawn, so the macro direction never disappears when a
 * route is selected. These four are each column's first row, so it reads as a
 * clean rail straight across the diagram.
 */
export const SPINE: readonly NodeId[] = [
  "new-request",
  "request-intake",
  "routing-gateway",
  "erp-system",
] as const;

export const SPINE_EDGES: readonly FlowEdge[] = [
  { from: "new-request", to: "request-intake" },
  { from: "request-intake", to: "routing-gateway" },
  { from: "routing-gateway", to: "erp-system" },
] as const;

/**
 * Precomputed routes, one per node. No runtime graph traversal, so there is no
 * pathfinding to get wrong.
 *
 * Every route starts in the client stage: hop 01 is always "a request
 * arrives". That is what makes the diagram teachable rather than a topology.
 */
export const ROUTE_BY_NODE: RouteMap = {
  "new-request": SPINE,
  "request-intake": SPINE,
  "routing-gateway": SPINE,
  "erp-system": SPINE,
  email: ["email", "request-intake", "routing-gateway", "erp-system"],
  "api-integration": [
    "api-integration",
    "request-intake",
    "routing-gateway",
    "erp-system",
  ],
  validation: [
    "new-request",
    "request-intake",
    "validation",
    "request-tracker",
  ],
  "request-tracker": [
    "new-request",
    "request-intake",
    "validation",
    "request-tracker",
  ],
  "quotation-service": [
    "new-request",
    "request-intake",
    "routing-gateway",
    "quotation-service",
    "erp-system",
  ],
  "campaign-service": [
    "new-request",
    "request-intake",
    "routing-gateway",
    "campaign-service",
    "data-platform",
  ],
  "notification-service": [
    "new-request",
    "request-intake",
    "routing-gateway",
    "quotation-service",
    "notification-service",
  ],
  "feature-flags": [
    "new-request",
    "request-intake",
    "routing-gateway",
    "feature-flags",
  ],
  "translation-api": [
    "new-request",
    "request-intake",
    "routing-gateway",
    "translation-api",
  ],
  "data-platform": [
    "new-request",
    "request-intake",
    "routing-gateway",
    "erp-system",
    "data-platform",
  ],
  analytics: [
    "new-request",
    "request-intake",
    "routing-gateway",
    "erp-system",
    "data-platform",
    "analytics",
  ],
};

/** Direct in and out edges, precomputed. Used for the hover ego-layer. */
export const NEIGHBOUR_EDGES: Record<NodeId, FlowEdge[]> = (() => {
  const map = {} as Record<NodeId, FlowEdge[]>;
  for (const id of Object.keys(NODES) as NodeId[]) {
    map[id] = EDGES.filter((e) => e.from === id || e.to === id);
  }
  return map;
})();

export const ALL_NODE_IDS = STAGES.flatMap((s) => s.nodes);

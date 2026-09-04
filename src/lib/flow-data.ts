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

/**
 * Every node carries a one-line role, so selecting any box says something.
 * Nodes with a `componentId` additionally open the full what/when/how card.
 */
export const NODES: Record<NodeId, FlowNode> = {
  "new-request": {
    id: "new-request",
    label: "New Request",
    stage: "client",
    role: "A customer starts a rate request in the portal. The default entry point, and the one every other channel converges on.",
  },
  email: {
    id: "email",
    label: "Email",
    stage: "client",
    role: "A request arrives as free text and is parsed into the same intake payload, so nothing downstream ever learns which channel it came from.",
  },
  "api-integration": {
    id: "api-integration",
    label: "API / Integration",
    stage: "client",
    role: "A partner system posts straight to the API. Same contract, same validation, no human keying.",
  },
  "request-intake": {
    id: "request-intake",
    label: "Request Intake",
    stage: "portal",
    role: "Captures and normalises the request, whatever channel it arrived on, and hands one shape to the service layer.",
    componentId: "web-portal",
  },
  validation: {
    id: "validation",
    label: "Validation",
    stage: "portal",
    role: "Schema, lane and eligibility checks run before anything is priced. A request that fails here never reaches the service layer.",
  },
  "request-tracker": {
    id: "request-tracker",
    label: "Request Tracker",
    stage: "portal",
    role: "The customer-facing status view. It reads request state; it never mutates it.",
  },
  "routing-gateway": {
    id: "routing-gateway",
    label: "Routing Gateway",
    stage: "service",
    role: "The single front door. Everything the platform serves passes through here and is routed, rate-limited and traced.",
    componentId: "routing-gateway",
  },
  "quotation-service": {
    id: "quotation-service",
    label: "Quotation Service",
    stage: "service",
    role: "Prices a lane and reserves the resulting rate. The Core Quotation Module.",
    componentId: "quotation-service",
  },
  "campaign-service": {
    id: "campaign-service",
    label: "Campaign Service",
    stage: "service",
    role: "Segments customers and targets offers. The Campaign Cohort Hub.",
    componentId: "campaign-service",
  },
  "notification-service": {
    id: "notification-service",
    label: "Notification Service",
    stage: "service",
    role: "Fans the outcome out asynchronously, so a slow mail provider can never delay a quote response.",
  },
  "feature-flags": {
    id: "feature-flags",
    label: "Feature Flag Service",
    stage: "service",
    role: "Decides which behaviour a given customer sees, so deploying and releasing stop being the same event.",
    componentId: "feature-flags",
  },
  "translation-api": {
    id: "translation-api",
    label: "Translation API",
    stage: "service",
    role: "Supplies localised copy from outside the build, so wording can be corrected without a release.",
    componentId: "translation-api",
  },
  "erp-system": {
    id: "erp-system",
    label: "ERP System",
    stage: "platform",
    role: "The Legacy ERP Engine. System of record for rates, bookings and reservations: everything transactional is ultimately true here or not true at all.",
  },
  "data-platform": {
    id: "data-platform",
    label: "Data Platform",
    stage: "platform",
    role: "The analytics store, fed from a read replica so reporting can never contend with booking writes.",
    componentId: "data-platform",
  },
  analytics: {
    id: "analytics",
    label: "Analytics & Reporting",
    stage: "platform",
    role: "Reporting over the Data Platform replica. Read-only, and deliberately downstream of everything.",
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

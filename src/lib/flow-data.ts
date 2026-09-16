import type {
  FlowEdge,
  FlowNode,
  FlowStage,
  NodeId,
  RouteMap,
} from "@/types/flow";

/**
 * The system map, as the technical lead described it on 2026-09-16.
 *
 * Until then this file held a plausible quotation platform — an intake
 * layer, one gateway, a Quotation and a Campaign service, an ERP, a read
 * replica. Plausible is not the same as true, and the README said so. The
 * lead's answers replaced it with what exists:
 *
 *   CONFIRMED  the services and their grouping (core: ONE Quote Booking for
 *              dry and reefer, OOG for out-of-gauge; value-added: Premium
 *              Service, OSL+, Demurrage & Detention, PUDO; support and sales:
 *              Campaigns, Coupons, Price Alerts, NotifyMe, Request Missing
 *              Route; infrastructure: Translation, Feature Flags);
 *              TWO gateways — a Node.js gateway (REST and gRPC) between the
 *              client interfaces and the services, and Google Apigee between
 *              ONE QUOTE and the enterprise systems (schedule management,
 *              vessel space allocation, rate engines, OPUS booking intake);
 *              reporting fully isolated from the transactional store — logs,
 *              Google Analytics and HEAP synchronised into BigQuery through
 *              Pub/Sub, cron and scheduled queries.
 *
 *   OURS       which service calls which. The lead named the pieces, not the
 *              wiring, so every edge and route below is this site's reading
 *              of what a quotation needs: a booking asks the rate engine for
 *              its price, a value-added service attaches to a booking, an
 *              alert or a NotifyMe watches the enterprise side. Correct the
 *              edges freely; the node list is not ours to change.
 *
 * Product names are the real ones. The repository identifies the client and
 * is private; a virtual name for a system the reader works on every day
 * would be a puzzle, not a courtesy.
 */

export const STAGES: readonly FlowStage[] = [
  {
    id: "client",
    no: "01",
    titleKey: "stage.client",
    nodes: ["web-app"],
  },
  {
    id: "platform",
    no: "02",
    titleKey: "stage.platform",
    nodes: ["node-gateway", "feature-flags", "translation"],
  },
  {
    id: "service",
    no: "03",
    titleKey: "stage.service",
    nodes: [
      "booking",
      "oog",
      "premium",
      "osl-plus",
      "dnd",
      "pudo",
      "campaigns",
      "coupons",
      "price-alerts",
      "notify-me",
      "missing-route",
    ],
  },
  {
    id: "enterprise",
    no: "04",
    titleKey: "stage.enterprise",
    nodes: ["apigee", "schedule", "space", "rate-engine", "opus-booking", "bigquery"],
  },
] as const;

/**
 * Every node carries a one-line role, so selecting any box says something.
 * Nodes with a `componentId` additionally open the full what/when/how card.
 */
export const NODES: Record<NodeId, FlowNode> = {
  "web-app": {
    id: "web-app",
    label: "ONE QUOTE web",
    stage: "client",
    roleKey: "node.web-app.role",
    componentId: "web-app",
  },
  "node-gateway": {
    id: "node-gateway",
    label: "Node.js API Gateway",
    stage: "platform",
    roleKey: "node.node-gateway.role",
    componentId: "node-gateway",
  },
  "feature-flags": {
    id: "feature-flags",
    label: "Feature Flags",
    stage: "platform",
    roleKey: "node.feature-flags.role",
    componentId: "feature-flags",
  },
  translation: {
    id: "translation",
    label: "Translation",
    stage: "platform",
    roleKey: "node.translation.role",
    componentId: "translation",
  },
  booking: {
    id: "booking",
    label: "ONE Quote Booking",
    stage: "service",
    groupKey: "group.core",
    roleKey: "node.booking.role",
    componentId: "booking",
  },
  oog: {
    id: "oog",
    label: "OOG",
    stage: "service",
    groupKey: "group.core",
    roleKey: "node.oog.role",
    componentId: "oog",
  },
  premium: {
    id: "premium",
    label: "Premium Service",
    stage: "service",
    groupKey: "group.vas",
    roleKey: "node.premium.role",
  },
  "osl-plus": {
    id: "osl-plus",
    label: "OSL+",
    stage: "service",
    groupKey: "group.vas",
    roleKey: "node.osl-plus.role",
  },
  dnd: {
    id: "dnd",
    label: "Demurrage & Detention",
    stage: "service",
    groupKey: "group.vas",
    roleKey: "node.dnd.role",
  },
  pudo: {
    id: "pudo",
    label: "PUDO",
    stage: "service",
    groupKey: "group.vas",
    roleKey: "node.pudo.role",
  },
  campaigns: {
    id: "campaigns",
    label: "Campaigns",
    stage: "service",
    groupKey: "group.sales",
    roleKey: "node.campaigns.role",
    componentId: "campaigns",
  },
  coupons: {
    id: "coupons",
    label: "Coupons",
    stage: "service",
    groupKey: "group.sales",
    roleKey: "node.coupons.role",
  },
  "price-alerts": {
    id: "price-alerts",
    label: "Price Alerts",
    stage: "service",
    groupKey: "group.sales",
    roleKey: "node.price-alerts.role",
  },
  "notify-me": {
    id: "notify-me",
    label: "NotifyMe",
    stage: "service",
    groupKey: "group.sales",
    roleKey: "node.notify-me.role",
  },
  "missing-route": {
    id: "missing-route",
    label: "Request Missing Route",
    stage: "service",
    groupKey: "group.sales",
    roleKey: "node.missing-route.role",
  },
  apigee: {
    id: "apigee",
    label: "Apigee Gateway",
    stage: "enterprise",
    roleKey: "node.apigee.role",
    componentId: "apigee",
  },
  schedule: {
    id: "schedule",
    label: "Schedule Management",
    stage: "enterprise",
    roleKey: "node.schedule.role",
  },
  space: {
    id: "space",
    label: "Vessel Space Allocation",
    stage: "enterprise",
    roleKey: "node.space.role",
  },
  "rate-engine": {
    id: "rate-engine",
    label: "Rate Engine",
    stage: "enterprise",
    roleKey: "node.rate-engine.role",
  },
  "opus-booking": {
    id: "opus-booking",
    label: "OPUS Booking Intake",
    stage: "enterprise",
    roleKey: "node.opus-booking.role",
  },
  bigquery: {
    id: "bigquery",
    label: "BigQuery Warehouse",
    stage: "enterprise",
    roleKey: "node.bigquery.role",
    componentId: "bigquery",
  },
};

/** Every edge in the graph. Used only for the hover ego-layer now. */
export const EDGES: readonly FlowEdge[] = [
  { from: "web-app", to: "node-gateway" },
  // The Node.js gateway fronts every service.
  { from: "node-gateway", to: "booking" },
  { from: "node-gateway", to: "oog" },
  { from: "node-gateway", to: "premium" },
  { from: "node-gateway", to: "osl-plus" },
  { from: "node-gateway", to: "dnd" },
  { from: "node-gateway", to: "pudo" },
  { from: "node-gateway", to: "campaigns" },
  { from: "node-gateway", to: "coupons" },
  { from: "node-gateway", to: "price-alerts" },
  { from: "node-gateway", to: "notify-me" },
  { from: "node-gateway", to: "missing-route" },
  { from: "node-gateway", to: "feature-flags" },
  { from: "node-gateway", to: "translation" },
  // A value-added service attaches to a booking; an offer applies to one.
  { from: "booking", to: "premium" },
  { from: "booking", to: "osl-plus" },
  { from: "booking", to: "dnd" },
  { from: "booking", to: "pudo" },
  { from: "campaigns", to: "booking" },
  { from: "coupons", to: "booking" },
  // Everything that needs the enterprise goes through Apigee.
  { from: "booking", to: "apigee" },
  { from: "oog", to: "apigee" },
  { from: "price-alerts", to: "apigee" },
  { from: "notify-me", to: "apigee" },
  { from: "missing-route", to: "apigee" },
  { from: "apigee", to: "schedule" },
  { from: "apigee", to: "space" },
  { from: "apigee", to: "rate-engine" },
  { from: "apigee", to: "opus-booking" },
  // Analytics is fed from the edges, never from the transactional store.
  { from: "web-app", to: "bigquery" },
  { from: "node-gateway", to: "bigquery" },
] as const;

/**
 * The spine: always drawn, so the macro direction never disappears when a
 * route is selected. These four are each column's first row, so it reads as a
 * clean rail straight across the diagram.
 */
export const SPINE: readonly NodeId[] = [
  "web-app",
  "node-gateway",
  "booking",
  "apigee",
] as const;

export const SPINE_EDGES: readonly FlowEdge[] = [
  { from: "web-app", to: "node-gateway" },
  { from: "node-gateway", to: "booking" },
  { from: "booking", to: "apigee" },
] as const;

/** A quotation, end to end: the spine plus the rate engine that prices it. */
const QUOTE: readonly NodeId[] = [...SPINE, "rate-engine"];

/**
 * Precomputed routes, one per node. No runtime graph traversal, so there is no
 * pathfinding to get wrong.
 *
 * Every route starts in the client stage: hop 01 is always "a request
 * arrives". That is what makes the diagram teachable rather than a topology.
 */
export const ROUTE_BY_NODE: RouteMap = {
  "web-app": QUOTE,
  "node-gateway": QUOTE,
  booking: QUOTE,
  apigee: QUOTE,
  "rate-engine": QUOTE,
  oog: ["web-app", "node-gateway", "oog", "apigee", "rate-engine"],
  premium: ["web-app", "node-gateway", "booking", "premium"],
  "osl-plus": ["web-app", "node-gateway", "booking", "osl-plus"],
  dnd: ["web-app", "node-gateway", "booking", "dnd"],
  pudo: ["web-app", "node-gateway", "booking", "pudo"],
  campaigns: ["web-app", "node-gateway", "campaigns", "booking"],
  coupons: ["web-app", "node-gateway", "coupons", "booking"],
  "price-alerts": ["web-app", "node-gateway", "price-alerts", "apigee", "rate-engine"],
  "notify-me": ["web-app", "node-gateway", "notify-me", "apigee", "space"],
  "missing-route": ["web-app", "node-gateway", "missing-route", "apigee", "schedule"],
  "feature-flags": ["web-app", "node-gateway", "feature-flags"],
  translation: ["web-app", "node-gateway", "translation"],
  schedule: ["web-app", "node-gateway", "booking", "apigee", "schedule"],
  space: ["web-app", "node-gateway", "booking", "apigee", "space"],
  "opus-booking": ["web-app", "node-gateway", "booking", "apigee", "opus-booking"],
  bigquery: ["web-app", "bigquery"],
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

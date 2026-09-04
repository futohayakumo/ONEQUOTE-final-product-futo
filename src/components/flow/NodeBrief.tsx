"use client";

import { NODES, STAGES } from "@/lib/flow-data";
import type { NodeId } from "@/types/flow";
import { SectionTitle } from "../ui/SectionTitle";

/** Shown for nodes without a full deep dive, so no click is ever a dead end. */
export function NodeBrief({
  id,
  onOpenDeepDive,
}: {
  id: NodeId;
  onOpenDeepDive: (nodeId: NodeId) => void;
}) {
  const node = NODES[id];
  const stage = STAGES.find((s) => s.id === node.stage);

  // The nearest node on this stage that does have a deep dive.
  const nearby = (stage?.nodes ?? []).find(
    (n) => n !== id && NODES[n].componentId,
  );

  return (
    <div className="animate-panel-enter flex flex-col gap-4 border border-border bg-studio p-6 rounded-sharp">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <SectionTitle>{node.label}</SectionTitle>
        <span className="type-caption">
          Stage {stage?.no} {stage?.title}
        </span>
      </div>
      <p className="max-w-[80ch] type-body">{node.role}</p>
      {nearby ? (
        <button
          type="button"
          onClick={() => onOpenDeepDive(nearby)}
          className="self-start border border-border px-4 py-2 type-caption rounded-sharp transition-colors duration-150 hover:border-crimson hover:text-crimson"
        >
          Deep dive: {NODES[nearby].label}
        </button>
      ) : null}
    </div>
  );
}

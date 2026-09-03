"use client";

import cn from "clsx";
import type { FlowStage, NodeId } from "@/types/flow";
import { FlowNode } from "./FlowNode";

export function StageColumn({
  stage,
  activeNode,
  pathNodes,
  highlighted,
  register,
}: {
  stage: FlowStage;
  activeNode: NodeId | null;
  pathNodes: Set<NodeId>;
  highlighted: boolean;
  register: (id: NodeId, el: HTMLElement | null) => void;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4 p-5 rounded-sharp transition-colors duration-150",
        highlighted ? "border-2 border-crimson bg-tint" : "border border-border bg-studio",
      )}
    >
      <div className="flex flex-col gap-2">
        <div className="flex flex-col gap-1.5">
          <span className="type-eyebrow">{stage.no}</span>
          <span className="block h-0.5 w-5 bg-crimson" aria-hidden />
        </div>
        <h3 className="type-label tracking-wide">{stage.title}</h3>
      </div>

      <div className="flex flex-col gap-3">
        {stage.nodes.map((id) => (
          <FlowNode
            key={id}
            id={id}
            active={activeNode === id}
            onPath={pathNodes.has(id)}
            register={register}
          />
        ))}
      </div>
    </div>
  );
}

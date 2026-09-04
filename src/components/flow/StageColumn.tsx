"use client";

import type { FlowStage, NodeId } from "@/types/flow";
import { FlowNode } from "./FlowNode";

export function StageColumn({
  stage,
  selected,
  route,
  focusNode,
  register,
  onSelect,
  onPeek,
  onPeekEnd,
}: {
  stage: FlowStage;
  selected: NodeId | null;
  route: readonly NodeId[];
  focusNode: NodeId;
  register: (id: NodeId, el: HTMLElement | null) => void;
  onSelect: (id: NodeId) => void;
  onPeek: (id: NodeId) => void;
  onPeekEnd: () => void;
}) {
  return (
    // No whole-column tint. Per-node highlighting makes it redundant, and a
    // tinted column was by far the largest accent mass on the screen.
    <div className="flex flex-col gap-4 border border-border bg-studio p-5 rounded-sharp">
      <div className="flex flex-col gap-2">
        <div className="flex flex-col gap-1.5">
          <span className="type-eyebrow">{stage.no}</span>
          <span className="block h-0.5 w-5 bg-crimson" aria-hidden />
        </div>
        <h3 className="type-label tracking-wide">{stage.title}</h3>
      </div>

      <ul className="flex flex-col gap-3">
        {stage.nodes.map((id) => {
          const hop = route.indexOf(id);
          return (
            <li key={id}>
              <FlowNode
                id={id}
                selected={selected === id}
                hopIndex={hop === -1 ? null : hop}
                focused={focusNode === id}
                register={register}
                onSelect={onSelect}
                onPeek={onPeek}
                onPeekEnd={onPeekEnd}
              />
            </li>
          );
        })}
      </ul>
    </div>
  );
}

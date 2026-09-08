"use client";

import type { FlowStage, NodeId } from "@/types/flow";
import { FlowNode } from "./FlowNode";

export function StageColumn({
  stage,
  index,
  selected,
  route,
  focusNode,
  register,
  onSelect,
  onPeek,
  onPeekEnd,
}: {
  stage: FlowStage;
  index: number;
  selected: NodeId | null;
  route: readonly NodeId[];
  focusNode: NodeId;
  register: (id: NodeId, el: HTMLElement | null) => void;
  onSelect: (id: NodeId) => void;
  onPeek: (id: NodeId) => void;
  onPeekEnd: () => void;
}) {
  return (
    // No card, no tint. The comps separate the columns with a hairline and let
    // the node cards carry all the surface; a bordered column on top of
    // bordered nodes is two frames doing one frame's job.
    <div
      className={`flex flex-col gap-5 px-5 ${index > 0 ? "lg:border-l lg:border-border" : ""}`}
    >
      <h3 className="type-caption tracking-[0.16em] text-muted uppercase">
        {stage.title}
      </h3>

      <ul className="flex flex-col gap-4">
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

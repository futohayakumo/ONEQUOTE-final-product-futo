"use client";

import { NODES } from "@/lib/flow-data";
import type { FlowStage, NodeId } from "@/types/flow";
import { FlowNode } from "../../../molecules/FlowNode";
import { useT } from "../../../providers/LocaleProvider";

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
  const t = useT();
  return (
    // No card, no tint. The comps separate the columns with a hairline and let
    // the node cards carry all the surface; a bordered column on top of
    // bordered nodes is two frames doing one frame's job.
    <div
      className={`flex flex-col gap-5 px-5 ${
        index % 2 === 1 ? "sm:border-l sm:border-border" : ""
      } ${index > 0 ? "lg:border-l lg:border-border" : ""}`}
    >
      {/* A label for the column, not a section heading. As an h3 between the
          page h1 and the first h2 it inverted the document outline. */}
      <p className="type-overline text-muted">{t(stage.titleKey)}</p>

      <ul className="flex flex-col gap-4">
        {stage.nodes.map((id, i) => {
          const hop = route.indexOf(id);
          // A group heading above the first node of each run — the services
          // column is eleven long, and reads as three short lists this way.
          const group = NODES[id].groupKey;
          const heads = group && (i === 0 || NODES[stage.nodes[i - 1]].groupKey !== group);
          return (
            <li key={id} className={heads && i > 0 ? "mt-3" : undefined}>
              {heads ? <p className="mb-3 type-caption">{t(group)}</p> : null}
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

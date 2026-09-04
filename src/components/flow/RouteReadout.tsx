"use client";

import { NODES } from "@/lib/flow-data";
import type { NodeId } from "@/types/flow";
import { ArrowRight } from "../icons/ArrowRight";

/**
 * The numbered hop list. This is the text equivalent of the diagram — the SVG
 * stays aria-hidden, so this readout is what a screen reader actually gets.
 *
 * It is also the primary flow story below 1024px, where the connectors are not
 * drawn at all. It wraps; it never scrolls horizontally.
 */
export function RouteReadout({
  route,
  selected,
  onSelect,
}: {
  route: readonly NodeId[];
  selected: NodeId | null;
  onSelect: (id: NodeId) => void;
}) {
  const title = selected ? NODES[selected].label : "Default path";

  return (
    <div className="flex flex-col gap-3 border border-border bg-studio p-5 rounded-sharp">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <span className="type-eyebrow">Request route &mdash; {title}</span>
        <span className="type-caption tnum">{route.length} hops</span>
      </div>

      <ol className="flex flex-col gap-2 lg:flex-row lg:flex-wrap lg:items-center">
        {route.map((id, i) => (
          <li key={id} className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onSelect(id)}
              className="flex items-center gap-2 border border-transparent px-1 py-0.5 type-caption text-charcoal rounded-sharp transition-colors duration-150 hover:text-crimson"
            >
              <span
                aria-hidden
                className="flex h-5 w-5 shrink-0 items-center justify-center bg-crimson type-console text-studio tnum"
                /* A hop number is a mark, not a container. */
                style={{ borderRadius: 9999 }}
              >
                {i + 1}
              </span>
              {NODES[id].label}
            </button>
            {i < route.length - 1 ? (
              <ArrowRight
                size={14}
                className="hidden shrink-0 text-muted lg:block"
                aria-hidden
              />
            ) : null}
          </li>
        ))}
      </ol>
    </div>
  );
}

"use client";

import { COMPONENT_CATALOG, COMPONENT_ORDER } from "@/lib/component-catalog";
import { NODES } from "@/lib/flow-data";
import type { NodeId } from "@/types/flow";

/**
 * A secondary index, replacing the horizontally-scrolling picker bar that
 * people could not find and did not expect to need. Nodes are now clickable in
 * the map itself; this is a backup, and it wraps rather than scrolls.
 */
export function DeepDiveIndex({
  onSelect,
}: {
  onSelect: (nodeId: NodeId) => void;
}) {
  const entries = COMPONENT_ORDER.map((id) => COMPONENT_CATALOG[id]).filter(
    (e) => NODES[e.nodeId],
  );

  return (
    <div className="flex flex-col gap-2 border border-border bg-studio p-4 rounded-sharp">
      <span className="type-eyebrow">
        {entries.length} components have a deep dive
      </span>
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
        {entries.map((entry, i) => (
          <span key={entry.id} className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onSelect(entry.nodeId)}
              className="type-caption text-charcoal transition-colors duration-150 hover:text-crimson"
            >
              {/* The node label, not the component label: this is what the
                  click selects, and one catalogue entry is anchored to a node
                  with a different name. */}
              {NODES[entry.nodeId].label}
            </button>
            {i < entries.length - 1 ? (
              <span aria-hidden className="type-caption">
                &middot;
              </span>
            ) : null}
          </span>
        ))}
      </div>
    </div>
  );
}

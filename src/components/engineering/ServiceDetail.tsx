"use client";

import { COMPONENT_CATALOG } from "@/lib/component-catalog";
import { NODES, STAGES } from "@/lib/flow-data";
import type { Trace } from "@/lib/trace";
import type { NodeId } from "@/types/flow";
import { CodeBlock } from "../ui/CodeBlock";
import { RequestLog } from "./RequestLog";
import { useT } from "../shell/LocaleProvider";

function stageKey(stage: string) {
  return STAGES.find((s) => s.id === stage)?.titleKey ?? stage;
}

/**
 * The comps split this into four tabs — request log, metrics, dependencies,
 * infrastructure. Three of those would be invented numbers about a system that
 * does not run, so the panel shows what there is evidence for: the service's
 * own description, its place in the graph, the configuration that makes it
 * work, and the log for the route currently drawn above.
 */
export function ServiceDetail({
  selected,
  route,
  trace,
}: {
  selected: NodeId | null;
  route: readonly NodeId[];
  trace: Trace;
}) {
  const t = useT();
  const node = selected ? NODES[selected] : null;
  const entry = node?.componentId
    ? COMPONENT_CATALOG[node.componentId]
    : null;

  return (
    <section className="grid min-w-0 gap-10 lg:grid-cols-[minmax(0,22rem)_minmax(0,1fr)]">
      <div className="flex min-w-0 flex-col gap-5">
        <p className="type-overline text-muted">
          Service details
        </p>

        {node ? (
          <>
            <h2 className="type-section">{node.label}</h2>
            <p className="type-body text-muted">{entry ? t(entry.whatKey) : t(node.roleKey)}</p>

            <dl className="mt-2 flex flex-col">
              {[
                ["Layer", t(stageKey(node.stage))],
                ["Deep dive", entry ? "Yes" : "Not documented"],
                ["Hops on route", String(route.length)],
              ].map(([term, value]) => (
                <div
                  key={term}
                  className="flex items-baseline justify-between gap-4 border-b border-border py-3"
                >
                  <dt className="type-caption">{term}</dt>
                  <dd className="type-label">{value}</dd>
                </div>
              ))}
            </dl>
          </>
        ) : (
          <>
            <h2 className="type-section">The default route</h2>
            <p className="type-body text-muted">
              The crimson line is the path a quotation request takes when
              nothing is selected. Pick any box — in the map or in the rail —
              to re-route it and read what that service does, when it earns its
              place, and how it is configured.
            </p>
          </>
        )}
      </div>

      <div className="flex min-w-0 flex-col gap-8">
        <RequestLog trace={trace} />
        {entry ? (
          <div className="flex min-w-0 flex-col gap-3">
            <h3 className="type-label">When it earns its place</h3>
            <p className="type-caption text-charcoal">{t(entry.whenKey)}</p>
            <div className="mt-2">
              <CodeBlock lang={entry.how.lang} code={entry.how.code} />
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}

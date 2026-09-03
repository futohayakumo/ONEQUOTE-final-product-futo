import { COMPONENT_CATALOG } from "@/lib/component-catalog";
import type { ComponentId } from "@/types/flow";
import { CodeBlock } from "../ui/CodeBlock";
import { SectionTitle } from "../ui/SectionTitle";

/**
 * Rendered as a static panel below the stage grid rather than a floating
 * popover. WHAT/WHEN/HOW plus a ~14-line snippet is far too tall for a
 * popover, and a popover would fight viewport edges and the picker bar.
 */
export function ComponentDetailCard({ id }: { id: ComponentId }) {
  const entry = COMPONENT_CATALOG[id];

  return (
    <div className="animate-panel-enter flex flex-col gap-6 border border-border bg-studio p-6 rounded-sharp">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <SectionTitle>{entry.label}</SectionTitle>
        <span className="type-caption">Stage {stageLabel(entry.stage)}</span>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1.15fr)]">
        <section className="flex flex-col gap-2 border-t-2 border-charcoal pt-4">
          <h4 className="type-label">What is this?</h4>
          <p className="type-caption text-charcoal">{entry.what}</p>
        </section>

        <section className="flex flex-col gap-2 border-t-2 border-charcoal pt-4">
          <h4 className="type-label">When is it used?</h4>
          <p className="type-caption text-charcoal">{entry.when}</p>
        </section>

        <section className="flex flex-col gap-2 border-t-2 border-crimson pt-4">
          <h4 className="type-label">How does it operate?</h4>
          <CodeBlock lang={entry.how.lang} code={entry.how.code} />
        </section>
      </div>
    </div>
  );
}

function stageLabel(stage: string) {
  return stage === "client"
    ? "01 Client Request"
    : stage === "portal"
      ? "02 Web Portal"
      : stage === "service"
        ? "03 Service Layer"
        : "04 ERP / Data Platform";
}

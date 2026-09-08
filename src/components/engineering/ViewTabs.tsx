"use client";


/**
 * The comps show two views. Only the system map is built, and the second is
 * labelled rather than faked — the same way the comps themselves mark the
 * multimodal tab on the business screen. A tab that looks live and does
 * nothing is worse than one that says it is not ready.
 */
export function ViewTabs() {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4 border-b border-border">
      <div role="tablist" aria-label="Diagram view" className="flex gap-7">
        <button
          type="button"
          role="tab"
          aria-selected
          className="relative pb-3 type-label text-crimson-ink"
        >
          System map
          <span
            aria-hidden
            className="absolute inset-x-0 bottom-0 h-0.5 bg-crimson"
          />
        </button>
        <span className="pb-3 type-label text-muted">
          C4 view{" "}
          <span className="type-caption">(not built)</span>
        </span>
      </div>
    </div>
  );
}

export function FlowLegend() {
  return (
    <div className="flex flex-col gap-3 border border-border bg-studio p-4 rounded-sharp">
      <span className="type-eyebrow">Flow legend</span>
      <div className="flex flex-col gap-2.5">
        <span className="flex items-center gap-3 type-caption">
          <svg width="34" height="2" aria-hidden>
            <path d="M0 1h34" stroke="#E1127A" strokeWidth={2} />
          </svg>
          Selected path
        </span>
        <span className="flex items-center gap-3 type-caption">
          <svg width="34" height="2" aria-hidden>
            <path d="M0 1h34" stroke="#CBD5E1" strokeWidth={1} strokeDasharray="4 4" />
          </svg>
          Alternative path
        </span>
      </div>
    </div>
  );
}

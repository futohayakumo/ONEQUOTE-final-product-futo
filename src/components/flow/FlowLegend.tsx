export function FlowLegend() {
  return (
    <div className="flex flex-col gap-3 border border-border bg-studio p-4 rounded-sharp">
      <span className="type-eyebrow">Flow legend</span>
      <div className="flex flex-col gap-2.5">
        <span className="flex items-center gap-3 type-caption">
          <svg width="34" height="6" aria-hidden>
            <path d="M0 3h26" stroke="#E1127A" strokeWidth={2} />
            <path d="M34 3 L26 0.5 L26 5.5 Z" fill="#E1127A" />
          </svg>
          Request route
        </span>
        <span className="flex items-center gap-3 type-caption">
          <svg width="34" height="6" aria-hidden>
            <path d="M0 3h26" stroke="#CBD5E1" strokeWidth={1} />
            <path d="M34 3 L26 0.5 L26 5.5 Z" fill="#CBD5E1" />
          </svg>
          Default path
        </span>
        <span className="flex items-center gap-3 type-caption">
          <svg width="34" height="6" aria-hidden>
            <path
              d="M0 3h34"
              stroke="#CBD5E1"
              strokeWidth={1}
              strokeDasharray="4 4"
            />
          </svg>
          Direct connections, while a node is focused
        </span>
      </div>
    </div>
  );
}

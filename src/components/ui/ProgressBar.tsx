/**
 * 4px tall, squared ends. A 4px radius on a 4px-tall bar renders as a pill,
 * which reads soft — so this is the one place `rounded-none` is correct.
 */
export function ProgressBar({
  value,
  max,
  label,
}: {
  value: number;
  max: number;
  label: string;
}) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  return (
    <div
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-label={label}
      className="h-1 w-full border border-border bg-canvas"
      style={{ borderRadius: 0 }}
    >
      <div
        className="h-full bg-crimson transition-[width] duration-300 ease-out"
        style={{ width: `${pct}%`, borderRadius: 0 }}
      />
    </div>
  );
}

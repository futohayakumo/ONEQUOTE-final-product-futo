export function usd(n: number): string {
  return n.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function pct(rate: number): string {
  return `${(rate * 100).toFixed(2)}%`;
}

/** ISO-8601 with milliseconds — the shape the simulated gateway logs. */
export function isoMs(epochMs: number): string {
  return new Date(epochMs).toISOString();
}

export function offsetMs(n: number): string {
  return `+${String(n).padStart(3, "0")}ms`;
}

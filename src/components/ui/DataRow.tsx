import cn from "clsx";
import type { ReactNode } from "react";

export function DataRow({
  label,
  value,
  emphasis,
  negative,
  className,
}: {
  label: ReactNode;
  value: ReactNode;
  emphasis?: boolean;
  negative?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex items-baseline justify-between gap-6 border-b border-border py-2.5 last:border-b-0",
        className,
      )}
    >
      <span className={emphasis ? "type-label" : "type-caption"}>{label}</span>
      <span
        className={cn(
          "tnum whitespace-nowrap",
          emphasis ? "type-label" : "type-body",
          negative && "text-crimson",
        )}
      >
        {value}
      </span>
    </div>
  );
}

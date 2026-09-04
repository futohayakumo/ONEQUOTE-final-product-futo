import cn from "clsx";
import type { ReactNode } from "react";

/**
 * The numbered step callout. The 20px numeral badge is a MARK, not a
 * container/button/card, so the circular radius here sits outside the
 * 4px geometry rule by design.
 */
export function StepCallout({
  step,
  title,
  children,
  className,
}: {
  step: number;
  title: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex gap-4 border border-border bg-studio p-5 rounded-sharp",
        className,
      )}
    >
      <span
        aria-hidden
        className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center bg-crimson type-console tnum text-studio"
        /* A numeral badge is a mark, not a container, so it sits outside the
           4px rule. The type still comes from the scale. */
        style={{ borderRadius: 9999 }}
      >
        {step}
      </span>
      <div className="flex flex-col gap-1.5">
        <p className="type-label text-crimson">{title}</p>
        <p className="type-caption">{children}</p>
      </div>
    </div>
  );
}

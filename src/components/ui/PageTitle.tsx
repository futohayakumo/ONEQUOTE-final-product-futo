import cn from "clsx";
import type { ReactNode } from "react";

/**
 * `display` is the 6th, explicitly-sanctioned scale entry (56px). It is used
 * only on the hero H1 and the three persona titles.
 */
export function PageTitle({
  children,
  display = false,
  className,
}: {
  children: ReactNode;
  display?: boolean;
  className?: string;
}) {
  return (
    <h1
      className={cn(
        display ? "type-display" : "type-page",
        "text-balance",
        className,
      )}
    >
      {children}
    </h1>
  );
}

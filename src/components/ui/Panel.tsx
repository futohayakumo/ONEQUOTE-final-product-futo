import cn from "clsx";
import type { HTMLAttributes, ReactNode } from "react";

interface Props extends HTMLAttributes<HTMLDivElement> {
  /** Active panels take the 2px crimson border + tint background. */
  active?: boolean;
  flush?: boolean;
  children: ReactNode;
}

export function Panel({ active, flush, className, children, ...rest }: Props) {
  return (
    <div
      {...rest}
      className={cn(
        "rounded-sharp",
        flush ? "" : "p-6",
        active
          ? "bg-tint border-2 border-crimson"
          : "bg-studio border border-border",
        className,
      )}
    >
      {children}
    </div>
  );
}

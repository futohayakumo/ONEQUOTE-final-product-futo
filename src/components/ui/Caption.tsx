import cn from "clsx";
import type { ReactNode } from "react";

export function Caption({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <p className={cn("type-caption", className)}>{children}</p>;
}

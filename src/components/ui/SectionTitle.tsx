import cn from "clsx";
import type { ReactNode } from "react";

export function SectionTitle({
  children,
  as: Tag = "h2",
  className,
}: {
  children: ReactNode;
  as?: "h2" | "h3";
  className?: string;
}) {
  return <Tag className={cn("type-section", className)}>{children}</Tag>;
}

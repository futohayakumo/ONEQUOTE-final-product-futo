import cn from "clsx";

/** Uppercase crimson label above a page title, with the 24x2px crimson rule. */
export function Eyebrow({
  children,
  className,
}: {
  children: string;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-3", className)}>
      <span className="type-eyebrow">{children}</span>
      <span className="block h-0.5 w-6 bg-crimson" aria-hidden />
    </div>
  );
}

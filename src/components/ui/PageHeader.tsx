import cn from "clsx";

/**
 * The masthead every inner screen opens with: eyebrow, one big line, one
 * sentence of what the screen is for, and an optional note pinned right.
 */
export function PageHeader({
  eyebrow,
  title,
  lede,
  note,
  className,
}: {
  eyebrow: string;
  title: React.ReactNode;
  lede: string;
  note?: React.ReactNode;
  className?: string;
}) {
  return (
    <header
      className={cn("flex flex-col gap-8 lg:flex-row lg:items-start", className)}
    >
      <div className="min-w-0 flex-1">
        <p className="type-eyebrow">{eyebrow}</p>
        <h1 className="mt-5 max-w-[22ch] type-page">{title}</h1>
        <p className="mt-4 max-w-[70ch] type-body text-muted">{lede}</p>
      </div>
      {note ? (
        <div className="shrink-0 border-l border-border pl-8 lg:max-w-[16rem]">
          <p className="type-caption tracking-[0.16em] text-charcoal uppercase">
            {note}
          </p>
          <span aria-hidden className="mt-4 block h-0.5 w-10 bg-crimson" />
        </div>
      ) : null}
    </header>
  );
}

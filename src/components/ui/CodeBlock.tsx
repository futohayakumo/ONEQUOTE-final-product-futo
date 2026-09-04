import cn from "clsx";

/**
 * Dark Slate code surface. Body text is Neutral Border (11.4:1 on #0F172A).
 * Terminal Green never appears here — it is reserved for the live console's
 * single success line.
 */
export function CodeBlock({
  code,
  lang,
  className,
}: {
  code: string;
  lang?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "overflow-hidden border border-charcoal rounded-sharp",
        className,
      )}
    >
      {lang ? (
        <div className="flex items-center justify-between gap-4 border-b border-muted bg-console px-4 py-2">
          <span className="type-console text-muted">{lang}</span>
          {/* Say that it scrolls. Cut-off code with no affordance reads as
              broken rather than as scrollable, especially on touch. */}
          <span className="type-console text-muted lg:hidden">
            scrolls &rarr;
          </span>
        </div>
      ) : null}
      <pre className="overflow-x-auto bg-console px-4 py-3">
        <code className="type-console text-border">{code}</code>
      </pre>
    </div>
  );
}

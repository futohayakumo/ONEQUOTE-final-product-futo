import cn from "clsx";
import { BRAND } from "@/lib/brand";

/**
 * The lockup: a crimson slash, then the name.
 *
 * The slash is drawn rather than imported. `public/assets/icons/25-brand-slash`
 * exists and is clean, but an <img> here would mean a network round trip for
 * 14 pixels of geometry that appears in the header and footer of every page,
 * and it could not inherit currentColor when the mark sits on a dark band.
 */
export function Wordmark({
  size = "md",
  tone = "ink",
  className,
}: {
  size?: "sm" | "md";
  tone?: "ink" | "inverse";
  className?: string;
}) {
  const box = size === "sm" ? 16 : 20;
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <svg
        width={box}
        height={box}
        viewBox="0 0 20 20"
        aria-hidden
        className="shrink-0"
      >
        <line
          x1="3.5"
          y1="16.5"
          x2="16.5"
          y2="3.5"
          stroke="var(--color-crimson)"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
      </svg>
      <span
        className={cn(
          size === "sm" ? "type-wordmark-sm" : "type-wordmark",
          tone === "inverse" ? "text-studio" : "text-charcoal",
        )}
      >
        {BRAND.mark}
      </span>
    </span>
  );
}

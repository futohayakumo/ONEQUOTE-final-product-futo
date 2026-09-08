import cn from "clsx";

/**
 * A stand-in for an asset that does not exist yet.
 *
 * Six of the photographs the comps call for carry the client's real wordmark
 * burnt into their pixels, so they cannot be committed; two more do not exist
 * at all. Rather than block the build on a generation round trip, every image
 * slot is laid out at its real aspect ratio with one of these in it.
 *
 * It is deliberately not pretty. A placeholder that looks finished is a
 * placeholder that ships. It states what belongs there and at what size, so
 * the slot can be filled without re-deriving either.
 */
export function Plate({
  label,
  spec,
  ratio,
  tone = "light",
  className,
}: {
  /** What image goes here. */
  label: string;
  /** The size it needs to be generated at, e.g. "2400×900". */
  spec?: string;
  /** CSS aspect-ratio, e.g. "16 / 9". Omit when the parent sets the height. */
  ratio?: string;
  tone?: "light" | "dark";
  className?: string;
}) {
  return (
    <div
      style={ratio ? { aspectRatio: ratio } : undefined}
      className={cn(
        "flex flex-col items-center justify-center gap-1 border px-4 text-center",
        tone === "dark"
          ? "border-charcoal bg-charcoal"
          : "border-border bg-mist",
        className,
      )}
    >
      <span
        className={cn(
          "type-caption",
          tone === "dark" ? "text-studio" : "text-charcoal",
        )}
      >
        {label}
      </span>
      {spec ? (
        <span
          className={cn("type-caption tnum", tone === "dark" && "text-border")}
        >
          {spec}
        </span>
      ) : null}
    </div>
  );
}

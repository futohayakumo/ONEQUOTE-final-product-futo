import cn from "clsx";
import type { SelectHTMLAttributes } from "react";
import { ChevronDown } from "../icons/ChevronDown";

interface Props extends SelectHTMLAttributes<HTMLSelectElement> {
  invalid?: boolean;
  /** Optional 20px hairline glyph shown at the left of the control. */
  leading?: React.ReactNode;
}

/**
 * A native <select> — already accessible, keyboard-correct and mobile-correct.
 * Adding Radix here would be negative value. We only replace the OS chevron.
 */
export function Select({ className, invalid, leading, ...rest }: Props) {
  return (
    <div className="relative">
      {leading ? (
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-crimson">
          {leading}
        </span>
      ) : null}
      <select
        {...rest}
        aria-invalid={invalid || undefined}
        className={cn(
          "w-full appearance-none bg-studio type-body rounded-sharp",
          "py-3 pr-10",
          leading ? "pl-11" : "pl-3",
          invalid ? "border-2 border-crimson" : "border border-border",
          "transition-colors duration-150 hover:border-crimson",
          className,
        )}
      />
      <ChevronDown
        size={18}
        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted"
      />
    </div>
  );
}

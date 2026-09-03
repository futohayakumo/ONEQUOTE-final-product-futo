import cn from "clsx";
import type { InputHTMLAttributes, ReactNode } from "react";

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  unit: string;
  invalid?: boolean;
  leading?: ReactNode;
}

export function NumberField({
  className,
  unit,
  invalid,
  leading,
  ...rest
}: Props) {
  return (
    <div
      className={cn(
        "flex items-stretch bg-studio rounded-sharp transition-colors duration-150",
        invalid ? "border-2 border-crimson" : "border border-border",
        "hover:border-crimson",
      )}
    >
      {leading ? (
        <span className="flex items-center pl-3 text-crimson">{leading}</span>
      ) : null}
      <input
        {...rest}
        type="number"
        inputMode="decimal"
        aria-invalid={invalid || undefined}
        className={cn(
          "min-w-0 flex-1 bg-transparent px-3 py-3 type-body tnum outline-none",
          className,
        )}
        style={{ borderRadius: 0 }}
      />
      <span className="flex items-center border-l border-border px-3 type-caption">
        {unit}
      </span>
    </div>
  );
}

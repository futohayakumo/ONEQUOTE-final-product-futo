import cn from "clsx";
import type { ReactNode } from "react";

/** Label + control + optional help/error caption. */
export function Field({
  label,
  htmlFor,
  help,
  error,
  className,
  children,
}: {
  label: string;
  htmlFor: string;
  help?: string;
  error?: string;
  className?: string;
  children: ReactNode;
}) {
  const describedBy = error
    ? `${htmlFor}-error`
    : help
      ? `${htmlFor}-help`
      : undefined;

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <label htmlFor={htmlFor} className="type-label">
        {label}
      </label>
      {children}
      {error ? (
        <p id={describedBy} className="type-caption text-crimson" role="alert">
          {error}
        </p>
      ) : help ? (
        <p id={describedBy} className="type-caption">
          {help}
        </p>
      ) : null}
    </div>
  );
}

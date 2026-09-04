import cn from "clsx";
import type { ReactNode } from "react";
import { BackBar } from "./BackBar";

/** Shared chrome for the four inner screens: back link, container, blueprint mark. */
export function ScreenShell({
  backHref,
  backLabel,
  children,
  className,
}: {
  backHref: string;
  backLabel?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <main className="min-h-svh px-6 py-8 md:px-12 md:py-10">
      <div className={cn("mx-auto w-full max-w-[1400px]", className)}>
        <BackBar href={backHref} label={backLabel} />
        <div className="mt-8">{children}</div>
      </div>
    </main>
  );
}

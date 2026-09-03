import cn from "clsx";
import type { ReactNode } from "react";
import { BackBar } from "./BackBar";
import { BlueprintMark } from "../icons/BlueprintMark";

/** Shared chrome for the four inner screens: back link, container, blueprint mark. */
export function ScreenShell({
  backHref,
  backLabel,
  children,
  className,
  mark = true,
}: {
  backHref: string;
  backLabel?: string;
  children: ReactNode;
  className?: string;
  mark?: boolean;
}) {
  return (
    <main className="relative min-h-svh overflow-hidden px-6 py-8 md:px-12 md:py-10">
      {mark ? (
        <BlueprintMark className="pointer-events-none absolute right-[-7rem] top-[-7rem] hidden h-[24rem] w-[24rem] opacity-40 xl:block" />
      ) : null}
      <div className={cn("relative mx-auto w-full max-w-[1400px]", className)}>
        <BackBar href={backHref} label={backLabel} />
        <div className="mt-8">{children}</div>
      </div>
    </main>
  );
}

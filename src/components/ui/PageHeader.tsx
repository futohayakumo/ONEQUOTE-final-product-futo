"use client";

import cn from "clsx";
import { useT } from "../shell/LocaleProvider";
import { Lines } from "./Lines";

/**
 * The masthead every inner screen opens with: eyebrow, one big line, one
 * sentence of what the screen is for, and an optional note pinned right.
 */
export function PageHeader({
  eyebrowKey,
  titleKey,
  ledeKey,
  noteKey,
  className,
}: {
  eyebrowKey: string;
  titleKey: string;
  ledeKey: string;
  noteKey?: string;
  className?: string;
}) {
  const t = useT();
  return (
    <header
      className={cn("flex flex-col gap-8 lg:flex-row lg:items-start", className)}
    >
      <div className="min-w-0 flex-1">
        <p className="type-eyebrow">{t(eyebrowKey)}</p>
        <h1 className="mt-5 max-w-[34ch] type-page">
          <Lines text={t(titleKey)} />
        </h1>
        <p className="mt-4 max-w-[62ch] type-body text-muted">{t(ledeKey)}</p>
      </div>
      {noteKey ? (
        <div className="shrink-0 border-l border-border pl-8 lg:max-w-[16rem]">
          <p className="type-overline text-charcoal">
            <Lines text={t(noteKey)} />
          </p>
          <span aria-hidden className="mt-4 block h-0.5 w-10 bg-crimson" />
        </div>
      ) : null}
    </header>
  );
}

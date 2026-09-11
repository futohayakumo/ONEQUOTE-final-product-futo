"use client";

import { useEffect, useRef } from "react";
import { useT } from "../providers/LocaleProvider";

/**
 * A native <dialog>, opened with showModal().
 *
 * The platform already implements the hard parts: the focus trap, ESC, the
 * inert backdrop, and returning focus to whatever opened it. A hand-rolled
 * overlay reimplements all four, usually gets two of them wrong, and the two
 * it gets wrong are the ones a keyboard user needs.
 */
export function Modal({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}) {
  const t = useT();
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (open && !el.open) el.showModal();
    if (!open && el.open) el.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      // `close` fires for ESC and for the backdrop alike, so the parent's state
      // cannot drift out of step with the element's.
      onClose={onClose}
      onClick={(e) => {
        // The backdrop is the dialog itself; a click on a child does not
        // reach here with the dialog as its target.
        if (e.target === ref.current) onClose();
      }}
      aria-label={title}
      className="w-[min(64rem,calc(100vw-2rem))] border border-border bg-studio p-0 rounded-card shadow-raised backdrop:bg-charcoal/50"
    >
      <div className="flex items-start justify-between gap-6 border-b border-border px-6 py-5 sm:px-8">
        <h2 className="type-section">{title}</h2>
        <button
          type="button"
          onClick={onClose}
          className="shrink-0 border border-control px-3 py-1.5 type-caption text-charcoal rounded-card transition-colors duration-150 hover:border-crimson hover:text-crimson"
        >
          {t("ui.close")}
        </button>
      </div>
      <div className="max-h-[70vh] overflow-y-auto px-6 py-6 sm:px-8">
        {children}
      </div>
    </dialog>
  );
}

"use client";

import cn from "clsx";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { ArrowRight } from "../icons/ArrowRight";

export type ButtonVariant = "primary" | "secondary" | "ghost";

/**
 * Variants are an exhaustive lookup, never merged with caller classes — which
 * is why this app needs clsx but not tailwind-merge.
 * Crimson fill is reserved for `primary`; it is the largest single draw on the
 * accent budget, so a screen should carry at most one.
 */
const VARIANT: Record<ButtonVariant, string> = {
  primary:
    "bg-crimson text-studio border border-crimson hover:bg-charcoal hover:border-charcoal disabled:bg-border disabled:border-border disabled:text-muted",
  secondary:
    "bg-studio text-charcoal border border-border hover:border-crimson hover:text-crimson hover:bg-tint disabled:text-muted",
  ghost:
    "bg-transparent text-muted border border-transparent hover:text-crimson disabled:text-border",
};

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  withArrow?: boolean;
  children: ReactNode;
}

export function Button({
  variant = "secondary",
  withArrow = false,
  className,
  children,
  ...rest
}: Props) {
  return (
    <button
      {...rest}
      className={cn(
        "inline-flex items-center justify-center gap-3 px-6 py-3 type-label rounded-sharp",
        "transition-colors duration-150 disabled:cursor-not-allowed",
        VARIANT[variant],
        className,
      )}
    >
      <span>{children}</span>
      {withArrow ? <ArrowRight size={18} /> : null}
    </button>
  );
}

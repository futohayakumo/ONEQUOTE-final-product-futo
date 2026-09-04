import cn from "clsx";
import type Link from "next/link";
import { TransitionLink } from "./TransitionLink";
import type { ComponentProps, ReactNode } from "react";
import { ArrowRight } from "../icons/ArrowRight";

type Variant = "primary" | "secondary" | "quiet";

const VARIANT: Record<Variant, string> = {
  primary:
    "bg-crimson text-studio border border-crimson hover:bg-charcoal hover:border-charcoal",
  secondary:
    "bg-studio text-charcoal border border-border hover:border-crimson hover:text-crimson hover:bg-tint",
  quiet:
    "text-crimson border border-transparent px-0 hover:text-charcoal group/link",
};

interface Props extends Omit<ComponentProps<typeof Link>, "className"> {
  variant?: Variant;
  withArrow?: boolean;
  className?: string;
  children: ReactNode;
}

export function LinkButton({
  variant = "secondary",
  withArrow = true,
  className,
  children,
  ...rest
}: Props) {
  return (
    <TransitionLink
      {...rest}
      className={cn(
        "inline-flex items-center gap-3 type-label rounded-sharp transition-colors duration-150",
        variant === "quiet" ? "py-1" : "px-6 py-3",
        VARIANT[variant],
        className,
      )}
    >
      <span>{children}</span>
      {withArrow ? (
        <ArrowRight
          size={18}
          className="transition-transform duration-150 group-hover/link:translate-x-1"
        />
      ) : null}
    </TransitionLink>
  );
}

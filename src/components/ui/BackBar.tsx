import { ArrowLeft } from "../icons/ArrowLeft";
import { TransitionLink } from "./TransitionLink";

export function BackBar({
  href,
  label = "Back",
}: {
  href: string;
  label?: string;
}) {
  return (
    <TransitionLink
      href={href}
      direction="back"
      className="group/back inline-flex items-center gap-3 type-label text-crimson transition-colors duration-150 hover:text-charcoal"
    >
      <ArrowLeft
        size={18}
        className="transition-transform duration-150 group-hover/back:-translate-x-1"
      />
      <span>{label}</span>
    </TransitionLink>
  );
}

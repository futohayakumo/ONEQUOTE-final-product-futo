import cn from "clsx";
import Link from "next/link";
import type { ReactNode } from "react";
import type { Persona } from "@/lib/personas";
import { ArrowRight } from "../icons/ArrowRight";

export function PersonaPanel({
  persona,
  icon,
}: {
  persona: Persona;
  icon: ReactNode;
}) {
  return (
    <Link
      href={persona.href}
      className={cn(
        "group/panel relative flex min-h-svh flex-1 flex-col justify-center gap-10 px-8 py-16 md:px-12",
        "border-l-2 border-l-transparent border-r border-r-border last:border-r-0",
        "transition-colors duration-150 hover:border-l-crimson",
        persona.surface,
      )}
    >
      <div className="flex flex-col gap-3">
        <span className="type-eyebrow">{persona.no}</span>
        <span className="block h-0.5 w-6 bg-crimson" aria-hidden />
      </div>

      <span className="text-crimson">{icon}</span>

      <h2 className="type-display">{persona.title}</h2>

      <p className="type-caption max-w-[34ch]">{persona.blurb}</p>

      <span className="inline-flex items-center gap-3 type-label text-charcoal">
        Explore {persona.title.charAt(0)}
        {persona.title.slice(1).toLowerCase()} journey
        <ArrowRight
          size={18}
          className="text-crimson transition-transform duration-150 group-hover/panel:translate-x-1"
        />
      </span>
    </Link>
  );
}

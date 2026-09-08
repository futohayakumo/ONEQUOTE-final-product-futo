import Link from "next/link";
import { PERSONAS } from "@/lib/personas";
import { ArrowRight } from "../icons/ArrowRight";
import { Plate } from "../ui/Plate";
import { SectionIntro } from "./SectionIntro";

const ART: Record<string, { label: string; spec: string }> = {
  business: {
    label: "Executive above a container terminal",
    spec: "available — spot/10",
  },
  engineering: {
    label: "Service mesh, lit nodes on dark",
    spec: "available — spot/11",
  },
  process: {
    label: "Yard supervisor among stacks",
    spec: "1024 · no wordmark on the vest",
  },
};

const HEADING: Record<string, string> = {
  business: "The business view",
  engineering: "The systems view",
  process: "The delivery view",
};

/**
 * v2 gave the three perspectives a full screen of their own at /journeys. The
 * comps fold them into the home page as the closing band, which removes a
 * click without removing the choice, so the gateway route is gone and this is
 * what replaces it.
 */
export function PerspectiveCards() {
  return (
    <section className="bg-canvas">
      <div className="mx-auto flex max-w-[86rem] flex-col gap-14 px-6 py-24 lg:flex-row lg:gap-20">
        <SectionIntro
          no="04"
          title={
            <>
              Three perspectives,
              <br />
              one system.
            </>
          }
          subtitle="Choose your perspective"
          body="The same programme, read three ways. Start wherever you are most sceptical."
          href="/business"
          linkLabel="Start with business"
        />

        <ul className="grid flex-1 grid-cols-1 gap-6 sm:grid-cols-3">
          {PERSONAS.map((persona) => (
            <li key={persona.id}>
              <Link
                href={persona.href}
                className="group flex h-full flex-col overflow-hidden border border-border bg-studio rounded-card shadow-card transition-shadow duration-150 hover:shadow-raised"
              >
                <div className="relative">
                  <Plate
                    label={ART[persona.id].label}
                    spec={ART[persona.id].spec}
                    ratio="4 / 3"
                  />
                  <span aria-hidden className="absolute inset-0 scrim-b" />
                  <span className="absolute bottom-4 left-4 type-section text-studio">
                    {persona.title}
                  </span>
                </div>

                <div className="flex flex-1 flex-col gap-2 p-5">
                  <span className="type-label">{HEADING[persona.id]}</span>
                  <p className="type-caption">{persona.blurb}</p>
                  <span
                    aria-hidden
                    className="mt-auto flex h-9 w-9 items-center justify-center self-end border border-crimson text-crimson rounded-full transition-colors duration-150 group-hover:bg-crimson group-hover:text-studio"
                  >
                    <ArrowRight size={16} />
                  </span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

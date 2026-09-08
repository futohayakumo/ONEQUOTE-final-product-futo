import { Plate } from "../ui/Plate";
import { SectionIntro } from "./SectionIntro";

const STATS = [
  { figure: "180+", label: "Countries & regions" },
  { figure: "500+", label: "Ports" },
  { figure: "Endless", label: "Opportunities" },
] as const;

export function NetworkBand() {
  return (
    <section className="relative isolate overflow-hidden border-y border-charcoal bg-charcoal">
      <div className="absolute inset-0 -z-20">
        <Plate
          label="Dark globe with lit trade lanes"
          spec="available — banners/03, needs 2400 wide"
          tone="dark"
          align="corner"
          className="h-full w-full"
        />
      </div>
      <div aria-hidden className="absolute inset-0 -z-10 scrim-l" />

      <div className="mx-auto flex max-w-[86rem] flex-col gap-14 px-6 py-24 lg:flex-row lg:items-center">
        <SectionIntro
          tone="dark"
          no="02"
          title={
            <>
              A connected
              <br />
              global supply chain.
            </>
          }
          subtitle="A more connected world"
          body="Ocean, land, systems and people. The network only works because every part of it agrees on the same facts."
          href="/engineering"
          linkLabel="See the network"
        />

        <dl className="ml-auto flex shrink-0 flex-col gap-8 border-l border-muted pl-10">
          {STATS.map((stat) => (
            <div key={stat.label}>
              <dt className="type-section tnum text-studio">{stat.figure}</dt>
              <dd className="mt-1 type-caption text-border">{stat.label}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}

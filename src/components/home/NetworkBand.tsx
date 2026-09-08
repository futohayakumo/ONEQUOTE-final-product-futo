import { SectionIntro } from "./SectionIntro";

const STATS = [
  { figure: "180+", label: "Countries & regions" },
  { figure: "500+", label: "Ports" },
  { figure: "Endless", label: "Opportunities" },
] as const;

export function NetworkBand() {
  return (
    <section className="relative isolate overflow-hidden border-y border-charcoal bg-charcoal">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/assets/banners/03-banner-global-network.png"
        alt=""
        aria-hidden
        className="absolute inset-0 -z-20 h-full w-full object-cover"
      />
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
              <dt className="type-caption text-border">{stat.label}</dt>
              <dd className="mt-1 type-section tnum text-studio">
                {stat.figure}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}

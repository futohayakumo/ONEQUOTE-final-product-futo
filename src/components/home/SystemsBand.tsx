import { Plate } from "../ui/Plate";
import { SectionIntro } from "./SectionIntro";

export function SystemsBand() {
  return (
    <section className="relative isolate overflow-hidden border-t border-charcoal bg-canvas">
      <div className="absolute inset-0 -z-20">
        <Plate
          label="Operations floor — analyst at a wall of dashboards"
          spec="2400 × 620 · no wordmark on the jacket"
          align="corner"
          className="h-full w-full"
        />
      </div>
      {/* White, not charcoal: the type here is charcoal over a bright office
          floor. A charcoal scrim would need light type, which is not what the
          comps do, and it would make this band a second dark slab directly
          under the globe band. */}
      <div aria-hidden className="absolute inset-0 -z-10 scrim-l-light" />

      <div className="mx-auto grid max-w-[86rem] items-center gap-14 px-6 py-24 lg:grid-cols-[minmax(0,27rem)_minmax(0,1fr)]">
        <SectionIntro
          no="03"
          title={
            <>
              The systems and people
              <br />
              behind it.
            </>
          }
          subtitle="Powered by systems and people"
          body="Services running out of sight, and judgement on the floor. Neither one is sufficient, which is the whole design problem."
          href="/engineering"
          linkLabel="Look inside the system"
        />

        {/* The band was one 432px text block in a 1376px container with no
            second grid child. These are the three things the systems screen
            actually shows, so the empty two-thirds now carries the promise the
            heading makes. */}
        <dl className="grid gap-x-10 gap-y-8 sm:grid-cols-3">
          {[
            ["Four layers", "Client, edge, application, data — one request crosses all of them."],
            ["Fifteen services", "Each with a stated job, and seven with the configuration that makes them work."],
            ["One traced request", "Timed hop by hop, with the log the trace produced."],
          ].map(([term, detail]) => (
            <div key={term} className="border-t border-muted pt-4">
              <dt className="type-label text-charcoal">{term}</dt>
              <dd className="mt-2 type-caption">{detail}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}

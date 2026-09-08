import { Plate } from "../ui/Plate";
import { SectionIntro } from "./SectionIntro";

export function SystemsBand() {
  return (
    <section className="relative isolate overflow-hidden border-t border-charcoal bg-canvas">
      <div className="absolute inset-0 -z-20">
        <Plate
          label="Operations floor — analyst at a wall of dashboards"
          spec="2400 × 620 · no wordmark on the jacket"
          className="h-full w-full"
        />
      </div>
      {/* White, not charcoal: the type here is charcoal over a bright office
          floor. A charcoal scrim would need light type, which is not what the
          comps do, and it would make this band a second dark slab directly
          under the globe band. */}
      <div aria-hidden className="absolute inset-0 -z-10 scrim-l-light" />

      <div className="mx-auto flex max-w-[86rem] items-center px-6 py-24">
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
      </div>
    </section>
  );
}

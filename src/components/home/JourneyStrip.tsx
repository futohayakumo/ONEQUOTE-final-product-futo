import { Plate } from "../ui/Plate";
import { SectionIntro } from "./SectionIntro";

const STEPS = [
  {
    label: "Quote",
    blurb: "Search the lane, the sailing and the rate.",
    plate: "Laptop showing the quotation screen",
    spec: "1024 · no wordmark in the header",
  },
  {
    label: "Booking",
    blurb: "Arrangements, filings and confirmation.",
    plate: "Container on a pallet",
    spec: "available — spot/06",
  },
  {
    label: "Delivery",
    blurb: "Cargo creating value at the other end.",
    plate: "Truck and trailer",
    spec: "1024 · no wordmark on the trailer",
  },
] as const;

export function JourneyStrip() {
  return (
    <section className="bg-studio">
      <div className="mx-auto flex max-w-[86rem] flex-col gap-14 px-6 py-24 lg:flex-row lg:items-center lg:gap-20">
        <SectionIntro
          no="01"
          title={
            <>
              One quotation
              <br />
              sets the world moving.
            </>
          }
          subtitle="A quote starts the journey"
          body="Port to port. A single quotation commits a slot, a rate and a date — and everything downstream is bound by it."
          href="/business"
          linkLabel="See the quotation flow"
          emphasis="accent"
        />

        <ol className="grid flex-1 grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-3">
          {STEPS.map((step, i) => (
            <li key={step.label} className="flex flex-col">
              <div className="relative">
                <Plate
                  label={step.plate}
                  spec={step.spec}
                  ratio="4 / 3"
                  className="rounded-card"
                />
                {/* The connector belongs between the tiles, so it hangs off the
                    right edge of every tile but the last, and disappears when
                    the grid stacks. */}
                {i < STEPS.length - 1 ? (
                  <span
                    aria-hidden
                    className="absolute top-1/2 -right-6 hidden w-6 -translate-y-1/2 items-center justify-center text-muted sm:flex"
                  >
                    <svg width="18" height="8" viewBox="0 0 18 8">
                      <path
                        d="M0 4h15M12 1l3 3-3 3"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1"
                      />
                    </svg>
                  </span>
                ) : null}
              </div>
              <span className="mt-5 type-overline text-charcoal">
                {step.label}
              </span>
              <p className="mt-2 type-caption">{step.blurb}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

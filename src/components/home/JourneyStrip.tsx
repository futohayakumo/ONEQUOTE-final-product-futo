import { SectionIntro } from "./SectionIntro";

const STEPS = [
  { label: "Quote", blurb: "Search the lane, the sailing and the rate." },
  { label: "Booking", blurb: "Arrangements, filings and confirmation." },
  { label: "Delivery", blurb: "Cargo creating value at the other end." },
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

        <div className="flex min-w-0 flex-1 flex-col gap-6">
          {/*
            One picture, not three tiles with connectors drawn between them.
            The three stages and the arrows are in the artwork, so building the
            same relationship a second time in CSS would only give it a chance
            to disagree with the image at some viewport.
          */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/assets/spot/quote-to-delivery.png"
            alt="A quotation screen, then a container, then a truck leaving the terminal."
            className="w-full"
          />

          {/* The labels are DOM, not baked into the picture: they carry the
              type scale, they translate, and they stay legible when the image
              is scaled down on a phone. */}
          <ol className="grid grid-cols-1 gap-x-6 gap-y-6 sm:grid-cols-3">
            {STEPS.map((step) => (
              <li key={step.label} className="flex flex-col border-t border-border pt-4">
                <span className="type-overline text-charcoal">{step.label}</span>
                <p className="mt-2 type-caption">{step.blurb}</p>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}

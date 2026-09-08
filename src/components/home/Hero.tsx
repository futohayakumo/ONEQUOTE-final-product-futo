import Link from "next/link";
import { ArrowRight } from "../icons/ArrowRight";

const RAIL = ["People", "Systems", "Logistics", "A brighter", "Tomorrow"];

export function Hero() {
  return (
    <section className="relative isolate overflow-hidden bg-charcoal">
      {/*
        Plain <img>, not next/image: the app opts into a static export and has
        no image optimiser at all, so the component would be a runtime this
        build does not have.

        1672px wide against the ~2880 a full-bleed hero wants at 1440 CSS on a
        2x screen. It will soften on a retina laptop. Flagged rather than
        hidden — the alternative was leaving a grey plate here.
      */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/assets/banners/01-port-vessel-berth.png"
        alt=""
        aria-hidden
        className="absolute inset-0 -z-20 h-full w-full object-cover"
      />
      {/* Legible type over a photograph needs a ramp, not a flat wash: a flat
          overlay dark enough for the copy would also flatten the picture. */}
      <div aria-hidden className="absolute inset-0 -z-10 scrim-full" />

      <div className="mx-auto flex max-w-[86rem] items-center px-6 py-28">
        <div className="max-w-[36rem]">
          <p className="type-eyebrow text-crimson-lift">
            Logistics connects
            <br />a more human tomorrow
          </p>

          <h1 className="mt-7 type-display text-studio">
            From a quote
            <br />
            to a moving world.
          </h1>

          <p className="mt-8 max-w-[30rem] type-body text-border">
            An interactive portfolio of one delivery programme — the pricing
            logic, the services behind it, and the way the work itself is
            organised.
          </p>

          <div className="mt-10 flex flex-wrap items-center gap-7">
            <Link
              href="/business"
              className="inline-flex items-center gap-3 border border-crimson bg-crimson px-6 py-3.5 type-label text-studio rounded-card shadow-none transition-colors duration-150 hover:border-studio hover:bg-studio hover:text-charcoal"
            >
              Enter the portfolio
              <ArrowRight size={18} />
            </Link>

            <Link
              href="/process#simulation"
              className="group inline-flex items-center gap-3 type-label text-studio"
            >
              <span
                aria-hidden
                className="flex h-9 w-9 items-center justify-center border-2 border-crimson rounded-full"
              >
                <svg width="10" height="12" viewBox="0 0 10 12" aria-hidden>
                  <path d="M0 0l10 6-10 6z" fill="var(--color-crimson)" />
                </svg>
              </span>
              <span className="underline underline-offset-4 group-hover:text-crimson-lift">
                Run the delivery simulation
              </span>
            </Link>
          </div>
        </div>

        {/* The comps run a column of words up the right edge of the photograph.
            It is texture, not navigation, so it is hidden rather than wrapped
            once there is no room for it. */}
        <ul
          aria-hidden
          className="ml-auto hidden shrink-0 flex-col gap-2 pl-10 text-right lg:flex"
        >
          {RAIL.map((word) => (
            <li
              key={word}
              className="type-overline text-border"
            >
              {word}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

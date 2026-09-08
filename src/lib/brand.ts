/*
 * Every appearance of the product name resolves here.
 *
 * The comps show the client's real wordmark in the nav, the footer and the
 * body copy. None of that can be committed, so the site is built against the
 * masked name instead -- and it is built against a *constant*, not a string
 * literal repeated across nine components, so the demo substitution has one
 * place to hit rather than nine.
 *
 * This is also why the wordmark is drawn in code rather than dropped in as the
 * extracted PNG. A name burnt into pixels cannot be substituted at all.
 */
export const BRAND = {
  /** Nav and footer lockup. Uppercase is applied by the component. */
  mark: "Global Liner",
  /** Full legal-ish form, footer and metadata. */
  full: "Global Liner Alliance",
  /** The line that sits beside the mark in the nav and footer. */
  tagline: "Logistics, reimagined.",
} as const;

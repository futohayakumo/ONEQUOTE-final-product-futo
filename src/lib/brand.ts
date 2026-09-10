/*
 * Every appearance of the product name resolves here.
 *
 * It was a masked stand-in while the site was built to be publishable with the
 * client's identity removed. That constraint has been lifted: the photographs
 * carry the wordmark on a hull, a jacket and a truck, and no amount of care in
 * the source would have hidden a name that is painted across the artwork.
 *
 * The constant stays, because one place to change is worth keeping whichever
 * name is in it.
 */
export const BRAND = {
  /** Nav and footer lockup. Uppercase is applied by the component. */
  mark: "ONE QUOTE",
  /** Full form, footer and metadata. */
  full: "ONE QUOTE",
  /** The line that sits beside the mark in the nav and footer. */
  tagline: "Logistics, reimagined.",
  /*
   * The copyright year, fixed rather than read from the clock.
   *
   * `new Date().getFullYear()` in a component is a hydration mismatch waiting
   * for New Year's Eve, and in a statically exported page it would freeze at
   * whatever year the build ran anyway. One constant, edited deliberately.
   */
  year: 2026,
} as const;

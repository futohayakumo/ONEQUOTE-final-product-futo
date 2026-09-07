# Extracted design assets

Three asset sheets were supplied for the design refresh. Each was cut by a
script in `scripts/`; the sheets themselves live outside the repository
alongside `intro.md` and `examples/`.

| Sheet | Script | Output |
| :--- | :--- | :--- |
| 4×4 spot art | `scripts/split-asset-sheet.py` | `spot/` — 16 items |
| Stacked banners | `scripts/split-banner-sheet.py` | `banners/` — 7 items |
| Labelled icon grid | `scripts/split-icon-sheet.py` | `icons/` — 24 items |
| Keyed scenes | `scripts/chroma-key.py` | `scenes/` — 9 items |
| Keyed icon grid | `scripts/chroma-key.py` + `scripts/snap-ink.py` | `icons/25–44` |

## What each script had to get right

**Spot art.** The background is removed by a flood fill seeded from the border,
not by deleting white pixels globally — the truck and the laptop are themselves
white, and a global rule would have hollowed them out. Photographs in the same
sheet are detected by row/column projection and cropped to their own edge, so
no half-transparent ring is left along the picture border.

**Banners.** The separator between bands is one to three pixels of paper. It
cannot be found by looking for a bright row, because the second banner is a
product shot on a white ground and its own top forty rows are bright. It is
found by uniformity instead: a drawn rule has a row standard deviation near
zero, a studio backdrop does not.

**Icons.** The grid rules sit at luminance 249 against paper at 252, so an
absolute threshold cannot separate a rule from an empty band inside a cell.
They are found by local contrast — darker than the median of the lines around
them. Captions are stripped by a fixed 55px band, measured to clear every one
of the 24 cells. Enclosed white is knocked out, so an outlined icon is hollow
and can sit on `tint`; the one exception is white reversed out of a *solid*
fill, such as the arrow inside the crimson CTA button. The two are told apart
by dilating the white region ten pixels and asking whether it is still
surrounded by colour.

**Keyed scenes.** These arrived on a solid key colour instead of white, and it
changes everything. White is the one background that cannot be removed
reliably, because the truck, the laptop and the office furniture are themselves
white; each of the first three sheets needed a different heuristic, and every
heuristic is a guess that can be wrong. A key colour that appears nowhere in
the subject turns the whole problem into arithmetic.

| Sheet | Key | Subject | Transition band |
| :--- | ---: | ---: | ---: |
| Planning room | magenta 51.7% | 45.0% | 2.3% |
| Isometric tiles | green 66.7% | 31.1% | 0.9% |

A transition band of one or two percent is the anti-aliased outline and nothing
else — there is no grey zone left to guess about. The edge is un-blended with
the matte equation rather than thresholded, and spill is suppressed only within
three pixels of the boundary, so the pink sticky notes and the green pot plants
keep their colour. Measured residual cast on opaque pixels away from the
plants: zero in four of the eight tiles.

Two things to ask of the next batch. The planning room has the key painted
*inside* two shelf cubbies, which become holes when it is pulled — the key must
appear only behind the subject. And its laptop carries a manufacturer's logo.

## The icons are not on the palette as generated

Measured ink, against the tokens `CLAUDE.md` allows:

| Source | Dark | off charcoal | Crimson | off `#E1127A` |
| :--- | :--- | ---: | :--- | ---: |
| `icons/02–24` (white ground) | `#071731` | 10.6 | `#EE0173` | 22.5 |
| `icons/25–44` (green key) | `#00032A` | 25.0 | `#F8065F` | 37.4 |

`pnpm check:tokens` reads text and cannot see this. A `#F8065F` stroke beside a
real `#E1127A` button reads as a different colour.

`icons/25–44` are corrected — every pixel in them is now exactly `#0F172A` or
`#E1127A`. They could be, because that sheet is flat two-ink line art: each
pixel is classified by warmth, `(R−B)/(R+B)`, which is independent of
brightness. An absolute `R−B` cut-off fails here, painting a hard charcoal rim
around every crimson stroke, because a dim anti-aliased crimson pixel like
(60, 20, 50) has an `R−B` of only 10.

`icons/02–24` are **not** corrected and remain slightly off. That sheet carries
four inks, not two — the border grey and the tint pink as well — and snapping
it to two turns the pale badge into a solid crimson slab and the hairline input
shell into a charcoal box. `snap-ink.py` now refuses artwork whose ink is less
than 95% accounted for by two colours, so this cannot be repeated by accident.

## `branded/` is gitignored, and that is the point

Eleven of the 47 carry the real wordmark burnt into their pixels — the logo in
two sheets, a ship's hull, a laptop header bar, a truck trailer, a jacket, a
hi-vis vest. `pnpm check:tokens` reads text. It cannot see inside a PNG, so a
leak that arrives as an image passes every guard this repository has. They stay
on disk as local design inputs, exactly like `intro.md` and `examples/`.

Anything shipped publicly must either avoid those eleven or use masked
variants. The 36 assets outside `branded/` are committed and safe.

## A note for whoever wires these up

`icons/16-recommended-badge`, `icons/23-tab-pill` and `icons/17-search-cta-button`
are drawn as pills. `CLAUDE.md` allows exactly one radius, 4px, and a pill is
not it. Use them as layout reference, or rebuild those three from the token set
— do not ship the PNGs as-is.

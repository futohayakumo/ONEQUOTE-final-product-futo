#!/usr/bin/env python3
"""Snap flat two-colour line art onto the exact design tokens.

Generated icons come back close to the palette but not on it. Measured:

    sheet 5   dark #071731 (10.6 from charcoal)   crimson #EE0173 (22.5 off)
    sheet 8   dark #00032A (25.0 from charcoal)   crimson #F8065F (37.4 off)

`pnpm check:tokens` reads text, so nothing catches this -- but a #F8065F
stroke sitting beside a real #E1127A button reads as a different colour, and
CLAUDE.md allows nine colours and no others.

The fix is mechanical because the artwork is flat: every opaque pixel is one of
two inks, and the anti-aliased ramp is already un-blended by the chroma key. So
each pixel is assigned to whichever source ink it is nearer and rewritten as
the matching token. Alpha is untouched, so the outline keeps its shape.

This is only valid for flat line art. Do not run it on the rendered scenes.

    python3 scripts/snap-ink.py <dir-or-file>...
"""
import glob
import os
import sys

import numpy as np
from PIL import Image

CHARCOAL = np.array([0x0F, 0x17, 0x2A])
CRIMSON = np.array([0xE1, 0x12, 0x7A])


def source_inks(paths):
    """The two ink colours actually used, as medians over every file."""
    dark, warm = [], []
    for p in paths:
        a = np.array(Image.open(p).convert("RGBA")).astype(int)
        px = a[..., :3][a[..., 3] >= 250]
        if not len(px):
            continue
        dark.append(px[px.sum(axis=1) < 220])
        warm.append(px[(px[:, 0] > 150) & (px[:, 1] < 90) & (px[:, 2] > 40)])
    d = np.median(np.vstack([x for x in dark if len(x)]), axis=0)
    w = np.median(np.vstack([x for x in warm if len(x)]), axis=0)
    return d, w


def snap(path, src_dark, src_crimson):
    """Classify by hue, not by nearest colour.

    Euclidean distance puts the darkest core of a crimson stroke closer to the
    dark ink than to crimson, which speckles a pure-crimson icon with stray
    charcoal pixels.

    Hue settles it, but only if the measure is independent of brightness. An
    absolute R - B threshold fails the same way: a dim anti-aliased crimson
    pixel like (60, 20, 50) has R - B of just 10 and falls to the dark side,
    painting a hard charcoal rim around every crimson stroke. The ratio does
    not have that problem -- crimson stays positive at any luminance because R
    always exceeds B, and the dark ink stays negative for the same reason in
    the other direction.
    """
    a = np.array(Image.open(path).convert("RGBA")).astype(float)
    rgb, alpha = a[..., :3], a[..., 3]
    warmth = (rgb[..., 0] - rgb[..., 2]) / (rgb[..., 0] + rgb[..., 2] + 1)
    is_dark = warmth <= 0
    out = np.where(is_dark[..., None], CHARCOAL, CRIMSON).astype(np.uint8)
    # Fully transparent pixels carry no colour worth preserving.
    out = np.dstack([out, alpha.astype(np.uint8)])
    Image.fromarray(out, "RGBA").save(path)
    return int(is_dark[alpha >= 250].sum()), int((~is_dark)[alpha >= 250].sum())


def main(argv):
    paths = []
    for arg in argv[1:]:
        paths += sorted(glob.glob(os.path.join(arg, "*.png"))) if os.path.isdir(arg) else [arg]
    if not paths:
        sys.exit("nothing to do")
    d, c = source_inks(paths)
    hx = lambda v: "#%02X%02X%02X" % tuple(int(x) for x in v)

    # Refuse artwork that is not two-ink. The first icon sheet also carried the
    # border grey and the tint pink, and snapping it to two inks turned a pale
    # pink badge into a solid crimson slab and a hairline input shell into a
    # charcoal box. Two inks is a precondition, so check it rather than trust
    # the caller to remember.
    near = total = 0
    for p in paths:
        a = np.array(Image.open(p).convert("RGBA")).astype(float)
        px = a[..., :3][a[..., 3] >= 250]
        if not len(px):
            continue
        dd = np.sqrt(((px - d) ** 2).sum(axis=1))
        dc = np.sqrt(((px - c) ** 2).sum(axis=1))
        near += int((np.minimum(dd, dc) < 60).sum())
        total += len(px)
    share = near / max(total, 1)
    if share < 0.95:
        sys.exit(f"refusing: only {share * 100:.1f}% of ink is one of the two "
                 f"detected colours ({hx(d)}, {hx(c)}).\n"
                 f"This artwork uses more than two inks -- snapping it would "
                 f"flatten the others onto the wrong token.")
    print(f"source inks: dark {hx(d)} -> {hx(CHARCOAL)}   crimson {hx(c)} -> {hx(CRIMSON)}")
    for p in paths:
        nd, nc = snap(p, d, c)
        print(f"  {os.path.basename(p):32s} charcoal {nd:6d} px   crimson {nc:6d} px")


if __name__ == "__main__":
    main(sys.argv)

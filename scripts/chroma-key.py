#!/usr/bin/env python3
"""Pull a chroma key, un-blend the edge, suppress spill, and split into tiles.

Why a key colour at all. The first three asset sheets came on white, and white
is the one background that cannot be removed reliably: the truck, the laptop
and the office furniture are themselves white, so "delete the white pixels"
hollows out the subject. Every one of those sheets needed a different heuristic
-- border-connected flood fill, row/column projection, local contrast -- and
each heuristic is a guess that can be wrong. A key colour that appears nowhere
in the subject turns all of that into arithmetic.

Measured separation on the two keyed sheets so far:

    magenta room   key 51.7%   subject 45.0%   transition band 2.3%
    green tiles    key 66.7%   subject 30.3%   transition band 1.6%

A transition band of one or two percent is the anti-aliased outline and nothing
else. There is no grey zone to guess about.

Usage:
    python3 scripts/chroma-key.py <src> <out.png>            single subject
    python3 scripts/chroma-key.py <src> <out-dir> --tiles    split by content
    ...optionally with --key green (default: auto-detect)
"""
import os
import sys

import numpy as np
from PIL import Image, ImageFilter

LO, HI = 60, 200      # below LO the pixel is subject; above HI it is key
SPILL_RING = 3        # spill is a boundary effect; leave the interior alone
SPILL_K = 0.9
MIN_TILE = 20         # a content run shorter than this is noise, not a tile


def keyness(a, kind):
    """How much of the key colour a pixel carries. 255 = pure key, 0 = none."""
    r, g, b = a[..., 0], a[..., 1], a[..., 2]
    if kind == "magenta":
        return np.minimum(r, b) - g
    return g - np.maximum(r, b)


def detect_kind(a):
    r, g, b = a[..., 0], a[..., 1], a[..., 2]
    mag = (np.minimum(r, b) - g >= HI).mean()
    grn = (g - np.maximum(r, b) >= HI).mean()
    return "magenta" if mag > grn else "green"


def matte(a, kind):
    """Alpha, plus the RGB with the key un-blended out of the edge."""
    k = keyness(a, kind)
    alpha = 1.0 - np.clip((k - LO) / (HI - LO), 0, 1)
    K = a[k >= HI].mean(axis=0)

    # observed = a*C + (1-a)*K  ->  C = (observed - (1-a)*K)/a
    safe = np.maximum(alpha, 0.15)[..., None]
    rgb = np.clip((a - (1 - alpha)[..., None] * K) / safe, 0, 255)

    # A fully opaque white surface beside the key still picks up a cast. Fix it
    # only in a narrow ring, so genuinely pink or genuinely green content --
    # the sticky notes, the pot plants -- is not desaturated.
    edge = ((alpha < 0.999) * 255).astype(np.uint8)
    ring = np.array(Image.fromarray(edge).filter(
        ImageFilter.MaxFilter(SPILL_RING * 2 + 1))) > 0
    kk = keyness(rgb, kind)
    hit = ring & (kk > 0)
    if kind == "magenta":
        rgb[..., 0] = np.where(hit, np.clip(rgb[..., 0] - kk * SPILL_K, 0, 255), rgb[..., 0])
        rgb[..., 2] = np.where(hit, np.clip(rgb[..., 2] - kk * SPILL_K, 0, 255), rgb[..., 2])
    else:
        rgb[..., 1] = np.where(hit, np.clip(rgb[..., 1] - kk * SPILL_K, 0, 255), rgb[..., 1])

    return alpha, rgb


def bands(profile):
    """Runs of content along one axis, from a boolean coverage profile."""
    out = []
    for i, on in enumerate(profile):
        if not on:
            continue
        if out and i == out[-1][-1] + 1:
            out[-1].append(i)
        else:
            out.append([i])
    return [(g[0], g[-1] + 1) for g in out if len(g) > MIN_TILE]


def write(rgb, alpha, path):
    ys, xs = np.where(alpha > 0.02)
    if not len(ys):
        return None
    y0, y1, x0, x1 = ys.min(), ys.max() + 1, xs.min(), xs.max() + 1
    out = np.dstack([rgb[y0:y1, x0:x1].astype(np.uint8),
                     (alpha[y0:y1, x0:x1] * 255).astype(np.uint8)])
    Image.fromarray(out, "RGBA").save(path)
    return x1 - x0, y1 - y0


def main(argv):
    src, dst = argv[1], argv[2]
    tiles = "--tiles" in argv
    kind = argv[argv.index("--key") + 1] if "--key" in argv else None

    a = np.array(Image.open(src).convert("RGB")).astype(np.float64)
    kind = kind or detect_kind(a)
    alpha, rgb = matte(a, kind)
    print(f"key: {kind}   subject {(alpha > 0.5).mean() * 100:.1f}%   "
          f"transition {(((alpha > 0.02) & (alpha < 0.98)).mean() * 100):.1f}%")

    if not tiles:
        print(" ", dst, write(rgb, alpha, dst))
        return

    os.makedirs(dst, exist_ok=True)
    solid = alpha > 0.5
    rows = bands(solid.mean(axis=1) > 0.002)
    cols = bands(solid.mean(axis=0) > 0.002)
    print(f"  grid: {len(rows)} x {len(cols)}")
    n = 0
    for ri, (y0, y1) in enumerate(rows):
        for ci, (x0, x1) in enumerate(cols):
            n += 1
            path = os.path.join(dst, f"{n:02d}.png")
            size = write(rgb[y0:y1, x0:x1], alpha[y0:y1, x0:x1], path)
            print(f"  {os.path.basename(path)}  {size[0]}x{size[1]}")


if __name__ == "__main__":
    main(sys.argv)

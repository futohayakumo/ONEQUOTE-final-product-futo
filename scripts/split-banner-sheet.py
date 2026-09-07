#!/usr/bin/env python3
"""Cut the stacked banner sheet into its individual wide photographs.

The bands are separated by a hairline of paper, one to three pixels tall. The
obvious detector -- "a row that is bright all the way across" -- does not work
here, because the second banner is a product shot on a white ground, so its own
top forty rows are bright too. What actually distinguishes the separator is
that it is *uniform*: a rule drawn in one colour has a row standard deviation
near zero, while even a plain white studio backdrop carries a gradient.

Every band is a photograph, so nothing is made transparent. They are cropped to
their own edges and written opaque.

    python3 scripts/split-banner-sheet.py <sheet.png> <out-dir>
"""
import os
import sys

import numpy as np
from PIL import Image

NAMES = [
    "banner-port-vessel-berth",
    "banner-quote-to-delivery",
    "banner-global-network",
    "banner-control-room",
    "banner-executive-overview",
    "banner-integration-mesh",
    "banner-terminal-inspection",
]

FLAT_STD = 3.0    # a drawn rule has essentially no variation across its width
PAPER = 248       # ...and it is paper-bright


def separator_rows(lum):
    """Row indices that belong to a drawn separator, grouped into runs."""
    flat = np.where((lum.std(axis=1) < FLAT_STD) & (lum.mean(axis=1) > PAPER))[0]
    runs = []
    for r in flat:
        # Two rules one pixel apart are one separator, not two.
        if runs and r - runs[-1][-1] <= 3:
            runs[-1].append(r)
        else:
            runs.append([r])
    return runs


def trim(band):
    """Drop uniform paper rows and columns from the edges of one band."""
    lum = band.mean(axis=2)
    keep_r = ~((lum.std(axis=1) < FLAT_STD) & (lum.mean(axis=1) > PAPER))
    keep_c = ~((lum.std(axis=0) < FLAT_STD) & (lum.mean(axis=0) > PAPER))
    ys, xs = np.where(keep_r)[0], np.where(keep_c)[0]
    if not len(ys) or not len(xs):
        return band
    return band[ys.min():ys.max() + 1, xs.min():xs.max() + 1]


def main(src, out):
    os.makedirs(out, exist_ok=True)
    sheet = np.array(Image.open(src).convert("RGB"))
    lum = sheet.mean(axis=2)

    runs = separator_rows(lum)
    cuts = [0] + [r[-1] + 1 for r in runs] + [sheet.shape[0]]
    bands = [(a, b) for a, b in zip(cuts, [r[0] for r in runs] + [sheet.shape[0]])
             if b - a > 40]

    if len(bands) != len(NAMES):
        sys.exit(f"found {len(bands)} bands, expected {len(NAMES)}: {bands}")

    for i, (y0, y1) in enumerate(bands):
        band = trim(sheet[y0:y1])
        h, w, _ = band.shape
        rgba = np.dstack([band, np.full((h, w, 1), 255, np.uint8)])
        name = f"{i + 1:02d}-{NAMES[i]}.png"
        Image.fromarray(rgba, "RGBA").save(os.path.join(out, name))
        print(f"  {name:36s} {w}x{h}  rows {y0}-{y1}")


if __name__ == "__main__":
    main(sys.argv[1], sys.argv[2])

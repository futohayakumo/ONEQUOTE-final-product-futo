#!/usr/bin/env python3
"""Cut the labelled icon sheet into 24 transparent PNGs.

Three things about this sheet decide the approach.

The grid rules are drawn about #EDF1F6 -- fifteen levels below the paper -- so
they cannot be found by looking for dark pixels; the icons dominate any column
average. They are found instead by uniformity: a ruled column has almost no
variation down its length.

Each cell carries its caption at the top. The caption is not part of the asset,
so a fixed band is removed. Measured across all 24 cells the caption always
sits in cell rows 20-35 and no icon starts before row 73, so 55 is a safe cut
with margin on both sides.

The background is removed by a flood fill seeded from the cell border, not by
deleting bright pixels globally. Two assets -- the recommended badge and the
tab pill -- are pale pink at luminance 235, which is brighter than the grid
rules; a global rule would erase them. A flood stops at their edge instead.

    python3 scripts/split-icon-sheet.py <sheet.png> <out-dir>
"""
import os
import sys
from collections import deque

import numpy as np
from PIL import Image, ImageFilter

NAMES = [
    "logo-wordmark", "back-arrow", "location-pin", "cargo-type",
    "container", "calendar", "weight", "ship-sailing",
    "download", "schedule", "share", "info-notes",
    "cta-arrow", "radio-selected", "radio-unselected", "recommended-badge",
    "search-cta-button", "quantity-stepper", "section-accent-line", "route-timeline-motif",
    "dropdown-chevron", "input-shell", "tab-pill", "divider-line",
]

LABEL_BAND = 55   # caption occupies cell rows 20-35; no icon starts before 73
PURE = 248        # paper here is 251-254, not pure white
SOFT = 232        # narrow band: the palest asset is 235 and must stay opaque
KNOCKOUT_R = 10   # how far to look around an enclosed white region
KNOCKOUT_MIN = 0.85
RULE_STD = 8.0    # a ruled line varies barely at all along its own direction
RULE_DROP = 2.0   # ...and it is measurably darker than the paper beside it


def rule_positions(lum, axis):
    """Grouped indices of the light grid rules along one axis.

    An absolute brightness cut-off does not separate a rule from empty paper --
    the rules sit at 249 and the paper at 252, and whole bands of a cell are as
    uniform as a drawn line. The rule is instead defined relative to its own
    surroundings: darker than the median of the thirty-one lines around it.
    """
    std = lum.std(axis=axis)
    mean = lum.mean(axis=axis)
    local = np.array([np.median(mean[max(0, i - 15):i + 16]) for i in range(len(mean))])
    hits = np.where((std < RULE_STD) & (mean < local - RULE_DROP))[0]
    runs = []
    for i in hits:
        if runs and i - runs[-1][-1] <= 3:
            runs[-1].append(i)
        else:
            runs.append([i])
    return runs


def paper_regions(crop):
    """Mark every pixel that is paper rather than drawing.

    Border-connected paper is obviously background. So is the paper *inside* an
    outlined icon -- the white in the middle of the container rectangle is not
    a white fill, it is the page showing through a drawn outline, and it has to
    come out or the icon cannot sit on a tinted surface.

    The one enclosed white that must survive is a knockout: the arrow reversed
    out of the solid crimson button. It is told apart from an outline's
    interior by how much colour surrounds it. Dilate the region by ten pixels;
    if it is still entirely inside colour, it sits in a solid fill and stays.
    An outline is only a few pixels thick, so the same dilation reaches past it
    into the page, and the region is background after all.
    """
    lum = crop.mean(axis=2)
    h, w = lum.shape
    bright = lum >= PURE
    out = np.zeros((h, w), bool)
    seen = np.zeros((h, w), bool)

    for sy in range(h):
        for sx in range(w):
            if not bright[sy, sx] or seen[sy, sx]:
                continue
            comp = []
            touches_border = False
            seen[sy, sx] = True
            q = deque([(sy, sx)])
            while q:
                y, x = q.popleft()
                comp.append((y, x))
                if y in (0, h - 1) or x in (0, w - 1):
                    touches_border = True
                for dy, dx in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                    ny, nx = y + dy, x + dx
                    if 0 <= ny < h and 0 <= nx < w and bright[ny, nx] and not seen[ny, nx]:
                        seen[ny, nx] = True
                        q.append((ny, nx))

            if touches_border:
                for y, x in comp:
                    out[y, x] = True
                continue

            mask = np.zeros((h, w), np.uint8)
            for y, x in comp:
                mask[y, x] = 255
            grown = np.array(Image.fromarray(mask).filter(
                ImageFilter.MaxFilter(KNOCKOUT_R * 2 + 1))) > 0
            ring = grown & (mask == 0)
            enclosed = ring.any() and (~bright)[ring].mean() >= KNOCKOUT_MIN
            if not enclosed:
                for y, x in comp:
                    out[y, x] = True

    return out


def main(src, out):
    os.makedirs(out, exist_ok=True)
    sheet = np.array(Image.open(src).convert("RGB"))
    lum = sheet.mean(axis=2)

    vrules = rule_positions(lum, axis=0)
    hrules = rule_positions(lum, axis=1)
    cols = [(a[-1] + 1, b[0]) for a, b in zip(vrules, vrules[1:])]
    rows = [(a[-1] + 1, b[0]) for a, b in zip(hrules, hrules[1:])]

    if (len(rows), len(cols)) != (6, 4):
        sys.exit(f"grid is {len(rows)}x{len(cols)}, expected 6x4")

    for r, (y0, y1) in enumerate(rows):
        for c, (x0, x1) in enumerate(cols):
            i = r * 4 + c
            crop = sheet[y0 + LABEL_BAND:y1, x0:x1]

            bg = paper_regions(crop)
            ink = ~bg
            ys, xs = np.where(ink)
            crop, bg = crop[ys.min():ys.max() + 1, xs.min():xs.max() + 1], \
                       bg[ys.min():ys.max() + 1, xs.min():xs.max() + 1]

            # Hard transparent where the flood reached; partial where the pixel
            # is only half paper, so anti-aliased strokes keep their shape.
            cl = crop.mean(axis=2)
            soft = np.clip((PURE - cl) / (PURE - SOFT), 0, 1) * 255
            alpha = np.where(bg, soft.astype(np.uint8), 255).astype(np.uint8)

            h, w = alpha.shape
            rgba = np.dstack([crop.astype(np.uint8), alpha])
            name = f"{i + 1:02d}-{NAMES[i]}.png"
            Image.fromarray(rgba, "RGBA").save(os.path.join(out, name))
            print(f"  {name:30s} {w}x{h}  {(alpha == 0).mean() * 100:.0f}% cut")


if __name__ == "__main__":
    main(sys.argv[1], sys.argv[2])

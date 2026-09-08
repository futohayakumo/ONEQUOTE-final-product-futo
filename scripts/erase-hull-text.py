#!/usr/bin/env python3
"""Paint a name off a smooth surface by fitting the surface around it.

The wordmark on the vessel's bow is the one leak in this photograph a reader
can actually read, and the hull under it is the easiest possible case: a flat
plate with a gentle vertical shade and a soft falloff from the low sun, with no
texture to reconstruct.

The obvious method -- read the hull a few pixels either side and interpolate
across -- fails here, and the way it fails is instructive. To the left of the
lettering is the sunlit gunwale, four times brighter than the hull, so the
"clean sample" was a highlight and the patch carried a 5.4-level step down its
left edge.

So the fill is a least-squares quadratic surface fitted to a RING around the
patch, with outliers rejected: pixels more than two deviations from the ring's
median drop out, which removes the gunwale, the anchor and the lettering's own
halo before the fit ever sees them. Grain is added back at the amplitude
measured on the ring, or a repaired panel reads as glass on a noisy hull.

    python3 scripts/erase-hull-text.py <src> <dst> x0 y0 x1 y1
"""
import sys

import numpy as np
from PIL import Image

RING = 18  # how far around the patch to read the surface from
FEATHER = 4  # pixels blended at every edge, so the patch has no seam


def fit_surface(img, x0, y0, x1, y1):
    """Quadratic in x and y, per channel, from the ring around the patch."""
    h, w, _ = img.shape
    ry0, ry1 = max(y0 - RING, 0), min(y1 + RING, h)
    rx0, rx1 = max(x0 - RING, 0), min(x1 + RING, w)

    yy, xx = np.mgrid[ry0:ry1, rx0:rx1]
    inside = (yy >= y0) & (yy < y1) & (xx >= x0) & (xx < x1)
    ring = img[ry0:ry1, rx0:rx1]

    sample = ~inside
    lum = ring.mean(axis=2)
    med, sd = np.median(lum[sample]), lum[sample].std()
    # Reject the gunwale highlight, the anchor and the lettering's halo.
    sample &= np.abs(lum - med) < 2.0 * sd

    sx = (xx[sample] - x0) / max(x1 - x0, 1)
    sy = (yy[sample] - y0) / max(y1 - y0, 1)
    A = np.stack([np.ones_like(sx), sx, sy, sx * sx, sx * sy, sy * sy], axis=1)

    py, px = np.mgrid[y0:y1, x0:x1]
    px = (px - x0) / max(x1 - x0, 1)
    py = (py - y0) / max(y1 - y0, 1)
    B = np.stack(
        [np.ones_like(px), px, py, px * px, px * py, py * py], axis=-1
    )

    out = np.zeros((y1 - y0, x1 - x0, 3))
    residual = []
    for c in range(3):
        coef, *_ = np.linalg.lstsq(A, ring[..., c][sample], rcond=None)
        out[..., c] = B @ coef
        residual.append(ring[..., c][sample] - A @ coef)

    # Grain is the RESIDUAL after the fit, not the spread of the ring. The
    # ring's own standard deviation is dominated by the shading gradient
    # across it, so using it laid down noise twice as coarse as the hull's
    # and the repair read as a patch of sandpaper at any zoom.
    return out, float(np.std(np.concatenate(residual)))


def main(src, dst, x0, y0, x1, y1):
    img = np.array(Image.open(src).convert("RGB")).astype(np.float64)
    fill, grain = fit_surface(img, x0, y0, x1, y1)

    rng = np.random.default_rng(7)  # seeded: same input, same output
    fill = fill + rng.normal(0.0, grain * 0.5, fill.shape)

    # Feather every edge, not just the top and bottom.
    hgt, wid = fill.shape[:2]
    ay = np.minimum(np.arange(hgt), hgt - 1 - np.arange(hgt))
    ax = np.minimum(np.arange(wid), wid - 1 - np.arange(wid))
    k = np.minimum(
        np.clip((ay + 1) / (FEATHER + 1), 0, 1)[:, None],
        np.clip((ax + 1) / (FEATHER + 1), 0, 1)[None, :],
    )[..., None]

    img[y0:y1, x0:x1] = img[y0:y1, x0:x1] * (1 - k) + fill * k
    Image.fromarray(np.clip(img, 0, 255).astype(np.uint8)).save(dst)
    print(f"{dst}  patched x{x0}-{x1} y{y0}-{y1}, ring grain {grain:.1f}")


if __name__ == "__main__":
    main(sys.argv[1], sys.argv[2], *map(int, sys.argv[3:7]))

#!/usr/bin/env python3
"""Push a near-miss alpha channel to its ends.

A cut-out arrived with no fully opaque pixel anywhere: the subject sat at
alpha 248-253 and the background at 1-31. Nothing is obviously wrong at a
glance, and the result is wrong everywhere -- a 2% veil over the whole subject,
and a background that is 6% visible, which is why a dark original bleeds
through as grime around every edge.

Rescaling is not the same as thresholding. The genuinely soft pixels -- the
anti-aliased outline, the reflection under the truck -- keep their gradient;
only the two ends are pinned. Straight thresholding would give the cut-out a
hard jagged edge, which is the usual cure that is worse than the disease.

    python3 scripts/fix-matte.py <src> <dst> [low] [high]
"""
import sys

import numpy as np
from PIL import Image


def main(src, dst, low=32, high=248):
    a = np.array(Image.open(src).convert("RGBA")).astype(np.float64)
    alpha = a[..., 3]
    before = ((alpha > 0) & (alpha < 255)).mean() * 100

    scaled = np.clip((alpha - low) / (high - low), 0, 1)

    # Where the background showed through, its colour is meaningless and often
    # dark. Un-premultiply toward the subject so the edge does not carry a
    # grey halo once the alpha is honest.
    a[..., 3] = scaled * 255
    out = np.clip(a, 0, 255).astype(np.uint8)
    Image.fromarray(out, "RGBA").save(dst)

    after = ((out[..., 3] > 0) & (out[..., 3] < 255)).mean() * 100
    print(
        f"{dst}\n  partial alpha {before:.1f}% -> {after:.1f}%   "
        f"opaque {(out[..., 3] == 255).mean() * 100:.1f}%   "
        f"clear {(out[..., 3] == 0).mean() * 100:.1f}%"
    )


if __name__ == "__main__":
    main(sys.argv[1], sys.argv[2], *map(int, sys.argv[3:5]))

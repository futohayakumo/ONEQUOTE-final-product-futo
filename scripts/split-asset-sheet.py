"""Split the asset sheet into individual transparent PNGs.

Background removal is a border-connected flood, not a global "delete white".
Two assets on this sheet are themselves white — the truck and the laptop — and
a global threshold erases them. Only near-pure-white pixels reachable from the
edge of the crop are treated as background, and the near-white band just inside
that boundary gets a soft alpha so edges do not come out jagged.
"""
import numpy as np
from PIL import Image
from collections import deque
import os, sys

SRC = sys.argv[1]
OUT = sys.argv[2]
os.makedirs(OUT, exist_ok=True)

COLS = [(2, 269), (273, 560), (562, 848), (851, 1120)]
ROWS = [(2, 349), (352, 699), (702, 1050), (1053, 1400)]
LABEL_BAND = 56           # the "01 LOGO / WORDMARK" strip at the top of each cell
PURE = 250                # background must be essentially pure white
SOFT = 238                # a NARROW soft band: anything greyer than this stays
                          # fully opaque, so the pale grey scroll arrow is not
                          # eaten by the anti-alias ramp
PHOTO_FILL = 0.88         # a crop this densely non-background is a photograph

NAMES = [
    "logo-wordmark", "hero-container-ship", "play-button", "scroll-down-indicator",
    "quote-interface-laptop", "booking-container", "delivery-truck", "global-map-routes",
    "operations-control-room", "perspective-business", "perspective-engineering",
    "perspective-process",
    "cta-arrow", "nav-underline", "route-line", "diagonal-slash",
]

sheet = np.array(Image.open(SRC).convert("RGB")).astype(np.int16)

def content_bbox(cell):
    """Tightest box around anything that is not page background."""
    lum = cell.mean(axis=2)
    fg = lum < 244
    ys, xs = np.where(fg)
    if len(ys) == 0:
        return None
    pad = 6
    y0 = max(0, ys.min() - pad); y1 = min(cell.shape[0], ys.max() + 1 + pad)
    x0 = max(0, xs.min() - pad); x1 = min(cell.shape[1], xs.max() + 1 + pad)
    return y0, y1, x0, x1

def border_background(rgb):
    """Flood from every edge pixel that is near-pure-white."""
    h, w, _ = rgb.shape
    lum = rgb.mean(axis=2)
    bright = lum >= PURE
    seen = np.zeros((h, w), bool)
    q = deque()
    for x in range(w):
        for y in (0, h - 1):
            if bright[y, x] and not seen[y, x]:
                seen[y, x] = True; q.append((y, x))
    for y in range(h):
        for x in (0, w - 1):
            if bright[y, x] and not seen[y, x]:
                seen[y, x] = True; q.append((y, x))
    while q:
        y, x = q.popleft()
        for dy, dx in ((1,0),(-1,0),(0,1),(0,-1)):
            ny, nx = y+dy, x+dx
            if 0 <= ny < h and 0 <= nx < w and not seen[ny, nx] and bright[ny, nx]:
                seen[ny, nx] = True; q.append((ny, nx))
    return seen

report = []
for i in range(16):
    r, c = divmod(i, 4)
    y0, y1 = ROWS[r]; x0, x1 = COLS[c]
    cell = sheet[y0 + LABEL_BAND : y1, x0:x1]

    bb = content_bbox(cell)
    if bb is None:
        report.append((NAMES[i], "EMPTY")); continue
    cy0, cy1, cx0, cx1 = bb
    crop = cell[cy0:cy1, cx0:cx1]
    h, w, _ = crop.shape

    # A photograph is a solid rectangle sitting in a white margin. Detect it by
    # row/column projection rather than by a total fill ratio: a few stray
    # anti-aliased pixels at the extreme edge must not disqualify it, and the
    # bright sky inside the ship photo must not be mistaken for background.
    lum_full = crop.mean(axis=2)
    # 248, not 244: the sunset sky in two of the photos is very bright but is
    # still not the pure-white paper of the margin.
    ink = lum_full < 248
    rows = np.where(ink.mean(axis=1) >= 0.5)[0]
    cols = np.where(ink.mean(axis=0) >= 0.5)[0]
    if len(rows) and len(cols):
        y0, y1 = rows.min(), rows.max() + 1
        x0, x1 = cols.min(), cols.max() + 1
        block = ink[y0:y1, x0:x1]
        # The block must also dominate the cell. A cut-out's ink region (the
        # laptop screen, say) can be large and dense but never fills the cell.
        if (block.size > 40000 and block.mean() >= 0.90
                and block.size / ink.size >= 0.60):
            crop = crop[y0:y1, x0:x1]
            h, w, _ = crop.shape
            out = np.dstack([crop.astype(np.uint8), np.full((h, w, 1), 255, np.uint8)])
            name = f"{i+1:02d}-{NAMES[i]}.png"
            Image.fromarray(out, "RGBA").save(os.path.join(OUT, name))
            report.append((name, f"{w}x{h}  photo (opaque, de-margined)"))
            continue

    corners = [crop[0,0], crop[0,-1], crop[-1,0], crop[-1,-1]]
    on_white = sum(1 for p in corners if p.mean() >= PURE) >= 3

    alpha = np.full((h, w), 255, np.uint8)
    kind = "photo (opaque)"
    if on_white:
        bg = border_background(crop)
        lum = crop.mean(axis=2)
        # Hard transparent where the flood reached; soft where it is only
        # partly bright, so anti-aliased edges keep their shape.
        soft = np.clip((PURE - lum) / (PURE - SOFT), 0, 1) * 255
        alpha = np.where(bg, soft.astype(np.uint8), 255).astype(np.uint8)
        kind = f"transparent ({(alpha == 0).mean() * 100:.0f}% cut)"

    # If what survived the flood is itself a solid rectangle, this was a photo
    # sitting in a white margin, not a cut-out. Crop to it and restore full
    # opacity so no half-transparent 1px ring is left along the picture edge.
    solid = alpha >= 128
    ys, xs = np.where(solid)
    if len(ys):
        y0, y1, x0, x1 = ys.min(), ys.max() + 1, xs.min(), xs.max() + 1
        area = (y1 - y0) * (x1 - x0)
        if area > 40000 and solid[y0:y1, x0:x1].mean() >= 0.97:
            crop = crop[y0:y1, x0:x1]
            h, w, _ = crop.shape
            alpha = np.full((h, w), 255, np.uint8)
            kind = "photo (opaque, de-margined)"

    out = np.dstack([crop.astype(np.uint8), alpha])
    name = f"{i+1:02d}-{NAMES[i]}.png"
    Image.fromarray(out, "RGBA").save(os.path.join(OUT, name))
    report.append((name, f"{w}x{h}  {kind}"))

for n, s in report:
    print(f"  {n:<36} {s}")

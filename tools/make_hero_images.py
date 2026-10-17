# -*- coding: utf-8 -*-
"""Cut the hero slides and the event cards out of the supplied originals.

    python tools/make_hero_images.py

Two jobs, one script, because both read the same originals in
"assets/hero-images" and both have to agree about which photograph is which.

  BANDS    the wide hero slides. The hero grows from an inset band to the full
           viewport, so the useful ratio is not a fixed one: it has to survive
           being cropped to roughly 2.2:1 at rest and to the window's own ratio
           (about 1.5:1) once it has filled the screen. Cutting at 1.75:1
           leaves cover something to give at both ends.

  CARDS    3:4 portraits for the scrolling collage on the home page, cut from
           the same four rooms so the strip reads as events rather than as a
           supplier directory.

`focus` is the vertical centre of the crop as a fraction of image height, so a
composition can be held in frame rather than centre-cropped blindly. Every one
of these rooms is photographed with a lot of ceiling in it, so the focus sits
below the middle in each case: what matters is the tables, the floor and the
stage, not the chandelier.

The four originals are 1536x1024 and 1568x1003 with no watermarks, so the band
is a straight downward cut with no upscaling and no retouching.
"""
import os, sys

try:
    from PIL import Image, ImageFilter
except ImportError:
    sys.exit("Pillow is needed: python -m pip install pillow")

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
os.chdir(ROOT)
SRC = "assets/hero-images"
OUT = "assets/img"

BAND_RATIO = 1.75
BAND_WIDTH = 1500
CARD_RATIO = 0.75          # 3:4 portrait, matching .pcard
CARD_WIDTH = 760

#        source stem                                    out name        focus  what it is
BANDS = [
    ("Elegant Nigerian Green and Gold Banquet Hall",  "stage-banquet",   0.56, "green and gold banquet hall, laid for dinner"),
    ("Elegant Nigerian Wedding Reception Hall-2",     "stage-reception", 0.57, "wedding reception under colour, dance floor lit"),
    ("Luxurious Purple and Gold Wedding Hall-1",      "stage-hall",      0.60, "purple and gold wedding hall, tables dressed"),
    ("Corporate Summit 2026 Conference Hall",         "stage-summit",    0.54, "corporate summit, conference hall set"),
]
CARDS = [
    ("Elegant Nigerian Green and Gold Banquet Hall",  "ev-banquet",      0.54, "banquet hall, dressed"),
    ("Elegant Nigerian Wedding Reception Hall-2",     "ev-reception",    0.56, "the reception floor"),
    ("Luxurious Purple and Gold Wedding Hall-1",      "ev-hall",         0.58, "wedding hall, tables laid"),
    ("Corporate Summit 2026 Conference Hall",         "ev-summit",       0.52, "conference hall, set for a summit"),
]


def cut(src, name, focus, ratio, width, what):
    path = None
    for ext in (".png", ".jpg", ".jpeg"):
        if os.path.exists(os.path.join(SRC, src + ext)):
            path = os.path.join(SRC, src + ext)
            break
    if not path:
        sys.exit("no original for " + src)

    im = Image.open(path).convert("RGB")
    w, h = im.size

    ch = int(round(w / ratio))
    if ch > h:                                  # source too short: crop width
        ch, cw = h, int(round(h * ratio))
        x = (w - cw) // 2
        box = (x, 0, x + cw, h)
    else:
        y = max(0, min(h - ch, int(round(h * focus - ch / 2))))
        box = (0, y, w, y + ch)
    out = im.crop(box)

    target = (width, int(round(width / ratio)))
    if out.size[0] != width:
        up = out.size[0] < width
        out = out.resize(target, Image.LANCZOS)
        if up:
            # Upscaling leaves edges mushy. A light unsharp pass puts them back
            # without the halos a heavier one would give.
            out = out.filter(ImageFilter.UnsharpMask(radius=1.1, percent=62, threshold=3))

    dst = os.path.join(OUT, name + ".webp")
    out.save(dst, "WEBP", quality=82, method=6)
    print("  %-15s %-11s from %-11s %4dKB  %s"
          % (name, "%dx%d" % out.size, "%dx%d" % Image.open(path).size,
             os.path.getsize(dst) // 1024, what))


print("hero bands")
for a in BANDS:
    cut(a[0], a[1], a[2], BAND_RATIO, BAND_WIDTH, a[3])
print("collage cards")
for a in CARDS:
    cut(a[0], a[1], a[2], CARD_RATIO, CARD_WIDTH, a[3])

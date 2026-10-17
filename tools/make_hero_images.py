# -*- coding: utf-8 -*-
"""Cut the hero slides and the event cards out of the full-resolution originals.

    python tools/make_hero_images.py

Two jobs, one script, because both read the same originals in
"assets/website images" and both have to agree about which photograph is which.

  BANDS    the wide hero slides. The hero now grows from an inset band to the
           full viewport, so the useful ratio is no longer a fixed 1.9:1: it
           has to survive being cropped to roughly 2.2:1 at rest and to the
           window's own ratio (about 1.5:1) once it has filled the screen.
           Cutting at 1.75:1 leaves cover something to give at both ends.

  CARDS    3:4 portraits for the scrolling collage on the home page. These
           replace the supplier-ish photographs (catering, beauty,
           photography) with rooms and receptions, because the collage is
           meant to read as events rather than as a vendor directory.

`focus` is the vertical centre of the crop as a fraction of image height, so a
composition can be held in frame rather than centre-cropped blindly. `bottom`
trims a fraction off the foot of the source before anything else: the gold
ballroom carries the photographer's watermark across its lower middle, and the
only honest way to use the picture is not to ship that part of it.

The two hall photographs supplied for the hero are 1200x768 and 825x550, well
under the 2048px of the other originals. They are upscaled with LANCZOS and
given a light unsharp pass, which beats leaving the browser to stretch them,
but it cannot invent detail: at full-screen width they are softer than
stage-set. Higher-resolution copies would be a straight improvement.
"""
import os, sys

try:
    from PIL import Image, ImageFilter
except ImportError:
    sys.exit("Pillow is needed: python -m pip install pillow")

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
os.chdir(ROOT)
SRC = "assets/website images"
OUT = "assets/img"

BAND_RATIO = 1.75
BAND_WIDTH = 1800
CARD_RATIO = 0.75          # 3:4 portrait, matching .pcard
CARD_WIDTH = 760

#        src,            out name,       focus bottom  what it is
BANDS = [
    ("hall-gold",        "stage-gold",   0.42, 0.235, "white and gold ballroom, laid for dinner"),
    ("hall-floor",       "stage-floor",  0.52, 0.0,   "ballroom under colour, dance floor lit"),
    ("cat-venues",       "stage-set",    0.50, 0.0,   "ceremony set, Lagos skyline"),
]
CARDS = [
    ("hall-gold",        "ev-ballroom",  0.40, 0.235, "ballroom, dressed"),
    ("hall-floor",       "ev-floor",     0.52, 0.0,   "the dance floor"),
    ("cat-venues",       "ev-ceremony",  0.46, 0.0,   "ceremony set"),
]


def cut(src, name, focus, bottom, ratio, width, what):
    path = None
    for ext in (".jpeg", ".jpg", ".png"):
        if os.path.exists(os.path.join(SRC, src + ext)):
            path = os.path.join(SRC, src + ext)
            break
    if not path:
        sys.exit("no original for " + src)

    im = Image.open(path).convert("RGB")
    w, h = im.size
    if bottom:
        im = im.crop((0, 0, w, int(round(h * (1 - bottom)))))
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
            # Upscaling a small JPEG leaves it mushy. A light unsharp pass puts
            # the edges back without the halos a heavier one would give.
            out = out.filter(ImageFilter.UnsharpMask(radius=1.1, percent=62, threshold=3))

    dst = os.path.join(OUT, name + ".webp")
    out.save(dst, "WEBP", quality=80, method=6)
    print("  %-13s %-11s from %-14s %4dKB  %s"
          % (name, "%dx%d" % out.size, "%dx%d" % Image.open(path).size,
             os.path.getsize(dst) // 1024, what))


print("hero bands")
for a in BANDS:
    cut(a[0], a[1], a[2], a[3], BAND_RATIO, BAND_WIDTH, a[4])
print("collage cards")
for a in CARDS:
    cut(a[0], a[1], a[2], a[3], CARD_RATIO, CARD_WIDTH, a[4])

# -*- coding: utf-8 -*-
"""Cut the wide hero slides out of the full-resolution originals.

    python tools/make_hero_images.py

The shipped assets/img/*.webp are portrait or square crops made for the card
collage, far too narrow for a full-width hero band. The originals in
"assets/website images" are 1792-2048px on the long edge, so a landscape band
cut from those is still sharp at the 1720px container width.

`focus` is the vertical centre of the crop as a fraction of image height, so a
composition can be held in frame rather than centre-cropped blindly.
"""
import io, os, sys

try:
    from PIL import Image
except ImportError:
    sys.exit("Pillow is needed: python -m pip install pillow")

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
os.chdir(ROOT)
SRC = "assets/website images"
OUT = "assets/img"
RATIO = 1.90           # matches the reference band, and the .hero-shot box

SLIDES = [
    # src,                out name,        focus  what it is
    ("cat-venues",        "stage-set",     0.50, "ceremony set, Lagos skyline"),
    ("cat-entertainment", "stage-full",    0.46, "reception in full swing"),
    ("hero-venue",        "stage-detail",  0.46, "dressed table, skyline"),
]

for src, name, focus, what in SLIDES:
    p = os.path.join(SRC, src + ".jpeg")
    im = Image.open(p).convert("RGB")
    w, h = im.size
    ch = int(round(w / RATIO))
    if ch > h:                       # source too short: crop width instead
        ch = h
        cw = int(round(h * RATIO))
        x = (w - cw) // 2
        box = (x, 0, x + cw, h)
    else:
        y = int(round(h * focus - ch / 2))
        y = max(0, min(h - ch, y))
        box = (0, y, w, y + ch)
    out = im.crop(box)
    if out.size[0] > 2048:
        out = out.resize((2048, int(round(2048 / RATIO))), Image.LANCZOS)
    dst = os.path.join(OUT, name + ".webp")
    out.save(dst, "WEBP", quality=82, method=6)
    print("%-14s %-12s from %-20s %4dKB  %s"
          % (name, "%dx%d" % out.size, "%dx%d" % (w, h), os.path.getsize(dst) // 1024, what))

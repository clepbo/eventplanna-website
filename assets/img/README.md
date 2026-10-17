# assets/img

Every `.webp` in here is generated. The originals live one folder up in
`assets/hero-images`, and `tools/make_hero_images.py` cuts both the hero bands
and the collage cards out of them:

    python tools/make_hero_images.py

Filenames must match exactly, because each slot in the markup points at one by
name.

| File | Size | Slot |
|---|---|---|
| `stage-banquet.webp` | 1500 × 857 (1.75:1) | Home hero, slide 1 |
| `stage-reception.webp` | 1500 × 857 (1.75:1) | Home hero, slide 2 |
| `stage-hall.webp` | 1500 × 857 (1.75:1) | Home hero, slide 3 |
| `stage-summit.webp` | 1500 × 857 (1.75:1) | Home hero, slide 4 |
| `ev-banquet.webp` | 760 × 1013 (3:4) | "The work" collage, left column |
| `ev-reception.webp` | 760 × 1013 (3:4) | "The work" collage, right column |
| `ev-summit.webp` | 760 × 1013 (3:4) | "The work" collage, right column |
| `hero-venue.webp` | 3:4 | "The work" collage, left column |
| `hero-decor.webp` | 3:4 | "The work" collage, left column |
| `hero-entertainment.webp` | 3:4 | "The work" collage, right column |
| `door-client.webp` | 16:10 | "Planning an event" card |
| `door-planner.webp` | 16:10 | "Event planners" card |

`ev-hall.webp` is cut as well and is not placed anywhere: it is the fourth
room, kept so a collage slot can be swapped without re-running anything.

Nothing here is required. Each slot is a tinted tile with the photograph
layered over it as a CSS background image, so a file that is missing simply
leaves the tint showing — no broken-image icon, no layout shift.

The planner directory on `marketplace.html` deliberately has no photographs in
it. The profiles are invented, and putting a real reception behind an invented
name would read as that planner's portfolio, so each card carries a tinted
monogram instead.

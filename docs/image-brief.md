# Image brief

**The site currently ships with no photographs.** This is deliberate — see
`decisions.md`. The hero columns, the mosaic, the split card and the
testimonial portraits are all DOM. Nothing is broken and nothing is missing.

This brief exists for the day someone wants real photography, so the shoot is
specified rather than guessed at. On the original template build, a vague brief
("muted warm colour grade", "documentary photography") produced frames that
read as rural and informal for an audience of urban professionals, and the
whole set had to be regenerated. Don't repeat that.

## House style

Nigerian events, photographed as **work**, not as mood. The subject is people
doing a job competently: a caterer plating at speed, a planner with a clipboard
in a half-dressed hall, a photographer checking a back, a florist on a ladder.
Warm but not golden-hour; daylight or practical venue lighting, not flash.
Shallow-ish depth so the subject separates, but the venue stays legible behind
them — the venue *is* half the story.

Colour grade: neutral to slightly cool, so the indigo brand (`#5047e1`) does not
fight the frame. No heavy orange-teal. No film grain.

Framing: people roughly one third into the frame with room on the opposite side,
because several slots crop to portrait and the subject must not land dead
centre.

## Wardrobe and casting

Working professionals in Lagos, Abuja and Port Harcourt. Aso-ebi, agbada,
tailored Ankara and plain corporate dress all belong; so do branded vendor
polos and aprons. Mixed ages, visibly mixed roles — this is not a set of
founder portraits. Hands matter: they should be holding something real.

## Environments

Event halls mid-setup and mid-event, a marquee being raised, a catering prep
area, a florist's workroom, a photographer's studio, a venue exterior at dusk.
At least half the frames should be **before** the event, not during it, because
that is what the product is about.

## Negative prompt

> stock-photo handshake, generic open-plan office, laptops on a white desk,
> isolated subject on seamless background, orange-and-teal grade, lens flare,
> heavy bokeh, confetti explosion, champagne tower, drone wedding cliché,
> rural or informal setting, visible Western brand logos, AI-smooth skin,
> extra fingers, text or signage in frame

## The slots, if photography is added

Each one currently holds a DOM component. Replacing a component with a photo
means swapping the inner markup, not touching the layout.

| Slot | Current component | Count | Crop | Notes |
|---|---|---|---|---|
| Hero columns | `.vtile` inside `.pcard` | 6 unique | 3:4 portrait | They scroll vertically; they must read at ~330px wide |
| Split card | `.vtile` inside `.pcard` | 1 | 4:3 | The "Verified before listed" promise — a vendor with their work |
| Category mosaic | `.catile` | 6 | 1:1 square | One per category; must survive a 170px render |
| Home testimonials | `.tavatar` | 3 | 4:3 | One client, one planner, one vendor |
| Audience quote bands | `.quote.q-flat` | 3 | 16:9, wide | The scrim sits over the left third, so keep that side quiet |
| Inner-page heroes | `.ui-card` product mock-ups | 3 | — | **Leave these as DOM.** A screenshot of a dashboard goes stale and blurs; these do not |

## Delivery

WebP, cropped to the slot's aspect ratio, `loading="lazy"` on anything below
the fold.

```bash
ffmpeg -i in.jpg -vf "scale=W:H:force_original_aspect_ratio=increase,crop=W:H" -q:v 82 out.webp
```

Budget the whole set at well under 1MB. The template's original 17 images came
to 676KB total, and that is the bar.

**If images are added, re-run the overflow and screenshot checks.** Lazy images
change the page height after it has been measured, which is exactly what the
`ResizeObserver` in `app.js` is there to catch — but it is worth confirming the
footer still reaches its last band.

# Image prompts — copy, paste, generate

**This is the file to use.** Every prompt below is ready to paste into Midjourney,
DALL·E, Firefly, Imagen or a stock-photo search, with no editing needed.
`image-brief.md` next door is the art direction behind them — read it if you are
briefing a real photographer instead.

## How the slots work

Photos are **not** `<img>` tags. Each slot is a tinted tile with the photograph
layered over it as a CSS background image. That means:

- The site is finished right now, with no images. Missing files show the tint,
  never a broken-image icon, never a collapsed layout.
- To add an image, **drop the file into `assets/img/` with the exact filename
  below.** Nothing else to change. No markup edit, no CSS edit, no rebuild.
- To remove one, delete the file. The tint comes back.

> One thing to know if you ever wire a *new* slot by hand: in the markup the
> path is written `url(img/NAME.webp)`, not `url(assets/img/NAME.webp)`. A
> `url()` inside a CSS custom property resolves against the stylesheet that
> uses it, and that stylesheet lives in `assets/`. Writing the full path
> silently produces `assets/assets/img/NAME.webp` and the slot just keeps
> showing its tint. The five slots below are already wired correctly — this
> only matters if you add a sixth.

So you can generate these one at a time, over days, and the site never looks
half-finished.

---

## The shared style block

Append this to **every** prompt. It is what stops the set drifting apart.

```
STYLE: editorial event photography, contemporary Nigerian event industry,
natural daylight or warm practical venue lighting, neutral-to-slightly-cool
colour grade so deep indigo in the frame stays true, shot on a full-frame
camera at 35mm or 50mm, f/2.8, moderate depth of field with the environment
still legible behind the subject, candid and un-posed, people mid-task rather
than looking at camera, photorealistic, high detail, 8k
```

## The shared negative prompt

Append this too.

```
NEGATIVE: stock-photo handshake, generic open-plan office, laptop on a white
desk, isolated subject on a seamless studio background, orange-and-teal grade,
heavy lens flare, excessive bokeh, confetti explosion, champagne tower, drone
wedding cliché, rural or informal setting, visible Western brand logos, text,
signage, watermark, captions, AI-smooth plastic skin, extra fingers, deformed
hands, duplicated faces, low resolution, oversaturated
```

---

# Tier 1 — the one that matters most

## 1. `assets/img/hero-venue.webp` — **1600 × 2000 px, 4:5 portrait**

The single most important image on the site. It is the first thing anyone sees
and it has to say "event" in a quarter of a second. It is cropped **portrait**
on desktop and to a **centre landscape band** on phones, so keep the subject
roughly centred with headroom top and bottom.

```
A large reception hall in Lagos dressed for a wedding reception, photographed
from the back of the room at eye level before guests arrive. Long banquet
tables in crisp white linen running into the frame, tall floral centrepieces in
blush, cream and deep green, gold-rimmed charger plates and polished glassware
catching the light, gold chiavari chairs with sashes. A draped backdrop and a
sweetheart table at the far end, warm string lights and uplighting washing the
walls, a chandelier overhead. Late-afternoon daylight from high windows mixing
with the warm practical lights. Rich, elegant, unmistakably a Nigerian
celebration — opulent but not gaudy. Nobody in frame, or one decorator in the
far distance making a final adjustment. Vertical composition with headroom
above the chandelier and the nearest table edge at the bottom of the frame.
```

Then the STYLE and NEGATIVE blocks.

> **If you want a people-forward hero instead**, use this variant — same file,
> same crop:
>
> ```
> A Nigerian couple in traditional aso-ebi — the bride in a coral gele and
> beaded blouse, the groom in a cream agbada — standing together at the edge of
> their decorated reception hall just before guests are let in, laughing at
> something off-camera. Behind them, long banquet tables with tall floral
> centrepieces, gold chairs, a draped backdrop and warm uplighting, slightly
> soft but clearly readable. Vertical composition, the couple occupying the
> lower two thirds, decor and chandeliers filling the upper third.
> ```

---

# Tier 2 — the three audience cards (high value)

All three: **1600 × 1000 px, 16:10 landscape**. They sit side by side, so they
must look like one set — same light, same grade, same distance from the
subject. Generate them in one session.

## 2. `assets/img/door-client.webp`

```
A Nigerian couple in their early thirties sitting side by side at a dining
table at home on a weekday evening, planning their wedding. A tablet and a
notebook between them, the woman pointing at the screen, the man leaning in,
both genuinely absorbed rather than posed. Warm lamp light, a plant and a few
framed photos softly out of focus behind them. Relaxed clothes, not corporate.
Horizontal composition, the pair in the left two thirds with clean space to
the right.
```

## 3. `assets/img/door-planner.webp`

```
A Nigerian woman in her thirties, a professional event planner, standing in a
half-dressed reception hall mid-setup, directing her team. A clipboard or
tablet in one hand, the other gesturing toward a table, wearing a smart blazer
over an Ankara print top with a lanyard. Behind her, chairs still stacked,
linens going onto tables, a half-built floral arch, a ladder. Daylight through
tall windows. She is clearly running the room. Horizontal composition, subject
in the left two thirds, the unfinished room readable behind her.
```

## 4. `assets/img/door-vendor.webp`

```
A Nigerian caterer in a clean chef's jacket and apron plating food at speed on
a long prep table in an event venue's back-of-house, two colleagues working
further down the line slightly out of focus. Rows of plated small chops and
jollof rice, hands mid-motion with a spoon and tongs, steam rising. Practical
overhead lighting with daylight from a service door. Skilled, busy, proud of
the work. Horizontal composition, the subject's hands and plates sharp in the
left two thirds.
```

---

# Tier 3 — the verification promise

## 5. `assets/img/verified-vendor.webp` — **1200 × 1500 px, 4:5 portrait**

This one slides into frame on scroll between the words "Verified" and "Before
listed", so it should read as *a real business you could check up on*.

```
A Nigerian florist in her forties standing in her own workroom beside a tall
finished floral installation she has just built, arms relaxed, a quiet
half-smile, looking just past the camera. Behind her, buckets of stems, wire,
ribbon spools, a work bench with secateurs and offcuts — a real workshop, not
tidied for the photo. Daylight from a side window. She looks established and
accountable. Vertical composition, subject centred with the installation
filling the upper right.
```

---

# Tier 4 — optional, swap in later

The site looks finished without these. They are listed so you have the whole
set in one place.

## 6–8. Testimonial portraits — **1600 × 1200 px, 4:3**

These slots currently show initials on a coloured tile, which looks deliberate.
To use photographs instead, change each `<div class="tavatar t-blue">…</div>`
in `index.html` to `<div class="tphoto ph t-blue" style="--img:url(assets/img/t-client.webp)"></div>`.

**`t-client.webp`**
```
Head-and-shoulders portrait of a Nigerian man in his early thirties,
photographed outdoors in soft late-afternoon light against a softly blurred
urban Lagos background. Open collar, no tie, warm genuine expression, looking
slightly off camera. Approachable, not corporate.
```

**`t-planner.webp`**
```
Head-and-shoulders portrait of a Nigerian woman in her late thirties, an event
planner, photographed in a venue she is working in — a softly blurred dressed
hall behind her. Smart blazer over a patterned top, lanyard visible, confident
and warm, looking just off camera. Daylight.
```

**`t-vendor.webp`**
```
Head-and-shoulders portrait of a Nigerian man in his thirties, a wedding
photographer, standing in a venue with a camera on a strap around his neck, one
hand resting on it. Softly blurred event space behind him. Relaxed, working
clothes, quietly confident, looking just off camera.
```

## 9–14. Category tiles — **1200 × 1200 px, 1:1 square**

These currently show a tinted tile with an icon and a listing count, and they
work. To use photographs, add `ph` to each `<div class="pcard t-cream">` in the
mosaic and give it a `--img`, then add a dark scrim so the white label stays
readable — ask before doing this, it is the one change that needs CSS.

Each must read at about 170px wide, so shoot **tight**. One clear subject,
nothing fussy.

| File | Prompt |
|---|---|
| `cat-catering.webp` | `Overhead close-up of a Nigerian small-chops platter being finished — puff puff, peppered gizzard, spring rolls, suya skewers — on a dark slate board, a hand with tongs entering the frame. Warm practical light, tight square crop.` |
| `cat-photography.webp` | `A wedding photographer's hands holding a professional camera up to frame a shot, the decorated reception hall soft and glowing behind the lens. Tight square crop on the camera and hands.` |
| `cat-decor.webp` | `Close-up of a tall floral centrepiece in blush, cream and deep green on a white banquet table, candlelight and glassware softly out of focus behind it. Tight square crop.` |
| `cat-venues.webp` | `A grand empty event hall photographed head-on, gold chiavari chairs in neat rows, a draped backdrop, chandeliers lit, daylight from tall windows. Square crop, symmetrical.` |
| `cat-entertainment.webp` | `A DJ's hands on a mixer at a Nigerian reception, controller lit, warm stage light and a crowd glowing out of focus behind. Tight square crop on the hands and the deck.` |
| `cat-beauty.webp` | `A Nigerian makeup artist's hands applying finishing touches to a bride's face, the bride's beaded gele just in frame, soft window light. Tight square crop.` |

---

# After you generate them

Convert to WebP at the exact slot dimensions, then drop them into
`assets/img/`. Nothing else to do.

```bash
# hero — 4:5 portrait
ffmpeg -i hero-venue.png -vf "scale=1600:2000:force_original_aspect_ratio=increase,crop=1600:2000" -q:v 82 assets/img/hero-venue.webp

# the three audience cards — 16:10
for f in door-client door-planner door-vendor; do
  ffmpeg -i $f.png -vf "scale=1600:1000:force_original_aspect_ratio=increase,crop=1600:1000" -q:v 82 assets/img/$f.webp
done

# the verification card — 4:5
ffmpeg -i verified-vendor.png -vf "scale=1200:1500:force_original_aspect_ratio=increase,crop=1200:1500" -q:v 82 assets/img/verified-vendor.webp
```

No ffmpeg? Squoosh (squoosh.app) does the same job in a browser — set WebP,
quality 82, and crop to the dimensions in the table.

**Budget the whole set under 1MB.** Five images at roughly 120–180KB each is
the target. If one lands above 250KB, drop the quality to 75 before you reach
for a smaller resolution.

## Checklist before you commit them

- [ ] Filenames exactly as listed — the slots are hard-wired to them
- [ ] WebP, not PNG or JPEG
- [ ] Cropped to the stated ratio, not letterboxed
- [ ] The hero still reads when cropped to a centre landscape band (check it on
      a phone)
- [ ] Total added weight under 1MB
- [ ] No text, signage or watermarks baked into any frame

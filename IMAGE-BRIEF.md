# EventPlanna Website — Image Brief

Generate these and drop them into `eventplanna-web/assets/img/` using **exactly the filenames given**.
The site is built to work without them (it falls back to tinted gradient panels), so send them in any order.

## Global style rule — paste this into EVERY prompt

> Soft high-key studio product photography. Single subject, cleanly isolated,
> floating slightly with a soft diffused contact shadow beneath. Shot slightly
> above at a gentle three-quarter angle. Clean matte pastel background, no
> props, no text, no logos, no people unless specified. Premium editorial
> e-commerce look, crisp focus, subtle film grain. Square framing.

Keeping that paragraph on all of them is what makes the set look like one system
rather than seventeen stock photos.

---

## Priority 1 — the design doesn't read without these

### A. Headline chips (6 images · 800×800 · square)
These sit **inside the hero sentence** as small rounded tiles, ~90×70px on screen.
So: one object, centred, generous margin, instantly readable at thumbnail size.

| Filename | Prompt (append the global style rule) |
|---|---|
| `chip-cake.png` | A three-tier white wedding cake with delicate gold leaf detail and a few fresh white roses. Background: soft blush pink (#FCEEF5). |
| `chip-florals.png` | A lush floral centrepiece arrangement of white and deep burgundy blooms with eucalyptus, in a low ceramic vase. Background: soft mint (#EAF7F1). |
| `chip-camera.png` | A professional mirrorless camera with a short prime lens, matte black body. Background: soft lilac (#EEEDFB). |
| `chip-sound.png` | A compact matte-black studio speaker on a stand, three-quarter view. Background: pale blue (#EAF2FE). |
| `chip-glasses.png` | Two crystal champagne flutes, one slightly behind the other, catching warm light. Background: warm cream (#FDF6E7). |
| `chip-tent.png` | A miniature white marquee canopy with scalloped edge, architectural model style. Background: pale lavender-grey (#F1F2F7). |

### B. Service category cards (4 images · 1000×1250 · 4:5 portrait)
Larger, richer, more atmospheric than the chips. These fill the marketplace bento grid.

| Filename | Prompt |
|---|---|
| `cat-catering.png` | An elegant catering spread — small plated canapés on slate and ceramic, a carving board, warm golden hour light falling across a linen tablecloth. Shallow depth of field. Background: warm cream, softly blurred. |
| `cat-decor.png` | Luxurious event draping — sheer ivory fabric gathered in soft folds with warm uplighting behind it, and a cluster of white florals at the base. Background: blush pink. |
| `cat-photo.png` | A photographer's flat lay — mirrorless camera, two prime lenses, a lens cap and a leather strap, arranged on a matte surface, viewed from directly above. Background: soft lilac. |
| `cat-entertainment.png` | A DJ controller with illuminated jog wheels and a pair of over-ear headphones resting beside it, moody warm rim lighting. Background: deep indigo, softly blurred. |

### C. Hero texture (1 image · 2400×1400 · wide)
The scroll-transition background — the EventPlanna equivalent of the orange sofa in your reference.

| Filename | Prompt |
|---|---|
| `tex-drape.jpg` | Extreme close-up of luxurious indigo-violet satin fabric draped in deep soft folds, lit from the upper left so the folds catch highlights and fall into rich shadow. Abstract, no subject, fills the frame edge to edge. Colour centred on deep indigo #5047E1. Cinematic, high resolution, subtle sheen. **No style rule needed — this one is a full-bleed texture, not a product shot.** |

---

## Priority 2 — makes it feel real, but the site ships without them

### D. Vendor portraits (5 images · 800×800 · square)
For the marketplace vendor cards. **Nigerian professionals, Lagos/Abuja context** — this is the
single biggest thing that will make the marketplace feel like it's actually for your market.

| Filename | Prompt |
|---|---|
| `vendor-photographer.png` | Warm environmental portrait of a Nigerian man in his early 30s holding a camera, relaxed confident smile, wearing a smart casual dark shirt. Soft natural window light, shallow depth of field, neutral studio-grey background. Square crop, head and shoulders. |
| `vendor-caterer.png` | Warm environmental portrait of a Nigerian woman in her 40s in a chef's whites, arms lightly folded, warm assured expression. Soft natural light, neutral warm background. Square crop, head and shoulders. |
| `vendor-decorator.png` | Warm environmental portrait of a Nigerian woman in her late 20s in elegant modern workwear, holding a swatch of fabric, bright creative energy. Soft natural light, pale blush background. Square crop. |
| `vendor-dj.png` | Warm environmental portrait of a Nigerian man in his late 20s wearing headphones around his neck, stylish, relaxed half-smile. Moody warm lighting, dark neutral background. Square crop. |
| `vendor-mua.png` | Warm environmental portrait of a Nigerian woman in her 30s, makeup artist, holding a brush, polished and professional. Soft beauty lighting, pale lilac background. Square crop. |

### E. Mascot (1 image · 1200×1600 · transparent PNG)
Your reference uses a 3D character to warm up the dark section. Optional but it carries a lot of personality.

| Filename | Prompt |
|---|---|
| `mascot-planner.png` | 3D render of a friendly stylised character: a Nigerian woman event planner in her late 20s, wearing a deep indigo blazer, holding a tablet and a clipboard, confident welcoming pose, slight smile. Pixar-adjacent soft rounded style, smooth matte materials, soft studio lighting. **Transparent background, PNG with alpha.** Full body, facing slightly left. |

---

## What I do NOT need you to generate

- **Phone mockups** — built in CSS, pixel-sharp and themeable at any size.
- **The logo** — I have your SVGs (`Mode=Light/Dark, Type=Full/Icon`) and will inline them as vectors.
- **Icons** — drawn inline as SVG.
- **Charts / UI cards** — real HTML, not pictures of HTML.

## Notes

- **PNG** for anything isolated or needing transparency; **JPG** only for `tex-drape`.
- Don't pre-crop to circles or add rounded corners — the CSS handles masking.
- If a generator gives you a white background where I asked for pastel, send it anyway; I can key it out.

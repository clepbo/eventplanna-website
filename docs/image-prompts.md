# Image prompts

**Generated from `tools/image-prompts.json`. Do not hand-edit this file —
edit the JSON and run `python tools/generate-images.py --write-docs`.**
That JSON is also what the generator sends, so what you read here is
exactly what the model is asked for.

## Just generate them

```bash
pip install pillow
set GEMINI_API_KEY=your-key-here      # export GEMINI_API_KEY=... on mac/linux
python tools/generate-images.py
```

A key is free at <https://aistudio.google.com/apikey>. The script picks
whichever image model your key can reach, generates everything that is
missing, crops each result to its exact slot size and writes WebP into
`assets/img/`. Re-run it any time; it skips files that already exist
unless you pass `--force`.

## Or paste them by hand

Each prompt below is complete — subject, then the shared style, casting
and negative blocks. Copy the whole code block.

## How the slots work

Photos are not `<img>` tags. Each slot is a tinted tile with the
photograph layered over it as a CSS background image, so a file that is
not there yet shows the tint rather than a broken-image icon. Drop a
correctly-named file into `assets/img/` and it appears; delete it and the
tint comes back. The site is finished with none of them, and finishes
better as each one arrives.

> If you ever wire a *new* slot by hand, the path in the markup is
> `url(img/NAME.webp)`, not `url(assets/img/NAME.webp)`. A `url()` inside
> a CSS custom property resolves against the stylesheet that uses it, and
> that stylesheet lives in `assets/`.

---

# Tier 1 — the six hero cards

The hero is two columns scrolling in opposite directions, three
cards each. Generate all six together — they sit next to each
other and have to look like one set. A caption pill covers the
bottom ~12% of each card, so keep the subject in the upper two
thirds.

## `assets/img/hero-venue.webp` — 1200 × 1600 px (3:4)

*Hero, left column - captioned "Venue · Victoria Island"*

```
A rooftop event space in Eko Atlantic, Lagos, dressed for a wedding reception and photographed before guests arrive. Floor-to-ceiling glass on two sides with the city skyline beyond. One long communal table in bone linen running the depth of the frame, low sculptural floral runners in white orchid and deep green, bone china, smoked-glass stemware, matte black cutlery, slim transparent chairs. Linear pendant lighting overhead. No swags, no gold, no clutter. Cool late-afternoon daylight. Minimal, architectural, expensive. Nobody in frame. Vertical composition, skyline in the upper third and the nearest table edge sitting above the bottom eighth.

STYLE: contemporary editorial photography for a luxury events brand. Modern Lagos and Abuja. Architectural daylight with clean practical fill, cool-neutral colour grade with no warm or golden cast, restrained palette of ivory, bone, charcoal and deep green with occasional indigo. Shot on a full-frame camera at 35mm or 50mm, f/2.8. Crisp, high contrast, generous negative space, magazine-standard styling. Candid and working, not posed for the camera. Photorealistic, high detail.

CASTING: contemporary Lagos and Abuja, affluent and cosmopolitan. Predominantly Black Nigerian, styled as the professionals and guests they are: sharp modern tailoring, architectural gele and aso-ebi alongside contemporary eveningwear. Mixed-race couples and international guests belong in these frames, because Lagos is a destination-wedding city and the imagery should read that way. At ease, in command, well dressed. Never folkloric, never aid-brochure, never styled as 'traditional' for its own sake.

NEGATIVE: warm or golden colour grade, orange-and-teal, sepia, rustic or village setting, thatched or palm-frond decor, plastic chairs, dated hotel ballroom, gold-and-cream over-decoration, ceiling swags, balloon arch, confetti explosion, champagne tower, tribal-print cliche, poverty or charity framing, stock-photo handshake, generic open-plan office, seamless studio background, heavy bokeh, lens flare, visible brand logos, text, signage, watermark, AI-smooth plastic skin, extra fingers, deformed hands, duplicated faces, low resolution, oversaturated.
```

## `assets/img/hero-catering.webp` — 1200 × 1600 px (3:4)

*Hero, left column - captioned "Catering · Lagos"*

```
A Nigerian chef in a tailored black chef's jacket plating a modern course at a stainless pass in an event venue's back of house. A precise composition on bone china: jollof pressed into a clean quenelle, suya-spiced beef, herb oil, microgreens, placed with tweezers. A second chef works further down the pass, softly out of focus. Cool practical lighting, stainless and concrete surfaces, nothing cluttered. Fine dining, not catering trays. Vertical composition, hands and plate in the upper two thirds.

STYLE: contemporary editorial photography for a luxury events brand. Modern Lagos and Abuja. Architectural daylight with clean practical fill, cool-neutral colour grade with no warm or golden cast, restrained palette of ivory, bone, charcoal and deep green with occasional indigo. Shot on a full-frame camera at 35mm or 50mm, f/2.8. Crisp, high contrast, generous negative space, magazine-standard styling. Candid and working, not posed for the camera. Photorealistic, high detail.

CASTING: contemporary Lagos and Abuja, affluent and cosmopolitan. Predominantly Black Nigerian, styled as the professionals and guests they are: sharp modern tailoring, architectural gele and aso-ebi alongside contemporary eveningwear. Mixed-race couples and international guests belong in these frames, because Lagos is a destination-wedding city and the imagery should read that way. At ease, in command, well dressed. Never folkloric, never aid-brochure, never styled as 'traditional' for its own sake.

NEGATIVE: warm or golden colour grade, orange-and-teal, sepia, rustic or village setting, thatched or palm-frond decor, plastic chairs, dated hotel ballroom, gold-and-cream over-decoration, ceiling swags, balloon arch, confetti explosion, champagne tower, tribal-print cliche, poverty or charity framing, stock-photo handshake, generic open-plan office, seamless studio background, heavy bokeh, lens flare, visible brand logos, text, signage, watermark, AI-smooth plastic skin, extra fingers, deformed hands, duplicated faces, low resolution, oversaturated.
```

## `assets/img/hero-decor.webp` — 1200 × 1600 px (3:4)

*Hero, left column - captioned "Decor · Lekki"*

```
A Nigerian floral designer finishing a sculptural installation in a concrete-and-glass event space. The piece is an architectural suspended form in white orchid, anthurium and deep green foliage, more structure than bouquet. She stands on a low platform in tailored workwear, adjusting a single stem. The room is otherwise bare and bright, daylight flooding in from a wall of windows. Vertical composition, the installation filling the frame with the designer in the upper two thirds.

STYLE: contemporary editorial photography for a luxury events brand. Modern Lagos and Abuja. Architectural daylight with clean practical fill, cool-neutral colour grade with no warm or golden cast, restrained palette of ivory, bone, charcoal and deep green with occasional indigo. Shot on a full-frame camera at 35mm or 50mm, f/2.8. Crisp, high contrast, generous negative space, magazine-standard styling. Candid and working, not posed for the camera. Photorealistic, high detail.

CASTING: contemporary Lagos and Abuja, affluent and cosmopolitan. Predominantly Black Nigerian, styled as the professionals and guests they are: sharp modern tailoring, architectural gele and aso-ebi alongside contemporary eveningwear. Mixed-race couples and international guests belong in these frames, because Lagos is a destination-wedding city and the imagery should read that way. At ease, in command, well dressed. Never folkloric, never aid-brochure, never styled as 'traditional' for its own sake.

NEGATIVE: warm or golden colour grade, orange-and-teal, sepia, rustic or village setting, thatched or palm-frond decor, plastic chairs, dated hotel ballroom, gold-and-cream over-decoration, ceiling swags, balloon arch, confetti explosion, champagne tower, tribal-print cliche, poverty or charity framing, stock-photo handshake, generic open-plan office, seamless studio background, heavy bokeh, lens flare, visible brand logos, text, signage, watermark, AI-smooth plastic skin, extra fingers, deformed hands, duplicated faces, low resolution, oversaturated.
```

## `assets/img/hero-photography.webp` — 1200 × 1600 px (3:4)

*Hero, right column - captioned "Photography · Lagos"*

```
A Nigerian wedding photographer in sharp modern tailoring raising a professional camera to frame a shot inside a minimal concrete-and-glass venue, the dressed reception glowing softly out of focus behind him. Caught mid-work, not posed. Cool daylight, high contrast, clean lines. Vertical composition, photographer and camera in the upper two thirds.

STYLE: contemporary editorial photography for a luxury events brand. Modern Lagos and Abuja. Architectural daylight with clean practical fill, cool-neutral colour grade with no warm or golden cast, restrained palette of ivory, bone, charcoal and deep green with occasional indigo. Shot on a full-frame camera at 35mm or 50mm, f/2.8. Crisp, high contrast, generous negative space, magazine-standard styling. Candid and working, not posed for the camera. Photorealistic, high detail.

CASTING: contemporary Lagos and Abuja, affluent and cosmopolitan. Predominantly Black Nigerian, styled as the professionals and guests they are: sharp modern tailoring, architectural gele and aso-ebi alongside contemporary eveningwear. Mixed-race couples and international guests belong in these frames, because Lagos is a destination-wedding city and the imagery should read that way. At ease, in command, well dressed. Never folkloric, never aid-brochure, never styled as 'traditional' for its own sake.

NEGATIVE: warm or golden colour grade, orange-and-teal, sepia, rustic or village setting, thatched or palm-frond decor, plastic chairs, dated hotel ballroom, gold-and-cream over-decoration, ceiling swags, balloon arch, confetti explosion, champagne tower, tribal-print cliche, poverty or charity framing, stock-photo handshake, generic open-plan office, seamless studio background, heavy bokeh, lens flare, visible brand logos, text, signage, watermark, AI-smooth plastic skin, extra fingers, deformed hands, duplicated faces, low resolution, oversaturated.
```

## `assets/img/hero-entertainment.webp` — 1200 × 1600 px (3:4)

*Hero, right column - captioned "Entertainment · Ikeja"*

```
A DJ behind a lit controller at a contemporary Lagos reception, hands on the mixer, head slightly down. Cool blue and indigo wash from linear uplights, deep shadow, a crowd in cocktail attire and modern eveningwear glowing softly out of focus beyond. Club-standard production, not a hotel function band. Vertical composition, DJ and deck in the upper two thirds.

STYLE: contemporary editorial photography for a luxury events brand. Modern Lagos and Abuja. Architectural daylight with clean practical fill, cool-neutral colour grade with no warm or golden cast, restrained palette of ivory, bone, charcoal and deep green with occasional indigo. Shot on a full-frame camera at 35mm or 50mm, f/2.8. Crisp, high contrast, generous negative space, magazine-standard styling. Candid and working, not posed for the camera. Photorealistic, high detail.

CASTING: contemporary Lagos and Abuja, affluent and cosmopolitan. Predominantly Black Nigerian, styled as the professionals and guests they are: sharp modern tailoring, architectural gele and aso-ebi alongside contemporary eveningwear. Mixed-race couples and international guests belong in these frames, because Lagos is a destination-wedding city and the imagery should read that way. At ease, in command, well dressed. Never folkloric, never aid-brochure, never styled as 'traditional' for its own sake.

NEGATIVE: warm or golden colour grade, orange-and-teal, sepia, rustic or village setting, thatched or palm-frond decor, plastic chairs, dated hotel ballroom, gold-and-cream over-decoration, ceiling swags, balloon arch, confetti explosion, champagne tower, tribal-print cliche, poverty or charity framing, stock-photo handshake, generic open-plan office, seamless studio background, heavy bokeh, lens flare, visible brand logos, text, signage, watermark, AI-smooth plastic skin, extra fingers, deformed hands, duplicated faces, low resolution, oversaturated.
```

## `assets/img/hero-beauty.webp` — 1200 × 1600 px (3:4)

*Hero, right column - captioned "Makeup & hair · Abuja"*

```
A Nigerian makeup artist completing editorial bridal makeup. The bride wears a sculptural architectural gele in bone and ivory, skin luminous, the look clean and modern rather than heavy glamour. Soft north-facing window light, a minimal dressing area out of focus behind. Calm, precise, pre-ceremony. Vertical composition, both faces in the upper two thirds.

STYLE: contemporary editorial photography for a luxury events brand. Modern Lagos and Abuja. Architectural daylight with clean practical fill, cool-neutral colour grade with no warm or golden cast, restrained palette of ivory, bone, charcoal and deep green with occasional indigo. Shot on a full-frame camera at 35mm or 50mm, f/2.8. Crisp, high contrast, generous negative space, magazine-standard styling. Candid and working, not posed for the camera. Photorealistic, high detail.

CASTING: contemporary Lagos and Abuja, affluent and cosmopolitan. Predominantly Black Nigerian, styled as the professionals and guests they are: sharp modern tailoring, architectural gele and aso-ebi alongside contemporary eveningwear. Mixed-race couples and international guests belong in these frames, because Lagos is a destination-wedding city and the imagery should read that way. At ease, in command, well dressed. Never folkloric, never aid-brochure, never styled as 'traditional' for its own sake.

NEGATIVE: warm or golden colour grade, orange-and-teal, sepia, rustic or village setting, thatched or palm-frond decor, plastic chairs, dated hotel ballroom, gold-and-cream over-decoration, ceiling swags, balloon arch, confetti explosion, champagne tower, tribal-print cliche, poverty or charity framing, stock-photo handshake, generic open-plan office, seamless studio background, heavy bokeh, lens flare, visible brand logos, text, signage, watermark, AI-smooth plastic skin, extra fingers, deformed hands, duplicated faces, low resolution, oversaturated.
```

# Tier 2 — the three audience cards

## `assets/img/door-client.webp` — 1600 × 1000 px (16:10)

*"Planning an event" card*

```
A couple in their early thirties at a marble island in a contemporary high-rise apartment in Lagos, planning their wedding on a tablet between them. A Black Nigerian bride-to-be and her white fiance, both in smart-casual weekend clothes, one pointing at the screen and the other leaning in, genuinely absorbed rather than posed. Floor-to-ceiling glass behind them with the city beyond, cool daylight, minimal styling, a single sculptural vase on the counter. Horizontal composition, the pair in the left two thirds with clean space to the right.

STYLE: contemporary editorial photography for a luxury events brand. Modern Lagos and Abuja. Architectural daylight with clean practical fill, cool-neutral colour grade with no warm or golden cast, restrained palette of ivory, bone, charcoal and deep green with occasional indigo. Shot on a full-frame camera at 35mm or 50mm, f/2.8. Crisp, high contrast, generous negative space, magazine-standard styling. Candid and working, not posed for the camera. Photorealistic, high detail.

CASTING: contemporary Lagos and Abuja, affluent and cosmopolitan. Predominantly Black Nigerian, styled as the professionals and guests they are: sharp modern tailoring, architectural gele and aso-ebi alongside contemporary eveningwear. Mixed-race couples and international guests belong in these frames, because Lagos is a destination-wedding city and the imagery should read that way. At ease, in command, well dressed. Never folkloric, never aid-brochure, never styled as 'traditional' for its own sake.

NEGATIVE: warm or golden colour grade, orange-and-teal, sepia, rustic or village setting, thatched or palm-frond decor, plastic chairs, dated hotel ballroom, gold-and-cream over-decoration, ceiling swags, balloon arch, confetti explosion, champagne tower, tribal-print cliche, poverty or charity framing, stock-photo handshake, generic open-plan office, seamless studio background, heavy bokeh, lens flare, visible brand logos, text, signage, watermark, AI-smooth plastic skin, extra fingers, deformed hands, duplicated faces, low resolution, oversaturated.
```

## `assets/img/door-planner.webp` — 1600 × 1000 px (16:10)

*"Event planners" card*

```
A Nigerian woman in her thirties, an event planner, standing in a glass-walled venue mid-setup and directing her team. A tablet in one hand, the other gesturing toward a table, in sharp modern tailoring with a slim earpiece. Behind her the room is half-dressed: transparent chairs still stacked, bone linen going onto long tables, a sculptural floral form part-built, a lighting tech on a ladder. Cool daylight through full-height windows. She is unmistakably running the room. Horizontal composition, subject in the left two thirds.

STYLE: contemporary editorial photography for a luxury events brand. Modern Lagos and Abuja. Architectural daylight with clean practical fill, cool-neutral colour grade with no warm or golden cast, restrained palette of ivory, bone, charcoal and deep green with occasional indigo. Shot on a full-frame camera at 35mm or 50mm, f/2.8. Crisp, high contrast, generous negative space, magazine-standard styling. Candid and working, not posed for the camera. Photorealistic, high detail.

CASTING: contemporary Lagos and Abuja, affluent and cosmopolitan. Predominantly Black Nigerian, styled as the professionals and guests they are: sharp modern tailoring, architectural gele and aso-ebi alongside contemporary eveningwear. Mixed-race couples and international guests belong in these frames, because Lagos is a destination-wedding city and the imagery should read that way. At ease, in command, well dressed. Never folkloric, never aid-brochure, never styled as 'traditional' for its own sake.

NEGATIVE: warm or golden colour grade, orange-and-teal, sepia, rustic or village setting, thatched or palm-frond decor, plastic chairs, dated hotel ballroom, gold-and-cream over-decoration, ceiling swags, balloon arch, confetti explosion, champagne tower, tribal-print cliche, poverty or charity framing, stock-photo handshake, generic open-plan office, seamless studio background, heavy bokeh, lens flare, visible brand logos, text, signage, watermark, AI-smooth plastic skin, extra fingers, deformed hands, duplicated faces, low resolution, oversaturated.
```

## `assets/img/door-vendor.webp` — 1600 × 1000 px (16:10)

*"Vendors" card*

```
Two Nigerian vendors in clean modern workwear rigging linear lighting and a sound system in a bare concrete-and-glass event space before an evening reception. One is on a ladder adjusting a fixture, the other checks a tablet against the plan. Flight cases and crates staged neatly on the floor. Cool daylight, technical and precise, visibly competent. Horizontal composition, the pair in the left two thirds.

STYLE: contemporary editorial photography for a luxury events brand. Modern Lagos and Abuja. Architectural daylight with clean practical fill, cool-neutral colour grade with no warm or golden cast, restrained palette of ivory, bone, charcoal and deep green with occasional indigo. Shot on a full-frame camera at 35mm or 50mm, f/2.8. Crisp, high contrast, generous negative space, magazine-standard styling. Candid and working, not posed for the camera. Photorealistic, high detail.

CASTING: contemporary Lagos and Abuja, affluent and cosmopolitan. Predominantly Black Nigerian, styled as the professionals and guests they are: sharp modern tailoring, architectural gele and aso-ebi alongside contemporary eveningwear. Mixed-race couples and international guests belong in these frames, because Lagos is a destination-wedding city and the imagery should read that way. At ease, in command, well dressed. Never folkloric, never aid-brochure, never styled as 'traditional' for its own sake.

NEGATIVE: warm or golden colour grade, orange-and-teal, sepia, rustic or village setting, thatched or palm-frond decor, plastic chairs, dated hotel ballroom, gold-and-cream over-decoration, ceiling swags, balloon arch, confetti explosion, champagne tower, tribal-print cliche, poverty or charity framing, stock-photo handshake, generic open-plan office, seamless studio background, heavy bokeh, lens flare, visible brand logos, text, signage, watermark, AI-smooth plastic skin, extra fingers, deformed hands, duplicated faces, low resolution, oversaturated.
```

# Tier 3 — the verification card

## `assets/img/verified-vendor.webp` — 1200 × 1500 px (4:5)

*The "Verified / Before listed" card that slides open on scroll*

```
A Nigerian floral designer in her forties standing in her own studio beside a finished architectural installation, arms relaxed, a composed half-smile, looking just past the camera. Behind her a clean workbench, shears, wire, stems in steel buckets, mood boards pinned to a white wall. A working studio that is clearly a real, established business. Cool daylight from a side window, tailored workwear. Vertical composition, subject centred with the installation filling the upper right.

STYLE: contemporary editorial photography for a luxury events brand. Modern Lagos and Abuja. Architectural daylight with clean practical fill, cool-neutral colour grade with no warm or golden cast, restrained palette of ivory, bone, charcoal and deep green with occasional indigo. Shot on a full-frame camera at 35mm or 50mm, f/2.8. Crisp, high contrast, generous negative space, magazine-standard styling. Candid and working, not posed for the camera. Photorealistic, high detail.

CASTING: contemporary Lagos and Abuja, affluent and cosmopolitan. Predominantly Black Nigerian, styled as the professionals and guests they are: sharp modern tailoring, architectural gele and aso-ebi alongside contemporary eveningwear. Mixed-race couples and international guests belong in these frames, because Lagos is a destination-wedding city and the imagery should read that way. At ease, in command, well dressed. Never folkloric, never aid-brochure, never styled as 'traditional' for its own sake.

NEGATIVE: warm or golden colour grade, orange-and-teal, sepia, rustic or village setting, thatched or palm-frond decor, plastic chairs, dated hotel ballroom, gold-and-cream over-decoration, ceiling swags, balloon arch, confetti explosion, champagne tower, tribal-print cliche, poverty or charity framing, stock-photo handshake, generic open-plan office, seamless studio background, heavy bokeh, lens flare, visible brand logos, text, signage, watermark, AI-smooth plastic skin, extra fingers, deformed hands, duplicated faces, low resolution, oversaturated.
```

# Tier 4 — optional, the site is complete without these

The testimonial slots show initials on a tint today, which looks
deliberate. The category tiles show an icon and a count. Both
work as they are; these are here if you want photographs later.

## `assets/img/t-client.webp` — 1600 × 1200 px (4:3)

*Testimonial portrait (slot currently shows initials)*

```
Head-and-shoulders portrait of a Nigerian man in his early thirties, photographed outdoors in soft daylight against a softly blurred contemporary Lagos backdrop of glass and concrete. Open collar, no tie, warm genuine expression, looking slightly off camera. Approachable and well dressed.

STYLE: contemporary editorial photography for a luxury events brand. Modern Lagos and Abuja. Architectural daylight with clean practical fill, cool-neutral colour grade with no warm or golden cast, restrained palette of ivory, bone, charcoal and deep green with occasional indigo. Shot on a full-frame camera at 35mm or 50mm, f/2.8. Crisp, high contrast, generous negative space, magazine-standard styling. Candid and working, not posed for the camera. Photorealistic, high detail.

CASTING: contemporary Lagos and Abuja, affluent and cosmopolitan. Predominantly Black Nigerian, styled as the professionals and guests they are: sharp modern tailoring, architectural gele and aso-ebi alongside contemporary eveningwear. Mixed-race couples and international guests belong in these frames, because Lagos is a destination-wedding city and the imagery should read that way. At ease, in command, well dressed. Never folkloric, never aid-brochure, never styled as 'traditional' for its own sake.

NEGATIVE: warm or golden colour grade, orange-and-teal, sepia, rustic or village setting, thatched or palm-frond decor, plastic chairs, dated hotel ballroom, gold-and-cream over-decoration, ceiling swags, balloon arch, confetti explosion, champagne tower, tribal-print cliche, poverty or charity framing, stock-photo handshake, generic open-plan office, seamless studio background, heavy bokeh, lens flare, visible brand logos, text, signage, watermark, AI-smooth plastic skin, extra fingers, deformed hands, duplicated faces, low resolution, oversaturated.
```

## `assets/img/t-planner.webp` — 1600 × 1200 px (4:3)

*Testimonial portrait (slot currently shows initials)*

```
Head-and-shoulders portrait of a Nigerian woman in her late thirties, an event planner, photographed in a glass-walled venue she is working in, the dressed room softly blurred behind her. Sharp modern tailoring, slim earpiece, confident and warm, looking just off camera. Cool daylight.

STYLE: contemporary editorial photography for a luxury events brand. Modern Lagos and Abuja. Architectural daylight with clean practical fill, cool-neutral colour grade with no warm or golden cast, restrained palette of ivory, bone, charcoal and deep green with occasional indigo. Shot on a full-frame camera at 35mm or 50mm, f/2.8. Crisp, high contrast, generous negative space, magazine-standard styling. Candid and working, not posed for the camera. Photorealistic, high detail.

CASTING: contemporary Lagos and Abuja, affluent and cosmopolitan. Predominantly Black Nigerian, styled as the professionals and guests they are: sharp modern tailoring, architectural gele and aso-ebi alongside contemporary eveningwear. Mixed-race couples and international guests belong in these frames, because Lagos is a destination-wedding city and the imagery should read that way. At ease, in command, well dressed. Never folkloric, never aid-brochure, never styled as 'traditional' for its own sake.

NEGATIVE: warm or golden colour grade, orange-and-teal, sepia, rustic or village setting, thatched or palm-frond decor, plastic chairs, dated hotel ballroom, gold-and-cream over-decoration, ceiling swags, balloon arch, confetti explosion, champagne tower, tribal-print cliche, poverty or charity framing, stock-photo handshake, generic open-plan office, seamless studio background, heavy bokeh, lens flare, visible brand logos, text, signage, watermark, AI-smooth plastic skin, extra fingers, deformed hands, duplicated faces, low resolution, oversaturated.
```

## `assets/img/t-vendor.webp` — 1600 × 1200 px (4:3)

*Testimonial portrait (slot currently shows initials)*

```
Head-and-shoulders portrait of a Nigerian man in his thirties, a wedding photographer, standing in a minimal modern venue with a professional camera on a strap, one hand resting on it. Softly blurred event space behind. Modern workwear, quietly confident, looking just off camera.

STYLE: contemporary editorial photography for a luxury events brand. Modern Lagos and Abuja. Architectural daylight with clean practical fill, cool-neutral colour grade with no warm or golden cast, restrained palette of ivory, bone, charcoal and deep green with occasional indigo. Shot on a full-frame camera at 35mm or 50mm, f/2.8. Crisp, high contrast, generous negative space, magazine-standard styling. Candid and working, not posed for the camera. Photorealistic, high detail.

CASTING: contemporary Lagos and Abuja, affluent and cosmopolitan. Predominantly Black Nigerian, styled as the professionals and guests they are: sharp modern tailoring, architectural gele and aso-ebi alongside contemporary eveningwear. Mixed-race couples and international guests belong in these frames, because Lagos is a destination-wedding city and the imagery should read that way. At ease, in command, well dressed. Never folkloric, never aid-brochure, never styled as 'traditional' for its own sake.

NEGATIVE: warm or golden colour grade, orange-and-teal, sepia, rustic or village setting, thatched or palm-frond decor, plastic chairs, dated hotel ballroom, gold-and-cream over-decoration, ceiling swags, balloon arch, confetti explosion, champagne tower, tribal-print cliche, poverty or charity framing, stock-photo handshake, generic open-plan office, seamless studio background, heavy bokeh, lens flare, visible brand logos, text, signage, watermark, AI-smooth plastic skin, extra fingers, deformed hands, duplicated faces, low resolution, oversaturated.
```

## `assets/img/cat-catering.webp` — 1200 × 1200 px (1:1)

*Category tile (optional - needs a CSS scrim, see the doc)*

```
Overhead close-up of a modern Nigerian canape course being finished on a dark slate board - suya-spiced skewers, miniature puff puff, herb oil - a hand entering frame with tweezers. Cool practical light, tight square crop, fine dining register.

STYLE: contemporary editorial photography for a luxury events brand. Modern Lagos and Abuja. Architectural daylight with clean practical fill, cool-neutral colour grade with no warm or golden cast, restrained palette of ivory, bone, charcoal and deep green with occasional indigo. Shot on a full-frame camera at 35mm or 50mm, f/2.8. Crisp, high contrast, generous negative space, magazine-standard styling. Candid and working, not posed for the camera. Photorealistic, high detail.

CASTING: contemporary Lagos and Abuja, affluent and cosmopolitan. Predominantly Black Nigerian, styled as the professionals and guests they are: sharp modern tailoring, architectural gele and aso-ebi alongside contemporary eveningwear. Mixed-race couples and international guests belong in these frames, because Lagos is a destination-wedding city and the imagery should read that way. At ease, in command, well dressed. Never folkloric, never aid-brochure, never styled as 'traditional' for its own sake.

NEGATIVE: warm or golden colour grade, orange-and-teal, sepia, rustic or village setting, thatched or palm-frond decor, plastic chairs, dated hotel ballroom, gold-and-cream over-decoration, ceiling swags, balloon arch, confetti explosion, champagne tower, tribal-print cliche, poverty or charity framing, stock-photo handshake, generic open-plan office, seamless studio background, heavy bokeh, lens flare, visible brand logos, text, signage, watermark, AI-smooth plastic skin, extra fingers, deformed hands, duplicated faces, low resolution, oversaturated.
```

## `assets/img/cat-photography.webp` — 1200 × 1200 px (1:1)

*Category tile (optional - needs a CSS scrim, see the doc)*

```
A photographer's hands holding a professional camera up to frame a shot, a minimal glass-walled reception soft and bright behind the lens. Tight square crop on the camera and hands, cool grade.

STYLE: contemporary editorial photography for a luxury events brand. Modern Lagos and Abuja. Architectural daylight with clean practical fill, cool-neutral colour grade with no warm or golden cast, restrained palette of ivory, bone, charcoal and deep green with occasional indigo. Shot on a full-frame camera at 35mm or 50mm, f/2.8. Crisp, high contrast, generous negative space, magazine-standard styling. Candid and working, not posed for the camera. Photorealistic, high detail.

CASTING: contemporary Lagos and Abuja, affluent and cosmopolitan. Predominantly Black Nigerian, styled as the professionals and guests they are: sharp modern tailoring, architectural gele and aso-ebi alongside contemporary eveningwear. Mixed-race couples and international guests belong in these frames, because Lagos is a destination-wedding city and the imagery should read that way. At ease, in command, well dressed. Never folkloric, never aid-brochure, never styled as 'traditional' for its own sake.

NEGATIVE: warm or golden colour grade, orange-and-teal, sepia, rustic or village setting, thatched or palm-frond decor, plastic chairs, dated hotel ballroom, gold-and-cream over-decoration, ceiling swags, balloon arch, confetti explosion, champagne tower, tribal-print cliche, poverty or charity framing, stock-photo handshake, generic open-plan office, seamless studio background, heavy bokeh, lens flare, visible brand logos, text, signage, watermark, AI-smooth plastic skin, extra fingers, deformed hands, duplicated faces, low resolution, oversaturated.
```

## `assets/img/cat-decor.webp` — 1200 × 1200 px (1:1)

*Category tile (optional - needs a CSS scrim, see the doc)*

```
Close-up of a low sculptural floral runner in white orchid and deep green on a bone linen table, smoked-glass stemware and matte black cutlery softly out of focus behind. Tight square crop, architectural and restrained.

STYLE: contemporary editorial photography for a luxury events brand. Modern Lagos and Abuja. Architectural daylight with clean practical fill, cool-neutral colour grade with no warm or golden cast, restrained palette of ivory, bone, charcoal and deep green with occasional indigo. Shot on a full-frame camera at 35mm or 50mm, f/2.8. Crisp, high contrast, generous negative space, magazine-standard styling. Candid and working, not posed for the camera. Photorealistic, high detail.

CASTING: contemporary Lagos and Abuja, affluent and cosmopolitan. Predominantly Black Nigerian, styled as the professionals and guests they are: sharp modern tailoring, architectural gele and aso-ebi alongside contemporary eveningwear. Mixed-race couples and international guests belong in these frames, because Lagos is a destination-wedding city and the imagery should read that way. At ease, in command, well dressed. Never folkloric, never aid-brochure, never styled as 'traditional' for its own sake.

NEGATIVE: warm or golden colour grade, orange-and-teal, sepia, rustic or village setting, thatched or palm-frond decor, plastic chairs, dated hotel ballroom, gold-and-cream over-decoration, ceiling swags, balloon arch, confetti explosion, champagne tower, tribal-print cliche, poverty or charity framing, stock-photo handshake, generic open-plan office, seamless studio background, heavy bokeh, lens flare, visible brand logos, text, signage, watermark, AI-smooth plastic skin, extra fingers, deformed hands, duplicated faces, low resolution, oversaturated.
```

## `assets/img/cat-venues.webp` — 1200 × 1200 px (1:1)

*Category tile (optional - needs a CSS scrim, see the doc)*

```
A modern empty event hall photographed head-on - full-height glass, polished concrete, linear pendant lighting, transparent chairs in neat rows, Lagos skyline beyond. Square crop, symmetrical, cool daylight.

STYLE: contemporary editorial photography for a luxury events brand. Modern Lagos and Abuja. Architectural daylight with clean practical fill, cool-neutral colour grade with no warm or golden cast, restrained palette of ivory, bone, charcoal and deep green with occasional indigo. Shot on a full-frame camera at 35mm or 50mm, f/2.8. Crisp, high contrast, generous negative space, magazine-standard styling. Candid and working, not posed for the camera. Photorealistic, high detail.

CASTING: contemporary Lagos and Abuja, affluent and cosmopolitan. Predominantly Black Nigerian, styled as the professionals and guests they are: sharp modern tailoring, architectural gele and aso-ebi alongside contemporary eveningwear. Mixed-race couples and international guests belong in these frames, because Lagos is a destination-wedding city and the imagery should read that way. At ease, in command, well dressed. Never folkloric, never aid-brochure, never styled as 'traditional' for its own sake.

NEGATIVE: warm or golden colour grade, orange-and-teal, sepia, rustic or village setting, thatched or palm-frond decor, plastic chairs, dated hotel ballroom, gold-and-cream over-decoration, ceiling swags, balloon arch, confetti explosion, champagne tower, tribal-print cliche, poverty or charity framing, stock-photo handshake, generic open-plan office, seamless studio background, heavy bokeh, lens flare, visible brand logos, text, signage, watermark, AI-smooth plastic skin, extra fingers, deformed hands, duplicated faces, low resolution, oversaturated.
```

## `assets/img/cat-entertainment.webp` — 1200 × 1200 px (1:1)

*Category tile (optional - needs a CSS scrim, see the doc)*

```
A DJ's hands on a lit controller at a contemporary reception, indigo and blue wash, a crowd glowing out of focus behind. Tight square crop on the hands and the deck.

STYLE: contemporary editorial photography for a luxury events brand. Modern Lagos and Abuja. Architectural daylight with clean practical fill, cool-neutral colour grade with no warm or golden cast, restrained palette of ivory, bone, charcoal and deep green with occasional indigo. Shot on a full-frame camera at 35mm or 50mm, f/2.8. Crisp, high contrast, generous negative space, magazine-standard styling. Candid and working, not posed for the camera. Photorealistic, high detail.

CASTING: contemporary Lagos and Abuja, affluent and cosmopolitan. Predominantly Black Nigerian, styled as the professionals and guests they are: sharp modern tailoring, architectural gele and aso-ebi alongside contemporary eveningwear. Mixed-race couples and international guests belong in these frames, because Lagos is a destination-wedding city and the imagery should read that way. At ease, in command, well dressed. Never folkloric, never aid-brochure, never styled as 'traditional' for its own sake.

NEGATIVE: warm or golden colour grade, orange-and-teal, sepia, rustic or village setting, thatched or palm-frond decor, plastic chairs, dated hotel ballroom, gold-and-cream over-decoration, ceiling swags, balloon arch, confetti explosion, champagne tower, tribal-print cliche, poverty or charity framing, stock-photo handshake, generic open-plan office, seamless studio background, heavy bokeh, lens flare, visible brand logos, text, signage, watermark, AI-smooth plastic skin, extra fingers, deformed hands, duplicated faces, low resolution, oversaturated.
```

## `assets/img/cat-beauty.webp` — 1200 × 1200 px (1:1)

*Category tile (optional - needs a CSS scrim, see the doc)*

```
A makeup artist's hands applying a finishing touch to a bride's face, a sculptural bone-coloured gele just in frame, soft window light, clean modern beauty. Tight square crop.

STYLE: contemporary editorial photography for a luxury events brand. Modern Lagos and Abuja. Architectural daylight with clean practical fill, cool-neutral colour grade with no warm or golden cast, restrained palette of ivory, bone, charcoal and deep green with occasional indigo. Shot on a full-frame camera at 35mm or 50mm, f/2.8. Crisp, high contrast, generous negative space, magazine-standard styling. Candid and working, not posed for the camera. Photorealistic, high detail.

CASTING: contemporary Lagos and Abuja, affluent and cosmopolitan. Predominantly Black Nigerian, styled as the professionals and guests they are: sharp modern tailoring, architectural gele and aso-ebi alongside contemporary eveningwear. Mixed-race couples and international guests belong in these frames, because Lagos is a destination-wedding city and the imagery should read that way. At ease, in command, well dressed. Never folkloric, never aid-brochure, never styled as 'traditional' for its own sake.

NEGATIVE: warm or golden colour grade, orange-and-teal, sepia, rustic or village setting, thatched or palm-frond decor, plastic chairs, dated hotel ballroom, gold-and-cream over-decoration, ceiling swags, balloon arch, confetti explosion, champagne tower, tribal-print cliche, poverty or charity framing, stock-photo handshake, generic open-plan office, seamless studio background, heavy bokeh, lens flare, visible brand logos, text, signage, watermark, AI-smooth plastic skin, extra fingers, deformed hands, duplicated faces, low resolution, oversaturated.
```

---

## Checklist before you commit them

- [ ] Filenames exactly as above — the slots are wired to them
- [ ] WebP, cropped to the stated ratio (the script does both)
- [ ] The hero six read as one set: same light, same grade, same distance
- [ ] No text, signage or watermark baked into any frame
- [ ] Total added weight under 1MB for the ten wired slots
- [ ] Nobody in a frame is presented as a specific named customer

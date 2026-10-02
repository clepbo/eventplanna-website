# Prompt — build a landing site for a new brand on this template

Copy everything below the line into a fresh session, fill in the bracketed parts, and give the
agent the repo. The second half (constraints, traps, verification) matters more than the first —
it encodes failures that cost real time on the original build.

---

## The brief

Build a marketing site for **[BRAND NAME]** using the ElevatedHere template at
`https://github.com/clepbo/ElevatedHere` as the starting point. Clone it, strip the ElevatedHere
content, and rebuild it for this brand. Keep the architecture; replace the substance.

### What the brand is

- **Name and one-line positioning:** [e.g. "Kora — payroll for African remote teams"]
- **What it actually does:** [3–5 sentences. Be concrete about the mechanism, not the benefit.]
- **Who it is for, in priority order:** [primary audience first — this decides what the hero says]
- **How it makes money:** [subscription / per-seat / transaction fee / marketplace take]
- **Proof you can stand behind:** [real numbers, or say explicitly that there are none yet]
- **Source of truth:** [attach the PRD, brand guide, or Figma file. If there isn't one, say so —
  then make assumptions explicit in the README rather than inventing quietly.]

### Pages

Home, plus one page per audience, plus pricing and FAQ. Adjust to the brand; the template ships
with six and the shared nav/footer assumes that shape.

### Design system

Replace the tokens in `assets/styles.css` `:root`. That block is the entire visual identity —
nothing else hardcodes a colour.

```
--green / --green-700 / --green-100 / --green-300 / --green-900   brand ramp (rename if you like)
--ink --grey --border --tile --white                              neutrals
--amber --red --blue --purple (+ -bg pairs)                       status only, never decoration
--c1..--c6, --c-neutral                                           categorical chart series
--max --page --gut                                                width system (read the rules below)
--r --r-lg --r-xl --shadow --shadow-lg --ease --ease-out          shape and motion
```

Typography is **one typeface** (currently Inter, loaded from Google Fonts in each `<head>`). If the
brand has a display face, use it for `h1/h2` only and keep one face for everything else. Do not
introduce a third.

Swap `assets/logo-dark.png` and `assets/logo-light.png`. **Check the light mark actually is light** —
on the original build the "light" logo was a coloured mark with white text, so it vanished on the
dark footer and needed `filter:brightness(0) invert(1)`.

---

## Hard constraints

**No build step, no dependencies, no framework.** Plain HTML, one stylesheet pair, one JS file. It
has to open from the filesystem and deploy to GitHub Pages from the repo root. Keep it that way.

**Do not rewrite `assets/app.js` unless the brief needs new behaviour.** It is a small motion engine
with non-obvious parts: a frame-rate-independent scroll lerp, scrubbed reveals, a manual anchor
handler, and a ResizeObserver that keeps the page height honest. Each of those exists because
something broke. Read the comments before changing anything.

**Keep the width system.** `--page: min(100% - clamp(24px,3.4vw,96px), var(--max))` with
`--max:1720px`. The nav pill and every section share it, so content lines up edge to edge at every
viewport. Do not reintroduce a fixed `max-width` on a section — that was the original bug and it
makes the page look stranded above 1400px.

**Every link must go somewhere.** No `href="#"`. If a destination does not exist, delete the link
rather than leaving a dead one. The original had 67.

---

## What you get in the box

### Motion engine hooks (`assets/app.js`)

| Hook | Effect |
|---|---|
| `.reveal` | fades and rises, scrubbed to scroll position, reverses on the way back up |
| `.stagger` | same, but children trail each other by 9% of the window |
| `.brow` | reveal with a horizontal offset, for offset benefit rows |
| `.split` `.cluster` `.chartbox` | also in the scrubbed set |
| `data-count="₦8.24M"` | counts up from the element's own text on entry, resets on exit |
| `data-words` + `data-green="a\|b\|c"` | word-by-word highlight tied to scroll position |
| `data-carousel` | cross-fade + scale carousel over `.ttrack` / `.tslide`, auto-advancing |
| `.faq-item` + `<button class="faq-q">` + `.faq-a` | accordion, height animated, remeasures on resize |
| `.line > span` | masked line rise for `h1`, fires once on `.ready` |
| `.fade-up` + `.d1`–`.d4` | staggered entrance delays for hero sub, buttons, tags |
| `?mdebug` | exposes `window.__motion.jump(y)` so you can place the scroll for verification |

There is no loading screen, deliberately. A full-screen intro competes with image decode on exactly
the frames it needs to be smooth. The hero carries the entrance instead. **Do not add a preloader.**

### Layout and component classes

`styles.css` — home-page sections: `.shell` `.wrap` `.section` `.duo/.duo-wide/.duo-36` `.hero*`
`.statement` `.ticker` `.split` `.brow` `.cluster` `.orbit` `.funnel` `.tcar` `.plans` `.mosaic`
`.foot-*` `.btn/.btn-dark/.btn-light/.btn-green/.btn-sm` `.tag` `.chip` `.eyebrow` `.mark` `.hl`
`.shead` `.muted` `.ticks`

`components.css` — inner pages: `.phero/.phero-grid` `.cards` + `.card/.card-photo/.card-link`
`.dim-grid` `.dim-7` `.pay-grid` `.cap-grid` `.role-grid` `.split-2` `.feature` `.dark` `.tier`
`.tiers` `.plans-3` `.plan` `.steps/.step` `.stats/.stat` `.quote` `.faq` `.tbl-wrap` `.cta`
`.note` `.icon-chip` `.ui-card/.ui-head/.ui-title/.ui-sub` `.kpi-row/.kpi` `.prow` `.delta`

Grid helpers collapse at: `.cards` 920 · `.dim-grid/.pay-grid` 1180 → 620 · `.cap-grid` 980 → 620 ·
`.role-grid` 1240 → 860 → 560 · `.duo` 860.

`.ui-card`, `.kpi`, `.prow`, `.delta` build fake product screenshots out of real DOM. Use them
instead of pasting an image of a dashboard — they stay sharp, respond to the width system, and can
be edited later.

---

## Traps that cost time on the original build

1. **Headless Chrome cannot scroll.** `window.scrollTo` is a no-op. Verify scroll-dependent
   behaviour by driving the engine (`?mdebug` → `__motion.jump(y)`) and reading computed styles, or
   by injecting a settled-state stylesheet before screenshotting:
   ```html
   <style>*{transition:none!important;animation:none!important}
   .js-scrub,.brow,.reveal,.stagger>*{opacity:1!important;transform:none!important}</style>
   <script>document.documentElement.classList.add("ready");</script>
   ```
2. **The headless animation clock stalls** if a CSS transition starts late in the page lifecycle.
   You will get half-rendered screenshots that look like catastrophic bugs and are not. Confirm
   against computed styles before believing a screenshot.
3. **Pre-reveal transforms look like overflow.** Elements waiting to animate sit translated off
   their final position, so a naive `getBoundingClientRect().right > clientWidth` scan reports
   dozens of false positives. Settle the reveals first, and exclude `.ticker-track` (an intentional
   marquee) and `.tbl-wrap` (an intentionally scrollable table).
4. **Headless lays out wider than the window you asked for** — roughly +70px. A 420px window
   produces a 500px layout written into a 420px PNG, so the right edge looks clipped when it is
   fine. Always read `document.documentElement.clientWidth`, never trust the PNG width.
5. **Smooth scroll breaks anchor links.** Content lives in a `position:fixed`, transformed wrapper,
   so the browser has no document offset to scroll to and every `#section` link lands somewhere
   arbitrary. `app.js` intercepts them and drives `scrollTo` manually. If you restructure the DOM,
   keep `.nav`, `.progress` and anything `position:fixed` **outside** the wrapper.
6. **Lazy images change the page height after it is measured**, which leaves the footer short of its
   last band. A ResizeObserver re-measures. Keep it.
7. **Inline `style="display:grid;grid-template-columns:..."` cannot be overridden by a media query**
   and will not collapse on mobile. Use `.duo` or a class.
8. **`components.css` loads after `styles.css`**, so at equal specificity it wins. Put grid
   overrides for `.cards`-family classes in `components.css`, not `styles.css`.
9. **Masked line-rise headlines (`.line > span`) orphan trailing punctuation.** An em dash at the
   end of a line wraps alone onto the next. End lines on words.
10. **Non-greedy regex over HTML will eat the wrong closing tag.** Deleting a wrapper by pattern
    leaves orphaned `</div>`s and silently destroys the layout. Count `<div>` vs `</div>` after
    every structural edit.

---

## Content rules

- **Write for the primary audience in the hero.** The original was built hero-first for the buyer
  and had to be rewritten once the PRD showed the buyer was the *tertiary* user. Settle who the page
  is for before writing a word.
- **Use the product's own vocabulary, from the source of truth.** Not a near-synonym you prefer.
- **Cut hedging and throat-clearing.** "Switch between who is being served and who is delivering"
  became "People / Providers".
- **Reconcile every number across the site.** If the headline says 78%, the chart must divide to
  78%. Conflicting figures were a repeated defect.
- **Label invented content as invented** — in the README at minimum, on the page if it could mislead
  a customer.
- **Charts:** load the `dataviz` skill before writing any chart code. One series → one colour;
  ordered stages → a validated ordinal ramp; never a rainbow for magnitude. Run the palette
  validator rather than eyeballing contrast.

---

## Images

Write an image brief rather than guessing — `docs/image-brief.md` is the working example. Specify
the house style, wardrobe, environment and an explicit **negative prompt**. On the original, asking
for "muted warm colour grade" and "documentary photography" produced frames that read as rural and
informal for an audience of urban professionals, and the whole set had to be regenerated.

Deliver as WebP, cropped to the slot's aspect ratio:
`ffmpeg -i in.jpg -vf "scale=W:H:force_original_aspect_ratio=increase,crop=W:H" -q:v 82 out.webp`
The original set is 17 images at 676KB total. Add `loading="lazy"` below the fold.

---

## Definition of done

Run all of these and paste the results. Do not report success without them.

- [ ] **Dead links:** zero. Script it — every `href` resolved against the file system and the set of
      `id`s on that page.
- [ ] **Markup balance:** `<div>` count equals `</div>` count on every page.
- [ ] **Orphaned classes:** every class used in HTML has a rule in one of the two stylesheets.
- [ ] **Overflow:** `scrollWidth === clientWidth` at 400 / 900 / 1400 / 1900 / 2500 on every page,
      with reveals settled and the two intentional scrollers excluded.
- [ ] **Alignment:** nav content and section content share the same left and right edges at 1400.
- [ ] **JS:** `node --check assets/app.js`, and no `window.onerror` in a loaded page.
- [ ] **Visual:** screenshot hero, one mid-page section and the footer at desktop and phone, and
      actually look at them.
- [ ] **Terminology:** grep for the old brand's vocabulary and confirm zero hits.

Then commit, push, and confirm GitHub Pages is serving the new commit — Pages lags a few minutes and
will keep serving the previous build, so check the deployed file, not just the push.

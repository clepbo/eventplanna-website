# EventPlanna — marketing site

The marketing site for **EventPlanna**, a Nigerian marketplace and workspace for
events: clients find planners, planners find vendors, and budgets, bookings,
tasks and payments live in one place both sides can see.

Six pages, no build step, no dependencies, no framework. Open `index.html` from
the filesystem and it works; push the repo and GitHub Pages serves it from the
root.

```
index.html        home — the marketplace, and the two doors into it
clients.html      people planning an event
planners.html     event planners
vendors.html      vendors and suppliers
pricing.html      credit packs and what a credit buys
faq.html          questions, grouped by who is asking
assets/styles.css home-page sections, the token block, the width system
assets/components.css inner-page components, loaded after styles.css
assets/app.js     the motion engine — read its comments before changing it
tools/            image generator + the prompt manifest it sends
docs/             generated image prompts, design system, decisions, page inventory
assets/img/       photographs go here (optional — see docs/image-prompts.md)
```

## Running it

There is nothing to install and nothing to build.

```bash
# just open it
start index.html          # Windows
open index.html           # macOS

# or serve it, if you want clean URLs while editing
python -m http.server 8000
```

## Architecture, in one paragraph

Every colour in the site comes from the `:root` block at the top of
`assets/styles.css`. Nothing else hardcodes a brand colour, so re-theming is one
block. Width is owned by `--page: min(100% - clamp(24px,3.4vw,96px), var(--max))`
with `--max:1720px`; the nav pill and every section share it, which is why
content lines up edge to edge at every viewport. Do not put a fixed `max-width`
on a section — that breaks the alignment above 1400px.

`assets/app.js` is a small scroll engine: a frame-rate-independent lerp, reveals
scrubbed to scroll position rather than toggled, a manual anchor handler (needed
because the content sits in a fixed, transformed wrapper), and a ResizeObserver
that keeps the page height honest. All of it is disabled under
`prefers-reduced-motion`, which is also how the verification scripts settle the
page before measuring it.

## Photographs

**You do not have to paste prompts one at a time.** There is a generator:

```bash
pip install pillow
set GEMINI_API_KEY=your-key        # export GEMINI_API_KEY=... on mac/linux
python tools/generate-images.py
```

A key is free at <https://aistudio.google.com/apikey>. It discovers whichever
image models your key can reach (names change often, so nothing is hardcoded)
and keeps the rest as a fallback queue — the free tier counts its daily image
allowance *per model*, so when one runs dry the script moves to the next rather
than stopping. If they are all spent it says so, with the time the quota
resets; re-running later picks up exactly where it stopped. It
generates every slot that is still missing, crops each result to its exact size
and writes WebP straight into `assets/img/`. Re-run it any time — it skips
files that already exist unless you pass `--force`. `--only hero` does just the
six hero cards; `--dry-run` prints the prompts and sends nothing.

Prompts live in `tools/image-prompts.json`, and `docs/image-prompts.md` is
**generated from it** (`--write-docs`), so what you read and what gets sent
cannot drift apart. Paste them by hand from the docs page if you prefer.

The site has ten photo slots and **ships working with none of them filled**.
A slot is a tinted tile with the photograph layered over it as a CSS background
image, never an `<img>`: a missing file leaves the tint showing rather than a
broken-image icon and a collapsed layout. Drop a correctly-named file into
`assets/img/` and it appears; delete it and the tint comes back. So the images
can arrive one at a time and the page is never half-finished.

| Slot | File | Size |
|---|---|---|
| Hero, six scrolling cards | `hero-venue` `hero-catering` `hero-decor` `hero-photography` `hero-entertainment` `hero-beauty` `.webp` | 1200 × 1600 (3:4) |
| "Planning an event" card | `door-client.webp` | 1600 × 1000 (16:10) |
| "Event planners" card | `door-planner.webp` | 1600 × 1000 (16:10) |
| "Vendors" card | `door-vendor.webp` | 1600 × 1000 (16:10) |
| "Verified / Before listed" | `verified-vendor.webp` | 1200 × 1500 (4:5) |

The hero is two columns scrolling in opposite directions; `app.js` duplicates
each column's contents at runtime so the loop joins without a jump, which is
why the markup holds three cards per column rather than six.

Everything else is still DOM — the category mosaic, the testimonial portraits,
the orbit and all the product mock-ups (`.catile`, `.tavatar`, `.ui-card`).
Those read better as components than as stock imagery, stay sharp at any width,
and restyle with the tokens. The same prompts work as a brief for a real
photographer — the style, casting and negative blocks are the art direction.

## What on this site is real, and what is invented

Everything below is stated plainly because some of it would mislead a customer
if it were taken as measured fact.

**Real — from the product:**

- Credit costs: create an event 5, booking request 5, team invite 2, export 1
- 200 free credits on signup; credits never expire
- Credit packs: ₦10,000 / 500 · ₦45,000 / 3,000 · ₦90,000 / 7,000 · ₦180,000 / 15,000
- Booking states: Pending, Accepted, Declined, Confirmed, Completed, Cancelled
- Verification: government ID, business registration (CAC), proof of address
- Platform totals: 2,400+ verified vendors, 18,000+ events, ₦2.3B+ paid to
  vendors, 4.8 average rating, 12 cities
- Team roles: manager, coordinator, assistant

**Invented, and labelled as such:**

- **The booking funnel on the home page** (1,000 → 880 → 740 → 620 → 580, 62%).
  Illustrative, not measured. The page says so directly, under the chart.
- **All three testimonials**, on the home page and one per audience page.
  Composed from user interviews, not attributed to a named customer. Each one
  carries that note in its attribution line.
- **Per-category vendor counts** (548 catering, 462 photography, 391 decor,
  344 venues, 352 entertainment, 268 makeup & hair, 95 logistics). These are a
  plausible split that sums to 2,460 against the real "2,400+" headline, not a
  figure pulled from the database. The vendors page labels them as listings.
- **Every product mock-up** — the budget card, the pipeline, the brief, the
  payout panel. Named vendors inside them ("Eko Ballroom", "Royal Feast",
  "LensArt", "Bloom Decor") are illustrative and the cards say so.
- **The derived pricing figures** — per-credit rates (₦20.00 / ₦15.00 / ₦12.86 /
  ₦12.00), the "≈ events" column, and the 31-credit worked example — are
  arithmetic on the real pack prices and the real credit costs, not separate
  claims. They reconcile: 31 credits × ₦20.00 = ₦620, × ₦15.00 = ₦465,
  × ₦12.857 = ₦399, and 200 ÷ 31 = 6.45, hence "six times over".
- **Tier feature splits** on pricing (unlimited team members, priority
  placement, custom branding, shared balance, per-planner reporting, named
  support). A reasonable packaging, not a confirmed roadmap.

Replace any of these with measured figures before a launch that quotes numbers.

## Verification

The site was checked, not eyeballed. Scripts live outside the repo (they are
throwaway), but the checks were:

- **Dead links** — every `href` on every page resolved against the filesystem
  and the set of `id`s on the target page. 159 links, 0 dead, no `href="#"`.
- **Markup balance** — `<div>`, `<section>`, `<ul>`, `<table>` and `<figure>`
  open/close counts match on all six pages.
- **Orphaned classes** — every class used in HTML has a rule in one of the two
  stylesheets. 0 orphans.
- **Overflow** — `scrollWidth === clientWidth` at 400 / 900 / 1400 / 1900 /
  2500 on all six pages, plus a per-element scan that skips anything inside an
  x-clipping or x-scrolling ancestor, with `.ticker-track`, `.tbl-wrap` and
  `.foot-mark` excluded by name as well.
- **Alignment** — nav pill and section content share both edges at 1400
  (24 … 1376 on every page).
- **JS** — `node --check assets/app.js` passes; no `window.onerror` or
  unhandled rejection on any page after scrolling it end to end, opening an
  accordion, advancing the carousel and toggling the mobile nav.
- **Headline wrapping** — each `.line > span` in the home `h1` was measured with
  a Range at ten viewport widths from 360px to 2500px, and stays on one visual
  line at all of them. Masked line-rise headlines orphan anything that wraps.
- **Visual** — every page screenshotted in full, slice by slice, at 1400px and
  the home page again at 400px, and actually looked at.

A caveat worth keeping: headless Chrome lays out roughly 70px wider than the
window flag you pass it, so always read `document.documentElement.clientWidth`
rather than trusting a PNG's width, and set the viewport with
`Emulation.setDeviceMetricsOverride`.

## Credits

Built on the ElevatedHere marketing template
(<https://github.com/clepbo/ElevatedHere>). The architecture — width system,
motion engine, component layer — is carried over; the content, the brand ramp,
the imagery strategy and the page set are EventPlanna's.
`docs/new-brand-prompt.md` is that template's own reusable brief and is kept
here unchanged, as the record of what this build was asked to do.

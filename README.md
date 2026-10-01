# EventPlanna — website

Marketing site redesign built around the new **EventPlanna Marketplace**: a two-sided
marketplace where clients find planners, planners find vendors, and the whole event
is then run in the same workspace.

Static HTML/CSS/JS. No build step, no framework, no bundler — open `index.html` and it works.

## Pages

| File | What it is |
|---|---|
| `index.html` | Landing page. The full scroll-driven treatment. |
| `marketplace.html` | Browse planners and vendors. Live filtering by side + category. |
| `pricing.html` | Credit packs, what each action costs, FAQ accordion. |
| `vendors.html` | The supply-side pitch. Dark-led, distinct from the rest. |
| `about.html` | Story, principles, numbers. |

## Running locally

Any static server. From this folder:

```bash
python -m http.server 8000
# then open http://localhost:8000
```

Opening `index.html` directly with `file://` also works.

## Deploying (Vercel)

This site lives on the `website` branch of `clepbo/eventplanna_frontend`, separate from
the Next.js app on `dev`. GitHub Pages is not an option here — Pages is disabled on a
private fork, which inherits the parent repo's settings. Vercel has no such restriction.

**One-time import**

1. vercel.com/new -> Import `clepbo/eventplanna_frontend`
2. **Production Branch: `website`** (Settings -> Git). This is the important one.
3. Framework Preset: **Other**. Root Directory: `./`
4. Deploy.

`vercel.json` already pins this as a static site with no build and no install step, so
Vercel will not try to build it as the Next.js app that lives on `dev`.

After that, every push to `website` redeploys automatically.

**Or from the CLI**

```bash
npx vercel login      # one-time, opens a browser
npx vercel --prod     # from this folder
```

## Images

13 image slots are referenced but not yet committed — see **`IMAGE-BRIEF.md`** for the
prompts and exact filenames. Drop them into `assets/img/`.

Until they exist the site degrades deliberately: every art-directed `<img>` carries
`data-fallback`, so a missing file hides itself and the CSS gradient tint behind it shows
through. Nothing renders as a broken-image icon, and the layout does not shift.

## Design system

Tokens in `assets/css/site.css` are the product's real values, carried over from the app build:

| Token | Value | Use |
|---|---|---|
| `--brand` | `#5047E1` | Primary |
| `--gold` | `#FFC62B` | Supply-side accent, highlights |
| `--ink` | `#14163A` | Dark sections |
| `--cream` | `#F6F4FB` | Light ground |
| `--ok` / `--warn` / `--bad` | `#47B881` / `#FFC62B` / `#EB6F70` | **Status only — never decoration** |
| `--t-*` | lilac / blush / mint / blue / cream / grey | Category tints, never status |

Type: **Plus Jakarta Sans** for display, **Inter** for body — Inter being the app's real UI face,
so the site and product stay related.

Logo SVGs in `assets/logo/` are the official files, light and dark variants.

## Motion

GSAP + ScrollTrigger from cdnjs, orchestrated in `assets/js/site.js`:

- **Hero** — staggered line reveal, chips pop in on a back-ease, then scatter outward and fade as the hero leaves.
- **Background morph** — `body` background tweens between grounds as each band enters (`data-morph`).
- **Word-by-word reveal** — `.reveal-text` is split into spans and lit progressively, scrubbed to scroll.
- **Phone stage** — the CSS phone scales up while four `.orbit` cards fly in from the edges.
- **Sticky split** — pinned heading beside a scrolling column of benefit cards.
- **Counters, marquee, FAQ accordion, marketplace filters.**

Every one of these degrades. If GSAP fails to load the page is still fully readable and
operable, and `prefers-reduced-motion` disables motion throughout.

The phone mockup is pure CSS, not an image — it stays sharp at any size and restyles with the tokens.

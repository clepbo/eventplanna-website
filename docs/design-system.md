# Design system

Everything visual on this site comes from the `:root` block at the top of
`assets/styles.css`. Nothing else hardcodes a brand colour. If you change that
block, the whole site follows.

## Colour

The token names keep the template's `--green-*` shape so nothing downstream had
to be renamed; the values are EventPlanna's.

| Token | Hex | Use |
|---|---|---|
| `--green` | `#5047e1` | Primary actions, highlights, active nav, the primary chart series |
| `--green-700` | `#3f37c9` | Hover and pressed states, the darkest funnel stage |
| `--green-300` | `#a49ff0` | Ticks on dark surfaces, the lightest brand tint in use |
| `--green-100` | `#eeedfb` | `.mark` highlight, `.tag.on`, `.delta.up`, `.cost` badge |
| `--green-900` | `#14163a` | Footer, `.dark` bands, `.cta`, `.plan.featured` |
| `--ink` | `#1f2937` | Headings and values |
| `--grey` | `#6b7280` | Body copy, labels, helper text |
| `--border` | `#e2e8f0` | Card and table borders |
| `--tile` | `#f7f8f8` | Page background, alternating section bands |
| `--white` | `#ffffff` | Cards, the shell |

**Status colours — status only.** Never decoration, never a chart series.

| State | Background | Foreground |
|---|---|---|
| Caution | `--amber-bg` `#fff6df` | `--amber` `#b98900` |
| Negative | `--red-bg` `#fdeded` | `--red` `#c2454a` |
| Informational | `--blue-bg` `#eaf2fe` | `--blue` `#1d4ed8` |
| Neutral accent | `--purple-bg` `#f2eefc` | `--purple` `#6d28d9` |

**Categorical chart series** — distinct hues, none reused from the status set:
`--c1 #5047e1`, `--c2 #8b85ea`, `--c3 #3b82f6`, `--c4 #0f9d6e`, `--c5 #c2478e`,
`--c6 #d97b3c`. Neutral remainder `--c-neutral #c9ccd6`.

The booking funnel is an **ordered** sequence, not a categorical one, so it uses
a single-hue ramp from `#c7c3f5` to `#3f37c9` rather than six different colours.
Magnitude never gets a rainbow.

**Category tints** (`.t-lilac`, `.t-blush`, `.t-mint`, `.t-blue`, `.t-cream`,
`.t-grey`) are decorative gradients for the marketplace tiles. They are the one
place colour is used to distinguish categories, and they carry no meaning
beyond that.

## Type

**Inter only**, 400/500/600/700, loaded from Google Fonts in each `<head>`.
There is no display face and no second family. If a display face is ever added
it goes on `h1`/`h2` and nowhere else.

| Role | Size |
|---|---|
| Hero `h1` | `clamp(36px, 4.9vw, 86px)` |
| `.big` statement | `clamp(30px, 4.6vw, 78px)` |
| Section `h2` (`.shead h2`) | `clamp(28px, 3.7vw, 60px)` |
| Inner-page `h1` | `clamp(34px, 5.4vw, 66px)` |
| Body | `clamp(16px, .95vw, 18px)` |
| Card body | `14.5px` |
| Labels, `.ui-sub` | `10–12px` |

## Width

```css
--max : 1720px;
--page: min(100% - clamp(24px,3.4vw,96px), var(--max));
```

The nav pill and every section share `--page`, which is what makes content line
up edge to edge at every viewport. **Do not put a fixed `max-width` on a
section** — that strands the page above 1400px and was the original template's
one real layout bug.

Verified: at 1400px the wrap, the nav and the first section all run `24 … 1376`
on all six pages.

## Shape and motion

`--r 12px` · `--r-lg 22px` · `--r-xl 30px` ·
`--ease cubic-bezier(.22,1,.36,1)` · `--ease-out cubic-bezier(.16,1,.3,1)`.

Motion hooks live in `assets/app.js`: `.reveal`, `.stagger`, `.brow`,
`data-count`, `data-words` + `data-green`, `data-carousel`, `.faq-item`,
`.line > span`, `.fade-up` + `.d1`–`.d4`. All of them are inert under
`prefers-reduced-motion`, which is how the page is settled for verification.

## Components added for EventPlanna

The template assumed 14 photographs. These replace them with DOM:

| Class | What it is |
|---|---|
| `.vtile` | A vendor listing card — tinted thumbnail, verified badge, name, category, price, rating. Fills a `.pcard` in the hero columns and the split card. |
| `.catile` | A category tile for the footer mosaic — icon chip, category, listing count. |
| `.tavatar` | A testimonial portrait built from initials on a category tint. |
| `.quote.q-flat` | The quote band without a photograph: the dark surface is the band, and the template's scrim becomes a brand glow. |
| `.cost` | The credit-cost badge used on the pay-grid cards and in copy. |
| `.rail` | The booking-state rail — six pills, with `done` / `now` / `off` states. |

`.ui-card`, `.kpi`, `.prow` and `.delta` come from the template and build the
product mock-ups out of real DOM for the same reasons.

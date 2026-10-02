# Page inventory

Six pages. Every section, what it is built from, and which figures it carries —
so a number can be changed everywhere it appears rather than in one place.

## index.html — home

Cut back from 15 sections and 20 cards to 10 sections and 6 cards. What
remains either moves on its own or earns its height.

| # | Section | Built from | Carries |
|---|---|---|---|
| 1 | Hero | `.hero-shot` photo slot + two `.hfloat` chips, both animated | ₦1,600,000 · 53% · 2,400+ · 200 free credits |
| 2 | Mission statement | `.statement` + `data-words` scroll highlight | — |
| 3 | Category ticker | `.ticker-track` marquee | six categories |
| 4 | Stat strip | `.stats`, 4 `.stat` with `data-count` | 2,400+ · 18,000+ · ₦2.3B+ · 12 |
| 5 | How it works | `.steps`, 3 `.step` | — |
| 6 | Three ways in | `.cards`, 3 linked cards with photo slots | — |
| 7 | Verified / Before listed | `.big` + `.split` photo slot, slides open on scroll | ID · CAC · address |
| 8 | Every vendor, one workspace | `.duo` + `.orbit` with counter-rotating `.sat` rings | — |
| 9 | Trusted By People | `.tcar` carousel, 3 `.tslide` + `.tavatar` | — |
| 10 | CTA + mosaic | `.duo-36` + `.mosaic` of `.catile` | 548 / 462 / 391 / 344 / 352 / 268 |

**Cut in the declutter pass**, and where the content went: the 7-card category
grid (the ticker, the orbit and the mosaic all still name the categories); the
4-card credits grid (pricing.html, and the CTA still says 200 free credits);
the 6-card workspace grid (planners.html carries it); the four `.brow` benefit
rows (folded into the three door cards and the verified split); the booking
funnel (it was the site's largest invented figure, so cutting it was free); and
the 2-card pricing teaser (the orbit section now links straight to pricing).

Page height at 1400px went from 11,371px to 7,354px.

## clients.html — planning an event

| # | Section | Built from | Carries |
|---|---|---|---|
| 1 | Hero | `.phero-grid` + `.ui-card` event summary | ₦1,600,000 · ₦752,000 left · 71 days |
| 2 | Statement | `.statement` + `data-words` | — |
| 3 | Four steps | `.steps`, 4 `.step` | create = 5 credits, 200 free |
| 4 | Budget that reconciles | `.feature` + `.ui-card` | 31/28/16/14/11% split, 88% alert |
| 5 | Six booking states | `.feature.flip` + `.rail` + `.ui-card` | 3 confirmed · 1 awaiting |
| 6 | Free vs credits | `.dark` + `.split-2` tiers | 5 · 5 · 2 · 1 · 200 free |
| 7 | The network | `.stats`, 4 `.stat` | 2,400+ · 18,000+ · 4.8 · 12 |
| 8 | Quote | `.quote.q-flat` | — |
| 9 | CTA | `.cta` | 200 free credits |

## planners.html — for event planners

| # | Section | Built from | Carries |
|---|---|---|---|
| 1 | Hero | `.phero-grid` + `.ui-card` portfolio | ₦24.6M under management · 1,840 credits |
| 2 | Statement | `.statement` + `data-words` | — |
| 3 | Six workspace capabilities | `.cards.cap-grid` | invite = 2 credits |
| 4 | Sourcing | `.feature` + `.ui-card` | 3 of 548 available · ₦7,800–₦9,400 vs ₦8,500 |
| 5 | Briefs worth reading | `.feature.flip` + `.ui-card` | 18 of 240 matched · 11 quoted · 6 won |
| 6 | Three team roles | `.cards`, 3 cards | — |
| 7 | Client portal | `.dark` + `.split-2` tiers | export = 1 credit |
| 8 | Pricing, briefly | `.cards.pay-grid` + `.cost` | 5 · 5 · 2 · 1 · ₦10,000/500 |
| 9 | Quote | `.quote.q-flat` | 40 events |
| 10 | CTA | `.cta` | 200 credits ≈ 40 events |

## vendors.html — for vendors

| # | Section | Built from | Carries |
|---|---|---|---|
| 1 | Hero | `.phero-grid` + `.ui-card` vendor profile | ₦6.4M this quarter · 54% win rate |
| 2 | Statement | `.statement` + `data-words` | — |
| 3 | Four steps | `.steps` | listing is free |
| 4 | A brief, not an enquiry | `.feature` + `.ui-card` + `.rail` | 12 Dec · 400 guests · ₦3.4M |
| 5 | Getting paid | `.feature.flip` + `.ui-card` | ₦6.4M released · ₦1.9M held |
| 6 | Three verification checks | `.dark` + `.tiers`, 3 tiers | ID · CAC · address |
| 7 | Where you would sit | `.cards.dim-7` + `.stats` | the 7 counts summing to 2,460 · ₦2.3B+ · 4.8 |
| 8 | Quote | `.quote.q-flat` | 4 → 14 bookings |
| 9 | CTA | `.cta` | — |

## pricing.html

| # | Section | Built from | Carries |
|---|---|---|---|
| 1 | Three packs | `.plans-3`, middle `.featured` | ₦10,000/500 · ₦45,000/3,000 · ₦90,000/7,000 |
| 2 | What a credit buys | `.cards.pay-grid` + `.cost` | 5 · 5 · 2 · 1 |
| 3 | Worked example | `.split-2` + `.rail` + `.kpi-row` | 31 credits · ₦620 / ₦465 / ₦399 |
| 4 | Vendors do not buy credits | `.split-2` | — |
| 5 | Every pack, side by side | `.tbl-wrap` table | all five rows, per-credit, ≈ events |
| 6 | Capability comparison | `.tbl-wrap` table | tier splits |
| 7 | CTA | `.cta` | 200 free ≈ 40 events |

## faq.html

Four groups of accordions: clients (7), planners (7), vendors (7, on a `.dark`
band), and credits/payments/data (6). 27 questions, plus a closing `.cta`.

## Figures that appear on more than one page

Change these together.

| Figure | Where |
|---|---|
| 5 / 5 / 2 / 1 credit costs | index, clients, planners, pricing, faq |
| 200 free credits ≈ 40 events | index, clients, planners, pricing, faq |
| ₦10,000 / 500 credits | index, planners, pricing |
| ₦45,000 / 3,000 credits | index, pricing |
| 2,400+ verified vendors | index, clients, vendors |
| 18,000+ events · 4.8 rating | clients, vendors |
| 12 cities | index footer, clients, faq, every footer |
| Category counts (548 / 462 / 391 / 344 / 352 / 268 / 95) | index ×2, vendors |
| 31-credit worked example | pricing, faq |

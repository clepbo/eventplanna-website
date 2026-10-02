# Decision log

Decisions made while rebuilding this site for EventPlanna on the ElevatedHere
template, with the reasoning, so they can be argued with rather than
rediscovered.

## The page set

**Six pages: home, three audiences, pricing, FAQ.** The marketplace has three
genuinely different readers — someone planning their own event, a professional
planner, and a vendor — and they want opposite things from the same product.
One page each beats one page trying to serve all three.

**The home page is written for the client, with two doors.** The hero speaks to
the person planning an event, because that is who arrives cold; planners and
vendors arrive knowing what they came for and are one click away in the nav and
in the hero's second button. Settling this before writing a word is the single
decision that shaped the rest of the copy.

**`beneficiaries` → `clients`, `providers` → `planners`,
`partner-organisations` → `vendors`.** Renamed rather than redirected, since
nothing links to the old URLs yet.

## Content

**No invented mechanics where real ones exist.** Credit costs, pack prices,
booking states, the three verification checks, the team roles and the platform
totals are all the product's own. Where something had to be invented — the
funnel, the testimonials, the per-category counts, the tier feature splits — it
is listed in the README and labelled on the page itself.

**An earlier draft claimed vendors are paid "on a fortnightly cycle".** That was
a fabricated operational detail, and it was cut. The page now says funds are
released once delivery is confirmed, which is what escrow against a booking
actually implies.

**Per-category vendor counts were made to reconcile.** The first pass summed to
2,702 against a "2,400+" headline on the same page. They now sum to 2,460.
Conflicting numbers across a site were the original build's most repeated
defect, so every figure here divides.

**Testimonials carry their own disclaimer in the attribution line**, not just in
the README. A quote with a full name and a company reads as a reference
customer; these are composed from interviews, and the page says so where a
reader will see it.

## Imagery

**The site ships with zero photographs.** The template was built around 14
images. Buying or generating 14 on-brand Nigerian event photographs was the
long pole, and the alternative is better anyway: a marketplace is more
convincing shown as *listings* than as stock imagery. So the hero columns are
vendor cards, the mosaic is category tiles, the split card is the verification
promise, and the testimonial portraits are initials on a category tint. They
stay sharp at any width, restyle with the tokens, and nothing can 404.

`docs/image-brief.md` covers what to shoot if photography is added later, and
which slots it would go into.

## Visual

**The headline was measured, not guessed.** The first version —
"Find the people who / make your event work / and run it in one place" —
wrapped two of its three masked lines at every width from 1200px up, which the
line-rise animation turns into a visible orphan. Each candidate was rendered in
the real `h1` and measured with a Range at ten widths from 360px to 2500px.
"Find your people. / Run your event. / All in one place." is the one that stays
on one line everywhere, with the most headroom.

**The hero orbs were removed.** In the template they floated over photographs,
where overlap reads as depth. Over a listing card's price and rating they just
collide with the text.

**`.foot-brand .logo img { filter: brightness(0) invert(1) }` was deleted.** The
template needed it because its "light" logo was a coloured mark with white text
that vanished on the dark footer. EventPlanna's light mark genuinely is light,
so the filter flattened a legible two-colour logo into a white rectangle.

**The mosaic's third tile was squared.** The template staggered it because it
held a portrait photograph and the taller crop read as composition. With flat
colour tiles the same stagger just reads as a misaligned card.

## Technical

**Nothing was added to the stack.** No build step, no dependencies, no
framework — it opens from the filesystem and deploys to Pages from the root.
That constraint is worth more than anything a bundler would have bought.

**`assets/app.js` was not rewritten.** The brief needed no new behaviour, and
every non-obvious part of that file (the lerp, the scrubbed reveals, the manual
anchor handler, the ResizeObserver) exists because something broke without it.
Only the file's header comment changed.

**Verification runs under emulated `prefers-reduced-motion`.** Under that media
query `app.js` skips building the fixed smooth-scroll wrapper, adds `.in` to
everything and settles the counters — so headless Chrome gets native scrolling
and a fully settled page in one move, with no pre-reveal transforms to produce
false overflow positives and no injected stylesheet to maintain.

**The viewport is set with `Emulation.setDeviceMetricsOverride`, never the
window-size flag.** Headless lays out roughly 70px wider than the flag asks
for, so a 420px window produces a 500px layout written into a 420px PNG and the
right edge looks clipped when it is fine.

## The declutter pass

**The first home page was too crowded — 15 sections and 20 cards.** It read as
a specification rather than a landing page, and most of the detail already had
a better home on the audience pages. It is now 10 sections and 6 cards, and the
page is 7,354px tall at 1400 instead of 11,371px.

The rule used for what stays: **a section earns its place if it moves on its
own or answers a question someone has in the first thirty seconds.** The
statement, the ticker, the counters, the split card, the orbit and the carousel
all animate; the three steps and the three doors answer the two questions
everyone arrives with ("how does this work" and "which one am I"). Everything
else was a card grid restating what an inner page says better.

**Cutting the booking funnel was the easy call.** It was the largest invented
figure on the site, it needed a disclaimer under it, and nothing depended on it.

**The hero became one photograph instead of twelve listing cards.** Two
scrolling columns of vendor cards is a lot of reading above the fold, and a
dressed venue says "event" faster than any amount of copy. The two floating
chips — a verified vendor and a live budget — carry the product idea without a
paragraph, and they bob gently so the frame is alive without anything moving
under the cursor.

## Photographs, after all

**The no-photography decision above was reversed for five slots**, on the
grounds that a marketplace for *events* should show an event. The rest of the
site is still DOM.

**They are background images, not `<img>` tags.** The deciding factor was the
missing-file case: an `<img>` with no file shows a broken-image icon and
collapses its box, while a background image that 404s simply leaves the tint
showing. That means the site is finished now, with zero images, and finishes
better as each one arrives — which is what makes "generate them one at a time"
a workable plan rather than a half-shipped page.

**The path in the markup is `img/NAME.webp`, not `assets/img/NAME.webp`.** A
`url()` inside a CSS custom property resolves against the stylesheet that
substitutes it, not the HTML document, and `components.css` lives in `assets/`.
The first attempt used the document-relative path, silently resolved to
`assets/assets/img/`, and every slot kept showing its tint with no error
anywhere on the page. It was caught by reading the computed
`background-image` in the browser, not by looking at a screenshot — a
screenshot of this bug is indistinguishable from "the images have not arrived
yet". The gotcha is now commented at `.ph` in `components.css` and in
`docs/image-prompts.md`.

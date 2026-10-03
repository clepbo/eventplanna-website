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

`docs/image-prompts.md` covers what to shoot and which slots it goes into.
(That earlier decision was later revised — see "Photography, after all".)

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

## Asset caching

**`vercel.json` was serving `/assets/*` with `max-age=31536000, immutable`.**
That header is a promise that the bytes at a URL will never change, and it is
only safe when filenames carry a content hash. These filenames are plain, and
there is no build step to hash them, so the promise was false.

The failure mode is unpleasant because it is invisible from the origin:
`index.html` revalidates on every visit, so a returning visitor received the
**new markup** and styled it with the **stylesheet they first cached**, pinned
for a year. New markup plus old CSS looks exactly like a broken deploy. In our
case the hero's floating chips arrived as unstyled inline text, while `curl` of
the same URL showed the correct file — the server was never wrong.

Two changes, and both were needed:

1. **The links are versioned** — `assets/styles.css?v=2` and so on. Changing
   the header does nothing for a cache that is already poisoned; only a
   different URL does. This is a one-time repair, not a convention to keep up.
2. **The header is now honest.** CSS and JS are `max-age=0, must-revalidate`,
   which costs a conditional request and returns a 304 when nothing changed.
   Images and SVG get seven days, since replacing one is a deliberate act.

If an image ever is replaced in place, either rename it or accept up to a week
of staleness. Do not reintroduce `immutable` without content hashing.

## The motion pass

**The scrolling columns came back, as photographs.** Cutting them in the
declutter pass threw out the thing that made the hero feel alive. The version
that was actually too heavy was the *content* of the cards — four lines of
listing text each, twelve of them above the fold. The columns now carry
photographs with a single caption pill, so the motion is kept and the reading
is not.

**app.js already duplicates `.col` and `.ticker-track`** at runtime
(`t.innerHTML += t.innerHTML`, line 304) — that is what makes the `-50%`
keyframe loop without a jump. The first attempt wrote each card out twice by
hand as well, producing four copies and twice the DOM. It looked completely
correct in a screenshot; it was caught by reading `children.length` in the
running page. Three cards per column in the markup is the right number.

**Everything added in the motion pass is CSS.** `app.js` is still untouched.
Each rule hangs off the `.in` class the engine already sets, off `:hover`, or
off a `view()` timeline inside `@supports`, so a browser without scroll-linked
animation gets exactly the page it got before.

**Anything that starts hidden is gated on being inside an animated container** —
`.reveal .ticks li`, not `.ticks li`. An element can then never be stranded
invisible because somebody put it in a container the engine does not touch.

**A new check exists for exactly that failure.** It runs with motion ON —
`prefers-reduced-motion` would force everything visible and hide the bug — walks
each page down in 420px steps, and asserts that anything sitting comfortably
inside the viewport is actually painted. It also confirms both hero columns are
really translating and that each column's two halves match.

**One regression it did not catch, and a screenshot did:** adding
`display: inline-block` to the footer links for an underline sweep overrode the
`display: block` that stacks them, and the whole footer column ran together on
one line. `footer a` is already `display:block; width:fit-content` — the sweep
needed `position:relative` and nothing else.

## Photography direction, second pass

**The first set of prompts read warm, rustic and local.** "Documentary",
"warm practical light" and "aso-ebi" without any counterweight produced exactly
the register the brand should not have — the same mistake the template's own
notes warn about, repeated. Nigerian event clients are not uniformly
traditional, and the premium end of the market is where this product lives.

The direction is now **contemporary editorial for a luxury events brand**:
cool-neutral grade with no golden cast, architectural daylight, glass and
concrete venues in Eko Atlantic and Victoria Island, restrained palettes of
bone, charcoal and deep green, sculptural florals rather than draped arches,
fine-dining plating rather than catering trays. The negative prompt now
explicitly excludes warm grades, rustic settings, ceiling swags,
gold-and-cream over-decoration and charity framing.

**Casting says what it means.** The cast is affluent, cosmopolitan Lagos and
Abuja — predominantly Black Nigerian, styled as the professionals and guests
they are, with modern tailoring and architectural gele treated as equals rather
than one as "traditional". Mixed-race couples and international guests are
named explicitly, because Lagos is a destination-wedding city and leaving that
out of the brief is what produced a narrower set the first time.

## Generating the images

**The prompts are a manifest, not a document.** `tools/image-prompts.json`
holds them, `tools/generate-images.py` sends them, and `--write-docs`
regenerates `docs/image-prompts.md` from the same file. Nobody has to keep two
copies in step, and what the docs show is provably what the model is asked for.
`docs/image-brief.md` was deleted — it had become a second, drifting account of
the same thing.

**The model is discovered at run time.** Image model names change every few
months, so the script asks the API what the key can actually reach, matches it
against a preference list and takes the best hit. It speaks both request
shapes — `:generateContent` with `responseModalities` for the Gemini image
models, `:predict` for Imagen — and falls back through the older
`generationConfig` shapes on a 400, so an API change degrades to a retry rather
than a dead script.

**It crops rather than trusting the model's aspect ratio.** The ratio is passed
as a hint, but every result is cover-cropped to the slot's exact pixel size and
re-encoded as WebP at quality 82. That half is testable without a key, and it
is: feeding a square source through all nineteen slots returns nineteen exactly
correct sizes.

## Running the generator against a real key

**Every image model on the free tier shares one daily allowance, and it is
counted per model per project.** The first real run found all six image models
the key could reach already at zero, with the server asking for a 3h 8m wait
and naming `GenerateRequestsPerDayPerProjectPerModel-FreeTier`.

Two things came out of that, both now in the script:

**A 429 is not one thing.** A per-minute burst clears on its own; a per-day
allowance does not, and backing off through four retries just wastes time
before failing anyway. The script now reads `violations[].quotaId` and the
server's own `retryDelay`, treats anything naming `PerDay` (or asking for more
than two minutes) as terminal, stops the whole run rather than the one image,
and prints the local time the quota resets alongside the three actual ways
forward.

**Day quotas are per model, so one being spent does not mean the next is.** The
script keeps the whole discovered model list as a fallback queue and walks down
it as each runs dry, instead of picking one model up front and giving up with
five unused models still available.

**Then the reset came and nothing changed**, because the quota was never
"spent" — it is zero. The prose half of the 429 says
`limit: 0, model: gemini-2.5-flash-preview-image`, on every image model the key
can reach. Image output on the Gemini API is a paid feature on most projects,
so the daily reset takes 0 back to 0 and waiting is useless advice. The
structured `violations[]` do not carry the limit; only the message text does,
which is why two runs went by before anyone looked at it.

The script now reads that number and says which of the two situations it is in:
an allowance that resets tonight, or a project with no image quota at all where
only billing helps.

**The fix to that fix had a bug of its own worth recording.** The detection
regex ended in a word-boundary escape and was written through a heredoc, into a
Python patch script, into the file. Each layer un-escaped it once, and the
two-character escape arrived as a single literal 0x08 backspace byte. The
pattern then never matched, so the script confidently reported the *wrong* one
of the two diagnoses — the failure mode of a silent regex is not an error, it
is a plausible wrong answer. Caught with `grep | cat -A`, and the pattern is now
written with no backslash escapes at all (`limit:[ ]*0(?![0-9])`), with a check
that no control characters exist anywhere in the file.

Both the quota handling and the model fallback were found by running the thing
against a real key. The failure path is now thoroughly exercised; the success
path still has not run once.

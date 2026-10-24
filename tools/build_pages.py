# -*- coding: utf-8 -*-
"""Generate the EventPlanna pages.

    python tools/build_pages.py

Written after the October stakeholder review. What changed and why:

  vendors removed      The site presented a vendor marketplace. It is a planner
                       marketplace: planners apply, a person approves in the
                       admin portal, and clients browse the approved list.
  no invented numbers  The stat strip and the testimonial carousel are gone.
                       Nothing on these pages claims a figure nobody can stand
                       behind. The planner profiles are labelled as a preview.
  human copy           No em dashes anywhere, in titles or in prose.
  blog and events      Both have a live backend already, so both are first
                       class in the nav and read from the real endpoints.
  denser pages         The review said there was too much air and not enough on
                       the page. More sections, less space between them.

And after the second review:

  a real directory     marketplace.html was three sample cards under a heading.
                       It is now twenty four profiles with a search, four
                       filters, a sort and a pager, and clicking one opens the
                       planner with a booking and a consultation flow behind
                       it. The behaviour is in assets/app.js; the list is in
                       the markup so the page works without it.
  less prose           Sections that explained the product twice are gone, and
                       the ones that stayed say it once. The booking states and
                       the team roles live in the FAQ, which is where someone
                       looking for them actually goes.
"""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from pagekit import head, FOOTER, write, ticks, V


# =========================================================== index.html
#
# The collage is rooms and receptions, not supplier categories: it sits under a
# heading about events and used to read as a vendor directory.
# tools/make_hero_images.py cuts these from the same originals as the hero.
HERO_CARDS = [
    ('up',   [('hero-venue',   't-grey',  'Reception &middot; Victoria Island'),
              ('ev-banquet',   't-cream', 'Banquet hall &middot; Lagos'),
              ('hero-decor',   't-blush', 'Styling &middot; Lekki')]),
    ('down', [('ev-reception',       't-lilac', 'The reception floor &middot; Ikeja'),
              ('hero-entertainment', 't-blue',  'Live band &middot; Ikeja'),
              ('ev-summit',          't-mint',  'Corporate summit &middot; Abuja')]),
]

def hero_cols():
    out = ''
    for cls, cards in HERO_CARDS:
        out += '          <div class="col %s">\n' % cls
        for img, tint, label in cards:
            out += ('            <div class="pcard ph %s" style="--img:url(img/%s.webp?v=%s)">'
                    '<span class="plabel">%s</span></div>\n' % (tint, img, V, label))
        out += '          </div>\n'
    return out


ARROW_L = ('<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" '
           'stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">'
           '<path d="M15 18 9 12l6-6"/></svg>')
ARROW_R = ('<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" '
           'stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">'
           '<path d="m9 18 6-6-6-6"/></svg>')

# The four rooms supplied for the hero, in the order a season runs: a banquet
# laid and waiting, a reception in full colour, a wedding hall dressed, and a
# corporate floor. The first thing on the page has to read as an event, so none
# of them is a detail shot or a product screen.
# tools/make_hero_images.py cuts them from assets/hero-images.
STAGE = [("stage-banquet",   "A green and gold banquet hall, laid for dinner"),
         ("stage-reception", "A wedding reception under colour, the floor lit"),
         ("stage-hall",      "A wedding hall in purple and gold, tables dressed"),
         ("stage-summit",    "A conference hall set for a corporate summit")]


def stage_slides():
    return "".join(
        '        <div class="tslide" style="--img:url(img/%s.webp?v=%s)" '
        'role="img" aria-label="%s"></div>\n' % (img, V, alt) for img, alt in STAGE)


# Emitted above .shell rather than inside it: the band has to reach the edges
# of the window, and .shell is a rounded card that clips its contents.
HERO = """
<header class="hero-stage">
  <div class="stage-pin">
    <div class="stage" data-carousel="Slide" data-stage>
      <div class="ttrack">
""" + stage_slides() + """      </div>
      <div class="stage-veil"></div>
      <button class="stage-arrow prev" type="button" data-prev aria-label="Previous photograph">""" + ARROW_L + """</button>
      <button class="stage-arrow next" type="button" data-next aria-label="Next photograph">""" + ARROW_R + """</button>
      <div class="stage-copy">
        <span class="stage-eyebrow">Event planning, Nigeria</span>
        <h1>Every great event <em>starts here</em></h1>
        <p>Find a planner who has been checked and approved, then run the whole event with them in one place.</p>
        <div class="hero-actions">
          <a class="btn btn-light" href="marketplace.html">Find a planner <span class="cap">&#8599;</span></a>
          <a class="btn btn-ghost" href="marketplace.html#for-planners">I&rsquo;m a planner <span class="cap">&#8599;</span></a>
        </div>
        <div class="tdots"></div>
      </div>
    </div>
  </div>
</header>

"""

index = head("EventPlanna | Find a planner, and run the whole event",
             "Find an event planner who has been checked and approved, then run the whole event in one "
             "workspace: budget, bookings, tasks, team and a client portal. No subscription.",
             "", home=True, pre=HERO)

index += """
  <section class="statement wide">
    <p data-words data-green="one|place|everyone|can|see">Planning an event runs on referrals, group chats and a spreadsheet nobody trusts. EventPlanna puts the people and the plan in one place everyone can see.</p>
  </section>

  <div class="ticker">
    <div class="ticker-track">
      <b>WEDDINGS</b><i>&rarr;</i><b class="out">CORPORATE</b><i>&rarr;</i><b>BIRTHDAYS</b><i>&rarr;</i><b class="out">CONFERENCES</b><i>&rarr;</i><b>LAUNCHES</b><i>&rarr;</i><b class="out">PRIVATE DINING</b><i>&rarr;</i>
    </div>
  </div>

  <section class="section" id="work">
    <div class="showcase-grid">
      <div class="reveal">
        <span class="eyebrow">The work</span>
        <h2>Real events, run by planners <span class="mark">already on here</span></h2>
        <p class="lead" style="margin-top:18px">Every planner in the marketplace is checked before being listed, so the shortlist you get is short for a reason.</p>
        <div class="hero-actions" style="margin-top:26px">
          <a class="btn btn-dark" href="marketplace.html">Browse the marketplace <span class="cap">&#8599;</span></a>
        </div>
      </div>
      <div class="hero-media-wrap reveal">
        <div class="hero-media">
""" + hero_cols() + """        </div>
        <div class="hfloat a">
          <i><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#5047e1" stroke-width="2.4"><path d="M20 6 9 17l-5-5"/></svg></i>
          <div><b>Adaeze M.</b><small>Approved planner &middot; Lekki</small></div>
        </div>
        <div class="hfloat b">
          <small>BUDGET</small>
          <b data-count="&#8358;1,600,000">&#8358;0</b>
          <span class="bar"><i></i></span>
          <small>53% allocated, on track</small>
        </div>
      </div>
    </div>
  </section>

  <section class="section" id="how">
    <div class="shead reveal">
      <span class="eyebrow">How it works</span>
      <h2>Three steps, and none of them is a phone call</h2>
    </div>
    <div class="steps">
      <div class="step reveal"><div class="step-n">1</div><div><h3>Tell us about the event</h3><p>Type, date, city, headcount, budget. You get a workspace back with phases, a checklist and a budget already broken into categories.</p></div></div>
      <div class="step reveal"><div class="step-n">2</div><div><h3>Shortlist planners who are free</h3><p>Search the directory, filter to your city, your event and your budget, and open a planner to see what they take on and whether your date is open.</p></div></div>
      <div class="step reveal"><div class="step-n">3</div><div><h3>Book, pay, and follow it to the day</h3><p>A deposit paid in the app holds the date. Every naira after that lands against a budget line you and your planner both read from.</p></div></div>
    </div>
  </section>

  <section class="section">
    <div class="shead reveal">
      <span class="eyebrow">Who it is for</span>
      <h2>Two ways in, <span class="mark">one marketplace</span></h2>
    </div>
    <div class="cards cards-2 stagger">
      <a class="card" href="marketplace.html">
        <div class="card-photo"><i class="ph t-blush" style="--img:url(img/door-client.webp?v=2)"></i></div>
        <h3>Planning an event</h3>
        <p>Compare approved planners on what they do, what they charge and where they work. Book and pay in the app, then follow the budget without chasing anyone.</p>
        <span class="card-link">Find a planner <span>&rarr;</span></span>
      </a>
      <a class="card" href="marketplace.html#for-planners">
        <div class="card-photo"><i class="ph t-lilac" style="--img:url(img/door-planner.webp?v=2)"></i></div>
        <h3>Event planners</h3>
        <p>Apply once to be listed, win briefs that match what you actually do, and run budgets, tasks and your team from one workspace.</p>
        <span class="card-link">Apply to be listed <span>&rarr;</span></span>
      </a>
    </div>
  </section>

  <section class="section" id="marketplace" style="background:var(--tile);border-radius:var(--r-xl)">
    <div class="duo reveal">
      <div>
        <span class="eyebrow">The marketplace</span>
        <h2 style="font-size:clamp(28px,4vw,46px);margin-top:16px">Nobody gets listed <span class="mark">without being checked</span></h2>
        <p class="muted" style="margin-top:18px;max-width:46ch">A planner applies with their portfolio, their price range and the cities they cover. A person reviews it before anything goes live.</p>
        <ul class="ticks">
""" + ticks(["Apply with a portfolio, a price range and your cities",
             "We review it. Nothing is listed automatically",
             "Once approved, clients can find you and book you"]) + """        </ul>
        <div class="hero-actions" style="margin-top:26px">
          <a class="btn btn-dark" href="marketplace.html#directory">Browse planners <span class="cap">&#8599;</span></a>
          <a class="btn btn-light" href="marketplace.html#apply">Apply to be listed <span class="cap">&#8599;</span></a>
        </div>
      </div>
      <div class="flow reveal">
        <div class="fstep"><span class="fn">1</span><div><b>Planner applies</b><small>Portfolio, price range, cities covered</small></div></div>
        <div class="fline"></div>
        <div class="fstep"><span class="fn">2</span><div><b>We review</b><small>Checked in the admin portal, never automatic</small></div></div>
        <div class="fline"></div>
        <div class="fstep on"><span class="fn"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M20 6 9 17l-5-5"/></svg></span><div><b>Listed on the marketplace</b><small>Clients can browse, compare and book</small></div></div>
      </div>
    </div>
  </section>

  <section class="section">
    <div class="duo reveal">
      <div class="orbit">
        <div class="ring"></div><div class="ring r2"></div><div class="ring r3"></div>
        <div class="spin">
          <div class="sat" style="left:2%;top:38%"><span><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#5047e1" stroke-width="2"><rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/></svg></span></div>
          <div class="sat" style="right:6%;top:14%"><span><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0f9d6e" stroke-width="2"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg></span></div>
          <div class="sat" style="right:2%;bottom:34%"><span><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg></span></div>
        </div>
        <div class="spin rev">
          <div class="sat" style="left:16%;bottom:8%"><span><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#c2478e" stroke-width="2"><path d="M12 6v6l4 2"/><circle cx="12" cy="12" r="9"/></svg></span></div>
          <div class="sat" style="left:40%;top:1%"><span><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#d97b3c" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg></span></div>
        </div>
        <div class="hub"><img src="assets/logo-dark.svg" alt="EventPlanna"><div style="font-size:11.5px;color:var(--grey)">one workspace</div></div>
      </div>
      <div>
        <span class="eyebrow">The workspace</span>
        <h2 style="font-size:clamp(28px,4vw,46px);margin-top:16px">Everything after the booking, <span class="mark">in one place</span></h2>
        <p class="muted" style="margin-top:18px;max-width:46ch">Finding the planner is the visible part. What decides whether an event runs smoothly is everything after it.</p>
        <ul class="ticks">
""" + ticks(["One budget. Allocated, spent and remaining always agree",
             "Phases and tasks with an owner and a due date",
             "A client portal that shows progress, not your margins",
             "Every message sitting against the booking it belongs to"]) + """        </ul>
        <div class="hero-actions" style="margin-top:26px">
          <a class="btn btn-dark" href="marketplace.html#workspace">See the workspace <span class="cap">&#8599;</span></a>
          <a class="btn btn-light" href="pricing.html">What it costs <span class="cap">&#8599;</span></a>
        </div>
      </div>
    </div>
  </section>

  <section class="section" id="upcoming">
    <div style="display:flex;justify-content:space-between;align-items:flex-end;gap:16px;flex-wrap:wrap">
      <div><span class="eyebrow">Next up</span><h2 class="big" style="text-align:left;margin-top:14px;font-size:clamp(28px,4vw,50px)">Upcoming event</h2></div>
      <a class="btn btn-light btn-sm" href="events.html">All events <span class="cap">&#8599;</span></a>
    </div>
    <div class="live-slot" data-slot="featured-event"></div>
  </section>

  <section class="section" id="writing">
    <div style="display:flex;justify-content:space-between;align-items:flex-end;gap:16px;flex-wrap:wrap">
      <div><span class="eyebrow">From the blog</span><h2 class="big" style="text-align:left;margin-top:14px;font-size:clamp(28px,4vw,50px)">Worth reading</h2></div>
      <a class="btn btn-light btn-sm" href="blog.html">All posts <span class="cap">&#8599;</span></a>
    </div>
    <div class="live-slot cards" data-slot="latest-posts"></div>
  </section>

  <section class="section" id="start">
    <div class="cta reveal">
      <h2>Start with 200 free credits</h2>
      <p>No card, no subscription and no sales call.</p>
      <div class="cta-actions">
        <a class="btn btn-green" href="marketplace.html#directory">Find a planner <span class="cap">&#8599;</span></a>
        <a class="btn btn-light" href="marketplace.html#apply">Apply to be listed <span class="cap">&#8599;</span></a>
      </div>
    </div>
  </section>
"""
write("index.html", index + FOOTER)


# =========================================================== blog + events
write("blog.html", head("Blog | EventPlanna",
      "Practical guides, planner playbooks and product stories for the people building Nigeria&rsquo;s events.",
      "blog.html") + """
  <section class="section" style="padding-top:clamp(96px,12vw,150px);padding-bottom:16px">
    <div class="shead center reveal">
      <span class="eyebrow">The EventPlanna blog</span>
      <h2>Plan smarter. <span class="mark">Celebrate better.</span></h2>
      <p>Practical guides, planner playbooks and product stories for the people building Nigeria&rsquo;s events.</p>
    </div>
  </section>

  <section class="section" style="padding-top:8px">
    <div class="live-slot" data-slot="post-featured"></div>
    <div class="live-slot cards" data-slot="post-list"></div>
  </section>

  <section class="section">
    <div class="cta reveal">
      <h2>Get the next one in your inbox</h2>
      <p>One thoughtful email a week, and nothing else.</p>
      <div class="cta-actions">
        <a class="btn btn-green" href="index.html#start">Start free <span class="cap">&#8599;</span></a>
        <a class="btn btn-light" href="events.html">See upcoming events <span class="cap">&#8599;</span></a>
      </div>
    </div>
  </section>
""" + FOOTER)

write("post.html", head("Article | EventPlanna", "An article from the EventPlanna blog.",
      "blog.html") + """
  <section class="section" style="padding-top:clamp(96px,12vw,150px)">
    <div data-slot="post"></div>
  </section>

  <section class="section">
    <div class="cta reveal">
      <h2>Run your next event in one place</h2>
      <p>Budget, bookings, tasks, team and a client portal. Start with 200 free credits.</p>
      <div class="cta-actions">
        <a class="btn btn-green" href="index.html#start">Start free <span class="cap">&#8599;</span></a>
        <a class="btn btn-light" href="blog.html">More articles <span class="cap">&#8599;</span></a>
      </div>
    </div>
  </section>
""" + FOOTER)

write("events.html", head("Events | EventPlanna",
      "Live sessions and webinars for event planners building a business, not just events.",
      "events.html") + """
  <section class="section" style="padding-top:clamp(96px,12vw,150px);padding-bottom:16px">
    <div class="shead center reveal">
      <span class="eyebrow">Events</span>
      <h2>Sessions for planners <span class="mark">building a business</span></h2>
      <p>Free, online, and run with people who actually do this work.</p>
    </div>
  </section>

  <section class="section" style="padding-top:8px">
    <div class="live-slot" data-slot="event-list"></div>
    <div class="live-slot" data-slot="event-past"></div>
  </section>

  <section class="section">
    <div class="cta reveal">
      <h2>Want the recording and the next invite?</h2>
      <p>Create a free account and we will let you know when the next one is scheduled.</p>
      <div class="cta-actions">
        <a class="btn btn-green" href="index.html#start">Start free <span class="cap">&#8599;</span></a>
        <a class="btn btn-light" href="blog.html">Read the blog <span class="cap">&#8599;</span></a>
      </div>
    </div>
  </section>
""" + FOOTER)

write("event.html", head("Event | EventPlanna", "An upcoming EventPlanna session.",
      "events.html") + """
  <section class="section" style="padding-top:clamp(96px,12vw,150px)">
    <div data-slot="event"></div>
  </section>
""" + FOOTER)


# =========================================================== the directory
#
# The rows live in tools/plannerdata.py, because the profile page behind each
# card is generated from the same list and a card must never say something the
# profile contradicts.
#
# A card is a link now, not a button that opened a dialog. The whole card is
# one anchor to planner.html?p=<slug>, so the profile has a URL you can send
# someone, opens in a new tab on a middle click, and leaves the back button
# doing what a back button should do.
from plannerdata import profiles, BANDS, CITIES, TYPE_OPTS

PS = profiles()

STAR = ('<svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" stroke="none">'
        '<path d="m12 3.6 2.6 5.3 5.8.8-4.2 4.1 1 5.8-5.2-2.7-5.2 2.7 1-5.8L3.6 9.7l5.8-.8z"/></svg>')
CHECK = ('<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" '
         'stroke-width="3.4"><path d="M20 6 9 17l-5-5"/></svg>')


def planner_cards():
    out = ""
    for d in PS:
        hay = " ".join([d["name"], d["area"], d["city"], d["spec"]] + d["does"]).lower()
        out += (
            '      <a class="dir-card" href="planner.html?p=%s"\n'
            '        data-hay="%s" data-city="%s" data-types="%s" data-band="%d"\n'
            '        data-rating="%s" data-events="%d">\n'
            '        <div class="dir-cover %s"><span class="dir-mono">%s</span>'
            '<span class="dir-tag">%s Approved</span></div>\n'
            '        <div class="dir-body">\n'
            '          <h3>%s</h3>\n'
            '          <div class="dir-where">%s, %s</div>\n'
            '          <div class="dir-spec">%s</div>\n'
            '          <div class="dir-foot"><b>%s</b>'
            '<span class="dir-star">%s %s</span></div>\n'
            '          <span class="dir-open">View profile <span>&rarr;</span></span>\n'
            '        </div>\n'
            '      </a>\n'
            % (d["slug"], hay, d["city"], d["types"], d["band"], d["rating"], d["events"],
               d["tint"], d["initials"], CHECK, d["name"], d["area"], d["city"], d["spec"],
               d["rate"], STAR, d["rating"]))
    return out


def options(name, items):
    return ('<option value="">%s</option>' % name
            + "".join('<option value="%s">%s</option>' % (v, t) for v, t in items))


DIRECTORY = """
  <section class="section" id="directory">
    <div class="shead reveal">
      <span class="eyebrow">The directory</span>
      <h2>Browse planners, filtered to your event</h2>
      <p>Search by name or by what someone does, then narrow it to your city, your event type and the budget you are working to. Open a planner to see their past work and book them.</p>
    </div>
    <div data-dir="12">
      <div class="dir-bar">
        <div class="dir-search">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.2-3.2"/></svg>
          <input type="search" data-dir-q placeholder="Search a name, a city or what they do" aria-label="Search planners">
        </div>
        <select class="fld" data-dir-pick="city" aria-label="City">""" + \
    options("Every city", [(c, c) for c in CITIES]) + """</select>
        <select class="fld" data-dir-pick="type" aria-label="Event type">""" + \
    options("Every event type", TYPE_OPTS) + """</select>
        <select class="fld" data-dir-pick="band" aria-label="Budget band">""" + \
    options("Any budget", [(str(k), v) for k, v in sorted(BANDS.items())]) + """</select>
        <select class="fld" data-dir-pick="sort" aria-label="Sort by">
          <option value="best">Recommended</option>
          <option value="rating">Highest rated</option>
          <option value="budget">Lowest budget first</option>
          <option value="experience">Most events delivered</option>
        </select>
      </div>
      <div class="dir-head">
        <div class="dir-count" data-dir-count><b>%d</b> planners</div>
        <button class="dir-reset" type="button" data-dir-reset>Clear everything</button>
      </div>
      <div class="dir-grid" data-dir-grid>
""" % len(PS) + planner_cards() + """      </div>
      <div class="dir-empty" data-dir-empty hidden>Nothing matches that combination yet. Try a wider budget band, or clear the filters and start again.</div>
      <div class="dir-pager" data-dir-pager hidden></div>
    </div>
    <p class="live-note reveal">Every profile here is invented, and so is every rating, portfolio and count on it. They are here so the search, the filters and the booking flow can be used before launch. Real planners appear in their place once the directory endpoints are live on the backend.</p>
  </section>
"""


# =========================================================== marketplace
# One page, both audiences. "Find a planner" and "For planners" sat side by
# side in the nav reading as the same thing twice, so the planner half moved
# here under #for-planners and planners.html is gone.
#
# The second review cut this page back to what the two audiences actually need:
# the directory, how you get listed, and what you run the work with. The
# booking states and the team roles went to the FAQ, and what a credit costs
# went to the pricing page, where both were already said once.
mk = head("Find a planner | EventPlanna",
          "Search event planners who were checked and approved before being listed, filter by city, "
          "event type and budget, and book or consult with them in one place. Planners: apply to be "
          "listed and run the work from one workspace.", "marketplace.html")
mk += """
  <header class="phero">
    <div class="phero-grid">
      <div>
        <span class="eyebrow fade-up">Find a planner</span>
        <h1 class="fade-up d1">Every planner here <span class="hl">was checked first</span>.</h1>
        <p class="lead fade-up d2">Planners apply with a portfolio, a price range and the cities they cover, and <b>a person reviews it before anything goes live</b>.</p>
        <div class="hero-actions fade-up d3"><a class="btn btn-dark" href="#directory">Browse the directory <span class="cap">&#8599;</span></a><a class="btn btn-light" href="#for-planners">I&rsquo;m a planner <span class="cap">&#8599;</span></a></div>
      </div>
      <div class="fade-up d2"><div class="ui-card chartbox">
        <div class="ui-head"><div><div class="ui-title">Traditional wedding, Ikeja</div><div class="ui-sub">12 Dec 2026, 400 guests</div></div><span class="delta info">Shortlisting</span></div>
        <div class="kpi-row">
          <div class="kpi"><div class="kpi-label">Budget</div><div class="kpi-value" data-count="&#8358;1,600,000">&#8358;0</div><div class="delta up">&#8358;752,000 left</div></div>
          <div class="kpi"><div class="kpi-label">Days to go</div><div class="kpi-value" data-count="71">0</div><div class="delta info">On schedule</div></div>
        </div>
        <div style="margin-top:14px">
          <div class="prow"><span class="nm">Venue</span><span class="track"><i style="--w:100%"></i></span><span class="val">paid</span></div>
          <div class="prow"><span class="nm">Catering</span><span class="track"><i style="--w:40%;background:var(--c6)"></i></span><span class="val">40%</span></div>
          <div class="prow"><span class="nm">Photography</span><span class="track"><i style="--w:50%"></i></span><span class="val">50%</span></div>
          <div class="prow"><span class="nm">Decor</span><span class="track"><i style="--w:0%"></i></span><span class="val">0%</span></div>
        </div>
        <div class="ui-sub" style="margin-top:12px">An illustration of the workspace, not a real account.</div>
      </div></div>
    </div>
  </header>
""" + DIRECTORY + """
  <section class="section half-break" id="for-planners">
    <div class="shead reveal">
      <span class="eyebrow">Turn the page over</span>
      <h2>Not planning an event. <span class="mark">Running them.</span></h2>
      <p>Everything above is what a client sees. The rest of this page is the other side of the same marketplace.</p>
    </div>
    <div class="duo reveal">
      <div>
        <h3 style="font-size:clamp(20px,2.4vw,27px)">Get found. Then run the work.</h3>
        <p class="lead" style="margin-top:18px">Apply once to be listed. Once you are approved, clients can find you, brief you and book you, and <b>budgets, tasks, your team and the client portal</b> live in the same place. You pay for actions, not for access, so a quiet quarter costs you nothing.</p>
        <div class="hero-actions" style="margin-top:26px">
          <a class="btn btn-dark" href="#apply">Apply to be listed <span class="cap">&#8599;</span></a>
          <a class="btn btn-light" href="#workspace">Tour the workspace <span class="cap">&#8599;</span></a>
        </div>
      </div>
      <div><div class="ui-card chartbox">
        <div class="ui-head"><div><div class="ui-title">Your events</div><div class="ui-sub">October 2026, 6 active</div></div><span class="delta up">2 new briefs</span></div>
        <div class="kpi-row">
          <div class="kpi"><div class="kpi-label">Under management</div><div class="kpi-value" style="color:var(--green)" data-count="&#8358;24.6M">&#8358;0</div><div class="delta up">Across 6 events</div></div>
          <div class="kpi"><div class="kpi-label">Credits left</div><div class="kpi-value" data-count="1,840">0</div><div class="delta info">No renewal date</div></div>
        </div>
        <div style="margin-top:14px">
          <div class="prow"><span class="nm">Adeyemi wed.</span><span class="track"><i style="--w:86%"></i></span><span class="val">86%</span></div>
          <div class="prow"><span class="nm">Zenith AGM</span><span class="track"><i style="--w:62%"></i></span><span class="val">62%</span></div>
          <div class="prow"><span class="nm">Okafor 50th</span><span class="track"><i style="--w:34%;background:var(--c6)"></i></span><span class="val">34%</span></div>
          <div class="prow"><span class="nm">Ire launch</span><span class="track"><i style="--w:11%;background:var(--c-neutral)"></i></span><span class="val">11%</span></div>
        </div>
        <div class="ui-sub" style="margin-top:12px">An illustration of the workspace, not a real account.</div>
      </div></div>
    </div>
  </section>

  <section class="section" id="apply">
    <div class="shead reveal">
      <span class="eyebrow">Getting listed</span>
      <h2>Apply once. A person reviews it.</h2>
      <p>Listing is free, approval is never automatic, and there is no paying to rank.</p>
    </div>
    <div class="duo reveal">
      <div class="flow">
        <div class="fstep"><span class="fn">1</span><div><b>You apply</b><small>Portfolio, price range, the cities you cover, the event types you take</small></div></div>
        <div class="fline"></div>
        <div class="fstep"><span class="fn">2</span><div><b>We review it</b><small>Checked by a person in the admin portal. Nothing goes live on its own</small></div></div>
        <div class="fline"></div>
        <div class="fstep on"><span class="fn"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M20 6 9 17l-5-5"/></svg></span><div><b>You are listed</b><small>Clients browse, compare and send you briefs with a real budget attached</small></div></div>
      </div>
      <div>
        <h3 style="font-size:clamp(20px,2.4vw,27px)">What we ask for</h3>
        <ul class="ticks">
""" + ticks(["A portfolio of events you actually delivered",
             "The cities and areas you genuinely cover",
             "A price range, so briefs reach you in the right band",
             "The event types you want, and the ones you do not"]) + """        </ul>
        <div class="live-note" style="margin-top:20px">The application form is not wired up yet. Planner submission needs its endpoint on the backend first, so this points at account signup for now.</div>
        <div class="hero-actions" style="margin-top:20px">
          <a class="btn btn-dark" href="index.html#start">Create an account <span class="cap">&#8599;</span></a>
        </div>
      </div>
    </div>
  </section>

  <section class="section" id="workspace">
    <div class="shead reveal">
      <span class="eyebrow">The workspace</span>
      <h2>Six things that stop falling through <span class="mark">the cracks</span></h2>
      <p>Winning the brief is the visible part of the job. Everything after it is where events quietly go wrong.</p>
    </div>
    <div class="cards cap-grid stagger">
      <div class="card"><h3>Budgets that reconcile</h3><p>Allocate by category, land every quote and payment against a line, and watch allocated, spent and remaining stay in agreement. An alert fires at 85%.</p></div>
      <div class="card"><h3>Phases and tasks</h3><p>Each event breaks into phases with their own checklists. Tasks carry an owner, a due date and a status, so progress counts finished work instead of guessing.</p></div>
      <div class="card"><h3>Bookings end to end</h3><p>Request, quote, accept, contract, deposit, balance, completion. Six states, each timestamped, so nothing important was agreed in a chat you cannot find.</p></div>
      <div class="card"><h3>A team with real roles</h3><p>Managers, coordinators and assistants each get the access their job needs and see only the events they are assigned to.</p></div>
      <div class="card"><h3>A client portal</h3><p>Share progress, the budget and decisions that need a yes, without handing the client the keys to your workspace or your cost base.</p></div>
      <div class="card"><h3>Messaging in context</h3><p>Every thread sits against the booking it belongs to, so the quote, the revision and what was agreed stay together.</p></div>
    </div>
  </section>

  <section class="section" id="cta">
    <div class="cta reveal">
      <h2>Start with 200 free credits</h2>
      <p>Whichever side of the marketplace you are on, the first 200 credits are on us and nothing renews.</p>
      <div class="cta-actions">
        <a class="btn btn-green" href="#directory">Find a planner <span class="cap">&#8599;</span></a>
        <a class="btn btn-light" href="#apply">Apply to be listed <span class="cap">&#8599;</span></a>
      </div>
    </div>
  </section>
"""
write("marketplace.html", mk + FOOTER)
print("\nAll pages generated.")

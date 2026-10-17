# -*- coding: utf-8 -*-
"""Generate the EventPlanna pages.

    python tools/build_pages.py

Written after the October stakeholder review. What changed and why:

  vendors removed      The site presented a vendor marketplace. It is a planner
                       marketplace: planners apply, a person approves in the
                       admin portal, and clients browse the approved list.
  no invented numbers  The stat strip and the testimonial carousel are gone.
                       Nothing on these pages claims a figure nobody can stand
                       behind. The planner cards are labelled as a preview.
  human copy           No em dashes anywhere, in titles or in prose.
  blog and events      Both have a live backend already, so both are first
                       class in the nav and read from the real endpoints.
  denser pages         The review said there was too much air and not enough on
                       the page. More sections, less space between them.
"""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from pagekit import head, FOOTER, write, ticks, V


def planner_card(name, place, kind, note, tint, img):
    return ('      <article class="pl-card">\n'
            '        <div class="pl-photo ph %s" style="--img:url(img/%s.webp?v=2)"></div>\n'
            '        <div class="pl-body">\n'
            '          <h3>%s</h3>\n'
            '          <div class="pl-meta">%s</div>\n'
            '          <p>%s</p>\n'
            '          <div class="pl-foot"><span class="pl-badge">Approved</span><span>%s</span></div>\n'
            '        </div>\n      </article>\n' % (tint, img, name, place, note, kind))


# =========================================================== index.html
#
# The collage used to be the supplier categories: catering, photography,
# beauty. Three of the six are now rooms and receptions instead, because the
# strip sits under a heading about events and was reading as a vendor
# directory. tools/make_hero_images.py cuts them from the same originals.
HERO_CARDS = [
    ('up',   [('hero-venue',   't-grey',  'Reception &middot; Victoria Island'),
              ('ev-ballroom',  't-cream', 'Ballroom, dressed &middot; Lagos'),
              ('hero-decor',   't-blush', 'Styling &middot; Lekki')]),
    ('down', [('ev-floor',           't-lilac', 'The dance floor &middot; Ikeja'),
              ('hero-entertainment', 't-blue',  'Live band &middot; Ikeja'),
              ('ev-ceremony',        't-mint',  'Ceremony set &middot; Abuja')]),
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

# Three rooms, in the order a night happens: laid and waiting, lit and in
# use, and the ceremony set. The first thing on the page has to read as an
# event, so none of them is a detail shot or a product screen.
# tools/make_hero_images.py cuts them from the originals.
STAGE = [("stage-gold",  "A ballroom laid for dinner, before the doors open"),
         ("stage-floor", "A reception under colour, the dance floor lit"),
         ("stage-set",   "A ceremony set against the Lagos skyline")]


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
        <p>Find a planner who has been checked and approved, then run the whole thing together: one budget, every booking, the task list and a portal your client can actually see.</p>
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
        <p class="lead" style="margin-top:18px">Receptions in Victoria Island, service in Lagos, styling in Lekki. Every planner in the marketplace is checked before they are listed, so the shortlist you get is short for a reason.</p>
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
      <div class="step reveal"><div class="step-n">1</div><div><h3>Tell us about the event</h3><p>Type, date, city, headcount, budget. You get a workspace back with phases, a starter checklist and a budget already broken into categories, so you are editing a plan instead of staring at a blank page.</p></div></div>
      <div class="step reveal"><div class="step-n">2</div><div><h3>Shortlist planners who are actually free</h3><p>Every planner in the directory was checked and approved before being listed. You see real portfolios, real price ranges and whether they are open on your date, so the shortlist is short for a reason.</p></div></div>
      <div class="step reveal"><div class="step-n">3</div><div><h3>Book, pay, and follow it to the day</h3><p>A deposit paid in the app holds the date. Every naira after that lands against a budget line, and the plan is one screen you, your planner and your team all read from.</p></div></div>
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
        <p>Compare approved planners on portfolio, price and availability. Book and pay in the app, then follow the budget without chasing anyone for an update.</p>
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
        <p class="muted" style="margin-top:18px;max-width:46ch">A planner applies with their portfolio, their price range and the cities they cover. We review it before anything goes live. Clients only ever browse planners who have already cleared that.</p>
        <ul class="ticks">
""" + ticks(["Apply with a portfolio, a price range and your cities",
             "We review it. Nothing is listed automatically",
             "Once approved, clients can find you and book you"]) + """        </ul>
        <div class="hero-actions" style="margin-top:26px">
          <a class="btn btn-dark" href="marketplace.html">Browse planners <span class="cap">&#8599;</span></a>
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
        <div class="hub"><img src="assets/logo-dark.svg" alt="EventPlanna"><div style="font-size:10.5px;color:var(--grey);margin-top:6px">one workspace</div></div>
      </div>
      <div>
        <span class="eyebrow">The workspace</span>
        <h2 style="font-size:clamp(28px,4vw,46px);margin-top:16px">Everything after the booking, <span class="mark">in one place</span></h2>
        <p class="muted" style="margin-top:18px;max-width:46ch">Finding the planner is the visible part. What decides whether an event runs smoothly is everything after it, and that is usually where the thread goes cold.</p>
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
      <p>No card, no subscription and no sales call. Create the event and you can be comparing real quotes the same afternoon.</p>
      <div class="cta-actions">
        <a class="btn btn-green" href="marketplace.html">Find a planner <span class="cap">&#8599;</span></a>
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
      <p>Planning tips, planner playbooks and product news. One thoughtful email a week, and nothing else.</p>
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
      <p>Free, online, and run with people who actually do this work. Save your seat and come with questions.</p>
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


# =========================================================== marketplace
# One page, both audiences. "Find a planner" and "For planners" sat side by
# side in the nav reading as the same thing twice, so the planner half moved
# here under #for-planners and planners.html is gone.
mk = head("Find a planner | EventPlanna",
          "Browse event planners who were checked and approved before being listed, then book and run "
          "the whole event in one place. Planners: apply to be listed and run the work from one "
          "workspace.", "marketplace.html")
mk += """
  <header class="phero">
    <div class="phero-grid">
      <div>
        <span class="eyebrow fade-up">Find a planner</span>
        <h1 class="fade-up d1">Every planner here <span class="hl">was checked first</span>.</h1>
        <p class="lead fade-up d2">Planners apply with a portfolio, a price range and the cities they cover. We review it before anything goes live, so the list you are browsing is <b>people who have already cleared that</b>, not whoever signed up most recently.</p>
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
        <div class="ui-sub" style="margin-top:12px">Deposits are paid in the app. Balances fall due 7 days before the event.</div>
      </div></div>
    </div>
  </header>

  <section class="statement wide">
    <p data-words data-green="one|budget|everyone|is|reading|from">Nobody plans an event badly on purpose. It goes wrong because the price, the plan and the people live in different places. One budget everyone is reading from fixes most of it.</p>
  </section>

  <section class="section" id="directory">
    <div class="shead reveal">
      <span class="eyebrow">The directory</span>
      <h2>Browse planners, filtered to your date</h2>
      <p>Filter by city, event type, budget band and whether they are free on your date, so the shortlist is short for a reason.</p>
    </div>
    <div class="pl-filters reveal">
      <span class="pl-f on">All</span><span class="pl-f">Lagos</span><span class="pl-f">Abuja</span><span class="pl-f">Port Harcourt</span><span class="pl-f">Weddings</span><span class="pl-f">Corporate</span><span class="pl-f">Private dining</span>
    </div>
    <div class="pl-grid stagger">
"""
mk += planner_card("Adaeze M.", "Lekki, Lagos", "Weddings, 150 to 600 guests",
                   "Full service planning and day-of coordination. Works with her own supplier panel on a fixed project fee.",
                   "t-blush", "door-planner")
mk += planner_card("Tobi A.", "Victoria Island, Lagos", "Corporate and launches",
                   "Conferences, AGMs and product launches. Runs production and guest movement in house.",
                   "t-lilac", "door-vendor")
mk += planner_card("Nkechi O.", "Wuse, Abuja", "Weddings and private dining",
                   "Traditional and white weddings, intimate dinners. Known for keeping tight budgets honest.",
                   "t-mint", "verified-vendor")
mk += """    </div>
    <p class="live-note reveal">This is a preview of how the directory will look. Real planner profiles appear here once the directory goes live, which needs the planner endpoints on the backend. Nothing above is a real business.</p>
  </section>

  <section class="section" id="how">
    <div class="shead reveal"><span class="eyebrow">Booking</span><h2>Six states, and you always know which one you are in</h2></div>
    <div class="feature reveal">
      <div>
        <p class="muted">A booking is not a conversation. It moves through the same six states every time, each one timestamped, so what was agreed and what is still open are never in doubt, and neither is who is waiting on whom.</p>
        <div class="rail">
          <span class="done">Pending</span><span class="done">Accepted</span><span class="now">Confirmed</span><span>Completed</span><span class="off">Declined</span><span class="off">Cancelled</span>
        </div>
        <p style="font-size:13.5px;color:var(--grey);margin-top:16px">A quote becomes <b>Accepted</b> when you agree the price, and <b>Confirmed</b> when the deposit clears. Until then the date is not held.</p>
      </div>
      <div class="feature-media">
        <div class="ui-card chartbox">
          <div class="ui-head"><div class="ui-title">Budget by category</div><div class="ui-sub">&#8358;1,600,000 allocated</div></div>
          <div class="prow"><span class="nm">Venue</span><span class="track"><i style="--w:31%"></i></span><span class="val">31%</span></div>
          <div class="prow"><span class="nm">Catering</span><span class="track"><i style="--w:28%"></i></span><span class="val">28%</span></div>
          <div class="prow"><span class="nm">Decor</span><span class="track"><i style="--w:16%"></i></span><span class="val">16%</span></div>
          <div class="prow"><span class="nm">Photography</span><span class="track"><i style="--w:14%"></i></span><span class="val">14%</span></div>
          <div class="prow"><span class="nm">Other</span><span class="track"><i style="--w:11%;background:var(--c-neutral)"></i></span><span class="val">11%</span></div>
          <div class="note warn" style="font-size:12.5px;padding:11px 13px">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#b45309" stroke-width="2"><path d="M12 9v4M12 17h.01"/><path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/></svg>
            Catering is at 88% of its allocation with two quotes still open.
          </div>
        </div>
      </div>
    </div>
  </section>

  <section class="section">
    <div class="dark" style="padding-block:clamp(40px,6vw,76px)">
      <div class="shead reveal">
        <span class="eyebrow">Straight answer</span>
        <h2>What is <span class="mark">free</span>, and what a credit is for</h2>
        <p>There is no subscription and no card kept on file. You buy credits once and spend them on four actions.</p>
      </div>
      <div class="split-2 stagger">
        <div class="tier t-agg"><h4>Always free</h4><p>Browsing the directory. Reading portfolios, price ranges and past events. Messaging a planner before you commit. Viewing your budget, tasks and bookings. A dormant account costs nothing at all.</p></div>
        <div class="tier t-private"><h4>Costs credits</h4><p>Creating an event (5). Sending a booking request (5). Inviting someone onto your team (2). Exporting a report (1). That is the whole list, and nothing else draws down your balance.</p></div>
      </div>
      <div class="note reveal">
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#a49ff0" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg>
        200 free credits on signup covers roughly 40 events. Credits never expire.
      </div>
    </div>
  </section>

  <section class="section half-break" id="for-planners">
    <div class="shead reveal">
      <span class="eyebrow">Turn the page over</span>
      <h2>Not planning an event. <span class="mark">Running them.</span></h2>
      <p>Everything above is what a client sees. The rest of this page is the other side of the same marketplace: how you get listed on it, and what you run the work with once you are.</p>
    </div>
    <div class="duo reveal">
      <div>
        <h3 style="font-size:clamp(20px,2.4vw,27px)">Get found. Then run the work.</h3>
        <p class="lead" style="margin-top:18px">Apply once to be listed. Once you are approved, clients can find you, brief you and book you, and <b>budgets, tasks, your team and the client portal</b> all live in the same place. You pay for actions, not for access, so a quiet quarter costs you nothing.</p>
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
        <div class="ui-sub" style="margin-top:12px">Progress is a count of completed tasks, not an estimate. This panel is an illustration of the workspace, not a real account.</div>
      </div></div>
    </div>
  </section>

  <section class="section" id="apply">
    <div class="shead reveal">
      <span class="eyebrow">Getting listed</span>
      <h2>Apply once. A person reviews it.</h2>
      <p>Listing is free. There is no automatic approval and no paying to rank, which is the only reason the badge is worth anything to the client reading it.</p>
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
        <p class="muted" style="margin-top:18px;font-size:14.5px">Applications are reviewed in the order they arrive. You will hear back either way.</p>
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
      <p>Winning the brief is the visible part of the job. Everything after it is where events quietly go wrong, and where a shared workspace earns its place.</p>
    </div>
    <div class="cards cap-grid stagger">
      <div class="card"><h3>Budgets that reconcile</h3><p>Allocate by category, land every quote, deposit and balance against a line, and watch allocated, spent and remaining stay in agreement. An alert fires at 85%, not after the fact.</p></div>
      <div class="card"><h3>Phases and tasks</h3><p>Each event breaks into phases with their own checklists. Tasks carry an owner, a due date and a status, so the progress bar counts finished work instead of guessing.</p></div>
      <div class="card"><h3>Bookings end to end</h3><p>Request, quote, accept, contract, deposit, balance, completion. Six states, each timestamped, so nothing important was agreed in a chat you cannot find in December.</p></div>
      <div class="card"><h3>A team with real roles</h3><p>Managers, coordinators and assistants each get the access their job needs and see only the events they are assigned to. Adding someone costs 2 credits, once.</p></div>
      <div class="card"><h3>A client portal</h3><p>Share progress, the budget and decisions that need a yes through a link, without handing the client the keys to your workspace or your cost base.</p></div>
      <div class="card"><h3>Messaging in context</h3><p>Every thread sits against the booking it belongs to, so the quote, the revision and what was finally agreed stay together and survive a change of coordinator.</p></div>
    </div>
  </section>

  <section class="section">
    <div class="shead reveal">
      <span class="eyebrow">Your team</span>
      <h2>Three roles, and nobody sees more than they should</h2>
      <p>A coordinator running the day does not need your margins, and an assistant chasing a florist does not need the whole client list.</p>
    </div>
    <div class="cards stagger">
      <div class="card"><h3>Manager</h3><p>Full access to the events they own: budget, costs, bookings, team and the client portal. The only role that can change an allocation or accept a quote.</p></div>
      <div class="card"><h3>Coordinator</h3><p>Runs delivery on the events they are assigned to, covering tasks, timeline and supplier contact, without budget figures or supplier pricing.</p></div>
      <div class="card"><h3>Assistant</h3><p>Works the task list on a single event. Can complete, comment and upload, and sees nothing about money, other events or other clients.</p></div>
    </div>
  </section>

  <section class="section">
    <div class="dark" style="padding-block:clamp(40px,6vw,76px)">
      <div class="shead reveal">
        <span class="eyebrow">The client portal</span>
        <h2>What the client sees, and <span class="mark">what stays yours</span></h2>
        <p>Being transparent with a client should not mean handing over your cost base. The portal is a deliberate slice of the workspace, not a login to it.</p>
      </div>
      <div class="split-2 stagger">
        <div class="tier t-agg"><h4>They see</h4><p>Progress against phases, the budget as you have chosen to present it, confirmed bookings, decisions waiting on them, and the documents you shared. Enough that they stop calling for updates.</p></div>
        <div class="tier t-private"><h4>They never see</h4><p>Your supplier rates, your margin, internal notes, other clients, your team&rsquo;s task chatter, or any event you have not shared with them. There is no permission that opens it.</p></div>
      </div>
      <div class="note reveal">
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#a49ff0" stroke-width="2"><path d="M12 2 4 6v6c0 5 3.4 9.1 8 10 4.6-.9 8-5 8-10V6Z"/><path d="m9 12 2 2 4-4"/></svg>
        Exporting a client-ready budget or progress pack costs 1 credit, and records the figures exactly as they stood at that moment.
      </div>
    </div>
  </section>

  <section class="section" id="cta">
    <div class="cta reveal">
      <h2>Start with 200 free credits</h2>
      <p>No card, no subscription and no sales call. Whichever side of the marketplace you are on, the first 200 credits are on us and nothing renews.</p>
      <div class="cta-actions">
        <a class="btn btn-green" href="index.html#start">Planning an event <span class="cap">&#8599;</span></a>
        <a class="btn btn-light" href="#apply">Apply to be listed <span class="cap">&#8599;</span></a>
      </div>
    </div>
  </section>
"""
write("marketplace.html", mk + FOOTER)
print("\nAll pages generated.")

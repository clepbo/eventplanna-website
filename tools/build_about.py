# -*- coding: utf-8 -*-
"""Generate about.html.

The old site had an About page at /about/ and the new one had dropped it. The
substance here is carried over from that page rather than invented: the mission
and vision, the problem statement and the founding team are all theirs.

Five deliberate departures from the old copy:
  * every reference to the vendor directory is rewritten to the planner
    marketplace, because vendors are no longer part of the product;
  * the "2,400+ Vendors Onboard" figure is dropped rather than restated about
    planners, since no such number exists for planners and inventing one is
    not an option;
  * the counting stat strip is gone at the client's request. The same figures
    still appear once, as prose, in the problem statement where they are
    making an argument rather than being decoration;
  * the founders section is gone at the client's request. Nothing else on the
    page named a person, so no other copy had to move;
  * everything about the company's registration and its address is gone at the
    client's request: the CAC number, the date of incorporation, the registered
    address, the headquarters and the whole "Verified and registered" section.
    The cities that remain on the page are the markets the product serves, not
    places the company can be found.

Nothing on this page is invented. Where a claim is the company's own ("80%",
"$20B+", "55+"), it is reproduced as the company states it.
"""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from pagekit import head, FOOTER, write


# Each problem carries a small drawing of itself. The review asked for the
# section to be infographic rather than six paragraphs in six boxes, so the
# figure is the first thing in the card and the prose explains it rather than
# the other way round.
#
# Nothing in a figure is a new claim. Every number drawn here (ten suppliers,
# seven tools, fifty five competitors) is already stated in the copy above the
# section, and the figures that are not numbers draw a situation rather than a
# measurement.


def _bars():
    """Ten suppliers against one budget line. Three of them are over it."""
    hs = [38, 64, 52, 88, 45, 96, 30, 71, 58, 84]
    bars = "".join('<i style="--h:%d%%"%s></i>'
                   % (h, ' class="over"' if h > 80 else '') for h in hs)
    return ('<div class="pfig pfig-bars"><span class="pf-line"><em>budget</em></span>%s</div>'
            % bars)


def _chat():
    say = [("them", "Who did your cousin use?"),
           ("you", "Let me ask her"),
           ("them", "She says he is booked till May")]
    return ('<div class="pfig pfig-chat">%s</div>'
            % "".join('<span class="pf-b %s">%s</span>' % (w, t) for w, t in say))


def _tools():
    out = "".join('<span class="pf-chip">%s</span>' % t
                  for t in ["Docs", "Excel", "WhatsApp", "Email", "Bank app", "Instagram", "Notes"])
    return ('<div class="pfig pfig-tools">%s<span class="pf-arrow">&rarr;</span>'
            '<span class="pf-chip on">One</span></div>' % out)


def _pay():
    rows = [("Venue deposit", "ok"), ("Catering part payment", "ok"),
            ("Decor balance", "no"), ("Photography deposit", "ok")]
    body = "".join('<span class="pf-row"><em>%s</em><b class="%s">%s</b></span>'
                   % (n, k, "receipt" if k == "ok" else "no receipt") for n, k in rows)
    return '<div class="pfig pfig-pay">%s</div>' % body


def _thread():
    steps = [("Brief agreed", ""), ("Revision", "gone"), ("Final approval", "")]
    body = "".join('<span class="pf-node %s"><i></i>%s</span>' % (k, n) for n, k in steps)
    return '<div class="pfig pfig-thread">%s</div>' % body


def _dots():
    return ('<div class="pfig pfig-dots">%s<span class="pf-none">none of them built here</span></div>'
            % ('<i></i>' * 55))


PROBLEMS = [
    (_bars(), "Budget chaos", "Ten or more suppliers",
     "Spend tracked across ten or more suppliers in a spreadsheet, losing money and hours to "
     "reconciling manual transfers."),
    (_chat(), "No way to check a planner", "Zero checked directories",
     "There is no vetted list of professionals. Clients go on WhatsApp recommendations and "
     "whoever a friend used last year."),
    (_tools(), "Five to seven tools", "One job, seven places",
     "Docs, Excel, WhatsApp, email, bank apps and social media, with no single source of truth "
     "and nothing that agrees with anything else."),
    (_pay(), "Payments nobody can trace", "No audit trail",
     "Manual transfers, no receipts and no structured invoices. A client disputes a payment and "
     "there is nothing to show them."),
    (_thread(), "The trail goes cold", "No documented history",
     "Briefs live in direct messages. When a disagreement arrives, the decision everyone "
     "remembers differently was never written down."),
    (_dots(), "Fifty five tools, none for here", "Built somewhere else",
     "Not one of them is designed around naira, local bank rails or the way Nigerian agencies "
     "actually work."),
]


def problem_cards():
    return "".join(
        '      <div class="prob">%s<div class="prob-body"><span class="prob-tag">%s</span>'
        '<h3>%s</h3><p>%s</p></div></div>\n' % (fig, tag, head, body)
        for fig, head, tag, body in PROBLEMS)


DIFFS = [
    ("Local first", "Naira payments, local bank integrations, and an interface that matches how Nigerian agencies already work."),
    ("Comprehensive", "Replace seven tools with one: clients, budgets, bookings, payments, timelines and team."),
    ("Accessible pricing", "Credits, not an eye watering monthly fee, so a solo planner and a large agency reach the same tools."),
    ("Mobile first", "Nigerian planners work on their phones, so the product is designed for a phone and fully works on one."),
    ("AI where it earns it", "Budget suggestions, planner matching and timelines trained on Nigerian market data, not US defaults."),
]


TICK_G = ('<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" '
          'stroke-width="2.8"><path d="M20 6 9 17l-5-5"/></svg>')


def diffs(items):
    return "".join('          <div class="diff">%s<div><b>%s</b><p>%s</p></div></div>\n'
                   % (TICK_G, h, b) for h, b in items)


def cards(items):
    return "".join('      <div class="card"><h3>%s</h3><p>%s</p></div>\n' % (h, b) for h, b in items)


p = head("About | EventPlanna",
         "EventPlanna is building Nigeria's all in one event management platform. Our mission, the "
         "problem we are solving, what makes it different and the founding team.",
         "about.html")

p += """
  <header class="phero">
    <div class="phero-grid">
      <div>
        <span class="eyebrow fade-up">Who we are</span>
        <h1 class="fade-up d1">Building the future of <span class="hl">event planning</span> in Nigeria.</h1>
        <p class="lead fade-up d2">EventPlanna is Nigeria&rsquo;s first all in one event management platform, built for the professional planners who run other people&rsquo;s biggest days for a living.</p>
        <div class="hero-actions fade-up d3"><a class="btn btn-dark" href="index.html#start">Get started <span class="cap">&#8599;</span></a><a class="btn btn-light" href="#problem">The problem we are solving <span class="cap">&#8599;</span></a></div>
      </div>
      <div class="fade-up d2"><div class="ui-card chartbox">
        <div class="ui-head"><div><div class="ui-title">One tool instead of seven</div><div class="ui-sub">What a Nigerian planner runs on today</div></div><span class="delta warn">Replaced</span></div>
        <div style="margin-top:4px">
          <div class="prow"><span class="nm">Spreadsheets</span><span class="track"><i style="--w:100%;background:var(--c-neutral)"></i></span><span class="val">out</span></div>
          <div class="prow"><span class="nm">Group chats</span><span class="track"><i style="--w:100%;background:var(--c-neutral)"></i></span><span class="val">out</span></div>
          <div class="prow"><span class="nm">Bank apps</span><span class="track"><i style="--w:100%;background:var(--c-neutral)"></i></span><span class="val">out</span></div>
          <div class="prow"><span class="nm">Docs and email</span><span class="track"><i style="--w:100%;background:var(--c-neutral)"></i></span><span class="val">out</span></div>
          <div class="prow"><span class="nm">EventPlanna</span><span class="track"><i style="--w:100%"></i></span><span class="val">in</span></div>
        </div>
        <div class="ui-sub" style="margin-top:14px">Clients, budgets, bookings, payments, timelines and team collaboration, in one place.</div>
      </div></div>
    </div>
  </header>

  <section class="statement wide">
    <p data-words data-green="understands|naira|and|the|way|Nigerians|plan">We are building software that understands naira, local supplier culture, and the way Nigerians plan their most important moments.</p>
  </section>

  <section class="section" id="purpose">
    <div class="shead reveal">
      <span class="eyebrow">Our purpose</span>
      <h2>Mission and vision</h2>
      <p>Two sentences we are willing to be held to.</p>
    </div>
    <div class="split-2 stagger">
      <div class="tier t-agg"><h4>Our mission</h4><p>To become Nigeria&rsquo;s first all in one event management platform, so professional planning agencies can run their entire operation from a single, well designed tool built for the African market.</p></div>
      <div class="tier t-private"><h4>Our vision</h4><p>To be the HoneyBook for Nigeria, and then for the whole of Pan-Africa. A platform where every event professional on the continent has tools that understand their local context, payment rails and culture.</p></div>
    </div>
  </section>

  <section class="section" id="problem">
    <div class="shead reveal">
      <span class="eyebrow">The problem</span>
      <h2>Most Nigerian planners still run on <span class="mark">WhatsApp and Excel</span></h2>
      <p>By the company&rsquo;s own count, around 80% of them. In an industry worth more than $20 billion, with over 55 competing tools, not one was built for Nigerian event planning agencies. We mapped the pain points first, then built against them.</p>
    </div>
    <div class="probs stagger">
""" + problem_cards() + """    </div>
  </section>

  <section class="section" id="where">
    <div class="shead reveal">
      <span class="eyebrow">Where we work</span>
      <h2>Built in Nigeria, <span class="mark">for Nigeria</span></h2>
      <p>A sharp focus on the commercial heartbeats of the country and, after that, the continent. Naira pricing, local bank rails and local supplier culture, because that is what the work actually runs on.</p>
    </div>
    <div class="diffs wide stagger">
""" + diffs(DIFFS) + """    </div>
  </section>

  <section class="section" id="cta">
    <div class="cta reveal">
      <h2>Ready to run your events on it?</h2>
      <p>200 free credits on signup. No card, no subscription, and nothing to cancel if it turns out not to be for you.</p>
      <div class="cta-actions">
        <a class="btn btn-green" href="marketplace.html">Find a planner <span class="cap">&#8599;</span></a>
        <a class="btn btn-light" href="marketplace.html#for-planners">I&rsquo;m a planner <span class="cap">&#8599;</span></a>
      </div>
    </div>
  </section>
"""
write("about.html", p + FOOTER)

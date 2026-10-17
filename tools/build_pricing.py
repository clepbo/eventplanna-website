# -*- coding: utf-8 -*-
"""Generate pricing.html.

    python tools/build_pricing.py

This page used to be hand-maintained and patched by tools/fix_copy.py, which is
how it drifted a release behind the generated pages more than once. It is
generated now, from the same chrome as everything else.

The packs are the five from the old eventplanna.com, reproduced as the client
supplied them: name, strapline, credits and price. Two deliberate decisions
about those figures:

  * the per-credit line is computed here rather than copied. The old site
    printed N13.08 against the Premium pack, which does not follow from 5,600
    credits at N85,000; every other pack's figure does follow. Rather than
    reprint a number the page's own arithmetic contradicts, each one is
    divided out, and the Premium discrepancy is flagged to the client.
  * "about N events" is gone. It was derived from a 5-credit event and read as
    a claim about capacity rather than a unit price.

Nothing here invents a figure. The free 200 credits on signup and the four
chargeable actions are the product's own, carried over unchanged.
"""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from pagekit import head, FOOTER, write


def naira(n):
    return "&#8358;" + "{:,}".format(n)


#         name,           for whom,                       credits,  naira,  popular
PACKS = [
    ("Starter",      "Perfect for small events",            500,   10000, False),
    ("Standard",     "Perfect for growing needs",          1200,   20000, False),
    ("Professional", "Best value for planners",            3000,   45000, True),
    ("Premium",      "For frequent event planners",        5600,   85000, False),
    ("Enterprise",   "For event businesses and agencies", 15000,  180000, False),
]

CLOCK = ('<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" '
         'stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3.2 1.9"/></svg>')


def per(credits, price):
    v = price / float(credits)
    return "&#8358;%s per credit" % (("%.2f" % v).rstrip("0").rstrip("."))


def packs():
    out = ""
    for name, who, credits, price, pop in PACKS:
        out += ('      <div class="pack%s">\n' % (" on" if pop else "")
                + ('        <div class="pack-flag">Most popular</div>\n' if pop else "")
                + '        <h3>%s Pack</h3>\n' % name
                + '        <div class="pack-for">%s</div>\n' % who
                + '        <div class="pack-c">%s <span>credits</span></div>\n' % "{:,}".format(credits)
                + '        <div class="pack-n">%s</div>\n' % naira(price)
                + '        <div class="pack-u">%s</div>\n' % per(credits, price)
                + '        <div class="pack-v">%s Valid for one full year</div>\n' % CLOCK
                + '        <a class="btn %s" href="index.html#start">Buy credits <span class="cap">&#8599;</span></a>\n'
                  % ("btn-green" if pop else "btn-light")
                + '      </div>\n')
    return out


def rows():
    out = ('          <tr><td>Free on signup</td><td>&#8358;0</td><td>200</td>'
           '<td>&mdash;</td><td>One year</td></tr>\n')
    for name, who, credits, price, pop in PACKS:
        out += ('          <tr><td>%s Pack</td><td>%s</td><td>%s</td><td>%s</td>'
                '<td>One year</td></tr>\n'
                % (name, naira(price), "{:,}".format(credits),
                   per(credits, price).replace(" per credit", "")))
    return out


p = head("Pricing | EventPlanna",
         "Credit packs from &#8358;10,000. No subscription and no card on file: you buy credits once "
         "and spend them on four actions. Every new account starts with 200 free credits.",
         "pricing.html")

p += """
  <section class="section" style="padding-top:clamp(96px,12vw,150px);padding-bottom:20px">
    <div class="shead center reveal">
      <span class="eyebrow">Pricing</span>
      <h2>No subscription. <span class="mark">You pay for actions.</span></h2>
      <p>Event work is seasonal, so a monthly fee through a quiet quarter is a tax on a bad month. Buy a pack of credits, spend them on four actions, and let the account sit idle for free when there is nothing on.</p>
    </div>
    <div class="packs stagger">
""" + packs() + """    </div>
    <p class="center muted" style="font-size:13px;margin-top:26px">Prices are in naira and include VAT where it applies. Every new account starts with <b>200 free credits</b>, and a pack is valid for one full year from the day you buy it.</p>
  </section>

  <section class="section" id="how-credits" style="padding-bottom:20px">
    <div class="shead reveal">
      <span class="eyebrow">What a credit buys</span>
      <h2>Four actions draw down your balance</h2>
      <p>Nothing else costs a credit. Browsing the directory, reading a profile, messaging a planner and viewing your own budget are free, always.</p>
    </div>
    <div class="cards pay-grid stagger">
      <div class="card"><h3>Create an event <span class="cost">5</span></h3><p>Builds the workspace from the event type: phases, a starter checklist, a category budget and a client portal.</p></div>
      <div class="card"><h3>Booking request <span class="cost">5</span></h3><p>Carries the date, headcount and budget to the planner, so what comes back is a priced quote rather than a question.</p></div>
      <div class="card"><h3>Invite a team member <span class="cost">2</span></h3><p>Adds a coordinator or assistant with their own role and assigned events. Charged once, not monthly.</p></div>
      <div class="card"><h3>Export a report <span class="cost">1</span></h3><p>A client-ready budget or progress pack, recording the figures as they stood at the moment you exported.</p></div>
    </div>
  </section>

  <section class="section">
    <div class="shead reveal"><span class="eyebrow">Worked example</span><h2>What one real event actually costs</h2><p>A 400-guest traditional wedding: four booking requests, two coordinators and two client exports.</p></div>
    <div class="split-2 stagger">
      <div class="card">
        <h3>31 credits, end to end</h3>
        <p>Create the event: 5. Four booking requests: 20. Two team invites: 4. Two client exports: 2.</p>
        <div class="rail">
          <span class="done">5 create</span><span class="done">20 requests</span><span class="done">4 invites</span><span class="done">2 exports</span><span class="now">31 total</span>
        </div>
      </div>
      <div class="card">
        <h3>&#8358;620 on the Starter pack</h3>
        <p>31 credits at &#8358;20 each. On Professional the same event costs &#8358;465, and on Enterprise &#8358;372. Your 200 free credits cover it six times over before you pay anything.</p>
        <div class="kpi-row" style="margin-top:4px">
          <div class="kpi"><div class="kpi-label">Starter</div><div class="kpi-value" data-count="&#8358;620">&#8358;0</div><div class="delta info">&#8358;20 / credit</div></div>
          <div class="kpi"><div class="kpi-label">Professional</div><div class="kpi-value" style="color:var(--green)" data-count="&#8358;465">&#8358;0</div><div class="delta up">&#8358;15 / credit</div></div>
        </div>
      </div>
    </div>
  </section>

  <section class="section">
    <div class="shead reveal"><span class="eyebrow">Planners</span><h2>Planners do not pay to be listed</h2></div>
    <div class="split-2 stagger">
      <div class="card"><h3>Listing is free</h3><p>Applying, being reviewed, appearing in the directory and receiving briefs all cost nothing. Replying to a brief with a quote costs nothing either, because the credit was spent by whoever sent it.</p></div>
      <div class="card"><h3>Payment processing, at cost</h3><p>Deposits and balances are paid in-app. Card payments carry the gateway fee plus VAT on that fee, itemised before anyone confirms; bank transfer is free. Funds are released once delivery is confirmed.</p></div>
    </div>
  </section>

  <section class="section">
    <div class="shead reveal"><span class="eyebrow">Compare</span><h2>Every pack, side by side</h2></div>
    <div class="tbl-wrap reveal">
      <table>
        <thead><tr><th>Pack</th><th>Price</th><th>Credits</th><th>Per credit</th><th>Valid for</th></tr></thead>
        <tbody>
""" + rows() + """        </tbody>
      </table>
    </div>
  </section>

  <section class="section" id="cta">
    <div class="cta reveal">
      <h2>Try it on 200 free credits first</h2>
      <p>No card, nothing to cancel, and a full year to spend what you buy.</p>
      <div class="cta-actions">
        <a class="btn btn-green" href="marketplace.html#directory">Planning an event <span class="cap">&#8599;</span></a>
        <a class="btn btn-light" href="marketplace.html#for-planners">I am a planner <span class="cap">&#8599;</span></a>
      </div>
    </div>
  </section>
"""
write("pricing.html", p + FOOTER)

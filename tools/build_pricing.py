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
    a claim about capacity rather than a unit price;
  * the "What a credit buys" section came out at the client's request;
  * the worked example is built from the credit matrix in the Figma file
    (node 2778-24553), read out of the live document. The page previously said
    a wedding came to 31 credits off a four-action model that the product does
    not have: creating an event alone is 50, a team member is 30 a month, and
    guests are charged per head above the first 50. There are eight categories
    of chargeable action, not four.

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
         "and spend them as you go. Every new account starts with 200 free credits.",
         "pricing.html")

p += """
  <section class="section" style="padding-top:clamp(96px,12vw,150px);padding-bottom:20px">
    <div class="shead center reveal">
      <span class="eyebrow">Pricing</span>
      <h2>No subscription. <span class="mark">You pay for actions.</span></h2>
      <p>Event work is seasonal, so a monthly fee through a quiet quarter is a tax on a bad month. Buy a pack of credits, spend them only when you do something, and let the account sit idle for free when there is nothing on.</p>
    </div>
    <div class="packs stagger">
""" + packs() + """    </div>
    <p class="center muted" style="font-size:13px;margin-top:26px">Prices are in naira and include VAT where it applies. Every new account starts with <b>200 free credits</b>, and a pack is valid for one full year from the day you buy it.</p>
  </section>

  <section class="section">
    <div class="shead reveal"><span class="eyebrow">Worked example</span><h2>What one real event actually costs</h2><p>A 400-guest traditional wedding: the event set up, its budget, the guest list and RSVPs, four vendors contacted, two coordinators added and the client portal opened.</p></div>
    <div class="split-2 stagger">
      <div class="card">
        <h3>470 credits, end to end</h3>
        <div class="tbl-wrap" style="margin-top:14px">
          <table>
            <tbody>
              <tr><td>Create the event</td><td class="num">50</td></tr>
              <tr><td>Budget set up</td><td class="num">25</td></tr>
              <tr><td>Guest list, first 50</td><td class="num">30</td></tr>
              <tr><td>Guests 51 to 200, at 0.5 each</td><td class="num">75</td></tr>
              <tr><td>Guests 201 to 400, at 0.3 each</td><td class="num">60</td></tr>
              <tr><td>RSVP form</td><td class="num">40</td></tr>
              <tr><td>First contact with 4 vendors, at 15</td><td class="num">60</td></tr>
              <tr><td>2 coordinators added, at 30</td><td class="num">60</td></tr>
              <tr><td>Client portal for the event</td><td class="num">50</td></tr>
              <tr><td>Budget versus actual tracking</td><td class="num">20</td></tr>
              <tr><td><b>Total</b></td><td class="num"><b>470</b></td></tr>
            </tbody>
          </table>
        </div>
      </div>
      <div class="card">
        <h3>&#8358;9,400 on the Starter pack</h3>
        <p>470 credits at &#8358;20 each. On Professional the same event costs &#8358;7,050, and on Enterprise &#8358;5,640. Basic vendor search, archiving the event, push notifications and the first 100 emails a month are all free and are not in that number.</p>
        <div class="kpi-row" style="margin-top:4px">
          <div class="kpi"><div class="kpi-label">Starter</div><div class="kpi-value" data-count="&#8358;9,400">&#8358;0</div><div class="delta info">&#8358;20 / credit</div></div>
          <div class="kpi"><div class="kpi-label">Professional</div><div class="kpi-value" style="color:var(--green)" data-count="&#8358;7,050">&#8358;0</div><div class="delta up">&#8358;15 / credit</div></div>
        </div>
        <p class="muted" style="font-size:13.5px;margin-top:14px">Your 200 free credits cover creating a first event, its budget, a 50-guest list and four vendor conversations, with a little left over.</p>
      </div>
    </div>
    <div class="note reveal">
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#5047e1" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg>
      Not every event needs every line. A 60-guest dinner with two vendors and no portal is nearer 150 credits.
    </div>
  </section>

  <section class="section">
    <div class="shead reveal"><span class="eyebrow">Planners</span><h2>Planners do not pay to be listed</h2><p>Being listed is free. The only money that reaches us from a planner is a share of a paid consultation.</p></div>
    <div class="cards stagger">
      <div class="card"><h3>Listing is free</h3><p>Applying, being reviewed, appearing in the directory and receiving briefs all cost nothing. Replying to a brief with a quote costs nothing either, because the credit was spent by whoever sent it.</p></div>
      <div class="card"><h3>Consultation fee, 1.5%</h3><p>Where a planner charges for a consultation, EventPlanna takes <b>1.5% of that fee</b>. That is our share only. The payment provider&rsquo;s own charges sit on top and are paid by the client when they pay for the consultation.</p></div>
      <div class="card"><h3>Payment processing, at cost</h3><p>Deposits and balances are paid in-app through a payment provider. Whichever method the client picks, the provider&rsquo;s charge and the VAT on it are passed through at cost and itemised before anyone confirms. Funds are released once delivery is confirmed.</p></div>
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

# -*- coding: utf-8 -*-
"""Generate playground.html, the workspace you can use without an account.

    python tools/build_playground.py

"Tour the workspace" used to scroll to six paragraphs describing the product.
A planner deciding whether to sign up does not want to read six paragraphs;
they want to know what it is like to run an event on it. So this is the
workspace, loaded with one event already in flight, and everything on it
works: tick a task and the progress and the dashboard move, record a payment
and the budget reconciles and the overspend alert fires, push a booking
through its six states and the timeline stamps, switch role and the money
disappears for the people who should not see it, open the client view and
only the client's slice is left.

It is a simulation, not a demo video and not a signed-out copy of the real
app: the state lives in the page and resets on reload, so nothing can be
broken and nothing has to be cleaned up afterwards. The numbers are the ones
the rest of the site already uses for this sample event, so the figure a
planner sees on the marketplace page is the figure they see here.

The behaviour is in assets/playground.js rather than assets/app.js, which is
the scroll and motion engine and has nothing to do with this.
"""
import sys, os

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from pagekit import head, FOOTER, write, V

p = head("The workspace | EventPlanna",
         "Run a sample event on EventPlanna without signing up: budget, phases and tasks, "
         "bookings, team roles and the client portal, all working, all in your browser.",
         "marketplace.html")

p += """
  <header class="phero" style="padding-bottom:clamp(20px,3vw,34px)">
    <div class="pg-head">
      <div>
        <span class="eyebrow fade-up">The workspace</span>
        <h1 class="fade-up d1">Run an event on it. <span class="hl">No account.</span></h1>
        <p class="lead fade-up d2">This is the workspace with one wedding already in flight. Everything on this page works: tick a task, record a payment, move a booking on, change who you are. <b>Nothing is saved and nothing can be broken</b>, so go and break it.</p>
      </div>
      <div class="pg-controls fade-up d2">
        <label class="pg-role">
          <span>You are</span>
          <select class="fld" data-pg-role aria-label="Your role on this event">
            <option value="manager">Manager</option>
            <option value="coordinator">Coordinator</option>
            <option value="assistant">Assistant</option>
          </select>
        </label>
        <button class="btn btn-light btn-sm" type="button" data-pg-reset>Start over</button>
      </div>
    </div>
  </header>

  <section class="section" id="workspace" style="padding-top:0">
    <div class="pg" data-pg>
      <div class="pg-app">
        <aside class="pg-side">
          <div class="pg-brand"><img src="assets/logo-dark.svg" alt="EventPlanna"></div>
          <nav class="pg-nav" data-pg-nav></nav>
          <div class="pg-credits">
            <em>Credit balance</em>
            <b data-pg-credits>730</b><span>/1,200</span>
            <small>Spent as you go. <a href="pricing.html">What things cost</a></small>
          </div>
        </aside>
        <div class="pg-main">
          <div class="pg-top">
            <span class="pg-search">Search workspace&hellip;<i>/</i></span>
            <span class="pg-user"><i data-pg-ini>AM</i><b data-pg-name>Adaeze Mbakwe</b></span>
          </div>
          <div class="pg-view" data-pg-body><div class="pg-boot">Loading the workspace&hellip;</div></div>
        </div>
      </div>
    </div>
    <p class="pg-note">A sample event, held in this page only. Reload and it is back how it started.</p>
  </section>

  <section class="section">
    <div class="cta reveal">
      <h2>That, with your own events in it</h2>
      <p>Everything you just used is what you get on signup, with 200 free credits and no card.</p>
      <div class="cta-actions">
        <a class="btn btn-green" href="index.html#start">Create an account <span class="cap">&#8599;</span></a>
        <a class="btn btn-light" href="pricing.html">What it costs <span class="cap">&#8599;</span></a>
      </div>
    </div>
  </section>
"""

tail = FOOTER.replace('<script src="assets/app.js',
                      '<script src="assets/playground.js?v=%s"></script>\n<script src="assets/app.js' % V)
write("playground.html", p + tail)

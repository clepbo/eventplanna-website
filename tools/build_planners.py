# -*- coding: utf-8 -*-
"""Generate planners.html.

Planners now have two reasons to be here: get listed on the marketplace
(apply, a person approves, clients find you) and run the work. Sourcing from a
vendor directory is gone, because vendors are gone.

The apply form posts nowhere yet. It says so rather than pretending.
"""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from pagekit import head, FOOTER, write, ticks

p = head("For event planners | EventPlanna",
         "Apply to be listed on the EventPlanna marketplace, then run budgets, bookings, tasks and "
         "your team from one workspace. Credits, not a subscription.",
         "planners.html")

p += """
  <header class="phero">
    <div class="phero-grid">
      <div>
        <span class="eyebrow fade-up">For event planners</span>
        <h1 class="fade-up d1">Get found. Then <span class="hl">run the work</span>.</h1>
        <p class="lead fade-up d2">Apply once to be listed on the marketplace. Once you are approved, clients can find you, brief you and book you, and <b>budgets, tasks, your team and the client portal</b> all live in the same place. You pay for actions, not for access, so a quiet quarter costs you nothing.</p>
        <div class="hero-actions fade-up d3"><a class="btn btn-dark" href="#apply">Apply to be listed <span class="cap">&#8599;</span></a><a class="btn btn-light" href="#workspace">Tour the workspace <span class="cap">&#8599;</span></a></div>
      </div>
      <div class="fade-up d2"><div class="ui-card chartbox">
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
        <div class="ui-sub" style="margin-top:12px">Progress is a count of completed tasks, not an estimate.</div>
      </div></div>
    </div>
  </header>

  <section class="statement wide">
    <p data-words data-green="your|business|stops|living|in|your|head">The planners who last are not the ones who love it most. They are the ones with systems, so your business stops living in your head.</p>
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

  <section class="section">
    <div class="shead reveal"><span class="eyebrow">Pricing, briefly</span><h2>You pay for actions, not for access</h2><p>Event work is seasonal. A monthly fee through a quiet quarter is a tax on a bad month, so there is no monthly fee.</p></div>
    <div class="cards pay-grid stagger">
      <div class="card"><h3>Create an event <span class="cost">5</span></h3><p>Builds the workspace: phases, a starter checklist, a category budget and a client portal, generated from the event type.</p></div>
      <div class="card"><h3>Booking request <span class="cost">5</span></h3><p>Carries your date, headcount and budget to the other side, so what comes back is a priced quote rather than a question.</p></div>
      <div class="card"><h3>Invite a team member <span class="cost">2</span></h3><p>Adds a coordinator or assistant with their own role, permissions and assigned events. Charged once, not monthly.</p></div>
      <div class="card"><h3>Export a report <span class="cost">1</span></h3><p>A client-ready budget or progress pack as a document you can send, print or attach to an invoice.</p></div>
    </div>
    <div class="note reveal">
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#5047e1" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg>
      200 free credits on signup. Packs start at &#8358;10,000 for 500 credits and credits never expire. <a href="pricing.html" style="color:inherit;text-decoration:underline">See the packs</a>.
    </div>
  </section>

  <section class="section" id="cta">
    <div class="cta reveal">
      <h2>Put your next event in it and see</h2>
      <p>200 free credits is about 40 events. No card, no subscription, and nothing to cancel if it is not for you.</p>
      <div class="cta-actions">
        <a class="btn btn-green" href="pricing.html">See credit packs <span class="cap">&#8599;</span></a>
        <a class="btn btn-light" href="marketplace.html">See the marketplace <span class="cap">&#8599;</span></a>
      </div>
    </div>
  </section>
"""
write("planners.html", p + FOOTER)

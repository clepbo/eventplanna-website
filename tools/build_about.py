# -*- coding: utf-8 -*-
"""Generate about.html.

The old site had an About page at /about/ and the new one had dropped it. The
substance here is carried over from that page rather than invented: the mission
and vision, the problem statement and the founding team are all theirs.

Four deliberate departures from the old copy:
  * every reference to the vendor directory is rewritten to the planner
    marketplace, because vendors are no longer part of the product;
  * the "2,400+ Vendors Onboard" figure is dropped rather than restated about
    planners, since no such number exists for planners and inventing one is
    not an option;
  * the counting stat strip is gone at the client's request. The same figures
    still appear once, as prose, in the problem statement where they are
    making an argument rather than being decoration;
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
from pagekit import head, FOOTER, write, ticks

FOUNDERS = [
    ("Peter Abraham Asuquo", "CEO, Co-founder",
     "Sets product strategy and company direction, and still writes backend code."),
    ("Uyanwune Chukwuebuka", "COO, Co-founder",
     "Runs operations, HR and people strategy, and contributes to backend engineering, "
     "so the team and the codebase scale together."),
    ("Imoni Christopher Adobunu", "CTO, Co-founder",
     "Owns the technical vision: architecture, infrastructure decisions and the technology roadmap."),
    ("Adebodun Samuel", "DevOps Engineer, Co-founder",
     "Heads infrastructure and DevOps, from cloud architecture to CI/CD, so the platform stays "
     "scalable, secure and available."),
    ("Israel Oni", "Product Designer, Co-founder",
     "Leads product design, making every interface intuitive and tailored to African event professionals."),
    ("Emmanuel Anebi", "Senior Frontend Engineer, Co-founder",
     "Leads frontend engineering, turning the designs into fast, precise interfaces on every device."),
]

PROBLEMS = [
    ("Budget chaos", "Tracking spend across ten or more suppliers in spreadsheets, losing "
                     "money and hours reconciling manual transfers."),
    ("Finding a planner you can trust", "No checked directory of professionals. Clients rely on "
                     "WhatsApp recommendations and whoever a friend used last year."),
    ("Five to seven disconnected tools", "Google Docs, Excel, WhatsApp, email, bank apps and social "
                     "media, with no single source of truth."),
    ("Payment tracking", "Manual transfers, no receipts and no structured invoices. Clients dispute "
                     "payments and there is no audit trail."),
    ("No communication trail", "Client briefs live in WhatsApp DMs. When a dispute arrives, there is "
                     "no documented history of decisions or approvals."),
    ("Nothing built for here", "Fifty five competing tools, and not one designed around naira, local "
                     "bank rails or the way Nigerian agencies actually work."),
]

DIFFS = [
    ("Local first", "Built from the ground up for Nigeria: naira payments, local bank integrations "
                    "and an interface that matches how Nigerian agencies already work."),
    ("Comprehensive", "Replace seven tools with one: clients, budgets, bookings, payments, timelines "
                      "and team collaboration in a single platform."),
    ("Accessible pricing", "No eye watering monthly fee. Credits mean you pay for what you use, which "
                           "puts the same tools in reach of a solo planner and a large agency."),
    ("Mobile first", "Nigerian planners work on their phones, so the product is designed for a phone "
                     "first and is fully functional on one."),
    ("AI where it earns it", "Budget suggestions, planner matching and timeline generation trained on "
                             "Nigerian market data rather than US defaults."),
]


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
        <div class="hero-actions fade-up d3"><a class="btn btn-dark" href="index.html#start">Get started <span class="cap">&#8599;</span></a><a class="btn btn-light" href="#team">Meet the founders <span class="cap">&#8599;</span></a></div>
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
    <div class="cards cap-grid stagger">
""" + cards(PROBLEMS) + """    </div>
  </section>

  <section class="section" id="where">
    <div class="duo reveal">
      <div>
        <span class="eyebrow">Where we work</span>
        <h2 style="margin-top:16px">Built in Nigeria, <span class="mark">for Nigeria</span></h2>
        <p class="lead" style="margin-top:18px">A sharp focus on the commercial heartbeats of the country and, after that, the continent.</p>
        <ul class="ticks" style="margin-top:22px">
""" + ticks(["Lagos, Abuja, Port Harcourt, Ibadan and Enugu first",
             "Then Benin City, Owerri, Kano and Uyo",
             "Expansion target: Pan-Africa",
             "Naira pricing, local bank rails, local supplier culture"]) + """        </ul>
      </div>
      <div>
        <h3 style="font-size:clamp(20px,2.4vw,27px)">What makes it different</h3>
        <div class="cards stagger" style="margin-top:20px;grid-template-columns:1fr">
""" + cards(DIFFS[:3]) + """        </div>
      </div>
    </div>
  </section>

  <section class="section">
    <div class="shead reveal">
      <span class="eyebrow">Differentiators</span>
      <h2>Why this and not one of the other 55</h2>
    </div>
    <div class="cards cap-grid stagger">
""" + cards(DIFFS[3:]) + """    </div>
  </section>

  <section class="section" id="team">
    <div class="shead reveal">
      <span class="eyebrow">The team</span>
      <h2>Meet the founders</h2>
      <p>Builders from different disciplines, with one shared aim: fix event planning in Africa.</p>
    </div>
    <div class="cards cap-grid stagger">
""" + "".join('      <div class="card"><h3>%s</h3><p class="muted" style="margin-bottom:8px">%s</p><p>%s</p></div>\n'
              % (n, role, bio) for n, role, bio in FOUNDERS) + """    </div>
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

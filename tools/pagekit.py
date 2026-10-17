# -*- coding: utf-8 -*-
"""Shared page chrome for the EventPlanna site.

This lives in the repo on purpose. The pages are generated, so the generator is
the source of truth and has to be version controlled alongside its output.

Information architecture, after the October stakeholder review:
  vendors are gone entirely, and the marketplace is planners being found.
  Blog and Events are first-class because both already have a live backend.
"""
import io, os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
V = "5"                       # asset cache-busting version

NAV = [("marketplace.html", "Find a planner"),
       ("planners.html",    "For planners"),
       ("pricing.html",     "Pricing"),
       ("blog.html",        "Blog"),
       ("events.html",      "Events"),
       ("about.html",       "About"),
       ("faq.html",         "FAQ")]

# Light is the default. Dark is opt in and remembered per browser, applied
# before first paint so the page never flashes the wrong theme.
THEME_BOOT = ("<script>(function(){try{var t=localStorage.getItem('ep-theme');"
              "if(t==='dark')document.documentElement.setAttribute('data-theme','dark');}"
              "catch(e){}})();</script>\n")

TOGGLE = """    <button class="theme-toggle" type="button" aria-label="Switch to dark mode" title="Switch to dark mode">
      <svg class="t-moon" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg>
      <svg class="t-sun" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="4.2"/><path d="M12 2v2.6M12 19.4V22M4.2 4.2l1.9 1.9M17.9 17.9l1.9 1.9M2 12h2.6M19.4 12H22M4.2 19.8l1.9-1.9M17.9 6.1l1.9-1.9"/></svg>
    </button>
"""

TICK = ('<svg width="16" height="16" viewBox="0 0 24 24" fill="none" '
        'stroke="#5047e1" stroke-width="3"><path d="M20 6 9 17l-5-5"/></svg>')


def ticks(items):
    return "".join('          <li>%s %s</li>\n' % (TICK, i) for i in items)


def head(title, desc, current, home=False):
    links = "".join('      <a href="%s"%s>%s</a>\n'
                    % (h, ' aria-current="page"' if h == current else '', t)
                    for h, t in NAV)
    cta = "#start" if home else "index.html#start"
    return """<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>%s</title>
<meta name="description" content="%s">
<link rel="icon" href="assets/favicon.svg">
%s<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="preconnect" href="https://api.eventplanna.com">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="assets/styles.css?v=%s">
<link rel="stylesheet" href="assets/components.css?v=%s">
</head>
<body>

<div class="progress"><i></i></div>

<nav class="nav">
  <div class="nav-inner">
    <a class="logo" href="index.html"><img class="l-light" src="assets/logo-dark.svg" alt="EventPlanna"><img class="l-dark" src="assets/logo-light.svg" alt="EventPlanna"></a>
    <a class="chip" href="%s">Get started &#8599;</a>
    <div class="nav-links">
%s    </div>
%s    <a class="btn btn-dark btn-sm" href="%s">Start free <span class="cap">&#8599;</span></a>
    <button class="nav-toggle" aria-label="Menu" aria-expanded="false"><span></span><span></span></button>
  </div>
</nav>

<div class="wrap"><div class="shell">
""" % (title, desc, THEME_BOOT, V, V, cta, links, TOGGLE, cta)


FOOTER = """</div></div>

<footer>
  <div class="wrap">
    <div class="foot-grid">
      <div class="foot-brand">
        <a class="logo" href="index.html" style="height:28px"><img src="assets/logo-light.svg" alt="EventPlanna" style="height:28px"></a>
        <p>Find a planner who has been checked and approved, then run the whole event with them in one place.</p>
      </div>
      <div><h4>Marketplace</h4><a href="marketplace.html">Find a planner</a><a href="planners.html">For planners</a><a href="pricing.html">Pricing</a></div>
      <div><h4>Company</h4><a href="index.html">Home</a><a href="about.html">About</a><a href="blog.html">Blog</a><a href="events.html">Events</a><a href="faq.html">FAQ</a></div>
    </div>
    <div class="foot-bot">
      <div>
        <div>EventPlanna &middot; Victoria Island, Lagos, Nigeria.</div>
        <div style="margin-top:6px">&copy; 2026 EventPlanna. All rights reserved.</div>
      </div>
    </div>
  </div>
  <div class="foot-mark" aria-hidden="true">EventPlanna</div>
</footer>

<script src="assets/app.js?v=%s"></script>
<script src="assets/data.js?v=%s"></script>
</body>
</html>
""" % (V, V)


def write(name, body):
    io.open(os.path.join(ROOT, name), "w", encoding="utf-8", newline="\n").write(body)
    o, c = body.count("<div"), body.count("</div>")
    assert o == c, "%s: %d <div> vs %d </div>" % (name, o, c)
    print("  %-18s %6d bytes  divs %d/%d" % (name, len(body), o, c))

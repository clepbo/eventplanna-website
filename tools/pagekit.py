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
V = "8"                       # asset cache-busting version

# One marketplace entry, not two. "Find a planner" and "For planners" sat next
# to each other reading as near-duplicates, so both audiences now live on
# marketplace.html: the directory at the top, the planner half under
# #for-planners.
#
# FAQ came out of the bar at the client's request. The page is still there and
# still linked from the footer and from the pages that answer a question
# halfway; it was the fifth item competing for a click it rarely won.
NAV = [("marketplace.html", "Find a planner"),
       ("pricing.html",     "Pricing"),
       ("blog.html",        "Blog"),
       ("events.html",      "Events"),
       ("about.html",       "About")]

# The company's own accounts. Nothing here is a guess: these are the three URLs
# the client supplied, used verbatim.
#
# Each mark is drawn the way its owner draws it. Instagram's is an outline, so
# it is stroked; the other two are solid glyphs, and stroking those turns the
# Facebook f into a hollow outline of an f, which is what the first pass did.
SOCIALS = [
    ("Instagram", "https://www.instagram.com/theeventplanna/",
     'fill="none" stroke="currentColor" stroke-width="1.7"',
     '<rect x="2.7" y="2.7" width="18.6" height="18.6" rx="5.4"/>'
     '<circle cx="12" cy="12" r="4.1"/>'
     '<circle cx="17.3" cy="6.8" r="1.15" fill="currentColor" stroke="none"/>'),
    ("Facebook", "https://www.facebook.com/profile.php?id=61594179380852",
     'fill="currentColor" stroke="none"',
     '<path d="M13.5 21.9v-8.2h2.76l.41-3.2h-3.17V8.44c0-.93.26-1.56 1.59-1.56h1.7V4.01c-.3-.04-1.3-.13-2.48-.13-2.45 0-4.13 1.5-4.13 4.25v2.37H7.42v3.2h2.76v8.2z"/>'),
    ("LinkedIn", "https://www.linkedin.com/company/112656623/",
     'fill="currentColor" stroke="none"',
     '<path d="M6.17 21.3H2.72V9.2h3.45zM4.44 7.69a2 2 0 1 1 0-4.01 2 2 0 0 1 0 4.01M21.28 21.3h-3.44v-5.89c0-1.4-.03-3.2-1.96-3.2-1.96 0-2.26 1.53-2.26 3.1v5.99h-3.45V9.2h3.31v1.65h.05c.46-.87 1.58-1.79 3.26-1.79 3.49 0 4.13 2.3 4.13 5.28z"/>'),
]

SOCIAL_LINKS = "".join(
    '<a class="soc" href="%s" target="_blank" rel="noopener" aria-label="EventPlanna on %s" title="%s">'
    '<svg width="17" height="17" viewBox="0 0 24 24" %s stroke-linejoin="round">%s</svg></a>'
    % (url, name, name, attrs, path)
    for name, url, attrs, path in SOCIALS)

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


def head(title, desc, current, home=False, pre=""):
    """`pre` is markup placed between the nav and the rounded white shell.

    Everything on these pages lives inside .shell, which is a card: narrower
    than the window, with rounded corners and overflow hidden. The home hero
    has to grow to the full width of the window, which is impossible from
    inside that card, so it is emitted here instead of in the page body."""
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
    <div class="nav-links">
%s    </div>
%s    <a class="btn btn-dark btn-sm" href="%s">Start free <span class="cap">&#8599;</span></a>
    <button class="nav-toggle" aria-label="Menu" aria-expanded="false"><span></span><span></span></button>
  </div>
</nav>

%s<div class="wrap"><div class="shell">
""" % (title, desc, THEME_BOOT, V, V, links, TOGGLE, cta, pre)


FOOTER = """</div></div>

<footer>
  <div class="wrap">
    <div class="foot-grid">
      <div class="foot-brand">
        <a class="logo" href="index.html" style="height:28px"><img src="assets/logo-light.svg" alt="EventPlanna" style="height:28px"></a>
        <p>Find a planner who has been checked and approved, then run the whole event with them in one place.</p>
      </div>
      <div><h4>Marketplace</h4><a href="marketplace.html">Find a planner</a><a href="marketplace.html#for-planners">For planners</a><a href="pricing.html">Pricing</a></div>
      <div><h4>Company</h4><a href="index.html">Home</a><a href="about.html">About</a><a href="blog.html">Blog</a><a href="events.html">Events</a><a href="faq.html">FAQ</a></div>
    </div>
    <div class="foot-bot">
      <div>
        <div>EventPlanna &middot; Nigeria</div>
        <div style="margin-top:6px">&copy; 2026 EventPlanna. All rights reserved.</div>
      </div>
      <div class="socials">""" + SOCIAL_LINKS + """</div>
    </div>
  </div>
  <div class="foot-mark" aria-hidden="true">EventPlanna</div>
</footer>

<script src="assets/app.js?v=@V"></script>
<script src="assets/data.js?v=@V"></script>
</body>
</html>
""".replace("@V", V)


def write(name, body):
    io.open(os.path.join(ROOT, name), "w", encoding="utf-8", newline="\n").write(body)
    o, c = body.count("<div"), body.count("</div>")
    assert o == c, "%s: %d <div> vs %d </div>" % (name, o, c)
    print("  %-18s %6d bytes  divs %d/%d" % (name, len(body), o, c))

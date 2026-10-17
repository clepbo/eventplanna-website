# -*- coding: utf-8 -*-
"""Static checks for the EventPlanna site.

    python tools/check_site.py

Exits non-zero on any failure, so it is usable as a gate before pushing.
Covers the things that have actually broken on this project before:
dead links, unbalanced markup, classes with no rule, leftover vendor-facing
language, em dashes in prose, and inconsistent asset versions.
"""
import io, os, re, glob, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
os.chdir(ROOT)

pages = sorted(os.path.basename(p) for p in glob.glob("*.html"))
css = ""
for f in ("assets/styles.css", "assets/components.css"):
    css += io.open(f, encoding="utf-8").read()
css_classes = set(re.findall(r"\.(-?[A-Za-z_][\w-]*)", re.sub(r"/\*.*?\*/", "", css, flags=re.S)))
fail = 0

print("=" * 72)
print("1. DEAD LINKS")
print("=" * 72)
for p in pages:
    s = io.open(p, encoding="utf-8").read()
    ids = set(re.findall(r'\bid="([^"]+)"', s))
    bad = []
    for h in re.findall(r'href="([^"]*)"', s):
        if h.startswith(("http://", "https://", "mailto:", "tel:")):
            continue
        if h in ("#", ""):
            bad.append((h, "empty or placeholder")); continue
        if h.startswith("#"):
            if h[1:] not in ids:
                bad.append((h, "no such id on this page"))
            continue
        target, _, frag = h.partition("#")
        target = target.split("?")[0]          # cache-busting query is not part of the path
        if not os.path.exists(target):
            bad.append((h, "file missing")); continue
        if frag and frag not in set(re.findall(r'\bid="([^"]+)"',
                                   io.open(target, encoding="utf-8").read())):
            bad.append((h, "no such id on target"))
    n = len(re.findall(r'href="', s))
    print("  %-18s %3d hrefs   %s" % (p, n, "OK" if not bad else "%d DEAD" % len(bad)))
    for h, why in bad:
        print("      DEAD %-34s %s" % (h, why)); fail += 1

print()
print("=" * 72)
print("2. MARKUP BALANCE")
print("=" * 72)
for p in pages:
    s = io.open(p, encoding="utf-8").read()
    row = []
    for tag in ("div", "section", "ul", "table", "article"):
        o = len(re.findall(r"<%s[\s>]" % tag, s)); c = s.count("</%s>" % tag)
        row.append("%s %d/%d%s" % (tag, o, c, "" if o == c else " MISMATCH"))
        if o != c: fail += 1
    print("  %-18s %s" % (p, "  ".join(row)))

print()
print("=" * 72)
print("3. STYLESHEET BALANCE")
print("=" * 72)
# An edit that lands inside a comment leaves prose sitting in the rule stream,
# which the browser silently swallows along with whatever follows it.
for f in ("assets/styles.css", "assets/components.css"):
    s = io.open(f, encoding="utf-8").read()
    o, c = s.count("/*"), s.count("*/")
    ob, cb = s.count("{"), s.count("}")
    stray = re.findall(r"\*/\s*\n\s*[a-z][^{};\n]*\n", s)   # prose after a closed comment
    ok = o == c and ob == cb and not stray
    print("  %-24s comments %d/%d  braces %d/%d  %s"
          % (os.path.basename(f), o, c, ob, cb, "OK" if ok else "BROKEN"))
    for t in stray[:3]:
        print("      STRAY %s" % t.strip()[:60])
    if not ok:
        fail += 1

print()
print("=" * 72)
print("4. ORPHANED CLASSES")
print("=" * 72)
for p in pages:
    s = io.open(p, encoding="utf-8").read()
    used = set()
    for attr in re.findall(r'class="([^"]*)"', s):
        used.update(attr.split())
    orph = sorted(c for c in used if c not in css_classes)
    print("  %-18s %3d used   %s" % (p, len(used), "OK" if not orph else "ORPHANS: " + ", ".join(orph)))
    fail += len(orph)

print()
print("=" * 72)
print("5. REVIEW ITEMS")
print("=" * 72)

# vendor-FACING language. Incidental mentions (a planner booking a caterer) are
# accurate industry language and deliberately kept.
banned = ["vendors.html", "For Vendors", "Become a Vendor", "List your business",
          "verified vendors", "vendor directory", "clients.html"]
for b in banned:
    hits = sum(io.open(p, encoding="utf-8").read().count(b) for p in pages)
    print("  %-26s %d  %s" % (b, hits, "OK" if hits == 0 else "FOUND"))
    fail += hits

# em dashes in prose; table cells are a typographic marker, not copy
tot = 0
for p in pages:
    s = io.open(p, encoding="utf-8").read()
    body = re.sub(r"<script.*?</script>|<style.*?</style>|<!--.*?-->", " ", s, flags=re.S)
    body = re.sub(r"<td[^>]*>\s*&mdash;\s*</td>", " ", body)
    tot += len(re.findall(r"&mdash;", body))
print("  %-26s %d  %s" % ("em dashes in prose", tot, "OK" if tot == 0 else "FOUND"))
fail += tot

# asset versions must agree, or a visitor gets new markup with old CSS
vers = set(re.findall(r"assets/[a-z.]+\.(?:css|js)\?v=(\d+)",
           "".join(io.open(p, encoding="utf-8").read() for p in pages)))
print("  %-26s %s  %s" % ("asset versions", sorted(vers), "OK" if len(vers) == 1 else "INCONSISTENT"))
if len(vers) != 1: fail += 1

# every page must carry the theme bootstrap, or dark mode flashes on that page
miss = [p for p in pages if "ep-theme" not in io.open(p, encoding="utf-8").read()]
print("  %-26s %s" % ("theme bootstrap", "OK" if not miss else "MISSING on " + ", ".join(miss)))
fail += len(miss)

print()
print("RESULT: %s" % ("all static checks pass" if fail == 0 else "%d problems" % fail))
sys.exit(1 if fail else 0)

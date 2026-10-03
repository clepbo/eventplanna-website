#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Generate the site's photography with Google's Gemini / Imagen API.

    set GEMINI_API_KEY=...                     (Windows)
    export GEMINI_API_KEY=...                  (macOS / Linux)

    python tools/generate-images.py            # everything still missing
    python tools/generate-images.py --force    # redo them all
    python tools/generate-images.py --only hero          # the six hero cards
    python tools/generate-images.py --only door-client   # one, by name
    python tools/generate-images.py --optional           # include tier 4
    python tools/generate-images.py --list-models        # what your key can use
    python tools/generate-images.py --write-docs         # rebuild the docs page
    python tools/generate-images.py --dry-run            # print, send nothing

Get a key at https://aistudio.google.com/apikey - the free tier is enough for
this set.

Prompts live in tools/image-prompts.json, which is also what --write-docs turns
into docs/image-prompts.md, so the prompts you read and the prompts that get
sent cannot drift apart.

Only dependency is Pillow, for the crop and the WebP encode:

    pip install pillow

The model is discovered at run time rather than hardcoded: image model names
change often, so the script asks the API which ones your key can actually use
and picks the best available. --model overrides it.
"""

import argparse, base64, io, json, os, random, re, sys, time, urllib.error, urllib.request

ROOT    = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PROMPTS = os.path.join(ROOT, "tools", "image-prompts.json")
OUTDIR  = os.path.join(ROOT, "assets", "img")
DOCS    = os.path.join(ROOT, "docs", "image-prompts.md")
API     = "https://generativelanguage.googleapis.com/v1beta"

# Most capable first. The script walks this list against what the API reports
# and takes the first hit, so a name disappearing is not fatal.
PREFERRED = [
    "gemini-3-pro-image", "gemini-3-flash-image",
    "imagen-4.0-ultra-generate", "imagen-4.0-generate", "imagen-4.0-fast-generate",
    "gemini-2.5-flash-image", "gemini-2.0-flash-preview-image-generation",
    "imagen-3.0-generate",
]


# ----------------------------------------------------------------- http
def _post(url, payload, timeout=180):
    req = urllib.request.Request(
        url, data=json.dumps(payload).encode("utf-8"),
        headers={"Content-Type": "application/json"}, method="POST")
    with urllib.request.urlopen(req, timeout=timeout) as r:
        return json.loads(r.read().decode("utf-8"))


def _get(url, timeout=60):
    with urllib.request.urlopen(url, timeout=timeout) as r:
        return json.loads(r.read().decode("utf-8"))


def list_models(key):
    """Every model the key can see that looks like it can return an image."""
    out, token = [], None
    while True:
        url = "%s/models?key=%s&pageSize=200" % (API, key)
        if token:
            url += "&pageToken=" + token
        d = _get(url)
        out.extend(d.get("models", []))
        token = d.get("nextPageToken")
        if not token:
            break
    keep = []
    for m in out:
        name = m.get("name", "").split("/")[-1]
        methods = m.get("supportedGenerationMethods", [])
        looks_visual = "image" in name or name.startswith("imagen")
        if looks_visual and ({"generateContent", "predict"} & set(methods)):
            keep.append((name, methods))
    return keep


def pick_model(key, override=None):
    available = list_models(key)
    if override:
        for name, methods in available:
            if name == override:
                return name, methods
        # not in the listing, but let the user try anyway
        return override, (["predict"] if override.startswith("imagen") else ["generateContent"])
    if not available:
        raise SystemExit(
            "No image-capable model is visible to this API key.\n"
            "Run --list-models to see what it can reach, and check that the\n"
            "Generative Language API is enabled for the project.")
    for want in PREFERRED:
        for name, methods in available:
            if name.startswith(want):
                return name, methods
    return available[0]


# ----------------------------------------------------------------- generate
def _extract_inline(resp):
    """Pull the first image out of either response shape."""
    for cand in resp.get("candidates", []):
        for part in cand.get("content", {}).get("parts", []):
            blob = part.get("inlineData") or part.get("inline_data")
            if blob and blob.get("data"):
                return base64.b64decode(blob["data"])
        fr = cand.get("finishReason")
        if fr and fr not in ("STOP", "MAX_TOKENS"):
            raise RuntimeError("model returned no image (finishReason=%s)" % fr)
    for pred in resp.get("predictions", []):
        b = pred.get("bytesBase64Encoded") or pred.get("bytes_base64_encoded")
        if b:
            return base64.b64decode(b)
    fb = resp.get("promptFeedback", {}).get("blockReason")
    if fb:
        raise RuntimeError("prompt blocked (%s)" % fb)
    raise RuntimeError("no image in response: " + json.dumps(resp)[:300])


def generate(key, model, methods, prompt, ratio):
    if "predict" in methods and model.startswith("imagen"):
        return _extract_inline(_post(
            "%s/models/%s:predict?key=%s" % (API, model, key),
            {"instances": [{"prompt": prompt}],
             "parameters": {"sampleCount": 1, "aspectRatio": ratio,
                            "personGeneration": "allow_adult"}}))

    url = "%s/models/%s:generateContent?key=%s" % (API, model, key)
    body = {"contents": [{"role": "user", "parts": [{"text": prompt}]}],
            "generationConfig": {"responseModalities": ["IMAGE"],
                                 "imageConfig": {"aspectRatio": ratio}}}
    try:
        return _extract_inline(_post(url, body))
    except urllib.error.HTTPError as e:
        if e.code != 400:
            raise
        # older image models reject IMAGE-only, or do not know imageConfig
        detail = e.read().decode("utf-8", "replace")[:200]
        for cfg in ({"responseModalities": ["TEXT", "IMAGE"],
                     "imageConfig": {"aspectRatio": ratio}},
                    {"responseModalities": ["TEXT", "IMAGE"]},
                    {}):
            try:
                b = dict(body)
                b["generationConfig"] = cfg
                return _extract_inline(_post(url, b))
            except urllib.error.HTTPError:
                continue
        raise RuntimeError("model rejected every request shape: " + detail)


class QuotaExhausted(Exception):
    """A free-tier quota that retrying inside a run cannot fix.

    Two different situations arrive as the same 429, and the difference
    decides what to tell the user:

      limit > 0  the day's allowance is spent and resets at midnight Pacific
      limit = 0  the project has NO free image quota. Image output on the
                 Gemini API is a paid feature on most projects, so this is the
                 common case, and "wait for the reset" is useless advice -
                 0 resets to 0. Only billing fixes it.

    The limit only appears in the prose message, not in the structured
    violations, so it has to be read out of the text."""
    def __init__(self, msg, retry_after=None, per_model=False, zero_limit=False):
        Exception.__init__(self, msg)
        self.retry_after = retry_after
        self.per_model = per_model
        self.zero_limit = zero_limit


def _read_error(e):
    """Pull quotaIds and the server's own retryDelay out of a 429 body."""
    raw, quota_ids, retry_after, zero = "", set(), None, False
    try:
        raw = e.read().decode("utf-8", "replace")
        j = json.loads(raw)
        err = j.get("error", {})
        for det in err.get("details", []):
            for v in det.get("violations", []) or []:
                if v.get("quotaId"):
                    quota_ids.add(v["quotaId"])
            if det.get("retryDelay"):
                m = re.match(r"([0-9.]+)s", str(det["retryDelay"]))
                if m:
                    retry_after = float(m.group(1))
        raw = err.get("message", raw)
        # "... limit: 0, model: gemini-2.5-flash-preview-image"
        zero = bool(re.search('limit:[ ]*0(?![0-9])', raw))
    except Exception:
        pass
    return raw[:300], quota_ids, retry_after, zero


def with_retry(fn, tries=4, label=""):
    for i in range(tries):
        try:
            return fn()
        except urllib.error.HTTPError as e:
            body, quota_ids, retry_after, zero = _read_error(e)
            if e.code == 429:
                per_day = any("PerDay" in q for q in quota_ids)
                # A per-minute burst clears on its own; a per-day allowance does
                # not, and the server tells us which by how long it wants us to
                # wait. Anything over two minutes is a day quota in practice.
                if zero or per_day or (retry_after or 0) > 120:
                    raise QuotaExhausted(
                        body, retry_after,
                        per_model=any("PerModel" in q for q in quota_ids),
                        zero_limit=zero)
                wait = retry_after if retry_after else (2 ** i) * 5 + random.random() * 3
                if i < tries - 1:
                    print("      rate limited, waiting %.0fs" % wait)
                    time.sleep(min(wait, 90))
                    continue
            if e.code in (500, 502, 503, 504) and i < tries - 1:
                wait = (2 ** i) * 5 + random.random() * 3
                print("      %s %s - retrying in %.0fs" % (e.code, label, wait))
                time.sleep(wait)
                continue
            raise RuntimeError("HTTP %s %s %s" % (e.code, e.reason, body))
        except QuotaExhausted:
            raise
        except (urllib.error.URLError, RuntimeError) as e:
            if i < tries - 1:
                wait = (2 ** i) * 4 + random.random() * 2
                print("      %s - retrying in %.0fs" % (e, wait))
                time.sleep(wait)
                continue
            raise


# ----------------------------------------------------------------- image
def save_webp(raw, path, w, h, quality=82):
    """Cover-crop to the exact slot size, then encode WebP."""
    from PIL import Image
    im = Image.open(io.BytesIO(raw))
    if im.mode not in ("RGB", "RGBA"):
        im = im.convert("RGB")
    sw, sh = im.size
    scale = max(w / sw, h / sh)
    nw, nh = int(round(sw * scale)), int(round(sh * scale))
    im = im.resize((nw, nh), Image.LANCZOS)
    left, top = (nw - w) // 2, (nh - h) // 2
    im = im.crop((left, top, left + w, top + h))
    if im.mode == "RGBA":
        im = im.convert("RGB")
    im.save(path, "WEBP", quality=quality, method=6)
    return os.path.getsize(path)


# ----------------------------------------------------------------- docs
def write_docs(cfg):
    L = []
    a = L.append
    a("# Image prompts\n")
    a("**Generated from `tools/image-prompts.json`. Do not hand-edit this file —")
    a("edit the JSON and run `python tools/generate-images.py --write-docs`.**")
    a("That JSON is also what the generator sends, so what you read here is")
    a("exactly what the model is asked for.\n")
    a("## Just generate them\n")
    a("```bash")
    a("pip install pillow")
    a("set GEMINI_API_KEY=your-key-here      # export GEMINI_API_KEY=... on mac/linux")
    a("python tools/generate-images.py")
    a("```\n")
    a("A key is free at <https://aistudio.google.com/apikey>. The script picks")
    a("whichever image model your key can reach, generates everything that is")
    a("missing, crops each result to its exact slot size and writes WebP into")
    a("`assets/img/`. Re-run it any time; it skips files that already exist")
    a("unless you pass `--force`.\n")
    a("## Or paste them by hand\n")
    a("Each prompt below is complete — subject, then the shared style, casting")
    a("and negative blocks. Copy the whole code block.\n")
    a("## How the slots work\n")
    a("Photos are not `<img>` tags. Each slot is a tinted tile with the")
    a("photograph layered over it as a CSS background image, so a file that is")
    a("not there yet shows the tint rather than a broken-image icon. Drop a")
    a("correctly-named file into `assets/img/` and it appears; delete it and the")
    a("tint comes back. The site is finished with none of them, and finishes")
    a("better as each one arrives.\n")
    a("> If you ever wire a *new* slot by hand, the path in the markup is")
    a("> `url(img/NAME.webp)`, not `url(assets/img/NAME.webp)`. A `url()` inside")
    a("> a CSS custom property resolves against the stylesheet that uses it, and")
    a("> that stylesheet lives in `assets/`.\n")
    a("---\n")

    tiers = {1: "Tier 1 — the six hero cards",
             2: "Tier 2 — the three audience cards",
             3: "Tier 3 — the verification card",
             4: "Tier 4 — optional, the site is complete without these"}
    shown = set()
    for group in ("images", "optional"):
        for im in cfg[group]:
            t = im["tier"]
            if t not in shown:
                shown.add(t)
                a("# %s\n" % tiers[t])
                if t == 1:
                    a("The hero is two columns scrolling in opposite directions, three")
                    a("cards each. Generate all six together — they sit next to each")
                    a("other and have to look like one set. A caption pill covers the")
                    a("bottom ~12% of each card, so keep the subject in the upper two")
                    a("thirds.\n")
                if t == 4:
                    a("The testimonial slots show initials on a tint today, which looks")
                    a("deliberate. The category tiles show an icon and a count. Both")
                    a("work as they are; these are here if you want photographs later.\n")
            a("## `assets/img/%s.webp` — %d × %d px (%s)\n" % (im["file"], im["w"], im["h"], im["ratio"]))
            a("*%s*\n" % im["slot"])
            a("```")
            a(im["prompt"])
            a("")
            a(cfg["style"])
            a("")
            a(cfg["casting"])
            a("")
            a(cfg["negative"])
            a("```\n")

    a("---\n")
    a("## Checklist before you commit them\n")
    a("- [ ] Filenames exactly as above — the slots are wired to them")
    a("- [ ] WebP, cropped to the stated ratio (the script does both)")
    a("- [ ] The hero six read as one set: same light, same grade, same distance")
    a("- [ ] No text, signage or watermark baked into any frame")
    a("- [ ] Total added weight under 1MB for the ten wired slots")
    a("- [ ] Nobody in a frame is presented as a specific named customer\n")

    with io.open(DOCS, "w", encoding="utf-8", newline="\n") as f:
        f.write("\n".join(L))
    print("wrote %s (%d prompts)" % (os.path.relpath(DOCS, ROOT), len(cfg["images"]) + len(cfg["optional"])))


# ----------------------------------------------------------------- main
def main():
    ap = argparse.ArgumentParser(description="Generate the site's photography.")
    ap.add_argument("--key", default=os.environ.get("GEMINI_API_KEY") or os.environ.get("GOOGLE_API_KEY"))
    ap.add_argument("--model", help="skip discovery and use this model")
    ap.add_argument("--only", help="substring match on the filename, e.g. hero / door-client")
    ap.add_argument("--optional", action="store_true", help="include tier 4")
    ap.add_argument("--force", action="store_true", help="regenerate files that already exist")
    ap.add_argument("--quality", type=int, default=82)
    ap.add_argument("--delay", type=float, default=3.0, help="seconds between calls")
    ap.add_argument("--import", dest="import_dir", metavar="DIR",
                    help="skip the API: crop and encode images already on disk in DIR, "
                         "matched to slots by filename")
    ap.add_argument("--list-models", action="store_true")
    ap.add_argument("--write-docs", action="store_true")
    ap.add_argument("--dry-run", action="store_true")
    args = ap.parse_args()

    with io.open(PROMPTS, encoding="utf-8") as f:
        cfg = json.load(f)

    if args.write_docs:
        write_docs(cfg)
        return

    if args.import_dir:
        try:
            from PIL import Image  # noqa: F401
        except ImportError:
            raise SystemExit("Pillow is needed for the crop and the WebP encode:\n  pip install pillow")
        if not os.path.isdir(OUTDIR):
            os.makedirs(OUTDIR)
        items = list(cfg["images"]) + list(cfg["optional"])
        if args.only:
            items = [i for i in items if args.only in i["file"]]
        exts = (".jpeg", ".jpg", ".png", ".webp", ".JPEG", ".JPG", ".PNG", ".WEBP")
        done = missing = 0
        total = 0
        print("importing from %s\n" % args.import_dir)
        for im in items:
            src = None
            for e in exts:
                cand = os.path.join(args.import_dir, im["file"] + e)
                if os.path.exists(cand):
                    src = cand
                    break
            if not src:
                print("  %-20s no source file found" % im["file"])
                missing += 1
                continue
            out = os.path.join(OUTDIR, im["file"] + ".webp")
            if os.path.exists(out) and not args.force:
                print("  %-20s exists, skipping" % im["file"])
                continue
            with open(src, "rb") as f:
                raw = f.read()
            size = save_webp(raw, out, im["w"], im["h"], args.quality)
            total += size
            print("  %-20s %-22s %5d KB -> %4dx%-5d %4d KB"
                  % (im["file"], os.path.basename(src), len(raw) // 1024,
                     im["w"], im["h"], size // 1024))
            done += 1
        print("\n%d imported, %d without a source   %d KB total" % (done, missing, total // 1024))
        return

    if args.list_models:
        if not args.key:
            raise SystemExit("Set GEMINI_API_KEY, or pass --key.")
        for name, methods in list_models(args.key):
            print("  %-46s %s" % (name, ",".join(methods)))
        return

    items = list(cfg["images"]) + (list(cfg["optional"]) if args.optional else [])
    if args.only:
        items = [i for i in items if args.only in i["file"]]
    if not items:
        raise SystemExit("Nothing matched --only %s" % args.only)

    if not os.path.isdir(OUTDIR):
        os.makedirs(OUTDIR)

    def full(im):
        return "\n\n".join([im["prompt"], cfg["style"], cfg["casting"], cfg["negative"]])

    if args.dry_run:
        for im in items:
            print("=" * 72)
            print("%s.webp  %dx%d (%s)" % (im["file"], im["w"], im["h"], im["ratio"]))
            print("=" * 72)
            print(full(im))
            print()
        return

    if not args.key:
        raise SystemExit(
            "No API key.\n"
            "  Windows : set GEMINI_API_KEY=your-key\n"
            "  mac/linux: export GEMINI_API_KEY=your-key\n"
            "Get one free at https://aistudio.google.com/apikey")

    try:
        from PIL import Image  # noqa: F401
    except ImportError:
        raise SystemExit("Pillow is needed for the crop and the WebP encode:\n  pip install pillow")

    # Day quotas are counted PER MODEL, so one being spent does not mean the
    # next is. Keep an ordered queue and fall through it as each runs dry.
    if args.model:
        queue = [pick_model(args.key, args.model)]
    else:
        avail = list_models(args.key)
        queue = []
        for want in PREFERRED:
            for name, methods in avail:
                if name.startswith(want) and name not in [q[0] for q in queue]:
                    queue.append((name, methods))
        for nm in avail:
            if nm[0] not in [q[0] for q in queue]:
                queue.append(nm)
    if not queue:
        raise SystemExit("No image-capable model is visible to this key. Try --list-models.")

    model, methods = queue.pop(0)
    print("model: %s" % model)
    if queue:
        print("       (fallbacks: %s)" % ", ".join(m for m, _ in queue[:4]))
    print("out:   %s" % os.path.relpath(OUTDIR, ROOT))
    print("")

    done = skipped = failed = 0
    total_bytes = 0
    stopped = None
    for im in items:
        path = os.path.join(OUTDIR, im["file"] + ".webp")
        if os.path.exists(path) and not args.force:
            print("  %-22s exists, skipping" % im["file"])
            skipped += 1
            continue
        while True:
            print("  %-22s %dx%d ..." % (im["file"], im["w"], im["h"]), end="", flush=True)
            try:
                raw = with_retry(lambda: generate(args.key, model, methods, full(im), im["ratio"]),
                                 label=im["file"])
                size = save_webp(raw, path, im["w"], im["h"], args.quality)
                total_bytes += size
                print(" %d KB" % (size // 1024))
                done += 1
                break
            except QuotaExhausted as q:
                print(" quota spent on %s" % model)
                if queue:
                    model, methods = queue.pop(0)
                    print("      falling back to %s" % model)
                    continue
                stopped = q
                break
            except Exception as e:
                print(" FAILED")
                print("      %s" % e)
                failed += 1
                break
        if stopped:
            break
        time.sleep(args.delay)

    print("")
    print("%d generated, %d skipped, %d failed   %d KB added"
          % (done, skipped, failed, total_bytes // 1024))

    if stopped:
        secs = stopped.retry_after or 0
        print("")
        print("-" * 70)
        if stopped.zero_limit:
            print("STOPPED: this project has NO free-tier image quota (limit: 0).")
            print("")
            print("Image output on the Gemini API is a paid feature on most")
            print("projects. The daily reset will not help - 0 resets to 0.")
            print("")
            print("Two ways forward:")
            print("  1. Enable billing on the Google Cloud project behind this key,")
            print("     then re-run. Image generation is a few cents each, so the")
            print("     ten wired slots cost well under a dollar.")
            print("     https://aistudio.google.com/apikey -> the project -> billing")
            print("  2. Use a key from a project that already has billing on:")
            print("     python tools/generate-images.py --key OTHER_KEY")
        else:
            print("STOPPED: the daily free-tier image allowance is spent on every")
            print("model this key can reach. Retrying will not help today.")
            if secs:
                hrs, mins = int(secs // 3600), int((secs % 3600) // 60)
                when = time.strftime("%H:%M on %a %d %b", time.localtime(time.time() + secs))
                print("")
                print("The server asks for %dh %dm - resets around %s your time." % (hrs, mins, when))
            print("")
            print("  1. Wait for the reset and re-run. Finished files are skipped,")
            print("     so it picks up exactly where it stopped.")
            print("  2. Enable billing to lift the cap; ten images costs cents.")
            print("  3. Use a key from a different project:  --key OTHER_KEY")
        print("")
        print("The full server message:")
        for line in str(stopped).split("* "):
            if line.strip():
                print("  " + line.strip()[:110])
        print("-" * 70)
        sys.exit(2)

    if failed:
        print("Re-run to retry just the failures - finished files are skipped.")
        sys.exit(1)
    if done:
        print("")
        print("Look at them, then:  git add assets/img && git commit && git push")




if __name__ == "__main__":
    main()

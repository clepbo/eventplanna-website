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


def with_retry(fn, tries=4, label=""):
    for i in range(tries):
        try:
            return fn()
        except urllib.error.HTTPError as e:
            body = ""
            try:
                body = e.read().decode("utf-8", "replace")[:200]
            except Exception:
                pass
            if e.code in (429, 500, 502, 503, 504) and i < tries - 1:
                wait = (2 ** i) * 5 + random.random() * 3
                print("      %s %s - retrying in %.0fs" % (e.code, label, wait))
                time.sleep(wait)
                continue
            raise RuntimeError("HTTP %s %s %s" % (e.code, e.reason, body))
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
    ap.add_argument("--list-models", action="store_true")
    ap.add_argument("--write-docs", action="store_true")
    ap.add_argument("--dry-run", action="store_true")
    args = ap.parse_args()

    with io.open(PROMPTS, encoding="utf-8") as f:
        cfg = json.load(f)

    if args.write_docs:
        write_docs(cfg)
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

    model, methods = pick_model(args.key, args.model)
    print("model: %s  (%s)" % (model, ",".join(methods)))
    print("out:   %s\n" % os.path.relpath(OUTDIR, ROOT))

    done = skipped = failed = 0
    total_bytes = 0
    for im in items:
        path = os.path.join(OUTDIR, im["file"] + ".webp")
        if os.path.exists(path) and not args.force:
            print("  %-22s exists, skipping" % im["file"])
            skipped += 1
            continue
        print("  %-22s %dx%d ..." % (im["file"], im["w"], im["h"]), end="", flush=True)
        try:
            raw = with_retry(lambda: generate(args.key, model, methods, full(im), im["ratio"]),
                             label=im["file"])
            size = save_webp(raw, path, im["w"], im["h"], args.quality)
            total_bytes += size
            print(" %d KB" % (size // 1024))
            done += 1
        except Exception as e:
            print(" FAILED")
            print("      %s" % e)
            failed += 1
        time.sleep(args.delay)

    print("\n%d generated, %d skipped, %d failed   %d KB added"
          % (done, skipped, failed, total_bytes // 1024))
    if failed:
        print("Re-run to retry just the failures - finished files are skipped.")
        sys.exit(1)
    if done:
        print("\nLook at them, then:  git add assets/img && git commit && git push")


if __name__ == "__main__":
    main()

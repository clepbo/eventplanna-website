/* EventPlanna — motion engine v2

   Rebuilt against frame-by-frame measurements of the reference recording
   (1156 frames @ 30fps). Three things changed from v1:

   1. Scroll is smoothed. Sampling a heading's reveal every 33ms gave a
      decelerating curve that fits 1 - e^(-5t) to within measurement noise —
      the signature of a per-frame lerp, not a CSS transition. k = 5/s is
      alpha = 1 - e^(-5/60) = 0.08 at 60fps.
   2. Reveals are scrubbed, not toggled. Progress is a continuous function of
      scroll position, so reversing on the way back up is free rather than a
      second code path.
   3. There is no loading screen. A full-screen intro competes with image
      decode for the main thread on exactly the frames it needs to be smooth,
      so it stuttered however it was authored. The hero now carries the
      entrance instead — three headline lines 80ms apart, then the supporting
      rows — which is what the reference does once its own intro clears.

   Deliberately NOT copied: the reference recording zooms its browser frame
   between sections. That is the screen recorder's camera, not the website —
   the rounded card and its shadow scale too. Reproducing it in CSS would make
   the page lurch.

   All of it is disabled under prefers-reduced-motion. */

const REDUCED = matchMedia('(prefers-reduced-motion: reduce)').matches;
const raf = (f) => requestAnimationFrame(f);
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);

/* ---------- smooth scroll ----------
   The window scrolls natively — body carries the real content height — and the
   content wrapper is translated to a lagging position. Keeping the native
   scrollbar means keyboard, anchor links and find-in-page all still work.
   Off for touch, which has its own momentum, and off under reduced motion. */
const SMOOTH = !REDUCED && matchMedia('(pointer: fine)').matches;
const DECAY = 5;                       // per second, measured off the reference

let wrapper = null, smoothY = 0;

function buildWrapper() {
  const parts = [$('.wrap'), $('footer')].filter(Boolean);
  if (!parts.length) return;
  wrapper = document.createElement('div');
  wrapper.className = 'smooth';
  document.body.insertBefore(wrapper, parts[0]);
  parts.forEach((n) => wrapper.appendChild(n));
  document.documentElement.classList.add('has-smooth');
  measure();
}

function measure() {
  if (!wrapper) return;
  document.body.style.height = Math.round(wrapper.scrollHeight) + 'px';
}

/* Lazy images below the fold load as you approach them and change the page
   height after the fact, which is why the footer used to run out of scroll
   before its last band. Re-measure whenever the wrapper resizes. */
if ('ResizeObserver' in window) {
  const ro = new ResizeObserver(() => measure());
  addEventListener('DOMContentLoaded', () => { if (wrapper) ro.observe(wrapper); });
}

/* Anchor links cannot work on their own once the content sits in a fixed,
   transformed wrapper — the browser has no document offset to scroll to. Resolve
   the target against the wrapper and drive the window scroll ourselves. */
function anchorY(el) {
  const base = wrapper ? wrapper.getBoundingClientRect().top : 0;
  const navH = nav ? nav.getBoundingClientRect().height + 22 : 24;
  return Math.max(0, el.getBoundingClientRect().top - base - navH);
}

addEventListener('click', (e) => {
  const a = e.target.closest && e.target.closest('a[href^="#"]');
  if (!a) return;
  const id = a.getAttribute('href').slice(1);
  if (!id) return;
  const el = document.getElementById(id);
  if (!el) return;
  e.preventDefault();
  scrollTo({ top: anchorY(el), behavior: REDUCED ? 'auto' : 'smooth' });
  history.replaceState(null, '', '#' + id);
});

/* Same problem on arrival: a page opened at /page.html#section lands at the top. */
addEventListener('load', () => {
  const id = location.hash.slice(1);
  if (!id) return;
  const el = document.getElementById(id);
  if (el) setTimeout(() => scrollTo({ top: anchorY(el), behavior: 'auto' }), 60);
});

/* ---------- jobs ---------- */
const jobs = [];
let last = performance.now();

function tick(now) {
  const dt = Math.min((now - last) / 1000, 0.1);
  last = now;

  if (wrapper) {
    const target = scrollY;
    const a = 1 - Math.exp(-DECAY * dt);     // frame-rate independent lerp
    smoothY += (target - smoothY) * a;
    if (Math.abs(target - smoothY) < 0.05) smoothY = target;
    wrapper.style.transform = 'translate3d(0,' + -smoothY.toFixed(2) + 'px,0)';
  } else {
    smoothY = scrollY;
  }

  for (let i = 0; i < jobs.length; i++) jobs[i](smoothY);
  raf(tick);
}

/* ---------- nav ---------- */
const nav = $('.nav');
if (nav) {
  jobs.push((y) => nav.classList.toggle('scrolled', y > 10));
  const t = $('.nav-toggle', nav), l = $('.nav-links', nav);
  if (t && l) {
    const shut = () => {
      l.classList.remove('open');
      t.setAttribute('aria-expanded', 'false');
      document.body.classList.remove('nav-open');
    };
    t.addEventListener('click', () => {
      const open = l.classList.toggle('open');
      t.setAttribute('aria-expanded', String(open));
      document.body.classList.toggle('nav-open', open);
    });
    l.addEventListener('click', (e) => { if (e.target.tagName === 'A') shut(); });
    addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && l.classList.contains('open')) { shut(); t.focus(); }
    });
  }
}

/* ---------- scroll progress ---------- */
const barEl = $('.progress i');
if (barEl) jobs.push((y) => {
  const max = (wrapper ? wrapper.scrollHeight : document.documentElement.scrollHeight) - innerHeight;
  barEl.style.width = (max > 0 ? clamp(y / max, 0, 1) : 0) * 100 + '%';
});

/* ---------- scrubbed reveals ----------
   Progress runs 0 → 1 as the element crosses from 92% to 32% of the viewport.
   Scrolling back up runs it 1 → 0 with no extra code, and the smoothed scroll
   above is what gives the decelerating tail. */
const ANIMATED = '.reveal, .stagger, .brow, .split, .cluster, .chartbox';
const scrubbed = [];

function collect() {
  scrubbed.length = 0;
  $$(ANIMATED).forEach((el) => {
    el.classList.add('js-scrub');
    const kids = el.classList.contains('stagger') ? [...el.children] : [];
    scrubbed.push({ el, kids, counters: $$('[data-count]', el), lit: false });
  });
  $$('[data-count]').forEach((el) => {
    if (!el.closest(ANIMATED)) scrubbed.push({ el, kids: [], counters: [el], lit: false, bare: true });
  });
}

function applyScrub() {
  const vh = innerHeight;
  const start = vh * 0.92, end = vh * 0.32;
  for (const s of scrubbed) {
    const top = s.el.getBoundingClientRect().top;
    const p = clamp((start - top) / (start - end), 0, 1);

    if (!s.bare) {
      if (s.kids.length) {
        // Children trail each other by 9% of the window — the reference staggers
        // hero lines about 100ms apart at a comparable scroll speed.
        s.kids.forEach((k, i) => {
          const kp = clamp((p - i * 0.09) / (1 - Math.min(0.72, s.kids.length * 0.09)), 0, 1);
          k.style.opacity = kp;
          k.style.transform = 'translate3d(0,' + ((1 - kp) * 26).toFixed(2) + 'px,0)';
        });
        s.el.style.opacity = '';
        s.el.style.transform = '';
      } else {
        s.el.style.opacity = p;
        s.el.style.transform = 'translate3d(' + (s.el.classList.contains('brow') ? (1 - p) * 48 : 0).toFixed(2) + 'px,'
                             + ((1 - p) * 26).toFixed(2) + 'px,0)';
      }
      s.el.classList.toggle('in', p > 0.02);
    }

    if (s.counters.length) {
      if (p > 0.35 && !s.lit) { s.lit = true; s.counters.forEach(countUp); }
      else if (p < 0.05 && s.lit) { s.lit = false; s.counters.forEach(resetCount); }
    }
  }
}

/* ---------- counters ---------- */
function settle(el) { el.textContent = el.dataset.count; }

function resetCount(el) {
  if (!el.dataset.zero) return;
  el.dataset.running = '';
  el.textContent = el.dataset.zero;
}

function countUp(el) {
  if (el.dataset.zero === undefined) el.dataset.zero = el.textContent;
  if (el.dataset.running === '1') return;
  el.dataset.running = '1';

  const raw = el.dataset.count;
  const m = raw.match(/-?[\d.,]+/);
  if (!m) { el.textContent = raw; return; }
  const n = m[0], target = parseFloat(n.replace(/,/g, ''));
  const dec = (n.split('.')[1] || '').length, comma = n.includes(',');
  const pre = raw.slice(0, m.index), post = raw.slice(m.index + n.length);
  const t0 = performance.now(), dur = 1400;
  (function f(now) {
    if (el.dataset.running !== '1') return;
    const p = Math.min((now - t0) / dur, 1);
    let v = (target * (1 - Math.pow(1 - p, 3))).toFixed(dec);
    if (comma) v = Number(v).toLocaleString('en-US', { minimumFractionDigits: dec });
    el.textContent = pre + v + post;
    if (p < 1) raf(f);
  })(performance.now());
}

/* ---------- word-by-word highlight ---------- */
$$('[data-words]').forEach((box) => {
  const text = box.textContent.trim();
  const green = (box.dataset.green || '').split('|').filter(Boolean);
  box.textContent = '';
  const words = text.split(/\s+/).map((w) => {
    const s = document.createElement('span');
    s.className = 'w' + (green.some((g) => w.replace(/[^\w']/g, '').toLowerCase() === g.toLowerCase()) ? ' g' : '');
    s.textContent = w;
    box.append(s, document.createTextNode(' '));
    return s;
  });
  if (REDUCED) { words.forEach((w) => w.classList.add('on')); return; }
  jobs.push(() => {
    const r = box.getBoundingClientRect();
    const start = innerHeight * 0.88, end = innerHeight * 0.34;
    const p = clamp((start - r.top) / (start - end), 0, 1);
    const upto = Math.round(p * words.length);
    words.forEach((w, i) => w.classList.toggle('on', i < upto));
  });
});

/* ---------- testimonial carousel ----------
   The reference cross-fades with a scale rather than sliding sideways: at the
   midpoint of a change both cards are visible, overlaid and faint. */
$$('[data-carousel]').forEach((car) => {
  const track = $('.ttrack', car), slides = $$('.tslide', track);
  const dots = $('.tdots', car.parentElement) || $('.tdots', car);
  let i = 0, timer;
  track.classList.add('fade-mode');
  if (dots) slides.forEach((_, n) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.setAttribute('aria-label', 'Story ' + (n + 1));
    b.addEventListener('click', () => { go(n); restart(); });
    dots.append(b);
  });
  function go(n) {
    i = (n + slides.length) % slides.length;
    slides.forEach((s, k) => s.classList.toggle('on', k === i));
    if (dots) $$('button', dots).forEach((b, k) => b.classList.toggle('on', k === i));
  }
  function restart() { clearInterval(timer); if (!REDUCED) timer = setInterval(() => go(i + 1), 5200); }
  go(0); restart();
  car.addEventListener('mouseenter', () => clearInterval(timer));
  car.addEventListener('mouseleave', restart);
});

/* ---------- FAQ accordion ---------- */
$$('.faq-item').forEach((item) => {
  const q = $('.faq-q', item), a = $('.faq-a', item);
  if (!q || !a) return;
  q.setAttribute('aria-expanded', 'false');
  q.addEventListener('click', () => {
    const open = item.classList.toggle('open');
    q.setAttribute('aria-expanded', String(open));
    a.style.maxHeight = open ? a.scrollHeight + 'px' : '0px';
    measure();
  });
});

/* ---------- magnetic buttons ---------- */
if (!REDUCED && matchMedia('(pointer: fine)').matches) {
  $$('.btn').forEach((b) => {
    b.addEventListener('mousemove', (e) => {
      const r = b.getBoundingClientRect();
      b.style.transform = 'translate(' + ((e.clientX - r.left - r.width / 2) * 0.12) + 'px,'
                                       + ((e.clientY - r.top - r.height / 2) * 0.22) + 'px)';
    });
    b.addEventListener('mouseleave', () => { b.style.transform = ''; });
  });
}

/* ---------- marquees ---------- */
$$('.ticker-track, .col').forEach((t) => { t.innerHTML += t.innerHTML; });

/* ---------- go ---------- */
if (SMOOTH) buildWrapper();
collect();

if (REDUCED) {
  $$(ANIMATED).forEach((el) => el.classList.add('in'));
  $$('[data-count]').forEach(settle);
} else {
  jobs.push(applyScrub);
}

let rt;
addEventListener('resize', () => {
  clearTimeout(rt);
  rt = setTimeout(() => {
    measure();
    $$('.faq-item.open .faq-a').forEach((a) => { a.style.maxHeight = a.scrollHeight + 'px'; });
  }, 150);
}, { passive: true });

addEventListener('load', measure);
if (document.fonts && document.fonts.ready) document.fonts.ready.then(measure);

/* Headless browsers throttle rAF too hard for the lerp to converge, so the
   engine exposes a way to place the scroll instantly for verification.
   Opt-in via ?mdebug — it costs nothing on a normal visit. */
if (location.search.includes('mdebug')) {
  window.__motion = {
    jump(y) {
      smoothY = y;
      if (wrapper) wrapper.style.transform = 'translate3d(0,' + -y + 'px,0)';
      jobs.forEach((j) => j(y));
    },
    get y() { return smoothY; },
    get count() { return scrubbed.length; }
  };
}

raf(tick);

/* The entrance waits for the webfont so a masked line-rise cannot reflow
   mid-animation, but never longer than 700ms — a slow font or image must not
   hold the hero back. */
let started = false;
function start() {
  if (started) return;
  started = true;
  measure();
  document.documentElement.classList.add('ready');
}
if (document.fonts && document.fonts.ready) document.fonts.ready.then(start);
addEventListener('load', start);
setTimeout(start, 700);

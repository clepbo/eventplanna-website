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
  const parts = [$('.hero-stage'), $('.wrap'), $('footer')].filter(Boolean);
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
  // data-carousel can name what a slide is ("Slide", "Story"); the testimonial
  // carousels pass nothing and keep the original wording.
  const noun = car.dataset.carousel || 'Story';
  if (dots) slides.forEach((_, n) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.setAttribute('aria-label', noun + ' ' + (n + 1));
    b.addEventListener('click', () => { go(n); restart(); });
    dots.append(b);
  });
  // Arrows are optional. Only the hero carries them; go() and restart() are
  // function declarations, so referring to them here is fine.
  const back = $('[data-prev]', car), fwd = $('[data-next]', car);
  if (back) back.addEventListener('click', () => { go(i - 1); restart(); });
  if (fwd) fwd.addEventListener('click', () => { go(i + 1); restart(); });
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

/* ---------- hero: the band grows into the window ----------
   The hero starts as an inset band with the same corner radius as the white
   card below it, and opens out to the full window as you scroll. When it has
   filled the screen it carries on up and the first section comes out from
   under it.

   The band is held against the top of the screen by translating its wrapper,
   not by position:sticky. Sticky needs a real scrolling ancestor and this
   document does not have one: everything below the nav sits inside .smooth,
   which is fixed and translated. Holding it by hand is also what makes the
   two agree frame for frame, since both read the same smoothed position.

   The distance the band is held for is however much taller the track is than
   the window, so --p is that same distance expressed 0 to 1, and every part
   of the growth is written against it in the stylesheet. .has-pin is what
   turns the tall track on, so with no JS, or under reduced motion, the hero
   stays a plain inset band instead of a screen of empty space. */
const stage = $('[data-stage]');
const track = stage && stage.closest('.hero-stage');
if (stage && track && !REDUCED) {
  const pin = stage.parentElement;
  document.documentElement.classList.add('has-pin');
  jobs.push(() => {
    const r = track.getBoundingClientRect();
    const travel = Math.max(1, r.height - innerHeight);
    const d = clamp(-r.top, 0, travel);
    pin.style.transform = 'translate3d(0,' + d.toFixed(1) + 'px,0)';
    stage.style.setProperty('--p', (d / travel).toFixed(4));
  });
}

/* ---------- shared bits for the directory and the planner page ---------- */
function esc(s) {
  return String(s).replace(/[&<>"]/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
}
const NAIRA = '₦';
function money(n) {
  return NAIRA + Number(n).toLocaleString('en-NG');
}
/* A date input hands back 2027-03-14, which is what the field needs and not
   what anybody wants to read back on a review screen. */
function niceDate(v) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(v)) return v;
  return new Date(v + 'T00:00:00')
    .toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
}
function niceTime(v) {
  if (!/^\d{2}:\d{2}/.test(v)) return v;
  const h = +v.slice(0, 2), m = v.slice(3, 5);
  return ((h % 12) || 12) + ':' + m + (h < 12 ? 'am' : 'pm');
}

/* ---------- the planner directory ----------
   Search, four filters, a sort and a pager, over a list that is already in the
   HTML. Nothing here fetches anything and nothing here builds a card: every
   profile is in the markup, and this only decides what is on screen. With no
   JavaScript at all the page still shows twenty four planners, each one a link
   to its own page.

   That is the shape to keep when the backend arrives. Replacing the card scan
   with a fetch and keeping render() as it is would move the same page onto
   live data without touching the filtering or the pager. */
const dir = $('[data-dir]');
if (dir) {
  const grid = $('[data-dir-grid]', dir);
  const empty = $('[data-dir-empty]', dir);
  const pager = $('[data-dir-pager]', dir);
  const count = $('[data-dir-count]', dir);
  const q = $('[data-dir-q]', dir);
  const picks = $$('select', dir);
  const PER = +(dir.dataset.dir || 12);
  let page = 1;

  const cards = $$('.dir-card', grid).map((el, i) => ({
    el, i,
    hay: el.dataset.hay,
    city: el.dataset.city, type: el.dataset.types, band: +el.dataset.band,
    rating: +el.dataset.rating, events: +el.dataset.events
  }));

  const SORTS = {
    best: (a, b) => a.i - b.i,
    rating: (a, b) => b.rating - a.rating || a.i - b.i,
    budget: (a, b) => a.band - b.band || a.i - b.i,
    experience: (a, b) => b.events - a.events || a.i - b.i
  };

  function matches() {
    const text = (q && q.value.trim().toLowerCase()) || '';
    const v = {};
    picks.forEach((s) => { v[s.dataset.dirPick] = s.value; });
    return cards.filter((c) =>
      (!text || c.hay.includes(text)) &&
      (!v.city || c.city === v.city) &&
      (!v.type || c.type.split(' ').includes(v.type)) &&
      (!v.band || c.band === +v.band));
  }

  function render(keepPage) {
    const sortSel = picks.find((s) => s.dataset.dirPick === 'sort');
    const hits = matches().sort(SORTS[(sortSel && sortSel.value) || 'best'] || SORTS.best);
    const pages = Math.max(1, Math.ceil(hits.length / PER));
    if (!keepPage) page = 1;
    page = clamp(page, 1, pages);

    const from = (page - 1) * PER, show = hits.slice(from, from + PER);
    const on = new Set(show.map((c) => c.el));
    cards.forEach((c) => { c.el.hidden = !on.has(c.el); });
    // Sorting has to move the nodes, not just hide them, or the grid keeps
    // showing the markup order whatever the control says.
    show.forEach((c) => grid.appendChild(c.el));

    if (empty) empty.hidden = hits.length > 0;
    if (count) {
      count.innerHTML = hits.length
        ? '<b>' + hits.length + '</b> planner' + (hits.length === 1 ? '' : 's')
          + (hits.length > PER ? ', showing ' + (from + 1) + ' to ' + (from + show.length) : '')
        : 'No planners match that yet';
    }
    drawPager(pages);
    measure();
  }

  /* First, last, the current page and its neighbours. Anything else collapses
     to an ellipsis, so the row stays one line however long the list grows. */
  function drawPager(pages) {
    if (!pager) return;
    pager.hidden = pages < 2;
    if (pages < 2) { pager.innerHTML = ''; return; }
    const want = new Set([1, pages, page, page - 1, page + 1]);
    let html = '<button type="button" data-go="' + (page - 1) + '"'
             + (page === 1 ? ' disabled' : '') + ' aria-label="Previous page">&#8249;</button>';
    let gap = false;
    for (let n = 1; n <= pages; n++) {
      if (want.has(n)) {
        html += '<button type="button" data-go="' + n + '" aria-current="'
             + (n === page) + '" aria-label="Page ' + n + '">' + n + '</button>';
        gap = false;
      } else if (!gap) { html += '<span class="gap">&hellip;</span>'; gap = true; }
    }
    html += '<button type="button" data-go="' + (page + 1) + '"'
          + (page === pages ? ' disabled' : '') + ' aria-label="Next page">&#8250;</button>';
    pager.innerHTML = html;
  }

  if (pager) pager.addEventListener('click', (e) => {
    const b = e.target.closest('button[data-go]');
    if (!b || b.disabled) return;
    page = +b.dataset.go;
    render(true);
    scrollTo({ top: anchorY(dir), behavior: REDUCED ? 'auto' : 'smooth' });
  });

  let qt;
  if (q) q.addEventListener('input', () => { clearTimeout(qt); qt = setTimeout(render, 160); });
  picks.forEach((s) => s.addEventListener('change', () => render()));

  const reset = $('[data-dir-reset]', dir);
  if (reset) reset.addEventListener('click', () => {
    if (q) q.value = '';
    picks.forEach((s) => { s.value = s.dataset.dirPick === 'sort' ? 'best' : ''; });
    render();
  });

  /* A link can arrive with the filters already chosen, which is what the two
     buttons under the alternatives on a planner's page use. Set the controls
     before the first render so the page never flashes the unfiltered list. */
  const qs = new URLSearchParams(location.search);
  ['city', 'type', 'band'].forEach((k) => {
    const v = qs.get(k);
    const sel = picks.find((s) => s.dataset.dirPick === k);
    if (!v || !sel || ![...sel.options].some((o) => o.value === v)) return;
    sel.value = v;
  });
  if (q && qs.get('q')) q.value = qs.get('q');

  render();
}

/* ---------- a planner's page ----------
   planner.html is one shell serving every profile. It reads ?p=<slug> out of
   the URL and renders from window.EP_PLANNERS, which tools/build_planners.py
   writes and which is shaped exactly like the response the backend has to
   return for GET /public/planners/{slug}. When that endpoint exists, the
   assignment below becomes a fetch and the rest of this is unchanged.

   The consultation form at the bottom is the one the planner configures in the
   app: their own welcome message, their own rules of engagement, their own
   consultation fee where they charge one, and the same four sections of
   questions with the same field types. A planner who charges gets a payment
   step; a planner who does not never sees one. */
const plp = $('[data-planner]');
const who = (location.search.match(/[?&]p=([^&]+)/) || [])[1];
const P = who && (window.EP_PLANNERS || []).filter((x) => x.slug === decodeURIComponent(who))[0];

if (plp && P) {
  const IMG = (n) => 'url(img/' + n + '.webp?v=' + (plp.dataset.v || '') + ')';
  const STAR = '<svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" stroke="none">'
    + '<path d="m12 3.6 2.6 5.3 5.8.8-4.2 4.1 1 5.8-5.2-2.7-5.2 2.7 1-5.8L3.6 9.7l5.8-.8z"/></svg>';
  const TICK = '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" '
    + 'stroke-width="2.8"><path d="M20 6 9 17l-5-5"/></svg>';
  const SOC = {
    Instagram: '<rect x="3" y="3" width="18" height="18" rx="5.2"/><circle cx="12" cy="12" r="4"/>'
      + '<circle cx="17.2" cy="6.9" r="1.1" fill="currentColor" stroke="none"/>',
    Facebook: '<path d="M14 21v-7h2.4l.4-2.9H14V9.4c0-.85.24-1.42 1.45-1.42h1.55V5.4c-.27-.04-1.2-.12-2.27-.12-2.24 0-3.78 1.37-3.78 3.88v2.17H8.5V14h2.45v7z"/>',
    LinkedIn: '<path d="M7 20H4V9h3zM5.5 7.4A1.75 1.75 0 1 1 5.5 4a1.75 1.75 0 0 1 0 3.4M20 20h-3v-5.4c0-1.3-.03-2.9-1.8-2.9s-2.05 1.38-2.05 2.81V20h-3V9h2.88v1.5h.04c.4-.76 1.38-1.56 2.84-1.56 3.04 0 3.6 2 3.6 4.6z"/>',
    TikTok: '<path d="M16.3 3c.3 2.1 1.6 3.4 3.7 3.6v2.5c-1.2.1-2.4-.2-3.6-.9v5.5c0 4.4-4.3 6.7-7.5 4.4-2.9-2-2.9-6.4.1-8.3 1-.6 2.1-.9 3.2-.7v2.6c-1.6-.4-2.9.9-2.6 2.4.2 1 1.1 1.7 2.1 1.6 1.2-.1 1.9-1 1.9-2.3V3z"/>'
  };
  const SOC_FILL = { Instagram: 0, Facebook: 1, LinkedIn: 1, TikTok: 1 };
  const COIN = '<svg width="11" height="11" viewBox="0 0 24 24" fill="none" '
    + 'stroke="currentColor" stroke-width="2.4"><circle cx="12" cy="12" r="8.5"/>'
    + '<path d="M12 7.6v8.8M9.4 10h5.2M9.4 14h5.2"/></svg>';
  const NICHE = { weddings: 'wedding', corporate: 'corporate', conferences: 'conference',
    private: 'private dining', launches: 'launch', birthdays: 'birthday' };
  const CHECK = '<svg width="11" height="11" viewBox="0 0 24 24" fill="none" '
    + 'stroke="currentColor" stroke-width="3.4"><path d="M20 6 9 17l-5-5"/></svg>';

  document.title = P.name + ' | EventPlanna';
  plp.style.setProperty('--brand', P.brand);

  /* Charged or free, said once in the badge row where the eye already is. */
  function feeFlag() {
    return P.fee
      ? '<span class="fee-flag paid">' + COIN + ' Consultation ' + money(P.fee) + '</span>'
      : '<span class="fee-flag free">' + COIN + ' Free consultation</span>';
  }

  const facts = [
    ['Typical budget', P.rate],
    ['Events delivered', P.events],
    ['Team', P.team],
    ['Books up', P.lead],
    ['Replies', P.reply]
  ];

  const gal = P.gallery.map((g, n) =>
    '<button class="plp-tile ph ' + P.tint + '" type="button" data-shot="' + n + '" '
    + 'style="--img:' + IMG(g.img) + '" aria-label="' + esc(g.cap) + '">'
    + (g.kind === 'film'
      ? '<span class="plp-play"><svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor" '
        + 'stroke="none"><path d="M8 5.1v13.8L19 12z"/></svg></span>' : '')
    + '<span class="plp-cap">' + esc(g.cap) + (g.kind === 'film' ? ' &middot; Showreel' : '')
    + '</span></button>').join('');

  const past = P.past.map((e) =>
    '<div class="plp-ev"><div><b>' + esc(e.title) + '</b><small>' + esc(e.where)
    + '</small></div><div class="plp-ev-n"><b>' + e.guests + '</b><small>guests</small></div>'
    + '<div class="plp-ev-w">' + esc(e.when) + '</div></div>').join('');

  const says = P.says.map((s) =>
    '<figure class="plp-say"><div class="plp-stars">' + STAR.repeat(s.stars) + '</div>'
    + '<blockquote>' + esc(s.q) + '</blockquote>'
    + '<figcaption>' + esc(s.who) + ' &middot; ' + esc(s['for']) + '</figcaption></figure>').join('');

  const socs = P.socials.map(([net, handle]) =>
    '<div class="plp-soc"><i>' + '<svg width="16" height="16" viewBox="0 0 24 24" '
    + (SOC_FILL[net] ? 'fill="currentColor" stroke="none"' : 'fill="none" stroke="currentColor" stroke-width="1.7"')
    + '>' + SOC[net] + '</svg></i><span><b>' + net + '</b><small>' + esc(handle)
    + '</small></span></div>').join('');

  plp.innerHTML =
    '<section class="section plp">'
    + '<a class="plp-back" href="marketplace.html#directory">&#8249; All planners</a>'
    + '<div class="plp-cover ph ' + P.tint + '" style="--img:' + IMG(P.cover) + '">'
    + '<span class="plp-veil"></span></div>'
    + '<div class="plp-ident">'
    + '<div class="plp-avatar ' + P.tint + '">' + P.initials + '</div>'
    + '<div class="plp-who">'
    + '<div class="plp-badges"><span class="plp-ok">' + TICK + ' Approved</span>'
    + '<span class="plp-rate">' + STAR + ' ' + P.rating + '</span>'
    + '<span class="plp-years">' + P.years + ' years</span>'
    + feeFlag() + '</div>'
    + '<h1>' + esc(P.name) + '</h1>'
    + '<div class="plp-where">' + esc(P.area) + ', ' + esc(P.city) + ' &middot; '
    + esc(P.spec) + '</div></div>'
    + '<div class="plp-act">'
    + '<a class="btn btn-green" href="#consult">'
    + (P.fee ? 'Book a consultation' : 'Book a free consultation') + ' <span class="cap">&#8599;</span></a>'
    + '</div></div>'

    + '<div class="plp-stats">' + facts.map((f) =>
        '<div class="plp-stat"><em>' + f[0] + '</em><b>' + f[1] + '</b></div>').join('') + '</div>'

    + '<div class="plp-main">'
    + '<div class="plp-col">'

    + '<div class="plp-block reveal"><h2>About ' + esc(P.name.split(' ')[0]) + '</h2>'
    + '<p>' + esc(P.bio) + '</p><p>' + esc(P.shape) + '</p><p>' + esc(P.method) + '</p>'
    + '<div class="ep-chips">' + P.does.map((t) => '<span>' + esc(t) + '</span>').join('')
    + '</div></div>'

    + '<div class="plp-block reveal"><h2>The work</h2>'
    + '<p class="muted">Photographs and film from events already delivered. A planner uploads '
    + 'these themselves, and they are checked at approval.</p>'
    + '<div class="plp-gal">' + gal + '</div></div>'

    + '<div class="plp-block reveal"><h2>Recent events</h2>'
    + '<div class="plp-past">' + past + '</div></div>'

    + '<div class="plp-block reveal"><h2>What clients said</h2>'
    + '<p class="muted">A rating can only be left by someone who booked and paid through the '
    + 'platform, against a completed booking.</p>'
    + '<div class="plp-says">' + says + '</div></div>'

    + '</div>'

    + '<aside class="plp-side">'
    + '<div class="plp-card plp-fee">'
    + '<div class="plp-fee-top"><em>Consultation</em><b>'
    + (P.fee ? money(P.fee) : 'Free') + '</b></div>'
    + '<div class="plp-fee-sub">' + P.minutes + ' minutes'
    + (P.fee ? ', taken off your project fee if you book' : ', no card needed') + '</div>'
    + '<ul class="plp-covers">' + P.covers.map((c) =>
        '<li>' + TICK + ' ' + esc(c) + '</li>').join('') + '</ul>'
    + '<a class="btn btn-green" href="#consult" data-go="consult">Book it <span class="cap">&#8599;</span></a>'
    + '</div>'
    + '<div class="plp-card"><h3>Linked accounts</h3>'
    + '<p class="plp-note">Connected by the planner and checked when they were approved.</p>'
    + socs + '</div>'
    + '<div class="plp-card"><h3>Where they work</h3>'
    + '<div class="ep-chips">' + P.areas.concat(P.near).map((a) =>
        '<span>' + esc(a) + '</span>').join('') + '</div></div>'
    + '</aside></div>'

    + '</section>'

    + '<section class="section" id="consult">'
    + '<div class="shead reveal"><span class="eyebrow">Get in touch</span>'
    + '<h2>Book ' + esc(P.name.split(' ')[0]) + '</h2>'
    + '<p>' + esc(P.welcome[0]) + '</p><p style="margin-top:12px">' + esc(P.welcome[1]) + '</p></div>'
    + '<div class="ef-shell" data-form></div>'
    + '</section>'

    /* ---------- more like this ----------
       Somebody who reaches the bottom of a profile and is not sold is one
       click from leaving. Four planners who work in the same city and take
       the same kind of event keep them in the directory instead, and the two
       links underneath open it already filtered. */
    + nearby()
    + '<section class="section"><div class="cta reveal">'
    + '<h2>Still deciding?</h2>'
    + '<p>Open the directory filtered to your city, your event and your budget, and compare on what they charge and what they have actually run.</p>'
    + '<div class="cta-actions">'
    + '<a class="btn btn-green" href="marketplace.html#directory">Browse every planner <span class="cap">&#8599;</span></a>'
    + '<a class="btn btn-light" href="pricing.html">What it costs <span class="cap">&#8599;</span></a>'
    + '</div></div></section>';


  /* ---------- the alternatives ----------
     Scored rather than filtered: the same city is worth more than the same
     kind of event, which is worth more than the same budget band, and the
     four best are shown. Filtering on all three at once would leave a planner
     in Uyo with nothing under them, which is the one case where keeping the
     person on the site matters most. */
  function nearby() {
    const mine = P.types.split(' ');
    const rank = (x) => (x.city === P.city ? 4 : 0)
      + (x.types.split(' ').filter((t) => mine.indexOf(t) >= 0).length ? 2 : 0)
      + (x.band === P.band ? 1 : 0);
    const rest = (window.EP_PLANNERS || []).filter((x) => x.slug !== P.slug);
    const picks = rest.map((x) => ({ x, r: rank(x) }))
      .sort((a, b) => b.r - a.r || b.x.rating - a.x.rating)
      .slice(0, 4).map((o) => o.x);
    if (!picks.length) return '';

    const sameCity = picks.filter((x) => x.city === P.city).length;
    const head = sameCity >= 3 ? 'Other planners in ' + esc(P.city)
      : sameCity ? 'Others near ' + esc(P.city) : 'Others who do this kind of work';
    const kind = (NICHE[mine[0]] || 'event') + ' planner';

    const cards = picks.map((x) =>
      '<a class="dir-card" href="planner.html?p=' + x.slug + '">'
      + '<div class="dir-cover ' + x.tint + '"><span class="dir-mono">' + x.initials + '</span>'
      + '<span class="dir-tag">' + CHECK + ' Approved</span></div>'
      + '<div class="dir-body"><h3>' + esc(x.name) + '</h3>'
      + '<div class="dir-where">' + esc(x.area) + ', ' + esc(x.city) + '</div>'
      + '<div class="dir-spec">' + esc(x.spec) + '</div>'
      + '<div class="dir-foot"><b>' + x.rate + '</b>'
      + '<span class="dir-star">' + STAR + ' ' + x.rating + '</span></div>'
      + '<span class="dir-open">View profile <span>&rarr;</span></span>'
      + '</div></a>').join('');

    return '<section class="section plp-more">'
      + '<div class="shead reveal"><span class="eyebrow">Keep looking</span>'
      + '<h2>' + head + '</h2>'
      + '<p>Shortlist two or three before you brief anyone. Every one of them was checked the same way.</p></div>'
      + '<div class="dir-grid">' + cards + '</div>'
      + '<div class="plp-more-links">'
      + '<a class="btn btn-light btn-sm" href="marketplace.html?city=' + encodeURIComponent(P.city)
      + '#directory">Every planner in ' + esc(P.city) + ' <span class="cap">&#8599;</span></a>'
      + '<a class="btn btn-light btn-sm" href="marketplace.html?type=' + encodeURIComponent(mine[0])
      + '#directory">Every ' + kind + ' <span class="cap">&#8599;</span></a>'
      + '</div></section>';
  }

  /* ---------- the lightbox ----------
     Appended to <body>, never left inside .wrap: .smooth is fixed and
     transformed, and a transformed ancestor makes position:fixed resolve
     against it instead of against the window. */
  const lb = document.createElement('div');
  lb.className = 'lb';
  lb.hidden = true;
  document.body.appendChild(lb);
  let shot = 0, lbt = null;

  function drawShot() {
    const g = P.gallery[shot];
    lb.innerHTML = '<button class="lb-x" type="button" data-lb-shut aria-label="Close">'
      + '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" '
      + 'stroke-width="2.2" stroke-linecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg></button>'
      + '<figure class="lb-fig"><div class="lb-img ph ' + P.tint + '" style="--img:' + IMG(g.img) + '"></div>'
      + '<figcaption>' + esc(g.cap) + ' &middot; ' + esc(P.name)
      + (g.kind === 'film' ? '<span class="lb-film">Showreel</span>' : '')
      + '</figcaption></figure>'
      + '<button class="lb-nav prev" type="button" data-lb="-1" aria-label="Previous">&#8249;</button>'
      + '<button class="lb-nav next" type="button" data-lb="1" aria-label="Next">&#8250;</button>';
  }

  function openShot(n) {
    shot = (n + P.gallery.length) % P.gallery.length;
    clearTimeout(lbt);
    lb.hidden = false;
    drawShot();
    raf(() => lb.classList.add('on'));
    const x = $('[data-lb-shut]', lb);
    if (x) x.focus();
  }

  function shutShot() {
    lb.classList.remove('on');
    clearTimeout(lbt);
    lbt = setTimeout(() => { lb.hidden = true; lb.innerHTML = ''; }, 260);
  }

  plp.addEventListener('click', (e) => {
    const t = e.target.closest('[data-shot]');
    if (t) openShot(+t.dataset.shot);
  });
  lb.addEventListener('click', (e) => {
    const nav = e.target.closest('[data-lb]');
    if (nav) { openShot(shot + +nav.dataset.lb); return; }
    if (e.target === lb || e.target.closest('[data-lb-shut]')) shutShot();
  });
  addEventListener('keydown', (e) => {
    if (lb.hidden) return;
    if (e.key === 'Escape') shutShot();
    else if (e.key === 'ArrowRight') openShot(shot + 1);
    else if (e.key === 'ArrowLeft') openShot(shot - 1);
  });

  /* ---------- the consultation form ----------
     The sections, the field types and the order are the ones a planner sets up
     in the app: client information locked at the top, then the event, then the
     vision and the budget. Both modes ask the same questions, because a
     booking request and a consultation need the same facts; what differs is
     the rules step, the fee and what the page says at the end. */
  const EVENT_TYPES = ['Wedding', 'Traditional wedding', 'Corporate event', 'Conference',
    'Product launch', 'Birthday', 'Private dining', 'Anniversary', 'Other'];

  const F = {
    txt: (k, label, req, type, hint) => ({ k, label, req, kind: 'input', type: type || 'text', hint }),
    sel: (k, label, opts, req, hint) => ({ k, label, req, hint, kind: 'select', opts }),
    area: (k, label, req, hint) => ({ k, label, req, kind: 'textarea', hint }),
    pick: (k, label, opts, req) => ({ k, label, req, kind: 'pick', opts }),
    tags: (k, label, req, hint) => ({ k, label, req, kind: 'tags', hint }),
    cash: (k, label, req, hint) => ({ k, label, req, kind: 'money', hint })
  };

  const SECTIONS = [
    { name: 'Client information', note: 'Every planner asks for these three.', fields: [
      F.txt('name', 'Name', true),
      F.txt('email', 'Email', true, 'email'),
      F.txt('phone', 'Phone number', true, 'tel') ] },
    { name: 'Event overview', fields: [
      F.sel('etype', 'Event type', EVENT_TYPES, true),
      F.txt('edate', 'Event date', true, 'date'),
      F.txt('etime', 'Event time', true, 'time'),
      F.txt('venue', 'Venue location', true, 'text', 'The venue, or the area you are looking in'),
      F.txt('guests', 'Guest size', true, 'number') ] },
    { name: 'Vision & budget', fields: [
      F.txt('theme', 'Event theme', false, 'text', 'Glasshouse garden, black tie, all white'),
      F.tags('colours', 'Event colour(s)', false, 'Type a colour and press enter'),
      F.cash('budget', 'Estimated budget', true),
      F.area('hopes', 'Event expectations', true,
             'What this day has to be, and what would make it a success for you') ] }
  ];

  const ALL = SECTIONS.reduce((a, s) => a.concat(s.fields), []);
  const PAY = F.pick('pay', 'How would you like to pay', ['Card', 'Bank transfer'], true);
  const ACCEPT = { k: 'accept', label: 'Rules of engagement', req: true, kind: 'check',
                   text: 'I have read the rules of engagement and accept them.' };

  const form = $('[data-form]', plp);
  let step = 0, A = {};

  const paying = () => P.fee > 0;
  function stepFields(n) {
    if (n < SECTIONS.length) return SECTIONS[n].fields;
    if (n === SECTIONS.length) return paying() ? [ACCEPT, PAY] : [ACCEPT];
    return [];
  }
  const TOTAL = SECTIONS.length + 2;          // sections, rules, review

  function fieldHtml(f) {
    const id = 'ef-' + f.k;
    const v = A[f.k] || '';
    const lab = '<label for="' + id + '">' + f.label
      + (f.req ? '' : ' <span class="hint">optional</span>') + '</label>'
      + (f.hint ? '<span class="hint">' + f.hint + '</span>' : '');
    let input, wide = false;

    if (f.kind === 'select') {
      input = '<select class="fld" id="' + id + '" data-k="' + f.k + '"><option value="">Choose one</option>'
        + f.opts.map((o) => '<option' + (o === v ? ' selected' : '') + '>' + o + '</option>').join('')
        + '</select>';
    } else if (f.kind === 'textarea') {
      wide = true;
      input = '<textarea class="fld" id="' + id + '" data-k="' + f.k + '" rows="4">' + esc(v) + '</textarea>';
    } else if (f.kind === 'pick') {
      wide = true;
      input = '<div class="ef-pick" id="' + id + '">' + f.opts.map((o) =>
        '<label' + (o === v ? ' class="on"' : '') + '><input type="radio" name="' + f.k
        + '" value="' + o + '" data-k="' + f.k + '"' + (o === v ? ' checked' : '') + '>'
        + o + '</label>').join('') + '</div>';
    } else if (f.kind === 'tags') {
      wide = true;
      input = '<div class="ef-tagbox" data-tags="' + f.k + '">'
        + v.split(',').filter(Boolean).map((t) =>
          '<span class="ef-tag">' + esc(t) + '<button type="button" data-drop="' + esc(t)
          + '" aria-label="Remove ' + esc(t) + '">&times;</button></span>').join('')
        + '<input id="' + id + '" type="text" placeholder="' + (f.hint || 'Add one and press enter') + '"></div>';
      return '<div class="ef-field wide"><label for="' + id + '">' + f.label
        + ' <span class="hint">optional</span></label>' + input
        + '<span class="ef-err" data-err="' + f.k + '"></span></div>';
    } else if (f.kind === 'money') {
      input = '<div class="ef-money"><span>' + NAIRA + '</span>'
        + '<input class="fld" id="' + id + '" data-k="' + f.k + '" type="number" min="0" step="1000"'
        + ' value="' + esc(v) + '" placeholder="1,500,000"></div>';
    } else if (f.kind === 'check') {
      wide = true;
      return '<div class="ef-field wide"><div class="ef-rules">'
        + '<h4>Rules of engagement</h4><ul>'
        + P.rules.map((r) => '<li>' + esc(r) + '</li>').join('') + '</ul></div>'
        + '<label class="ef-check"><input type="checkbox" data-k="' + f.k + '"'
        + (v ? ' checked' : '') + '><span>' + f.text + '</span></label>'
        + '<span class="ef-err" data-err="' + f.k + '"></span></div>';
    } else {
      input = '<input class="fld" id="' + id + '" data-k="' + f.k + '" type="' + f.type
        + '" value="' + esc(v) + '"' + (f.type === 'number' ? ' min="1" step="1"' : '')
        + (f.type === 'date' ? ' min="' + new Date().toISOString().slice(0, 10) + '"' : '') + '>';
    }
    return '<div class="ef-field' + (wide ? ' wide' : '') + '">' + lab + input
      + '<span class="ef-err" data-err="' + f.k + '"></span></div>';
  }

  function rail() {
    let bars = '';
    for (let i = 0; i < TOTAL; i++) bars += '<i' + (i <= step ? ' class="on"' : '') + '></i>';
    return '<div class="ef-rail"><span class="ef-step">Step ' + (step + 1) + ' of ' + TOTAL
      + '</span>' + bars + '</div>';
  }

  function shown(f) {
    const v = A[f.k];
    if (!v) return '';
    if (f.type === 'date') return niceDate(v);
    if (f.type === 'time') return niceTime(v);
    if (f.kind === 'money') return money(v);
    if (f.kind === 'tags') return v.split(',').filter(Boolean).join(', ');
    return v;
  }

  function feePanel() {
    if (mode !== 'consult') return '';
    return '<div class="ef-fee' + (P.fee ? '' : ' free') + '">'
      + '<div><em>' + (P.fee ? 'Consultation fee' : 'This consultation is free') + '</em>'
      + '<b>' + (P.fee ? money(P.fee) : NAIRA + '0') + '</b></div>'
      + '<p>' + P.minutes + ' minutes with ' + esc(P.name) + '. '
      + (P.fee
        ? 'It comes off your project fee if you go on to book, and it is refunded in full if they cannot take your date.'
        : 'No card, and nothing to cancel.') + '</p></div>';
  }

  function draw() {
    let body, foot;
    if (step < SECTIONS.length) {
      const s = SECTIONS[step];
      body = rail() + '<h3 class="ef-h">' + s.name + '</h3>'
        + (s.note ? '<p class="ef-note">' + s.note + '</p>' : '')
        + '<div class="ef-grid">' + s.fields.map(fieldHtml).join('') + '</div>';
      foot = (step ? '<button class="btn btn-light ef-back" type="button" data-back>Back</button>' : '')
        + '<button class="btn btn-green" type="button" data-next>Continue <span class="cap">&#8599;</span></button>';
    } else if (step === SECTIONS.length) {
      body = rail() + '<h3 class="ef-h">Before you send it</h3>'
        + feePanel()
        + '<div class="ef-grid">' + stepFields(step).map(fieldHtml).join('') + '</div>';
      foot = '<button class="btn btn-light ef-back" type="button" data-back>Back</button>'
        + '<button class="btn btn-green" type="button" data-next>Continue <span class="cap">&#8599;</span></button>';
    } else {
      const rows = ALL.concat(stepFields(SECTIONS.length))
        .filter((f) => A[f.k] && f.kind !== 'check')
        .map((f) => '<div><em>' + f.label + '</em><b>' + esc(shown(f)) + '</b></div>').join('')
        + (paying() ? '<div><em>Consultation fee</em><b>' + money(P.fee) + '</b></div>' : '');
      body = rail() + '<h3 class="ef-h">Check it over</h3>'
        + '<div class="ef-review">' + rows + '</div>'
        + '';
      foot = '<button class="btn btn-light ef-back" type="button" data-back>Back</button>'
        + '<button class="btn btn-green" type="button" data-send>'
        + (paying() ? 'Pay and book' : 'Book the consultation')
        + ' <span class="cap">&#8599;</span></button>';
    }
    form.innerHTML = '<div class="ef-body">' + body + '</div><div class="ef-foot">' + foot + '</div>';
    wire();
    measure();
  }

  function wire() {
    $$('[data-k]', form).forEach((el) => {
      const ev = (el.type === 'radio' || el.type === 'checkbox') ? 'change' : 'input';
      el.addEventListener(ev, () => {
        A[el.dataset.k] = el.type === 'checkbox' ? (el.checked ? 'Accepted' : '') : el.value;
        el.setAttribute('aria-invalid', 'false');
        const err = $('[data-err="' + el.dataset.k + '"]', form);
        if (err) err.textContent = '';
        if (el.type === 'radio') {
          $$('input[name="' + el.name + '"]', form)
            .forEach((r) => r.parentElement.classList.toggle('on', r.checked));
        }
      });
    });

    $$('[data-tags]', form).forEach((box) => {
      const key = box.dataset.tags, input = $('input', box);
      const add = (t) => {
        t = t.trim().replace(/,/g, '');
        if (!t) return;
        const now = (A[key] || '').split(',').filter(Boolean);
        if (now.indexOf(t) < 0) now.push(t);
        A[key] = now.join(',');
        draw();
        // Redrawing loses the caret, so put it back where the person was.
        const again = $('[data-tags="' + key + '"] input', form);
        if (again) again.focus();
      };
      input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); add(input.value); }
        else if (e.key === 'Backspace' && !input.value) {
          const now = (A[key] || '').split(',').filter(Boolean);
          now.pop(); A[key] = now.join(','); draw();
          const again = $('[data-tags="' + key + '"] input', form);
          if (again) again.focus();
        }
      });
      $$('[data-drop]', box).forEach((b) => b.addEventListener('click', () => {
        A[key] = (A[key] || '').split(',').filter((t) => t && t !== b.dataset.drop).join(',');
        draw();
      }));
    });

    const back = $('[data-back]', form), next = $('[data-next]', form), send = $('[data-send]', form);
    if (back) back.addEventListener('click', () => { step--; draw(); jump(); });
    if (next) next.addEventListener('click', () => { flushTags(); if (ok()) { step++; draw(); jump(); } });
    if (send) send.addEventListener('click', done);
  }

  /* A colour typed but never confirmed with enter would be thrown away when
     the step is redrawn. Committing it on blur instead looked right and was
     not: the blur fires on mousedown over Continue, the redraw replaces the
     button, and the click that followed landed on nothing. */
  function flushTags() {
    $$('[data-tags]', form).forEach((box) => {
      const key = box.dataset.tags, input = $('input', box);
      const t = input.value.trim().replace(/,/g, '');
      if (!t) return;
      const now = (A[key] || '').split(',').filter(Boolean);
      if (now.indexOf(t) < 0) now.push(t);
      A[key] = now.join(',');
      input.value = '';
    });
  }

  function jump() {
    const c = document.getElementById('consult');
    if (c) scrollTo({ top: anchorY(c), behavior: REDUCED ? 'auto' : 'smooth' });
  }

  function ok() {
    let good = true, first = null;
    stepFields(step).forEach((f) => {
      const v = (A[f.k] || '').trim();
      let why = '';
      if (f.req && !v) why = f.kind === 'check' ? 'Please accept these to continue' : 'This one is needed';
      else if (v && f.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v))
        why = 'That does not look like an email address';
      else if (v && f.type === 'tel' && v.replace(/\D/g, '').length < 7)
        why = 'That is too short for a phone number';
      else if (v && f.type === 'number' && (+v < 1 || +v > 100000))
        why = 'Give a headcount between 1 and 100,000';
      else if (v && f.kind === 'money' && +v < 50000)
        why = 'Give a figure in naira, even a rough one';
      else if (v && f.type === 'date' && v < new Date().toISOString().slice(0, 10))
        why = 'Pick a date that has not already passed';
      if (!why) return;
      good = false;
      const err = $('[data-err="' + f.k + '"]', form);
      if (err) err.textContent = why;
      const el = $('[data-k="' + f.k + '"]', form);
      if (el) { el.setAttribute('aria-invalid', 'true'); if (!first) first = el; }
    });
    if (first) first.focus();
    return good;
  }

  function done() {
    const ref = 'EP-' + Math.random().toString(36).slice(2, 7).toUpperCase();
    const title = 'Consultation';
    const text = title + ' with ' + P.name + ' (' + P.area + ', ' + P.city + ')\n'
      + 'Reference ' + ref + '\n\n'
      + ALL.filter((f) => A[f.k]).map((f) => f.label + ': ' + shown(f)).join('\n')
      + (paying() ? '\nConsultation fee: ' + money(P.fee) + ' (' + (A.pay || 'unpaid') + ')' : '')
      + '\n';

    form.innerHTML = '<div class="ef-body"><div class="ef-done">'
      + '<div class="ef-tick"><svg width="26" height="26" viewBox="0 0 24 24" fill="none" '
      + 'stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round">'
      + '<path d="M20 6 9 17l-5-5"/></svg></div>'
      + '<h3>Your brief is ready</h3>'
      + '<p>Keep this reference. Once the directory is live it is the one you quote, and the brief '
      + 'below is exactly what reaches ' + esc(P.name) + '.</p>'
      + '<div class="ef-ref">' + ref + '</div></div>'
      + '<p class="ef-small">This is a preview of the platform, so nothing was sent'
      + (paying() ? ' and nothing was charged' : '') + '. Copy the brief if you want to keep it.</p>'
      + '</div></div>'
      + '<div class="ef-foot">'
      + '<button class="btn btn-light ef-back" type="button" data-copy>Copy the brief</button>'
      + '<a class="btn btn-green" href="index.html#start">Create an account <span class="cap">&#8599;</span></a>'
      + '</div>';
    measure();
    const copy = $('[data-copy]', form);
    copy.addEventListener('click', () => {
      const say = (good) => { copy.textContent = good ? 'Copied' : 'Could not copy'; };
      if (navigator.clipboard) navigator.clipboard.writeText(text).then(() => say(1), () => say(0));
      else say(0);
    });
  }

  draw();
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

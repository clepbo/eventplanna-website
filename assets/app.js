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

/* ---------- the planner directory ----------
   Search, four filters, a sort and a pager, over a list that is already in the
   HTML. Nothing here fetches anything and nothing here builds a card: every
   profile is in the markup with its detail on data attributes, so the page is
   complete with JavaScript off and this only decides what is on screen.

   That is the shape to keep when the backend arrives. Replacing readCards()
   with a fetch and keeping render() as it is would move the same page onto
   live data without touching the filtering, the pager, the modal or the form.

   The one thing built here is the dialog, because a dialog is not content. It
   is appended to <body> and never to .wrap: .smooth is fixed and transformed,
   and a transformed ancestor makes position:fixed resolve against it rather
   than against the window, which would pin the overlay to the top of the
   document instead of the top of the screen. */
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
    hay: (el.dataset.name + ' ' + el.dataset.area + ' ' + el.dataset.city + ' '
        + el.dataset.spec + ' ' + el.dataset.does).toLowerCase(),
    city: el.dataset.city, type: el.dataset.types, band: +el.dataset.band,
    rating: +el.dataset.rating, events: +el.dataset.events
  }));

  const SORTS = {
    best:    (a, b) => a.i - b.i,
    rating:  (a, b) => b.rating - a.rating || a.i - b.i,
    budget:  (a, b) => a.band - b.band || a.i - b.i,
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

  pager && pager.addEventListener('click', (e) => {
    const b = e.target.closest('button[data-go]');
    if (!b || b.disabled) return;
    page = +b.dataset.go;
    render(true);
    scrollTo({ top: anchorY(dir), behavior: REDUCED ? 'auto' : 'smooth' });
  });

  let qt;
  q && q.addEventListener('input', () => { clearTimeout(qt); qt = setTimeout(render, 160); });
  picks.forEach((s) => s.addEventListener('change', () => render()));

  const reset = $('[data-dir-reset]', dir);
  reset && reset.addEventListener('click', () => {
    if (q) q.value = '';
    picks.forEach((s) => { s.value = s.dataset.dirPick === 'sort' ? 'best' : ''; });
    render();
  });

  grid.addEventListener('click', (e) => {
    const c = e.target.closest('.dir-card');
    if (c) openPlanner(c);
  });

  render();

  /* ---------- the dialog ---------- */
  const modal = document.createElement('div');
  modal.className = 'ep-modal';
  modal.setAttribute('role', 'dialog');
  modal.setAttribute('aria-modal', 'true');
  modal.hidden = true;
  modal.innerHTML = '<div class="ep-dialog"></div>';
  document.body.appendChild(modal);
  const dlg = $('.ep-dialog', modal);
  let opener = null, card = null;

  const X = '<button class="ep-x" type="button" data-shut aria-label="Close">'
    + '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" '
    + 'stroke-width="2.2" stroke-linecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg></button>';

  let shutter = null;
  function openPlanner(el) {
    card = el;
    // Focus goes back to the control the keyboard used to get here, which is
    // the button inside the card rather than the card itself.
    opener = $('.dir-open', el) || el;
    clearTimeout(shutter);
    modal.hidden = false;
    profile();
    raf(() => modal.classList.add('on'));
    const f = $('[data-shut]', dlg);
    if (f) f.focus();
  }

  function shut() {
    modal.classList.remove('on');
    clearTimeout(shutter);
    shutter = setTimeout(() => { modal.hidden = true; dlg.innerHTML = ''; }, 280);
    if (opener) opener.focus();
  }

  modal.addEventListener('click', (e) => {
    if (e.target === modal || e.target.closest('[data-shut]')) shut();
  });
  addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !modal.hidden) shut();
  });
  /* A dialog with nothing behind it to tab to: keep focus inside it. */
  modal.addEventListener('keydown', (e) => {
    if (e.key !== 'Tab') return;
    const f = $$('button, [href], input, select, textarea', dlg).filter((n) => !n.disabled);
    if (!f.length) return;
    const first = f[0], last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  });

  function fact(label, value) {
    return '<div class="ep-fact"><em>' + label + '</em><b>' + value + '</b></div>';
  }

  function profile() {
    const d = card.dataset;
    dlg.innerHTML =
      '<div class="ep-dialog-head">'
      + '<div class="ep-mono ' + d.tint + '">' + d.initials + '</div>'
      + '<div><h2>' + d.name + '</h2><div class="ui-sub">' + d.area + ', ' + d.city
      + ' &middot; ' + d.spec + '</div></div>' + X + '</div>'
      + '<div class="ep-body">'
      + '<p class="muted" style="font-size:14.5px">' + d.bio + '</p>'
      + '<div class="ep-facts">'
      + fact('Typical budget', d.rate)
      + fact('Events delivered', d.events)
      + fact('Team size', d.team)
      + fact('Books up', d.lead)
      + '</div>'
      + '<h3 style="font-size:15px;margin-top:22px">What they take on</h3>'
      + '<div class="ep-chips">'
      + d.does.split(',').map((t) => '<span>' + t.trim() + '</span>').join('')
      + '</div>'
      + '<div class="live-note" style="margin-top:22px">This profile is an illustration of how a '
      + 'planner will appear once the directory is live. ' + d.name
      + ' is not a real business, and the figures above are invented.</div>'
      + '</div>'
      + '<div class="ep-foot">'
      + '<button class="btn btn-light" type="button" data-flow="consult">Book a consultation '
      + '<span class="cap">&#8599;</span></button>'
      + '<button class="btn btn-green" type="button" data-flow="book">Request a booking '
      + '<span class="cap">&#8599;</span></button></div>';
  }

  dlg.addEventListener('click', (e) => {
    const go = e.target.closest('[data-flow]');
    if (go) startFlow(go.dataset.flow);
  });

  /* ---------- book / consult ----------
     One engine, two field sets. Each step is a list of fields; a field knows
     how to draw itself, how to read itself back and what makes it invalid, so
     adding a question is a line in STEPS rather than a new branch. */
  const EVENT_TYPES = ['Wedding', 'Traditional wedding', 'Corporate event', 'Conference',
    'Product launch', 'Birthday', 'Private dining', 'Other'];
  const CITIES = ['Lagos', 'Abuja', 'Port Harcourt', 'Ibadan', 'Enugu', 'Benin City',
    'Owerri', 'Kano', 'Uyo'];
  // The naira sign is written as an escape, not as a character and not as an
  // HTML entity: an entity would survive into the option's value and stop a
  // chosen budget matching itself when the step is reopened with Back.
  const N = '\u20A6';
  const BUDGETS = ['Under ' + N + '2m', N + '2m to ' + N + '5m', N + '5m to ' + N + '15m',
    N + '15m and above', 'Not decided yet'];

  const F = {
    sel: (k, label, opts, req) => ({ k, label, req, kind: 'select', opts }),
    txt: (k, label, req, type, hint) => ({ k, label, req, kind: 'input', type: type || 'text', hint }),
    area: (k, label, req, hint) => ({ k, label, req, kind: 'textarea', hint }),
    pick: (k, label, opts, req) => ({ k, label, req, kind: 'pick', opts })
  };

  const FLOWS = {
    book: {
      title: 'Request a booking',
      verb: 'Send the request',
      steps: [
        { name: 'The event', fields: [
          F.sel('type', 'What kind of event', EVENT_TYPES, true),
          F.txt('date', 'Date of the event', true, 'date'),
          F.sel('city', 'City', CITIES, true),
          F.txt('guests', 'Guests expected', true, 'number'),
          F.sel('budget', 'Budget band', BUDGETS, true) ] },
        { name: 'You', fields: [
          F.txt('name', 'Your name', true),
          F.txt('email', 'Email', true, 'email'),
          F.txt('phone', 'Phone', true, 'tel', 'So the planner can reach you quickly'),
          F.pick('contact', 'Best way to reach you', ['WhatsApp', 'Email', 'Phone call'], true) ] },
        { name: 'The brief', fields: [
          F.area('brief', 'What do you want this event to be', true,
                 'Venue, the feel of it, anything already booked, anything you are worried about') ] }
      ]
    },
    consult: {
      title: 'Book a consultation',
      verb: 'Book the call',
      steps: [
        { name: 'The call', fields: [
          F.sel('type', 'What is the event', EVENT_TYPES, true),
          F.txt('date', 'Rough date, if you have one', false, 'date'),
          F.pick('length', 'How long', ['20 minutes', '45 minutes'], true),
          F.area('topic', 'What do you want to go through', true,
                 'Budget, venue, where to start, a second opinion') ] },
        { name: 'You', fields: [
          F.txt('name', 'Your name', true),
          F.txt('email', 'Email', true, 'email'),
          F.txt('phone', 'Phone', false, 'tel'),
          F.pick('contact', 'Where should the call happen', ['WhatsApp', 'Phone call', 'Video call'], true) ] }
      ]
    }
  };

  let flow = null, step = 0, answers = {};

  function startFlow(which) {
    flow = FLOWS[which];
    step = 0;
    answers = {};
    drawStep();
  }

  function fieldHtml(f) {
    const id = 'ef-' + f.k;
    const v = answers[f.k] || '';
    const lab = '<label for="' + id + '">' + f.label
      + (f.req ? '' : ' <span class="hint">optional</span>') + '</label>'
      + (f.hint ? '<span class="hint">' + f.hint + '</span>' : '');
    let input;
    if (f.kind === 'select') {
      input = '<select class="fld" id="' + id + '" data-k="' + f.k + '">'
        + '<option value="">Choose one</option>'
        + f.opts.map((o) => '<option' + (o === v ? ' selected' : '') + '>' + o + '</option>').join('')
        + '</select>';
    } else if (f.kind === 'textarea') {
      input = '<textarea class="fld" id="' + id + '" data-k="' + f.k + '" rows="4">'
        + v + '</textarea>';
    } else if (f.kind === 'pick') {
      input = '<div class="ef-pick" id="' + id + '">' + f.opts.map((o, n) =>
        '<label' + (o === v ? ' class="on"' : '') + '><input type="radio" name="' + f.k + '" value="'
        + o + '" data-k="' + f.k + '"' + (o === v ? ' checked' : '') + '>' + o + '</label>').join('')
        + '</div>';
    } else {
      input = '<input class="fld" id="' + id + '" data-k="' + f.k + '" type="' + f.type
        + '" value="' + v + '"' + (f.type === 'number' ? ' min="1" step="1"' : '')
        + (f.type === 'date' ? ' min="' + new Date().toISOString().slice(0, 10) + '"' : '') + '>';
    }
    return '<div class="ef-field' + (f.kind === 'textarea' || f.kind === 'pick' ? ' wide' : '')
      + '">' + lab + input + '<span class="ef-err" data-err="' + f.k + '"></span></div>';
  }

  function rail(n, total) {
    let bars = '';
    for (let i = 0; i < total; i++) bars += '<i' + (i <= n ? ' class="on"' : '') + '></i>';
    return '<div class="ef-rail"><span class="ef-step">Step ' + (n + 1) + ' of ' + total
      + '</span>' + bars + '</div>';
  }

  function drawStep() {
    const total = flow.steps.length + 1;              // the review is a step too
    const d = card.dataset;
    const head = '<div class="ep-dialog-head"><div class="ep-mono ' + d.tint + '">'
      + d.initials + '</div><div><h2>' + flow.title + '</h2>'
      + '<div class="ui-sub">with ' + d.name + ' &middot; ' + d.area + ', ' + d.city
      + '</div></div>' + X + '</div>';

    let body, foot;
    if (step < flow.steps.length) {
      const s = flow.steps[step];
      body = '<div class="ep-body">' + rail(step, total)
        + '<h3 style="font-size:15px;margin-bottom:14px">' + s.name + '</h3>'
        + '<div class="ef-grid">' + s.fields.map(fieldHtml).join('') + '</div></div>';
      foot = '<div class="ep-foot">'
        + '<button class="btn btn-light ep-back" type="button" data-back>'
        + (step ? 'Back' : 'Planner') + '</button>'
        + '<button class="btn btn-green" type="button" data-next>Continue '
        + '<span class="cap">&#8599;</span></button></div>';
    } else {
      const rows = flow.steps.reduce((all, s) => all.concat(s.fields), [])
        .filter((f) => answers[f.k])
        .map((f) => '<div><em>' + f.label + '</em><b>' + esc(show(f, answers[f.k]))
          + '</b></div>').join('');
      body = '<div class="ep-body">' + rail(step, total)
        + '<h3 style="font-size:15px;margin-bottom:14px">Check it over</h3>'
        + '<div class="ef-review">' + rows + '</div>'
        + '<div class="live-note" style="margin-top:20px">Sending is the one step that needs the '
        + 'backend. The planner endpoints are not live yet, so nothing leaves this page: you will '
        + 'get the brief back to keep, and it will reach a planner once the directory goes live.'
        + '</div></div>';
      foot = '<div class="ep-foot">'
        + '<button class="btn btn-light ep-back" type="button" data-back>Back</button>'
        + '<button class="btn btn-green" type="button" data-send>' + flow.verb
        + ' <span class="cap">&#8599;</span></button></div>';
    }
    dlg.innerHTML = head + body + foot;
    const first = $('.ef-grid .fld, .ef-grid input', dlg);
    if (first && step < flow.steps.length) first.focus();
    wireStep();
  }

  /* A date input hands back 2027-03-14, which is what the field needs and not
     what anybody wants to read back on a review screen. */
  function show(f, v) {
    if (f.type !== 'date' || !/^\d{4}-\d{2}-\d{2}$/.test(v)) return v;
    return new Date(v + 'T00:00:00')
      .toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
  }

  function esc(s) {
    return String(s).replace(/[&<>"]/g, (c) =>
      ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  }

  function wireStep() {
    $$('[data-k]', dlg).forEach((el) => {
      const ev = el.type === 'radio' ? 'change' : 'input';
      el.addEventListener(ev, () => {
        answers[el.dataset.k] = el.value;
        el.setAttribute('aria-invalid', 'false');
        const err = $('[data-err="' + el.dataset.k + '"]', dlg);
        if (err) err.textContent = '';
        if (el.type === 'radio') {
          $$('input[name="' + el.name + '"]', dlg)
            .forEach((r) => r.parentElement.classList.toggle('on', r.checked));
        }
      });
    });
    const back = $('[data-back]', dlg), next = $('[data-next]', dlg), send = $('[data-send]', dlg);
    if (back) back.addEventListener('click', () => {
      if (step === 0) profile(); else { step--; drawStep(); }
    });
    if (next) next.addEventListener('click', () => { if (validate()) { step++; drawStep(); } });
    if (send) send.addEventListener('click', done);
  }

  function validate() {
    const s = flow.steps[step];
    let ok = true, firstBad = null;
    s.fields.forEach((f) => {
      const v = (answers[f.k] || '').trim();
      let why = '';
      if (f.req && !v) why = 'This one is needed';
      else if (v && f.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v))
        why = 'That does not look like an email address';
      else if (v && f.type === 'number' && (+v < 1 || +v > 100000))
        why = 'Give a headcount between 1 and 100,000';
      else if (v && f.type === 'date' && v < new Date().toISOString().slice(0, 10))
        why = 'Pick a date that has not already passed';
      if (!why) return;
      ok = false;
      const err = $('[data-err="' + f.k + '"]', dlg);
      if (err) err.textContent = why;
      const input = $('[data-k="' + f.k + '"]', dlg);
      if (input) {
        input.setAttribute('aria-invalid', 'true');
        if (!firstBad) firstBad = input;
      }
    });
    if (firstBad) firstBad.focus();
    return ok;
  }

  function done() {
    const ref = 'EP-' + Math.random().toString(36).slice(2, 7).toUpperCase();
    const d = card.dataset;
    const text = flow.title + ' with ' + d.name + ' (' + d.area + ', ' + d.city + ')\n'
      + 'Reference ' + ref + '\n\n'
      + flow.steps.reduce((all, s) => all.concat(s.fields), [])
        .filter((f) => answers[f.k])
        .map((f) => f.label + ': ' + show(f, answers[f.k]).replace(/\u20A6/g, 'NGN ')).join('\n');

    dlg.innerHTML = '<div class="ep-dialog-head"><div><h2>' + flow.title + '</h2>'
      + '<div class="ui-sub">' + d.name + '</div></div>' + X + '</div>'
      + '<div class="ep-body"><div class="ef-done">'
      + '<div class="ef-tick"><svg width="26" height="26" viewBox="0 0 24 24" fill="none" '
      + 'stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round">'
      + '<path d="M20 6 9 17l-5-5"/></svg></div>'
      + '<h3>Your brief is ready</h3>'
      + '<p>Keep this reference. Once the directory is live it is the one you quote, and the brief '
      + 'below is exactly what reaches ' + esc(d.name) + '.</p>'
      + '<div class="ef-ref">' + ref + '</div></div>'
      + '<div class="live-note" style="margin-top:24px">Nothing was sent. The planner booking '
      + 'endpoint does not exist on the backend yet, so this is held in your browser only and is '
      + 'gone when you close the tab. Copy it if you want to keep it.</div></div>'
      + '<div class="ep-foot">'
      + '<button class="btn btn-light ep-back" type="button" data-copy>Copy the brief</button>'
      + '<a class="btn btn-green" href="index.html#start">Create an account '
      + '<span class="cap">&#8599;</span></a></div>';

    const copy = $('[data-copy]', dlg);
    copy.addEventListener('click', () => {
      const say = (ok) => { copy.textContent = ok ? 'Copied' : 'Could not copy'; };
      if (navigator.clipboard) navigator.clipboard.writeText(text).then(() => say(1), () => say(0));
      else say(0);
    });
  }
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

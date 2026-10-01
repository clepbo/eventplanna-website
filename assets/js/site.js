/* ==========================================================================
   EventPlanna — motion + interaction
   GSAP ScrollTrigger drives the scroll choreography. Everything degrades:
   if GSAP never loads, the page is still fully readable and operable.
   ========================================================================== */
(function () {
  'use strict';

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var hasGSAP = typeof window.gsap !== 'undefined' && typeof window.ScrollTrigger !== 'undefined';
  if (hasGSAP) gsap.registerPlugin(ScrollTrigger);

  /* ---------------------------------------------------- smooth scroll
     A small lerp-based smoother. Deliberately hand-rolled rather than
     another CDN dependency — it's ~25 lines and can't fail to load. */
  var smoother = null;
  function initSmoothScroll() {
    if (reduced || window.innerWidth < 860 || !hasGSAP) return;
    var target = window.scrollY, current = window.scrollY, running = false;
    var EASE = 0.1;

    function loop() {
      current += (target - current) * EASE;
      if (Math.abs(target - current) < 0.3) { current = target; running = false; }
      window.scrollTo(0, current);
      ScrollTrigger.update();
      if (running) requestAnimationFrame(loop);
    }
    window.addEventListener('wheel', function (e) {
      if (e.ctrlKey) return;
      e.preventDefault();
      target = Math.max(0, Math.min(target + e.deltaY, document.body.scrollHeight - window.innerHeight));
      if (!running) { running = true; requestAnimationFrame(loop); }
    }, { passive: false });
    window.addEventListener('resize', function () { target = window.scrollY; current = window.scrollY; });
    smoother = { to: function (y) { target = y; current = y; window.scrollTo(0, y); } };
  }

  /* ---------------------------------------------------- nav */
  function initNav() {
    var nav = document.querySelector('.nav');
    if (!nav) return;

    function onScroll() {
      nav.classList.toggle('is-stuck', window.scrollY > 20);
      // invert over dark bands
      var darks = document.querySelectorAll('.band--ink, .door--pro, .footer, [data-nav="dark"]');
      var probe = nav.offsetHeight * 0.55;
      var over = false;
      for (var i = 0; i < darks.length; i++) {
        var r = darks[i].getBoundingClientRect();
        if (r.top <= probe && r.bottom >= probe) { over = true; break; }
      }
      nav.classList.toggle('is-dark', over);
    }
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });

    var burger = document.querySelector('.nav__burger');
    var menu = document.querySelector('.mobile-menu');
    var close = document.querySelector('.mobile-menu__close');
    if (burger && menu) {
      burger.addEventListener('click', function () {
        menu.classList.add('is-open');
        document.body.style.overflow = 'hidden';
      });
      var shut = function () { menu.classList.remove('is-open'); document.body.style.overflow = ''; };
      if (close) close.addEventListener('click', shut);
      menu.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', shut); });
      document.addEventListener('keydown', function (e) { if (e.key === 'Escape') shut(); });
    }
  }

  /* ---------------------------------------------------- reveal on enter */
  function initReveals() {
    var els = document.querySelectorAll('.r-up');
    if (!els.length) return;
    if (!('IntersectionObserver' in window) || reduced) {
      els.forEach(function (el) { el.classList.add('in'); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        var el = en.target;
        var d = parseFloat(el.getAttribute('data-delay') || 0);
        setTimeout(function () { el.classList.add('in'); }, d * 1000);
        io.unobserve(el);
      });
    }, { rootMargin: '0px 0px -12% 0px', threshold: 0.12 });
    els.forEach(function (el) { io.observe(el); });
  }

  /* ---------------------------------------------------- hero chips scatter */
  function initHero() {
    if (!hasGSAP || reduced) return;
    var hero = document.querySelector('.hero');
    if (!hero) return;

    // entrance
    var tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
    tl.from('.hero h1 .ln', { yPercent: 115, opacity: 0, duration: 1, stagger: 0.09 })
      .from('.hero .chip', { scale: 0.2, opacity: 0, rotate: -28, duration: 0.85, stagger: 0.07, ease: 'back.out(1.7)' }, '-=0.72')
      .from('.hero .inline-cta', { scale: 0.4, opacity: 0, duration: 0.6, ease: 'back.out(2)' }, '-=0.5')
      .from('.hero__sub, .hero__ctas, .hero__note', { y: 24, opacity: 0, duration: 0.7, stagger: 0.1 }, '-=0.42');

    // scatter the chips outward as the hero leaves
    gsap.utils.toArray('.hero .chip').forEach(function (chip, i) {
      var dirX = (i % 2 === 0 ? -1 : 1) * (90 + i * 55);
      var dirY = -70 - i * 42;
      gsap.to(chip, {
        x: dirX, y: dirY, rotate: (i % 2 === 0 ? -1 : 1) * 32, scale: 0.72, opacity: 0,
        ease: 'none',
        scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: 0.6 }
      });
    });
    gsap.to('.hero__inner', {
      y: -60, opacity: 0.1, ease: 'none',
      scrollTrigger: { trigger: hero, start: '28% top', end: 'bottom top', scrub: 0.6 }
    });

    // parallax drift on decorative float cards
    gsap.utils.toArray('.float-card').forEach(function (c, i) {
      gsap.to(c, {
        y: (i % 2 ? 120 : -120), rotate: (i % 2 ? 8 : -8), ease: 'none',
        scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: 1 }
      });
    });
  }

  /* ---------------------------------------------------- word-by-word reveal */
  function initWordReveal() {
    var blocks = document.querySelectorAll('.reveal-text');
    if (!blocks.length) return;

    blocks.forEach(function (block) {
      if (block.dataset.split === '1') return;
      var words = block.textContent.trim().split(/\s+/);
      block.textContent = '';
      words.forEach(function (w, i) {
        var s = document.createElement('span');
        s.className = 'w';
        s.textContent = w;
        block.appendChild(s);
        if (i < words.length - 1) block.appendChild(document.createTextNode(' '));
      });
      block.dataset.split = '1';

      var spans = block.querySelectorAll('.w');
      if (!hasGSAP || reduced) { spans.forEach(function (s) { s.classList.add('on'); }); return; }

      ScrollTrigger.create({
        trigger: block,
        start: 'top 78%',
        end: 'bottom 48%',
        scrub: true,
        onUpdate: function (self) {
          var n = Math.round(self.progress * spans.length);
          spans.forEach(function (s, i) { s.classList.toggle('on', i < n); });
        }
      });
    });
  }

  /* ---------------------------------------------------- pinned phone */
  function initPhone() {
    if (!hasGSAP || reduced) return;
    var stage = document.querySelector('[data-phone-stage]');
    if (!stage) return;

    gsap.fromTo(stage.querySelector('.phone'),
      { scale: 0.74, y: 70 },
      {
        scale: 1, y: 0, ease: 'none',
        scrollTrigger: { trigger: stage, start: 'top 82%', end: 'top 18%', scrub: 0.7 }
      });

    gsap.utils.toArray(stage.querySelectorAll('.orbit')).forEach(function (o, i) {
      var fromX = parseFloat(o.dataset.fromx || (i % 2 ? 90 : -90));
      var fromY = parseFloat(o.dataset.fromy || 50);
      gsap.fromTo(o,
        { x: fromX, y: fromY, opacity: 0, scale: 0.86 },
        {
          x: 0, y: 0, opacity: 1, scale: 1, ease: 'power2.out',
          scrollTrigger: { trigger: stage, start: 'top 72%', end: 'top 26%', scrub: 0.8 }
        });
    });
  }

  /* ---------------------------------------------------- background morph */
  function initBandMorph() {
    if (!hasGSAP || reduced) return;
    document.querySelectorAll('[data-morph]').forEach(function (band) {
      var to = band.getAttribute('data-morph');
      ScrollTrigger.create({
        trigger: band, start: 'top 62%', end: 'bottom 38%',
        onEnter: function () { gsap.to('body', { backgroundColor: to, duration: 0.6, overwrite: 'auto' }); },
        onEnterBack: function () { gsap.to('body', { backgroundColor: to, duration: 0.6, overwrite: 'auto' }); }
      });
    });
  }

  /* ---------------------------------------------------- counters */
  function initCounters() {
    var nums = document.querySelectorAll('[data-count]');
    if (!nums.length) return;
    if (!('IntersectionObserver' in window)) return;

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        var el = en.target;
        io.unobserve(el);
        var end = parseFloat(el.getAttribute('data-count'));
        var pre = el.getAttribute('data-pre') || '';
        var suf = el.getAttribute('data-suf') || '';
        var dec = parseInt(el.getAttribute('data-dec') || '0', 10);
        if (reduced) { el.textContent = pre + end.toFixed(dec) + suf; return; }
        var t0 = null, dur = 1500;
        function step(ts) {
          if (!t0) t0 = ts;
          var p = Math.min((ts - t0) / dur, 1);
          var eased = 1 - Math.pow(1 - p, 3);
          var v = end * eased;
          el.textContent = pre + v.toFixed(dec).replace(/\B(?=(\d{3})+(?!\d))/g, ',') + suf;
          if (p < 1) requestAnimationFrame(step);
        }
        requestAnimationFrame(step);
      });
    }, { threshold: 0.4 });
    nums.forEach(function (n) { io.observe(n); });
  }

  /* ---------------------------------------------------- FAQ */
  function initFAQ() {
    document.querySelectorAll('.faq__q').forEach(function (q) {
      q.setAttribute('aria-expanded', 'false');
      q.addEventListener('click', function () {
        var item = q.closest('.faq__item');
        var panel = item.querySelector('.faq__a');
        var open = item.classList.toggle('open');
        q.setAttribute('aria-expanded', open ? 'true' : 'false');
        panel.style.maxHeight = open ? panel.scrollHeight + 'px' : '0px';
      });
    });
  }

  /* ---------------------------------------------------- marketplace filters */
  function initFilters() {
    var grid = document.querySelector('[data-mk-grid]');
    if (!grid) return;
    var cards = Array.prototype.slice.call(grid.querySelectorAll('[data-cat]'));
    var empty = document.querySelector('[data-mk-empty]');
    var countEl = document.querySelector('[data-mk-count]');

    function apply() {
      var side = document.querySelector('.mk-toggle button.on');
      var sideVal = side ? side.getAttribute('data-side') : 'all';
      var active = Array.prototype.slice.call(document.querySelectorAll('.fchip.on'))
        .map(function (c) { return c.getAttribute('data-filter'); })
        .filter(function (v) { return v && v !== 'all'; });

      var shown = 0;
      cards.forEach(function (card) {
        var cat = card.getAttribute('data-cat');
        var cardSide = card.getAttribute('data-side');
        var okCat = !active.length || active.indexOf(cat) !== -1;
        var okSide = sideVal === 'all' || cardSide === sideVal;
        var show = okCat && okSide;
        card.style.display = show ? '' : 'none';
        if (show) shown++;
      });
      if (countEl) countEl.textContent = shown;
      if (empty) empty.style.display = shown ? 'none' : '';
    }

    document.querySelectorAll('.fchip').forEach(function (chip) {
      chip.addEventListener('click', function () {
        if (chip.getAttribute('data-filter') === 'all') {
          document.querySelectorAll('.fchip').forEach(function (c) { c.classList.remove('on'); });
          chip.classList.add('on');
        } else {
          var all = document.querySelector('.fchip[data-filter="all"]');
          if (all) all.classList.remove('on');
          chip.classList.toggle('on');
          if (!document.querySelectorAll('.fchip.on').length && all) all.classList.add('on');
        }
        apply();
      });
    });

    document.querySelectorAll('.mk-toggle button').forEach(function (b) {
      b.addEventListener('click', function () {
        document.querySelectorAll('.mk-toggle button').forEach(function (x) { x.classList.remove('on'); });
        b.classList.add('on');
        apply();
      });
    });

    apply();
  }

  /* ---------------------------------------------------- anchor scrolling */
  function initAnchors() {
    document.querySelectorAll('a[href^="#"]').forEach(function (a) {
      a.addEventListener('click', function (e) {
        var id = a.getAttribute('href');
        if (!id || id === '#') return;
        var t = document.querySelector(id);
        if (!t) return;
        e.preventDefault();
        var y = t.getBoundingClientRect().top + window.scrollY - 86;
        if (smoother) smoother.to(y);
        else window.scrollTo({ top: y, behavior: reduced ? 'auto' : 'smooth' });
      });
    });
  }

  /* ---------------------------------------------------- image fallbacks
     Any art-directed <img> that 404s drops out so the CSS tint behind it
     shows through — the page never renders a broken-image icon. */
  function initImageFallbacks() {
    document.querySelectorAll('img[data-fallback]').forEach(function (img) {
      img.addEventListener('error', function () { img.style.display = 'none'; });
      if (img.complete && img.naturalWidth === 0) img.style.display = 'none';
    });
  }

  /* ---------------------------------------------------- boot */
  function boot() {
    document.documentElement.classList.add('js');
    initNav();
    initSmoothScroll();
    initReveals();
    initHero();
    initWordReveal();
    initPhone();
    initBandMorph();
    initCounters();
    initFAQ();
    initFilters();
    initAnchors();
    initImageFallbacks();
    if (hasGSAP) setTimeout(function () { ScrollTrigger.refresh(); }, 350);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();

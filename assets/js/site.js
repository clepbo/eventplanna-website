/* ==========================================================================
   EventPlanna  motion + interaction

   PERFORMANCE NOTES (this file was rewritten after the first pass shipped laggy)
   The original version did four expensive things. None of them are done now:

   1. It hijacked `wheel`, preventDefault'd it, and called window.scrollTo()
      plus ScrollTrigger.update() on every rAF tick. That fights the browser's
      own scroller, kills trackpad momentum, and forces layout every frame.
      -> Native scroll now. ScrollTrigger listens to it directly.
   2. The nav scroll handler ran querySelectorAll + getBoundingClientRect on
      every scroll event -> layout thrash.
      -> IntersectionObserver, zero work per scroll event.
   3. It tweened `body { background-color }`, repainting the whole page each
      frame.  -> Sections paint their own backgrounds; nothing animates colour.
   4. Every chip/card had its own ScrollTrigger with scrub.
      -> One pinned timeline for the hero, one for the phone.

   Everything animated here is transform/opacity only, so it stays on the
   compositor.
   ========================================================================== */
(function () {
  'use strict';

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var hasGSAP = typeof window.gsap !== 'undefined' && typeof window.ScrollTrigger !== 'undefined';

  if (hasGSAP) {
    gsap.registerPlugin(ScrollTrigger);
    // Only fire callbacks at the start/end of a scroll, not every tick.
    ScrollTrigger.config({ limitCallbacks: true, ignoreMobileResize: true });
  }

  /* ---------------------------------------------------- nav
     is-stuck is rAF-throttled; is-dark comes from an observer so scrolling
     itself costs nothing. */
  function initNav() {
    var nav = document.querySelector('.nav');
    if (!nav) return;

    var ticking = false;
    function onScroll() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function () {
        nav.classList.toggle('is-stuck', window.scrollY > 24);
        ticking = false;
      });
    }
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });

    var darks = document.querySelectorAll('.band--ink, .footer, [data-nav="dark"]');
    if (darks.length && 'IntersectionObserver' in window) {
      var hits = new Set();
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting) hits.add(en.target); else hits.delete(en.target);
        });
        nav.classList.toggle('is-dark', hits.size > 0);
      }, { rootMargin: '-40px 0px -100% 0px', threshold: 0 });
      darks.forEach(function (d) { io.observe(d); });
    }

    var burger = document.querySelector('.nav__burger');
    var menu = document.querySelector('.mobile-menu');
    var closeBtn = document.querySelector('.mobile-menu__close');
    if (burger && menu) {
      var shut = function () { menu.classList.remove('is-open'); document.body.style.overflow = ''; };
      burger.addEventListener('click', function () {
        menu.classList.add('is-open'); document.body.style.overflow = 'hidden';
      });
      if (closeBtn) closeBtn.addEventListener('click', shut);
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
        if (d) el.style.transitionDelay = d + 's';
        el.classList.add('in');
        io.unobserve(el);
      });
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0.1 });
    els.forEach(function (el) { io.observe(el); });
  }

  /* ---------------------------------------------------- hero
     Matches the reference: the headline STAYS PUT while a coloured panel
     wipes up over it, carrying a white copy of the same headline. Done with
     two counter-translates (panel +100% -> 0, its content -100% -> 0) so it
     is pure transform. Cards tumble upward on the same timeline. */
  function initHero() {
    var hero = document.querySelector('.hero');
    if (!hero) return;

    // entrance  runs on load, independent of scroll
    if (hasGSAP && !reduced) {
      // NOTE: select across BOTH layers, never just .hero__light.
      // The veil is a pixel-identical copy of the light layer; if an entrance
      // tween touches only one copy they stop aligning and the wipe shows a
      // doubled, mismatched headline. (That bug shipped once — the light
      // "Browse now" was left at scale .5 while the veil's sat at 1.)
      var tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
      tl.from('.hero .ln > .seg', { y: 28, opacity: 0, duration: .8, stagger: .05 })
        .from('.hero .chip', { scale: .5, opacity: 0, rotate: -20, duration: .65,
          stagger: .055, ease: 'back.out(1.7)' }, '-=.55')
        .from('.hero .inline-cta', { scale: .62, opacity: 0, duration: .45,
          ease: 'back.out(1.8)' }, '-=.4')
        .from('.hero__sub, .hero__ctas, .hero__note', { y: 18, opacity: 0, duration: .55,
          stagger: .07 }, '-=.3')
        .set('.hero .ln > .seg, .hero .chip, .hero .inline-cta, .hero__sub, .hero__ctas, .hero__note',
             { clearProps: 'transform' });
    }

    if (!hasGSAP || reduced || window.innerWidth < 860) return;

    var veil = hero.querySelector('.hero__veil');
    if (!veil) return;

    var wipe = gsap.timeline({
      scrollTrigger: {
        trigger: hero, start: 'top top', end: '+=120%',
        scrub: 0.75, pin: true, anticipatePin: 1, invalidateOnRefresh: true
      }
    });

    // the colour window grows upward from the bottom edge; nothing inside moves
    wipe.fromTo(veil,
      { clipPath: 'inset(100% 0% 0% 0%)' },
      { clipPath: 'inset(0% 0% 0% 0%)', ease: 'none', duration: 1 }, 0);

    // cards tumble up past the frame on the same scrub
    hero.querySelectorAll('.tumble').forEach(function (c, i) {
      var rot = parseFloat(c.dataset.rot || (i % 2 ? 16 : -14));
      wipe.fromTo(c,
        { yPercent: 190, rotate: rot * -0.35, opacity: 0 },
        { yPercent: -210, rotate: rot, opacity: 1, ease: 'none', duration: 1 },
        0.05 * i);
    });
  }

  /* ---------------------------------------------------- word reveal */
  function initWordReveal() {
    var blocks = document.querySelectorAll('.reveal-text');
    if (!blocks.length) return;

    blocks.forEach(function (block) {
      if (block.dataset.split === '1') return;
      var words = block.textContent.trim().split(/\s+/);
      block.textContent = '';
      var spans = [];
      words.forEach(function (w, i) {
        var s = document.createElement('span');
        s.className = 'w';
        s.textContent = w;
        block.appendChild(s);
        spans.push(s);
        if (i < words.length - 1) block.appendChild(document.createTextNode(' '));
      });
      block.dataset.split = '1';

      if (!hasGSAP || reduced) { spans.forEach(function (s) { s.classList.add('on'); }); return; }

      // stagger opacity rather than toggling classes every tick  far cheaper
      gsap.fromTo(spans, { opacity: 0.22 }, {
        opacity: 1, ease: 'none', stagger: 0.5,
        scrollTrigger: { trigger: block, start: 'top 80%', end: 'bottom 55%', scrub: 0.6 }
      });
    });
  }

  /* ---------------------------------------------------- phone stage */
  function initPhone() {
    if (!hasGSAP || reduced || window.innerWidth < 860) return;
    var stage = document.querySelector('[data-phone-stage]');
    if (!stage) return;

    var tl = gsap.timeline({
      scrollTrigger: { trigger: stage, start: 'top 85%', end: 'top 15%', scrub: 0.7 }
    });

    tl.fromTo(stage.querySelector('.phone'),
      { scale: 0.8, yPercent: 8 }, { scale: 1, yPercent: 0, ease: 'none' }, 0);

    gsap.utils.toArray(stage.querySelectorAll('.orbit')).forEach(function (o, i) {
      tl.fromTo(o,
        { x: parseFloat(o.dataset.fromx || (i % 2 ? 80 : -80)), y: parseFloat(o.dataset.fromy || 40), opacity: 0 },
        { x: 0, y: 0, opacity: 1, ease: 'none' }, i * 0.08);
    });
  }

  /* ---------------------------------------------------- counters */
  function initCounters() {
    var nums = document.querySelectorAll('[data-count]');
    if (!nums.length || !('IntersectionObserver' in window)) return;

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
        var t0 = null;
        function step(ts) {
          if (!t0) t0 = ts;
          var p = Math.min((ts - t0) / 1400, 1);
          var v = end * (1 - Math.pow(1 - p, 3));
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
      var item = q.closest('.faq__item');
      q.setAttribute('aria-expanded', item.classList.contains('open') ? 'true' : 'false');
      q.addEventListener('click', function () {
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
      var sideBtn = document.querySelector('.mk-toggle button.on');
      var side = sideBtn ? sideBtn.getAttribute('data-side') : 'all';
      var active = Array.prototype.slice.call(document.querySelectorAll('.fchip.on'))
        .map(function (c) { return c.getAttribute('data-filter'); })
        .filter(function (v) { return v && v !== 'all'; });

      var shown = 0;
      cards.forEach(function (card) {
        var ok = (!active.length || active.indexOf(card.getAttribute('data-cat')) !== -1) &&
                 (side === 'all' || card.getAttribute('data-side') === side);
        card.style.display = ok ? '' : 'none';
        if (ok) shown++;
      });
      if (countEl) countEl.textContent = shown;
      if (empty) empty.style.display = shown ? 'none' : '';
    }

    document.querySelectorAll('.fchip').forEach(function (chip) {
      chip.addEventListener('click', function () {
        var all = document.querySelector('.fchip[data-filter="all"]');
        if (chip.getAttribute('data-filter') === 'all') {
          document.querySelectorAll('.fchip').forEach(function (c) { c.classList.remove('on'); });
          chip.classList.add('on');
        } else {
          if (all) all.classList.remove('on');
          chip.classList.toggle('on');
          if (!document.querySelectorAll('.fchip.on').length && all) all.classList.add('on');
        }
        apply();
      });
    });

    document.querySelectorAll('.mk-toggle button').forEach(function (b) {
      b.addEventListener('click', function () {
        document.querySelectorAll('.mk-toggle button').forEach(function (x) {
          x.classList.remove('on'); x.setAttribute('aria-selected', 'false');
        });
        b.classList.add('on'); b.setAttribute('aria-selected', 'true');
        apply();
      });
    });

    apply();
  }

  /* ---------------------------------------------------- anchors */
  function initAnchors() {
    document.querySelectorAll('a[href^="#"]').forEach(function (a) {
      a.addEventListener('click', function (e) {
        var id = a.getAttribute('href');
        if (!id || id === '#') return;
        var t = document.querySelector(id);
        if (!t) return;
        e.preventDefault();
        window.scrollTo({
          top: t.getBoundingClientRect().top + window.scrollY - 86,
          behavior: reduced ? 'auto' : 'smooth'
        });
      });
    });
  }

  /* ---------------------------------------------------- image fallbacks */
  function initImageFallbacks() {
    document.querySelectorAll('img[data-fallback]').forEach(function (img) {
      img.addEventListener('error', function () { img.style.display = 'none'; });
      if (img.complete && img.naturalWidth === 0) img.style.display = 'none';
    });
  }

  function boot() {
    document.documentElement.classList.add('js');
    initNav();
    initReveals();
    initHero();
    initWordReveal();
    initPhone();
    initCounters();
    initFAQ();
    initFilters();
    initAnchors();
    initImageFallbacks();
    if (hasGSAP) {
      window.addEventListener('load', function () { ScrollTrigger.refresh(); });
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();

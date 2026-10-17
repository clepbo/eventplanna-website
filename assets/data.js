/* EventPlanna — live content + theme
   ---------------------------------------------------------------------------
   Everything the old site renders from a backend, this file fetches from the
   SAME endpoints, so the backend contract is unchanged:

     GET /api/v1/public/webinars/landing          home: featured + upcoming
     GET /api/v1/public/webinars?page=&size=      events listing
     GET /api/v1/public/webinars/{slug}           event detail
     GET /api/v1/public/blog/posts?page=&size=    blog listing
     GET /api/v1/public/blog/posts/{slug}         blog detail

   assets/app.js is deliberately untouched. It is a scroll and motion engine
   with nothing to do with content, so this sits beside it rather than inside.

   CORS. The API allows an origin allowlist: eventplanna.com,
   www.eventplanna.com and http://localhost:3000. A preview deploy on any other
   host gets a 403, so every render here degrades to a readable note instead of
   an empty page. To review real data before launch, serve this folder on the
   allowlisted port:

       python -m http.server 3000

   In production at eventplanna.com it works with no backend change at all.
   --------------------------------------------------------------------------- */
(function () {
  'use strict';

  var API = 'https://api.eventplanna.com/api/v1/public';

  /* ---------------------------------------------------------------- theme */
  /* The pre-paint half runs inline in <head>; this only wires the button, so a
     slow script can never cause a flash of the wrong theme. */
  function theme() {
    var btn = document.querySelector('.theme-toggle');
    if (!btn) return;
    var root = document.documentElement;
    function label() {
      var dark = root.getAttribute('data-theme') === 'dark';
      var t = dark ? 'Switch to light mode' : 'Switch to dark mode';
      btn.setAttribute('aria-label', t);
      btn.setAttribute('title', t);
    }
    label();
    btn.addEventListener('click', function () {
      var dark = root.getAttribute('data-theme') === 'dark';
      root.setAttribute('data-theme', dark ? 'light' : 'dark');
      try { localStorage.setItem('ep-theme', dark ? 'light' : 'dark'); } catch (e) {}
      label();
    });
  }

  /* ---------------------------------------------------------------- utils */
  function get(path) {
    return fetch(API + path, { headers: { accept: 'application/json' } })
      .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
      .then(function (j) { if (!j || j.success === false) throw new Error('payload'); return j.data; });
  }

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  var MON = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  var FULL = ['January','February','March','April','May','June','July',
              'August','September','October','November','December'];
  var DAYS = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];

  function d(iso) { var x = new Date(iso); return isNaN(x) ? null : x; }
  function dateLong(iso) {
    var x = d(iso); if (!x) return '';
    return DAYS[x.getDay()] + ', ' + x.getDate() + ' ' + FULL[x.getMonth()] + ' ' + x.getFullYear();
  }
  function dateShort(iso) {
    var x = d(iso); if (!x) return '';
    return x.getDate() + ' ' + MON[x.getMonth()] + ' ' + x.getFullYear();
  }
  function timeOf(iso, label) {
    var x = d(iso); if (!x) return '';
    var h = x.getHours(), m = x.getMinutes();
    var ap = h >= 12 ? 'PM' : 'AM'; h = h % 12 || 12;
    return h + ':' + (m < 10 ? '0' + m : m) + ' ' + ap + (label ? ' ' + label : '');
  }
  function bg(url) { return url ? ' style="--img:url(' + esc(url).replace(/"/g, '%22') + ')"' : ''; }

  /* app.js builds its list of .reveal / .stagger elements once, at load, and
     never looks again. Since .reveal rests at opacity 0, anything injected
     afterwards would sit there permanently invisible, so mark it revealed. */
  function reveal(root) {
    if (!root) return;
    root.classList.add('in');
    var k = root.querySelectorAll('.reveal, .stagger');
    for (var i = 0; i < k.length; i++) k[i].classList.add('in');
  }

  function fill(sel, html) {
    var el = document.querySelector(sel);
    if (!el) return;
    el.innerHTML = html;
    reveal(el);
  }

  function note(sel, msg) {
    var el = document.querySelector(sel);
    if (el && !el.innerHTML.trim()) el.innerHTML = '<p class="live-note">' + esc(msg) + '</p>';
  }

  var OFFLINE = 'This loads from the EventPlanna API, which only answers its own domains. ' +
                'Serve this folder on http://localhost:3000 to see live data, or open it on eventplanna.com.';

  /* ------------------------------------------------------------ renderers */
  function eventCard(e) {
    var bits = [];
    if (e.scheduledStart) bits.push('<span>' + esc(dateLong(e.scheduledStart)) + '</span>');
    if (e.scheduledStart) bits.push('<span>' + esc(timeOf(e.scheduledStart, e.timezoneLabel)) + '</span>');
    if (e.durationMinutes) bits.push('<span>' + e.durationMinutes + ' minutes</span>');
    if (e.platform) bits.push('<span>Online, ' + esc(e.platform) + '</span>');
    bits.push('<span class="live">' + (e.isFree ? 'Free'
      : esc((e.currency || '') + ' ' + (e.price || ''))) + '</span>');
    var host = e.hostName
      ? '<div class="ec-host">' +
          (e.hostAvatarUrl ? '<img src="' + esc(e.hostAvatarUrl) + '" alt="">' : '') +
          '<div><b>' + esc(e.hostName) + '</b>' +
          (e.hostTitle ? '<small>' + esc(e.hostTitle) + '</small>' : '') + '</div></div>'
      : '';
    return '<article class="ecard">' +
      '<div class="ec-media"' + bg(e.coverImageUrl) + ' role="img" aria-label="' + esc(e.title) + '"></div>' +
      '<div class="ec-body">' +
        '<h3>' + esc(e.title) + '</h3>' +
        (e.subtitle ? '<p class="ec-sub">' + esc(e.subtitle) + '</p>' : '') +
        '<div class="ec-meta">' + bits.join('') + '</div>' + host +
        '<div class="hero-actions" style="margin-top:22px">' +
          '<a class="btn btn-dark" href="event.html?slug=' + encodeURIComponent(e.slug) + '">' +
          (e.registrationOpen ? 'Save your seat' : 'See the details') + ' <span class="cap">&#8599;</span></a>' +
        '</div>' +
      '</div></article>';
  }

  function postMeta(p) {
    return [p.authorName, dateShort(p.publishedAt),
            p.readTimeMinutes ? p.readTimeMinutes + ' min read' : null]
           .filter(Boolean).join(' &middot; ');
  }

  function postCard(p) {
    return '<a class="bcard" href="post.html?slug=' + encodeURIComponent(p.slug) + '">' +
      '<div class="bc-img"' + bg(p.coverImageUrl) + '></div>' +
      '<div class="bc-body">' +
        '<h3>' + esc(p.title) + '</h3>' +
        (p.subtitle ? '<p>' + esc(p.subtitle) + '</p>' : '') +
        '<div class="bc-meta">' + postMeta(p) + '</div>' +
      '</div></a>';
  }

  /* --------------------------------------------------------------- pages */
  function home() {
    if (!document.querySelector('[data-slot="featured-event"]')) return;
    get('/webinars/landing').then(function (data) {
      var e = data && data.featured;
      if (e) fill('[data-slot="featured-event"]', eventCard(e));
      else note('[data-slot="featured-event"]', 'No event scheduled right now. Check back soon.');
    }).catch(function () { note('[data-slot="featured-event"]', OFFLINE); });

    get('/blog/posts?page=0&size=3').then(function (data) {
      var list = (data && data.content) || [];
      if (list.length) fill('[data-slot="latest-posts"]', list.map(postCard).join(''));
      else note('[data-slot="latest-posts"]', 'No posts published yet.');
    }).catch(function () { note('[data-slot="latest-posts"]', OFFLINE); });
  }

  function blogList() {
    if (!document.querySelector('[data-slot="post-list"]')) return;
    get('/blog/posts?page=0&size=24').then(function (data) {
      var list = (data && data.content) || [];
      if (!list.length) { note('[data-slot="post-list"]', 'No articles yet. New stories are on the way.'); return; }
      var feat = list.filter(function (p) { return p.featured; })[0] || list[0];
      var rest = list.filter(function (p) { return p.slug !== feat.slug; });
      fill('[data-slot="post-featured"]',
        '<a class="bcard bcard-wide" href="post.html?slug=' + encodeURIComponent(feat.slug) + '">' +
        '<div class="bc-img"' + bg(feat.coverImageUrl) + '></div>' +
        '<div class="bc-body"><span class="eyebrow">Featured</span><h3>' + esc(feat.title) + '</h3>' +
        (feat.subtitle ? '<p>' + esc(feat.subtitle) + '</p>' : '') +
        '<div class="bc-meta">' + postMeta(feat) + '</div></div></a>');
      fill('[data-slot="post-list"]', rest.length ? rest.map(postCard).join('')
        : '<p class="live-note">That is everything for now. New stories are on the way.</p>');
    }).catch(function () { note('[data-slot="post-list"]', OFFLINE); });
  }

  function postDetail() {
    var host = document.querySelector('[data-slot="post"]');
    if (!host) return;
    var slug = new URLSearchParams(location.search).get('slug');
    if (!slug) { location.replace('blog.html'); return; }
    get('/blog/posts/' + encodeURIComponent(slug)).then(function (p) {
      document.title = (p.seoTitle || p.title) + ' | EventPlanna';
      var m = document.querySelector('meta[name="description"]');
      if (m && (p.seoDescription || p.subtitle)) m.setAttribute('content', p.seoDescription || p.subtitle);
      host.innerHTML =
        '<div class="shead" style="text-align:left"><span class="eyebrow">Blog</span>' +
        '<h1 style="font-size:clamp(30px,4.4vw,56px);margin-top:16px;max-width:20ch">' + esc(p.title) + '</h1>' +
        (p.subtitle ? '<p class="lead" style="margin-top:18px">' + esc(p.subtitle) + '</p>' : '') +
        '<p class="muted" style="margin-top:14px;font-size:14px">' +
          [p.authorName, dateLong(p.publishedAt),
           p.readTimeMinutes ? p.readTimeMinutes + ' min read' : null].filter(Boolean).join(' &middot; ') +
        '</p></div>' +
        (p.coverImageUrl ? '<div class="bc-img"' + bg(p.coverImageUrl) +
          ' data-wide></div>' : '') +
        '<div class="article">' + (p.contentHtml || '') + '</div>';
      reveal(host);
    }).catch(function () { host.innerHTML = '<p class="live-note">' + esc(OFFLINE) + '</p>'; });
  }

  function eventList() {
    if (!document.querySelector('[data-slot="event-list"]')) return;
    get('/webinars?page=0&size=24').then(function (data) {
      var list = (data && data.content) || [];
      if (!list.length) { note('[data-slot="event-list"]', 'Nothing scheduled right now. Check back soon.'); return; }
      var up = list.filter(function (e) { return !e.past; });
      var past = list.filter(function (e) { return e.past; });
      fill('[data-slot="event-list"]', up.length ? up.map(eventCard).join('')
        : '<p class="live-note">Nothing scheduled right now. Check back soon.</p>');
      if (past.length) fill('[data-slot="event-past"]',
        '<h2 class="big" style="text-align:left;font-size:clamp(24px,3vw,38px);margin:0 0 8px">Past events</h2>' +
        past.map(eventCard).join(''));
    }).catch(function () { note('[data-slot="event-list"]', OFFLINE); });
  }

  function eventDetail() {
    var host = document.querySelector('[data-slot="event"]');
    if (!host) return;
    var slug = new URLSearchParams(location.search).get('slug');
    if (!slug) { location.replace('events.html'); return; }
    get('/webinars/' + encodeURIComponent(slug)).then(function (e) {
      document.title = (e.metaTitle || e.title) + ' | EventPlanna';
      var m = document.querySelector('meta[name="description"]');
      if (m && (e.metaDescription || e.subtitle)) m.setAttribute('content', e.metaDescription || e.subtitle);

      var speakers = (e.speakers || []).map(function (s) {
        return '<div class="ec-host">' +
          (s.avatarUrl ? '<img src="' + esc(s.avatarUrl) + '" alt="">' : '') +
          '<div><b>' + esc(s.name) + '</b><small>' +
          esc([s.title, s.company].filter(Boolean).join(', ')) + '</small></div></div>' +
          (s.bio ? '<p class="muted" style="font-size:14px;margin-top:10px">' + esc(s.bio) + '</p>' : '');
      }).join('');
      var learn = (e.learningPoints || []).map(function (l) {
        return '<li>' + '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#5047e1" ' +
          'stroke-width="3"><path d="M20 6 9 17l-5-5"/></svg> ' + esc(l) + '</li>';
      }).join('');
      var who = (e.audiences || []).map(function (a) { return '<span>' + esc(a) + '</span>'; }).join('');
      var cal = [];
      if (e.googleCalendarUrl) cal.push('<a class="btn btn-light" href="' + esc(e.googleCalendarUrl) +
        '" target="_blank" rel="noopener">Add to Google Calendar <span class="cap">&#8599;</span></a>');
      if (e.icsUrl) cal.push('<a class="btn btn-light" href="' + esc(e.icsUrl) +
        '">Download .ics <span class="cap">&#8599;</span></a>');

      host.innerHTML =
        '<p class="muted" style="font-size:14px"><a href="events.html" style="color:var(--green)">&larr; All events</a></p>' +
        '<div class="ec-meta"><span class="live">' +
          esc(e.status === 'SCHEDULED' ? 'Scheduled' : e.status) + '</span>' +
          (e.platform ? '<span>Online, ' + esc(e.platform) + '</span>' : '') + who + '</div>' +
        '<h1 style="font-size:clamp(30px,4.6vw,58px);margin-top:20px;max-width:20ch">' + esc(e.title) + '</h1>' +
        (e.subtitle ? '<p class="lead" style="margin-top:18px">' + esc(e.subtitle) + '</p>' : '') +
        '<div class="ec-meta">' +
          '<span>' + esc(dateLong(e.scheduledStart)) + '</span>' +
          '<span>' + esc(timeOf(e.scheduledStart, e.timezoneLabel)) + '</span>' +
          (e.durationMinutes ? '<span>' + e.durationMinutes + ' minutes</span>' : '') +
          '<span class="live">' + (e.isFree ? 'Free'
            : esc((e.currency || '') + ' ' + (e.price || ''))) + '</span>' +
        '</div>' +
        (e.coverImageUrl ? '<div class="bc-img"' + bg(e.coverImageUrl) + ' data-wide></div>' : '') +
        '<div class="duo"><div>' +
          (e.description ? '<h2 style="font-size:clamp(22px,2.6vw,32px)">About this event</h2>' +
            '<p class="muted" style="margin-top:14px;white-space:pre-line">' + esc(e.description) + '</p>' : '') +
          (learn ? '<h2 style="font-size:clamp(22px,2.6vw,32px);margin-top:36px">What you will take away</h2>' +
            '<ul class="ticks">' + learn + '</ul>' : '') +
        '</div><div>' +
          (speakers ? '<div class="ui-card"><div class="ui-title">Speaking</div>' + speakers + '</div>' : '') +
          '<div class="ui-card" style="margin-top:16px"><div class="ui-title">' +
            (e.registrationOpen ? 'Save your seat' : 'Registration closed') + '</div>' +
            '<p class="ui-sub" style="margin-top:8px">' +
              (e.registeredCount ? esc(e.registeredCount) + ' people registered so far. ' : '') +
              (e.registrationOpen ? 'Registration is handled on eventplanna.com.' : '') + '</p>' +
            '<div class="hero-actions" style="margin-top:16px">' +
              (e.registrationOpen ? '<a class="btn btn-dark" href="https://eventplanna.com/webinars/' +
                encodeURIComponent(e.slug) + '" target="_blank" rel="noopener">Register <span class="cap">&#8599;</span></a>' : '') +
              cal.join('') + '</div></div>' +
        '</div></div>';
      reveal(host);
    }).catch(function () { host.innerHTML = '<p class="live-note">' + esc(OFFLINE) + '</p>'; });
  }

  function start() {
    theme(); home(); blogList(); postDetail(); eventList(); eventDetail();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();

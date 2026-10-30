/* EventPlanna — the workspace playground
   ---------------------------------------------------------------------------
   One sample event, already in flight, that a visitor can actually use before
   they have an account. Tick a task and the progress and the overview move.
   Record a payment and the budget reconciles and the 85% alert fires. Push a
   booking on and the timeline stamps. Change role and the money disappears
   for the people who are not supposed to see it.

   Everything is held in the STATE object below and nothing is persisted: a
   reload puts it back, which is the point. No fetch, no storage, no account.

   The numbers are the ones the rest of the site already shows for this same
   sample event (a traditional wedding in Ikeja, 400 guests, N1,600,000
   allocated with N752,000 left), so a planner who met it on the marketplace
   page meets the same event here.

   The shell, the nav order and the wording come from the real app in the
   sandbox rather than from imagination: Dashboard, Events, Tasks, Bookings,
   Vendors, Team, Leads and Reviews down the left, the credit balance under
   them, search and the account chip across the top. Where the sandbox names
   a thing (Task Management, Vendor Marketplace, Potential clients, and the
   lead statuses New through Archived) that name is used here, so somebody
   who signs up after playing with this meets the same words.

   This is deliberately not in assets/app.js. That file is the scroll and
   motion engine and has nothing to do with any of this; it is only loaded on
   playground.html.
   --------------------------------------------------------------------------- */
(function () {
  'use strict';

  /* ---------------------------------------------------------------- back ---
     The page is reached from the home page and from two places on the
     marketplace, so there is no one previous page to hard-code. Take a real
     history step when the visitor came from somewhere on this site, and fall
     back to the href otherwise: opened cold from a pasted link or a new tab,
     history.back() would either do nothing or throw them out of the site. */
  var back = document.querySelector('.plp-back[data-back]');
  if (back) back.addEventListener('click', function (e) {
    var from = document.referrer;
    var same = from && from.indexOf(location.origin + '/') === 0
      && from.replace(/#.*$/, '') !== location.href.replace(/#.*$/, '');
    if (same && history.length > 1) { e.preventDefault(); history.back(); }
  });

  var root = document.querySelector('[data-pg]');
  if (!root) return;

  var N = '₦';

  /* Everything is dated off the day the page is opened, so the sample event
     is always a sensible distance away and the dashboard always has
     something due today and something late. */
  function iso(dt) {
    return dt.getFullYear() + '-' + String(dt.getMonth() + 1).padStart(2, '0')
      + '-' + String(dt.getDate()).padStart(2, '0');
  }
  function d(days) {
    var x = new Date(); x.setHours(0, 0, 0, 0); x.setDate(x.getDate() + days);
    return iso(x);
  }
  var TODAY = d(0);
  var EVENT = d(43);
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return [].slice.call((r || document).querySelectorAll(s)); };

  /* ------------------------------------------------------------- the event */
  function fresh() {
    return {
      role: 'manager',
      tab: 'dashboard',
      nudge: false,
      cal: null,
      client: false,
      alerted: {},
      event: {
        name: 'Traditional wedding, Ikeja',
        date: EVENT,
        guests: 400,
        client: 'The Adeyemi family'
      },
      /* Allocations total N1,600,000 and spend totals N848,000, which is the
         N752,000 left that the marketplace page quotes for this event. */
      budget: [
        { k: 'venue', name: 'Venue', alloc: 500000, spent: 500000 },
        { k: 'catering', name: 'Catering', alloc: 448000, spent: 179200 },
        { k: 'photo', name: 'Photography', alloc: 224000, spent: 112000 },
        { k: 'decor', name: 'Decor', alloc: 256000, spent: 0 },
        { k: 'other', name: 'Printing and other', alloc: 172000, spent: 56800 }
      ],
      /* Dates are real so the dashboard can count what is due today, what is
         late and what is live, instead of asserting it. They are set
         relative to the day the page is opened, which is what stops a demo
         going stale: `d(-6)` is six days ago. `doing` is the third state the
         app's task list carries, and ticking a task clears it. */
      phases: [
        { name: 'Booked and briefed', tasks: [
          { t: 'Signed contract filed', who: 'Adaeze', due: d(-46), done: true },
          { t: 'Deposit received and receipted', who: 'Adaeze', due: d(-44), done: true },
          { t: 'Budget split by category', who: 'Adaeze', due: d(-40), done: true },
          { t: 'Client kickoff call', who: 'Adaeze', due: d(-36), done: true }
        ] },
        { name: 'Suppliers', tasks: [
          { t: 'Venue confirmed and paid', who: 'Adaeze', due: d(-28), done: true },
          { t: 'Caterer booked, menu agreed', who: 'Tunde', due: d(-20), done: true },
          { t: 'Photographer booked', who: 'Tunde', due: d(-16), done: true },
          { t: 'Live band confirmed', who: 'Tunde', due: d(-6), done: false },
          { t: 'Decor quotes compared', who: 'Ify', due: d(0), done: false, doing: true }
        ] },
        { name: 'The weeks before', tasks: [
          { t: 'Final guest count to caterer', who: 'Ify', due: d(4), done: false, doing: true },
          { t: 'Seating plan approved by client', who: 'Adaeze', due: d(9), done: false },
          { t: 'Run sheet out to every supplier', who: 'Tunde', due: d(18), done: false },
          { t: 'Balances due and chased', who: 'Adaeze', due: d(21), done: false },
          { t: 'Venue walkthrough', who: 'Tunde', due: d(26), done: false }
        ] },
        { name: 'On the day', tasks: [
          { t: 'Supplier arrivals checked in', who: 'Tunde', due: EVENT, done: false },
          { t: 'Room set and photographed', who: 'Ify', due: EVENT, done: false },
          { t: 'Guest movement to reception', who: 'Tunde', due: EVENT, done: false },
          { t: 'Final payments released', who: 'Adaeze', due: EVENT, done: false }
        ] }
      ],
      /* The six states the rest of the site names: Pending, Accepted and
         Confirmed on the way through, Completed at the end, with Declined and
         Cancelled as the two ways off it. */
      bookings: [
        { k: 'venue', name: 'Ikeja event centre', what: 'Venue', value: 500000,
          state: 'Completed', log: [['Pending', '28 Aug'], ['Accepted', '30 Aug'],
            ['Confirmed', '2 Sep'], ['Completed', '2 Oct']] },
        { k: 'catering', name: 'Ayo & Sons catering', what: 'Catering', value: 448000,
          state: 'Confirmed', log: [['Pending', '18 Sep'], ['Accepted', '24 Sep'],
            ['Confirmed', '10 Oct']] },
        { k: 'photo', name: 'Studio Lekki', what: 'Photography', value: 224000,
          state: 'Accepted', log: [['Pending', '2 Oct'], ['Accepted', '14 Oct']] },
        { k: 'decor', name: 'Bloom & Drape', what: 'Decor', value: 256000,
          state: 'Pending', log: [['Pending', '21 Oct']] },
        { k: 'band', name: 'The Lagos Collective', what: 'Live band', value: 160000,
          state: 'Pending', log: [['Pending', '24 Oct']] }
      ],
      team: [
        { who: 'Adaeze', role: 'Manager', on: 'Every event she owns' },
        { who: 'Tunde', role: 'Coordinator', on: 'This event' },
        { who: 'Ify', role: 'Assistant', on: 'This event' }
      ],
      /* Priced off the credit matrix in the Figma file (node 2778-24553):
         creating this event 50, its budget 25, a 400-name guest list 165,
         the RSVP form 40, four first contacts with vendors 60, two
         coordinators 60, the client portal 50 and budget tracking 20. That
         is 470 against a 1,200-credit Standard pack. */
      credits: 730,
      /* The consultation form on a planner's public profile lands here. The
         statuses are the sandbox's own: New, Reviewed, Contacted, Converted,
         Archived. */
      leads: [
        { who: 'Chinwe Okafor', what: 'Traditional wedding', when: '12 Dec 2026',
          guests: 400, budget: 9500000, at: 'Converted', via: 'Consultation page' },
        { who: 'Bola Ajayi', what: 'Corporate dinner', when: '4 Feb 2027',
          guests: 180, budget: 4200000, at: 'Contacted', via: 'Consultation page' },
        { who: 'Ngozi Ude', what: 'Anniversary dinner', when: '21 Mar 2027',
          guests: 60, budget: 1800000, at: 'Reviewed', via: 'Directory profile' },
        { who: 'Emeka Bassey', what: 'Product launch', when: '9 Apr 2027',
          guests: 250, budget: 6000000, at: 'New', via: 'Consultation page' }
      ],
      /* The categories are the sandbox marketplace's own. The businesses are
         not: putting real suppliers' names and prices on a marketing page is
         not something to do without asking them first. */
      vendors: [
        { name: 'Harbourline Catering', cat: 'Catering', area: 'Lekki, Lagos', from: 650000, saved: false, used: true },
        { name: 'Studio Ember', cat: 'Photography', area: 'Ikoyi, Lagos', from: 300000, saved: true, used: true },
        { name: 'Drape & Bloom', cat: 'Decoration', area: 'Ikeja, Lagos', from: 480000, saved: false, used: false },
        { name: 'The Lagos Collective', cat: 'Live Band', area: 'Yaba, Lagos', from: 160000, saved: false, used: false },
        { name: 'Gilded Hall', cat: 'Venue', area: 'Ikeja, Lagos', from: 500000, saved: true, used: true },
        { name: 'Ada Makeup Studio', cat: 'Makeup & Hair', area: 'Lekki, Lagos', from: 120000, saved: false, used: false }
      ],
      feed: []
    };
  }

  var S = fresh();

  /* ---------------------------------------------------------------- helpers */
  /* Order and labels straight off the sandbox sidebar. `needs` names the
     permission a role has to hold for the item to appear at all. */
  var NAV = [
    { k: 'dashboard', t: 'Dashboard' },
    { k: 'events', t: 'Events' },
    { k: 'tasks', t: 'Tasks' },
    { k: 'bookings', t: 'Bookings' },
    { k: 'vendors', t: 'Vendors' },
    { k: 'team', t: 'Team', needs: 'team' },
    { k: 'leads', t: 'Leads', needs: 'money' },
    { k: 'reviews', t: 'Reviews', needs: 'team' },
    { k: 'portal', t: 'Client portal', needs: 'portal' }
  ];
  var LEAD_FLOW = ['New', 'Reviewed', 'Contacted', 'Converted'];
  var VCATS = ['All Categories', 'Photography', 'Catering', 'Venue', 'DJ/Entertainment',
    'Decoration', 'Makeup & Hair', 'Videography', 'Live Band'];

  function money(n) { return N + Number(n).toLocaleString('en-NG'); }
  function esc(s) {
    return String(s).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }
  function sum(list, f) { return list.reduce(function (a, b) { return a + f(b); }, 0); }
  function alloc() { return sum(S.budget, function (b) { return b.alloc; }); }
  function spent() { return sum(S.budget, function (b) { return b.spent; }); }
  function tasks() { return S.phases.reduce(function (a, p) { return a.concat(p.tasks); }, []); }
  function doneCount() { return tasks().filter(function (t) { return t.done; }).length; }
  function pct(a, b) { return b ? Math.round((a / b) * 100) : 0; }

  function daysToGo() {
    var d = new Date(S.event.date + 'T00:00:00');
    var now = new Date(); now.setHours(0, 0, 0, 0);
    return Math.max(0, Math.round((d - now) / 86400000));
  }
  function whenLabel() {
    return new Date(S.event.date + 'T00:00:00')
      .toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
  }

  /* What each role is allowed to see, straight off the site's own wording:
     a coordinator runs delivery without budget figures or supplier pricing,
     an assistant works the task list and sees nothing about money. */
  var CAN = {
    manager: { money: true, edit: true, team: true, portal: true },
    coordinator: { money: false, edit: false, team: true, portal: true },
    assistant: { money: false, edit: false, team: false, portal: false }
  };
  function can() { return CAN[S.role]; }

  function note(text) {
    S.feed.unshift({ t: text, at: new Date() });
    S.feed = S.feed.slice(0, 6);
  }

  var TICK = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"'
    + ' stroke-width="3"><path d="M20 6 9 17l-5-5"/></svg>';
  var WARN = '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor"'
    + ' stroke-width="2"><path d="M12 9v4.5M12 17h.01"/>'
    + '<path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/></svg>';
  var LOCK = '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor"'
    + ' stroke-width="2"><rect x="4" y="10.5" width="16" height="10" rx="2.2"/>'
    + '<path d="M8 10.5V7.8a4 4 0 0 1 8 0v2.7"/></svg>';

  /* ------------------------------------------------------------------ views */

  function bar(p, colour) {
    return '<span class="pg-track"><i style="width:' + Math.min(100, p) + '%'
      + (colour ? ';background:' + colour : '') + '"></i></span>';
  }

  /* ---- Dashboard -------------------------------------------------------
     Laid out like the real one: the date, the consultation nudge, then a row
     of three (today's tasks, the next event, create-new plus a calendar),
     then two rows of three counters. Every number is counted off the state,
     so ticking a task on the Tasks view moves six of them at once. */
  function overview() {
    var open = tasks().filter(function (t) { return !t.done; });
    var dueToday = open.filter(function (t) { return t.due === TODAY; });
    var overdue = open.filter(function (t) { return t.due < TODAY; });
    var doing = open.filter(function (t) { return t.doing; });
    var done = doneCount(), all = tasks().length;
    var now = new Date();
    var soon = open.slice().sort(function (a, b) { return a.due < b.due ? -1 : 1; }).slice(0, 4);

    var tiles = [
      ['Tasks due today', dueToday.length, 'due'],
      ['Tasks in progress', doing.length, 'doing'],
      ['Tasks overdue', overdue.length, overdue.length ? 'late' : ''],
      ['Events created', 1, ''],
      ['Tasks completed', done, ''],
      ['Pending tasks', all - done, '']
    ];

    return '<div class="pg-date"><div><h2>' + now.toLocaleDateString('en-GB',
        { month: 'long' }) + ', ' + now.getDate() + '</h2>'
      + '<small>' + now.toLocaleDateString('en-GB', { weekday: 'long' }) + '</small></div>'
      + '<span class="pg-badge">' + S.role.charAt(0).toUpperCase() + S.role.slice(1)
      + ' view</span></div>'

      + (S.nudge ? '' : '<div class="pg-nudge"><span class="pg-nudge-i">' + SPARK + '</span>'
        + '<div><b>Set up your consultation page</b>'
        + '<span>Turn your bio link into a polished consultation flow. Add your terms, choose what to ask prospects, and start capturing leads.</span></div>'
        + '<a class="btn btn-green btn-sm" href="planner.html?p=adaeze-mbakwe#consult" target="_blank" rel="noopener">Configure consultation <span class="cap">&#8599;</span></a>'
        + '<button class="pg-nudge-x" type="button" data-nudge aria-label="Dismiss">&times;</button></div>')

      + '<div class="pg-three">'

      + '<div class="pg-col"><div class="pg-col-h"><h3>Your tasks today</h3>'
      + '<p>' + (dueToday.length || overdue.length
          ? 'Keep up the good work.' : 'Nothing due today.') + '</p></div>'
      + (soon.length
        ? '<div class="pg-todo">' + soon.map(function (t) {
            var late = t.due < TODAY, today = t.due === TODAY;
            return '<label class="pg-todo-row' + (late ? ' late' : today ? ' today' : '') + '">'
              + '<input type="checkbox" data-task="' + taskIx(t) + '">'
              + '<span class="pg-box">' + TICK + '</span>'
              + '<span class="pg-todo-t">' + esc(t.t) + '<small>' + esc(t.who) + '</small></span>'
              + '<span class="pg-when">' + (late ? 'Overdue' : today ? 'Today' : dayLabel(t.due))
              + '</span></label>';
          }).join('') + '</div>'
        : '<div class="pg-empty"><b>Nothing to work on yet</b><span>Every task on this event is done.</span></div>')
      + '</div>'

      + '<div class="pg-col"><div class="pg-col-h"><h3>Upcoming event '
      + '<i class="pg-count">1</i></h3><p>The next one in the diary.</p></div>'
      + '<div class="pg-next"><div class="pg-next-top"><b>' + esc(S.event.name) + '</b>'
      + '<span class="pg-state s-confirmed">In progress</span></div>'
      + '<small>' + whenLabel() + ' &middot; ' + S.event.guests + ' guests</small>'
      + '<div class="pg-next-n"><b>' + daysToGo() + '</b><span>days to go</span></div>'
      + '<div class="pg-row"><span class="nm">Plan</span>' + bar(pct(done, all))
      + '<span class="val">' + pct(done, all) + '%</span></div>'
      + (can().money ? '<div class="pg-row"><span class="nm">Budget</span>'
          + bar(pct(spent(), alloc())) + '<span class="val">'
          + money(alloc() - spent()) + ' left</span></div>' : '')
      + '<button class="pg-mini" type="button" data-pg-tab="events">Open the event</button>'
      + '</div></div>'

      + '<div class="pg-col">'
      + '<button class="pg-create" type="button" data-pg-tab="events">Create new event <i>+</i></button>'
      + calendar() + '</div>'

      + '</div>'

      + '<div class="pg-tiles">' + tiles.map(function (t) {
          return '<div class="pg-tile' + (t[2] ? ' ' + t[2] : '') + '"><em>' + t[0]
            + '</em><b>' + t[1] + '</b></div>';
        }).join('') + '</div>'

      + (can().money && S.feed.length
        ? '<div class="pg-panel" style="margin-top:14px"><h3>Latest</h3><ul class="pg-feed">'
          + S.feed.map(function (f) {
              return '<li><i></i><div>' + esc(f.t) + '<small>'
                + f.at.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
                + '</small></div></li>'; }).join('') + '</ul></div>'
        : '');
  }

  /* The checkbox on the dashboard has to drive the same task object the
     Tasks view does, so it carries the same phase:index address. */
  function taskIx(task) {
    for (var p = 0; p < S.phases.length; p++) {
      var k = S.phases[p].tasks.indexOf(task);
      if (k >= 0) return p + ':' + k;
    }
    return '';
  }
  function dayLabel(isoDate) {
    return new Date(isoDate + 'T00:00:00')
      .toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
  }

  /* A real month, navigable, with today ringed and the event day marked. */
  function calendar() {
    var cur = S.cal ? new Date(S.cal + 'T00:00:00') : new Date();
    var y = cur.getFullYear(), m = cur.getMonth();
    var first = new Date(y, m, 1), lead = first.getDay();
    var len = new Date(y, m + 1, 0).getDate();
    var cells = '';
    for (var i = 0; i < lead; i++) cells += '<span></span>';
    for (var day = 1; day <= len; day++) {
      var key = iso(new Date(y, m, day));
      var cls = key === TODAY ? ' now' : key === S.event.date ? ' event' : '';
      cells += '<span class="pg-day' + cls + '">' + day + '</span>';
    }
    return '<div class="pg-cal"><div class="pg-cal-top">'
      + '<button class="pg-cal-nav" type="button" data-cal="-1" aria-label="Previous month">&#8249;</button>'
      + '<b>' + first.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' }) + '</b>'
      + '<button class="pg-cal-nav" type="button" data-cal="1" aria-label="Next month">&#8250;</button>'
      + '</div><div class="pg-cal-grid">'
      + ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'].map(function (w) {
          return '<em>' + w + '</em>'; }).join('')
      + cells + '</div>'
      + (S.event.date.slice(0, 7) === iso(first).slice(0, 7)
        ? '<p class="pg-cal-note"><i></i> ' + esc(S.event.name) + '</p>' : '')
      + '</div>';
  }

  var SPARK = '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor"'
    + ' stroke-width="1.9" stroke-linejoin="round"><path d="m12 3 1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9z"/>'
    + '<path d="M18.5 15.5 19 17l1.5.5L19 18l-.5 1.5L18 18l-1.5-.5L18 17z"/></svg>';

  function budget() {
    if (!can().money) return locked('the budget');
    var a = alloc(), sp = spent();
    return '<div class="pg-sum"><div><em>Allocated</em><b>' + money(a) + '</b></div>'
      + '<div><em>Spent</em><b>' + money(sp) + '</b></div>'
      + '<div><em>Remaining</em><b class="good">' + money(a - sp) + '</b></div></div>'
      + '<table class="pg-table"><thead><tr><th>Category</th><th>Allocated</th><th>Spent</th>'
      + '<th>Remaining</th><th>Used</th><th></th></tr></thead><tbody>'
      + S.budget.map(function (b, i) {
          var p = pct(b.spent, b.alloc);
          var cls = p >= 100 ? 'bad' : p >= 85 ? 'warn' : '';
          return '<tr><td><b>' + esc(b.name) + '</b></td><td>' + money(b.alloc) + '</td>'
            + '<td>' + money(b.spent) + '</td><td>' + money(b.alloc - b.spent) + '</td>'
            + '<td class="pg-used ' + cls + '">' + bar(p, p >= 100 ? 'var(--red)'
              : p >= 85 ? 'var(--amber)' : '') + '<span>' + p + '%</span></td>'
            + '<td class="pg-act">'
            + (can().edit
              ? '<button class="pg-mini" type="button" data-pay="' + i + '">Record payment</button>'
              : '') + '</td></tr>'
            + '<tr class="pg-payrow" data-payrow="' + i + '" hidden><td colspan="6">'
            + '<form class="pg-payform" data-payform="' + i + '">'
            + '<label>Payment against ' + esc(b.name)
            + '<span class="pg-money"><span>' + N + '</span>'
            + '<input class="fld" type="number" min="1000" step="1000" placeholder="50,000" required></span></label>'
            + '<button class="btn btn-green btn-sm" type="submit">Record it</button>'
            + '<button class="pg-mini" type="button" data-paycancel>Cancel</button>'
            + '</form></td></tr>';
        }).join('') + '</tbody></table>'
      + '<p class="pg-hint">Every payment lands against a category, so allocated, spent and remaining always agree. Push one past 85% and the overview says so before it is a problem.</p>';
  }

  var FLOW = ['Pending', 'Accepted', 'Confirmed', 'Completed'];
  var NEXT = { Pending: 'Accept the quote', Accepted: 'Deposit cleared',
               Confirmed: 'Mark delivered' };

  function bookings() {
    return '<div class="pg-books">' + S.bookings.map(function (b, i) {
      var at = FLOW.indexOf(b.state);
      var dead = at < 0;
      return '<div class="pg-book' + (dead ? ' dead' : '') + '">'
        + '<div class="pg-book-top"><div><b>' + esc(b.name) + '</b><small>' + esc(b.what)
        + (can().money ? ' &middot; ' + money(b.value) : '') + '</small></div>'
        + '<span class="pg-state s-' + b.state.toLowerCase() + '">' + b.state + '</span></div>'
        + '<div class="pg-rail">' + FLOW.map(function (st, n) {
            return '<span class="' + (dead ? 'off' : n < at ? 'done' : n === at ? 'now' : '')
              + '">' + st + '</span>'; }).join('')
        + (dead ? '<span class="off on">' + b.state + '</span>' : '') + '</div>'
        + '<div class="pg-log">' + b.log.map(function (l) {
            return '<span><b>' + l[0] + '</b> ' + l[1] + '</span>'; }).join('') + '</div>'
        + (can().edit && at >= 0 && at < 3
          ? '<div class="pg-book-act">'
            + '<button class="btn btn-dark btn-sm" type="button" data-adv="' + i + '">'
            + NEXT[b.state] + ' <span class="cap">&#8599;</span></button>'
            + (at === 0 ? '<button class="pg-mini" type="button" data-dec="' + i + '">Decline</button>' : '')
            + '</div>'
          : can().edit ? '' : '<p class="pg-hint small">' + LOCK
            + ' A coordinator can see where a booking is. Only a manager moves it on.</p>')
        + '</div>';
    }).join('') + '</div>'
      + '<p class="pg-hint">Six states, each one stamped when it happens. A quote becomes <b>Accepted</b> when you agree the price and <b>Confirmed</b> when the deposit clears, so what was agreed and when is never a question.</p>';
  }

  function team() {
    if (!can().team) return locked('the team');
    var rules = {
      Manager: ['Budget, costs and allocations', 'Accept quotes and move bookings on',
                'Add and remove people', 'Share the client portal'],
      Coordinator: ['Tasks, timeline and supplier contact', 'Booking states, without the money',
                    'The events they are assigned to'],
      Assistant: ['The task list on this event', 'Complete, comment and upload']
    };
    var never = { Manager: [], Coordinator: ['Budget figures', 'Supplier pricing', 'Other events'],
                  Assistant: ['Anything about money', 'Other events', 'Other clients'] };
    return '<div class="pg-team">' + S.team.map(function (m) {
      var on = m.role.toLowerCase() === S.role;
      return '<div class="pg-member' + (on ? ' on' : '') + '">'
        + '<div class="pg-member-top"><span class="pg-ini">' + m.who[0] + '</span>'
        + '<div><b>' + esc(m.who) + '</b><small>' + esc(m.role) + ' &middot; ' + esc(m.on)
        + '</small></div>' + (on ? '<span class="pg-you">You</span>' : '') + '</div>'
        + '<ul class="pg-can">' + rules[m.role].map(function (r) {
            return '<li>' + TICK + ' ' + r + '</li>'; }).join('')
          + never[m.role].map(function (r) {
            return '<li class="no">' + LOCK + ' ' + r + '</li>'; }).join('')
        + '</ul></div>';
    }).join('') + '</div>'
      + '<p class="pg-hint">Change the role at the top of the page and the rest of this workspace changes with it. A coordinator chasing a florist does not need your margins.</p>';
  }

  function portal() {
    if (!can().portal) return locked('the client portal');
    var a = alloc(), sp = spent(), done = doneCount(), all = tasks().length;
    var waiting = S.bookings.filter(function (b) { return b.state === 'Pending'; });
    return '<div class="pg-portal-switch">'
      + '<button class="pg-seg' + (S.client ? '' : ' on') + '" type="button" data-client="0">Your view</button>'
      + '<button class="pg-seg' + (S.client ? ' on' : '') + '" type="button" data-client="1">What the client sees</button>'
      + '</div>'
      + (S.client
        ? '<div class="pg-portal client">'
          + '<div class="pg-portal-head"><b>' + esc(S.event.name) + '</b><small>'
          + whenLabel() + ' &middot; ' + S.event.guests + ' guests &middot; shared with '
          + esc(S.event.client) + '</small></div>'
          + '<div class="pg-kpis three">'
          + '<div class="pg-kpi"><em>Planning progress</em><b>' + pct(done, all)
          + '%</b><small>' + done + ' of ' + all + ' steps done</small></div>'
          + '<div class="pg-kpi"><em>Your budget</em><b>' + money(a)
          + '</b><small>' + money(a - sp) + ' still to spend</small></div>'
          + '<div class="pg-kpi"><em>Days to go</em><b>' + daysToGo()
          + '</b><small>' + whenLabel() + '</small></div></div>'
          + (waiting.length
            ? '<div class="pg-panel"><h3>Waiting on you</h3>' + waiting.map(function (b) {
                return '<div class="pg-row"><span class="nm">' + esc(b.what)
                  + '</span><span class="pg-hint small">Quote sent, awaiting your yes</span></div>';
              }).join('') + '</div>'
            : '<div class="pg-panel"><h3>Waiting on you</h3><p class="pg-hint">Nothing right now.</p></div>')
          + '<div class="pg-never"><h4>' + LOCK + ' Not in the portal</h4>'
          + '<p>Supplier rates, your margin, internal notes, your other clients and your team&rsquo;s task chatter. There is no permission that opens them.</p></div>'
          + '</div>'
        : '<div class="pg-portal">'
          + '<div class="pg-panel"><h3>What you choose to share</h3>'
          + '<div class="pg-row"><span class="nm">Progress</span>' + bar(pct(done, all))
          + '<span class="val">' + pct(done, all) + '%</span></div>'
          + '<div class="pg-row"><span class="nm">Budget</span>' + bar(pct(sp, a))
          + '<span class="val">' + pct(sp, a) + '%</span></div>'
          + '<p class="pg-hint">The client sees the headline figure you set and what is left, not what each supplier charged you.</p></div>'
          + '<div class="pg-panel"><h3>Decisions waiting on them</h3>'
          + (waiting.length ? waiting.map(function (b) {
              return '<div class="pg-row"><span class="nm">' + esc(b.what) + '</span>'
                + '<span class="val">' + money(b.value) + '</span></div>'; }).join('')
            : '<p class="pg-hint">Nothing outstanding.</p>')
          + '</div></div>')
      + '<p class="pg-hint">Being open with a client should not mean handing over your cost base. Switch the two views and the difference is the whole feature.</p>';
  }

  function locked(what) {
    return '<div class="pg-locked">' + LOCK + '<div><b>Not for this role</b>'
      + '<span>An ' + S.role + ' cannot open ' + what + ' on this event. '
      + 'Change the role at the top of the page to see it.</span></div></div>';
  }

  function tasksView() {
    var done = doneCount(), all = tasks().length;
    return '<div class="pg-sum"><div><em>Done</em><b>' + done + ' of ' + all + '</b></div>'
      + '<div><em>Progress</em><b>' + pct(done, all) + '%</b></div>'
      + '<div><em>Still open</em><b>' + (all - done) + '</b></div></div>'
      + S.phases.map(function (p, pi) {
          var d = p.tasks.filter(function (t) { return t.done; }).length;
          return '<div class="pg-phase"><div class="pg-phase-top"><h3>' + esc(p.name) + '</h3>'
            + '<span>' + d + ' of ' + p.tasks.length + '</span></div>'
            + p.tasks.map(function (t, ti) {
                return '<label class="pg-task' + (t.done ? ' done' : '') + '">'
                  + '<input type="checkbox" data-task="' + pi + ':' + ti + '"'
                  + (t.done ? ' checked' : '') + '>'
                  + '<span class="pg-box">' + TICK + '</span>'
                  + '<span class="pg-task-t">' + esc(t.t) + '</span>'
                  + '<span class="pg-task-w">' + esc(t.who) + '</span>'
                  + '<span class="pg-task-d">' + esc(t.due) + '</span></label>';
              }).join('') + '</div>';
        }).join('')
      + '<p class="pg-hint">Every task has an owner and a date. Tick one and the overview, the phase bar and the client portal all move, because they are all counting the same thing.</p>';
  }


  /* ---- Events ---------------------------------------------------------- */
  function events() {
    var a = alloc(), sp = spent(), done = doneCount(), all = tasks().length;
    return head2('Events', 'One event open. Creating another costs 5 credits.')
      + '<div class="pg-viewbar"><span class="pg-seg on">List</span>'
      + '<span class="pg-seg">Table</span><span class="pg-seg">Calendar</span>'
      + '<span class="pg-seg">Timeline</span>'
      + '<span class="pg-spacer"></span><span class="pg-seg">All Status</span>'
      + '<span class="pg-seg">All Categories</span></div>'
      + '<div class="pg-eventcard"><div class="pg-eventcard-top">'
      + '<div><b>' + esc(S.event.name) + '</b><small>' + whenLabel() + ' &middot; '
      + S.event.guests + ' guests &middot; ' + esc(S.event.client) + '</small></div>'
      + '<span class="pg-state s-confirmed">In progress</span></div>'
      + '<div class="pg-row"><span class="nm">Plan</span>' + bar(pct(done, all))
      + '<span class="val">' + pct(done, all) + '%</span></div>'
      + (can().money
        ? '<div class="pg-row"><span class="nm">Budget</span>' + bar(pct(sp, a))
          + '<span class="val">' + money(a - sp) + ' left</span></div>' : '')
      + '<div class="pg-eventcard-act">'
      + '<button class="pg-mini" type="button" data-pg-tab="tasks">Tasks</button>'
      + '<button class="pg-mini" type="button" data-pg-tab="bookings">Bookings</button>'
      + (can().money
        ? '<button class="pg-mini" type="button" data-pg-tab="budget">Budget</button>' : '')
      + '</div></div>'
      + '<p class="pg-hint">In the app an event opens onto its own budget, phases and bookings. Here they are the tabs beside this one, so there is less to click through.</p>';
  }

  /* ---- Vendors --------------------------------------------------------- */
  function vendors() {
    return head2('Vendor Marketplace', 'Discover, save and book trusted vendors for your events.')
      + '<div class="pg-chips">' + VCATS.map(function (c, i) {
          return '<span class="pg-chip' + (i === 0 ? ' on' : '') + '">' + c + '</span>';
        }).join('') + '</div>'
      + '<div class="pg-vendors">' + S.vendors.map(function (v, i) {
          return '<div class="pg-vendor"><div class="pg-vendor-top">'
            + '<span class="pg-cat">' + esc(v.cat) + '</span>'
            + '<button class="pg-heart' + (v.saved ? ' on' : '') + '" type="button" '
            + 'data-save="' + i + '" aria-label="Save ' + esc(v.name) + '">'
            + (v.saved ? HEART_ON : HEART) + '</button></div>'
            + '<b>' + esc(v.name) + '</b><small>' + esc(v.area) + '</small>'
            + (can().money ? '<div class="pg-from"><em>Starting from</em><b>'
                + money(v.from) + '</b></div>' : '')
            + (v.used ? '<span class="pg-onthis">' + TICK + ' On this event</span>' : '')
            + '</div>';
        }).join('') + '</div>'
      + '<p class="pg-hint">Saving a vendor is free. A booking request costs 5 credits and carries the date, the headcount and the budget with it, so what comes back is a price rather than a question.</p>';
  }

  /* ---- Leads ----------------------------------------------------------- */
  function leads() {
    if (!can().money) return locked('leads');
    return head2('Potential clients', 'Every consultation booked from your public profile arrives here.')
      + '<div class="pg-chips">' + ['All'].concat(LEAD_FLOW).concat(['Archived']).map(function (c, i) {
          return '<span class="pg-chip' + (i === 0 ? ' on' : '') + '">' + c + '</span>';
        }).join('') + '</div>'
      + '<div class="pg-leads">' + S.leads.map(function (l, i) {
          var at = LEAD_FLOW.indexOf(l.at);
          return '<div class="pg-lead"><div class="pg-lead-top">'
            + '<div><b>' + esc(l.who) + '</b><small>' + esc(l.what) + ' &middot; '
            + esc(l.when) + ' &middot; ' + l.guests + ' guests</small></div>'
            + '<span class="pg-state s-' + l.at.toLowerCase() + '">' + l.at + '</span></div>'
            + '<div class="pg-lead-foot"><span>' + money(l.budget) + ' budget</span>'
            + '<span>via ' + esc(l.via) + '</span>'
            + (can().edit && at >= 0 && at < LEAD_FLOW.length - 1
              ? '<button class="pg-mini" type="button" data-lead="' + i + '">Mark '
                + LEAD_FLOW[at + 1] + '</button>' : '')
            + '</div></div>';
        }).join('') + '</div>'
      + '<p class="pg-hint">This is the other end of the consultation form on a planner profile. Somebody fills it in on the public page and lands here as New, before anybody has paid for anything.</p>';
  }

  /* ---- Reviews --------------------------------------------------------- */
  function reviews() {
    if (!can().team) return locked('reviews');
    var done = S.bookings.filter(function (b) { return b.state === 'Completed'; });
    return head2('Reviews &amp; ratings', 'A rating can only be left against a completed booking.')
      + '<div class="pg-chips"><span class="pg-chip on">Published</span>'
      + '<span class="pg-chip">Pending</span><span class="pg-chip">Hidden</span></div>'
      + '<div class="pg-reviews">'
      + '<figure class="pg-review"><div class="pg-stars">' + STARS(5) + '</div>'
      + '<blockquote>The run sheet went out eight days before and everything on it happened at the minute it said.</blockquote>'
      + '<figcaption>Bisi A. &middot; a wedding &middot; published</figcaption></figure>'
      + '<figure class="pg-review"><div class="pg-stars">' + STARS(5) + '</div>'
      + '<blockquote>Every naira was against a line, and the final invoice was the number we agreed in month one.</blockquote>'
      + '<figcaption>Tunde O. &middot; a corporate dinner &middot; published</figcaption></figure>'
      + '</div>'
      + '<p class="pg-hint">' + done.length + ' booking' + (done.length === 1 ? '' : 's')
      + ' on this event ' + (done.length === 1 ? 'is' : 'are') + ' completed, so '
      + (done.length === 1 ? 'that one' : 'those') + ' can be reviewed. Nothing else can.</p>';
  }

  function head2(t, sub) {
    return '<div class="pg-h2"><h2>' + t + '</h2><p>' + sub + '</p></div>';
  }

  var HEART = '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor"'
    + ' stroke-width="2"><path d="M12 20s-7-4.4-7-9.2A4 4 0 0 1 12 8a4 4 0 0 1 7 2.8C19 15.6 12 20 12 20z"/></svg>';
  var HEART_ON = '<svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"'
    + ' stroke="none"><path d="M12 20s-7-4.4-7-9.2A4 4 0 0 1 12 8a4 4 0 0 1 7 2.8C19 15.6 12 20 12 20z"/></svg>';
  function STARS(n) {
    var st = '<svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" stroke="none">'
      + '<path d="m12 3.6 2.6 5.3 5.8.8-4.2 4.1 1 5.8-5.2-2.7-5.2 2.7 1-5.8L3.6 9.7l5.8-.8z"/></svg>';
    var out = ''; for (var i = 0; i < n; i++) out += st; return out;
  }

  var VIEWS = { dashboard: overview, events: events, budget: budget,
                tasks: tasksView, bookings: bookings, vendors: vendors,
                team: team, leads: leads, reviews: reviews, portal: portal };

  /* ------------------------------------------------------------------ paint */
  var WHO = { manager: ['AM', 'Adaeze Mbakwe'], coordinator: ['TO', 'Tunde Okoro'],
              assistant: ['IE', 'Ify Eze'] };

  function paint() {
    // The sidebar is rebuilt from NAV every paint, so an item a role cannot
    // open is absent rather than present-but-dead.
    var nav = $('[data-pg-nav]', root);
    if (nav) {
      nav.innerHTML = NAV.filter(function (n) { return !n.needs || can()[n.needs]; })
        .map(function (n) {
          return '<button class="pg-navitem' + (n.k === S.tab ? ' on' : '') + '" type="button"'
            + ' data-pg-tab="' + n.k + '">' + n.t + '</button>';
        }).join('');
      if (!NAV.some(function (n) { return n.k === S.tab; }) && S.tab !== 'budget') {
        S.tab = 'dashboard';
      }
    }
    var c = $('[data-pg-credits]', root);
    if (c) c.textContent = S.credits;
    var ini = $('[data-pg-ini]', root), nm = $('[data-pg-name]', root);
    if (ini) ini.textContent = WHO[S.role][0];
    if (nm) nm.textContent = WHO[S.role][1];

    /* The dashboard is workspace-level in the real app and carries the date
       rather than the event, so it writes its own header. Every other view is
       scoped to an event and keeps the event strip. */
    $('[data-pg-body]', root).innerHTML =
      (S.tab === 'dashboard' ? ''
        : '<div class="pg-event"><div><b>' + esc(S.event.name) + '</b>'
          + '<small>' + whenLabel() + ' &middot; ' + S.event.guests + ' guests &middot; '
          + esc(S.event.client) + '</small></div>'
          + '<span class="pg-badge">' + S.role.charAt(0).toUpperCase() + S.role.slice(1)
          + ' view</span></div>')
      + (VIEWS[S.tab] || overview)();
  }

  /* ----------------------------------------------------------------- events */
  root.addEventListener('click', function (e) {
    var t = e.target;
    var tab = t.closest('[data-pg-tab]');
    if (tab) { S.tab = tab.dataset.pgTab; paint(); return; }

    var pay = t.closest('[data-pay]');
    if (pay) {
      var row = $('[data-payrow="' + pay.dataset.pay + '"]', root);
      row.hidden = !row.hidden;
      if (!row.hidden) $('input', row).focus();
      return;
    }
    if (t.closest('[data-paycancel]')) {
      t.closest('.pg-payrow').hidden = true;
      return;
    }

    var adv = t.closest('[data-adv]');
    if (adv) {
      var b = S.bookings[+adv.dataset.adv];
      var at = FLOW.indexOf(b.state);
      if (at < 0 || at >= 3) return;
      b.state = FLOW[at + 1];
      b.log.push([b.state, new Date().toLocaleDateString('en-GB',
        { day: 'numeric', month: 'short' })]);
      note(b.name + ' moved to ' + b.state);
      paint();
      return;
    }
    var dec = t.closest('[data-dec]');
    if (dec) {
      var d = S.bookings[+dec.dataset.dec];
      d.state = 'Declined';
      d.log.push(['Declined', new Date().toLocaleDateString('en-GB',
        { day: 'numeric', month: 'short' })]);
      note(d.name + ' declined. Nothing else happens, and there is no ranking penalty.');
      paint();
      return;
    }

    if (t.closest('[data-nudge]')) { S.nudge = true; paint(); return; }

    var cal = t.closest('[data-cal]');
    if (cal) {
      var cur = S.cal ? new Date(S.cal + 'T00:00:00') : new Date();
      cur.setDate(1);
      cur.setMonth(cur.getMonth() + (+cal.dataset.cal));
      S.cal = iso(cur);
      paint();
      return;
    }

    var sv = t.closest('[data-save]');
    if (sv) {
      var v = S.vendors[+sv.dataset.save];
      v.saved = !v.saved;
      note((v.saved ? 'Saved ' : 'Unsaved ') + v.name + '. Saving a vendor is free.');
      paint();
      return;
    }
    var ld = t.closest('[data-lead]');
    if (ld) {
      var lead = S.leads[+ld.dataset.lead];
      var at = LEAD_FLOW.indexOf(lead.at);
      if (at < 0 || at >= LEAD_FLOW.length - 1) return;
      lead.at = LEAD_FLOW[at + 1];
      note(lead.who + ' moved to ' + lead.at + '.');
      paint();
      return;
    }

    var cl = t.closest('[data-client]');
    if (cl) { S.client = cl.dataset.client === '1'; paint(); return; }
  });

  root.addEventListener('change', function (e) {
    var box = e.target.closest('[data-task]');
    if (!box) return;
    var ix = box.dataset.task.split(':');
    var task = S.phases[+ix[0]].tasks[+ix[1]];
    task.done = box.checked;
    if (task.done) task.doing = false;
    note((task.done ? 'Ticked' : 'Reopened') + ': ' + task.t);
    paint();
  });

  root.addEventListener('submit', function (e) {
    var f = e.target.closest('[data-payform]');
    if (!f) return;
    e.preventDefault();
    var i = +f.dataset.payform, line = S.budget[i];
    var v = Math.round(+$('input', f).value || 0);
    if (v <= 0) return;
    line.spent += v;
    var p = pct(line.spent, line.alloc);
    note(money(v) + ' recorded against ' + line.name + '. Now ' + p + '% of its allocation.');
    S.tab = 'budget';
    paint();
  });

  var roleSel = $('[data-pg-role]');
  if (roleSel) roleSel.addEventListener('change', function () {
    S.role = roleSel.value;
    if (!can().money && S.tab === 'budget') S.tab = 'dashboard';
    if (!can().team && S.tab === 'team') S.tab = 'dashboard';
    if (!can().portal && S.tab === 'portal') S.tab = 'dashboard';
    paint();
  });

  var reset = $('[data-pg-reset]');
  if (reset) reset.addEventListener('click', function () {
    var tab = S.tab;
    S = fresh();
    S.tab = tab;
    if (roleSel) roleSel.value = 'manager';
    paint();
  });

  paint();
})();

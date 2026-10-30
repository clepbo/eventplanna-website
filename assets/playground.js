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

   This is deliberately not in assets/app.js. That file is the scroll and
   motion engine and has nothing to do with any of this; it is only loaded on
   playground.html.
   --------------------------------------------------------------------------- */
(function () {
  'use strict';

  var root = document.querySelector('[data-pg]');
  if (!root) return;

  var N = '₦';
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return [].slice.call((r || document).querySelectorAll(s)); };

  /* ------------------------------------------------------------- the event */
  function fresh() {
    return {
      role: 'manager',
      tab: 'overview',
      client: false,
      alerted: {},
      event: {
        name: 'Traditional wedding, Ikeja',
        date: '2026-12-12',
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
      phases: [
        { name: 'Booked and briefed', tasks: [
          { t: 'Signed contract filed', who: 'Adaeze', due: '14 Sep', done: true },
          { t: 'Deposit received and receipted', who: 'Adaeze', due: '16 Sep', done: true },
          { t: 'Budget split by category', who: 'Adaeze', due: '20 Sep', done: true },
          { t: 'Client kickoff call', who: 'Adaeze', due: '24 Sep', done: true }
        ] },
        { name: 'Suppliers', tasks: [
          { t: 'Venue confirmed and paid', who: 'Adaeze', due: '2 Oct', done: true },
          { t: 'Caterer booked, menu agreed', who: 'Tunde', due: '10 Oct', done: true },
          { t: 'Photographer booked', who: 'Tunde', due: '14 Oct', done: true },
          { t: 'Decor quotes compared', who: 'Ify', due: '3 Nov', done: false },
          { t: 'Live band confirmed', who: 'Tunde', due: '8 Nov', done: false }
        ] },
        { name: 'The weeks before', tasks: [
          { t: 'Final guest count to caterer', who: 'Ify', due: '21 Nov', done: false },
          { t: 'Seating plan approved by client', who: 'Adaeze', due: '26 Nov', done: false },
          { t: 'Run sheet out to every supplier', who: 'Tunde', due: '4 Dec', done: false },
          { t: 'Balances due and chased', who: 'Adaeze', due: '5 Dec', done: false },
          { t: 'Venue walkthrough', who: 'Tunde', due: '9 Dec', done: false }
        ] },
        { name: 'On the day', tasks: [
          { t: 'Supplier arrivals checked in', who: 'Tunde', due: '12 Dec', done: false },
          { t: 'Room set and photographed', who: 'Ify', due: '12 Dec', done: false },
          { t: 'Guest movement to reception', who: 'Tunde', due: '12 Dec', done: false },
          { t: 'Final payments released', who: 'Adaeze', due: '12 Dec', done: false }
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
      feed: []
    };
  }

  var S = fresh();

  /* ---------------------------------------------------------------- helpers */
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

  function overview() {
    var a = alloc(), sp = spent(), left = a - sp;
    /* A line that is settled at exactly its allocation is not a problem, it
       is a line that came in on budget: Venue is paid in full from the start
       and was being reported as a risk. Only 85% up to the allocation is
       worth a warning, and past it is a different, louder thing. */
    /* Threshold on the rounded figure, the same one the table prints. On the
       raw ratio a line showing "85%" could sit at 84.6% and not fire, which
       reads as the alert being broken. */
    var tight = S.budget.filter(function (b) {
      return b.alloc && pct(b.spent, b.alloc) >= 85 && b.spent < b.alloc; });
    var over = S.budget.filter(function (b) { return b.alloc && b.spent > b.alloc; });
    var done = doneCount(), all = tasks().length;
    var confirmed = S.bookings.filter(function (b) {
      return b.state === 'Confirmed' || b.state === 'Completed'; }).length;

    var cards = [
      ['Days to go', daysToGo(), whenLabel()],
      ['Tasks done', done + ' of ' + all, pct(done, all) + '% of the plan'],
      ['Bookings confirmed', confirmed + ' of ' + S.bookings.length, 'Across every category']
    ];
    if (can().money) {
      cards.unshift(['Budget left', money(left),
        money(sp) + ' of ' + money(a) + ' spent']);
    }

    return '<div class="pg-kpis">' + cards.map(function (c) {
      return '<div class="pg-kpi"><em>' + c[0] + '</em><b>' + c[1] + '</b><small>'
        + c[2] + '</small></div>';
    }).join('') + '</div>'

      + (can().money && over.length
        ? '<div class="pg-alert bad">' + WARN + '<div><b>' + over.length + ' categor'
          + (over.length === 1 ? 'y is' : 'ies are') + ' over allocation</b><span>'
          + over.map(function (b) {
              return esc(b.name) + ' ' + pct(b.spent, b.alloc) + '%, '
                + money(b.spent - b.alloc) + ' over'; }).join('; ')
          + '. Move the allocation or the money has to come from somewhere else.'
          + '</span></div></div>'
        : '')
      + (can().money && tight.length
        ? '<div class="pg-alert">' + WARN + '<div><b>' + tight.length + ' categor'
          + (tight.length === 1 ? 'y is' : 'ies are') + ' at 85% or more of allocation</b>'
          + '<span>' + tight.map(function (b) {
              return esc(b.name) + ' ' + pct(b.spent, b.alloc) + '%'; }).join(', ')
          + '. Nothing is overspent yet, which is the point of saying so now.</span></div></div>'
        : '')

      + '<div class="pg-two">'
      + '<div class="pg-panel"><h3>Where the plan is</h3>'
      + S.phases.map(function (p) {
          var d = p.tasks.filter(function (t) { return t.done; }).length;
          return '<div class="pg-row"><span class="nm">' + esc(p.name) + '</span>'
            + bar(pct(d, p.tasks.length)) + '<span class="val">' + d + '/' + p.tasks.length
            + '</span></div>';
        }).join('')
      + '<p class="pg-hint">Progress counts finished tasks. It is not an estimate, which is why it only moves when you tick something.</p>'
      + '</div>'

      + '<div class="pg-panel"><h3>Latest</h3>'
      + (S.feed.length
        ? '<ul class="pg-feed">' + S.feed.map(function (f) {
            return '<li><i></i><div>' + esc(f.t) + '<small>'
              + f.at.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
              + '</small></div></li>'; }).join('') + '</ul>'
        : '<p class="pg-hint">Nothing yet. Tick a task, record a payment or move a booking on and it shows up here, the way it would for everyone else on the event.</p>')
      + '</div></div>';
  }

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

  var VIEWS = { overview: overview, budget: budget, tasks: tasksView,
                bookings: bookings, team: team, portal: portal };

  /* ------------------------------------------------------------------ paint */
  function paint() {
    var body = $('[data-pg-body]', root);
    body.innerHTML = '<div class="pg-event"><div><b>' + esc(S.event.name) + '</b>'
      + '<small>' + whenLabel() + ' &middot; ' + S.event.guests + ' guests &middot; '
      + esc(S.event.client) + '</small></div>'
      + '<span class="pg-badge">' + S.role.charAt(0).toUpperCase() + S.role.slice(1)
      + ' view</span></div>'
      + (VIEWS[S.tab] || overview)();
    $$('.pg-tab', root).forEach(function (b) {
      var on = b.dataset.pgTab === S.tab;
      b.classList.toggle('on', on);
      b.setAttribute('aria-selected', String(on));
      // The budget tab is simply not there for somebody who cannot open it.
      if (b.dataset.pgTab === 'budget') b.hidden = !can().money;
      if (b.dataset.pgTab === 'team') b.hidden = !can().team;
      if (b.dataset.pgTab === 'portal') b.hidden = !can().portal;
    });
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

    var cl = t.closest('[data-client]');
    if (cl) { S.client = cl.dataset.client === '1'; paint(); return; }
  });

  root.addEventListener('change', function (e) {
    var box = e.target.closest('[data-task]');
    if (!box) return;
    var ix = box.dataset.task.split(':');
    var task = S.phases[+ix[0]].tasks[+ix[1]];
    task.done = box.checked;
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
    if (!can().money && S.tab === 'budget') S.tab = 'overview';
    if (!can().team && S.tab === 'team') S.tab = 'overview';
    if (!can().portal && S.tab === 'portal') S.tab = 'overview';
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

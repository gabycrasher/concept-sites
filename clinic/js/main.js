/* Veyra Health: page behaviour. Everything works without animation; GSAP adds the motion.
   Nothing on this concept site is sent anywhere: booking and quiz results stay in the page. */
(function () {
  'use strict';
  var gsap = window.gsap, ST = window.ScrollTrigger;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  if (gsap && ST) gsap.registerPlugin(ST);

  $('[data-year]').textContent = new Date().getFullYear();

  /* ---------- Header + bottom-sheet menu ---------- */
  var header = $('[data-header]');
  function onScroll() { header.classList.toggle('is-solid', window.scrollY > 30); }
  window.addEventListener('scroll', onScroll, { passive: true }); onScroll();
  var menuBtn = $('[data-menu-btn]'), sheet = $('[data-sheet]');
  function setSheet(open) {
    menuBtn.setAttribute('aria-expanded', String(open));
    if (open) { sheet.hidden = false; requestAnimationFrame(function () { sheet.classList.add('is-open'); }); }
    else { sheet.classList.remove('is-open'); setTimeout(function () { if (!sheet.classList.contains('is-open')) sheet.hidden = true; }, 600); }
    document.body.style.overflow = open ? 'hidden' : '';
  }
  menuBtn.addEventListener('click', function () { setSheet(true); });
  sheet.addEventListener('click', function (e) { if (e.target === sheet || e.target.closest('a')) setSheet(false); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && sheet.classList.contains('is-open')) setSheet(false); });

  /* ---------- Toast ---------- */
  var toastEl = $('[data-toast]'), toastTimer;
  function toast(msg) {
    toastEl.textContent = msg; toastEl.classList.add('is-on');
    clearTimeout(toastTimer); toastTimer = setTimeout(function () { toastEl.classList.remove('is-on'); }, 5200);
  }

  /* ---------- Split text ---------- */
  function splitWords(elm) {
    var out = [];
    (function walk(node) {
      Array.prototype.slice.call(node.childNodes).forEach(function (n) {
        if (n.nodeType === 3) {
          var frag = document.createDocumentFragment();
          n.textContent.split(/(\s+)/).forEach(function (part) {
            if (!part) return;
            if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(' ')); return; }
            var line = document.createElement('span'); line.className = 'split-line';
            var w = document.createElement('span'); w.className = 'split-word'; w.textContent = part;
            line.appendChild(w); frag.appendChild(line); out.push(w);
          });
          n.parentNode.replaceChild(frag, n);
        } else if (n.nodeType === 1) walk(n);
      });
    })(elm);
    return out;
  }

  /* ---------- Hero entrance ---------- */
  var heroPlayed = false;
  function heroIn() {
    if (heroPlayed) return; heroPlayed = true;
    var ring = $('[data-wait-ring]');
    setTimeout(function () { ring.style.strokeDashoffset = String(113 - 113 * .35); }, 400);
    if (!gsap || reduce) return;
    var words = splitWords($('.hero-title'));
    gsap.timeline({ defaults: { ease: 'expo.out' } })
      .from('.hero-photo', { clipPath: 'inset(18% 10% 18% 10% round 34px)', scale: 1.06, duration: 1.6 }, 0)
      .from('.hero-photo img', { scale: 1.25, duration: 2 }, 0)
      .from('.chip', { y: 16, autoAlpha: 0, duration: .9 }, .1)
      .from(words, { yPercent: 110, duration: 1.2, stagger: .07 }, .15)
      .from('.hero-lede, .hero-actions, .hero-trust', { y: 24, autoAlpha: 0, duration: 1, stagger: .09 }, .45)
      .from('.fc-next', { x: -30, y: 20, autoAlpha: 0, duration: 1.1 }, .8)
      .from('.fc-wait', { x: 30, y: -20, autoAlpha: 0, duration: 1.1 }, .9)
      .from('.site-header', { y: -24, autoAlpha: 0, duration: .9 }, .2);
  }
  if (window.__openingDone) heroIn();
  else { window.addEventListener('opening:reveal', heroIn, { once: true }); window.addEventListener('opening:done', heroIn, { once: true }); }

  // Gentle float on the hero cards.
  if (gsap && !reduce) {
    gsap.to('.fc-next', { y: -8, duration: 3, ease: 'sine.inOut', yoyo: true, repeat: -1 });
    gsap.to('.fc-wait', { y: 8, duration: 3.4, ease: 'sine.inOut', yoyo: true, repeat: -1 });
  }

  /* ---------- Counters ---------- */
  $$('[data-count]').forEach(function (n) {
    var target = +n.dataset.count;
    function run() {
      if (!gsap || reduce) { n.textContent = target; return; }
      var o = { v: 0 };
      gsap.to(o, { v: target, duration: 1.8, ease: 'power3.out', onUpdate: function () { n.textContent = Math.round(o.v); } });
    }
    if (ST) ST.create({ trigger: n, start: 'top 95%', once: true, onEnter: run }); else run();
  });

  /* ---------- Booking widget ---------- */
  var services = $$('[data-services] button'), daysWrap = $('[data-days]'), slotsWrap = $('[data-slots]');
  var summary = $('[data-book-summary]'), confirmBtn = $('[data-book-confirm]');
  var state = { service: 'Family doctor', day: 0, time: null };
  var dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  var today = new Date();
  var days = [];
  for (var d = 0; d < 7; d++) { var dt = new Date(today); dt.setDate(today.getDate() + d); days.push(dt); }
  daysWrap.innerHTML = days.map(function (dt, i) {
    return '<button type="button" role="radio" aria-checked="' + (i === 0) + '" data-day="' + i + '"><small>' + (i === 0 ? 'Today' : dayNames[dt.getDay()]) + '</small><b>' + dt.getDate() + '</b></button>';
  }).join('');
  function seeded(n) { var x = Math.sin(n * 9301 + 49297) * 233280; return x - Math.floor(x); }
  function renderSlots() {
    var times = ['8:20', '9:00', '9:40', '10:40', '11:20', '12:00', '2:40', '3:20', '4:00', '5:10', '6:30', '7:40'];
    var nowH = today.getHours() + today.getMinutes() / 60;
    slotsWrap.innerHTML = times.map(function (t, i) {
      var h = +t.split(':')[0] + (+t.split(':')[1]) / 60; if (i >= 6) h += 12;
      if (t === '12:00') h = 12;
      var past = state.day === 0 && h <= nowH + .5;
      var taken = seeded(state.day * 31 + i + state.service.length) > .68;
      var label = t + (h >= 12 ? ' pm' : ' am');
      return '<button type="button" role="radio" aria-checked="false" data-time="' + label + '"' + (past || taken ? ' disabled aria-disabled="true"' : '') + '>' + label + '</button>';
    }).join('');
    state.time = null; syncSummary();
    var first = $('button:not([disabled])', slotsWrap);
    var next = $('[data-next-slot]');
    if (state.day === 0 && first && next) next.textContent = first.dataset.time;
  }
  function syncSummary() {
    var dayLabel = state.day === 0 ? 'Today' : dayNames[days[state.day].getDay()] + ' ' + days[state.day].getDate();
    summary.textContent = state.service + ' · ' + dayLabel + ' · ' + (state.time || 'choose a time');
    confirmBtn.disabled = !state.time;
  }
  function choose(group, btn) { $$('button', group).forEach(function (b) { b.setAttribute('aria-checked', String(b === btn)); }); }
  services.forEach(function (b) { b.addEventListener('click', function () { choose(b.parentNode, b); state.service = b.textContent; renderSlots(); }); });
  daysWrap.addEventListener('click', function (e) { var b = e.target.closest('button'); if (!b) return; choose(daysWrap, b); state.day = +b.dataset.day; renderSlots(); });
  slotsWrap.addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b || b.disabled) return;
    choose(slotsWrap, b); state.time = b.dataset.time; syncSummary();
    if (gsap && !reduce) gsap.fromTo(b, { scale: .92 }, { scale: 1, duration: .5, ease: 'back.out(3)' });
  });
  confirmBtn.addEventListener('click', function () {
    toast('This is a concept website, so no appointment was booked. On a real site, ' + state.service.toLowerCase() + ' at ' + state.time + ' would now be held for you.');
  });
  renderSlots();

  /* ---------- Service card glow follows the pointer ---------- */
  if (fine) $$('[data-glow]').forEach(function (c) {
    c.addEventListener('pointermove', function (e) {
      var r = c.getBoundingClientRect();
      c.style.setProperty('--x', (e.clientX - r.left) + 'px'); c.style.setProperty('--y', (e.clientY - r.top) + 'px');
    });
  });
  if (fine && gsap && !reduce) $$('[data-magnetic]').forEach(function (b) {
    b.addEventListener('pointermove', function (e) {
      var r = b.getBoundingClientRect();
      gsap.to(b, { x: (e.clientX - r.left - r.width / 2) * .2, y: (e.clientY - r.top - r.height / 2) * .3, duration: .4, ease: 'power3.out' });
    });
    b.addEventListener('pointerleave', function () { gsap.to(b, { x: 0, y: 0, duration: .7, ease: 'elastic.out(1, .45)' }); });
  });

  /* ---------- Scroll reveals ---------- */
  if (gsap && ST && !reduce) {
    $$('.section-title').forEach(function (h) {
      var words = splitWords(h);
      gsap.from(words, { yPercent: 110, duration: 1.1, ease: 'expo.out', stagger: .05, scrollTrigger: { trigger: h, start: 'top 86%' } });
    });
    $$('.eyebrow').forEach(function (e) { gsap.from(e, { y: 14, autoAlpha: 0, duration: .8, ease: 'power3.out', scrollTrigger: { trigger: e, start: 'top 92%' } }); });
    gsap.from('.book-card', { y: 50, autoAlpha: 0, duration: 1.2, ease: 'expo.out', scrollTrigger: { trigger: '.book-card', start: 'top 90%' } });
    ScrollTrigger.batch('.svc', { start: 'top 88%', onEnter: function (b) { gsap.from(b, { y: 60, autoAlpha: 0, duration: 1.1, ease: 'expo.out', stagger: .07 }); } });
    ScrollTrigger.batch('.doc, .tcard, .faq details', { start: 'top 90%', onEnter: function (b) { gsap.from(b, { y: 40, autoAlpha: 0, duration: 1, ease: 'expo.out', stagger: .07 }); } });
    gsap.from('.guide-card', { y: 60, autoAlpha: 0, scale: .97, duration: 1.2, ease: 'expo.out', scrollTrigger: { trigger: '.guide-card', start: 'top 85%' } });
  }

  /* ---------- Your visit: pinned phone, steps advance with scroll ---------- */
  var visit = $('[data-visit]'), steps = $$('[data-visit-steps] li'), screens = $$('[data-screens] .screen');
  function setStep(i) {
    steps.forEach(function (s, j) { s.classList.toggle('is-active', j === i); });
    screens.forEach(function (s, j) { s.classList.toggle('is-active', j === i); });
  }
  if (visit && gsap && ST && !reduce && window.matchMedia('(min-width: 1100px)').matches) {
    ST.create({ trigger: visit, start: 'top top', end: '+=' + Math.round(window.innerHeight * 2), pin: true, scrub: true,
      onUpdate: function (self) { setStep(Math.min(3, Math.floor(self.progress * 4))); } });
  } else if (visit) {
    // Phones and tablets: the steps advance as each one scrolls into the middle of the screen,
    // and tapping a step shows its screen.
    steps.forEach(function (s, i) {
      s.addEventListener('click', function () { setStep(i); });
      if (ST) ST.create({ trigger: s, start: 'top 60%', end: 'bottom 40%', onToggle: function (self) { if (self.isActive) setStep(i); } });
    });
    if (gsap && !reduce) gsap.from('.phone', { y: 60, rotate: -4, autoAlpha: 0, duration: 1.2, ease: 'expo.out', scrollTrigger: { trigger: '.phone', start: 'top 85%' } });
  }

  /* ---------- Today at the clinic ---------- */
  var hour = new Date().getHours();
  var busy = [30, 55, 80, 70, 45, 35, 50, 40, 28, 32, 58, 75, 62, 38]; // 7 am to 8 pm
  var hoursWrap = $('[data-hours]');
  var sorted = busy.slice().sort(function (a, b) { return a - b; });
  hoursWrap.innerHTML = busy.map(function (v, i) {
    var h = 7 + i;
    var cls = (h === hour ? 'now' : '') + (v <= sorted[3] ? ' quiet' : '');
    return '<div><i class="' + cls + '" style="--v:' + v + '%" title="' + (h > 12 ? h - 12 : h) + (h >= 12 ? 'pm' : 'am') + '"></i><small>' + (h > 12 ? h - 12 : h) + '</small></div>';
  }).join('');
  var waitNow = hour >= 7 && hour <= 20 ? Math.round(6 + busy[hour - 7] / 6) : 8;
  $('[data-wait]').textContent = waitNow;
  var gauge = $('[data-gauge]'), gaugeNum = $('[data-gauge-num]');
  var GL = gauge.getTotalLength(); gauge.style.strokeDasharray = GL; gauge.style.strokeDashoffset = GL;
  function runGauge() {
    var frac = Math.min(1, waitNow / 30);
    if (!gsap || reduce) { gauge.style.strokeDashoffset = GL * (1 - frac); gaugeNum.textContent = waitNow; return; }
    var o = { v: 0 };
    gsap.to(o, { v: 1, duration: 1.8, ease: 'expo.out', onUpdate: function () { gauge.style.strokeDashoffset = GL * (1 - frac * o.v); gaugeNum.textContent = Math.round(waitNow * o.v); } });
    gsap.from($$('i', hoursWrap), { scaleY: 0, duration: 1, ease: 'expo.out', stagger: .04 });
  }
  if (ST) ST.create({ trigger: '.today-grid', start: 'top 85%', once: true, onEnter: runGauge }); else runGauge();
  var depts = [['Family medicine', 7, 21], ['Children', 8, 19], ['Dental', 8, 18], ['Lab & imaging', 7, 20], ['Pharmacy', 7, 22], ['Video consultations', 7, 23]];
  $('[data-depts]').innerHTML = depts.map(function (d) {
    var open = hour >= d[1] && hour < d[2];
    var busyNow = open && hour - 7 >= 0 && busy[hour - 7] > 60;
    return '<li>' + d[0] + '<em class="' + (!open ? 'st-closed' : busyNow ? 'st-busy' : 'st-open') + '">' + (!open ? 'Closed' : busyNow ? 'Busy' : 'Open') + '</em></li>';
  }).join('');

  /* ---------- Doctors filter ---------- */
  var docBtns = $$('[data-doc-filter] button'), docs = $$('[data-docs] .doc');
  docBtns.forEach(function (b) {
    b.addEventListener('click', function () {
      docBtns.forEach(function (x) { x.setAttribute('aria-selected', String(x === b)); });
      docs.forEach(function (d) { d.classList.toggle('is-hidden', b.dataset.f !== 'all' && d.dataset.tags.indexOf(b.dataset.f) === -1); });
      if (gsap && !reduce) gsap.fromTo(docs.filter(function (d) { return !d.classList.contains('is-hidden'); }), { y: 20, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: .6, ease: 'expo.out', stagger: .06 });
    });
  });

  /* ---------- Which care do I need? ---------- */
  var QUESTIONS = [
    { q: 'Who is the appointment for?', a: [['Me', 'adult'], ['My child', 'child'], ['An older relative', 'adult']] },
    { q: 'How are they feeling right now?', a: [['Chest pain, trouble breathing, or very unwell', 'urgent'], ['Unwell, but it can wait a few hours', 'soon'], ['Fine, it is a check-up or a question', 'routine']] },
    { q: 'How would you like to be seen?', a: [['In person at the clinic', 'clinic'], ['By video from home', 'video'], ['Whatever is quickest', 'quick']] }
  ];
  var answers = [], quizBody = $('[data-quiz-body]'), bar = $('[data-quiz-bar]');
  function renderQuiz() {
    bar.style.width = (answers.length / QUESTIONS.length * 100) + '%';
    if (answers.length < QUESTIONS.length) {
      var Q = QUESTIONS[answers.length];
      quizBody.innerHTML = '<h3>' + Q.q + '</h3><div class="quiz-opts">' + Q.a.map(function (a) { return '<button type="button" data-v="' + a[1] + '">' + a[0] + '</button>'; }).join('') + '</div>';
    } else {
      var r = result();
      quizBody.innerHTML = '<div class="quiz-result"><span class="tag" style="background:' + r.bg + ';color:' + r.fg + '">' + r.tag + '</span><h3>' + r.title + '</h3><p>' + r.text + '</p>' +
        '<div class="quiz-actions">' + (r.cta ? '<a class="btn btn-teal" href="' + r.href + '">' + r.cta + '</a>' : '') + '<button class="btn btn-ghost" type="button" data-restart>Start again</button></div>' +
        '<p class="quiz-note">This guide does not give medical advice or diagnose anything.</p></div>';
    }
    if (gsap && !reduce) gsap.from(quizBody.children, { y: 20, autoAlpha: 0, duration: .6, ease: 'expo.out' });
  }
  function result() {
    if (answers[1] === 'urgent') return { tag: 'Call now', bg: '#ffe5dd', fg: '#b23a20', title: 'Please call your local emergency number.', text: 'Chest pain, trouble breathing or feeling very unwell needs urgent help straight away, not a booking.', cta: '', href: '' };
    var who = answers[0] === 'child' ? 'Child health' : 'Family medicine';
    if (answers[2] === 'video' || (answers[2] === 'quick' && answers[1] === 'soon')) return { tag: 'Video consultation', bg: '#e2f0f6', fg: '#1e5b78', title: 'A video call is your fastest route.', text: 'Most minor illnesses can be assessed by video. If the doctor needs to examine you, they will book you a same-day slot at the clinic.', cta: 'Choose a video slot', href: '#book' };
    if (answers[1] === 'soon') return { tag: 'Same-day ' + who.toLowerCase(), bg: '#d3f1e9', fg: '#0f7d73', title: 'Book a same-day ' + who.toLowerCase() + ' appointment.', text: 'We keep slots free every afternoon for people who are unwell today. Pick the first time that suits you.', cta: 'See today\'s times', href: '#book' };
    return { tag: who, bg: '#d3f1e9', fg: '#0f7d73', title: 'A routine ' + who.toLowerCase() + ' visit.', text: 'Check-ups and questions get a full thirty minutes. Book a time that works for you this week.', cta: 'Book a check-up', href: '#book' };
  }
  quizBody.addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b) return;
    if (b.hasAttribute('data-restart')) { answers = []; renderQuiz(); return; }
    if (b.dataset.v) { answers.push(b.dataset.v); renderQuiz(); }
  });
  renderQuiz();

  /* ---------- Open now ---------- */
  var openEl = $('[data-open-now]');
  var dow = new Date().getDay();
  var spans = { 0: [9, 14], 6: [8, 18] };
  var span = spans[dow] || [7, 21];
  var nowH = new Date().getHours() + new Date().getMinutes() / 60;
  var isOpen = nowH >= span[0] && nowH < span[1];
  openEl.classList.add(isOpen ? 'is-open' : 'is-closed');
  openEl.textContent = isOpen ? 'Open now · until ' + (span[1] > 12 ? span[1] - 12 + ' pm' : span[1] + ' am') : 'Closed now · the 24/7 nurse line is open';
  var rows = $$('[data-hours-table] tr');
  rows[dow === 0 ? 2 : dow === 6 ? 1 : 0].classList.add('today');

  if (gsap && ST && !reduce) gsap.from('[data-pin]', { y: -40, autoAlpha: 0, duration: 1, ease: 'bounce.out', scrollTrigger: { trigger: '.find-map', start: 'top 80%' } });
})();

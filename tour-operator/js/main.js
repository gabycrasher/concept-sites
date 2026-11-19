/* Oryx & Ember: page behaviour. Everything works without animation; GSAP adds the motion. */
(function () {
  'use strict';
  var gsap = window.gsap, ST = window.ScrollTrigger;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  if (gsap && ST) gsap.registerPlugin(ST);

  /* ---------- Header + mobile menu ---------- */
  var header = $('[data-header]');
  function onScroll() { header.classList.toggle('is-solid', window.scrollY > 40); }
  window.addEventListener('scroll', onScroll, { passive: true }); onScroll();

  var menuBtn = $('[data-menu-btn]'), menu = $('[data-menu]');
  function setMenu(open) {
    menuBtn.setAttribute('aria-expanded', String(open));
    if (open) { menu.hidden = false; requestAnimationFrame(function () { menu.classList.add('is-open'); }); }
    else { menu.classList.remove('is-open'); setTimeout(function () { if (!menu.classList.contains('is-open')) menu.hidden = true; }, 800); }
    document.body.style.overflow = open ? 'hidden' : '';
  }
  menuBtn.addEventListener('click', function () { setMenu(menuBtn.getAttribute('aria-expanded') !== 'true'); });
  $$('a', menu).forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && menuBtn.getAttribute('aria-expanded') === 'true') setMenu(false); });

  $('[data-year]').textContent = new Date().getFullYear();

  /* ---------- Split text ---------- */
  function splitWords(elm) {
    var out = [];
    (function walk(node, wrapEm) {
      Array.prototype.slice.call(node.childNodes).forEach(function (n) {
        if (n.nodeType === 3) {
          var frag = document.createDocumentFragment();
          n.textContent.split(/(\s+)/).forEach(function (part) {
            if (!part) return;
            if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(' ')); return; }
            var line = document.createElement('span'); line.className = 'split-line'; line.style.display = 'inline-block';
            var w = document.createElement('span'); w.className = 'split-word'; w.textContent = part;
            line.appendChild(w); frag.appendChild(line); out.push(w);
          });
          n.parentNode.replaceChild(frag, n);
        } else if (n.nodeType === 1) walk(n);
      });
    })(elm);
    return out;
  }

  /* ---------- Hero entrance (after the opening) ---------- */
  function heroIn() {
    if (!gsap || reduce) return;
    var words = splitWords($('.hero-title'));
    gsap.timeline({ defaults: { ease: 'expo.out' } })
      .from('.hero-media img', { scale: 1.3, duration: 2.4, ease: 'power3.out' }, 0)
      .from('.kicker', { y: 20, autoAlpha: 0, duration: 1 }, .1)
      .from(words, { yPercent: 115, rotate: 4, duration: 1.3, stagger: .06 }, .15)
      .from('.hero-lede, .hero-actions', { y: 26, autoAlpha: 0, duration: 1.1, stagger: .1 }, .55)
      .from('.hero-card', { x: 40, autoAlpha: 0, duration: 1.2 }, .8)
      .from('.site-header', { y: -30, autoAlpha: 0, duration: 1 }, .3);
  }
  if (window.__openingDone) heroIn(); else window.addEventListener('opening:done', heroIn, { once: true });

  // Live coordinates beside the hero (desktop).
  var coords = $$('[data-coord]');
  if (coords.length && !reduce) {
    var t0 = performance.now();
    (function tick(t) {
      var s = Math.floor(((t - t0) / 1000) % 60);
      coords[0].textContent = '02°19′' + String(s).padStart(2, '0') + '″S';
      coords[1].textContent = '34°49′' + String(59 - s).padStart(2, '0') + '″E';
      requestAnimationFrame(tick);
    })(t0);
  }

  /* ---------- Story: words light up as you read ---------- */
  var statement = $('[data-words]');
  if (statement) {
    var text = statement.textContent.trim().split(/\s+/);
    statement.innerHTML = text.map(function (w) { return '<span class="w">' + w + '</span>'; }).join(' ');
    var ws = $$('.w', statement);
    if (gsap && ST && !reduce) {
      gsap.to(ws, { opacity: 1, stagger: .1, ease: 'none', scrollTrigger: { trigger: statement, start: 'top 80%', end: 'bottom 45%', scrub: true } });
    } else ws.forEach(function (w) { w.style.opacity = 1; });
  }

  /* ---------- Counters ---------- */
  $$('[data-count]').forEach(function (n) {
    var target = +n.dataset.count, suffix = n.dataset.suffix || '';
    function run() {
      if (!gsap || reduce) { n.textContent = target + suffix; return; }
      var o = { v: 0 };
      gsap.to(o, { v: target, duration: 2, ease: 'power3.out', onUpdate: function () { n.textContent = Math.round(o.v) + suffix; } });
    }
    if (ST) ST.create({ trigger: n, start: 'top 90%', once: true, onEnter: run }); else run();
  });

  /* ---------- Section titles rise in ---------- */
  if (gsap && ST && !reduce) {
    $$('.section-title, .enquire-title').forEach(function (h) {
      var words = splitWords(h);
      gsap.from(words, { yPercent: 110, duration: 1.1, ease: 'expo.out', stagger: .05, scrollTrigger: { trigger: h, start: 'top 85%' } });
    });
    gsap.utils.toArray('.eyebrow, .section-intro').forEach(function (e) {
      gsap.from(e, { y: 18, autoAlpha: 0, duration: 1, ease: 'power3.out', scrollTrigger: { trigger: e, start: 'top 90%' } });
    });
    gsap.from('.j-card', { y: 80, autoAlpha: 0, duration: 1.2, ease: 'expo.out', stagger: .08, scrollTrigger: { trigger: '.bento', start: 'top 80%' } });
    gsap.from('.guide', { y: 60, autoAlpha: 0, duration: 1.1, ease: 'expo.out', stagger: .08, scrollTrigger: { trigger: '.guide-grid', start: 'top 82%' } });
    gsap.from('.note', { x: 60, autoAlpha: 0, duration: 1.1, ease: 'expo.out', stagger: .08, scrollTrigger: { trigger: '.notes', start: 'top 85%' } });
    gsap.to('[data-hero-media]', { yPercent: 14, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
    gsap.fromTo('.enquire-bg img', { scale: 1.2 }, { scale: 1, ease: 'none', scrollTrigger: { trigger: '.enquire', start: 'top bottom', end: 'bottom top', scrub: true } });
  }

  /* ---------- Card spotlight + magnetic buttons (mouse only) ---------- */
  if (fine) {
    $$('[data-spotlight]').forEach(function (c) {
      c.addEventListener('pointermove', function (e) {
        var r = c.getBoundingClientRect();
        c.style.setProperty('--mx', (e.clientX - r.left) + 'px');
        c.style.setProperty('--my', (e.clientY - r.top) + 'px');
      });
    });
    if (gsap && !reduce) $$('[data-magnetic]').forEach(function (b) {
      b.addEventListener('pointermove', function (e) {
        var r = b.getBoundingClientRect();
        gsap.to(b, { x: (e.clientX - r.left - r.width / 2) * .25, y: (e.clientY - r.top - r.height / 2) * .35, duration: .5, ease: 'power3.out' });
      });
      b.addEventListener('pointerleave', function () { gsap.to(b, { x: 0, y: 0, duration: .8, ease: 'elastic.out(1, .4)' }); });
    });
  }

  /* ---------- Journey carousel dots (phones) ---------- */
  var bento = $('[data-carousel]'), dotsWrap = $('[data-carousel-dots]');
  if (bento && dotsWrap) {
    var cards = $$('.j-card', bento);
    dotsWrap.innerHTML = cards.map(function () { return '<i></i>'; }).join('');
    var dots = $$('i', dotsWrap);
    function syncDots() {
      var w = cards[0].getBoundingClientRect().width + 14;
      var idx = Math.min(cards.length - 1, Math.round(bento.scrollLeft / w));
      dots.forEach(function (d, i) { d.classList.toggle('on', i === idx); });
    }
    bento.addEventListener('scroll', syncDots, { passive: true }); syncDots();
  }

  /* ---------- The Route: pinned, scroll-scrubbed map ---------- */
  var routeWrap = $('[data-route]');
  if (routeWrap) {
    var line = $('[data-route-line]'), dot = $('[data-route-dot]'), km = $('[data-route-km]');
    var stops = $$('.stop', routeWrap), rcards = $$('.route-card', routeWrap);
    var L = line.getTotalLength();
    line.style.strokeDasharray = L + ' ' + L;
    var stopAt = [0, .2, .42, .58, .74, 1];
    function setRoute(p) {
      line.style.strokeDashoffset = L * (1 - p);
      var pt = line.getPointAtLength(L * p);
      dot.setAttribute('cx', pt.x); dot.setAttribute('cy', pt.y);
      km.textContent = Math.round(p * 2140).toLocaleString('en');
      var idx = 0;
      stopAt.forEach(function (s, i) { if (p >= s - .03) idx = i; });
      stops.forEach(function (s, i) { s.classList.toggle('is-on', i <= idx); });
      rcards.forEach(function (c, i) { c.classList.toggle('is-active', i === idx); });
    }
    setRoute(0);
    if (gsap && ST && !reduce) {
      ST.create({ trigger: routeWrap, start: 'top top', end: '+=' + Math.round(window.innerHeight * 1.2), pin: true, scrub: .4, onUpdate: function (self) { setRoute(self.progress); } });
    } else {
      setRoute(1);
      rcards.forEach(function (c, i) { c.classList.toggle('is-active', i === 0); });
    }
  }

  /* ---------- Seasons chart ---------- */
  var MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  var DATA = [
    { w: 82, r: 70, title: 'Calving season', badge: 'Green season', text: 'Half a million wildebeest calves are born on the southern Serengeti plains, and the predators follow.', picks: ['The Great Migration', 'Big-Cat Country'] },
    { w: 88, r: 65, title: 'Predator peak', badge: 'Short dry spell', text: 'Warm, dry days and the busiest time for lion and cheetah hunts in Ndutu.', picks: ['The Great Migration', 'Kilimanjaro & Amboseli'] },
    { w: 60, r: 130, title: 'Long rains begin', badge: 'Quiet season', text: 'Lush and empty. Lodges are calm, prices drop and the birding is extraordinary.', picks: ['Murchison & the Nile', 'Spice Coast Finale'] },
    { w: 45, r: 190, title: 'Emerald months', badge: 'Low season', text: 'Heavy afternoon rain, dramatic skies and the lowest rates of the year.', picks: ['Gorilla Trek in Bwindi'] },
    { w: 50, r: 120, title: 'Rains easing', badge: 'Shoulder season', text: 'The herds gather in the central Serengeti for the rut, with very few vehicles around.', picks: ['Gorilla Trek in Bwindi', 'Murchison & the Nile'] },
    { w: 78, r: 30, title: 'Western corridor', badge: 'Dry season starts', text: 'The migration crosses the Grumeti River; the first crocodile crossings of the year.', picks: ['The Great Migration', 'Gorilla Trek in Bwindi'] },
    { w: 96, r: 18, title: 'River crossings', badge: 'Peak season', text: 'The Mara River crossings begin. Our mobile camp moves north to be first at the banks.', picks: ['The Great Migration', 'Big-Cat Country', 'Gorilla Trek in Bwindi'] },
    { w: 100, r: 22, title: 'The great spectacle', badge: 'Peak season', text: 'The highest concentration of wildlife on Earth. Book nine months ahead.', picks: ['The Great Migration', 'Big-Cat Country'] },
    { w: 92, r: 28, title: 'Golden plains', badge: 'Peak season', text: 'Crossings continue, grass turns gold and the light is a photographer\'s dream.', picks: ['Big-Cat Country', 'Kilimanjaro & Amboseli'] },
    { w: 84, r: 45, title: 'Return south', badge: 'Dry season', text: 'The herds turn back towards Tanzania; Kilimanjaro is clearest in the mornings.', picks: ['Kilimanjaro & Amboseli', 'Spice Coast Finale'] },
    { w: 62, r: 110, title: 'Short rains', badge: 'Shoulder season', text: 'Brief afternoon showers, fresh green grass and migratory birds arriving from Europe.', picks: ['Murchison & the Nile', 'Spice Coast Finale'] },
    { w: 74, r: 85, title: 'Festive bush', badge: 'Holiday season', text: 'Herds back on the southern plains, warm evenings and Christmas under canvas.', picks: ['The Great Migration', 'Spice Coast Finale'] }
  ];
  var chart = $('[data-chart]'), axis = $('[data-axis]'), picker = $('[data-months]'), info = $('[data-season-info]');
  if (chart) {
    var NS = 'http://www.w3.org/2000/svg', CW = 640, CH = 260, bw = CW / 12;
    var defs = '<defs><linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f3a35a"/><stop offset="1" stop-color="#e2622b"/></linearGradient></defs>';
    var grid = [0, .25, .5, .75].map(function (g) { return '<line class="grid" x1="0" x2="' + CW + '" y1="' + (20 + g * 220) + '" y2="' + (20 + g * 220) + '"/>'; }).join('');
    var bars = DATA.map(function (d, i) { var h = d.w * 2.2; return '<rect class="bar" rx="6" x="' + (i * bw + bw * .2) + '" width="' + (bw * .6) + '" y="' + (240 - h) + '" height="' + h + '" data-h="' + h + '"/>'; }).join('');
    var rainPts = DATA.map(function (d, i) { return [i * bw + bw / 2, 240 - d.r]; });
    var rainD = rainPts.map(function (p, i) { return (i ? 'L' : 'M') + p[0] + ' ' + p[1]; }).join(' ');
    chart.innerHTML = defs + grid + '<path class="rain-area" d="' + rainD + ' L' + rainPts[11][0] + ' 240 L' + rainPts[0][0] + ' 240 Z"/>' + bars + '<path class="rain" d="' + rainD + '"/>';
    axis.innerHTML = MONTHS.map(function (m) { return '<span>' + m.charAt(0) + '</span>'; }).join('');
    picker.innerHTML = MONTHS.map(function (m, i) { return '<button type="button" role="tab" aria-selected="false" data-m="' + i + '">' + m + '</button>'; }).join('');
    var barEls = $$('.bar', chart), btns = $$('button', picker);
    function show(i) {
      var d = DATA[i];
      btns.forEach(function (b, j) { b.setAttribute('aria-selected', String(j === i)); });
      barEls.forEach(function (b, j) { b.classList.toggle('on', j === i); });
      info.innerHTML = '<span class="badge">' + d.badge + '</span><h3>' + MONTHS[i] + ' · ' + d.title + '</h3><p>' + d.text + '</p>' +
        '<div class="season-meters"><div class="meter"><span>Wildlife</span><i><b style="width:' + d.w + '%"></b></i></div><div class="meter rain"><span>Rainfall</span><i><b style="width:' + Math.round(d.r / 2) + '%"></b></i></div></div>' +
        '<ul class="season-picks">' + d.picks.map(function (p) { return '<li>' + p + '</li>'; }).join('') + '</ul>';
    }
    btns.forEach(function (b) { b.addEventListener('click', function () { show(+b.dataset.m); }); });
    picker.addEventListener('keydown', function (e) {
      var cur = btns.findIndex(function (b) { return b.getAttribute('aria-selected') === 'true'; });
      if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') { var n = (cur + (e.key === 'ArrowRight' ? 1 : 11)) % 12; show(n); btns[n].focus(); }
    });
    show(new Date().getMonth());
    if (gsap && ST && !reduce) {
      var rain = $('.rain', chart), rl = rain.getTotalLength();
      rain.style.strokeDasharray = rl; rain.style.strokeDashoffset = rl;
      gsap.timeline({ scrollTrigger: { trigger: chart, start: 'top 80%' } })
        .from(barEls, { attr: { height: 0, y: 240 }, duration: 1.1, ease: 'expo.out', stagger: .04 })
        .to(rain, { strokeDashoffset: 0, duration: 1.6, ease: 'power2.inOut' }, .3)
        .from('.rain-area', { opacity: 0, duration: 1 }, .8);
    }
  }

  /* ---------- Trip builder ---------- */
  var form = $('[data-builder]');
  if (form) {
    var RATES = { classic: 340, photo: 520, luxe: 780 };
    var ADDONS = { gorilla: 800, balloon: 560, zanzibar: 890 };
    var pax = 2, shown = { pp: 0, total: 0 };
    var daysIn = $('#days', form), daysOut = $('[data-days-out]', form), paxOut = $('[data-pax-out]', form);
    var ppOut = $('[data-pp]', form), totalOut = $('[data-total]', form), itin = $('[data-itinerary]', form);
    var PLAN = [['Arrive Entebbe', 'Lakeside welcome dinner'], ['Murchison Falls', 'Top of the falls at sunset'], ['Murchison Falls', 'Nile launch cruise'], ['Bwindi', 'Fly to the forest edge'], ['Bwindi', 'Gorilla trek'], ['Serengeti', 'Fly into the plains'], ['Serengeti', 'Full day with the herds'], ['Serengeti', 'Dawn game drive'], ['Ngorongoro', 'Crater floor'], ['Amboseli', 'Elephants beneath Kilimanjaro'], ['Amboseli', 'Observation hill'], ['Masai Mara', 'Big-cat conservancy'], ['Masai Mara', 'Night drive'], ['Zanzibar', 'Stone Town walk'], ['Zanzibar', 'Dhow at sunset'], ['Departure', 'Fly home, slowly']];
    function money(v) { return '$' + Math.round(v).toLocaleString('en'); }
    function update() {
      var days = +daysIn.value;
      var style = $('input[name="style"]:checked', form).value;
      var extras = $$('input[name="addon"]:checked', form).reduce(function (s, i) { return s + ADDONS[i.value]; }, 0);
      var groupFactor = pax >= 4 ? .92 : pax === 1 ? 1.25 : 1;
      var pp = (RATES[style] * days) * groupFactor + extras;
      var total = pp * pax;
      daysOut.textContent = days; paxOut.textContent = pax;
      if (gsap && !reduce) gsap.to(shown, { pp: pp, total: total, duration: .6, ease: 'power3.out', onUpdate: function () { ppOut.textContent = money(shown.pp); totalOut.textContent = money(shown.total); } });
      else { ppOut.textContent = money(pp); totalOut.textContent = money(total); }
      var picks = [];
      for (var d = 0; d < days; d++) picks.push(PLAN[Math.min(PLAN.length - 1, Math.round(d * (PLAN.length - 1) / Math.max(1, days - 1)))]);
      itin.innerHTML = picks.map(function (p, i) { return '<li style="animation-delay:' + (i * .03) + 's"><b>DAY ' + String(i + 1).padStart(2, '0') + '</b><span><strong>' + p[0] + '</strong> · ' + p[1] + '</span></li>'; }).join('');
    }
    form.addEventListener('input', update);
    $$('[data-step]', form).forEach(function (b) { b.addEventListener('click', function () { pax = Math.max(1, Math.min(12, pax + +b.dataset.step)); update(); }); });
    update();
    $('[data-send-plan]').addEventListener('click', function () {
      var style = $('input[name="style"]:checked', form).parentNode.querySelector('span').firstChild.textContent.trim();
      var addons = $$('input[name="addon"]:checked', form).map(function (i) { return i.parentNode.querySelector('span').firstChild.textContent.trim(); });
      var target = $('[data-plan-target]');
      target.value = style + ' safari, ' + daysIn.value + ' days for ' + pax + ' traveller' + (pax === 1 ? '' : 's') + (addons.length ? ', with ' + addons.join(', ') : '') + '. Estimate ' + totalOut.textContent + '.';
      var paxField = $('#e-pax'); if (paxField && !paxField.value) paxField.value = pax;
    });
  }

  /* ---------- Enquiry form (concept site: nothing is sent) ---------- */
  var enquire = $('[data-enquire]');
  if (enquire) enquire.addEventListener('submit', function (e) {
    e.preventDefault();
    var status = $('[data-form-status]');
    if (!enquire.checkValidity()) { status.textContent = 'Please add your name and a valid email.'; return; }
    var name = enquire.name.value.trim().split(' ')[0];
    status.textContent = 'Thank you, ' + name + '. This is a concept website, so nothing was sent, but a real guide would reply within a day.';
    enquire.reset();
  });
})();

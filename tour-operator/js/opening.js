/* Oryx & Ember signature opening: a topographic map draws itself, a route traces across it with the
   coordinates ticking, a passport stamp slams down, and the stamp opens like an iris onto the hero.
   Plays once per visit; skipped for reduced motion. Fires "opening:done" on window when finished. */
(function () {
  'use strict';
  var root = document.documentElement;
  var overlay = document.querySelector('[data-opening]');
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var seen = false;
  try { seen = sessionStorage.getItem('oe-opening') === '1'; } catch (e) { /* storage blocked */ }

  function done() {
    root.classList.remove('opening-on');
    if (overlay) overlay.remove();
    window.__openingDone = true;
    window.dispatchEvent(new Event('opening:done'));
  }

  if (!overlay || reduce || seen || !window.gsap) { done(); return; }
  try { sessionStorage.setItem('oe-opening', '1'); } catch (e) { /* ignore */ }

  overlay.hidden = false;
  root.classList.add('opening-on');
  var gsap = window.gsap;
  var NS = 'http://www.w3.org/2000/svg';
  var W = window.innerWidth, H = window.innerHeight;
  var svg = overlay.querySelector('[data-opening-map]');
  svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H);

  function el(name, attrs, parent) {
    var n = document.createElementNS(NS, name);
    for (var k in attrs) n.setAttribute(k, attrs[k]);
    (parent || svg).appendChild(n);
    return n;
  }

  // Contour lines: noisy rings around three "peaks".
  var peaks = [[W * .2, H * .28, 9], [W * .78, H * .62, 8], [W * .55, H * .12, 6]];
  var contours = [];
  peaks.forEach(function (p, pi) {
    for (var k = 1; k <= p[2]; k++) {
      var base = Math.min(W, H) * .045 * k, d = '', ph = pi * 1.7 + k * .6;
      for (var i = 0; i <= 72; i++) {
        var t = i / 72 * Math.PI * 2;
        var r = base * (1 + .14 * Math.sin(3 * t + ph) + .07 * Math.sin(5 * t - ph * 1.3) + .03 * Math.sin(9 * t + k));
        d += (i ? 'L' : 'M') + (p[0] + Math.cos(t) * r * 1.25).toFixed(1) + ' ' + (p[1] + Math.sin(t) * r).toFixed(1);
      }
      contours.push(el('path', { d: d + 'Z', class: 'contour' + (k % 3 === 0 ? ' major' : '') }));
    }
  });

  // Route from the lower left through four waypoints to the centre, where the stamp lands.
  var cx = W / 2, cy = H / 2;
  var pts = H > W * 1.1
    ? [[W * .14, H * .9], [W * .78, H * .78], [W * .2, H * .64], [W * .8, H * .36], [W * .22, H * .2], [cx, H * .09]]
    : [[W * .06, H * .86], [W * .22, H * .6], [W * .4, H * .78], [W * .62, H * .3], [W * .84, H * .44], [cx, cy]];
  var d = 'M' + pts[0][0] + ' ' + pts[0][1];
  for (var i = 1; i < pts.length; i++) {
    var a = pts[i - 1], b = pts[i];
    d += ' C' + (a[0] + (b[0] - a[0]) * .5) + ' ' + a[1] + ' ' + (a[0] + (b[0] - a[0]) * .5) + ' ' + b[1] + ' ' + b[0] + ' ' + b[1];
  }
  var route = el('path', { d: d, class: 'op-route' });
  var len = route.getTotalLength();
  route.style.strokeDasharray = len + ' ' + len;
  route.style.strokeDashoffset = len;
  var names = [['KAMPALA', '00°19′N'], ['BWINDI', '01°03′S'], ['SERENGETI', '02°19′S'], ['KILIMANJARO', '03°04′S'], ['ZANZIBAR', '06°09′S']];
  var wps = names.map(function (n, idx) {
    var g = el('g', { class: 'op-wp', opacity: 0 });
    el('circle', { cx: pts[idx][0], cy: pts[idx][1], r: 5 }, g);
    var tx = el('text', { x: pts[idx][0] + 12, y: pts[idx][1] - 10 }, g);
    tx.textContent = n[0] + '  ' + n[1];
    if (pts[idx][0] > W * .55) { tx.setAttribute('x', pts[idx][0] - 12); tx.setAttribute('text-anchor', 'end'); }
    return g;
  });
  var dot = el('circle', { r: 6, class: 'op-dot', cx: pts[0][0], cy: pts[0][1] });

  var hudLat = overlay.querySelector('[data-op-lat]');
  var hudLng = overlay.querySelector('[data-op-lng]');
  var hudKm = overlay.querySelector('[data-op-km]');
  var stamp = overlay.querySelector('[data-stamp]');
  var dateEl = overlay.querySelector('[data-stamp-date]');
  var now = new Date();
  dateEl.textContent = 'ENTRY · ' + now.getDate() + ' ' + now.toLocaleString('en', { month: 'short' }).toUpperCase() + ' ' + now.getFullYear();

  function dms(v, pos, neg) {
    var a = Math.abs(v), deg = Math.floor(a), m = Math.floor((a - deg) * 60), s = Math.floor(((a - deg) * 60 - m) * 60);
    return String(deg).padStart(2, '0') + '°' + String(m).padStart(2, '0') + '′' + String(s).padStart(2, '0') + '″' + (v >= 0 ? pos : neg);
  }

  var tl = gsap.timeline({ defaults: { ease: 'power2.out' }, onComplete: finish });
  contours.forEach(function (c) { var L = c.getTotalLength(); c.style.strokeDasharray = L; c.style.strokeDashoffset = L; });
  tl.to(contours, { strokeDashoffset: 0, duration: 1.3, stagger: { each: .025, from: 'random' }, ease: 'power1.inOut' })
    .to(route.style, {
      strokeDashoffset: 0, duration: 1.9, ease: 'power1.inOut',
      onUpdate: function () {
        var p = 1 - parseFloat(route.style.strokeDashoffset) / len;
        var pt = route.getPointAtLength(len * p);
        dot.setAttribute('cx', pt.x); dot.setAttribute('cy', pt.y);
        hudLat.textContent = dms(.32 - p * 6.47, 'N', 'S');
        hudLng.textContent = dms(32.58 + p * 6.62, 'E', 'W');
        hudKm.textContent = 'KM ' + String(Math.round(p * 2140)).padStart(4, '0');
        wps.forEach(function (g, idx) { if (p >= idx / (pts.length - 1) - .02 && g.getAttribute('opacity') === '0') gsap.to(g, { attr: { opacity: 1 }, duration: .4 }); });
      }
    }, '-=.7')
    .to(stamp, { opacity: 1, duration: .01 })
    .fromTo(stamp, { scale: 2.6, rotate: -28, filter: 'blur(6px)' }, { scale: 1, rotate: -9, filter: 'blur(0px)', duration: .38, ease: 'power4.in' }, '<')
    .to(svg, { x: 6, yoyo: true, repeat: 5, duration: .04, ease: 'none' })
    .to(svg, { opacity: .25, duration: .5 }, '+=.35')
    .add(iris, '<');
  tl.timeScale(2.3); // keep the whole opening around 3 seconds

  function iris() {
    var hole = document.createElement('div');
    hole.className = 'opening-iris';
    overlay.appendChild(hole);
    overlay.classList.add('is-iris');
    gsap.timeline()
      .to(stamp, { scale: 1.6, opacity: 0, duration: .7, ease: 'power2.in' })
      .to(overlay.querySelector('.opening-hud'), { opacity: 0, duration: .3 }, '<')
      .to(svg, { opacity: 0, duration: .5 }, '<')
      .fromTo(hole, { scale: 1 }, { scale: Math.hypot(W, H) / 4, duration: 1.1, ease: 'expo.inOut' }, '-=.45')
      .timeScale(1.9);
  }

  function finish() { gsap.delayedCall(.55, done); }

  function skip() { tl.kill(); gsap.to(overlay, { opacity: 0, duration: .4, onComplete: done }); }
  overlay.querySelector('[data-skip]').addEventListener('click', skip);
  document.addEventListener('keydown', function onKey(e) { if (e.key === 'Escape') { document.removeEventListener('keydown', onKey); skip(); } });
})();

/* Veyra Health signature opening: one slow breath (rings expand on "breathe in", settle on "and out"),
   the breath condenses into the four-petal plus, and the plus opens the page by sweeping the four
   quarters of the screen away. Plays once per visit; skipped for reduced motion. */
(function () {
  'use strict';
  var root = document.documentElement;
  var overlay = document.querySelector('[data-opening]');
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var seen = false;
  try { seen = sessionStorage.getItem('vh-opening') === '1'; } catch (e) { /* storage blocked */ }

  function done() {
    root.classList.remove('opening-on');
    if (overlay) overlay.remove();
    window.__openingDone = true;
    window.dispatchEvent(new Event('opening:done'));
  }
  if (!overlay || reduce || seen || !window.gsap) { done(); return; }
  try { sessionStorage.setItem('vh-opening', '1'); } catch (e) { /* ignore */ }

  overlay.hidden = false;
  root.classList.add('opening-on');
  var gsap = window.gsap;
  var q = function (s) { return overlay.querySelector(s); };
  var rings = overlay.querySelectorAll('.op-rings i');
  var core = q('.op-rings b');
  var petals = overlay.querySelectorAll('.op-mark rect');
  var inTxt = q('.op-breath .in'), outTxt = q('.op-breath .out');
  var word = q('.op-word');

  gsap.set(rings, { scale: .6, opacity: 0 });
  gsap.set(core, { scale: .4 });
  gsap.set(petals, { scale: 0, rotate: 90, opacity: 1 });

  var tl = gsap.timeline({ onComplete: done });
  tl.to(rings, { opacity: 1, scale: 1, duration: .6, stagger: .08, ease: 'power2.out' })
    // Breathe in
    .to(inTxt, { opacity: 1, y: -6, duration: .6, ease: 'power2.out' }, '<.1')
    .to(rings, { scale: function (i) { return 1.9 - i * .25; }, duration: 1.5, ease: 'sine.inOut', stagger: .06 }, '<')
    .to(core, { scale: 1.4, duration: 1.5, ease: 'sine.inOut' }, '<')
    // ...and out
    .to(inTxt, { opacity: 0, y: -16, duration: .4 }, '-=.2')
    .to(outTxt, { opacity: 1, y: -6, duration: .5 }, '<.15')
    .to(rings, { scale: .35, opacity: 0, duration: 1.2, ease: 'sine.inOut', stagger: .05 }, '<')
    .to(core, { scale: 0, duration: 1, ease: 'sine.inOut' }, '<.2')
    .to(outTxt, { opacity: 0, duration: .3 }, '-=.3')
    // The breath condenses into the plus
    .to(petals, { scale: 1, rotate: 0, duration: .8, ease: 'back.out(1.8)', stagger: .09 }, '-=.2')
    .fromTo(word, { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: .6, ease: 'power3.out' }, '-=.35')
    .addLabel('open', '+=.35')
    // The plus opens the page: petals fly out along their arms, quarters slide away
    .to(word, { opacity: 0, y: -10, duration: .35 }, 'open')
    .to(petals[0], { y: -70, scale: 3, opacity: 0, duration: .9, ease: 'expo.in' }, 'open')
    .to(petals[1], { x: 70, scale: 3, opacity: 0, duration: .9, ease: 'expo.in' }, 'open')
    .to(petals[2], { y: 70, scale: 3, opacity: 0, duration: .9, ease: 'expo.in' }, 'open')
    .to(petals[3], { x: -70, scale: 3, opacity: 0, duration: .9, ease: 'expo.in' }, 'open')
    .to(q('.q1'), { xPercent: -102, yPercent: -102, duration: 1.15, ease: 'expo.inOut' }, 'open+=.35')
    .to(q('.q2'), { xPercent: 102, yPercent: -102, duration: 1.15, ease: 'expo.inOut' }, 'open+=.35')
    .to(q('.q3'), { xPercent: 102, yPercent: 102, duration: 1.15, ease: 'expo.inOut' }, 'open+=.35')
    .to(q('.q4'), { xPercent: -102, yPercent: 102, duration: 1.15, ease: 'expo.inOut' }, 'open+=.35')
    .call(function () { window.dispatchEvent(new Event('opening:reveal')); }, null, 'open+=.6');

  function skip() { tl.kill(); gsap.to(overlay, { opacity: 0, duration: .35, onComplete: done }); }
  q('[data-skip]').addEventListener('click', skip);
  document.addEventListener('keydown', function onKey(e) { if (e.key === 'Escape') { document.removeEventListener('keydown', onKey); skip(); } });
})();

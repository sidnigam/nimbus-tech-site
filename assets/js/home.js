/* Nimbus homepage — small, dependency-free enhancements.
   Everything here is progressive: the page is fully readable without it. */
(function () {
  'use strict';
  var doc = document;
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Footer year
  var yr = doc.getElementById('year');
  if (yr) yr.textContent = new Date().getFullYear();

  // ---------- Header: scrolled state + mobile menu ----------
  var hdr = doc.getElementById('hdr');
  var menuBtn = doc.getElementById('menu-btn');
  function onScroll() { hdr.classList.toggle('scrolled', window.scrollY > 24); }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  function setMenu(open) {
    doc.body.classList.toggle('menu-open', open);
    menuBtn.setAttribute('aria-expanded', String(open));
    doc.body.style.overflow = open ? 'hidden' : '';
  }
  menuBtn.addEventListener('click', function () { setMenu(!doc.body.classList.contains('menu-open')); });
  doc.querySelectorAll('#nav a').forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });
  doc.addEventListener('keydown', function (e) { if (e.key === 'Escape') setMenu(false); });

  // ---------- Scroll progress fallback (browsers without scroll-driven animations) ----------
  var bar = doc.querySelector('.progress');
  if (bar && !(window.CSS && CSS.supports && CSS.supports('animation-timeline: scroll()'))) {
    var tick = function () {
      var max = doc.documentElement.scrollHeight - window.innerHeight;
      bar.style.transform = 'scaleX(' + (max > 0 ? Math.min(1, window.scrollY / max) : 0) + ')';
    };
    window.addEventListener('scroll', tick, { passive: true });
    tick();
  }

  // ---------- Reveal on scroll (once) ----------
  var revealEls = doc.querySelectorAll('.rv');
  if ('IntersectionObserver' in window && !reduce) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('in'); });
  }

  // ---------- Explorer tabs ----------
  var tabs = Array.prototype.slice.call(doc.querySelectorAll('#tabs .tab'));
  function selectTab(tab, focus) {
    tabs.forEach(function (t) {
      var on = t === tab;
      t.setAttribute('aria-selected', String(on));
      t.tabIndex = on ? 0 : -1;
      var p = doc.getElementById(t.getAttribute('aria-controls'));
      if (p) {
        p.hidden = !on;
        if (on && !reduce) { p.classList.remove('swap'); void p.offsetWidth; p.classList.add('swap'); }
      }
    });
    if (focus) tab.focus();
  }
  tabs.forEach(function (tab, i) {
    tab.addEventListener('click', function () { selectTab(tab, false); });
    tab.addEventListener('keydown', function (e) {
      var n = null;
      if (e.key === 'ArrowRight') n = tabs[(i + 1) % tabs.length];
      else if (e.key === 'ArrowLeft') n = tabs[(i - 1 + tabs.length) % tabs.length];
      else if (e.key === 'Home') n = tabs[0];
      else if (e.key === 'End') n = tabs[tabs.length - 1];
      if (n) { e.preventDefault(); selectTab(n, true); }
    });
  });

  // ---------- Contact: "talking about" context from any [data-pick] link ----------
  var ctx = doc.getElementById('ctx');
  var ctxVal = doc.getElementById('ctx-val');
  var bizType = doc.getElementById('business-type');
  function setContext(text) {
    bizType.value = text || '';
    ctxVal.textContent = text || '';
    ctx.hidden = !text;
  }
  doc.querySelectorAll('[data-pick]').forEach(function (a) {
    a.addEventListener('click', function () { setContext(a.getAttribute('data-pick').replace(/&amp;/g, '&')); });
  });
  doc.getElementById('ctx-clear').addEventListener('click', function () { setContext(''); });

  // ---------- Contact form ----------
  var form = doc.getElementById('lead-form');
  var fields = doc.getElementById('form-fields');
  var ok = doc.getElementById('form-ok');
  var fail = doc.getElementById('form-fail');
  var submit = doc.getElementById('submit');
  var EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  function flag(id, bad) { doc.getElementById(id).classList.toggle('invalid', bad); }
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var name = form.elements.name, email = form.elements.email;
    var badName = !name.value.trim();
    var badEmail = !EMAIL.test(email.value.trim());
    flag('f-name', badName); flag('f-email', badEmail);
    if (badName || badEmail) { (badName ? name : email).focus(); return; }

    fail.classList.remove('show');
    submit.disabled = true;
    submit.firstChild.textContent = 'Sending… ';

    var data = new FormData(form);
    // Formspree: join multi-select interests into one readable value
    var picks = data.getAll('interest');
    if (picks.length) { data.delete('interest'); data.set('interest', picks.join(', ')); }

    fetch(form.action, { method: 'POST', body: data, headers: { Accept: 'application/json' } })
      .then(function (r) {
        if (!r.ok) throw new Error('bad status');
        fields.style.display = 'none';
        ok.classList.add('show');
        ok.focus();
      })
      .catch(function () {
        fail.classList.add('show');
        submit.disabled = false;
        submit.firstChild.textContent = 'Book my free call ';
      });
  });
  ['name', 'email'].forEach(function (n) {
    form.elements[n].addEventListener('input', function () { flag('f-' + n, false); });
  });
})();

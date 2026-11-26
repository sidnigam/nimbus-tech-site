/* Shared behaviour for the local small-business landing pages (boston-smb.html, lowell.html). */
AOS.init({ duration: 600, once: true, offset: 60 });

// ── Mobile hamburger menu ──
var hamburger   = document.getElementById('smb-hamburger');
var mobileMenu  = document.getElementById('smb-mobile-menu');
var hamburgerIcon = document.getElementById('smb-hamburger-icon');

if (hamburger && mobileMenu) {
  hamburger.addEventListener('click', function () {
    var isOpen = mobileMenu.classList.toggle('open');
    hamburger.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    hamburgerIcon.className = isOpen ? 'bi bi-x' : 'bi bi-list';
  });
  mobileMenu.querySelectorAll('a').forEach(function (link) {
    link.addEventListener('click', function () {
      mobileMenu.classList.remove('open');
      hamburger.setAttribute('aria-expanded', 'false');
      hamburgerIcon.className = 'bi bi-list';
    });
  });
}

// ── Helpers ──
var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function setFieldError(inputEl, errEl, show) {
  if (show) {
    inputEl.classList.add('input-invalid');
    errEl.classList.add('visible');
  } else {
    inputEl.classList.remove('input-invalid');
    errEl.classList.remove('visible');
  }
}

// ── Checklist scorer ──
function scoreChecklist() {
  var checks = document.querySelectorAll('.cl-check');
  var count = 0;
  checks.forEach(function(c) { if (c.checked) count++; });
  var result  = document.getElementById('checklist-result');
  var scoreEl = document.getElementById('checklist-score');
  var msgEl   = document.getElementById('checklist-message');
  var ctaEl   = document.getElementById('checklist-cta');
  result.style.display = 'block';
  result.className = 'checklist-result';
  if (count <= 2) {
    result.classList.add('low');
    scoreEl.textContent = count + '/8 — You\'re in good shape';
    msgEl.textContent = 'Your business has a solid foundation. A quick audit could still surface easy wins — a free call costs nothing.';
  } else if (count <= 5) {
    result.classList.add('mid');
    scoreEl.textContent = count + '/8 — Real opportunity here';
    msgEl.textContent = 'You\'re losing hours and money to manual work that AI can handle today. Let\'s map out a plan.';
  } else {
    result.classList.add('high');
    scoreEl.textContent = count + '/8 — AI could transform your business';
    msgEl.textContent = 'You\'re leaving significant time and money on the table. Most of this is fixable quickly. Let\'s talk.';
  }
  ctaEl.innerHTML = '<a href="#contact">→ Book your free strategy call</a>';
  result.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// ── Main contact form validation + submit ──
var smbForm   = document.getElementById('smb-contact-form');
var smbSubmit = document.getElementById('smb-submit-btn');
var smbMsg    = document.getElementById('smb-form-msg');

function validateSmbForm() {
  var nameEl  = document.getElementById('smb-name');
  var emailEl = document.getElementById('smb-email');
  var msgEl2  = document.getElementById('smb-message');
  var valid = true;

  setFieldError(nameEl,  document.getElementById('smb-name-err'),    !nameEl.value.trim());
  setFieldError(emailEl, document.getElementById('smb-email-err'),   !EMAIL_RE.test(emailEl.value.trim()));
  setFieldError(msgEl2,  document.getElementById('smb-message-err'), !msgEl2.value.trim());

  if (!nameEl.value.trim() || !EMAIL_RE.test(emailEl.value.trim()) || !msgEl2.value.trim()) valid = false;
  return valid;
}

if (smbForm) {
  // Live validation on blur
  ['smb-name','smb-email','smb-message'].forEach(function(id) {
    var el = document.getElementById(id);
    if (!el) return;
    el.addEventListener('blur', function() {
      if (id === 'smb-email') {
        setFieldError(el, document.getElementById('smb-email-err'), !EMAIL_RE.test(el.value.trim()));
      } else {
        var errId = id === 'smb-name' ? 'smb-name-err' : 'smb-message-err';
        setFieldError(el, document.getElementById(errId), !el.value.trim());
      }
    });
    el.addEventListener('input', function() {
      if (el.classList.contains('input-invalid')) {
        if (id === 'smb-email') {
          setFieldError(el, document.getElementById('smb-email-err'), !EMAIL_RE.test(el.value.trim()));
        } else {
          var errId = id === 'smb-name' ? 'smb-name-err' : 'smb-message-err';
          setFieldError(el, document.getElementById(errId), !el.value.trim());
        }
      }
    });
  });

  smbForm.addEventListener('submit', function(e) {
    e.preventDefault();
    if (!validateSmbForm()) return;

    smbSubmit.disabled = true;
    smbMsg.className = 'form-msg sending';
    smbMsg.textContent = 'Sending your message…';

    var data = new FormData(smbForm);
    fetch('https://formspree.io/f/xjvnbjvn', {
      method: 'POST', body: data,
      headers: { 'Accept': 'application/json' }
    }).then(function(res) {
      if (res.ok) {
        document.getElementById('smb-form-body').style.display = 'none';
        document.getElementById('smb-form-success').style.display = 'block';
      } else {
        throw new Error('failed');
      }
    }).catch(function() {
      smbSubmit.disabled = false;
      smbMsg.className = 'form-msg error';
      smbMsg.textContent = 'Something went wrong. Please try again or email us directly.';
    });
  });
}

// ── Cloud burst ──
var PARTICLE_COLORS = ['#0EA5E9','#38BDF8','#BAE6FD','#F97316','#10b981'];
var poppedCount = 0, UNLOCK_AT = 5, modalShown = false;
var DRIFT_ANIMS  = ['cloudDrift1','cloudDrift2','cloudDrift3'];
var DRIFT_SPEEDS = [4.1,4.8,5.5,3.9,5.2,4.4,4.7,5.0,3.7,4.3];

function spawnParticles(cx, cy) {
  for (var i = 0; i < 9; i++) {
    var p = document.createElement('div');
    p.className = 'cloud-particle';
    var angle = (i / 9) * Math.PI * 2;
    var dist  = 38 + Math.random() * 28;
    p.style.left = cx + 'px'; p.style.top = cy + 'px';
    p.style.background = PARTICLE_COLORS[i % PARTICLE_COLORS.length];
    p.style.setProperty('--tx', (Math.cos(angle) * dist) + 'px');
    p.style.setProperty('--ty', (Math.sin(angle) * dist) + 'px');
    document.body.appendChild(p);
    setTimeout(function() { p.remove(); }, 750);
  }
  var ripple = document.createElement('div');
  ripple.className = 'cloud-ripple';
  ripple.style.left = cx + 'px'; ripple.style.top = cy + 'px';
  document.body.appendChild(ripple);
  setTimeout(function() { ripple.remove(); }, 700);
}

function attachPopHandler(cloud) {
  cloud.addEventListener('click', function() {
    if (cloud.classList.contains('popped')) return;
    cloud.classList.add('popped');
    var rect = cloud.getBoundingClientRect();
    spawnParticles(rect.left + rect.width / 2, rect.top + rect.height / 2);
    setTimeout(function() { cloud.remove(); }, 480);
    poppedCount++;
    if (poppedCount >= UNLOCK_AT && !modalShown) {
      modalShown = true;
      setTimeout(openCloudModal, 550);
    }
  });
}

window.addEventListener('load', function() {
  var field = document.getElementById('clouds-field');
  if (!field) return;
  var pageH = document.body.scrollHeight;
  field.style.height = pageH + 'px';
  var TOTAL = 22;
  var zones = [
    [2, 10,  200, pageH * 0.25],
    [2, 10,  pageH * 0.25, pageH * 0.55],
    [2, 10,  pageH * 0.55, pageH * 0.9],
    [88, 96, 200, pageH * 0.25],
    [88, 96, pageH * 0.25, pageH * 0.55],
    [88, 96, pageH * 0.55, pageH * 0.9],
    [15, 82, pageH * 0.12, pageH * 0.22],
    [15, 82, pageH * 0.32, pageH * 0.42],
    [15, 82, pageH * 0.52, pageH * 0.62],
    [15, 82, pageH * 0.72, pageH * 0.85],
  ];
  for (var i = 0; i < TOTAL; i++) {
    var zone  = zones[i % zones.length];
    var xPct  = zone[0] + Math.random() * (zone[1] - zone[0]);
    var yPx   = zone[2] + Math.random() * (zone[3] - zone[2]);
    var cloud = document.createElement('div');
    cloud.className = 'cloud-target';
    var scale = 0.55 + Math.random() * 0.65;
    var opacity = 0.35 + Math.random() * 0.35;
    cloud.style.left = xPct + '%';
    cloud.style.top  = yPx  + 'px';
    cloud.style.transform = 'scale(' + scale + ')';
    cloud.style.opacity = opacity;
    cloud.style.animation = DRIFT_ANIMS[i % 3] + ' ' + DRIFT_SPEEDS[i % 10] + 's ease-in-out ' + (Math.random() * 2).toFixed(2) + 's infinite';
    field.appendChild(cloud);
    attachPopHandler(cloud);
  }
});

// Cloud modal
var modal    = document.getElementById('cloud-modal');
var modalBody= document.getElementById('cloud-modal-body');
var modalSucc= document.getElementById('cloud-modal-success');
var closeBtn = document.getElementById('cloud-modal-close');

function openCloudModal() {
  if (!modal) return;
  modal.setAttribute('aria-hidden', 'false');
  modal.classList.add('open');
  document.body.style.overflow = 'hidden';
}
function closeCloudModal() {
  modal.classList.remove('open');
  modal.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
}
if (closeBtn) closeBtn.addEventListener('click', closeCloudModal);
if (modal) {
  modal.addEventListener('click', function(e) { if (e.target === modal) closeCloudModal(); });
  document.addEventListener('keydown', function(e) { if (e.key === 'Escape' && modal.classList.contains('open')) closeCloudModal(); });
}

// Cloud modal form validation + submit
var cmfForm   = document.getElementById('cloud-unlock-form');
var cmfSubmit = document.getElementById('cmf-submit-btn');
var cmfMsg    = document.getElementById('cmf-msg');

function validateCmf() {
  var nameEl  = document.getElementById('cu-name');
  var emailEl = document.getElementById('cu-email');
  var valid = true;
  setFieldError(nameEl,  document.getElementById('cu-name-err'),  !nameEl.value.trim());
  setFieldError(emailEl, document.getElementById('cu-email-err'), !EMAIL_RE.test(emailEl.value.trim()));
  if (!nameEl.value.trim() || !EMAIL_RE.test(emailEl.value.trim())) valid = false;
  return valid;
}

if (cmfForm) {
  document.getElementById('cu-email').addEventListener('blur', function() {
    setFieldError(this, document.getElementById('cu-email-err'), !EMAIL_RE.test(this.value.trim()));
  });
  document.getElementById('cu-name').addEventListener('blur', function() {
    setFieldError(this, document.getElementById('cu-name-err'), !this.value.trim());
  });

  cmfForm.addEventListener('submit', function(e) {
    e.preventDefault();
    if (!validateCmf()) return;
    cmfSubmit.disabled = true;
    var data = new FormData(cmfForm);
    fetch('https://formspree.io/f/xjvnbjvn', {
      method: 'POST', body: data,
      headers: { 'Accept': 'application/json' }
    }).then(function(res) {
      if (modalBody) modalBody.hidden = true;
      if (modalSucc) modalSucc.hidden = false;
    }).catch(function() {
      cmfSubmit.disabled = false;
      cmfMsg.className = 'cmf-form-msg error';
      cmfMsg.textContent = 'Something went wrong. Please try again.';
    });
  });
}

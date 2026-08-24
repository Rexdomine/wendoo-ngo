/** Accessible progressive enhancement — addEventListener only; no inline onclick. */
(function () {
  'use strict';

  // Mark JS enabled
  document.documentElement.classList.add('js');

  // Reduced motion hook
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    document.documentElement.classList.add('reduced-motion');
  }
  window.matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', function (e) {
    if (e.matches) document.documentElement.classList.add('reduced-motion');
    else document.documentElement.classList.remove('reduced-motion');
  });

  // Progressive reveal via IntersectionObserver (fail-open: content fully visible without JS)
  try {
    const revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('ready');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

    const revealEls = document.querySelectorAll('[data-reveal]');
    if (revealEls.length) {
      revealEls.forEach(function (el) { revealObserver.observe(el); });
      document.documentElement.classList.add('reveal-ready');
    } else {
      document.documentElement.classList.add('reveal-ready');
    }
  } catch (e) {
    // Observer construction failure: remain fully visible (fail-open)
    document.documentElement.classList.add('reveal-ready');
  }

  // Mobile nav
  const navToggle = document.querySelector('.nav-toggle');
  const primaryNav = document.getElementById('primary-nav');
  const mobileNav = window.matchMedia('(max-width: 768px)');
  let navPreviousFocus = null;

  function syncNav() {
    if (!primaryNav) return;
    if (mobileNav.matches) {
      if (!primaryNav.classList.contains('open')) primaryNav.hidden = true;
    } else {
      primaryNav.hidden = false;
      primaryNav.classList.remove('open');
      if (navToggle) navToggle.setAttribute('aria-expanded', 'false');
    }
  }

  function openNav() {
    if (!primaryNav) return;
    navPreviousFocus = document.activeElement;
    primaryNav.hidden = false;
    primaryNav.classList.add('open');
    if (navToggle) navToggle.setAttribute('aria-expanded', 'true');
    var first = primaryNav.querySelector('a');
    if (first) setTimeout(function () { first.focus(); }, 10);
  }

  function closeNav() {
    if (!primaryNav) return;
    primaryNav.hidden = mobileNav.matches;
    primaryNav.classList.remove('open');
    if (navToggle) navToggle.setAttribute('aria-expanded', 'false');
    if (navPreviousFocus) { navPreviousFocus.focus(); navPreviousFocus = null; }
    else if (navToggle) navToggle.focus();
  }

  if (navToggle && primaryNav) {
    syncNav();
    mobileNav.addEventListener('change', syncNav);
    navToggle.addEventListener('click', function () {
      var open = primaryNav.classList.contains('open');
      open ? closeNav() : openNav();
    });
    primaryNav.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () { closeNav(); });
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && primaryNav.classList.contains('open')) {
        e.preventDefault();
        closeNav();
      }
    });
  }

  // Donation native dialog
  const donateDialog = document.getElementById('donate-dialog');
  let donateOpener = null;

  document.querySelectorAll('[data-action="open-donate"]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      if (!donateDialog) return;
      donateOpener = document.activeElement;
      donateDialog.showModal();
      var focusable = donateDialog.querySelector('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
      if (focusable) setTimeout(function () { focusable.focus(); }, 10);
    });
  });

  if (donateDialog) {
    donateDialog.addEventListener('click', function (e) {
      if (!e.target.closest('.dialog-panel')) {
        donateDialog.close();
        if (donateOpener) { donateOpener.focus(); donateOpener = null; }
      }
    });
    donateDialog.addEventListener('close', function () {
      if (donateOpener) { donateOpener.focus(); donateOpener = null; }
    });
  }

  // Video poster-first click-to-play (privacy-enhanced, idempotent, no audible autoplay)
  document.querySelectorAll('[data-action="load-video"]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var wrapper = document.getElementById('video-wrapper');
      var frame = document.getElementById('video-frame');
      if (!frame) return;
      if (frame.innerHTML.trim().length > 0) {
        var iframe = frame.querySelector('iframe');
        if (iframe) { iframe.focus(); }
        if (btn) { btn.hidden = true; btn.setAttribute('tabindex', '-1'); btn.setAttribute('aria-hidden', 'true'); }
        return;
      }
      if (btn) {
        btn.hidden = true;
        btn.setAttribute('tabindex', '-1');
        btn.setAttribute('aria-hidden', 'true');
      }
      frame.hidden = false;
      var iframe = document.createElement('iframe');
      iframe.setAttribute('src', 'https://www.youtube-nocookie.com/embed/l-pzjlSyjA0?autoplay=1&mute=1&rel=0');
      iframe.setAttribute('title', 'Wendoo School Breakfast NGO Launch');
      iframe.setAttribute('allow', 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture');
      iframe.setAttribute('allowfullscreen', '');
      iframe.style.width = '100%';
      iframe.style.aspectRatio = '16/9';
      iframe.style.border = '0';
      iframe.setAttribute('loading', 'lazy');
      frame.innerHTML = '';
      frame.appendChild(iframe);
      setTimeout(function () { iframe.focus(); }, 50);
    });
  });
})();

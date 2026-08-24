/** Accessible progressive enhancement — addEventListener only */
(function () {
  'use strict';

  document.documentElement.classList.add('js');

  // Reduced motion
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    document.documentElement.classList.add('reduced-motion');
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
      navToggle && navToggle.setAttribute('aria-expanded', 'false');
    }
  }

  function openNav() {
    if (!primaryNav) return;
    navPreviousFocus = document.activeElement;
    primaryNav.hidden = false;
    primaryNav.classList.add('open');
    navToggle && navToggle.setAttribute('aria-expanded', 'true');
    // Focus first link
    const first = primaryNav.querySelector('a');
    if (first) setTimeout(function () { first.focus(); }, 10);
  }
  function closeNav() {
    if (!primaryNav) return;
    primaryNav.hidden = mobileNav.matches;
    primaryNav.classList.remove('open');
    navToggle && navToggle.setAttribute('aria-expanded', 'false');
    if (navPreviousFocus) { navPreviousFocus.focus(); navPreviousFocus = null; }
    else if (navToggle) navToggle.focus();
  }
  if (navToggle && primaryNav) {
    syncNav();
    mobileNav.addEventListener('change', syncNav);
    navToggle.addEventListener('click', function () {
      const open = primaryNav.classList.contains('open');
      open ? closeNav() : openNav();
    });
    // Anchor click closes nav
    primaryNav.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () { closeNav(); });
    });
    // Escape closes
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
      // Focus first focusable inside dialog
      const focusable = donateDialog.querySelector('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
      if (focusable) setTimeout(function () { focusable.focus(); }, 10);
    });
  });

  if (donateDialog) {
    // Backdrop click closes (click outside .dialog-panel)
    donateDialog.addEventListener('click', function (e) {
      if (!e.target.closest('.dialog-panel')) {
        donateDialog.close();
        if (donateOpener) { donateOpener.focus(); donateOpener = null; }
      }
    });
    // Escape handled natively by dialog, but restore focus after close
    donateDialog.addEventListener('close', function () {
      if (donateOpener) { donateOpener.focus(); donateOpener = null; }
    });
  }

  // Video poster-first click-to-play (privacy-enhanced, idempotent, no audible autoplay)
  document.querySelectorAll('[data-action="load-video"]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      const wrapper = document.getElementById('video-wrapper');
      const frame = document.getElementById('video-frame');
      if (!frame) return;
      // Idempotent
      if (frame.innerHTML.trim().length > 0) {
        // Already loaded; focus iframe
        const iframe = frame.querySelector('iframe');
        if (iframe) { iframe.focus(); }
        // Hide poster button from focus
        if (btn) { btn.hidden = true; btn.setAttribute('tabindex', '-1'); btn.setAttribute('aria-hidden', 'true'); }
        return;
      }
      if (btn) {
        btn.hidden = true;
        btn.setAttribute('tabindex', '-1');
        btn.setAttribute('aria-hidden', 'true');
      }
      frame.hidden = false;
      const iframe = document.createElement('iframe');
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
      // Focus iframe after insert
      setTimeout(function () { iframe.focus(); }, 50);
    });
  });
})();

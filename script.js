/* Wendoo homepage — accessible production behavior */
(function () {
  'use strict';

  // Mobile menu
  const btnMenu = document.getElementById('mobile-menu-btn');
  const nav = document.getElementById('primary-nav');
  function updateMenuState(open) {
    btnMenu.setAttribute('aria-expanded', String(open));
    btnMenu.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
    nav.setAttribute('data-open', String(open));
    if (open) {
      nav.removeAttribute('inert');
    } else {
      nav.setAttribute('inert', '');
    }
  }
  if (btnMenu && nav) {
    btnMenu.addEventListener('click', () => {
      const open = btnMenu.getAttribute('aria-expanded') === 'true';
      updateMenuState(!open);
    });
    // Close on Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && btnMenu.getAttribute('aria-expanded') === 'true') {
        updateMenuState(false);
        btnMenu.focus();
      }
    });
    // Close on nav selection (link click)
    nav.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => { updateMenuState(false); btnMenu.focus(); });
    });
    updateMenuState(false); // initial hidden state with inert
  }

  // Donate unavailable dialog (native <dialog>)
  const btnDonate = document.getElementById('btn-donate');
  const btnDonateFinal = document.getElementById('btn-donate-final');
  const donateDialog = document.getElementById('donate-dialog');
  function openDonateDialog(e) {
    if (e) e.preventDefault();
    if (donateDialog) {
      donateDialog.showModal();
      const closeBtn = donateDialog.querySelector('.dialog-close');
      if (closeBtn) closeBtn.focus();
    }
  }
  function closeDonateDialog() {
    if (donateDialog) {
      donateDialog.close();
      // Focus restoration to exact trigger
      if (document.activeElement && document.activeElement.closest('#donate-dialog')) {
        // Already handled by dialog close; restore explicitly if needed
      }
    }
  }
  function restoreDonateFocus(trigger) {
    if (trigger) trigger.focus();
  }
  if (btnDonate) {
    btnDonate.addEventListener('click', (e) => { openDonateDialog(e); });
  }
  if (btnDonateFinal) {
    btnDonateFinal.addEventListener('click', (e) => { openDonateDialog(e); });
  }
  if (donateDialog) {
    // Form submit closes dialog via method="dialog"
    donateDialog.addEventListener('close', () => {
      if (btnDonate === document.activeElement || btnDonateFinal === document.activeElement) return;
      // Restore to whichever trigger was last clicked; simple: try final then header
      if (document.activeElement && document.activeElement.closest('#donate-dialog')) {
        // If focus was inside dialog, restore to header trigger by default; but for final trigger we can track
        // For simplicity restore to heading button if final not focused; but let's track last trigger via a variable
      }
    });
    const closeBtn = donateDialog.querySelector('.dialog-close');
    if (closeBtn) closeBtn.addEventListener('click', (e) => { e.preventDefault(); donateDialog.close(); });
    donateDialog.addEventListener('keydown', (e) => { if (e.key === 'Escape') { e.preventDefault(); donateDialog.close(); } });
  }
  // Track last donate trigger for focus restoration
  let lastDonateTrigger = null;
  if (btnDonate) btnDonate.addEventListener('click', () => { lastDonateTrigger = btnDonate; });
  if (btnDonateFinal) btnDonateFinal.addEventListener('click', () => { lastDonateTrigger = btnDonateFinal; });
  if (donateDialog) donateDialog.addEventListener('close', () => { if (lastDonateTrigger) { lastDonateTrigger.focus(); lastDonateTrigger = null; } });

  // Privacy-enhanced click-to-load video (native <dialog>)
  const btnPlay = document.getElementById('btn-play');
  const filmDialog = document.getElementById('film-dialog');
  let filmIframe = null;
  function openFilmDialog(e) {
    if (e) e.preventDefault();
    if (filmDialog) {
      filmDialog.showModal();
      const wrapper = filmDialog.querySelector('.video-wrapper');
      if (wrapper && !filmIframe) {
        filmIframe = document.createElement('iframe');
        filmIframe.title = 'Wendoo School Breakfast NGO Launch — official YouTube';
        filmIframe.src = 'https://www.youtube-nocookie.com/embed/l-pzjlSyjA0?rel=0';
        filmIframe.setAttribute('allow', 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture');
        filmIframe.setAttribute('allowfullscreen', '');
        filmIframe.setAttribute('referrerpolicy', 'strict-origin-when-cross-origin');
        filmIframe.setAttribute('loading', 'lazy');
        wrapper.appendChild(filmIframe);
      }
      const closeBtn = filmDialog.querySelector('.dialog-close');
      if (closeBtn) closeBtn.focus();
    }
  }
  function closeFilmDialog() {
    if (filmDialog) {
      filmDialog.close();
      // Remove iframe so playback/network context ends
      const wrapper = filmDialog.querySelector('.video-wrapper');
      if (wrapper) {
        const existing = wrapper.querySelector('iframe');
        if (existing) { existing.remove(); filmIframe = null; }
      }
    }
  }
  if (btnPlay) btnPlay.addEventListener('click', openFilmDialog);
  if (filmDialog) {
    const closeBtn = filmDialog.querySelector('.dialog-close');
    if (closeBtn) closeBtn.addEventListener('click', (e) => { e.preventDefault(); closeFilmDialog(); btnPlay.focus(); });
    filmDialog.addEventListener('keydown', (e) => { if (e.key === 'Escape') { e.preventDefault(); closeFilmDialog(); btnPlay.focus(); } });
    filmDialog.addEventListener('close', () => { btnPlay.focus(); });
  }

  // Reduced-motion: disable transitions when preferred (via CSS) and also script adjustment
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReduced) {
    document.documentElement.style.scrollBehavior = 'auto';
  }
})();

(() => {
  const menu = document.querySelector('.mobile-menu');
  if (!menu) return;

  const header = menu.closest('.site-header');
  const navigation = menu.querySelector('nav');
  const toggle = document.createElement('button');
  const overlay = document.createElement('div');
  const close = document.createElement('button');
  let closeTimer;

  toggle.type = 'button';
  toggle.className = 'mobile-menu-toggle';
  toggle.setAttribute('aria-label', 'Open navigation');
  toggle.setAttribute('aria-expanded', 'false');
  toggle.innerHTML = '<span aria-hidden="true">☰</span>';

  overlay.className = 'mobile-menu-overlay';
  overlay.id = 'mobile-navigation';
  overlay.hidden = true;
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-modal', 'true');
  overlay.setAttribute('aria-label', 'Site navigation');

  close.type = 'button';
  close.className = 'mobile-menu-close';
  close.setAttribute('aria-label', 'Close navigation');
  close.innerHTML = '<span aria-hidden="true">×</span>';

  toggle.setAttribute('aria-controls', overlay.id);
  overlay.append(close, navigation);
  document.body.append(overlay);
  menu.replaceWith(toggle);

  const focusableItems = () => Array.from(overlay.querySelectorAll('button, a[href]'));
  const openMenu = () => {
    window.clearTimeout(closeTimer);
    overlay.hidden = false;
    requestAnimationFrame(() => overlay.classList.add('is-open'));
    document.body.classList.add('mobile-menu-open');
    toggle.setAttribute('aria-expanded', 'true');
    close.focus();
  };
  const closeMenu = (restoreFocus = true) => {
    overlay.classList.remove('is-open');
    document.body.classList.remove('mobile-menu-open');
    toggle.setAttribute('aria-expanded', 'false');
    closeTimer = window.setTimeout(() => { overlay.hidden = true; }, 220);
    if (restoreFocus) toggle.focus();
  };

  toggle.addEventListener('click', openMenu);
  close.addEventListener('click', () => closeMenu());
  navigation.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => closeMenu(false)));
  overlay.addEventListener('click', (event) => { if (event.target === overlay) closeMenu(); });
  document.addEventListener('keydown', (event) => {
    if (overlay.hidden) return;
    if (event.key === 'Escape') { closeMenu(); return; }
    if (event.key !== 'Tab') return;
    const items = focusableItems();
    const first = items[0];
    const last = items.at(-1);
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  });
})();

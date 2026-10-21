// -----------------------------------------
// NAVMENU script (two-step scaling navigation)
// -----------------------------------------

function initTwostepScalingNavigation() {
  const navElement = document.querySelector('[data-twostep-nav]');
  const navStatusEl = document.querySelector('[data-nav-status]');

  if (!navElement || !navStatusEl) return;

  const toggleButtons = document.querySelectorAll('[data-nav-toggle="toggle"]');

  const setNavStatus = (status) => {
    navStatusEl.setAttribute('data-nav-status', status);
    toggleButtons.forEach((btn) => btn.setAttribute('aria-expanded', status === 'active' ? 'true' : 'false'));
  };

  // Lenis staat in transitions.js; zonder Lenis valt dit terug op overflow
  const lockScroll = () => {
    if (typeof lenis !== 'undefined' && lenis) lenis.stop();
    else document.documentElement.style.overflow = 'hidden';
  };

  const unlockScroll = () => {
    if (typeof lenis !== 'undefined' && lenis) lenis.start();
    else document.documentElement.style.overflow = '';
  };

  const isActive = () => navStatusEl.getAttribute('data-nav-status') === 'active';

  const openNav = () => {
    setNavStatus('active');
    lockScroll();
  };

  const closeNav = () => {
    setNavStatus('not-active');
    unlockScroll();
  };

  const toggleNav = () => (isActive() ? closeNav() : openNav());

  // Toggle buttons
  toggleButtons.forEach((btn) => {
    btn.setAttribute('aria-expanded', 'false');
    btn.addEventListener('click', toggleNav);
  });

  // Klik op een link in het uitgeklapte menu sluit het menu
  navElement.querySelectorAll('.twostep-nav__bottom a').forEach((link) => {
    link.addEventListener('click', () => {
      if (isActive()) closeNav();
    });
  });

  // Close buttons
  document.querySelectorAll('[data-nav-toggle="close"]').forEach((btn) => {
    btn.addEventListener('click', closeNav);
  });

  // ESC closes
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && isActive()) closeNav();
  });
}

// Initialize Two-step Scaling Navigation
document.addEventListener('DOMContentLoaded', () => {
  initTwostepScalingNavigation();
});

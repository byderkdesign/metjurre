// -----------------------------------------
// FOOTER (component Footer-main)
// - Zet het huidige jaar in [data-footer-year]
// - "Terug naar boven" [data-footer-top] scrolt soepel, via Lenis als die er is
// - Geeft de nieuwste podcast een label "Nieuw" en opent Spotify in een nieuw tabblad
// -----------------------------------------

function initFooter(scope = document) {
  scope.querySelectorAll('[data-footer-year]').forEach((el) => {
    el.textContent = el.textContent.replace(/\d{4}/, new Date().getFullYear());
  });

  scope.querySelectorAll('[data-footer-top]').forEach((link) => {
    if (link.dataset.footerReady) return;
    link.dataset.footerReady = 'true';
    link.addEventListener('click', (event) => {
      event.preventDefault();
      // `lenis` komt uit transitions.js
      if (typeof lenis !== 'undefined' && lenis) {
        lenis.scrollTo(0);
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    });
  });

  // De CMS-lijst staat op nieuwste eerst
  scope.querySelectorAll('[data-footer-podcast] .site-footer__ep').forEach((ep, index) => {
    if (ep.dataset.footerReady) return;
    ep.dataset.footerReady = 'true';

    if (ep.href.includes('open.spotify.com')) {
      ep.target = '_blank';
      ep.rel = 'noopener';
    }

    const nr = ep.querySelector('.site-footer__ep-nr');
    if (index === 0 && nr) {
      const label = document.createElement('span');
      label.className = 'pill';
      label.textContent = 'Nieuw';
      nr.appendChild(label);
    }
  });
}

document.addEventListener('DOMContentLoaded', () => initFooter());

if (window.barba) {
  barba.hooks.afterEnter((data) => initFooter(data.next.container));
}

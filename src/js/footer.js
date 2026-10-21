// -----------------------------------------
// FOOTER (component Footer-main)
// - Zet het huidige jaar in [data-footer-year]
// - "Terug naar boven" [data-footer-top] scrolt soepel, via Lenis als die er is
// - Toont de 3 nieuwste podcasts in [data-footer-podcast-list]
//   Een component kan geen CMS-lijst bevatten, dus de afleveringen komen
//   uit de podcastslider op de homepage (op de homepage zelf direct uit de pagina).
// -----------------------------------------

const FOOTER_PODCAST_LIMIT = 3;
let footerPodcastCache = null;

async function getFooterPodcasts() {
  if (footerPodcastCache) return footerPodcastCache;

  let doc = document;
  if (!doc.querySelector('.podcast-card')) {
    const response = await fetch('/', { credentials: 'same-origin' });
    if (!response.ok) return [];
    doc = new DOMParser().parseFromString(await response.text(), 'text/html');
  }

  // De CMS-lijst staat op nieuwste eerst; Swiper-kopieën tellen niet mee
  footerPodcastCache = [...doc.querySelectorAll('.swiper-slide:not(.swiper-slide-duplicate) .podcast-card')]
    .slice(0, FOOTER_PODCAST_LIMIT)
    .map((card) => ({
      href: card.getAttribute('href'),
      nr: card.querySelector('.podcast-card_nr')?.textContent.trim() || '',
      title: card.querySelector('.heading__card')?.textContent.trim() || '',
    }))
    .filter((ep) => ep.title);

  return footerPodcastCache;
}

async function renderFooterPodcasts(list) {
  let episodes = [];
  try {
    episodes = await getFooterPodcasts();
  } catch (error) {
    // Geen afleveringen: de link "Alle afleveringen" blijft staan
  }

  episodes.forEach((ep, index) => {
    const link = document.createElement('a');
    link.className = 'site-footer__ep';
    link.href = ep.href;
    if (ep.href.includes('open.spotify.com')) {
      link.target = '_blank';
      link.rel = 'noopener';
      link.setAttribute('aria-label', `Luister naar ${ep.nr ? ep.nr + ' ' : ''}${ep.title} op Spotify`);
    }

    const nr = document.createElement('span');
    nr.className = 'site-footer__ep-nr';
    nr.textContent = ep.nr;
    if (index === 0) {
      const label = document.createElement('span');
      label.className = 'pill';
      label.textContent = 'Nieuw';
      nr.appendChild(label);
    }

    const title = document.createElement('span');
    title.className = 'site-footer__ep-title';
    title.textContent = ep.title;

    link.append(nr, title);
    list.appendChild(link);
  });
}

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

  scope.querySelectorAll('[data-footer-podcast-list]').forEach((list) => {
    if (list.dataset.footerReady) return;
    list.dataset.footerReady = 'true';
    renderFooterPodcasts(list);
  });
}

document.addEventListener('DOMContentLoaded', () => initFooter());

if (window.barba) {
  barba.hooks.afterEnter((data) => initFooter(data.next.container));
}

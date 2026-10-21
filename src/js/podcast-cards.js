// -----------------------------------------
// PODCAST CARDS (homepage)
// - Zet het aantal afleveringen in [data-podcast-count]
// - Geeft de nieuwste aflevering een label "Nieuw"
// - Toont de gast(en) uit het CMS als "Met …" in plaats van de podcastnaam
// - Toont de duur als afgeronde minuten ("42:44" → "43")
// - Opent Spotify in een nieuw tabblad, met een duidelijk aria-label
// Draait vóór Swiper (window load), zodat de loop-kopieën alles meenemen.
// -----------------------------------------

function formatMinutes(text) {
  const parts = text.trim().split(':').map(Number);
  if (parts.some(Number.isNaN)) return text;
  const seconds = parts.reduce((total, part) => total * 60 + part, 0);
  return String(Math.max(1, Math.round(seconds / 60)));
}

function initPodcastCards(scope = document) {
  // Swiper maakt kopieën van slides voor de loop; die tellen niet mee
  const slides = [...scope.querySelectorAll('.swiper-slide:not(.swiper-slide-duplicate)')];
  if (!slides.length) return;

  scope.querySelectorAll('[data-podcast-count]').forEach((el) => {
    el.textContent = `${slides.length} afleveringen`;
  });

  slides.forEach((slide, index) => {
    const card = slide.querySelector('.podcast-card');
    if (!card || card.dataset.podcastReady) return;
    card.dataset.podcastReady = 'true';

    const title = slide.querySelector('.heading__card')?.textContent.trim();
    const nr = slide.querySelector('.podcast-card_nr');
    const time = slide.querySelector('.podcast-card_time');

    if (time) time.textContent = formatMinutes(time.textContent);

    // Gastnamen staan in verborgen CMS-velden [data-podcast-guest]
    const guests = [...slide.querySelectorAll('[data-podcast-guest]')]
      .map((el) => el.textContent.trim())
      .filter(Boolean);
    const name = slide.querySelector('.podcast-card_name');
    if (guests.length && name) {
      name.textContent = `Met ${guests.join(' & ')}`;
      name.classList.add('is--guest');
    }

    if (card.href.includes('open.spotify.com')) {
      card.target = '_blank';
      card.rel = 'noopener';
      if (title) card.setAttribute('aria-label', `Luister naar ${nr ? nr.textContent.trim() + ' ' : ''}${title} op Spotify`);
    }

    // De CMS-lijst staat op nieuwste eerst
    if (index === 0 && nr) {
      const row = document.createElement('div');
      row.className = 'meta-row';
      nr.before(row);
      row.appendChild(nr);

      const label = document.createElement('div');
      label.className = 'pill';
      label.textContent = 'Nieuw';
      row.appendChild(label);
    }
  });
}

document.addEventListener('DOMContentLoaded', () => initPodcastCards());

if (window.barba) {
  barba.hooks.afterEnter((data) => initPodcastCards(data.next.container));
}

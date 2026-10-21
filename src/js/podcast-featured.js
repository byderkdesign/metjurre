// -----------------------------------------
// PODCAST FEATURED (homepage)
// Vult het blok "Nieuwste aflevering" met de eerste aflevering uit de CMS-slider
// en zet het aantal afleveringen in [data-podcast-count].
// -----------------------------------------

function getSpotifyEpisodeId(url) {
  const match = (url || '').match(/open\.spotify\.com\/episode\/([A-Za-z0-9]+)/);
  return match ? match[1] : null;
}

function initPodcastFeatured(scope = document) {
  // Swiper maakt kopieën van slides voor de loop; die tellen niet mee
  const slides = [...scope.querySelectorAll('.swiper-slide:not(.swiper-slide-duplicate)')];
  if (!slides.length) return;

  scope.querySelectorAll('[data-podcast-count]').forEach((el) => {
    el.textContent = `${slides.length} afleveringen`;
  });

  const featured = scope.querySelector('[data-podcast-featured]');
  if (!featured) return;

  // De CMS-lijst staat op nieuwste eerst
  const latest = slides[0];
  const card = latest.querySelector('.podcast-card');
  const img = latest.querySelector('.podcast-card_thumbnail');
  const nr = latest.querySelector('.podcast-card_nr');
  const title = latest.querySelector('.heading__card');
  const time = latest.querySelector('.podcast-card_time');

  const set = (selector, value) => {
    const el = featured.querySelector(selector);
    if (el && value) el.textContent = value;
  };

  set('[data-podcast-nr]', nr?.textContent.trim());
  set('[data-podcast-title]', title?.textContent.trim());
  set('[data-podcast-time]', time ? `${time.textContent.trim()} min` : '');

  const cover = featured.querySelector('[data-podcast-cover]');
  if (cover && img) {
    cover.src = img.currentSrc || img.src;
    cover.alt = title ? `Cover van ${title.textContent.trim()}` : '';
  }

  const player = featured.querySelector('[data-podcast-player]');
  const episodeId = getSpotifyEpisodeId(card?.getAttribute('href'));
  if (player && episodeId && !player.querySelector('iframe')) {
    const iframe = document.createElement('iframe');
    iframe.src = `https://open.spotify.com/embed/episode/${episodeId}?utm_source=generator&theme=0`;
    iframe.width = '100%';
    iframe.height = '152';
    iframe.loading = 'lazy';
    iframe.title = title ? `Spotify: ${title.textContent.trim()}` : 'Spotify-speler';
    iframe.allow = 'autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture';
    iframe.style.border = '0';
    iframe.style.borderRadius = '12px';
    player.appendChild(iframe);
  }
}

document.addEventListener('DOMContentLoaded', () => initPodcastFeatured());

if (window.barba) {
  barba.hooks.afterEnter((data) => initPodcastFeatured(data.next.container));
}

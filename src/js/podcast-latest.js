// -----------------------------------------
// PODCAST LATEST (homepage)
// Geeft de nieuwste aflevering in de slider een label "Nieuw"
// en zet het aantal afleveringen in [data-podcast-count].
// Draait vóór Swiper (window load), zodat de loop-kopieën het label meenemen.
// -----------------------------------------

function initPodcastLatest(scope = document) {
  // Swiper maakt kopieën van slides voor de loop; die tellen niet mee
  const slides = [...scope.querySelectorAll('.swiper-slide:not(.swiper-slide-duplicate)')];
  if (!slides.length) return;

  scope.querySelectorAll('[data-podcast-count]').forEach((el) => {
    el.textContent = `${slides.length} afleveringen`;
  });

  // De CMS-lijst staat op nieuwste eerst
  const nr = slides[0].querySelector('.podcast-card_nr');
  if (!nr || nr.parentElement.classList.contains('meta-row')) return;

  const row = document.createElement('div');
  row.className = 'meta-row';
  nr.before(row);
  row.appendChild(nr);

  const label = document.createElement('div');
  label.className = 'pill';
  label.textContent = 'Nieuw';
  row.appendChild(label);
}

document.addEventListener('DOMContentLoaded', () => initPodcastLatest());

if (window.barba) {
  barba.hooks.afterEnter((data) => initPodcastLatest(data.next.container));
}

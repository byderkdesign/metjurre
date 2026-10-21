// -----------------------------------------
// BENTO (homepage)
// - Verdubbelt de DISC-pills in [data-bento-ticker] voor een naadloze loop
// - Laat de pill in het midden van de ticker oplichten (.is-active)
// Draait alleen zolang de ticker in beeld is.
// -----------------------------------------

function initBentoTicker(scope = document) {
  scope.querySelectorAll('[data-bento-ticker]').forEach((ticker) => {
    if (ticker.dataset.bentoReady) return;
    ticker.dataset.bentoReady = 'true';

    const track = ticker.querySelector('.bento__ticker-track');
    if (!track) return;

    // Tweede set pills: de animatie schuift precies één set op (-50%)
    [...track.children].forEach((pill) => track.appendChild(pill.cloneNode(true)));
    const pills = [...track.children];

    let frame = null;
    let active = null;

    const highlight = () => {
      const box = ticker.getBoundingClientRect();
      const center = box.top + box.height / 2;
      let closest = null;
      let distance = Infinity;
      pills.forEach((pill) => {
        const rect = pill.getBoundingClientRect();
        const d = Math.abs(rect.top + rect.height / 2 - center);
        if (d < distance) {
          distance = d;
          closest = pill;
        }
      });
      if (closest !== active) {
        active?.classList.remove('is-active');
        closest?.classList.add('is-active');
        active = closest;
      }
      frame = requestAnimationFrame(highlight);
    };

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !frame) {
        frame = requestAnimationFrame(highlight);
      } else if (!entry.isIntersecting && frame) {
        cancelAnimationFrame(frame);
        frame = null;
      }
    });
    observer.observe(ticker);
  });
}

document.addEventListener('DOMContentLoaded', () => initBentoTicker());

if (window.barba) {
  barba.hooks.afterEnter((data) => initBentoTicker(data.next.container));
}

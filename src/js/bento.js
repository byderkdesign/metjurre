// -----------------------------------------
// BENTO (homepage)
// - Verdubbelt de DISC-pills in [data-bento-ticker] voor een naadloze loop
// - Laat de pill in het midden van de ticker oplichten (.is-active)
// - Buigt de pills als een slotmachinerol: kantelen en inschuiven naar de randen
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
    const curve = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const highlight = () => {
      const box = ticker.getBoundingClientRect();
      const center = box.top + box.height / 2;
      const radius = box.height / 2;
      // Positie uit de layout (offsetTop) en niet uit de rect, zodat de eigen kanteling niet meetelt
      const trackTop = track.getBoundingClientRect().top;
      let closest = null;
      let distance = Infinity;
      pills.forEach((pill) => {
        const offset = trackTop + pill.offsetTop + pill.offsetHeight / 2 - center;
        if (Math.abs(offset) < distance) {
          distance = Math.abs(offset);
          closest = pill;
        }
        if (!curve) return;
        // Rol: positie op een cirkel (sin) en platgedrukt naar de randen (cos).
        // Puur 2D, zodat niets groter wordt dan de pill zelf.
        const angle = Math.max(-1.2, Math.min(1.2, offset / radius));
        const shift = radius * Math.sin(angle) - offset;
        const squash = Math.cos(angle);
        const shrink = 1 - 0.08 * Math.abs(angle);
        pill.style.transform = `translateY(${shift.toFixed(1)}px) scale(${shrink.toFixed(3)}, ${(squash * shrink).toFixed(3)})`;
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

// -----------------------------------------
// DISC-schijf (DISC-pagina)
// - Hover, focus of tik op een segment [data-disc-key] maakt die stijl actief
// - Toont de bijbehorende kaart [data-disc-panel] en licht de twee assen op
// - Zolang niemand de schijf aanraakt, loopt hij zelf door de stijlen (alleen in beeld)
// -----------------------------------------

const DISC_AXES = {
  d: ['fast', 'task'],
  i: ['fast', 'people'],
  s: ['calm', 'people'],
  c: ['calm', 'task'],
};

const DISC_ORDER = ['d', 'i', 's', 'c'];
const DISC_CYCLE_MS = 2600;

function initDisc(scope = document) {
  scope.querySelectorAll('[data-disc]').forEach((section) => {
    if (section.dataset.discReady) return;

    const wheel = section.querySelector('[data-disc-wheel]');
    const panelsWrap = section.querySelector('.disc__panels');
    if (!wheel || !panelsWrap) return;
    section.dataset.discReady = 'true';

    const segments = [...wheel.querySelectorAll('[data-disc-key]')];
    const labels = [...wheel.querySelectorAll('[data-disc-axis]')];
    const panels = [...panelsWrap.querySelectorAll('[data-disc-panel]')];
    const glass = [...wheel.querySelectorAll('[data-disc-glass]')];
    let current = 'd';
    let timer = null;
    let used = false;

    const activate = (key) => {
      current = key;
      wheel.classList.add('has-active');
      segments.forEach((seg) => {
        const on = seg.dataset.discKey === key;
        seg.classList.toggle('is-active', on);
        seg.setAttribute('aria-pressed', String(on));
      });
      panels.forEach((panel) => panel.classList.toggle('is-active', panel.dataset.discPanel === key));
      glass.forEach((g) => g.classList.toggle('is-active', g.dataset.discGlass === key));
      const axes = DISC_AXES[key] || [];
      labels.forEach((label) => label.classList.toggle('is-active', axes.includes(label.dataset.discAxis)));
    };

    const stopCycle = () => {
      clearInterval(timer);
      timer = null;
    };

    const startCycle = () => {
      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (used || timer || reduced) return;
      timer = setInterval(() => {
        const next = DISC_ORDER[(DISC_ORDER.indexOf(current) + 1) % DISC_ORDER.length];
        activate(next);
      }, DISC_CYCLE_MS);
    };

    const choose = (key) => {
      if (!used) {
        used = true;
        wheel.classList.add('is-used');
        stopCycle();
      }
      activate(key);
    };

    segments.forEach((seg) => {
      const key = seg.dataset.discKey;
      seg.addEventListener('mouseenter', () => choose(key));
      seg.addEventListener('focus', () => choose(key));
      seg.addEventListener('click', () => choose(key));
      seg.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          choose(key);
        }
      });
    });

    // Alleen rondlopen als de schijf in beeld is
    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver(([entry]) => {
        if (!document.body.contains(wheel)) return io.disconnect();
        entry.isIntersecting ? startCycle() : stopCycle();
      }, { threshold: 0.4 });
      io.observe(wheel);
    }

    panelsWrap.classList.add('is-ready');
    activate('d');
  });
}

document.addEventListener('DOMContentLoaded', () => initDisc());

if (window.barba) {
  barba.hooks.afterEnter((data) => initDisc(data.next.container));
}

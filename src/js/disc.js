// -----------------------------------------
// DISC-schijf (DISC-pagina)
// - Hover, focus of tik op een segment [data-disc-key] maakt die stijl actief
// - Toont de bijbehorende kaart [data-disc-panel] en licht de twee assen op
// - Start met D actief
// -----------------------------------------

const DISC_AXES = {
  d: ['fast', 'task'],
  i: ['fast', 'people'],
  s: ['calm', 'people'],
  c: ['calm', 'task'],
};

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

    const activate = (key) => {
      segments.forEach((seg) => {
        const on = seg.dataset.discKey === key;
        seg.classList.toggle('is-active', on);
        seg.setAttribute('aria-pressed', String(on));
      });
      panels.forEach((panel) => panel.classList.toggle('is-active', panel.dataset.discPanel === key));
      const axes = DISC_AXES[key] || [];
      labels.forEach((label) => label.classList.toggle('is-active', axes.includes(label.dataset.discAxis)));
    };

    segments.forEach((seg) => {
      const key = seg.dataset.discKey;
      seg.addEventListener('mouseenter', () => activate(key));
      seg.addEventListener('focus', () => activate(key));
      seg.addEventListener('click', () => activate(key));
      seg.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          activate(key);
        }
      });
    });

    panelsWrap.classList.add('is-ready');
    activate('d');
  });
}

document.addEventListener('DOMContentLoaded', () => initDisc());

if (window.barba) {
  barba.hooks.afterEnter((data) => initDisc(data.next.container));
}

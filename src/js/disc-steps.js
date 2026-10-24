/* -----------------------------------------
   DISC en TWI: stappen met tabs
   - Tabs lopen vanzelf door zolang de sectie in beeld is
   - Na een klik stopt het automatisch doorlopen
----------------------------------------- */

const DISC_STEPS_DURATION = 6000;

function initDiscSteps(scope = document) {
  scope.querySelectorAll('[data-disc-steps]').forEach((root) => {
    if (root.dataset.discStepsReady) return;
    root.dataset.discStepsReady = 'true';

    const tabs = [...root.querySelectorAll('[data-step-tab]')];
    const items = [...root.querySelectorAll('[data-step]')];
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let current = 0;
    let timer = null;
    let autoplay = !reduceMotion;
    let inView = false;

    root.style.setProperty('--ds-dur', DISC_STEPS_DURATION + 'ms');

    const schedule = () => {
      clearTimeout(timer);
      root.classList.remove('is-playing');
      if (!autoplay || !inView) return;
      void root.offsetWidth; // vullijn opnieuw laten starten
      root.classList.add('is-playing');
      timer = setTimeout(() => activate((current + 1) % tabs.length), DISC_STEPS_DURATION);
    };

    const activate = (index) => {
      current = index;
      tabs.forEach((tab, i) => {
        tab.classList.toggle('is-active', i === index);
        tab.setAttribute('aria-selected', i === index ? 'true' : 'false');
      });
      items.forEach((item) => {
        item.classList.toggle('is-active', Number(item.dataset.step) === index);
      });
      schedule();
    };

    tabs.forEach((tab, i) => {
      tab.addEventListener('click', () => {
        autoplay = false;
        activate(i);
      });
    });

    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver(([entry]) => {
        if (!document.body.contains(root)) return io.disconnect();
        inView = entry.isIntersecting;
        schedule();
      }, { threshold: 0.35 });
      io.observe(root);
    }

    activate(0);
  });
}

document.addEventListener('DOMContentLoaded', () => initDiscSteps());

if (window.barba) {
  barba.hooks.afterEnter((data) => initDiscSteps(data.next.container));
}

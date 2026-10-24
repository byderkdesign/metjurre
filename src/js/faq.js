// -----------------------------------------
// FAQ (homepage)
// - Zet elke vraag (h3.faq__question) om naar een toegankelijke knop met plus/min-icoon
// - Eén vraag tegelijk open; [data-faq-open] staat bij laden open
// - Vult [data-faq-count] met het aantal vragen
// -----------------------------------------

function initFaq(scope = document) {
  scope.querySelectorAll('[data-faq]').forEach((section, s) => {
    if (section.dataset.faqReady) return;
    section.dataset.faqReady = 'true';

    const items = [...section.querySelectorAll('.faq__item')];
    section.querySelectorAll('[data-faq-count]').forEach((el) => {
      el.textContent = `${items.length} vragen`;
    });

    const setOpen = (item, open) => {
      item.classList.toggle('is-open', open);
      item.querySelector('.faq__trigger')?.setAttribute('aria-expanded', String(open));
    };

    items.forEach((item, i) => {
      const question = item.querySelector('.faq__question');
      const answer = item.querySelector('.faq__answer');
      if (!question || !answer) return;

      const id = `faq-${s}-${i}`;
      const trigger = document.createElement('button');
      trigger.type = 'button';
      trigger.className = 'faq__trigger';
      trigger.id = `${id}-q`;
      trigger.setAttribute('aria-controls', `${id}-a`);
      trigger.textContent = question.textContent.trim();
      const icon = document.createElement('span');
      icon.className = 'faq__icon';
      icon.setAttribute('aria-hidden', 'true');
      trigger.appendChild(icon);
      question.replaceChildren(trigger);

      answer.id = `${id}-a`;
      answer.setAttribute('role', 'region');
      answer.setAttribute('aria-labelledby', trigger.id);

      setOpen(item, item.hasAttribute('data-faq-open'));

      trigger.addEventListener('click', () => {
        const open = !item.classList.contains('is-open');
        items.forEach((other) => other !== item && setOpen(other, false));
        setOpen(item, open);
      });
    });

    section.classList.add('is-ready');
  });
}

document.addEventListener('DOMContentLoaded', () => initFaq());

if (window.barba) {
  barba.hooks.afterEnter((data) => initFaq(data.next.container));
}

// -----------------------------------------
// CONTACT
// - Vult het onderwerp-menu als het in Webflow nog leeg is; ?onderwerp=disc kiest vooraf
// - Placeholders en "(optioneel)" bij niet-verplichte velden
// - Foutstatus pas na het verlaten van een veld (.is-touched)
// - Webflow-formulieren opnieuw koppelen na een Barba-overgang
// -----------------------------------------

const contactTopics = [
  ['', 'Kies een onderwerp'],
  ['DISC-analyse', 'DISC-analyse'],
  ['Leiderschapscoaching', 'Leiderschapscoaching'],
  ['Trainingen', 'Training voor mijn team'],
  ['Coaching', 'Persoonlijke coaching'],
  ['Weet ik nog niet', 'Weet ik nog niet precies'],
];

const contactPlaceholders = {
  naam: 'Voor- en achternaam',
  organisatie: 'Naam van je bedrijf',
  emailadres: 'naam@bedrijf.nl',
  telefoon: '06 12345678',
  bericht: 'Bijvoorbeeld: we groeien snel en merken dat afspraken niet meer vanzelf gaan.',
};

function initContact(scope = document) {
  scope.querySelectorAll('[data-contact-form]').forEach((card) => {
    if (card.dataset.contactReady) return;
    card.dataset.contactReady = 'true';

    const form = card.querySelector('form');
    if (!form) return;

    const select = form.querySelector('select');
    if (select) {
      if (!select.options.length) {
        contactTopics.forEach(([value, label]) => select.add(new Option(label, value)));
      }
      const wanted = new URLSearchParams(location.search).get('onderwerp');
      if (wanted) {
        const match = [...select.options].find((o) => o.value.toLowerCase().startsWith(wanted.toLowerCase()));
        if (match) select.value = match.value;
      }
      const syncEmpty = () => select.classList.toggle('is-empty', !select.value);
      select.addEventListener('change', syncEmpty);
      syncEmpty();
    }

    form.querySelectorAll('input, textarea, select').forEach((field) => {
      if (field.type === 'submit') return;
      if (contactPlaceholders[field.id] && !field.placeholder) {
        field.placeholder = contactPlaceholders[field.id];
      }
      const label = form.querySelector(`label[for="${field.id}"]`);
      if (label && !field.required && !label.querySelector('.contact__optional')) {
        const hint = document.createElement('span');
        hint.className = 'contact__optional';
        hint.textContent = '(optioneel)';
        label.appendChild(hint);
      }
      field.addEventListener('blur', () => field.classList.add('is-touched'));
    });

    // Bij versturen alle velden als aangeraakt markeren, zodat lege verplichte velden oplichten
    form.querySelector('[type="submit"]')?.addEventListener('click', () => {
      form.querySelectorAll('.contact__input').forEach((f) => f.classList.add('is-touched'));
    });
  });
}

document.addEventListener('DOMContentLoaded', () => initContact());

if (window.barba) {
  barba.hooks.afterEnter((data) => {
    initContact(data.next.container);
    // Webflow koppelt formulieren alleen bij paginalading; na een overgang opnieuw
    if (data.next.container.querySelector('.w-form')) {
      try {
        window.Webflow?.require('forms')?.ready();
      } catch (e) {}
    }
  });
}

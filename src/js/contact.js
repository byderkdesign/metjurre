// -----------------------------------------
// CONTACT
// - Vult het onderwerp-menu zolang het in Webflow leeg is of de standaardopties heeft; ?onderwerp=disc kiest vooraf
// - Placeholders en "(optioneel)" bij niet-verplichte velden
// - Foutstatus pas na het verlaten van een veld (.is-touched)
// - Primary Button als verstuurknop (de Webflow-knop blijft verborgen staan)
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
      const isDefault = !select.options.length || select.options[0].textContent.trim() === 'Select one...';
      if (isDefault) {
        select.replaceChildren();
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
      // Webflow zet standaard "Example Text"; die vervangen we
      if (contactPlaceholders[field.id] && (!field.placeholder || field.placeholder === 'Example Text')) {
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
    const markAll = () => form.querySelectorAll('.contact__input').forEach((f) => f.classList.add('is-touched'));
    const submit = form.querySelector('[type="submit"]');
    submit?.addEventListener('click', markAll);

    // De zichtbare knop is de Primary Button van de site (een link); die verstuurt het
    // formulier via de verborgen Webflow-knop, zodat validatie en verzending gelijk blijven
    const button = form.querySelector('.contact__form-footer .btn-icon-link');
    if (button && submit) {
      button.setAttribute('role', 'button');
      button.removeAttribute('aria-current');
      button.addEventListener('click', (e) => {
        e.preventDefault();
        markAll();
        if (form.requestSubmit) form.requestSubmit(submit);
        else submit.click();
      });
    }
  });
}

document.addEventListener('DOMContentLoaded', () => initContact());

if (window.barba) {
  // Al voor de overgang, zodat het venster meteen de juiste teksten toont
  barba.hooks.beforeEnter((data) => initContact(data.next.container));
  barba.hooks.afterEnter((data) => {
    // Webflow koppelt formulieren alleen bij paginalading; na een overgang opnieuw
    if (data.next.container.querySelector('.w-form')) {
      try {
        window.Webflow?.require('forms')?.ready();
      } catch (e) {}
    }
  });
}

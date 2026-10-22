// -----------------------------------------
// CONVERSIETRACKING (hele site)
// Stuurt klikken en formulieren door naar GA4 (gtag), Google Tag Manager
// (dataLayer) en/of Plausible: wat er op de site staat, wordt gebruikt.
// - [data-track="naam"] op een knop of link → event "naam"
//   Optioneel: [data-track-label] (anders de zichtbare tekst)
// - Spotify-links       → podcast_listen
// - mailto: / tel:      → email_click / phone_click
// - Overige externe link → outbound_click
// - Webflow-formulier verstuurd → form_submit, bedankmelding zichtbaar → generate_lead
// - Barba-paginawissel  → virtual_page_view (alleen in de dataLayer, zie README)
// Elk event krijgt de sectie mee waarin geklikt is (section_name).
// Testen: zet ?debug-tracking achter de URL, dan staat elk event in de console.
// -----------------------------------------

const TRACK_DEBUG = new URLSearchParams(window.location.search).has('debug-tracking');

function sendEvent(name, params = {}) {
  const payload = { ...params, page_path: window.location.pathname };

  // gtag.js leest zelf ook de dataLayer: dus óf gtag, óf een losse push
  if (typeof window.gtag === 'function') {
    window.gtag('event', name, payload);
  } else {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({ event: name, ...payload });
  }

  if (typeof window.plausible === 'function') {
    window.plausible(name, { props: payload });
  }

  if (TRACK_DEBUG) console.info('[tracking]', name, payload);
}

function cleanText(text) {
  return (text || '').replace(/\s+/g, ' ').trim().slice(0, 100);
}

// Naam van de sectie: [data-track-section], anders de eerste class van de sectie
function sectionName(el) {
  const explicit = el.closest('[data-track-section]');
  if (explicit) return explicit.getAttribute('data-track-section');
  const section = el.closest('section, header, footer, nav');
  if (!section) return '';
  return section.id || section.classList[0] || section.tagName.toLowerCase();
}

function linkText(el) {
  return cleanText(el.getAttribute('data-track-label') || el.getAttribute('aria-label') || el.textContent);
}

function classifyLink(link) {
  const href = link.getAttribute('href') || '';
  if (href.startsWith('mailto:')) return 'email_click';
  if (href.startsWith('tel:')) return 'phone_click';
  if (!/^https?:/i.test(link.href)) return null;

  const url = new URL(link.href);
  if (url.hostname === 'open.spotify.com') return 'podcast_listen';
  if (url.hostname !== window.location.hostname) return 'outbound_click';
  return null;
}

function onTrackClick(event) {
  const el = event.target.closest('[data-track], a[href]');
  if (!el) return;

  const name = el.getAttribute('data-track') || (el.matches('a[href]') ? classifyLink(el) : null);
  if (!name) return;

  const params = {
    link_text: linkText(el),
    section_name: sectionName(el),
  };
  if (el.matches('a[href]')) params.link_url = el.href;

  sendEvent(name, params);
}

function formName(form) {
  return form.getAttribute('data-name') || form.getAttribute('name') || form.id || 'formulier';
}

function onTrackSubmit(event) {
  const form = event.target;
  if (!(form instanceof HTMLFormElement)) return;
  sendEvent('form_submit', { form_name: formName(form), section_name: sectionName(form) });
}

// Webflow toont .w-form-done (display: block) na een geslaagde verzending
function watchFormSuccess() {
  const reported = new WeakSet();
  const observer = new MutationObserver((mutations) => {
    mutations.forEach(({ target }) => {
      if (!target.classList?.contains('w-form-done') || reported.has(target)) return;
      if (getComputedStyle(target).display === 'none') return;
      reported.add(target);

      const form = target.closest('.w-form')?.querySelector('form');
      sendEvent('generate_lead', {
        form_name: form ? formName(form) : 'formulier',
        section_name: sectionName(target),
      });
    });
  });
  observer.observe(document.body, { attributes: true, attributeFilter: ['style'], subtree: true });
}

function initTracking() {
  if (window.metjurreTracking) return;
  window.metjurreTracking = { send: sendEvent };

  // Op document, zodat het ook na een Barba-paginawissel blijft werken
  document.addEventListener('click', onTrackClick, true);
  document.addEventListener('submit', onTrackSubmit, true);
  watchFormSuccess();
}

document.addEventListener('DOMContentLoaded', initTracking);

if (window.barba) {
  barba.hooks.after(() => {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      event: 'virtual_page_view',
      page_path: window.location.pathname,
      page_location: window.location.href,
      page_title: document.title,
    });
  });
}

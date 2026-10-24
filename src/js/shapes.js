// Vormentaal: uitsparingen in blokken
// Per blok berekenen we één vorm: het blok met daaruit het vlak van de uitsparing
// (de "bite"), met alle hoeken afgerond. Die vorm zetten we als --notch-clip
// (clip-path: path(...)) op het blok; shapes.css bepaalt welke lagen hem gebruiken.
// Omdat het één vorm is, zijn er geen naden tussen losse hoekstukjes.

const notchShapes = [
  // nav: ook een uitsparing waar het menu in valt
  { block: '.hero-wrap', bite: '.hero__proof', nav: true },
  { block: '.section__method', bite: '.method__cta', layer: true },
  { block: '.about__tile.is--main', bite: '.card.card--dark' },
  { block: '.about__tile.is--photo', bite: '.about__chip' },
  { block: '.section__podcast', bite: '.secondary-btn_dark-bg-wrapper' },
  { block: '.pain__item', bite: '.pain__icon', layer: true },
  { block: '.page-hero__wrap', bite: '.page-hero__stats', nav: true },
  { block: '.section__contact', bite: '.contact__details', nav: true },
  { block: '.steps__card', bite: '.steps__number', layer: true },
  // Copyright en credit staan naast het blok (anders knipt het blok ze mee weg)
  { block: '.site-footer__wrap', bite: '.site-footer__copyright, .site-footer__credit', outside: true, multi: true },
];

const notchTint = '#eef4f2';

let notchObserver = null;
const notchPairs = new Map();
const navBlocks = new Set();
const navBar = () => document.querySelector('.twostep-nav__bar');

// Uitgeklapt groeit het menu. De uitsparing houdt de maat van het dichte menu:
// we meten pas weer als het menu dicht is en klaar met krimpen.
let navClosedRect = null;
let navFrozen = false;

// Uitsparing rond het menu bovenin het blok, met lucht eromheen. Het menu staat
// vast bovenin het scherm, dus we rekenen met de positie bij scroll 0. Als er naast
// het menu te weinig blok overblijft (smalle schermen), slaan we hem over.
function navNotch(block, br) {
  const bar = navBar();
  if (!bar) return null;
  if (!navFrozen || !navClosedRect) navClosedRect = bar.getBoundingClientRect();
  const nr = navClosedRect;
  // Even veel lucht naast en onder het menu als erboven
  const pad = nr.top;
  const radius = parseFloat(getComputedStyle(block).borderTopLeftRadius) || 0;
  const blockTop = br.top + window.scrollY;
  const rect = {
    x0: nr.left - pad - br.left,
    x1: nr.right + pad - br.left,
    y0: nr.top - pad - blockTop,
    y1: nr.bottom + pad - blockTop,
  };
  if (rect.y0 > 2 || rect.x0 < radius * 3 || rect.x1 > br.width - radius * 3) return null;
  return rect;
}

function watchNavStatus() {
  const statusEl = document.querySelector('[data-nav-status]');
  if (!statusEl) return;
  let settle = null;
  const unfreeze = () => {
    clearTimeout(settle);
    navFrozen = false;
    navBlocks.forEach(updateNotch);
  };

  new MutationObserver(() => {
    if (statusEl.getAttribute('data-nav-status') === 'active') {
      clearTimeout(settle);
      navFrozen = true;
    } else if (navFrozen) {
      // Na het krimpen (transitionend), met een vangnet als dat event uitblijft
      settle = setTimeout(unfreeze, 1500);
    }
  }).observe(statusEl, { attributes: true, attributeFilter: ['data-nav-status'] });

  navBar()?.addEventListener('transitionend', (e) => {
    if (e.propertyName === 'max-width' && navFrozen && statusEl.getAttribute('data-nav-status') !== 'active') unfreeze();
  });
}

// Rechthoekige veelhoek (met de klok mee) van blok min uitsparingen. Elke
// uitsparing raakt de boven- of onderrand, in een hoek of ergens in het midden.
function notchPolygon(w, h, rects) {
  const tol = 2;
  const bites = rects.map((b) => ({
    x0: Math.max(0, b.x0),
    x1: Math.min(w, b.x1),
    y0: Math.max(0, b.y0),
    y1: Math.min(h, b.y1),
    T: b.y0 <= tol,
    B: b.y1 >= h - tol,
    L: b.x0 <= tol,
    R: b.x1 >= w - tol,
  }));
  // Een uitsparing over de volle breedte of hoogte laat geen vorm over
  if (bites.some((b) => b.T === b.B || (b.L && b.R))) return null;

  const top = bites.filter((b) => b.T).sort((a, b) => a.x0 - b.x0);
  const bottom = bites.filter((b) => b.B).sort((a, b) => b.x1 - a.x1);
  const points = [];

  // Bovenrand, van links naar rechts
  if (!top[0]?.L) points.push([0, 0]);
  top.forEach((b) => {
    if (b.L) points.push([0, b.y1], [b.x1, b.y1], [b.x1, 0]);
    else if (b.R) points.push([b.x0, 0], [b.x0, b.y1], [w, b.y1]);
    else points.push([b.x0, 0], [b.x0, b.y1], [b.x1, b.y1], [b.x1, 0]);
  });
  if (!top[top.length - 1]?.R) points.push([w, 0]);

  // Onderrand, van rechts naar links
  if (!bottom[0]?.R) points.push([w, h]);
  bottom.forEach((b) => {
    if (b.R) points.push([w, b.y0], [b.x0, b.y0], [b.x0, h]);
    else if (b.L) points.push([b.x1, h], [b.x1, b.y0], [0, b.y0]);
    else points.push([b.x1, h], [b.x1, b.y0], [b.x0, b.y0], [b.x0, h]);
  });
  if (!bottom[bottom.length - 1]?.L) points.push([0, h]);

  return points;
}

// Veelhoek naar een pad met afgeronde hoeken: hoeken van het blok krijgen de
// radius van het blok, de hoeken rond de uitsparing dezelfde radius
function roundedPath(points, w, h, radius) {
  const n = points.length;
  const f = (v) => Math.round(v * 100) / 100;
  let d = '';

  for (let i = 0; i < n; i++) {
    const [px, py] = points[(i - 1 + n) % n];
    const [cx, cy] = points[i];
    const [nx, ny] = points[(i + 1) % n];
    const inLen = Math.hypot(cx - px, cy - py);
    const outLen = Math.hypot(nx - cx, ny - cy);
    const r = Math.min(radius, inLen / 2, outLen / 2);
    const ax = cx - ((cx - px) / inLen) * r;
    const ay = cy - ((cy - py) / inLen) * r;
    const bx = cx + ((nx - cx) / outLen) * r;
    const by = cy + ((ny - cy) / outLen) * r;
    // Rechtsaf (met de klok mee) is een bolle hoek, linksaf een holle
    const cross = (cx - px) * (ny - cy) - (cy - py) * (nx - cx);
    const sweep = cross > 0 ? 1 : 0;

    d += `${i === 0 ? 'M' : 'L'}${f(ax)},${f(ay)} A${f(r)},${f(r)} 0 0 ${sweep} ${f(bx)},${f(by)} `;
  }

  return `${d}Z`;
}

function updateNotch(block) {
  const bites = notchPairs.get(block);
  if (!bites || !block.isConnected) return;

  const br = block.getBoundingClientRect();
  if (!br.width || !br.height) return;

  const rects = bites
    .map((bite) => bite.getBoundingClientRect())
    .filter((ir) => ir.width)
    .map((ir) => ({
      x0: ir.left - br.left,
      x1: ir.right - br.left,
      y0: ir.top - br.top,
      y1: ir.bottom - br.top,
    }));
  const navRect = navBlocks.has(block) && navNotch(block, br);
  if (navRect) rects.push(navRect);
  if (!rects.length) return;

  const points = notchPolygon(br.width, br.height, rects);

  if (!points) {
    block.style.removeProperty('--notch-clip');
    return;
  }

  const radius = parseFloat(getComputedStyle(block).borderTopLeftRadius) || 0;
  block.style.setProperty('--notch-clip', `path("${roundedPath(points, br.width, br.height, radius)}")`);
}

// Blokken met een eigen achtergrond: die verhuist naar een laag (::before) die
// geknipt wordt. Een witte kaart wordt lichtgroen, zodat de vorm zichtbaar blijft.
function moveFillToLayer(block) {
  if (block.hasAttribute('data-notch-layer')) return;

  const cs = getComputedStyle(block);
  const isWhite = /^rgba?\(\s*25[0-5],\s*25[0-5],\s*25[0-5](,\s*1)?\s*\)$/.test(cs.backgroundColor);
  const color = isWhite && cs.backgroundImage === 'none' ? notchTint : cs.backgroundColor;

  block.style.setProperty('--notch-fill-color', color);
  block.style.setProperty('--notch-fill-image', cs.backgroundImage);
  block.setAttribute('data-notch-layer', '');
}

// Blokken die niet meer op de pagina staan (na een Barba-overgang) loslaten
function pruneShapes() {
  notchPairs.forEach((bites, block) => {
    if (block.isConnected) return;
    navBlocks.delete(block);
    notchObserver.unobserve(block);
    bites.forEach((bite) => notchObserver.unobserve(bite));
    notchPairs.delete(block);
  });
}

function initShapes(scope = document) {
  if (!('ResizeObserver' in window)) return;

  if (!notchObserver) {
    notchObserver = new ResizeObserver((entries) => {
      const blocks = new Set();
      entries.forEach(({ target }) => {
        if (notchPairs.has(target)) blocks.add(target);
        notchPairs.forEach((bites, block) => bites.includes(target) && blocks.add(block));
        if (target === navBar() && !navFrozen) navBlocks.forEach((block) => blocks.add(block));
      });
      blocks.forEach(updateNotch);
    });
    watchNavStatus();
  }

  pruneShapes();

  // Een blok buiten de Barba-container (de footer) blijft gewoon gekoppeld
  if (navBar()) notchObserver.observe(navBar());

  notchShapes.forEach(({ block: blockSel, bite: biteSel, layer, outside, multi, nav }) => {
    scope.querySelectorAll(blockSel).forEach((block) => {
      if (notchPairs.has(block)) return;
      const root = outside ? block.parentElement : block;
      const bites = multi ? [...root.querySelectorAll(biteSel)] : [root.querySelector(biteSel)].filter(Boolean);
      if (!bites.length) return;
      if (layer) moveFillToLayer(block);
      if (nav) navBlocks.add(block);
      block.setAttribute('data-notch-block', '');
      notchPairs.set(block, bites);
      notchObserver.observe(block);
      bites.forEach((bite) => notchObserver.observe(bite));
      updateNotch(block);
    });
  });
}

document.addEventListener('DOMContentLoaded', () => initShapes());

if (window.barba) {
  barba.hooks.beforeEnter((data) => initShapes(data.next.container));
  // Na de overgang staat de nieuwe pagina op zijn plek: vormen nog een keer meten
  barba.hooks.afterEnter(() => {
    if (!notchObserver) return;
    pruneShapes();
    notchPairs.forEach((bites, block) => updateNotch(block));
  });
}

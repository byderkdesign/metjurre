// Vormentaal: uitsparingen in blokken
// Per blok berekenen we één vorm: het blok met daaruit het vlak van de uitsparing
// (de "bite"), met alle hoeken afgerond. Die vorm zetten we als --notch-clip
// (clip-path: path(...)) op het blok; shapes.css bepaalt welke lagen hem gebruiken.
// Omdat het één vorm is, zijn er geen naden tussen losse hoekstukjes.

const notchShapes = [
  { block: '.hero-wrap', bite: '.hero__proof' },
  { block: '.section__method', bite: '.method__cta', layer: true },
  { block: '.about__tile.is--main', bite: '.card.card--dark' },
  { block: '.about__tile.is--photo', bite: '.about__chip' },
  { block: '.section__podcast', bite: '.secondary-btn_dark-bg-wrapper' },
  { block: '.pain__item', bite: '.pain__icon', layer: true },
  { block: '.page-hero__wrap', bite: '.page-hero__stats' },
  // Copyright en credit staan naast het blok (anders knipt het blok ze mee weg)
  { block: '.site-footer__wrap', bite: '.site-footer__copyright, .site-footer__credit', outside: true, multi: true },
];

const notchTint = '#eef4f2';

let notchObserver = null;
const notchPairs = new Map();

// Rechthoekige veelhoek (met de klok mee) van blok min uitsparing
function notchPolygon(w, h, b) {
  const tol = 2;
  const T = b.y0 <= tol;
  const B = b.y1 >= h - tol;
  const L = b.x0 <= tol;
  const R = b.x1 >= w - tol;
  const x0 = Math.max(0, b.x0);
  const x1 = Math.min(w, b.x1);
  const y0 = Math.max(0, b.y0);
  const y1 = Math.min(h, b.y1);

  if (B && L) return [[0, 0], [w, 0], [w, h], [x1, h], [x1, y0], [0, y0]];
  if (B && R) return [[0, 0], [w, 0], [w, y0], [x0, y0], [x0, h], [0, h]];
  if (T && L) return [[x1, 0], [w, 0], [w, h], [0, h], [0, y1], [x1, y1]];
  if (T && R) return [[0, 0], [x0, 0], [x0, y1], [w, y1], [w, h], [0, h]];
  if (B) return [[0, 0], [w, 0], [w, h], [x1, h], [x1, y0], [x0, y0], [x0, h], [0, h]];
  if (T) return [[0, 0], [x0, 0], [x0, y1], [x1, y1], [x1, 0], [w, 0], [w, h], [0, h]];
  return null;
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

// Meerdere uitsparingen, elk in een hoek van het blok (met de klok mee: LB, RB, RO, LO)
function cornerPolygon(w, h, bites) {
  const tol = 2;
  const at = (fx, fy) => bites.find((b) => fx(b) && fy(b));
  const top = (b) => b.y0 <= tol;
  const bottom = (b) => b.y1 >= h - tol;
  const left = (b) => b.x0 <= tol;
  const right = (b) => b.x1 >= w - tol;
  if (bites.some((b) => !(top(b) || bottom(b)) || !(left(b) || right(b)))) return null;

  const tl = at(top, left);
  const tr = at(top, right);
  const brc = at(bottom, right);
  const bl = at(bottom, left);
  const clampX = (v) => Math.min(w, Math.max(0, v));
  const clampY = (v) => Math.min(h, Math.max(0, v));

  return [
    ...(tl ? [[0, clampY(tl.y1)], [clampX(tl.x1), clampY(tl.y1)], [clampX(tl.x1), 0]] : [[0, 0]]),
    ...(tr ? [[clampX(tr.x0), 0], [clampX(tr.x0), clampY(tr.y1)], [w, clampY(tr.y1)]] : [[w, 0]]),
    ...(brc ? [[w, clampY(brc.y0)], [clampX(brc.x0), clampY(brc.y0)], [clampX(brc.x0), h]] : [[w, h]]),
    ...(bl ? [[clampX(bl.x1), h], [clampX(bl.x1), clampY(bl.y0)], [0, clampY(bl.y0)]] : [[0, h]]),
  ];
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
  if (!rects.length) return;

  const points = rects.length > 1
    ? cornerPolygon(br.width, br.height, rects)
    : notchPolygon(br.width, br.height, rects[0]);

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
      });
      blocks.forEach(updateNotch);
    });
  }

  pruneShapes();

  // Een blok buiten de Barba-container (de footer) blijft gewoon gekoppeld
  notchShapes.forEach(({ block: blockSel, bite: biteSel, layer, outside, multi }) => {
    scope.querySelectorAll(blockSel).forEach((block) => {
      if (notchPairs.has(block)) return;
      const root = outside ? block.parentElement : block;
      const bites = multi ? [...root.querySelectorAll(biteSel)] : [root.querySelector(biteSel)].filter(Boolean);
      if (!bites.length) return;
      if (layer) moveFillToLayer(block);
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
  barba.hooks.afterEnter(() => notchObserver && pruneShapes());
}

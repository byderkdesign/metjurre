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

function updateNotch(block) {
  const bite = notchPairs.get(block);
  if (!bite || !block.isConnected) return;

  const br = block.getBoundingClientRect();
  const ir = bite.getBoundingClientRect();
  if (!br.width || !br.height || !ir.width) return;

  const points = notchPolygon(br.width, br.height, {
    x0: ir.left - br.left,
    x1: ir.right - br.left,
    y0: ir.top - br.top,
    y1: ir.bottom - br.top,
  });

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

function initShapes(scope = document) {
  if (notchObserver) notchObserver.disconnect();
  notchPairs.clear();

  if (!('ResizeObserver' in window)) return;

  notchObserver = new ResizeObserver((entries) => {
    const blocks = new Set();
    entries.forEach((entry) => {
      const el = entry.target;
      blocks.add(notchPairs.has(el) ? el : el.closest('[data-notch-block]'));
    });
    blocks.forEach((block) => block && updateNotch(block));
  });

  notchShapes.forEach(({ block: blockSel, bite: biteSel, layer }) => {
    scope.querySelectorAll(blockSel).forEach((block) => {
      const bite = block.querySelector(biteSel);
      if (!bite) return;
      if (layer) moveFillToLayer(block);
      block.setAttribute('data-notch-block', '');
      notchPairs.set(block, bite);
      notchObserver.observe(block);
      notchObserver.observe(bite);
      updateNotch(block);
    });
  });
}

document.addEventListener('DOMContentLoaded', () => initShapes());

if (window.barba) {
  barba.hooks.beforeEnter((data) => initShapes(data.next.container));
}

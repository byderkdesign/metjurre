// -----------------------------------------
// Interactief stippengrid als achtergrond
// - Werkt op elk element met [data-dots-canvas-init]
// - Kleuren per sectie: data-dots-color-inactive / data-dots-color-active
// - Stippen rond de cursor groeien en kleuren mee; ingedrukt houden vergroot ze iets
// - Alleen interactief op apparaten met een muis; animeert alleen als de sectie in beeld is
// -----------------------------------------

const DOTS = {
  gap: 1.5,          // em tussen de stippen
  dotSize: 0.09,     // em, straal
  maxScale: 2.2,
  pressScale: 1.4,
  hoverRadius: 7,    // aantal stippen
  follow: 0.14,      // hoe snel de cursor gevolgd wordt (0-1)
};

function dotsParseColor(ctx, color) {
  ctx.fillStyle = '#000';
  ctx.fillStyle = color;
  const v = ctx.fillStyle;
  if (v[0] === '#') {
    const n = parseInt(v.slice(1), 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255, 1];
  }
  const p = v.match(/[\d.]+/g).map(Number);
  return [p[0], p[1], p[2], p[3] ?? 1];
}

function initDotsGrid(scope = document) {
  scope.querySelectorAll('[data-dots-canvas-init]').forEach((el) => {
    if (el.dataset.dotsReady) return;
    el.dataset.dotsReady = 'true';

    const canvas = document.createElement('canvas');
    canvas.className = 'dots-canvas';
    canvas.setAttribute('aria-hidden', 'true');
    el.prepend(canvas);
    const ctx = canvas.getContext('2d');

    const cOff = dotsParseColor(ctx, el.dataset.dotsColorInactive || 'rgba(255,255,255,0.12)');
    const cOn = dotsParseColor(ctx, el.dataset.dotsColorActive || '#43c59e');
    const interactive = window.matchMedia('(hover: hover) and (pointer: fine)').matches
      && !window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let w = 0, h = 0, dpr = 1, gap = 24, size = 1.5;
    let visible = false, raf = null;
    const target = { x: -9999, y: -9999, inside: false, down: false };
    const pos = { x: -9999, y: -9999 };
    let strength = 0, press = 1;

    const resize = () => {
      const r = el.getBoundingClientRect();
      const fs = parseFloat(getComputedStyle(el).fontSize) || 16;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = r.width; h = r.height;
      gap = fs * DOTS.gap; size = fs * DOTS.dotSize;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      draw();
    };

    const draw = () => {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);
      const radius = gap * DOTS.hoverRadius;
      const ox = (w % gap) / 2, oy = (h % gap) / 2;
      for (let y = oy; y <= h; y += gap) {
        for (let x = ox; x <= w; x += gap) {
          let t = 0;
          if (strength > 0.001) {
            const d = Math.hypot(x - pos.x, y - pos.y);
            if (d < radius) t = (1 - Math.pow(d / radius, 2)) ** 2 * strength;
          }
          const c = t ? cOn.map((v, i) => cOff[i] + (v - cOff[i]) * t) : cOff;
          const s = size * (1 + (DOTS.maxScale * press - 1) * t);
          ctx.fillStyle = `rgba(${c[0]},${c[1]},${c[2]},${c[3]})`;
          ctx.beginPath();
          ctx.arc(x, y, s, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    };

    const tick = () => {
      raf = null;
      if (!el.isConnected) return;
      if (pos.x < -999) { pos.x = target.x; pos.y = target.y; }
      pos.x += (target.x - pos.x) * DOTS.follow;
      pos.y += (target.y - pos.y) * DOTS.follow;
      strength += ((target.inside ? 1 : 0) - strength) * 0.1;
      press += ((target.down ? DOTS.pressScale : 1) - press) * 0.15;
      draw();
      const moving = Math.abs(target.x - pos.x) + Math.abs(target.y - pos.y) > 0.3;
      const fading = target.inside ? strength < 0.999 : strength > 0.001;
      const pressing = Math.abs((target.down ? DOTS.pressScale : 1) - press) > 0.002;
      if (visible && (moving || fading || pressing)) raf = requestAnimationFrame(tick);
    };

    const kick = () => { if (!raf && visible) raf = requestAnimationFrame(tick); };

    if (interactive) {
      el.addEventListener('pointermove', (e) => {
        const r = el.getBoundingClientRect();
        target.x = e.clientX - r.left;
        target.y = e.clientY - r.top;
        target.inside = true;
        kick();
      });
      el.addEventListener('pointerleave', () => { target.inside = false; target.down = false; kick(); });
      el.addEventListener('pointerdown', () => { target.down = true; kick(); });
      window.addEventListener('pointerup', () => { if (target.down) { target.down = false; kick(); } });
    }

    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver(([entry]) => {
        if (!el.isConnected) return io.disconnect();
        visible = entry.isIntersecting;
        if (visible) kick();
      });
      io.observe(el);
    } else {
      visible = true;
    }

    if ('ResizeObserver' in window) {
      const ro = new ResizeObserver(() => { if (!el.isConnected) return ro.disconnect(); resize(); });
      ro.observe(el);
    }
    resize();
  });
}

document.addEventListener('DOMContentLoaded', () => initDotsGrid());

if (window.barba) {
  barba.hooks.afterEnter((data) => initDotsGrid(data.next.container));
}

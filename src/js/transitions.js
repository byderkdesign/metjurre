// -----------------------------------------
// OSMO PAGE TRANSITION BOILERPLATE
// Vereist: Barba, GSAP + CustomEase, Lenis (zie README)
// -----------------------------------------

gsap.registerPlugin(CustomEase);

history.scrollRestoration = 'manual';

let lenis = null;
let nextPage = document;
let onceFunctionsInitialized = false;

const hasLenis = typeof window.Lenis !== 'undefined';
const hasScrollTrigger = typeof window.ScrollTrigger !== 'undefined';

const rmMQ = window.matchMedia('(prefers-reduced-motion: reduce)');
let reducedMotion = rmMQ.matches;
rmMQ.addEventListener?.('change', (e) => (reducedMotion = e.matches));
rmMQ.addListener?.((e) => (reducedMotion = e.matches));

const has = (s) => !!nextPage.querySelector(s);

let staggerDefault = 0.05;
let durationDefault = 0.6;

CustomEase.create('osmo', '0.625, 0.05, 0, 1');
gsap.defaults({ ease: 'osmo', duration: durationDefault });

// -----------------------------------------
// FUNCTION REGISTRY
// -----------------------------------------

function initOnceFunctions() {
  initLenis();
  if (onceFunctionsInitialized) return;
  onceFunctionsInitialized = true;

  // Runs once on first load
  // if (has('[data-something]')) initSomething();
}

function initBeforeEnterFunctions(next) {
  nextPage = next || document;

  // Runs before the enter animation
  // if (has('[data-something]')) initSomething();
}

function initAfterEnterFunctions(next) {
  nextPage = next || document;

  // Runs after enter animation completes
  // if (has('[data-something]')) initSomething();

  if (has('[fb-carousel]:not([fb-booster-initialized])')) initCarouselTicker();

  if (hasLenis) {
    lenis.resize();
  }

  if (hasScrollTrigger) {
    ScrollTrigger.refresh();
  }
}

// Flowbase carousel ticker (logo-marquee): Webflow laadt het script zelf en het
// start alleen bij de eerste paginaload. Na een overgang laden we het opnieuw;
// het slaat marquees over die al lopen (fb-booster-initialized).
const carouselTickerSrc = 'https://cdn.jsdelivr.net/npm/@flowbase-co/boosters-carousel-ticker@1.3.3/dist/carousel-ticker.js';

function initCarouselTicker() {
  const script = document.createElement('script');
  script.src = carouselTickerSrc;
  script.onload = () => script.remove();
  document.body.appendChild(script);
}

// -----------------------------------------
// PAGE TRANSITIONS
// -----------------------------------------

function runPageOnceAnimation(next) {
  const tl = gsap.timeline();

  tl.call(() => {
    resetPage(next);
  }, null, 0);

  return tl;
}

// Masked window (naar Osmo): de nieuwe pagina verschijnt in een klein afgerond
// venster onderin, dat omhoog schuift en uitgroeit tot volledig scherm.
// De oude pagina schuift iets omhoog en wordt donkerder.
const windowDuration = 1.3;

// Waarden in % van het scherm; de container zelf is langer dan het scherm,
// dus de onderkant rekenen we om naar px vanaf de onderkant van de container
function windowInset(el, t, side, b, r) {
  const vh = window.innerHeight;
  const vw = window.innerWidth;
  const below = Math.max(0, el.offsetHeight - vh);
  return `inset(${(t * vh) / 100}px ${(side * vw) / 100}px ${below + (b * vh) / 100}px round ${r}em)`;
}

function runPageLeaveAnimation(current, next) {
  const tl = gsap.timeline({
    onComplete: () => {
      current.remove();
      shade.remove();
    },
  });

  const shade = document.createElement('div');
  shade.className = 'transition__shade';
  document.body.appendChild(shade);

  if (reducedMotion) {
    // Immediate swap behavior if user prefers reduced motion
    return tl.set(current, { autoAlpha: 0 });
  }

  tl.fromTo(shade, { opacity: 0 }, {
    opacity: 0.35,
    duration: windowDuration,
  }, 0);

  tl.to(current, {
    y: () => -window.innerHeight * 0.06,
    duration: windowDuration,
  }, 0);

  return tl;
}

function runPageEnterAnimation(next) {
  const tl = gsap.timeline();

  if (reducedMotion) {
    // Immediate swap behavior if user prefers reduced motion
    tl.set(next, { autoAlpha: 1 });
    tl.add('pageReady');
    tl.call(resetPage, [next], 'pageReady');
    return new Promise((resolve) => tl.call(resolve, null, 'pageReady'));
  }

  // Venster: smal en laag onderin, halverwege midden in beeld, daarna vol scherm
  const narrow = window.innerWidth < 768 ? 46 : 48.5;
  const mask = { t: 94, side: narrow, b: 3, r: 0.75 };
  const applyMask = () => {
    next.style.clipPath = windowInset(next, mask.t, mask.side, mask.b, mask.r);
  };
  applyMask();

  tl.to(mask, {
    keyframes: {
      '45%': { t: 28, side: 28, b: 28, r: 1 },
      '100%': { t: 0, side: 0, b: 0, r: 0 },
      easeEach: 'power1.inOut',
    },
    duration: windowDuration,
    ease: 'osmo',
    onUpdate: applyMask,
  }, 0);

  tl.add('pageReady');
  tl.call(() => {
    next.style.clipPath = '';
    resetPage(next);
  }, null, 'pageReady');

  return new Promise((resolve) => {
    tl.call(resolve, null, 'pageReady');
  });
}

// -----------------------------------------
// BARBA HOOKS + INIT
// -----------------------------------------

barba.hooks.beforeEnter((data) => {
  // Position new container on top
  // Nieuwe container bovenop de oude (het venster is een clip-path)
  gsap.set(data.next.container, {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 2,
  });

  if (lenis && typeof lenis.stop === 'function') {
    lenis.stop();
  }

  initBeforeEnterFunctions(data.next.container);
  applyThemeFrom(data.next.container);
});

barba.hooks.afterLeave(() => {
  if (hasScrollTrigger) {
    ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
  }
});

barba.hooks.enter((data) => {
  initBarbaNavUpdate(data);
});

barba.hooks.afterEnter((data) => {
  // Run page functions
  initAfterEnterFunctions(data.next.container);

  // Settle
  if (hasLenis) {
    lenis.resize();
    lenis.start();
  }

  if (hasScrollTrigger) {
    ScrollTrigger.refresh();
  }
});

barba.init({
  debug: true, // Set to 'false' in production
  timeout: 7000,
  preventRunning: true,
  transitions: [
    {
      name: 'default',
      sync: true,

      // First load
      async once(data) {
        initOnceFunctions();

        return runPageOnceAnimation(data.next.container);
      },

      // Current page leaves
      async leave(data) {
        return runPageLeaveAnimation(data.current.container, data.next.container);
      },

      // New page enters
      async enter(data) {
        return runPageEnterAnimation(data.next.container);
      },
    },
  ],
});

// -----------------------------------------
// GENERIC + HELPERS
// -----------------------------------------

const themeConfig = {
  light: {
    nav: 'dark',
    transition: 'light',
  },
  dark: {
    nav: 'light',
    transition: 'dark',
  },
};

function applyThemeFrom(container) {
  const pageTheme = container?.dataset?.pageTheme || 'light';
  const config = themeConfig[pageTheme] || themeConfig.light;

  document.body.dataset.pageTheme = pageTheme;
  const transitionEl = document.querySelector('[data-theme-transition]');
  if (transitionEl) {
    transitionEl.dataset.themeTransition = config.transition;
  }

  const nav = document.querySelector('[data-theme-nav]');
  if (nav) {
    nav.dataset.themeNav = config.nav;
  }
}

function initLenis() {
  if (lenis) return; // already created
  if (!hasLenis) return;

  lenis = new Lenis({
    lerp: 0.165,
    wheelMultiplier: 1.25,
  });

  if (hasScrollTrigger) {
    lenis.on('scroll', ScrollTrigger.update);
  }

  gsap.ticker.add((time) => {
    lenis.raf(time * 1000);
  });

  gsap.ticker.lagSmoothing(0);
}

function resetPage(container) {
  window.scrollTo(0, 0);
  gsap.set(container, { clearProps: 'position,top,left,right,zIndex' });

  if (hasLenis) {
    lenis.resize();
    lenis.start();
  }
}

function debounceOnWidthChange(fn, ms) {
  let last = innerWidth,
    timer;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => {
      if (innerWidth !== last) {
        last = innerWidth;
        fn.apply(this, args);
      }
    }, ms);
  };
}

function initBarbaNavUpdate(data) {
  var tpl = document.createElement('template');
  tpl.innerHTML = data.next.html.trim();
  var nextNodes = tpl.content.querySelectorAll('[data-barba-update]');
  var currentNodes = document.querySelectorAll('nav [data-barba-update]');

  currentNodes.forEach(function (curr, index) {
    var next = nextNodes[index];
    if (!next) return;

    // Aria-current sync
    var newStatus = next.getAttribute('aria-current');
    if (newStatus !== null) {
      curr.setAttribute('aria-current', newStatus);
    } else {
      curr.removeAttribute('aria-current');
    }

    // Class list sync
    var newClassList = next.getAttribute('class') || '';
    curr.setAttribute('class', newClassList);
  });
}

// -----------------------------------------
// YOUR FUNCTIONS GO BELOW HERE
// -----------------------------------------

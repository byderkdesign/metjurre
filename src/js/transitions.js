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
  initImagePreload();
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

// Stacked cards (naar Osmo): de oude pagina wordt een kaart die iets krimpt en
// wegzakt, met een groene kaart en de nieuwe pagina erachter op een donkere achtergrond.
// De kaarten schuiven naar beneden weg en de nieuwe pagina groeit terug naar vol scherm.
// Het menu staat buiten de Barba-container en blijft dus de hele tijd in beeld.
let leaveTimeline = null;

function runPageLeaveAnimation(current, next) {
  const root = document.documentElement;
  const parent = current.parentElement || document.body;
  const { wrapper } = prepareForTransition(parent, current, next);
  const middle = document.querySelector('[data-transition-middle]');

  const tl = gsap.timeline({
    onComplete: () => {
      wrapper.remove();
      gsap.set(next, { clearProps: 'position,top,left,right,width,height,overflow,zIndex,willChange,transform,clipPath' });
      if (middle) gsap.set(middle, { clearProps: 'willChange,transform,clipPath', autoAlpha: 0 });
      root.classList.remove('is-page-transition');
    },
  });
  leaveTimeline = tl;

  if (reducedMotion) {
    // Immediate swap behavior if user prefers reduced motion
    return tl.set(wrapper, { autoAlpha: 0 });
  }

  const cards = [wrapper, middle, next].filter(Boolean);
  const round = window.innerWidth < 768 ? '0.75em' : '1em';

  // Vlak voordat de oude pagina wegschuift en de nieuwe in beeld komt: als de foto's
  // bovenin de nieuwe pagina nog laden, houden we de kaarten even vast (maximaal
  // imageWaitMax), zodat een foto niet halverwege de overgang in beeld springt
  let imagesReady = false;
  const images = waitForImages(next).then(() => (imagesReady = true));
  tl.call(() => {
    if (imagesReady) return;
    tl.pause();
    images.then(() => tl.resume());
  }, null, 0.6);

  // Kaarten maken: afronden en iets krimpen, de achterste het meest
  tl.to(cards, { clipPath: `rect(0% 100% 100% 0% round ${round})`, duration: 0.5 }, 0);
  tl.to(wrapper, { scale: 0.95, yPercent: 20, duration: 0.8, ease: 'expo.inOut' }, 0);
  if (middle) tl.to(middle, { scale: 0.875, yPercent: 10, duration: 0.8, ease: 'expo.inOut' }, 0);
  tl.to(next, { scale: 0.8, duration: 0.8, ease: 'expo.inOut' }, 0);

  // Oude pagina en groene kaart naar beneden weg, nieuwe pagina groeit terug
  tl.to(wrapper, { yPercent: 130, duration: 0.8 }, 0.6);
  if (middle) tl.to(middle, { yPercent: 120, duration: 0.8 }, 0.7);
  tl.to(next, { scale: 1, duration: 0.8, ease: 'expo.inOut' }, 0.8);
  tl.to(next, { clipPath: 'rect(0% 100% 100% 0% round 0em)', duration: 0.5 }, 1.1);

  return tl;
}

function runPageEnterAnimation(next) {
  // Klaar zodra de kaarten weg zijn; pas dan staat de nieuwe pagina weer gewoon in de flow
  const done = () => resetPage(next);
  return leaveTimeline ? leaveTimeline.then(done) : Promise.resolve(done());
}

function prepareForTransition(parent, current, next) {
  // De oude pagina in een wrapper, zodat die als geheel kan bewegen
  const wrapper = document.createElement('div');
  wrapper.className = 'page-transition__wrapper';
  parent.insertBefore(wrapper, current);
  wrapper.appendChild(current);

  // Scrollpositie vasthouden, zodat de oude pagina niet verspringt
  const scrollY = window.scrollY || 0;
  window.scrollTo(0, 0);

  const middle = document.querySelector('[data-transition-middle]');

  document.documentElement.classList.add('is-page-transition');

  gsap.set(wrapper, {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    width: '100%',
    height: '100vh',
    overflow: 'clip',
    zIndex: 3,
    willChange: 'transform',
    clipPath: 'rect(0% 100% 100% 0% round 0em)',
  });

  gsap.set(current, {
    position: 'absolute',
    top: -scrollY,
    left: 0,
    width: '100%',
  });

  // De footer staat buiten de Barba-container: een kopie gaat mee in de oude kaart,
  // het origineel is tijdens de overgang verborgen (base.css)
  const footer = document.querySelector('.site-footer');
  if (footer) {
    const footerCopy = footer.cloneNode(true);
    footerCopy.removeAttribute('id');
    gsap.set(footerCopy, { position: 'absolute', top: current.offsetHeight - scrollY, left: 0, width: '100%' });
    wrapper.appendChild(footerCopy);
  }

  if (middle) {
    gsap.set(middle, {
      willChange: 'transform',
      autoAlpha: 1,
      yPercent: 0,
      scale: 1,
      clipPath: 'rect(0% 100% 100% 0% round 0em)',
    });
  }

  gsap.set(next, {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    width: '100%',
    height: '100vh',
    overflow: 'clip',
    zIndex: 1,
    willChange: 'transform',
    autoAlpha: 1,
    yPercent: 0,
    scale: 1,
    clipPath: 'rect(0% 100% 100% 0% round 0em)',
  });

  return { wrapper, scrollY };
}

// -----------------------------------------
// BEELDEN VAN DE NIEUWE PAGINA
// -----------------------------------------

// Foto's die bij binnenkomst in beeld staan: niet lazy laden en wachten tot ze
// gedecodeerd zijn, of tot imageWaitMax voorbij is (trage verbinding)
const imageWaitMax = 1200;

function waitForImages(container) {
  const images = [...container.querySelectorAll('img')].filter((img) => {
    const rect = img.getBoundingClientRect();
    return rect.width > 0 && rect.height > 0 && rect.top < window.innerHeight;
  });

  const decoded = images.map((img) => {
    img.loading = 'eager';
    img.fetchPriority = 'high';
    return img.decode ? img.decode().catch(() => {}) : Promise.resolve();
  });

  const timeout = new Promise((resolve) => setTimeout(resolve, imageWaitMax));
  return Promise.race([Promise.all(decoded), timeout]);
}

// Barba haalt een pagina al op bij hover of touch. Zodra die HTML er is, laden we ook
// de foto's uit de eerste sectie, zodat ze bij de klik meestal al klaar zijn.
const preloadedImages = new Set();

function preloadImagesFrom(html) {
  const doc = new DOMParser().parseFromString(html, 'text/html');
  const firstSection = doc.querySelector('[data-barba="container"] > *');
  if (!firstSection) return;

  firstSection.querySelectorAll('img').forEach((source) => {
    const key = source.getAttribute('srcset') || source.getAttribute('src');
    if (!key || preloadedImages.has(key)) return;
    preloadedImages.add(key);

    const img = new Image();
    if (source.getAttribute('sizes')) img.sizes = source.getAttribute('sizes');
    if (source.getAttribute('srcset')) img.srcset = source.getAttribute('srcset');
    img.src = source.getAttribute('src');
  });
}

function initImagePreload() {
  const onIntent = (e) => {
    const link = e.target.closest?.('a[href]');
    if (!link || link.target === '_blank') return;
    const href = link.href;
    if (!href || new URL(href).origin !== location.origin) return;

    // Na de eigen hover-handler van Barba, die het verzoek in de cache zet
    setTimeout(() => {
      const cached = barba.cache?.get(href);
      cached?.request?.then?.((response) => response?.html && preloadImagesFrom(response.html)).catch(() => {});
    }, 0);
  };

  document.addEventListener('mouseover', onIntent, { passive: true });
  document.addEventListener('touchstart', onIntent, { passive: true });
  document.addEventListener('focusin', onIntent);
}

// -----------------------------------------
// BARBA HOOKS + INIT
// -----------------------------------------

barba.hooks.beforeEnter((data) => {
  // Nieuwe container vast in beeld, achter de oude (zie prepareForTransition)
  gsap.set(data.next.container, {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
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

// Pagina's alvast ophalen bij hover, zodat de overgang direct start na een klik
if (window.barbaPrefetch) barba.use(barbaPrefetch);

barba.init({
  debug: false,
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

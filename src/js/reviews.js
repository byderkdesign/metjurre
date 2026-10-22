// -----------------------------------------
// REVIEWS (homepage)
// - Zet het aantal reviews in [data-review-count]
// - Slider met voortgangsbalk en pijlen (Swiper 8)
// Draait op window load, net als de podcastslider.
// -----------------------------------------

function initReviews(scope = document) {
  scope.querySelectorAll('[data-reviews]').forEach((section) => {
    const swiperEl = section.querySelector('.reviews__swiper');
    const items = section.querySelectorAll('.reviews__item');
    if (!swiperEl || !items.length) return;

    section.querySelectorAll('[data-review-count]').forEach((el) => {
      el.textContent = `${items.length} ervaringen`;
    });

    // Voorkom dubbele initialisatie, vooral met Barba
    if (swiperEl.swiper) swiperEl.swiper.destroy(true, true);

    const progress = section.querySelector('[data-reviews-progress]');

    new Swiper(swiperEl, {
      wrapperClass: 'reviews__list',
      slideClass: 'reviews__item',
      slidesPerView: 'auto',
      spaceBetween: 16,
      speed: 600,
      grabCursor: true,
      watchSlidesProgress: true,
      keyboard: { enabled: true, onlyInViewport: true },
      mousewheel: { forceToAxis: true },
      breakpoints: {
        768: { spaceBetween: 24 },
      },
      navigation: {
        prevEl: section.querySelector('[data-reviews-prev]'),
        nextEl: section.querySelector('[data-reviews-next]'),
        disabledClass: 'is-disabled',
      },
      scrollbar: progress && {
        el: progress,
        draggable: true,
        dragClass: 'reviews__progress-bar',
        snapOnRelease: true,
      },
      a11y: {
        prevSlideMessage: 'Vorige review',
        nextSlideMessage: 'Volgende review',
      },
    });
  });
}

window.addEventListener('load', () => initReviews());

if (window.barba) {
  barba.hooks.afterEnter((data) => initReviews(data.next.container));
}

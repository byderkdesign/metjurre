// -----------------------------------------
// PODCAST SWIPER (homepage)
// Vereist: jQuery (Webflow) en Swiper 8
// -----------------------------------------

function initSwiper() {
  $('.slider-main_component').each(function () {
    const component = $(this);
    const swiperEl = component.find('.swiper')[0];

    if (!swiperEl) return;

    // Voorkom dubbele Swiper initialisatie, vooral met Barba
    if (swiperEl.swiper) {
      swiperEl.swiper.destroy(true, true);
    }

    let sliderDuration = 500;

    if (component.attr('slider-duration') !== undefined) {
      sliderDuration = Number(component.attr('slider-duration'));
    }

    const swiper = new Swiper(swiperEl, {
      speed: sliderDuration,

      loop: true,

      autoplay: {
        delay: 3000,
        disableOnInteraction: false,
      },

      autoHeight: false,
      centeredSlides: false,
      grabCursor: true,
      followFinger: true,
      freeMode: false,
      slideToClickedSlide: false,
      slidesPerView: 1,
      spaceBetween: 16,
      rewind: false,
      parallax: true,

      mousewheel: {
        forceToAxis: true,
      },

      keyboard: {
        enabled: true,
        onlyInViewport: true,
      },

      breakpoints: {
        480: {
          slidesPerView: 1,
          spaceBetween: 16,
        },
        768: {
          slidesPerView: 2,
          spaceBetween: 24,
        },
        992: {
          slidesPerView: 3,
          spaceBetween: 24,
        },
      },

      pagination: {
        el: component.find('.swiper-bullet-wrapper')[0],
        bulletActiveClass: 'is-active',
        bulletClass: 'swiper-bullet',
        bulletElement: 'button',
        clickable: true,
      },

      navigation: {
        nextEl: component.find('.swiper-next')[0],
        prevEl: component.find('.swiper-prev')[0],
        disabledClass: 'is-disabled',
      },

      scrollbar: {
        el: component.find('.swiper-drag-wrapper')[0],
        draggable: true,
        dragClass: 'swiper-drag',
        snapOnRelease: true,
      },

      slideActiveClass: 'is-active',
      slideDuplicateActiveClass: 'is-active',

      observer: true,
      observeParents: true,
    });

    swiper.update();
  });
}

window.addEventListener('load', function () {
  initSwiper();
});

if (window.barba) {
  barba.hooks.afterEnter(function () {
    initSwiper();
  });
}

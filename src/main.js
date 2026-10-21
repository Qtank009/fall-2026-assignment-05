/**
 * mag² - Main Application Script
 * Handles bidirectional scroll-triggered section slide-atop animations
 * and single-product configurator with image carousel for the Store Page.
 */

import productData from './data/products.json';

document.addEventListener('DOMContentLoaded', () => {
  initScrollSlideAnimations();
  initStoreConfigurator();
});

/**
 * Initializes the Single Product Configurator on the Store page:
 * - Standard image carousel cycling through all finish & accessory SVGs
 * - Coating selection (Required) dynamically updates main cube SVG
 * - Stickers, spring pack, and stand options update price without changing main cube image
 * - Real-time price breakdown computation
 */
function initStoreConfigurator() {
  const carousel = document.getElementById('cube-carousel');
  const mainImage = document.getElementById('main-product-image');
  const captionEl = document.getElementById('carousel-caption');
  const counterEl = document.getElementById('carousel-counter');
  const prevBtn = document.getElementById('carousel-prev');
  const nextBtn = document.getElementById('carousel-next');
  const thumbnailsTrack = document.getElementById('carousel-thumbnails');

  const configForm = document.getElementById('configurator-form');
  const totalPriceEl = document.getElementById('total-price');
  const priceBreakdownEl = document.getElementById('price-breakdown');
  const coatingCardsContainer = document.getElementById('coating-cards-container');
  const stickersSelect = document.getElementById('stickers-select');
  const springPackCheck = document.getElementById('addon-spring-pack');
  const billetStandCheck = document.getElementById('addon-billet-stand');
  const cardSpringPack = document.getElementById('card-spring-pack');
  const cardBilletStand = document.getElementById('card-billet-stand');

  // If not on the store configurator page, exit cleanly
  if (!carousel || !mainImage || !configForm) {
    return;
  }

  // Carousel Slides data (9 total SVGs covering all coating and accessory options)
  const slides = productData.carouselSlides || [
    {
      id: 'slide-mono',
      title: 'Raw Mono Silver Coating',
      caption: 'Mono Silver Finish (Raw WE43 Magnesium)',
      imageUrl: './images/mag2-flagship.svg'
    },
    {
      id: 'slide-cobalt',
      title: 'Anodized Cobalt Slate Coating',
      caption: 'Anodized Cobalt Slate Finish',
      imageUrl: './images/cube-cobalt.svg'
    },
    {
      id: 'slide-uv',
      title: 'Ceramic UV Gloss Coating',
      caption: 'Ceramic UV Gloss Coating',
      imageUrl: './images/cube-ceramic-uv.svg'
    },
    {
      id: 'slide-stickers-comp',
      title: 'Competition Pro Sticker Set',
      caption: 'Competition Pro Vinyl Sticker Set (6 Faces)',
      imageUrl: './images/stickers-competition.svg'
    },
    {
      id: 'slide-stickers-carbon',
      title: 'Carbon Weave Sticker Set',
      caption: 'Carbon Weave Textured Sticker Set',
      imageUrl: './images/stickers-carbon.svg'
    },
    {
      id: 'slide-stickers-glow',
      title: 'Luminescent Night Glow Sticker Set',
      caption: 'Luminescent Night Glow Sticker Set',
      imageUrl: './images/stickers-glow.svg'
    },
    {
      id: 'slide-springs',
      title: 'Calibrated Tension Spring Pack',
      caption: 'Calibrated Tension Spring Pack (12 Springs + Washers)',
      imageUrl: './images/springs-tension.svg'
    },
    {
      id: 'slide-stand',
      title: 'CNC Billet Aluminum Stand',
      caption: 'CNC Billet Aluminum Display Stand',
      imageUrl: './images/stand-billet.svg'
    }
  ];

  // Mapping from coating option ID to its corresponding slide index
  const coatingSlideMap = {
    'mono-silver': 0,
    'anodized-cobalt': 1,
    'ceramic-uv': 2
  };

  let currentSlideIndex = 0;

  // Render carousel thumbnails
  if (thumbnailsTrack) {
    thumbnailsTrack.innerHTML = slides
      .map(
        (slide, idx) => `
        <button
          type="button"
          class="carousel-thumb-btn ${idx === 0 ? 'active' : ''}"
          data-slide-index="${idx}"
          aria-label="View ${escapeHtml(slide.title)}"
        >
          <img src="${slide.imageUrl}" alt="" class="thumb-img" loading="lazy" />
        </button>
      `
      )
      .join('');

    // Thumbnail click listener
    thumbnailsTrack.querySelectorAll('.carousel-thumb-btn').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const targetIdx = parseInt(e.currentTarget.getAttribute('data-slide-index'), 10);
        if (!isNaN(targetIdx)) {
          showSlide(targetIdx);
        }
      });
    });
  }

  /**
   * Displays a slide in the standard carousel.
   * Updates main image, caption, counter, and active thumbnail.
   */
  function showSlide(index) {
    currentSlideIndex = (index + slides.length) % slides.length;
    const slide = slides[currentSlideIndex];

    // Smooth transition on main image
    mainImage.classList.add('fade-out');
    setTimeout(() => {
      mainImage.src = slide.imageUrl;
      mainImage.alt = slide.title;
      mainImage.classList.remove('fade-out');
    }, 120);

    if (captionEl) {
      captionEl.innerHTML = slide.caption;
    }

    if (counterEl) {
      counterEl.textContent = `${currentSlideIndex + 1} / ${slides.length}`;
    }

    if (thumbnailsTrack) {
      const thumbs = thumbnailsTrack.querySelectorAll('.carousel-thumb-btn');
      thumbs.forEach((th, idx) => {
        th.classList.toggle('active', idx === currentSlideIndex);
      });
      // Scroll active thumbnail into view smoothly
      const activeThumb = thumbs[currentSlideIndex];
      if (activeThumb) {
        activeThumb.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      }
    }
  }

  // Previous and Next Carousel button listeners
  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      showSlide(currentSlideIndex - 1);
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      showSlide(currentSlideIndex + 1);
    });
  }

  /**
   * Helper to escape HTML characters
   */
  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  /**
   * Updates total price and breakdown based on selected configuration.
   */
  function updatePricing() {
    const selectedCoatingRadio = configForm.querySelector('input[name="coating"]:checked');
    const selectedCoatingId = selectedCoatingRadio ? selectedCoatingRadio.value : 'mono-silver';

    // 1. Coating Base Price
    let basePrice = 149.99;
    let coatingName = 'Raw Mono Silver';
    if (selectedCoatingId === 'anodized-cobalt') {
      basePrice = 169.99;
      coatingName = 'Anodized Cobalt Slate';
    } else if (selectedCoatingId === 'ceramic-uv') {
      basePrice = 179.99;
      coatingName = 'Ceramic UV Gloss';
    }

    let totalPrice = basePrice;
    const breakdownParts = [`Base: $${basePrice.toFixed(2)} (${coatingName})`];

    // 2. Stickers Option (Optional)
    if (stickersSelect) {
      const selectedOption = stickersSelect.options[stickersSelect.selectedIndex];
      const stickerPrice = parseFloat(selectedOption.getAttribute('data-price')) || 0;
      if (stickerPrice > 0) {
        totalPrice += stickerPrice;
        breakdownParts.push(`Stickers: +$${stickerPrice.toFixed(2)}`);
      }
    }

    // 3. Spring Pack Add-on (Optional)
    if (springPackCheck && springPackCheck.checked) {
      const springPrice = parseFloat(springPackCheck.getAttribute('data-price')) || 19.99;
      totalPrice += springPrice;
      breakdownParts.push(`Spring Pack: +$${springPrice.toFixed(2)}`);
      if (cardSpringPack) cardSpringPack.classList.add('checked');
    } else if (cardSpringPack) {
      cardSpringPack.classList.remove('checked');
    }

    // 4. Billet Stand Add-on (Optional)
    if (billetStandCheck && billetStandCheck.checked) {
      const standPrice = parseFloat(billetStandCheck.getAttribute('data-price')) || 29.99;
      totalPrice += standPrice;
      breakdownParts.push(`Stand: +$${standPrice.toFixed(2)}`);
      if (cardBilletStand) cardBilletStand.classList.add('checked');
    } else if (cardBilletStand) {
      cardBilletStand.classList.remove('checked');
    }

    // Update DOM price displays
    if (totalPriceEl) {
      totalPriceEl.textContent = totalPrice.toFixed(2);
    }
    if (priceBreakdownEl) {
      priceBreakdownEl.textContent = breakdownParts.join(' • ');
    }
  }

  // --- COATING SELECTION LISTENER (REQUIRED CHOICE) ---
  // Note: Selecting coating directly changes the main cube image!
  if (coatingCardsContainer) {
    coatingCardsContainer.querySelectorAll('input[name="coating"]').forEach((radio) => {
      radio.addEventListener('change', (e) => {
        const coatingId = e.target.value;

        // Update active class on coating card labels
        coatingCardsContainer.querySelectorAll('.coating-card').forEach((card) => {
          card.classList.toggle('active', card.getAttribute('data-coating-id') === coatingId);
        });

        // Change main cube image to selected coating SVG
        if (coatingSlideMap.hasOwnProperty(coatingId)) {
          showSlide(coatingSlideMap[coatingId]);
        }

        // Recalculate price
        updatePricing();
      });
    });
  }

  // --- STICKERS SELECTION LISTENER (NOT REQUIRED) ---
  // Note: Selecting stickers does NOT change the main cube image
  if (stickersSelect) {
    stickersSelect.addEventListener('change', () => {
      updatePricing();
    });
  }

  // --- SPRING PACK & STAND ADD-ONS LISTENERS (OPTIONAL) ---
  // Note: Selecting these options does NOT change the main cube image
  if (springPackCheck) {
    springPackCheck.addEventListener('change', () => {
      updatePricing();
    });
  }

  if (billetStandCheck) {
    billetStandCheck.addEventListener('change', () => {
      updatePricing();
    });
  }

  // Form submission feedback
  configForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const btn = document.getElementById('configure-btn');
    if (btn) {
      const originalText = btn.textContent;
      btn.textContent = 'Configuration Reserved ✓';
      btn.style.background = '#22c55e';
      btn.style.color = '#050811';
      setTimeout(() => {
        btn.textContent = originalText;
        btn.style.background = '';
        btn.style.color = '';
      }, 3000);
    }
  });

  // Initial pricing calculation & initial slide display
  updatePricing();
  showSlide(0);
}

/**
 * Initializes fast, discernible scroll slide-atop animations for sections in both directions.
 * When scrolling down: incoming sections slide up from below (translateY: 75px -> 0).
 * When scrolling up: incoming sections slide down from above (translateY: -75px -> 0).
 * Off-screen sections reset cleanly without visual pops.
 */
function initScrollSlideAnimations() {
  const sections = document.querySelectorAll('.scroll-slide-section');
  if (!sections.length) return;

  // Mark document as ready for scroll animations
  document.documentElement.classList.add('js-scroll-ready');

  let lastScrollY = window.scrollY;
  let scrollDirection = 'down';
  let ticking = false;

  function evaluateSections() {
    const currentScrollY = window.scrollY;
    const windowHeight = window.innerHeight;

    // Detect scroll direction
    if (currentScrollY > lastScrollY) {
      scrollDirection = 'down';
    } else if (currentScrollY < lastScrollY) {
      scrollDirection = 'up';
    }
    lastScrollY = currentScrollY;

    sections.forEach((section) => {
      const rect = section.getBoundingClientRect();

      // Check if section is currently inside visible range
      const isVisible = rect.top < windowHeight * 0.92 && rect.bottom > windowHeight * 0.08;

      if (isVisible) {
        // Section is in view: activate animation
        section.classList.add('slide-in-view');
      } else if (rect.top >= windowHeight) {
        // Section is completely below the viewport:
        // Reset and prepare to slide UP when scrolling down
        section.classList.remove('slide-in-view');
        section.classList.remove('slide-from-top');
        section.classList.add('slide-from-bottom');
      } else if (rect.bottom <= 0) {
        // Section is completely above the viewport:
        // Reset and prepare to slide DOWN when scrolling back up
        section.classList.remove('slide-in-view');
        section.classList.remove('slide-from-bottom');
        section.classList.add('slide-from-top');
      }
    });

    ticking = false;
  }

  // Pre-seed initial direction classes based on initial layout
  sections.forEach((section) => {
    const rect = section.getBoundingClientRect();
    if (rect.top >= window.innerHeight) {
      section.classList.add('slide-from-bottom');
    } else if (rect.bottom <= 0) {
      section.classList.add('slide-from-top');
    } else {
      section.classList.add('slide-in-view');
    }
  });

  // Run on page load
  evaluateSections();

  // Scroll listener throttled via requestAnimationFrame (smooth 60/120fps performance)
  window.addEventListener(
    'scroll',
    () => {
      if (!ticking) {
        window.requestAnimationFrame(evaluateSections);
        ticking = true;
      }
    },
    { passive: true }
  );

  // Re-evaluate on window resize
  window.addEventListener(
    'resize',
    () => {
      if (!ticking) {
        window.requestAnimationFrame(evaluateSections);
        ticking = true;
      }
    },
    { passive: true }
  );
}

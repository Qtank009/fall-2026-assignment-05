/**
 * mag² - Main Application Script
 * Handles bidirectional scroll-triggered section slide-atop animations
 * (both scrolling down and scrolling up) with dark blue to charcoal aesthetics.
 */

document.addEventListener('DOMContentLoaded', () => {
  initScrollSlideAnimations();
});

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

'use strict';

/**
 * enhance.js — Portfolio v2.0 interaction layer.
 *
 * Loaded alongside (not instead of) script.js. Every feature here is additive
 * and defensive: if an element is missing, that feature quietly no-ops.
 *
 * Performance rules followed throughout:
 *  - scroll/mouse work is batched into a single requestAnimationFrame
 *  - visibility work uses IntersectionObserver, never scroll math
 *  - only `transform` and `opacity` are animated (compositor-only)
 *  - listeners that only read are registered as `{ passive: true }`
 */

(function () {
  const prefersReducedMotion = window.matchMedia(
    '(prefers-reduced-motion: reduce)'
  ).matches;

  const supportsHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  /* ---------------------------------------------------------------
   * Preloader + page entrance
   * ------------------------------------------------------------- */
  function initPreloader() {
    const preloader = document.querySelector('[data-preloader]');
    if (!preloader) {
      document.body.classList.add('is-ready');
      return;
    }

    const reveal = () => {
      preloader.classList.add('is-done');
      document.body.classList.add('is-ready');
      // Drop it from the a11y tree and the paint budget once faded out.
      window.setTimeout(() => preloader.remove(), 700);
    };

    if (document.readyState === 'complete') {
      window.setTimeout(reveal, prefersReducedMotion ? 0 : 350);
    } else {
      window.addEventListener('load', () =>
        window.setTimeout(reveal, prefersReducedMotion ? 0 : 350)
      );
    }
  }

  /* ---------------------------------------------------------------
   * Scroll progress bar
   * ------------------------------------------------------------- */
  function initScrollProgress() {
    const bar = document.querySelector('[data-scroll-progress]');
    if (!bar) return;

    let ticking = false;

    const update = () => {
      const doc = document.documentElement;
      const scrollable = doc.scrollHeight - window.innerHeight;
      const ratio = scrollable > 0 ? window.scrollY / scrollable : 0;
      bar.style.transform = `scaleX(${Math.min(1, Math.max(0, ratio))})`;
      ticking = false;
    };

    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(update);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    update();
  }

  /* ---------------------------------------------------------------
   * Scroll reveals + skill bars
   * ------------------------------------------------------------- */
  let revealObserver = null;

  function initReveals() {
    const targets = document.querySelectorAll('[data-reveal], .skills-item');
    if (!targets.length) return;

    // Pull each skill's width out of the inline style set in the HTML so CSS
    // can animate it from 0 when the bar scrolls into view.
    document.querySelectorAll('.skills-item').forEach((item) => {
      const fill = item.querySelector('.skill-progress-fill');
      if (fill && fill.style.width) {
        item.style.setProperty('--skill-width', fill.style.width);
        fill.style.removeProperty('width');
      }
    });

    if (!('IntersectionObserver' in window) || prefersReducedMotion) {
      targets.forEach((el) => el.classList.add('is-visible'));
      return;
    }

    revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target); // reveal once, then stop watching
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -8% 0px' }
    );

    targets.forEach((el) => revealObserver.observe(el));
  }

  /**
   * Tab-switched articles are `display: none`, so anything inside them never
   * intersects. When a page becomes active, stagger-reveal its contents.
   */
  function initPageRevealSync() {
    const navLinks = document.querySelectorAll('[data-nav-link]');
    if (!navLinks.length) return;

    const revealActivePage = () => {
      const page = document.querySelector('[data-page].active');
      if (!page) return;

      const items = page.querySelectorAll(
        '[data-reveal]:not(.is-visible), .skills-item:not(.is-visible)'
      );
      items.forEach((el, i) => {
        el.style.setProperty('--reveal-delay', `${Math.min(i * 55, 440)}ms`);
        // Next frame so the transition actually runs after `display` flips.
        window.requestAnimationFrame(() => el.classList.add('is-visible'));
        if (revealObserver) revealObserver.unobserve(el);
      });
    };

    navLinks.forEach((link) => {
      link.addEventListener('click', () => {
        window.requestAnimationFrame(revealActivePage);
      });
    });
  }

  /* ---------------------------------------------------------------
   * Back to top
   * ------------------------------------------------------------- */
  function initBackToTop() {
    const btn = document.querySelector('[data-to-top]');
    if (!btn) return;

    let ticking = false;

    const update = () => {
      btn.classList.toggle('is-visible', window.scrollY > 420);
      ticking = false;
    };

    window.addEventListener(
      'scroll',
      () => {
        if (ticking) return;
        ticking = true;
        window.requestAnimationFrame(update);
      },
      { passive: true }
    );

    btn.addEventListener('click', () => {
      window.scrollTo({
        top: 0,
        behavior: prefersReducedMotion ? 'auto' : 'smooth',
      });
    });
  }

  /* ---------------------------------------------------------------
   * Toast (used by copy-to-clipboard)
   * ------------------------------------------------------------- */
  let toastTimer = null;

  function showToast(message) {
    const toast = document.querySelector('[data-toast]');
    if (!toast) return;

    toast.textContent = message;
    toast.classList.add('is-visible');

    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(
      () => toast.classList.remove('is-visible'),
      2000
    );
  }

  /* ---------------------------------------------------------------
   * Copy email
   * ------------------------------------------------------------- */
  function initCopyEmail() {
    const btn = document.querySelector('[data-copy-email]');
    if (!btn) return;

    const email = btn.dataset.copyEmail;

    btn.addEventListener('click', async () => {
      try {
        if (navigator.clipboard && window.isSecureContext) {
          await navigator.clipboard.writeText(email);
        } else {
          // Fallback for non-secure contexts / older browsers.
          const helper = document.createElement('textarea');
          helper.value = email;
          helper.setAttribute('readonly', '');
          helper.style.position = 'fixed';
          helper.style.opacity = '0';
          document.body.appendChild(helper);
          helper.select();
          document.execCommand('copy');
          helper.remove();
        }
        showToast('Email copied to clipboard');
      } catch (error) {
        showToast('Press Ctrl+C to copy');
      }
    });
  }

  /* ---------------------------------------------------------------
   * Magnetic buttons + pointer lighting
   * Desktop, fine-pointer only — no cost on touch devices.
   * ------------------------------------------------------------- */
  function initMagnetic() {
    if (!supportsHover || prefersReducedMotion) return;

    const magnets = document.querySelectorAll('[data-magnetic]');

    magnets.forEach((el) => {
      let frame = null;

      const move = (event) => {
        if (frame) return;
        frame = window.requestAnimationFrame(() => {
          const rect = el.getBoundingClientRect();
          const x = event.clientX - rect.left - rect.width / 2;
          const y = event.clientY - rect.top - rect.height / 2;
          el.style.transform = `translate3d(${x * 0.18}px, ${y * 0.24}px, 0)`;
          frame = null;
        });
      };

      const reset = () => {
        if (frame) {
          window.cancelAnimationFrame(frame);
          frame = null;
        }
        el.style.transform = '';
      };

      el.addEventListener('pointermove', move);
      el.addEventListener('pointerleave', reset);
      el.addEventListener('blur', reset);
    });
  }

  /**
   * Soft light that follows the cursor across cards. Written to CSS custom
   * properties on the card itself so the browser only repaints that element.
   */
  function initPointerLight() {
    if (!supportsHover || prefersReducedMotion) return;

    const cards = document.querySelectorAll('[data-spotlight]');
    let frame = null;

    cards.forEach((card) => {
      card.addEventListener(
        'pointermove',
        (event) => {
          if (frame) return;
          frame = window.requestAnimationFrame(() => {
            const rect = card.getBoundingClientRect();
            card.style.setProperty('--mx', `${event.clientX - rect.left}px`);
            card.style.setProperty('--my', `${event.clientY - rect.top}px`);
            frame = null;
          });
        },
        { passive: true }
      );
    });
  }

  /* ---------------------------------------------------------------
   * Keyboard navigation between tabs (← / →)
   * ------------------------------------------------------------- */
  function initKeyboardNav() {
    const navLinks = Array.from(document.querySelectorAll('[data-nav-link]'));
    if (navLinks.length < 2) return;

    document.addEventListener('keydown', (event) => {
      if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;

      const tag = document.activeElement && document.activeElement.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;

      const current = navLinks.findIndex((l) => l.classList.contains('active'));
      if (current === -1) return;

      const next =
        event.key === 'ArrowRight'
          ? (current + 1) % navLinks.length
          : (current - 1 + navLinks.length) % navLinks.length;

      navLinks[next].click();
      navLinks[next].focus();
    });
  }

  /* ---------------------------------------------------------------
   * Boot
   * ------------------------------------------------------------- */
  function init() {
    initPreloader();
    initScrollProgress();
    initReveals();
    initPageRevealSync();
    initBackToTop();
    initCopyEmail();
    initMagnetic();
    initPointerLight();
    initKeyboardNav();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();

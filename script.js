/* ═══════════════════════════════════════════════════════════════
   script.js — YourName. Portfolio
   ═══════════════════════════════════════════════════════════════ */

'use strict';

/* ──────────────────────────────────────────────────────────────
   1. CUSTOM CURSOR — Lerp animation
─────────────────────────────────────────────────────────────── */
(function initCursor() {
  // Only activate on devices that support hover
  if (!window.matchMedia('(hover: hover)').matches) return;

  const cursor = document.getElementById('cursor');
  const cursorDot = document.getElementById('cursor-dot');

  if (!cursor || !cursorDot) return;

  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;
  let lerpX = mouseX;
  let lerpY = mouseY;

  const LERP_FACTOR = 0.12; // smoothing (0 = no move, 1 = instant)

  // Track raw mouse position
  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;

    // Cursor dot follows instantly for snappy feel
    cursorDot.style.transform = `translate(${mouseX}px, ${mouseY}px) translate(-50%, -50%)`;
  });

  // Smooth lerp loop for main cursor ring
  function animate() {
    lerpX += (mouseX - lerpX) * LERP_FACTOR;
    lerpY += (mouseY - lerpY) * LERP_FACTOR;

    cursor.style.transform = `translate(${lerpX}px, ${lerpY}px) translate(-50%, -50%)`;
    requestAnimationFrame(animate);
  }
  animate();

  // Hide cursor when leaving window
  document.addEventListener('mouseleave', () => {
    cursor.style.opacity = '0';
    cursorDot.style.opacity = '0';
  });
  document.addEventListener('mouseenter', () => {
    cursor.style.opacity = '1';
    cursorDot.style.opacity = '1';
  });

  // Interactive hover: grow cursor + blend mode
  const hoverTargets = document.querySelectorAll('[data-cursor-hover], a, button, input, textarea');

  hoverTargets.forEach((el) => {
    el.addEventListener('mouseenter', () => {
      cursor.classList.add('is-hovering');
      cursorDot.classList.add('is-hovering');
    });
    el.addEventListener('mouseleave', () => {
      cursor.classList.remove('is-hovering');
      cursorDot.classList.remove('is-hovering');
    });
  });
})();


/* ──────────────────────────────────────────────────────────────
   2. NAVIGATION — Scroll shadow + Hamburger
─────────────────────────────────────────────────────────────── */
(function initNav() {
  const nav = document.getElementById('nav');
  const hamburger = document.getElementById('hamburger');
  const overlay = document.getElementById('nav-overlay');
  const overlayLinks = document.querySelectorAll('.nav__overlay-link');

  if (!nav || !hamburger || !overlay) return;

  /* Scroll-based nav shadow */
  const onScroll = () => {
    if (window.scrollY > 20) {
      nav.classList.add('scrolled');
    } else {
      nav.classList.remove('scrolled');
    }
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll(); // run once on load

  /* Hamburger toggle */
  let isOpen = false;

  function toggleMenu(open) {
    isOpen = open;
    hamburger.classList.toggle('is-open', isOpen);
    overlay.classList.toggle('is-open', isOpen);
    overlay.setAttribute('aria-hidden', String(!isOpen));
    hamburger.setAttribute('aria-expanded', String(isOpen));
    document.body.style.overflow = isOpen ? 'hidden' : '';
  }

  hamburger.addEventListener('click', () => toggleMenu(!isOpen));

  // Close overlay when a link is clicked
  overlayLinks.forEach((link) => {
    link.addEventListener('click', () => toggleMenu(false));
  });

  // Close on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && isOpen) toggleMenu(false);
  });
})();


/* ──────────────────────────────────────────────────────────────
   3. SCROLL REVEAL — Intersection Observer
─────────────────────────────────────────────────────────────── */
(function initReveal() {
  // Hero left-column elements: animate in immediately on load
  const heroRevealEls = document.querySelectorAll(
    '.hero__eyebrow, .hero__title, .hero__tagline, .hero__cta, .hero__scroll-hint'
  );
  heroRevealEls.forEach((el, i) => {
    el.classList.add('reveal');
    setTimeout(() => el.classList.add('is-visible'), 80 + i * 130);
  });

  // Below-fold: observe on scroll
  const revealEls = document.querySelectorAll(
    '.section__header, .project-card, .stat-card, .video-card, .poster-card, .contact__intro, .contact__link, .form-group, .about__text, .about__stats, .skill-tag'
  );

  revealEls.forEach((el) => el.classList.add('reveal'));

  // Stagger children in grids
  const staggerParents = document.querySelectorAll('.projects__grid, .about__stats, .video-grid, .posters__grid, .about__skills');
  staggerParents.forEach((parent) => {
    const children = parent.querySelectorAll('.reveal');
    children.forEach((child, i) => {
      child.style.transitionDelay = `${i * 90}ms`;
    });
  });

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
  );

  revealEls.forEach((el) => observer.observe(el));
})();


/* ──────────────────────────────────────────────────────────────
   4. HERO SCROLL FADE-OUT
   When user scrolls past 60% of the hero's height, the left
   column fades and slides up slightly.
─────────────────────────────────────────────────────────────── */
(function initHeroFade() {
  const heroSection = document.getElementById('hero');
  const heroLeft = document.querySelector('.hero__left');
  if (!heroSection || !heroLeft) return;

  let ticking = false;

  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        const heroH = heroSection.offsetHeight;
        const scrolled = window.scrollY;
        const threshold = heroH * 0.55;

        if (scrolled > threshold) {
          heroLeft.classList.add('hero--scrolled-out');
        } else {
          heroLeft.classList.remove('hero--scrolled-out');
        }
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });
})();


/* ──────────────────────────────────────────────────────────────
   5. CONTACT FORM — Basic submit handler
─────────────────────────────────────────────────────────────── */
(function initContactForm() {
  const form = document.getElementById('contact-form');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const btn = form.querySelector('button[type="submit"]');
    const originalText = btn.innerHTML;

    btn.innerHTML = 'Message Sent ✓';
    btn.style.background = '#111';
    btn.style.color = 'var(--clr-accent)';
    btn.style.borderColor = 'var(--clr-accent)';
    btn.disabled = true;

    setTimeout(() => {
      btn.innerHTML = originalText;
      btn.style.background = '';
      btn.style.color = '';
      btn.style.borderColor = '';
      btn.disabled = false;
      form.reset();
    }, 3500);
  });
})();


/* ──────────────────────────────────────────────────────────────
   6. SMOOTH ACTIVE NAV LINK — Highlight current section
─────────────────────────────────────────────────────────────── */
(function initActiveNav() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav__link');

  if (!sections.length || !navLinks.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const id = entry.target.getAttribute('id');
          navLinks.forEach((link) => {
            const isActive = link.getAttribute('href') === `#${id}`;
            link.style.color = isActive
              ? 'var(--clr-text)'
              : '';
            // Force ::after pseudo underline
            link.dataset.active = isActive ? 'true' : 'false';
          });
        }
      });
    },
    { threshold: 0.35 }
  );

  sections.forEach((s) => observer.observe(s));
})();


/* ──────────────────────────────────────────────────────────────
   7. SLIDE-IN OBSERVER — Animates [data-slide] elements on scroll
─────────────────────────────────────────────────────────────── */
(function initSlideIn() {
  const slideEls = document.querySelectorAll('[data-slide]');
  if (!slideEls.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('slide-in');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15, rootMargin: '0px 0px -60px 0px' }
  );

  slideEls.forEach((el) => observer.observe(el));
})();




/* --------------------------------------------------------------
   8. VIDEO PLAYBACK LOGIC — Toggle play/pause inline natively
--------------------------------------------------------------- */
(function initVideoPlayback() {
  const videoCards = document.querySelectorAll('.video-card');

  videoCards.forEach(card => {
    const video = card.querySelector('.video-card__video');
    if (!video) return;

    // Toggle play/pause
    const togglePlay = () => {
      if (video.paused) {
        // Pause all other videos first for better UX
        document.querySelectorAll('.video-card__video').forEach(v => {
          if (v !== video && !v.paused) {
            v.pause();
            const parentCard = v.closest('.video-card');
            if (parentCard) parentCard.classList.remove('is-playing');
          }
        });

        video.play();
        card.classList.add('is-playing');
      } else {
        video.pause();
        card.classList.remove('is-playing');
      }
    };

    // Click on the card itself to trigger play/pause
    card.addEventListener('click', (e) => {
      // Don't trigger if they clicked a tag or external logic piece
      if (e.target.closest('a') && e.target.closest('a') !== card) return;
      togglePlay();
    });
  });
})();

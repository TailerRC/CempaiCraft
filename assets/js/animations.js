/* =============================================
   CEMPAICRAFT - ANIMATIONS JS
   Scroll Reveal Observer & Particle Engine
   ============================================= */

(function () {
  'use strict';

  /* =============================================
     SCROLL REVEAL (IntersectionObserver)
     ============================================= */
  function initScrollReveal() {
    const revealEls = document.querySelectorAll('.reveal, .reveal--right, .reveal--left, .reveal--scale');

    if (!revealEls.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
            // Unobserve after reveal for performance
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.12,
        rootMargin: '0px 0px -60px 0px'
      }
    );

    revealEls.forEach(el => observer.observe(el));
  }

  /* =============================================
     PARTICLE ENGINE
     ============================================= */
  function initParticles() {
    const container = document.getElementById('particles');
    if (!container) return;

    const types = ['circle', 'square', 'diamond'];
    const count = 25;

    for (let i = 0; i < count; i++) {
      createParticle(container, types[i % types.length]);
    }
  }

  function createParticle(container, type) {
    const particle = document.createElement('div');
    particle.className = `particle particle--${type}`;

    const size = Math.random() * 12 + 4;
    const x = Math.random() * 100;
    const duration = Math.random() * 15 + 10;
    const delay = Math.random() * 15;

    particle.style.cssText = `
      width: ${size}px;
      height: ${size}px;
      left: ${x}%;
      bottom: -20px;
      animation-duration: ${duration}s;
      animation-delay: -${delay}s;
    `;

    container.appendChild(particle);
  }

  /* =============================================
     COUNTER ANIMATION
     ============================================= */
  function initCounters() {
    const counters = document.querySelectorAll('.stat__number[data-target]');
    if (!counters.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            animateCounter(entry.target);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.5 }
    );

    counters.forEach(counter => observer.observe(counter));
  }

  function animateCounter(el) {
    const target = parseInt(el.getAttribute('data-target'), 10);
    const duration = 2000;
    const step = 16; // ~60fps
    const steps = duration / step;
    const increment = target / steps;
    let current = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        el.textContent = target.toLocaleString('es');
        clearInterval(timer);
      } else {
        el.textContent = Math.floor(current).toLocaleString('es');
      }
    }, step);
  }

  /* =============================================
     SMOOTH HOVER TILT on cards
     ============================================= */
  function initCardTilt() {
    const cards = document.querySelectorAll('.feature-card, .plan-card');

    cards.forEach(card => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const rotateX = (y - centerY) / centerY * -4;
        const rotateY = (x - centerX) / centerX * 4;

        card.style.transform = `translateY(-6px) perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
      });

      card.addEventListener('mouseleave', () => {
        card.style.transform = '';
        card.style.transition = 'transform 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
        setTimeout(() => { card.style.transition = ''; }, 500);
      });
    });
  }

  /* =============================================
     PAGE TRANSITION
     ============================================= */
  function initPageTransition() {
    document.body.classList.add('page-transition');

    // Intercept internal link clicks for smooth transition
    document.querySelectorAll('a[href]').forEach(link => {
      const href = link.getAttribute('href');
      if (!href || href.startsWith('#') || href.startsWith('http') || href.startsWith('mailto')) return;

      link.addEventListener('click', (e) => {
        e.preventDefault();
        document.body.style.opacity = '0';
        document.body.style.transition = 'opacity 0.25s ease';
        setTimeout(() => { window.location.href = href; }, 250);
      });
    });
  }

  /* =============================================
     NAVBAR PROGRESS BAR
     ============================================= */
  function initScrollProgress() {
    const bar = document.createElement('div');
    bar.id = 'scroll-progress';
    bar.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      height: 3px;
      background: linear-gradient(90deg, #F5C518, #3CB371);
      z-index: 2000;
      width: 0%;
      transition: width 0.1s linear;
      pointer-events: none;
    `;
    document.body.prepend(bar);

    window.addEventListener('scroll', () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      bar.style.width = `${progress}%`;
    }, { passive: true });
  }

  /* =============================================
     INIT ALL
     ============================================= */
  function init() {
    initScrollReveal();
    initParticles();
    initCounters();
    initCardTilt();
    initScrollProgress();
    // Page transition disabled to allow normal navigation
    // initPageTransition();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

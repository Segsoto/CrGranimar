(() => {
  'use strict';

  function initNavigation() {
    const header = document.querySelector('.site-header');
    const navToggle = document.querySelector('.nav-toggle');
    const nav = document.querySelector('.main-nav');
    const desktop = window.matchMedia('(min-width: 901px)');
    if (!header || !navToggle || !nav) return;

    function closeMenu() {
      header?.classList.remove('nav-open');
      document.body.classList.remove('nav-open');
      navToggle?.setAttribute('aria-expanded', 'false');
      navToggle?.setAttribute('aria-label', 'Abrir menú');
    }
    function setViewportVars() {
      if (header) document.documentElement.style.setProperty('--header-height', `${header.offsetHeight}px`);
      document.documentElement.style.setProperty('--vh', `${window.innerHeight * .01}px`);
    }
    setViewportVars();
    window.addEventListener('resize', setViewportVars, { passive: true });
    desktop.addEventListener('change', closeMenu);
    navToggle?.addEventListener('click', () => {
      const opened = header.classList.toggle('nav-open');
      document.body.classList.toggle('nav-open', opened);
      navToggle.setAttribute('aria-expanded', String(opened));
      navToggle.setAttribute('aria-label', opened ? 'Cerrar menú' : 'Abrir menú');
    });
    nav?.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape' && header?.classList.contains('nav-open')) {
        closeMenu();
        navToggle?.focus();
      }
      if (event.key === 'Tab' && header?.classList.contains('nav-open')) {
        const items = [navToggle, ...nav.querySelectorAll('a')];
        const first = items[0];
        const last = items[items.length - 1];
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
      }
    });
    const updateHeader = () => header?.classList.toggle('scrolled', window.scrollY > 22);
    updateHeader();
    window.addEventListener('scroll', updateHeader, { passive: true });
  }

  function initRevealMotion(reducedMotion) {
    // Reveal nearby elements only, with bounded delays instead of accumulating delays.
    if ('IntersectionObserver' in window && !reducedMotion.matches) {
      document.body.classList.add('motion-ready');
      const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        });
      }, { threshold: .06, rootMargin: '0px 0px 30px 0px' });
      document.querySelectorAll('.hero-content > *, .support-card, .feature-card, .materials-card, .section-heading, .portfolio-card, .project-photo, .section-contact > *, .animate-item').forEach((el, index) => {
        el.classList.add('reveal-item');
        el.style.setProperty('--reveal-delay', `${(index % 3) * 70}ms`);
        observer.observe(el);
      });
      reducedMotion.addEventListener('change', event => {
        if (event.matches) {
          document.body.classList.remove('motion-ready');
          observer.disconnect();
        }
      });
    }
  }

  function initGalleryPreview(reducedMotion) {
    const photoGrid = document.querySelector('.project-photo-grid');
    if (photoGrid && !photoGrid.hasAttribute('data-gallery-all')) {
      const photos = [...photoGrid.querySelectorAll('.project-photo')];
      const previewCount = 4;
      const toggle = document.createElement('button');
      toggle.type = 'button';
      toggle.className = 'gallery-toggle';
      toggle.setAttribute('aria-controls', photoGrid.id);
      toggle.setAttribute('aria-expanded', 'false');
      toggle.textContent = `Ver todas las fotos (${photos.length})`;
      photos.slice(previewCount).forEach(photo => { photo.hidden = true; });
      photoGrid.after(toggle);
      toggle.addEventListener('click', () => {
        const expanded = toggle.getAttribute('aria-expanded') !== 'true';
        photos.slice(previewCount).forEach(photo => { photo.hidden = !expanded; });
        toggle.setAttribute('aria-expanded', String(expanded));
        toggle.textContent = expanded ? 'Ver menos fotos' : `Ver todas las fotos (${photos.length})`;
        if (!expanded) photoGrid.scrollIntoView({ behavior: reducedMotion.matches ? 'auto' : 'smooth', block: 'start' });
      });
    }
  }

  function initPhotoViewer() {
    // Native dialog supplies focus trapping and Escape handling; links work without JS.
    const gallery = [...document.querySelectorAll('[data-gallery]')];
    if (!gallery.length || typeof HTMLDialogElement === 'undefined') return;
    const viewer = document.createElement('dialog');
    viewer.className = 'photo-viewer';
    viewer.setAttribute('aria-label', 'Visor de proyectos');
    viewer.innerHTML = '<button type="button" class="viewer-close" aria-label="Cerrar visor" autofocus>×</button><button type="button" class="viewer-prev" aria-label="Foto anterior">‹</button><img class="viewer-image" alt="" /><button type="button" class="viewer-next" aria-label="Foto siguiente">›</button><p class="viewer-counter" aria-live="polite" aria-atomic="true"></p>';
    document.body.append(viewer);
    const viewerImage = viewer.querySelector('.viewer-image');
    const counter = viewer.querySelector('.viewer-counter');
    let current = 0;
    let origin;
    function showPhoto(index) {
      current = (index + gallery.length) % gallery.length;
      const link = gallery[current];
      viewerImage.src = link.href;
      viewerImage.alt = link.querySelector('img').alt;
      counter.textContent = `${String(current + 1).padStart(2, '0')} / ${gallery.length}`;
    }
    gallery.forEach((link, index) => link.addEventListener('click', event => {
      // Preserve open-in-new-tab and modified link clicks.
      if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey || event.button) return;
      event.preventDefault();
      origin = link;
      showPhoto(index);
      viewer.showModal();
      document.body.classList.add('viewer-open');
    }));
    viewer.querySelector('.viewer-close').addEventListener('click', () => viewer.close());
    viewer.querySelector('.viewer-prev').addEventListener('click', () => showPhoto(current - 1));
    viewer.querySelector('.viewer-next').addEventListener('click', () => showPhoto(current + 1));
    viewer.addEventListener('keydown', event => {
      if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
        event.preventDefault();
        showPhoto(current + (event.key === 'ArrowRight' ? 1 : -1));
      }
    });
    viewer.addEventListener('click', event => {
      if (event.target !== viewer) return;
      const rect = viewer.getBoundingClientRect();
      if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) viewer.close();
    });
    viewer.addEventListener('close', () => {
      document.body.classList.remove('viewer-open');
      origin?.focus({ preventScroll: true });
    });
  }

  function initialize() {
    document.body.classList.add('page-ready');
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    initNavigation();
    initRevealMotion(reducedMotion);
    initGalleryPreview(reducedMotion);
    initPhotoViewer();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize, { once: true });
  } else {
    initialize();
  }
})();

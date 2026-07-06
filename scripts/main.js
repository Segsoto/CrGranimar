document.addEventListener('DOMContentLoaded', () => {
  document.body.classList.add('page-ready');

  const animatedItems = document.querySelectorAll('.animate-item');
  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('visible');
      obs.unobserve(entry.target);
    });
  }, {
    threshold: 0.18,
  });

  animatedItems.forEach((element, index) => {
    element.style.animationDelay = `${index * 0.12 + 0.12}s`;
    observer.observe(element);
  });

  const header = document.querySelector('.site-header');
  const navToggle = document.querySelector('.nav-toggle');
  const navLinks = document.querySelectorAll('.main-nav a');

  // Set CSS variables for header height and viewport height to handle mobile address bar
  function setViewportVars() {
    const root = document.documentElement;
    if (header) {
      root.style.setProperty('--header-height', `${header.offsetHeight}px`);
    }
    // --vh: 1% of the viewport height (dynamic, respects mobile chrome address bar)
    const vh = window.innerHeight * 0.01;
    root.style.setProperty('--vh', `${vh}px`);
  }

  // initialize and keep in sync
  setViewportVars();
  window.addEventListener('resize', setViewportVars);
  window.addEventListener('orientationchange', setViewportVars);

  if (navToggle) {
    navToggle.addEventListener('click', () => {
      const opened = header.classList.toggle('nav-open');
      navToggle.setAttribute('aria-expanded', opened ? 'true' : 'false');
    });
  }

  navLinks.forEach((link) => {
    link.addEventListener('click', () => {
      if (header.classList.contains('nav-open')) {
        header.classList.remove('nav-open');
        navToggle.setAttribute('aria-expanded', 'false');
      }
    });
  });

  window.addEventListener('scroll', () => {
    header.classList.toggle('scrolled', window.scrollY > 22);
  });
});

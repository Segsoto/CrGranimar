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
  window.addEventListener('scroll', () => {
    header.classList.toggle('scrolled', window.scrollY > 22);
  });
});

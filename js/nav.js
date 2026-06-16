// CLARIX CO — NAV JS
const nav    = document.getElementById('nav');
const burger = document.getElementById('burger');
const menu   = document.getElementById('mobileMenu');

window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 20);
});

burger.addEventListener('click', () => {
  menu.classList.toggle('open');
});

// Close menu on link click
document.querySelectorAll('.nav__mobile-link, .nav__mobile-cta').forEach(link => {
  link.addEventListener('click', () => menu.classList.remove('open'));
});

// Set active nav link
const path = window.location.pathname;
document.querySelectorAll('.nav__link').forEach(link => {
  if (link.getAttribute('href') && path.includes(link.getAttribute('href').replace('pages/', ''))) {
    link.classList.add('active');
  }
});
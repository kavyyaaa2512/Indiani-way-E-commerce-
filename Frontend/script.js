/* =============================================
   THE INDIANI WAY — MAIN JAVASCRIPT
   ============================================= */

/* ---- PRELOADER ---- */
window.addEventListener('load', () => {
  setTimeout(() => {
    const preloader = document.getElementById('preloader');
    if (preloader) preloader.classList.add('hidden');
  }, 1200);
});

/* ---- NAVBAR SCROLL ---- */
const navbar = document.getElementById('navbar');
const navLinks = document.querySelectorAll('.nav-link');
const sections = document.querySelectorAll('section[id]');

window.addEventListener('scroll', () => {
  if (window.scrollY > 60) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }
  updateActiveNav();
});

function updateActiveNav() {
  let current = '';
  sections.forEach(section => {
    const sectionTop = section.offsetTop - 120;
    if (window.scrollY >= sectionTop) {
      current = section.getAttribute('id');
    }
  });
  navLinks.forEach(link => {
    link.classList.remove('active');
    if (link.getAttribute('href') === '#' + current) {
      link.classList.add('active');
    }
  });
}

/* ---- HAMBURGER MENU ---- */
const hamburger = document.getElementById('hamburger');
const navLinksEl = document.getElementById('navLinks');
hamburger.addEventListener('click', () => {
  navLinksEl.classList.toggle('open');
  hamburger.setAttribute('aria-expanded', navLinksEl.classList.contains('open'));
  const spans = hamburger.querySelectorAll('span');
  navLinksEl.classList.contains('open')
    ? openHamburger(spans)
    : closeHamburger(spans);
});

function openHamburger(spans) {
  spans[0].style.transform = 'rotate(45deg) translate(4px, 4px)';
  spans[1].style.opacity = '0';
  spans[2].style.transform = 'rotate(-45deg) translate(4px, -4px)';
}
function closeHamburger(spans) {
  spans[0].style.transform = '';
  spans[1].style.opacity = '';
  spans[2].style.transform = '';
}

// Close menu on nav link click
document.querySelectorAll('.nav-link').forEach(link => {
  link.addEventListener('click', () => {
    navLinksEl.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
    closeHamburger(hamburger.querySelectorAll('span'));
  });
});

/* ---- SCROLL REVEAL ---- */
const revealEls = document.querySelectorAll(
  '.story-container, .product-header, .product-card, .promise-card, .launching-container, .testimonial-card, .contact-inner, .footer-inner'
);

revealEls.forEach((el, i) => {
  el.classList.add('reveal');
  if (i % 3 === 1) el.classList.add('reveal-delay-1');
  if (i % 3 === 2) el.classList.add('reveal-delay-2');
});

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

/* ---- COUNTDOWN TIMER ---- */
const launchDate = new Date('2026-09-15T00:00:00');

function updateCountdown() {
  const now = new Date();
  const diff = launchDate - now;
  if (diff <= 0) {
    document.getElementById('days').textContent = '00';
    document.getElementById('hours').textContent = '00';
    document.getElementById('minutes').textContent = '00';
    document.getElementById('seconds').textContent = '00';
    return;
  }
  const days    = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours   = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  document.getElementById('days').textContent    = String(days).padStart(2, '0');
  document.getElementById('hours').textContent   = String(hours).padStart(2, '0');
  document.getElementById('minutes').textContent = String(minutes).padStart(2, '0');
  document.getElementById('seconds').textContent = String(seconds).padStart(2, '0');
}
updateCountdown();
setInterval(updateCountdown, 1000);

/* ---- TESTIMONIALS CAROUSEL ---- */
const track = document.getElementById('testimonialTrack');
const dots  = document.querySelectorAll('.tdot');
let currentSlide = 0;
let autoSlide;

function goToSlide(index) {
  currentSlide = index;
  track.style.transform = `translateX(-${index * 100}%)`;
  dots.forEach(d => d.classList.remove('active'));
  if (dots[index]) dots[index].classList.add('active');
  
  // Add active class to current testimonial card
  const cards = document.querySelectorAll('.testimonial-card');
  cards.forEach((card, i) => {
    card.classList.remove('active');
    if (i === index) {
      setTimeout(() => card.classList.add('active'), 100);
    }
  });
}

dots.forEach(dot => {
  dot.addEventListener('click', () => goToSlide(parseInt(dot.dataset.index)));
});

function startAutoSlide() {
  autoSlide = setInterval(() => {
    const next = (currentSlide + 1) % dots.length;
    goToSlide(next);
  }, 4500);
}

function stopAutoSlide() { clearInterval(autoSlide); }

startAutoSlide();
track.parentElement.addEventListener('mouseenter', stopAutoSlide);
track.parentElement.addEventListener('mouseleave', startAutoSlide);

/* Touch swipe for carousel */
let touchStartX = 0;
track.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; });
track.addEventListener('touchend', e => {
  const diff = touchStartX - e.changedTouches[0].clientX;
  if (Math.abs(diff) > 50) {
    const next = diff > 0
      ? Math.min(currentSlide + 1, dots.length - 1)
      : Math.max(currentSlide - 1, 0);
    goToSlide(next);
  }
});

/* ---- ENQUIRE MODAL ---- */
const modal       = document.getElementById('enquireModal');
const modalClose  = document.getElementById('modalClose');
const modalName   = document.getElementById('modalProductName');
const modalForm   = document.getElementById('modalForm');
const modalSuccess = document.getElementById('modalSuccess');

document.querySelectorAll('.btn-enquire').forEach(btn => {
  btn.addEventListener('click', (e) => {
    const productName = btn.dataset.product || btn.closest('.product-card')?.dataset.product || '';
    modalName.textContent = productName;
    modalForm.style.display = 'flex';
    modalForm.style.flexDirection = 'column';
    modalSuccess.classList.remove('show');
    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
  });
});

modalClose.addEventListener('click', closeModal);
modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

function closeModal() {
  modal.classList.remove('open');
  document.body.style.overflow = '';
  const btn = modalForm.querySelector('button[type="submit"]');
  const btnLabel = btn.querySelector('span') || btn;
  btnLabel.textContent = 'Send Enquiry';
  btn.disabled = false;
}

modalForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const btn = modalForm.querySelector('button[type="submit"]');
  const btnLabel = btn.querySelector('span') || btn;
  btnLabel.textContent = 'Sending...';
  btn.disabled = true;
  setTimeout(() => {
    modalForm.style.display = 'none';
    modalSuccess.classList.add('show');
    setTimeout(closeModal, 3000);
  }, 1500);
});

/* ---- CONTACT FORM ---- */
const contactForm   = document.getElementById('contactForm');
const formSuccess   = document.getElementById('formSuccess');
const submitBtn     = document.getElementById('submitBtn');

contactForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const submitLabel = submitBtn.querySelector('span') || submitBtn;
  submitLabel.textContent = 'Sending...';
  submitBtn.disabled = true;
  submitBtn.style.opacity = '0.7';
  setTimeout(() => {
    contactForm.style.display = 'none';
    formSuccess.classList.add('show');
  }, 1800);
});

/* ---- NEWSLETTER ---- */
const newsletterBtn   = document.getElementById('newsletterBtn');
const newsletterEmail = document.getElementById('newsletterEmail');

newsletterBtn.addEventListener('click', () => {
  const email = newsletterEmail.value.trim();
  if (!email || !email.includes('@')) {
    newsletterEmail.style.border = '1.5px solid #C0392B';
    setTimeout(() => newsletterEmail.style.border = '', 2000);
    return;
  }
  newsletterBtn.textContent = '✓';
  newsletterBtn.style.background = '#2ecc71';
  newsletterEmail.value = '';
  setTimeout(() => {
    newsletterBtn.textContent = '\u2192';
    newsletterBtn.style.background = '';
  }, 3000);
});

/* ---- SMOOTH NAV SCROLL ---- */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', (e) => {
    const target = document.querySelector(anchor.getAttribute('href'));
    if (target) {
      e.preventDefault();
      const navH = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-h'));
      const top  = target.getBoundingClientRect().top + window.scrollY - navH - 10;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  });
});

/* ---- WISHLIST BUTTON TOGGLE ---- */
document.querySelectorAll('.btn-add-wish').forEach(btn => {
  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    const isWished = btn.classList.toggle('wished');
    btn.textContent = isWished ? '\u2665 Wishlisted' : '\u2661 Wishlist';
    btn.style.background = isWished ? '#9B1C1C' : '';
    btn.style.color = isWished ? '#fff' : '';
  });
});

/* ---- PARALLAX HERO ---- */
window.addEventListener('scroll', () => {
  const hero = document.querySelector('.hero-content');
  if (hero) {
    const scrolled = window.scrollY;
    if (scrolled < window.innerHeight) {
      hero.style.transform = `translateY(${scrolled * 0.3}px)`;
      hero.style.opacity = 1 - scrolled / (window.innerHeight * 0.8);
    }
  }
});

console.log('%cThe Indiani Way', 'font-size:24px;font-family:serif;color:#3D1F10;font-style:italic;');
console.log('%cWhere Culture Meets Contemporary', 'font-size:12px;color:#6B3020;letter-spacing:2px;');

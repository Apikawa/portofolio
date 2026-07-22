// ── COUNTER ANIMATION ──
function animateCounter(el) {
  const target   = parseInt(el.getAttribute('data-target'));
  const suffix   = el.getAttribute('data-suffix') || '';
  const duration = 2000;
  const step     = 16;
  const increment = target / (duration / step);
  let current    = 0;

  const timer = setInterval(() => {
    current += increment;
    if (current >= target) {
      current = target;
      clearInterval(timer);
    }
    el.textContent = Math.floor(current) + suffix;
  }, step);
}

const counterObs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      animateCounter(e.target);
      counterObs.unobserve(e.target);
    }
  });
}, { threshold: 0.5 });

document.querySelectorAll('.counter-num').forEach(el => counterObs.observe(el));

// ── CV LIGHTBOX ──
let cvZoom = 1;
const CV_FILE = 'assets/cv/CV-Adikara.jpg';

function openCV() {
  const overlay  = document.getElementById('cv-lightbox');
  const imgWrap  = document.getElementById('cv-img-wrap');
  const loading  = document.getElementById('cv-loading');
  cvZoom = 1;
  imgWrap.innerHTML = '';
  imgWrap.style.display = 'none';
  loading.classList.remove('hidden');
  overlay.classList.add('active');
  document.body.style.overflow = 'hidden';

  const img  = document.createElement('img');
  img.src    = CV_FILE;
  img.onload = () => {
    loading.classList.add('hidden');
    imgWrap.style.display = 'flex';
    applyCVZoom();
  };
  img.onerror = () => {
    loading.innerHTML = '<span style="color:var(--accent4)">File CV tidak ditemukan.</span>';
  };
  imgWrap.appendChild(img);
}

function closeCVLightbox() {
  document.getElementById('cv-lightbox').classList.remove('active');
  document.body.style.overflow = '';
}
function closeCVOutside(e) {
  if (e.target.id === 'cv-lightbox') closeCVLightbox();
}

function applyCVZoom() {
  const el = document.querySelector('#cv-img-wrap > *');
  if (el) el.style.transform = `scale(${cvZoom})`;
  document.getElementById('cv-zoom-level').textContent = Math.round(cvZoom * 100) + '%';
}
function cvZoomIn()    { cvZoom = Math.min(3, cvZoom + 0.25); applyCVZoom(); }
function cvZoomOut()   { cvZoom = Math.max(0.5, cvZoom - 0.25); applyCVZoom(); }
function cvResetZoom() { cvZoom = 1; applyCVZoom(); }
function downloadCV()  {
  const a    = document.createElement('a');
  a.href     = CV_FILE;
  a.download = 'CV-Adikara-Daksa-Laimadi.jpg';
  a.click();
}

// Scroll zoom di CV lightbox
document.getElementById('cv-lightbox').addEventListener('wheel', e => {
  e.preventDefault();
  e.deltaY < 0 ? cvZoomIn() : cvZoomOut();
}, { passive: false });

// ── TYPING ANIMATION ──
const typingWords = [
  'Pelajar TKJ',
  'Digital Creator',
  'Tech Enthusiast',
  'Network Explorer',
  'Photography Lover',
  'Self Learner'
];
let wordIdx    = 0;
let charIdx    = 0;
let isDeleting = false;
const typingEl = document.getElementById('typing-text');

function typeLoop() {
  const word  = typingWords[wordIdx];
  const speed = isDeleting ? 60 : 110;

  if (!isDeleting) {
    typingEl.textContent = word.slice(0, charIdx + 1);
    charIdx++;
    if (charIdx === word.length) {
      setTimeout(() => { isDeleting = true; typeLoop(); }, 1800);
      return;
    }
  } else {
    typingEl.textContent = word.slice(0, charIdx - 1);
    charIdx--;
    if (charIdx === 0) {
      isDeleting = false;
      wordIdx    = (wordIdx + 1) % typingWords.length;
    }
  }
  setTimeout(typeLoop, speed);
}

typeLoop();

  // ── CURSOR ──
  const cursor = document.getElementById('cursor');
  const trail = document.getElementById('cursorTrail');
  let mx = 0, my = 0, tx = 0, ty = 0;
  document.addEventListener('mousemove', e => {
    mx = e.clientX; my = e.clientY;
    cursor.style.transform = `translate(${mx - 6}px, ${my - 6}px)`;
  });
  function animTrail() {
    tx += (mx - tx) * 0.12;
    ty += (my - ty) * 0.12;
    trail.style.transform = `translate(${tx - 18}px, ${ty - 18}px)`;
    requestAnimationFrame(animTrail);
  }
  animTrail();

  document.querySelectorAll('a, button').forEach(el => {
    el.addEventListener('mouseenter', () => {
      cursor.style.transform += ' scale(1.5)';
      cursor.style.background = 'var(--accent4)';
    });
    el.addEventListener('mouseleave', () => {
      cursor.style.background = 'var(--accent2)';
    });
  });

  // ── SCROLL REVEAL ──
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) e.target.classList.add('visible');
    });
  }, { threshold: 0.1 });
  document.querySelectorAll('.fade-up').forEach(el => obs.observe(el));

  // ── SLIDER ──
  const sliderState = { mikrotik: 0, fiber: 0, server: 0 };
  const sliderMax   = { mikrotik: 5, fiber: 1, server: 2 };

  function updateSlider(id) {
    const track   = document.getElementById(id + '-track');
    const counter = document.getElementById(id + '-counter');
    const dots    = document.querySelectorAll('#' + id + '-dots .dot-ind');
    const idx     = sliderState[id];
    if (track)   track.style.transform = `translateX(-${idx * 100}%)`;
    if (counter) counter.textContent = `${idx + 1} / ${sliderMax[id]}`;
    dots.forEach((d, i) => d.classList.toggle('active', i === idx));
  }

  function slide(id, dir) {
    const max = sliderMax[id];
    sliderState[id] = (sliderState[id] + dir + max) % max;
    updateSlider(id);
  }

  function goToSlide(id, idx) {
    sliderState[id] = idx;
    updateSlider(id);
  }

  // Init
  updateSlider('mikrotik');
  updateSlider('server');

  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-links a');
  window.addEventListener('scroll', () => {
    let current = '';
    sections.forEach(s => {
      if (window.scrollY >= s.offsetTop - 120) current = s.id;
    });
    navLinks.forEach(a => {
      a.style.color = a.getAttribute('href') === '#' + current ? 'var(--text)' : '';
    });
  });

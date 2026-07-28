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
  const sliderMax   = { mikrotik: 5, fiber: 1, server: 3 };

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

// ── SLIDER GESTURE & SCROLL ──
  const sliderIds = ['mikrotik', 'fiber', 'server'];

  sliderIds.forEach(id => {
    const viewport = document.querySelector(`#${id}-track`)?.parentElement;
    const track    = document.getElementById(id + '-track');
    if (!viewport || !track) return;

    // ── 1. TOUCH SWIPE (HP) ──
    let touchStartX = 0;
    let touchStartY = 0;
    let touchLocked = null; // 'horizontal' | 'vertical' | null

    viewport.addEventListener('touchstart', e => {
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
      touchLocked = null;
    }, { passive: true });

    viewport.addEventListener('touchmove', e => {
      const diffX = Math.abs(e.touches[0].clientX - touchStartX);
      const diffY = Math.abs(e.touches[0].clientY - touchStartY);

      // Tentukan arah saat belum terkunci
      if (!touchLocked) {
        if (diffX > 8 || diffY > 8) {
          touchLocked = diffX > diffY ? 'horizontal' : 'vertical';
        }
      }
      // Kalau sudah terkunci horizontal, cegah scroll halaman
      if (touchLocked === 'horizontal') e.preventDefault();
    }, { passive: false });

    viewport.addEventListener('touchend', e => {
      if (touchLocked !== 'horizontal') return;
      const diffX = touchStartX - e.changedTouches[0].clientX;
      if (Math.abs(diffX) > 50) {
        slide(id, diffX > 0 ? 1 : -1);
      }
      touchLocked = null;
    }, { passive: true });

// ── 2. TOUCHPAD 2 JARI HORIZONTAL & SCROLL MOUSE VERTIKAL ──
    let canSlide = true;

    viewport.addEventListener('wheel', e => {
      const absX       = Math.abs(e.deltaX);
      const absY       = Math.abs(e.deltaY);
      const isTouchpad = absX > 0 || (e.deltaMode === 0 && absY < 50);

      if (isTouchpad && absX > absY) {
        // ── Touchpad horizontal ──
        e.preventDefault();

        if (!canSlide) return;
        if (absX >= 15) {
          canSlide = false;
          slide(id, e.deltaX > 0 ? 1 : -1);
          // Cooldown tetap 600ms, TIDAK direset oleh event susulan (momentum)
          setTimeout(() => { canSlide = true; }, 600);
        }
      } else if (absY >= 100 && absX < 10) {
        // ── Mouse wheel vertikal murni: biarkan halaman scroll ──
        return;
      }
    }, { passive: false });

    // ── 3. KLIK KIRI/KANAN AREA FOTO ──
    track.addEventListener('click', e => {
      // Pastikan klik bukan dari tombol panah atau dot
      if (e.target.closest('.slider-btn') || e.target.closest('.dot-ind')) return;

      const rect     = viewport.getBoundingClientRect();
      const clickX   = e.clientX - rect.left;
      const midPoint = rect.width / 2;

      slide(id, clickX > midPoint ? 1 : -1);
    });
  });

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

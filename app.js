// Kill Your Lawn — app.js

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// ---- Mobile nav toggle ----
const nav = document.getElementById('nav');
const navToggle = document.querySelector('.nav-toggle');
const navLinks = document.querySelector('.nav-links');
const navOverlay = document.createElement('div');
navOverlay.className = 'nav-overlay';
document.body.appendChild(navOverlay);

function closeNav() {
  navLinks.classList.remove('open');
  navOverlay.classList.remove('active');
  navToggle.setAttribute('aria-expanded', 'false');
  navToggle.innerHTML = '&#9776;';
}

navToggle.addEventListener('click', () => {
  const isOpen = navLinks.classList.toggle('open');
  navOverlay.classList.toggle('active', isOpen);
  navToggle.setAttribute('aria-expanded', String(isOpen));
  navToggle.innerHTML = isOpen ? '&#10005;' : '&#9776;';
});
navOverlay.addEventListener('click', closeNav);
navLinks.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', closeNav);
});

// ---- FAQ Accordion ----
document.querySelectorAll('.faq-question').forEach(btn => {
  btn.addEventListener('click', () => {
    const isOpen = btn.getAttribute('aria-expanded') === 'true';
    // close all
    document.querySelectorAll('.faq-question').forEach(b => {
      b.setAttribute('aria-expanded', 'false');
      b.nextElementSibling.classList.remove('open');
    });
    // open this one if it was closed
    if (!isOpen) {
      btn.setAttribute('aria-expanded', 'true');
      btn.nextElementSibling.classList.add('open');
    }
  });
});

// ---- Wildlife Log Data ----
// Update this array to add new sightings. Types: insect, bird, mammal, plant
const wildlifeLog = [
  {
    date: 'March 2026',
    type: 'insect',
    name: 'Mining bee (Andrena sp.)',
    notes: 'First bee of the season — a small brown female foraging in the bare mulch, likely nesting nearby. These ground-nesters love undisturbed soil.'
  },
  {
    date: 'March 2026',
    type: 'bird',
    name: 'American robin',
    notes: 'Pair investigating the sheet-mulched area. Robins hunt earthworms that move into the cardboard layer as it decomposes — already doing the work for us.'
  },
  {
    date: 'March 2026',
    type: 'bird',
    name: 'House finch',
    notes: 'Singing from the neighbor\'s spruce. Once the coneflowers go in, these will be regulars — they love the seeds.'
  }
];

function renderWildlifeLog() {
  const container = document.getElementById('wildlife-entries');
  if (!container) return;

  if (wildlifeLog.length === 0) {
    container.innerHTML = '<p class="wildlife-empty">No entries yet — the yard is still bare. Check back as the season progresses.</p>';
    return;
  }

  container.innerHTML = wildlifeLog.map(entry => `
    <div class="wildlife-entry">
      <span class="wildlife-date">${entry.date}</span>
      <span class="wildlife-type type-${entry.type}">${entry.type}</span>
      <span>
        <span class="wildlife-name">${entry.name}</span>
        <span class="wildlife-notes">${entry.notes}</span>
      </span>
    </div>
  `).join('');
}

renderWildlifeLog();

// ---- Scroll-triggered animations ----
// Each entry: selector for the container, and a function applying its final state.
// With reduced motion, the final state is applied immediately on load instead
// (the CSS media query strips the transitions, so nothing moves).

function animateRootChart(chart) {
  chart.querySelectorAll('.root-bar').forEach((bar, i) => {
    if (prefersReducedMotion) bar.classList.add('animated');
    else setTimeout(() => bar.classList.add('animated'), 200 + i * 180);
  });
}

function animateBloomCalendar(calendar) {
  if (!prefersReducedMotion) {
    calendar.querySelectorAll('.bloom-bar-fill').forEach((bar, i) => {
      bar.style.transitionDelay = `${i * 80}ms`;
    });
  }
  calendar.classList.add('animated');
}

function observeOnce(el, onIntersect, threshold) {
  if (prefersReducedMotion) {
    onIntersect(el);
    return;
  }
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        onIntersect(entry.target);
        obs.unobserve(entry.target);
      }
    });
  }, { threshold });
  obs.observe(el);
}

const rootChart = document.querySelector('.root-columns');
if (rootChart) observeOnce(rootChart, animateRootChart, 0.2);

const bloomCalendar = document.querySelector('.bloom-calendar');
if (bloomCalendar) observeOnce(bloomCalendar, animateBloomCalendar, 0.15);

const resilienceGrid = document.querySelector('.resilience-grid');
if (resilienceGrid) observeOnce(resilienceGrid, el => el.classList.add('animated'), 0.25);

document.querySelectorAll('.water-use-compare, .insect-support-compare').forEach(el => {
  observeOnce(el, t => t.classList.add('animated'), 0.3);
});

const mosaicGrid = document.getElementById('mosaic-grid');
if (mosaicGrid) observeOnce(mosaicGrid, el => el.classList.add('animated'), 0.3);

// ---- Scroll fade-in animations ----
const fadeEls = document.querySelectorAll(
  '.card, .resilience-metric, .bee-card, .bee-vs-wasp, ' +
  '.method, .start-option, .plant-category, .timeline-item, ' +
  '.resource-person, .resource-link-block, .legal-item, .econ-stat, ' +
  '.bib-category, .year3-stage, .faq-item, .system-block, .loop, ' +
  '.water-use-compare, .insect-support-compare, .bloom-calendar'
);

if (!prefersReducedMotion) {
  fadeEls.forEach(el => el.classList.add('fade-in'));
  const fadeObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const siblings = [...entry.target.parentElement.children];
        const idx = siblings.indexOf(entry.target);
        setTimeout(() => {
          entry.target.classList.add('visible');
        }, idx * 70);
        fadeObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08 });
  fadeEls.forEach(el => fadeObserver.observe(el));
}

// ---- Consolidated scroll handler: nav state, back-to-top, active link ----
const backToTop = document.getElementById('back-to-top');
const navLinksAll = document.querySelectorAll('.nav-links a[href^="#"]');
const sections = [...navLinksAll].map(a => document.querySelector(a.getAttribute('href'))).filter(Boolean);

function updateActiveNav() {
  const scrollY = window.scrollY + 120;
  let current = null;
  sections.forEach(section => {
    if (section.offsetTop <= scrollY) current = section;
  });
  navLinksAll.forEach(a => {
    a.classList.toggle('active', current && a.getAttribute('href') === '#' + current.id);
  });
}

let scrollScheduled = false;
function onScroll() {
  if (scrollScheduled) return;
  scrollScheduled = true;
  requestAnimationFrame(() => {
    scrollScheduled = false;
    const y = window.scrollY;
    nav.classList.toggle('scrolled', y > 60);
    if (backToTop) backToTop.classList.toggle('visible', y > 600);
    updateActiveNav();
  });
}
window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

if (backToTop) {
  backToTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
  });
}

// ---- Email signup form (Formspree) ----
const signupForm = document.getElementById('signup-form');
if (signupForm) {
  signupForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const form = e.target;
    const success = document.getElementById('signup-success');
    const errorEl = document.getElementById('signup-error');
    const data = new FormData(form);

    try {
      const response = await fetch(form.action, {
        method: 'POST',
        body: data,
        headers: { 'Accept': 'application/json' }
      });
      if (response.ok) {
        form.style.display = 'none';
        if (errorEl) errorEl.style.display = 'none';
        success.style.display = 'block';
      } else if (errorEl) {
        errorEl.style.display = 'block';
      }
    } catch {
      if (errorEl) errorEl.style.display = 'block';
    }
  });
}

// ---- Share functionality ----
function shareLink(method) {
  const url = window.location.href;
  const title = 'Kill Your Lawn — Lafayette, CO';
  const text = 'Replace your lawn with native prairie plants. Here\'s a practical guide for Lafayette, CO homeowners.';

  if (method === 'native' && navigator.share) {
    navigator.share({ title, text, url });
  } else if (method === 'text') {
    window.open('sms:?body=' + encodeURIComponent(text + ' ' + url));
  } else {
    navigator.clipboard.writeText(url).then(() => {
      const btn = document.querySelector('.btn-share');
      const original = btn.textContent;
      btn.textContent = 'Copied!';
      setTimeout(() => { btn.textContent = original; }, 2000);
    });
  }
}

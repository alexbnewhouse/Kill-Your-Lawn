// Kill Your Lawn — app.js

// ---- Sticky nav background on scroll ----
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 60);
}, { passive: true });

// ---- Mobile nav toggle ----
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

// ---- Root depth chart animation ----
const rootBars = document.querySelectorAll('.root-bar');
const rootObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      // stagger each bar
      const bars = entry.target.querySelectorAll('.root-bar');
      bars.forEach((bar, i) => {
        setTimeout(() => bar.classList.add('animated'), 200 + i * 180);
      });
      rootObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.2 });

const rootChart = document.querySelector('.root-columns');
if (rootChart) rootObserver.observe(rootChart);

// ---- Resilience bars animation (scroll-triggered) ----
const resilienceGrid = document.querySelector('.resilience-grid');
if (resilienceGrid) {
  const resilienceObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('animated');
        resilienceObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.25 });
  resilienceObserver.observe(resilienceGrid);
}

// ---- Water use & insect support bar animations ----
document.querySelectorAll('.water-use-compare, .insect-support-compare').forEach(el => {
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('animated');
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.3 });
  obs.observe(el);
});

// ---- Bloom calendar animation ----
const bloomCalendar = document.querySelector('.bloom-calendar');
if (bloomCalendar) {
  const bloomObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        // stagger each bar for a cascading effect
        const bars = entry.target.querySelectorAll('.bloom-bar-fill');
        bars.forEach((bar, i) => {
          bar.style.transitionDelay = `${i * 80}ms`;
        });
        entry.target.classList.add('animated');
        bloomObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });
  bloomObserver.observe(bloomCalendar);
}

// ---- Scroll fade-in animations ----
const fadeEls = document.querySelectorAll(
  '.card, .callout-aside, .resilience-metric, .bee-card, .bee-vs-wasp, ' +
  '.method, .start-option, .plant-category, .timeline-item, ' +
  '.resource-person, .resource-link-block, .legal-item, .econ-stat, ' +
  '.bib-category, .year3-stage, .faq-item, .system-block, .loop, ' +
  '.water-use-compare, .insect-support-compare, .bloom-calendar'
);
fadeEls.forEach(el => el.classList.add('fade-in'));

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const siblings = [...entry.target.parentElement.children];
      const idx = siblings.indexOf(entry.target);
      setTimeout(() => {
        entry.target.classList.add('visible');
      }, idx * 70);
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.08 });

fadeEls.forEach(el => observer.observe(el));

// ---- Mosaic corridor animation ----
const mosaicGrid = document.getElementById('mosaic-grid');
if (mosaicGrid) {
  const mosaicObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        mosaicGrid.classList.add('animated');
        mosaicObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.3 });
  mosaicObserver.observe(mosaicGrid);
}

// ---- Back to top button ----
const backToTop = document.getElementById('back-to-top');
if (backToTop) {
  window.addEventListener('scroll', () => {
    backToTop.classList.toggle('visible', window.scrollY > 600);
  }, { passive: true });
  backToTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

// ---- Active nav link highlighting ----
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
window.addEventListener('scroll', updateActiveNav, { passive: true });
updateActiveNav();

// ---- Email signup form (Formspree) ----
const signupForm = document.getElementById('signup-form');
if (signupForm) {
  signupForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const form = e.target;
    const success = document.getElementById('signup-success');
    const data = new FormData(form);

    try {
      const response = await fetch(form.action, {
        method: 'POST',
        body: data,
        headers: { 'Accept': 'application/json' }
      });
      if (response.ok) {
        form.style.display = 'none';
        success.style.display = 'block';
      } else {
        // If Formspree isn't configured yet, still show success for demo
        form.style.display = 'none';
        success.style.display = 'block';
      }
    } catch {
      // Offline or endpoint not configured — show success for demo
      form.style.display = 'none';
      success.style.display = 'block';
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

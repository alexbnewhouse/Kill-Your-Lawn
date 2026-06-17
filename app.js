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

// ---- Wildlife log removed for now (the #yard "our yard, in progress" section
//      was pulled from index.html; restore from git history to bring it back) ----

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

// ---- Pollinator Lab: hover a native plant, the real visitors fly in ----
(function () {
  const lab = document.getElementById('pollinator-lab');
  if (!lab) return;
  lab.hidden = false;

  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Field-guide line-art glyphs (inherit currentColor)
  const G = {
    bee: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><ellipse cx="12" cy="14.5" rx="4.2" ry="5.5"/><path d="M7.9 13h8.2M8.4 16.4h7.2"/><path d="M9.2 9.6C6.8 7.4 4 8 4.2 10.2c.15 1.7 2.3 2.4 4.7 1.2"/><path d="M14.8 9.6c2.4-2.2 5.2-1.6 5 .6-.15 1.7-2.3 2.4-4.7 1.2"/><path d="M10.4 9 9.2 6.3M13.6 9l1.2-2.7"/></svg>',
    butterfly: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="M12 7.5V17"/><path d="M12 8.5C9.2 4.2 3.5 4.8 4 9.3c.3 2.8 4 3.4 8 1.2"/><path d="M12 8.5c2.8-4.3 8.5-3.7 8 .8-.3 2.8-4 3.4-8 1.2"/><path d="M12 11.6c-2.2 4-6.3 4.2-5.8.9"/><path d="M12 11.6c2.2 4 6.3 4.2 5.8.9"/><path d="M12 7.5 10.6 5.2M12 7.5 13.4 5.2"/></svg>',
    moth: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><ellipse cx="12" cy="13" rx="1.5" ry="4.6"/><path d="M11 9.6C8 5.6 3.6 6.4 4.1 10c.34 2.6 3.9 3.5 6.9 1.9"/><path d="M13 9.6c3-4 7.4-3.2 6.9.4-.34 2.6-3.9 3.5-6.9 1.9"/><path d="M11.2 8.9 9.3 6.6M12.8 8.9l1.9-2.3"/></svg>',
    hummingbird: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="M4.5 9.2c2.6 1.1 4.6 2.9 5.9 5.4"/><path d="M15 13.5c-1.4 1.9-3.5 2.7-5.2 2.2-1.1-.3-1.3-1.6-.3-2.3 1.7-1.2 4.1-1.4 5.5.1z"/><path d="M14.6 13.7 20.6 11.9"/><path d="M9.7 16.1 8.5 19.5M11.5 16.3l-.5 3.4"/><circle cx="13.4" cy="12.6" r="0.5" fill="currentColor" stroke="none"/></svg>',
    beetle: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><ellipse cx="12" cy="13.6" rx="3.6" ry="5.4"/><path d="M12 8.6V19"/><circle cx="12" cy="6.6" r="1.9"/><path d="M8.6 11.6 5.7 9.9M8.4 14.6H5.3M8.7 17.4 5.9 19.2M15.4 11.6l2.9-1.7M15.6 14.6h3.1M15.3 17.4l2.8 1.8"/><path d="M10.9 5.3 9.6 3.5M13.1 5.3l1.3-1.8"/></svg>',
    bird: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="M5.6 13.6c0-3 2.6-5.2 5.6-5.2 2.3 0 3.7 1.3 4.4 3.2l3.4 1.2-2.9 1.4c-.6 2.3-2.7 3.9-5.3 3.9-2.8 0-5.2-1.6-5.2-4.5z"/><path d="M4.3 12.3 6.1 12.7"/><path d="M9.7 16.5 9.1 19.5M12.3 16.7l.3 3"/><circle cx="13.6" cy="11.5" r="0.5" fill="currentColor" stroke="none"/></svg>'
  };

  // Real Front Range plant → pollinator relationships
  const PLANTS = [
    { name: 'Prairie smoke', latin: 'Geum triflorum', img: 'images/plants/prairie_smoke.jpg',
      blurb: 'One of the first to wake up. Bumble bee queens grip the nodding pink bells and buzz the pollen loose — almost nothing else can.',
      visitors: [['bee', 'Bumble bee queen'], ['bee', 'Mason bee']] },
    { name: 'Rocky Mountain columbine', latin: 'Aquilegia coerulea', img: 'images/plants/rocky_mountain_columbine.jpg',
      blurb: "Colorado's state flower. Those long nectar spurs are a lock only long-tongued hawkmoths, bumble bees, and hummingbirds can pick.",
      visitors: [['moth', 'Hawk moth'], ['bee', 'Bumble bee'], ['hummingbird', 'Broad-tailed hummingbird']] },
    { name: 'Rocky Mtn penstemon', latin: 'Penstemon strictus', img: 'images/plants/rocky_mountain_penstemon.jpg',
      blurb: 'Violet-blue tubes sized for queen bumble bees — and raided by hummingbirds on the wing.',
      visitors: [['bee', 'Bumble bee'], ['bee', 'Mason bee'], ['bee', 'Digger bee'], ['hummingbird', 'Broad-tailed hummingbird']] },
    { name: 'Wild bergamot', latin: 'Monarda fistulosa', img: 'images/plants/wild_bergamot.jpg',
      blurb: 'Tubular lavender heads built for long tongues — bumble bees work them by day, hawkmoths at dusk.',
      visitors: [['bee', 'Bumble bee'], ['moth', 'Hummingbird moth'], ['bee', 'Leafcutter bee'], ['hummingbird', 'Hummingbird']] },
    { name: 'Purple prairie clover', latin: 'Dalea purpurea', img: 'images/plants/purple_prairie_clover.jpg',
      blurb: 'A nitrogen-fixing pollen powerhouse, and one of the best small-bee plants on the Front Range.',
      visitors: [['bee', 'Leafcutter bee'], ['bee', 'Green sweat bee'], ['butterfly', 'Sulphur butterfly'], ['bee', 'Digger bee']] },
    { name: 'Scarlet globemallow', latin: 'Sphaeralcea coccinea', img: 'images/plants/scarlet_globemallow.jpg',
      blurb: 'Drought-hardened orange cups with a devoted specialist — the globemallow bee gathers pollen from little else.',
      visitors: [['bee', 'Globemallow bee'], ['bee', 'Sweat bee'], ['butterfly', 'Painted lady']] },
    { name: 'Prairie coneflower', latin: 'Ratibida columnifera', img: 'images/plants/prairie_coneflower.jpg',
      blurb: 'Sombrero cones that bloom for months for native bees, then hold seed heads goldfinches pick clean into winter.',
      visitors: [['bee', 'Sweat bee'], ['bee', 'Sunflower bee'], ['butterfly', 'Painted lady'], ['bird', 'American goldfinch']] },
    { name: 'Blanket flower', latin: 'Gaillardia aristata', img: 'images/plants/blanket_flower.jpg',
      blurb: 'Open, daisy-like landing pads that welcome just about everyone, all summer long.',
      visitors: [['bee', 'Sweat bee'], ['bee', 'Leafcutter bee'], ['butterfly', 'Painted lady'], ['beetle', 'Soldier beetle']] },
    { name: 'Narrowleaf yucca', latin: 'Yucca glauca', img: 'images/plants/narrowleaf_yucca.jpg',
      blurb: 'A textbook mutualism: the female yucca moth pollinates the flower on purpose, then lays eggs whose larvae eat a few of the seeds. Neither species survives without the other.',
      visitors: [['moth', 'Yucca moth']] },
    { name: 'Maximilian sunflower', latin: 'Helianthus maximiliani', img: 'images/plants/maximilian_sunflower.jpg',
      blurb: 'Late gold that feeds specialist sunflower bees — then feeds goldfinches its seed.',
      visitors: [['bee', 'Sunflower bee'], ['bee', 'Sweat bee'], ['bird', 'American goldfinch'], ['butterfly', 'Painted lady']] },
    { name: 'Rabbitbrush', latin: 'Ericameria nauseosa', img: 'images/plants/rabbitbrush.jpg',
      blurb: 'When little else blooms, this is the fall fuel stop for insects and migrants heading south.',
      visitors: [['bee', 'Green sweat bee'], ['butterfly', 'Painted lady'], ['butterfly', 'Migrating monarch'], ['beetle', 'Soldier beetle']] }
  ];

  const plantsEl = lab.querySelector('.pl-plants');
  const stageEl = lab.querySelector('.pl-stage');

  PLANTS.forEach((p, i) => {
    const b = document.createElement('button');
    b.className = 'pl-plant';
    b.type = 'button';
    b.setAttribute('role', 'tab');
    b.setAttribute('aria-selected', 'false');
    b.innerHTML = '<img src="' + p.img + '" alt="" width="42" height="42" loading="lazy">' +
      '<span class="pl-plant-name">' + p.name + '<em>' + p.latin + '</em></span>';
    b.addEventListener('mouseenter', () => select(i));
    b.addEventListener('focus', () => select(i));
    b.addEventListener('click', () => select(i));
    plantsEl.appendChild(b);
  });

  let current = -1;
  function select(i) {
    if (i === current) return;
    current = i;
    Array.prototype.forEach.call(plantsEl.children, (c, j) => {
      const on = j === i;
      c.classList.toggle('active', on);
      c.setAttribute('aria-selected', on ? 'true' : 'false');
    });
    render(PLANTS[i]);
  }

  function render(p) {
    const cx = 50, cy = 44, R = 33;
    const n = p.visitors.length;
    const pts = p.visitors.map((v, k) => {
      const a = (-90 + k * (360 / n)) * Math.PI / 180;
      return { v: v, x: cx + R * Math.cos(a), y: cy + R * Math.sin(a) };
    });
    const lines = pts.map((t, k) => {
      const len = Math.hypot(t.x - cx, t.y - cy).toFixed(2);
      return '<line x1="' + cx + '" y1="' + cy + '" x2="' + t.x.toFixed(2) +
        '" y2="' + t.y.toFixed(2) + '" style="--len:' + len + ';--d:' + k + '"/>';
    }).join('');
    const toks = pts.map((t, k) => {
      const dx = cx - t.x, dy = cy - t.y;
      const len = Math.hypot(dx, dy) || 1;
      const fx = (dx / len * 24).toFixed(1) + 'px';
      const fy = (dy / len * 24).toFixed(1) + 'px';
      return '<div class="pl-token" style="left:' + t.x.toFixed(2) + '%;top:' + t.y.toFixed(2) + '%">' +
        '<div class="pl-token-inner" style="--fx:' + fx + ';--fy:' + fy + ';--i:' + k + '">' +
        '<span class="pl-node">' + (G[t.v[0]] || G.bee) + '</span>' +
        '<span class="pl-token-label">' + t.v[1] + '</span>' +
        '</div></div>';
    }).join('');
    stageEl.innerHTML =
      '<div class="pl-scene">' +
      '<svg class="pl-lines" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">' + lines + '</svg>' +
      '<div class="pl-bloom" style="left:' + cx + '%;top:' + cy + '%"><img src="' + p.img + '" alt="' + p.name + '"></div>' +
      toks +
      '</div>' +
      '<p class="pl-caption"><strong>' + p.name + '</strong> <em>' + p.latin + '</em>' +
      '<span>' + p.blurb + '</span></p>';
  }

  // Hold the first render until the lab scrolls into view, so the fly-in is seen.
  if (reduce || !('IntersectionObserver' in window)) {
    select(0);
  } else {
    const io = new IntersectionObserver((entries, obs) => {
      entries.forEach((e) => {
        if (e.isIntersecting) { select(0); obs.disconnect(); }
      });
    }, { threshold: 0.25 });
    io.observe(lab);
  }
})();

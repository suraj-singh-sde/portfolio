/**
 * Single-page portfolio — sections toggle in place (no separate HTML routes).
 * Optional: window.sendPrompt(message) for AI actions (e.g. Cursor preview).
 */

function deliverPrompt(message) {
  if (typeof window.sendPrompt === 'function') {
    window.sendPrompt(message);
    return;
  }
  window.dispatchEvent(new CustomEvent('portfolio:prompt', { detail: { message } }));
}

function go(pageId, pillEl, scrollToId) {
  const prevPage = document.querySelector('.page.on')?.id;
  document.querySelectorAll('.page').forEach((p) => {
    p.classList.toggle('on', p.id === pageId);
  });
  document.querySelectorAll('.nav-section-link[data-target]').forEach((b) => {
    const on = b === pillEl || b.getAttribute('data-target') === pageId;
    b.classList.toggle('on', on);
    b.setAttribute('aria-selected', on ? 'true' : 'false');
    if (on) b.setAttribute('aria-current', 'page');
    else b.removeAttribute('aria-current');
  });

  if (scrollToId && pageId === 'p1') {
    if (prevPage === pageId) {
      document.getElementById(scrollToId)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      requestAnimationFrame(() => {
        document.getElementById(scrollToId)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    }
    return;
  }

  if (prevPage !== pageId) {
    window.scrollTo(0, 0);
  }
}

function filtProjects(chipBtn, category) {
  const chips = chipBtn.closest('.filter-chips');
  if (!chips) return;
  chips.querySelectorAll('.chip').forEach((c) => c.classList.remove('on'));
  chipBtn.classList.add('on');

  document.querySelectorAll('#pgrid .pcard').forEach((card) => {
    const match = category === 'all' || card.dataset.c === category;
    card.style.display = match ? '' : 'none';
  });
}

function travelTab(tabBtn, panelId) {
  document.querySelectorAll('#p3 .ttab').forEach((b) => {
    const on = b === tabBtn;
    b.classList.toggle('on', on);
    b.setAttribute('aria-selected', on ? 'true' : 'false');
  });
  document.querySelectorAll('#p3 .tpanel').forEach((p) => {
    p.classList.toggle('on', p.id === panelId);
  });
}

function wireChipGroup(container, handler) {
  container.querySelectorAll('.chip').forEach((chip) => {
    chip.addEventListener('click', () => handler(chip, container));
  });
}

const THEME_KEY = 'portfolio-theme';

function getTheme() {
  return document.documentElement.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
}

function setTheme(theme) {
  if (theme !== 'light' && theme !== 'dark') return;
  document.documentElement.setAttribute('data-theme', theme);
  try {
    localStorage.setItem(THEME_KEY, theme);
  } catch (e) {
    /* ignore */
  }
  const btn = document.getElementById('themeToggle');
  if (btn) {
    btn.setAttribute(
      'aria-label',
      theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme',
    );
  }
}

function initThemeToggle() {
  const btn = document.getElementById('themeToggle');
  if (!btn) return;
  setTheme(getTheme());
  btn.addEventListener('click', () => {
    setTheme(getTheme() === 'dark' ? 'light' : 'dark');
  });
}

const HERO_ROTATE_PHRASES = [
  'AI Engineer.',
  'Backend Dev.',
  'Researcher.',
  'Traveller.',
  'Photographer.',
];

function initResumeCarousels() {
  document.querySelectorAll('.resume-carousel-block').forEach((block) => {
    const carousel = block.querySelector('.exp-carousel');
    const prev = block.querySelector('.exp-arrow--prev');
    const next = block.querySelector('.exp-arrow--next');
    if (!carousel) return;
    if (!prev || !next) return;

    function firstVisibleCard() {
      for (const el of carousel.querySelectorAll('.exp-card')) {
        if (window.getComputedStyle(el).display !== 'none') return el;
      }
      return null;
    }

    function cardStep() {
      const card = firstVisibleCard();
      if (!card) return Math.max(180, carousel.clientWidth * 0.85);
      const cs = window.getComputedStyle(carousel);
      const gap = parseFloat(cs.columnGap || cs.gap) || 14;
      return card.offsetWidth + gap;
    }

    function updateArrows() {
      const max = carousel.scrollWidth - carousel.clientWidth - 2;
      const x = carousel.scrollLeft;
      prev.disabled = x <= 2;
      next.disabled = x >= max - 2;
    }

    prev.addEventListener('click', () => {
      carousel.scrollBy({ left: -cardStep(), behavior: 'smooth' });
    });
    next.addEventListener('click', () => {
      carousel.scrollBy({ left: cardStep(), behavior: 'smooth' });
    });

    carousel.addEventListener('scroll', () => window.requestAnimationFrame(updateArrows), { passive: true });

    window.addEventListener('resize', () => window.requestAnimationFrame(updateArrows));

    carousel.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        carousel.scrollBy({ left: -cardStep(), behavior: 'smooth' });
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        carousel.scrollBy({ left: cardStep(), behavior: 'smooth' });
      }
    });

    updateArrows();
  });
}

function initProjShowMore() {
  const grid = document.getElementById('pgrid');
  const btn = document.getElementById('projMoreBtn');
  if (!grid || !btn) return;
  const label = btn.querySelector('.proj-more-label');

  btn.addEventListener('click', () => {
    const expanded = grid.classList.toggle('show-all');
    btn.setAttribute('aria-expanded', expanded ? 'true' : 'false');
    if (label) label.textContent = expanded ? 'Show less' : 'Show more';
    if (!expanded) {
      grid.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
}

function initHeroRotatingText() {
  const el = document.getElementById('rotatingHeroText');
  if (!el) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  let idx = 0;
  const STEP_MS = 2500;
  const FADE_MS = 440;

  window.setInterval(() => {
    el.classList.add('rotating-text--out');
    window.setTimeout(() => {
      idx = (idx + 1) % HERO_ROTATE_PHRASES.length;
      el.textContent = HERO_ROTATE_PHRASES[idx];
      el.classList.remove('rotating-text--out');
      el.classList.add('rotating-text--in');
      window.setTimeout(() => {
        el.classList.remove('rotating-text--in');
      }, 520);
    }, FADE_MS);
  }, STEP_MS);
}

function init() {
  document.querySelectorAll('.nav-section-link[data-target]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const target = btn.getAttribute('data-target');
      const scrollTo = btn.getAttribute('data-scroll-target');
      go(target, btn, scrollTo || undefined);
    });
  });

  document.querySelectorAll('[data-nav]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-nav');
      const link = document.querySelector(`.nav-section-link[data-target="${id}"]`);
      go(id, link || null, undefined);
    });
  });

  const projectChips = document.querySelector('[data-filter-scope="projects"]');
  if (projectChips) {
    projectChips.querySelectorAll('.chip[data-filter]').forEach((chip) => {
      chip.addEventListener('click', () => {
        filtProjects(chip, chip.getAttribute('data-filter'));
      });
    });
  }

  document.querySelectorAll('#p3 .ttab[data-panel]').forEach((tab) => {
    tab.addEventListener('click', () => travelTab(tab, tab.getAttribute('data-panel')));
  });

  const newsChips = document.querySelector('[data-filter-scope="news"]');
  if (newsChips) {
    wireChipGroup(newsChips, (clicked, root) => {
      root.querySelectorAll('.chip').forEach((c) => c.classList.remove('on'));
      clicked.classList.add('on');
    });
  }

  document.querySelectorAll('[data-prompt]').forEach((el) => {
    el.addEventListener('click', () => deliverPrompt(el.getAttribute('data-prompt')));
  });

  document.querySelectorAll('.nbig[data-prompt]').forEach((el) => {
    el.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        deliverPrompt(el.getAttribute('data-prompt'));
      }
    });
  });

  initHeroRotatingText();
  initResumeCarousels();
  initThemeToggle();
  initProjShowMore();
}

function boot() {
  init();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}

/* TradeVerse — application shell: boot, navigation, modals, toasts,
   term tooltips, route rendering. Loaded last. */
(function (root) {
  'use strict';

  const APP = {
    viewEl: null,
    cleanup: null,
    terminateTimers: null
  };

  const BASE_TITLE = 'TradeVerse — Understand the Market. Practise Every Move.';

  /* ---- Modal ---- */
  function openModal(config) {
    const rootEl = document.getElementById('modal-root');
    const previouslyFocused = document.activeElement;
    rootEl.hidden = false;
    rootEl.innerHTML = '';
    document.body.classList.add('modal-open');
    const backdrop = document.createElement('div'); backdrop.className = 'modal-backdrop';
    const dialog = document.createElement('div'); dialog.className = 'modal-dialog'; dialog.setAttribute('role', 'dialog'); dialog.setAttribute('aria-modal', 'true'); dialog.setAttribute('aria-label', config.title || 'Dialog');
    const close = document.createElement('button'); close.className = 'icon-btn modal-close'; close.setAttribute('aria-label', 'Close');
    close.innerHTML = '&#10005;';
    dialog.appendChild(close);
    if (config.title) { const h = document.createElement('h2'); h.textContent = config.title; dialog.appendChild(h); }
    if (config.bodyNode) dialog.appendChild(config.bodyNode);
    if (config.bodyHtml) { const p = document.createElement('div'); p.innerHTML = config.bodyHtml; dialog.appendChild(p); }
    rootEl.appendChild(backdrop); rootEl.appendChild(dialog);

    function closeModal() {
      rootEl.hidden = true; rootEl.innerHTML = '';
      document.body.classList.remove('modal-open');
      document.removeEventListener('keydown', onKey);
      if (previouslyFocused && previouslyFocused.focus) { try { previouslyFocused.focus(); } catch (e) {} }
      if (config.onClose) config.onClose();
    }
    function onKey(e) {
      if (e.key === 'Escape') { e.preventDefault(); closeModal(); return; }
      if (e.key === 'Tab') {
        const f = dialog.querySelectorAll('button, a[href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
        if (!f.length) return;
        const first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    }
    close.addEventListener('click', closeModal);
    backdrop.addEventListener('click', closeModal);
    document.addEventListener('keydown', onKey);
    const firstFocus = dialog.querySelector('button, a, [tabindex]') || close;
    setTimeout(() => firstFocus.focus(), 0);
  }

  function termModal(termName) {
    const found = root.TV.glossary.find(termName);
    if (!found) { toast('Term not found in the glossary.', 'warn'); return; }
    const wrap = document.createElement('div');
    const p = document.createElement('p'); p.textContent = found.def;
    wrap.appendChild(p);
    const a = document.createElement('a'); a.href = '#/glossary'; a.textContent = 'Open full glossary →'; a.addEventListener('click', () => { document.getElementById('modal-root').hidden = true; });
    wrap.appendChild(a);
    openModal({ title: found.term, bodyNode: wrap });
  }

  function toast(msg, type) {
    const rootEl = document.getElementById('toast-root');
    const t = document.createElement('div'); t.className = 'toast ' + (type || '');
    t.setAttribute('role', 'status'); t.textContent = msg;
    rootEl.appendChild(t);
    setTimeout(() => { t.remove(); }, 2600);
  }

  /* ---- Stats helpers used by multiple views ---- */
  function courseStats() {
    const c = root.TV.courses;
    const total = c.total;
    return { lessons: total, minutes: c.durationTotal, modules: c.MODULES.length, instruments: root.TV.market.INSTRUMENTS.length };
  }

  function breadcrumbs(items) {
    const navEl = document.createElement('div'); navEl.className = 'breadcrumbs';
    const parts = [{ label: 'Home', hash: '#/' }].concat(items || []);
    parts.forEach((p, i) => {
      if (i > 0) { const sep = document.createElement('span'); sep.className = 'sep'; sep.textContent = '/'; navEl.appendChild(sep); }
      if (p.hash) { const a = document.createElement('a'); a.href = p.hash; a.textContent = p.label; navEl.appendChild(a); }
      else { const s = document.createElement('span'); s.textContent = p.label; navEl.appendChild(s); }
    });
    return navEl;
  }

  function pageHead(title, lead, crumbs) {
    const wrap = document.createElement('div');
    wrap.appendChild(breadcrumbs(crumbs));
    const head = document.createElement('div'); head.className = 'page-head';
    const h = document.createElement('h1'); h.textContent = title; head.appendChild(h);
    if (lead) { const p = document.createElement('p'); p.className = 'lead'; p.textContent = lead; head.appendChild(p); }
    wrap.appendChild(head);
    return wrap;
  }

  function sectionTitle(text, sub) {
    const head = document.createElement('div'); head.className = 'sec-head';
    const h = document.createElement('h2'); h.className = 'sec-title'; h.textContent = text; head.appendChild(h);
    if (sub) { const s = document.createElement('span'); s.className = 'sec-sub'; s.textContent = sub; head.appendChild(s); }
    return head;
  }

  /* ---- View dispatch ---- */
  function byHash(view) {
    const v = root.TV.views[view];
    return v || root.TV.views.notFound;
  }

  function render() {
    if (APP.cleanup) { try { APP.cleanup(); } catch (e) {} APP.cleanup = null; }
    if (APP.terminateTimers) { APP.terminateTimers(); APP.terminateTimers = null; }
    const r = root.TV.router.resolve([
      root.TV.router.route('home', 'home'),
      root.TV.router.route('learn', 'learn'),
      root.TV.router.route('lesson', 'lesson', ['id']),
      root.TV.router.route('chart-lab', 'chartLab'),
      root.TV.router.route('simulator', 'simulator'),
      root.TV.router.route('event', 'event'),
      root.TV.router.route('event', 'quiz', [], 'quiz'),
      root.TV.router.route('event', 'tradingArena', [], 'trading'),
      root.TV.router.route('arena', 'arena'),
      root.TV.router.route('arena', 'quiz', [], 'quiz'),
      root.TV.router.route('arena', 'tradingArena', [], 'trading'),
      root.TV.router.route('glossary', 'glossary'),
      root.TV.router.route('about', 'about'),
      root.TV.router.route('help', 'help')
    ]);
    const view = byHash(r.view);
    APP.viewEl.innerHTML = '';
    if (APP.closeNav) APP.closeNav();
    const holder = document.createElement('div');
    APP.viewEl.appendChild(holder);
    let result = null;
    try {
      result = view.render(holder, r.params) || null;
    } catch (e) {
      renderError(holder);
      result = null;
    }
    if (result && typeof result.cleanup === 'function') APP.cleanup = result.cleanup;
    if (result && typeof result.stopTimers === 'function') APP.terminateTimers = result.stopTimers;
    document.title = (result && result.title) ? result.title + ' — TradeVerse' : BASE_TITLE;
    highlightNav(r.view);
    applyReveal();
    if (window.scrollTo) window.scrollTo(0, 0);
  }

  /* Cinematic entrance: top-level sections rise + fade in as they enter the
     viewport. Falls back to visible immediately without IntersectionObserver,
     and CSS disables the effect under prefers-reduced-motion. */
  function applyReveal() {
    if (!APP.viewEl) return;
    const containers = APP.viewEl.querySelectorAll('.container');
    if (!containers.length) return;
    if (typeof IntersectionObserver === 'undefined') return;
    if (!APP._revealIO) {
      APP._revealIO = new IntersectionObserver((entries) => {
        entries.forEach((en) => {
          if (en.isIntersecting) { en.target.classList.add('in'); APP._revealIO.unobserve(en.target); }
        });
      }, { rootMargin: '0px 0px -6% 0px', threshold: 0.03 });
    }
    containers.forEach((c) => {
      Array.prototype.forEach.call(c.children, (el, i) => {
        if (el.classList.contains('reveal')) return;
        el.classList.add('reveal');
        el.style.setProperty('--reveal-delay', Math.min(i, 6) * 45 + 'ms');
        APP._revealIO.observe(el);
      });
    });
  }

  /* A render failure must never leave the visitor on a blank screen. */
  function renderError(holder) {
    try {
      holder.innerHTML = '';
      const wrap = document.createElement('div'); wrap.className = 'container';
      const card = document.createElement('div'); card.className = 'card not-found';
      const h = document.createElement('h1'); h.textContent = 'Something went wrong';
      const p = document.createElement('p'); p.className = 'card-text';
      p.textContent = 'This section could not load. The rest of TradeVerse still works — try again or head back home.';
      const a = document.createElement('a'); a.className = 'btn btn-outline'; a.href = '#/'; a.textContent = '← Back to home';
      card.append(h, p, a);
      wrap.appendChild(card);
      holder.appendChild(wrap);
    } catch (e) { /* last resort: leave the shell intact */ }
  }

  function highlightNav(view) {
    const map = { home: 'home', learn: 'learn', lesson: 'learn', chartLab: 'chart-lab', simulator: 'simulator', event: 'event', arena: 'event', quiz: 'event', tradingArena: 'event', glossary: 'glossary', about: 'about', help: 'about' };
    const active = map[view] || '';
    document.querySelectorAll('.main-nav a').forEach(a => {
      a.classList.toggle('active', a.dataset.route === active);
    });
  }

  function initNav() {
    const toggle = document.getElementById('nav-toggle');
    const nav = document.getElementById('main-nav');
    if (!toggle || !nav) return;
    function closeNav() {
      nav.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
      toggle.setAttribute('aria-label', 'Open navigation');
    }
    toggle.addEventListener('click', () => {
      const open = nav.classList.toggle('open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      toggle.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
    });
    nav.addEventListener('click', (e) => {
      if (e.target.closest('a')) closeNav();
    });
    // Close on outside tap and on Escape so the menu never traps the user.
    document.addEventListener('click', (e) => {
      if (!nav.classList.contains('open')) return;
      if (nav.contains(e.target) || toggle.contains(e.target)) return;
      closeNav();
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && nav.classList.contains('open')) { closeNav(); toggle.focus(); }
    });
    APP.closeNav = closeNav;
  }

  function termDelegation() {
    if (!APP.viewEl) return;
    APP.viewEl.addEventListener('click', (e) => {
      const t = e.target.closest('.term');
      if (t) { e.preventDefault(); termModal(t.dataset.term); }
    });
    APP.viewEl.addEventListener('keydown', (e) => {
      const t = e.target.closest ? e.target.closest('.term') : null;
      if (t && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); termModal(t.dataset.term); }
    });
  }

  function boot() {
    const y = document.getElementById('year'); if (y) y.textContent = String(new Date().getFullYear());
    if (document.documentElement) document.documentElement.classList.add('js');
    APP.viewEl = document.getElementById('view');
    initNav();
    initSkipLink();
    termDelegation();
    window.addEventListener('hashchange', render);
    render();
  }

  /* The skip link targets an in-page anchor (#main). With a hash router that
     would be read as a route, so intercept it and move focus directly instead. */
  function initSkipLink() {
    const skip = document.querySelector('.skip-link');
    if (!skip) return;
    skip.addEventListener('click', (e) => {
      const target = document.getElementById('main');
      if (!target) return;
      e.preventDefault();
      target.focus();
      if (target.scrollIntoView) target.scrollIntoView();
    });
  }

  function registerGlobals() {
    root.TV = Object.assign(root.TV || {}, {
      app: { openModal, toast, breadcrumbs, pageHead, sectionTitle, courseStats, termModal }
    });
  }

  registerGlobals();
  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
    else boot();
  }
})(typeof window !== 'undefined' ? window : globalThis);
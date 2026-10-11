/* TradeVerse — 404 fallback view. */
(function (root) {
  'use strict';

  function render(container, params) {
    const wrap = document.createElement('div');
    wrap.className = 'container';
    const card = document.createElement('div'); card.className = 'card not-found';
    const h = document.createElement('h1'); h.textContent = 'Page not found';
    const p = document.createElement('p'); p.className = 'card-text';
    p.textContent = 'That route does not exist. Use the navigation above, or head home.';
    const a = document.createElement('a'); a.className = 'btn btn-outline'; a.href = '#/'; a.textContent = '← Back to home';
    card.append(h, p, a);
    wrap.appendChild(card);
    container.appendChild(wrap);
    return { title: 'Not found' };
  }

  root.TV = Object.assign(root.TV || {}, { views: Object.assign((root.TV && root.TV.views) || {}, { notFound: { render } }) });
})(typeof window !== 'undefined' ? window : globalThis);
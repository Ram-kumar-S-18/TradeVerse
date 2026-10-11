/* TradeVerse — Glossary view with live search. */
(function (root) {
  'use strict';

  function render(container, params) {
    const g = root.TV.glossary;
    const app = root.TV.app;
    const wrap = document.createElement('div');
    wrap.className = 'container';

    wrap.appendChild(app.pageHead('Glossary', 'Every TradeVerse term in plain language. Search or tap a highlighted word inside any lesson.', [{ label: 'Home', hash: '#/' }]));

    const search = document.createElement('input'); search.className = 'search'; search.type = 'search'; search.placeholder = 'Search the glossary… (try "order", "risk", "trend")';
    const list = document.createElement('div'); list.className = 'glossary-list';
    wrap.append(search, list);

    function paint(q) {
      list.innerHTML = '';
      const items = q ? g.search(q) : g.TERMS;
      if (!items.length) {
        const p = document.createElement('p'); p.className = 'empty'; p.textContent = 'No terms match "' + q + '".';
        list.appendChild(p);
        return;
      }
      items.forEach(t => {
        const card = document.createElement('article'); card.className = 'gloss card';
        const h = document.createElement('h3'); h.textContent = t.term;
        const p = document.createElement('p'); p.textContent = t.def;
        card.append(h, p);
        list.appendChild(card);
      });
    }

    search.addEventListener('input', () => paint(search.value.trim()));
    paint('');

    container.appendChild(wrap);
    return { title: 'Glossary' };
  }

  root.TV = Object.assign(root.TV || {}, { views: Object.assign((root.TV && root.TV.views) || {}, { glossary: { render } }) });
})(typeof window !== 'undefined' ? window : globalThis);
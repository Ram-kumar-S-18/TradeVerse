/* TradeVerse — Landing view. Leads visitors straight into Intra-Event Mode. */
(function (root) {
  'use strict';

  function render(container, params) {
    const app = root.TV.app;
    const stats = app.courseStats();
    const wrap = document.createElement('div');
    wrap.className = 'container';

    // ---- Hero ----
    const hero = document.createElement('section'); hero.className = 'hero mt';
    const inner = document.createElement('div'); inner.className = 'hero-grid';

    const left = document.createElement('div');
    const badge = document.createElement('div'); badge.className = 'hero-badge'; badge.textContent = 'Intra-college practice · no login · no real money';
    left.appendChild(badge);
    const h1 = document.createElement('h1');
    h1.innerHTML = 'Ready to take on the<br><span class="grad">Market Challenge?</span>';
    left.appendChild(h1);
    const lead = document.createElement('p'); lead.className = 'lead';
    lead.textContent = 'Test your market knowledge. Trade with virtual money. Get ready for the intra event — all without risking a single rupee.';
    left.appendChild(lead);
    const actions = document.createElement('div'); actions.className = 'hero-actions';
    const a1 = document.createElement('a'); a1.className = 'btn btn-large btn-primary'; a1.href = '#/event'; a1.textContent = 'Enter Intra-Event Mode';
    const a2 = document.createElement('a'); a2.className = 'btn btn-large btn-outline'; a2.href = '#/learn'; a2.textContent = 'Learn Trading Basics';
    actions.append(a1, a2);
    left.appendChild(actions);
    const hstats = document.createElement('div'); hstats.className = 'hero-stats';
    [['2', 'Practice rounds'], ['' + stats.lessons, 'Guided lessons'], ['' + stats.instruments, 'Sample instruments'], ['$100k', 'Virtual balance']]
      .forEach(([v, k]) => {
        const s = document.createElement('div'); s.className = 'hero-stat';
        const vv = document.createElement('div'); vv.className = 'v'; vv.textContent = v;
        const kk = document.createElement('div'); kk.className = 'k'; kk.textContent = k;
        s.append(vv, kk); hstats.appendChild(s);
      });
    left.appendChild(hstats);

    const right = document.createElement('div');
    const viz = document.createElement('div'); viz.className = 'hero-viz';
    const bar = document.createElement('div'); bar.className = 'viz-bar';
    const t = document.createElement('div'); t.className = 't'; t.textContent = 'BTC/USD · SIMULATED';
    const ctl = document.createElement('div'); ctl.className = 'c'; ctl.style.display = 'none';
    bar.append(t, ctl);
    const chartWrap = document.createElement('div'); chartWrap.className = 'chart-wrap'; chartWrap.style.height = '240px';
    viz.append(bar, chartWrap);
    const tag = document.createElement('div'); tag.className = 'sim-data-tag'; tag.textContent = 'sample data — not live market';
    viz.appendChild(tag);
    right.appendChild(viz);

    inner.append(left, right);
    hero.appendChild(inner);
    wrap.appendChild(hero);

    const candles = root.TV.market.seriesFor({ symbol: 'BTC', timeframe: '3H', seed: 5, trend: 'up' });
    const chart = root.TV.chart.createChart(chartWrap, { height: 240, tfLabel: '1H · SIM' });
    chart.set(candles);

    // ---- The two rounds ----
    const rounds = document.createElement('div'); rounds.className = 'sec';
    rounds.appendChild(app.sectionTitle('Two rounds, one event', 'Practise both formats before the day itself.'));
    const grid = document.createElement('div'); grid.className = 'arena-cards';

    const r1 = document.createElement('section'); r1.className = 'card hover-card arena-card';
    r1.style.cursor = 'pointer';
    const r1Tag = document.createElement('div'); r1Tag.className = 'tag tag-primary'; r1Tag.textContent = 'Round 1';
    const r1H = document.createElement('h2'); r1H.textContent = 'The Market Quiz';
    const r1P = document.createElement('p'); r1P.className = 'card-text';
    r1P.textContent = 'Answer questions, test what you know, and sharpen your market knowledge.';
    const r1Rows = document.createElement('ul'); r1Rows.className = 'plain-list';
    ['30 questions on markets, valuation, charts and risk', '20–25 minute practice timer', 'Clear explanation after every answer'].forEach(txt => { const li = document.createElement('li'); li.textContent = txt; r1Rows.appendChild(li); });
    const r1Btn = document.createElement('a'); r1Btn.className = 'btn btn-primary'; r1Btn.href = '#/event/quiz'; r1Btn.textContent = 'Start Round 1';
    r1.append(r1Tag, r1H, r1P, r1Rows, r1Btn);
    r1.addEventListener('click', (e) => { if (!e.target.closest('a')) location.hash = '#/event/quiz'; });

    const r2 = document.createElement('section'); r2.className = 'card hover-card arena-card';
    r2.style.cursor = 'pointer';
    const r2Tag = document.createElement('div'); r2Tag.className = 'tag tag-primary'; r2Tag.textContent = 'Round 2';
    const r2H = document.createElement('h2'); r2H.textContent = 'The Trading Arena';
    const r2P = document.createElement('p'); r2P.className = 'card-text';
    r2P.textContent = 'Start with virtual money, make trading decisions, and see how you perform.';
    const r2Rows = document.createElement('ul'); r2Rows.className = 'plain-list';
    ['$100,000 of virtual capital', '30–60 minute timed session', 'Live candlestick chart + a full risk summary'].forEach(txt => { const li = document.createElement('li'); li.textContent = txt; r2Rows.appendChild(li); });
    const r2Btn = document.createElement('a'); r2Btn.className = 'btn btn-primary'; r2Btn.href = '#/event/trading'; r2Btn.textContent = 'Start Round 2';
    r2.append(r2Tag, r2H, r2P, r2Rows, r2Btn);
    r2.addEventListener('click', (e) => { if (!e.target.closest('a')) location.hash = '#/event/trading'; });

    grid.append(r1, r2);
    rounds.appendChild(grid);
    wrap.appendChild(rounds);

    // ---- Learn the basics (compact) ----
    const learn = document.createElement('div'); learn.className = 'sec';
    learn.appendChild(app.sectionTitle('New to markets? Start here', 'Short lessons that prepare you for both rounds.'));
    const items = document.createElement('div'); items.className = 'feature-list compact';
    const STEPS = [
      { icon: '◇', title: 'Market Basics', text: 'What a stock is, who trades, and how an order becomes a trade.' },
      { icon: '▮', title: 'Reading Charts', text: 'Candles, trends and timeframes — read a price chart with confidence.' },
      { icon: '⚑', title: 'Trading & Risk', text: 'Simple strategies and the risk rules that keep you in the game.' }
    ];
    STEPS.forEach(s => {
      const c = document.createElement('div'); c.className = 'feature';
      const ic = document.createElement('div'); ic.className = 'f-icon'; ic.textContent = s.icon;
      const h = document.createElement('h3'); h.textContent = s.title;
      const p = document.createElement('p'); p.textContent = s.text;
      c.append(ic, h, p); items.appendChild(c);
    });
    learn.appendChild(items);
    const learnCta = document.createElement('a'); learnCta.className = 'btn btn-outline'; learnCta.href = '#/learn'; learnCta.textContent = 'Open the Learning Path →';
    learn.appendChild(learnCta);
    wrap.appendChild(learn);

    container.appendChild(wrap);
    return { cleanup: () => chart.destroy() };
  }

  root.TV = Object.assign(root.TV || {}, { views: Object.assign((root.TV && root.TV.views) || {}, { home: { render } }) });
})(typeof window !== 'undefined' ? window : globalThis);

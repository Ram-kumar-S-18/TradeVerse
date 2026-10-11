/* TradeVerse — About + Help views. */
(function (root) {
  'use strict';

  function card(title, par) {
    const s = document.createElement('section'); s.className = 'card prose-sm';
    const h = document.createElement('h2'); h.textContent = title;
    const p = document.createElement('p'); p.textContent = par;
    s.append(h, p);
    return s;
  }

  function renderAbout(container, params) {
    const app = root.TV.app;
    const wrap = document.createElement('div');
    wrap.className = 'container prose-sm';
    wrap.appendChild(app.pageHead('About TradeVerse', 'An educational, no-accounts trading simulator built to teach the mechanics of markets — not to sell anything.', [{ label: 'Home', hash: '#/' }]));

    wrap.appendChild(card('What TradeVerse is',
      'TradeVerse is an interactive learning environment: guided lessons, a chart lab, a risk-free simulator and the two-round Intra-Event Mode (a market quiz and a live trading arena). All prices are SIMULATED sample data generated deterministically on your own machine.'));
    wrap.appendChild(card('What TradeVerse is not',
      'It is not a brokerage, a trading signal service, or financial advice. There are no accounts, no deposits, no real orders and no attempt to predict or follow live markets.'));
    wrap.appendChild(card('Privacy by design',
      'The app runs entirely in your browser. Nothing is sent to any server, nothing is stored in cookies or localStorage, and every session resets cleanly. The only external request is loading the Inter and JetBrains Mono fonts from Google Fonts, and you can remove it without breaking anything.'));
    wrap.appendChild(card('Scoring',
      'Quiz scores and arena results exist only in this tab and disappear on reload. There are no user accounts and no leaderboards — the opponent is your own last attempt.'));
    wrap.appendChild(card('Built with',
      'A small set of dependency-free JavaScript files and a hand-written canvas chart renderer. Every engine — simulation, quiz, OHLC generation — is pure and unit-tested with node --test.'));

    container.appendChild(wrap);
    return { title: 'About' };
  }

  function renderHelp(container, params) {
    const app = root.TV.app;
    const wrap = document.createElement('div');
    wrap.className = 'container prose-sm';
    wrap.appendChild(app.pageHead('Help & FAQ', 'Quick answers to the questions new users ask.', [{ label: 'Home', hash: '#/' }]));

    const faqs = [
      ['Is this real trading?', 'No. Every instrument is labelled SIMULATED sample data and every fill is virtual. Nothing you do here touches a real market, and nothing is recorded.'],
      ['Where should I start?', 'Go to Learning Path and work through the lessons in order, then mark them complete. When you feel ready, practise in the Chart Lab and Simulator, then enter Intra-Event Mode and take on both rounds.'],
      ['Why do the prices look random?', 'They are. The OHLC series come from a seeded generator so they are reproducible and guaranteed sensible (high above open/close, low below). They are sample data, not live quotes.'],
      ['What does the fee/slippage slider do?', 'Commission is a small % taken on every fill; slippage moves your fill slightly against you on market orders (more on buys, less on sells). Both are visualised in the estimate before you place an order.'],
      ['Why can\u2019t I short sell?', 'Short selling is deliberately disabled in the simulator. The course teaches long-only risk management first; shorting is conceptually covered in the glossary.'],
      ['How is the Quiz scored?', 'Correct = +1. Blank or wrong = 0. You can change answers until you submit; the engine rejects a second submission and auto-submits when the timer runs out.'],
      ['How is Round 2 scored?', 'The evaluation reports your net P&L, return, win rate, profit factor and max drawdown, plus two scores: Risk (smaller sizes and shallower drawdowns score higher) and Discipline (fewer trades and controlled losses).'],
      ['What happened to my results when I refreshed?', 'They are gone. By design: nothing is persisted. Start a fresh session — that is also why any leaderboard would be meaningless here.'],
      ['A glossary word did not open, or something looks broken.', 'TradeVerse is a static site and runs in any current version of a modern browser. If something looks off, try a refresh — and make sure JavaScript is enabled.'],
      ['Is TradeVerse collecting my data?', 'No. There are no accounts, cookies, analytics or trackers, and nothing you do is sent anywhere. Your only network request is loading the fonts.']
    ];
    const list = document.createElement('div'); list.className = 'faq-list';
    faqs.forEach(([q, a]) => {
      const item = document.createElement('details'); item.className = 'card faq';
      const sum = document.createElement('summary'); sum.textContent = q;
      const body = document.createElement('p'); body.textContent = a;
      item.append(sum, body);
      list.appendChild(item);
    });
    wrap.appendChild(list);

    container.appendChild(wrap);
    return { title: 'Help & FAQ' };
  }

  const views = root.TV && root.TV.views ? root.TV.views : {};
  root.TV = Object.assign(root.TV || {}, {
    views: Object.assign(views, { about: { render: renderAbout }, help: { render: renderHelp } })
  });
})(typeof window !== 'undefined' ? window : globalThis);
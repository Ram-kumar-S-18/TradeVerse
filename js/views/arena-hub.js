/* TradeVerse — Intra-Event Mode hub: the main experience. Two practice rounds. */
(function (root) {
  'use strict';

  const STEPS = [
    ['Choose a round', 'Pick the Market Quiz or the Trading Arena.'],
    ['Read the rules', 'Each round explains what to do in plain English before you start.'],
    ['Start the practice session', 'The timer begins the moment you begin.'],
    ['Complete the challenge', 'Answer the questions or manage your virtual trades.'],
    ['Review your results', 'See your score and learn from the ones you missed.']
  ];

  function render(container, params) {
    const app = root.TV.app;
    const wrap = document.createElement('div');
    wrap.className = 'container';

    // ---- Event header ----
    const head = document.createElement('section'); head.className = 'event-head';
    const badge = document.createElement('div'); badge.className = 'hero-badge'; badge.textContent = 'Intra-Event Mode · practise with sample data';
    const h1 = document.createElement('h1'); h1.textContent = 'Your intra-college event, start to finish';
    const lead = document.createElement('p'); lead.className = 'lead';
    lead.textContent = 'Two rounds. No login, no real money, no pressure. Read the rules, practise the format, and walk into the event ready.';
    head.append(badge, h1, lead);
    wrap.appendChild(head);

    // ---- How it works (5 steps) ----
    const how = document.createElement('div'); how.className = 'sec';
    how.appendChild(app.sectionTitle('How it works', 'Five simple steps — you always know what comes next.'));
    const steps = document.createElement('ol'); steps.className = 'event-steps';
    STEPS.forEach(([title, text], i) => {
      const li = document.createElement('li'); li.className = 'event-step';
      const n = document.createElement('div'); n.className = 'step-num'; n.textContent = String(i + 1);
      const body = document.createElement('div');
      const h = document.createElement('h3'); h.textContent = title;
      const p = document.createElement('p'); p.className = 'card-text'; p.textContent = text;
      body.append(h, p);
      li.append(n, body);
      steps.appendChild(li);
    });
    how.appendChild(steps);
    wrap.appendChild(how);

    // ---- Two rounds ----
    const roundsSec = document.createElement('div'); roundsSec.className = 'sec';
    roundsSec.appendChild(app.sectionTitle('Choose your round', 'Both rounds are practice — nothing is graded or saved.'));
    const grid = document.createElement('div'); grid.className = 'arena-cards';

    const r1 = document.createElement('section'); r1.className = 'card hover-card arena-card';
    r1.style.cursor = 'pointer';
    const r1Tag = document.createElement('div'); r1Tag.className = 'tag tag-primary'; r1Tag.textContent = 'Round 1';
    const r1H = document.createElement('h2'); r1H.textContent = 'The Market Quiz';
    const r1P = document.createElement('p'); r1P.className = 'card-text';
    r1P.textContent = 'Answer questions, test what you know, and sharpen your market knowledge.';
    const r1Rows = document.createElement('ul'); r1Rows.className = 'plain-list';
    ['30 multiple-choice questions', '20–25 minute practice timer', 'Plain explanation after every answer'].forEach(txt => {
      const li = document.createElement('li'); li.textContent = txt; r1Rows.appendChild(li);
    });
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
    ['$100,000 fixed virtual balance', '30–60 minute practice session', 'Live candlestick chart + risk summary at the end'].forEach(txt => {
      const li = document.createElement('li'); li.textContent = txt; r2Rows.appendChild(li);
    });
    const r2Btn = document.createElement('a'); r2Btn.className = 'btn btn-primary'; r2Btn.href = '#/event/trading'; r2Btn.textContent = 'Start Round 2';
    r2.append(r2Tag, r2H, r2P, r2Rows, r2Btn);
    r2.addEventListener('click', (e) => { if (!e.target.closest('a')) location.hash = '#/event/trading'; });

    grid.append(r1, r2);
    roundsSec.appendChild(grid);
    wrap.appendChild(roundsSec);

    // ---- Notes ----
    const note = document.createElement('div'); note.className = 'banner';
    note.textContent = 'Practice content only. Questions are written for learning, not the official event paper. Prices are simulated sample data — never live. No scores are stored and there is no login.';
    wrap.appendChild(note);

    const prep = document.createElement('div'); prep.className = 'learn-cta card';
    const pText = document.createElement('p'); pText.className = 'card-text';
    pText.textContent = 'New to markets? Warm up with a few short lessons first.';
    const pBtn = document.createElement('a'); pBtn.className = 'btn btn-outline'; pBtn.href = '#/learn'; pBtn.textContent = 'Learn Trading Basics';
    prep.append(pText, pBtn);
    wrap.appendChild(prep);

    container.appendChild(wrap);
    return { title: 'Intra-Event Mode' };
  }

  root.TV = Object.assign(root.TV || {}, { views: Object.assign((root.TV && root.TV.views) || {}, { event: { render }, arena: { render } }) });
})(typeof window !== 'undefined' ? window : globalThis);

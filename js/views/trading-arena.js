/* TradeVerse — Intra-Event Mode · Round 2: The Trading Arena.
   A timed, single-instrument practice round on a fixed virtual balance.
   A live candlestick chart reveals simulated sample candles as the clock runs. */
(function (root) {
  'use strict';

  const START_CASH = 100000;
  const TICK_MS = 2000;        // one sample candle revealed every 2 seconds
  const CLOCK_MS = 1000;
  const START_BUFFER = 60;     // candles already on screen when the round begins

  let session = null;
  let series = [];
  let barIndex = 0;
  let chartApi = null;
  let chartOpts = null;
  let clockTimer = null;

  function render(container, params) {
    const sim = root.TV.simulation;
    const market = root.TV.market;
    const fmt = root.TV.format;
    const app = root.TV.app;
    const wrap = document.createElement('div');
    wrap.className = 'container';

    wrap.appendChild(app.pageHead('Round 2 · The Trading Arena', 'Trade one simulated instrument with virtual money while the clock runs. Prices are sample data — never live.', [
      { label: 'Home', hash: '#/' },
      { label: 'Intra-Event Mode', hash: '#/event' }
    ]));

    const host = document.createElement('div'); host.className = 'arena-host';
    wrap.appendChild(host);

    function clearClock() { if (clockTimer) { clearInterval(clockTimer); clockTimer = null; } }

    function buildSeries(symbol, timeframe, seed) {
      const need = Math.ceil((durationSecondsRef / 1000) / (TICK_MS / 1000)) + START_BUFFER + 10;
      return market.seriesDirect({ symbol, timeframe, seed, trend: 'range', count: need });
    }

    let durationSecondsRef = 1800;
    let currentTf = '5m';
    let seedRef = 900;
    let symbolRef = 'BTC';

    function start(cfg) {
      clearClock();
      const ins = market.instrument(cfg.instrument);
      symbolRef = ins.symbol;
      seedRef = 900 + market.INSTRUMENTS.indexOf(ins);
      durationSecondsRef = cfg.minutes * 60;
      currentTf = cfg.timeframe;
      series = buildSeries(symbolRef, currentTf, seedRef);
      barIndex = Math.min(START_BUFFER, series.length - 1);
      const price = series[barIndex].c;
      session = sim.createSession({ symbol: symbolRef, cash: START_CASH, price, feeRate: 0.001, slippageRate: 0.0005 });
      renderLive(cfg);
    }

    function renderLive(cfg) {
      host.innerHTML = '';
      const endAt = Date.now() + durationSecondsRef * 1000;

      const top = document.createElement('div'); top.className = 'card arena-top';
      const row = document.createElement('div'); row.className = 'arena-topline';
      const instr = document.createElement('b'); instr.textContent = session.symbol + ' · SIMULATED';
      const clock = document.createElement('b'); clock.className = 'clock'; clock.textContent = fmt.mmss(durationSecondsRef);
      row.append(instr, clock);
      top.appendChild(row);

      const strip = document.createElement('div'); strip.className = 'port-stats';
      const mk = (label, id) => {
        const s = document.createElement('div'); s.className = 'pstat';
        const k = document.createElement('span'); k.textContent = label;
        const v = document.createElement('b'); v.id = id; v.textContent = '—';
        s.append(k, v); return s;
      };
      const stCash = mk('Available cash', 'ac-cash');
      const stPort = mk('Portfolio value', 'ac-port');
      const stUn = mk('Unrealized P&L', 'ac-un');
      const stReal = mk('Realized P&L', 'ac-real');
      strip.append(stCash, stPort, stUn, stReal);
      top.appendChild(strip);
      top.appendChild(metricHelp());
      host.appendChild(top);

      // ---- Mobile tab switcher (chart / trade / positions) ----
      // Hidden on wide screens via CSS; on phones it rebuilds the desktop
      // three-column layout into one focused panel at a time.
      host.dataset.tab = 'chart';
      const tabs = document.createElement('div'); tabs.className = 'arena-tabs'; tabs.setAttribute('role', 'tablist'); tabs.setAttribute('aria-label', 'Arena panels');
      const tabBtns = {};
      [['chart', 'Chart'], ['trade', 'Trade'], ['info', 'Positions']].forEach(([key, label]) => {
        const b = document.createElement('button'); b.type = 'button'; b.className = 'arena-tab' + (key === 'chart' ? ' active' : '');
        b.setAttribute('role', 'tab'); b.setAttribute('aria-selected', key === 'chart' ? 'true' : 'false');
        b.textContent = label;
        b.addEventListener('click', () => setTab(key));
        tabs.appendChild(b); tabBtns[key] = b;
      });
      host.appendChild(tabs);
      function setTab(key) {
        host.dataset.tab = key;
        Object.keys(tabBtns).forEach(k => { const on = k === key; tabBtns[k].classList.toggle('active', on); tabBtns[k].setAttribute('aria-selected', on ? 'true' : 'false'); });
        if (chartApi) requestAnimationFrame(() => { try { chartApi.draw(); } catch (e) {} });
      }

      // ---- Chart card ----
      const chartCard = document.createElement('div'); chartCard.className = 'card chart-card'; chartCard.dataset.block = 'chart';
      const chHead = document.createElement('div'); chHead.className = 'chart-head';
      const chTitle = document.createElement('h3'); chTitle.textContent = 'Live sample chart';
      const tfWrap = document.createElement('div'); tfWrap.className = 'tf-switch';
      const tfLabel = document.createElement('span'); tfLabel.className = 'tf-switch-label'; tfLabel.textContent = 'Timeframe';
      const tfSel = document.createElement('select'); tfSel.setAttribute('aria-label', 'Chart timeframe');
      market.TIMEFRAMES.forEach(t => { const o = document.createElement('option'); o.value = t.key; o.textContent = t.label; tfSel.appendChild(o); });
      tfSel.value = currentTf;
      tfWrap.append(tfLabel, tfSel);
      chHead.append(chTitle, tfWrap);
      chartCard.appendChild(chHead);
      const chartWrap = document.createElement('div'); chartWrap.className = 'chart-wrap arena-chart';
      chartCard.appendChild(chartWrap);
      const ohlc = document.createElement('div'); ohlc.className = 'chart-ohlc'; ohlc.setAttribute('aria-live', 'polite');
      ohlc.textContent = 'Touch the chart to inspect a candle’s open, high, low and close.';
      chartCard.appendChild(ohlc);
      const chFoot = document.createElement('div'); chFoot.className = 'chart-foot';
      chFoot.textContent = 'Each bar advances the sample clock. Open, high, low and close are simulated values.';
      chartCard.appendChild(chFoot);
      host.appendChild(chartCard);

      chartOpts = {
        height: 300, decimals: market.instrument(session.symbol).dec, tfLabel: currentTf + ' · SIM',
        onHover: (c) => {
          if (!c) { ohlc.textContent = 'Touch the chart to inspect a candle’s open, high, low and close.'; return; }
          ohlc.textContent = 'O ' + fmt.price(c.o) + '   H ' + fmt.price(c.h) + '   L ' + fmt.price(c.l) + '   C ' + fmt.price(c.c);
        }
      };
      chartApi = root.TV.chart.createChart(chartWrap, chartOpts);
      chartApi.set(series.slice(0, barIndex + 1));

      // ---- Order ticket ----
      const ticket = document.createElement('div'); ticket.className = 'card ticket'; ticket.dataset.block = 'trade';
      const tHead = document.createElement('h3'); tHead.textContent = 'Place an order';
      ticket.appendChild(tHead);
      const sideRow = document.createElement('div'); sideRow.className = 'side-row';
      const buyBtn = document.createElement('button'); buyBtn.className = 'btn btn-buy side-btn active'; buyBtn.type = 'button'; buyBtn.textContent = 'Buy';
      const sellBtn = document.createElement('button'); sellBtn.className = 'btn btn-sell side-btn'; sellBtn.type = 'button'; sellBtn.textContent = 'Sell';
      sideRow.append(buyBtn, sellBtn);
      const kindRow = document.createElement('div'); kindRow.className = 'form-row';
      const kindSel = document.createElement('select'); kindSel.setAttribute('aria-label', 'Order type');
      [['market', 'Market order (fills now)'], ['limit', 'Limit order (waits for your price)']].forEach(([v, t]) => { const o = document.createElement('option'); o.value = v; o.textContent = t; kindSel.appendChild(o); });
      kindRow.appendChild(kindSel);
      const qtyRow = document.createElement('div'); qtyRow.className = 'form-row';
      const qtyLbl = document.createElement('label'); qtyLbl.className = 'field';
      const qtySpan = document.createElement('span'); qtySpan.textContent = 'Quantity (units)';
      const qty = document.createElement('input'); qty.type = 'number'; qty.min = '1'; qty.step = '1'; qty.value = '1';
      qtyLbl.append(qtySpan, qty);
      const limLbl = document.createElement('label'); limLbl.className = 'field'; limLbl.hidden = true;
      const limSpan = document.createElement('span'); limSpan.textContent = 'Limit price';
      const lim = document.createElement('input'); lim.type = 'number'; lim.min = '0'; lim.step = 'any'; lim.placeholder = 'e.g. 100';
      limLbl.append(limSpan, lim);
      qtyRow.append(qtyLbl, limLbl);
      const err = document.createElement('div'); err.className = 'opt-note bad'; err.hidden = true;
      const go = document.createElement('button'); go.className = 'btn btn-primary'; go.textContent = 'Place order';
      const hint = document.createElement('p'); hint.className = 'card-text small';
      hint.textContent = 'Market orders fill straight away. Limit orders wait until the sample price reaches your level. Short selling is disabled — you can only sell units you own.';
      ticket.append(sideRow, kindRow, qtyRow, err, go, hint);
      host.appendChild(ticket);

      // ---- Position + pending ----
      const grid = document.createElement('div'); grid.className = 'arena-grid'; grid.dataset.block = 'info';
      const posBox = document.createElement('div'); posBox.className = 'card';
      const ph = document.createElement('h3'); ph.textContent = 'Open positions';
      posBox.appendChild(ph);
      const posRows = document.createElement('div'); posRows.id = 'apos';
      posBox.appendChild(posRows);
      grid.appendChild(posBox);
      const ordBox = document.createElement('div'); ordBox.className = 'card';
      const oh = document.createElement('h3'); oh.textContent = 'Waiting orders';
      ordBox.appendChild(oh);
      const ordRows = document.createElement('div'); ordRows.id = 'aords';
      ordBox.appendChild(ordRows);
      grid.appendChild(ordBox);
      host.appendChild(grid);

      const logBox = document.createElement('div'); logBox.className = 'card'; logBox.dataset.block = 'info';
      const lh = document.createElement('h3'); lh.textContent = 'Round activity';
      logBox.appendChild(lh);
      const log = document.createElement('ol'); log.className = 'trade-log'; log.id = 'alog';
      logBox.appendChild(log);
      host.appendChild(logBox);

      const endBtn = document.createElement('div'); endBtn.className = 'actions';
      const stopBtn = document.createElement('button'); stopBtn.className = 'btn btn-outline danger'; stopBtn.textContent = 'End session now';
      const backBtn = document.createElement('a'); backBtn.className = 'btn btn-outline'; backBtn.href = '#/event'; backBtn.textContent = '← Back to Intra-Event Mode';
      endBtn.append(backBtn, stopBtn);
      host.appendChild(endBtn);

      let side = 'buy';

      function paint() {
        document.getElementById('ac-cash').textContent = fmt.usd(session.cash);
        document.getElementById('ac-port').textContent = fmt.usd(session.equity);
        const un = document.getElementById('ac-un'); un.textContent = fmt.signedUsd(session.unrealizedPnl); un.className = session.unrealizedPnl >= 0 ? 'pos' : 'neg';
        const rl = document.getElementById('ac-real'); rl.textContent = fmt.signedUsd(session.realizedPnl); rl.className = session.realizedPnl >= 0 ? 'pos' : 'neg';

        const pos = session.positions[session.symbol];
        posRows.innerHTML = '';
        if (pos && pos.qty) {
          [['Units held', fmt.qty(pos.qty)], ['Average price', fmt.usd(pos.avgPrice)], ['Sample price', fmt.usd(session.price)], ['Unrealized P&L', fmt.signedUsd((session.price - pos.avgPrice) * pos.qty)]].forEach(([k, v]) => {
            const d = document.createElement('div'); d.className = 'kv';
            const s = document.createElement('span'); s.textContent = k;
            const b = document.createElement('b'); b.textContent = v;
            d.append(s, b); posRows.appendChild(d);
          });
        } else { const e = document.createElement('p'); e.className = 'empty'; e.textContent = 'You hold no positions right now.'; posRows.appendChild(e); }

        ordRows.innerHTML = '';
        if (!session.orders.length) { const e = document.createElement('p'); e.className = 'empty'; e.textContent = 'No waiting orders.'; ordRows.appendChild(e); }
        else session.orders.forEach(o => {
          const r = document.createElement('div'); r.className = 'ord-row';
          const s = document.createElement('span'); s.textContent = o.side + ' ' + fmt.qty(o.qty) + ' @ ' + fmt.price(o.price);
          const c = document.createElement('button'); c.className = 'btn btn-sm btn-outline danger'; c.textContent = 'Cancel';
          c.addEventListener('click', () => { const res = sim.cancelOrder(session, o.id); if (!res.ok) app.toast(res.error, 'warn'); paint(); });
          r.append(s, c); ordRows.appendChild(r);
        });

        log.innerHTML = '';
        const trades = session.trades.slice().reverse().slice(0, 12);
        if (!trades.length) { const e = document.createElement('li'); e.className = 'empty'; e.textContent = 'No trades yet.'; log.appendChild(e); }
        else trades.forEach(t => {
          const li = document.createElement('li');
          const d = document.createElement('span'); d.className = 'tag ' + (t.side === 'buy' ? 'tag-buy' : 'tag-sell'); d.textContent = t.side.toUpperCase();
          const x = document.createElement('b'); x.textContent = ' ' + fmt.qty(t.qty) + ' @ ' + fmt.price(t.price);
          const m = document.createElement('span'); m.className = t.pnl != null ? (t.pnl >= 0 ? 'pos' : 'neg') : 'card-text';
          m.textContent = t.pnl != null ? ' P&L ' + fmt.signedUsd(t.pnl) : '';
          li.append(d, x, m); log.appendChild(li);
        });
      }

      buyBtn.addEventListener('click', () => { side = 'buy'; buyBtn.classList.add('active'); sellBtn.classList.remove('active'); });
      sellBtn.addEventListener('click', () => { side = 'sell'; sellBtn.classList.add('active'); buyBtn.classList.remove('active'); });
      kindSel.addEventListener('change', () => { limLbl.hidden = kindSel.value !== 'limit'; });
      tfSel.addEventListener('change', () => setTimeframe(tfSel.value));

      go.addEventListener('click', () => {
        err.hidden = true;
        const input = { side, qty: Number(qty.value), symbol: session.symbol };
        if (kindSel.value === 'limit') { input.type = 'limit'; input.price = Number(lim.value); } else { input.type = 'market'; }
        const r = sim.placeOrder(session, input);
        if (!r.ok) { err.textContent = r.error; err.hidden = false; return; }
        app.toast(r.message);
        qty.value = '1';
        paint();
      });

      stopBtn.addEventListener('click', () => {
        if (!window.confirm('End the round now and see your results?')) return;
        clearClock();
        finish();
      });

      // First tick to mark the opening price.
      sim.tick(session, series[barIndex].c);
      paint();

      let nextReveal = Date.now() + TICK_MS;
      clockTimer = setInterval(() => {
        const now = Date.now();
        const left = Math.max(0, Math.round((endAt - now) / 1000));
        clock.textContent = fmt.mmss(left);
        if (now >= nextReveal) {
          nextReveal += TICK_MS;
          if (barIndex < series.length - 1) {
            barIndex++;
            sim.tick(session, series[barIndex].c);
            chartApi.set(series.slice(0, barIndex + 1));
          }
          paint();
        }
        if (left <= 0) { clearClock(); finish(); }
      }, CLOCK_MS);
    }

    function setTimeframe(tf) {
      currentTf = tf;
      series = buildSeries(symbolRef, tf, seedRef);
      if (barIndex > series.length - 1) barIndex = series.length - 1;
      chartOpts.tfLabel = tf + ' · SIM';
      sim.tick(session, series[barIndex].c);
      chartApi.set(series.slice(0, barIndex + 1));
    }

    function metricHelp() {
      const box = document.createElement('div'); box.className = 'metric-help';
      [['Available Cash', 'money you still have to place simulated trades.'],
        ['Open Positions', 'trades you currently hold.'],
        ['Profit/Loss', 'how much you have gained or lost in this simulation.'],
        ['Portfolio Value', 'your available cash plus the current value of your open positions.']]
        .forEach(([k, v]) => {
          const p = document.createElement('div'); p.className = 'metric-help-row';
          const b = document.createElement('b'); b.textContent = k + ': ';
          p.append(b, document.createTextNode(v));
          box.appendChild(p);
        });
      return box;
    }

    function finish() {
      clearClock();
      if (chartApi) { chartApi.destroy(); chartApi = null; }
      const r = sim.evaluateSession(session);
      const finalValue = session.equity;
      const totalPnl = r.net;
      host.innerHTML = '';

      const card = document.createElement('div'); card.className = 'quiz-score card result-card';
      const sc = document.createElement('div'); sc.className = 'score-big';
      const num = document.createElement('div'); num.className = 'score-num'; num.textContent = fmt.signedUsd(totalPnl);
      const pct = document.createElement('div'); pct.className = 'score-pct'; pct.textContent = fmt.pct(r.returnPct, 2, true) + ' return on the round';
      sc.append(num, pct);
      card.appendChild(sc);

      const headline = document.createElement('p'); headline.className = 'verdict';
      headline.textContent = r.returnPct > 0.02 ? 'Profitable round — check whether your risk stayed under control too.'
        : r.returnPct < -0.02 ? 'A losing round. Review your entries, position sizes and stops below.'
          : 'Roughly break-even — the risk and discipline scores matter more than the flat result.';
      card.appendChild(headline);

      const t = document.createElement('table'); t.className = 'mini-table';
      [['Final portfolio value', fmt.usd(finalValue)],
        ['Starting balance', fmt.usd(START_CASH)],
        ['Total profit / loss', fmt.signedUsd(totalPnl)],
        ['Return', fmt.pct(r.returnPct, 2, true)],
        ['Completed trades', String(r.trades)],
        ['Win rate', fmt.pct(r.winRate, 1, false)],
        ['Profit factor', isFinite(r.profitFactor) ? r.profitFactor.toFixed(2) : '∞'],
        ['Max drawdown', fmt.pct(r.maxDrawdown, 1, false)],
        ['Risk score', r.riskScore + ' / 100'],
        ['Discipline score', r.disciplineScore + ' / 100']]
        .forEach(([k, v]) => {
          const tr = document.createElement('tr');
          const td1 = document.createElement('td'); td1.textContent = k;
          const td2 = document.createElement('td'); td2.textContent = v;
          tr.append(td1, td2); t.appendChild(tr);
        });
      card.appendChild(t);

      const explain = document.createElement('div'); explain.className = 'result-explain';
      const eh = document.createElement('h3'); eh.textContent = 'How the score is calculated';
      const ep = document.createElement('p'); ep.className = 'card-text';
      ep.textContent = 'Your result is based on the change in your portfolio value from the $100,000 starting balance. The Risk score starts at 100 and falls if your average position size or drawdown gets large. The Discipline score falls if you trade too often or take heavy losses. A high return from reckless risk does not produce a high score.';
      const risk = document.createElement('p'); risk.className = 'card-text';
      risk.textContent = 'Risk summary: ' + riskSummary(r) + ' ' + r.note;
      explain.append(eh, ep, risk);
      card.appendChild(explain);

      host.appendChild(card);

      const actions = document.createElement('div'); actions.className = 'actions';
      const again = document.createElement('button'); again.className = 'btn btn-primary'; again.textContent = 'Run the round again';
      again.addEventListener('click', drawConfig);
      const quizLink = document.createElement('a'); quizLink.className = 'btn btn-outline'; quizLink.href = '#/event/quiz'; quizLink.textContent = '← Back to Round 1';
      const eventLink = document.createElement('a'); eventLink.className = 'btn btn-outline'; eventLink.href = '#/event'; eventLink.textContent = 'Intra-Event Mode';
      actions.append(again, quizLink, eventLink);
      host.appendChild(actions);
    }

    function riskSummary(r) {
      const bits = [];
      bits.push('you completed ' + r.trades + ' trade' + (r.trades === 1 ? '' : 's'));
      if (r.maxDrawdown > 0) bits.push('your worst dip was ' + fmt.pct(r.maxDrawdown, 1, false) + ' below your peak');
      if (r.winRate >= 0.5) bits.push('more than half your closed trades won'); else if (r.trades > 0) bits.push('fewer than half your closed trades won');
      return bits.join('; ') + '.';
    }

    function drawConfig() {
      clearClock();
      if (chartApi) { chartApi.destroy(); chartApi = null; }
      session = null;
      host.innerHTML = '';
      const intro = document.createElement('div'); intro.className = 'card pre-card';
      const h = document.createElement('h2'); h.textContent = 'Round 2 · The Trading Arena';
      const p1 = document.createElement('p'); p1.className = 'card-text';
      p1.textContent = 'Start with $100,000 of virtual money, trade one simulated instrument while the clock runs, then review your profit, risk and discipline. Your score is local to this tab only.';
      const ul = document.createElement('ul'); ul.className = 'plain-list';
      [['Balance', '$100,000 virtual. Commission 0.1% and 0.05% slippage are built into fills.'],
        ['Chart', 'A live candlestick chart on simulated sample data. Change the timeframe any time.'],
        ['Orders', 'Buy or sell at the market, or place a limit order that waits for your price.'],
        ['Rules', 'Short selling is disabled — you can only sell units you already hold.'],
        ['Scoring', 'Judged on portfolio change, drawdown control and discipline — not on wild risk.']]
        .forEach(([k, v]) => {
          const li = document.createElement('li');
          const b = document.createElement('b'); b.textContent = k + ': ';
          li.append(b, document.createTextNode(v)); ul.appendChild(li);
        });
      intro.append(h, p1, ul);

      const cfg = document.createElement('div'); cfg.className = 'pre-card card';
      const ctlRow = document.createElement('div'); ctlRow.className = 'ctl-grid';
      const cl1 = document.createElement('label'); cl1.className = 'ctl';
      const s1 = document.createElement('span'); s1.className = 'ctl-label'; s1.textContent = 'Instrument';
      const selI = document.createElement('select');
      market.INSTRUMENTS.forEach(i => { const o = document.createElement('option'); o.value = i.symbol; o.textContent = i.name; selI.appendChild(o); });
      cl1.append(s1, selI);
      const cl2 = document.createElement('label'); cl2.className = 'ctl';
      const s2 = document.createElement('span'); s2.className = 'ctl-label'; s2.textContent = 'Starting timeframe';
      const selTf = document.createElement('select');
      market.TIMEFRAMES.forEach(t => { const o = document.createElement('option'); o.value = t.key; o.textContent = t.label; selTf.appendChild(o); });
      selTf.value = '5m';
      cl2.append(s2, selTf);
      const cl3 = document.createElement('label'); cl3.className = 'ctl';
      const s3 = document.createElement('span'); s3.className = 'ctl-label'; s3.textContent = 'Round length';
      const selT = document.createElement('select');
      [['30', '30 minutes'], ['45', '45 minutes'], ['60', '60 minutes']].forEach(([v, txt]) => { const o = document.createElement('option'); o.value = v; o.textContent = txt; selT.appendChild(o); });
      selT.value = '30';
      cl3.append(s3, selT);
      ctlRow.append(cl1, cl2, cl3);
      const go = document.createElement('button'); go.className = 'btn btn-primary'; go.textContent = 'Start Round 2';
      go.addEventListener('click', () => start({ instrument: selI.value, timeframe: selTf.value, minutes: Number(selT.value) }));
      cfg.append(ctlRow, go);
      host.append(intro, cfg);
    }

    function teardown() {
      clearClock();
      if (chartApi) { chartApi.destroy(); chartApi = null; }
    }

    drawConfig();

    container.appendChild(wrap);
    return { title: 'Round 2 · The Trading Arena', cleanup: teardown, stopTimers: clearClock };
  }

  root.TV = Object.assign(root.TV || {}, { views: Object.assign((root.TV && root.TV.views) || {}, { tradingArena: { render } }) });
})(typeof window !== 'undefined' ? window : globalThis);

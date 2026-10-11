/* TradeVerse — Trading Simulator: risk-free virtual order terminal. */
(function (root) {
  'use strict';

  function render(container, params) {
    const sim = root.TV.simulation;
    const market = root.TV.market;
    const fmt = root.TV.format;
    const app = root.TV.app;
    const wrap = document.createElement('div');
    wrap.className = 'container';

    wrap.appendChild(app.pageHead('Trading Simulator', 'Practise orders, positions and P&L with $100,000 of virtual cash. Every quote is labelled SIMULATED — never real money.', [{ label: 'Home', hash: '#/' }]));

    const warn = document.createElement('div'); warn.className = 'banner warn';
    warn.textContent = 'Educational simulation only. No real orders, no real money, no accounts, no persistence.';
    wrap.appendChild(warn);

    let session = null;
    let candles = [];
    let fullSeries = [];
    let barIndex = 0;
    let chartApi = null;
    let timer = null;
    let running = true;
    const START_BAR = 60;

    // ---- config card ----
    const controls = document.createElement('div'); controls.className = 'card controls';
    const ctlRows = document.createElement('div'); ctlRows.className = 'ctl-grid';
    const instrCtl = document.createElement('label'); instrCtl.className = 'ctl';
    const instrLabel = document.createElement('span'); instrLabel.className = 'ctl-label'; instrLabel.textContent = 'Instrument';
    const instrSel = document.createElement('select');
    market.INSTRUMENTS.forEach(i => { const o = document.createElement('option'); o.value = i.symbol; o.textContent = i.name; instrSel.appendChild(o); });
    instrCtl.append(instrLabel, instrSel);
    const feeCtl = document.createElement('label'); feeCtl.className = 'ctl';
    const feeLabel = document.createElement('span'); feeLabel.className = 'ctl-label';
    const feeVal = document.createElement('b'); feeVal.id = 'fee-val'; feeLabel.textContent = 'Commission ';
    const feeRange = document.createElement('input'); feeRange.type = 'range'; feeRange.min = '0'; feeRange.max = '5'; feeRange.step = '0.5'; feeRange.value = '0';
    feeLabel.appendChild(feeVal); feeCtl.append(feeLabel, feeRange);
    const slipCtl = document.createElement('label'); slipCtl.className = 'ctl';
    const slipLabel = document.createElement('span'); slipLabel.className = 'ctl-label';
    const slipVal = document.createElement('b'); slipVal.id = 'slip-val'; slipLabel.textContent = 'Slippage ';
    const slipRange = document.createElement('input'); slipRange.type = 'range'; slipRange.min = '0'; slipRange.max = '5'; slipRange.step = '0.5'; slipRange.value = '0';
    slipLabel.appendChild(slipVal); slipCtl.append(slipLabel, slipRange);
    ctlRows.append(instrCtl, feeCtl, slipCtl);
    const playBtn = document.createElement('button'); playBtn.className = 'btn btn-outline'; playBtn.textContent = 'Pause ticks'; playBtn.id = 'play-btn';
    const resetBtn = document.createElement('button'); resetBtn.className = 'btn btn-outline'; resetBtn.textContent = 'Reset session';
    ctlRows.append(playBtn, resetBtn);
    controls.appendChild(ctlRows);
    wrap.appendChild(controls);

    // ---- price / stats strip ----
    const priceCard = document.createElement('div'); priceCard.className = 'price-strip card';
    const pBig = document.createElement('div'); pBig.className = 'price-big';
    const pNum = document.createElement('div'); pNum.className = 'p-num'; pNum.textContent = '—';
    const pTick = document.createElement('div'); pTick.id = 'tick-label';
    pBig.append(pNum, pTick);
    const stats = document.createElement('div'); stats.className = 'port-stats';
    const stat = (label, id) => {
      const s = document.createElement('div'); s.className = 'pstat';
      const k = document.createElement('span'); k.textContent = label;
      const v = document.createElement('b'); v.id = id; v.textContent = '—';
      s.append(k, v); return s;
    };
    const stCash = stat('Cash', 'st-cash');
    const stEquity = stat('Equity', 'st-equity');
    const stUpnl = stat('Unrealized P&L', 'st-upnl');
    const stRp = stat('Realized P&L', 'st-rpnl');
    stats.append(stCash, stEquity, stUpnl, stRp);
    priceCard.append(pBig, stats);
    wrap.appendChild(priceCard);

    // ---- live candlestick chart ----
    const chartCard = document.createElement('div'); chartCard.className = 'card chart-card';
    const chHead = document.createElement('div'); chHead.className = 'chart-head';
    const chTitle = document.createElement('h3'); chTitle.textContent = 'Live sample chart';
    const chNote = document.createElement('span'); chNote.className = 'chart-foot'; chNote.textContent = 'SIMULATED — 1H sample candles';
    chHead.append(chTitle, chNote);
    chartCard.appendChild(chHead);
    const chartWrap = document.createElement('div'); chartWrap.className = 'chart-wrap arena-chart';
    chartCard.appendChild(chartWrap);
    const chOhlc = document.createElement('div'); chOhlc.className = 'chart-ohlc'; chOhlc.setAttribute('aria-live', 'polite');
    chOhlc.textContent = 'Touch the chart to inspect a candle’s open, high, low and close.';
    chartCard.appendChild(chOhlc);
    const chFoot = document.createElement('div'); chFoot.className = 'chart-foot';
    chFoot.textContent = 'Each tick advances the sample clock and reveals the next simulated candle. Open, high, low and close are simulated values.';
    chartCard.appendChild(chFoot);
    wrap.appendChild(chartCard);

    // ---- terminal: ticket + tables ----
    const term = document.createElement('div'); term.className = 'term-grid';

    const ticket = document.createElement('div'); ticket.className = 'card ticket';
    const tHead = document.createElement('h3'); tHead.textContent = 'New order';
    ticket.appendChild(tHead);
    const sideRow = document.createElement('div'); sideRow.className = 'side-row';
    const buyBtn = document.createElement('button'); buyBtn.className = 'btn btn-buy active'; buyBtn.textContent = 'Buy';
    const sellBtn = document.createElement('button'); sellBtn.className = 'btn btn-sell'; sellBtn.textContent = 'Sell';
    sideRow.append(buyBtn, sellBtn);
    ticket.appendChild(sideRow);

    const typeRow = document.createElement('div'); typeRow.className = 'chk  chk-type';
    const typeSel = document.createElement('select');
    [['market', 'Market — fill now'], ['limit', 'Limit — wait for my price']].forEach(([v, txt]) => { const o = document.createElement('option'); o.value = v; o.textContent = txt; typeSel.appendChild(o); });
    typeRow.appendChild(typeSel);
    ticket.appendChild(typeRow);

    const amtRow = document.createElement('div'); amtRow.className = 'form-row';
    const qtyInp = document.createElement('input'); qtyInp.type = 'number'; qtyInp.min = '1'; qtyInp.step = '1'; qtyInp.value = '100'; qtyInp.placeholder = 'Quantity';
    const priceInp = document.createElement('input'); priceInp.type = 'number'; priceInp.min = '0'; priceInp.step = 'any'; priceInp.placeholder = 'Limit price'; priceInp.hidden = true;
    amtRow.append(qtyInp, priceInp);
    ticket.appendChild(amtRow);

    const est = document.createElement('div'); est.className = 'est'; est.textContent = '';
    ticket.appendChild(est);
    const err = document.createElement('div'); err.className = 'opt-note bad'; err.hidden = true;
    ticket.appendChild(err);
    const goBtn = document.createElement('button'); goBtn.className = 'btn btn-primary go-btn'; goBtn.textContent = 'Place order';
    ticket.appendChild(goBtn);
    ticket.appendChild(Object.assign(document.createElement('p'), { className: 'ticket-note', textContent: 'Estimated cost shows the fill price you would get — including commission and slippage — before you commit. Sell is only allowed for what you already hold; short selling is disabled.' }));

    // positions
    const posCard = document.createElement('div'); posCard.className = 'card';
    const posHead = document.createElement('h3'); posHead.textContent = 'Position';
    posCard.appendChild(posHead);
    const posRows = document.createElement('div'); posRows.className = 'kv-grid'; posRows.id = 'pos-rows';
    posCard.appendChild(posRows);

    // open orders
    const ordCard = document.createElement('div'); ordCard.className = 'card';
    const ordHead = document.createElement('h3'); ordHead.textContent = 'Open orders';
    ordCard.appendChild(ordHead);
    const ordRows = document.createElement('div'); ordRows.className = 'ord-rows'; ordRows.id = 'ord-rows';
    ordCard.appendChild(ordRows);

    term.append(ticket, posCard, ordCard);
    wrap.appendChild(term);

    // ---- recent trades + evaluate ----
    const hist = document.createElement('div'); hist.className = 'card';
    const histHead = document.createElement('h3'); histHead.textContent = 'Trade history';
    hist.appendChild(histHead);
    const histRows = document.createElement('ol'); histRows.className = 'trade-log'; histRows.id = 'trade-log';
    hist.appendChild(histRows);
    const evalBtn = document.createElement('button'); evalBtn.className = 'btn btn-outline'; evalBtn.textContent = 'Evaluate session';
    hist.appendChild(evalBtn);
    wrap.appendChild(hist);

    // ---- helpers ----
    let side = 'buy';
    let lastPrice = 0;

    function instrument() { return market.instrument(instrSel.value); }

    function reload() {
      fullSeries = reloadCandles();
      barIndex = Math.min(START_BAR, fullSeries.length - 1);
      candles = fullSeries.slice(0, barIndex + 1);
      lastPrice = candles.length ? candles[candles.length - 1].c : 0;
      session = sim.createSession({ symbol: instrSel.value, cash: 100000, feeRate: Number(feeRange.value) / 100, slippageRate: Number(slipRange.value) / 100, price: lastPrice });
      const ins = instrument();
      if (chartApi) { chartApi.destroy(); chartApi = null; }
      chartApi = root.TV.chart.createChart(chartWrap, { height: 300, decimals: ins.dec, tfLabel: '1H · SIM', onHover: (c) => {
        if (!c) { chOhlc.textContent = 'Touch the chart to inspect a candle’s open, high, low and close.'; return; }
        chOhlc.textContent = 'O ' + fmt.price(c.o) + '   H ' + fmt.price(c.h) + '   L ' + fmt.price(c.l) + '   C ' + fmt.price(c.c);
      } });
      chartApi.set(candles);
      refreshAll();
    }

    function reloadCandles() {
      const ins = instrument();
      return market.seriesDirect({ symbol: ins.symbol, timeframe: '1H', seed: 200 + market.INSTRUMENTS.indexOf(ins), trend: 'range', count: 240 });
    }

    function refreshAll() {
      if (!session) return;
      const ins = instrument();
      pNum.textContent = fmt.price(session.price);
      pNum.classList.toggle('up', session.price >= lastPrice);
      pNum.classList.toggle('down', session.price < lastPrice);
      document.getElementById('tick-label').textContent = 'tick ' + session.tick;
      document.getElementById('st-cash').textContent = fmt.usd(session.cash);
      document.getElementById('st-equity').textContent = fmt.usd(session.equity);
      const up = document.getElementById('st-upnl');
      up.textContent = fmt.signedUsd(session.unrealizedPnl);
      up.className = session.unrealizedPnl >= 0 ? 'pos' : 'neg';
      const rp = document.getElementById('st-rpnl');
      rp.textContent = fmt.signedUsd(session.realizedPnl);
      rp.className = session.realizedPnl >= 0 ? 'pos' : 'neg';
      feeVal.textContent = (Number(feeRange.value) / 100 * 100).toFixed(1) + '%';
      slipVal.textContent = (Number(slipRange.value) / 100 * 100).toFixed(1) + '%';
      renderPos();
      renderOrders();
      renderLog();
      updateEst();
    }

    function renderPos() {
      const rows = document.getElementById('pos-rows');
      const pos = session.positions[session.symbol];
      rows.innerHTML = '';
      if (!pos || !pos.qty) {
        const p = document.createElement('p'); p.className = 'empty'; p.textContent = 'No position. Place an order to start.';
        rows.appendChild(p); return;
      }
      const value = pos.qty * session.price;
      const upnl = (session.price - pos.avgPrice) * pos.qty;
      [['Quantity', fmt.qty(pos.qty)], ['Avg price', fmt.usd(pos.avgPrice)], ['Mark price', fmt.usd(session.price)], ['Market value', fmt.usd(value)], ['Unrealized P&L', fmt.signedUsd(upnl)]].forEach(([k, v]) => {
        const d = document.createElement('div'); d.className = 'kv';
        const kspan = document.createElement('span'); kspan.textContent = k;
        const vspan = document.createElement('b'); vspan.textContent = v; vspan.className = upnl >= 0 ? 'pos' : 'neg';
        d.append(kspan, vspan); rows.appendChild(d);
      });
    }

    function renderOrders() {
      const box = document.getElementById('ord-rows');
      box.innerHTML = '';
      if (!session.orders.length) {
        const p = document.createElement('p'); p.className = 'empty'; p.textContent = 'No open orders.';
        box.appendChild(p); return;
      }
      session.orders.forEach(o => {
        const row = document.createElement('div'); row.className = 'ord-row';
        const info = document.createElement('span');
        const dir = o.side === 'buy' ? 'Buy' : 'Sell';
        info.textContent = dir + ' ' + fmt.qty(o.qty) + ' ' + o.symbol + ' @ ' + fmt.price(o.price);
        const cancel = document.createElement('button'); cancel.className = 'btn btn-sm btn-outline danger'; cancel.textContent = 'Cancel';
        cancel.addEventListener('click', () => {
          const r = sim.cancelOrder(session, o.id);
          if (!r.ok) app.toast(r.error, 'warn');
          refreshAll();
        });
        row.append(info, cancel);
        box.appendChild(row);
      });
    }

    function renderLog() {
      const log = document.getElementById('trade-log');
      log.innerHTML = '';
      const trades = session.trades.slice().reverse();
      if (!trades.length) {
        const li = document.createElement('li'); li.className = 'empty'; li.textContent = 'No trades yet.';
        log.appendChild(li); return;
      }
      trades.slice(0, 12).forEach(t => {
        const li = document.createElement('li');
        const d = document.createElement('span'); d.className = 'tag ' + (t.side === 'buy' ? 'tag-buy' : 'tag-sell'); d.textContent = t.side.toUpperCase();
        const txt = document.createElement('b'); txt.textContent = ' ' + fmt.qty(t.qty) + ' ' + t.symbol + ' @ ' + fmt.price(t.price);
        const meta = document.createElement('span'); meta.className = 'card-text';
        meta.textContent = ' fee ' + fmt.usd(t.fee) + (t.pnl != null ? ' · P&L ' + fmt.signedUsd(t.pnl) : '');
        meta.className = t.pnl != null ? (t.pnl >= 0 ? 'pos' : 'neg') : 'card-text';
        li.append(d, txt, meta);
        log.appendChild(li);
      });
    }

    function updateEst() {
      if (!session) return;
      const qty = Number(qtyInp.value) || 0;
      if (qty <= 0 || typeSel.value !== 'market') { est.textContent = ''; return; }
      const fill = sim.shadePrice(session, side);
      const gross = fill * qty;
      const fee = gross * session.feeRate;
      est.innerHTML = 'Market ' + side + ' of <b>' + fmt.qty(qty) + '</b> roughly fills near <b>' + fmt.usd(fill) + '</b>; total cost ≈ <b>' + fmt.usd(gross + fee) + '</b> incl. fee.';
    }

    function doOrder() {
      err.hidden = true;
      const qty = Number(qtyInp.value);
      const input = { side, type: typeSel.value, qty, symbol: session.symbol };
      if (typeSel.value === 'limit') input.price = Number(priceInp.value);
      const r = sim.placeOrder(session, input);
      if (!r.ok) { err.textContent = r.error; err.hidden = false; return; }
      app.toast(r.message);
      refreshAll();
    }

    function tickForever() {
      if (timer) return;
      timer = setInterval(() => {
        if (!running || !session) return;
        barIndex += 1;
        if (barIndex >= fullSeries.length) {
          const ins = instrument();
          fullSeries = market.seriesDirect({ symbol: ins.symbol, timeframe: '1H', seed: (Date.now() % 100000) | 0, trend: 'range', count: 240 });
          barIndex = START_BAR;
        }
        candles = fullSeries.slice(0, barIndex + 1);
        lastPrice = candles.length > 1 ? candles[candles.length - 2].c : candles[0].c;
        session.price = candles[candles.length - 1].c;
        sim.tick(session, session.price);
        if (chartApi) chartApi.set(candles);
        refreshAll();
      }, 1600);
    }

    // ---- wire up ----
    feeRange.addEventListener('input', () => { feeVal.textContent = (Number(feeRange.value) / 100 * 100).toFixed(1) + '%'; if (session) session.feeRate = Number(feeRange.value) / 100; refreshAll(); });
    slipRange.addEventListener('input', () => { slipVal.textContent = (Number(slipRange.value) / 100 * 100).toFixed(1) + '%'; if (session) session.slippageRate = Number(slipRange.value) / 100; refreshAll(); });
    instrSel.addEventListener('change', reload);
    buyBtn.addEventListener('click', () => { side = 'buy'; buyBtn.classList.add('active'); sellBtn.classList.remove('active'); updateEst(); });
    sellBtn.addEventListener('click', () => { side = 'sell'; sellBtn.classList.add('active'); buyBtn.classList.remove('active'); updateEst(); });
    typeSel.addEventListener('change', () => { priceInp.hidden = typeSel.value !== 'limit'; updateEst(); });
    qtyInp.addEventListener('input', updateEst);
    goBtn.addEventListener('click', doOrder);
    playBtn.addEventListener('click', () => {
      running = !running;
      playBtn.textContent = running ? 'Pause ticks' : 'Resume ticks';
      if (running) tickForever();
    });
    resetBtn.addEventListener('click', () => { reload(); app.toast('Session reset with fresh $100,000.'); });
    evalBtn.addEventListener('click', () => {
      const r = sim.evaluateSession(session);
      const body = document.createElement('div');
      const lines = [
        ['Net P&L', fmt.signedUsd(r.net)],
        ['Return', fmt.pct(r.returnPct, 2, true)],
        ['Trades', String(r.trades)],
        ['Win rate', fmt.pct(r.winRate, 1, false)],
        ['Profit factor', isFinite(r.profitFactor) ? r.profitFactor.toFixed(2) : '∞'],
        ['Max drawdown', fmt.pct(r.maxDrawdown, 1, false)],
        ['Risk score', r.riskScore + ' / 100'],
        ['Discipline score', r.disciplineScore + ' / 100']
      ];
      const t = document.createElement('table'); t.className = 'mini-table';
      lines.forEach(([k, v]) => {
        const tr = document.createElement('tr');
        const td1 = document.createElement('td'); td1.textContent = k;
        const td2 = document.createElement('td'); td2.textContent = v;
        tr.append(td1, td2); t.appendChild(tr);
      });
      body.appendChild(t);
      const p = document.createElement('p'); p.className = 'card-text'; p.textContent = r.note;
      body.appendChild(p);
      app.openModal({ title: 'Session evaluation', bodyNode: body });
    });

    container.appendChild(wrap);

    reload();
    refreshAll();
    tickForever();

    return {
      title: 'Trading Simulator',
      cleanup: () => { clearInterval(timer); timer = null; if (chartApi) { chartApi.destroy(); chartApi = null; } },
      stopTimers: () => { clearInterval(timer); timer = null; }
    };
  }

  root.TV = Object.assign(root.TV || {}, { views: Object.assign((root.TV && root.TV.views) || {}, { simulator: { render } }) });
})(typeof window !== 'undefined' ? window : globalThis);
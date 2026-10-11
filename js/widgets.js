/* TradeVerse — interactive teaching widgets rendered inside lessons.
   Each widget is self-contained, builds DOM with textContent (XSS-safe),
   and cleans up its canvas listeners on removal. */
(function (root) {
  'use strict';

  const M = () => root.TV.market;

  function range(opts) {
    const r = document.createElement('input');
    r.type = 'range';
    r.className = 'range';
    r.min = opts.min; r.max = opts.max; r.step = opts.step != null ? opts.step : 0.01; r.value = opts.value;
    if (opts.disabled) r.disabled = true;
    return r;
  }

  function rangeRow(labelText, slider, valEl) {
    const row = document.createElement('div'); row.className = 'range-row';
    const lab = document.createElement('label'); lab.textContent = labelText;
    const val = valEl || document.createElement('span'); val.className = 'range-val';
    row.append(lab, slider, val);
    return { row, val };
  }

  function btn(label, cls) {
    const b = document.createElement('button'); b.className = 'btn ' + (cls || 'btn-outline'); b.type = 'button';
    b.style.minHeight = '34px'; b.style.padding = '6px 14px'; b.style.fontSize = '12.5px';
    b.textContent = label;
    return b;
  }

  function mkWidget(container, title, hintHtml) {
    container.innerHTML = '';
    const wrap = document.createElement('div'); wrap.className = 'widget';
    const t = document.createElement('div'); t.className = 'widget-title'; t.textContent = title;
    wrap.appendChild(t);
    if (hintHtml) {
      const h = document.createElement('div'); h.className = 'widget-hint'; h.innerHTML = hintHtml;
      wrap.appendChild(h);
    }
    container.appendChild(wrap);
    return wrap;
  }

  /* ---- 1. Bid / Ask / Spread ---- */
  function bidAsk(container) {
    const wrap = mkWidget(container, 'Interactive: the quote box', 'Move the sliders and watch what spreads cost you on a round trip.');
    let bid = 49.9, ask = 50.1;

    const q = document.createElement('div');
    q.className = 'quote-grid';
    const cells = {};
    const mk = (k) => { const c = document.createElement('div'); c.className = 'ohlc-cell'; const kk = document.createElement('div'); kk.className = 'k'; kk.textContent = k; const v = document.createElement('div'); v.className = 'v'; c.append(kk, v); q.appendChild(c); cells[k] = v; };
    ['BID', 'ASK', 'SPREAD', 'ROUND-TRIP'].forEach(mk);
    wrap.appendChild(q);

    function paint() {
      const spread = ask - bid;
      cells.BID.textContent = '$' + bid.toFixed(2); cells.BID.style.color = 'var(--up)';
      cells.ASK.textContent = '$' + ask.toFixed(2); cells.ASK.style.color = 'var(--down)';
      cells.SPREAD.textContent = '$' + spread.toFixed(2);
      cells['ROUND-TRIP'].textContent = '$' + (spread * 2).toFixed(2);
      cells['ROUND-TRIP'].style.color = spread * 2 > 0.1 ? 'var(--danger)' : 'var(--text-2)';
    }

    const rs = [];
    const bBid = range({ min: 49.5, max: 50.3, step: 0.01, value: bid });
    const bAsk = range({ min: 49.7, max: 50.5, step: 0.01, value: ask });
    rs.push(bBid); rs.push(bAsk);
    const rows = [];
    rows.push(rangeRow('Bid (what buyers pay)', bBid, null));
    rows.push(rangeRow('Ask (what sellers get)', bAsk, null));
    rows.forEach(r => wrap.appendChild(r.row));
    const vBid = rows[0].val, vAsk = rows[1].val;

    function update() {
      bid = Number(bBid.value); ask = Number(bAsk.value);
      if (ask <= bid) { ask = bid + 0.02; bAsk.value = ask; }
      vBid.textContent = '$' + bid.toFixed(2);
      vAsk.textContent = '$' + ask.toFixed(2);
      paint();
    }
    bBid.addEventListener('input', update);
    bAsk.addEventListener('input', update);
    update();

    const note = document.createElement('div'); note.className = 'widget-readout';
    note.innerHTML = 'Buy 100 shares → you pay the <b>ask</b>. Sell them right away → you receive the <b>bid</b>. The spread is the cost of that round trip — it is why price must move in your favour before you are ahead.';
    wrap.appendChild(note);
    void rs;
  }

  /* ---- 2. Candle builder (OHLC validation) ---- */
  function candle(container) {
    const wrap = mkWidget(container, 'Interactive: build a candlestick', 'Set Open, Close, High and Low. Valid candles keep High ≥ Open & Close, and Low ≤ both.');
    const cols = document.createElement('div'); cols.className = 'widget-candle';
    const controls = document.createElement('div');
    const canvasWrap = document.createElement('div'); canvasWrap.className = 'chart-wrap candle-canvas';
    cols.append(controls, canvasWrap);
    wrap.appendChild(cols);

    const o = 100, c = 102, h = 104, l = 99;
    const so = range({ min: 92, max: 108, step: 0.1, value: o });
    const sc = range({ min: 92, max: 108, step: 0.1, value: c });
    const sh = range({ min: 100, max: 110, step: 0.1, value: h });
    const sl = range({ min: 90, max: 100, step: 0.1, value: l });
    const rows = [['Open', so], ['Close', sc], ['High', sh], ['Low', sl]].map(([lab, s]) => {
      const r = rangeRow(lab, s, null);
      controls.appendChild(r.row);
      return r;
    });

    const tick = Math.floor(Math.random() * 10000) + 1;
    const p0 = Date.now() - 60000;
    const candles = [{ t: p0, o, h, l, c }, { t: p0 + 60000, o, h, l, c }];
    const chart = root.TV.chart.createChart(canvasWrap, { height: 180, decimals: 2, tfLabel: 'CUSTOM' });
    function setCandle() {
      const O = Number(so.value), C = Number(sc.value), H = Number(sh.value), L = Number(sl.value);
      candles[1].o = O; candles[1].c = C; candles[1].h = Math.max(H, Math.max(O, C)); candles[1].l = Math.min(L, Math.min(O, C));
      chart.set(candles);
      paint();
    }
    so.addEventListener('input', () => { rows[0].val.textContent = Number(so.value).toFixed(1); setCandle(); });
    sc.addEventListener('input', () => { rows[1].val.textContent = Number(sc.value).toFixed(1); setCandle(); });
    sh.addEventListener('input', () => { rows[2].val.textContent = Number(sh.value).toFixed(1); setCandle(); });
    sl.addEventListener('input', () => { rows[3].val.textContent = Number(sl.value).toFixed(1); setCandle(); });
    rows.forEach((r, i) => r.val.textContent = pairs(i));

    function pairs(i) { const arr = [so, sc, sh, sl]; return Number(arr[i].value).toFixed(1); }

    const readout = document.createElement('div'); readout.className = 'widget-readout';
    wrap.appendChild(readout);
    function paint() {
      const O = Number(so.value), C = Number(sc.value), H = Number(sh.value), L = Number(sl.value);
      const rules = [
        ['High ≥ Open', H >= O, 'high ' + H + ' vs open ' + O],
        ['High ≥ Close', H >= C, 'high ' + H + ' vs close ' + C],
        ['Low ≤ Open', L <= O, 'low ' + L + ' vs open ' + O],
        ['Low ≤ Close', L <= C, 'low ' + L + ' vs close ' + C],
        ['High ≥ Low', H >= L, 'high ' + H + ' vs low ' + L]
      ];
      readout.innerHTML = rules.map(([t, ok, detail]) => '<div><span class="' + (ok ? 'ok' : 'bad') + '">' + (ok ? '✓' : '✗') + '</span> <b>' + t + '</b> — ' + detail + '</div>').join('');
    }
    setCandle();
  }

  /* ---- 3. Trend demo ---- */
  function trend(container) {
    const wrap = mkWidget(container, 'Interactive: read the trend', 'This sample shows an uptrend. Toggle the swing lines to see higher highs and higher lows.');
    const canvasWrap = document.createElement('div'); canvasWrap.className = 'chart-wrap'; canvasWrap.style.height = '300px';
    wrap.appendChild(canvasWrap);

    const candles = M().seriesFor({ symbol: 'SPX', timeframe: '1H', seed: 7, trend: 'up' });
    const highs = [], lows = [];
    candles.forEach((c, i) => {
      const isPeak = i > 0 && i < candles.length - 1 && c.h > candles[i - 1].h && c.h >= candles[i + 1].h;
      const isTrough = i > 0 && i < candles.length - 1 && c.l < candles[i - 1].l && c.l <= candles[i + 1].l;
      highs.push(isPeak ? c.h : null);
      lows.push(isTrough ? c.l : null);
    });
    const chart = root.TV.chart.createChart(canvasWrap, {
      height: 300, decimals: 2, tfLabel: 'SIM 1H',
      overlays: []
    });
    const labels = ['Trend line on', 'Swings on'];
    const tog = {};
    const btns = document.createElement('div'); btns.className = 'widget-actions';
    const stats = document.createElement('div'); stats.className = 'widget-readout'; stats.style.marginTop = '12px';

    ['trend', 'swings'].forEach((key, i) => {
      const b = btn(labels[i]);
      b.classList.add('widget-tag'); b.classList.add('on');
      b.setAttribute('aria-pressed', 'true');
      btns.appendChild(b);
      tog[key] = b;
    });
    wrap.appendChild(btns); wrap.appendChild(stats);

    function repaint() {
      const overlays = [];
      if (tog.trend.classList.contains('on')) overlays.push({ data: lows });
      if (tog.swings.classList.contains('on')) overlays.push({ data: highs, color: '#f472b6' });
      chart.set(candles);
      chart.markers([]);
      chart.overlays(overlays);
      relics();
    }
    function relics() {
      const peak = highs.filter(v => v != null); const trough = lows.filter(v => v != null);
      stats.innerHTML = 'Higher highs: <b class="ok">' + peak.length + ' swing highs</b> · Higher lows: <b class="ok">' + trough.length + ' swing lows</b>';
    }
    tog.trend.addEventListener('click', () => { tog.trend.classList.toggle('on'); tog.trend.setAttribute('aria-pressed', tog.trend.classList.contains('on') ? 'true' : 'false'); repaint(); });
    tog.swings.addEventListener('click', () => { tog.swings.classList.toggle('on'); tog.swings.setAttribute('aria-pressed', tog.swings.classList.contains('on') ? 'true' : 'false'); repaint(); });
    chart.set(candles);
    repaint();
  }

  function support(container) {
    const wrap = mkWidget(container, 'Interactive: mark support & resistance', 'Click the chart to place a level. A box labels it support (below price) or resistance (above).');
    const canvasWrap = document.createElement('div'); canvasWrap.className = 'chart-wrap'; canvasWrap.style.height = '300px';
    wrap.appendChild(canvasWrap);
    const candles = M().seriesFor({ symbol: 'EUR', timeframe: '15m', seed: 3, trend: 'range' });
    const chart = root.TV.chart.createChart(canvasWrap, { height: 300, decimals: 4, candles, tfLabel: 'SIM 15m' });
    chart.set(candles);
    const markers = [];
    const last = candles[candles.length - 1].c;
    const actions = document.createElement('div'); actions.className = 'widget-actions';
    const clearBtn = btn('Clear levels');
    actions.appendChild(clearBtn);
    const readout = document.createElement('div'); readout.className = 'widget-readout'; readout.style.marginTop = '12px';
    wrap.append(actions, readout);

    function pick(e) {
      const rect = canvasWrap.getBoundingClientRect();
      const y = (e.clientY - rect.top) / rect.height;
      const rng = chart.getRect();
      const priceTop = Math.max.apply(null, candles.map(c => c.h)) * 1.03;
      const priceBot = Math.min.apply(null, candles.map(c => c.l)) * 0.97;
      const price = priceTop - y * (priceTop - priceBot);
      const isSup = price < last;
      markers.push({ price: root.TV.format.round(price, 4), color: isSup ? '#00e5a0' : '#ff5c5c', label: (isSup ? 'Support ' : 'Resistance ') + (markers.length + 1) });
      chart.markers(markers);
      readout.innerHTML = markers.map(m => m.label).join(' · ');
    }
    canvasWrap.addEventListener('click', pick);
    clearBtn.addEventListener('click', () => { markers.length = 0; chart.markers([]); readout.textContent = 'No levels marked.'; });
    readout.textContent = 'No levels marked yet — click the chart.';
  }

  /* ---- 5. Stop-loss demo ---- */
  function stop(container) {
    const wrap = mkWidget(container, 'Interactive: stop-loss placement', 'Drag entry and stop. The demo shows risk per unit, a 1:2 target, and whether price ever pierced your stop.');
    const candles = M().seriesFor({ symbol: 'TECH', timeframe: '1H', seed: 11, trend: 'up' });
    const last = candles[candles.length - 1].c;
    const entry = root.TV.format.round(last * 0.995, 4);
    let stprice = root.TV.format.round(entry * 0.98, 4);

    const canvasWrap = document.createElement('div'); canvasWrap.className = 'chart-wrap'; canvasWrap.style.height = '300px';
    const sliders = document.createElement('div'); sliders.style.marginTop = '10px';
    const se = range({ min: root.TV.format.round(entry * 0.99, 4), max: root.TV.format.round(entry * 1.01, 4), step: 0.0005, value: entry });
    const ss = range({ min: root.TV.format.round(entry * 0.96, 4), max: root.TV.format.round(entry * 0.999, 4), step: 0.0005, value: stprice });
    const re = rangeRow('Entry', se, null); const rs = rangeRow('Stop', ss, null);
    sliders.append(re.row, rs.row);
    wrap.append(canvasWrap, sliders);
    const readout = document.createElement('div'); readout.className = 'widget-readout'; readout.style.marginTop = '12px';
    wrap.appendChild(readout);

    const chart = root.TV.chart.createChart(canvasWrap, { height: 300, decimals: 4, tfLabel: 'SIM 1H' });
    function paint() {
      const e = Number(se.value), s = Number(ss.value);
      const risk = e - s;
      const target = e + risk * 2;
      const pierced = candles.some(c => c.l <= s);
      const markers = [
        { price: e, color: '#00e5a0', label: 'Entry' },
        { price: s, color: '#ff5c5c', label: 'Stop' },
        { price: target, color: '#2fd672', label: 'Target (1:2)' }
      ];
      re.val.textContent = e.toFixed(4); rs.val.textContent = s.toFixed(4);
      chart.set(candles);
      chart.markers(markers);
      readout.innerHTML = 'Risk to stop: <b>' + risk.toFixed(4) + '</b> · Reward target: <b>' + (risk * 2).toFixed(4) + '</b> · Price pierced your stop before entry? <b class="' + (pierced ? 'bad' : 'ok') + '">' + (pierced ? 'Yes — bad placement' : 'No — room to breathe') + '</b>';
    }
    se.addEventListener('input', paint);
    ss.addEventListener('input', paint);
    paint();
  }

  const RENDERERS = { bidAsk, candle, trend, support, stop };

  function render(container, name) {
    const fn = RENDERERS[name];
    if (fn) fn(container);
    return !!fn;
  }

  const NS = { render, names: Object.keys(RENDERERS) };

  if (typeof module !== 'undefined' && module.exports) module.exports = NS;
  else root.TV = Object.assign(root.TV || {}, { widgets: NS });
})(typeof window !== 'undefined' ? window : globalThis);
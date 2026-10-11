/* TradeVerse — Chart Lab: interactive OHLC charts on simulated data. */
(function (root) {
  'use strict';

  function sma(closes, n) {
    const out = []; let sum = 0;
    for (let i = 0; i < closes.length; i++) {
      sum += closes[i];
      if (i >= n - 1) { out.push(ROUND2(sum / n)); sum -= closes[i - n + 1]; }
      else out.push(null);
    }
    return out;
  }
  function ROUND2(v) { return Math.round(v * 10000) / 10000; }

  function render(container, params) {
    const market = root.TV.market;
    const app = root.TV.app;
    const wrap = document.createElement('div');
    wrap.className = 'container';

    wrap.appendChild(app.pageHead('Chart Lab', 'Explore candlesticks and timeframes on labelled SIMULATED sample data. Nothing here is a live quote.', [
      { label: 'Home', hash: '#/' }
    ]));

    const controls = document.createElement('div'); controls.className = 'card controls';
    const ctlGrid = document.createElement('div'); ctlGrid.className = 'ctl-grid';

    function makeSelect(labelText, options, value) {
      const cell = document.createElement('label'); cell.className = 'ctl';
      const l = document.createElement('span'); l.className = 'ctl-label'; l.textContent = labelText;
      const sel = document.createElement('select');
      options.forEach(([v, txt]) => {
        const o = document.createElement('option'); o.value = v; o.textContent = txt; sel.appendChild(o);
      });
      sel.value = value;
      cell.append(l, sel);
      return cell;
    }

    const instrSel = makeSelect('Instrument', market.INSTRUMENTS.map(i => [i.symbol, i.name]), 'BTC');
    const tfSel = makeSelect('Timeframe', market.TIMEFRAMES.map(t => [t.key, t.label]), '1H');
    const typeSel = makeSelect('Chart type', [['candles', 'Candles'], ['line', 'Line'], ['area', 'Area']], 'candles');
    ctlGrid.append(instrSel, tfSel, typeSel);

    const toggles = document.createElement('div'); toggles.className = 'ma-toggles';
    const mkToggle = (label, checked) => {
      const l = document.createElement('label'); l.className = 'chk';
      const c = document.createElement('input'); c.type = 'checkbox'; c.checked = !!checked;
      const s = document.createElement('span'); s.textContent = label;
      l.append(c, s);
      return l;
    };
    const ma20 = mkToggle('Moving average · 20', true);
    const ma50 = mkToggle('Moving average · 50', false);
    toggles.append(ma20, ma50);
    ctlGrid.appendChild(toggles);
    controls.appendChild(ctlGrid);
    wrap.appendChild(controls);

    const chartCard = document.createElement('div'); chartCard.className = 'card';
    const bar = document.createElement('div'); bar.className = 'viz-bar';
    const t = document.createElement('div'); t.className = 't';
    const tag = document.createElement('span'); tag.className = 'sim-data-tag'; tag.textContent = 'SIMULATED sample data — not a live market';
    bar.append(t, tag);
    const chartWrap = document.createElement('div'); chartWrap.className = 'chart-wrap'; chartWrap.style.height = '360px';
    chartCard.append(bar, chartWrap);
    wrap.appendChild(chartCard);

    const ins = document.createElement('div'); ins.className = 'inspect';
    wrap.appendChild(ins);

    function insCard() {
      const card = document.createElement('div'); card.className = 'ins-card card';
      const h = document.createElement('h3'); h.textContent = 'Candle inspector';
      card.appendChild(h);
      const rows = document.createElement('div'); rows.className = 'ohlc-grid';
      const cells = {};
      [['open', 'Open'], ['high', 'High'], ['low', 'Low'], ['close', 'Close'], ['time', 'Time'], ['vol', 'Volume']].forEach(([k, label]) => {
        const cell = document.createElement('div'); cell.className = 'ohlc-cell';
        const lb = document.createElement('div'); lb.className = 'lb'; lb.textContent = label;
        const v = document.createElement('div'); v.className = 'v'; v.dataset.val = k;
        cell.append(lb, v); rows.appendChild(cell); cells[k] = v;
      });
      card.appendChild(rows);
      const status = document.createElement('div'); status.className = 'ins-status';
      card.appendChild(status);
      ins.appendChild(card);
      return { cells, status };
    }

    let chart = null;
    let currentData = [];

    const fmtNum = (v, d) => Number(v).toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d });

    function padFill(cd, i) {
      if (!cd) return;
      const insObj = root.TV.market.instrument(currentSymbol());
      const d = insObj.dec;
      cells.open.textContent = fmtNum(cd.o, d);
      cells.high.textContent = fmtNum(cd.h, d);
      cells.low.textContent = fmtNum(cd.l, d);
      cells.close.textContent = fmtNum(cd.c, d);
      cells.time.textContent = new Date(cd.t).toISOString().replace('T', ' ').slice(0, 19) + ' UTC';
      cells.vol.textContent = String(cd.v);
      statusEl.textContent = 'You can verify this candle yourself: the raw timestamp is ' + cd.t + ' ms since 1970, and the next bar starts at ' + (i + 1 < currentData.length ? currentData[i + 1].t : '—') + ' ms = exactly +' + market.MINUTES[currentTf()] + ' minute(s).';
    }

    let statusEl = null, cells = null;
    function initIns() {
      const r = insCard();
      cells = r.cells; statusEl = r.status;
    }
    initIns();

    function currentSymbol() { return instrSel.value; }
    function currentTf() { return tfSel.value; }

    function load() {
      const insInfo = market.instrument(currentSymbol());
      const candles = market.seriesFor({ symbol: currentSymbol(), timeframe: currentTf(), seed: 100 + market.INSTRUMENTS.indexOf(insInfo), trend: 'range' });
      currentData = candles;
      const closes = candles.map(c => c.c);
      const ov = [];
      if (ma20.querySelector('input').checked) ov.push({ label: 'MA20', data: sma(closes, 20) });
      if (ma50.querySelector('input').checked) ov.push({ label: 'MA50', data: sma(closes, 50) });
      if (!chart) {
        chart = root.TV.chart.createChart(chartWrap, {
          height: 360,
          tfLabel: currentSymbol() + ' · ' + currentTf() + ' · SIM',
          onHover: (cd) => {
            const i = cd ? currentData.indexOf(cd) : -1;
            padFill(cd, i);
          }
        });
      }
      chart.mode(typeSel.value);
      chart.set(candles);
      chart.overlays(ov);
      t.textContent = currentSymbol() + ' · ' + currentTf() + ' · SIMULATED';
      padFill(currentData[currentData.length - 1], currentData.length - 1);
      validate();
    }

    function validate() {
      const res = market.validateCandles(currentData);
      statusEl.textContent = res.valid
        ? '✓ Dataset valid: ' + res.count + ' candles, every OHLC invariant holds.'
        : '✗ Dataset has ' + res.violations.length + ' invalid candles.';
    }

    const validateBtn = document.createElement('button'); validateBtn.className = 'btn btn-sm btn-outline'; validateBtn.textContent = 'Validate dataset';
    validateBtn.addEventListener('click', validate);
    ins.appendChild(validateBtn);

    instrSel.addEventListener('change', load);
    tfSel.addEventListener('change', load);
    typeSel.addEventListener('change', () => { if (chart) { chart.mode(typeSel.value); } });
    ma20.querySelector('input').addEventListener('change', load);
    ma50.querySelector('input').addEventListener('change', load);

    load();

    container.appendChild(wrap);
    return {
      title: 'Chart Lab',
      cleanup: () => { if (chart) chart.destroy(); }
    };
  }

  root.TV = Object.assign(root.TV || {}, { views: Object.assign((root.TV && root.TV.views) || {}, { chartLab: { render } }) });
})(typeof window !== 'undefined' ? window : globalThis);
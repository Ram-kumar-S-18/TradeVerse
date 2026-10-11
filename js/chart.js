/* TradeVerse — canvas chart engine (no external charting dependency).
   Renders candlestick, line and area charts with gridlines, price axis,
   hovers, crosshair and safe DOM tooltips. Pure data in, pixels out. */
(function (root) {
  'use strict';

  const COL = {
    up: '#2fd672', down: '#ff5c5c',
    grid: 'rgba(255,255,255,0.05)',
    axis: '#a3a3a3',
    cross: 'rgba(255,255,255,0.28)',
    area: 'rgba(57,255,20,0.16)',
    line: '#39ff14',
    wickUp: '#2fd672', wickDown: '#ff5c5c'
  };

  function createChart(wrapEl, opts) {
    opts = opts || {};
    let canvas = wrapEl.querySelector('canvas');
    if (!canvas) { canvas = document.createElement('canvas'); wrapEl.appendChild(canvas); }
    const ctx = canvas.getContext('2d');
    const dpr = Math.min(2, (typeof window !== 'undefined' && window.devicePixelRatio) || 1);
    let W = 0, H = 0;
    const requestedHeight = opts.height || 340;
    let tooltip = wrapEl.querySelector('.chart-tooltip');
    if (!tooltip) { tooltip = document.createElement('div'); tooltip.className = 'chart-tooltip'; tooltip.hidden = true; wrapEl.appendChild(tooltip); }
    let state = { candles: [], data: [], type: 'candles', overlays: [], markers: [], decimals: 2, hover: -1 };
    let raf = null;

    function size() {
      const rect = wrapEl.getBoundingClientRect();
      W = Math.max(80, rect.width);
      // Shorter charts on narrow screens so they never dominate the viewport.
      const minH = 200;
      H = Math.max(minH, Math.min(requestedHeight, Math.round(W * 0.66)));
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      canvas.style.width = W + 'px';
      canvas.style.height = H + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      padR = W < 480 ? 52 : 66;
      tickFont = W < 480 ? 10 : 11;
    }

    let padR = 66, padT = 12, padB = 22, tickFont = 11;

    function priceRange() {
      let lo = Infinity, hi = -Infinity;
      const cs = state.data;
      if (state.type === 'candles') {
        for (const c of cs) { lo = Math.min(lo, c.l); hi = Math.max(hi, c.h); }
      } else {
        for (const p of cs) { lo = Math.min(lo, p); hi = Math.max(hi, p); }
      }
      if (!Number.isFinite(lo) || !Number.isFinite(hi)) { lo = 0; hi = 1; }
      if (hi - lo < 1e-9) { lo -= 0.5; hi += 0.5; }
      const pad = (hi - lo) * 0.08;
      lo -= pad; hi += pad;
      return { lo, hi };
    }

    function xFor(i, n) { return padL() + (i + 0.5) * (innerW() / n); }
    function yFor(p, lo, hi) { return padT + (1 - (p - lo) / (hi - lo)) * innerH(); }
    function padL() { return 8; }
    function innerW() { return W - padL() - padR; }
    function innerH() { return H - padT - padB; }

    function priceTicks(lo, hi) {
      // ~5 nice labels
      const rough = (hi - lo) / 5;
      const mag = Math.pow(10, Math.floor(Math.log10(rough)));
      const norm = rough / mag;
      const step = (norm >= 5 ? 5 : norm >= 2 ? 2 : 1) * mag;
      const ticks = [];
      for (let v = Math.ceil(lo / step) * step; v <= hi; v += step) ticks.push(v);
      return ticks;
    }

    function nice(p, dec) {
      const d = dec == null ? state.decimals : dec;
      return p.toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d });
    }

    function drawGrid(lo, hi) {
      ctx.strokeStyle = COL.grid; ctx.lineWidth = 1; ctx.font = tickFont + 'px "JetBrains Mono", monospace'; ctx.fillStyle = COL.axis;
      const ticks = priceTicks(lo, hi);
      for (const t of ticks) {
        const y = yFor(t, lo, hi);
        ctx.beginPath(); ctx.moveTo(padL(), y); ctx.lineTo(W - padR, y); ctx.stroke();
        ctx.fillText(nice(t), W - padR + 6, y + 4);
      }
    }

    function drawCandles() {
      const { lo, hi } = priceRange();
      const cs = state.data;
      const n = cs.length;
      const slot = innerW() / n;
      const bodyW = Math.max(1.5, Math.min(slot * 0.62, 14));
      drawGrid(lo, hi);
      for (let i = 0; i < n; i++) {
        const c = cs[i];
        const up = c.c >= c.o;
        const x = xFor(i, n);
        ctx.strokeStyle = up ? COL.wickUp : COL.wickDown;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(x, yFor(c.h, lo, hi));
        ctx.lineTo(x, yFor(c.l, lo, hi));
        ctx.stroke();
        ctx.fillStyle = up ? COL.up : COL.down;
        const yo = yFor(c.o, lo, hi);
        const yc = yFor(c.c, lo, hi);
        ctx.fillRect(x - bodyW / 2, Math.min(yo, yc), bodyW, Math.max(1, Math.abs(yc - yo)));
      }
    }

    function drawLineArea() {
      const { lo, hi } = priceRange();
      const n = state.data.length;
      const coords = state.data.map((p, i) => [xFor(i, n), yFor(p, lo, hi)]);
      drawGrid(lo, hi);
      ctx.beginPath();
      coords.forEach(([x, y], i) => { if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y); });
      if (state.type === 'area') {
        ctx.lineTo(coords[coords.length - 1][0], yFor(lo, lo, hi));
        ctx.lineTo(coords[0][0], yFor(lo, lo, hi));
        ctx.closePath();
        const g = ctx.createLinearGradient(0, padT, 0, innerH());
        g.addColorStop(0, COL.area);
        g.addColorStop(1, 'rgba(57,255,20,0)');
        ctx.fillStyle = g; ctx.fill();
      }
      ctx.strokeStyle = COL.line; ctx.lineWidth = 2; ctx.stroke();
      const step = Math.max(1, Math.ceil(n / 40));
      coords.forEach(([x, y], i) => {
        if (i % step === 0) {
          ctx.beginPath(); ctx.arc(x, y, 2, 0, Math.PI * 2); ctx.fillStyle = COL.line; ctx.fill();
        }
      });
    }

    const overlayColors = ['#e8b54a', '#58a6ff', '#c084fc', '#f472b6'];
    function drawOverlays(lo, hi) {
      const n = state.candles.length;
      state.overlays.forEach((ov, oi) => {
        ctx.strokeStyle = overlayColors[oi % overlayColors.length];
        ctx.lineWidth = 1.5; ctx.beginPath(); let started = false;
        ov.data.forEach((v, i) => {
          if (v == null) { started = false; return; }
          const x = xFor(i, state.data.length);
          const y = yFor(v, lo, hi);
          if (!started) { ctx.moveTo(x, y); started = true; } else ctx.lineTo(x, y);
        });
        ctx.stroke();
      });
      void n;
    }

    function drawMarkers(lo, hi) {
      state.markers.forEach(mk => {
        const y = yFor(mk.price, lo, hi);
        ctx.strokeStyle = mk.color || '#00e5a0'; ctx.setLineDash([5, 4]); ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.moveTo(padL(), y); ctx.lineTo(W - padR, y); ctx.stroke(); ctx.setLineDash([]);
        ctx.fillStyle = ctx.strokeStyle; ctx.font = '600 11px "JetBrains Mono", monospace';
        ctx.fillText(mk.label || '', padL() + 4, y - 5);
      });
    }

    function render() {
      ctx.clearRect(0, 0, W, H);
      const n = state.data.length;
      if (!n) { return; }
      if (state.type === 'candles') { const { lo, hi } = priceRange(); drawOverlays(lo, hi); drawMarkers(lo, hi); drawCandles(); }
      else drawLineArea();
      if (state.hover >= 0 && state.hover < n) drawCross(state.hover, state.data.length);
    }

    function drawCross(i, n) {
      const x = xFor(i, n);
      ctx.strokeStyle = COL.cross; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(x, padT); ctx.lineTo(x, H - padB); ctx.stroke();
    }

    function showTooltip(i) {
      const c = state.candles[i];
      if (!c) { tooltip.hidden = true; return; }
      tooltip.hidden = false;
      const up = c.c >= c.o;
      tooltip.classList.remove('tt-up', 'tt-down', 'tt-default');
      tooltip.classList.add(up ? 'tt-up' : 'tt-down');
      const pad = state.decimals;
      const fmt = (v) => v.toLocaleString('en-US', { minimumFractionDigits: pad, maximumFractionDigits: pad });
      tooltip.innerHTML = ''; // cleared, then rebuilt with textContent only (XSS-safe)
      const title = document.createElement('div'); title.className = 'tt-title';
      const tfLabel = document.createElement('span'); tfLabel.textContent = state.tfLabel || '';
      const dir = document.createElement('b'); dir.textContent = up ? '▲ ' : '▼ ';
      title.appendChild(tfLabel); title.appendChild(dir);
      tooltip.appendChild(title);
      [['O', c.o], ['H', c.h], ['L', c.l], ['C', c.c]].forEach(([k, v]) => {
        const row = document.createElement('div'); row.className = 'tt-row';
        const kk = document.createElement('span'); kk.textContent = k;
        const vv = document.createElement('b'); vv.textContent = fmt(v);
        row.appendChild(kk); row.appendChild(vv);
        tooltip.appendChild(row);
      });
      // position: keep the tooltip fully inside the chart box
      const slot = innerW() / state.data.length;
      const px = Math.min(Math.max(xFor(i, state.data.length), 60), W - 60);
      tooltip.style.left = px + 'px';
      tooltip.style.top = 8 + 'px';
      tooltip.style.maxWidth = (W - 16) + 'px';
    }

    function idxFromEvent(e, rect) {
      const x = e.clientX - rect.left;
      const n = state.data.length || 1;
      const i = Math.floor((x - padL()) / (innerW() / n));
      return Math.min(n - 1, Math.max(0, i));
    }

    function attach() {
      const rectOf = () => wrapEl.getBoundingClientRect();
      const move = (e) => {
        if (state.data.length === 0) return;
        const rect = rectOf();
        const clientX = (e.clientX != null) ? e.clientX
          : (e.touches && e.touches[0] ? e.touches[0].clientX
            : (e.changedTouches && e.changedTouches[0] ? e.changedTouches[0].clientX : null));
        if (clientX == null) return;
        const i = idxFromEvent({ clientX }, rect);
        if (i !== state.hover) { state.hover = i; if (opts.onHover) opts.onHover(state.candles[i] || null); render(); showTooltip(i); }
      };
      const leave = () => { state.hover = -1; tooltip.hidden = true; if (opts.onHover) opts.onHover(null); render(); };
      // On touch, keep the last inspected candle visible (no hover-off), so the
      // tooltip and any OHLC readout persist until the user inspects elsewhere.
      const touchMove = (e) => { move(e); };
      canvas.addEventListener('mousemove', move);
      canvas.addEventListener('mouseleave', leave);
      canvas.addEventListener('touchstart', touchMove, { passive: true });
      canvas.addEventListener('touchmove', touchMove, { passive: true });
      wrapEl._tvTeardown = () => {
        canvas.removeEventListener('mousemove', move);
        canvas.removeEventListener('mouseleave', leave);
        canvas.removeEventListener('touchstart', touchMove);
        canvas.removeEventListener('touchmove', touchMove);
        if (typeof ResizeObserver !== 'undefined' && chartApi._resizeObs) { chartApi._resizeObs.disconnect(); chartApi._resizeObs = null; }
      };
    }

    const chartApi = {
      set(data) {
        // data is always candles; type decides how they are drawn
        if (!data || !data.length) { state.candles = []; state.data = []; state.hover = -1; tooltip.hidden = true; render(); return; }
        state.candles = data;
        state.decimals = (opts.decimals != null) ? opts.decimals : inferDecimals(data);
        recompute();
        state.overlays = opts.overlays || [];
        state.markers = opts.markers || [];
        state.tfLabel = opts.tfLabel || '';
        state.hover = -1;
        tooltip.hidden = true;
        render();
      },
      mode(t) { state.type = t === 'candles' ? 'candles' : (t === 'area' ? 'area' : 'line'); recompute(); render(); },
      overlays: (ov) => { state.overlays = ov || []; render(); },
      draw: render,
      markers: (m) => { state.markers = m; render(); },
      destroy() { if (wrapEl._tvTeardown) { wrapEl._tvTeardown(); } wrapEl.querySelectorAll('.chart-tooltip').forEach(n => n.remove()); },
      getRect: () => ({ width: W, height: H })
    };

    function recompute() {
      if (state.type === 'candles') { state.data = state.candles; }
      else { state.data = state.candles.map(c => c.c); }
    }

    function inferDecimals(cs) {
      const first = cs[0];
      const s = String(first && first.o != null ? first.o : first);
      return s.indexOf('.') >= 0 ? Math.min(4, s.split('.')[1].length || 0) : 2;
    }

    size();
    attach();
    if (typeof ResizeObserver !== 'undefined') {
      const ro = new ResizeObserver(() => { size(); chartApi.draw(); });
      ro.observe(wrapEl);
      chartApi._resizeObs = ro;
    }
    return chartApi;
  }

  const NS = { createChart };

  if (typeof module !== 'undefined' && module.exports) module.exports = NS;
  else root.TV = Object.assign(root.TV || {}, { chart: NS });
})(typeof window !== 'undefined' ? window : globalThis);
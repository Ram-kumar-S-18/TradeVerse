/* TradeVerse — deterministic sample market data.
   Seeded PRNG → reproducible, labelled SIMULATED candle series.
   Every candle satisfies: high >= max(open,close), low <= min(open,close), high >= low. */
(function (root) {
  'use strict';

  /* mulberry32 — small seeded PRNG. Deterministic across platforms. */
  function mulberry32(seed) {
    let a = seed >>> 0;
    return function () {
      a |= 0; a = (a + 0x6D2B79F5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function hashCode(str) {
    let h = 0;
    for (let i = 0; i < str.length; i++) { h = ((h << 5) - h + str.charCodeAt(i)) | 0; }
    return h >>> 0;
  }

  const INSTRUMENTS = [
    { symbol: 'BTC',  name: 'Bitcoin (sample)',       base: 41200,  dec: 1, spreadBase: 0.00015, vol: 0.0016 },
    { symbol: 'ETH',  name: 'Ethereum (sample)',      base: 2240,   dec: 2, spreadBase: 0.00020, vol: 0.0019 },
    { symbol: 'EUR',  name: 'EUR/USD (sample)',       base: 1.0850, dec: 4, spreadBase: 0.00007, vol: 0.0004 },
    { symbol: 'SPX',  name: 'S&P 500 index (sample)', base: 4870,   dec: 2, spreadBase: 0.00005, vol: 0.0008 },
    { symbol: 'GOLD', name: 'Gold (sample)',          base: 2050,   dec: 2, spreadBase: 0.00010, vol: 0.0011 },
    { symbol: 'TECH', name: 'Tech Index (sample)',    base: 318,    dec: 2, spreadBase: 0.00018, vol: 0.0014 }
  ];

  const TIMEFRAMES = [
    { key: '1m',  label: '1m',  minutes: 1 },
    { key: '5m',  label: '5m',  minutes: 5 },
    { key: '15m', label: '15m', minutes: 15 },
    { key: '1H',  label: '1H',  minutes: 60 },
    { key: '4H',  label: '4H',  minutes: 240 },
    { key: '1D',  label: '1D',  minutes: 1440 }
  ];

  const MINUTES = { '1m': 1, '5m': 5, '15m': 15, '1H': 60, '3H': 180, '4H': 240, '1D': 1440 };

  function instrument(symbol) {
    return INSTRUMENTS.find(i => i.symbol === symbol) || INSTRUMENTS[0];
  }

  const ROUND = (v, d) => { const m = Math.pow(10, d); return Math.round(v * m) / m; };

  /* trend: 'up' | 'down' | 'range' | 'volatile'.
     minutes = number of candles; stepMs = spacing between candle opens (default 1 minute). */
  function makeCandles({ symbol, minutes, seed, trend, t0, stepMs }) {
    const ins = instrument(symbol);
    const dec = ins.dec;
    const base = ins.base;
    const rnd = mulberry32(hashCode(symbol + ':' + (seed || 2026)) ^ (minutes * 7919));
    let close = base;
    const volMap = { up: ins.vol, down: ins.vol, range: ins.vol * 0.7, volatile: ins.vol * 1.9 };
    const vol = volMap[trend] != null ? volMap[trend] : ins.vol;
    /* Drift is a fixed fraction of the instrument's volatility so an uptrend
       looks like a trend on every symbol (not flat on the volatile ones and
       near-vertical on the calm ones), and still shows higher highs/lows. */
    const driftFrac = { up: 0.6, down: -0.6, range: 0.03, volatile: 0.05 }[trend];
    const drift = (driftFrac != null ? driftFrac : 0.15) * ins.vol;
    const startTs = t0 || 1720000000000;
    const step = stepMs > 0 ? stepMs : 60000;
    const out = [];
    for (let m = 0; m < minutes; m++) {
      const open = close;
      const shock = (rnd() - 0.5) * 2;
      const move = close * (drift + shock * vol);
      const wickUp = (0.15 + rnd() * 0.5) * Math.abs(move || close * vol * 0.3);
      const wickDn = (0.15 + rnd() * 0.5) * Math.abs(move || close * vol * 0.3);
      const c = ROUND(open + move, dec);
      const h = ROUND(Math.max(open, c) + wickUp * 0.6 + close * 0.00002 * rnd(), dec);
      const l = ROUND(Math.min(open, c) - wickDn * 0.6 - close * 0.00002 * rnd(), dec);
      let candle = {
        t: startTs + m * step,
        o: ROUND(open, dec),
        h,
        l,
        c,
        v: Math.round(40 + rnd() * 180)
      };
      if (candle.h < Math.max(candle.o, candle.c)) candle.h = Math.max(candle.o, candle.c);
      if (candle.l > Math.min(candle.o, candle.c)) candle.l = Math.min(candle.o, candle.c);
      if (candle.h < candle.l) candle.h = candle.l;
      out.push(candle);
      close = c;
    }
    return out;
  }

  /* Resample 1m candles into larger timeframes by fixed buckets. */
  function resample(candles, minutes) {
    if (!minutes || minutes <= 1) return candles;
    const out = [];
    for (let i = 0; i < candles.length; i += minutes) {
      const chunk = candles.slice(i, i + minutes);
      if (!chunk.length) break;
      const o = chunk[0].o;
      const last = chunk[chunk.length - 1];
      const c = last.c;
      let h = -Infinity, l = Infinity, v = 0;
      for (const cd of chunk) { h = Math.max(h, cd.h); l = Math.min(l, cd.l); v += cd.v; }
      const dec = 4;
      out.push({ t: chunk[0].t, o, h, l, c, v, minute: last.t });
    }
    return out;
  }

  /* Validate OHLC invariants. Returns violations list. */
  function validateCandles(candles) {
    const violations = [];
    for (let i = 0; i < candles.length; i++) {
      const cd = candles[i];
      if (!(cd.h >= cd.o)) violations.push({ i, code: 'HIGH_GTE_OPEN', msg: 'high < open' });
      if (!(cd.h >= cd.c)) violations.push({ i, code: 'HIGH_GTE_CLOSE', msg: 'high < close' });
      if (!(cd.l <= cd.o)) violations.push({ i, code: 'LOW_LTE_OPEN', msg: 'low > open' });
      if (!(cd.l <= cd.c)) violations.push({ i, code: 'LOW_LTE_CLOSE', msg: 'low > close' });
      if (!(cd.h >= cd.l)) violations.push({ i, code: 'HIGH_GTE_LOW', msg: 'high < low' });
      if (!Number.isFinite(cd.o) || !Number.isFinite(cd.h) || !Number.isFinite(cd.l) || !Number.isFinite(cd.c)) {
        violations.push({ i, code: 'NON_FINITE', msg: 'non-finite value' });
      }
    }
    return { valid: violations.length === 0, violations, count: candles.length };
  }

  /* Convenience: full series for one symbol/timeframe. Generated directly at
     the timeframe step with a bounded candle count so long timeframes do not
     compound the trend into an unrealistic curve. */
  function seriesFor({ symbol, timeframe, seed, trend, t0 }) {
    const tf = (typeof timeframe === 'string' ? MINUTES[timeframe] : undefined) || 5;
    const count = Math.max(80, Math.round(480 / tf));
    return makeCandles({ symbol, minutes: count, seed, trend, t0, stepMs: tf * 60000 });
  }

  /* Generate candles directly at a timeframe (no resampling). Used by the live
     trading arena so a series of N candles exists at any chosen timeframe. */
  function seriesDirect({ symbol, timeframe, seed, trend, t0, count }) {
    const tf = (typeof timeframe === 'string' ? MINUTES[timeframe] : undefined) || 1;
    const n = Math.max(2, count || 240);
    return makeCandles({ symbol, minutes: n, seed, trend, t0, stepMs: tf * 60000 });
  }

  /* Current price from last candle + tiny deterministic tick offset. */
  function lastPrice(candles, opts) {
    const last = candles[candles.length - 1];
    if (!last) return 0;
    const dec = (opts && opts.symbol ? instrument(opts.symbol).dec : 4) || 4;
    const t = (opts && opts.tick) || 0;
    const jitter = Math.sin(last.t + t) * 0.00015;
    return ROUND(last.c * (1 + jitter * 0.3), dec);
  }

  const NS = { mulberry32, hashCode, INSTRUMENTS, TIMEFRAMES, MINUTES, makeCandles, resample, validateCandles, seriesFor, seriesDirect, instrument, lastPrice };

  if (typeof module !== 'undefined' && module.exports) module.exports = NS;
  else root.TV = Object.assign(root.TV || {}, { market: NS });
})(typeof window !== 'undefined' ? window : globalThis);
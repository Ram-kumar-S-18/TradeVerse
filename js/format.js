/* TradeVerse — formatting helpers (pure, testable). */
(function (root) {
  'use strict';

  function round(n, places) {
    const p = Math.pow(10, places);
    return Math.round((n + Number.EPSILON) * p) / p;
  }

  /* 1234.5 -> "1,234.50" */
  function money(n, decimals) {
    const d = decimals === undefined ? 2 : decimals;
    return (isFinite(n) ? Number(n).toLocaleString('en-US', {
      minimumFractionDigits: d, maximumFractionDigits: d
    }) : '—');
  }

  function usd(n, decimals) {
    if (!isFinite(n)) return '—';
    return '$' + money(n, decimals);
  }

  /* Signed money: +$12.00 / -$3.50 */
  function signedUsd(n, decimals) {
    if (!isFinite(n)) return '—';
    const s = n < 0 ? '-' : '+';
    return s + usd(Math.abs(n), decimals);
  }

  /* Price with sensible decimals (>=1 -> 2, <1 -> up to 4) */
  function price(n) {
    if (!isFinite(n)) return '—';
    const d = Math.abs(n) >= 1 ? 2 : 4;
    return money(n, d);
  }

  /* Quantity: 2 -> "2", 2.5 -> "2.5" */
  function qty(n) {
    if (!isFinite(n)) return '—';
    return String(round(n, 6));
  }

  function signedQty(n) {
    if (!isFinite(n)) return '—';
    return (n < 0 ? '-' : '+') + qty(Math.abs(n));
  }

  /* Percent: 0.123 -> "12.3%", signed option */
  function pct(n, decimals, signed) {
    if (!isFinite(n)) return '—';
    const d = decimals === undefined ? 1 : decimals;
    const v = money(n * 100, d);
    return (signed && n > 0 ? '+' : '') + v + '%';
  }

  /* mm:ss from seconds */
  function mmss(sec) {
    sec = Math.max(0, Math.round(sec));
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return m + ':' + String(s).padStart(2, '0');
  }

  /* Spread value given bid/ask */
  function spread(bid, ask) {
    return ask - bid;
  }

  function spreadPct(bid, ask) {
    if (bid <= 0) return 0;
    return (ask - bid) / bid;
  }

  const NS = { round, money, usd, signedUsd, price, qty, signedQty, pct, mmss, spread, spreadPct };

  if (typeof module !== 'undefined' && module.exports) module.exports = NS;
  else root.TV = Object.assign(root.TV || {}, { format: NS });
})(typeof window !== 'undefined' ? window : globalThis);
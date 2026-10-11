/* TradeVerse — small DOM + safety helpers. Scripts + tests. */
(function (root) {
  'use strict';

  function el(tag, attrs, children) {
    const node = document.createElement(tag);
    if (attrs) {
      for (const key of Object.keys(attrs)) {
        const val = attrs[key];
        if (key === 'class') node.className = val;
        else if (key === 'html') node.innerHTML = val;
        else if (key === 'text') node.textContent = val;
        else if (key === 'dataset') Object.assign(node.dataset, val);
        else if (key.startsWith('on') && typeof val === 'function') node.addEventListener(key.slice(2), val);
        else if (val === true) node.setAttribute(key, '');
        else if (val !== false && val != null) node.setAttribute(key, val);
      }
    }
    if (children != null) {
      const list = Array.isArray(children) ? children : [children];
      for (const c of list) {
        if (c == null || c === false) continue;
        node.appendChild(typeof c === 'string' ? document.createTextNode(c) : c);
      }
    }
    return node;
  }

  /* Escapes a string for safe insertion as HTML. Prevents XSS. */
  function escapeHtml(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  function escapeAttr(s) {
    return escapeHtml(s).replace(/`/g, '&#96;');
  }

  /* Throw on anything that is not a finite number within a sane range. */
  function guardFinite(v, name, { min, max, integer } = {}) {
    const n = typeof v === 'string' ? Number(v) : v;
    if (!Number.isFinite(n)) throw new TypeError(name + ' must be a finite number');
    if (min != null && n < min) throw new RangeError(name + ' below minimum ' + min);
    if (max != null && n > max) throw new RangeError(name + ' above maximum ' + max);
    if (integer && !Number.isInteger(n)) throw new TypeError(name + ' must be an integer');
    return n;
  }

  function debounce(fn, ms) {
    let t;
    return function () {
      clearTimeout(t);
      const args = arguments;
      const ctx = this;
      t = setTimeout(() => fn.apply(ctx, args), ms);
    };
  }

  function clamp(n, lo, hi) { return Math.min(hi, Math.max(lo, n)); }

  const NS = { el, escapeHtml, escapeAttr, guardFinite, debounce, clamp };

  if (typeof module !== 'undefined' && module.exports) module.exports = NS;
  else root.TV = Object.assign(root.TV || {}, { dom: NS });
})(typeof window !== 'undefined' ? window : globalThis);
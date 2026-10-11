/* TradeVerse — minimal hash router (no dependencies). */
(function (root) {
  'use strict';

  /* Parse location.hash into segments. '#/lesson/x' -> ['lesson','x'] */
  function parse() {
    const raw = (location.hash || '#/').replace(/^#/, '');
    const parts = raw.split('/').filter(Boolean);
    return { parts, raw, name: parts[0] || 'home' };
  }

  /* Define a route. keys are the dynamic param names, in order.
     sub is an optional literal second segment (e.g. 'quiz' in #/event/quiz). */
  function route(name, view, keys, sub) {
    keys = keys || [];
    return { name, view, keys, sub: sub || null, parts: keys.length + 1 + (sub ? 1 : 0) };
  }

  /* Resolve the current hash against a list of routes.
     Returns { view, params } — falls back to view 'notFound'. */
  function resolve(routes) {
    const { parts, raw } = parse();
    const n = parts.length;

    /* No hash, or an in-page anchor that is not a route (e.g. '#main'): home. */
    if (n === 0 || raw.charAt(0) !== '/') {
      const home = routes.find(r => r.view === 'home' || r.name === 'home');
      return { view: home ? home.view : 'home', params: {} };
    }

    const name = parts[0];
    const cand = routes.find(r =>
      r.name === name && r.parts === n && (!r.sub || r.sub === parts[1])
    );
    if (!cand) return { view: 'notFound', params: {} };

    const params = {};
    cand.keys.forEach((key, i) => {
      const seg = parts[i + 1];
      params[key] = decodeURIComponent(seg == null ? '' : seg);
    });
    return { view: cand.view, params };
  }

  function go(hash) { location.hash = hash; }

  const NS = { parse, resolve, route, go };

  if (typeof module !== 'undefined' && module.exports) module.exports = NS;
  else root.TV = Object.assign(root.TV || {}, { router: NS });
})(typeof window !== 'undefined' ? window : globalThis);
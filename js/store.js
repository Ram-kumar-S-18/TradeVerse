/* TradeVerse — tiny in-memory session store.
   Deliberately NO localStorage / sessionStorage / IndexedDB / cookies.
   All state expires when the tab closes. Nothing user-specific persists. */
(function (root) {
  'use strict';

  const state = Object.create(null);
  const subs = Object.create(null);

  function get(key) { return state[key]; }

  function set(key, data) {
    state[key] = data;
    (subs[key] || []).forEach(fn => { try { fn(data); } catch (e) {} });
    return data;
  }

  function subscribe(key, fn) {
    (subs[key] = subs[key] || []).push(fn);
    return () => {
      const list = subs[key] || [];
      const idx = list.indexOf(fn);
      if (idx >= 0) list.splice(idx, 1);
    };
  }

  function reset(key) {
    delete state[key];
  }

  /* Session-only lesson progress. Lives in memory; gone on reload. */
  const learned = new Set();
  const learnState = {
    list() { return Array.from(learned); },
    has: id => learned.has(id),
    add: id => learned.add(id),
    remove: id => learned.delete(id),
    count: () => learned.size,
    clear: () => learned.clear()
  };

  const NS = { get, set, subscribe, reset, learnState };

  if (typeof module !== 'undefined' && module.exports) module.exports = NS;
  else root.TV = Object.assign(root.TV || {}, { store: NS });
})(typeof window !== 'undefined' ? window : globalThis);
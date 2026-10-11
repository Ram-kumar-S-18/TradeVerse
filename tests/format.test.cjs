'use strict';
const { test } = require('node:test');
const assert = require('node:assert');
const fmt = require('../../TradeVerse/js/format.js');

test('usd groups thousands and two decimals', () => {
  assert.strictEqual(fmt.usd(1234.5), '$1,234.50');
  assert.strictEqual(fmt.usd(0), '$0.00');
});

test('signedUsd prefixes + and -', () => {
  assert.strictEqual(fmt.signedUsd(12), '+$12.00');
  assert.strictEqual(fmt.signedUsd(-3.5), '-$3.50');
  assert.strictEqual(fmt.signedUsd(0), '+$0.00');
});

test('pct scales and signs on request', () => {
  assert.strictEqual(fmt.pct(0.123, 1, false), '12.3%');
  assert.strictEqual(fmt.pct(0.05, 2, true), '+5.00%');
  assert.strictEqual(fmt.pct(-0.5, 0), '-50%');
});

test('mmss formats minute:second', () => {
  assert.strictEqual(fmt.mmss(0), '0:00');
  assert.strictEqual(fmt.mmss(65), '1:05');
  assert.strictEqual(fmt.mmss(599), '9:59');
  assert.strictEqual(fmt.mmss(-5), '0:00');
});

test('spread helpers', () => {
  assert.strictEqual(fmt.spread(1, 2), 1);
  assert.ok(Math.abs(fmt.spreadPct(100, 101) - 0.01) < 1e-9);
});

test('non-finite money renders a dash', () => {
  assert.strictEqual(fmt.usd(Infinity), '—');
  assert.strictEqual(fmt.money(NaN), '—');
});
'use strict';
const { test } = require('node:test');
const assert = require('node:assert');
const sim = require('../../TradeVerse/js/engine/simulation.js');

function fresh() { return sim.createSession({ symbol: 'BTC', cash: 100000, price: 40000, feeRate: 0.001, slippageRate: 0.0005 }); }

test('session starts with the configured capital and no positions', () => {
  const s = fresh();
  assert.strictEqual(s.cash, 100000);
  assert.strictEqual(s.initialCash, 100000);
  assert.deepStrictEqual(s.positions, {});
  assert.strictEqual(s.equity, 100000);
});

test('market buy fills immediately and reduces cash by gross plus fee', () => {
  const s = fresh();
  const r = sim.placeOrder(s, { side: 'buy', type: 'market', qty: 2, symbol: 'BTC' });
  assert.strictEqual(r.ok, true);
  assert.strictEqual(s.positions.BTC.qty, 2);
  const gross = sim.shadePrice(s, 'buy') * 2;
  assert.ok(s.cash < 100000 - gross + 1, 'cash reduced by at least the gross cost');
});

test('buying more than cash allows is rejected and no state changes', () => {
  const s = fresh();
  const r = sim.placeOrder(s, { side: 'buy', type: 'market', qty: 1000000, symbol: 'BTC' });
  assert.strictEqual(r.ok, false);
  assert.ok(/Not enough cash/.test(r.error));
  assert.deepStrictEqual(s.positions, {});
});

test('quantity guards: zero, negative, fractional, oversized', () => {
  assert.throws(() => sim.validateQty(0), /greater than 0/);
  assert.throws(() => sim.validateQty(-3), /greater than 0/);
  assert.throws(() => sim.validateQty(2.5), /whole number/);
  assert.throws(() => sim.validateQty(sim.MAX_QTY + 1), /maximum/);
  assert.strictEqual(sim.validateQty(5), 5);
});

test('short selling is disabled', () => {
  const s = fresh();
  const r = sim.placeOrder(s, { side: 'sell', type: 'market', qty: 1, symbol: 'BTC' });
  assert.strictEqual(r.ok, false);
  assert.ok(/Short selling is disabled/.test(r.error));
});

test('limit buy stays pending until price ticks down through it', () => {
  const s = fresh();
  const r = sim.placeOrder(s, { side: 'buy', type: 'limit', qty: 2, price: 39000, symbol: 'BTC' });
  assert.strictEqual(r.ok, true);
  assert.strictEqual(s.orders.length, 1);
  assert.strictEqual(s.positions.BTC, undefined);
  sim.tick(s, 40050);
  assert.strictEqual(s.positions.BTC, undefined, 'must not fill above the limit');
  sim.tick(s, 38900);
  assert.strictEqual(s.positions.BTC.qty, 2, 'fills once price is at or below the limit');
});

test('a limit buy that would exceed cash is rejected at fill time', () => {
  const s = fresh();
  const r = sim.placeOrder(s, { side: 'buy', type: 'limit', qty: 5, price: 39000, symbol: 'BTC' });
  sim.tick(s, 38900);
  assert.strictEqual(s.positions.BTC, undefined);
  assert.strictEqual(s.cash, 100000, 'cash never goes negative');
  assert.strictEqual(s.closedOrders.length, 1);
  assert.strictEqual(s.closedOrders[0].status, 'rejected');
});

test('sell for more than held is rejected', () => {
  const s = fresh();
  sim.placeOrder(s, { side: 'buy', type: 'market', qty: 5, symbol: 'BTC' });
  const r = sim.placeOrder(s, { side: 'sell', type: 'market', qty: 9, symbol: 'BTC' });
  assert.strictEqual(r.ok, false);
  assert.ok(/Not enough BTC/.test(r.error));
});

test('cancel removes a pending order and archives it', () => {
  const s = fresh();
  const r = sim.placeOrder(s, { side: 'buy', type: 'limit', qty: 5, price: 39000, symbol: 'BTC' });
  const c = sim.cancelOrder(s, r.order.id);
  assert.strictEqual(c.ok, true);
  assert.strictEqual(s.orders.length, 0);
  assert.strictEqual(s.closedOrders.length, 1);
  assert.strictEqual(s.closedOrders[0].status, 'cancelled');
});

test('evaluateSession returns sane bounded metrics', () => {
  const s = fresh();
  sim.placeOrder(s, { side: 'buy', type: 'market', qty: 2, symbol: 'BTC' });
  sim.tick(s, 40100);
  sim.placeOrder(s, { side: 'sell', type: 'market', qty: 2, symbol: 'BTC' });
  const r = sim.evaluateSession(s);
  assert.strictEqual(r.trades, 2);
  assert.ok(Number.isFinite(r.net));
  assert.ok(r.riskScore >= 0 && r.riskScore <= 100);
  assert.ok(r.disciplineScore >= 0 && r.disciplineScore <= 100);
  assert.ok(r.winRate >= 0 && r.winRate <= 1);
});

test('realized P&L accounts for the fee on the sell', () => {
  const s = sim.createSession({ symbol: 'SPX', cash: 100000, price: 4870, feeRate: 0, slippageRate: 0 });
  sim.placeOrder(s, { side: 'buy', type: 'market', qty: 20, symbol: 'SPX' });
  sim.tick(s, 5000);
  sim.placeOrder(s, { side: 'sell', type: 'market', qty: 20, symbol: 'SPX' });
  const expected = (5000 - 4870) * 20;
  assert.strictEqual(Math.abs(s.realizedPnl - expected) < 0.01, true, 'got ' + s.realizedPnl);
});
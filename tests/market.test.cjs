'use strict';
const { test } = require('node:test');
const assert = require('node:assert');
const market = require('../../TradeVerse/js/data/market.js');

test('every instrument/timeframe/trend series passes OHLC invariants', () => {
  for (const ins of market.INSTRUMENTS) {
    for (const tf of market.TIMEFRAMES) {
      for (const trend of ['up', 'down', 'range', 'volatile']) {
        const candles = market.seriesFor({ symbol: ins.symbol, timeframe: tf.key, seed: 1, trend });
        assert.ok(candles.length >= 60, ins.symbol + '/' + tf.key + ' has candles');
        const res = market.validateCandles(candles);
        assert.strictEqual(res.valid, true, JSON.stringify(res.violations.slice(0, 2)) + ' for ' + ins.symbol + '/' + tf.key + '/' + trend);
      }
    }
  }
});

test('candle timestamps are strictly increasing by the timeframe', () => {
  const candles = market.seriesFor({ symbol: 'ETH', timeframe: '1H', seed: 3 });
  const step = market.MINUTES['1H'] * 60000;
  for (let i = 1; i < candles.length; i++) {
    assert.strictEqual(candles[i].t - candles[i - 1].t, step);
  }
});

test('resample preserves the first open and last close of each bucket', () => {
  const base = market.makeCandles({ symbol: 'BTC', minutes: 60, seed: 7 });
  const tf = market.resample(base, 5);
  assert.strictEqual(tf[0].o, base[0].o);
  assert.strictEqual(tf[0].c, base[4].c);
});

test('1m seeds are deterministic across calls', () => {
  const a = market.makeCandles({ symbol: 'GOLD', minutes: 10, seed: 42 });
  const b = market.makeCandles({ symbol: 'GOLD', minutes: 10, seed: 42 });
  assert.deepStrictEqual(a, b);
});

test('find the broken-candle validator catches bad data', () => {
  const bad = [
    { t: 0, o: 5, h: 4, l: 3, c: 5 },   // high < open
    { t: 1, o: 5, h: 6, l: 7, c: 5 },   // low > close
    { t: 2, o: NaN, h: 6, l: 5, c: 5 }
  ];
  const res = market.validateCandles(bad);
  assert.strictEqual(res.valid, false);
  assert.ok(res.violations.length >= 4);
});

test('seriesDirect generates the requested count at the timeframe step', () => {
  for (const tf of market.TIMEFRAMES) {
    const candles = market.seriesDirect({ symbol: 'BTC', timeframe: tf.key, seed: 11, trend: 'range', count: 120 });
    assert.strictEqual(candles.length, 120, tf.key + ' count');
    const step = market.MINUTES[tf.key] * 60000;
    for (let i = 1; i < candles.length; i++) {
      assert.strictEqual(candles[i].t - candles[i - 1].t, step, tf.key + ' timestamp step at ' + i);
    }
    assert.strictEqual(market.validateCandles(candles).valid, true, tf.key + ' OHLC invariants');
  }
});

test('seriesDirect is deterministic and steady across timeframes (display-only switch)', () => {
  const a = market.seriesDirect({ symbol: 'ETH', timeframe: '5m', seed: 900, trend: 'range', count: 200 });
  const b = market.seriesDirect({ symbol: 'ETH', timeframe: '5m', seed: 900, trend: 'range', count: 200 });
  assert.deepStrictEqual(a, b, 'same inputs give the same series');
  const hourly = market.seriesDirect({ symbol: 'ETH', timeframe: '1H', seed: 900, trend: 'range', count: 200 });
  assert.strictEqual(a[10].c, hourly[10].c, 'price path is identical across timeframes');
  assert.notStrictEqual(a[10].t, hourly[10].t, 'timestamps differ across timeframes');
});
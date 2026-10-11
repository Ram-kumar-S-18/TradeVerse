/* TradeVerse — simulated trading engine (pure, deterministic, no DOM).
   Educational simulator: never implies real money or real execution. */
(function (root) {
  'use strict';

  const MAX_QTY = 1000000;
  const MAX_PRICE = 100000000;
  const DEF_CASH = 100000;

  const R2 = (n) => Math.round((n + Number.EPSILON) * 100) / 100;

  function validNumber(n, name) {
    if (typeof n === 'string') n = Number(n);
    if (!Number.isFinite(n)) throw new TypeError(name + ' must be a finite number.');
    return n;
  }

  function validateQty(qty) {
    qty = validNumber(qty, 'quantity');
    if (qty <= 0) throw new RangeError('Quantity must be greater than 0.');
    if (!Number.isInteger(qty)) throw new TypeError('Quantity must be a whole number of units.');
    if (qty > MAX_QTY) throw new RangeError('Quantity exceeds the allowed maximum of ' + MAX_QTY + '.');
    return qty;
  }

  function validatePrice(price) {
    price = validNumber(price, 'price');
    if (price <= 0) throw new RangeError('Price must be greater than 0.');
    if (price > MAX_PRICE) throw new RangeError('Price exceeds the allowed maximum.');
    return price;
  }

  function uid() { return 'ord-' + Math.random().toString(36).slice(2, 9) + Date.now().toString(36).slice(-4); }

  /* Create a fresh session with deterministic initial state. */
  function createSession(opts) {
    opts = opts || {};
    const feeRate = validNumber(opts.feeRate || 0, 'feeRate');
    const slippageRate = validNumber(opts.slippageRate || 0, 'slippageRate');
    if (feeRate < 0 || feeRate > 0.1) throw new RangeError('feeRate must be between 0 and 0.1 (0–10%).');
    if (slippageRate < 0 || slippageRate > 0.1) throw new RangeError('slippageRate must be between 0 and 0.1.');
    return {
      symbol: opts.symbol || 'BTC',
      cash: R2(validNumber(opts.cash || DEF_CASH, 'cash')),
      initialCash: R2(validNumber(opts.cash || DEF_CASH, 'cash')),
      price: validNumber(opts.price || 0, 'price') || 0,
      feeRate,
      slippageRate,
      positions: {},           // { SYM: { qty, avgPrice } }
      orders: [],              // pending/recent orders
      closedOrders: [],        // history of cancelled/rejected orders
      trades: [],              // realized fills
      realizedPnl: 0,
      unrealizedPnl: 0,
      equity: R2(validNumber(opts.cash || DEF_CASH, 'cash')),
      peakEquity: R2(validNumber(opts.cash || DEF_CASH, 'cash')),
      maxDrawdown: 0,
      startedAt: Date.now(),
      tick: 0,
      paused: true
    };
  }

  function positionOf(s, symbol) { return s.positions[symbol] || { qty: 0, avgPrice: 0 }; }

  /* Mark price (buy at ask incl. slippage, sell at bid). */
  function shadePrice(s, side) {
    if (!s.price) return 0;
    const slip = s.slippageRate * (side === 'buy' ? 1 : -1);
    return R2(s.price * (1 + slip));
  }

  function feeFor(s, amount) { return R2(amount * s.feeRate); }

  function mark(s, price) {
    let unreal = 0;
    for (const sym of Object.keys(s.positions)) {
      const p = s.positions[sym];
      unreal += (price - p.avgPrice) * p.qty;
    }
    s.unrealizedPnl = R2(unreal);
    const posValue = positionMarketValue(s, price);
    s.equity = R2(s.cash + posValue);
    if (s.equity > s.peakEquity) s.peakEquity = R2(s.equity);
    const dd = s.peakEquity > 0 ? (s.peakEquity - s.equity) / s.peakEquity : 0;
    s.maxDrawdown = Math.max(s.maxDrawdown, R2(dd));
    return s;
  }

  function positionMarketValue(s, price) {
    return R2((s.positions[s.symbol] || { qty: 0 }).qty * price);
  }

  /* Execute a buy at the given fill price. Mutates session. */
  function fillBuy(s, symbol, qty, fillPrice) {
    const gross = fillPrice * qty;
    const fee = feeFor(s, gross);
    s.cash = R2(s.cash - gross - fee);
    const pos = s.positions[symbol] || { qty: 0, avgPrice: 0 };
    const newQty = pos.qty + qty;
    pos.avgPrice = R2(((pos.avgPrice * pos.qty) + (fillPrice * qty)) / newQty);
    pos.qty = newQty;
    s.positions[symbol] = pos;
    s.trades.push({ id: uid(), side: 'buy', symbol, qty, price: R2(fillPrice), fee, ts: Date.now() });
    return { qty, price: R2(fillPrice), fee };
  }

  /* Execute a sell at the given fill price. */
  function fillSell(s, symbol, qty, fillPrice) {
    const pos = s.positions[symbol] || { qty: 0, avgPrice: 0 };
    const gross = fillPrice * qty;
    const fee = feeFor(s, gross);
    const pnl = R2((fillPrice - pos.avgPrice) * qty - fee);
    s.cash = R2(s.cash + gross - fee);
    s.realizedPnl = R2(s.realizedPnl + pnl);
    pos.qty = pos.qty - qty;
    if (pos.qty < 1e-9) delete s.positions[symbol];
    else { pos.avgPrice = R2(pos.avgPrice); s.positions[symbol] = pos; }
    s.trades.push({ id: uid(), side: 'sell', symbol, qty, price: R2(fillPrice), fee, pnl, ts: Date.now() });
    return { qty, price: R2(fillPrice), fee, pnl };
  }

  function recordClosed(s, order, status, note) {
    order.status = status;
    order.note = note || '';
    s.closedOrders.push(order);
  }

  /* Place an order. Returns { ok, error?, order?, message? } — never throws for user errors. */
  function placeOrder(s, input) {
    if (!s) return { ok: false, error: 'No active session. Reset the simulator to begin.' };
    let qty, price = 0;
    try {
      qty = validateQty(input.qty);
      if (input.type === 'limit') price = validatePrice(input.price);
    } catch (e) {
      return { ok: false, error: e.message };
    }
    if (price === 0 && input.type === 'market') price = R2(shadePrice(s, input.side));

    const symbol = input.symbol || s.symbol;
    const type = input.type === 'limit' ? 'limit' : 'market';
    const side = input.side === 'sell' ? 'sell' : 'buy';

    if (input.type === 'limit') {
      if (!(price > 0)) return { ok: false, error: 'Please enter a valid limit price.' };
      const order = { id: uid(), side, type, symbol, qty, price, status: 'pending', createdAt: Date.now(), note: '' };
      s.orders.push(order);
      return { ok: true, order, message: 'Limit ' + side + ' order placed and waiting.' };
    }

    // Market order — executed immediately at current (shaded) price.
    if (side === 'buy') {
      const gross = price * qty;
      const fee = feeFor(s, gross);
      if (gross + fee > s.cash + 1e-9) {
        const maxQty = Math.floor(s.cash / (price * (1 + s.feeRate)));
        return { ok: false, error: 'Not enough cash. You can buy up to ' + maxQty + ' ' + symbol + ' at this price.', maxQty };
      }
      try {
        const fill = fillBuy(s, symbol, qty, price);
        mark(s, s.price);
        return { ok: true, order: { id: uid(), side, type, symbol, qty, price: fill.price, fee: fill.fee, status: 'filled', createdAt: Date.now() }, message: 'Bought ' + qty + ' ' + symbol + ' at ' + fill.price + '.' };
      } catch (e) { return { ok: false, error: e.message }; }
    }

    // sell
    const pos = s.positions[symbol] || { qty: 0 };
    if (pos.qty < qty) return { ok: false, error: 'Not enough ' + symbol + ' to sell. You hold ' + pos.qty + '. Short selling is disabled in this simulator.' };
    try {
      const fill = fillSell(s, symbol, qty, price);
      mark(s, s.price);
      return { ok: true, order: { id: uid(), side, type, symbol, qty, price: fill.price, fee: fill.fee, pnl: fill.pnl, status: 'filled', createdAt: Date.now() }, message: 'Sold ' + qty + ' ' + symbol + ' at ' + fill.price + '.' };
    } catch (e) { return { ok: false, error: e.message }; }
  }

  /* Advance the market one deterministic tick and try to fill pending orders. */
  function tick(s, price) {
    s.tick++;
    if (price != null && price > 0 && Number.isFinite(price)) s.price = R2(price);
    mark(s, s.price);
    const fills = [];
    const keep = [];
    for (const o of s.orders) {
      if (o.status !== 'pending') continue;
      const crossed = (o.side === 'buy' && s.price <= o.price) || (o.side === 'sell' && s.price >= o.price);
      if (crossed) {
        try {
          const pos = s.positions[o.symbol] || { qty: 0 };
          if (o.side === 'buy') {
            const gross = o.price * o.qty;
            const fee = feeFor(s, gross);
            if (gross + fee > s.cash + 1e-9) { recordClosed(s, o, 'rejected', 'insufficient cash at fill'); continue; }
            fillBuy(s, o.symbol, o.qty, o.price);
          } else {
            if (pos.qty < o.qty) { recordClosed(s, o, 'rejected', 'insufficient position at fill'); continue; }
            fillSell(s, o.symbol, o.qty, o.price);
          }
          fills.push({ ...o, status: 'filled' });
        } catch (e) {
          continue;
        }
      } else {
        keep.push(o);
      }
    }
    s.orders = keep;
    mark(s, s.price);
    return fills;
  }

  /* Cancel a pending order. Returns {ok, error?, order?}. */
  function cancelOrder(s, id) {
    const idx = s.orders.findIndex(o => o.id === id && o.status === 'pending');
    if (idx < 0) return { ok: false, error: 'Order not found or already filled/cancelled.' };
    const [order] = s.orders.splice(idx, 1);
    recordClosed(s, order, 'cancelled', 'cancelled by user');
    return { ok: true, order };
  }

  /* Deterministic next price for an instrument series. */
  function nextPrice(s, candles) {
    const last = candles[candles.length - 1];
    if (!last) return s.price;
    const drift = (s.tick % 7 === 0) ? 0.0006 * Math.sin(s.tick * 0.7) : 0.00015 * Math.sin(s.tick * 1.3);
    return R2(last.c * (1 + drift));
  }

  /* End-of-session evaluation metrics (pure). */
  function evaluateSession(s) {
    const trades = s.trades;
    const wins = trades.filter(t => t.pnl > 0);
    const losses = trades.filter(t => t.pnl <= 0);
    const grossWin = wins.reduce((a, t) => a + t.pnl, 0);
    const grossLoss = losses.reduce((a, t) => a + t.pnl, 0);
    const net = s.realizedPnl + s.unrealizedPnl;
    const winRate = trades.length ? wins.length / trades.length : 0;
    const avgWin = wins.length ? grossWin / wins.length : 0;
    const avgLoss = losses.length ? grossLoss / losses.length : 0;
    const profitFactor = grossLoss !== 0 ? Math.abs(grossWin / grossLoss) : (grossWin > 0 ? Infinity : 0);
    const returnPct = s.initialCash > 0 ? net / s.initialCash : 0;
    const equityCurve = { returnPct, net, maxDrawdown: s.maxDrawdown, winRate, profitFactor };

    // Discipline: avoid overtrading, avoid breaking stops.
    const tradeCount = trades.length;
    let disciplineScore = 100;
    disciplineScore -= Math.min(30, Math.max(0, tradeCount - 15) * 1.5);   // churning
    disciplineScore -= Math.min(25, s.maxDrawdown * 400);                  // drawdown discipline
    if (returnPct < -0.15) disciplineScore -= 20;
    disciplineScore = Math.max(0, Math.round(disciplineScore));

    let riskScore = 100;
    const avgRisk = trades.length ? (trades.reduce((a, t) => a + t.qty * t.price, 0) / trades.length) : 0;
    const avgRiskPct = s.initialCash > 0 ? avgRisk / s.initialCash : 0;
    riskScore -= Math.min(40, Math.max(0, avgRiskPct - 0.05) * 500);
    riskScore -= Math.min(40, s.maxDrawdown * 500);
    riskScore = Math.max(0, Math.round(riskScore));

    return {
      trades: tradeCount,
      net,
      returnPct,
      winRate,
      profitFactor: Number.isFinite(profitFactor) ? profitFactor : 0,
      avgWin: R2(avgWin), avgLoss: R2(avgLoss),
      maxDrawdown: s.maxDrawdown,
      riskScore, disciplineScore,
      note: 'Evaluation is educational and simulated. It measures profitability, drawdown control, win rate and discipline relative to the starting capital.'
    };
  }

  const NS = { MAX_QTY, MAX_PRICE, DEF_CASH, createSession, placeOrder, tick, cancelOrder, mark, evaluateSession, nextPrice, shadePrice, validateQty, validatePrice };

  if (typeof module !== 'undefined' && module.exports) module.exports = NS;
  else root.TV = Object.assign(root.TV || {}, { simulation: NS });
})(typeof window !== 'undefined' ? window : globalThis);
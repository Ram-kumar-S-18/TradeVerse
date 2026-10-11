/* TradeVerse — glossary of plain-language trading terms. */
(function (root) {
  'use strict';

  const TERMS = [
    { term: 'Stock', def: 'A share of ownership in a company. Buying a stock makes you a part-owner of that business (a shareholder).' },
    { term: 'Share', def: 'One unit of ownership in a company. Companies split ownership into shares, each with a price (e.g. one share = $50).' },
    { term: 'Market', def: 'Any place where buyers and sellers meet to exchange goods or financial assets at an agreed price.' },
    { term: 'Exchange', def: 'An organised venue where stocks, currencies or other assets are traded, such as a national stock exchange. Exchanges set trading hours and match buyers with sellers.' },
    { term: 'Index', def: 'A basket of assets used to measure a market or segment, such as a broad market index made up of hundreds of large companies. You cannot buy an index directly — you buy funds that track it.' },
    { term: 'Market order', def: 'An order to buy or sell immediately at the best available current price. Fast to fill, but the exact price is not guaranteed.' },
    { term: 'Limit order', def: 'An order to buy or sell only at a specified price (or better). You control the price but the order may not fill.' },
    { term: 'Stop order', def: 'An order placed at a trigger price; once the market reaches it, the order activates (often becoming a market order). Used to limit losses.' },
    { term: 'Bid', def: 'The highest price a buyer is currently willing to pay. If you sell, you get the bid.' },
    { term: 'Ask', def: 'The lowest price a seller is currently willing to accept. If you buy, you pay the ask.' },
    { term: 'Spread', def: 'The difference between the bid and ask price. A narrower spread usually means a more liquid market.' },
    { term: 'Slippage', def: 'The difference between the price you expected and the price your order actually fills at, often caused by fast-moving markets.' },
    { term: 'Liquidity', def: 'How easily an asset can be bought or sold without moving its price much. Cash is very liquid; a rare collectible is not.' },
    { term: 'Volatility', def: 'How much and how quickly a price moves. High volatility means large swings; low volatility means calm, small moves.' },
    { term: 'Trend', def: 'The general direction a price is moving over time — up (higher highs), down (lower lows), or sideways (ranging).' },
    { term: 'Support', def: 'A price level where buying pressure has repeatedly stopped a price from falling further. Think of it as a floor.' },
    { term: 'Resistance', def: 'A price level where selling pressure has repeatedly stopped a price from rising further. Think of it as a ceiling.' },
    { term: 'Breakout', def: 'When price moves decisively through a support or resistance level, often on increased volume — a sign the level may no longer hold.' },
    { term: 'Candlestick', def: 'A chart bar that shows four prices for a period — open, high, low and close — drawn as a body with wicks. One of the most common ways to read price.' },
    { term: 'OHLC', def: 'Open, High, Low, Close — the four key prices of a trading period. The high is the highest traded price; the low is the lowest.' },
    { term: 'Timeframe', def: 'The duration each chart bar represents — a minute, an hour, a day. Lower timeframes show more detail and more noise.' },
    { term: 'Volume', def: 'The number of shares or contracts traded in a period. High volume confirms that a move is real and supported.' },
    { term: 'Moving average', def: 'The average price over a rolling window of past prices, smoothing noise to reveal a trend. Common windows are 20, 50 and 200 periods.' },
    { term: 'SMA', def: 'Simple Moving Average — equal-weight average of the last N prices.' },
    { term: 'EMA', def: 'Exponential Moving Average — a moving average that weights recent prices more heavily, so it reacts faster.' },
    { term: 'RSI', def: 'Relative Strength Index — a momentum indicator from 0–100. Above 70 often means overbought; below 30 often means oversold. Treat as a hint, not a rule.' },
    { term: 'Momentum', def: 'The rate and strength of a price move. Strong momentum means price is moving fast in one direction.' },
    { term: 'Position', def: 'The amount of an asset you currently own (long) or owe (short) after your trades are added up.' },
    { term: 'Long', def: 'A position that profits when the price rises — you buy first and hope to sell later at a higher price.' },
    { term: 'Short', def: 'A position that profits when the price falls — you borrow and sell first, then buy back later at a lower price. (Disabled in TradeVerse.)' },
    { term: 'Margin', def: 'Borrowed money used to trade larger positions than your cash allows. Increases both profits and losses — risky for beginners.' },
    { term: 'P/E ratio', def: 'Price-to-Earnings — the share price divided by earnings per share. A rough way to compare how expensive companies are. A high P/E can mean expected growth; a low P/E can mean a bargain or a struggling company.' },
    { term: 'Earnings', def: 'A company\u2019s profit after paying all costs and taxes. Reported quarterly; a major driver of stock prices.' },
    { term: 'Revenue', def: 'The total money a company brings in from selling its products or services, before costs are deducted.' },
    { term: 'Dividend', def: 'A part of a company\u2019s profit paid out to shareholders, usually in cash, often quarterly. Not every company pays dividends.' },
    { term: 'Market cap', def: 'Market Capitalisation — share price multiplied by total shares outstanding. A quick measure of a company\u2019s size (large-cap, mid-cap, small-cap).' },
    { term: 'Drawdown', def: 'The drop from a peak in your portfolio value to a later low, expressed as a percentage. Kept small, it protects you from big losses.' },
    { term: 'Stop-loss', def: 'A pre-set price at which you sell to limit a loss, so a bad trade cannot run away from you. Placed below a long entry (or above a short entry).' },
    { term: 'Risk/reward', def: 'How much you might lose (risk) relative to how much you might gain (reward) on a trade. A 1:2 ratio means risking $1 to try to make $2.' },
    { term: 'Position sizing', def: 'Deciding how much of your account to risk on one trade. Even a great idea loses money sometimes — size so a loss does not hurt you.' },
    { term: 'Diversification', def: 'Spreading your money across different assets so one failure does not destroy the whole portfolio.' },
    { term: 'Bull market', def: 'A period when prices broadly rise for a sustained time, often tied to economic optimism.' },
    { term: 'Bear market', def: 'A period when prices broadly fall, often tied to economic pessimism. Usually measured from a drop of at least 20% from a peak.' },
    { term: 'Paper trading', def: 'Practising trades with simulated money. You learn the mechanics without risking real capital — exactly what TradeVerse does.' },
    { term: 'Simulation', def: 'A model that mimics real trading with sample data and virtual cash. Useful for practice; results say nothing about future real performance.' },
    { term: 'Beta', def: 'A measure of how much an asset moves compared to the overall market. A beta near 1 moves with the market; higher beta is more swingy.' },
    { term: 'Portfolio', def: 'All the assets you own, viewed as one collection. Its value = cash + the marked value of your positions.' },
    { term: 'Yield', def: 'The income you get from an investment as a percentage of its price, for example a dividend yield.' },
    { term: 'FOMO', def: 'Fear Of Missing Out — the urge to buy because a price is rising fast. Often leads to buying high. A discipline problem, not a strategy.' },
    { term: 'Revenge trading', def: 'Trading aggressively right after a loss to try to win it back quickly. Usually makes losses worse. A discipline problem.' },
    { term: 'Dollar-cost averaging', def: 'Investing a fixed amount at regular intervals instead of all at once, which smooths out the price you pay over time.' },
    { term: 'Bear flag', def: 'A small pause/consolidation inside a downtrend that often continues downward. Learn pattern basics before trading them.' }
  ].sort((a, b) => a.term.localeCompare(b.term));

  function find(term) {
    return TERMS.find(t => t.term.toLowerCase() === String(term || '').trim().toLowerCase()) || null;
  }

  function search(text) {
    const q = String(text || '').trim().toLowerCase();
    if (!q) return TERMS;
    return TERMS.filter(t => t.term.toLowerCase().includes(q) || t.def.toLowerCase().includes(q));
  }

  const NS = { TERMS, find, search };

  if (typeof module !== 'undefined' && module.exports) module.exports = NS;
  else root.TV = Object.assign(root.TV || {}, { glossary: NS });
})(typeof window !== 'undefined' ? window : globalThis);
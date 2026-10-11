/* TradeVerse — course catalogue, learning path and lesson content.
   All bodies are Markdown; rendered safely (escaped) by js/markdown.js.
   [[Term]] inserts an inline glossary link. Duration/time units are
   estimates for guidance only. Educational content — not financial advice. */
(function (root) {
  'use strict';

  const MODULES = [
    {
      id: 'foundations', num: 1, title: 'Foundations', blurb: 'What a market actually is, what a stock means, and how the simplest trades happen.',
      lessons: [
        {
          id: 'what-is-the-market', num: 1, title: 'What Is the Stock Market?', minutes: 6, level: 'Beginner',
          objective: 'Explain what a stock is, what an exchange does, and why prices move.',
          whyNext: 'Before you can trade you need to know what you are actually buying. This lesson sets the vocabulary — prices, volume, ownership — that every later lesson builds on.',
          body: `A **stock** is a piece of ownership in a company. When a business wants to grow, it can sell some of that ownership to the public. People who buy shares are called **shareholders** — they now own part of the business.

## Company: Owner vs Investor

| Role | What they do | What they get |
| --- | --- | --- |
| Founder | Runs the company day to day | Salary + ownership |
| Shareholder (you) | Supplies capital | A share of profit + ownership rights |

## Where does trading happen?

Similar to a vegetable market with stalls, shares are traded on an **exchange** — a regulated venue that matches buyers and sellers. An **index** bundles many companies into one number so you can judge the whole market at a glance.

:::key
Prices are not "set" by the exchange. They are the meeting point of supply and demand: when more people want to buy than sell, price tends to rise.
:::

## Why do prices move?

Prices move because new information changes how people value a company. A strong quarterly result → more buyers. A scandal → more sellers. [[Volatility]] describes how sharply those swings happen.

:::info
TradeVerse shows **simulated sample prices**. They are made up to help you learn — never assume a real market behaves identically.
:::

Start by learning the difference between a [[Market order]], a [[Limit order]] and a [[Stop order]] in the next lesson.`,
          check: [
            { q: 'When you buy one share of a company, you become:', options: ['The owner of the whole company', 'A shareholder with a small piece of ownership', 'A lender to the exchange', 'A tax collector'], answer: 1, explanation: 'A share is a unit of ownership. You own part of the business, not the whole company.' },
            { q: 'Who decides the price of a stock?', options: ['The exchange by law', 'The government', 'Buyers and sellers, through supply and demand', 'The company CEO alone'], answer: 2, explanation: 'Exchanges match orders; the price is wherever buyers and sellers agree.' },
            { q: 'A broad market index like the S&P 500 helps you:', options: ['Own a single company', 'Measure the performance of a basket of companies at once', 'Avoid all risk', 'Buy stocks after hours'], answer: 1, explanation: 'An index is a bundle of companies used to judge the direction of the market or a segment.' }
          ]
        },
        {
          id: 'how-trading-works', num: 2, title: 'How Trading Works: Orders', minutes: 8, level: 'Beginner',
          objective: 'Distinguish market, limit and stop orders and know when each is useful.',
          whyNext: 'The stock market exchanges "promises to buy or sell" — orders. Knowing the three basic order types makes every simulator trade you place from now on deliberate instead of accidental.',
          body: `You never "call the market" and ask to buy. You submit an **order** — an instruction that says what, how much, and on what terms.

## The three basic orders

A **market order** trades immediately at the best available price. Great when speed matters more than the exact price. A **limit order** only trades at a price you set or better. Slower, but you control the price — it may simply not fill. A **stop order** sleeps until price touches a trigger, then activates (often becoming a market order). Stops are how traders automate exits.

:::key
Same rule, all orders are free to place — the cost shows up in the price you get, not a fee line. In TradeVerse commissions are optional and always shown before you confirm.
:::

## Order lifecycle

1. You submit an order.
2. The exchange matches it against the best opposite order.
3. Your order fills — you now hold (or have sold) the asset.

[[Slippage]] happens when the price at which your order fills is worse than the price you expected — common in fast-moving markets.

## Try it

Head to the [[#/simulator|Simulator]] after this lesson and place your first **paper trade** with virtual money. Nothing here touches real money.

:::warn
Trading is not a game of winning every order. It is a game of managing what can go wrong. That is why [[Risk management|risk management]] gets its own module later.
:::`,
          check: [
            { q: 'Which order fills fastest?', options: ['A market order', 'A limit order far from the current price', 'A stop order below the market', 'A conditional order'], answer: 0, explanation: 'A market order executes immediately at the best available price.' },
            { q: 'The main trade-off with a limit order is:', options: ['Higher fees', 'It may never fill', 'It always trades at a worse price', 'It requires a broker appointment'], answer: 1, explanation: 'A limit order gives price control but no guarantee of execution.' },
            { q: 'A trader wants to automatically sell if price falls to $90. Which order?', options: ['A limit order at $110', 'A stop order at $90', 'A market order now', 'A limit order at $90 to buy'], answer: 1, explanation: 'A stop order sleeps until $90 is touched, then triggers a sell — a classic way to cap a loss.' }
          ]
        },
        {
          id: 'bid-ask-spread', num: 3, title: 'Bid, Ask & the Spread', minutes: 8, level: 'Beginner',
          objective: 'Read a quote box, understand the spread, and see why it is a trading cost.',
          whyNext: 'Every quote you ever see has two prices. If you do not know which one you pay, you will misvalue every trade — and the spread is a real cost on top.',
          body: `Every live price is really two prices.

The **bid** is the best price a buyer will pay for one unit right now. The **ask** is the lowest price a seller will accept right now. If you sell, you receive the **bid**. If you buy, you pay the **ask**. The gap between them is called the [[Spread]] — think of it as the toll between buyers and sellers.

:::key
You buy high and sell low relative to the "middle" price. That gap is why a stock must move enough to cover the spread before a quick round-trip trade breaks even.
:::

## Why is the spread different between markets?

Liquid, heavily traded assets have tight spreads — differences of a few basis points. Thin, rarely traded things have wide spreads. [[Liquidity]] is the fuel that keeps spreads narrow.

Try the interactive demo below: drag the bid and ask and watch the spread change.`,
          widget: 'bidAsk',
          check: [
            { q: 'If the bid is $49.90 and the ask is $50.10, the spread is:', options: ['$0.10', '$0.20', '$50.00', '$100.00'], answer: 1, explanation: 'Spread = ask − bid = 50.10 − 49.90 = 0.20.' },
            { q: 'A buyer placing a market buy order will pay:', options: ['The bid', 'The ask', 'The previous close', 'The average of bid and ask'], answer: 1, explanation: 'You pay the ask when buying and receive the bid when selling.' },
            { q: 'A tight spread usually signals:', options: ['Low liquidity and high risk', 'High liquidity and lower trading cost', 'That prices are rigged', 'That the market is closed'], answer: 1, explanation: 'Frequent trading (high liquidity) keeps best bid and ask close together.' }
          ]
        },
        {
          id: 'investing-vs-trading', num: 4, title: 'Investing vs Trading', minutes: 7, level: 'Beginner',
          objective: 'Separate long-term investing from short-term trading, and understand the discipline each demands.',
          whyNext: 'TradeVerse teaches trading, but every responsible course first draws the line: trading and investing are different games with different timelines, and neither is "better" for everyone.',
          body: `**Investing** usually means buying quality assets and letting time work for many years. **Trading** means actively buying and selling over shorter windows — days, hours or even minutes — trying to profit from price moves.

| | Investing | Trading |
| --- | --- | --- |
| Time horizon | Years | Minutes to days |
| Main driver | Company and economic growth | Price and momentum |
| Activity | Buy and hold | Frequent entries and exits |
| Skill focus | Analysis of value | Reading [[Volatility]] and managing [[Drawdown|drawdowns]] |

:::warn
None of this is financial advice. TradeVerse teaches concepts and lets you practise with fake money — it will never tell you what to do with real money.
:::

## The mindset shift

Investing rewards patience and diversification. Trading rewards **process**: a system, position sizing, and control of emotions like [[FOMO]] and revenge trading. A trader asks "what can I lose?" before asking "what can I win?".

:::info
If you only ever learn one idea today, make it this: education first, simulation second, real money last — and only with money you can afford to lose.
:::`,
          check: [
            { q: 'The biggest difference between investing and trading is:', options: ['The number of shares', 'The time horizon and activity level', 'The currency used', 'The exchange used'], answer: 1, explanation: 'Investing plays out over years; trading is active and short-term.' },
            { q: 'A trader should focus most on:', options: ['Company dividends only', 'Process, position sizing and risk control', 'Memorising ticker symbols', 'Predicting every price'], answer: 1, explanation: 'Trading is a process game; consistent rules beat lucky guesses.' },
            { q: 'Who can guarantee you a profit in markets?', options: ['A famous investor', 'No one — profits are never guaranteed', 'The exchange', 'A paid signal group'], answer: 1, explanation: 'No person or service can guarantee returns. Anyone claiming otherwise is not to be trusted.' }
          ]
        }
      ]
    },
    {
      id: 'mechanics', num: 2, title: 'Market Mechanics', blurb: 'The plumbing behind the screen: order routes, participants, volatility and market data.',
      lessons: [
        {
          id: 'order-journey', num: 5, title: 'How an Order Travels', minutes: 7, level: 'Beginner',
          objective: 'Follow one order from your screen to a fill, and understand the players in between.',
          whyNext: 'Trading feels instant, but knowing what happens in those milliseconds explains why prices slip, why tactics fill or miss, and what market makers actually do.',
          body: `When you click **Buy**, a chain reaction starts:

1. Your app sends the order to a broker.
2. The broker forwards it to the exchange (or a market maker).
3. The order meets the best opposite order in the book.
4. It fills and both sides get a confirmation.

## Who is on the other side?

- **Market makers** constantly quote both a [[Bid|bid]] and [[Ask|ask]] to keep liquidity flowing; they profit from the [[Spread|spread]], not from your losses.
- **Institutional funds** trade in huge size and can move prices.
- **Retail traders** (most people reading this) trade in smaller size.

:::key
You never trade "against the exchange". You trade against another party, usually a market maker, who earns the spread for standing ready to trade with you.
:::

## Why the route matters

More liquidity → smaller [[Slippage|slippage]] and tighter spreads. Less liquidity → wider spreads and worse fills. The route is why the same share can cost slightly different amounts at different moments.`,
          check: [
            { q: 'Who stands ready to quote both buy and sell prices?', options: ['The government', 'Market makers', 'Only retail traders', 'No one'], answer: 1, explanation: 'Market makers provide liquidity by quoting both sides and earn the spread.' },
            { q: 'An order that fills at a worse price than expected suffers:', options: ['A spread tax', 'Slippage', 'A margin call', 'A dividend'], answer: 1, explanation: 'Slippage is the gap between expected and actual fill price.' },
            { q: 'In a thin, low-liquidity market you should expect:', options: ['Tighter spreads', 'Wider spreads and riskier fills', 'Guaranteed fills every time', 'No price movement at all'], answer: 1, explanation: 'Fewer participants means wider spreads and greater execution risk.' }
          ]
        },
        {
          id: 'market-participants', num: 6, title: 'Who Is in the Market?', minutes: 6, level: 'Beginner',
          objective: 'Recognise the main participant types and how their goals shape price action.',
          whyNext: 'Understanding who is trading helps you read why price behaves the way it does — and reminds you that large, professional money moves markets far more than individuals do.',
          body: `A market is a crowd, but not a random one. Familiarise yourself with the major groups:

- **Retail traders** — individuals trading personal money, usually in small size.
- **Institutional investors** — pension funds and mutual funds investing large pools on behalf of clients, over long horizons.
- **Hedge funds & prop desks** — aggressive, often short-horizon traders.
- **Market makers & HFT** — automate quoting and rapid execution, profiting from volume and [[Spread|spreads]].

:::info
Knowing who you trade alongside matters. If most volume comes from institutions, short-term price moves reflect their decisions — not yesterday\u2019s headline.
:::

A simple takeaway: you are the small boat in an ocean. Respect that, trade small, and treat every position as replaceable.`,
          check: [
            { q: 'Market makers mainly earn money from:', options: ['Your losses', 'The spread', 'Interest rates', 'Dividends'], answer: 1, explanation: 'They profit from the bid/ask spread by standing ready to trade.' },
            { q: 'Institutional investors typically:', options: ['Trade in tiny sizes every second', 'Invest large sums with long horizons', 'Only trade after hours', 'Avoid all index funds'], answer: 1, explanation: 'Institutions manage big pools of money over long time horizons.' },
            { q: 'As a retail trader you should treat your position as:', options: ['The market\u2019s main force', 'Replaceable and sized for survival', 'Untouchable forever', 'A guaranteed profit'], answer: 1, explanation: 'Smaller participants survive by keeping any single position affordable to lose.' }
          ]
        },
        {
          id: 'volatility', num: 7, title: 'What Is Volatility?', minutes: 8, level: 'Beginner',
          objective: 'Explain volatility, how it is measured, and why it cuts both ways.',
          whyNext: 'Volatility is the price of opportunity and the source of most beginner losses. The next module (chart reading) needs this concept to make trends and candles meaningful.',
          body: `**Volatility** is the speed and size of price swings. A calm stock drifting $0.20 has low volatility; a coin doubling then halving has extreme volatility.

## How is it measured?

- **Range** — how far high and low move in a period.
- **Standard deviation** of returns — the statistical swing.
- **ATR (Average True Range)** — a practical average of ranges over N bars.

Volatility is often described as a percentage. A stock with 20% annual volatility typically swings about 20% around its trend in a year — though not evenly.

:::key
High volatility is not good or bad by itself. It simply means bigger moves — which means bigger potential losses AND gains. Size your position before embracing it.
:::

## The two directions

Volatility can expand (news, panic, earnings) or compress (quiet drift). Shrinking volatility often precedes a compression-followed-by-breakout move — a pattern chart-readers use later.`,
          check: [
            { q: 'A highly volatile asset:', options: ['Never moves', 'Has large, rapid price swings', 'Has guaranteed returns', 'Has no risk'], answer: 1, explanation: 'Volatility is the size and speed of price movement.' },
            { q: 'Which is a practical measure of recent price range?', options: ['P/E ratio', 'Average True Range (ATR)', 'Dividend yield', 'Beta book value'], answer: 1, explanation: 'ATR averages the true ranges of recent bars, a hands-on volatility gauge.' },
            { q: 'Before trading a volatile asset you should:', options: ['Skip position sizing', 'Size positions smaller than usual', 'Use maximum leverage', 'Ignore all news'], answer: 1, explanation: 'Bigger swings demand smaller size to keep risk per trade controlled.' }
          ]
        },
        {
          id: 'reading-data', num: 8, title: 'Reading Market Data', minutes: 8, level: 'Beginner',
          objective: 'Read a ticker, a quote box and volume, and separate signal from noise.',
          whyNext: 'Charts and quotes are just data. If you cannot read a quote or understand volume, the prettiest chart in the world will mislead you.',
          body: `Professional market data looks like a code — until you decode it.

## The quote box

| Field | Meaning |
| --- | --- |
| Bid / Ask | Best buy / sell price right now |
| Last | Price of the most recent trade |
| Volume | How much traded in the period |
| 52W range | Highest and lowest in a year |

## The ticker tape

The tape shows each trade: the symbol, price, and size. Fast tape with growing [[Volume|volume]] during a move means the move has conviction. A quiet tape on a big candle is a red flag — momentum without buyers.

:::warn
Volume is context, not a signal. A price move on light volume can be a trap. Look for moves confirmed by participation.
:::

## Noise vs signal

Most bars are noise. **Signal** lives in places like closing prices, trend structure, and volume extremes. In the next module you will learn to compress this data into charts.`,
          check: [
            { q: 'A quote\u2019s "bid" is the best price a buyer will pay *right now*. If you sell, you receive:', options: ['The ask', 'The bid', 'The opening price', 'The high'], answer: 1, explanation: 'Sellers receive the bid; buyers pay the ask.' },
            { q: 'A strong price move on very light volume:', options: ['Is very convincing', 'Needs caution — participation is missing', 'Proves a takeover', 'Cannot happen'], answer: 1, explanation: 'Moves are more trustworthy when backed by expanding volume.' },
            { q: 'The 52-week range shows:', options: ['The next quarter\u2019s earnings', 'The highest and lowest price over a year', 'The number of shares', 'The company\u2019s founders'], answer: 1, explanation: 'It is context for where price has been over the last year.' }
          ]
        }
      ]
    },
    {
      id: 'chart-reading', num: 3, title: 'Chart Reading', blurb: 'Turn raw prices into a story: trends, candles, OHLC and timeframes.',
      lessons: [
        {
          id: 'trends', num: 9, title: 'Trends & Price Action', minutes: 9, level: 'Intermediate',
          objective: 'Identify uptrends, downtrends and ranges using swing highs and lows.',
          whyNext: 'Trends are the foundation of almost every strategy you will later learn. RSI, moving averages and breakouts all assume you can first read the trend.',
          body: `Price does not move in a straight line — it swings. The direction of the **swings** is the **trend**.

- **Uptrend**: higher highs AND higher lows.
- **Downtrend**: lower highs AND lower lows.
- **Range / sideways**: price bounces between a ceiling and a floor.

## How to draw it

Connect the swing lows in an uptrend with a trendline. Each touch that holds strengthens the line. When price breaks the line and starts printing lower lows, the trend has likely stalled.

:::key
Trends are probabilistic, not promises. "The trend is your friend until it bends" — the bend is confirmed only after price violates the structure, not before.
:::

## Why beginners blow up

They buy a falling knife because the price "looks cheap", or they chase an extended move that is already overbought. Reading the trend first keeps you on the right side of a coin.

Use the interactive demo below to plot an uptrend and test a trendline.`,
          widget: 'trend',
          check: [
            { q: 'An uptrend is defined by:', options: ['Higher highs and higher lows', 'Lower highs and higher lows', 'Flat volume', 'Wider spreads'], answer: 0, explanation: 'Progressively higher swing highs and lows map an uptrend.' },
            { q: 'A downtrend forms:', options: ['Higher highs and lower highs', 'Lower highs and lower lows', 'No volume', 'Narrow spreads'], answer: 1, explanation: 'Downtrends print lower highs and lower lows.' },
            { q: 'A trendline is most reliable when:', options: ['It is steep and new', 'Price has respected it several times', 'It is drawn by a famous trader', 'Volume is zero'], answer: 1, explanation: 'Each tested-and-held touch adds evidence to a trendline.' }
          ]
        },
        {
          id: 'candlesticks-ohlc', num: 10, title: 'Candlesticks & OHLC', minutes: 12, level: 'Intermediate',
          objective: 'Read a candlestick, verify OHLC rules, and spot bullish vs bearish bodies.',
          whyNext: 'Candles are the alphabet of charting. Every indicator, pattern or level in this course is usually visualised on top of — you guessed it — candles.',
          body: `A **candlestick** packs four prices into one shape: **Open, High, Low, Close (OHLC)**.

- The **body** spans open → close.
- The **wicks (shadows)** reach to the high and the low.
- A **green body** (close above open) is bullish. A **red body** is bearish.

## The OHLC rules

For every valid candle:

- high ≥ open **and** high ≥ close
- low ≤ open **and** low ≤ close
- high ≥ low

If any of these fail, the "candle" is impossible — a data error.

:::key
The "close" matters most. Weekly timeframes settle on their closes, indicators use closes, and many patterns are confirmed on the close.
:::

Understand the candle before you trade it. A long lower wick says buyers defended the lows; a long upper wick says sellers rejected the highs — even when the body is tiny.

Use the candle builder below: move the open, close, high and low and watch the candle (and the validator) update.`,
          widget: 'candle',
          check: [
            { q: 'Which price can never be below both open and close?', options: ['The high', 'The low', 'Volume', 'The previous close'], answer: 0, explanation: 'High ≥ open and high ≥ close are OHLC invariants.' },
            { q: 'A long lower wick with a small body often means:', options: ['Sellers dominated all day', 'Buyers defended the lows and pushed price back up', 'The market never opened', 'Volume was zero'], answer: 1, explanation: 'A lower wick shows price fell then recovered — buying interest below.' },
            { q: 'Jan\u2019s candle: open 100, high 104, low 99, close 102. Its colour is:', options: ['Green (bullish)', 'Red (bearish)', 'Grey', 'Impossible to tell'], answer: 0, explanation: 'Close (102) > open (100), so it is a bullish green candle, high 104 ≥ 102, low 99 ≤ 100 — valid.' }
          ]
        },
        {
          id: 'timeframes', num: 11, title: 'Timeframes', minutes: 8, level: 'Intermediate',
          objective: 'Explain how the timeframe changes the story, and use multiple timeframes together.',
          whyNext: 'The same market looks different on a 1-minute chart than on a daily chart. Choosing the right timeframe is the difference between seeing noise and seeing a trend.',
          body: `A timeframe is how long each candle represents: 1 minute, 1 hour, 1 day, 1 week. Zoom in and you see detail (and noise); zoom out and you see the big picture.

## What changes

| Timeframe | You see | Useful for |
| --- | --- | --- |
| 1m – 5m | Every wiggle, lots of noise | Short-term entries |
| 1H – 4H | Real moves with less noise | Swing trading |
| 1D – 1W | Structure and trend | Positioning, context |

:::key
A beginner rule: decide your **direction** on the higher timeframe, then pick your **entry** on the lower one. Do not flatten everything to one chart.
:::

## The trap

Obsessing over a 1-minute chart turns every breath into a crisis. The market always has a broader context — trade with it, not against it.

Visit the **Chart Lab** and switch timeframes on the same instrument to see the same data tell different stories.`,
          check: [
            { q: 'Which timeframe shows the most noise?', options: ['1 month', '1 day', '1 minute', '1 year'], answer: 2, explanation: 'Lower timeframes show more random wiggles and noise.' },
            { q: 'A sensible beginner approach is:', options: ['Use direction from the higher timeframe, entries on the lower', 'Only use 1-minute candles', 'Never use two charts', 'Ignore timeframes entirely'], answer: 0, explanation: 'Higher timeframe for bias, lower timeframe for timing — a clean, simple split.' },
            { q: 'The same price move looks smoother on a:', options: ['1-minute chart', 'Daily chart', 'Ticker tape', 'Spreadsheet'], answer: 1, explanation: 'Aggregating into daily candles hides intraday chaos and reveals the trend.' }
          ]
        }
      ]
    },
    {
      id: 'technical-analysis', num: 4, title: 'Technical Analysis', blurb: 'Support, resistance, moving averages and momentum — tools of the chart-reading trade.',
      lessons: [
        {
          id: 'support-resistance', num: 12, title: 'Support & Resistance', minutes: 9, level: 'Intermediate',
          objective: 'Find support and resistance levels and understand how they flip roles after breakouts.',
          whyNext: 'Support and resistance are the walls that contain most price action. Trading strategies later use them for entries, stop placement and targets.',
          body: `**Support** is a floor: a price zone where buyers have repeatedly stepped in. **Resistance** is a ceiling where sellers have repeatedly appeared.

## How they flip

When resistance breaks upward, price often returns and finds support where the ceiling used to be. The old ceiling becomes a new floor — a concept called **role reversal**.

:::key
Levels are zones, not laser lines. Give them breathing room; a single wick through a level is not a breakout. Confirmation (a decisive close, rising volume) matters.
:::

## Practical use

- **Setup**: buy near support in an uptrend, place your stop below the level.
- **Target**: ride to the next resistance.
- **Invalidation**: the idea dies if support breaks on volume.

Try the demo: tap the chart to mark support and resistance levels, then close the lesson and test them in the chart lab.`,
          widget: 'support',
          check: [
            { q: 'Support is best described as:', options: ['A guaranteed floor', 'A zone where buyers have repeatedly stopped declines', 'The day\u2019s open', 'A central bank price'], answer: 1, explanation: 'Support is a tendency from past demand, not a guarantee.' },
            { q: 'After a true breakout above resistance, that level often becomes:', options: ['Support', 'A sell signal for life', 'Nothing special', 'A new all-time low'], answer: 0, explanation: 'Broken ceilings frequently become floors — role reversal.' },
            { q: 'A decisive breakout is best confirmed by:', options: ['A single tiny wick', 'A strong close beyond the level with rising volume', 'A tweet', 'A wider spread'], answer: 1, explanation: 'Confirmation means convincing closes and participation, not one wick.' }
          ]
        },
        {
          id: 'moving-averages', num: 13, title: 'Moving Averages', minutes: 9, level: 'Intermediate',
          objective: 'Use SMA and EMA to smooth price, and read classic crossovers honestly.',
          whyNext: 'Moving averages turn price into a flowing line your eyes can follow. They underpin trend-following strategies later in the course.',
          body: `A **moving average** is the average close over a rolling window. It filters noise and makes the trend legible.

- **SMA** weights every bar equally.
- **EMA** gives more weight to recent bars, so it reacts faster — at the cost of more false turns.

## Two useful reads

- **Price vs MA**: price above a rising MA = bullish context; below a falling MA = bearish.
- **Crossovers**: a fast MA crossing above a slow MA (e.g., 20 over 50) is a classic "golden cross"; below is a "death cross". Useful context, NOT a crystal ball.

:::warn
Averages are *lagging* — they confirm what already happened. Buy signals appear after the move starts; in choppy markets they whipsaw.
:::

## Try it

Open the Chart Lab, choose an instrument and turn on a 20 and 50 MA. Compare how the EMA hugs price versus the SMA.`,
          check: [
            { q: 'An EMA reacts faster than an SMA because it:', options: ['Uses more data', 'Weights recent prices more heavily', 'Ignores closing prices', 'Runs on a CPU'], answer: 1, explanation: 'Exponential weighting prioritises the most recent bars.' },
            { q: 'Moving averages are classified as:', options: ['Leading indicators', 'Lagging indicators (confirm past moves)', 'Predictive engines', 'Earnings data'], answer: 1, explanation: 'They are averages of the past — confirmation, not prediction.' },
            { q: 'The main weakness of crossovers in a sideways market is:', options: ['No weakness', 'Whipsaw — repeated false signals', 'Too many profits', 'Nothing'], answer: 1, explanation: 'In ranges, price repeatedly criss-crosses the averages, triggering false signals.' }
          ]
        },
        {
          id: 'momentum-rsi', num: 14, title: 'Momentum & RSI', minutes: 9, level: 'Intermediate',
          objective: 'Define momentum, and use RSI zones (30/70) as context rather than commands.',
          whyNext: 'Trend tells you direction; momentum tells you conviction. RSI is the most common momentum tool, and knowing its limits prevents beginner traps.',
          body: `**Momentum** is the strength and speed of a price move. A stock grinding up slowly has trend but no momentum; a stock rocketing has both.

## RSI in a nutshell

RSI scores recent gains against recent losses on a 0–100 scale:

- **Above 70** — strong recent gains (often called "overbought").
- **Below 30** — strong recent losses ("oversold").

:::key
"Overbought" does not mean "sell now". In strong trends RSI can sit above 70 for weeks. Use it as context: are buyers or sellers in control?
:::

## A sane approach

- Uptrend + RSI ≥ 50 = buyers in control → look for pullback entries.
- Downtrend + RSI ≤ 50 = sellers in control → avoid catching knives.

RSI divergences (price makes a new high, RSI makes a lower high) are worth studying — they hint the move is losing breath.`,
          check: [
            { q: 'RSI above 70 is often described as:', options: ['Oversold', 'Overbought', 'Neutral', 'Guaranteed reversal'], answer: 1, explanation: '70+ means unusually strong recent gains; not a reason to blindly sell.' },
            { q: 'In a powerful uptrend, RSI can:', options: ['Never rise above 50', 'Stay above 70 for an extended period', 'Drop straight to 10', 'Turn grey'], answer: 1, explanation: 'Strong trends keep RSI elevated — "overbought" can persist.' },
            { q: 'Bearish RSI divergence means:', options: ['Price makes a new high that RSI fails to confirm', 'RSI makes a new high price refuses', 'Volume doubled', 'Nothing'], answer: 0, explanation: 'Unconfirmed highs hint the rally is losing momentum.' }
          ]
        },
        {
          id: 'chart-patterns', num: 15, title: 'Chart Patterns: The Basics', minutes: 10, level: 'Advanced',
          objective: 'Recognise a handful of foundational patterns — and treat them as probabilities, not prophecies.',
          whyNext: 'Patterns give structure to entries and targets. Learn the honest way — with invalidation plans — before risking a cent.',
          body: `Patterns are repeating shapes in price that hint where the next leg may go. Worth knowing by name:

- **Double top / double bottom** — two failed attempts at a high/low; reversal-ish.
- **Head & shoulders** — a big middle peak between two smaller ones; classic top.
- **Triangle** — tightening range; often a pause before continuation.
- **Flag / pennant** — a sharp move, a small quiet consolidation, then continuation.

## How to use them safely

Every pattern needs three things: a **trigger** (the breakout), a **target** (measured move), and an **invalidator** (where your idea is wrong). Without the invalidator you are not trading a pattern — you are hoping.

:::warn
Patterns fail constantly. The market pays you for managing the failure, not for being right every time.
:::

Later modules build real strategies on these shapes. For now: recognise them, mark the level, and wait for the close.`,
          check: [
            { q: 'A head-and-shoulders pattern is traditionally seen as:', options: ['A bullish continuation', 'A topping or reversal pattern', 'A guarantee of profit', 'A tax event'], answer: 1, explanation: 'Its classic read is a weakening uptrend that may reverse.' },
            { q: 'Every pattern trade should include:', options: ['A trigger, a target and an invalidator', 'Maximum leverage', 'No stop-loss', 'A paid signal'], answer: 0, explanation: 'Define entry, objective and invalidation before the trade exists.' },
            { q: 'A flag pattern is usually:', options: ['A continuation pause after a sharp move', 'A guaranteed top', 'Two equal peaks', 'A random shape'], answer: 0, explanation: 'Flags pause inside a strong move before the trend typically resumes.' }
          ]
        }
      ]
    },
    {
      id: 'risk-management', num: 5, title: 'Risk Management', blurb: 'The survival skills: sizing, stops, reward ratios and diversification.',
      lessons: [
        {
          id: 'position-sizing', num: 16, title: 'Position Sizing', minutes: 10, level: 'Advanced',
          objective: 'Size positions from your risk per trade, not from how confident you feel.',
          whyNext: 'You will lose trades — many of them. Sizing is what converts a losing streak from a catastrophe into a bump in the road.',
          body: `Position sizing answers one question: **how much of my account am I willing to lose on this trade?**

## Percent-risk method

1. Decide risk per trade: e.g. 1% of a $10,000 account = **$100**.
2. Find the stop distance: e.g. entry at $50, stop at $48 → $2 risk per share.
3. Shares = risk amount ÷ risk per share = 100 ÷ 2 = **50 shares**.

:::key
Never let a single idea be make-or-break. A professional expects to be wrong about 40–50% of the time. Sizing keeps the misses small so the winners matter.
:::

## The emotional bonus

When your size is small enough to shrug off, your decisions improve. Overtrading from fear, greed or [[FOMO]] is a symptom of being positioned too large.

The competition\u2019s **Trading Arena** enforces these ideas: it scores how disciplined your size and exposure were, not just your profit.`,
          check: [
            { q: 'Account $10,000, risk 1% per trade. Your risk budget is:', options: ['$10', '$100', '$1,000', '$10,000'], answer: 1, explanation: '1% of $10,000 is $100 available to lose on the trade.' },
            { q: 'Risking 2% per share with a $100 budget means you buy:', options: ['10 shares', '50 shares', '100 shares', '200 shares'], answer: 1, explanation: '100 ÷ 2 = 50 shares. Entry-to-stop distance dictates quantity.' },
            { q: 'A professional trader expects to be wrong:', options: ['0% of the time', 'Roughly 40–50% of the time', '100% of the time', 'Never'], answer: 1, explanation: 'Losing is normal; sizing is what keeps normal losses affordable.' }
          ]
        },
        {
          id: 'stop-loss', num: 17, title: 'Stop-Loss: Protecting Capital', minutes: 9, level: 'Advanced',
          objective: 'Set sensible stop-losses and avoid the classic beginner mistakes around them.',
          whyNext: 'A stop-loss is the difference between a small mistake and an account-ending one. Nearly every strategy later in the course uses one.',
          body: `A **stop-loss** is a pre-set exit you refuse to negotiate with. It converts "this might come back" into a small, defined loss.

## Rules of thumb

- Place stops **below** meaningful structure (support) for longs, not at a random threshold.
- Give the trade room to breathe: a stop crammed against the entry will be stopped out by noise.
- Never widen a stop because you are losing. Widening a stop is adding risk to a losing idea.

:::warn
A stop is not a guarantee — gaps and fast markets can fill you worse. It is a risk cap, not a magic shield.
:::

## The sizing link

Your stop distance *is* your position size: wider stop → smaller quantity, so total risk stays the same. The simulator shows this live when you place orders.

Use the demo to place a stop below support and see how far price can swing before your idea is gone.`,
          widget: 'stop',
          check: [
            { q: 'A good stop-loss placement for a long trade is:', options: ['At the exact entry price', 'Below a meaningful support level', '50% above the entry', 'At the all-time high'], answer: 1, explanation: 'Stops live under structure, giving the trade room to breathe while capping loss.' },
            { q: 'When a trade is moving against you, the disciplined action is:', options: ['Widen the stop to avoid losing', 'Keep the pre-planned stop and accept the defined loss', 'Average down aggressively', 'Ignore the market'], answer: 1, explanation: 'Moving the stop defeats its purpose; accept the pre-planned, sized risk.' },
            { q: 'Wider stop distance with the same risk budget means:', options: ['Smaller position size', 'Bigger position size', 'Lower fees', 'No change'], answer: 0, explanation: 'Risk = (stop distance) × quantity. Further stop → fewer shares needed to keep risk constant.' }
          ]
        },
        {
          id: 'risk-reward', num: 18, title: 'Risk/Reward & Expectancy', minutes: 9, level: 'Advanced',
          objective: 'Calculate risk/reward and expectancy, and see why win rate alone misleads.',
          whyNext: 'Win rate is vanity; expectancy is the math that pays you. Risk management and strategy modules both depend on this.',
          body: `**Risk/reward (R:R)** compares what you risk to what you hope to gain. Risking $100 to target $200 is **1:2**.

**Expectancy** blends win rate with the size of wins and losses:

Expectancy = (win% × average win) − (loss% × average loss)

:::key
A trader with a 40% win rate but a 1:3 R:R can beat a trader with an 80% win rate who risks $3 to earn $1. The math, not the highlights, decides.
:::

## Try it

Win 40% of the time, win $300, lose $100. Expectancy = (0.4 × 300) − (0.6 × 100) = 120 − 60 = **$60 per trade**. That is a positive game.

If your losers are bigger than your winners, no amount of win rate saves you. Cut losses short, let winners run.`,
          check: [
            { q: 'Risk $50 to target $150. The R:R is:', options: ['3:1', '1:3', '1:1', '2:1'], answer: 1, explanation: 'Reward is 3× the risk, written as 1:3 (risk:reward).' },
            { q: 'Expectancy of $60 after 1,000 similar trades implies:', options: ['Guaranteed profit every trade', 'Average ~$60 per trade — a positive expected value', 'You are always right', 'Nothing'], answer: 1, explanation: 'Expectancy is an average edge; individual trades vary.' },
            { q: 'A trader winning 80% but risking $3 to gain $1 most likely:', options: ['Is a genius', 'Has negative expectancy despite the high win rate', 'Cannot lose', 'Is trading without risk'], answer: 1, explanation: '80% × 1 − 20% × 3 = 0.2 — barely positive, and fragile. Win rate alone misleads.' }
          ]
        },
        {
          id: 'diversification', num: 19, title: 'Diversification', minutes: 7, level: 'Beginner',
          objective: 'Explain why spreading across unrelated assets smooths outcomes.',
          whyNext: 'Traders obsess over single entries; capitalists survive through diversification. This lesson protects everything else you learn.',
          body: `**Diversification** means not letting any one bet decide your future. It works because different assets rarely fail together.

- Different **companies** — one bad quarter doesn\u2019t sink you.
- Different **sectors & regions** — tech and energy move on different news.
- Different **asset classes** — stocks, cash, bonds — behave differently in stress.

:::key
Diversification reduces the swings you feel, it does not remove risk and it does not improve every position. It buys you the survival to keep learning.
:::

Low [[Beta|beta]] assets tend to hold up in downturns; high-beta ones amplify moves. A blend matches your stomach for swings. This is also why the simulator starts you with one instrument — to feel the pain of concentration, then learn to spread it.`,
          check: [
            { q: 'Diversification mainly helps you:', options: ['Guarantee profits', 'Reduce the impact of any single failure', 'Avoid all taxes', 'Predict prices'], answer: 1, explanation: 'It smooths outcomes; it cannot remove risk or guarantee returns.' },
            { q: 'Two stocks in the same tech sector are:', options: ['Fully independent', 'Likely correlated — limited diversification', 'Risk-free', 'Guaranteed to diverge'], answer: 1, explanation: 'Same-sector names often move together, so the diversification gain is smaller.' },
            { q: 'A high-beta asset in a falling market typically:', options: ['Rises automatically', 'Falls more than the market', 'Stays flat', 'Doubles'], answer: 1, explanation: 'High beta magnifies moves in both directions.' }
          ]
        }
      ]
    },
    {
      id: 'strategies', num: 6, title: 'Trading Strategies', blurb: 'Trend following, mean reversion, breakouts and the psychology that runs them.',
      lessons: [
        {
          id: 'trend-following', num: 20, title: 'Trend Following', minutes: 9, level: 'Advanced',
          objective: 'Ride established trends using pullbacks to structure, with defined risks.',
          whyNext: 'Trend following is the most beginner-friendly durable strategy. With follow-through from the risk module, it becomes your first complete system.',
          body: `**Trend following** = do not predict; join. When a market is clearly trending, buy the pullbacks to structure instead of chasing the extreme.

## The classic setup

1. Identify the trend (higher highs/lows on the higher timeframe).
2. Wait for a pullback to **support** (a prior swing low or a moving average).
3. Enter, place the stop below the level, target the next [[Resistance|resistance]] or a 1:2+ R:R.

:::key
Trend followers are late by design — they sacrifice the first 20% of a move to avoid calling tops and bottoms. Accept missing reversals.
:::

## Why it works for beginners

The method is mechanical: trend → pullback → stop below structure → target. It removes guesswork and outsizes the emotional urge to "do something".

It shines on [[Timeframe|higher timeframes]] and in markets that trend. In flat ranges it bleeds slowly — that is the cost of admission.`,
          check: [
            { q: 'A trend follower enters most often:', options: ['At the exact top', 'On a pullback to structure within an established trend', 'After the trend is over', 'On no evidence'], answer: 1, explanation: 'Pullbacks to support give an identifiable entry and invalidation point.' },
            { q: 'The first part of an uptrend is usually:', options: ['Missed by trend followers by design', 'Always captured', 'Irrelevant', 'A selling opportunity'], answer: 0, explanation: 'Trend systems wait for confirmation and pay for it by being late.' },
            { q: 'Where would a trend-following pullback trade place its stop?', options: ['Far above resistance', 'Below the pullback support structure', 'At the all-time high', 'No stop needed'], answer: 1, explanation: 'Structure below entry defines invalidation — same level your sizing math uses.' }
          ]
        },
        {
          id: 'mean-reversion', num: 21, title: 'Mean Reversion', minutes: 9, level: 'Advanced',
          objective: 'Trade short-term returns to the average, and know when it stops working.',
          whyNext: 'Trend following and mean reversion are two sides of the same coin. Seeing both keeps you from forcing one tool on every market.',
          body: `**Mean reversion** bets that price stretched too far snaps back toward its average. It is the pull side of the rubber band.

## When it works

- In a **range**: price bounces between support and resistance.
- When RSI climbs to extreme overbought/oversold *within* a range.
- After a sharp, news-driven pop that confirms no fundamental change.

## When it fails

- In a **trend**. Strong trends are mean-*making* machines — price keeps stretching. Trading "cheapness" against a trend is catching a falling knife.

:::key
The same tool that printing machine in a range burns accounts in a trend. Always check: is this market trading or trending right now?
:::

RSI extremes feature in the Chart Lab data — try spotting an overbought pop that snapped back versus one that kept running.`,
          check: [
            { q: 'Mean reversion performs best in:', options: ['Strong trends', 'Ranging, bounded markets', 'Market crashes', 'Never'], answer: 1, explanation: 'Bounded ranges give price somewhere sensible to snap back to.' },
            { q: 'The risk of mean reversion in a trending market is:', options: ['No risk', 'Catching falling knives as price keeps stretching', 'Guaranteed profit', 'Lower fees'], answer: 1, explanation: 'Trends punish "cheapness" entries relentlessly.' },
            { q: 'One signal that supports a reversion trade is:', options: ['Extreme RSI inside a clear range', 'A brand-new all-time high', 'Price above a rising MA', 'High emotion'], answer: 0, explanation: 'Overstretch inside a range is the reversion setup; the same reading in a trend is not.' }
          ]
        },
        {
          id: 'breakouts', num: 22, title: 'Breakout Trading', minutes: 10, level: 'Advanced',
          objective: 'Trade decisive moves through levels, with a plan for false breakouts.',
          whyNext: 'Breakouts are how ranges turn into trends. Combined with supports and volume, they give you a concrete, testable strategy.',
          body: `A **breakout** happens when price decisively stops respecting a level. Support holds → price bursts upward. Resistance breaks → the ceiling lifts.

## The honest sequence

1. Identify a clean level (long consolidation, marked support/resistance).
2. Wait for the close **beyond** the level — not a single wick.
3. Prefer rising **volume** on the breakout for confirmation.
4. Enter on the breakout or on a small retest of the broken level.
5. Stop just back inside the range; target the measured objective.

:::warn
False breakouts (whipsaws) are common. The invalidation stop is not optional — it is the entire plan. A breakout without a stop is a lottery ticket.
:::

Old resistance flipping to support (role reversal) is the mechanic the "retest" entry relies on. It is one of the most reliable — and most abused — ideas in charting.

Lab it: pick a ranging instrument in the Chart Lab and sketch where a breakout would be confirmed.`,
          check: [
            { q: 'The cleanest breakout confirmation includes:', options: ['A decisive close beyond the level with rising volume', 'Any one-point wick', 'A rumour', 'A lower close'], answer: 0, explanation: 'Conviction means closes beyond the level backed by participation.' },
            { q: 'A false breakout is best handled by:', options: ['Doubling down', 'The pre-planned invalidation stop', 'Hoping it returns', 'Ignoring it'], answer: 1, explanation: 'The stop turns a whipsaw into a small, known cost.' },
            { q: 'After an upward breakout, a pullback to the old resistance is often:', options: ['A re-entry opportunity (support flip)', 'An exit signal', 'A crash', 'Irrelevant'], answer: 0, explanation: 'Role reversal makes the broken ceiling a new floor for retest buyers.' }
          ]
        },
        {
          id: 'trading-psychology', num: 23, title: 'Trading Psychology', minutes: 9, level: 'Intermediate',
          objective: 'Name the emotional traps — FOMO, revenge trading, overtrading — and build rules against them.',
          whyNext: 'Every strategy fails without discipline. This is the last piece before practice: protect your rules from your moods.',
          body: `The market will test your emotions harder than your analysis. The classics:

- **FOMO** — buying because price is ripping upward. Usually means buying the top.
- **Revenge trading** — trying to win back a loss immediately with a bigger trade. Emotion-driven sizing.
- **Overtrading** — treating every wiggle as an opportunity; paying spread/fees for nothing.
- **Moving stops** — refusing to accept a loss, turning small losses into large ones.

:::key
You cannot stop the emotions — you can stop acting on them. Rules, pre-planned size and pre-planned exits exist precisely for the moments your brain lies to you.
:::

## Healthy habits

- Write the plan (entry, stop, target) before the trade — and then execute it word-for-word.
- After a loss, do a calm review, not a bigger trade.
- Use the simulator to rehearse break-even exits and acceptance of being wrong.

Discipline is trainable. It is also the exact thing the Trading Arena measures.`,
          check: [
            { q: 'FOMO-driven buys typically happen:', options: ['Near bottoms', 'Late in a fast move, often near the top', 'During quiet markets', 'Never happen'], answer: 1, explanation: 'The urge to join a ripping move usually arrives after the move, near its end.' },
            { q: 'Revenge trading after a loss:', options: ['Often enlarges losses', 'Always recovers them', 'Improves focus', 'Is required'], answer: 0, explanation: 'Making bigger emotional trades to recover is a leading cause of account damage.' },
            { q: 'The best antidote to emotional trading is:', options: ['More screen time', 'Pre-set rules: plan, size, stop, target — then follow them', 'Trading faster', 'Ignoring losses'], answer: 1, explanation: 'Decisions made calm are executed while emotional. Rules automate the calm.' }
          ]
        }
      ]
    },
    {
      id: 'practice-evaluation', num: 7, title: 'Practice & Evaluation', blurb: 'Simulate, measure, adjust. Close the learning loop.',
      lessons: [
        {
          id: 'paper-trading', num: 24, title: 'Paper Trading & Simulators', minutes: 7, level: 'Beginner',
          objective: 'Use the TradeVerse simulator deliberately as a training tool, with clear goals per session.',
          whyNext: 'Reading about trading is not trading. This lesson turns your knowledge into deliberate reps with feedback.',
          body: `**Paper trading** is practising with simulated money. Its purpose is not to predict — it is to make the mechanics and the discipline automatic.

## Deliberate practice, not screen time

A session without a goal is entertainment. Before each simulator session, decide:

- One skill: e.g. "place only pullback entries near support".
- One rule: e.g. "every trade has a stop and a 1:2 target".
- A size cap: e.g. "risk max 2% of virtual capital per trade".

:::key
The simulator is a gym, not a casino. Judge yourself on process adherence, not on the equity line of a single afternoon.
:::

## What simulators cannot teach

They cannot teach real fear, real liquidity, or real execution. They *can* teach order mechanics, sizing math, and how to run a plan. That is a huge head start — use it.

After this lesson, run at least one full Trading Arena round and read the scorecard.`,
          check: [
            { q: 'A deliberate simulator session should start with:', options: ['No plan, just trades', 'A specific skill, a rule, and a size cap', 'Maximum size', 'Watching TV'], answer: 1, explanation: 'Set a goal and a rule before you open the terminal.' },
            { q: 'The main value of paper trading is:', options: ['Guaranteed profit', 'Making mechanics and discipline automatic', 'Beating the exchange', 'No risk at all'], answer: 1, explanation: 'Reps make the process second nature; results today are secondary.' },
            { q: 'Which of these is best judged in a simulator?', options: ['Real market liquidity', 'Order types, sizing math and plan execution', 'Actual broker speed', 'Tax effects'], answer: 1, explanation: 'Mechanics transfer directly; real liquidity and fear do not.' }
          ]
        },
        {
          id: 'evaluating-trades', num: 25, title: 'Evaluating Your Trades', minutes: 8, level: 'Intermediate',
          objective: 'Review trades like an auditor: process first, outcome second, and learn from streak-quiet statistics.',
          whyNext: 'Improvement is impossible without measurement. The final capstone builds the plan you will use to keep improving for real.',
          body: `A losing trade is not automatically a bad trade, and a winning one is not automatically good. Evaluate the **process**, then the **outcome**.

## A review template

- **Plan adherence**: did I follow entry, stop, target? (Process score.)
- **Sizing**: did I risk a pre-planned amount? 
- **Setup quality**: was the configuration real, or did I improvise?
- **Outcome**: is the result from plan-following or luck?

## Think in samples

One trade means nothing; 30 trades start to talk. Find your:

- **Win rate** and average win/loss (see the R:R lesson).
- **Max drawdown** — how deep your equity dipped.
- **Discipline metrics** — stops respected, size respected.

:::info
The Trading Arena scorecard already computes these for you. Let it be your mirror, not your judge.
:::

If your losers are bigger than your winners, your exits are the problem. If your win rate is great but equity is flat, your winners are too small. Data points at the leak.`,
          check: [
            { q: 'A winning trade that broke every rule is:', options: ['Good — it made money', 'Poor process with a lucky outcome — learn from it', 'Untradeable', 'A system'], answer: 1, explanation: 'Rewarding rule-breaking teaches you to break rules. Judge process.' },
            { q: 'To judge your edge, you need a sample of:', options: ['1 trade', 'Usually 30+ trades', 'Only losing trades', 'Online reviews'], answer: 1, explanation: 'Statistics need enough trades to be meaningful.' },
            { q: 'Flat equity with a high win rate usually points to:', options: ['Perfect trading', 'Winners that are too small relative to losers', 'A system error', 'Nothing'], answer: 1, explanation: 'Many small wins newer with occasional big losses = standing still. Sizing winners matters.' }
          ]
        },
        {
          id: 'capstone', num: 26, title: 'Capstone — Build Your Practice Plan', minutes: 10, level: 'Capstone',
          objective: 'Combine every module into a written, honest, risk-first practice plan.',
          whyNext: 'This is the finish line: knowledge without a plan is trivia. Write yours now, practise it, and you have earned the name "trader-in-training".',
          body: `Congratulations — this is the capstone. Your job: write a one-page plan and run it in Intra-Event Mode.

## Your plan template

1. **Mission**: learn markets, practise process, never risk money I can\u2019t afford to lose.
2. **Market view**: check the trend on the higher timeframe before any trade.
3. **Setup rules**: only pullback-to-support (trend) or confirmed breakout entries.
4. **Risk rules**: risk ≤ 2% virtual capital per trade; every trade has a stop below structure and a 1:2+ target.
5. **Discipline rules**: no FOMO, no revenge trades, no moving stops up.
6. **Review cadence**: after each session, score process, not profit.

:::key
The goal is not to be right. It is to run a boring, repeatable process and let expectancy accumulate. Boring is the edge.
:::

## Finish line

Complete a full Intra-Event Mode run (Round 1 quiz + Round 2 arena) and review the scorecard. Then start the simulator tutorial — at your own pace. If you want listing, revisit the glossary anytime.`,
          check: [
            { q: 'A solid personalised plan puts its *first* rule on:', options: ['Get rich quickly', 'Protecting capital and process', 'Trading daily', 'Watching cable news'], answer: 1, explanation: 'Risk-first rules and repeatable process keep you alive long enough to learn.' },
            { q: 'The edge in a written plan comes from:', options: ['Its ambition', 'Its boring, repeatable rules executed consistently', 'Its length', 'Its secrecy'], answer: 1, explanation: 'Consistency converts process into expectancy.' },
            { q: 'After every session you should honestly review:', options: ['Process adherence first, then outcome', 'Only the wins', 'The meme accounts', 'Nothing'], answer: 0, explanation: 'Judge the process; the outcome informs the next sample set.' }
          ]
        }
      ]
    }
  ];

  const LESSONS = [];
  MODULES.forEach(m => { m.lessons.forEach(l => { LESSONS.push({ ...l, moduleId: m.id, moduleNum: m.num , moduleTitle: m.title }); }); });

  function lessonById(id) { return LESSONS.find(l => l.id === id) || null; }

  function indexOf(id) { return LESSONS.findIndex(l => l.id === id); }

  function neighbors(id) {
    const i = indexOf(id);
    if (i < 0) return { prev: null, next: null };
    return { prev: i > 0 ? LESSONS[i - 1] : null, next: i < LESSONS.length - 1 ? LESSONS[i + 1] : null };
  }

  function listByModule(moduleId) { return LESSONS.filter(l => l.moduleId === moduleId); }

  /* Five friendly learning stages, each grouping one or more modules.
     Ordered for a beginner: basics → charts → trading → risk → practice. */
  const STAGES = [
    {
      id: 'market-basics', num: 1, title: 'Market Basics',
      blurb: 'What a market is, what a stock means, who takes part and how a trade actually happens.',
      modules: ['foundations', 'mechanics']
    },
    {
      id: 'reading-charts', num: 2, title: 'Reading Charts',
      blurb: 'Turn raw prices into a story: trends, candlesticks, OHLC, timeframes, support and momentum.',
      modules: ['chart-reading', 'technical-analysis']
    },
    {
      id: 'understanding-trading', num: 3, title: 'Understanding Trading',
      blurb: 'How real strategies are built — trend following, breakouts, mean reversion and the mindset to run them.',
      modules: ['strategies']
    },
    {
      id: 'managing-risk', num: 4, title: 'Managing Risk',
      blurb: 'The survival skills: position sizing, stops, reward ratios and diversification.',
      modules: ['risk-management']
    },
    {
      id: 'practice-questions', num: 5, title: 'Practice Questions',
      blurb: 'Put it together: paper-trade, score your decisions and build a repeatable practice plan.',
      modules: ['practice-evaluation']
    }
  ];

  function modulesForStage(stageId) {
    const s = STAGES.find(x => x.id === stageId);
    if (!s) return [];
    return MODULES.filter(m => s.modules.indexOf(m.id) >= 0);
  }

  function lessonsForStage(stageId) {
    return modulesForStage(stageId).reduce((acc, m) => acc.concat(listByModule(m.id)), []);
  }

  const NS = { MODULES, LESSONS, STAGES, lessonById, indexOf, neighbors, listByModule, modulesForStage, lessonsForStage, total: LESSONS.length, durationTotal: LESSONS.reduce((a, l) => a + l.minutes, 0) };

  if (typeof module !== 'undefined' && module.exports) module.exports = NS;
  else root.TV = Object.assign(root.TV || {}, { courses: NS });
})(typeof window !== 'undefined' ? window : globalThis);
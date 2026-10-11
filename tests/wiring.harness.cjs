'use strict';
/* Headless load harness (run directly: `node tests/wiring.harness.cjs`).
   Evaluates every browser script in a shared VM context with a minimal
   window/document and module === undefined, then asserts the TV namespace
   is fully wired and the router resolves every public route. This is NOT a
   browser test: it proves the scripts load and register, not that pixels
   are correct. Rendering requires a real browser. */
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ROOT = path.join(__dirname, '..');

const ORDER = [
  'js/format.js', 'js/dom.js', 'js/markdown.js', 'js/store.js',
  'js/engine/simulation.js', 'js/engine/quiz.js',
  'js/data/market.js', 'js/data/glossary.js', 'js/data/quiz-bank.js', 'js/data/lessons.js',
  'js/chart.js', 'js/widgets.js', 'js/router.js',
  'js/views/landing.js', 'js/views/learning-path.js', 'js/views/lesson.js',
  'js/views/chart-lab.js', 'js/views/simulator.js', 'js/views/arena-hub.js',
  'js/views/quiz.js', 'js/views/trading-arena.js', 'js/views/glossary.js',
  'js/views/about-help.js', 'js/views/not-found.js', 'js/app.js'
];

const noop = () => {};
const stubEl = () => ({ style: {}, dataset: {}, classList: { add: noop, remove: noop, toggle: noop }, appendChild: noop, append: noop, setAttribute: noop, addEventListener: noop, focus: noop });

function makeContext() {
  const sandbox = {};
  sandbox.window = sandbox;
  sandbox.self = sandbox;
  sandbox.globalThis = sandbox;
  sandbox.document = {
    readyState: 'loading',            // defers app boot(); no live DOM touched
    addEventListener: noop,
    removeEventListener: noop,
    getElementById: () => null,
    querySelector: () => null,
    querySelectorAll: () => [],
    createElement: stubEl,
    createDocumentFragment: () => ({ appendChild: noop }),
    title: '',
    body: stubEl()
  };
  sandbox.location = { hash: '#/', pathname: '/', href: 'http://localhost/' };
  sandbox.navigator = { userAgent: 'node-harness', language: 'en' };
  sandbox.console = console;
  sandbox.setTimeout = setTimeout;
  sandbox.clearTimeout = clearTimeout;
  sandbox.setInterval = setInterval;
  sandbox.clearInterval = clearInterval;
  sandbox.requestAnimationFrame = (fn) => setTimeout(fn, 0);
  sandbox.cancelAnimationFrame = clearTimeout;
  vm.createContext(sandbox);
  return sandbox;
}

function load(sandbox) {
  for (const rel of ORDER) {
    const code = fs.readFileSync(path.join(ROOT, rel), 'utf8');
    try { vm.runInContext(code, sandbox, { filename: rel }); }
    catch (e) { throw new Error('Load failed in ' + rel + ': ' + e.message); }
  }
}

const fails = [];
const check = (cond, msg) => { if (!cond) fails.push(msg); };

const sandbox = makeContext();
load(sandbox);
const TV = sandbox.TV;

check(TV && typeof TV === 'object', 'TV namespace missing');
for (const key of ['format', 'dom', 'markdown', 'store', 'simulation', 'quiz', 'market', 'glossary', 'quizBank', 'courses', 'chart', 'widgets', 'router', 'app', 'views']) {
  check(TV && TV[key], 'TV.' + key + ' missing');
}

const wantViews = ['home', 'learn', 'lesson', 'chartLab', 'simulator', 'event', 'quiz', 'tradingArena', 'arena', 'glossary', 'about', 'help', 'notFound'];
for (const v of wantViews) check(TV.views && typeof TV.views[v] === 'object' && typeof TV.views[v].render === 'function', 'view missing/unrenderable: ' + v);

const map = [
  TV.router.route('home', 'home'),
  TV.router.route('learn', 'learn'),
  TV.router.route('lesson', 'lesson', ['id']),
  TV.router.route('chart-lab', 'chartLab'),
  TV.router.route('simulator', 'simulator'),
  TV.router.route('event', 'event'),
  TV.router.route('event', 'quiz', [], 'quiz'),
  TV.router.route('event', 'tradingArena', [], 'trading'),
  TV.router.route('arena', 'arena'),
  TV.router.route('arena', 'quiz', [], 'quiz'),
  TV.router.route('arena', 'tradingArena', [], 'trading'),
  TV.router.route('glossary', 'glossary'),
  TV.router.route('about', 'about'),
  TV.router.route('help', 'help')
];
const expect = {
  '#/': 'home', '#/learn': 'learn', '#/lesson/what-is-the-market': 'lesson',
  '#/chart-lab': 'chartLab', '#/simulator': 'simulator',
  '#/event': 'event', '#/event/quiz': 'quiz', '#/event/trading': 'tradingArena',
  '#/arena': 'arena', '#/arena/quiz': 'quiz', '#/arena/trading': 'tradingArena',
  '#/glossary': 'glossary', '#/about': 'about', '#/help': 'help', '#/does-not-exist': 'notFound'
};
for (const [hash, view] of Object.entries(expect)) {
  sandbox.location.hash = hash;
  const r = TV.router.resolve(map);
  check(r.view === view, 'route ' + hash + ' -> ' + r.view + ' (expected ' + view + ')');
}
// in-page anchors and empty hashes must not 404 (they resolve home)
sandbox.location.hash = '';
check(TV.router.resolve(map).view === 'home', 'empty hash should resolve home');
sandbox.location.hash = '#main';
check(TV.router.resolve(map).view === 'home', 'in-page anchor #main should resolve home');
// lesson param extraction
sandbox.location.hash = '#/lesson/candlesticks-ohlc';
check(TV.router.resolve(map).params.id === 'candlesticks-ohlc', 'lesson id param not extracted');

// light functional sanity on the browser-side data objects
check(TV.quizBank.count === 30, 'quiz bank is not 30');
check(TV.courses.total === 26, 'expected 26 lessons, got ' + TV.courses.total);
check(TV.courses.MODULES.length === 7, 'expected 7 modules');
check(TV.courses.STAGES.length === 5, 'expected 5 learning stages');
check(typeof TV.market.seriesDirect === 'function', 'market.seriesDirect missing');
check(TV.glossary.TERMS.length >= 40, 'glossary too small');
check(typeof TV.markdown.renderMarkdown === 'function', 'markdown render missing');
check(TV.market.INSTRUMENTS.length === 6, 'expected 6 instruments');

console.log('views registered :', Object.keys(TV.views).sort().join(', '));
console.log('quiz bank         :', TV.quizBank.count, 'questions');
console.log('lessons/modules   :', TV.courses.total, '/', TV.courses.MODULES.length);
console.log('glossary terms    :', TV.glossary.TERMS.length);
console.log('instruments       :', TV.market.INSTRUMENTS.length);
console.log('widgets           :', TV.widgets.names.join(', '));
console.log('routes checked    :', Object.keys(expect).length);

if (fails.length) { console.error('\nFAILURES:\n - ' + fails.join('\n - ')); process.exit(1); }
console.log('\nALL WIRING CHECKS PASSED');
'use strict';
const { test } = require('node:test');
const assert = require('node:assert');
const md = require('../../TradeVerse/js/markdown.js');

test('raw HTML is escaped, never emitted as live markup', () => {
  const out = md.renderMarkdown('<img src=x onerror=alert(1)> <script>bad()</script>');
  assert.ok(out.includes('&lt;img'), 'expected escaped img');
  assert.ok(out.includes('&lt;script&gt;'), 'expected escaped script');
  assert.ok(!out.includes('<img'), 'no live img tag');
  assert.ok(!out.includes('<script'), 'no live script tag');
});

test('code spans containing HTML are escaped too', () => {
  const out = md.renderMarkdown('`<script>bad()</script>`');
  assert.ok(out.includes('<code>'));
  assert.ok(out.includes('&lt;script&gt;'));
  assert.ok(!out.includes('<script>'), 'no live script inside code');
});

test('bold, italic and code spans still render', () => {
  const out = md.renderMarkdown('**bold** and *skew* and `one < two`');
  assert.ok(out.includes('<strong>bold</strong>'));
  assert.ok(out.includes('<em>skew</em>'));
  assert.ok(out.includes('<code>one &lt; two</code>'));
});

test('semantics are stripped out of code spans', () => {
  const out = md.renderMarkdown('`**not bold**`');
  assert.ok(out.includes('<code>**not bold**</code>'));
  assert.ok(!/<strong>/.test(out));
});

test('[[Term]] renders a glossary chip with a safe attribute', () => {
  const out = md.renderMarkdown('see [[Stop order]] now');
  assert.ok(out.includes('class="term"'));
  assert.ok(out.includes('data-term="Stop order"'));
  assert.ok(out.includes('<span class="term"'));
});

test('markdown tables produce a table wrapper', () => {
  const out = md.renderMarkdown('| A | B |\n| --- | --- |\n| 1 | 2 |');
  assert.ok(out.includes('<table'));
  assert.ok(out.includes('<th'));
  assert.ok(out.includes('>1<'));
});

test('callouts keep the label and body', () => {
  const out = md.renderMarkdown(':::key\nPrices move by supply and demand.\n:::');
  assert.ok(out.includes('callout'));
  assert.ok(out.includes('KEY'));
  assert.ok(out.includes('Prices move by supply'));
});

test('unknown inline [[term]] still escapes safely even with quotes', () => {
  const out = md.renderMarkdown('[[a "b" <c>]]');
  assert.ok(out.includes('&quot;b&quot;'));
  assert.ok(out.includes('&lt;c&gt;'));
});
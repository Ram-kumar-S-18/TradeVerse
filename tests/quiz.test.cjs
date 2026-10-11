'use strict';
const { test } = require('node:test');
const assert = require('node:assert');
const quiz = require('../../TradeVerse/js/engine/quiz.js');
const bank = require('../../TradeVerse/js/data/quiz-bank.js');

test('bank has exactly 30 questions', () => {
  assert.strictEqual(bank.count, 30);
  assert.strictEqual(bank.BANK.length, 30);
});

test('every question has a valid answer index and four options', () => {
  for (const q of bank.BANK) {
    assert.ok(Array.isArray(q.options) && q.options.length === 4, q.q);
    assert.ok(Number.isInteger(q.answer) && q.answer >= 0 && q.answer < q.options.length, q.q);
    assert.ok(typeof q.explanation === 'string' && q.explanation.length > 10, q.q);
    assert.ok(typeof q.category === 'string', q.q);
  }
});

test('session numbers questions and starts unsubmitted', () => {
  const s = quiz.createSession(bank.BANK, {}, 1000);
  assert.strictEqual(s.total, 30);
  assert.strictEqual(s.submitted, false);
  assert.strictEqual(s.answers.length, 30);
  assert.ok(s.answers.every(a => a === null));
});

test('selectAnswer records choice and correctness', () => {
  const s = quiz.createSession(bank.BANK, {}, 1000);
  const q = bank.BANK[0];
  quiz.selectAnswer(s, 0, q.answer);
  assert.strictEqual(s.answers[0].correct, true);
  quiz.selectAnswer(s, 0, (q.answer + 1) % 4);
  assert.strictEqual(s.answers[0].correct, false);
});

test('navigation is clamped to 0..29', () => {
  const s = quiz.createSession(bank.BANK, {}, 1000);
  assert.strictEqual(quiz.nav(s, -99), 0);
  assert.strictEqual(quiz.nav(s, 99), 29);
});

test('unanswered questions are counted wrong and listed', () => {
  const s = quiz.createSession(bank.BANK, {}, 1000);
  quiz.selectAnswer(s, 0, bank.BANK[0].answer);
  const sc = quiz.score(s);
  assert.strictEqual(sc.correct, 1);
  assert.strictEqual(sc.unanswered, 29);
  assert.strictEqual(quiz.unansweredList(s).length, 29);
});

test('double submission is rejected', () => {
  const s = quiz.createSession(bank.BANK, { durationSeconds: 60 }, 0);
  const first = quiz.submit(s, 1000);
  assert.strictEqual(first.ok, true);
  const second = quiz.submit(s, 2000);
  assert.strictEqual(second.ok, false);
  assert.ok(/already submitted/.test(second.error));
});

test('runToCompletion resolves every question deterministically', () => {
  const answers = {};
  bank.BANK.forEach((q, i) => { answers[i] = q.answer; });
  const s = quiz.runToCompletion(bank.BANK, answers, {}, 0);
  assert.strictEqual(s.score.correct, 30);
  assert.strictEqual(s.score.pct, 1);
  assert.strictEqual(s.results.length, 30);
});
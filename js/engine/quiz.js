/* TradeVerse — quiz state machine (pure, deterministic, testable).
   Handles navigation, answers, timer math, guarded submission, scoring,
   explanations and restart. Never lets a session be submitted twice. */
(function (root) {
  'use strict';

  function createSession(questions, opts, now) {
    opts = opts || {};
    const durationSeconds = Math.max(10, Number(opts.durationSeconds) || 0);
    return {
      questions: questions.map((q, idx) => ({ ...q, idx })),
      answers: new Array(questions.length).fill(null),  // { choice, correct } or null
      current: 0,
      duration: durationSeconds,
      startedAt: now,
      submitted: false,
      submittedAt: null,
      score: null,
      total: questions.length,
      results: null
    };
  }

  function remaining(s, now) {
    if (!s.startedAt) return s.duration;
    return Math.max(0, Math.round(s.startedAt + s.duration * 1000 - now));
  }

  function nav(s, dir) {  // returns new current index (guarded)
    let c = s.current + dir;
    if (c < 0) c = 0;
    if (c > s.questions.length - 1) c = s.questions.length - 1;
    s.current = c;
    return c;
  }

  function answeredCount(s) {
    return s.answers.reduce((a, b) => a + (b ? 1 : 0), 0);
  }

  function unansweredList(s) {
    return s.questions.filter((_, i) => !s.answers[i]).map(q => q.idx);
  }

  /* Select an answer for a question. Returns {ok, error?}. */
  function selectAnswer(s, qIdx, choice) {
    if (s.submitted) return { ok: false, error: 'Quiz already submitted.' };
    if (qIdx < 0 || qIdx >= s.questions.length) return { ok: false, error: 'Invalid question index.' };
    const q = s.questions[qIdx];
    if (choice < 0 || choice >= q.options.length) return { ok: false, error: 'Invalid option.' };
    s.answers[qIdx] = { choice, correct: choice === q.answer };
    return { ok: true };
  }

  /* Compute full results. Idempotent-safe: second call returns existing. */
  function score(s) {
    const correct = s.answers.reduce((a, b) => a + (b && b.correct ? 1 : 0), 0);
    return { correct, total: s.questions.length, pct: s.questions.length ? correct / s.questions.length : 0, unanswered: unansweredList(s).length };
  }

  function submit(s, now) {
    if (s.submitted) return { ok: false, error: 'Stop — this quiz was already submitted.' };
    const sc = score(s);
    s.submitted = true;
    s.submittedAt = now;
    s.score = sc;
    s.results = s.questions.map((q, i) => {
      const a = s.answers[i];
      return {
        q, i,
        selected: a ? a.choice : null,
        correct: a ? a.correct : false,
        answered: !!a,
        correctOption: q.answer,
        explanation: q.explanation
      };
    });
    return { ok: true, score: sc };
  }

  /* Deterministic equivalent used by tests: answer everything then submit. */
  function runToCompletion(questions, answersByIndex, opts, now) {
    const s = createSession(questions, opts, now || 0);
    for (const [idx, choice] of Object.entries(answersByIndex)) {
      selectAnswer(s, Number(idx), choice);
    }
    submit(s, s.startedAt + (opts && opts.elapsedMs ? opts.elapsedMs : 0));
    return s;
  }

  const NS = { createSession, remaining, nav, answeredCount, unansweredList, selectAnswer, submit, score, runToCompletion };

  if (typeof module !== 'undefined' && module.exports) module.exports = NS;
  else root.TV = Object.assign(root.TV || {}, { quiz: NS });
})(typeof window !== 'undefined' ? window : globalThis);
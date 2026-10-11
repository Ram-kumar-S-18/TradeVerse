/* TradeVerse — Intra-Event Mode · Round 1: Market Knowledge quiz. */
(function (root) {
  'use strict';

  let session = null;

  function render(container, params) {
    const quiz = root.TV.quiz;
    const bank = root.TV.quizBank;
    const fmt = root.TV.format;
    const app = root.TV.app;
    const wrap = document.createElement('div');
    wrap.className = 'container';

    wrap.appendChild(app.pageHead('Round 1 · The Market Quiz', 'Answer 30 questions on market fundamentals, valuation and risk. Submit once — the engine refuses double submissions.', [
      { label: 'Home', hash: '#/' },
      { label: 'Intra-Event Mode', hash: '#/event' }
    ]));

    let timer = null;
    const host = document.createElement('div'); host.className = 'quiz-host';
    wrap.appendChild(host);

    function clearTimer() { if (timer) { clearInterval(timer); timer = null; } }

    function start(minutes) {
      const qs = bank.BANK
        .map((q, i) => ({ ...q, i }))
        .sort(() => Math.random() - 0.5)
        .slice(0, 30);
      session = quiz.createSession(qs, { durationSeconds: minutes * 60 }, Date.now());
      renderLive();
    }

    function renderLive() {
      clearTimer();
      host.innerHTML = '';
      if (!session || session.submitted) { renderResults(); return; }

      const meta = document.createElement('div'); meta.className = 'quiz-meta';
      const count = document.createElement('b'); count.id = 'q-count'; count.textContent = '1 / ' + session.total;
      const answered = document.createElement('span'); answered.id = 'q-answered';
      const clock = document.createElement('b'); clock.className = 'clock'; clock.id = 'q-clock'; clock.textContent = fmt.mmss(quiz.remaining(session, Date.now()) / 1000);
      const submitBtn = document.createElement('button'); submitBtn.className = 'btn btn-primary'; submitBtn.textContent = 'Submit quiz';
      meta.append(count, answered, clock, submitBtn);
      host.appendChild(meta);

      const dots = document.createElement('nav'); dots.className = 'q-dots'; dots.id = 'q-dots';
      host.appendChild(dots);

      const box = document.createElement('div'); box.className = 'q-box';
      const qTxt = document.createElement('h3'); qTxt.id = 'q-text';
      const cat = document.createElement('div'); cat.className = 'tag tag-dim'; cat.id = 'q-cat';
      box.append(qTxt, cat);
      const optsWrap = document.createElement('div'); optsWrap.className = 'check-options'; optsWrap.id = 'q-options';
      box.appendChild(optsWrap);
      const pad = document.createElement('div'); pad.className = 'quiz-nav-btns';
      const prevBtn = document.createElement('button'); prevBtn.className = 'btn btn-outline'; prevBtn.textContent = '← Previous';
      const nextBtn = document.createElement('button'); nextBtn.className = 'btn btn-outline'; nextBtn.textContent = 'Next →';
      pad.append(prevBtn, nextBtn);
      box.appendChild(pad);
      host.appendChild(box);

      const note = document.createElement('p'); note.className = 'card-text center';
      note.textContent = 'You can change an answer until you submit. Unanswered questions count as wrong.';
      host.appendChild(note);

      function drawDots() {
        dots.innerHTML = '';
        session.questions.forEach((q, i) => {
          const b = document.createElement('button');
          b.className = 'q-dot' + (i === session.current ? ' cur' : '') + (session.answers[i] ? ' ans' : '');
          b.textContent = String(i + 1);
          b.setAttribute('aria-label', 'Question ' + (i + 1));
          b.addEventListener('click', () => { session.current = i; paint(); });
          dots.appendChild(b);
        });
      }

      function paint() {
        const q = session.questions[session.current];
        const ans = session.answers[session.current];
        qTxt.textContent = (session.current + 1) + '. ' + q.q;
        cat.textContent = q.category;
        count.textContent = (session.current + 1) + ' / ' + session.total;
        answered.textContent = quiz.answeredCount(session) + ' answered';
        optsWrap.innerHTML = '';
        q.options.forEach((opt, oi) => {
          const b = document.createElement('button'); b.className = 'btn btn-option';
          if (ans && ans.choice === oi) b.classList.add('sel');
          b.textContent = String.fromCharCode(65 + oi) + '. ' + opt;
          b.addEventListener('click', () => {
            quiz.selectAnswer(session, session.current, oi);
            drawDots(); paint();
          });
          optsWrap.appendChild(b);
        });
        drawDots();
      }

      prevBtn.addEventListener('click', () => { quiz.nav(session, -1); paint(); });
      nextBtn.addEventListener('click', () => { quiz.nav(session, 1); paint(); });

      let expired = false;
      timer = setInterval(() => {
        const left = quiz.remaining(session, Date.now());
        clock.textContent = fmt.mmss(left / 1000);
        if (left <= 0 && !session.submitted) {
          if (!expired) { expired = true; app.toast('Time is up — auto-submitting.'); }
          const r = quiz.submit(session, Date.now());
          if (r.ok) renderResults();
        }
      }, 1000);

      submitBtn.addEventListener('click', () => {
        const un = quiz.unansweredList(session).length;
        if (un > 0 && !window.confirm('You still have ' + un + ' question(s) unanswered. Submit anyway?')) return;
        const r = quiz.submit(session, Date.now());
        if (!r.ok) { app.toast(r.error, 'warn'); return; }
        clearTimer();
        renderResults();
      });

      paint();
    }

    function renderResults() {
      clearTimer();
      host.innerHTML = '';
      if (!session || !session.results) return;

      const r = session.score;
      const card = document.createElement('div'); card.className = 'quiz-score card';
      const sc = document.createElement('div'); sc.className = 'score-big';
      const num = document.createElement('div'); num.className = 'score-num'; num.textContent = r.correct + ' / ' + r.total;
      const pct = document.createElement('div'); pct.className = 'score-pct'; pct.textContent = fmt.pct(r.pct, 0, false) + ' correct';
      sc.append(num, pct);
      card.appendChild(sc);
      const verdict = document.createElement('p'); verdict.className = 'verdict';
      verdict.textContent = r.pct >= 0.8 ? 'Strong. You are ready for Round 2.'
        : r.pct >= 0.5 ? 'Solid foundation — review the questions you missed below.'
          : 'Worth a retake. Spend a little time in the lessons, then try again.';
      card.appendChild(verdict);
      host.appendChild(card);

      const review = document.createElement('div'); review.className = 'review';
      session.results.forEach((res, ri) => {
        const it = document.createElement('div'); it.className = 'review-item';
        const verdictIcon = res.correct ? '✓' : '✗';
        it.classList.add(res.correct ? 'ok' : 'no');
        const t = document.createElement('p'); t.className = 'review-q';
        t.innerHTML = verdictIcon + ' <b>' + root.TV.dom.escapeHtml(res.q.q) + '</b> <span class="tag tag-dim">' + root.TV.dom.escapeHtml(res.q.category) + '</span>';
        it.appendChild(t);
        const your = document.createElement('p'); your.className = 'review-line';
        your.textContent = res.answered
          ? 'Your answer: ' + String.fromCharCode(65 + res.selected) + '. ' + res.q.options[res.selected]
          : 'You did not answer this one.';
        it.appendChild(your);
        const correct = document.createElement('p'); correct.className = 'review-line correct';
        correct.textContent = 'Correct answer: ' + String.fromCharCode(65 + res.correctOption) + '. ' + res.q.options[res.correctOption];
        it.appendChild(correct);
        const why = document.createElement('p'); why.className = 'review-line why';
        why.textContent = res.explanation;
        it.appendChild(why);
        review.appendChild(it);
      });
      host.appendChild(review);

      const actions = document.createElement('div'); actions.className = 'actions';
      const again = document.createElement('button'); again.className = 'btn btn-outline'; again.textContent = 'Restart quiz';
      again.addEventListener('click', () => { session = null; drawConfig(); });
      const next = document.createElement('a'); next.className = 'btn btn-primary'; next.href = '#/event/trading'; next.textContent = 'Continue to Round 2 →';
      actions.append(again, next);
      host.appendChild(actions);
    }

    function drawConfig() {
      clearTimer();
      session = null;
      host.innerHTML = '';
      const intro = document.createElement('div'); intro.className = 'card pre-card';
      const h = document.createElement('h2'); h.textContent = 'Round 1 · The Market Quiz';
      const p1 = document.createElement('p'); p1.className = 'card-text'; p1.textContent = '30 practice questions drawn at random from the TradeVerse question bank. Your score is local to this browser tab and disappears when you leave.';
      const ul = document.createElement('ul'); ul.className = 'plain-list';
      [['Scoring', '+1 per correct answer; unanswered counts as wrong.'],
        ['Timer', 'Choose a duration — the clock auto-submits at zero.'],
        ['Fairness', 'You can navigate freely and change answers until you submit.'],
        ['Practice content', 'These are practice questions, not the official event paper.'],
        ['Privacy', 'No answers are recorded anywhere. The engine refuses double submits.']]
        .forEach(([k, v]) => {
          const li = document.createElement('li');
          const b = document.createElement('b'); b.textContent = k + ': ';
          li.append(b, document.createTextNode(v));
          ul.appendChild(li);
        });
      intro.append(h, p1, ul);

      const cfg = document.createElement('div'); cfg.className = 'pre-card card';
      const cl = document.createElement('label'); cl.className = 'ctl';
      const sl = document.createElement('span'); sl.className = 'ctl-label'; sl.textContent = 'Practice timer';
      const minutesSel = document.createElement('select');
      [['20', '20 minutes'], ['25', '25 minutes']].forEach(([v, txt]) => {
        const o = document.createElement('option'); o.value = v; o.textContent = txt; minutesSel.appendChild(o);
      });
      minutesSel.value = '25';
      cl.append(sl, minutesSel);
      const go = document.createElement('button'); go.className = 'btn btn-primary'; go.textContent = 'Start Quiz';
      go.addEventListener('click', () => start(Number(minutesSel.value)));
      cfg.append(cl, go);
      host.append(intro, cfg);
    }

    drawConfig();

    container.appendChild(wrap);
    return { title: 'Round 1 · The Market Quiz', cleanup: clearTimer, stopTimers: clearTimer };
  }

  root.TV = Object.assign(root.TV || {}, { views: Object.assign((root.TV && root.TV.views) || {}, { quiz: { render } }) });
})(typeof window !== 'undefined' ? window : globalThis);
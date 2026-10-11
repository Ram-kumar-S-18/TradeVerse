/* TradeVerse — Learning Path view. Groups lessons into five friendly stages. */
(function (root) {
  'use strict';

  function render(container, params) {
    const c = root.TV.courses;
    const app = root.TV.app;
    const done = root.TV.store.learnState;
    const wrap = document.createElement('div');
    wrap.className = 'container';

    wrap.appendChild(app.pageHead('Learning Path', 'Five simple stages, twenty-six lessons, one goal: the discipline to trade like a professional.', []));

    const doneCount = done.list().length;
    const total = c.total;
    const prog = document.createElement('div'); prog.className = 'prog-row';
    const progBar = document.createElement('div'); progBar.className = 'prog';
    progBar.style.width = ((doneCount / total) * 100).toFixed(1) + '%';
    prog.append(progBar);
    wrap.appendChild(prog);
    const meta = document.createElement('div'); meta.className = 'prog-meta';
    meta.textContent = doneCount > 0
      ? doneCount + ' / ' + total + ' lessons marked complete — progress is kept only for this session.'
      : 'Progress is kept only for this session and resets on reload.';
    wrap.appendChild(meta);

    const stages = document.createElement('div'); stages.className = 'stage-list';

    c.STAGES.forEach((stage) => {
      const stageLessons = c.lessonsForStage(stage.id);
      const doneHere = stageLessons.filter(l => done.has(l.id)).length;

      const sec = document.createElement('section'); sec.className = 'stage';
      const head = document.createElement('div'); head.className = 'stage-head';
      const idx = document.createElement('div'); idx.className = 'stage-index'; idx.textContent = 'Stage ' + stage.num;
      const titles = document.createElement('div');
      const h = document.createElement('h2'); h.textContent = stage.title;
      const sub = document.createElement('div'); sub.className = 'stage-sub'; sub.textContent = stage.blurb;
      titles.append(h, sub);
      const side = document.createElement('div'); side.className = 'stage-meta';
      const bar = document.createElement('div'); bar.className = 'prog mini'; bar.style.width = ((doneHere / stageLessons.length) * 100).toFixed(0) + '%';
      const lbl = document.createElement('span'); lbl.textContent = doneHere + '/' + stageLessons.length;
      side.append(bar, lbl);
      head.append(idx, titles, side);
      sec.appendChild(head);

      c.modulesForStage(stage.id).forEach((mod) => {
        const lessons = c.listByModule(mod.id);
        const modDone = lessons.filter(l => done.has(l.id)).length;
        const card = document.createElement('div'); card.className = 'module-card';
        const mHead = document.createElement('div'); mHead.className = 'module-head';
        const mTitle = document.createElement('div');
        const mh = document.createElement('h3'); mh.textContent = mod.title;
        const ms = document.createElement('div'); ms.className = 'module-sub'; ms.textContent = mod.blurb;
        mTitle.append(mh, ms);
        const mRight = document.createElement('div'); mRight.className = 'module-meta';
        const mBar = document.createElement('div'); mBar.className = 'prog mini'; mBar.style.width = ((modDone / lessons.length) * 100).toFixed(0) + '%';
        const mLbl = document.createElement('span'); mLbl.textContent = modDone + '/' + lessons.length + ' done';
        mRight.append(mBar, mLbl);
        mHead.append(mTitle, mRight);
        card.appendChild(mHead);

        const list = document.createElement('ul'); list.className = 'lesson-list';
        lessons.forEach((l, i) => {
          const li = document.createElement('li');
          const a = document.createElement('a'); a.className = 'lesson-row hover-card'; a.href = '#/lesson/' + l.id;
          const num = document.createElement('span'); num.className = 'lesson-num'; num.textContent = String(i + 1).padStart(2, '0');
          const body = document.createElement('span'); body.className = 'lesson-body';
          const t = document.createElement('span'); t.className = 'lesson-title'; t.textContent = l.title;
          const d = document.createElement('span'); d.className = 'lesson-desc'; d.textContent = l.objective;
          body.append(t, d);
          const time = document.createElement('span'); time.className = 'lesson-time'; time.textContent = l.minutes + ' min';
          const chk = document.createElement('span'); chk.className = 'lesson-check' + (done.has(l.id) ? ' yes' : '');
          chk.innerHTML = done.has(l.id) ? '&#10003;' : '&#9675;';
          chk.setAttribute('aria-label', done.has(l.id) ? 'complete' : 'not complete');
          a.append(num, body, time, chk);
          li.appendChild(a);
          list.appendChild(li);
        });
        card.appendChild(list);
        sec.appendChild(card);
      });

      stages.appendChild(sec);
    });

    wrap.appendChild(stages);

    const cta = document.createElement('div'); cta.className = 'learn-cta card';
    const ctaText = document.createElement('p'); ctaText.className = 'card-text';
    ctaText.textContent = 'Finished the basics? Test yourself in Intra-Event Mode.';
    const ctaBtn = document.createElement('a'); ctaBtn.className = 'btn btn-primary'; ctaBtn.href = '#/event'; ctaBtn.textContent = 'Enter Intra-Event Mode';
    cta.append(ctaText, ctaBtn);
    wrap.appendChild(cta);

    container.appendChild(wrap);
    return { title: 'Learning Path' };
  }

  root.TV = Object.assign(root.TV || {}, { views: Object.assign((root.TV && root.TV.views) || {}, { learn: { render } }) });
})(typeof window !== 'undefined' ? window : globalThis);

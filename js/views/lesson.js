/* TradeVerse — Lesson view: rendered markdown, interactive widget,
   knowledge check, progress toggle, prev/next navigation. */
(function (root) {
  'use strict';

  function render(container, params) {
    const c = root.TV.courses;
    const app = root.TV.app;
    const learn = root.TV.store.learnState;
    const id = params.id;
    const lesson = c.lessonById(id);

    if (!lesson) { location.hash = '#/learn'; return { title: 'Lesson' }; }

    const wrap = document.createElement('div');
    wrap.className = 'container lesson-page';

    wrap.appendChild(app.breadcrumbs([
      { label: 'Learning Path', hash: '#/learn' },
      { label: lesson.title }
    ]));

    const head = document.createElement('header'); head.className = 'lesson-head card';
    const meta = document.createElement('div'); meta.className = 'lesson-meta';
    const mod = document.createElement('span'); mod.className = 'tag'; mod.textContent = lesson.moduleTitle;
    const lvl = document.createElement('span'); lvl.className = 'tag tag-dim'; lvl.textContent = lesson.level;
    const mins = document.createElement('span'); mins.className = 'tag tag-dim'; mins.textContent = lesson.minutes + ' min';
    meta.append(mod, lvl, mins);
    head.appendChild(meta);
    head.appendChild(Object.assign(document.createElement('h1'), { textContent: lesson.title }));
    const objP = document.createElement('p'); objP.className = 'lead'; objP.textContent = lesson.objective;
    head.appendChild(objP);
    wrap.appendChild(head);

    const markBtn = document.createElement('button'); markBtn.className = 'btn btn-sm btn-outline mark-btn';
    const updateMark = () => {
      const done = learn.has(lesson.id);
      markBtn.textContent = done ? 'Marked complete ✓' : 'Mark as learned';
      markBtn.classList.toggle('checked', done);
    };
    updateMark();
    markBtn.addEventListener('click', () => {
      if (learn.has(lesson.id)) learn.remove(lesson.id); else learn.add(lesson.id);
      updateMark();
    });
    head.appendChild(markBtn);

    // main + sidebar
    const grid = document.createElement('div'); grid.className = 'lesson-grid';
    const mainCol = document.createElement('div'); mainCol.className = 'lesson-main';
    const aside = document.createElement('aside'); aside.className = 'lesson-side';

    // body
    const body = document.createElement('article'); body.className = 'prose card';
    body.innerHTML = root.TV.markdown.renderMarkdown(lesson.body);
    mainCol.appendChild(body);

    // widget
    if (lesson.widget) {
      const widgetWrap = document.createElement('div'); widgetWrap.className = 'widget-wrap';
      const wtitle = document.createElement('h2'); wtitle.className = 'widget-title'; wtitle.textContent = 'Interactive demo';
      widgetWrap.appendChild(wtitle);
      root.TV.widgets.render(widgetWrap, lesson.widget);
      mainCol.appendChild(widgetWrap);
    }

    // knowledge check
    const check = document.createElement('section'); check.className = 'lesson-quiz card';
    const checkHead = document.createElement('h2'); checkHead.textContent = 'Knowledge check';
    const checkSub = document.createElement('p'); checkSub.className = 'card-text'; checkSub.textContent = 'Three questions on this lesson. Your answers are not recorded.';
    check.append(checkHead, checkSub);
    const que = document.createElement('div'); que.className = 'quiz group';
    lesson.check.forEach((item, qi) => {
      const qBox = document.createElement('div'); qBox.className = 'question-box';
      const qTxt = document.createElement('p'); qTxt.className = 'question-text';
      qTxt.textContent = (qi + 1) + '. ' + item.q;
      qBox.appendChild(qTxt);
      const opts = document.createElement('div'); opts.className = 'check-options';
      const btns = [];
      item.options.forEach((opt, oi) => {
        const b = document.createElement('button'); b.className = 'btn btn-option'; b.textContent = String.fromCharCode(65 + oi) + '. ' + opt;
        b.addEventListener('click', () => {
          if (qBox.dataset.done) return;
          qBox.dataset.done = '1';
          btns.forEach(x => x.classList.add('dim'));
          const ok = oi === item.answer;
          b.classList.add(ok ? 'opt-correct' : 'opt-wrong');
          if (oi !== item.answer) btns[item.answer].classList.add('opt-correct');
          const frag = document.createElement('div'); frag.className = ok ? 'opt-note good' : 'opt-note bad';
          frag.textContent = (ok ? 'Correct. ' : 'Not quite. ') + item.explanation;
          qBox.appendChild(frag);
        });
        opts.appendChild(b); btns.push(b);
      });
      qBox.appendChild(opts);
      que.appendChild(qBox);
    });
    check.appendChild(que);
    mainCol.appendChild(check);

    // why next
    const why = document.createElement('section'); why.className = 'why-next card';
    const whyHead = document.createElement('h2'); whyHead.textContent = 'Why this matters';
    const whyP = document.createElement('p'); whyP.textContent = lesson.whyNext;
    why.append(whyHead, whyP);
    mainCol.appendChild(why);

    const { prev, next } = c.neighbors(lesson.id);
    const prevBtn = prev
      ? Object.assign(document.createElement('a'), { href: '#/lesson/' + prev.id, textContent: '← ' + prev.title })
      : null;
    const nextBtn = next
      ? Object.assign(document.createElement('a'), { href: '#/lesson/' + next.id, textContent: next.title + ' →' })
      : null;
    const pager = document.createElement('nav'); pager.className = 'lesson-pager';
    if (prevBtn) prevBtn.className = 'btn btn-outline';
    if (nextBtn) nextBtn.className = 'btn btn-outline';
    const spacer = document.createElement('span'); spacer.className = 'pager-spacer';
    if (prevBtn) pager.appendChild(prevBtn); else pager.appendChild(spacer);
    if (nextBtn) pager.appendChild(nextBtn); else pager.appendChild(spacer);

    if (next) {
      const upNext = document.createElement('div'); upNext.className = 'up-next';
      const u = document.createElement('div'); u.className = 'up-next-label'; u.textContent = 'Up next · ' + next.moduleTitle;
      const ut = document.createElement('a'); ut.href = '#/lesson/' + next.id; ut.textContent = next.title;
      upNext.append(u, ut);
      aside.appendChild(upNext);
      const ul = document.createElement('ul'); ul.className = 'module-mini';
      c.listByModule(next.moduleId).forEach(l => {
        const li = document.createElement('li');
        if (l.id === lesson.id) { li.className = 'here'; li.textContent = l.title; }
        else { const a = document.createElement('a'); a.href = '#/lesson/' + l.id; a.textContent = l.title; li.appendChild(a); }
        ul.appendChild(li);
      });
      const lbl = document.createElement('div'); lbl.className = 'up-next-label'; lbl.textContent = 'In this module';
      aside.append(lbl, ul);
    }

    grid.append(mainCol, aside);
    wrap.appendChild(grid);
    wrap.appendChild(pager);
    container.appendChild(wrap);

    return { title: lesson.title };
  }

  root.TV = Object.assign(root.TV || {}, { views: Object.assign((root.TV && root.TV.views) || {}, { lesson: { render } }) });
})(typeof window !== 'undefined' ? window : globalThis);
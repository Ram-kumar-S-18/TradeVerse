/* TradeVerse — minimal safe Markdown renderer.
   Input is escaped BEFORE any transform, so raw HTML in source can never
   become live markup. Tested under Node and used by the browser views. */
(function (root) {
  'use strict';

  const h = String.fromCharCode(1);   // sentinels to protect escaped regions
  const HI = String.fromCharCode(2);

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  /* Inline transforms. The whole string is escaped FIRST, so raw HTML in
     source can never become live markup. Code spans are extracted before
     escaping so `**` inside code is not styled, then restored as <code>. */
  function inline(s, opts) {
    // protect inline code before escaping
    const codes = [];
    s = s.replace(/`([^`]+)`/g, (m, code) => {
      codes.push(code);
      return HI + (codes.length - 1) + HI;
    });

    // escape everything else (raw <, >, ", ', & become inert)
    s = esc(s);

    // [[Term]] -> glossary chip
    s = s.replace(/\[\[([^\]]+)\]\]/g, (m, term) => {
      const name = term.trim();
      return '<span class="term" data-term="' + name + '" tabindex="0" role="link">' + name + '</span>';
    });

    // **bold**
    s = s.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    // *italic*
    s = s.replace(/\*([^*]+)\*/g, '<em>$1</em>');

    // restore code spans (escaped here so code contents can never go live)
    s = s.replace(new RegExp(HI + '(\\d+)' + HI, 'g'), (m, idx) => '<code>' + esc(codes[Number(idx)]) + '</code>');
    return s;
  }

  function heading(line, opts) {
    const m = line.match(/^(#{1,4})\s+(.*)$/);
    if (!m) return null;
    const lvl = m[1].length + 1; // h2..h5
    return '<h' + lvl + '>' + inline(m[2]) + '</h' + lvl + '>';
  }

  function isTableRow(line) { return /^\s*\|.*\|\s*$/.test(line); }

  function table(rows) {
    const split = (r) => r.trim().replace(/^\|/, '').replace(/\|$/, '').split('|').map(c => c.trim());
    let header = split(rows[0]);
    let body = rows.slice(1);
    if (body.length && /^[:\s-]+$/.test(split(body[0]).join(''))) body = body.slice(1);
    let html = '<div class="table-wrap"><table><thead><tr>';
    header.forEach(c => { html += '<th class="mono">' + inline(c) + '</th>'; });
    html += '</tr></thead><tbody>';
    body.forEach(r => {
      html += '<tr>';
      split(r).forEach(c => { html += '<td>' + inline(c) + '</td>'; });
      html += '</tr>';
    });
    return html + '</tbody></table></div>';
  }

  function headingLevelFor(t) {
    if (/^##\s/.test(t)) return 2;
    if (/^#\s/.test(t)) return 2;
    return 2;
  }

  function renderMarkdown(src, opts) {
    opts = opts || {};
    const blockTags = {
      ':::key': 'key callout',
      ':::warn': 'warn callout',
      ':::info': 'info callout'
    };
    const lines = String(src == null ? '' : src).replace(/\r\n?/g, '\n').split('\n');
    const out = [];
    let i = 0;

    while (i < lines.length) {
      const line = lines[i];

      if (/^\s*```/.test(line)) {
        const buf = [];
        i++;
        while (i < lines.length && !/^\s*```/.test(lines[i])) { buf.push(lines[i]); i++; }
        i++; // closing fence
        out.push('<pre><code>' + esc(buf.join('\n')) + '</code></pre>');
        continue;
      }

      const hidx = line.match(/^#{1,4}\s+/);
      if (hidx) { let h1 = heading(line); if (h1) { out.push(h1); i++; continue; } }

      if (/^\s*---+/.test(line)) { out.push('<hr>'); i++; continue; }

      if (/^\s*:::\s*([\w-]+)/.test(line)) {
        const key = line.trim().split(/\s+/)[0];
        const tag = blockTags[key];
        const label = opts[key] || (tag && tag.split(' ')[0].toUpperCase()) || 'NOTE';
        if (tag) {
          i++;
          const buf = [];
          while (i < lines.length && !/^\s*:::/.test(lines[i])) { buf.push(lines[i]); i++; }
          i++;
          out.push('<div class="' + tag.split(' ')[1] + '"><span class="co-label">' + esc(label) + '</span>' + inline(buf.join(' ').trim()) + '</div>');
        } else { i++; }
        continue;
      }

      if (isTableRow(line)) {
        const rows = [];
        while (i < lines.length && isTableRow(lines[i])) { rows.push(lines[i]); i++; }
        out.push(table(rows));
        continue;
      }

      if (/^\s*>/.test(line)) {
        const buf = [];
        while (i < lines.length && /^\s*>/.test(lines[i])) { buf.push(lines[i].replace(/^\s*>\s?/, '')); i++; }
        out.push('<blockquote>' + inline(buf.join(' ')) + '</blockquote>');
        continue;
      }

      const ul = /^\s*[-*]\s+/.test(line);
      const ol = /^\s*\d+[.)]\s+/.test(line);
      if (ul || ol) {
        const items = [];
        const isU = ul;
        while (i < lines.length && (isU ? /^\s*[-*]\s+/ : /^\s*\d+[.)]\s+/).test(lines[i])) {
          items.push(lines[i].replace(/^\s*([-*]|\d+[.)])\s+/, ''));
          i++;
        }
        const tag = isU ? 'ul' : 'ol';
        out.push('<' + tag + '>' + items.map(it => '<li>' + inline(it) + '</li>').join('') + '</' + tag + '>');
        continue;
      }

      if (line.trim() === '') { i++; continue; }

      const buf = [];
      while (i < lines.length) {
        const l = lines[i];
        if (l.trim() === '' || /^\s*```/.test(l) || isTableRow(l) || /^#{1,4}\s+/.test(l) || /^\s*[-*]\s+/.test(l) || /^\s*\d+[.)]\s+/.test(l) || /^\s*>/.test(l) || /^:::/.test(l) || /^\s*---+/.test(l)) break;
        buf.push(l); i++;
      }
      if (buf.length) out.push('<p>' + inline(buf.join(' ')) + '</p>');
    }

    void headingLevelFor; // reserved
    return out.join('\n');
  }

  const NS = { renderMarkdown };

  if (typeof module !== 'undefined' && module.exports) module.exports = NS;
  else root.TV = Object.assign(root.TV || {}, { markdown: NS });
})(typeof window !== 'undefined' ? window : globalThis);
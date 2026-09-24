// ui.js — everything drawn as crisp text on the scaled canvas: title, story cards, dialog, HUD, fade.
const portraitCanvas = document.createElement('canvas'); portraitCanvas.width = 12; portraitCanvas.height = 16;

const UI = {
  font(px) { ctx.font = `${px * S}px 'Press Start 2P', monospace`; },
  text(str, x, y, color = '#e8e8f0', px = 8, align = 'left') {
    this.font(px); ctx.fillStyle = color; ctx.textAlign = align; ctx.textBaseline = 'top';
    ctx.fillText(str, Math.round(x * S), Math.round(y * S));
  },
  wrap(str, maxW, px = 8) {
    this.font(px); const out = []; let cur = '';
    for (const w of str.split(' ')) { const t = cur ? cur + ' ' + w : w; if (ctx.measureText(t).width > maxW * S && cur) { out.push(cur); cur = w; } else cur = t; }
    if (cur) out.push(cur); return out;
  },
  // Typewriter: draw wrapped lines, revealing only the first n characters.
  typed(str, n, x, y, maxW, px, lh, color, align = 'left') {
    let left = Math.floor(n), row = 0;
    for (const line of this.wrap(str, maxW, px)) { if (left <= 0) break; this.text(line.slice(0, left), x, y + row * lh, color, px, align); left -= line.length + 1; row++; }
    return row;
  },
  box(x, y, w, h, fill = 'rgba(8,10,20,0.92)', stroke = '#8c93b8') {
    ctx.fillStyle = fill; ctx.fillRect(x * S, y * S, w * S, h * S);
    ctx.lineWidth = S; ctx.strokeStyle = stroke; ctx.strokeRect((x + 0.5) * S, (y + 0.5) * S, (w - 1) * S, (h - 1) * S);
  },
  portrait(who, x, y) {
    if (!CHARS[who] || who === 'narr') return false;
    const p = portraitCanvas.getContext('2d'); p.clearRect(0, 0, 12, 16); drawChar(p, who, 0, 0, 0, false);
    ctx.imageSmoothingEnabled = false; ctx.drawImage(portraitCanvas, x * S, y * S, 24 * S, 32 * S); return true;
  },
  blink(period = 900) { return Math.floor(state.time / period) % 2 === 0; },

  draw() {
    const m = state.mode;
    if (m === 'title') this.title();
    else if (m === 'cards') this.cards();
    else if (m === 'end') this.end();
    else { this.hud(); if (m === 'dialog') this.dialog(); }
    if (state.fade) { ctx.fillStyle = `rgba(0,0,0,${Math.min(1, Math.max(0, state.fade.a))})`; ctx.fillRect(0, 0, cv.width, cv.height); }
  },

  title() {
    ctx.fillStyle = 'rgba(5,6,14,0.55)'; ctx.fillRect(0, 0, cv.width, cv.height);
    this.text('EMBER LANE', VW / 2, 46, '#ffd98a', 22, 'center');
    this.text('a short drama, one rainy night', VW / 2, 78, '#9fa4c0', 6, 'center');
    if (this.blink()) this.text('PRESS ENTER', VW / 2, 128, '#e8e8f0', 8, 'center');
    this.text('arrows move  ·  E talks  ·  enter chooses', VW / 2, 160, '#4f5470', 5, 'center');
  },

  cards() {
    const c = state.cards; ctx.fillStyle = 'rgba(5,6,14,0.84)'; ctx.fillRect(0, 0, cv.width, cv.height);
    const text = c.list[c.i], full = c.chars >= text.length;
    this.typed(text, c.chars, VW / 2, 56, 250, 7, 13, '#e8e8f0', 'center');
    if (full && this.blink(700)) this.text('ENTER', VW / 2, 152, '#8c93b8', 6, 'center');
    const dots = c.list.map((_, i) => i === c.i ? '●' : '·').join(' '); this.text(dots, VW / 2, 166, '#4f5470', 6, 'center');
  },

  end() {
    const e = state.ending; ctx.fillStyle = '#05060e'; ctx.fillRect(0, 0, cv.width, cv.height);
    this.text('THE END', VW / 2, 40, '#9fa4c0', 8, 'center');
    this.text(e.title, VW / 2, 60, '#ffd98a', 18, 'center');
    this.text(`warmth ${state.warmth} of a possible 6`, VW / 2, 98, '#8c93b8', 6, 'center');
    this.text('three endings  ·  one night', VW / 2, 112, '#4f5470', 5, 'center');
    if (this.blink()) this.text('ENTER TO BEGIN AGAIN', VW / 2, 140, '#e8e8f0', 7, 'center');
  },

  hud() {
    const t = state.sceneT, a = Math.min(1, Math.max(0, (t - 300) / 400), Math.max(0, (4200 - t) / 800));
    if (a > 0) { ctx.globalAlpha = a; this.text(SCENES[state.scene].label, 6, 5, '#c9c9d9', 6); ctx.globalAlpha = 1; }
  },

  dialog() {
    const d = state.dialog, line = d.lines[d.li], who = line.who, c = CHARS[who];
    const bx = 6, by = 122, bw = 308, bh = 54;
    this.box(bx, by, bw, bh);
    const hasP = this.portrait(who, bx + 6, by + 11);
    const tx = hasP ? bx + 36 : bx + 10, tw = hasP ? bw - 46 : bw - 20;
    if (c.name) this.text(c.name, tx, by + 5, c.col, 6);
    const ty = c.name ? by + 15 : by + 10, full = d.chars >= line.t.length;
    this.typed(line.t, d.chars, tx, ty, tw, 6, 9, who === 'narr' ? '#c9c9d9' : '#f0f0f6');
    if (full && !d.choosing && this.blink(600)) this.text('▸', bx + bw - 12, by + bh - 11, '#ffd98a', 7);
    if (d.choosing) {
      const opts = d.options, h = opts.length * 12 + 8, y = by - h - 3;
      this.box(bx, y, bw, h, 'rgba(12,14,28,0.95)', '#ffd98a');
      opts.forEach((o, i) => { const sel = i === d.choice; this.text((sel ? '> ' : '  ') + o.t, bx + 10, y + 5 + i * 12, sel ? '#ffd98a' : '#a9adc4', 7); });
    }
  }
};

// engine.js — loop, input, world, rain, scene changes, dialog flow, endings, sound.
const cv = document.getElementById('game'), ctx = cv.getContext('2d');
const off = document.createElement('canvas'); off.width = VW; off.height = VH; const g = off.getContext('2d');
let S = 1;
function fit() { S = Math.max(1, Math.floor(Math.min(innerWidth / VW, (innerHeight - 36) / VH) * 2) / 2); cv.width = VW * S; cv.height = VH * S; ctx.imageSmoothingEnabled = false; }
addEventListener('resize', fit); fit();

const keys = {}, pressed = {};
// Normalise to KeyboardEvent.code; fall back to .key for environments that omit code.
function keyCode(e) { if (e.code) return e.code; const k = e.key || ''; if (k === ' ') return 'Space'; if (k.length === 1 && /[a-z]/i.test(k)) return 'Key' + k.toUpperCase(); return k; }
addEventListener('keydown', e => { const c = keyCode(e); if (!keys[c]) pressed[c] = true; keys[c] = true; if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(c)) e.preventDefault(); SFX.boot(); });
addEventListener('keyup', e => { keys[keyCode(e)] = false; });
addEventListener('blur', () => { for (const k in keys) keys[k] = false; });
const hit = (...codes) => codes.some(c => pressed[c]);
const ADV = ['Enter', 'Space', 'KeyE'];

const state = { mode: 'title', warmth: 0, flags: {}, scene: 'station', sceneT: 0, time: 0, flash: 0, muted: false,
  player: { x: 0, y: 0, face: 1, frame: 0, t: 0, moving: false }, dialog: null, cards: null, ending: null, fade: null };
const rain = Array.from({ length: 110 }, () => ({ x: Math.random() * VW, y: Math.random() * VH, l: 4 + Math.random() * 7, v: 2.4 + Math.random() * 1.8 }));

// ---------- sound: looping filtered noise for rain, a low rumble for thunder ----------
const SFX = { ac: null, gain: null, level: 0,
  boot() {
    if (this.ac) return;
    try {
      const ac = new (window.AudioContext || window.webkitAudioContext)();
      const len = ac.sampleRate * 2, buf = ac.createBuffer(1, len, ac.sampleRate), d = buf.getChannelData(0);
      for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
      const src = ac.createBufferSource(); src.buffer = buf; src.loop = true;
      const f = ac.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 900;
      const gn = ac.createGain(); gn.gain.value = 0;
      src.connect(f).connect(gn).connect(ac.destination); src.start();
      this.ac = ac; this.gain = gn; this.apply();
    } catch (e) { /* no audio available: the game is silent, that's fine */ }
  },
  set(level) { this.level = level; this.apply(); },
  apply() { if (this.gain) this.gain.gain.setTargetAtTime(state.muted ? 0 : this.level, this.ac.currentTime, 0.5); },
  thunder() {
    if (!this.ac || state.muted) return;
    const ac = this.ac, len = ac.sampleRate * 1.6, buf = ac.createBuffer(1, len, ac.sampleRate), d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2);
    const s = ac.createBufferSource(); s.buffer = buf;
    const f = ac.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 160;
    const gn = ac.createGain(); gn.gain.value = 0.6;
    s.connect(f).connect(gn).connect(ac.destination); s.start(ac.currentTime + 0.3);
  } };

// ---------- world ----------
function loadScene(name, spawn) {
  state.scene = name; const sc = SCENES[name], sp = spawn || sc.spawn;
  Object.assign(state.player, { x: sp.x, y: sp.y, face: sp.face || 1, moving: false, frame: 0 });
  state.sceneT = 0; SFX.set(sc.outdoor ? 0.10 : 0.03);
}
function fadeTo(cb) { if (!state.fade) state.fade = { a: 0, dir: 1, cb }; }
function tileAt(px, py) { const sc = SCENES[state.scene], c = Math.floor(px / TILE), r = Math.floor(py / TILE); if (c < 0 || c >= COLS || r < 0 || r >= sc.rows.length) return '#'; return sc.rows[r][c]; }
function blocked(px, py) {
  if (px - 4 < 0 || px + 4 > VW || py - 3 < 0 || py > VH) return true;
  for (const [dx, dy] of [[-4, -3], [4, -3], [-4, 0], [4, 0]]) if (SOLID.has(tileAt(px + dx, py + dy))) return true;
  for (const n of SCENES[state.scene].npcs) if (Math.abs(px - n.x) < 10 && Math.abs(py - n.y) < 7) return true;
  return false;
}
function nearestTarget() {
  const sc = SCENES[state.scene], p = state.player; let best = null, bd = 22;
  for (const n of sc.npcs) { const d = Math.hypot(n.x - p.x, n.y - p.y); if (d < bd) { bd = d; best = { kind: 'npc', ref: n, x: n.x, y: n.y - 26 }; } }
  for (const h of sc.hotspots) {
    const dx = Math.max(h.x - p.x, 0, p.x - (h.x + h.w)), dy = Math.max(h.y - p.y, 0, p.y - (h.y + h.h)), d = Math.hypot(dx, dy);
    if (d < 12 && d < bd) { bd = d; best = { kind: 'hot', ref: h, x: h.x + h.w / 2, y: h.y - 10 }; }
  }
  return best;
}

// ---------- update ----------
function update(dt) {
  state.time += dt; state.sceneT += dt;
  for (const r of rain) { r.y += r.v * dt / 16; r.x -= 0.45 * dt / 16; if (r.y > VH) { r.y = -r.l; r.x = Math.random() * (VW + 20); } if (r.x < -5) r.x = VW + 5; }
  if (state.flash > 0) state.flash -= dt / 320;
  const sc = SCENES[state.scene];
  if (sc.outdoor && state.mode !== 'end' && Math.random() < dt / 14000) { state.flash = 1; SFX.thunder(); }
  if (hit('KeyM')) { state.muted = !state.muted; SFX.apply(); }
  if (state.fade) { const f = state.fade; f.a += f.dir * dt / 260; if (f.dir > 0 && f.a >= 1) { f.cb(); f.dir = -1; } if (f.dir < 0 && f.a <= 0) state.fade = null; }
  else if (state.mode === 'title') { if (hit('Enter', 'Space')) startCards(INTRO, () => fadeTo(() => { state.mode = 'play'; loadScene('station'); })); }
  else if (state.mode === 'cards') updateCards(dt);
  else if (state.mode === 'play') updatePlay(dt);
  else if (state.mode === 'dialog') updateDialog(dt);
  else if (state.mode === 'end') { if (hit('Enter', 'Space')) resetGame(); }
  for (const k in pressed) pressed[k] = false;
}

function updatePlay(dt) {
  const p = state.player; let vx = 0, vy = 0;
  if (keys.ArrowLeft || keys.KeyA) vx -= 1; if (keys.ArrowRight || keys.KeyD) vx += 1;
  if (keys.ArrowUp || keys.KeyW) vy -= 1; if (keys.ArrowDown || keys.KeyS) vy += 1;
  p.moving = !!(vx || vy); if (vx) p.face = vx;
  const sp = 1.3 * dt / 16 * ((vx && vy) ? 0.72 : 1);
  if (vx && !blocked(p.x + vx * sp, p.y)) p.x += vx * sp;
  if (vy && !blocked(p.x, p.y + vy * sp)) p.y += vy * sp;
  if (p.moving) p.t += dt; p.frame = p.moving ? Math.floor(p.t / 170) % 2 : 0;
  for (const e of SCENES[state.scene].exits) if (p.x >= e.x && p.x < e.x + e.w && p.y >= e.y && p.y < e.y + e.h) { fadeTo(() => loadScene(e.to, e.spawn)); return; }
  if (hit(...ADV)) { const t = nearestTarget(); if (t) { if (t.kind === 'npc') t.ref.face = p.x < t.ref.x ? -1 : 1; openDialog(t.ref.talk(state)); } }
}

// ---------- dialog ----------
function openDialog(id) {
  const node = STORY[id]; if (!node) return closeDialog();
  if (node.ending) return startEnding(node);
  if (node.set) state.flags[node.set] = true;
  const lines = node.lines.map(l => typeof l === 'string' ? { who: node.who, t: l } : { who: l.who || node.who, t: l.t, if: l.if, unless: l.unless })
    .filter(l => (!l.if || state.flags[l.if]) && (!l.unless || !state.flags[l.unless]));
  if (!lines.length) return node.next ? openDialog(node.next) : closeDialog();
  state.mode = 'dialog'; state.dialog = { id, node, lines, li: 0, chars: 0, choosing: false, choice: 0, options: [] };
}
function closeDialog() { state.dialog = null; state.mode = 'play'; }
function updateDialog(dt) {
  const d = state.dialog, line = d.lines[d.li]; state.flags.coldEnough = state.warmth < 0;
  d.chars += dt * 0.05;
  const full = d.chars >= line.t.length;
  if (d.choosing) {
    if (hit('ArrowUp', 'KeyW')) d.choice = (d.choice + d.options.length - 1) % d.options.length;
    if (hit('ArrowDown', 'KeyS')) d.choice = (d.choice + 1) % d.options.length;
    if (hit(...ADV)) { const o = d.options[d.choice]; if (o.w) state.warmth += o.w; if (o.set) state.flags[o.set] = true; o.next ? openDialog(o.next) : closeDialog(); }
    return;
  }
  if (full && d.li === d.lines.length - 1 && d.node.choices) { d.options = d.node.choices.filter(c => !c.if || state.flags[c.if]); d.choosing = true; d.choice = 0; return; }
  if (hit(...ADV)) {
    if (!full) d.chars = line.t.length;
    else if (d.li < d.lines.length - 1) { d.li++; d.chars = 0; }
    else if (d.node.next) openDialog(d.node.next);
    else closeDialog();
  }
}

// ---------- cards & endings ----------
function startCards(list, after) { state.mode = 'cards'; state.cards = { list, i: 0, chars: 0, after }; }
function updateCards(dt) {
  const c = state.cards; c.chars += dt * 0.045; const text = c.list[c.i];
  if (hit(...ADV)) { if (c.chars < text.length) c.chars = text.length; else if (c.i < c.list.length - 1) { c.i++; c.chars = 0; } else c.after(); }
}
function startEnding(node) {
  const key = node.ending === 'byWarmth' ? (state.warmth >= 3 ? 'ember' : 'rain') : node.ending;
  const e = ENDINGS[key]; state.dialog = null; state.mode = 'play'; state.ending = { key, title: e.title };
  fadeTo(() => startCards(node.hard && e.hardCards ? e.hardCards : e.cards, () => fadeTo(() => { state.mode = 'end'; })));
}
function resetGame() {
  fadeTo(() => {
    state.warmth = 0; state.flags = {}; state.ending = null; state.cards = null; state.dialog = null;
    for (const sc of Object.values(SCENES)) for (const n of sc.npcs) n.face = n.face0;
    state.mode = 'title'; loadScene('station');
  });
}

// ---------- render ----------
function drawLights(sc) {
  g.fillStyle = sc.outdoor ? 'rgba(8,10,30,0.45)' : 'rgba(20,30,55,0.30)'; g.fillRect(0, 0, VW, VH);
  g.save(); g.globalCompositeOperation = 'lighter';
  for (const l of sc.lamps) { const c = l.c || '255,214,140', gr = g.createRadialGradient(l.x, l.y, 2, l.x, l.y, l.r); gr.addColorStop(0, `rgba(${c},0.32)`); gr.addColorStop(1, `rgba(${c},0)`); g.fillStyle = gr; g.fillRect(l.x - l.r, l.y - l.r, l.r * 2, l.r * 2); }
  g.restore();
  if (state.flash > 0) { g.fillStyle = `rgba(200,210,255,${state.flash * 0.45})`; g.fillRect(0, 0, VW, VH); }
}
function drawRain() { g.strokeStyle = 'rgba(170,190,230,0.5)'; g.lineWidth = 1; g.beginPath(); for (const r of rain) { g.moveTo(r.x, r.y); g.lineTo(r.x - 1.2, r.y + r.l); } g.stroke(); }
function drawPrompt(x, y) {
  const px = Math.round(x) - 4, py = Math.round(y) + Math.round(Math.sin(state.time / 250) * 1.5);
  g.fillStyle = '#0b0e1a'; g.fillRect(px - 1, py - 1, 9, 9); g.fillStyle = '#ffd98a'; g.fillRect(px, py, 7, 7); g.fillStyle = '#0b0e1a';
  for (const [a, b, w, h] of [[2, 1, 3, 1], [2, 2, 1, 1], [2, 3, 2, 1], [2, 4, 1, 1], [2, 5, 3, 1]]) g.fillRect(px + a, py + b, w, h);
}
function render() {
  const sc = SCENES[state.scene], p = state.player;
  g.fillStyle = PAL.night; g.fillRect(0, 0, VW, VH);
  if (state.mode !== 'end') {
    for (let r = 0; r < sc.rows.length; r++) for (let c = 0; c < COLS; c++) drawTile(g, sc.rows[r][c], c * TILE, r * TILE, state.time);
    for (const d of sc.decor) drawDecor(g, d);
    const objs = sc.npcs.map(n => ({ y: n.y, draw: () => drawChar(g, n.id, n.x - 6, n.y - 16, 0, n.face < 0) }));
    if (sc.bed) objs.push({ y: sc.bed.y + 31, draw: () => drawBed(g, sc.bed.x, sc.bed.y, state.time) });
    if (state.mode === 'play' || state.mode === 'dialog') objs.push({ y: p.y, draw: () => drawChar(g, 'mara', p.x - 6, p.y - 16, p.frame, p.face < 0) });
    objs.sort((a, b) => a.y - b.y).forEach(o => o.draw());
    drawLights(sc); if (sc.outdoor) drawRain();
    if (state.mode === 'play') { const t = nearestTarget(); if (t) drawPrompt(t.x, t.y); }
  }
  ctx.clearRect(0, 0, cv.width, cv.height); ctx.drawImage(off, 0, 0, VW * S, VH * S);
  UI.draw();
}

// ---------- boot ----------
let last = performance.now();
function frame(now) { const dt = Math.min(50, now - last); last = now; try { update(dt); render(); } catch (err) { console.error(err); } requestAnimationFrame(frame); }
for (const sc of Object.values(SCENES)) for (const n of sc.npcs) n.face0 = n.face;
loadScene('station'); requestAnimationFrame(frame);

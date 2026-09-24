// sprites.js — palette, pixel helpers, characters, tiles.
// Everything is drawn from code: there are no image assets in this game.
const TILE = 16, VW = 320, VH = 180, COLS = 20;

const PAL = {
  night: '#0b0e1a', brick: '#3a3048', brickL: '#4a3f5c',
  floor: '#3c4258', floorL: '#464d66', platform: '#4a5068', yellow: '#d9b44a',
  rail: '#5a5f70', railD: '#1c1f2c', grass: '#1e3a2f', grassL: '#25493a',
  asphalt: '#2b2f3d', asphaltL: '#333848', side: '#4e5468', sideL: '#5a6078',
  puddle: '#3d5a7a', window: '#f2c86b', windowD: '#8a6a2c', door: '#5a3a2a', doorL: '#7a5238',
  lamp: '#c9c9d9', glow: '#ffd98a', hfloor: '#c9cfd6', hfloorL: '#d8dde3', hwall: '#8fa3b0',
  bed: '#e8ecef', bedL: '#f6f8fa', blanket: '#6a8fb5', blanketD: '#557596', wood: '#8a6a4a',
  chair: '#5c6f7a', skin: '#e6b89c'
};

// Humanoid template, 12x16. H hair, S skin, E eye, C coat, A accent, P pants, B boots.
const BODY = [
  [ // standing
    '....HHHH....', '...HHHHHH...', '...HSSSSH...', '...HSESES...', '....SSSS....', '.....SS.....',
    '...CCCCCC...', '..CCAAAACC..', '..CCAAAACC..', '..SCCCCCCS..', '...CCCCCC...', '...PPPPPP...',
    '...PP..PP...', '...PP..PP...', '...BB..BB...', '...BB..BB...'],
  [ // walking
    '....HHHH....', '...HHHHHH...', '...HSSSSH...', '...HSESES...', '....SSSS....', '.....SS.....',
    '...CCCCCC...', '..CCAAAACC..', '.SCCAAAACCS.', '...CCCCCC...', '...CCCCCC...', '...PPPPPP...',
    '..PPP..PPP..', '..PP....PP..', '.BB......BB.', '.BB......BB.']
];

const CHARS = {
  mara:  { name: 'Mara',      col: '#e07a7a', H: '#2b1d1e', S: PAL.skin,  E: '#1a1a1a', C: '#3b3f5c', A: '#c0392b', P: '#2a2a3a', B: '#1a1a1a' },
  hal:   { name: 'Hal',       col: '#9fb3c8', H: '#c9c9c9', S: '#d8a889', E: '#1a1a1a', C: '#2e4a6b', A: '#d9b44a', P: '#26364a', B: '#1a1a1a' },
  lena:  { name: 'Lena',      col: '#f0d060', H: '#5a3a1e', S: PAL.skin,  E: '#1a1a1a', C: '#e8c440', A: '#d4ae2c', P: '#3a3a4a', B: '#2a2a2a' },
  tomas: { name: 'Tomas',     col: '#8fd18f', H: '#2b1d1e', S: PAL.skin,  E: '#1a1a1a', C: '#3f6b4a', A: '#2f5238', P: '#2a2a3a', B: '#1a1a1a' },
  ada:   { name: 'Nurse Ada', col: '#b8e0f0', H: '#1e1e2a', S: '#b98a6a', E: '#1a1a1a', C: '#dfe9f2', A: '#8fb5d0', P: '#dfe9f2', B: '#3a3a3a' },
  ivo:   { name: 'Ivo',       col: '#d0c0b0', H: '#d8d8d8', S: '#d8b8a0', E: '#1a1a1a', C: '#c8d8e8', A: '#c8d8e8', P: '#c8d8e8', B: '#c8d8e8' },
  narr:  { name: '',          col: '#c9c9d9' }
};

function drawChar(ctx, key, x, y, frame = 0, flip = false) {
  const c = CHARS[key], rows = BODY[frame];
  ctx.save();
  if (flip) { ctx.translate(x + 12, y); ctx.scale(-1, 1); } else ctx.translate(x, y);
  for (let r = 0; r < rows.length; r++) for (let i = 0; i < 12; i++) {
    const ch = rows[r][i]; if (ch === '.') continue;
    ctx.fillStyle = c[ch]; ctx.fillRect(i, r, 1, 1);
  }
  ctx.restore();
}

// Deterministic per-tile noise so surfaces vary without flickering.
function tn(x, y, m) { let n = (x * 374761393 + y * 668265263) ^ (x * 1274126177); n = (n ^ (n >>> 13)) >>> 0; return n % m; }

function drawTile(ctx, ch, x, y, time) {
  const R = (c, dx, dy, w, h) => { ctx.fillStyle = c; ctx.fillRect(x + dx, y + dy, w, h); };
  switch (ch) {
    case '#': R(PAL.brick, 0, 0, 16, 16);
      for (let r = 0; r < 4; r++) { const off = (r % 2) * 4; for (let c = -1; c < 3; c++) R(tn(x + c, y + r, 3) ? PAL.brickL : PAL.brick, off + c * 8 + 1, r * 4 + 1, 6, 2); }
      break;
    case 'W': R(PAL.brick, 0, 0, 16, 16); R(PAL.windowD, 3, 2, 10, 11); R(PAL.window, 4, 3, 8, 9); R(PAL.windowD, 8, 3, 1, 9); R(PAL.windowD, 4, 7, 8, 1); break;
    case 'D': R(PAL.brick, 0, 0, 16, 16); R(PAL.door, 2, 1, 12, 15); R(PAL.doorL, 3, 2, 10, 13); R(PAL.door, 8, 2, 1, 13); R(PAL.yellow, 10, 8, 1, 1); break;
    case '.': R(PAL.floor, 0, 0, 16, 16); R(PAL.floorL, 0, 0, 16, 1); R(PAL.floorL, 0, 0, 1, 16); if (tn(x, y, 5) === 0) R(PAL.floorL, 6, 9, 3, 1); break;
    case 'p': R(PAL.floor, 0, 0, 16, 16); R(PAL.yellow, 0, 6, 16, 2); R(PAL.platform, 0, 13, 16, 3); break;
    case 'r': R(PAL.railD, 0, 0, 16, 16); R(PAL.wood, 2, 1, 3, 14); R(PAL.wood, 10, 1, 3, 14); R(PAL.rail, 0, 3, 16, 2); R(PAL.rail, 0, 11, 16, 2); break;
    case 'g': R(PAL.grass, 0, 0, 16, 16); for (let i = 0; i < 4; i++) R(PAL.grassL, tn(x + i, y, 14), tn(x, y + i, 14), 1, 2); break;
    case 'B': R(PAL.floor, 0, 0, 16, 16); R(PAL.floorL, 0, 0, 16, 1); R(PAL.wood, 1, 4, 14, 3); R(PAL.wood, 1, 9, 14, 3); R(PAL.railD, 2, 12, 2, 4); R(PAL.railD, 12, 12, 2, 4); break;
    case 's': R(PAL.side, 0, 0, 16, 16); R(PAL.sideL, 0, 0, 16, 1); R(PAL.sideL, 0, 0, 1, 16); if (tn(x, y, 4) === 0) R(PAL.sideL, 5, 10, 4, 1); break;
    case 'a': R(PAL.asphalt, 0, 0, 16, 16); if (tn(x, y, 3) === 0) R(PAL.asphaltL, tn(x, y, 12), tn(y, x, 12), 2, 1); break;
    case 'u': R(PAL.asphalt, 0, 0, 16, 16); R(PAL.puddle, 2, 4, 12, 8); R('#5a7ea3', 4, 6, 8, 4); if (Math.floor(time / 400) % 2) R('#7aa0c8', 6, 7, 3, 1); break;
    case 'l': R(PAL.side, 0, 0, 16, 16); R(PAL.sideL, 0, 0, 16, 1); R(PAL.railD, 7, 0, 2, 16); R(PAL.lamp, 5, 0, 6, 3); R(PAL.glow, 6, 1, 4, 2); break;
    case 'h': R(PAL.hfloor, 0, 0, 16, 16); R(PAL.hfloorL, 0, 0, 16, 1); R(PAL.hfloorL, 0, 0, 1, 16); if ((x / 16 + y / 16) % 2 === 0) R('#bfc6ce', 1, 1, 15, 15); break;
    case 'H': R(PAL.hwall, 0, 0, 16, 16); R('#7f939f', 0, 10, 16, 1); R('#a3b5c0', 0, 0, 16, 1); break;
    case 'c': R(PAL.hfloor, 0, 0, 16, 16); R(PAL.chair, 3, 2, 10, 6); R(PAL.chair, 3, 8, 10, 4); R(PAL.railD, 4, 12, 2, 4); R(PAL.railD, 10, 12, 2, 4); break;
    case 't': R(PAL.hfloor, 0, 0, 16, 16); R(PAL.wood, 2, 6, 12, 10); R('#a07c58', 3, 7, 10, 3); R(PAL.lamp, 6, 1, 4, 5); R(PAL.glow, 7, 2, 2, 3); break;
    case 'b': R(PAL.hfloor, 0, 0, 16, 16); break; // the bed itself is an object
    default: R(PAL.night, 0, 0, 16, 16);
  }
}

// Ivo in his hospital bed. 32x32, top-left at (x, y). He breathes and blinks.
function drawBed(ctx, x, y, time) {
  const R = (c, dx, dy, w, h) => { ctx.fillStyle = c; ctx.fillRect(x + dx, y + dy, w, h); };
  R(PAL.railD, 1, 2, 30, 29); R(PAL.bed, 2, 3, 28, 27); R(PAL.bedL, 4, 4, 24, 8);
  R(PAL.blanket, 2, 13, 28, 17); R(PAL.blanketD, 2, 13, 28, 1); R(PAL.blanketD, 6, 20, 20, 1);
  R('#d8d8d8', 12, 4, 8, 3); R('#d8b8a0', 12, 6, 8, 7);
  const blink = Math.floor(time / 2400) % 5 === 0;
  R('#1a1a1a', 13, 9, 2, blink ? 1 : 2); R('#1a1a1a', 17, 9, 2, blink ? 1 : 2);
  R(PAL.blanketD, 8, 15 + (Math.floor(time / 900) % 2), 16, 1);
}

// Street decor: pharmacy cross and hospital sign.
function drawDecor(ctx, d) {
  const R = (c, dx, dy, w, h) => { ctx.fillStyle = c; ctx.fillRect(d.x + dx, d.y + dy, w, h); };
  if (d.type === 'cross') { R('#1f8a4c', 0, 0, 9, 9); R('#7dffb0', 3, 1, 3, 7); R('#7dffb0', 1, 3, 7, 3); }
  if (d.type === 'hsign') { R('#1c4f8a', 0, 0, 13, 11); R('#eaf4ff', 2, 2, 2, 7); R('#eaf4ff', 9, 2, 2, 7); R('#eaf4ff', 4, 4, 5, 2); }
}

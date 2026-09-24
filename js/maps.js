// maps.js — the three places Mara walks through tonight.
// Legend: # brick  W window  D door  . station floor  p platform edge  r rails  g field  B bench
//         s sidewalk  a asphalt  u puddle  l lamp post  h hospital floor  H hospital wall  c chair  t cabinet  b bed
const SOLID = new Set('#WDrgBlHctb'.split(''));

const SCENES = {
  station: {
    label: 'EMBER LANE STATION  ·  2:41 AM', outdoor: true,
    rows: [
      '####W###D###W###W###',
      '....................',
      '..B.......B.........',
      '....................',
      '....................',
      'pppppppppppppppppppp',
      'rrrrrrrrrrrrrrrrrrrr',
      'rrrrrrrrrrrrrrrrrrrr',
      'gggggggggggggggggggg',
      'gggggggggggggggggggg',
      'gggggggggggggggggggg'],
    spawn: { x: 24, y: 64, face: 1 },
    npcs: [{ id: 'hal', x: 104, y: 30, face: -1, talk: s => s.flags.metHal ? 'hal_again' : 'hal_1' }],
    hotspots: [
      { id: 'bench', x: 160, y: 32, w: 16, h: 16, talk: s => s.flags.satBench ? 'bench_after' : (s.flags.knowsBench ? 'bench_1' : 'bench_plain') },
      { id: 'bench2', x: 32, y: 32, w: 16, h: 16, talk: () => 'bench_other' }],
    exits: [{ x: 314, y: 16, w: 8, h: 64, to: 'street', spawn: { x: 12, y: 40, face: 1 } }],
    lamps: [{ x: 72, y: 8, r: 38 }, { x: 136, y: 8, r: 38 }, { x: 200, y: 8, r: 38 }, { x: 264, y: 8, r: 38 }],
    decor: []
  },
  street: {
    label: 'EMBER LANE  ·  2:58 AM', outdoor: true,
    rows: [
      '##WD#W###W#D#WHHHDHH',
      'ssssssssssssssssssss',
      'ssssssssssssssssssss',
      'aaaaaaaaaaaaaaaaaaaa',
      'aauaaaaaaaaaaauaaaaa',
      'aaaaaaaaaaaaaaaaaaaa',
      'ssssssssssssssssssss',
      'ssslsssssslsssssssls',
      '####################',
      'gggggggggggggggggggg',
      'gggggggggggggggggggg'],
    spawn: { x: 12, y: 40, face: 1 },
    npcs: [
      { id: 'lena', x: 62, y: 46, face: 1, talk: s => s.flags.metLena ? 'lena_again' : 'lena_1' },
      { id: 'tomas', x: 256, y: 46, face: -1, talk: s => s.flags.metTomas ? 'tomas_again' : 'tomas_1' }],
    hotspots: [],
    exits: [
      { x: 0, y: 16, w: 6, h: 112, to: 'station', spawn: { x: 304, y: 48, face: -1 } },
      { x: 266, y: 16, w: 28, h: 8, to: 'hospital', spawn: { x: 14, y: 40, face: 1 } }],
    lamps: [{ x: 56, y: 113, r: 42 }, { x: 168, y: 113, r: 42 }, { x: 296, y: 113, r: 42 }, { x: 280, y: 6, r: 40, c: '191,227,255' }],
    decor: [{ type: 'cross', x: 36, y: 3 }, { type: 'hsign', x: 242, y: 2 }]
  },
  hospital: {
    label: 'ST. BRIDGET\'S  ·  ROOM FOUR  ·  3:12 AM', outdoor: false,
    rows: [
      'HHHHHHHHHHHHHHHHHHHH',
      'hhhhhhhhhhhhhhhhhhhH',
      'hhhhhhhhhhhhhhhhhhhH',
      'hhhhhhhhhhhhhhhhhhhH',
      'HHHHHHHHHhhHHHHHHHHH',
      'HhhhhhhhhhhhhhhhhhhH',
      'HhhhhhhhhhhhhhhhhhhH',
      'HhhhhhhhhhhhhhhhbbtH',
      'HchhhhhhhhhhhhhhbbhH',
      'HhhhhhhhhhhhhhhhhhhH',
      'HHHHHHHHHHHHHHHHHHHH'],
    spawn: { x: 14, y: 40, face: 1 },
    npcs: [{ id: 'ada', x: 150, y: 44, face: -1, talk: s => s.flags.metAda ? 'ada_again' : 'ada_1' }],
    hotspots: [{ id: 'ivo', x: 256, y: 112, w: 32, h: 32, talk: s => s.flags.metIvo ? 'ivo_again' : 'ivo_1' }],
    exits: [{ x: 0, y: 16, w: 6, h: 48, to: 'street', spawn: { x: 280, y: 30, face: -1 } }],
    lamps: [{ x: 296, y: 116, r: 44 }, { x: 160, y: 20, r: 60, c: '200,225,255' }], decor: [], bed: { x: 256, y: 112 }
  }
};

// Guard against a typo in the maps above: every row must be exactly COLS wide.
for (const [name, sc] of Object.entries(SCENES)) sc.rows.forEach((r, i) => { if (r.length !== COLS) console.warn(`map ${name} row ${i} is ${r.length} wide`); });

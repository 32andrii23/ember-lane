// story.js — dialogue for one long night.
// "Warmth" is the quiet score: how much of herself Mara lets show. It is never displayed until the end.
// Node: { who, set, lines: [ 'text' | {who, t, if, unless} ], choices: [{ t, w, set, next, if }], next, ending }

const INTRO = [
  "Eight years ago, Mara Voss left Ember Lane on the 11:40 and swore she would never come back.",
  "Tonight her brother called. He said three words: 'Dad. Hospital. Come.'",
  "The last train out leaves at 4:10. Whether she's on it is up to you."
];

const STORY = {
  // ---- STATION: Hal, the night station keeper ----
  hal_1: { who: 'hal', set: 'metHal', lines: [
      "Platform's closed after midnight, miss. Last train isn't till—",
      "...Mara? Mara Voss?",
      "Well, I'll be. You've got his jaw. Always did." ],
    choices: [
      { t: "Hello, Hal. It's been a while.", w: 1, set: 'knowsBench', next: 'hal_warm' },
      { t: "I'm just passing through.", w: 0, next: 'hal_flat' },
      { t: "Don't tell anyone I'm here.", w: -1, next: 'hal_cold' } ] },
  hal_warm: { who: 'hal', lines: [
      "Eight years, near enough.",
      "He came here every Sunday, you know. Sat on that bench. Said he was 'watching the trains.'",
      "Nobody watches the trains, Mara. Not for eight years." ], next: 'hal_close' },
  hal_flat: { who: 'hal', lines: [
      "Sure you are. Sure.",
      "Hospital's at the end of the lane. Past the pharmacy. Same as it ever was." ], next: 'hal_close' },
  hal_cold: { who: 'hal', lines: [
      "Who would I tell? Half this town's asleep and the other half's forgotten.",
      "...Go on, then. He's at the end of the lane." ], next: 'hal_close' },
  hal_close: { who: 'hal', lines: [ "Last train out is the 4:10. I'll hold the door if I see you running." ] },
  hal_again: { who: 'hal', lines: [ "4:10, Mara. Don't make me hold that door for nothing." ] },

  bench_other: { who: 'narr', lines: [ "Just a bench. Nobody ever sat here long enough to leave a mark." ] },
  bench_plain: { who: 'narr', lines: [ "A station bench. The wood is worn smooth on one side, as if someone sat here a great deal." ] },
  bench_1: { who: 'narr', lines: [ "The bench Hal meant. One side is worn pale and smooth. The other side looks like it was saving a place." ],
    choices: [
      { t: "Sit for a moment.", w: 1, set: 'satBench', next: 'bench_sit' },
      { t: "Keep walking.", w: 0, next: 'bench_walk' } ] },
  bench_sit: { who: 'narr', lines: [
      "You sit on the worn side. The rain sounds different from here. Like it's waiting for something too.",
      "From this spot you can see the whole platform, and every door of every train." ] },
  bench_walk: { who: 'narr', lines: [ "You don't sit. You don't have time to sit. You tell yourself that twice." ] },
  bench_after: { who: 'narr', lines: [ "You already sat here. It didn't help. It didn't hurt, either." ] },

  // ---- STREET: Lena at the pharmacy, Tomas at the hospital door ----
  lena_1: { who: 'lena', set: 'metLena', lines: [
      "Holy— Mara? You look like a ghost. A wet ghost.",
      "Tomas said he called you. I told him you wouldn't come. Guess I owe him twenty." ],
    choices: [
      { t: "Still working nights at the pharmacy?", w: 1, set: 'knowsPostcards', next: 'lena_warm' },
      { t: "How bad is it?", w: 0, next: 'lena_flat' },
      { t: "I didn't come for a reunion, Lena.", w: -1, next: 'lena_cold' } ] },
  lena_warm: { who: 'lena', lines: [
      "Someone has to. Your dad came in every Thursday. Blood pressure pills, and— I swear this is true— a postcard.",
      "Every Thursday. Never sent one. Just bought them. I stopped asking who they were for." ], next: 'lena_close' },
  lena_flat: { who: 'lena', lines: [
      "Bad. Stroke, Tuesday night. He can talk, a little. Slow.",
      "He keeps asking what time it is. Tomas thinks he's asking about the trains." ], next: 'lena_close' },
  lena_cold: { who: 'lena', lines: [
      "No. You came because you couldn't not. Same reason you left.",
      "...Go. Before you talk yourself out of it. You were always good at that." ], next: 'lena_close' },
  lena_close: { who: 'lena', lines: [
      "Whatever he said that night, Mara— he's had eight years to be sorry.",
      "He spent most of them being it." ] },
  lena_again: { who: 'lena', lines: [ "End of the lane. Big door, blue light. You can't miss it. Believe me, I've tried." ] },

  tomas_1: { who: 'tomas', set: 'metTomas', lines: [ "You came.", "...I didn't think you'd come." ],
    choices: [
      { t: "You called. I came.", w: 1, next: 'tomas_warm' },
      { t: "How long has he got?", w: 0, next: 'tomas_flat' },
      { t: "Why did you wait until now to call?", w: -1, next: 'tomas_cold' } ] },
  tomas_warm: { who: 'tomas', lines: [
      "...Yeah. Okay. Yeah.",
      "He's in the room at the end. Just— don't make it about that night, okay? He can't argue back anymore. It isn't fair to either of you." ], next: 'tomas_close' },
  tomas_flat: { who: 'tomas', lines: [
      "Days. Maybe. The doctor says 'we'll see' a lot, like it's a diagnosis.",
      "He's in the room at the end. Past the nurse." ], next: 'tomas_close' },
  tomas_cold: { who: 'tomas', lines: [
      "Because every time I said your name he left the room! Because I didn't want you coming home to another—",
      "...Sorry. Sorry. I haven't slept. He's in the room at the end." ], next: 'tomas_close' },
  tomas_close: { who: 'tomas', lines: [ "I'll be out here. I can't watch it again tonight. Don't ask me to." ] },
  tomas_again: { who: 'tomas', lines: [ "I'm still here. Go on. He's waiting. He'd never say so, but he is." ] },

  // ---- HOSPITAL: Nurse Ada, then Ivo ----
  ada_1: { who: 'ada', set: 'metAda', lines: [
      "Visiting hours ended at eight. ...You're the daughter.",
      "Through the gap, the bed by the cabinet. He's awake. He asked me the time again.",
      "I said 'late.' He said 'not yet.'" ] },
  ada_again: { who: 'ada', lines: [ "Go on. I'll pretend I didn't see you. I'm good at that; it's most of the job." ] },

  ivo_1: { who: 'narr', set: 'metIvo', lines: [
      "He's smaller than you remember. Everything in the room hums.",
      { who: 'ivo', t: "...Tomas? Is that— no." },
      { who: 'ivo', t: "Mara." },
      { who: 'ivo', t: "What time is it?" } ],
    choices: [
      { t: "It's late, Dad. I'm here.", w: 2, next: 'ivo_2' },
      { t: "Almost three.", w: 0, next: 'ivo_2' },
      { t: "Does it matter?", w: -1, next: 'ivo_2' } ] },
  ivo_2: { who: 'ivo', lines: [
      "The 4:10. You'll miss it.",
      { if: 'satBench', t: "I sat on that bench. Every Sunday. In case. Hal thinks I don't know that he knows." },
      "I said things. That night. I had eight years to take them back, and I—",
      { if: 'knowsPostcards', t: "I bought postcards. Lena told you. Of course she did." },
      { unless: 'knowsPostcards', t: "I bought postcards. Forty-one of them. Couldn't think what to write that wasn't 'sorry', and 'sorry' looked so small on a card." },
      "So. It's late. What are you going to do, Mara?" ],
    choices: [
      { t: "I'm staying till morning.", next: 'end_stay' },
      { t: "I can't do this. I have a train.", next: 'end_train' },
      { t: "You don't get to be sorry now.", if: 'coldEnough', next: 'end_train_hard' } ] },
  ivo_again: { who: 'ivo', lines: [ "Still here. Good. ...Or not good. I never knew which, with you." ] },

  end_stay: { ending: 'byWarmth' },
  end_train: { ending: 'train' },
  end_train_hard: { ending: 'train', hard: true }
};

const ENDINGS = {
  ember: { title: 'EMBER', cards: [
    "She stayed. At 4:10 the last train pulled out of Ember Lane, and she didn't hear it go.",
    "He said her name twice more before dawn. The second time, she said 'Dad.' Neither of them said anything after that. They didn't need to.",
    "In spring, Hal noticed the bench was empty on Sundays. He decided that was a good thing." ] },
  rain: { title: 'RAIN', cards: [
    "She stayed until the shift changed at dawn. They didn't say much. The rain did most of the talking.",
    "On the 6:15 she wrote a postcard she actually sent. It said: 'Next time, don't wait for a stroke. — M.'",
    "Tomas read it to him. He laughed, a little. It cost him something, and he did it anyway." ] },
  train: { title: 'THE 4:10', cards: [
    "At 4:10, Hal held the door. She got on. She didn't look back, which took everything she had.",
    "In his coat pocket, Tomas found forty-one postcards. All addressed to the same name. None of them stamped.",
    "The bench at Ember Lane is still worn smooth on one side." ],
    hardCards: [
    "She said it, and it was true, and it didn't help. At 4:10, Hal held the door. She got on.",
    "In his coat pocket, Tomas found forty-one postcards. All addressed to the same name. None of them stamped.",
    "Some things are said eight years too late. Some things are said eight years too early. She never worked out which this was." ] }
};

/**
 * The home screen's title theme, generated live with Web Audio (no audio
 * files): slow pad chords in A minor, a low sea wind, and the odd
 * music-box note with a soft echo. Quiet, calm, made to sit under the
 * seaside scene, by day or by night.
 *
 * Browsers only allow audio after a key press or tap, so start() must be
 * called from one (the boot screen's "Press start", or the sound toggle).
 */

const CHORDS = [
  [110, 164.81, 261.63, 392], // Am7
  [87.31, 130.81, 220, 329.63], // Fmaj7
  [130.81, 196, 329.63, 392], // C
  [82.41, 123.47, 246.94, 293.66], // Em7
];
const BELLS = [880, 1046.5, 1174.66, 1318.51, 1567.98, 1760];
const CHORD_SECONDS = 8;

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let echo: GainNode | null = null;
let timers: number[] = [];
let playing = false;

export const isPlaying = () => playing;

/**
 * The theme plays on the menu layer only: the main menu and the save-file
 * screen. It carries on between those two, and fades out when you load
 * into anything else (a section, the resume, the journal, contact).
 */
export function isMenuPath(path: string) {
    const p = path.replace(/\/+$/, "") || "/";
    return p === "/" || p === "/portfolio";
}

function pad(at: number, freqs: number[]) {
  if (!ctx || !master) return;
  const filter = ctx.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.value = 900;
  const g = ctx.createGain();
  g.gain.setValueAtTime(0, at);
  g.gain.linearRampToValueAtTime(0.11, at + 3);
  g.gain.setValueAtTime(0.11, at + CHORD_SECONDS - 1);
  g.gain.linearRampToValueAtTime(0, at + CHORD_SECONDS + 3);
  filter.connect(g).connect(master);
  for (const f of freqs) {
    for (const detune of [-6, 6]) {
      const o = ctx.createOscillator();
      o.type = "triangle";
      o.frequency.value = f;
      o.detune.value = detune;
      const og = ctx.createGain();
      og.gain.value = 0.18;
      o.connect(og).connect(filter);
      o.start(at);
      o.stop(at + CHORD_SECONDS + 3.2);
    }
  }
}

/** One music-box note. Also used when the scene is poked. */
export function bell(freq?: number, vol = 0.05) {
  if (!ctx || !echo || !playing) return;
  const f = freq ?? BELLS[Math.floor(Math.random() * BELLS.length)];
  const at = ctx.currentTime + 0.01;
  const o = ctx.createOscillator();
  o.type = "sine";
  o.frequency.value = f;
  const g = ctx.createGain();
  g.gain.setValueAtTime(0, at);
  g.gain.linearRampToValueAtTime(vol, at + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0001, at + 2.4);
  o.connect(g);
  g.connect(echo);
  g.connect(master!);
  o.start(at);
  o.stop(at + 2.5);
}

function sea() {
  if (!ctx || !master) return;
  const len = ctx.sampleRate * 4;
  const buf = ctx.createBuffer(1, len, ctx.sampleRate);
  const data = buf.getChannelData(0);
  let last = 0;
  for (let i = 0; i < len; i++) {
    // Brown-ish noise: softer than white noise, more like distant surf.
    last = (last + 0.02 * (Math.random() * 2 - 1)) / 1.02;
    data[i] = last * 3.5;
  }
  const src = ctx.createBufferSource();
  src.buffer = buf;
  src.loop = true;
  const filter = ctx.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.value = 600;
  const g = ctx.createGain();
  g.gain.value = 0.05;
  // Waves: the volume swells and falls every ~9 seconds.
  const lfo = ctx.createOscillator();
  lfo.frequency.value = 0.11;
  const depth = ctx.createGain();
  depth.gain.value = 0.035;
  lfo.connect(depth).connect(g.gain);
  src.connect(filter).connect(g).connect(master);
  src.start();
  lfo.start();
}

export function start() {
  if (playing) return;
  try {
    ctx = new AudioContext();
  } catch {
    return;
  }
  playing = true;
  master = ctx.createGain();
  master.gain.setValueAtTime(0, ctx.currentTime);
  master.gain.linearRampToValueAtTime(0.5, ctx.currentTime + 4);
  master.connect(ctx.destination);

  // A soft echo for the bells.
  echo = ctx.createGain();
  echo.gain.value = 0.5;
  const delay = ctx.createDelay();
  delay.delayTime.value = 0.38;
  const fb = ctx.createGain();
  fb.gain.value = 0.35;
  echo.connect(delay);
  delay.connect(fb).connect(delay);
  delay.connect(master);

  sea();
  let i = 0;
  const next = () => {
    if (!ctx) return;
    pad(ctx.currentTime + 0.05, CHORDS[i % CHORDS.length]);
    i++;
  };
  next();
  timers.push(window.setInterval(next, CHORD_SECONDS * 1000));
  const bells = () => {
    bell();
    timers.push(window.setTimeout(bells, 2500 + Math.random() * 4500));
  };
  timers.push(window.setTimeout(bells, 3000));
}

export function stop() {
  if (!playing || !ctx || !master) return;
  playing = false;
  timers.forEach(t => {
    window.clearInterval(t);
    window.clearTimeout(t);
  });
  timers = [];
  const c = ctx;
  master.gain.cancelScheduledValues(c.currentTime);
  master.gain.setValueAtTime(master.gain.value, c.currentTime);
  master.gain.linearRampToValueAtTime(0, c.currentTime + 0.8);
  window.setTimeout(() => c.close().catch(() => {}), 900);
  ctx = null;
  master = null;
  echo = null;
}

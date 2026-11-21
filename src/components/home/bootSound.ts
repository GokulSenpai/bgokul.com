/**
 * The boot jingle: bgokul's "console startup" sound, synced to the boot
 * screen's animation. Generated live with Web Audio (no files).
 *
 * It uses the same voice as the home screen's theme (titleMusic.ts), so
 * the two feel like one piece: A minor, soft sine music-box bells with
 * the same 0.38s echo, and warm low-passed triangle pads.
 *
 *   0.00s  power on: a soft low swell and a hush, like the sea
 *   0.80s  the pixel G builds: one bell per block, rising (A minor pentatonic)
 *   1.65s  the signature: A, E, D, then A up high, over an A minor 9 pad,
 *          the last note ringing out as the shine crosses "bgokul"
 *   4.10s  "save files found": two quiet bells
 *
 * Must be started from a key press or tap (or after one), as browsers
 * block sound before that. sfx() is the same bell, for the menu's sounds.
 */

let ctx: AudioContext | null = null;

type Voice = { c: AudioContext; out: AudioNode };

// The shared chain: dry + a 0.38s echo (as in the theme) + a soft hall.
function chain(c: AudioContext, volume: number): AudioNode {
  const master = c.createGain();
  master.gain.value = volume;
  master.connect(c.destination);

  const bus = c.createGain();
  bus.connect(master);

  const echo = c.createDelay();
  echo.delayTime.value = 0.38;
  const fb = c.createGain();
  fb.gain.value = 0.35;
  const echoIn = c.createGain();
  echoIn.gain.value = 0.5;
  bus.connect(echoIn).connect(echo);
  echo.connect(fb).connect(echo);
  echo.connect(master);

  const len = Math.floor(c.sampleRate * 2.6);
  const buf = c.createBuffer(2, len, c.sampleRate);
  for (let ch = 0; ch < 2; ch++) {
    const d = buf.getChannelData(ch);
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 3);
  }
  const hall = c.createConvolver();
  hall.buffer = buf;
  const hallGain = c.createGain();
  hallGain.gain.value = 0.35;
  bus.connect(hall).connect(hallGain).connect(master);
  return bus;
}

// The theme's music-box bell: a pure sine, quick attack, long fade.
function bell({ c, out }: Voice, f: number, at: number, vol: number, decay = 2.4) {
  const o = c.createOscillator();
  const g = c.createGain();
  o.type = "sine";
  o.frequency.value = f;
  g.gain.setValueAtTime(0, at);
  g.gain.linearRampToValueAtTime(vol, at + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0001, at + decay);
  o.connect(g).connect(out);
  o.start(at);
  o.stop(at + decay + 0.05);
}

// The theme's pad: detuned triangles through a 900 Hz lowpass.
function pad({ c, out }: Voice, freqs: number[], at: number, hold: number, vol: number) {
  const lp = c.createBiquadFilter();
  lp.type = "lowpass";
  lp.frequency.value = 900;
  const g = c.createGain();
  g.gain.setValueAtTime(0, at);
  g.gain.linearRampToValueAtTime(vol, at + 0.6);
  g.gain.setValueAtTime(vol, at + hold);
  g.gain.linearRampToValueAtTime(0, at + hold + 3);
  lp.connect(g).connect(out);
  for (const f of freqs) {
    for (const det of [-6, 6]) {
      const o = c.createOscillator();
      o.type = "triangle";
      o.frequency.value = f;
      o.detune.value = det;
      const og = c.createGain();
      og.gain.value = 0.18;
      o.connect(og).connect(lp);
      o.start(at);
      o.stop(at + hold + 3.1);
    }
  }
}

export function playBootSound(blocks = 15) {
  try {
    ctx?.close();
    ctx = new AudioContext();
  } catch {
    return;
  }
  const c = ctx;
  if (c.state === "suspended") c.resume().catch(() => {});
  const v: Voice = { c, out: chain(c, 0.6) };
  const t0 = c.currentTime + 0.05;

  // 1. Power on: a soft low A swelling up, and a hush of filtered noise.
  pad(v, [55, 110], t0, 0.6, 0.35);
  const nlen = Math.floor(c.sampleRate * 1.2);
  const nbuf = c.createBuffer(1, nlen, c.sampleRate);
  const nd = nbuf.getChannelData(0);
  let last = 0;
  for (let i = 0; i < nlen; i++) {
    last = (last + 0.02 * (Math.random() * 2 - 1)) / 1.02;
    nd[i] = last * 3.5;
  }
  const noise = c.createBufferSource();
  noise.buffer = nbuf;
  const lp = c.createBiquadFilter();
  lp.type = "lowpass";
  lp.frequency.setValueAtTime(300, t0);
  lp.frequency.exponentialRampToValueAtTime(1800, t0 + 0.6);
  const ng = c.createGain();
  ng.gain.setValueAtTime(0, t0);
  ng.gain.linearRampToValueAtTime(0.25, t0 + 0.35);
  ng.gain.linearRampToValueAtTime(0, t0 + 1.1);
  noise.connect(lp).connect(ng).connect(v.out);
  noise.start(t0);

  // 2. The G builds: A minor pentatonic rising, one soft bell per block.
  const scale = [440, 523.25, 587.33, 659.25, 783.99];
  for (let i = 0; i < blocks; i++) {
    const f = scale[i % 5] * Math.pow(2, Math.floor(i / 5) - 1);
    bell(v, f * 2, t0 + 0.8 + i * 0.045 + 0.12, 0.035, 0.9);
  }

  // 3. The signature: A, E, D, then A an octave up, over A minor 9.
  const sig = t0 + 1.65;
  pad(v, [110, 164.81, 196, 246.94, 261.63], sig - 0.1, 1.8, 0.4);
  const motif: [number, number][] = [
    [880, 0],
    [1318.51, 0.22],
    [1174.66, 0.44],
    [1760, 0.74],
  ];
  for (const [f, dt] of motif) bell(v, f, sig + dt, dt === 0.74 ? 0.11 : 0.09, dt === 0.74 ? 4.5 : 2.4);
  bell(v, 880, sig + 0.74, 0.06, 4.5); // the last note, doubled an octave down

  // 4. "Save files found": two quiet bells.
  bell(v, 1318.51, t0 + 4.1, 0.04, 1.4);
  bell(v, 1760, t0 + 4.22, 0.04, 2);

  window.setTimeout(() => {
    if (ctx === c) {
      c.close().catch(() => {});
      ctx = null;
    }
  }, 10000);
}

/**
 * "Item obtained": a short, bright fanfare in the same music-box voice, for
 * the business card on Contact. A quick rising run (A major, so it sounds
 * like a reward), then a held A with its fifth ringing out.
 */
export function itemGet() {
  try {
    const c = new AudioContext();
    if (c.state === "suspended") c.resume().catch(() => {});
    const v: Voice = { c, out: chain(c, 0.55) };
    const t0 = c.currentTime + 0.03;
    const run = [880, 1108.73, 1318.51, 1760]; // A C# E A
    run.forEach((f, i) => bell(v, f, t0 + i * 0.085, 0.06, 1.2));
    bell(v, 1760, t0 + 0.42, 0.07, 2.6);
    bell(v, 1318.51, t0 + 0.42, 0.045, 2.6);
    bell(v, 880, t0 + 0.42, 0.04, 2.6);
    window.setTimeout(() => c.close().catch(() => {}), 4000);
  } catch {}
}

/**
 * A page turning: a soft swish of paper (filtered noise sweeping up, then
 * settling) with a faint low flap. For the Narrative book.
 */
export function pageTurn() {
  try {
    const c = new AudioContext();
    if (c.state === "suspended") c.resume().catch(() => {});
    const t0 = c.currentTime + 0.02;
    const len = Math.floor(c.sampleRate * 0.5);
    const buf = c.createBuffer(1, len, c.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    const src = c.createBufferSource();
    src.buffer = buf;
    const bp = c.createBiquadFilter();
    bp.type = "bandpass";
    bp.Q.value = 0.8;
    bp.frequency.setValueAtTime(900, t0);
    bp.frequency.exponentialRampToValueAtTime(3800, t0 + 0.18);
    bp.frequency.exponentialRampToValueAtTime(1500, t0 + 0.42);
    const g = c.createGain();
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(0.09, t0 + 0.06);
    g.gain.exponentialRampToValueAtTime(0.025, t0 + 0.25);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.45);
    src.connect(bp).connect(g).connect(c.destination);
    src.start(t0);
    // The flap as the page lands.
    const o = c.createOscillator();
    const og = c.createGain();
    o.frequency.setValueAtTime(120, t0 + 0.3);
    o.frequency.exponentialRampToValueAtTime(70, t0 + 0.42);
    og.gain.setValueAtTime(0.0001, t0 + 0.3);
    og.gain.exponentialRampToValueAtTime(0.06, t0 + 0.32);
    og.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.45);
    o.connect(og).connect(c.destination);
    o.start(t0 + 0.3);
    o.stop(t0 + 0.5);
    window.setTimeout(() => c.close().catch(() => {}), 900);
  } catch {}
}

// A burst of white noise, for the paper and air sounds below.
function noise(c: AudioContext, seconds: number) {
  const len = Math.floor(c.sampleRate * seconds);
  const buf = c.createBuffer(1, len, c.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
  const src = c.createBufferSource();
  src.buffer = buf;
  return src;
}

// The book closing: pageTurn in reverse. A paper swish that falls in
// pitch as the page swings up, then a soft clap as the covers meet.
export function bookClose() {
  try {
    const c = new AudioContext();
    if (c.state === "suspended") c.resume().catch(() => {});
    const t0 = c.currentTime + 0.02;
    const src = noise(c, 0.4);
    const bp = c.createBiquadFilter();
    bp.type = "bandpass";
    bp.Q.value = 0.8;
    bp.frequency.setValueAtTime(3200, t0);
    bp.frequency.exponentialRampToValueAtTime(900, t0 + 0.26);
    const g = c.createGain();
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(0.1, t0 + 0.05);
    g.gain.exponentialRampToValueAtTime(0.02, t0 + 0.22);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.3);
    src.connect(bp).connect(g).connect(c.destination);
    src.start(t0);
    // The clap: a short low thump plus a tick of noise.
    const at = t0 + 0.24;
    const o = c.createOscillator();
    const og = c.createGain();
    o.frequency.setValueAtTime(150, at);
    o.frequency.exponentialRampToValueAtTime(60, at + 0.12);
    og.gain.setValueAtTime(0.0001, at);
    og.gain.exponentialRampToValueAtTime(0.1, at + 0.01);
    og.gain.exponentialRampToValueAtTime(0.0001, at + 0.16);
    o.connect(og).connect(c.destination);
    o.start(at);
    o.stop(at + 0.2);
    const tick = noise(c, 0.06);
    const lp = c.createBiquadFilter();
    lp.type = "lowpass";
    lp.frequency.value = 1800;
    const tg = c.createGain();
    tg.gain.setValueAtTime(0.06, at);
    tg.gain.exponentialRampToValueAtTime(0.0001, at + 0.05);
    tick.connect(lp).connect(tg).connect(c.destination);
    tick.start(at);
    window.setTimeout(() => c.close().catch(() => {}), 900);
  } catch {}
}

// Diving into a chapter: a soft whoosh of air that rises and swells as
// the book rushes toward you, then cuts as the screen goes black.
export function whoosh() {
  try {
    const c = new AudioContext();
    if (c.state === "suspended") c.resume().catch(() => {});
    const t0 = c.currentTime + 0.02;
    const src = noise(c, 0.6);
    const bp = c.createBiquadFilter();
    bp.type = "bandpass";
    bp.Q.value = 0.9;
    bp.frequency.setValueAtTime(280, t0);
    bp.frequency.exponentialRampToValueAtTime(1500, t0 + 0.38);
    const g = c.createGain();
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(0.11, t0 + 0.32);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.5);
    src.connect(bp).connect(g).connect(c.destination);
    src.start(t0);
    window.setTimeout(() => c.close().catch(() => {}), 900);
  } catch {}
}

// A jumpscare hit: a deep boom that drops in pitch, with a harsh burst
// of noise on the attack (the Slender breakdown's ending).
export function thud() {
  try {
    const c = new AudioContext();
    if (c.state === "suspended") c.resume().catch(() => {});
    const t0 = c.currentTime + 0.01;
    const o = c.createOscillator();
    const og = c.createGain();
    o.type = "sine";
    o.frequency.setValueAtTime(110, t0);
    o.frequency.exponentialRampToValueAtTime(38, t0 + 0.5);
    og.gain.setValueAtTime(0.0001, t0);
    og.gain.exponentialRampToValueAtTime(0.42, t0 + 0.012);
    og.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.9);
    o.connect(og).connect(c.destination);
    o.start(t0);
    o.stop(t0 + 1);
    // The hit's grit: present, but lowpassed so it's a slam, not a hiss.
    const src = noise(c, 0.35);
    const lp = c.createBiquadFilter();
    lp.type = "lowpass";
    lp.frequency.setValueAtTime(2800, t0);
    lp.frequency.exponentialRampToValueAtTime(300, t0 + 0.3);
    const ng = c.createGain();
    ng.gain.setValueAtTime(0.16, t0);
    ng.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.32);
    src.connect(lp).connect(ng).connect(c.destination);
    src.start(t0);
    window.setTimeout(() => c.close().catch(() => {}), 1400);
  } catch {}
}

// Opening a breakdown, i.e. taking something apart: a screw being backed
// out. Soft, close and quiet (ASMR-ish): a run of tiny ratchet ticks that
// speed up and rise a touch as it loosens, then a small hollow pop as it
// comes free.
export function unscrew() {
  try {
    const c = new AudioContext();
    if (c.state === "suspended") c.resume().catch(() => {});
    const t0 = c.currentTime + 0.02;
    const out = c.createGain();
    out.gain.value = 0.9;
    out.connect(c.destination);
    // One tick: a very short burst of filtered noise.
    const tick = (at: number, freq: number, vol: number) => {
      const src = noise(c, 0.03);
      const bp = c.createBiquadFilter();
      bp.type = "bandpass";
      bp.Q.value = 6;
      bp.frequency.value = freq;
      const g = c.createGain();
      g.gain.setValueAtTime(0.0001, at);
      g.gain.exponentialRampToValueAtTime(vol, at + 0.002);
      g.gain.exponentialRampToValueAtTime(0.0001, at + 0.025);
      src.connect(bp).connect(g).connect(out);
      src.start(at);
    };
    // The turns: slow and stiff at first, then looser and quicker.
    let t = t0;
    const ticks = 7;
    for (let i = 0; i < ticks; i++) {
      tick(t, 1700 + i * 90 + Math.random() * 120, 0.05 - i * 0.003);
      t += 0.075 - i * 0.006 + Math.random() * 0.012;
    }
    // A faint metallic whisper under the turning.
    const hiss = noise(c, 0.5);
    const hp = c.createBiquadFilter();
    hp.type = "bandpass";
    hp.Q.value = 2;
    hp.frequency.setValueAtTime(5200, t0);
    hp.frequency.linearRampToValueAtTime(6200, t);
    const hg = c.createGain();
    hg.gain.setValueAtTime(0.0001, t0);
    hg.gain.exponentialRampToValueAtTime(0.007, t0 + 0.1);
    hg.gain.exponentialRampToValueAtTime(0.0001, t);
    hiss.connect(hp).connect(hg).connect(out);
    hiss.start(t0);
    // Free: a soft hollow pop.
    const at = t + 0.04;
    const o = c.createOscillator();
    const og = c.createGain();
    o.type = "sine";
    o.frequency.setValueAtTime(720, at);
    o.frequency.exponentialRampToValueAtTime(320, at + 0.06);
    og.gain.setValueAtTime(0.0001, at);
    og.gain.exponentialRampToValueAtTime(0.06, at + 0.004);
    og.gain.exponentialRampToValueAtTime(0.0001, at + 0.09);
    o.connect(og).connect(out);
    o.start(at);
    o.stop(at + 0.12);
    window.setTimeout(() => c.close().catch(() => {}), 1200);
  } catch {}
}

// Closing a breakdown: unscrew() in reverse, the screw going back in.
// Quick loose ticks that slow and drop as it bites, then a firm, low,
// satisfying click as it seats flush.
export function screwIn() {
  try {
    const c = new AudioContext();
    if (c.state === "suspended") c.resume().catch(() => {});
    const t0 = c.currentTime + 0.02;
    const out = c.createGain();
    out.gain.value = 0.9;
    out.connect(c.destination);
    const tick = (at: number, freq: number, vol: number) => {
      const src = noise(c, 0.03);
      const bp = c.createBiquadFilter();
      bp.type = "bandpass";
      bp.Q.value = 6;
      bp.frequency.value = freq;
      const g = c.createGain();
      g.gain.setValueAtTime(0.0001, at);
      g.gain.exponentialRampToValueAtTime(vol, at + 0.002);
      g.gain.exponentialRampToValueAtTime(0.0001, at + 0.025);
      src.connect(bp).connect(g).connect(out);
      src.start(at);
    };
    // Loose and quick first, then tighter: slower, lower, a bit louder.
    let t = t0;
    const ticks = 7;
    for (let i = 0; i < ticks; i++) {
      tick(t, 2200 - i * 100 + Math.random() * 120, 0.035 + i * 0.004);
      t += 0.038 + i * 0.008 + Math.random() * 0.01;
    }
    // Seated: a short, low, woody knock with a tiny high snap on top.
    const at = t + 0.03;
    const o = c.createOscillator();
    const og = c.createGain();
    o.type = "triangle";
    o.frequency.setValueAtTime(260, at);
    o.frequency.exponentialRampToValueAtTime(120, at + 0.05);
    og.gain.setValueAtTime(0.0001, at);
    og.gain.exponentialRampToValueAtTime(0.11, at + 0.003);
    og.gain.exponentialRampToValueAtTime(0.0001, at + 0.11);
    o.connect(og).connect(out);
    o.start(at);
    o.stop(at + 0.14);
    tick(at, 2600, 0.035);
    window.setTimeout(() => c.close().catch(() => {}), 1200);
  } catch {}
}

// Game Over (404), coming in: a soft falling arcade "game over", in the
// menu's bell voice (A minor, down to the low A).
export function gameOver() {
  try {
    const c = new AudioContext();
    if (c.state === "suspended") c.resume().catch(() => {});
    const v: Voice = { c, out: chain(c, 0.4) };
    const t0 = c.currentTime + 0.05;
    [659.25, 523.25, 440, 329.63].forEach((f, i) => bell(v, f, t0 + i * 0.16, 0.04, 1.6));
    bell(v, 220, t0 + 0.68, 0.05, 2.4);
    window.setTimeout(() => c.close().catch(() => {}), 3800);
  } catch {}
}
// …and Continue: a bright little coin, rising.
export function continueCoin() {
  try {
    const c = new AudioContext();
    if (c.state === "suspended") c.resume().catch(() => {});
    const v: Voice = { c, out: chain(c, 0.4) };
    const t0 = c.currentTime + 0.02;
    bell(v, 1318.51, t0, 0.045, 0.9);
    bell(v, 1975.53, t0 + 0.08, 0.04, 1.4);
    window.setTimeout(() => c.close().catch(() => {}), 2400);
  } catch {}
}

// Resume, coming in: "Achievement unlocked". A soft low pop, then a warm
// D major chord blooms in the menu's bell voice (with its echo), and a
// little sparkle runs up on top. Bright, but cozy, not a fanfare.
export function achievement(volume = 0.5) {
  try {
    const c = new AudioContext();
    if (c.state === "suspended") c.resume().catch(() => {});
    const v: Voice = { c, out: chain(c, volume) };
    const t0 = c.currentTime + 0.03;
    // The pop: a short, round thump.
    const o = c.createOscillator();
    const g = c.createGain();
    o.frequency.setValueAtTime(240, t0);
    o.frequency.exponentialRampToValueAtTime(110, t0 + 0.08);
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(0.09 * (volume / 0.5), t0 + 0.006);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.12);
    o.connect(g).connect(c.destination);
    o.start(t0);
    o.stop(t0 + 0.15);
    // The chord: D, F#, A, rolled very slightly like a harp.
    [587.33, 739.99, 880].forEach((f, i) => bell(v, f, t0 + 0.06 + i * 0.025, 0.05, 2.2));
    // The sparkle on top.
    [1174.66, 1479.98, 1760, 2349.32].forEach((f, i) => bell(v, f, t0 + 0.24 + i * 0.06, 0.02 - i * 0.003, 1.2));
    window.setTimeout(() => c.close().catch(() => {}), 4000);
  } catch {}
}
// Resume, leaving: "Progress saved". Two soft chords that resolve home
// (A then D), the save point's gentle confirm.
export function progressSaved() {
  try {
    const c = new AudioContext();
    if (c.state === "suspended") c.resume().catch(() => {});
    const v: Voice = { c, out: chain(c, 0.45) };
    const t0 = c.currentTime + 0.03;
    [659.25, 880, 1108.73].forEach(f => bell(v, f, t0, 0.032, 1.2));
    [587.33, 739.99, 1174.66].forEach(f => bell(v, f, t0 + 0.16, 0.04, 2));
    window.setTimeout(() => c.close().catch(() => {}), 3500);
  } catch {}
}

// The Backrooms: a fluorescent hum (mains hum and its harmonic, a dull
// buzz under them) that plays until stopped. Low and quiet: uneasy, not
// loud. Returns a stop function.
export function fluorescentHum(): () => void {
  try {
    const c = new AudioContext();
    if (c.state === "suspended") c.resume().catch(() => {});
    const out = c.createGain();
    out.gain.setValueAtTime(0.0001, c.currentTime);
    out.gain.exponentialRampToValueAtTime(1, c.currentTime + 1.5);
    out.connect(c.destination);
    const voice = (type: OscillatorType, f: number, vol: number, lp = 0) => {
      const o = c.createOscillator();
      o.type = type;
      o.frequency.value = f;
      const g = c.createGain();
      g.gain.value = vol;
      if (lp) {
        const f2 = c.createBiquadFilter();
        f2.type = "lowpass";
        f2.frequency.value = lp;
        o.connect(f2).connect(g);
      } else o.connect(g);
      g.connect(out);
      o.start();
      return g;
    };
    voice("sine", 60, 0.025);
    voice("sine", 120, 0.018);
    const buzz = voice("sawtooth", 120, 0.012, 420);
    // Now and then the buzz stutters, like a tube about to go.
    const iv = window.setInterval(() => {
      if (Math.random() < 0.35) {
        const t = c.currentTime;
        buzz.gain.setValueAtTime(0.004, t);
        buzz.gain.setValueAtTime(0.02, t + 0.06);
        buzz.gain.setValueAtTime(0.012, t + 0.14);
      }
    }, 2200);
    return () => {
      window.clearInterval(iv);
      const t = c.currentTime;
      out.gain.setValueAtTime(out.gain.value, t);
      out.gain.exponentialRampToValueAtTime(0.0001, t + 0.3);
      window.setTimeout(() => c.close().catch(() => {}), 400);
    };
  } catch {
    return () => {};
  }
}
// Falling out of the world: a short crunch of broken signal.
export function glitch() {
  withCtx((c, out, t) => {
    for (let i = 0; i < 5; i++) puff(c, out, t + i * 0.05, 0.04, 0.05, 900 + Math.random() * 2400, "bandpass", 2);
    tone(c, out, "square", 180, 40, t + 0.2, 0.25, 0.03);
  });
}

// The Achievements screen opening: the trophy case's glass door. A soft,
// glassy shimmer of high bells running up, in the menu's voice.
export function trophyOpen() {
  try {
    const c = new AudioContext();
    if (c.state === "suspended") c.resume().catch(() => {});
    const v: Voice = { c, out: chain(c, 0.32) };
    const t0 = c.currentTime + 0.03;
    [1318.51, 1567.98, 1975.53, 2637.02].forEach((f, i) => bell(v, f, t0 + i * 0.07, 0.03 - i * 0.004, 1.6));
    window.setTimeout(() => c.close().catch(() => {}), 3500);
  } catch {}
}
// …and closing: the shimmer falling back, settling on a low soft note.
export function trophyClose() {
  try {
    const c = new AudioContext();
    if (c.state === "suspended") c.resume().catch(() => {});
    const v: Voice = { c, out: chain(c, 0.3) };
    const t0 = c.currentTime + 0.03;
    [1975.53, 1567.98, 1318.51].forEach((f, i) => bell(v, f, t0 + i * 0.07, 0.025, 1.2));
    bell(v, 659.25, t0 + 0.22, 0.03, 1.8);
    window.setTimeout(() => c.close().catch(() => {}), 3200);
  } catch {}
}

// A pencil stroke: graphite on paper is a soft, papery hiss whose pitch
// and loudness follow the speed of the stroke.
function stroke(c: AudioContext, out: AudioNode, at: number, len: number, vol: number, f0: number, f1: number) {
  const src = noise(c, len + 0.05);
  const bp = c.createBiquadFilter();
  bp.type = "bandpass";
  bp.Q.value = 1.6;
  bp.frequency.setValueAtTime(f0, at);
  bp.frequency.linearRampToValueAtTime(f1, at + len);
  const lp = c.createBiquadFilter();
  lp.type = "lowpass";
  lp.frequency.value = 6500;
  const g = c.createGain();
  g.gain.setValueAtTime(0.0001, at);
  g.gain.exponentialRampToValueAtTime(vol, at + len * 0.25);
  g.gain.exponentialRampToValueAtTime(vol * 0.6, at + len * 0.7);
  g.gain.exponentialRampToValueAtTime(0.0001, at + len);
  src.connect(bp).connect(lp).connect(g).connect(out);
  src.start(at);
}
// The Journal opening: a few quick pencil strokes, like jotting a line.
export function pencilScratch() {
  withCtx((c, out, t) => {
    let at = t;
    for (let i = 0; i < 5; i++) {
      const len = 0.06 + Math.random() * 0.07;
      const f = 2600 + Math.random() * 1400;
      stroke(c, out, at, len, 0.05 + Math.random() * 0.02, f, f + (Math.random() < 0.5 ? -500 : 500));
      at += len + 0.025 + Math.random() * 0.04;
    }
  });
}
// Moving the cursor in the book's contents: a soft paper flick, like a
// fingertip brushing the edge of a page, with a tiny low tap under it.
export function paperFlick() {
  withCtx(
    (c, out, t) => {
      puff(c, out, t, 0.05, 0.035, 2200, "bandpass", 1.2);
      tone(c, out, "sine", 320, 220, t, 0.05, 0.02);
    },
    600
  );
}
// Moving the cursor in a Journal list: a tiny pencil tick, like tapping
// the pencil on the line you're pointing at. Short and quiet.
export function pencilTick() {
  withCtx(
    (c, out, t) => {
      stroke(c, out, t, 0.035, 0.04, 3000 + Math.random() * 600, 2600);
    },
    600
  );
}
// Leaving the Journal: one longer underline stroke and a small tick, as if
// signing off the page.
export function pencilFlourish() {
  withCtx((c, out, t) => {
    stroke(c, out, t, 0.24, 0.055, 2200, 3600);
    stroke(c, out, t + 0.3, 0.05, 0.05, 3400, 2800);
  });
}

/* ── transitions in and out of each section ─────────────────────
   All soft and short: warm (lowpassed) noise, gentle sines, nothing
   sharp or loud. Each pair is one action and its reverse. */

// A tiny helper: one sine "note" with a quick attack and soft tail.
function tone(c: AudioContext, out: AudioNode, type: OscillatorType, f0: number, f1: number, at: number, len: number, vol: number) {
  const o = c.createOscillator();
  const g = c.createGain();
  o.type = type;
  o.frequency.setValueAtTime(f0, at);
  if (f1 !== f0) o.frequency.exponentialRampToValueAtTime(f1, at + len * 0.8);
  g.gain.setValueAtTime(0.0001, at);
  g.gain.exponentialRampToValueAtTime(vol, at + Math.min(0.012, len * 0.2));
  g.gain.exponentialRampToValueAtTime(0.0001, at + len);
  o.connect(g).connect(out);
  o.start(at);
  o.stop(at + len + 0.02);
}
// A short burst of warm noise.
function puff(c: AudioContext, out: AudioNode, at: number, len: number, vol: number, lowpass: number, type: BiquadFilterType = "lowpass", q = 0.7) {
  const src = noise(c, len + 0.05);
  const f = c.createBiquadFilter();
  f.type = type;
  f.frequency.value = lowpass;
  f.Q.value = q;
  const g = c.createGain();
  g.gain.setValueAtTime(0.0001, at);
  g.gain.exponentialRampToValueAtTime(vol, at + Math.min(0.01, len * 0.2));
  g.gain.exponentialRampToValueAtTime(0.0001, at + len);
  src.connect(f).connect(g).connect(out);
  src.start(at);
}
function withCtx(play: (c: AudioContext, out: AudioNode, t0: number) => void, ms = 1400) {
  try {
    const c = new AudioContext();
    if (c.state === "suspended") c.resume().catch(() => {});
    const out = c.createGain();
    out.gain.value = 1;
    out.connect(c.destination);
    play(c, out, c.currentTime + 0.02);
    window.setTimeout(() => c.close().catch(() => {}), ms);
  } catch {}
}

// CRT switching on (Design): a soft thump as it powers, a faint rising
// whine as the tube warms, and a breath of static as the picture opens.
export function crtOn() {
  withCtx((c, out, t) => {
    tone(c, out, "sine", 70, 52, t, 0.18, 0.12);
    tone(c, out, "sine", 2400, 5200, t + 0.03, 0.45, 0.006);
    puff(c, out, t + 0.06, 0.4, 0.035, 2600);
  });
}
// CRT switching off: the picture collapses with a falling "zwoom" and a
// little crackle, then a soft click as the dot goes out.
export function crtOff() {
  withCtx((c, out, t) => {
    tone(c, out, "sine", 640, 70, t, 0.32, 0.05);
    puff(c, out, t, 0.22, 0.028, 2200);
    puff(c, out, t + 0.34, 0.03, 0.03, 1400);
  });
}

// The terminal (Coding) opening: a soft key tap and a little two-note
// rising blip, like a window popping up.
export function termOpen() {
  withCtx((c, out, t) => {
    puff(c, out, t, 0.03, 0.04, 1800);
    tone(c, out, "triangle", 523.25, 523.25, t + 0.05, 0.09, 0.04);
    tone(c, out, "triangle", 783.99, 783.99, t + 0.12, 0.14, 0.035);
  });
}
// …and closing: the same blip falling, ending on a soft tap.
export function termClose() {
  withCtx((c, out, t) => {
    tone(c, out, "triangle", 783.99, 783.99, t, 0.08, 0.035);
    tone(c, out, "triangle", 523.25, 523.25, t + 0.07, 0.12, 0.035);
    puff(c, out, t + 0.2, 0.03, 0.035, 1500);
  });
}

// The Breakdowns toolbox opening: two latches flipping up (soft metallic
// clicks), then the lid's hollow knock.
export function latchOpen() {
  withCtx((c, out, t) => {
    puff(c, out, t, 0.03, 0.05, 1600, "bandpass", 3);
    puff(c, out, t + 0.11, 0.03, 0.05, 1750, "bandpass", 3);
    tone(c, out, "triangle", 180, 140, t + 0.24, 0.12, 0.06);
  });
}
// …and shutting: the lid's knock first, then the two latches snapping.
export function latchClose() {
  withCtx((c, out, t) => {
    tone(c, out, "triangle", 170, 120, t, 0.13, 0.065);
    puff(c, out, t + 0.16, 0.03, 0.05, 1750, "bandpass", 3);
    puff(c, out, t + 0.26, 0.03, 0.05, 1600, "bandpass", 3);
  });
}

// Leaving a chapter: the dive's whoosh in reverse, a soft rush of air
// that falls away as you pull back out of the page.
export function whooshOut() {
  withCtx((c, out, t) => {
    const src = noise(c, 0.55);
    const bp = c.createBiquadFilter();
    bp.type = "bandpass";
    bp.Q.value = 0.9;
    bp.frequency.setValueAtTime(1500, t);
    bp.frequency.exponentialRampToValueAtTime(260, t + 0.45);
    const g = c.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.1, t + 0.06);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.5);
    src.connect(bp).connect(g).connect(out);
    src.start(t);
  });
}

// Short menu sounds in the same voice: a few bells, one after another.
let sfxCtx: AudioContext | null = null;
let sfxOut: AudioNode | null = null;
export function sfx(notes: number[], gap = 0.1, vol = 0.06) {
  try {
    if (!sfxCtx) {
      sfxCtx = new AudioContext();
      sfxOut = chain(sfxCtx, 0.7);
    }
    if (sfxCtx.state === "suspended") sfxCtx.resume().catch(() => {});
    const at = sfxCtx.currentTime + 0.01;
    notes.forEach((f, i) => bell({ c: sfxCtx!, out: sfxOut! }, f, at + i * gap, vol, 1.8));
  } catch {}
}

export function stopBootSound() {
  ctx?.close().catch(() => {});
  ctx = null;
}

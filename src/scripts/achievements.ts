/**
 * Achievements: little things to find around the site.
 *
 * - Progress lives in the visitor's own browser (localStorage), so it
 *   survives reloads and coming back later. Nothing is sent anywhere.
 *   Per device and browser; a private window starts fresh.
 * - unlock(id) anywhere on the site: the first time only, a toast slides
 *   in ("Achievement unlocked") with the achievement sound, played quieter.
 *   Toasts queue (one at a time, never stacked) and never block anything.
 * - Collect them all: the platinum, "Keeper of the Light". The lighthouse
 *   beam turns gold for good.
 */
import { achievement } from "@/components/home/bootSound";
import { soundOn } from "@/scripts/cameFrom";

/**
 * The visitor's class, like the save files' ("Class: Storyteller"): what
 * they came to do, judged by what they found.
 */
export type PlayerType = "scholar" | "gamer" | "tinkerer" | "wanderer" | "bard";
export const PLAYER_TYPES: Record<PlayerType, { name: string; blurb: string }> = {
  scholar: { name: "Scholar", blurb: "You came to read. The patch notes, the book, the journal, the case files." },
  gamer: { name: "Gamer", blurb: "You came to play. Cartridges in, boot screens watched, quitting refused." },
  tinkerer: { name: "Tinkerer", blurb: "You poke at everything just to see what it does." },
  wanderer: { name: "Wanderer", blurb: "You wandered, and noticed the small things." },
  bard: { name: "Bard", blurb: "You came to connect. Say hi any time." },
};

export type Achievement = {
  id: string;
  title: string;
  /** Shown once unlocked. */
  desc: string;
  /** Shown while locked: says plainly where to go and what to do. */
  hint: string;
  /** Hidden ones show as "???" until found (the hint still shows). */
  hidden?: boolean;
  /** A pixel icon (see PixelIcon.astro). */
  icon: string;
  /** Which class it speaks to (Scholar, Gamer, Tinkerer, Wanderer, Bard). */
  type: PlayerType;
};

/**
 * Every achievement. To add one: give it an entry here, then call
 * unlock("its-id") wherever it happens (see CONTENT.md).
 */
export const ACHIEVEMENTS: Achievement[] = [
  { id: "patch-notes", type: "scholar", icon: "scroll", title: "Read the patch notes", desc: "Opened the Resume. Every build has its notes.", hint: "Open the Resume from the main menu." },
  { id: "cartridge", type: "gamer", icon: "cart", title: "Blow on it first", desc: "Inserted a cartridge.", hint: "Start a game in the Design library (Start, then Design)." },
  { id: "pro-gamer", type: "gamer", icon: "gamepad", title: "Pro gamer", desc: "Put every cartridge in the console. Blew on all of them.", hint: "Start every game in the Design library." },
  { id: "bookworm", type: "scholar", icon: "book", title: "Bookworm", desc: "Opened a chapter of the book.", hint: "Open a chapter from the Narrative book." },
  { id: "dear-diary", type: "scholar", icon: "pencil", title: "Dear diary", desc: "Read an entry in the Journal.", hint: "Read an entry in the Journal." },
  { id: "taking-apart", type: "scholar", icon: "screw", title: "Taking it apart", desc: "Opened a breakdown.", hint: "Open a case file in Breakdowns." },
  { id: "all-pages", type: "scholar", icon: "page", title: "All 8 pages", desc: "Collected every page. He was there anyway.", hint: "Read the Slender breakdown all the way to the end." },

  { id: "keeper", type: "wanderer", icon: "wave", title: "Lighthouse keeper", desc: "Said hello. He waved back.", hint: "Click the lamp at the top of the lighthouse." },
  { id: "ripples", type: "wanderer", icon: "ripple", title: "Skipping stones", desc: "Made ripples on the sea. Plip.", hint: "Click the sea." },
  { id: "wish", type: "wanderer", icon: "star", title: "Make a wish", desc: "Sent a shooting star across the sky.", hint: "At night, click the sky." },
  { id: "birds", type: "wanderer", icon: "bird", title: "Bird watcher", desc: "Sent a seagull across the sky.", hint: "By day, click the sky." },
  { id: "dolphin", type: "wanderer", icon: "dolphin", title: "Dolphin spotting", desc: "Saw a dolphin leap. Lucky.", hint: "By day, watch the sea for a little while.", hidden: true },
  { id: "round-the-clock", type: "wanderer", icon: "moon", title: "Round the clock", desc: "Visited by day and by night.", hint: "Visit once by day (6am to 6pm) and once by night." },
  { id: "sea", type: "wanderer", icon: "wave2", title: "Just watching the sea", desc: "A whole minute of ambient mode.", hint: "Turn on Ambient mode (top right of the main menu) for a minute." },
  { id: "encore", type: "gamer", icon: "rewind", title: "Encore", desc: "Watched the boot screen a second time.", hint: "See the boot screen again: press 0 on the main menu.", hidden: true },
  { id: "change-of-heart", type: "tinkerer", icon: "sound", title: "Change of heart", desc: "Turned the sound back on. We knew you'd miss it.", hint: "Turn the sound off, then back on.", hidden: true },
  { id: "noclip", type: "wanderer", icon: "exit", title: "No-clip", desc: "Fell out of the world into the Backrooms.", hint: "The book's unwritten chapter leads somewhere. Refuse to continue.", hidden: true },

  { id: "item-get", type: "bard", icon: "card", title: "Item obtained", desc: "Picked up the business card.", hint: "Open Contact from the main menu." },
  { id: "pen-pal", type: "bard", icon: "mail", title: "Pen pal", desc: "Reached for the email. Say hi any time.", hint: "On Contact, use the card or copy the mail address." },
  { id: "networking", type: "bard", icon: "link", title: "Networking", desc: "Opened LinkedIn.", hint: "On Contact, open LinkedIn." },
  { id: "share", type: "bard", icon: "share", title: "Spread the word", desc: "Shared a Journal entry.", hint: "Share a Journal entry (the icons at the end of an entry)." },

  { id: "rage-quit", type: "gamer", icon: "door", title: "Rage quit", desc: "Tried to quit. It didn't take.", hint: "Choose Quit on the main menu." },
  { id: "nobody-quits", type: "gamer", icon: "power", title: "Nobody quits", desc: "Sat through the whole shutdown. Came back anyway.", hint: "Choose Quit, then keep choosing Yes.", hidden: true },
  { id: "party-pooper", type: "tinkerer", icon: "mute", title: "Party pooper", desc: "Turned the music off.", hint: "Turn the sound off (bottom right of the main menu)." },
  { id: "rickroll", type: "tinkerer", icon: "note", title: "Never gonna give you up", desc: "Started something that wasn't there.", hint: "In the Coding terminal, type start on the list of folders.", hidden: true },
  { id: "sudo", type: "tinkerer", icon: "key", title: "Nice try", desc: "Asked the terminal for admin powers.", hint: "In the Coding terminal, type sudo.", hidden: true },
  { id: "decorator", type: "tinkerer", icon: "paint", title: "Interior decorator", desc: "Repainted the terminal.", hint: "In the Coding terminal, type color a.", hidden: true },
];

/** Where each achievement happens: the Achievements screen's "Go" links. */
export const WHERE: Record<string, string> = {
  "patch-notes": "/resume",
  cartridge: "/portfolio/design",
  "pro-gamer": "/portfolio/design",
  bookworm: "/portfolio/narrative",
  "dear-diary": "/blog",
  "taking-apart": "/portfolio/breakdowns",
  "all-pages": "/portfolio/breakdowns/slender",
  keeper: "/",
  ripples: "/",
  wish: "/",
  birds: "/",
  dolphin: "/",
  "round-the-clock": "/",
  sea: "/",
  encore: "/",
  "change-of-heart": "/",
  noclip: "/portfolio/narrative",
  "item-get": "/contact",
  "pen-pal": "/contact",
  networking: "/contact",
  share: "/blog",
  "rage-quit": "/",
  "nobody-quits": "/",
  "party-pooper": "/",
  rickroll: "/portfolio/coding",
  sudo: "/portfolio/coding",
  decorator: "/portfolio/coding",
};

/** How many of each class this visitor has unlocked (and in all). */
export function playerTypes() {
  const got = read();
  const out = {} as Record<PlayerType, { got: number; total: number }>;
  for (const t of Object.keys(PLAYER_TYPES) as PlayerType[]) out[t] = { got: 0, total: 0 };
  for (const a of ACHIEVEMENTS) {
    out[a.type].total++;
    if (got[a.id]) out[a.type].got++;
  }
  return out;
}
/**
 * Dual classes, JRPG style: when a visitor's second class is close behind
 * their first, they get a combined title. Keyed by the two classes in
 * alphabetical order.
 */
export const DUAL_CLASSES: Record<string, { name: string; blurb: string }> = {
  "scholar+wanderer": { name: "Wandering Scholar", blurb: "You read everything, then went looking for what wasn't written down." },
  "gamer+scholar": { name: "Lore Hunter", blurb: "You play the game and read the manual. Both, cover to cover." },
  "scholar+tinkerer": { name: "Mad Scientist", blurb: "You read how it works, then tried everything it said not to." },
  "bard+scholar": { name: "Storyteller", blurb: "You read every story here, then came to swap one of your own." },
  "gamer+wanderer": { name: "Completionist", blurb: "Every cartridge played, every corner of the map seen." },
  "gamer+tinkerer": { name: "Speedrunner", blurb: "You find the shortcuts, then break the game a little to take them." },
  "bard+gamer": { name: "Party Leader", blurb: "You play every game, and you'd rather play it together." },
  "tinkerer+wanderer": { name: "Rogue", blurb: "Off the map, through the walls, poking at whatever's behind them." },
  "bard+tinkerer": { name: "Trickster", blurb: "A little mischief, a lot of charm. Come say hi, then break something." },
  "bard+wanderer": { name: "Travelling Minstrel", blurb: "You took the long way round and stopped to say hello at the end." },
};
/** The title for a visitor who's found everything. */
export const PLATINUM_CLASS = {
  name: "Keeper of the Light",
  blurb: "Nothing left to find. The lighthouse is yours now.",
};

/**
 * The visitor's title on the Achievements screen: the platinum's, a dual
 * class (when the second class is at least 70% as strong as the first,
 * with two or more found in each), or their single class. null before
 * anything's found.
 */
export function classTitle(): { name: string; blurb: string; a?: PlayerType; b?: PlayerType; plat?: boolean } | null {
  if (isPlatinum()) return { ...PLATINUM_CLASS, plat: true };
  const t = playerTypes();
  const ranked = (Object.keys(t) as PlayerType[])
    .filter(k => t[k].got > 0)
    .map(k => ({ k, share: t[k].got / t[k].total, got: t[k].got }))
    .sort((a, b) => b.share - a.share || b.got - a.got);
  if (!ranked.length) return null;
  const [first, second] = ranked;
  if (second && first.got >= 2 && second.got >= 2 && second.share >= first.share * 0.7) {
    const dual = DUAL_CLASSES[[first.k, second.k].sort().join("+")];
    if (dual) return { ...dual, a: first.k, b: second.k };
  }
  return { ...PLAYER_TYPES[first.k], a: first.k };
}

/** The visitor's class: the one they've done the most of (by share). */
export function mainType(): PlayerType | null {
  const t = playerTypes();
  let best: PlayerType | null = null;
  let score = 0;
  for (const k of Object.keys(t) as PlayerType[]) {
    const s = t[k].got / t[k].total;
    if (t[k].got > 0 && s > score) {
      best = k;
      score = s;
    }
  }
  return best;
}

/** The reward for collecting every one. */
export const PLATINUM = {
  title: "Keeper of the Light",
  desc: "Every achievement found. The lighthouse beam is gold now, for good, and the Credits are open.",
};

const KEY = "achievements";
type Store = Record<string, string>;

function read(): Store {
  try {
    return JSON.parse(localStorage.getItem(KEY) || "{}") as Store;
  } catch {
    return {};
  }
}
function write(s: Store) {
  try {
    localStorage.setItem(KEY, JSON.stringify(s));
  } catch {}
}

export const unlocked = (): Store => read();
export const has = (id: string) => id in read();
export const count = () => ACHIEVEMENTS.filter(a => has(a.id)).length;
export const isPlatinum = () => count() === ACHIEVEMENTS.length;

/** Unlock an achievement. Returns true only the first time. */
export function unlock(id: string): boolean {
  const a = ACHIEVEMENTS.find(x => x.id === id);
  if (!a) return false;
  const s = read();
  if (s[id]) return false;
  s[id] = new Date().toISOString();
  write(s);
  queue.push({ kicker: "Achievement unlocked", title: a.title });
  if (isPlatinum()) {
    queue.push({ kicker: "Platinum", title: PLATINUM.title, gold: true });
    document.dispatchEvent(new Event("ach:platinum"));
  }
  document.dispatchEvent(new CustomEvent("ach:unlock", { detail: a }));
  pump();
  return true;
}

/** Wipe all progress (from the Achievements screen). */
export function reset() {
  try {
    localStorage.removeItem(KEY);
    localStorage.removeItem("scenesSeen");
    localStorage.removeItem("gamesPlayed");
    localStorage.removeItem("bootsSeen");
    localStorage.removeItem("sceneChoice"); // the platinum's day/night pick
    localStorage.removeItem("classLook"); // and its wardrobe pick
  } catch {}
  document.dispatchEvent(new Event("ach:reset"));
}

/** Count each time the boot screen plays (the second time is "Encore"). */
export function sawBoot() {
  try {
    const n = Number(localStorage.getItem("bootsSeen") || "0") + 1;
    localStorage.setItem("bootsSeen", String(n));
    if (n >= 2) unlock("encore");
  } catch {}
}

/** Remember each game played (for "Pro gamer": every playable one). */
export function playedGame(slug: string, playable: string[]) {
  try {
    const played = new Set<string>(JSON.parse(localStorage.getItem("gamesPlayed") || "[]"));
    if (!playable.includes(slug)) return;
    played.add(slug);
    localStorage.setItem("gamesPlayed", JSON.stringify([...played]));
    if (playable.every(s => played.has(s))) unlock("pro-gamer");
  } catch {}
}

/** Remember which times of day have been seen (for "Round the clock"). */
export function sawScene(scene: "day" | "night") {
  try {
    const seen = new Set<string>(JSON.parse(localStorage.getItem("scenesSeen") || "[]"));
    seen.add(scene);
    localStorage.setItem("scenesSeen", JSON.stringify([...seen]));
    if (seen.has("day") && seen.has("night")) unlock("round-the-clock");
  } catch {}
}

// ── the toast ───────────────────────────────────────────────────
// Built on demand (the page body is swapped on navigation), one at a time:
// slide in, hold, slide out, then the next. Styles: .ach-toast in global.css.
type Toast = { kicker: string; title: string; gold?: boolean };
const queue: Toast[] = [];
let busy = false;
const TROPHY =
  '<svg viewBox="0 0 16 16" shape-rendering="crispEdges" aria-hidden="true"><g fill="currentColor"><rect x="4" y="2" width="8" height="5"/><rect x="2" y="3" width="2" height="1"/><rect x="2" y="4" width="1" height="2"/><rect x="3" y="6" width="1" height="1"/><rect x="12" y="3" width="2" height="1"/><rect x="13" y="4" width="1" height="2"/><rect x="12" y="6" width="1" height="1"/><rect x="5" y="7" width="6" height="1"/><rect x="7" y="8" width="2" height="3"/><rect x="5" y="11" width="6" height="1"/><rect x="4" y="12" width="8" height="2"/></g></svg>';

function pump() {
  if (busy || !queue.length) return;
  busy = true;
  const t = queue.shift()!;
  // A beat after the page settles, so it never lands mid-transition.
  window.setTimeout(() => {
    const el = document.createElement("div");
    el.className = "ach-toast" + (t.gold ? " is-gold" : "");
    el.setAttribute("role", "status");
    el.setAttribute("aria-live", "polite");
    el.innerHTML = `<span class="ach-toast-icon">${TROPHY}</span><span class="ach-toast-text"><span class="ach-toast-kicker"></span><span class="ach-toast-title"></span></span>`;
    el.querySelector(".ach-toast-kicker")!.textContent = t.kicker;
    el.querySelector(".ach-toast-title")!.textContent = t.title;
    document.body.append(el);
    requestAnimationFrame(() => requestAnimationFrame(() => el.classList.add("is-in")));
    if (soundOn()) achievement(t.gold ? 0.5 : 0.32);
    window.setTimeout(() => el.classList.remove("is-in"), 3000);
    window.setTimeout(() => {
      el.remove();
      busy = false;
      pump();
    }, 3600);
  }, 450);
}

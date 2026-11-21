/**
 * Mouse wheel through a menu's options: one step per flick (a trackpad's
 * stream of small deltas adds up to a step, then pauses), down/right =
 * next, up/left = previous.
 *
 * It only takes over the wheel when the page has nothing to scroll, so a
 * short window that needs scrolling still scrolls normally. Ctrl+wheel
 * (zoom) is left alone, and `guard` can switch it off while, say, a dialog
 * is open.
 */
export function wheelSelect(
  step: (dir: 1 | -1) => void,
  signal: AbortSignal,
  guard: () => boolean = () => true
) {
  let acc = 0;
  let lastEvent = 0;
  let lastStep = 0;
  document.addEventListener(
    "wheel",
    e => {
      if (e.ctrlKey || !guard()) return;
      if (document.documentElement.scrollHeight > window.innerHeight + 2) return;
      e.preventDefault();
      const now = performance.now();
      if (now - lastEvent > 250) acc = 0; // a new gesture
      lastEvent = now;
      acc += Math.abs(e.deltaY) >= Math.abs(e.deltaX) ? e.deltaY : e.deltaX;
      if (Math.abs(acc) >= 40 && now - lastStep > 160) {
        step(acc > 0 ? 1 : -1);
        acc = 0;
        lastStep = now;
      }
    },
    { signal, passive: false }
  );
}

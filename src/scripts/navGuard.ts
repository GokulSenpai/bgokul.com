/**
 * Keeps page changes from getting stuck on phones.
 *
 * Every exit fades to black (or plays a loading bar) and then hands over to
 * Astro's router. On some phones that handover can hang: the page fetch is
 * slow on mobile data, or the browser's view-transition snapshot freezes on
 * its last frame. Either way the visitor sees the black fade (or a full
 * loading bar) and nothing else.
 *
 * - If a page change hasn't landed after a few seconds, load the page the
 *   normal way instead.
 * - If the browser's transition is still running a moment after the new
 *   page is in, skip the rest of it.
 *
 * Loaded once by the Layout; the listeners persist across navigations.
 */
const STUCK_MS = 6000;

if (typeof window !== "undefined" && !(window as unknown as { __navGuard?: boolean }).__navGuard) {
  (window as unknown as { __navGuard?: boolean }).__navGuard = true;

  let watchdog = 0;
  document.addEventListener("astro:before-preparation", e => {
    const to = (e as unknown as { to: URL }).to;
    window.clearTimeout(watchdog);
    watchdog = window.setTimeout(() => location.assign(to.href), STUCK_MS);
  });
  document.addEventListener("astro:after-swap", () => window.clearTimeout(watchdog));

  document.addEventListener("astro:before-swap", e => {
    const vt = (e as unknown as { viewTransition?: ViewTransition }).viewTransition;
    if (!vt) return;
    const t = window.setTimeout(() => vt.skipTransition(), 1200);
    vt.finished.finally(() => window.clearTimeout(t));
  });
}

/**
 * Where the visitor came from (the previous page's path, on client-side
 * navigation). Lets a section play its "coming in" sound only when you
 * actually enter it from outside, not when you move around inside it.
 *
 * Loaded once by the Layout on every page; the listener persists across
 * navigations.
 */
const KEY = "prevPath";

// (Only in the browser: this module is also imported while pages build.)
if (typeof window !== "undefined" && !(window as unknown as { __cameFrom?: boolean }).__cameFrom) {
  (window as unknown as { __cameFrom?: boolean }).__cameFrom = true;
  document.addEventListener("astro:before-swap", e => {
    try {
      sessionStorage.setItem(KEY, (e as unknown as { from: URL }).from.pathname);
    } catch {}
  });
}

/** The previous page's path ("" on a fresh load). */
export function cameFrom(): string {
  try {
    return sessionStorage.getItem(KEY) ?? "";
  } catch {
    return "";
  }
}

/** True if the previous page was outside `prefix` (e.g. "/portfolio/coding"). */
export function enteredFrom(prefix: string): boolean {
  const p = cameFrom().replace(/\/+$/, "");
  return !(p === prefix || p.startsWith(prefix + "/"));
}

/** Sound only if the visitor has it on and has pressed something. */
export function soundOn(): boolean {
  try {
    return localStorage.getItem("titleSound") !== "off" && (navigator.userActivation?.hasBeenActive ?? false);
  } catch {
    return false;
  }
}

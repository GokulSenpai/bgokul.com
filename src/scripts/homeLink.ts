/**
 * The ⌂ (main menu) links on pages with their own HUD (the Design library,
 * game pages, the Narrative book): a click fades to black like every other
 * exit, then the main menu, and the Home key does the same. Pages with the
 * standard HUD (Header.astro) handle their own ⌂.
 *
 * Mark a link with data-home. Loaded once by the Layout.
 */
import { navigate } from "astro:transitions/client";

if (typeof window !== "undefined" && !(window as unknown as { __homeLink?: boolean }).__homeLink) {
  (window as unknown as { __homeLink?: boolean }).__homeLink = true;

  let leaving = false;
  const go = (href: string) => {
    if (leaving) return;
    leaving = true;
    document.dispatchEvent(new CustomEvent("sys:leaving", { detail: { href } }));
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return void navigate(href);
    document.documentElement.classList.add("sys-leaving");
    window.setTimeout(() => navigate(href), 380);
  };
  document.addEventListener("astro:page-load", () => (leaving = false));

  document.addEventListener("click", e => {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    // ⌂ links, and any link marked data-fade (e.g. "Next game"): the fade.
    const a = (e.target as HTMLElement).closest<HTMLAnchorElement>("a[data-home], a[data-fade]");
    if (!a) return;
    e.preventDefault();
    go(a.href);
  });
  document.addEventListener("keydown", e => {
    if (e.key !== "Home" || e.defaultPrevented || e.altKey || e.ctrlKey || e.metaKey) return;
    if ((e.target as HTMLElement).closest("input, textarea, select, [contenteditable]")) return;
    if (document.querySelector("[data-sys-home]")) return; // the standard HUD handles it
    const a = document.querySelector<HTMLAnchorElement>("a[data-home]");
    if (!a) return;
    e.preventDefault();
    // A click, so the page's own exit runs if it has one (the Design
    // library's CRT switch-off); otherwise the click handler above fades.
    a.click();
  });
}

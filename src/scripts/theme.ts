// The site is dark only (data-theme="dark" is set on <html> in Layout.astro).
// This just keeps <meta name="theme-color"> in step with the page background
// so Android's browser chrome matches.

function syncThemeColor(): void {
  const bg = window.getComputedStyle(document.body).backgroundColor;
  document
    .querySelector("meta[name='theme-color']")
    ?.setAttribute("content", bg);
}

syncThemeColor();
document.addEventListener("astro:after-swap", syncThemeColor);

// Carry the theme-color value across View Transitions to prevent the
// Android navigation bar from flashing during page transitions.
document.addEventListener("astro:before-swap", event => {
  const color = document
    .querySelector("meta[name='theme-color']")
    ?.getAttribute("content");
  if (color) {
    (event as { newDocument: Document }).newDocument
      .querySelector("meta[name='theme-color']")
      ?.setAttribute("content", color);
  }
});

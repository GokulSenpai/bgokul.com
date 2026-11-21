import {
  defineConfig,
  envField,
  fontProviders,
  svgoOptimizer,
} from "astro/config";
import tailwindcss from "@tailwindcss/vite";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import { unified } from "@astrojs/markdown-remark";
import remarkToc from "remark-toc";
import remarkCollapse from "remark-collapse";
import rehypeCallouts from "rehype-callouts";
import {
  transformerNotationDiff,
  transformerNotationHighlight,
  transformerNotationWordHighlight,
} from "@shikijs/transformers";
import { transformerFileName } from "./src/utils/transformers/fileName";
import rehypeNoOrphans from "./src/utils/rehypeNoOrphans.js";
import config from "./astro-paper.config";

export default defineConfig({
  site: config.site.url,
  // No Astro toolbar at the bottom of the page while developing (it never
  // shows on the live site either way).
  devToolbar: { enabled: false },
  // Every link on screen is fetched quietly once the page is idle, and a
  // hovered one straight away, so clicks open instantly. (Astro skips this
  // on slow connections and with data saver on.)
  prefetch: {
    prefetchAll: true,
    defaultStrategy: "viewport",
  },
  integrations: [
    mdx(),
    sitemap({
      // The Backrooms aren't on any map (and not in the sitemap either).
      filter: page =>
        !page.includes("/backrooms") &&
        !page.includes("/credits") &&
        (config.features?.showArchives !== false || !page.endsWith("/archives/")),
    }),
  ],
  i18n: {
    locales: ["en"],
    defaultLocale: "en",
    routing: {
      prefixDefaultLocale: false,
    },
  },
  markdown: {
    processor: unified({
      remarkPlugins: [
        remarkToc,
        [remarkCollapse, { test: "Table of contents" }],
      ],
      rehypePlugins: [rehypeCallouts, rehypeNoOrphans],
    }),
    shikiConfig: {
      themes: { light: "min-light", dark: "night-owl" },
      defaultColor: false,
      wrap: false,
      transformers: [
        transformerFileName({ style: "v2", hideDot: false }),
        transformerNotationHighlight(),
        transformerNotationWordHighlight(),
        transformerNotationDiff({ matchAlgorithm: "v3" }),
      ],
    },
  },
  vite: {
    plugins: [tailwindcss()],
  },
  fonts: [
    {
      name: "Google Sans Code",
      cssVariable: "--font-google-sans-code",
      provider: fontProviders.google(),
      fallbacks: ["monospace"],
      weights: [300, 400, 500, 600, 700],
      styles: ["normal", "italic"],
      formats: ["woff", "ttf"],
    },
    {
      name: "IBM Plex Sans",
      cssVariable: "--font-ibm-plex-sans",
      provider: fontProviders.google(),
      fallbacks: ["sans-serif"],
      weights: [400, 500, 600],
      styles: ["normal", "italic"],
      formats: ["woff", "ttf"],
    },
    // Narrative section ("the section is a book"): Cormorant for display,
    // matching The Space Between Signals' cover; EB Garamond for reading.
    {
      name: "Cormorant Garamond",
      cssVariable: "--font-cormorant",
      provider: fontProviders.google(),
      fallbacks: ["Georgia", "serif"],
      weights: [500, 600],
      styles: ["normal", "italic"],
      formats: ["woff2"],
    },
    {
      name: "EB Garamond",
      cssVariable: "--font-garamond",
      provider: fontProviders.google(),
      fallbacks: ["Georgia", "serif"],
      weights: [400, 500],
      styles: ["normal", "italic"],
      formats: ["woff2"],
    },
    // Game pages' design notes: a serif made for long reads on screens.
    {
      name: "Source Serif 4",
      cssVariable: "--font-reading",
      provider: fontProviders.google(),
      fallbacks: ["Georgia", "serif"],
      weights: [400, 600],
      styles: ["normal", "italic"],
      formats: ["woff2"],
    },
    // Design section (a console home screen): a clean geometric sans with a
    // light weight for the clock, like console UI type.
    {
      name: "Outfit",
      cssVariable: "--font-console",
      provider: fontProviders.google(),
      fallbacks: ["system-ui", "sans-serif"],
      weights: [300, 400, 500, 600, 700],
      styles: ["normal"],
      formats: ["woff2"],
    },
    // Contact page (a letterpress business card): a Futura-like geometric sans.
    {
      name: "Jost",
      cssVariable: "--font-card",
      provider: fontProviders.google(),
      fallbacks: ["Futura", "system-ui", "sans-serif"],
      weights: [400, 500, 600],
      styles: ["normal"],
      formats: ["woff2"],
    },
    // Home (title screen over the pixel-art night scene): a pixel font.
    {
      name: "Pixelify Sans",
      cssVariable: "--font-pixel",
      provider: fontProviders.google(),
      fallbacks: ["ui-monospace", "monospace"],
      weights: [400, 500, 600, 700],
      styles: ["normal"],
      // ttf too: the share images (src/utils/ogCard.ts) are drawn with it,
      // and their renderer can't read woff2. Browsers still get woff2.
      formats: ["woff2", "ttf"],
    },
    // Slender breakdown: a scrawled hand, like the notes on the pages.
    {
      name: "Reenie Beanie",
      cssVariable: "--font-scrawl",
      provider: fontProviders.google(),
      fallbacks: ["cursive"],
      weights: [400],
      styles: ["normal"],
      formats: ["woff2"],
    },
  ],
  redirects: {
    "/about": "/contact",
  },
  env: {
    schema: {
      PUBLIC_GOOGLE_SITE_VERIFICATION: envField.string({
        access: "public",
        context: "client",
        optional: true,
      }),
    },
  },
  experimental: {
    svgOptimizer: svgoOptimizer(),
  },
});

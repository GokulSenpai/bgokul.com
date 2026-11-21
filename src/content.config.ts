import { defineCollection } from "astro:content";
import { z } from "astro/zod";
import { glob } from "astro/loaders";
import config from "@/config";
import { CMD_COLOR_NAMES } from "@/components/coding/cmdColors";

export const BLOG_PATH = "src/content/posts";

const posts = defineCollection({
  loader: glob({ pattern: "**/[^_]*.{md,mdx}", base: `./${BLOG_PATH}` }),
  schema: ({ image }) =>
    z.object({
      author: z.string().default(config.site.author),
      pubDatetime: z.date(),
      modDatetime: z.date().optional().nullable(),
      title: z.string(),
      featured: z.boolean().optional(),
      draft: z.boolean().optional(),
      tags: z.array(z.string()).default(["others"]),
      ogImage: image().or(z.string()).optional(),
      // A photo for the entry: taped onto the page in the Journal.
      cover: image().optional(),
      description: z.string(),
      canonicalURL: z.string().optional(),
      hideEditPost: z.boolean().optional(),
      timezone: z.string().optional(),
    }),
});

const projects = defineCollection({
  // "[^_]*" skips underscore-prefixed folders (e.g. _template) so the
  // reusable template below isn't picked up as a real project.
  loader: glob({
    pattern: "[^_]*/index.mdx",
    base: "./src/content/projects",
    generateId: ({ entry }) => entry.replace(/\/index\.mdx$/, ""),
  }),
  schema: ({ image }) =>
    z.object({
      // Only these three are load-bearing: a name, a cover image, and a
      // sort position. Everything else is optional — omit a field in a
      // game's index.mdx and that row/section just doesn't render.
      title: z.string(),
      cover: image(),
      order: z.number(),

      tagline: z.string().optional(),
      year: z.number().optional(),
      role: z.string().optional(),
      roles: z.array(z.string()).optional(),
      tools: z.array(z.string()).optional(),
      // "in-development" locks the game on the Design select screen: a
      // greyed-out "Coming soon" button instead of Start.
      status: z.enum(["shipped", "prototype", "in-development"]).optional(),
      award: z.string().optional(),
      accentColor: z.string().optional(),
      coverFit: z.enum(["cover", "contain"]).default("cover"),
      gallery: z.array(image()).optional(),
      trailerUrl: z.string().optional(),
      embedUrl: z.string().optional(),
      // Only needed for embeds whose build doesn't rescale itself to fit its
      // container (e.g. a Unity WebGL export with a fixed Default Canvas
      // Width/Height, unlike a Godot "canvas_items"/"keep" stretch build) —
      // when set, the embed is scaled to fit instead of stretched, avoiding
      // the crop that comes from a fixed-pixel canvas being forced to fill a
      // container it was never built to resize into.
      embedWidth: z.number().optional(),
      embedHeight: z.number().optional(),
      links: z.array(z.object({ label: z.string(), url: z.string() })).optional(),
      featured: z.boolean().default(false),
    }),
});

const breakdowns = defineCollection({
  loader: glob({ pattern: "**/[^_]*.{md,mdx}", base: "./src/content/breakdowns" }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      subject: z.string(),
      description: z.string(),
      pubDatetime: z.date().optional(),
      tags: z.array(z.string()).default([]),
      draft: z.boolean().default(false),
      // Shown in the hero (each breakdown's theme decides how).
      cover: image().optional(),
      // Each breakdown can have its own look on the shared case-file
      // layout (e.g. "slender": the eight pages). Omit for the plain one.
      theme: z.enum(["slender"]).optional(),
    }),
});

// Coding showcases: one video + a short write-up each. Same folder-per-entry
// layout as projects (src/content/coding/<slug>/index.mdx) so the slug is
// the URL: /portfolio/coding/<slug>.
const coding = defineCollection({
  loader: glob({
    pattern: "[^_]*/index.mdx",
    base: "./src/content/coding",
    generateId: ({ entry }) => entry.replace(/\/index\.mdx$/, ""),
  }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      // Just the video ID, e.g. "w5xJ80jdQc0" from youtube.com/watch?v=w5xJ80jdQc0.
      // Optional: a project with no video can show a live `demo` instead.
      youtubeId: z.string().optional(),
      // A built-in interactive demo shown in place of (or as well as) the video.
      demo: z.enum(["rail-fence"]).optional(),
      // Source code link, shown as `git remote -v`.
      repoUrl: z.url().optional(),
      // An animated .webp gameplay clip (convert GIFs to animated WebP first:
      // far smaller). Served as-is so the animation survives; `cover` is the
      // still shown instead when the visitor has reduced motion on.
      clip: image().optional(),
      // Shown as `type credits.txt`: what made what.
      credits: z
        .array(z.object({ label: z.string(), value: z.string(), url: z.url().optional() }))
        .optional(),
      order: z.number(),
      // Optional local poster. Without one, the YouTube thumbnail is used.
      cover: image().optional(),
      tagline: z.string().optional(),
      kind: z.string().optional(), // small label under the title, e.g. "Prototype"
      year: z.number().optional(),
      tools: z.array(z.string()).optional(),
      // Drawn as a `tree`. A plain string is one branch; { name, items } adds
      // sub-branches under it.
      features: z
        .array(
          z.union([
            z.string(),
            z.object({ name: z.string(), items: z.array(z.string()) }),
          ])
        )
        .optional(),
      // One of cmd's console colours by name (see src/components/coding/cmdColors.ts):
      // red, green, yellow, blue, purple, aqua, light-green, light-aqua,
      // light-yellow, light-purple, gray, olive, rose. Colours the project's name everywhere.
      color: z.enum(CMD_COLOR_NAMES).optional(),
    }),
});

// Narrative: the section is a book, each entry a chapter (one folder each).
// src/content/narrative/<slug>/index.mdx -> /portfolio/narrative/<slug>
const narrative = defineCollection({
  loader: glob({
    pattern: "[^_]*/index.mdx",
    base: "./src/content/narrative",
    generateId: ({ entry }) => entry.replace(/\/index\.mdx$/, ""),
  }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      order: z.number(),
      // Where it stands. Shown on the contents page and the chapter page.
      status: z.enum(["published", "in-game", "in-progress", "concept", "draft"]),
      // e.g. "Poetry collection", "Game dialogue", "Novel draft".
      kind: z.string(),
      year: z.number().optional(),
      // The opening line, set apart in italics at the top of the chapter.
      hook: z.string().optional(),
      cover: image().optional(),
      // The one entry shown as the frontispiece opposite the contents page.
      featured: z.boolean().default(false),
      // e.g. { label: "Paperback", note: "BookLeaf Publishing", url }
      links: z
        // url: a full link (opens in a new tab) or a site path like /portfolio/design/17ya.
        .array(z.object({ label: z.string(), note: z.string().optional(), url: z.string() }))
        .optional(),
      // The chapter page's own colours. Omit for plain book paper.
      palette: z
        .object({
          top: z.string(), // page background at the top...
          bottom: z.string(), // ...fading to this at the bottom
          ink: z.string(),
          muted: z.string(),
          accent: z.string(),
        })
        .optional(),
      // Turns the page into a descent: the hook and each paragraph become
      // one line revealed per stretch of scroll, a depth gauge counts as you
      // go, and a light waits at the bottom. Made for The Space Between Signals.
      descent: z.boolean().default(false),
      // Descent only: the last line, under the light at the very bottom.
      finale: z.string().optional(),
      // A custom title piece shown in place of the plain title text.
      titleArt: z.enum(["17ya-cipher"]).optional(),
    }),
});

export const collections = { posts, projects, breakdowns, coding, narrative };

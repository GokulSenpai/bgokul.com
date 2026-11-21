# bgokul.com

Personal portfolio for Gokul, an indie game developer. Built with Astro, hand-written CSS, and no framework theme — portfolio-led, not blog-led.

## Stack

- Astro + TypeScript (strict)
- MDX for content pages
- Hand-written CSS with a single token file (`src/styles/tokens.css`)
- Astro View Transitions (`<ClientRouter />`) + built-in hover prefetch
- Static output, deployed on Vercel

## Running locally

```sh
npm install
npm run dev
```

Build:

```sh
npm run build
npm run preview
```

## Adding a game (Design)

1. Copy `src/content/projects/_template/` to a new folder named after the game's slug (e.g. `src/content/projects/my-new-game/`).
2. Drop a cover image in that folder. Run `npm run convert-images -- <path-to-image>` first if it's not already a `.webp`.
3. Open the new folder's `index.mdx` and fill in whatever fields apply — every field except `title`, `cover`, and `order` is optional; delete any line you don't need and it just won't render (see `src/content.config.ts` for the full schema).
4. Write the case-study body in Markdown below the frontmatter.

It'll appear as a tile on `/portfolio/design` and get its own page at `/portfolio/design/<slug>` automatically — nothing else to wire up.

It'll automatically appear on `/work` and get a page at `/work/<slug>`.

## Adding a blog post

Create a new `.mdx` file in `src/content/blog/`, e.g. `src/content/blog/my-post.mdx`, with frontmatter matching the schema in `src/content/config.ts` (`title`, `description`, `pubDate`, `updatedDate?`, `tags`, `draft`). It appears on `/blog`, at `/blog/<slug>`, and in `/rss.xml` once `draft` is `false` (or omitted) in production.

## Adding a breakdown

Breakdowns are not a content collection: each one is a bespoke, individually themed page. To add one:

1. Create a new route at `src/pages/breakdowns/<slug>.astro`.
2. Use `BreakdownLayout.astro` (or skip layouts entirely) — breakdowns intentionally opt out of the site's global nav/footer and only keep a small "← bgokul.com" back link.
3. Give it its own scoped CSS and interactions. Don't reuse another breakdown's styling — the whole point is that each one is its own world.
4. If you need a genuinely reusable interaction (e.g. another paginated/collectible sequence), see `src/components/breakdowns/PaginatedSequence.astro` — extract only what's actually shared, skin it per-breakdown.
5. Add a card for it on `src/pages/breakdowns/index.astro`.

## Deployment

Connected to Vercel via the `GokulSenpai/bgokul.com` repo (`main` branch). Vercel should auto-detect the Astro static build (`astro build` → `dist/`). If a deploy ever comes up blank, check Vercel → Project → Settings → Build & Deployment → Framework Preset is set to **Astro**.

# Project brief: bgokul.com — personal portfolio for an indie game developer

## Context
I'm Gokul, an indie game developer (shipped 17YA, a psychological-horror point-and-click; building more). This is my personal portfolio at bgokul.com. It is PORTFOLIO-LED, NOT BLOG-LED. It must feel distinctive and characterful — not a generic dev-portfolio template. Static site, hosted on Vercel.

The GitHub repo (`GokulSenpai/bgokul.com`, branch `main`) and the Vercel project are already set up and live — a placeholder `index.html` currently serves at bgokul.com with a working custom domain + SSL. As part of scaffolding, REMOVE that placeholder `index.html`; the repo root should become a standard Astro project. After the first push of the real project, Vercel should auto-detect the Astro framework (build `astro build`, output `dist`); make sure `package.json` scripts are the Astro defaults so this detection is clean.

Do NOT base this on any existing blog theme (no AstroPaper, etc.). Start from a blank Astro project and build the architecture below.

## Stack (use exactly this)
- Astro (latest) + TypeScript (strict).
- MDX (@astrojs/mdx) for rich content pages.
- Hand-written scoped CSS + CSS custom properties for ALL styling. Do NOT use Tailwind or any CSS framework. Every visual decision (color, type scale, spacing, motion) lives as a CSS custom property in ONE tokens file, so the whole look can be re-skinned without touching structure.
- astro:assets for image optimization (media-heavy site: screenshots, GIFs — prefer looping muted video/webp over GIFs).
- Astro View Transitions (<ClientRouter />) for client-side navigation + smooth page-to-page transitions.
- Astro built-in prefetch (see Performance section) — this is a hard requirement, not a nice-to-have.
- Scroll-reveal via a small vanilla IntersectionObserver module. No jQuery, no animation libraries unless truly necessary.
- @astrojs/rss and @astrojs/sitemap.
- Static output. No server adapter (Vercel auto-detects Astro static builds).

## Performance & instant navigation (HARD REQUIREMENT)
The site must feel instant — no visible loading state between pages. The bar is "one of the fastest sites the visitor has ever used." Achieve it with:

- **Prefetch-on-hover.** Enable Astro's built-in prefetch in astro.config.mjs with `prefetchAll: true` and `defaultStrategy: 'hover'`. This fetches a link's destination the moment the user hovers/focuses it (and on touchstart for touch devices), so by the time they click, the page is already cached and paints instantly. Verify the exact prefetch config keys/values against the installed Astro version's docs before finalizing.
- **Prefetch + ClientRouter is the core of the effect.** With View Transitions doing client-side navigation and the target already prefetched, the next page renders immediately with a smooth transition instead of a reload/loading screen. Make sure both are wired and working together — test that hovering a nav link then clicking gives a near-instant swap.
- **Eager-prefetch the primary nav.** Since the top nav is a handful of always-visible links, mark those with `data-astro-prefetch="viewport"` (or `load`) so they're ready before the first hover.
- **Zero-JS-by-default.** Ship no client JS except the small scroll-reveal module and whatever a specific breakdown genuinely needs (use islands only where required).
- **Images.** astro:assets everywhere; always set explicit width/height to prevent layout shift; `loading="eager"` + `fetchpriority="high"` on the LCP hero image, `loading="lazy"` for anything below the fold; serve modern formats (webp/avif); prefer looping muted `<video>` over GIFs.
- **Fonts.** Self-host via @fontsource or local files, `font-display: swap`, and `<link rel="preload">` the single critical heading + body font files. No render-blocking third-party font CSS.
- **Respect `prefers-reduced-motion`** — disable view transitions, scroll-reveal, and any autoplay when set.

Note on breakdowns: bespoke breakdown pages can be heavier (custom interactions/assets). Hover-prefetch on their ENTRY links (from the breakdowns index) is still fine because it only fires on intent — but each breakdown page must independently stay lean: lazy-load its heavy assets and don't ship interaction JS until it's actually needed.

## Information architecture
Primary nav — four items: Work · Breakdowns · About · Blog
- Contact = a small persistent CTA in the corner/footer, NOT a nav tab.
- Resume = a downloadable PDF linked inside the About page, NOT a nav tab.

(If I decide I want Resume and Contact as their own top-level tabs instead, that's a small change — but default to the four-item nav above.)

## Three content types — treat them DIFFERENTLY (this is the core of the design)

### 1. Work (shipped games + prototypes) — a content collection
- Collection at src/content/projects/, entries in MDX.
- Zod schema in src/content/config.ts:
  title (string), tagline (string), year (number), role (string), tools (string[]),
  status ("shipped" | "prototype"), cover (image()), gallery (image()[], optional),
  trailerUrl (string, optional), links ({label,url}[], optional), featured (boolean, default false), order (number).
- src/pages/work/index.astro — grid of all projects (featured first) with a light filter by status/tool. Primary landing.
- src/pages/work/[...slug].astro — full case-study page: hero (cover or trailer), media gallery, the MDX writeup, role/year/tools metadata, external links.
- Prototypes get a LIGHTER treatment than shipped games (same collection, but de-emphasize visually: smaller hero, "prototype" label). Don't build separate machinery.
- Seed real content: create the 17YA entry as a complete, realistic example (psychological-horror point-and-click about Fatal Familial Insomnia — plausible placeholder copy I'll refine). Add two stub entries (a 2D western standoff revenge game; a top-down horror game) with minimal frontmatter + one line of body each, clearly marked placeholder, so the grid isn't empty.

### 2. Breakdowns (game-design analyses) — NOT a collection. Bespoke, themed pages.
This is the signature section. Each breakdown is a hand-crafted, individually themed experience whose FORM mirrors the game it analyzes (Slender breakdown = 8 pages you scroll/collect through; Papers Please = a passport you page through). They deliberately do NOT share a template.
- src/pages/breakdowns/index.astro — a striking landing listing available breakdowns as distinctive cards. This index DOES use consistent site chrome.
- Each breakdown = its own route (e.g. src/pages/breakdowns/slender.astro) with its OWN scoped CSS and interactions, free to drop the global nav/footer — it should feel like its own world, with only a small unobtrusive "← back to bgokul.com" affordance in a corner.
- For now, build the breakdowns index + a SLENDER STARTER: implement the "8 pages the reader collects/scrolls through" mechanic as a working skeleton (8 full-viewport scroll-snap sections with the collect-a-page framing), restrained placeholder styling and placeholder analysis text. Clearly mark that final Slender visual design comes later — the goal now is to PROVE the bespoke-page pattern, not finish it.
- Anticipate reuse WITHOUT over-building: if the Slender starter needs an obviously reusable interaction (e.g. a paginated themed sequence), extract it into src/components/breakdowns/ as a headless/minimal-styled primitive a breakdown skins. Only extract what Slender actually needs — do NOT speculatively build a toolkit.

### 3. Blog — a content collection, subordinate.
- Collection at src/content/blog/, MDX. Schema: title, description, pubDate, updatedDate?, tags (string[]), draft (boolean, default false).
- src/pages/blog/index.astro (newest first, exclude drafts in prod) + src/pages/blog/[...slug].astro (clean, readable long-form layout).
- RSS feed at /rss.xml. Seed one placeholder post.
- Visually calm and text-forward — inherits site tokens but reads as the quiet "reading room," not competing with Work/Breakdowns.

## Design tokens & starting aesthetic
- Central tokens file src/styles/tokens.css (imported globally): CSS custom properties for color, type scale, spacing scale, radii, motion durations/easings.
- Starting direction: dark, textured, editorial, a little cinematic — fitting a psychological-horror developer. Pick a tasteful characterful font pairing (display/serif headings + clean sans body; @fontsource or self-hosted, preloaded, not render-blocking). Keep it RESTRAINED — this is a starting point we iterate on together; the value is that every visual decision is one token I can change. Do NOT chase any specific existing template's look.
- Include: global reset, base typography, focus-visible styles, and prefers-reduced-motion handling that disables scroll-reveal + view transitions.

## Layouts & components
- src/layouts/BaseLayout.astro — global chrome: nav, footer with contact CTA, <ClientRouter />, SEO/head (title, description, canonical, Open Graph, Twitter). Most pages use this.
- Breakdowns opt OUT of BaseLayout (or use a minimal BreakdownLayout.astro providing only the back affordance + head/SEO).
- Components: Nav.astro, Footer.astro, ProjectCard.astro, BreakdownCard.astro, SEO.astro, and a ScrollReveal wrapper or a small scroll-reveal.ts client module (IntersectionObserver).
- Pages: home (index.astro — distinctive front door: hero, featured work, a breakdowns teaser, latest post), about.astro (bio + resume download + contact), plus the section pages above.

## Quality bars
- Semantic HTML, landmarks, keyboard-navigable, visible focus states, alt text.
- Fast: static output, prefetch + ClientRouter, optimized images, minimal JS, zero jQuery. Aim for top-tier Lighthouse/Core Web Vitals.
- Responsive, mobile-first (I target mobile + desktop).
- SEO: per-page meta + Open Graph, sitemap, RSS.

## Repo & deploy
- The repo already exists and is connected to Vercel. Remove the placeholder index.html, scaffold Astro into the repo, add a sensible .gitignore (Astro's generated one is fine), and write a README.md covering: how to run (npm install, npm run dev), how to add a project (new MDX in src/content/projects/), how to add a blog post, how to add a new breakdown (new route in src/pages/breakdowns/).
- Ensure `npm run build` produces a clean static dist/. After first push, if the live site is blank or the build fails, the fix is Vercel → Project → Settings → Build & Deployment → Framework Preset = Astro; but it should auto-detect.

## How to work
Build in THIS ORDER, and show me the structure + explain decisions as you go — don't dump everything silently:
1. Scaffold Astro into the repo (remove placeholder index.html) + config + dependencies + prefetch/ClientRouter wired.
2. Tokens + global styles + base layout + nav/footer.
3. Content collections + schemas.
4. Work index + the 17YA case-study page (the vertical slice — make this look real).
5. Blog index + post + RSS.
6. Breakdowns index + Slender starter.
Then run the dev server, confirm prefetch + instant navigation actually works (hover a nav link, click, verify near-instant swap), and summarize what exists, what's placeholder, and what we design next. Ask me before any large structural decision that diverges from this brief.

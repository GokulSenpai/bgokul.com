# Adding to the site

Everything is driven by the content folders. Add a file or folder and the
lists, counts, menus, cartridges, contents pages and next/previous links all
update on their own. Each section has a `_template` to copy (anything starting
with `_` is skipped, so templates never appear on the site).

| Section | Copy this | Into | URL |
| --- | --- | --- | --- |
| Design (a game) | `src/content/projects/_template/` | `src/content/projects/<slug>/` | `/portfolio/design/<slug>` |
| Narrative (a chapter) | `src/content/narrative/_template/` | `src/content/narrative/<slug>/` | `/portfolio/narrative/<slug>` |
| Coding (a project) | `src/content/coding/_template/` | `src/content/coding/<slug>/` | `/portfolio/coding/<slug>` |
| Breakdowns (a case file) | `src/content/breakdowns/_template.mdx` | `src/content/breakdowns/<slug>/index.mdx` | `/portfolio/breakdowns/<slug>` |
| Journal (an entry) | `src/content/posts/_template.mdx` | `src/content/posts/<slug>.mdx` | `/blog/<slug>` |

Each template explains every field in its comments. In short:

- **Design:** put the cover image in the folder, set `order` (shelf position) and
  `accentColor` (the cartridge's colour). Set `status: in-development` to lock it.
- **Narrative:** `order` numbers the chapter; `palette` gives it its own colours.
- **Coding:** `color` is one of cmd's colours; `youtubeId` adds the video.
  The first nine folders get number keys (1-9) automatically.
- **Breakdowns:** plain case-file style by default. A breakdown can have its own
  look with `theme:` (see `src/components/breakdowns/SlenderTheme.astro` for how).
- **Journal:** images go in `src/content/posts/_media/`. `featured: true` puts an
  entry at the top. Lists page themselves (Journal shows the latest 7; "All
  entries" pages through the rest).

Images: run `npm run convert-images -- "path/to/image.png"` to make a small
`.webp` first. Raw source art lives in `game images/`, which isn't uploaded.

## Achievements

All in `src/scripts/achievements.ts`:

1. Add an entry to `ACHIEVEMENTS` (id, title, desc, a plain hint, an icon from
   `src/components/achievements/PixelIcon.astro`, and its class as `type`:
   scholar, gamer, tinkerer, wanderer or bard).
2. Add where it happens to `WHERE` (the "Go" link on the Achievements screen).
3. Call `unlock("its-id")` wherever it happens.

The menu count, the Achievements screen, the visitor's class and the platinum all
update by themselves.

## Tips on the main menu

`src/data/homeTips.ts`: one line each. `{other}` becomes "after dark" or
"in daylight".

## Sounds

Every sound is made in the browser, in `src/components/home/bootSound.ts`
(no audio files). Each one is a short function you can call from a page.

## Publishing

1. `npm run build` checks everything and builds the site (it must finish with
   0 errors).
2. Commit and push to GitHub. Vercel builds and deploys `bgokul.com` from it.

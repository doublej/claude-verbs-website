# Claude Verbs

> Platform to exchange Claude Verbs sets

## Stack

- TypeScript, bun, Biome, Vitest
- SvelteKit + Vite
- PixiJS v8 (home page CRT terminal animation)

## Commands

Use `just` as the task runner:

- `just install` — init submodule + install deps
- `just check` — run all checks (loc-check + lint + typecheck + test)
- `just loc-check` — check file lengths (warn >300, error >400 lines)
- `just dev` — start dev server
- `just build` — production build (runs og:generate + vite build)
- `just preview` — preview production build
- `just sync` — sync SvelteKit types
- `just test` — run tests
- `just lint-fix` — auto-fix lint issues
- `just fetch-authors` — fetch GitHub author data
- `just sync-sets` — sync sets from community repo
- `just clean` — remove build caches

## Project Structure

```
src/
├── routes/
│   ├── +layout.svelte            # root layout
│   ├── [locale]/
│   │   ├── +layout.server.ts     # locale resolution
│   │   ├── +page.svelte          # home page (PixiJS canvas)
│   │   ├── +page.server.ts       # home page server load
│   │   ├── marketplace/
│   │   │   └── +page.server.ts   # marketplace server load
│   │   └── [set]/
│   │       ├── +page.svelte      # single set page
│   │       └── +page.server.ts   # set server load
│   └── mobile/
│       ├── +page.svelte          # mobile landing page
│       └── +page.server.ts       # mobile server load
├── lib/
│   ├── data/
│   │   ├── types.ts              # VerbSet, Author interfaces
│   │   ├── sets.ts               # loads verb set JSON files
│   │   ├── claude-verbs/         # git submodule (doublej/claude-verbs)
│   │   ├── authors.ts            # build-time GitHub fetch script
│   │   ├── authors.json          # cached GitHub author data
│   │   ├── contributors.json     # contributor data
│   │   ├── set-dates.json        # set creation dates from git history
│   │   └── lang-names.ts         # language code → display name
│   ├── locale.ts                 # locale detection + helpers
│   ├── theme.svelte.ts           # theme (light/dark) state
│   ├── seo/
│   │   └── og.ts                 # Open Graph meta helpers
│   ├── og/
│   │   ├── generate.ts           # OG image generator script
│   │   └── template.ts           # OG image template
│   ├── pixi/                     # PixiJS v8 modules (home page)
│   │   ├── app.ts                # createApp() entry point
│   │   ├── app-helpers.ts        # state entry/exit, startDemo
│   │   ├── boot.ts               # PixiJS bootstrap
│   │   ├── scene.ts              # scene graph setup
│   │   ├── state-machine.ts      # state enum + dispatch
│   │   ├── layout.ts             # layout computation
│   │   ├── events.ts             # event factories
│   │   ├── header.ts             # ASCII box header
│   │   ├── intro.ts              # intro animation
│   │   ├── camera.ts             # perspective mesh
│   │   ├── text-pool.ts          # Text object pool
│   │   ├── ticker.ts             # animation tick loop
│   │   ├── params.ts             # tweakable parameters
│   │   ├── config.ts             # app configuration
│   │   ├── constants.ts          # colours, frames, font
│   │   ├── helpers.ts            # utility functions
│   │   ├── zoom.ts               # zoom controls
│   │   ├── scroll-zoom.ts        # scroll-based zoom
│   │   ├── brightness-bar.ts     # brightness control bar
│   │   ├── tween-group.ts        # tween animation group
│   │   ├── esc-skip.ts           # ESC key skip handler
│   │   ├── debug-focus.ts        # dev focus debugging
│   │   ├── mobile.ts             # mobile detection/handling
│   │   ├── devtools.ts           # Tweakpane dev panel
│   │   └── effects/              # CRT visual effects
│   │       ├── lcd.ts            # LCD subpixel pattern
│   │       ├── dead-pixels.ts    # dead pixel overlay
│   │       ├── dof.ts            # depth of field effect
│   │       ├── breathing.ts      # breathing animation
│   │       └── flicker.ts        # screen flicker (easter egg)
│   └── components/               # Svelte components
│       ├── Gallery.svelte        # verb set gallery by language
│       ├── VerbCard.svelte       # expandable verb set card
│       ├── AuthorPopup.svelte    # GitHub author hover popup
│       ├── Contributors.svelte   # contributors section
│       ├── ThemeToggle.svelte    # light/dark mode toggle
│       └── SpinnerDemo.svelte    # animated spinner demo
└── app.html                      # HTML shell
```

## Conventions

- ES modules (`"type": "module"`)
- Strict TypeScript config
- Biome for linting and formatting (not ESLint/Prettier)
- SvelteKit file-based routing (`src/routes/`)
- Shared code in `src/lib/`
- Keep functions small (5–10 lines target, 20 max)
- Prefer explicit, readable code over cleverness
- Handle errors at boundaries; let unexpected errors surface

See [agent.md](agent.md) for AI coding agent workflow and guidelines.

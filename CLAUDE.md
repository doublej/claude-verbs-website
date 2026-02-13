# Claude Verbs

> Platform to exchange Claude Verbs sets

## Stack

- TypeScript, bun, Biome, Vitest
- SvelteKit + Vite
- PixiJS v8 (home page CRT terminal animation)

## Commands

Use `just` as the task runner:

- `just check` — run all checks (loc-check + lint + typecheck + test)
- `just loc-check` — check file lengths (warn >300, error >400 lines)
- `just dev` — start dev server
- `just build` — production build
- `just preview` — preview production build
- `just sync` — sync SvelteKit types
- `just test` — run tests
- `just lint-fix` — auto-fix lint issues
- `just fetch-authors` — fetch GitHub author data into authors.json

## Project Structure

```
src/
├── routes/
│   ├── +page.svelte              # home page (PixiJS canvas)
│   └── marketplace/
│       ├── +page.svelte          # marketplace page
│       └── +page.server.ts       # server load (sets + authors)
├── lib/
│   ├── data/
│   │   ├── types.ts              # VerbSet, Author interfaces
│   │   ├── sets.ts               # loads verb set JSON files
│   │   ├── claude-verbs/         # git submodule (doublej/claude-verbs)
│   │   ├── authors.ts            # build-time GitHub fetch script
│   │   ├── authors.json          # generated author data
│   │   └── lang-names.ts         # language code → display name
│   ├── pixi/                     # PixiJS v8 modules (home page)
│   │   ├── app.ts                # createApp() entry point
│   │   ├── scene.ts              # scene graph setup
│   │   ├── state-machine.ts      # state enum + dispatch
│   │   ├── layout.ts             # layout computation
│   │   ├── events.ts             # event factories
│   │   ├── header.ts             # ASCII box header
│   │   ├── camera.ts             # perspective mesh
│   │   ├── text-pool.ts          # Text object pool
│   │   ├── params.ts             # tweakable parameters
│   │   ├── constants.ts          # colours, frames, font
│   │   ├── helpers.ts            # utility functions
│   │   ├── devtools.ts           # Tweakpane dev panel
│   │   └── effects/              # CRT visual effects
│   │       ├── lcd.ts            # LCD subpixel pattern
│   │       ├── dead-pixels.ts    # dead pixel overlay
│   │       ├── glare.ts          # radial gradient glare
│   │       └── flicker.ts        # screen flicker (easter egg)
│   └── components/               # Svelte components (marketplace)
│       ├── Gallery.svelte        # verb set gallery by language
│       ├── VerbCard.svelte       # expandable verb set card
│       ├── AuthorPopup.svelte    # GitHub author hover popup
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

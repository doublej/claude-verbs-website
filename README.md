# Claude Verbs Website

Private website for browsing and previewing Claude Verbs sets.

- This site is private.
- Set submissions happen in [doublej/claude-verbs](https://github.com/doublej/claude-verbs), not in this website repository.

## Requirements

- [Bun](https://bun.sh/)

## Getting Started

```bash
bun install
bun run dev
```

## Common Commands

| Command | Description |
|---------|-------------|
| `bun install` | Install dependencies |
| `bun run dev` | Start Vite dev server |
| `bun run og:generate` | Generate per-set Open Graph cards into `static/og/sets/` |
| `bun run build` | Build for production |
| `bun run preview` | Preview production build |
| `bun run check` | Type-check with svelte-check |
| `bun run test` | Run tests |
| `bun run lint` | Lint with Biome |

## Open Graph Images

- A build-time generator creates one OG image per set at `static/og/sets/<set-name>.png`.
- Generated set images are build artifacts and are not committed.
- The fallback OG image at `static/og/default.png` is committed and used as the stable default asset.
- `bun run build` runs `bun run og:generate` automatically before Vite build.

## Submission Flow (for website copy/links)

Website contribution calls-to-action should send users to:

- [doublej/claude-verbs](https://github.com/doublej/claude-verbs)
- [doublej/claude-verbs/CONTRIBUTING.md](https://github.com/doublej/claude-verbs/blob/main/CONTRIBUTING.md)

Contributors should include an author manifest in their PR description with:

- GitHub profile URL
- Top 3 projects (name, URL, short description)
- Generic one-sentence description

## Project Structure

```text
src/
  app.html             # HTML template
  routes/+page.svelte  # Home page
```

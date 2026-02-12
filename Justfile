set shell := ["zsh", "-eu", "-o", "pipefail", "-c"]

default:
    @just --list
    @echo ''
    @echo "branch: $(git branch --show-current 2>/dev/null || echo 'n/a')"

[group('setup')]
install:
    git submodule update --init
    bun install

[group('develop')]
dev:
    bun run dev

[group('develop')]
preview:
    bun run preview

[group('develop')]
sync:
    bunx svelte-kit sync

[group('quality')]
lint:
    bun run lint

[group('quality')]
lint-fix:
    bun run lint:fix

[group('quality')]
typecheck:
    bun run check

[group('quality')]
test:
    bun run test

[group('quality')]
loc-check:
    #!/usr/bin/env zsh
    setopt null_glob
    err=0
    for f in src/**/*.{ts,js,svelte,css}; do
        lines=$(wc -l < "$f")
        if (( lines > 400 )); then echo "error: $f ($lines lines, max 400)"; err=1
        elif (( lines > 300 )); then echo "warn: $f ($lines lines, target ≤300)"; fi
    done
    exit $err

[group('quality')]
check:
    @echo '→ Checking file lengths...'
    just loc-check
    @echo '→ Running lint...'
    just lint
    @echo '→ Running typecheck...'
    just typecheck
    @echo '→ Running tests...'
    just test

[group('data')]
fetch-authors:
    bun run src/lib/data/authors.ts

[group('build')]
build:
    bun run build

[group('data')]
sync-sets:
    rm -rf src/lib/data/sets/en src/lib/data/sets/nl
    cp -r ../claude-verbs/en ../claude-verbs/nl src/lib/data/sets/
    cp ../claude-verbs/schema.json src/lib/data/sets/schema.json

[group('cleanup')]
clean:
    rm -rf .svelte-kit/ build/ node_modules/.cache/

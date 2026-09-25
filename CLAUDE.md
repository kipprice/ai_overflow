# AI Overflow

Tauri 2 desktop app (Rust backend in `src-tauri/`, SvelteKit + Svelte 5 frontend in `src/`) that keeps a single persistent feed of AI questions/answers across context clears.

## Coding standards (Rust and Svelte/TypeScript)

- **Prefer human-readable code** over clever code. Break complex logic into small, well-named sub-functions (or sub-components).
- **Keep files under 100 lines.** When a file grows past that, split it: focused submodules in Rust, smaller components / `.ts` helper modules in Svelte.
- Follow **SRP** (one responsibility per module, component or function), **DRY** (extract shared helpers rather than copy-pasting), and **KISS** (the simplest thing that works; no speculative abstractions).

### Rust

- Document every public function with idiomatic `///` doc comments covering:
  - what it does and *why* it exists,
  - an `# Arguments` section listing each argument (omit only when there are none),
  - a `# Returns` section describing the return value (omit only when it returns `()`),
  - an `# Errors` section when it returns `Result`.
- Every module starts with a `//!` comment describing its responsibility.

### Svelte / TypeScript

- Write idiomatic Svelte 5: runes (`$state`, `$derived`, `$effect`, `$props`), callback props instead of event dispatchers, `{#snippet}` instead of slots.
- Document every exported function, class and store with a `/** */` JSDoc comment covering what it does and why, `@param` for each argument, and `@returns` when it returns a value.
- Every component begins with a short `<!-- -->` comment describing its responsibility, and its props are typed.
- Keep components presentational where possible: state and side effects (persistence, IPC, streaming) live in `.svelte.ts` / `.ts` modules under `src/lib/`, not in component markup.

# Plan: add Gemini CLI as a supported harness

**Status:** proposed, not started
**Date:** 2026-10-10
**Target:** `gemini` CLI v0.61.0

## Goal

Add Google's Gemini as a third harness alongside `claude` and `ollama`, driving the locally
installed `gemini` CLI rather than the Gemini API directly. As with Claude, this means the
user's existing CLI login is reused and no API key is ever stored in or handled by the app.

## Verified CLI behaviour

Everything below was confirmed against the installed CLI (v0.61.0), not assumed from docs.
These findings drive the design decisions in the next section.

### What maps cleanly onto the Claude harness

| Capability | Claude | Gemini |
| --- | --- | --- |
| Headless streaming | `-p --output-format stream-json` | `-p -o stream-json` |
| Prompt over stdin | yes | yes, with `-p ""` |
| Session continuity | `--resume <id> --fork-session` | `--resume <uuid>` |
| Session id reported | on the `result` line | on the `init` line |
| Tool calls | ✅ | ✅ (`google_web_search`, `web_fetch`) |
| One-shot JSON | `--output-format json` → `result` | `-o json` → `response` |

`--resume <uuid>` is **undocumented** — `--help` advertises only `latest` and an index number —
but it works, and the resumed session's context does carry over. Sessions are scoped to the
project directory, which is what makes resume-by-uuid reliable: the cwd must stay stable.

### stream-json event shapes

```jsonc
{"type":"init","session_id":"…","model":"auto"}
{"type":"message","role":"user","content":"…"}                       // echo of our own prompt
{"type":"message","role":"assistant","content":"banana","delta":true}
{"type":"tool_use","tool_name":"google_web_search","tool_id":"…","parameters":{"query":"…"}}
{"type":"tool_result","tool_id":"…","status":"success","output":"…"}
{"type":"error","severity":"warning"|"error","message":"…"}
{"type":"result","status":"success"|"error","stats":{…},"error":{"type","message"}}
```

### Constraints that differ from Claude

1. **No thinking stream.** `type: "thought"` exists in the CLI bundle but only on the
   interactive and ACP paths. The headless stream-json loop handles only `content`,
   `tool_call_request`, `loop_detected`, `max_session_turns`, `error` and
   `agent_execution_stopped`. `exchange.thinking` will stay empty for Gemini.
   `ExchangeView.svelte` already guards with `{#if exchange.thinking}`, so nothing breaks —
   the Reasoning disclosure simply won't render.
2. **Trusted-folder gating.** Without `--skip-trust` the CLI exits 55 and refuses to run.
3. **No `--append-system-prompt` equivalent.** `GEMINI_SYSTEM_MD` *replaces* the whole system
   prompt (traced to `renderFinalShell(basePrompt, userMemory, contextFilenames)`), which would
   strip the tool instructions and break web search. The append mechanism is a `GEMINI.md`
   context file in the cwd, which is appended to the base prompt regardless.
4. **No `--effort` flag.** The effort picker must stay hidden for Gemini.
5. **No `--no-session-persistence`.** Every theme-extraction call leaves a session file in
   `~/.gemini/history`. Minor clutter; no simple mitigation. Accepted for now.
6. **`-o json` has no `is_error` boolean.** Success is `{session_id, response, stats}`; failure
   is `{session_id?, error: {type, message, code?}}`. Presence of the `error` key signals
   failure.

## Design decisions

### Do not expose a `geminiCwd` setting

The focus prompt has to reach Gemini as a `GEMINI.md` written into the cwd. If the user could
point that cwd at a real project, the app would clobber their own `GEMINI.md`.

Keeping Gemini pinned to an app-owned private workspace:

- makes the `GEMINI.md` write unambiguously safe,
- keeps Gemini's sessions scoped to one stable directory, which is what `--resume` relies on,
- is a single code path (no "is this folder ours?" branch).

Claude needs its cwd setting for project context and slash commands; Gemini here does not.
Adding an override later only requires guarding the write.

### Give Gemini its own workspace folder

Generalize `default_workspace` to take a harness so Gemini gets its own directory. This keeps
`CLAUDE.md` and `GEMINI.md` from sharing a folder and keeps Gemini's project-scoped session
history separate.

### Restrict tools to the read-only pair

Pass `--allowed-tools google_web_search web_fetch`, mirroring Claude's
`--allowedTools WebSearch WebFetch`. This keeps `run_shell_command`, `write_file`, `replace`
and `save_memory` out of a Q&A app. The flag is marked deprecated in favour of the Policy
Engine; migrating is a follow-up, not a blocker.

Note: `--approval-mode plan` was considered and rejected — it rewrites the system prompt into
planning behaviour, which is wrong for Q&A.

### Map errors onto the existing `Done` event

On `result` with `status: "error"`, emit `Done { is_error: true, result: Some(error.message) }`.
`apply-event.ts` already reads `event.result` for the error text, so no frontend change is
needed for the error path.

## Phase 1 — Shared extraction

Three pieces of the Claude module are only incidentally Claude-specific. Extracting them before
adding a third harness avoids copy-paste and keeps every file under the 100-line limit.

1. **New `src-tauri/src/cli.rs`** — `command(exe)`, `spawn_with_input(cmd, input)`,
   `failure_message(child, exe_name)`. Moved from `claude/cli.rs` and `claude/failure.rs`; the
   only change is that the hardcoded `"claude exited without a result"` becomes a parameter.
   Delete `claude/failure.rs`.
2. **Move `claude/tool_detail.rs` → `src-tauri/src/tool_detail.rs`.** Its `DESCRIPTIVE_FIELDS`
   already covers Gemini's `query` / `file_path` / `command` / `pattern`, so it works unchanged.
3. **`env.rs`: `resolve_claude` → `resolve_cli(name, override_path, hint)`.** After this,
   `claude/cli.rs` and `gemini/cli.rs` hold only their own argument builders.

## Phase 2 — Gemini backend (`src-tauri/src/gemini/`)

Mirrors the structure of `src-tauri/src/claude/`.

4. **`cli.rs`**
   - `chat_args(model, resume)` →
     `-p "" -o stream-json --skip-trust --model <m> --allowed-tools google_web_search web_fetch`
     plus `--resume <uuid>` when continuing a context.
   - `theme_args(model)` → `-o json` with `GEMINI_SYSTEM_MD` pointing at a temp file holding
     `theme::SYSTEM_PROMPT` (replace semantics are correct here — the theme call wants no tools).
5. **`workspace.rs`** — idempotently writes `focus::SYSTEM_PROMPT` to `<workspace>/GEMINI.md`
   on each turn. Cheap and self-healing.
6. **`parser.rs`** — translates the event shapes above into `ChatEvent`:
   - `init` → hold `session_id`, attach it to the final `Done`. No `Commands` event; Gemini's
     `init` does not advertise slash commands.
   - `message` with `role: "assistant"` → `Text`. Ignore `role: "user"` (it is the echo of our
     own prompt).
   - `tool_use` → `Tool { name: tool_name, detail: tool_detail(parameters) }`.
   - `tool_result` → ignored for now.
   - `result` → `Done`, with the error mapping described above.
7. **`chat.rs`, `theme.rs`, `status.rs`** — near-mirrors of the Claude equivalents. `theme.rs`
   reads `response` rather than `result` and treats the presence of an `error` key as failure.
8. **`parser_tests.rs`** — table-driven tests over the captured real output, covering the
   `delta` flag assumption and the error-result path.
9. **`lib.rs`** — register `gemini_send`, `gemini_theme`, `gemini_status`; generalize
   `default_workspace` to take a harness.

## Phase 3 — Frontend

10. **`types.ts`** — widen `Harness` to `'claude' | 'ollama' | 'gemini'`; add `geminiModel`,
    `geminiPath` and `themeGeminiModel` to `Settings`, and `geminiSessionId` to `Topic`.
    Widening the union makes the compiler enumerate every site that needs updating.
11. **`transcript.ts`: generalize `claudePrompt` → `harnessPrompt(prior, question, harness)`.**
    This is a correctness item, not cosmetics. That function replays turns answered by *other*
    harnesses since the last turn of its own. Left Claude-specific, a
    Claude → Gemini → Claude context would silently drop the Gemini turn from Claude's context.
12. **`models.ts`** — add `GEMINI_MODELS` (`auto`, `gemini-3-pro-preview`,
    `gemini-3-flash-preview`, `gemini-3.5-flash`, `gemini-3.5-flash-lite`), all with
    `efforts: []`. Add a `modelLabel(harness, id)` helper so `ExchangeMeta.svelte` stops
    resolving every model against `CLAUDE_MODELS`.
13. **`ipc/harness.ts` / `ipc/system.ts`** — `geminiSend`, `geminiStatus`, and the
    `extractTheme` branch.
14. **`state/`** — `defaults.ts` (new settings, theme default `gemini-3.5-flash-lite`),
    `chat.svelte.ts` (`startTurn` and `newExchange`), `effort.ts` (Gemini has no effort),
    `commands.ts` (small static Gemini list; `/clear` stays app-handled).
15. **Components** — `ModelPicker`, `ConnectionSettings`, `ThemeSettings`: the two-branch
    `{#if claude}{:else}` shapes become three-way. `ConnectionSettings` gains a Gemini fieldset
    with a CLI-path override and a version health check.

## Phase 4 — Verification

16. `cargo test`, `cargo clippy`, `pnpm check`, then a real run exercising:
    - a Gemini turn end to end,
    - a follow-up question (proves `--resume` carried context),
    - cancel mid-stream,
    - `/clear` triggering Gemini theme extraction,
    - a mixed Claude/Gemini context (exercises step 11),
    - a `gemini-3-pro-preview` turn (see quota caveat below).

## Risks and watch items

- **Cancellation semantics differ.** Claude passes `--fork-session` so an abandoned turn never
  joins the conversation. Gemini has no fork flag. `kill_on_drop` most likely prevents the
  session write entirely, making cancellation naturally safe — but confirm in step 16. If a
  partial turn does persist, fork manually with `--resume <old> --session-id <new>`.
- **Benign stderr noise.** Gemini writes warnings to stderr even on success
  ("256-color support not detected", "Ripgrep is not available", plus API retry stack traces).
  `failure_message` surfaces stderr when no result line arrives, so filter these known-benign
  lines or genuine errors will be buried.
- **`delta` flag assumption.** The headless path only ever emits assistant messages with
  `delta: true`, so the parser appends content unconditionally. If a future version emits a
  final non-delta message alongside the deltas, text would double. The parser test should pin
  this assumption so the break is loud.
- **PATH discovery.** `gemini` installs under nvm
  (`~/.nvm/versions/node/<version>/bin`), which *is* on the login-shell PATH on this machine, so
  auto-detect works today. It is version-pinned, though, so an nvm switch would break it — the
  Settings path override covers that case.
- **Quota during testing.** `gemini-3-pro-preview` returned "exceeded your current quota" and
  the default model hit 429 retry loops while probing. Streaming, resume and theme extraction
  were validated on `auto` and `gemini-3.5-flash-lite`. The pro path is the same code but
  warrants a manual check.

## Deferred

- Migrate `--allowed-tools` to the Policy Engine (`--policy`).
- Thinking stream for Gemini would require ACP mode (`--acp`, `agent_thought_chunk` events) —
  a much larger change than this plan.
- Cleaning up theme-extraction session files in `~/.gemini/history`.

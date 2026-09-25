# AI Overflow

This is a simple context manager for AI agents that mimics a Stack Overflow
style Q&A. You can add /clear at any time to reset the context and ask a new
question. All previous questions are automatically preserved within your
session, and you can spin up multiple sessions.

Currently, this supports Ollama and Claude as harnesses. Gemini is WIP. 

## Running the app

Run the following:
```bash

# install all dependencies
pnpm i

# create the standalone application for use
pnpm tauri build
```

## Local development

```bash
pnpm i
pnpm tauri dev
```
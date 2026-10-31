# MeetingPilot — Project Rules

> **Any AI continuing this work: read PROGRESS.md and ARCHITECTURE.md first.**

## What this is
MeetingPilot is a hackathon prototype: an AI agent that turns meeting transcripts into confirmed, tracked tasks with cross-meeting memory and conflict detection. ~70% production-complete core flow, not a mockup.

## Stack
- **Backend**: Node.js v24 built-in modules only (http, node:sqlite DatabaseSync, fs, path, crypto, fetch). Zero npm dependencies for server.
- **Frontend**: React 18 + Vite + Tailwind CSS 3 + Framer Motion + Lucide React. Dependencies symlinked from `../hepatwin/node_modules`.
- **LLM**: Gemini API via `server/llm/provider.js`. Model/key from `.env`. Provider abstraction allows model swap.
- **Tracker**: Adapter pattern — TrelloAdapter (REST) with LocalKanbanAdapter fallback.
- **DB**: SQLite via `node:sqlite` (DatabaseSync). File: `server/data/meetingpilot.db`.

## Commands
```bash
# Start everything (server + frontend):
cd "E:\Antigravity Projects\meetingpilot"
E:\node.exe --experimental-sqlite server/dev-runner.js

# Server only:
E:\node.exe --experimental-sqlite server/index.js

# Frontend only:
E:\node.exe client/node_modules/vite/bin/vite.js --config client/vite.config.js
```

## Conventions
- No file over ~300 lines. Split when it grows.
- No placeholder TODO logic in core pipeline. Stubbed things go in PROGRESS.md.
- LLM responses validated with schema checker + 2 retries.
- Nothing syncs to tracker without explicit user confirmation (POST /api/sync with approved IDs).
- Demo mode returns pre-cached JSON so the demo never fails. Toggle in UI and .env.
- Every extracted item carries a verbatim `evidence_quote` from the transcript.

## Environment
- Node binary: `E:\node.exe` (v24.22.0)
- Project: `E:\Antigravity Projects\meetingpilot`
- Frontend deps: symlinked from `E:\Antigravity Projects\hepatwin\node_modules`
- No npm/npx available. Backend uses zero external packages.

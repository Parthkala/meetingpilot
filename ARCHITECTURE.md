# MeetingPilot — Architecture

## Folder Structure
```
meetingpilot/
├── AGENTS.md
├── ARCHITECTURE.md
├── PROGRESS.md
├── package.json
├── .env.example
├── .env                    # local, gitignored
├── server/
│   ├── index.js            # HTTP server, router, CORS
│   ├── db.js               # SQLite setup + schema
│   ├── env.js              # .env parser
│   ├── dev-runner.js       # starts server + vite together
│   ├── seed.js             # demo transcripts
│   ├── demo-cache.js       # pre-built LLM responses for demo mode
│   ├── data/               # SQLite DB file lives here
│   ├── llm/
│   │   ├── provider.js     # Gemini API call, retry, validation
│   │   ├── prompts.js      # system prompt + user prompt builder
│   │   └── schema.js       # response validation (Zod-like, no deps)
│   ├── tracker/
│   │   ├── index.js        # factory: Trello → LocalKanban fallback
│   │   ├── adapter.js      # interface definition
│   │   ├── trello.js       # Trello REST adapter
│   │   └── local-kanban.js # SQLite-backed local board
│   ├── routes/
│   │   ├── health.js       # GET /api/health
│   │   ├── meetings.js     # meetings CRUD + analyze pipeline
│   │   ├── actions.js      # action items CRUD + sync + kanban + timeline
│   │   └── demo.js         # demo seed + status
│   └── utils/
│       └── evidence.js     # evidence_quote → line number matcher
├── client/
│   ├── index.html
│   ├── vite.config.js
│   ├── postcss.config.js
│   ├── tailwind.config.js
│   ├── node_modules/       # symlink → ../hepatwin/node_modules
│   └── src/
│       ├── main.jsx
│       ├── App.jsx
│       ├── index.css
│       ├── api.js          # fetch wrapper for all endpoints
│       ├── store.js        # simple React context store
│       ├── components/
│       │   ├── Layout.jsx
│       │   ├── TranscriptPanel.jsx
│       │   ├── ResultsPanel.jsx
│       │   ├── MemoryPanel.jsx
│       │   ├── ConflictBanner.jsx
│       │   ├── ActionCard.jsx
│       │   ├── DecisionCard.jsx
│       │   ├── SyncBar.jsx
│       │   ├── KanbanView.jsx
│       │   ├── Timeline.jsx
│       │   ├── DigestModal.jsx  # weekly digest
│       │   └── ui/
│       │       ├── Badge.jsx
│       │       ├── Button.jsx
│       │       ├── Toast.jsx
│       │       └── Skeleton.jsx
│       └── hooks/
│           └── useAnalysis.js
```

## Data Models

### meetings
| Column | Type | Notes |
|--------|------|-------|
| id | TEXT PK | crypto.randomUUID() |
| title | TEXT | |
| date | TEXT | ISO date string |
| transcript | TEXT | |
| summary | TEXT | LLM-generated |
| created_at | TEXT | ISO timestamp |

### decisions
| Column | Type | Notes |
|--------|------|-------|
| id | TEXT PK | |
| meeting_id | TEXT FK | |
| text | TEXT | the decision |
| evidence_quote | TEXT | verbatim from transcript |
| evidence_line_start | INT | matched line |
| evidence_line_end | INT | matched line |

### action_items
| Column | Type | Notes |
|--------|------|-------|
| id | TEXT PK | |
| meeting_id | TEXT FK | |
| title | TEXT | |
| owner | TEXT | |
| deadline_iso | TEXT | resolved date |
| deadline_raw | TEXT | original phrasing |
| priority | TEXT | high/medium/low |
| confidence | REAL | 0.0–1.0 |
| needs_clarification | INT | 0 or 1 |
| clarification_reason | TEXT | |
| evidence_quote | TEXT | |
| status | TEXT | pending/approved/rejected/synced |
| tracker_url | TEXT | filled after sync |

### conflicts
| Column | Type | Notes |
|--------|------|-------|
| id | TEXT PK | |
| meeting_id | TEXT FK | |
| type | TEXT | deadline/owner/decision_reversal/scope |
| severity | TEXT | low/med/high |
| description | TEXT | |
| previous_value | TEXT | |
| new_value | TEXT | |
| previous_meeting_id | TEXT | |
| evidence_quote | TEXT | |

### audit_log
| Column | Type | Notes |
|--------|------|-------|
| id | TEXT PK | |
| ts | TEXT | ISO |
| event | TEXT | |
| payload | TEXT | JSON string |

## API Contract

### POST /api/meetings/analyze
**Request**: `{ title: string, date: string, transcript: string }`
**Response**: Full analysis result with action_items, decisions, conflicts arrays + meeting metadata.

### POST /api/sync
**Request**: `{ item_ids: string[] }` — only approved items.
**Response**: `{ results: [{ id, success, tracker_url?, error? }] }`

### PATCH /api/action-items/:id
**Request**: partial update (status, owner, deadline_iso, etc.)

### GET /api/health
**Response**: `{ status, llm, tracker, db, demo_mode }`

### GET /api/meetings, GET /api/meetings/:id, GET /api/kanban, GET /api/timeline, POST /api/demo/load

## LLM Prompt Contract
System prompt instructs strict JSON output matching:
```json
{
  "summary": "string",
  "decisions": [{ "text", "evidence_quote" }],
  "action_items": [{
    "title", "owner", "deadline_raw", "deadline_iso",
    "priority", "confidence", "needs_clarification",
    "clarification_reason", "evidence_quote"
  }],
  "detected_conflicts": [{
    "type", "severity", "description",
    "previous_value", "new_value",
    "previous_meeting_ref", "evidence_quote"
  }]
}
```

## UI Spec
Design: "mission control meets editorial". Dark warm-neutral bg (#1a1917), not pure black. Instrument Serif for display, Inter for UI, JetBrains Mono for transcript. Amber/red accent for conflicts, muted green for confirmed. Dense but breathable. No emoji. Lucide icons sparingly.

Three-zone single screen:
1. **Left — Transcript Panel**: mono text with line numbers, paste area, demo loader, demo toggle, analyze button with staged progress animation.
2. **Center — Results Panel**: decision cards + action item cards. Evidence linking (click card → highlight transcript lines). Approve/reject/edit controls. Clarification amber state.
3. **Right — Memory Panel**: decision timeline across meetings, kanban/tracker status.

Conflict banner above center panel with side-by-side diff. Bottom sticky sync bar.

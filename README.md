# MeetingPilot ✈️

> **Mission Control for Meeting Execution** — Cross-meeting memory, conflict detection, and confirmed action item tracking for high-velocity teams.

🌐 **Live Production URL**: [https://meetingpilot-alpha.vercel.app](https://meetingpilot-alpha.vercel.app)

MeetingPilot turns messy meeting transcripts into confirmed, tracked tasks with cross-meeting intelligence. It detects silent deadline slips, unannounced ownership swaps, and conflicting decisions before they cause execution failure.

---

## 🚀 2-Minute Demo Script (For Judges)

1. **Launch the Application**
   ```bash
   node --experimental-sqlite server/dev-runner.js
   ```
   Open `http://localhost:5173` in your browser.

2. **Step 1: Load Demo Data & Monday Sprint Planning**
   - In the left panel, ensure **Demo** toggle is active.
   - Click **"Load Demo Data"**. Notice the two seeded meetings populate ("Monday Sprint Planning", "Thursday Standup").
   - Click **"Monday Sprint Planning"** and then **"Analyze Meeting"**.
   - Watch the multi-stage scan pass through: *Reading → Extracting → Checking memory → Detecting conflicts*.
   - **Result**: Rahul is assigned the Payment API (due Friday Jan 10), Priya owns Onboarding (due Wednesday Jan 15), and the Public Launch is locked for Jan 15.
   - Click any card to see two-way evidence highlighting directly in the transcript.
   - Click **"Approve"** on both items and click **"Confirm & Sync"** at the bottom.

3. **Step 2: Detect Real Conflicts in Thursday Standup**
   - Click **"Thursday Standup"** in the top left selector.
   - Click **"Analyze Meeting"**.
   - **Boom!** The glowing amber/red **Conflict Banner** activates at the top of the center panel:
     - 🚨 **Decision Reversal (High)**: Public launch date pushed from Jan 15th to Jan 22nd.
     - ⚠️ **Owner Shift (Medium)**: Payment API ownership transferred from Rahul to Aman.
     - ⚠️ **Deadline Slip (Medium)**: Payment API moved from Jan 10th (Friday) to Jan 13th (Monday).
   - Notice the side-by-side diff: `Previous (Mon) → Now (Thu)`.

4. **Step 3: Handle Clarifications & Gated Sync**
   - Look at the bottom bar: **Sync is disabled** because unacknowledged conflicts block execution.
   - Click **"Ack"** on the conflicts.
   - Notice the third action item: **"Investigate analytics bug in staging"** is flagged in amber with *"Needs Clarification: No clear owner or deadline"*.
   - Click **"Fix"**, type an owner ("Sarah") and select a date, then save.
   - Click **"Approve"** on the verified items.
   - The **"Confirm & Sync"** button is now unlocked. Click it to sync directly to the Tracker (LocalKanban / Trello fallback).
   - Check the Right Panel: Watch the live Kanban columns update and the Decision Timeline show full chronological traceability.

5. **Step 4: Executive Digest**
   - Click **"Weekly Digest"** in the top header bar to inspect the automated executive briefing email.

---

## 🛠️ Stack Architecture

- **Frontend**: React 18, Vite, Tailwind CSS, Framer Motion, Lucide icons.
- **Design System**: "Mission Control meets Editorial" — warm neutral `#1a1917`, Instrument Serif + Inter typography, high-contrast semantic conflict badges.
- **Backend**: Node.js HTTP Server, `node:sqlite` (DatabaseSync), Zero NPM runtime dependencies.
- **AI Engine**: Gemini 2.5 API with strict structured schema validation and auto-retries (`llm/provider.js`).
- **Memory & Conflicts**: Cross-meeting historical context injection, server-side fuzzy evidence quote matching.
- **Tracker Integration**: Pluggable Adapter Pattern with Trello REST API and self-contained SQLite `LocalKanbanAdapter` fallback.

---

## 📁 Repository Structure

```
meetingpilot/
├── AGENTS.md               # Rules and directives for agentic contributors
├── ARCHITECTURE.md         # Full specifications & contracts
├── PROGRESS.md             # Milestone tracking & status
├── server/
│   ├── index.js            # HTTP server, routing, CORS
│   ├── db.js               # node:sqlite schema & migrations
│   ├── dev-runner.js       # Starts server + Vite frontend concurrently
│   ├── seed.js             # Seed transcripts for demo
│   ├── demo-cache.js       # Pre-computed verified responses for offline demo
│   ├── llm/                # Gemini provider, prompts, schema
│   ├── tracker/            # Trello & LocalKanban adapter factory
│   ├── routes/             # Health, meetings, actions, demo endpoints
│   └── utils/              # Fuzzy line matching & text utilities
└── client/
    ├── src/
    │   ├── App.jsx         # 3-Zone Mission Control layout
    │   ├── store.js        # Centralized state management
    │   ├── api.js          # REST client
    │   └── components/     # TranscriptPanel, ResultsPanel, ConflictBanner, ActionCard...
```

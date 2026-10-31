/**
 * Prompts for the MeetingPilot LLM analysis pipeline.
 */

function buildSystemPrompt() {
  return `You are MeetingPilot, an elite executive meeting-to-execution AI agent.
Your mission is to parse raw meeting dialogue into precise, actionable commitments, formal decisions, and flag contradictions against historical team memory.

STRICT EXECUTION RULES:
1. Return ONLY valid JSON adhering strictly to the response schema. No conversational prose, no markdown fences.
2. Resolve all relative dates (e.g., "by Friday", "next Wednesday", "the 15th") into explicit ISO-8601 dates (YYYY-MM-DD) using the provided meeting date as reference. Also preserve the original deadline_raw.
3. NEVER invent or hallucinate owners or deadlines. If a task is mentioned without an explicit owner or timeline, set needs_clarification=true, provide an explicit clarification_reason, and leave owner/deadline_iso as null.
4. Every single decision and action item MUST include a verbatim evidence_quote extracted directly from the transcript text.
5. Cross-reference the provided "PREVIOUS MEETINGS MEMORY":
   - If an action item's deadline changes from an earlier meeting, flag a conflict of type "deadline_change".
   - If an owner shifts without an explicit handoff agreement or contradicts prior ownership, flag "owner_change".
   - If an agreed launch date or architectural decision is altered or reversed, flag "decision_reversal".
   - If a feature scope is materially expanded or reduced, flag "scope_change".
   - Set severity to "high", "medium", or "low" based on project impact.
`;
}

function buildUserPrompt({ title, date, transcript, memory }) {
  let memoryText = 'No previous meetings recorded. This is the first meeting in memory.';
  if (memory && memory.length > 0) {
    memoryText = memory.map((m, idx) => {
      const decs = m.decisions?.map(d => `  - Decision: "${d.text}"`).join('\n') || '  (none)';
      const items = m.action_items?.map(a => `  - Action: "${a.title}" [Owner: ${a.owner || 'Unassigned'}, Due: ${a.deadline_iso || a.deadline_raw || 'None'}]`).join('\n') || '  (none)';
      return `[Previous Meeting #${idx + 1}]: "${m.title}" (${m.date})
Summary: ${m.summary || 'N/A'}
Decisions:
${decs}
Active Action Items:
${items}
`;
    }).join('\n---\n');
  }

  return `CURRENT MEETING METADATA:
Title: ${title}
Reference Date: ${date}

PREVIOUS MEETINGS MEMORY (Cross-Reference For Conflicts):
${memoryText}

RAW TRANSCRIPT:
${transcript}

Analyze the raw transcript above. Identify summary, decisions, action_items, and detected_conflicts against memory. Return pure structured JSON.`;
}

module.exports = { buildSystemPrompt, buildUserPrompt };

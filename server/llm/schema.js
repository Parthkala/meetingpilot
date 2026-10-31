/**
 * Zod-like validation for LLM analysis results. No external deps.
 */

const PRIORITY_ENUM = ['high', 'medium', 'low'];
const CONFLICT_TYPE_ENUM = ['deadline_change', 'owner_change', 'decision_reversal', 'scope_change'];
const SEVERITY_ENUM = ['high', 'medium', 'low'];

function validateAnalysisResult(obj) {
  const errors = [];

  if (!obj || typeof obj !== 'object') return { valid: false, errors: ['Result must be an object'], data: null };

  if (typeof obj.summary !== 'string' || !obj.summary) errors.push('summary: required string');

  // decisions
  if (!Array.isArray(obj.decisions)) {
    errors.push('decisions: must be an array');
  } else {
    obj.decisions.forEach((d, i) => {
      if (typeof d.text !== 'string') errors.push(`decisions[${i}].text: required string`);
      if (typeof d.evidence_quote !== 'string') errors.push(`decisions[${i}].evidence_quote: required string`);
    });
  }

  // action_items
  if (!Array.isArray(obj.action_items)) {
    errors.push('action_items: must be an array');
  } else {
    obj.action_items.forEach((a, i) => {
      if (typeof a.title !== 'string') errors.push(`action_items[${i}].title: required string`);
      if (a.priority && !PRIORITY_ENUM.includes(a.priority)) errors.push(`action_items[${i}].priority: must be ${PRIORITY_ENUM}`);
      if (typeof a.confidence !== 'undefined' && typeof a.confidence !== 'number') errors.push(`action_items[${i}].confidence: must be number`);
      if (typeof a.evidence_quote !== 'string') errors.push(`action_items[${i}].evidence_quote: required string`);
    });
  }

  // conflicts
  if (!Array.isArray(obj.conflicts)) {
    errors.push('conflicts: must be an array');
  } else {
    obj.conflicts.forEach((c, i) => {
      if (typeof c.type !== 'string') errors.push(`conflicts[${i}].type: required string`);
      if (c.type && !CONFLICT_TYPE_ENUM.includes(c.type)) errors.push(`conflicts[${i}].type: must be one of ${CONFLICT_TYPE_ENUM}`);
      if (typeof c.description !== 'string') errors.push(`conflicts[${i}].description: required string`);
      if (c.severity && !SEVERITY_ENUM.includes(c.severity)) errors.push(`conflicts[${i}].severity: must be one of ${SEVERITY_ENUM}`);
    });
  }

  return { valid: errors.length === 0, errors, data: errors.length === 0 ? obj : null };
}

// Response schema for Gemini structured output
const RESPONSE_SCHEMA = {
  type: 'object',
  properties: {
    summary: { type: 'string' },
    decisions: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          text: { type: 'string' },
          evidence_quote: { type: 'string' },
        },
        required: ['text', 'evidence_quote'],
      },
    },
    action_items: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          title: { type: 'string' },
          owner: { type: 'string', nullable: true },
          deadline_iso: { type: 'string', nullable: true },
          deadline_raw: { type: 'string', nullable: true },
          priority: { type: 'string', enum: PRIORITY_ENUM },
          confidence: { type: 'number' },
          needs_clarification: { type: 'boolean' },
          clarification_reason: { type: 'string', nullable: true },
          evidence_quote: { type: 'string' },
        },
        required: ['title', 'evidence_quote', 'priority', 'confidence', 'needs_clarification'],
      },
    },
    conflicts: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          type: { type: 'string', enum: CONFLICT_TYPE_ENUM },
          severity: { type: 'string', enum: SEVERITY_ENUM },
          description: { type: 'string' },
          previous_value: { type: 'string', nullable: true },
          new_value: { type: 'string', nullable: true },
          evidence_quote: { type: 'string' },
        },
        required: ['type', 'severity', 'description', 'evidence_quote'],
      },
    },
  },
  required: ['summary', 'decisions', 'action_items', 'conflicts'],
};

module.exports = { validateAnalysisResult, RESPONSE_SCHEMA };

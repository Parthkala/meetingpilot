// Pre-cached LLM responses for demo mode, keyed by meeting title.
const CACHE = {
  'Monday Sprint Planning': {
    summary: 'Sprint planning session. Rahul takes payment API integration (due Friday). Priya handles onboarding flow redesign (due next Wednesday). Public launch date locked for the 15th.',
    decisions: [
      {
        text: 'Public launch date set to January 15th',
        evidence_quote: "Let's lock that in. Launch date is the 15th.",
      },
      {
        text: 'Rahul owns payment API integration',
        evidence_quote: "Rahul, you're taking the payment API integration, right?",
      },
    ],
    action_items: [
      {
        title: 'Payment API integration',
        owner: 'Rahul',
        deadline_iso: '2025-01-10',
        deadline_raw: 'Friday',
        priority: 'high',
        confidence: 0.95,
        needs_clarification: false,
        clarification_reason: null,
        evidence_quote: "Yes, I'll have the payment API integration done by Friday.",
      },
      {
        title: 'Onboarding flow redesign',
        owner: 'Priya',
        deadline_iso: '2025-01-15',
        deadline_raw: 'next Wednesday',
        priority: 'high',
        confidence: 0.9,
        needs_clarification: false,
        clarification_reason: null,
        evidence_quote: "I'm working on the onboarding flow redesign. I should have the new screens ready by next Wednesday.",
      },
    ],
    conflicts: [],
  },

  'Thursday Standup': {
    summary: 'Standup sync. Aman takes over payment API from Rahul (due next Monday). Launch date pushed from 15th to 22nd. Analytics staging bug raised but unowned.',
    decisions: [
      {
        text: 'Launch date moved from January 15th to January 22nd',
        evidence_quote: "The 15th is too aggressive — let's move it to the 22nd.",
      },
      {
        text: 'Aman takes over payment API integration from Rahul',
        evidence_quote: "I'll pick up the payment API integration.",
      },
    ],
    action_items: [
      {
        title: 'Payment API integration',
        owner: 'Aman',
        deadline_iso: '2025-01-13',
        deadline_raw: 'next Monday',
        priority: 'high',
        confidence: 0.9,
        needs_clarification: false,
        clarification_reason: null,
        evidence_quote: "I'll pick up the payment API integration. I think I can get it done by next Monday",
      },
      {
        title: 'Onboarding flow redesign',
        owner: 'Priya',
        deadline_iso: '2025-01-15',
        deadline_raw: 'Wednesday',
        priority: 'medium',
        confidence: 0.85,
        needs_clarification: false,
        clarification_reason: null,
        evidence_quote: "I'll still aim for Wednesday.",
      },
      {
        title: 'Investigate analytics bug in staging',
        owner: null,
        deadline_iso: null,
        deadline_raw: null,
        priority: 'medium',
        confidence: 0.4,
        needs_clarification: true,
        clarification_reason: 'No clear owner or deadline assigned for the analytics bug investigation.',
        evidence_quote: 'someone should look into the analytics bug that keeps coming up in staging.',
      },
    ],
    conflicts: [
      {
        type: 'deadline_change',
        severity: 'medium',
        description: 'Payment API integration deadline changed from Friday (Jan 10) to next Monday (Jan 13)',
        previous_value: '2025-01-10 (Friday)',
        new_value: '2025-01-13 (next Monday)',
        previous_meeting_id: null, // filled at insert time
        evidence_quote: 'I think I can get it done by next Monday — need a bit more time to understand the existing code.',
      },
      {
        type: 'owner_change',
        severity: 'medium',
        description: 'Payment API integration ownership transferred from Rahul to Aman',
        previous_value: 'Rahul',
        new_value: 'Aman',
        previous_meeting_id: null,
        evidence_quote: "Rahul briefed me. I'll pick up the payment API integration.",
      },
      {
        type: 'decision_reversal',
        severity: 'high',
        description: 'Public launch date moved from January 15th to January 22nd',
        previous_value: 'January 15th',
        new_value: 'January 22nd',
        previous_meeting_id: null,
        evidence_quote: "The 15th is too aggressive — let's move it to the 22nd.",
      },
    ],
  },
};

module.exports = CACHE;

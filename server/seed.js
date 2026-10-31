const MEETING_1 = {
  title: 'Monday Sprint Planning',
  date: '2025-01-06',
  transcript: `Sarah: Let's go through the sprint items. Rahul, you're taking the payment API integration, right?
Rahul: Yes, I'll have the payment API integration done by Friday. I've already started on the Stripe webhook handlers.
Priya: I'm working on the onboarding flow redesign. I should have the new screens ready by next Wednesday.
Sarah: Sounds good. Let's also confirm — we're targeting the 15th for the public launch. Everyone aligned?
Rahul: Works for me. The payment flow will be tested by then.
Priya: Yes, the 15th works. I'll have onboarding done well before that.
Sarah: Great. Let's lock that in. Launch date is the 15th.`,
};

const MEETING_2 = {
  title: 'Thursday Standup',
  date: '2025-01-09',
  transcript: `Sarah: Quick sync. Aman, you mentioned you could take over the payment API work?
Aman: Yeah, Rahul briefed me. I'll pick up the payment API integration. I think I can get it done by next Monday — need a bit more time to understand the existing code.
Sarah: That works. We also need to push the launch date. The 15th is too aggressive — let's move it to the 22nd.
Priya: That gives me more breathing room for onboarding too. I'll still aim for Wednesday.
Sarah: Also, someone should look into the analytics bug that keeps coming up in staging.
Aman: I can flag it but I'm not sure who owns that.
Sarah: Let's figure it out. Moving on...`,
};

module.exports = { MEETING_1, MEETING_2 };

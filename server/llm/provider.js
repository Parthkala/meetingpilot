/**
 * LLM Provider abstraction for MeetingPilot.
 * Uses native fetch to call Google Gemini API with structured JSON output and automatic retry.
 */
const env = require('../env');
const { buildSystemPrompt, buildUserPrompt } = require('./prompts');
const { validateAnalysisResult, RESPONSE_SCHEMA } = require('./schema');

async function analyzeWithLLM({ title, date, transcript, memory }) {
  if (!env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY is not configured in .env');
  }

  const systemInstruction = buildSystemPrompt();
  const userPrompt = buildUserPrompt({ title, date, transcript, memory });
  const model = env.GEMINI_MODEL || 'gemini-2.0-flash';
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${env.GEMINI_API_KEY}`;

  const requestBody = {
    contents: [
      {
        role: 'user',
        parts: [{ text: userPrompt }]
      }
    ],
    systemInstruction: {
      parts: [{ text: systemInstruction }]
    },
    generationConfig: {
      responseMimeType: 'application/json',
      responseSchema: RESPONSE_SCHEMA,
      temperature: 0.1
    }
  };

  let lastError = null;
  const maxRetries = 2;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
        signal: AbortSignal.timeout(30000)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Gemini API error (${response.status}): ${errorText}`);
      }

      const resJson = await response.json();
      const rawText = resJson?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!rawText) {
        throw new Error('No candidate content returned from Gemini');
      }

      // Parse JSON
      let parsed;
      try {
        parsed = JSON.parse(rawText);
      } catch (e) {
        // Fallback: strip markdown code fences if model enclosed them
        const cleaned = rawText.replace(/^```json\s*/i, '').replace(/```\s*$/, '').trim();
        parsed = JSON.parse(cleaned);
      }

      const validation = validateAnalysisResult(parsed);
      if (!validation.valid) {
        throw new Error(`Schema validation failed: ${validation.errors.join('; ')}`);
      }

      return validation.data;
    } catch (err) {
      lastError = err;
      console.warn(`[LLM] Attempt ${attempt + 1}/${maxRetries + 1} failed: ${err.message}`);
      if (attempt < maxRetries) {
        await new Promise(r => setTimeout(r, 1000 * (attempt + 1)));
      }
    }
  }

  throw new Error(`LLM Analysis failed after ${maxRetries + 1} attempts: ${lastError?.message}`);
}

module.exports = { analyzeWithLLM };

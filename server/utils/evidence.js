/**
 * Fuzzy-match an evidence quote against transcript lines.
 * Returns { line_start, line_end } (1-indexed).
 */
function matchEvidenceLines(transcript, quote) {
  if (!transcript || !quote) return { line_start: null, line_end: null };
  const lines = transcript.split('\n');
  const normQ = normalize(quote);

  let bestIdx = -1;
  let bestScore = 0;

  for (let i = 0; i < lines.length; i++) {
    const normL = normalize(lines[i]);
    if (normL.includes(normQ)) return { line_start: i + 1, line_end: i + 1 };

    // sliding window: try multi-line spans up to 3
    for (let span = 1; span <= Math.min(3, lines.length - i); span++) {
      const block = normalize(lines.slice(i, i + span).join(' '));
      if (block.includes(normQ)) return { line_start: i + 1, line_end: i + span };

      // partial overlap score
      const score = lcs(normQ, block) / normQ.length;
      if (score > bestScore) {
        bestScore = score;
        bestIdx = i;
      }
    }
  }

  if (bestScore > 0.5 && bestIdx !== -1) {
    return { line_start: bestIdx + 1, line_end: bestIdx + 1 };
  }
  return { line_start: null, line_end: null };
}

function normalize(s) {
  return s.toLowerCase().replace(/[^a-z0-9 ]/g, '').replace(/\s+/g, ' ').trim();
}

// Longest common substring length — good enough for short quotes
function lcs(a, b) {
  let max = 0;
  const table = new Uint16Array(b.length);
  for (let i = 0; i < a.length; i++) {
    for (let j = b.length - 1; j >= 0; j--) {
      table[j] = a[i] === b[j] ? (j > 0 ? table[j - 1] : 0) + 1 : 0;
      if (table[j] > max) max = table[j];
    }
  }
  return max;
}

module.exports = { matchEvidenceLines };

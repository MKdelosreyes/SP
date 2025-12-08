export function explanationPrompt(input: {
  mode: "quiz" | "fill-blanks",
  word: string,
  stem?: string,
  correct: string,
  selected?: string,
  definition: string,
  example: string
}) {
  const { mode, word, correct, selected, definition, example } = input;
  const task = mode === "quiz"
    ? `Explain why the correct meaning is correct and why the selected choice is wrong.`
    : `Explain why the correct word fits the sentence and common traps for similar words.`;

  return `You are a helpful Filipino language coach for UPCAT prep.

Facts you MUST use:
- Word: ${word}
- Correct meaning/answer: ${correct}
- Official definition: ${definition}
- Example sentence: ${example}
${selected ? `- Student selected: ${selected}` : ""}

Task:
${task}
Keep it short and clear. Output 4 bullets:
1) Why the correct answer is correct (use the definition).
2) Why the wrong choice is wrong (if provided).
3) A quick vocabulary/grammar note (one sentence).
4) A time-pressure tip (one sentence).`;
}

export function tipsPrompt(input: {
  score: number;
  missedLowFreq: number;
  similarChoiceErrors: number;
  lastDifficulty: "easy" | "medium" | "hard";
  module: "vocabulary";
}) {
  const { score, missedLowFreq, similarChoiceErrors, lastDifficulty } = input;
  return `You are a coach for UPCAT Filipino.

Student summary:
- Score: ${score}%
- Missed low-frequency words: ${missedLowFreq}
- Similar-choice errors: ${similarChoiceErrors}
- Last difficulty: ${lastDifficulty}

Give:
- 3 short, actionable tips (bullets)
- A 15–20 minute plan with concrete steps (bullets)`;
}

export function redefinePrompt(input: { word: string; baseMeaning: string; example: string }) {
  const { word, baseMeaning, example } = input;
  return `Rewrite the definition and examples for Filipino word "${word}".

Base meaning: ${baseMeaning}
Base example: ${example}

Return:
- Easy definition (casual, must be in English)
- Formal definition (academic)
- 2 new example sentences (Filipino)
- 1 short bilingual gloss (Filipino + concise English)`;
}
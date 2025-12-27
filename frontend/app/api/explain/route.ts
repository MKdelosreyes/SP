// import { NextRequest, NextResponse } from "next/server";
// import { openai } from "@/ai/client";
// import { explanationPrompt } from "@/ai/prompts";
// import { vocabularyData } from "@/data/vocabulary-dataset";

// export async function POST(req: NextRequest) {
//   try {
//     const body = await req.json();
//     const { mode, word, correct, selected } = body as {
//       mode: "quiz" | "fill-blanks",
//       word: string,
//       correct: string,
//       selected?: string
//     };

//     const entry = vocabularyData.find(w => w.word === word);
//     const definition = entry?.meaning ?? correct;
//     const example = entry?.example ?? "";

//     const prompt = explanationPrompt({
//       mode,
//       word,
//       correct,
//       selected,
//       definition,
//       example,
//     });

//     const completion = await openai.chat.completions.create({
//       model: "gpt-4o-mini",
//       temperature: 0.2,
//       messages: [
//         { role: "system", content: "Be concise, accurate, and friendly." },
//         { role: "user", content: prompt },
//       ],
//     });

//     const text = completion.choices[0]?.message?.content ?? "";
//     return NextResponse.json({ explanation: text });
//   } catch (e: any) {
//     console.error(e);
//     return NextResponse.json({ error: "Failed to generate explanation" }, { status: 500 });
//   }
// }

/**
 * MIGRATED TO AI SERVICE
 * This route now proxies to the FastAPI AI service
 * 
 * Migration Status: ✅ Complete
 * Original: Used OpenAI directly from frontend
 * Current: Proxies to ai-service FastAPI endpoint
 */

import { NextRequest, NextResponse } from "next/server";
import { getExplanation } from "@/lib/api/ai-service";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    const { mode, word, correct, selected } = body as {
      mode: "quiz" | "fill-blanks";
      word: string;
      correct: string;
      selected?: string;
    };

    // Call AI service instead of OpenAI directly
    const response = await getExplanation({
      mode,
      word,
      correct,
      selected,
    });

    return NextResponse.json({ explanation: response.explanation });
  } catch (error: any) {
    console.error("Explanation API error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to generate explanation" },
      { status: 500 }
    );
  }
}
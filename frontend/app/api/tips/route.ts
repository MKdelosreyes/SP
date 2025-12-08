import { NextRequest, NextResponse } from "next/server";
import { openai } from "@/ai/client";
import { tipsPrompt } from "@/ai/prompts";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { score, missedLowFreq, similarChoiceErrors, lastDifficulty } = body as {
      score: number; missedLowFreq: number; similarChoiceErrors: number; lastDifficulty: "easy" | "medium" | "hard";
    };

    const prompt = tipsPrompt({ score, missedLowFreq, similarChoiceErrors, lastDifficulty, module: "vocabulary" });
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.3,
      messages: [
        { role: "system", content: "Be practical and concise." },
        { role: "user", content: prompt },
      ],
    });

    return NextResponse.json({ tips: completion.choices[0]?.message?.content ?? "" });
  } catch (e: any) {
    return NextResponse.json({ error: "Failed to generate tips" }, { status: 500 });
  }
}
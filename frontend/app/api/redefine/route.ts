import { NextRequest, NextResponse } from "next/server";
import { openai } from "@/ai/client";
import { redefinePrompt } from "@/ai/prompts";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { word, baseMeaning, example } = body as { word: string; baseMeaning: string; example: string };

    const prompt = redefinePrompt({ word, baseMeaning, example });
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.2,
      messages: [
        { role: "system", content: "Return concise teaching content." },
        { role: "user", content: prompt },
      ],
    });

    const content = completion.choices[0]?.message?.content ?? "";
    return NextResponse.json({ content });
  } catch (e: any) {
    return NextResponse.json({ error: "Failed to rewrite definition" }, { status: 500 });
  }
}
import { NextRequest, NextResponse } from "next/server";
import { openai } from "@/ai/client";
import { vocabularyData } from "@/data/vocabulary-dataset";

export async function POST(req: NextRequest) {
  try {
    const { word, topK = 3 } = await req.json() as { word: string; topK?: number };
    const candidates = vocabularyData.map(w => w.word);

    // Embed target and candidates (naive but fine for small sets)
    const [targetEmbRes, candEmbRes] = await Promise.all([
      openai.embeddings.create({ model: "text-embedding-3-small", input: word }),
      openai.embeddings.create({ model: "text-embedding-3-small", input: candidates }),
    ]);

    const target = targetEmbRes.data[0].embedding;
    const cand = candEmbRes.data.map((d, i) => ({ word: candidates[i], vec: d.embedding }));

    // cosine similarity
    const sim = (a: number[], b: number[]) => {
      let dot = 0, na = 0, nb = 0;
      for (let i = 0; i < a.length; i++) { dot += a[i]*b[i]; na += a[i]*a[i]; nb += b[i]*b[i]; }
      return dot / (Math.sqrt(na) * Math.sqrt(nb) + 1e-9);
    };

    const ranked = cand
      .filter(c => c.word !== word)
      .map(c => ({ word: c.word, score: sim(target, c.vec) }))
      .sort((a,b) => b.score - a.score)
      .slice(0, topK);

    // Join with meanings for contrast drills
    const results = ranked.map(r => {
      const entry = vocabularyData.find(v => v.word === r.word);
      return { word: r.word, meaning: entry?.meaning ?? "", example: entry?.example ?? "" };
    });

    return NextResponse.json({ results });
  } catch (e: any) {
    return NextResponse.json({ error: "Failed to find confusables" }, { status: 500 });
  }
}
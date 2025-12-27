from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List
import os
from openai import OpenAI
from dotenv import load_dotenv

# Initialize FastAPI
app = FastAPI(title="UPCAT Filipino Reviewer AI Service")

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize OpenAI Client
# openai_client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
load_dotenv()  # load variables from ai-service/.env into the process env

# Initialize OpenAI Client
api_key = os.getenv("OPENAI_API_KEY")
if not api_key:
    raise RuntimeError("OPENAI_API_KEY not set. Add it to ai-service/.env or export it in your shell.")
openai_client = OpenAI(api_key=api_key)

# ============================================================
# REQUEST/RESPONSE MODELS
# ============================================================

class ExplainRequest(BaseModel):
    mode: str  # "quiz" or "fill-blanks"
    word: str
    correct: str
    selected: Optional[str] = None

class ExplainResponse(BaseModel):
    explanation: str

class TipsRequest(BaseModel):
    score: int
    missedLowFreq: int
    similarChoiceErrors: int
    lastDifficulty: str
    module: str

class TipsResponse(BaseModel):
    tips: str

class RedefineRequest(BaseModel):
    word: str
    baseMeaning: str
    example: str

class RedefineResponse(BaseModel):
    content: str

class ConfusablesRequest(BaseModel):
    word: str
    topK: Optional[int] = 3

class ConfusableWord(BaseModel):
    word: str
    meaning: str
    example: str

class ConfusablesResponse(BaseModel):
    results: List[ConfusableWord]

# ============================================================
# HELPER FUNCTIONS
# ============================================================

def get_vocabulary_entry(word: str):
    """Load vocabulary data and find entry"""
    from data.vocabulary_core import vocabulary_data
    return next((v for v in vocabulary_data if v["word"] == word), None)

def explanation_prompt(data: dict) -> str:
    """Generate explanation prompt"""
    mode = data["mode"]
    word = data["word"]
    correct = data["correct"]
    selected = data.get("selected")
    definition = data["definition"]
    example = data["example"]

    if mode == "quiz":
        return f"""You are a helpful Filipino language coach for UPCAT prep.

Facts you MUST use:
- Word: {word}
- Correct meaning: {correct}
- Official definition: {definition}
- Example sentence: {example}
- Student selected: {selected}

Task:
Explain why the correct meaning is correct and why the selected choice is wrong.

Output 4 bullets:
1) Why the correct answer is correct (use the definition).
2) Why the selected choice is wrong (explain the difference or trap).
3) A quick vocabulary/grammar note (one sentence).
4) A time-pressure tip (one sentence)."""

    return f"""You are a helpful Filipino language coach for UPCAT prep.

Facts you MUST use:
- Correct word: {correct}
- Official definition: {definition}
- Example sentence: {example}
- Student submitted: "{selected}"

Task:
The student filled in the blank incorrectly. Analyze their answer step-by-step.

Output 4 bullets:
1) Why "{correct}" is the correct answer.
2) Is the submitted answer a valid word? If yes, what does it mean? If no, say it's invalid/gibberish.
3) A quick vocabulary/grammar note.
4) A time-pressure tip."""

def tips_prompt(data: dict) -> str:
    """Generate tips prompt"""
    return f"""You are a coach for UPCAT Filipino.

Student summary:
- Score: {data["score"]}%
- Missed low-frequency words: {data["missedLowFreq"]}
- Similar-choice errors: {data["similarChoiceErrors"]}
- Last difficulty: {data["lastDifficulty"]}

Give:
- 3 short, actionable tips (bullets)
- A 15–20 minute plan with concrete steps (bullets)"""

def redefine_prompt(data: dict) -> str:
    """Generate redefine prompt"""
    return f"""Rewrite the definition and examples for Filipino word "{data["word"]}".

Base meaning: {data["baseMeaning"]}
Base example: {data["example"]}

Return:
- Easy definition (casual, must be in English)
- Brief formal definition (academic, must be in Filipino)
- 2 new example sentences (Filipino)
- 1 short bilingual gloss (Filipino)"""

# ============================================================
# ENDPOINTS
# ============================================================

@app.get("/")
async def root():
    return {"message": "UPCAT Filipino AI Service", "status": "running"}

@app.post("/explain", response_model=ExplainResponse)
async def explain(request: ExplainRequest):
    """Generate AI explanation for incorrect answers"""
    try:
        # Get vocabulary entry
        entry = get_vocabulary_entry(request.word)
        definition = entry["meaning"] if entry else request.correct
        example = entry["example"] if entry else ""

        # Generate prompt
        prompt = explanation_prompt({
            "mode": request.mode,
            "word": request.word,
            "correct": request.correct,
            "selected": request.selected,
            "definition": definition,
            "example": example
        })

        # Call OpenAI
        completion = openai_client.chat.completions.create(
            model="gpt-4o-mini",
            temperature=0.2,
            messages=[
                {"role": "system", "content": "Be concise, accurate, and friendly."},
                {"role": "user", "content": prompt}
            ]
        )

        explanation = completion.choices[0].message.content or ""
        return ExplainResponse(explanation=explanation)

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/tips", response_model=TipsResponse)
async def generate_tips(request: TipsRequest):
    """Generate personalized study tips"""
    try:
        prompt = tips_prompt(request.dict())

        completion = openai_client.chat.completions.create(
            model="gpt-4o-mini",
            temperature=0.3,
            messages=[
                {"role": "system", "content": "Be practical and concise."},
                {"role": "user", "content": prompt}
            ]
        )

        tips = completion.choices[0].message.content or ""
        return TipsResponse(tips=tips)

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/redefine", response_model=RedefineResponse)
async def redefine_word(request: RedefineRequest):
    """Redefine word with multiple perspectives"""
    try:
        prompt = redefine_prompt(request.dict())

        completion = openai_client.chat.completions.create(
            model="gpt-4o-mini",
            temperature=0.2,
            messages=[
                {"role": "system", "content": "Return concise teaching content."},
                {"role": "user", "content": prompt}
            ]
        )

        content = completion.choices[0].message.content or ""
        return RedefineResponse(content=content)

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/confusables", response_model=ConfusablesResponse)
async def find_confusables(request: ConfusablesRequest):
    """Find similar/confusing words using embeddings"""
    try:
        from data.vocabulary_core import vocabulary_data
        import math

        def cosine_similarity(a, b):
            dot = sum(x * y for x, y in zip(a, b))
            na = math.sqrt(sum(x * x for x in a))
            nb = math.sqrt(sum(x * x for x in b))
            return dot / (na * nb + 1e-9)

        # Get all candidate words
        candidates = [v["word"] for v in vocabulary_data]

        # Get embeddings
        target_emb = openai_client.embeddings.create(
            model="text-embedding-3-small",
            input=request.word
        ).data[0].embedding

        cand_embs = openai_client.embeddings.create(
            model="text-embedding-3-small",
            input=candidates
        ).data

        # Calculate similarities
        scored = []
        for i, emb_data in enumerate(cand_embs):
            if candidates[i] != request.word:
                score = cosine_similarity(target_emb, emb_data.embedding)
                scored.append({"word": candidates[i], "score": score})

        # Get top K
        ranked = sorted(scored, key=lambda x: x["score"], reverse=True)[:request.topK]

        # Build results
        results = []
        for r in ranked:
            entry = next(v for v in vocabulary_data if v["word"] == r["word"])
            results.append(ConfusableWord(
                word=r["word"],
                meaning=entry["meaning"],
                example=entry["example"]
            ))

        return ConfusablesResponse(results=results)

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ============================================================
# RUN SERVER
# ============================================================

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
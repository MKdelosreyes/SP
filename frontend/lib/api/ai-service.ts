/**
 * AI Service API Client
 * Connects frontend to FastAPI AI service
 */

const AI_SERVICE_URL = process.env.NEXT_PUBLIC_AI_SERVICE_URL || 'http://localhost:8001';

// Types
export interface ExplainRequest {
  mode: "quiz" | "fill-blanks";
  word: string;
  correct: string;
  selected?: string;
}

export interface ExplainResponse {
  explanation: string;
}

export interface TipsRequest {
  score: number;
  missedLowFreq: number;
  similarChoiceErrors: number;
  lastDifficulty: "easy" | "medium" | "hard";
  module: string;
}

export interface TipsResponse {
  tips: string;
}

export interface RedefineRequest {
  word: string;
  baseMeaning: string;
  example: string;
}

export interface RedefineResponse {
  content: string;
}

export interface ConfusablesRequest {
  word: string;
  topK?: number;
}

export interface ConfusableWord {
  word: string;
  meaning: string;
  example: string;
}

export interface ConfusablesResponse {
  results: ConfusableWord[];
}

// API Functions
export async function getExplanation(
  request: ExplainRequest
): Promise<ExplainResponse> {
  const response = await fetch(`${AI_SERVICE_URL}/explain`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    throw new Error(`AI Service error: ${response.statusText}`);
  }

  return response.json();
}

export async function getTips(
  request: TipsRequest
): Promise<TipsResponse> {
  const response = await fetch(`${AI_SERVICE_URL}/tips`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    throw new Error(`AI Service error: ${response.statusText}`);
  }

  return response.json();
}

export async function redefineWord(
  request: RedefineRequest
): Promise<RedefineResponse> {
  const response = await fetch(`${AI_SERVICE_URL}/redefine`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    throw new Error(`AI Service error: ${response.statusText}`);
  }

  return response.json();
}

export async function getConfusables(
  request: ConfusablesRequest
): Promise<ConfusablesResponse> {
  const response = await fetch(`${AI_SERVICE_URL}/confusables`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    throw new Error(`AI Service error: ${response.statusText}`);
  }

  return response.json();
}

// Health check
export async function checkAIServiceHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${AI_SERVICE_URL}/`);
    return response.ok;
  } catch {
    return false;
  }
}
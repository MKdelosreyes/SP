"use client";

import { useLearningProgress } from "@/contexts/LearningProgressContext";
import type {
  ExerciseProgress as BaseExerciseProgress,
  ExerciseStatus,
} from "@/contexts/LearningProgressContext";

type GrammarExerciseType =
  | "error-identification"
  | "sentence-correction"
  | "fill-blanks";

interface ExerciseProgress {
  status: ExerciseStatus;
  score?: number | null;
  completedAt?: string | null;
  attempts?: number;
}

export type MasteryLevel =
  | "beginner"
  | "developing"
  | "proficient"
  | "advanced"
  | "master";

interface GrammarMastery {
  level: MasteryLevel;
  icon: string;
  description: string;
  difficulty: "easy" | "medium" | "hard";
}

export function useGrammarProgress() {
  const { progress, updateProgress: updateLearningProgress } =
    useLearningProgress();

  // Map grammar exercise types to the standard exercise types
  const getStandardExerciseType = (
    exerciseType: GrammarExerciseType
  ): "flashcards" | "quiz" | "fill-blanks" => {
    if (exerciseType === "error-identification") return "flashcards";
    if (exerciseType === "sentence-correction") return "quiz";
    return "fill-blanks";
  };

  const getExerciseProgress = (
    exerciseType: GrammarExerciseType
  ): ExerciseProgress => {
    const standardType = getStandardExerciseType(exerciseType);
    const exerciseProgress = progress.grammar[standardType];

    return {
      status: exerciseProgress.status,
      score: exerciseProgress.score,
      completedAt: exerciseProgress.completedAt,
      attempts: exerciseProgress.attempts,
    };
  };

  const updateProgress = (
    exerciseType: GrammarExerciseType,
    data: Partial<BaseExerciseProgress>
  ) => {
    const standardType = getStandardExerciseType(exerciseType);
    updateLearningProgress("grammar", standardType, data);
  };

  const getGrammarMastery = (): GrammarMastery => {
    const grammar = progress.grammar;

    // Aggregate all exercise histories
    const allHistory = [
      ...grammar.flashcards.performanceHistory,
      ...grammar.quiz.performanceHistory,
      ...grammar["fill-blanks"].performanceHistory,
    ];

    if (allHistory.length === 0) {
      return {
        level: "beginner",
        icon: "🌱",
        description: "Just starting your grammar journey",
        difficulty: "easy",
      };
    }

    // Get current difficulty (highest across exercises)
    const difficulties = [
      grammar.flashcards.lastDifficulty,
      grammar.quiz.lastDifficulty,
      grammar["fill-blanks"].lastDifficulty,
    ];

    const currentDiff = difficulties.reduce((max, diff) => {
      if (diff === "hard") return "hard";
      if (diff === "medium" && max !== "hard") return "medium";
      return max;
    }, "easy" as "easy" | "medium" | "hard");

    // Count sessions at current difficulty
    const sessionsAtDiff = allHistory.filter(
      (h) => h.difficulty === currentDiff
    ).length;

    // Average score at current difficulty
    const scoresAtDiff = allHistory
      .filter((h) => h.difficulty === currentDiff)
      .map((h) => h.score);

    const avgScore =
      scoresAtDiff.length > 0
        ? scoresAtDiff.reduce((a, b) => a + b, 0) / scoresAtDiff.length
        : 0;

    // Count completed exercises
    const completedCount = [
      grammar.flashcards,
      grammar.quiz,
      grammar["fill-blanks"],
    ].filter((ex) => ex.status === "completed").length;

    // Determine mastery level
    if (currentDiff === "hard" && sessionsAtDiff >= 5 && avgScore >= 90) {
      return {
        level: "master",
        icon: "👑",
        description: "Grammar expert!",
        difficulty: "hard",
      };
    }

    if (currentDiff === "hard" && sessionsAtDiff >= 3) {
      return {
        level: "advanced",
        icon: "🎓",
        description: "Strong grasp of grammar rules",
        difficulty: "hard",
      };
    }

    if (currentDiff === "medium" && sessionsAtDiff >= 3 && avgScore >= 75) {
      return {
        level: "proficient",
        icon: "✍️",
        description: "Gaining confidence in grammar",
        difficulty: "medium",
      };
    }

    if (
      sessionsAtDiff >= 3 ||
      currentDiff === "medium" ||
      completedCount >= 1
    ) {
      return {
        level: "developing",
        icon: "📚",
        description: "Building grammar fundamentals",
        difficulty: currentDiff,
      };
    }

    return {
      level: "beginner",
      icon: "🌱",
      description: "Just starting your grammar journey",
      difficulty: "easy",
    };
  };

  return {
    getExerciseProgress,
    updateProgress,
    getGrammarMastery,
  };
}

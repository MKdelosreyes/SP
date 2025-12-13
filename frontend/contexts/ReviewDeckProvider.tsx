"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

interface ReviewDeckContextType {
  reviewDeck: number[]; // Store word IDs
  addToReviewDeck: (wordId: number) => void;
  removeFromReviewDeck: (wordId: number) => void;
  isInReviewDeck: (wordId: number) => boolean;
  clearReviewDeck: () => void;
}

const ReviewDeckContext = createContext<ReviewDeckContextType | undefined>(
  undefined
);

export function ReviewDeckProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [reviewDeck, setReviewDeck] = useState<number[]>([]);

  // Load from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem("reviewDeck");
    if (stored) {
      try {
        setReviewDeck(JSON.parse(stored));
      } catch (error) {
        console.error("Failed to load review deck:", error);
      }
    }
  }, []);

  // Save to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("reviewDeck", JSON.stringify(reviewDeck));
  }, [reviewDeck]);

  const addToReviewDeck = (wordId: number) => {
    setReviewDeck((prev) => {
      if (prev.includes(wordId)) return prev;
      return [...prev, wordId];
    });
  };

  const removeFromReviewDeck = (wordId: number) => {
    setReviewDeck((prev) => prev.filter((id) => id !== wordId));
  };

  const isInReviewDeck = (wordId: number) => {
    return reviewDeck.includes(wordId);
  };

  const clearReviewDeck = () => {
    setReviewDeck([]);
  };

  return (
    <ReviewDeckContext.Provider
      value={{
        reviewDeck,
        addToReviewDeck,
        removeFromReviewDeck,
        isInReviewDeck,
        clearReviewDeck,
      }}
    >
      {children}
    </ReviewDeckContext.Provider>
  );
}

export function useReviewDeck() {
  const context = useContext(ReviewDeckContext);
  if (!context) {
    throw new Error("useReviewDeck must be used within ReviewDeckProvider");
  }
  return context;
}

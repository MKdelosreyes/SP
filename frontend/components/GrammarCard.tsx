"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { CheckCircle2, Lock } from "lucide-react";
import { useGrammarProgress } from "@/hooks/useGrammarProgress";

interface GrammarCardProps {
  name: string;
  description: string;
  imagePath: string;
  color: string;
  url: string;
  exerciseType: "error-identification" | "sentence-correction" | "fill-blanks";
}

export default function GrammarCard({
  name,
  description,
  imagePath,
  color,
  url,
  exerciseType,
}: GrammarCardProps) {
  const { getExerciseProgress } = useGrammarProgress();
  const progress = getExerciseProgress(exerciseType);

  const isCompleted = progress.status === "completed";
  const score = progress.score || 0;

  return (
    <Link href={url}>
      <motion.div
        whileHover={{ scale: 1.02, y: -5 }}
        whileTap={{ scale: 0.98 }}
        className={`${color} rounded-2xl p-3 shadow-md hover:shadow-xl transition-all cursor-pointer border-4 border-green-200 relative overflow-hidden h-full`}
      >
        {/* Completion Badge */}
        {isCompleted && (
          <div className="absolute top-4 right-4 bg-green-500 text-white rounded-full p-1.5">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        )}

        {/* Image */}
        <div className="flex flex-shrink-0 justify-center mt-8 mb-4">
          <Image
            src={imagePath || "/art/grammar-icon1.png"}
            alt={`${name} icon`}
            width={150}
            height={150}
            className={`object-contain transition-transform duration-300`}
          />
        </div>

        {/* Content */}
        <div className="text-center space-y-2">
          <h3 className="text-xl font-bold text-green-900">{name}</h3>
          <p className="text-sm text-gray-600">{description}</p>

          {/* Progress Info */}
          {isCompleted && (
            <div className="mt-4 pt-3 border-t border-green-300">
              <div className="flex items-center justify-center gap-2">
                <span className="text-xs text-gray-600">Last Score:</span>
                <span className="text-sm font-bold text-green-700">
                  {score}%
                </span>
              </div>
              {progress.attempts && (
                <p className="text-xs text-gray-500 mt-1">
                  Completed {progress.attempts} time
                  {progress.attempts !== 1 ? "s" : ""}
                </p>
              )}
            </div>
          )}

          {!isCompleted && (
            <div className="mt-4">
              <span className="inline-block bg-green-100 text-green-700 text-xs font-semibold px-3 py-1 rounded-full border border-green-300">
                Start Practice
              </span>
            </div>
          )}
        </div>
      </motion.div>
    </Link>
  );
}

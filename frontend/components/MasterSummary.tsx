"use client";

import { useDashboardInsights } from "@/hooks/useDashboardInsights";
import type { ModuleType } from "@/contexts/LearningProgressContext";

const moduleInfo = {
  vocabulary: { name: "Vocabulary", color: "yellow" },
  grammar: { name: "Grammar", color: "green" },
  "sentence-construction": { name: "Sentence Construction", color: "blue" },
  "reading-comprehension": { name: "Reading Comprehension", color: "pink" },
};

export default function MasterySummary() {
  const { getModuleMastery } = useDashboardInsights();

  const modules: ModuleType[] = [
    "vocabulary",
    "grammar",
    "reading-comprehension",
    "sentence-construction",
  ];

  return (
    <div className="space-y-3">
      <h3 className="font-bold text-sm text-gray-700 mb-3">
        📊 Your Mastery Levels
      </h3>

      {modules.map((module) => {
        const mastery = getModuleMastery(module);
        const info = moduleInfo[module];

        return (
          <div
            key={module}
            className="bg-white border border-gray-200 rounded-lg p-3 hover:border-blue-300 transition-colors"
          >
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-semibold text-sm text-gray-800">
                {info.name}
                <div
                  className={`flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-bold border ${mastery.color}`}
                >
                  <span>{mastery.icon}</span>
                  <span className="capitalize">{mastery.level}</span>
                </div>
              </h4>
            </div>

            <div className="flex items-center justify-between text-xs text-gray-600">
              <span>Current Focus:</span>
              <span className="font-semibold capitalize">
                {mastery.difficulty} difficulty
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

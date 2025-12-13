"use client";

import { ArrowLeft, RotateCcw } from "lucide-react";
import Link from "next/link";

export default function ErrorIdentificationPage() {
  return (
    <div className="h-screen max-h-screen overflow-hidden flex flex-col bg-purple-50">
      {/* Header */}
      <div className="flex-shrink-0 flex items-center justify-between px-4 md:px-8 py-4 bg-white border-b border-purple-200">
        <Link
          href="/vocabulary"
          className="flex items-center gap-2 text-purple-600 hover:text-purple-700 font-semibold text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Link>

        <div className="text-center flex-1 px-4">
          <h1 className="text-xl md:text-2xl font-bold text-purple-900">
            Error Identification Practice
          </h1>
        </div>

        <button className="flex items-center gap-2 text-gray-600 hover:text-gray-700 font-semibold text-sm">
          <RotateCcw className="w-4 h-4" />
          <span className="hidden md:inline">Reset</span>
        </button>
      </div>
    </div>
  );
}

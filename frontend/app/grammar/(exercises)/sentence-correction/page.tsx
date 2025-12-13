"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function SentenceCorrectionPage() {
  return (
    <div className="h-screen max-h-screen overflow-hidden flex flex-col bg-blue-50">
      <div className="flex-shrink-0 flex items-center justify-between px-4 md:px-8 py-4 bg-white border-b border-blue-200">
        <Link
          href="/grammar"
          className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Link>
        <div className="text-center flex-1 px-4">
          <h1 className="text-xl md:text-2xl font-bold text-blue-900">
            Sentence Correction
          </h1>
        </div>
        <div className="w-20"></div>
      </div>

      <div className="flex-1 flex items-center justify-center">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-bold text-gray-700">Coming Soon</h2>
          <p className="text-gray-600">
            Sentence Correction exercise will be available soon!
          </p>
        </div>
      </div>
    </div>
  );
}

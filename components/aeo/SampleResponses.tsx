"use client";

import { useState } from "react";
import { ENGINES } from "@/lib/aeo/engines";

interface SampleResponse {
  engine: string;
  query: string;
  queryType?: string;
  response: string;
}

interface SampleResponsesProps {
  responses: SampleResponse[];
  isGated: boolean;
}

const QUERY_TYPE_LABELS: Record<string, { label: string; color: string }> = {
  category_head: { label: "Category", color: "#3B82F6" },
  category_longtail: { label: "Long-tail", color: "#8B5CF6" },
  brand: { label: "Brand", color: "#10B981" },
  comparison: { label: "Comparison", color: "#F59E0B" },
  problem: { label: "Problem", color: "#EF4444" },
  use_case: { label: "Use Case", color: "#EC4899" },
  evaluation: { label: "Evaluation", color: "#06B6D4" },
  switching: { label: "Switching", color: "#F97316" },
};

export function SampleResponses({ responses, isGated }: SampleResponsesProps) {
  const [activeEngine, setActiveEngine] = useState<string | null>(null);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  if (responses.length === 0) {
    return null;
  }

  // Group responses by engine
  const engines = [...new Set(responses.map((r) => r.engine))];
  const selectedEngine = activeEngine || engines[0];
  const filteredResponses = responses.filter((r) => r.engine === selectedEngine);

  return (
    <div className="bg-white border-2 border-[#1a1a1a] rounded-2xl p-6 shadow-[4px_4px_0px_0px_#1a1a1a]">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-[#1a1a1a]">AI Responses</h3>
        <span className="text-sm text-[#6b6b6b]">
          {responses.length} total responses
        </span>
      </div>

      {/* Engine Tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {engines.map((engine) => {
          const engineName = ENGINES[engine]?.name || engine;
          const count = responses.filter((r) => r.engine === engine).length;
          const isActive = engine === selectedEngine;

          return (
            <button
              key={engine}
              onClick={() => setActiveEngine(engine)}
              className={`px-4 py-2 rounded-lg border-2 border-[#1a1a1a] font-medium text-sm transition-all ${
                isActive
                  ? "bg-[#1a1a1a] text-white shadow-[2px_2px_0px_0px_#DFFE68]"
                  : "bg-white text-[#1a1a1a] hover:bg-[#f5f5f5]"
              }`}
            >
              {engineName}
              <span
                className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                  isActive ? "bg-[#DFFE68] text-[#1a1a1a]" : "bg-[#f5f5f5]"
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Responses List */}
      <div className="space-y-4">
        {filteredResponses.map((res, index) => {
          const isExpanded = expandedIndex === index;
          const queryTypeInfo = QUERY_TYPE_LABELS[res.queryType || ""] || {
            label: "Query",
            color: "#6b6b6b",
          };
          const shouldTruncate = res.response.length > 400 && !isExpanded;

          return (
            <div
              key={index}
              className="border-2 border-[#1a1a1a] rounded-lg overflow-hidden"
            >
              {/* Header */}
              <div className="bg-[#1a1a1a] px-4 py-3">
                <div className="flex items-start justify-between gap-4">
                  <p className="text-[#DFFE68] text-sm font-medium flex-1">
                    &ldquo;{res.query}&rdquo;
                  </p>
                  <span
                    className="px-2 py-1 rounded text-xs font-bold text-white shrink-0"
                    style={{ backgroundColor: queryTypeInfo.color }}
                  >
                    {queryTypeInfo.label}
                  </span>
                </div>
              </div>

              {/* Response Body */}
              <div className="p-4 bg-[#fafafa]">
                <div
                  className={`text-sm text-[#4a4a4a] prose prose-sm max-w-none ${
                    shouldTruncate ? "line-clamp-6" : ""
                  }`}
                  style={{ whiteSpace: "pre-wrap" }}
                >
                  {res.response}
                </div>

                {res.response.length > 400 && (
                  <button
                    onClick={() =>
                      setExpandedIndex(isExpanded ? null : index)
                    }
                    className="mt-3 text-sm font-medium text-[#3B82F6] hover:underline"
                  >
                    {isExpanded ? "Show less ↑" : "Show more ↓"}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {isGated && (
        <div className="mt-6 p-4 bg-[#f5f5f5] border-2 border-dashed border-[#1a1a1a] rounded-lg text-center">
          <p className="text-sm text-[#6b6b6b]">
            Unlock full results to see all {responses.length} AI responses
          </p>
        </div>
      )}
    </div>
  );
}

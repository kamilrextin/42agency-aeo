"use client";

import { ENGINES } from "@/lib/aeo/engines";

interface SampleResponse {
  engine: string;
  query: string;
  response: string;
}

interface SampleResponsesProps {
  responses: SampleResponse[];
  isGated: boolean;
}

export function SampleResponses({ responses, isGated }: SampleResponsesProps) {
  if (responses.length === 0) {
    return null;
  }

  return (
    <div className="bg-white border-2 border-[#1a1a1a] rounded-2xl p-6 shadow-[4px_4px_0px_0px_#1a1a1a]">
      <h3 className="text-xl font-bold text-[#1a1a1a] mb-6">Sample AI Responses</h3>

      <div className="space-y-4">
        {responses.map((res, index) => {
          const engineName = ENGINES[res.engine]?.name || res.engine;

          return (
            <div
              key={index}
              className="border-2 border-[#1a1a1a] rounded-lg overflow-hidden"
            >
              <div className="bg-[#1a1a1a] px-4 py-2 flex items-center justify-between">
                <span className="text-white font-medium text-sm">{engineName}</span>
                <span className="text-[#DFFE68] text-xs font-bold">
                  &quot;{res.query}&quot;
                </span>
              </div>
              <div className="p-4 bg-[#f5f5f5]">
                <p className="text-sm text-[#4a4a4a] whitespace-pre-wrap">
                  {res.response}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {isGated && (
        <div className="mt-6 p-4 bg-[#f5f5f5] border-2 border-dashed border-[#1a1a1a] rounded-lg text-center">
          <p className="text-sm text-[#6b6b6b]">
            Unlock full results to see all sample responses
          </p>
        </div>
      )}
    </div>
  );
}

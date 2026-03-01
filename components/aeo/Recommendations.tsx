"use client";

interface RecommendationsProps {
  recommendations: string[];
  isGated: boolean;
}

export function Recommendations({ recommendations, isGated }: RecommendationsProps) {
  return (
    <div className="bg-white border-2 border-[#1a1a1a] rounded-2xl p-6 shadow-[4px_4px_0px_0px_#1a1a1a]">
      <h3 className="text-xl font-bold text-[#1a1a1a] mb-6">Recommendations</h3>

      <div className="space-y-4">
        {recommendations.map((rec, index) => (
          <div
            key={index}
            className="flex items-start gap-4 p-4 bg-[#f5f5f5] rounded-lg border-2 border-[#1a1a1a] hover:shadow-[4px_4px_0px_0px_#1a1a1a] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all"
          >
            <div className="flex-shrink-0 w-8 h-8 bg-[#DFFE68] border-2 border-[#1a1a1a] rounded-full flex items-center justify-center font-bold text-[#1a1a1a] text-sm">
              {index + 1}
            </div>
            <p className="text-[#4a4a4a] text-sm leading-relaxed">{rec}</p>
          </div>
        ))}
      </div>

      {isGated && (
        <div className="mt-6 p-4 bg-[#f5f5f5] border-2 border-dashed border-[#1a1a1a] rounded-lg text-center">
          <p className="text-sm text-[#6b6b6b]">
            Unlock full results to see all recommendations
          </p>
        </div>
      )}
    </div>
  );
}

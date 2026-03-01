"use client";

interface CompetitorScore {
  score: number;
  mentionRate?: number;
  positionScore?: number;
}

interface CompetitorComparisonProps {
  company: string;
  companyScore: number;
  competitorScores: Record<string, CompetitorScore>;
  isGated: boolean;
}

export function CompetitorComparison({
  company,
  companyScore,
  competitorScores,
  isGated,
}: CompetitorComparisonProps) {
  const getScoreColor = (score: number) => {
    if (score >= 60) return "#10B981";
    if (score >= 40) return "#F59E0B";
    return "#EF4444";
  };

  // Combine company and competitors, sort by score
  const allScores = [
    { name: company, score: companyScore, isTarget: true },
    ...Object.entries(competitorScores).map(([name, data]) => ({
      name,
      score: data.score,
      mentionRate: data.mentionRate,
      isTarget: false,
    })),
  ].sort((a, b) => b.score - a.score);

  const maxScore = Math.max(...allScores.map((s) => s.score), 1);

  return (
    <div className="bg-white border-2 border-[#1a1a1a] rounded-2xl p-6 shadow-[4px_4px_0px_0px_#1a1a1a]">
      <h3 className="text-xl font-bold text-[#1a1a1a] mb-6">
        Competitive Comparison
      </h3>

      <div className="space-y-3">
        {allScores.map((item, index) => {
          const scoreColor = getScoreColor(item.score);

          return (
            <div
              key={item.name}
              className={`p-3 rounded-lg ${
                item.isTarget
                  ? "bg-[#DFFE68]/30 border-2 border-[#1a1a1a]"
                  : "bg-[#f5f5f5]"
              }`}
            >
              <div className="flex items-center gap-3">
                <span
                  className={`w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold ${
                    item.isTarget
                      ? "bg-[#1a1a1a] text-white"
                      : "bg-white border border-[#1a1a1a] text-[#1a1a1a]"
                  }`}
                >
                  {index + 1}
                </span>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span
                      className={`font-medium ${
                        item.isTarget ? "font-bold text-[#1a1a1a]" : "text-[#4a4a4a]"
                      }`}
                    >
                      {item.name}
                      {item.isTarget && (
                        <span className="ml-2 text-xs text-[#6b6b6b]">(You)</span>
                      )}
                    </span>
                    <span
                      className="font-extrabold"
                      style={{ color: scoreColor }}
                    >
                      {item.score}
                    </span>
                  </div>
                  <div className="h-2 bg-white border border-[#e5e5e5] rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${(item.score / maxScore) * 100}%`,
                        backgroundColor: item.isTarget ? "#1a1a1a" : scoreColor,
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {isGated && (
        <div className="mt-6 p-4 bg-[#f5f5f5] border-2 border-dashed border-[#1a1a1a] rounded-lg text-center">
          <p className="text-sm text-[#6b6b6b]">
            Unlock full results to see detailed competitor metrics
          </p>
        </div>
      )}
    </div>
  );
}

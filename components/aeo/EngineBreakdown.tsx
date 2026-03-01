"use client";

import { ENGINES } from "@/lib/aeo/engines";

interface EngineScore {
  score: number;
  mentionedCount?: number;
  totalQueries?: number;
  mentionRate?: number;
  positionScore?: number;
  sentimentRate?: number;
}

interface EngineBreakdownProps {
  engineScores: Record<string, EngineScore>;
  isGated: boolean;
}

export function EngineBreakdown({ engineScores, isGated }: EngineBreakdownProps) {
  const getScoreColor = (score: number) => {
    if (score >= 60) return "#10B981";
    if (score >= 40) return "#F59E0B";
    return "#EF4444";
  };

  const engines = Object.entries(engineScores);
  const maxScore = Math.max(...engines.map(([, s]) => s.score), 1);

  return (
    <div className="bg-white border-2 border-[#1a1a1a] rounded-2xl p-6 shadow-[4px_4px_0px_0px_#1a1a1a]">
      <h3 className="text-xl font-bold text-[#1a1a1a] mb-6">Engine Breakdown</h3>

      <div className="space-y-4">
        {engines.map(([engine, score]) => {
          const engineName = ENGINES[engine]?.name || engine;
          const scoreColor = getScoreColor(score.score);

          return (
            <div key={engine}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-[#1a1a1a]">{engineName}</span>
                  {!isGated && score.mentionedCount !== undefined && (
                    <span className="text-xs text-[#6b6b6b]">
                      ({score.mentionedCount}/{score.totalQueries} queries)
                    </span>
                  )}
                </div>
                <span
                  className="text-xl font-extrabold"
                  style={{ color: scoreColor }}
                >
                  {score.score}
                </span>
              </div>
              <div className="h-3 bg-[#f5f5f5] border border-[#1a1a1a] rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${(score.score / maxScore) * 100}%`,
                    backgroundColor: scoreColor,
                  }}
                />
              </div>
              {!isGated && score.mentionRate !== undefined && (
                <div className="flex gap-4 mt-2 text-xs text-[#6b6b6b]">
                  <span>Mentions: {score.mentionRate}%</span>
                  <span>Position: {score.positionScore}%</span>
                  <span>Sentiment: {score.sentimentRate}%</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {isGated && (
        <div className="mt-6 p-4 bg-[#f5f5f5] border-2 border-dashed border-[#1a1a1a] rounded-lg text-center">
          <p className="text-sm text-[#6b6b6b]">
            Unlock full results to see detailed engine metrics
          </p>
        </div>
      )}
    </div>
  );
}

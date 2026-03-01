"use client";

interface ScoreCardProps {
  score: number;
  mentionRate: number;
  positionScore: number;
  sentimentRate: number;
}

export function ScoreCard({
  score,
  mentionRate,
  positionScore,
  sentimentRate,
}: ScoreCardProps) {
  const getScoreColor = (s: number) => {
    if (s >= 60) return "#10B981";
    if (s >= 40) return "#F59E0B";
    return "#EF4444";
  };

  const getScoreLabel = (s: number) => {
    if (s >= 75) return "Excellent";
    if (s >= 60) return "Good";
    if (s >= 40) return "Average";
    return "Critical";
  };

  const scoreColor = getScoreColor(score);

  return (
    <div className="bg-white border-2 border-[#1a1a1a] rounded-2xl p-8 shadow-[6px_6px_0px_0px_#1a1a1a]">
      {/* Main Score */}
      <div className="text-center mb-8">
        <p className="text-sm font-bold text-[#6b6b6b] uppercase tracking-wide mb-2">
          AI Visibility Score
        </p>
        <div className="relative inline-flex items-center justify-center">
          {/* Circular progress background */}
          <svg className="w-40 h-40 transform -rotate-90">
            <circle
              cx="80"
              cy="80"
              r="70"
              stroke="#f5f5f5"
              strokeWidth="12"
              fill="none"
            />
            <circle
              cx="80"
              cy="80"
              r="70"
              stroke={scoreColor}
              strokeWidth="12"
              fill="none"
              strokeDasharray={`${(score / 100) * 440} 440`}
              strokeLinecap="round"
              className="transition-all duration-1000"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span
              className="text-5xl font-extrabold"
              style={{ color: scoreColor }}
            >
              {score}
            </span>
            <span className="text-sm text-[#6b6b6b]">/100</span>
          </div>
        </div>
        <p
          className="mt-2 text-sm font-bold"
          style={{ color: scoreColor }}
        >
          {getScoreLabel(score)}
        </p>
      </div>

      {/* Component Scores */}
      <div className="grid grid-cols-3 gap-4">
        <div className="text-center">
          <div
            className="text-2xl font-extrabold"
            style={{ color: getScoreColor(mentionRate) }}
          >
            {mentionRate}%
          </div>
          <p className="text-xs text-[#6b6b6b] mt-1">Mention Rate</p>
        </div>
        <div className="text-center">
          <div
            className="text-2xl font-extrabold"
            style={{ color: getScoreColor(positionScore) }}
          >
            {positionScore}%
          </div>
          <p className="text-xs text-[#6b6b6b] mt-1">Position Score</p>
        </div>
        <div className="text-center">
          <div
            className="text-2xl font-extrabold"
            style={{ color: getScoreColor(sentimentRate) }}
          >
            {sentimentRate}%
          </div>
          <p className="text-xs text-[#6b6b6b] mt-1">Sentiment</p>
        </div>
      </div>
    </div>
  );
}

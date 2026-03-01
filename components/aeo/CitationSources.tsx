"use client";

interface CitationSourcesProps {
  topCitations: [string, number][];
  isGated: boolean;
}

const SOURCE_COLORS: Record<string, string> = {
  "g2.com": "#FF492C",
  "gartner.com": "#0076D6",
  "trustradius.com": "#00A3E0",
  "capterra.com": "#FF9D28",
  "reddit.com": "#FF4500",
  "linkedin.com": "#0A66C2",
  "forbes.com": "#000000",
  "techcrunch.com": "#00A562",
};

export function CitationSources({ topCitations, isGated }: CitationSourcesProps) {
  const maxCount = topCitations.length > 0 ? topCitations[0][1] : 1;

  const getSourceColor = (domain: string) => {
    const key = Object.keys(SOURCE_COLORS).find((k) =>
      domain.toLowerCase().includes(k)
    );
    return key ? SOURCE_COLORS[key] : "#6b6b6b";
  };

  const getSourceType = (domain: string) => {
    if (["g2.com", "gartner.com", "trustradius.com", "capterra.com"].some((s) =>
      domain.includes(s)
    )) {
      return "Review Site";
    }
    if (["reddit.com", "linkedin.com", "twitter.com", "x.com"].some((s) =>
      domain.includes(s)
    )) {
      return "Social";
    }
    if (["forbes.com", "techcrunch.com", "bloomberg.com", "wsj.com"].some((s) =>
      domain.includes(s)
    )) {
      return "News";
    }
    return "Other";
  };

  return (
    <div className="bg-white border-2 border-[#1a1a1a] rounded-2xl p-6 shadow-[4px_4px_0px_0px_#1a1a1a]">
      <h3 className="text-xl font-bold text-[#1a1a1a] mb-6">Top Citation Sources</h3>

      {topCitations.length === 0 ? (
        <p className="text-[#6b6b6b] text-center py-8">No citations found</p>
      ) : (
        <div className="space-y-3">
          {topCitations.map(([domain, count], index) => {
            const color = getSourceColor(domain);
            const type = getSourceType(domain);

            return (
              <div
                key={domain}
                className="flex items-center gap-3 p-3 bg-[#f5f5f5] rounded-lg"
              >
                <span className="text-sm font-bold text-[#6b6b6b] w-6">
                  {index + 1}
                </span>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-[#1a1a1a]">{domain}</span>
                      <span
                        className="px-2 py-0.5 rounded text-xs font-medium"
                        style={{
                          backgroundColor: `${color}20`,
                          color,
                        }}
                      >
                        {type}
                      </span>
                    </div>
                    <span className="font-bold text-[#1a1a1a]">{count}</span>
                  </div>
                  <div className="h-2 bg-white border border-[#e5e5e5] rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${(count / maxCount) * 100}%`,
                        backgroundColor: color,
                      }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {isGated && (
        <div className="mt-6 p-4 bg-[#f5f5f5] border-2 border-dashed border-[#1a1a1a] rounded-lg text-center">
          <p className="text-sm text-[#6b6b6b]">
            Unlock full results to see all citation sources
          </p>
        </div>
      )}

      <div className="mt-6 p-4 bg-[#3B82F6]/10 border-2 border-[#3B82F6] rounded-lg">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-8 h-8 bg-[#3B82F6] rounded-full flex items-center justify-center">
            <svg
              className="w-4 h-4 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <div>
            <p className="text-sm text-[#1a1a1a] font-medium">Why Citations Matter</p>
            <p className="text-xs text-[#4a4a4a] mt-1">
              AI engines cite these sources when recommending products. Getting featured
              on these platforms increases your visibility in AI responses.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

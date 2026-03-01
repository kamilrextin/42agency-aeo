"use client";

import { useEffect, useState, useCallback } from "react";
import { ScoreCard } from "@/components/aeo/ScoreCard";
import { EngineBreakdown } from "@/components/aeo/EngineBreakdown";
import { CompetitorComparison } from "@/components/aeo/CompetitorComparison";
import { CitationSources } from "@/components/aeo/CitationSources";
import { Recommendations } from "@/components/aeo/Recommendations";
import { SampleResponses } from "@/components/aeo/SampleResponses";
import { EmailGate } from "@/components/aeo/EmailGate";
import { ShareButton } from "@/components/aeo/ShareButton";

interface ResultsData {
  id: string;
  company: string;
  competitors: string[];
  category: string;
  status: string;
  visibilityScore: number;
  mentionRate: number;
  positionScore: number;
  sentimentRate: number;
  isGated: boolean;
  unlocked: boolean;
  engineScores: Record<string, { score: number; [key: string]: unknown }>;
  competitorScores: Record<string, { score: number; [key: string]: unknown }>;
  topCitations: [string, number][];
  recommendations: string[];
  sampleResponses: Array<{ engine: string; query: string; queryType?: string; response: string }>;
}

export function ResultsDashboard({ jobId }: { jobId: string }) {
  const [data, setData] = useState<ResultsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchResults = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/aeo/results/${jobId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch results");
      }
      const results = await response.json();
      setData(results);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, [jobId]);

  useEffect(() => {
    fetchResults();
  }, [fetchResults]);

  const handleUnlock = async () => {
    // Re-fetch results after unlock
    await fetchResults();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex gap-2">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-3 h-3 bg-[#DFFE68] border-2 border-[#1a1a1a] rounded-full animate-bounce"
              style={{ animationDelay: `${i * 0.15}s` }}
            />
          ))}
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="text-center py-12">
        <p className="text-[#EF4444]">{error || "Failed to load results"}</p>
      </div>
    );
  }

  return (
    <>
      {/* Email Gate Overlay */}
      {data.isGated && (
        <EmailGate
          jobId={jobId}
          company={data.company}
          score={data.visibilityScore}
          onUnlock={handleUnlock}
        />
      )}

      {/* Share Button (top right) */}
      {!data.isGated && (
        <div className="flex justify-end mb-6">
          <ShareButton
            company={data.company}
            score={data.visibilityScore}
            jobId={jobId}
          />
        </div>
      )}

      {/* Main Score */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-1">
          <ScoreCard
            score={data.visibilityScore}
            mentionRate={data.mentionRate}
            positionScore={data.positionScore}
            sentimentRate={data.sentimentRate}
          />
        </div>
        <div className="lg:col-span-2">
          <EngineBreakdown
            engineScores={data.engineScores}
            isGated={data.isGated}
          />
        </div>
      </div>

      {/* Competitor & Citations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {Object.keys(data.competitorScores).length > 0 && (
          <CompetitorComparison
            company={data.company}
            companyScore={data.visibilityScore}
            competitorScores={data.competitorScores}
            isGated={data.isGated}
          />
        )}
        <CitationSources
          topCitations={data.topCitations}
          isGated={data.isGated}
        />
      </div>

      {/* Recommendations */}
      {data.recommendations.length > 0 && (
        <div className="mb-8">
          <Recommendations
            recommendations={data.recommendations}
            isGated={data.isGated}
          />
        </div>
      )}

      {/* Sample Responses */}
      {data.sampleResponses.length > 0 && (
        <SampleResponses responses={data.sampleResponses} isGated={data.isGated} />
      )}
    </>
  );
}

"use client";

import { useState } from "react";

interface EmailGateProps {
  jobId: string;
  company: string;
  score: number;
  onUnlock?: () => void;
}

export function EmailGate({ jobId, company, score, onUnlock }: EmailGateProps) {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const response = await fetch("/api/aeo/unlock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobId, email }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to unlock results");
      }

      // Call the onUnlock callback to refresh data
      if (onUnlock) {
        onUnlock();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white border-2 border-[#1a1a1a] rounded-2xl p-8 max-w-md w-full shadow-[8px_8px_0px_0px_#1a1a1a]">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-[#DFFE68] border-2 border-[#1a1a1a] rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-[#1a1a1a]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-extrabold tracking-tight text-[#1a1a1a] mb-2">
            Unlock Full Results
          </h2>
          <p className="text-[#6b6b6b]">
            Enter your email to access the complete AEO analysis for{" "}
            <span className="font-bold text-[#1a1a1a]">{company}</span>
          </p>
        </div>

        {/* Score Preview */}
        <div className="bg-[#f5f5f5] border-2 border-[#1a1a1a] rounded-lg p-4 mb-6 text-center">
          <p className="text-xs text-[#6b6b6b] uppercase font-bold mb-1">
            Your Score
          </p>
          <span
            className="text-4xl font-extrabold"
            style={{
              color: score >= 60 ? "#10B981" : score >= 40 ? "#F59E0B" : "#EF4444",
            }}
          >
            {score}
            <span className="text-lg text-[#6b6b6b]">/100</span>
          </span>
        </div>

        {/* What you get */}
        <div className="mb-6">
          <p className="text-sm font-bold text-[#1a1a1a] mb-2">
            What you&apos;ll unlock:
          </p>
          <ul className="text-sm text-[#4a4a4a] space-y-1">
            <li className="flex items-center gap-2">
              <svg
                className="w-4 h-4 text-[#10B981]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              Detailed engine-by-engine breakdown
            </li>
            <li className="flex items-center gap-2">
              <svg
                className="w-4 h-4 text-[#10B981]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              Full competitor comparison
            </li>
            <li className="flex items-center gap-2">
              <svg
                className="w-4 h-4 text-[#10B981]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              All citation sources
            </li>
            <li className="flex items-center gap-2">
              <svg
                className="w-4 h-4 text-[#10B981]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              Actionable recommendations
            </li>
          </ul>
        </div>

        <form onSubmit={handleSubmit}>
          <input
            type="email"
            required
            placeholder="you@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 border-2 border-[#1a1a1a] rounded-lg text-[#1a1a1a] placeholder-[#9a9a9a] focus:outline-none focus:ring-2 focus:ring-[#DFFE68] focus:border-[#1a1a1a] mb-4"
          />

          {error && (
            <div className="p-3 bg-[#EF4444]/10 border border-[#EF4444] rounded-lg mb-4">
              <p className="text-sm text-[#EF4444]">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full px-6 py-4 bg-[#DFFE68] text-[#1a1a1a] font-bold rounded-lg border-2 border-[#1a1a1a] shadow-[4px_4px_0px_0px_#1a1a1a] hover:bg-[#C8E85C] hover:shadow-[6px_6px_0px_0px_#1a1a1a] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Unlocking..." : "Unlock Full Results"}
          </button>
        </form>

        <p className="text-xs text-[#6b6b6b] text-center mt-4">
          We&apos;ll send the full report to your email.
        </p>
      </div>
    </div>
  );
}

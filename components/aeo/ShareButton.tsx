"use client";

import { useState } from "react";

interface ShareButtonProps {
  company: string;
  score: number;
  jobId: string;
}

export function ShareButton({ company, score, jobId }: ShareButtonProps) {
  const [showToast, setShowToast] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const shareUrl = `https://intel.42agency.com/aeo/${jobId}`;

  const handleShare = async () => {
    setIsGenerating(true);

    try {
      // Generate share text
      const scoreLabel = score >= 60 ? "Good" : score >= 40 ? "Average" : "Critical";
      const shareText = `Just analyzed ${company}'s AI visibility score: ${score}/100 (${scoreLabel})

How visible is your brand in ChatGPT, Perplexity, and Gemini?

Check your own AEO score for free: intel.42agency.com/aeo`;

      // Copy to clipboard
      await navigator.clipboard.writeText(shareText);

      // Show toast
      setShowToast(true);
      setTimeout(() => setShowToast(false), 5000);

      // Open LinkedIn after a short delay
      setTimeout(() => {
        window.open("https://www.linkedin.com/feed/", "_blank");
      }, 500);
    } catch (error) {
      console.error("Share error:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyLink = async () => {
    await navigator.clipboard.writeText(shareUrl);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  return (
    <div className="relative">
      <div className="flex items-center gap-2">
        {/* Copy Link Button */}
        <button
          onClick={handleCopyLink}
          className="px-4 py-2 bg-white text-[#1a1a1a] font-medium rounded-lg border-2 border-[#1a1a1a] hover:bg-[#f5f5f5] transition-colors flex items-center gap-2 text-sm"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"
            />
          </svg>
          Copy Link
        </button>

        {/* Share to LinkedIn Button */}
        <button
          onClick={handleShare}
          disabled={isGenerating}
          className="px-4 py-2 bg-[#0A66C2] text-white font-medium rounded-lg hover:bg-[#004182] transition-colors flex items-center gap-2 text-sm disabled:opacity-50"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
          </svg>
          {isGenerating ? "Preparing..." : "Share to LinkedIn"}
        </button>
      </div>

      {/* Toast */}
      {showToast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-[#1a1a1a] text-white px-6 py-4 rounded-xl shadow-lg z-50 max-w-md text-center animate-in fade-in slide-in-from-bottom-4">
          <div className="font-bold mb-1">Copied to clipboard!</div>
          <div className="text-sm text-gray-400">
            Paste your post on LinkedIn and share your results.
          </div>
        </div>
      )}
    </div>
  );
}

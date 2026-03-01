"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface StatusUpdate {
  status: "pending" | "running" | "completed" | "failed";
  progress: number;
  currentStep: string;
  completedQueries: number;
  totalQueries: number;
  error?: string;
}

export function ProgressTracker({ jobId }: { jobId: string }) {
  const router = useRouter();
  const [status, setStatus] = useState<StatusUpdate>({
    status: "pending",
    progress: 0,
    currentStep: "Initializing...",
    completedQueries: 0,
    totalQueries: 0,
  });

  useEffect(() => {
    const eventSource = new EventSource(`/api/aeo/status/${jobId}`);

    eventSource.onmessage = (event) => {
      const data: StatusUpdate = JSON.parse(event.data);
      setStatus(data);

      if (data.status === "completed" || data.status === "failed") {
        eventSource.close();
        if (data.status === "completed") {
          // Refresh the page to show results
          router.refresh();
        }
      }
    };

    eventSource.onerror = () => {
      eventSource.close();
    };

    return () => {
      eventSource.close();
    };
  }, [jobId, router]);

  const isComplete = status.status === "completed";
  const isFailed = status.status === "failed";

  return (
    <div className="bg-white border-2 border-[#1a1a1a] rounded-2xl p-8 shadow-[6px_6px_0px_0px_#1a1a1a]">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-extrabold tracking-tight text-[#1a1a1a] mb-2">
          {isComplete
            ? "Analysis Complete!"
            : isFailed
            ? "Analysis Failed"
            : "Analyzing AI Visibility..."}
        </h2>
        <p className="text-[#6b6b6b]">{status.currentStep}</p>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between text-sm font-medium mb-2">
          <span className="text-[#4a4a4a]">Progress</span>
          <span className="text-[#1a1a1a]">{status.progress}%</span>
        </div>
        <div className="h-4 bg-[#f5f5f5] border-2 border-[#1a1a1a] rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-500 ${
              isFailed ? "bg-[#EF4444]" : "bg-[#DFFE68]"
            }`}
            style={{ width: `${status.progress}%` }}
          />
        </div>
      </div>

      {/* Query Counter */}
      {status.totalQueries > 0 && (
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="bg-[#f5f5f5] border-2 border-[#1a1a1a] rounded-lg p-4">
            <div className="text-2xl font-extrabold text-[#1a1a1a]">
              {status.completedQueries}
            </div>
            <div className="text-xs text-[#6b6b6b]">Completed</div>
          </div>
          <div className="bg-[#f5f5f5] border-2 border-[#1a1a1a] rounded-lg p-4">
            <div className="text-2xl font-extrabold text-[#1a1a1a]">
              {status.totalQueries - status.completedQueries}
            </div>
            <div className="text-xs text-[#6b6b6b]">Remaining</div>
          </div>
          <div className="bg-[#f5f5f5] border-2 border-[#1a1a1a] rounded-lg p-4">
            <div className="text-2xl font-extrabold text-[#1a1a1a]">
              {status.totalQueries}
            </div>
            <div className="text-xs text-[#6b6b6b]">Total</div>
          </div>
        </div>
      )}

      {/* Error Message */}
      {isFailed && status.error && (
        <div className="mt-6 p-4 bg-[#EF4444]/10 border-2 border-[#EF4444] rounded-lg">
          <p className="text-sm text-[#EF4444] font-medium">{status.error}</p>
        </div>
      )}

      {/* Loading Animation */}
      {!isComplete && !isFailed && (
        <div className="mt-8 flex justify-center">
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
      )}
    </div>
  );
}

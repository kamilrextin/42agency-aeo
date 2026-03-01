"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const AVAILABLE_ENGINES = [
  { id: "chatgpt", name: "ChatGPT", enabled: true },
  { id: "perplexity", name: "Perplexity", enabled: true },
  { id: "gemini", name: "Gemini", enabled: true },
  { id: "grok", name: "Grok", enabled: false },
  { id: "copilot", name: "Copilot", enabled: false },
];

export function InputForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    company: "",
    competitors: "",
    category: "",
    engines: ["chatgpt", "perplexity", "gemini"],
  });

  const handleEngineToggle = (engineId: string) => {
    setFormData((prev) => ({
      ...prev,
      engines: prev.engines.includes(engineId)
        ? prev.engines.filter((e) => e !== engineId)
        : [...prev.engines, engineId],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const competitors = formData.competitors
        .split(",")
        .map((c) => c.trim())
        .filter(Boolean);

      const response = await fetch("/api/aeo/trigger", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          company: formData.company.trim(),
          competitors,
          category: formData.category.trim(),
          engines: formData.engines,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to start analysis");
      }

      const data = await response.json();
      router.push(`/aeo/${data.jobId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Company Name */}
      <div>
        <label htmlFor="company" className="block text-sm font-bold text-[#1a1a1a] mb-2">
          Company Name *
        </label>
        <input
          type="text"
          id="company"
          required
          placeholder="e.g., Vanta"
          value={formData.company}
          onChange={(e) => setFormData({ ...formData, company: e.target.value })}
          className="w-full px-4 py-3 border-2 border-[#1a1a1a] rounded-lg text-[#1a1a1a] placeholder-[#9a9a9a] focus:outline-none focus:ring-2 focus:ring-[#DFFE68] focus:border-[#1a1a1a]"
        />
      </div>

      {/* Competitors */}
      <div>
        <label htmlFor="competitors" className="block text-sm font-bold text-[#1a1a1a] mb-2">
          Competitors
        </label>
        <input
          type="text"
          id="competitors"
          placeholder="e.g., Drata, Secureframe, Launchdarkly"
          value={formData.competitors}
          onChange={(e) => setFormData({ ...formData, competitors: e.target.value })}
          className="w-full px-4 py-3 border-2 border-[#1a1a1a] rounded-lg text-[#1a1a1a] placeholder-[#9a9a9a] focus:outline-none focus:ring-2 focus:ring-[#DFFE68] focus:border-[#1a1a1a]"
        />
        <p className="mt-1 text-sm text-[#6b6b6b]">Comma-separated list of competitors to compare against</p>
      </div>

      {/* Category */}
      <div>
        <label htmlFor="category" className="block text-sm font-bold text-[#1a1a1a] mb-2">
          Product Category *
        </label>
        <input
          type="text"
          id="category"
          required
          placeholder="e.g., compliance automation"
          value={formData.category}
          onChange={(e) => setFormData({ ...formData, category: e.target.value })}
          className="w-full px-4 py-3 border-2 border-[#1a1a1a] rounded-lg text-[#1a1a1a] placeholder-[#9a9a9a] focus:outline-none focus:ring-2 focus:ring-[#DFFE68] focus:border-[#1a1a1a]"
        />
        <p className="mt-1 text-sm text-[#6b6b6b]">The category buyers search for (e.g., &quot;employee experience platform&quot;)</p>
      </div>

      {/* AI Engines */}
      <div>
        <label className="block text-sm font-bold text-[#1a1a1a] mb-3">
          AI Engines to Analyze
        </label>
        <div className="flex flex-wrap gap-3">
          {AVAILABLE_ENGINES.map((engine) => (
            <button
              key={engine.id}
              type="button"
              disabled={!engine.enabled}
              onClick={() => engine.enabled && handleEngineToggle(engine.id)}
              className={`px-4 py-2 rounded-lg border-2 font-medium text-sm transition-all ${
                formData.engines.includes(engine.id)
                  ? "bg-[#DFFE68] border-[#1a1a1a] text-[#1a1a1a] shadow-[2px_2px_0px_0px_#1a1a1a]"
                  : engine.enabled
                  ? "bg-white border-[#1a1a1a] text-[#4a4a4a] hover:bg-[#f5f5f5]"
                  : "bg-[#f5f5f5] border-[#e5e5e5] text-[#9a9a9a] cursor-not-allowed"
              }`}
            >
              {engine.name}
              {!engine.enabled && <span className="ml-1 text-xs">(Coming soon)</span>}
            </button>
          ))}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-[#EF4444]/10 border-2 border-[#EF4444] rounded-lg">
          <p className="text-sm text-[#EF4444] font-medium">{error}</p>
        </div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isLoading || formData.engines.length === 0}
        className={`w-full px-6 py-4 bg-[#DFFE68] text-[#1a1a1a] font-bold rounded-lg border-2 border-[#1a1a1a] shadow-[4px_4px_0px_0px_#1a1a1a] hover:bg-[#C8E85C] hover:shadow-[6px_6px_0px_0px_#1a1a1a] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-[4px_4px_0px_0px_#1a1a1a] disabled:hover:translate-x-0 disabled:hover:translate-y-0`}
      >
        {isLoading ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Starting Analysis...
          </span>
        ) : (
          "Analyze AI Visibility"
        )}
      </button>

      {/* Info Box */}
      <div className="p-4 bg-[#f5f5f5] border-2 border-[#1a1a1a] rounded-lg">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-8 h-8 bg-[#3B82F6]/10 rounded-full flex items-center justify-center">
            <svg className="w-4 h-4 text-[#3B82F6]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <p className="text-sm text-[#4a4a4a]">
              <strong>Analysis takes 5-10 minutes.</strong> We&apos;ll query each AI engine with multiple prompts to measure your brand&apos;s visibility, positioning, and sentiment compared to competitors.
            </p>
          </div>
        </div>
      </div>
    </form>
  );
}

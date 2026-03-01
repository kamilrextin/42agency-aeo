import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { db, aeoReports } from "@/lib/db";
import { Header } from "@/components/aeo/Header";
import { Footer } from "@/components/aeo/Footer";
import { ProgressTracker } from "@/components/aeo/ProgressTracker";
import { ResultsDashboard } from "./ResultsDashboard";

interface PageProps {
  params: Promise<{ jobId: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { jobId } = await params;

  const report = await db.query.aeoReports.findFirst({
    where: eq(aeoReports.id, jobId),
  });

  if (!report) {
    return { title: "Report Not Found | AEO Analyzer" };
  }

  return {
    title: `${report.company} AEO Analysis | AI Visibility Score: ${report.visibilityScore || 0}/100`,
    description: `AI Engine Optimization report for ${report.company} - analyzing visibility across ChatGPT, Perplexity, and Gemini for ${report.category} queries.`,
    openGraph: {
      title: `${report.company} AEO Analysis | Score: ${report.visibilityScore || 0}/100`,
      description: `AI visibility analysis for ${report.company} in the ${report.category} category.`,
      type: "website",
    },
  };
}

export default async function ResultsPage({ params }: PageProps) {
  const { jobId } = await params;

  const report = await db.query.aeoReports.findFirst({
    where: eq(aeoReports.id, jobId),
  });

  if (!report) {
    notFound();
  }

  const isRunning = report.status === "pending" || report.status === "running";
  const isCompleted = report.status === "completed";
  const isFailed = report.status === "failed";

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header />

      {/* Hero Section */}
      <section className="bg-[#f5f5f5] border-b-2 border-[#1a1a1a]">
        <div className="max-w-6xl mx-auto px-6 py-12">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <span className="px-3 py-1 bg-white border-2 border-[#1a1a1a] rounded-full text-xs font-bold text-[#1a1a1a] shadow-[2px_2px_0px_0px_#1a1a1a]">
                  AEO ANALYSIS
                </span>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold ${
                    isCompleted
                      ? "bg-[#10B981]/10 border-2 border-[#10B981] text-[#10B981]"
                      : isRunning
                      ? "bg-[#3B82F6]/10 border-2 border-[#3B82F6] text-[#3B82F6]"
                      : "bg-[#EF4444]/10 border-2 border-[#EF4444] text-[#EF4444]"
                  }`}
                >
                  {isCompleted
                    ? "Complete"
                    : isRunning
                    ? "In Progress"
                    : "Failed"}
                </span>
              </div>
              <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-[#1a1a1a] mb-2">
                {report.company}
              </h1>
              <p className="text-[#4a4a4a]">{report.category}</p>
            </div>

            {isCompleted && report.visibilityScore !== null && (
              <div className="bg-white border-2 border-[#1a1a1a] rounded-2xl p-6 shadow-[4px_4px_0px_0px_#1a1a1a] text-center min-w-[160px]">
                <p className="text-sm font-bold text-[#6b6b6b] uppercase tracking-wide mb-1">
                  Score
                </p>
                <div
                  className="text-5xl font-extrabold"
                  style={{
                    color:
                      report.visibilityScore >= 60
                        ? "#10B981"
                        : report.visibilityScore >= 40
                        ? "#F59E0B"
                        : "#EF4444",
                  }}
                >
                  {Math.round(report.visibilityScore)}
                  <span className="text-2xl text-[#6b6b6b]">/100</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="flex-1 py-12 px-6">
        <div className="max-w-6xl mx-auto">
          {isRunning ? (
            <div className="max-w-lg mx-auto">
              <ProgressTracker jobId={jobId} />
            </div>
          ) : isFailed ? (
            <div className="max-w-lg mx-auto">
              <div className="bg-white border-2 border-[#EF4444] rounded-2xl p-8 shadow-[6px_6px_0px_0px_#EF4444] text-center">
                <div className="w-16 h-16 bg-[#EF4444]/10 border-2 border-[#EF4444] rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-8 h-8 text-[#EF4444]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                </div>
                <h2 className="text-2xl font-extrabold text-[#1a1a1a] mb-2">
                  Analysis Failed
                </h2>
                <p className="text-[#4a4a4a] mb-6">
                  {report.error || "An error occurred while analyzing AI engines."}
                </p>
                <a
                  href="/aeo"
                  className="inline-block px-6 py-3 bg-[#1a1a1a] text-white font-bold rounded-lg hover:bg-[#333] transition-colors"
                >
                  Try Again
                </a>
              </div>
            </div>
          ) : (
            <ResultsDashboard jobId={jobId} />
          )}
        </div>
      </main>

      {/* CTA Section */}
      {isCompleted && (
        <section className="py-16 px-6 bg-[#f5f5f5] border-t-2 border-[#1a1a1a]">
          <div className="max-w-4xl mx-auto">
            <div className="bg-[#DFFE68] border-2 border-[#1a1a1a] rounded-2xl p-8 md:p-12 shadow-[6px_6px_0px_0px_#1a1a1a] text-center">
              <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-[#1a1a1a] mb-4">
                Need Help Improving Your AI Visibility?
              </h2>
              <p className="text-[#4a4a4a] mb-8 max-w-2xl mx-auto">
                42 Agency specializes in AEO (AI Engine Optimization) strategies for
                B2B companies. Let us help you get discovered by AI-powered search
                engines.
              </p>
              <a
                href="https://42agency.com/contact"
                target="_blank"
                className="inline-block px-8 py-4 bg-[#1a1a1a] text-white font-bold rounded-lg hover:bg-[#333] transition-colors"
              >
                Get an AEO Strategy
              </a>
            </div>
          </div>
        </section>
      )}

      <Footer />
    </div>
  );
}

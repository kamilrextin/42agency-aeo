import { Header } from "@/components/aeo/Header";
import { Footer } from "@/components/aeo/Footer";
import { InputForm } from "@/components/aeo/InputForm";

export const metadata = {
  title: "AEO Analyzer | AI Visibility Tracker | 42 Agency",
  description: "Analyze your brand's visibility across AI answer engines like ChatGPT, Perplexity, and Gemini. Track mentions, positioning, and sentiment vs competitors.",
  openGraph: {
    title: "AEO Analyzer | AI Visibility Tracker",
    description: "Track your brand visibility across AI answer engines. Free analysis tool by 42 Agency.",
    type: "website",
  },
};

export default function AEOPage() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header />

      {/* Hero Section */}
      <section className="bg-[#f5f5f5] border-b-2 border-[#1a1a1a]">
        <div className="max-w-6xl mx-auto px-6 py-16">
          <div className="max-w-3xl">
            <div className="flex items-center gap-3 mb-4">
              <span className="px-3 py-1 bg-white border-2 border-[#1a1a1a] rounded-full text-xs font-bold text-[#1a1a1a] shadow-[2px_2px_0px_0px_#1a1a1a]">
                AEO ANALYZER
              </span>
              <span className="px-3 py-1 bg-[#10B981]/10 border-2 border-[#10B981] rounded-full text-xs font-bold text-[#10B981]">
                Free Tool
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-[#1a1a1a] mb-4">
              Track Your AI Visibility
            </h1>
            <p className="text-lg text-[#4a4a4a]">
              Discover how AI answer engines like ChatGPT, Perplexity, and Gemini recommend your brand vs competitors. Get actionable insights to improve your AI visibility.
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="flex-1 py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Form Section */}
            <div>
              <h2 className="text-2xl font-extrabold tracking-tight text-[#1a1a1a] mb-6">
                Start Your Analysis
              </h2>
              <div className="bg-white border-2 border-[#1a1a1a] rounded-2xl p-6 md:p-8 shadow-[6px_6px_0px_0px_#1a1a1a]">
                <InputForm />
              </div>
            </div>

            {/* Info Section */}
            <div className="space-y-6">
              <h2 className="text-2xl font-extrabold tracking-tight text-[#1a1a1a] mb-6">
                What You&apos;ll Get
              </h2>

              {/* Feature Cards */}
              <div className="space-y-4">
                {[
                  {
                    icon: (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    ),
                    title: "AI Visibility Score",
                    description: "Get a 0-100 score measuring your overall visibility across AI engines, including mention rate, position, and sentiment.",
                    color: "#DFFE68",
                  },
                  {
                    icon: (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                      </svg>
                    ),
                    title: "Competitive Analysis",
                    description: "See how often competitors are mentioned vs your brand, and identify gaps in your AI presence.",
                    color: "#3B82F6",
                  },
                  {
                    icon: (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                      </svg>
                    ),
                    title: "Citation Sources",
                    description: "Discover which sources AI engines cite when recommending brands in your category (G2, Gartner, Reddit, etc.).",
                    color: "#10B981",
                  },
                  {
                    icon: (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                      </svg>
                    ),
                    title: "Actionable Recommendations",
                    description: "Get prioritized recommendations to improve your brand's visibility in AI-generated answers.",
                    color: "#F59E0B",
                  },
                ].map((feature) => (
                  <div
                    key={feature.title}
                    className="bg-white border-2 border-[#1a1a1a] rounded-xl p-5 shadow-[4px_4px_0px_0px_#1a1a1a] hover:shadow-[6px_6px_0px_0px_#1a1a1a] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all"
                  >
                    <div className="flex items-start gap-4">
                      <div
                        className="flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center border-2 border-[#1a1a1a]"
                        style={{ backgroundColor: feature.color }}
                      >
                        {feature.icon}
                      </div>
                      <div>
                        <h3 className="font-bold text-[#1a1a1a] mb-1">{feature.title}</h3>
                        <p className="text-sm text-[#4a4a4a]">{feature.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Stats */}
              <div className="bg-[#1a1a1a] border-2 border-[#1a1a1a] rounded-xl p-6">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-extrabold text-[#DFFE68]">3</div>
                    <p className="text-xs text-gray-400">AI Engines</p>
                  </div>
                  <div>
                    <div className="text-2xl font-extrabold text-[#DFFE68]">10+</div>
                    <p className="text-xs text-gray-400">Query Types</p>
                  </div>
                  <div>
                    <div className="text-2xl font-extrabold text-[#DFFE68]">100+</div>
                    <p className="text-xs text-gray-400">Data Points</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* CTA Section */}
      <section className="py-16 px-6 bg-[#f5f5f5] border-t-2 border-[#1a1a1a]">
        <div className="max-w-4xl mx-auto">
          <div className="bg-[#DFFE68] border-2 border-[#1a1a1a] rounded-2xl p-8 md:p-12 shadow-[6px_6px_0px_0px_#1a1a1a] text-center">
            <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-[#1a1a1a] mb-4">
              Need Help Improving Your AI Visibility?
            </h2>
            <p className="text-[#4a4a4a] mb-8 max-w-2xl mx-auto">
              42 Agency specializes in AEO (AI Engine Optimization) strategies for B2B companies. Let us help you get discovered by AI-powered search engines.
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

      <Footer />
    </div>
  );
}

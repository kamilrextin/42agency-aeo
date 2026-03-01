import { Header } from "@/components/aeo/Header";
import { Footer } from "@/components/aeo/Footer";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header />

      <main className="flex-1 flex items-center justify-center py-16 px-6">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 bg-[#f5f5f5] border-2 border-[#1a1a1a] rounded-full flex items-center justify-center mx-auto mb-6">
            <svg
              className="w-10 h-10 text-[#6b6b6b]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-[#1a1a1a] mb-3">
            Report Not Found
          </h1>
          <p className="text-[#4a4a4a] mb-8">
            The AEO analysis you&apos;re looking for doesn&apos;t exist or may have been deleted.
          </p>
          <a
            href="/aeo"
            className="inline-block px-8 py-4 bg-[#DFFE68] text-[#1a1a1a] font-bold rounded-lg border-2 border-[#1a1a1a] shadow-[4px_4px_0px_0px_#1a1a1a] hover:bg-[#C8E85C] hover:shadow-[6px_6px_0px_0px_#1a1a1a] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all"
          >
            Start New Analysis
          </a>
        </div>
      </main>

      <Footer />
    </div>
  );
}

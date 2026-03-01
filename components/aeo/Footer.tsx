import Image from "next/image";

export function Footer() {
  return (
    <footer className="border-t-2 border-[#1a1a1a] py-12 px-6 bg-[#1a1a1a]">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-8 border-b border-gray-700">
          <div>
            <Image src="/42-logo.png" alt="42 Agency" width={100} height={24} className="h-6 w-auto brightness-0 invert mb-4" />
            <p className="text-sm text-gray-400">
              B2B performance marketing for companies that sell to enterprises.
            </p>
          </div>
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wide text-[#DFFE68] mb-4">Assess</h4>
            <div className="space-y-2">
              <a href="https://intel.42agency.com/assessments/hubspot-health/" className="block text-sm text-gray-400 hover:text-white">HubSpot Health Check</a>
              <a href="https://intel.42agency.com/assess/calculator/" className="block text-sm text-gray-400 hover:text-white">Benchmark Calculator</a>
              <a href="/aeo" className="block text-sm text-gray-400 hover:text-white">AEO Analyzer</a>
            </div>
          </div>
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wide text-[#DFFE68] mb-4">Benchmarks</h4>
            <div className="space-y-2">
              <a href="https://intel.42agency.com/b2b-benchmarks/" className="block text-sm text-gray-400 hover:text-white">All Benchmarks</a>
              <a href="https://intel.42agency.com/b2b-benchmarks/linkedin-ads-benchmarks/" className="block text-sm text-gray-400 hover:text-white">LinkedIn Ads</a>
            </div>
          </div>
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wide text-[#DFFE68] mb-4">42 Agency</h4>
            <div className="space-y-2">
              <a href="https://42agency.com" target="_blank" className="block text-sm text-gray-400 hover:text-white">Website</a>
              <a href="https://42agency.com/contact" target="_blank" className="block text-sm text-gray-400 hover:text-white">Contact Us</a>
            </div>
          </div>
        </div>
        <div className="pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-gray-500">&copy; 2026 42 Agency. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

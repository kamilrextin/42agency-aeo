import Image from "next/image";

export function Header() {
  return (
    <header className="border-b-2 border-[#1a1a1a] bg-white sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
        <a href="https://intel.42agency.com" className="flex items-center gap-2">
          <Image src="/42-logo.png" alt="42 Agency" width={100} height={28} className="h-7 w-auto" />
        </a>
        <nav className="hidden md:flex items-center gap-1">
          <a href="https://intel.42agency.com/assess/" className="px-4 py-2 text-[#4a4a4a] text-sm font-medium rounded-lg hover:text-[#1a1a1a] hover:bg-[#f5f5f5] transition-all">Assess</a>
          <a href="https://intel.42agency.com/b2b-benchmarks/" className="px-4 py-2 text-[#4a4a4a] text-sm font-medium rounded-lg hover:text-[#1a1a1a] hover:bg-[#f5f5f5] transition-all">Benchmarks</a>
          <a href="https://intel.42agency.com/tools/" className="px-4 py-2 text-[#4a4a4a] text-sm font-medium rounded-lg hover:text-[#1a1a1a] hover:bg-[#f5f5f5] transition-all">Tools</a>
          <a href="https://42agency.com/contact" target="_blank" className="ml-2 px-4 py-2 bg-[#1a1a1a] text-white text-sm font-semibold rounded-lg hover:bg-[#333] transition-colors">Contact Us</a>
        </nav>
      </div>
    </header>
  );
}

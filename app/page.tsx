"use client";
import { useState } from "react";
import { TOOLS } from "./toolsData";
import { Menu, X, Search, Minimize2, QrCode, FileText, Combine, FileDown, Move, Zap, Lock, Gift } from "lucide-react";

const ICON_MAP: Record<string, any> = {
  Minimize2,
  QrCode,
  FileText,
  Combine,
  FileDown,
  Move,
};
export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const trendingTools = TOOLS.filter((t) => t.trending).slice(0, 8);

  const searchResults =
    searchQuery.trim() === ""
      ? []
      : TOOLS.filter((t) => t.name.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="min-h-screen bg-white text-neutral-900">
      {/* Header */}
      <header className="border-b border-neutral-200 relative">
        {/* Mobile bar */}
        <div className="flex md:hidden items-center justify-between px-4 py-4">
         <button onClick={() => setMenuOpen(true)} aria-label="Open menu"><Menu size={22} /></button>
          <span className="text-lg font-bold text-teal-600">MyToolzy</span>
          <button onClick={() => setSearchOpen(true)} aria-label="Search">
            <Search size={20} />
          </button>
        </div>

        {/* Desktop bar - iLovePDF style: logo + nav left, search right */}
        <div className="hidden md:flex max-w-6xl mx-auto px-6 py-4 items-center justify-between">
          <div className="flex items-center gap-10">
            <span className="text-xl font-extrabold text-teal-600 tracking-tight">MyToolzy</span>
            <nav className="flex gap-7 text-[15px] font-bold text-neutral-700">
              <a href="/" className="hover:text-teal-600">Home</a>
              <a href="/tools" className="hover:text-teal-600">Tools</a>
              <a href="/about" className="hover:text-teal-600">About</a>
              <a href="/contact" className="hover:text-teal-600">Contact</a>
            </nav>
          </div>

          <div className="relative">
            {!searchOpen ? (
             <button
                onClick={() => setSearchOpen(true)}
                aria-label="Search tools"
                className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-neutral-100 text-neutral-700"
              >
                <Search size={19} />
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <input
                  autoFocus
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search tools..."
                  className="border border-neutral-200 rounded-full px-4 py-1.5 text-sm w-56 focus:outline-none focus:border-teal-500"
                />
                <button
                    onClick={() => {
                      setSearchOpen(false);
                      setSearchQuery("");
                    }}
                    className="text-neutral-400 hover:text-neutral-700"
                    aria-label="Close search"
                  >
                    <X size={18} />
                  </button>

                {searchQuery.trim() !== "" && (
                  <div className="absolute top-full right-0 mt-2 w-72 bg-white border border-neutral-200 rounded-lg shadow-lg overflow-hidden z-50">
                    {searchResults.length > 0 ? (
                      searchResults.map((tool) => (
                        
                       <a   key={tool.href}
                          href={tool.href}
                          className="flex items-center gap-3 px-4 py-3 hover:bg-neutral-50 border-b border-neutral-100 last:border-0"
                        >
                         <div className="w-8 h-8 rounded-md bg-teal-600 text-white flex items-center justify-center">
                            {(() => {
                              const IconComp = ICON_MAP[tool.icon];
                              return IconComp ? <IconComp size={16} /> : null;
                            })()}
                          </div>
                          <span className="text-sm font-medium">{tool.name}</span>
                        </a>
                      ))
                    ) : (
                      <p className="px-4 py-3 text-sm text-neutral-400">No tools found</p>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Mobile search overlay */}
      {searchOpen && (
        <div className="fixed inset-0 z-50 bg-white md:hidden">
          <div className="flex items-center gap-3 px-4 py-4 border-b border-neutral-200">
            <input
              autoFocus
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tools..."
              className="flex-1 border border-neutral-200 rounded-full px-4 py-2 text-sm focus:outline-none focus:border-teal-500"
            />
           <button
                onClick={() => {
                  setSearchOpen(false);
                  setSearchQuery("");
                }}
                className="text-neutral-500"
                aria-label="Close search"
              >
                <X size={20} />
              </button>
          </div>
          <div className="px-4 py-2">
            {searchQuery.trim() === "" ? (
              <p className="text-sm text-neutral-400 py-6 text-center">Start typing to search tools</p>
            ) : searchResults.length > 0 ? (
              searchResults.map((tool) => (
                
                <a  key={tool.href}
                  href={tool.href}
                  className="flex items-center gap-3 py-3 border-b border-neutral-100"
                >
                 <div className="w-9 h-9 rounded-md bg-teal-600 text-white flex items-center justify-center">
                    {(() => {
                      const IconComp = ICON_MAP[tool.icon];
                      return IconComp ? <IconComp size={17} /> : null;
                    })()}
                  </div>
                  <span className="text-sm font-medium">{tool.name}</span>
                </a>
              ))
            ) : (
              <p className="text-sm text-neutral-400 py-6 text-center">No tools found</p>
            )}
          </div>
        </div>
      )}

      {menuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMenuOpen(false)}></div>
          <div className="absolute left-0 top-0 h-full w-1/2 bg-white shadow-lg p-6">
            <div className="flex items-center justify-between mb-8">
              <span className="text-lg font-bold text-teal-600">MyToolzy</span>
                <button onClick={() => setMenuOpen(false)} aria-label="Close menu"><X size={22} /></button>
            </div>
            <nav className="flex flex-col gap-5 text-neutral-700">
              <a href="/" onClick={() => setMenuOpen(false)} className="hover:text-teal-600">Home</a>
              <a href="/tools" onClick={() => setMenuOpen(false)} className="hover:text-teal-600">Tools</a>
              <a href="/about" onClick={() => setMenuOpen(false)} className="hover:text-teal-600">About</a>
              <a href="/contact" onClick={() => setMenuOpen(false)} className="hover:text-teal-600">Contact</a>
            </nav>
          </div>
        </div>
      )}

      {/* Hero */}
      <section className="max-w-5xl mx-auto px-6 pt-16 pb-10 text-center">
        <h1 className="mx-auto max-w-4xl text-3xl sm:text-4xl md:text-[4.2rem] font-bold leading-[0.95] tracking-[-0.05em] text-neutral-900">
          <span className="block md:inline">Every tool you need,</span>{" "}
          <span className="block md:inline">right in your browser.</span>
        </h1>
        <p className="mx-auto mt-6 max-w-3xl text-base md:text-[1.1rem] leading-relaxed text-neutral-600">
          Every tool you need is right at your fingertips. All are 100% FREE and easy to use! Compress images, generate QR codes, and more — with just a few clicks.
        </p>
      </section>

      {/* Trending Tools */}
      <section className="max-w-6xl mx-auto px-6 pb-24">
        <h2 className="text-sm font-semibold text-neutral-500 uppercase tracking-wide mb-5 text-center">
          Most used tools
        </h2>
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-5">
          {trendingTools.map((tool) => (
            
            <a  key={tool.href}
              href={tool.href}
              className="group border border-neutral-200 rounded-xl p-6 hover:shadow-lg hover:-translate-y-0.5 transition-all bg-white"
            >
              <div className="w-11 h-11 rounded-lg bg-teal-600 text-white flex items-center justify-center mb-4">
                {(() => {
                  const IconComp = ICON_MAP[tool.icon];
                  return IconComp ? <IconComp size={20} /> : null;
                })()}
              </div>
              <h3 className="font-semibold text-base mb-1 group-hover:text-teal-600">{tool.name}</h3>
              <p className="text-sm text-neutral-500 leading-relaxed">{tool.description}</p>
            </a>
          ))}
        </div>
      </section>

      {/* Why MyToolzy */}
      <section className="bg-neutral-50 border-t border-neutral-200 py-16">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="text-2xl font-bold text-center mb-10">Why people use MyToolzy</h2>
          <div className="grid sm:grid-cols-3 gap-8">
            <div className="text-center">
             <div className="w-12 h-12 rounded-full bg-teal-50 text-teal-600 flex items-center justify-center mx-auto mb-3">
                <Zap size={22} />
              </div>
              <h3 className="font-semibold mb-1">Instant results</h3>
              <p className="text-sm text-neutral-500 leading-relaxed">
                Most tools run right in your browser, so there's no waiting on uploads or servers.
              </p>
            </div>
            <div className="text-center">
             <div className="w-12 h-12 rounded-full bg-teal-50 text-teal-600 flex items-center justify-center mx-auto mb-3">
                <Lock size={22} />
              </div>
              <h3 className="font-semibold mb-1">Private by design</h3>
              <p className="text-sm text-neutral-500 leading-relaxed">
                Wherever possible, your files never leave your device — nothing is stored on our servers.
              </p>
            </div>
            <div className="text-center">
             <div className="w-12 h-12 rounded-full bg-teal-50 text-teal-600 flex items-center justify-center mx-auto mb-3">
                <Gift size={22} />
              </div>
              <h3 className="font-semibold mb-1">Completely free</h3>
              <p className="text-sm text-neutral-500 leading-relaxed">
                No sign-up, no subscriptions, no hidden limits. Just open a tool and use it.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <FAQSection />

      {/* Footer */}
      <footer className="border-t border-neutral-200 py-8">
        <div className="max-w-6xl mx-auto px-6 flex justify-between text-sm text-neutral-500">
          <span>© 2026 MyToolzy</span>
          <div className="flex gap-4">
            <a href="/privacy" className="hover:text-teal-600">Privacy Policy</a>
            <a href="/terms" className="hover:text-teal-600">Terms</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FAQSection() {
  const faqs = [
    {
      q: "Is MyToolzy really free?",
      a: "Yes. Every tool on this site is free to use, with no hidden charges or subscriptions.",
    },
    {
      q: "Do I need to create an account?",
      a: "No. You can use every tool immediately without signing up or logging in.",
    },
    {
      q: "Is my data safe?",
      a: "Most tools process your files entirely in your browser, so they never leave your device. A few tools that require real conversion (like PDF to Word) use a trusted third-party service solely to perform that conversion — see our Privacy Policy for details.",
    },
    {
      q: "Can I use these tools on mobile?",
      a: "Yes, MyToolzy works on any modern browser, including on phones and tablets.",
    },
  ];

  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="max-w-3xl mx-auto px-6 py-16">
      <h2 className="text-2xl font-bold text-center mb-8">Frequently asked questions</h2>
      <div className="flex flex-col gap-3">
        {faqs.map((faq, i) => {
          const isOpen = openIndex === i;
          return (
            <div
              key={i}
              className={`border rounded-lg transition-colors duration-200 ${
                isOpen ? "border-teal-300 bg-teal-50/30" : "border-neutral-200"
              }`}
            >
              <button
                onClick={() => setOpenIndex(isOpen ? null : i)}
                className="w-full flex items-center justify-between text-left px-5 py-4 font-medium"
              >
                <span>{faq.q}</span>
                <span
                  className={`text-teal-600 text-xl leading-none transition-transform duration-300 ${
                    isOpen ? "rotate-45" : "rotate-0"
                  }`}
                >
                  +
                </span>
              </button>
              <div
                className="grid transition-all duration-300 ease-in-out"
                style={{ gridTemplateRows: isOpen ? "1fr" : "0fr" }}
              >
                <div className="overflow-hidden">
                  <p className="px-5 pb-4 text-sm text-neutral-600 leading-relaxed">{faq.a}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
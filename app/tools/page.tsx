"use client";
import { useState } from "react";
import { TOOLS } from "../toolsData";
import { Minimize2, QrCode, FileText, Combine, FileDown, Move } from "lucide-react";

const ICON_MAP: Record<string, any> = {
  Minimize2,
  QrCode,
  FileText,
  Combine,
  FileDown,
  Move,
};

export default function AllTools() {
  const [activeCategory, setActiveCategory] = useState("All");
  const categories = ["All", ...Array.from(new Set(TOOLS.map((t) => t.category)))];
  const filteredTools =
    activeCategory === "All" ? TOOLS : TOOLS.filter((t) => t.category === activeCategory);

  return (
    <div className="min-h-screen bg-white text-neutral-900">
      <header className="border-b border-neutral-200">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <a href="/" className="text-lg font-bold text-teal-600">MyToolzy</a>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold mb-2">All Tools</h1>
        <p className="text-neutral-600 mb-8">Browse every tool, organized by category.</p>

        <div className="flex flex-wrap gap-2 mb-8">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                activeCategory === cat
                  ? "bg-neutral-900 text-white"
                  : "border border-neutral-200 text-neutral-600 hover:border-teal-400"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-5">
          {filteredTools.map((tool) => (
            
             <a key={tool.href}
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
      </div>
    </div>
  );
}
"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, Search } from "lucide-react";
import { TOOLS } from "../toolsData";
import { ICON_MAP } from "../iconMap";

const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "Tools", href: "/tools" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const pathname = usePathname() ?? "";

  const searchResults =
    searchQuery.trim() === ""
      ? []
      : TOOLS.filter((t) => t.name.toLowerCase().includes(searchQuery.toLowerCase()));

  function closeSearch() {
    setSearchOpen(false);
    setSearchQuery("");
  }

  function isActive(href: string) {
    return href === "/" ? pathname === "/" : pathname.startsWith(href);
  }

  function renderIcon(name: string, size: number) {
    const IconComp = ICON_MAP[name];
    return IconComp ? <IconComp size={size} /> : null;
  }

  return (
    <>
      <header className="border-b border-neutral-200 bg-white">
        {/* Mobile bar: menu left, logo center, search right */}
        <div className="flex md:hidden items-center justify-between px-4 py-4">
          <button onClick={() => setMenuOpen(true)} aria-label="Open menu">
            <Menu size={22} />
          </button>
          <Link href="/" className="text-lg font-bold text-teal-600">MyToolzy</Link>
          <button onClick={() => setSearchOpen(true)} aria-label="Search">
            <Search size={20} />
          </button>
        </div>

        {/* Desktop bar: logo + nav left, search right */}
        <div className="hidden md:flex max-w-6xl mx-auto px-6 py-4 items-center justify-between">
          <div className="flex items-center gap-10">
            <Link href="/" className="text-xl font-extrabold text-teal-600 tracking-tight">
              MyToolzy
            </Link>
            <nav className="flex gap-7 text-[15px] font-bold">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={isActive(link.href) ? "text-teal-600" : "text-neutral-700 hover:text-teal-600"}
                >
                  {link.label}
                </Link>
              ))}
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
                  onClick={closeSearch}
                  className="text-neutral-400 hover:text-neutral-700"
                  aria-label="Close search"
                >
                  <X size={18} />
                </button>

                {searchQuery.trim() !== "" && (
                  <div className="absolute top-full right-0 mt-2 w-72 bg-white border border-neutral-200 rounded-lg shadow-lg overflow-hidden z-50">
                    {searchResults.length > 0 ? (
                      searchResults.map((tool) => (
                        <Link
                          key={tool.href}
                          href={tool.href}
                          onClick={closeSearch}
                          className="flex items-center gap-3 px-4 py-3 hover:bg-neutral-50 border-b border-neutral-100 last:border-0"
                        >
                          <div className="w-8 h-8 rounded-md bg-teal-600 text-white flex items-center justify-center">
                            {renderIcon(tool.icon, 16)}
                          </div>
                          <span className="text-sm font-medium">{tool.name}</span>
                        </Link>
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
            <button onClick={closeSearch} className="text-neutral-500" aria-label="Close search">
              <X size={20} />
            </button>
          </div>
          <div className="px-4 py-2">
            {searchQuery.trim() === "" ? (
              <p className="text-sm text-neutral-400 py-6 text-center">Start typing to search tools</p>
            ) : searchResults.length > 0 ? (
              searchResults.map((tool) => (
                <Link
                  key={tool.href}
                  href={tool.href}
                  onClick={closeSearch}
                  className="flex items-center gap-3 py-3 border-b border-neutral-100"
                >
                  <div className="w-9 h-9 rounded-md bg-teal-600 text-white flex items-center justify-center">
                    {renderIcon(tool.icon, 17)}
                  </div>
                  <span className="text-sm font-medium">{tool.name}</span>
                </Link>
              ))
            ) : (
              <p className="text-sm text-neutral-400 py-6 text-center">No tools found</p>
            )}
          </div>
        </div>
      )}

      {/* Mobile slide-in menu */}
      {menuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMenuOpen(false)}></div>
          <div className="absolute left-0 top-0 h-full w-1/2 bg-white shadow-lg p-6">
            <div className="flex items-center justify-between mb-8">
              <span className="text-lg font-bold text-teal-600">MyToolzy</span>
              <button onClick={() => setMenuOpen(false)} aria-label="Close menu">
                <X size={22} />
              </button>
            </div>
            <nav className="flex flex-col gap-5">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className={isActive(link.href) ? "text-teal-600 font-semibold" : "text-neutral-700 hover:text-teal-600"}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      )}
    </>
  );
}
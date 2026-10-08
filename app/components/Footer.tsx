import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-neutral-200 py-8">
      <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row justify-between gap-3 text-sm text-neutral-500">
        <span>© 2026 MyToolzy</span>
        <div className="flex flex-wrap gap-4">
          <Link href="/about" className="hover:text-teal-600">About</Link>
          <Link href="/contact" className="hover:text-teal-600">Contact</Link>
          <Link href="/privacy" className="hover:text-teal-600">Privacy Policy</Link>
          <Link href="/terms" className="hover:text-teal-600">Terms</Link>
        </div>
      </div>
    </footer>
  );
}
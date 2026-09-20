import { Zap, Lock, Gift } from "lucide-react";

export default function AboutUs() {
  return (
    <div className="min-h-screen bg-white text-neutral-900">
      <header className="border-b border-neutral-200">
        <div className="max-w-3xl mx-auto px-6 py-4">
          <a href="/" className="text-lg font-bold text-teal-600">MyToolzy</a>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-16">
        {/* Hero */}
        <div className="grid md:grid-cols-2 gap-10 items-center mb-20">
          <div>
            <p className="text-sm font-semibold text-teal-600 mb-3 uppercase tracking-wide">
              About Us
            </p>
            <h1 className="text-3xl md:text-4xl font-bold mb-4 leading-tight">
              Simple tools, built to just work.
            </h1>
            <p className="text-neutral-600 leading-relaxed">
              MyToolzy started with a simple idea: everyday tasks like compressing an image
              or merging a PDF shouldn't require downloading software, creating an account, or
              waiting for ads to load ten times over. So we built a place where tools are fast,
              free, and ready the moment you need them.
            </p>
          </div>

          {/* Illustration */}
          <svg viewBox="0 0 400 320" className="w-full h-auto">
            <rect x="40" y="40" width="140" height="140" rx="16" fill="#CCFBF1" />
            <rect x="220" y="30" width="120" height="90" rx="14" fill="#0D9488" />
            <circle cx="280" cy="200" r="70" fill="#F0FDFA" stroke="#0D9488" strokeWidth="3" />
            <rect x="70" y="70" width="80" height="10" rx="5" fill="#0D9488" />
            <rect x="70" y="95" width="60" height="10" rx="5" fill="#5EEAD4" />
            <rect x="70" y="120" width="70" height="10" rx="5" fill="#5EEAD4" />
            <path
              d="M250 65 L270 45 L295 70 L275 90 Z"
              fill="#F0FDFA"
            />
            <circle cx="280" cy="200" r="28" fill="#0D9488" />
            <path
              d="M280 185 v30 M265 200 h30"
              stroke="white"
              strokeWidth="4"
              strokeLinecap="round"
            />
            <rect x="30" y="220" width="100" height="70" rx="12" fill="#134E4A" />
            <rect x="50" y="245" width="60" height="8" rx="4" fill="#5EEAD4" />
            <rect x="50" y="262" width="40" height="8" rx="4" fill="#5EEAD4" />
          </svg>
        </div>

        {/* Values */}
        <div className="grid sm:grid-cols-3 gap-8 mb-20">
          <div>
           <div className="w-10 h-10 rounded-lg bg-teal-50 flex items-center justify-center text-teal-600 mb-3">
              <Zap size={20} />
            </div>
            <h3 className="font-semibold mb-1">Fast by default</h3>
            <p className="text-sm text-neutral-500 leading-relaxed">
              Most tools run instantly in your browser — no waiting on a server or a queue.
            </p>
          </div>
          <div>
           <div className="w-10 h-10 rounded-lg bg-teal-50 flex items-center justify-center text-teal-600 mb-3">
              <Lock size={20} />
            </div>
            <h3 className="font-semibold mb-1">Privacy-first</h3>
            <p className="text-sm text-neutral-500 leading-relaxed">
              Wherever possible, your files never leave your device. We built it that way on purpose.
            </p>
          </div>
          <div>
              <div className="w-10 h-10 rounded-lg bg-teal-50 flex items-center justify-center text-teal-600 font-bold mb-3">
                🆓
              </div>
            <h3 className="font-semibold mb-1">Free, no catch</h3>
            <p className="text-sm text-neutral-500 leading-relaxed">
              No sign-up, no hidden paywalls. Use what you need, whenever you need it.
            </p>
          </div>
        </div>

        {/* Story */}
        <div className="border-t border-neutral-200 pt-12">
          <h2 className="text-xl font-bold mb-4">Why we built MyToolzy</h2>
          <p className="text-neutral-600 leading-relaxed mb-4">
            We kept running into the same problem — needing a quick tool to resize a photo,
            generate a QR code, or merge a couple of PDFs, and ending up on cluttered websites
            full of pop-ups and unnecessary sign-up walls. MyToolzy is our answer to that: a
            growing collection of tools that respect your time and your data.
          </p>
          <p className="text-neutral-600 leading-relaxed">
            We're actively adding new tools based on what people actually search for and need.
            If there's a tool you wish existed here, we'd love to hear about it.
          </p>
        </div>
      </div>

      <footer className="border-t border-neutral-200 py-8 mt-12">
        <div className="max-w-4xl mx-auto px-6 flex justify-between text-sm text-neutral-500">
          <span>© 2026 MyToolzy</span>
          <div className="flex gap-4">
            <a href="/privacy" className="hover:text-teal-600">Privacy Policy</a>
            <a href="/contact" className="hover:text-teal-600">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
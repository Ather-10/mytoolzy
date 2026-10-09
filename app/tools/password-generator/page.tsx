"use client";
import { useState, useEffect, useCallback } from "react";
import { Copy, Check, RefreshCw } from "lucide-react";

const LOWER = "abcdefghijklmnopqrstuvwxyz";
const UPPER = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const NUMBERS = "0123456789";
const SYMBOLS = "!@#$%^&*()-_=+[]{};:,.<>?";
const AMBIGUOUS = /[O0oIl1|]/g;

// Unbiased secure random integer in [0, max)
function secureRandomInt(max: number): number {
  const limit = Math.floor(0x100000000 / max) * max;
  const buf = new Uint32Array(1);
  do {
    crypto.getRandomValues(buf);
  } while (buf[0] >= limit);
  return buf[0] % max;
}

export default function PasswordGenerator() {
  const [length, setLength] = useState(16);
  const [useLower, setUseLower] = useState(true);
  const [useUpper, setUseUpper] = useState(true);
  const [useNumbers, setUseNumbers] = useState(true);
  const [useSymbols, setUseSymbols] = useState(true);
  const [excludeAmbiguous, setExcludeAmbiguous] = useState(false);
  const [password, setPassword] = useState("");
  const [copied, setCopied] = useState(false);

  const buildPools = useCallback(() => {
    const clean = (s: string) => (excludeAmbiguous ? s.replace(AMBIGUOUS, "") : s);
    const pools: string[] = [];
    if (useLower) pools.push(clean(LOWER));
    if (useUpper) pools.push(clean(UPPER));
    if (useNumbers) pools.push(clean(NUMBERS));
    if (useSymbols) pools.push(SYMBOLS);
    return pools;
  }, [useLower, useUpper, useNumbers, useSymbols, excludeAmbiguous]);

  const generate = useCallback(() => {
    const pools = buildPools();
    if (pools.length === 0) {
      setPassword("");
      return;
    }
    const all = pools.join("");
    // guarantee at least one character from every selected type
    const chars: string[] = pools.map((p) => p[secureRandomInt(p.length)]);
    while (chars.length < length) {
      chars.push(all[secureRandomInt(all.length)]);
    }
    // Fisher-Yates shuffle
    for (let i = chars.length - 1; i > 0; i--) {
      const j = secureRandomInt(i + 1);
      [chars[i], chars[j]] = [chars[j], chars[i]];
    }
    setPassword(chars.slice(0, length).join(""));
    setCopied(false);
  }, [buildPools, length]);

  useEffect(() => {
    generate();
  }, [generate]);

  async function copyPassword() {
    if (!password) return;
    try {
      await navigator.clipboard.writeText(password);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (err) {
      console.error(err);
    }
  }

  // Strength based on entropy (length x log2 of pool size)
  const poolSize = buildPools().join("").length;
  const entropy = poolSize > 0 ? length * Math.log2(poolSize) : 0;
  let strengthLabel = "Weak";
  let strengthColor = "bg-red-500";
  let strengthWidth = "25%";
  if (entropy >= 100) {
    strengthLabel = "Very strong";
    strengthColor = "bg-teal-600";
    strengthWidth = "100%";
  } else if (entropy >= 75) {
    strengthLabel = "Strong";
    strengthColor = "bg-teal-500";
    strengthWidth = "75%";
  } else if (entropy >= 50) {
    strengthLabel = "Fair";
    strengthColor = "bg-amber-500";
    strengthWidth = "50%";
  }

  const options = [
    { label: "Lowercase (a-z)", checked: useLower, set: setUseLower },
    { label: "Uppercase (A-Z)", checked: useUpper, set: setUseUpper },
    { label: "Numbers (0-9)", checked: useNumbers, set: setUseNumbers },
    { label: "Symbols (!@#$)", checked: useSymbols, set: setUseSymbols },
  ];

  function toggleOption(opt: (typeof options)[number]) {
    const selectedCount = options.filter((o) => o.checked).length;
    // keep at least one type selected
    if (opt.checked && selectedCount === 1) return;
    opt.set(!opt.checked);
  }

  return (
    <div className="bg-white text-neutral-900">
      <div className="max-w-3xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold mb-2">Password Generator</h1>
        <p className="text-neutral-600 mb-8">
          Create strong, random passwords instantly. Choose the length and character types you need.
        </p>

        {/* Password display */}
        <div className="border border-neutral-200 rounded-xl p-5 mb-6">
          <div className="flex items-center gap-3">
            <div className="flex-1 font-mono text-lg md:text-xl break-all select-all min-h-[2rem]">
              {password}
            </div>
            <button
              onClick={generate}
              aria-label="Generate new password"
              className="w-10 h-10 flex items-center justify-center rounded-md border border-neutral-200 text-neutral-600 hover:border-teal-400 hover:text-teal-600"
            >
              <RefreshCw size={18} />
            </button>
            <button
              onClick={copyPassword}
              aria-label="Copy password"
              className="flex items-center gap-2 bg-teal-600 text-white text-sm font-semibold px-4 h-10 rounded-md hover:bg-teal-700"
            >
              {copied ? <Check size={16} /> : <Copy size={16} />}
              {copied ? "Copied" : "Copy"}
            </button>
          </div>

          {/* Strength meter */}
          <div className="mt-5">
            <div className="flex justify-between text-xs text-neutral-500 mb-1.5">
              <span>Strength</span>
              <span className="font-semibold text-neutral-800">{strengthLabel}</span>
            </div>
            <div className="h-1.5 rounded-full bg-neutral-100 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-300 ${strengthColor}`}
                style={{ width: strengthWidth }}
              />
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="border border-neutral-200 rounded-xl p-5">
          <div className="mb-6">
            <div className="flex justify-between text-sm mb-2">
              <span className="font-medium">Password length</span>
              <span className="font-semibold">{length}</span>
            </div>
            <input
              type="range"
              min={6}
              max={64}
              value={length}
              onChange={(e) => setLength(Number(e.target.value))}
              className="w-full accent-teal-600"
            />
            <div className="flex justify-between text-xs text-neutral-400 mt-1">
              <span>6</span>
              <span>64</span>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-3">
            {options.map((opt) => (
              <label
                key={opt.label}
                className="flex items-center gap-3 text-sm cursor-pointer border border-neutral-200 rounded-lg px-4 py-3 hover:border-teal-300"
              >
                <input
                  type="checkbox"
                  checked={opt.checked}
                  onChange={() => toggleOption(opt)}
                  className="accent-teal-600 w-4 h-4"
                />
                {opt.label}
              </label>
            ))}
          </div>

          <label className="flex items-center gap-3 text-sm cursor-pointer mt-4">
            <input
              type="checkbox"
              checked={excludeAmbiguous}
              onChange={(e) => setExcludeAmbiguous(e.target.checked)}
              className="accent-teal-600 w-4 h-4"
            />
            <span>
              Avoid look-alike characters{" "}
              <span className="text-neutral-400">(O, 0, l, 1, I)</span>
            </span>
          </label>
        </div>

        <p className="text-xs text-neutral-400 mt-12">
          Passwords are generated locally in your browser using a secure random generator. They are never sent to or stored on any server.
        </p>
      </div>
    </div>
  );
}
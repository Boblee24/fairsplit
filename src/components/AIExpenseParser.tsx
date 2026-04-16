"use client";

// components/AIExpenseParser.tsx
// Drop this above your existing add-expense form.
// It calls /api/parse-expense and fires onParsed() with structured data
// so you can pre-fill your form fields.

import { useState } from "react";

export interface ParsedExpense {
  description: string;
  amount: number;
  payerHint: string | null; // name/nickname — match against your group members
  splitType: "equal" | "custom";
  memberCount: number | null;
  notes: string | null;
  confidence: "high" | "medium" | "low";
}

interface AIExpenseParserProps {
  /** Called when the user accepts the parsed result */
  onParsed: (expense: ParsedExpense) => void;
  /** Optional: so the component can show "Did you mean [member]?" hints */
  groupMembers?: string[]; // array of nicknames / short addresses
}

const EXAMPLES = [
  "Sarah paid $45 for pizza, split 3 ways",
  "I covered the Uber — $28 total",
  "John paid 90 dollars for hotel, 4 of us",
];

export default function AIExpenseParser({
  onParsed,
  groupMembers = [],
}: AIExpenseParserProps) {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ParsedExpense | null>(null);

  const confidenceColor = {
    high: "text-green-400",
    medium: "text-yellow-400",
    low: "text-red-400",
  };

  const confidenceLabel = {
    high: "High confidence",
    medium: "Medium confidence — please review",
    low: "Low confidence — please review carefully",
  };

  // Try to match payerHint against known group members
  const matchedPayer =
    result?.payerHint && groupMembers.length > 0
      ? groupMembers.find((m) =>
          m.toLowerCase().includes(result.payerHint!.toLowerCase())
        ) ?? null
      : null;

  async function handleParse() {
    if (!input.trim()) return;
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch("/api/parse-expense", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: input }),
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        setError(data.error ?? "Something went wrong.");
        return;
      }

      setResult(data.result);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function handleAccept() {
    if (!result) return;
    onParsed(result);
    // Reset state after accepting
    setResult(null);
    setInput("");
    setOpen(false);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleParse();
    }
  }

  return (
    <div className="mb-6">
      {/* Toggle button */}
      <button
        type="button"
        onClick={() => {
          setOpen((prev) => !prev);
          setResult(null);
          setError(null);
        }}
        className="flex items-center gap-2 w-full px-4 py-3 rounded-xl border border-dashed border-purple-500/60 bg-purple-950/30 hover:bg-purple-950/50 transition-colors text-purple-300 text-sm font-medium"
      >
        <span className="text-lg">✨</span>
        <span>AI Quick Add — describe the expense in plain English</span>
        <span className="ml-auto text-purple-500">{open ? "▲" : "▼"}</span>
      </button>

      {open && (
        <div className="mt-2 rounded-xl border border-purple-500/30 bg-gray-900/80 p-4 space-y-4">
          {/* Input area */}
          <div>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder='e.g. "Sarah paid $120 for dinner, split 4 ways"'
              rows={2}
              className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
            />
            {/* Example chips */}
            <div className="mt-2 flex flex-wrap gap-2">
              {EXAMPLES.map((ex) => (
                <button
                  key={ex}
                  type="button"
                  onClick={() => setInput(ex)}
                  className="text-xs px-2 py-1 rounded-full bg-gray-800 border border-gray-700 text-gray-400 hover:text-purple-300 hover:border-purple-500 transition-colors"
                >
                  {ex}
                </button>
              ))}
            </div>
          </div>

          {/* Parse button */}
          <button
            type="button"
            onClick={handleParse}
            disabled={loading || !input.trim()}
            className="w-full py-2 rounded-lg bg-purple-600 hover:bg-purple-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold transition-colors flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <span className="animate-spin">⟳</span> Parsing...
              </>
            ) : (
              <>✨ Parse with AI</>
            )}
          </button>

          {/* Error */}
          {error && (
            <p className="text-sm text-red-400 bg-red-900/20 border border-red-500/30 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          {/* Result preview card */}
          {result && (
            <div className="rounded-lg border border-purple-500/40 bg-purple-950/30 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-purple-300">
                  Parsed Result
                </span>
                <span
                  className={`text-xs ${confidenceColor[result.confidence]}`}
                >
                  {confidenceLabel[result.confidence]}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-gray-500 text-xs uppercase tracking-wide mb-1">
                    Description
                  </p>
                  <p className="text-white font-medium">{result.description}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs uppercase tracking-wide mb-1">
                    Amount
                  </p>
                  <p className="text-white font-medium">
                    ${result.amount.toFixed(2)}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs uppercase tracking-wide mb-1">
                    Paid by
                  </p>
                  <p className="text-white font-medium">
                    {matchedPayer ?? result.payerHint ?? (
                      <span className="text-yellow-400">
                        Unknown — select manually
                      </span>
                    )}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs uppercase tracking-wide mb-1">
                    Split
                  </p>
                  <p className="text-white font-medium capitalize">
                    {result.splitType}
                    {result.memberCount
                      ? ` · ${result.memberCount} people`
                      : ""}
                  </p>
                </div>
              </div>

              {result.notes && (
                <p className="text-xs text-gray-400 bg-gray-800 rounded px-2 py-1">
                  📝 {result.notes}
                </p>
              )}

              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleAccept}
                  className="flex-1 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold transition-colors"
                >
                  ✓ Use this
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setResult(null);
                    setError(null);
                  }}
                  className="px-4 py-2 rounded-lg border border-gray-600 hover:border-gray-400 text-gray-400 text-sm transition-colors"
                >
                  Retry
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
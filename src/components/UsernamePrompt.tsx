"use client";

import { useState } from "react";
import { setUsername } from "@/lib/nicknames";
import { switchToBaseSepolia } from "@/lib/contract";
import { parseContractError } from "@/lib/error";

type Props = {
  onComplete: (name: string) => void;
  onSkip: () => void;
};

export default function UsernamePrompt({ onComplete, onSkip }: Props) {
  const [name,    setName]    = useState("");
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");

  async function handleSave() {
    if (!name.trim()) return setError("Enter a username");
    setLoading(true);
    setError("");
    try {
      await switchToBaseSepolia();
      await setUsername(name.trim());
      onComplete(name.trim());
    } catch (e: unknown) {
      setError(parseContractError(e));
    } finally {
      setLoading(false);
    }
  }

  return (
    /* Backdrop */
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 50,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1rem",
        background: "rgba(9, 25, 24, 0.80)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
      }}
    >
      {/* Modal */}
      <div
        className="fs-animate fs-d1"
        style={{
          width: "100%",
          maxWidth: 380,
          background: "var(--fs-surface)",
          border: "1px solid var(--fs-border-mid)",
          borderRadius: "var(--fs-radius-xl)",
          padding: "1.75rem",
          boxShadow: "0 24px 60px rgba(0,0,0,0.55), 0 0 0 1px var(--fs-border-accent)",
        }}
      >
        {/* Icon */}
        <div
          style={{
            width: 44, height: 44,
            borderRadius: "50%",
            border: "1.5px solid var(--fs-border-accent)",
            background: "var(--fs-accent-dim)",
            display: "flex", alignItems: "center", justifyContent: "center",
            marginBottom: "1rem",
          }}
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <circle cx="9" cy="6" r="3.5" stroke="var(--fs-accent)" strokeWidth="1.5"/>
            <path d="M2 15c0-3.314 3.134-6 7-6s7 2.686 7 6" stroke="var(--fs-accent)" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </div>

        {/* Copy */}
        <h2 style={{ fontFamily: "var(--fs-display)", fontSize: "1.3rem", color: "var(--fs-text)", letterSpacing: "-0.01em", marginBottom: "0.4rem" }}>
          Set your username
        </h2>
        <p style={{ fontFamily: "var(--fs-ui)", fontSize: "0.78rem", color: "var(--fs-muted)", lineHeight: 1.6, marginBottom: "1.25rem" }}>
          How other group members will see you across all groups. Saved on-chain — set it once, use it everywhere.
        </p>

        {/* Input */}
        <input
          className="fs-input"
          placeholder="e.g. Ayo, Tunde, Kemi…"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSave()}
          autoFocus
          style={{ marginBottom: "0.75rem" }}
        />

        {/* Error */}
        {error && <div className="fs-error" style={{ marginBottom: "0.75rem" }}>{error}</div>}

        {/* Buttons */}
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <button
            type="button"
            onClick={handleSave}
            disabled={loading}
            className="fs-btn fs-btn-primary fs-btn-md"
            style={{ flex: 1, justifyContent: "center" }}
          >
            {loading ? "Saving…" : "Save username"}
          </button>
          <button
            type="button"
            onClick={onSkip}
            disabled={loading}
            className="fs-btn fs-btn-subtle fs-btn-md"
          >
            Skip
          </button>
        </div>

        {/* Footer note */}
        <p style={{ fontFamily: "var(--fs-ui)", fontSize: "0.68rem", color: "var(--fs-muted)", textAlign: "center", marginTop: "1rem", opacity: 0.7 }}>
          You can always set it later from any group page.
        </p>
      </div>
    </div>
  );
}

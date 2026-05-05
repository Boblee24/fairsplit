"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createGroup, switchToBaseSepolia } from "@/lib/contract";
import { markGroupsChanged } from "@/lib/groupRefresh";
import { setUsername } from "@/lib/nicknames";
import { getAccount } from "@wagmi/core";
import { config } from "@/lib/wagmi";
import { getAddress, isAddress } from "viem";
import { parseContractError } from "@/lib/error";
import Link from "next/link";

export default function NewGroup() {
  const router = useRouter();
  const [name,         setName]         = useState("");
  const [creatorName,  setCreatorName]  = useState("");
  const [members,      setMembers]      = useState([{ address: "" }]);
  const [loading,      setLoading]      = useState(false);
  const [error,        setError]        = useState("");

  const addMember    = () => setMembers([...members, { address: "" }]);
  const updateMember = (i: number, val: string) => {
    const u = [...members]; u[i] = { address: val }; setMembers(u);
  };
  const removeMember = (i: number) => setMembers(members.filter((_, idx) => idx !== i));

  async function handleSubmit() {
    const trimmedName = name.trim();
    if (!trimmedName) return setError("Group name is required");

    const accountAddress  = getAccount(config).address;
    const connectedAddress = accountAddress ? getAddress(accountAddress) : null;

    const uniqueMembers = new Map<string, `0x${string}`>();
    members.forEach((m) => {
      const raw = m.address.trim();
      if (!isAddress(raw)) return;
      const norm = getAddress(raw);
      if (connectedAddress && norm.toLowerCase() === connectedAddress.toLowerCase()) return;
      uniqueMembers.set(norm.toLowerCase(), norm);
    });

    const validAddresses = Array.from(uniqueMembers.values());
    if (validAddresses.length === 0)
      return setError("Add at least one valid wallet address different from your own");

    setLoading(true); setError("");
    try {
      await switchToBaseSepolia();
      const trimmedCreatorName = creatorName.trim();
      if (trimmedCreatorName) await setUsername(trimmedCreatorName);
      await createGroup(trimmedName, validAddresses);
      markGroupsChanged();
      router.push("/dashboard"); router.refresh();
    } catch (e: unknown) {
      setError(parseContractError(e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fs-page">
      <div className="fs-mesh"    aria-hidden />
      <div className="fs-texture" aria-hidden />

      {/* Header */}
      <header className="fs-header">
        <div className="fs-header-inner">
          <div className="flex items-center gap-2">
            <Link href="/dashboard" className="fs-back">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M9 2L4 7l5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Back
            </Link>
            <span className="fs-breadcrumb-sep">/</span>
            <span className="fs-breadcrumb-title">Create group</span>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="relative z-10 mx-auto max-w-lg px-4 pb-16 pt-8 sm:px-6">

        {/* Headline */}
        <div className="fs-animate fs-d1 mb-7">
          <h1 style={{ fontFamily:"var(--fs-display)", fontSize:"clamp(1.6rem,5vw,2.2rem)", color:"var(--fs-text)", letterSpacing:"-0.01em" }}>
            New group
          </h1>
          <p className="mt-2 text-sm" style={{ color:"var(--fs-text-2)", fontFamily:"var(--fs-ui)", lineHeight:1.6 }}>
            Give your group a name and add the wallets of everyone splitting with you.
          </p>
        </div>

        {/* Form */}
        <div className="fs-animate fs-d2 fs-panel space-y-5">

          {/* Group name */}
          <div>
            <label className="fs-label">Group name</label>
            <input
              className="fs-input"
              placeholder="Bali Trip 2025"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          {/* Creator username */}
          <div>
            <label className="fs-label">
              Your username{" "}
              <span style={{ color:"var(--fs-muted)", textTransform:"none", letterSpacing:0, fontWeight:500 }}>
                (optional)
              </span>
            </label>
            <input
              className="fs-input"
              placeholder="How others will see you"
              value={creatorName}
              onChange={(e) => setCreatorName(e.target.value)}
            />
            <p className="fs-hint">Saved on-chain — visible to all group members across all groups.</p>
          </div>

          {/* Members */}
          <div>
            <div className="mb-3 flex items-center justify-between gap-2">
              <div>
                <label className="fs-label" style={{ marginBottom:0 }}>Members</label>
                <p className="fs-hint" style={{ marginTop:"0.15rem" }}>Paste Base-compatible wallet addresses. Invalid rows are ignored.</p>
              </div>
              <button
                type="button"
                onClick={addMember}
                className="fs-btn fs-btn-ghost fs-btn-sm shrink-0"
              >
                + Add
              </button>
            </div>

            <div className="space-y-2">
              {members.map((m, i) => (
                <div key={i} className="flex gap-2">
                  <input
                    className="fs-input flex-1"
                    placeholder="0x…"
                    value={m.address}
                    onChange={(e) => updateMember(i, e.target.value)}
                  />
                  {members.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeMember(i)}
                      className="fs-btn fs-btn-subtle fs-btn-sm shrink-0 px-3"
                      style={{ borderRadius:"var(--fs-radius-sm)" }}
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Error */}
          {error && <div className="fs-error">{error}</div>}

          {/* Submit */}
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="fs-btn fs-btn-primary fs-btn-lg fs-btn-full"
          >
            {loading ? "Creating on-chain…" : "Create group"}
          </button>

          {creatorName.trim() && (
            <p className="text-center" style={{ fontSize:"0.7rem", color:"var(--fs-muted)", fontFamily:"var(--fs-ui)" }}>
              Setting a username requires 2 transactions — username first, then group creation.
            </p>
          )}

          {/* Footer note */}
          <p className="text-center" style={{ fontSize:"0.7rem", color:"var(--fs-muted)", fontFamily:"var(--fs-ui)" }}>
            ~$0.01 gas fee on Base · ~2s confirmation
          </p>
        </div>
      </main>
    </div>
  );
}

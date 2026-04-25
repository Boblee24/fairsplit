"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAccount } from "wagmi";
import { useBalance } from "@/hooks/useBalances";
import { settleDebt, getGroup, getBalance } from "@/lib/contract";
import { useUsernames } from "@/hooks/useUsernames";
import { parseContractError } from "@/lib/error";
import Link from "next/link";
import "@/styles/fairsplit-theme.css";

export default function SettlePage() {
  const { groupId } = useParams();
  const router = useRouter();
  const { address } = useAccount();
  const parsedGroupId = BigInt(groupId as string);
  const { balance } = useBalance(parsedGroupId);

  const [creditor, setCreditor] = useState("");
  const [creditors, setCreditors] = useState<
    { address: string; balance: number }[]
  >([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const creditorAddresses = creditors.map((c) => c.address);
  const { resolve } = useUsernames(creditorAddresses);

  useEffect(() => {
    if (!address) return;
    async function resolveCreditors() {
      try {
        const result = (await getGroup(parsedGroupId)) as [
          bigint,
          string,
          string[],
          string,
          boolean,
        ];
        const members: string[] = Array.isArray(result) ? result[2] : [];
        if (!members.length) return;

        const balances = await Promise.all(
          members.map(async (member) => {
            const bal = (await getBalance(parsedGroupId, member)) as bigint;
            return { address: member, balance: Number(bal) / 1_000_000 };
          }),
        );
        const positiveMembers = balances.filter(
          (m) =>
            m.balance > 0 &&
            address &&
            m.address.toLowerCase() !== address.toLowerCase(),
        );
        setCreditors(positiveMembers);
        if (positiveMembers.length === 1)
          setCreditor(positiveMembers[0].address);
      } catch (e) {
        console.error("Failed to resolve creditors:", e);
      }
    }
    resolveCreditors();
  }, [parsedGroupId, address]);

  async function handleSettle() {
    if (!creditor.startsWith("0x"))
      return setError("Enter a valid wallet address");
    setLoading(true);
    setError("");
    try {
      await settleDebt(parsedGroupId, creditor, Math.abs(balance));
      setSuccess(true);
      setTimeout(() => router.push(`/groups/${groupId}`), 2500);
    } catch (e: unknown) {
      setError(parseContractError(e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fs-page">
      <div className="fs-mesh" aria-hidden />
      <div className="fs-texture" aria-hidden />

      {/* Header */}
      <header className="fs-header">
        <div className="fs-header-inner">
          <div className="flex items-center gap-2">
            <Link href={`/groups/${groupId}`} className="fs-back">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path
                  d="M9 2L4 7l5 5"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Back
            </Link>
            <span className="fs-breadcrumb-sep">/</span>
            <span className="fs-breadcrumb-title">Settle up</span>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="relative z-10 mx-auto max-w-lg px-4 pb-16 pt-8 sm:px-6">
        {success ? (
          /* ── Success state ── */
          <div
            className="fs-animate fs-d1 fs-card fs-card-positive"
            style={{ padding: "2rem 1.75rem", textAlign: "center" }}
          >
            {/* Icon */}
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: "50%",
                background: "var(--fs-positive-dim)",
                border: "1.5px solid var(--fs-positive-border)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 1.25rem",
              }}
            >
              <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                <path
                  d="M5 14l6 6L23 8"
                  stroke="var(--fs-positive)"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>

            <span
              className="fs-badge fs-badge-positive"
              style={{ marginBottom: "0.75rem" }}
            >
              Settlement complete
            </span>

            <h2
              style={{
                fontFamily: "var(--fs-display)",
                fontSize: "1.7rem",
                color: "var(--fs-text)",
                letterSpacing: "-0.01em",
                marginTop: "0.4rem",
              }}
            >
              Payment confirmed
            </h2>
            <p
              className="mt-2 text-sm"
              style={{
                color: "var(--fs-text-2)",
                fontFamily: "var(--fs-ui)",
                lineHeight: 1.6,
              }}
            >
              Your balance for this group has been cleared on-chain.
            </p>

            {/* Stats */}
            <div className="mt-6 grid grid-cols-2 gap-3">
              {[
                {
                  label: "Amount settled",
                  value: `$${Math.abs(balance).toFixed(2)} USDC`,
                },
                { label: "Status", value: "Position cleared" },
              ].map(({ label, value }) => (
                <div
                  key={label}
                  className="fs-card"
                  style={{ padding: "0.85rem 1rem", textAlign: "left" }}
                >
                  <p className="fs-label" style={{ marginBottom: "0.3rem" }}>
                    {label}
                  </p>
                  <p
                    style={{
                      fontFamily: "var(--fs-mono)",
                      fontSize: "0.95rem",
                      color: "var(--fs-positive)",
                      fontWeight: 600,
                    }}
                  >
                    {value}
                  </p>
                </div>
              ))}
            </div>

            <p
              className="mt-5 text-xs"
              style={{ color: "var(--fs-muted)", fontFamily: "var(--fs-ui)" }}
            >
              Redirecting you back to the group…
            </p>
          </div>
        ) : (
          /* ── Settle form ── */
          <>
            {/* Headline */}
            <div className="fs-animate fs-d1 mb-7">
              <h1
                style={{
                  fontFamily: "var(--fs-display)",
                  fontSize: "clamp(1.6rem,5vw,2.2rem)",
                  color: "var(--fs-text)",
                  letterSpacing: "-0.01em",
                }}
              >
                Settle up
              </h1>
              <p
                className="mt-2 text-sm"
                style={{
                  color: "var(--fs-text-2)",
                  fontFamily: "var(--fs-ui)",
                  lineHeight: 1.6,
                }}
              >
                One on-chain transaction clears your balance in full.
              </p>
            </div>

            {/* You owe card */}
            <div
              className="fs-animate fs-d2 fs-card fs-card-negative mb-5"
              style={{ padding: "1.25rem 1.4rem" }}
            >
              <p className="fs-label">You owe</p>
              <p
                className="mt-1 font-bold fs-balance-negative"
                style={{
                  fontFamily: "var(--fs-mono)",
                  fontSize: "2rem",
                  lineHeight: 1.1,
                }}
              >
                ${Math.abs(balance).toFixed(2)}{" "}
                <span style={{ fontSize: "1rem", fontWeight: 500 }}>USDC</span>
              </p>
              <p
                className="mt-1.5 text-xs"
                style={{ color: "var(--fs-muted)", fontFamily: "var(--fs-ui)" }}
              >
                Your current net position in this group. Paid in a single
                transaction.
              </p>
            </div>

            {/* Form panel */}
            <div className="fs-animate fs-d3 fs-panel space-y-5">
              <div>
                <label className="fs-label">Pay to</label>
                {creditors.length > 1 ? (
                  <select
                    className="fs-select"
                    value={creditor}
                    onChange={(e) => setCreditor(e.target.value)}
                  >
                    <option value="">Select who to pay</option>
                    {creditors.map((c) => (
                      <option key={c.address} value={c.address}>
                        {resolve(c.address)} — owed ${c.balance.toFixed(2)}
                      </option>
                    ))}
                  </select>
                ) : (
                  <div
                    className="fs-input"
                    style={{
                      color: creditor ? "var(--fs-text)" : "var(--fs-muted)",
                      wordBreak: "break-all",
                    }}
                  >
                    {creditor ? resolve(creditor) : "Resolving creditor…"}
                  </div>
                )}
              </div>

              {error && <div className="fs-error">{error}</div>}

              <button
                type="button"
                onClick={handleSettle}
                disabled={loading || !creditor}
                className="fs-btn fs-btn-positive fs-btn-lg fs-btn-full"
              >
                {loading
                  ? "Sending USDC…"
                  : `Pay $${Math.abs(balance).toFixed(2)} USDC`}
              </button>

              <p
                className="text-center"
                style={{
                  fontSize: "0.7rem",
                  color: "var(--fs-muted)",
                  fontFamily: "var(--fs-ui)",
                }}
              >
                ~$0.01 gas fee on Base · ~2s confirmation
              </p>
            </div>
          </>
        )}
      </main>
    </div>
  );
}

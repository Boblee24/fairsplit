"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAccount } from "wagmi";
import { useExpenses } from "@/hooks/useExpenses";
import { useBalance } from "@/hooks/useBalances";
import { fromUSDC, getGroup, deactivateGroup } from "@/lib/contract";
import { useUsernames } from "@/hooks/useUsernames";
import { getCategoryById } from "@/lib/categories";
import { SettlementHistory } from "@/components/SettlementHistory";
import UsernamePrompt from "@/components/UsernamePrompt";
import { fetchUsername } from "@/lib/nicknames";
import { parseContractError } from "@/lib/error";
import Link from "next/link";

interface Expense {
  id: bigint;
  description: string;
  payer: string;
  amount: bigint;
  category: string;
  debtors: string[];
  shares: bigint[];
}

/* ── Expense card ── */
function ExpenseCard({
  exp, address, balance, resolve,
}: {
  exp: Expense; address: string | undefined; balance: number; resolve: (addr: string) => string;
}) {
  const cat = getCategoryById(exp.category || "other");
  const isPayer   = address && exp.payer.toLowerCase() === address.toLowerCase();
  const debtorIdx = address ? exp.debtors.findIndex((d) => d.toLowerCase() === address.toLowerCase()) : -1;
  const isDebtor  = debtorIdx !== -1;
  const myShare   = isDebtor ? fromUSDC(exp.shares[debtorIdx]) : 0;

  const statusBadge = () => {
    if (isPayer)
      return <span className="fs-badge fs-badge-positive">You paid</span>;
    if (isDebtor && balance < 0)
      return <span className="fs-badge fs-badge-negative">Owe ${myShare.toFixed(2)}</span>;
    if (isDebtor && balance >= 0)
      return <span className="fs-badge fs-badge-positive">Settled</span>;
    return null;
  };

  return (
    <div className="fs-card" style={{ padding:"1rem 1.15rem" }}>
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 space-y-1.5">
          {/* category pill */}
          <span
            className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium ${cat.color}`}
          >
            {cat.emoji} {cat.label}
          </span>
          <p className="text-sm font-semibold" style={{ color:"var(--fs-text)", fontFamily:"var(--fs-ui)" }}>
            {exp.description}
          </p>
          <p className="text-xs" style={{ color:"var(--fs-muted)", fontFamily:"var(--fs-ui)" }}>
            Paid by {resolve(exp.payer)}
          </p>
        </div>
        <div className="shrink-0 text-right space-y-1.5">
          <p className="text-sm font-bold" style={{ color:"var(--fs-text)", fontFamily:"var(--fs-mono)" }}>
            ${fromUSDC(exp.amount).toFixed(2)}
          </p>
          {statusBadge()}
        </div>
      </div>
    </div>
  );
}

/* ── Skeletons ── */
function ExpenseSkeleton() {
  return (
    <div className="fs-card" style={{ padding:"1rem 1.15rem" }}>
      <div className="flex items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="fs-skeleton h-4 w-36" />
          <div className="fs-skeleton h-3 w-24" style={{ animationDelay:".3s" }} />
        </div>
        <div className="space-y-2 text-right">
          <div className="fs-skeleton ml-auto h-4 w-16" />
          <div className="fs-skeleton ml-auto h-4 w-14 rounded-full" />
        </div>
      </div>
    </div>
  );
}

/* ── Group detail ── */
export default function GroupDetail() {
  const { id }   = useParams();
  const router   = useRouter();
  const { address } = useAccount();

  const rawId   = typeof id === "string" ? id : Array.isArray(id) ? id[0] : "";
  const groupId = rawId ? BigInt(rawId) : null;

  const { expenses, loading }          = useExpenses(groupId ?? undefined);
  const { balance, loading: balLoading } = useBalance(groupId ?? undefined);

  const [groupName, setGroupName]     = useState("");
  const [creator,   setCreator]       = useState("");
  const [deleting,  setDeleting]      = useState(false);
  const [confirmDelete, setConfirmDel]= useState(false);
  const [deleteError, setDelErr]      = useState("");
  const [showUsernamePrompt, setShowUP] = useState(false);

  const allPayers   = expenses.map((e) => e.payer);
  const { resolve } = useUsernames(allPayers);

  useEffect(() => {
    if (groupId === null) return;
    let alive = true;
    getGroup(groupId).then((g) => {
      if (alive) { setGroupName((g[1] as string) || ""); setCreator((g[3] as string) || ""); }
    }).catch(() => { if (alive) setGroupName(""); });
    if (address) {
      fetchUsername(address).then((n) => { if (alive && !n) setShowUP(true); });
    }
    return () => { alive = false; };
  }, [groupId, address]);

  const isCreator    = address?.toLowerCase() === creator?.toLowerCase();
  const isPageLoading = loading || balLoading;

  async function handleDelete() {
    if (!confirmDelete) return setConfirmDel(true);
    setDeleting(true); setDelErr("");
    try {
      if (groupId === null) return;
      await deactivateGroup(groupId);
      router.push("/dashboard"); router.refresh();
    } catch (e: unknown) {
      setDelErr(parseContractError(e)); setDeleting(false); setConfirmDel(false);
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
            <span className="fs-breadcrumb-title">
              {groupName || `Group #${rawId}`}
            </span>
          </div>

          {isCreator && (
            <button
              onClick={handleDelete}
              disabled={deleting}
              className={`fs-btn fs-btn-sm ${confirmDelete ? "fs-btn-danger" : "fs-btn-subtle"}`}
            >
              {deleting ? "Deleting…" : confirmDelete ? "Confirm delete" : "Delete group"}
            </button>
          )}
        </div>
      </header>

      {/* Main */}
      <main className="relative z-10 mx-auto max-w-3xl px-4 pb-16 pt-6 sm:px-6">
        <div className="space-y-6">

          {/* Balance + Activity row */}
          <section className="fs-animate fs-d1 grid gap-4 md:grid-cols-[1fr_auto]">

            {/* Balance card */}
            <div className={`fs-card ${balance >= 0 ? "fs-card-positive" : "fs-card-negative"}`} style={{ padding:"1.25rem 1.4rem" }}>
              <p className="fs-label" style={{ marginBottom:"0.5rem" }}>Your balance</p>
              {balLoading ? (
                <div className="space-y-3 mt-2">
                  <div className="fs-skeleton h-9 w-40" />
                  <div className="fs-skeleton h-3 w-52" style={{ animationDelay:".3s" }} />
                </div>
              ) : (
                <>
                  <p
                    className={`mt-1 font-bold ${balance >= 0 ? "fs-balance-positive" : "fs-balance-negative"}`}
                    style={{ fontFamily:"var(--fs-mono)", fontSize:"2rem", lineHeight:1.1 }}
                  >
                    {balance >= 0 ? "+" : ""}{balance.toFixed(2)}{" "}
                    <span style={{ fontSize:"1rem", fontWeight:500 }}>USDC</span>
                  </p>
                  <p className="mt-1.5 text-xs" style={{ color:"var(--fs-muted)", fontFamily:"var(--fs-ui)" }}>
                    {balance >= 0 ? "You are owed this amount." : "You currently owe this amount."}
                  </p>
                  {balance < 0 && (
                    <Link href={`/settle/${rawId}`} className="fs-btn fs-btn-positive fs-btn-sm mt-4 inline-flex">
                      Settle now →
                    </Link>
                  )}
                </>
              )}
            </div>

            {/* Activity card */}
            <div className="fs-card" style={{ padding:"1.25rem 1.4rem", minWidth:200 }}>
              <p className="fs-label" style={{ marginBottom:"0.5rem" }}>Group activity</p>
              {loading ? (
                <div className="fs-skeleton h-4 w-32 mt-2" />
              ) : (
                <p className="mt-1 text-sm font-semibold" style={{ color:"var(--fs-text)", fontFamily:"var(--fs-ui)" }}>
                  {expenses.length === 0 ? "No expenses yet" : `${expenses.length} expense${expenses.length === 1 ? "" : "s"}`}
                </p>
              )}
              <Link href={`/expenses/new?groupId=${rawId}`} className="fs-btn fs-btn-primary fs-btn-sm mt-4 inline-flex">
                + Add expense
              </Link>
            </div>
          </section>

          {/* Delete error */}
          {deleteError && (
            <div className="fs-animate fs-error">{deleteError}</div>
          )}

          {/* Expenses */}
          <section className="fs-animate fs-d2 space-y-3">
            <div className="fs-section-label">Expenses</div>

            {loading && (
              <div className="space-y-3">
                {[0,1,2].map((i) => <ExpenseSkeleton key={i} />)}
              </div>
            )}

            {!loading && expenses.length === 0 && (
              <div className="fs-empty">
                <p className="text-sm" style={{ color:"var(--fs-muted)", fontFamily:"var(--fs-ui)" }}>
                  No expenses yet. Start by adding your first bill.
                </p>
              </div>
            )}

            {!loading && expenses.map((exp) => (
              <ExpenseCard
                key={exp.id.toString()}
                exp={exp}
                address={address}
                balance={balance}
                resolve={resolve}
              />
            ))}
          </section>

          {/* Settlements */}
          <section className="fs-animate fs-d3 space-y-3">
            <div className="fs-section-label">Settlements</div>
            {isPageLoading ? (
              <div className="space-y-3">
                {[0,1].map((i) => <ExpenseSkeleton key={i} />)}
              </div>
            ) : groupId !== null ? (
              <SettlementHistory groupId={groupId} />
            ) : null}
          </section>

        </div>
      </main>

      {showUsernamePrompt && (
        <UsernamePrompt onComplete={() => setShowUP(false)} onSkip={() => setShowUP(false)} />
      )}
    </div>
  );
}

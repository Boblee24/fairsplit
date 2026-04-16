"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAccount } from "wagmi";
import { useExpenses } from "@/hooks/useExpenses";
import { useBalance } from "@/hooks/useBalances";
import { fromUSDC, getGroup, deactivateGroup } from "@/lib/contract";
import { resolveAddress } from '@/lib/nicknames'
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SettlementHistory } from '@/components/SettlementHistory'
import Link from "next/link";

interface Expense {
  id: bigint;
  description: string;
  payer: string;
  amount: bigint;
}

function ExpenseCard({ exp, balance }: { exp: Expense; balance: number }) {
  return (
    <Card key={exp.id.toString()} className="p-4">
      <div className="flex items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="text-sm font-medium text-slate-50">
            {exp.description}
          </div>
          <div className="text-xs text-slate-400">Paid by {resolveAddress(exp.payer)}</div>
        </div>
        <div className="text-right">
          <div className="text-sm font-semibold text-slate-50">
            ${fromUSDC(exp.amount).toFixed(2)}
          </div>
          <Badge
            variant="outline"
            className={`mt-1 text-[10px] ${
              balance === 0
                ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-400"
                : "border-slate-600/40 bg-slate-800/50 text-slate-400"
            }`}
          >
            {balance === 0 ? "Settled" : "Pending"}
          </Badge>
        </div>
      </div>
    </Card>
  );
}

function ExpenseSkeleton() {
  return (
    <Card className="p-4">
      <div className="flex items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="h-4 w-36 animate-pulse rounded-full bg-slate-800/80" />
          <div className="h-3 w-24 animate-pulse rounded-full bg-slate-800/60" />
        </div>
        <div className="space-y-2 text-right">
          <div className="ml-auto h-4 w-16 animate-pulse rounded-full bg-slate-800/80" />
          <div className="ml-auto h-5 w-14 animate-pulse rounded-full bg-slate-800/60" />
        </div>
      </div>
    </Card>
  )
}

function SettlementSkeleton() {
  return (
    <Card className="p-4">
      <div className="flex items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="h-4 w-40 animate-pulse rounded-full bg-slate-800/80" />
          <div className="h-3 w-24 animate-pulse rounded-full bg-slate-800/60" />
        </div>
        <div className="space-y-2 text-right">
          <div className="ml-auto h-4 w-16 animate-pulse rounded-full bg-slate-800/80" />
          <div className="ml-auto h-3 w-20 animate-pulse rounded-full bg-slate-800/60" />
        </div>
      </div>
    </Card>
  )
}

export default function GroupDetail() {
  const { id } = useParams();
  const router = useRouter();
  const { address } = useAccount();
  const rawId = typeof id === "string" ? id : Array.isArray(id) ? id[0] : "";
  const groupId = rawId ? BigInt(rawId) : null;
  const { expenses, loading } = useExpenses(groupId ?? undefined);
  const { balance, loading: balanceLoading } = useBalance(groupId ?? undefined);
  const [groupName, setGroupName] = useState("");
  const [creator, setCreator] = useState("");
  const [deleting, setDeleting] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)

  useEffect(() => {
    if (groupId === null) return;
    let isMounted = true;
    getGroup(groupId)
      .then((g) => {
        if (isMounted) {
          setGroupName((g[1] as string) || "");
          setCreator((g[3] as string) || "");
        }
      })
      .catch(() => {
        if (isMounted) setGroupName("");
      });
    return () => { isMounted = false; };
  }, [groupId]);

  const isCreator = address?.toLowerCase() === creator?.toLowerCase()
  const isPageLoading = loading || balanceLoading

  async function handleDelete() {
    if (!confirmDelete) return setConfirmDelete(true)
    setDeleting(true)
    try {
      if (groupId === null) return
      await deactivateGroup(groupId)
      router.push('/dashboard')
      router.refresh()
    } catch (e: unknown) {
      const errorMessage =
      e instanceof Error ? e.message : "Group deletion failed";
      console.error(errorMessage)
      setDeleting(false)
      setConfirmDelete(false)
    }
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-950 via-slate-950 to-slate-900 text-slate-50">
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(circle_at_top,rgba(56,189,248,0.24),transparent_55%),radial-gradient(circle_at_bottom,rgba(129,140,248,0.24),transparent_55%)] opacity-80" />

      <header className="border-b border-slate-800/70 bg-slate-950/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-3xl items-center gap-3 px-4 py-3 text-sm">
          <Link href="/dashboard" className="text-slate-400 hover:text-slate-100">
            Back
          </Link>
          <span className="text-xs text-slate-600">/</span>
          <h1 className="text-sm font-medium text-slate-100 flex-1">
            {groupName || `Group #${rawId}`}
          </h1>

          {isCreator && (
            <Button
              onClick={handleDelete}
              disabled={deleting}
              className={`h-7 rounded-full px-3 text-xs font-medium transition-all ${
                confirmDelete
                  ? 'bg-red-600 text-white hover:bg-red-700'
                  : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-red-400'
              }`}
            >
              {deleting ? 'Deleting...' : confirmDelete ? 'Confirm delete' : 'Delete group'}
            </Button>
          )}
        </div>
      </header>

      <main className="mx-auto flex max-w-3xl flex-col gap-6 px-4 pb-10 pt-6">
        <section className="grid gap-4 md:grid-cols-[minmax(0,2fr)_minmax(0,1.4fr)]">
          <Card
            className={`relative overflow-hidden p-5 ${
              !balanceLoading && balance >= 0
                ? "border-emerald-500/40 bg-linear-to-br from-emerald-500/10 via-slate-900/70 to-slate-900/80"
                : "border-rose-500/40 bg-linear-to-br from-rose-500/10 via-slate-900/70 to-slate-900/80"
            }`}
          >
            <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,rgba(52,211,153,0.22),transparent_55%)]" />
            <div className="text-xs font-medium uppercase tracking-wide text-slate-400">
              Your balance
            </div>
            {balanceLoading ? (
              <div className="mt-3 space-y-3">
                <div className="h-9 w-40 animate-pulse rounded-full bg-slate-800/80" />
                <div className="h-3 w-52 animate-pulse rounded-full bg-slate-800/60" />
              </div>
            ) : (
              <>
                <div className={`mt-2 text-3xl font-semibold ${balance >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                  {balance >= 0 ? "+" : ""}{balance.toFixed(2)} USDC
                </div>
                <p className="mt-1 text-xs text-slate-400">
                  {balance >= 0
                    ? "You are owed this amount by the group."
                    : "You currently owe this amount to the group."}
                </p>
              </>
            )}
            {!balanceLoading && balance < 0 && (
              <Link href={`/settle/${rawId}`}>
                <Button className="mt-4 h-8 rounded-full bg-linear-to-r from-rose-500 to-amber-400 px-3 text-xs font-medium text-slate-950 hover:from-rose-400 hover:to-amber-300">
                  Settle now
                </Button>
              </Link>
            )}
          </Card>

          <Card className="p-5">
            <div className="flex items-center justify-between gap-2">
              <div>
                <p className="text-xs font-medium text-slate-400">Group activity</p>
                {loading ? (
                  <div className="mt-2 h-4 w-32 animate-pulse rounded-full bg-slate-800/80" />
                ) : (
                  <p className="mt-1 text-sm text-slate-100">
                    {expenses.length === 0
                      ? "No expenses yet"
                      : `${expenses.length} expense${expenses.length === 1 ? "" : "s"} recorded`}
                  </p>
                )}
              </div>
              <Link href={`/expenses/new?groupId=${rawId}`}>
                <Button className="h-8 rounded-full bg-slate-100 px-3 text-xs font-medium text-slate-900 hover:bg-slate-200">
                  + Add expense
                </Button>
              </Link>
            </div>
          </Card>
        </section>

        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-slate-100">Expenses</h2>

          {loading && (
            <div className="space-y-3">
              {Array.from({ length: 2 }).map((_, index) => (
                <ExpenseSkeleton key={index} />
              ))}
            </div>
          )}

          {!loading && expenses.length === 0 && (
            <Card className="items-center justify-center gap-3 py-8 text-center text-xs text-slate-400">
              <p>No expenses added yet. Start by adding your first bill.</p>
            </Card>
          )}

          {!loading && expenses.map((exp) => (
            <ExpenseCard key={exp.id.toString()} exp={exp} balance={balance} />
          ))}
        </section>

        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-slate-100">Settlements</h2>
          {isPageLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 2 }).map((_, index) => (
                <SettlementSkeleton key={index} />
              ))}
            </div>
          ) : (
            groupId !== null ? <SettlementHistory groupId={groupId} /> : null
          )}
        </section>
      </main>
    </div>
  );
}

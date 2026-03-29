"use client";

import { useParams } from "next/navigation";
import { useExpenses } from "@/hooks/useExpenses";
import { useBalance } from "@/hooks/useBalances";
import { fromUSDC } from "@/lib/contract";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

export default function GroupDetail() {
  const { id } = useParams();
  const groupId = BigInt(id as string);
  const { expenses, loading } = useExpenses(groupId);
  const { balance } = useBalance(groupId);

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-950 via-slate-950 to-slate-900 text-slate-50">
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(circle_at_top,rgba(56,189,248,0.24),transparent_55%),radial-gradient(circle_at_bottom,rgba(129,140,248,0.24),transparent_55%)] opacity-80" />

      <header className="border-b border-slate-800/70 bg-slate-950/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-3xl items-center gap-3 px-4 py-3 text-sm">
          <Link
            href="/dashboard"
            className="text-slate-400 hover:text-slate-100"
          >
            ← Back
          </Link>
          <span className="text-xs text-slate-600">/</span>
          <h1 className="text-sm font-medium text-slate-100">Group #{id}</h1>
        </div>
      </header>

      <main className="mx-auto flex max-w-3xl flex-col gap-6 px-4 pb-10 pt-6">
        <section className="grid gap-4 md:grid-cols-[minmax(0,2fr)_minmax(0,1.4fr)]">
          <Card
            className={`relative overflow-hidden p-5 ${
              balance >= 0
                ? "border-emerald-500/40 bg-linear-to-br from-emerald-500/10 via-slate-900/70 to-slate-900/80"
                : "border-rose-500/40 bg-linear-to-br from-rose-500/10 via-slate-900/70 to-slate-900/80"
            }`}
          >
            <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,rgba(52,211,153,0.22),transparent_55%)]" />
            <div className="text-xs font-medium uppercase tracking-wide text-slate-400">
              Your balance
            </div>
            <div
              className={`mt-2 text-3xl font-semibold ${
                balance >= 0 ? "text-emerald-400" : "text-rose-400"
              }`}
            >
              {balance >= 0 ? "+" : ""}
              {balance.toFixed(2)} USDC
            </div>
            <p className="mt-1 text-xs text-slate-400">
              {balance >= 0
                ? "You are owed this amount by the group."
                : "You currently owe this amount to the group."}
            </p>
            {balance < 0 && (
              <Link href={`/settle/${id}`}>
                <Button className="mt-4 h-8 rounded-full bg-linear-to-r from-rose-500 to-amber-400 px-3 text-xs font-medium text-slate-950 hover:from-rose-400 hover:to-amber-300">
                  Settle now
                </Button>
              </Link>
            )}
          </Card>

          <Card className="p-5">
            <div className="flex items-center justify-between gap-2">
              <div>
                <p className="text-xs font-medium text-slate-400">
                  Group activity
                </p>
                <p className="mt-1 text-sm text-slate-100">
                  {expenses.length === 0
                    ? "No expenses yet"
                    : `${expenses.length} expense${expenses.length === 1 ? "" : "s"} recorded`}
                </p>
              </div>
              <Link href={`/expenses/new?groupId=${id}`}>
                <Button className="h-8 rounded-full bg-slate-100 px-3 text-xs font-medium text-slate-900 hover:bg-slate-200">
                  + Add expense
                </Button>
              </Link>
            </div>
          </Card>
        </section>

        <section className="space-y-3">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-sm font-semibold text-slate-100">Expenses</h2>
          </div>

          {loading && (
            <p className="text-xs text-slate-400">
              Loading expenses from the chain…
            </p>
          )}

          {!loading && expenses.length === 0 && (
            <Card className="items-center justify-center gap-3 py-8 text-center text-xs text-slate-400">
              <p>No expenses added yet. Start by adding your first bill.</p>
            </Card>
          )}

          {expenses.map((exp) => (
            <Card key={exp.id.toString()} className="p-4">
              <div className="flex items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="text-sm font-medium text-slate-50">
                    {exp.description}
                  </div>
                  <div className="text-xs text-slate-400">
                    Paid by {exp.payer.slice(0, 6)}...{exp.payer.slice(-4)}
                  </div>
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
          ))}
        </section>
      </main>
    </div>
  );
}

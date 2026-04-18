"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAccount } from "wagmi";
import { useBalance } from "@/hooks/useBalances";
import { settleDebt, getGroup, getBalance } from "@/lib/contract";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useUsernames } from "@/hooks/useUsernames";
import Link from "next/link";

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
          members.map(async (member: string) => {
            const bal = (await getBalance(parsedGroupId, member)) as bigint;
            return { address: member, balance: Number(bal) / 1_000_000 };
          }),
        );

        const positiveMembers = balances.filter(
          (member) =>
            member.balance > 0 &&
            address &&
            member.address.toLowerCase() !== address.toLowerCase(),
        );

        setCreditors(positiveMembers);

        if (positiveMembers.length === 1) {
          setCreditor(positiveMembers[0].address);
        }
      } catch (e) {
        console.error("Failed to resolve creditors:", e);
      }
    }

    resolveCreditors();
  }, [parsedGroupId, address]);

  async function handleSettle() {
    if (!creditor.startsWith("0x")) {
      return setError("Enter a valid wallet address");
    }

    setLoading(true);
    setError("");

    try {
      await settleDebt(parsedGroupId, creditor, Math.abs(balance));
      setSuccess(true);
      setTimeout(() => router.push(`/groups/${groupId}`), 2000);
    } catch (e: unknown) {
      const errorMessage =
        e instanceof Error ? e.message : "Transaction failed";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-950 via-slate-950 to-slate-900 text-slate-50">
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(circle_at_top,rgba(56,189,248,0.24),transparent_55%),radial-gradient(circle_at_bottom,rgba(52,211,153,0.24),transparent_55%)] opacity-80" />

      <header className="border-b border-slate-800/70 bg-slate-950/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-xl items-center gap-3 px-4 py-3 text-sm">
          <Link
            href={`/groups/${groupId}`}
            className="text-slate-400 hover:text-slate-100"
          >
            Back
          </Link>
          <span className="text-xs text-slate-600">/</span>
          <h1 className="text-sm font-medium text-slate-100">Settle up</h1>
        </div>
      </header>

      <main className="mx-auto flex max-w-xl flex-col gap-6 px-4 pb-10 pt-6">
        {success ? (
          <Card className="overflow-hidden border-emerald-500/30 bg-linear-to-br from-emerald-500/12 via-slate-900/85 to-slate-900/95 shadow-[0_12px_30px_rgba(16,185,129,0.28)]">
            <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-[radial-gradient(circle_at_top,rgba(52,211,153,0.22),transparent_70%)]" />
            <CardHeader className="items-center text-center">
              <div className="inline-flex size-14 items-center justify-center bg-emerald-400/10 text-sm font-semibold uppercase tracking-[0.24em] text-emerald-300 shadow-[0_0_40px_rgba(52,211,153,0.2)]">
                Paid
              </div>
              <div className="space-y-2">
                <div className="inline-flex items-center rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.2em] text-emerald-300">
                  Settlement complete
                </div>
                <CardTitle className="text-2xl tracking-tight text-slate-50">
                  Payment confirmed onchain
                </CardTitle>
                <CardDescription className="max-w-md text-sm leading-6 text-slate-300">
                  Your balance for this group has been cleared successfully.
                  We&apos;re taking you back to the group details now.
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-slate-800/80 bg-slate-950/45 p-4">
                  <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-slate-500">
                    Amount settled
                  </p>
                  <p className="mt-2 text-lg font-semibold text-emerald-300">
                    ${Math.abs(balance).toFixed(2)} USDC
                  </p>
                </div>
                <div className="rounded-2xl border border-slate-800/80 bg-slate-950/45 p-4">
                  <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-slate-500">
                    Status
                  </p>
                  <p className="mt-2 text-lg font-semibold text-slate-100">
                    Position settled
                  </p>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-800/80 bg-slate-950/35 px-4 py-3 text-center text-xs text-slate-400">
                Redirecting to your group in a moment.
              </div>
            </CardContent>
          </Card>
        ) : (
          <>
            <section className="rounded-3xl border border-rose-500/40 bg-linear-to-br from-rose-500/10 via-slate-900/70 to-slate-900/80 p-5 shadow-[0_5px_25px_rgba(248,113,113,0.45)]">
              <div className="text-xs font-medium uppercase tracking-wide text-slate-300">
                You owe
              </div>
              <div className="mt-2 text-3xl font-semibold text-rose-300">
                ${Math.abs(balance).toFixed(2)} USDC
              </div>
              <p className="mt-1 text-xs text-slate-300">
                This is your current net position in this group. You&apos;ll pay
                this amount in a single onchain transaction.
              </p>
            </section>

            <section className="space-y-4 rounded-3xl border border-slate-800/80 bg-slate-900/70 p-5 shadow-[0_20px_60px_rgba(15,23,42,0.9)] backdrop-blur-xl">
              <div className="space-y-2">
                <Label>Pay to</Label>

                {creditors.length > 1 ? (
                  <select
                    value={creditor}
                    onChange={(e) => setCreditor(e.target.value)}
                    className="w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-100 outline-none focus:border-emerald-500"
                  >
                    <option value="">Select who to pay</option>
                    {creditors.map((c) => (
                      <option key={c.address} value={c.address}>
                        {resolve(c.address)} - owed ${c.balance.toFixed(2)}
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="rounded-md border border-slate-700 bg-slate-800/50 px-3 py-2 text-sm text-slate-300 break-all">
                    {creditor ? resolve(creditor) : "Resolving creditor..."}
                  </div>
                )}
              </div>

              {error && <p className="text-xs text-red-400">{error}</p>}

              <Button
                onClick={handleSettle}
                disabled={loading || !creditor}
                className="mt-1 h-11 w-full rounded-full bg-linear-to-r from-emerald-500 to-sky-400 text-sm font-medium text-slate-950 shadow-[0_24px_70px_rgba(52,211,153,0.7)] hover:from-emerald-400 hover:to-sky-300"
              >
                {loading
                  ? "Sending USDC..."
                  : `Pay $${Math.abs(balance).toFixed(2)} USDC`}
              </Button>

              <p className="pt-1 text-center text-[11px] text-slate-400">
                ~$0.01 gas fee on Base | ~2 second confirmation
              </p>
            </section>
          </>
        )}
      </main>
    </div>
  );
}

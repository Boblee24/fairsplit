"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAccount } from "wagmi";
import { useBalance } from "@/hooks/useBalances";
import { settleDebt, getGroup, getBalance } from "@/lib/contract";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { resolveAddress } from "@/lib/nicknames";
import Link from "next/link";

export default function SettlePage() {
  const { groupId } = useParams();
  const router = useRouter();
  const { address } = useAccount();
  const { balance } = useBalance(BigInt(groupId as string));
  const [creditor, setCreditor] = useState("");
  const [creditors, setCreditors] = useState<
    { address: string; balance: number }[]
  >([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // Auto-resolve creditors from group members
  // Replace the useEffect in settle/[id]/page.tsx

  useEffect(() => {
    if (!address) return;
    async function resolveCreditors() {
      try {
        const result = (await getGroup(BigInt(groupId as string))) as [
          bigint,
          string,
          string[],
          string,
          boolean,
        ];

        // getGroup returns a tuple: [id, name, members, creator, isActive]
        const members: string[] = Array.isArray(result) ? result[2] : [];

        if (!members || members.length === 0) return;

        const balances = await Promise.all(
          members.map(async (member: string) => {
            const bal = (await getBalance(
              BigInt(groupId as string),
              member,
            )) as bigint;
            // int256 comes back as bigint, convert carefully
            const numBal = Number(bal) / 1_000_000;
            return { address: member, balance: numBal };
          }),
        );

        const positiveMembers = balances.filter(
          (m) =>
            m.balance > 0 &&
            address &&
            m.address.toLowerCase() !== address.toLowerCase(),
        );

        setCreditors(positiveMembers);

        if (positiveMembers.length === 1) {
          setCreditor(positiveMembers[0].address);
        }
      } catch (e) {
        console.error("Failed to resolve creditors:", e); // you'll now see exact error
      }
    }
    resolveCreditors();
  }, [groupId, address]);

  async function handleSettle() {
    if (!creditor.startsWith("0x"))
      return setError("Enter a valid wallet address");
    setLoading(true);
    setError("");
    try {
      await settleDebt(BigInt(groupId as string), creditor, Math.abs(balance));
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
            ← Back
          </Link>
          <span className="text-xs text-slate-600">/</span>
          <h1 className="text-sm font-medium text-slate-100">Settle up</h1>
        </div>
      </header>

      <main className="mx-auto flex max-w-xl flex-col gap-6 px-4 pb-10 pt-6">
        {success ? (
          <div className="flex flex-col items-center justify-center gap-3 rounded-3xl border border-emerald-500/40 bg-linear-to-br from-emerald-500/10 via-slate-900/70 to-slate-900/80 py-12 text-center shadow-[0_24px_60px_rgba(16,185,129,0.6)]">
            <div className="text-5xl">✅</div>
            <p className="text-lg font-semibold text-emerald-300">
              All settled
            </p>
            <p className="max-w-sm text-xs text-slate-300">
              Your USDC has been sent and this group position is now flat.
              You&apos;ll be redirected back to the group shortly.
            </p>
          </div>
        ) : (
          <>
            <section className="rounded-3xl border border-rose-500/40 bg-linear-to-br from-rose-500/10 via-slate-900/70 to-slate-900/80 p-5 shadow-[0_24px_60px_rgba(248,113,113,0.45)]">
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

                {/* Dropdown if multiple creditors, auto-filled input if one */}
                {creditors.length > 1 ? (
                  <select
                    value={creditor}
                    onChange={(e) => setCreditor(e.target.value)}
                    className="w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-100 outline-none focus:border-emerald-500"
                  >
                    <option value="">Select who to pay</option>
                    {creditors.map((c) => (
                      <option key={c.address} value={c.address}>
                        {resolveAddress(c.address)} — owed $
                        {c.balance.toFixed(2)}
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="rounded-md border border-slate-700 bg-slate-800/50 px-3 py-2 text-sm text-slate-300 break-all">
                    {creditor
                      ? resolveAddress(creditor)
                      : "Resolving creditor..."}
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
                  ? "Sending USDC…"
                  : `Pay $${Math.abs(balance).toFixed(2)} USDC`}
              </Button>

              <p className="pt-1 text-center text-[11px] text-slate-400">
                ~${"0.01"} gas fee on Base · ~2 second confirmation
              </p>
            </section>
          </>
        )}
      </main>
    </div>
  );
}

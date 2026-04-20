"use client";

import { useAccount } from "wagmi";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useGroups } from "@/hooks/useGroups";
import { useHydrated } from "@/hooks/useHydrated";
import { WalletConnect } from "@/components/WalletConnect";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import { NotificationBell } from "@/components/NotificationBell";

function GroupCardSkeleton() {
  return (
    <Card className="p-4">
      <div className="flex items-start justify-between gap-2">
        <div className="space-y-2">
          <div className="h-4 w-28 animate-pulse rounded-full bg-slate-800/80" />
          <div className="h-3 w-20 animate-pulse rounded-full bg-slate-800/60" />
        </div>
        <div className="h-5 w-14 animate-pulse rounded-full bg-slate-800/70" />
      </div>
    </Card>
  );
}

export default function Dashboard() {
  const { isConnected } = useAccount();
  const router = useRouter();
  const { groups, loading } = useGroups();
  const mounted = useHydrated();

  useEffect(() => {
    if (mounted && !isConnected) router.push("/");
  }, [isConnected, mounted, router]);

  const showDashboardSkeleton = !mounted || (isConnected && loading);

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-950 via-slate-950 to-slate-900 text-slate-50">
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(circle_at_top,rgba(56,189,248,0.28),transparent_55%),radial-gradient(circle_at_bottom,rgba(129,140,248,0.28),transparent_55%)] opacity-80" />

      <header className="sticky top-0 z-20 border-b border-slate-800/70 bg-slate-950/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-100">
            <span className="text-lg">FairSplit</span>
            <span className="rounded-full border border-slate-700/70 px-2 py-0.5 text-[10px] font-normal text-slate-400">
              Dashboard
            </span>
          </div>
          <div className="flex items-center gap-2">
            <NotificationBell />
            <WalletConnect />
          </div>
        </div>
      </header>

      <main className="mx-auto flex max-w-5xl flex-col gap-6 px-4 pb-10 pt-6">
        <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              Your groups
            </h1>
            <p className="mt-1 text-sm text-slate-400">
              Organise trips, houseshares, and tabs. Everything settles in USDC.
            </p>
          </div>
          <Link href="/groups/new">
            <Button className="h-9 rounded-full bg-linear-to-r from-sky-500 via-emerald-400 to-indigo-500 px-4 text-xs font-medium text-slate-950 shadow-[0_18px_45px_rgba(56,189,248,0.65)] hover:from-sky-400 hover:via-emerald-300 hover:to-indigo-400">
              + New Group
            </Button>
          </Link>
        </div>

        {showDashboardSkeleton && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <GroupCardSkeleton key={index} />
            ))}
          </div>
        )}

        {!showDashboardSkeleton && groups.length === 0 && (
          <Card className="items-center justify-center gap-4 py-10 text-center">
            <div>
              <p className="text-sm font-medium text-slate-100">
                No groups yet
              </p>
              <p className="mt-1 text-xs text-slate-400">
                Create a group for your next trip, Airbnb, or shared expenses.
              </p>
            </div>
            <Link href="/groups/new">
              <Button className="mt-2 h-9 rounded-full bg-slate-100 px-4 text-xs font-medium text-slate-900 hover:bg-slate-200">
                Create your first group
              </Button>
            </Link>
          </Card>
        )}

        {!showDashboardSkeleton && groups.length > 0 && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {groups.map((group) => (
              <Link
                key={group.id.toString()}
                href={`/groups/${group.id.toString()}`}
              >
                <Card className="cursor-pointer p-4 transition-all hover:-translate-y-0.5 hover:border-sky-400/70 hover:shadow-[0_14px_32px_rgba(56,189,248,0.28)]">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="text-sm font-semibold">{group.name}</div>
                      <div className="mt-1 text-xs text-slate-400">
                        {group.members.length} member
                        {group.members.length === 1 ? "" : "s"}
                      </div>
                    </div>
                    <span className="rounded-full border border-slate-700/80 px-2 py-0.5 text-[10px] text-slate-400">
                      Onchain
                    </span>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

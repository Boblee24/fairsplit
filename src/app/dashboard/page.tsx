"use client";

import { useAccount } from "wagmi";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useGroups } from "@/hooks/useGroups";
import { useHydrated } from "@/hooks/useHydrated";
import { WalletConnect } from "@/components/WalletConnect";
import { NotificationBell } from "@/components/NotificationBell";
import Link from "next/link";

function getInitials(name: string) {
  return name.split(/\s+/).slice(0, 2).map((w) => w[0]).join("").toUpperCase();
}

/* ── Skeleton card ── */
function GroupCardSkeleton({ index }: { index: number }) {
  return (
    <div
      className={`fs-group-card fs-animate fs-d${index + 1} pointer-events-none`}
    >
      <div className="flex items-center gap-3">
        <div className="fs-skeleton" style={{ width:40, height:40, borderRadius:"50%", flexShrink:0 }} />
        <div className="flex-1 space-y-2">
          <div className="fs-skeleton h-3 w-28" />
          <div className="fs-skeleton h-2.5 w-20" style={{ animationDelay:".3s" }} />
        </div>
      </div>
      <div className="fs-card-footer">
        <div className="fs-skeleton h-4 w-12 rounded-full" />
        <div className="fs-skeleton h-3.5 w-3.5 rounded" />
      </div>
    </div>
  );
}

/* ── Group card ── */
function GroupCard({
  group,
  index,
}: {
  group: { id: bigint; name: string; members: string[] };
  index: number;
}) {
  return (
    <Link
      href={`/groups/${group.id.toString()}`}
      className={`fs-group-card fs-animate fs-d${Math.min(index + 3, 9)}`}
    >
      {/* Top: avatar + name */}
      <div className="flex items-center gap-3">
        <div className="fs-avatar">{getInitials(group.name)}</div>
        <div className="min-w-0">
          <p
            className="truncate text-sm"
            style={{ fontFamily:"var(--fs-ui)", fontWeight:700, color:"var(--fs-text)" }}
          >
            {group.name}
          </p>
          <div className="mt-1 flex items-center gap-1.5">
            <div className="fs-dots">
              {Array.from({ length: Math.min(group.members.length, 4) }).map((_, i) => (
                <span key={i} className="fs-dot" style={{ opacity: i === 0 ? 1 : 0.4 + i * 0.1 }} />
              ))}
            </div>
            <span
              className="text-[11px]"
              style={{ color:"var(--fs-muted)", fontFamily:"var(--fs-ui)" }}
            >
              {group.members.length} {group.members.length === 1 ? "member" : "members"}
            </span>
          </div>
        </div>
      </div>

      {/* Bottom: badge + arrow */}
      <div className="fs-card-footer">
        <span className="fs-badge fs-badge-accent">Base</span>
        <svg className="fs-card-arrow" width="15" height="15" viewBox="0 0 15 15" fill="none">
          <path d="M3 7.5h9M8.5 3.5l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    </Link>
  );
}

/* ── Dashboard ── */
export default function Dashboard() {
  const { isConnected } = useAccount();
  const router = useRouter();
  const { groups, loading } = useGroups();
  const mounted = useHydrated();

  useEffect(() => {
    if (mounted && !isConnected) router.push("/");
  }, [isConnected, mounted, router]);

  const showSkeleton = !mounted || (isConnected && loading);
  const showEmpty    = !showSkeleton && groups.length === 0;
  const showGroups   = !showSkeleton && groups.length > 0;

  return (
    <div className="fs-page">
      <div className="fs-mesh"    aria-hidden />
      <div className="fs-texture" aria-hidden />

      {/* Header */}
      <header className="fs-header">
        <div className="fs-header-inner">
          <div className="flex items-center gap-2.5">
            <span className="fs-brand">Fair<em>Split</em></span>
            <div className="fs-live-badge">
              <span className="fs-live-dot" />
              Testnet
            </div>
          </div>
          <div className="flex items-center gap-2">
            <NotificationBell />
            <WalletConnect />
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="relative z-10 mx-auto max-w-5xl px-4 pb-20 pt-8 sm:px-6">

        {/* Headline */}
        <div className="fs-animate fs-d1 mb-7">
          <h1 style={{ fontFamily:"var(--fs-display)", fontSize:"clamp(1.9rem,5vw,2.7rem)", color:"var(--fs-text)", letterSpacing:"-0.01em", lineHeight:1.15 }}>
            Your groups
          </h1>
          <p className="mt-2 text-sm" style={{ color:"var(--fs-text-2)", fontFamily:"var(--fs-ui)", lineHeight:1.6 }}>
            Every expense tracked on-chain.{" "}
            <span style={{ color:"var(--fs-accent)", fontStyle:"italic" }}>Settled instantly</span>{" "}
            in USDC.
          </p>
        </div>

        {/* Action row */}
        <div className="fs-animate fs-d2 mb-6 flex items-center justify-between gap-4">
          <div className="fs-section-label flex-1">
            {showGroups   ? `${groups.length} group${groups.length === 1 ? "" : "s"}`
             : showSkeleton ? "loading"
             : "no groups yet"}
          </div>
          <Link href="/groups/new" className="fs-btn fs-btn-primary fs-btn-md">
            <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
              <path d="M6 1v10M1 6h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
            New Group
          </Link>
        </div>

        {/* Skeletons */}
        {showSkeleton && (
          <div className="fs-group-grid">
            {[0,1,2,3,4,5].map((i) => <GroupCardSkeleton key={i} index={i} />)}
          </div>
        )}

        {/* Empty */}
        {showEmpty && (
          <div className="fs-animate fs-d3 fs-empty">
            <div className="fs-empty-icon">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <circle cx="9" cy="9" r="7" stroke="var(--fs-accent)" strokeWidth="1.5"/>
                <path d="M9 5.5v7M5.5 9h7" stroke="var(--fs-accent)" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </div>
            <p className="text-sm font-bold" style={{ color:"var(--fs-text)", fontFamily:"var(--fs-ui)" }}>
              No groups yet
            </p>
            <p className="mt-1.5 text-xs" style={{ color:"var(--fs-muted)", fontFamily:"var(--fs-ui)", lineHeight:1.6 }}>
              Split a trip, an Airbnb, or a dinner.<br />Everything settles in USDC on Base.
            </p>
            <Link href="/groups/new" className="fs-btn fs-btn-primary fs-btn-md mt-6 inline-flex">
              Create your first group
            </Link>
          </div>
        )}

        {/* Grid */}
        {showGroups && (
          <div className="fs-group-grid">
            {groups.map((group, i) => (
              <GroupCard key={group.id.toString()} group={group} index={i} />
            ))}
          </div>
        )}

        {/* Stat strip */}
        {showGroups && (
          <div className="fs-animate fs-d9 fs-stat-strip">
            {[{value:"$0.01",label:"Avg gas fee"},{value:"~2s",label:"Settlement"},{value:"USDC",label:"Stable token"}].map(({value,label}) => (
              <div key={label} className="flex flex-col items-center gap-1">
                <span className="fs-stat-value">{value}</span>
                <span className="fs-stat-label">{label}</span>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

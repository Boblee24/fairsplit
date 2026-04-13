"use client";

import { useAccount, useConnect, useDisconnect } from "wagmi";
import { useState } from "react";
import { useHydrated } from "@/hooks/useHydrated";
import { WalletConnectModal } from "./WalletConnectModal";

export function WalletConnect() {
  const { address, isConnected } = useAccount();
  const { connect, connectors, isPending } = useConnect();
  const { disconnect } = useDisconnect();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const mounted = useHydrated();

  if (!mounted) {
    return (
      <div className="h-11 w-40 animate-pulse rounded-full border border-slate-800/70 bg-slate-900/60" />
    );
  }

  if (isConnected && address) {
    return (
      <div className="flex items-center gap-3 rounded-full border border-slate-700/60 bg-slate-900/60 px-3 py-1.5 text-xs shadow-[0_0_20px_rgba(56,189,248,0.15)]">
        <span className="inline-flex size-2 rounded-full bg-emerald-400" />
        <span className="font-mono text-[11px] text-slate-200">
          {address.slice(0, 6)}...{address.slice(-4)}
        </span>
        <button
          onClick={() => disconnect()}
          className="ml-1 rounded-full bg-slate-800 px-3 py-1 text-[10px] font-medium text-slate-300 hover:bg-slate-700 hover:text-white transition"
        >
          Disconnect
        </button>
      </div>
    );
  }

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className="h-11 px-8 rounded-full min-w-40 text-sm font-bold text-slate-950 bg-gradient-to-r from-sky-400 via-emerald-400 to-indigo-500 hover:opacity-90 transition"
      >
        Connect Wallet
      </button>

      <WalletConnectModal
        open={isModalOpen}
        connectors={connectors}
        isPending={isPending}
        onClose={() => setIsModalOpen(false)}
        onConnect={(connector) => {
          connect({ connector });
          setIsModalOpen(false);
        }}
      />
    </>
  );
}
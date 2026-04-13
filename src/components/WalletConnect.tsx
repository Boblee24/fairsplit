'use client'

import { useAccount, useConnect, useDisconnect } from 'wagmi'
import { Button } from '@/components/ui/button'
import { useState } from 'react'
import { useHydrated } from '@/hooks/useHydrated'

export function WalletConnect() {
  const { address, isConnected } = useAccount()
  const { connect, connectors, isPending } = useConnect()
  const { disconnect } = useDisconnect()
  const [showOptions, setShowOptions] = useState(false)
  const mounted = useHydrated()

  if (!mounted) {
    return (
      <div className="h-10 w-40 animate-pulse rounded-full border border-slate-800/70 bg-slate-900/60" />
    )
  }

  if (isConnected && address) {
    return (
      <div className="flex items-center gap-3 rounded-full border border-slate-700/60 bg-slate-900/60 px-3 py-1.5 text-xs shadow-[0_0_30px_rgba(56,189,248,0.35)]">
        <span className="inline-flex size-2 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.9)]" />
        <span className="font-mono text-[11px] text-slate-200">
          {address.slice(0, 6)}...{address.slice(-4)}
        </span>
        <Button
          variant="ghost"
          size="xs"
          onClick={() => disconnect()}
          className="ml-1 h-6 rounded-full px-2 text-[11px] text-slate-300 hover:bg-slate-800/90"
        >
          Disconnect
        </Button>
      </div>
    )
  }

  if (showOptions) {
    return (
      <div className="flex w-full max-w-xs flex-col gap-2 rounded-2xl border border-slate-800/80 bg-slate-900/80 p-3 backdrop-blur-xl">
        {connectors.map((connector) => (
          <Button
            key={connector.uid}
            onClick={() => {
              connect({ connector })
              setShowOptions(false)
            }}
            disabled={isPending}
            variant="outline"
            className="w-full justify-start gap-2 border-slate-700/80 bg-slate-900/60 text-slate-100 hover:border-sky-400/80 hover:bg-slate-900"
          >
            {connector.name}
          </Button>
        ))}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowOptions(false)}
          className="justify-center text-xs text-slate-400 hover:bg-slate-800/80 hover:text-slate-100"
        >
          Cancel
        </Button>
      </div>
    )
  }

  return (
    <Button
      onClick={() => setShowOptions(true)}
      className="h-10 rounded-full bg-linear-to-r from-sky-500 via-emerald-400 to-indigo-500 px-6 text-sm font-medium text-slate-950 shadow-[0_18px_45px_rgba(59,130,246,0.55)] transition-all hover:from-sky-400 hover:via-emerald-300 hover:to-indigo-400 hover:shadow-[0_18px_60px_rgba(56,189,248,0.8)]"
    >
      Connect Wallet
    </Button>
  )
}

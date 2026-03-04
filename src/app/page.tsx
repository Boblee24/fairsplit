'use client'

import { useAccount } from 'wagmi'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { WalletConnect } from '@/components/WalletConnect'
import { Button } from '@/components/ui/button'

export default function Home() {
  const { isConnected } = useAccount()
  const router = useRouter()

  useEffect(() => {
    if (isConnected) router.push('/dashboard')
  }, [isConnected, router])

  return (
    <main className="min-h-screen flex items-center justify-center bg-linear-to-br from-slate-950 via-slate-950 to-slate-900 px-4 text-slate-50">
      <div className="relative max-w-2xl w-full">
        <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,rgba(56,189,248,0.35),transparent_55%),radial-gradient(circle_at_bottom,rgba(129,140,248,0.3),transparent_55%)] opacity-80" />

        <div className="rounded-3xl border border-slate-800/70 bg-slate-900/60 px-8 py-10 shadow-[0_30px_80px_rgba(15,23,42,0.9)] backdrop-blur-2xl">
          <div className="space-y-8 text-center">
            <div className="space-y-3">
              <p className="inline-flex items-center gap-2 rounded-full border border-slate-700/60 bg-slate-900/70 px-3 py-1 text-xs font-medium text-slate-300">
                <span className="inline-flex size-4 items-center justify-center rounded-full bg-emerald-400/90 text-[10px] text-slate-950">
                  ✦
                </span>
                Onchain group expenses on Base
              </p>
              <div className="text-5xl font-semibold leading-tight tracking-tight">
                <span className="bg-linear-to-r from-sky-400 via-emerald-400 to-indigo-400 bg-clip-text text-transparent">
                  FairSplit
                </span>
              </div>
              <p className="text-lg text-slate-300">
                Split trips, houses, and nights out with anyone, anywhere.
                <br />
                Settle instantly in USDC on Base for less than a cent.
              </p>
            </div>

            <div className="flex flex-col items-center gap-3">
              <WalletConnect />
              <p className="text-xs text-slate-400">
                Connect any Base-compatible wallet. No seed phrases needed.
              </p>
            </div>

            <div className="grid gap-4 pt-4 text-left sm:grid-cols-3">
              {[
                { icon: '🌍', label: 'Truly global', desc: 'Works anywhere, with any currency you track in USDC.' },
                { icon: '⚡', label: 'Instant settle', desc: '2-second confirmations on Base mainnet.' },
                { icon: '💰', label: 'Gas in pennies', desc: 'Around $0.01 per settlement, even for tiny splits.' },
              ].map((f) => (
                <div
                  key={f.label}
                  className="rounded-2xl border border-slate-800/80 bg-slate-900/70 p-4 shadow-[0_0_40px_rgba(15,23,42,0.9)]"
                >
                  <div className="text-2xl">{f.icon}</div>
                  <div className="mt-2 text-sm font-medium text-slate-100">{f.label}</div>
                  <div className="mt-1 text-xs text-slate-400">{f.desc}</div>
                </div>
              ))}
            </div>

            <div className="mt-2 flex flex-col items-center gap-1 text-[11px] text-slate-500 sm:flex-row sm:justify-center">
              <span>Powered by Base · USDC onchain</span>
              <span className="hidden sm:inline text-slate-700">•</span>
              <span className="text-slate-400">Non-custodial, you always hold your funds.</span>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}

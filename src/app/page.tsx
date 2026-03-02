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
    <main className="min-h-screen flex flex-col items-center justify-center bg-black text-white px-4">
      <div className="max-w-xl text-center space-y-6">
        <div className="text-5xl font-bold">💸 FairSplit</div>
        <p className="text-xl text-zinc-400">
          Split expenses with anyone, anywhere.<br />
          Settle instantly in USDC on Base.
        </p>

        <div className="flex flex-col gap-3 items-center">
          <WalletConnect />
          <p className="text-sm text-zinc-500">No seed phrases. Works with Face ID.</p>
        </div>

        <div className="grid grid-cols-3 gap-4 pt-8 text-center">
          {[
            { icon: '🌍', label: 'Global', desc: 'Works anywhere, not just the US' },
            { icon: '⚡', label: 'Instant', desc: '2-second settlement on Base' },
            { icon: '💰', label: '$0.01 fees', desc: 'Micro-splits are actually viable' },
          ].map(f => (
            <div key={f.label} className="bg-zinc-900 rounded-xl p-4">
              <div className="text-2xl">{f.icon}</div>
              <div className="font-semibold mt-1">{f.label}</div>
              <div className="text-xs text-zinc-400 mt-1">{f.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}

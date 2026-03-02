'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useBalance } from '@/hooks/useBalances'
import { settleDebt } from '@/lib/contract'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Link from 'next/link'

export default function SettlePage() {
  const { groupId } = useParams()
  const router = useRouter()
  const { balance } = useBalance(BigInt(groupId as string))
  const [creditor, setCreditor] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  async function handleSettle() {
    if (!creditor.startsWith('0x')) return setError('Enter a valid wallet address')
    setLoading(true)
    setError('')
    try {
      await settleDebt(BigInt(groupId as string), creditor, Math.abs(balance))
      setSuccess(true)
      setTimeout(() => router.push(`/groups/${groupId}`), 2000)
    } catch (e: any) {
      setError(e.message || 'Transaction failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <header className="flex items-center gap-4 p-4 border-b border-zinc-800">
        <Link href={`/groups/${groupId}`} className="text-zinc-400 hover:text-white">← Back</Link>
        <h1 className="font-bold text-xl">Settle Up</h1>
      </header>

      <main className="max-w-lg mx-auto p-4 space-y-6">
        {success ? (
          <div className="text-center py-12">
            <div className="text-5xl mb-4">✅</div>
            <p className="text-xl font-bold text-green-400">All settled!</p>
            <p className="text-zinc-400 mt-2">Your USDC has been sent.</p>
          </div>
        ) : (
          <>
            <div className="bg-red-950 border border-red-800 rounded-xl p-4">
              <div className="text-sm text-zinc-400">You owe</div>
              <div className="text-2xl font-bold text-red-400">
                ${Math.abs(balance).toFixed(2)} USDC
              </div>
            </div>

            <div className="space-y-2">
              <Label>Creditor Wallet Address</Label>
              <Input
                placeholder="0x... (person to pay)"
                value={creditor}
                onChange={e => setCreditor(e.target.value)}
                className="bg-zinc-900 border-zinc-700"
              />
            </div>

            {error && <p className="text-red-400 text-sm">{error}</p>}

            <Button
              onClick={handleSettle}
              disabled={loading}
              className="w-full bg-green-600 hover:bg-green-700 text-lg py-6"
            >
              {loading ? 'Sending USDC...' : `Pay $${Math.abs(balance).toFixed(2)} USDC`}
            </Button>

            <p className="text-center text-xs text-zinc-500">
              ~$0.01 gas fee on Base · 2 second confirmation
            </p>
          </>
        )}
      </main>
    </div>
  )
}

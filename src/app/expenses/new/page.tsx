'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAccount } from 'wagmi'
import { addExpense } from '@/lib/contract'
import { uploadReceipt } from '@/lib/pinata'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Link from 'next/link'
import { switchToBaseSepolia } from '@/lib/contract'

function AddExpenseForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const groupId = searchParams.get('groupId') || '1'
  const { address } = useAccount()

  const [description, setDescription] = useState('')
  const [amount, setAmount] = useState('')
  const [debtors, setDebtors] = useState([''])
  const [receipt, setReceipt] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const addDebtor = () => setDebtors([...debtors, ''])
  const updateDebtor = (i: number, val: string) => {
    const updated = [...debtors]
    updated[i] = val
    setDebtors(updated)
  }
  const removeDebtor = (i: number) => setDebtors(debtors.filter((_, idx) => idx !== i))

  const validDebtors = debtors.filter(d => d.trim().startsWith('0x') && d.trim().length === 42)
  const sharePerPerson = amount && validDebtors.length > 0
    ? (parseFloat(amount) / (validDebtors.length + 1)).toFixed(2)
    : '0.00'

  async function handleSubmit() {
    if (!description.trim()) return setError('Description is required')
    if (!amount || parseFloat(amount) <= 0) return setError('Enter a valid amount')
    if (validDebtors.length === 0) return setError('Add at least one valid wallet address')

    const totalAmount = parseFloat(amount)
    const share = totalAmount / (validDebtors.length + 1)
    const shares = validDebtors.map(() => share)

    setLoading(true)
    setError('')
    try {
      await switchToBaseSepolia()
      let receiptHash = ''
      if (receipt) {
        try { receiptHash = await uploadReceipt(receipt) } catch (_) {}
      }
      await addExpense(
        BigInt(groupId),
        totalAmount,
        description,
        receiptHash,
        validDebtors,
        shares
      )
      router.push(`/groups/${groupId}`)
    } catch (e: unknown) {
      setError((e as Error).message || 'Failed to add expense')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-950 via-slate-950 to-slate-900 text-slate-50">
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(circle_at_top,rgba(56,189,248,0.24),transparent_55%),radial-gradient(circle_at_bottom,rgba(52,211,153,0.24),transparent_55%)] opacity-80" />

      <header className="border-b border-slate-800/70 bg-slate-950/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-xl items-center gap-3 px-4 py-3 text-sm">
          <Link href={`/groups/${groupId}`} className="text-slate-400 hover:text-slate-100">
            ← Back
          </Link>
          <span className="text-xs text-slate-600">/</span>
          <h1 className="text-sm font-medium text-slate-100">Add expense</h1>
        </div>
      </header>

      <main className="mx-auto flex max-w-xl flex-col gap-6 px-4 pb-10 pt-6">
        <section className="space-y-5 rounded-3xl border border-slate-800/80 bg-slate-900/70 p-5 shadow-[0_20px_60px_rgba(15,23,42,0.9)] backdrop-blur-xl">

          {/* Description */}
          <div className="space-y-2">
            <Label>What was it for?</Label>
            <Input
              placeholder="Dinner at Nobu, Airbnb, taxi..."
              value={description}
              onChange={e => setDescription(e.target.value)}
            />
          </div>

          {/* Amount */}
          <div className="space-y-2">
            <Label>Total amount (USDC)</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">$</span>
              <Input
                type="number"
                placeholder="0.00"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                className="pl-7"
              />
            </div>
          </div>

          {/* Debtors */}
          <div className="space-y-2">
            <Label>Split with (wallet addresses)</Label>
            <p className="text-xs text-slate-400">You paid. These people owe you.</p>
            {debtors.map((d, i) => (
              <div key={i} className="flex gap-2">
                <Input
                  placeholder="0x..."
                  value={d}
                  onChange={e => updateDebtor(i, e.target.value)}
                  className={d.length > 0 && (!d.startsWith('0x') || d.length !== 42) ? 'border-red-500/50' : ''}
                />
                {debtors.length > 1 && (
                  <Button variant="ghost" size="sm" onClick={() => removeDebtor(i)} className="shrink-0 text-slate-400">
                    ✕
                  </Button>
                )}
              </div>
            ))}
            <Button variant="outline" size="sm" onClick={addDebtor} className="border-slate-700 text-slate-300">
              + Add person
            </Button>
          </div>

          {/* Split preview */}
          {parseFloat(amount) > 0 && validDebtors.length > 0 && (
            <div className="rounded-xl border border-sky-500/20 bg-sky-500/5 p-3">
              <p className="text-xs text-sky-300">
                Split {validDebtors.length + 1} ways — each person owes{' '}
                <span className="font-semibold">${sharePerPerson} USDC</span>
              </p>
            </div>
          )}

          {/* Receipt */}
          <div className="space-y-2">
            <Label>Receipt photo <span className="text-slate-500">(optional)</span></Label>
            <Input
              type="file"
              accept="image/*"
              onChange={e => setReceipt(e.target.files?.[0] || null)}
              className="cursor-pointer"
            />
          </div>

          {error && <p className="text-xs text-red-400">{error}</p>}

          <Button
            onClick={handleSubmit}
            disabled={loading}
            className="h-11 w-full rounded-full bg-linear-to-r from-emerald-500 to-sky-400 text-sm font-medium text-slate-950 shadow-[0_24px_70px_rgba(52,211,153,0.7)] hover:from-emerald-400 hover:to-sky-300"
          >
            {loading ? 'Adding to blockchain…' : 'Add Expense'}
          </Button>

          <p className="text-center text-[11px] text-slate-400">
            ~$0.01 gas fee on Base · ~2 second confirmation
          </p>
        </section>
      </main>
    </div>
  )
}

export default function AddExpensePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400">Loading...</div>}>
      <AddExpenseForm />
    </Suspense>
  )
}
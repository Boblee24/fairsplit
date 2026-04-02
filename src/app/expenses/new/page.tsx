'use client'

import { useState, Suspense, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAccount } from 'wagmi'
import { addExpense, getGroup, switchToBaseSepolia } from '@/lib/contract'
import { uploadReceipt } from '@/lib/pinata'
import { getGroupMembers } from '@/lib/nicknames'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Link from 'next/link'

function AddExpenseForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const groupId = searchParams.get('groupId') || '1'
  const { address } = useAccount()

  const [description, setDescription] = useState('')
  const [amount, setAmount] = useState('')
  const [receipt, setReceipt] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // NEW — group members from contract + nicknames
  const [groupMembers, setGroupMembers] = useState<{ address: string; label: string }[]>([])
  const [selectedDebtors, setSelectedDebtors] = useState<string[]>([])

  // Fetch group members on mount
  useEffect(() => {
    async function fetchMembers() {
      try {
        const result = await getGroup(BigInt(groupId)) as any
        const members: string[] = Array.isArray(result) ? result[2] : result.members
        // Exclude current user — they are the payer
        const others = members.filter(m => m.toLowerCase() !== address?.toLowerCase())
        setGroupMembers(getGroupMembers(others))
      } catch (e) {
        console.error('Failed to fetch group members', e)
      }
    }
    if (address) fetchMembers()
  }, [groupId, address])

  function toggleDebtor(addr: string) {
    setSelectedDebtors(prev =>
      prev.includes(addr) ? prev.filter(a => a !== addr) : [...prev, addr]
    )
  }

  const sharePerPerson = amount && selectedDebtors.length > 0
    ? (parseFloat(amount) / (selectedDebtors.length + 1)).toFixed(2)
    : '0.00'

  async function handleSubmit() {
    if (!description.trim()) return setError('Description is required')
    if (!amount || parseFloat(amount) <= 0) return setError('Enter a valid amount')
    if (selectedDebtors.length === 0) return setError('Select at least one person to split with')

    const totalAmount = parseFloat(amount)
    const share = totalAmount / (selectedDebtors.length + 1)
    const shares = selectedDebtors.map(() => share)

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
        selectedDebtors,
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

          {/* Debtors — now a checklist instead of address inputs */}
          <div className="space-y-2">
            <Label>Split with</Label>
            <p className="text-xs text-slate-400">You paid. Select who owes you.</p>

            {groupMembers.length === 0 ? (
              <p className="text-xs text-slate-500">Loading group members...</p>
            ) : (
              <div className="space-y-2">
                {groupMembers.map(member => (
                  <div
                    key={member.address}
                    onClick={() => toggleDebtor(member.address)}
                    className={`flex cursor-pointer items-center gap-3 rounded-xl border px-3 py-2.5 transition-colors ${
                      selectedDebtors.includes(member.address)
                        ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300'
                        : 'border-slate-700 bg-slate-800/50 text-slate-300 hover:border-slate-600'
                    }`}
                  >
                    <div className={`h-4 w-4 rounded border-2 flex items-center justify-center shrink-0 ${
                      selectedDebtors.includes(member.address)
                        ? 'border-emerald-500 bg-emerald-500'
                        : 'border-slate-600'
                    }`}>
                      {selectedDebtors.includes(member.address) && (
                        <span className="text-[10px] text-slate-950 font-bold">✓</span>
                      )}
                    </div>
                    <span className="text-sm">{member.label}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Split preview */}
          {parseFloat(amount) > 0 && selectedDebtors.length > 0 && (
            <div className="rounded-xl border border-sky-500/20 bg-sky-500/5 p-3">
              <p className="text-xs text-sky-300">
                Split {selectedDebtors.length + 1} ways — each person owes{' '}
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
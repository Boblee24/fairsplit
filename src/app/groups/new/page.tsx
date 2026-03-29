'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createGroup } from '@/lib/contract'
import { switchToBaseSepolia } from '@/lib/contract'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Link from 'next/link'

export default function NewGroup() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [members, setMembers] = useState([''])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const addMember = () => setMembers([...members, ''])
  const updateMember = (i: number, val: string) => {
    const updated = [...members]
    updated[i] = val
    setMembers(updated)
  }
  const removeMember = (i: number) => setMembers(members.filter((_, idx) => idx !== i))

  async function handleSubmit() {
    if (!name.trim()) return setError('Group name is required')
    const validMembers = members.filter(m => m.trim().startsWith('0x') && m.trim().length === 42)
    setLoading(true)
    setError('')
    try {
      await switchToBaseSepolia()
      await createGroup(name, validMembers)
      router.push('/dashboard')
    } catch (e: unknown) {
      const errorMessage = e instanceof Error ? e.message : 'Group creation failed'
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-950 via-slate-950 to-slate-900 text-slate-50">
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(circle_at_top,rgba(56,189,248,0.28),transparent_55%),radial-gradient(circle_at_bottom,rgba(129,140,248,0.28),transparent_55%)] opacity-80" />

      <header className="border-b border-slate-800/70 bg-slate-950/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-3xl items-center gap-3 px-4 py-3 text-sm">
          <Link href="/dashboard" className="text-slate-400 hover:text-slate-100">
            ← Back
          </Link>
          <span className="text-xs text-slate-600">/</span>
          <h1 className="text-sm font-medium text-slate-100">Create group</h1>
        </div>
      </header>

      <main className="mx-auto flex max-w-3xl flex-col gap-6 px-4 pb-10 pt-6">
        <section className="max-w-xl">
          <h2 className="text-xl font-semibold tracking-tight">New group</h2>
          <p className="mt-1 text-sm text-slate-400">
            Give your group a name and add the wallets of everyone who&apos;s splitting with you.
          </p>
        </section>

        <section className="max-w-xl rounded-3xl border border-slate-800/80 bg-slate-900/70 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.9)] backdrop-blur-xl">
          <div className="space-y-5">
            <div className="space-y-2">
              <Label>Group name</Label>
              <Input
                placeholder="Bali Trip 2025"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="space-y-3">
              <div className="flex items-end justify-between gap-2">
                <div className="space-y-1">
                  <Label>Members (wallet addresses)</Label>
                  <p className="text-[11px] text-slate-500">
                    Paste Base-compatible wallet addresses. Invalid rows are ignored.
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={addMember}
                  className="h-8 rounded-full border-slate-700/80 bg-slate-900/60 px-3 text-[11px] text-slate-200 hover:border-sky-400/80 hover:bg-slate-900"
                >
                  + Add member
                </Button>
              </div>

              <div className="space-y-2">
                {members.map((m, i) => (
                  <div key={i} className="flex gap-2">
                    <Input
                      placeholder="0x..."
                      value={m}
                      onChange={(e) => updateMember(i, e.target.value)}
                    />
                    {members.length > 1 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeMember(i)}
                        className="h-10 rounded-xl px-2 text-xs text-slate-400 hover:bg-slate-800/80 hover:text-slate-100"
                      >
                        ✕
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {error && <p className="text-xs text-red-400">{error}</p>}

            <Button
              onClick={handleSubmit}
              disabled={loading}
              className="mt-2 h-10 w-full rounded-full bg-linear-to-r from-sky-500 via-emerald-400 to-indigo-500 text-sm font-medium text-slate-950 shadow-[0_20px_60px_rgba(56,189,248,0.7)] hover:from-sky-400 hover:via-emerald-300 hover:to-indigo-400 disabled:opacity-60"
            >
              {loading ? 'Creating onchain…' : 'Create group'}
            </Button>
          </div>
        </section>
      </main>
    </div>
  )
}

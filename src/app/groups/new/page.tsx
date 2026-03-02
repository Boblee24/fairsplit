'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createGroup } from '@/lib/contract'
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
      await createGroup(name, validMembers)
      router.push('/dashboard')
    } catch (e: any) {
      setError(e.message || 'Transaction failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <header className="flex items-center gap-4 p-4 border-b border-zinc-800">
        <Link href="/dashboard" className="text-zinc-400 hover:text-white">← Back</Link>
        <h1 className="font-bold text-xl">Create Group</h1>
      </header>

      <main className="max-w-lg mx-auto p-4 space-y-6">
        <div className="space-y-2">
          <Label>Group Name</Label>
          <Input
            placeholder="Bali Trip 2025"
            value={name}
            onChange={e => setName(e.target.value)}
            className="bg-zinc-900 border-zinc-700"
          />
        </div>

        <div className="space-y-2">
          <Label>Members (wallet addresses)</Label>
          {members.map((m, i) => (
            <div key={i} className="flex gap-2">
              <Input
                placeholder="0x..."
                value={m}
                onChange={e => updateMember(i, e.target.value)}
                className="bg-zinc-900 border-zinc-700"
              />
              {members.length > 1 && (
                <Button variant="ghost" size="sm" onClick={() => removeMember(i)}>✕</Button>
              )}
            </div>
          ))}
          <Button variant="outline" size="sm" onClick={addMember} className="border-zinc-700">
            + Add Member
          </Button>
        </div>

        {error && <p className="text-red-400 text-sm">{error}</p>}

        <Button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700"
        >
          {loading ? 'Creating on-chain...' : 'Create Group'}
        </Button>
      </main>
    </div>
  )
}

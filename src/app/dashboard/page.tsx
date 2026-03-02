'use client'

import { useAccount } from 'wagmi'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { useGroups } from '@/hooks/useGroups'
import { WalletConnect } from '@/components/WalletConnect'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import Link from 'next/link'

export default function Dashboard() {
  const { address, isConnected } = useAccount()
  const router = useRouter()
  const { groups, loading } = useGroups()

  useEffect(() => {
    if (!isConnected) router.push('/')
  }, [isConnected, router])

  return (
    <div className="min-h-screen bg-black text-white">
      <header className="flex items-center justify-between p-4 border-b border-zinc-800">
        <div className="font-bold text-xl">💸 FairSplit</div>
        <WalletConnect />
      </header>

      <main className="max-w-lg mx-auto p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Your Groups</h1>
          <Link href="/groups/new">
            <Button size="sm" className="bg-blue-600 hover:bg-blue-700">+ New Group</Button>
          </Link>
        </div>

        {loading && <p className="text-zinc-400">Loading...</p>}

        {!loading && groups.length === 0 && (
          <div className="text-center py-12 text-zinc-500">
            <p className="text-4xl mb-4">🏖️</p>
            <p>No groups yet. Create one for your next trip!</p>
          </div>
        )}

        {groups.map(group => (
          <Link key={group.id.toString()} href={`/groups/${group.id}`}>
            <Card className="p-4 bg-zinc-900 border-zinc-800 hover:border-zinc-600 cursor-pointer transition-colors">
              <div className="font-semibold">{group.name}</div>
              <div className="text-sm text-zinc-400 mt-1">
                {group.members.length} members
              </div>
            </Card>
          </Link>
        ))}
      </main>
    </div>
  )
}

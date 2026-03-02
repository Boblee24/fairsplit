'use client'

import { useParams } from 'next/navigation'
import { useExpenses } from '@/hooks/useExpenses'
import { useBalance } from '@/hooks/useBalances'
import { fromUSDC } from '@/lib/contract'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'

export default function GroupDetail() {
  const { id } = useParams()
  const groupId = BigInt(id as string)
  const { expenses, loading } = useExpenses(groupId)
  const { balance } = useBalance(groupId)

  return (
    <div className="min-h-screen bg-black text-white">
      <header className="flex items-center gap-4 p-4 border-b border-zinc-800">
        <Link href="/dashboard" className="text-zinc-400 hover:text-white">← Back</Link>
        <h1 className="font-bold text-xl">Group #{id}</h1>
      </header>

      <main className="max-w-lg mx-auto p-4 space-y-4">
        {/* Balance Summary */}
        <Card className={`p-4 border ${balance >= 0 ? 'bg-green-950 border-green-800' : 'bg-red-950 border-red-800'}`}>
          <div className="text-sm text-zinc-400">Your balance</div>
          <div className={`text-2xl font-bold ${balance >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {balance >= 0 ? '+' : ''}{balance.toFixed(2)} USDC
          </div>
          {balance < 0 && (
            <Link href={`/settle/${id}`}>
              <Button size="sm" className="mt-2 bg-red-600 hover:bg-red-700">Settle Now</Button>
            </Link>
          )}
        </Card>

        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Expenses</h2>
          <Link href={`/expenses/new?groupId=${id}`}>
            <Button size="sm" className="bg-blue-600 hover:bg-blue-700">+ Add Expense</Button>
          </Link>
        </div>

        {loading && <p className="text-zinc-400">Loading...</p>}

        {expenses.map(exp => (
          <Card key={exp.id.toString()} className="p-4 bg-zinc-900 border-zinc-800">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">{exp.description}</div>
                <div className="text-sm text-zinc-400">
                  Paid by {exp.payer.slice(0, 6)}...{exp.payer.slice(-4)}
                </div>
              </div>
              <div className="text-right">
                <div className="font-bold">${fromUSDC(exp.amount).toFixed(2)}</div>
                <Badge variant={exp.settled ? 'outline' : 'secondary'} className="text-xs">
                  {exp.settled ? 'Settled' : 'Pending'}
                </Badge>
              </div>
            </div>
          </Card>
        ))}
      </main>
    </div>
  )
}

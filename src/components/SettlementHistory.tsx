'use client'

import { useEffect, useState } from 'react'
import { createPublicClient, http, parseAbiItem } from 'viem'
import { baseSepolia } from 'wagmi/chains'
import { fromUSDC } from '@/lib/contract'
import { resolveAddress } from '@/lib/nicknames'
import { Card } from '@/components/ui/card'

const client = createPublicClient({
  chain: baseSepolia,
  transport: http('https://sepolia.base.org'),
})

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as `0x${string}`

interface Settlement {
  from: string
  to: string
  amount: bigint
  txHash: string
  blockNumber: bigint
}

export function SettlementHistory({ groupId }: { groupId: bigint }) {
  const [settlements, setSettlements] = useState<Settlement[]>([])
  const [loading, setLoading] = useState(true)

useEffect(() => {
  async function fetchSettlements() {
    try {
      const latestBlock = await client.getBlockNumber()
      const CHUNK = 9000n
      let allLogs: any[] = []

      // Query in 9000-block chunks from latest backwards
      let toBlock = latestBlock
      let fromBlock = toBlock > CHUNK ? toBlock - CHUNK : 0n

      // Go back up to 5 chunks (~45000 blocks ≈ last few days on Base Sepolia)
      for (let i = 0; i < 5; i++) {
        const logs = await client.getLogs({
          address: CONTRACT_ADDRESS,
          event: parseAbiItem(
            'event Settled(uint256 indexed groupId, address indexed from, address indexed to, uint256 amount)'
          ),
          args: { groupId },
          fromBlock,
          toBlock,
        })

        allLogs = [...allLogs, ...logs]

        if (fromBlock === 0n) break
        toBlock = fromBlock - 1n
        fromBlock = toBlock > CHUNK ? toBlock - CHUNK : 0n
      }

      const parsed: Settlement[] = allLogs
        .map(log => ({
          from: log.args.from as string,
          to: log.args.to as string,
          amount: log.args.amount as bigint,
          txHash: log.transactionHash ?? '',
          blockNumber: log.blockNumber ?? 0n,
        }))
        .sort((a, b) => (a.blockNumber > b.blockNumber ? -1 : 1))

      setSettlements(parsed)
    } catch (e) {
      console.error('Failed to fetch settlements', e)
    } finally {
      setLoading(false)
    }
  }

  fetchSettlements()
}, [groupId])

  if (loading) {
    return <p className="text-xs text-slate-400">Loading settlements...</p>
  }

  if (settlements.length === 0) {
    return (
      <Card className="items-center justify-center gap-3 py-8 text-center text-xs text-slate-400">
        <p>No settlements yet.</p>
      </Card>
    )
  }

  return (
    <div className="space-y-2">
      {settlements.map((s, i) => (
        <Card key={i} className="p-4">
          <div className="flex items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="text-sm font-medium text-slate-50">
                {resolveAddress(s.from)}{' '}
                <span className="text-slate-500">→</span>{' '}
                {resolveAddress(s.to)}
              </div>
              <a
                href={`https://sepolia.basescan.org/tx/${s.txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-sky-500 hover:text-sky-400">
                View on Basescan ↗
              </a>
            </div>
            <div className="text-right">
              <div className="text-sm font-semibold text-emerald-400">
                +${fromUSDC(s.amount).toFixed(2)}
              </div>
              <div className="mt-1 text-[10px] text-slate-500">Settled on-chain</div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
}
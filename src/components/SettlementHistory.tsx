'use client'

import { useEffect, useState } from 'react'
import { createPublicClient, http, parseAbiItem, Log, parseEventLogs } from 'viem'
import { baseSepolia } from 'wagmi/chains'
import { fromUSDC } from '@/lib/contract'
import { fetchUsername, formatWithName } from '@/lib/nicknames'
import "@/styles/fairsplit-theme.css"

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
  const [loading,     setLoading]     = useState(true)
  const [names,       setNames]       = useState<Record<string, string>>({})

  useEffect(() => {
    if (!settlements.length) return
    const unique = [...new Set(settlements.flatMap((s) => [s.from, s.to]))]
    Promise.all(
      unique.map(async (addr) => {
        const name = await fetchUsername(addr)
        return [addr.toLowerCase(), formatWithName(addr, name)] as const
      })
    ).then((entries) => setNames(Object.fromEntries(entries)))
  }, [settlements])

  const resolve = (addr: string) =>
    names[addr.toLowerCase()] ?? `${addr.slice(0, 6)}…${addr.slice(-4)}`

  useEffect(() => {
    async function fetchSettlements() {
      try {
        const latestBlock = await client.getBlockNumber()
        const CHUNK = 9000n
        let allLogs: Log[] = []
        let toBlock   = latestBlock
        let fromBlock = toBlock > CHUNK ? toBlock - CHUNK : 0n

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
          toBlock   = fromBlock - 1n
          fromBlock = toBlock > CHUNK ? toBlock - CHUNK : 0n
        }

        const parsed: Settlement[] = parseEventLogs({
          logs: allLogs,
          abi: [parseAbiItem('event Settled(uint256 indexed groupId, address indexed from, address indexed to, uint256 amount)')],
          eventName: 'Settled',
        })
          .map((log) => ({
            from:        log.args.from as string,
            to:          log.args.to   as string,
            amount:      log.args.amount as bigint,
            txHash:      log.transactionHash ?? '',
            blockNumber: log.blockNumber     ?? 0n,
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

  /* ── Loading ── */
  if (loading) {
    return (
      <div className="space-y-2">
        {[0, 1].map((i) => (
          <div
            key={i}
            className="fs-card"
            style={{ padding: '1rem 1.15rem' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div className="fs-skeleton" style={{ height: 13, width: 160, animationDelay: `${i * 0.15}s` }} />
                <div className="fs-skeleton" style={{ height: 10, width: 100, animationDelay: `${i * 0.15 + 0.2}s` }} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
                <div className="fs-skeleton" style={{ height: 13, width: 60, animationDelay: `${i * 0.15}s` }} />
                <div className="fs-skeleton" style={{ height: 10, width: 75, animationDelay: `${i * 0.15 + 0.2}s` }} />
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  /* ── Empty ── */
  if (settlements.length === 0) {
    return (
      <div className="fs-empty" style={{ padding: '2rem' }}>
        <p style={{ fontFamily: 'var(--fs-ui)', fontSize: '0.78rem', color: 'var(--fs-muted)' }}>
          No settlements yet.
        </p>
      </div>
    )
  }

  /* ── List ── */
  return (
    <div className="space-y-2">
      {settlements.map((s, i) => (
        <div
          key={i}
          className={`fs-card fs-animate fs-d${Math.min(i + 1, 9)}`}
          style={{ padding: '1rem 1.15rem' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>

            {/* Left: from → to + tx link */}
            <div style={{ minWidth: 0 }}>
              <p style={{ fontFamily: 'var(--fs-ui)', fontSize: '0.85rem', fontWeight: 600, color: 'var(--fs-text)', marginBottom: 4 }}>
                <span style={{ color: 'var(--fs-text-2)' }}>{resolve(s.from)}</span>
                {' '}
                <span style={{ color: 'var(--fs-muted)', fontWeight: 400, margin: '0 2px' }}>→</span>
                {' '}
                <span style={{ color: 'var(--fs-text)' }}>{resolve(s.to)}</span>
              </p>
              <a
                href={`https://sepolia.basescan.org/tx/${s.txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  fontFamily: 'var(--fs-mono)',
                  fontSize: '9.5px',
                  letterSpacing: '0.06em',
                  color: 'var(--fs-accent)',
                  textDecoration: 'none',
                  opacity: 0.75,
                  transition: 'opacity .15s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
                onMouseLeave={(e) => (e.currentTarget.style.opacity = '0.75')}
              >
                View on Basescan ↗
              </a>
            </div>

            {/* Right: amount + label */}
            <div style={{ textAlign: 'right', flexShrink: 0 }}>
              <p style={{ fontFamily: 'var(--fs-mono)', fontSize: '0.9rem', fontWeight: 600, color: 'var(--fs-positive)' }}>
                +${fromUSDC(s.amount).toFixed(2)}
              </p>
              <span className="fs-badge fs-badge-positive" style={{ marginTop: 5, display: 'inline-block' }}>
                Settled
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
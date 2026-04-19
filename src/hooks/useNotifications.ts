import { useEffect, useState } from 'react'
import { useAccount } from 'wagmi'
import { createPublicClient, http, parseAbiItem } from 'viem'
import { baseSepolia } from 'wagmi/chains'
import { getUserGroups, getGroup } from '@/lib/contract'
import { fetchUsername, formatWithName } from '@/lib/nicknames'

const client = createPublicClient({
  chain: baseSepolia,
  transport: http('https://sepolia.base.org'),
})

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as `0x${string}`
const CHUNK = 9000n
const MAX_CHUNKS = 5

const EXPENSE_EVENT = parseAbiItem('event ExpenseAdded(uint256 indexed groupId, uint256 indexed expenseId, address indexed payer, uint256 amount)')
const SETTLE_EVENT = parseAbiItem('event Settled(uint256 indexed groupId, address indexed from, address indexed to, uint256 amount)')
const MEMBER_EVENT = parseAbiItem('event MemberAdded(uint256 indexed groupId, address indexed member)')
const GROUP_CREATED_EVENT = parseAbiItem('event GroupCreated(uint256 indexed groupId, string name, address indexed creator)')

type ExpenseLog = Awaited<ReturnType<typeof client.getLogs<typeof EXPENSE_EVENT>>>[number]
type SettleLog = Awaited<ReturnType<typeof client.getLogs<typeof SETTLE_EVENT>>>[number]
type MemberLog = Awaited<ReturnType<typeof client.getLogs<typeof MEMBER_EVENT>>>[number]
type GroupCreatedLog = Awaited<ReturnType<typeof client.getLogs<typeof GROUP_CREATED_EVENT>>>[number]

export type Notification = {
  id: string
  type: 'expense_added' | 'settled' | 'member_added'
  message: string
  groupId: string
  txHash: string
  blockNumber: bigint
  read: boolean
}

async function fetchLogs(fromBlock: bigint, toBlock: bigint) {
  const [expenseLogs, settleLogs, memberLogs, groupCreatedLogs] = await Promise.all([
    client.getLogs({ address: CONTRACT_ADDRESS, event: EXPENSE_EVENT, fromBlock, toBlock }),
    client.getLogs({ address: CONTRACT_ADDRESS, event: SETTLE_EVENT, fromBlock, toBlock }),
    client.getLogs({ address: CONTRACT_ADDRESS, event: MEMBER_EVENT, fromBlock, toBlock }),
    client.getLogs({ address: CONTRACT_ADDRESS, event: GROUP_CREATED_EVENT, fromBlock, toBlock }),
  ])
  return { expenseLogs, settleLogs, memberLogs, groupCreatedLogs }
}

const STORAGE_KEY = 'fairsplit_read_notifications'

function getReadIds(): Set<string> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return new Set(raw ? JSON.parse(raw) : [])
  } catch { return new Set() }
}

function markRead(ids: string[]) {
  try {
    const existing = getReadIds()
    ids.forEach(id => existing.add(id))
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...existing]))
  } catch {}
}

export function useNotifications() {
  const { address } = useAccount()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!address) return

    async function load() {
      try {
        const groupIds = await getUserGroups(address!) as bigint[]
        if (!groupIds.length) { setLoading(false); return }

        const groupIdSet = new Set(groupIds.map(g => g.toString()))
        const latestBlock = await client.getBlockNumber()

        let allExpense: ExpenseLog[] = []
        let allSettle: SettleLog[] = []
        let allMember: MemberLog[] = []
        let allGroupCreated: GroupCreatedLog[] = []

        let toBlock = latestBlock
        let fromBlock = toBlock > CHUNK ? toBlock - CHUNK : 0n

        for (let i = 0; i < MAX_CHUNKS; i++) {
          const { expenseLogs, settleLogs, memberLogs, groupCreatedLogs } = await fetchLogs(fromBlock, toBlock)
          allExpense = [...allExpense, ...expenseLogs]
          allSettle = [...allSettle, ...settleLogs]
          allMember = [...allMember, ...memberLogs]
          allGroupCreated = [...allGroupCreated, ...groupCreatedLogs]
          if (fromBlock === 0n) break
          toBlock = fromBlock - 1n
          fromBlock = toBlock > CHUNK ? toBlock - CHUNK : 0n
        }

        // Filter to user's groups
        allExpense = allExpense.filter(l => groupIdSet.has(l.args.groupId?.toString() ?? ''))
        allSettle = allSettle.filter(l => groupIdSet.has(l.args.groupId?.toString() ?? ''))
        allMember = allMember.filter(l => groupIdSet.has(l.args.groupId?.toString() ?? ''))

        // Build set of txHashes where user was the group creator
        const creatorTxHashes = new Set(
          allGroupCreated
            .filter(l => l.args.creator?.toLowerCase() === address!.toLowerCase())
            .map(l => l.transactionHash)
        )

        // Fetch group names
        const groupNameMap: Record<string, string> = {}
        for (const gId of groupIds) {
          try {
            const g = await getGroup(gId) as any
            groupNameMap[gId.toString()] = g[1] || `Group #${gId}`
          } catch {
            groupNameMap[gId.toString()] = `Group #${gId}`
          }
        }

        const readIds = getReadIds()
        const notifs: Notification[] = []

        // ExpenseAdded — skip own actions
        for (const log of allExpense) {
          const payer = log.args.payer
          if (!payer || payer.toLowerCase() === address!.toLowerCase()) continue
          const name = await fetchUsername(payer)
          const label = formatWithName(payer, name)
          const groupId = log.args.groupId?.toString() ?? ''
          const groupName = groupNameMap[groupId] ?? `Group #${groupId}`
          const amount = Number(log.args.amount ?? 0n) / 1_000_000
          const id = log.transactionHash ?? `${log.blockNumber}-expense`
          notifs.push({
            id,
            type: 'expense_added',
            message: `${label} added a $${amount.toFixed(2)} expense in ${groupName}`,
            groupId,
            txHash: log.transactionHash ?? '',
            blockNumber: log.blockNumber ?? 0n,
            read: readIds.has(id),
          })
        }

        // Settled — only notify if you are the creditor (to)
        for (const log of allSettle) {
          const to = log.args.to
          const from = log.args.from
          if (!to || to.toLowerCase() !== address!.toLowerCase()) continue
          const name = await fetchUsername(from ?? '')
          const label = formatWithName(from ?? '', name)
          const groupId = log.args.groupId?.toString() ?? ''
          const groupName = groupNameMap[groupId] ?? `Group #${groupId}`
          const amount = Number(log.args.amount ?? 0n) / 1_000_000
          const id = log.transactionHash ?? `${log.blockNumber}-settle`
          notifs.push({
            id,
            type: 'settled',
            message: `${label} paid you $${amount.toFixed(2)} in ${groupName}`,
            groupId,
            txHash: log.transactionHash ?? '',
            blockNumber: log.blockNumber ?? 0n,
            read: readIds.has(id),
          })
        }

        // MemberAdded — only notify the member being added, skip if they created the group
        for (const log of allMember) {
          const member = log.args.member
          if (!member || member.toLowerCase() !== address!.toLowerCase()) continue
          if (creatorTxHashes.has(log.transactionHash)) continue
          const groupId = log.args.groupId?.toString() ?? ''
          const groupName = groupNameMap[groupId] ?? `Group #${groupId}`
          const id = `${log.transactionHash}-member`
          notifs.push({
            id,
            type: 'member_added',
            message: `You were added to ${groupName}`,
            groupId,
            txHash: log.transactionHash ?? '',
            blockNumber: log.blockNumber ?? 0n,
            read: readIds.has(id),
          })
        }

        notifs.sort((a, b) => (a.blockNumber > b.blockNumber ? -1 : 1))
        setNotifications(notifs)
      } catch (e) {
        console.error('Failed to fetch notifications', e)
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [address])

  function markAllRead() {
    markRead(notifications.map(n => n.id))
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
  }

  const unreadCount = notifications.filter(n => !n.read).length

  return { notifications, loading, unreadCount, markAllRead }
}
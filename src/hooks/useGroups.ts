import { useEffect, useState } from 'react'
import { useAccount } from 'wagmi'
import { getUserGroups, getGroup } from '@/lib/contract'
import type { Group } from '@/types'

export function useGroups() {
  const { address } = useAccount()
  const [groups, setGroups] = useState<Group[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!address) return
    setLoading(true)
    getUserGroups(address)
      .then(async (ids) => {
        const groupData = await Promise.all(ids.map(async (id) => {
          const g = await getGroup(id)
          return {
            id: g[0],
            name: g[1],
            members: g[2],
            creator: g[3],
            isActive: g[4],
          } as Group
        }))
        setGroups(groupData.filter(g => g.isActive))
      })
      .finally(() => setLoading(false))
  }, [address])

  return { groups, loading }
}
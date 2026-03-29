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
    
    let isMounted = true
    
    const fetchGroups = async () => {
      setLoading(true)
      try {
        const ids = await getUserGroups(address)
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
        if (isMounted) {
          setGroups(groupData.filter(g => g.isActive))
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }
    
    fetchGroups()
    
    return () => {
      isMounted = false
    }
  }, [address])

  return { groups, loading }
}
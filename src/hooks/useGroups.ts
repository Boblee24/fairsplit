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
        const groupData = await Promise.all(ids.map(id => getGroup(id)))
        setGroups(groupData as Group[])
      })
      .finally(() => setLoading(false))
  }, [address])

  return { groups, loading }
}

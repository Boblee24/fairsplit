import { useEffect, useState } from 'react'
import { useAccount } from 'wagmi'
import { getUserGroups, getGroup } from '@/lib/contract'
import { GROUPS_CHANGED_EVENT, hasRecentGroupChange } from '@/lib/groupRefresh'
import type { Group } from '@/types'

const REFRESH_DELAYS_MS = [0, 800, 1_800, 3_500]

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export function useGroups() {
  const { address } = useAccount()
  const [groups, setGroups] = useState<Group[]>([])
  const [loading, setLoading] = useState(false)
  const [refreshNonce, setRefreshNonce] = useState(0)

  useEffect(() => {
    if (typeof window === 'undefined') return

    const refresh = () => setRefreshNonce((nonce) => nonce + 1)
    const refreshWhenVisible = () => {
      if (document.visibilityState === 'visible') refresh()
    }

    window.addEventListener(GROUPS_CHANGED_EVENT, refresh)
    window.addEventListener('focus', refresh)
    window.addEventListener('pageshow', refresh)
    document.addEventListener('visibilitychange', refreshWhenVisible)

    return () => {
      window.removeEventListener(GROUPS_CHANGED_EVENT, refresh)
      window.removeEventListener('focus', refresh)
      window.removeEventListener('pageshow', refresh)
      document.removeEventListener('visibilitychange', refreshWhenVisible)
    }
  }, [])

  useEffect(() => {
    if (!address) return

    let isMounted = true

    const fetchGroups = async () => {
      setLoading(true)
      const delays = hasRecentGroupChange() ? REFRESH_DELAYS_MS : [0]

      for (const delay of delays) {
        if (delay > 0) await wait(delay)
        if (!isMounted) return

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
    }
    
    fetchGroups()

    return () => {
      isMounted = false
    }
  }, [address, refreshNonce])

  return {
    groups: address ? groups : [],
    loading: address ? loading : false,
  }
}

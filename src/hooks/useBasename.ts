// hooks/useBasename.ts
import { useEffect, useState } from 'react'
import { createPublicClient, http } from 'viem'
import { baseSepolia } from 'wagmi/chains'

const client = createPublicClient({
  chain: baseSepolia,
  transport: http('https://sepolia.base.org'),
})

export function useBasename(address: string) {
  const [name, setName] = useState<string | null>(null)

  useEffect(() => {
    if (!address) return
    client.getEnsName({
      address: address as `0x${string}`,
      universalResolverAddress: '0x6533C94869D28fAA8dF77cc63f9e2b2D6Cf7eB6' // Base Sepolia resolver
    })
      .then(setName)
      .catch(() => setName(null))
  }, [address])

  return name ?? `${address.slice(0, 6)}...${address.slice(-4)}`
}
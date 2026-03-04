'use client'

import { useAccount, useConnect, useDisconnect } from 'wagmi'
import { Button } from '@/components/ui/button'
import { useState } from 'react'

export function WalletConnect() {
  const { address, isConnected } = useAccount()
  const { connect, connectors, isPending } = useConnect()
  const { disconnect } = useDisconnect()
  const [showOptions, setShowOptions] = useState(false)

  if (isConnected && address) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">
          {address.slice(0, 6)}...{address.slice(-4)}
        </span>
        <Button variant="outline" size="sm" onClick={() => disconnect()}>
          Disconnect
        </Button>
      </div>
    )
  }

  if (showOptions) {
    return (
      <div className="flex flex-col gap-2">
        {connectors.map((connector) => (
          <Button
            key={connector.uid}
            onClick={() => {
              connect({ connector })
              setShowOptions(false)
            }}
            disabled={isPending}
            variant="outline"
            className="w-full justify-start gap-2"
          >
            {connector.name}
          </Button>
        ))}
        <Button variant="ghost" size="sm" onClick={() => setShowOptions(false)}>
          Cancel
        </Button>
      </div>
    )
  }

  return (
    <Button
      onClick={() => setShowOptions(true)}
      className="bg-blue-600 hover:bg-blue-700"
    >
      Connect Wallet
    </Button>
  )
}